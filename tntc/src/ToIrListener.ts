import * as p from './generated/TntParser'
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext'
import { TntListener } from './generated/TntListener'
import { OpQualifier, TntDef, TntModule, TntEx, TntOpDef } from './tntIr'
import { TntType } from './tntTypes'
import { assert } from 'console'
import { ErrorMessage } from './tntParserFrontend'

/**
 * An ANTLR4 listener that constructs TntIr objects out of the abstract
 * syntax tree. This listener does the minimal work of translating the AST
 * into IR. All semantic checks and type checking must be done at later
 * phases, as the IR may be constructed by other means.
 *
 * @author Igor Konnov
 */
export class ToIrListener implements TntListener {
  /**
   * The module that is constructed as a result of parsing
   */
  rootModule?: TntModule = undefined
  /**
   * If errors occur in the listener, this array contains explanations.
   */
  errors: ErrorMessage[] = []
  // the stack of definitions per module
  private moduleDefStack: TntDef[][] = []
  // the stack of definitions
  private definitionStack: TntDef[] = []
  // the stack of types
  private typeStack: TntType[] = []
  // the stack of expressions
  private exprStack: TntEx[] = []
  // the stack of parameter lists
  private paramStack: string[][] = []
  // an internal counter to assign unique numbers
  private lastId: bigint = 1n

  enterModule () {
    // save the definitions of the previous module
    this.moduleDefStack.push(this.definitionStack)
    this.definitionStack = []
  }

  // translate: module <name> { ... }
  exitModule (ctx: p.ModuleContext) {
    assert(this.typeStack.length === 0, 'type stack must be empty')
    assert(this.exprStack.length === 0, 'expression stack must be empty')
    assert(this.paramStack.length === 0, 'parameter stack must be empty')
    const module: TntModule = {
      id: this.nextId(),
      name: ctx.IDENTIFIER().text,
      defs: this.definitionStack
    }
    // add the module to the definition stack
    this.definitionStack = this.moduleDefStack.pop()!
    this.definitionStack.push({
      id: this.nextId(),
      kind: 'module',
      module: module
    })
    // advance the root module to this one
    this.rootModule = module
  }

  // translate: const x: type
  exitConst (ctx: p.ConstContext) {
    const typeTag = this.popType()

    const constDef: TntDef = {
      kind: 'const',
      name: ctx.IDENTIFIER().text,
      type: typeTag,
      id: this.nextId()
    }
    this.definitionStack.push(constDef)
  }

  // translate: var x: type
  exitVar (ctx: p.VarContext) {
    const typeTag = this.popType()

    const varDef: TntDef = {
      kind: 'var',
      name: ctx.IDENTIFIER().text,
      type: typeTag,
      id: this.nextId()
    }
    this.definitionStack.push(varDef)
  }

  /** **************** translate operator definititons **********************/

  // translate a top-level or nested operator definition
  exitOperDef (ctx: p.OperDefContext) {
    const name = ctx.IDENTIFIER().text
    let typeTag: TntType | undefined
    if (ctx.type()) {
      // the operator is tagged with a type
      typeTag = this.typeStack.pop()
    }
    // get the parameters and the definition body
    const expr = this.exprStack.pop()
    const params = (ctx.params()) ? this.paramStack.pop() : []

    // extract the qualifier
    let qualifier: OpQualifier = 'def'
    const qualifierToken = ctx._qualifier
    if (qualifierToken && qualifierToken !== undefined) {
      const qtext = qualifierToken.text
      // case distinction to make the type checker happy
      if (qtext === 'val' || qtext === 'def' || qtext === 'pred' ||
          qtext === 'action' || qtext === 'temporal') {
        qualifier = qtext
      } else {
        // istanbul ignore next
        assert(false, 'Unexpected qualifier: ' + qtext)
      }
    }

    if (expr && params) {
      // if the definition has parameters, introduce a lambda
      let body = expr
      if (params.length > 0) {
        body = {
          id: this.nextId(),
          kind: 'lambda',
          params: params,
          qualifier: qualifier,
          expr: expr
        }
      }
      const def: TntOpDef = {
        id: this.nextId(),
        kind: 'def',
        name: name,
        qualifier: qualifier,
        expr: body
      }
      if (typeTag) {
        def.type = typeTag
      }
      this.definitionStack.push(def)
    } else {
      // istanbul ignore next
      assert(false, 'undefined expr or params in exitOperDef')
    }
  }

  // translate a top-level def
  exitOper () {
    const def = this.definitionStack[this.definitionStack.length - 1]
    assert(def, 'undefined operDef in exitOper')
  }

  // operator parameters
  exitParams (ctx: p.ParamsContext) {
    const params = ctx.IDENTIFIER().map(n => n.text)
    this.paramStack.push(params)
  }

  // assume name = expr
  exitAssume () {
    const expr = this.exprStack.pop()!
    const params = this.paramStack.pop()!
    assert(params.length === 1)
    const assume: TntDef = {
      id: this.nextId(),
      kind: 'assume',
      name: params[0],
      assumption: expr
    }
    this.definitionStack.push(assume)
  }

  // import Foo.x or import Foo.*
  exitImportDef () {
    const ident = this.paramStack.pop()![0]
    const path = this.paramStack.pop()![0]
    const importDef: TntDef = {
      id: this.nextId(),
      kind: 'import',
      name: ident,
      path: path
    }
    this.definitionStack.push(importDef)
  }

  // a path that used in imports
  exitPath (ctx: p.PathContext) {
    const path = ctx.IDENTIFIER().reduce((s, id) => s + id.text, '')
    this.paramStack.push([path])
  }

  // type ALIAS = set(int)
  exitTypedef (ctx: p.TypedefContext) {
    const name = ctx.IDENTIFIER()!.text
    const associatedType = this.typeStack.pop()
    if (associatedType) {
      const def: TntDef = {
        id: this.nextId(),
        kind: 'typedef',
        name: name,
        type: associatedType
      }
      this.definitionStack.push(def)
    } else {
      // istanbul ignore next
      assert(false, 'exitTypedef: type stack is empty')
    }
  }

  // module Foo = Proto(x = a, y = b)
  exitInstanceMod (ctx: p.InstanceModContext) {
    const identifiers = ctx.IDENTIFIER()!
    const instanceName = identifiers[0].text
    const protoName = identifiers[1].text
    const nexprs = ctx.expr().length
    const overrides: [string, TntEx][] = []
    if (nexprs > 0) {
      const exprs = this.popExprs(nexprs)
      for (let i = 0; i < nexprs; i++) {
        const name = identifiers[2 + i].text
        overrides.push([name, exprs[i]])
      }
    }
    const identityOverride = ctx.MUL() !== undefined
    const instance: TntDef = {
      id: this.nextId(),
      kind: 'instance',
      name: instanceName,
      protoName: protoName,
      overrides: overrides,
      identityOverride: identityOverride
    }
    this.definitionStack.push(instance)
  }

  /** ******************* translate expressions **************************/

  // an identifier or a literal, e.g., foo, 42, "hello", false
  exitLiteralOrId (ctx: p.LiteralOrIdContext) {
    const ident = ctx.IDENTIFIER()
    if (ident) { // identifier
      this.exprStack.push({
        id: this.nextId(),
        kind: 'name',
        name: ident.text
      })
    }
    const intNode = ctx.INT()
    if (intNode) { // integer literal
      this.exprStack.push({
        id: this.nextId(),
        kind: 'int',
        type: { kind: 'int' },
        value: BigInt(intNode.text)
      })
    }
    const boolNode = ctx.BOOL()
    if (boolNode) { // Boolean literal
      this.exprStack.push({
        id: this.nextId(),
        kind: 'bool',
        type: { kind: 'bool' },
        value: (boolNode.text === 'true')
      })
    }
    const strNode = ctx.STRING()
    if (strNode) { // string, remove the quotes!
      this.exprStack.push({
        id: this.nextId(),
        kind: 'str',
        type: { kind: 'str' },
        value: strNode.text.slice(1, -1)
      })
    }
  }

  // function application, e.g., f[10]
  exitFunApp () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'of',
      args: args
    })
  }

  // operator application in the normal form, e.g., MyOper("foo", 42)
  exitOperApp (ctx: p.OperAppContext) {
    const name = ctx.normalCallName().text
    let args: TntEx[] = []
    if (ctx.argList()) {
      // this operator has at least one argument
      const wrappedArgs = this.exprStack.pop()
      if (wrappedArgs && wrappedArgs.kind === 'app') {
        args = wrappedArgs.args
      } else {
        // istanbul ignore next
        assert(false, 'exitOperApp: expected wrapped arguments')
      }
    } // else no arguments, e.g., set(), seq()

    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: name,
      args: args
    })
  }

  // infix operator application, e.g., S union T
  exitInfixCall (ctx: p.InfixCallContext) {
    const name = ctx.IDENTIFIER().text
    const wrappedArgs = this.exprStack.pop()
    const firstArg = this.exprStack.pop()
    if (firstArg && wrappedArgs && wrappedArgs.kind === 'app' &&
        wrappedArgs.opcode === 'wrappedArgs') {
      this.exprStack.push({
        id: this.nextId(),
        kind: 'app',
        opcode: name,
        args: [firstArg].concat(wrappedArgs.args)
      })
    } else {
      // istanbul ignore next
      assert(false, 'exitInfixCall: expected leading arg and wrapped arguments')
    }
  }

  // operator application via dot, e.g., S.union(T)
  exitDotCall (ctx: p.DotCallContext) {
    // pop: the first argument, operator name, the rest of arguments (wrapped)
    const wrappedArgs = ctx.argList() ? this.exprStack.pop() : undefined
    const name = ctx.nameAfterDot().text
    const callee = this.exprStack.pop()
    if (callee === undefined) {
      assert(false, 'exitDotCall: callee not found')
    }
    const hasParen = ctx.LPAREN()
    if (hasParen) {
      // the UFCS form e_1.f(e_2, ..., e_n)
      let args: TntEx[] = []
      if (wrappedArgs) {
        // n >= 2: there is at least one argument in parentheses
        if (wrappedArgs.kind === 'app' &&
            wrappedArgs.opcode === 'wrappedArgs') {
          args = [callee!].concat(wrappedArgs.args)
        } else {
          // istanbul ignore next
          assert(false,
            'exitDotCall: expected wrappedArgs, found: ' + wrappedArgs.kind)
        }
      } // else: no arguments, as in e.g., s.head()
      // apply the operator to the arguments
      this.exprStack.push({
        id: this.nextId(),
        kind: 'app',
        opcode: name,
        args: args!
      })
    } else {
      // accessing a tuple element, a record field, or name in a module
      const m = name.match(/^_([1-9][0-9]?)$/)
      if (m) {
        // accessing a tuple element via _1, _2, _3, etc.
        const idx: TntEx = {
          id: this.nextId(),
          kind: 'int',
          value: BigInt(m[1])
        }
        this.exprStack.push({
          id: this.nextId(),
          kind: 'app',
          opcode: 'item',
          args: [callee!, idx]
        })
      } else {
        // accessing a record field or a name in a module
        if (name === 'in' || name === 'notin' ||
            name === 'and' || name === 'or' ||
            name === 'iff' || name === 'implies' || name === 'subseteq') {
          const msg =
            'TNT006: no keywords allowed as record fields in record.field'
          this.pushError(ctx, msg)
        }

        const field: TntEx = {
          id: this.nextId(),
          kind: 'str',
          value: name
        }
        this.exprStack.push({
          id: this.nextId(),
          kind: 'app',
          opcode: 'field',
          args: [callee!, field]
        })
      }
    }
  }

  // a list of arguments
  exitArgList (ctx: p.ArgListContext) {
    const nargs = ctx.lambdaOrExpr().length
    const args = this.popExprs(nargs)
    // wrap the arguments with a temporary operator,
    // to be unwrapped later
    this.exprStack.push({
      id: 0n,
      kind: 'app',
      opcode: 'wrappedArgs',
      args: args
    })
  }

  // a lambda operator over multiple parameters
  exitLambda (ctx: p.LambdaContext) {
    const expr = this.exprStack.pop()
    const params = this.popParams(ctx.identOrHole().length)
    let qualifier: OpQualifier = 'def'
    if (ctx.children && ctx.children[0]) {
      qualifier = (ctx.children[0].text === '{') ? 'action' : 'def'
    }
    if (expr) {
      // every parameter in params is a singleton list, make one list
      const singletons = params.map(ps => ps[0])
      this.exprStack.push({
        id: this.nextId(),
        kind: 'lambda',
        params: singletons,
        qualifier: qualifier,
        expr: expr
      })
    } else {
      // istanbul ignore next
      assert(false, 'exitLambda: expected an expression')
    }
  }

  // a single parameter in a lambda expression: an identifier or '_'
  exitIdentOrHole (ctx: p.IdentOrHoleContext) {
    if (ctx.text === '_') {
      // a hole '_'
      this.paramStack.push(['_'])
    } else {
      // a variable name
      this.paramStack.push([ctx.IDENTIFIER()!.text])
    }
  }

  // an identifier or star '*' in import
  exitIdentOrStar (ctx: p.IdentOrStarContext) {
    if (ctx.text === '*') {
      // a hole '_'
      this.paramStack.push(['*'])
    } else {
      // a variable name
      this.paramStack.push([ctx.IDENTIFIER()!.text])
    }
  }

  // tuple constructor, e.g., (1, 2, 3)
  exitTuple (ctx: p.TupleContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'tuple',
      args: args
    })
  }

  // sequence constructor, e.g., [1, 2, 3]
  exitSequence (ctx: p.SequenceContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'seq',
      args: args
    })
  }

  // record constructor, e.g., { name: "igor", year: 2021 }
  exitRecord (ctx: p.RecordContext) {
    const names = ctx.IDENTIFIER().map((n) => n.text)
    const elems: TntEx[] = this.popExprs(ctx.expr().length)
    // since TS does not have zip, a loop is the easiest solution
    const namesAndValues: TntEx[] = []
    for (let i = 0; i < names.length; i++) {
      namesAndValues.push({
        id: this.nextId(),
        kind: 'str',
        value: names[i],
        type: { kind: 'str' }
      })
      namesAndValues.push(elems[i])
    }
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'record',
      args: namesAndValues
    })
  }

  // '+' or '-'
  exitPlusMinus (ctx: p.PlusMinusContext) {
    const opcode = (ctx.PLUS() !== undefined) ? 'iadd' : 'isub'
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: opcode,
      args: args
    })
  }

  // '*', '/', or '%'
  exitMultDiv (ctx: p.MultDivContext) {
    const op = ctx._op
    if (op) {
      let opcode = ''
      switch (op.type) {
        case p.TntParser.MUL: opcode = 'imul'; break
        case p.TntParser.DIV: opcode = 'idiv'; break
        case p.TntParser.MOD: opcode = 'imod'; break
      }
      const args = this.popExprs(2)
      this.exprStack.push({
        id: this.nextId(),
        kind: 'app',
        opcode: opcode,
        args: args
      })
    }
  }

  // integer power, e.g., x^y
  exitPow () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'ipow',
      args: args
    })
  }

  // unary minus, e.g., -x
  exitUminus () {
    const arg = this.exprStack.pop()
    if (arg) {
      this.exprStack.push({
        id: this.nextId(),
        kind: 'app',
        opcode: 'iuminus',
        args: [arg]
      })
    }
  }

  // GT | LT | GE | LE | NE | EQ | ASGN | IN | NOTIN | SUBSETEQ
  exitRelations (ctx: p.RelationsContext) {
    const op = ctx._op
    if (op) {
      let opcode = ''
      switch (op.type) {
        case p.TntParser.GT: opcode = 'igt'; break
        case p.TntParser.GE: opcode = 'igte'; break
        case p.TntParser.LT: opcode = 'ilt'; break
        case p.TntParser.LE: opcode = 'ilte'; break
        case p.TntParser.EQ: opcode = 'eq'; break
        case p.TntParser.ASGN: opcode = 'assign'; break
        case p.TntParser.NE: opcode = 'neq'; break
        case p.TntParser.IN: opcode = 'in'; break
        case p.TntParser.NOTIN: opcode = 'notin'; break
        case p.TntParser.SUBSETEQ: opcode = 'subseteq'; break
      }
      const args = this.popExprs(2)
      this.exprStack.push({
        id: this.nextId(),
        kind: 'app',
        opcode: opcode,
        args: args
      })
    }
  }

  // p and q
  exitAnd () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'and',
      args: args
    })
  }

  // p or q
  exitOr () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'or',
      args: args
    })
  }

  // p implies q
  exitImplies () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'implies',
      args: args
    })
  }

  // p iff q
  exitIff () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'iff',
      args: args
    })
  }

  // ( p & q & r )
  exitAndExpr (ctx: p.AndExprContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'andExpr',
      args: args
    })
  }

  // ( p | q | r )
  exitOrExpr (ctx: p.OrExprContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'orExpr',
      args: args
    })
  }

  // { p & q & r }
  exitAndAction (ctx: p.AndActionContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'andAction',
      args: args
    })
  }

  // { p | q | r }
  exitOrAction (ctx: p.OrActionContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'orAction',
      args: args
    })
  }

  // if (p) e1 else e2
  exitIfElse () {
    const args = this.popExprs(3)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'app',
      opcode: 'ite',
      args: args
    })
  }

  /** ******************* translate types ********************************/

  // the integer type, that is, int
  exitTypeInt () {
    this.typeStack.push({ kind: 'int' })
  }

  // the Boolean type, that is, bool
  exitTypeBool () {
    this.typeStack.push({ kind: 'bool' })
  }

  exitTypeStr () {
    // the string type, that is, str
    this.typeStack.push({ kind: 'str' })
  }

  // a type variable, a type constant, or a reference to a type alias
  exitTypeConstOrVar (ctx: p.TypeConstOrVarContext) {
    const name = ctx.IDENTIFIER().text
    if (name.length === 1 && name.match('[a-z]')) {
      // a type variable from: a, b, ... z
      this.typeStack.push({ kind: 'var', name: name })
    } else {
      // a type constant, e.g., declared via typedef
      this.typeStack.push({ kind: 'const', name: name })
    }
  }

  // a set type, e.g., set(int)
  exitTypeSet () {
    const last = this.typeStack.pop()
    if (last !== undefined) {
      this.typeStack.push({ kind: 'set', elem: last })
    } // the other cases are excluded by the parser
  }

  // a sequence type, e.g., seq(int)
  exitTypeSeq () {
    const top = this.typeStack.pop()
    if (top !== undefined) {
      this.typeStack.push({ kind: 'seq', elem: top })
    } // the other cases are excluded by the parser
  }

  // A function type, e.g., str => int
  exitTypeFun () {
    const res = this.typeStack.pop()
    const arg = this.typeStack.pop()
    if (arg !== undefined && res !== undefined) {
      this.typeStack.push({ kind: 'fun', arg: arg, res: res })
    }
  }

  // A tuple type, e.g., (int, bool)
  // the type stack contains the types of the elements
  exitTypeTuple (ctx: p.TypeTupleContext) {
    const elemTypes: TntType[] = this.popTypes(ctx.type().length)
    this.typeStack.push({ kind: 'tuple', elems: elemTypes })
  }

  // A record type that is not a disjoint union, e.g.,
  // { name: str, year: int }
  // The type stack contains the types of the fields.
  // We have to match them with the field names.
  exitTypeRec (ctx: p.TypeRecContext) {
    const names = ctx.IDENTIFIER().map((n) => n.text)
    const elemTypes: TntType[] = this.popTypes(ctx.type().length)
    // since TS does not have zip, a loop is the easiest solution
    const pairs = []
    for (let i = 0; i < names.length; i++) {
      pairs.push({ fieldName: names[i], fieldType: elemTypes[i] })
    }
    this.typeStack.push({ kind: 'record', fields: pairs })
  }

  // A disjoint union type, e.g.,
  //   | { type: "ack", from: address }
  //   | { type: "syn", to: address }
  exitTypeUnionRec (ctx: p.TypeUnionRecContext) {
    const size = ctx.typeUnionRecOne().length
    assert(size > 0, 'exitTypeUnionRec: size == 0')
    const singletonUnions: TntType[] = this.popTypes(size)
    if (singletonUnions[0].kind === 'union') {
      const tag = singletonUnions[0].tag
      let records = singletonUnions[0].records
      for (let i = 1; i < size; i++) {
        const one = singletonUnions[i]
        if (one.kind === 'union') {
          if (one.tag === tag) {
            records = records.concat(one.records)
          } else {
            const tags = `${tag} and ${one.tag}`
            const msg =
              'TNT011: Records in disjoint union have different tag fields: '
            this.pushError(ctx, msg + tags)
          }
        } else {
          // istanbul ignore next
          assert(false, 'exitTypeUnionRec: no union in exitTypeUnionRec')
        }
      }
      this.typeStack.push({ kind: 'union', tag: tag, records: records })
    } else {
      // istanbul ignore next
      assert(false, 'exitTypeUnionRec: no union in exitTypeUnionRec')
    }
  }

  // One option of a disjoint union, e.g.,
  //   | { type: "ack", from: address }
  // The type stack contains the types of the fields.
  // We have to match them with the field names.
  exitTypeUnionRecOne (ctx: p.TypeUnionRecOneContext) {
    const names = ctx.IDENTIFIER().map((n) => n.text)
    // the first name is the tag name (according to the grammar)
    const tagName = names[0]
    const tagVal = ctx.STRING().toString().slice(1, -1)
    // the other names are field names
    const elemTypes: TntType[] = this.popTypes(ctx.type().length)
    // since TS does not have zip, a loop is the easiest solution
    const pairs = []
    for (let i = 1; i < names.length; i++) {
      pairs.push({ fieldName: names[i], fieldType: elemTypes[i - 1] })
    }
    // construct a singleton disjoint union, which should be assembled above
    const singleton: TntType = {
      kind: 'union',
      tag: tagName,
      records: [{ tagValue: tagVal, fields: pairs }]
    }

    this.typeStack.push(singleton)
  }

  // an operator type, e.g., (int, str) => bool
  exitTypeOper (ctx: p.TypeOperContext) {
    const resType = this.typeStack.pop()
    const nargs = ctx.type().length - 1
    const argTypes: TntType[] = this.popTypes(nargs)
    if (resType !== undefined && argTypes.length === nargs) {
      this.typeStack.push({ kind: 'oper', args: argTypes, res: resType })
    }
  }

  /**
    * Produce a human-readable location string.
    */
  private locStr (ctx: ParserRuleContext) {
    const line = ctx.start.line + 1
    const col = ctx.start.charPositionInLine + 1
    return `${line}:${col}`
  }

  // push an error from the context
  private pushError (ctx: ParserRuleContext, message: string) {
    const start = { line: ctx.start.line, col: ctx.start.charPositionInLine }
    // istanbul ignore next
    const end =
      ctx.stop
        ? { line: ctx.stop.line, col: ctx.stop.charPositionInLine }
        : start
    this.errors.push({ explanation: message, start: start, end: end })
  }

  // pop n elements out of typeStack
  private popTypes (n: number): TntType[] {
    assert(this.typeStack.length >= n, 'popTypes: too few elements in typeStack')
    const types: TntType[] = this.typeStack.slice(-n)
    this.typeStack = this.typeStack.slice(0, -n)
    return types
  }

  // pop n expressions out of exprStack
  private popExprs (n: number): TntEx[] {
    assert(this.exprStack.length >= n, 'popExprs: too few elements in exprStack')
    const es: TntEx[] = this.exprStack.slice(-n)
    this.exprStack = this.exprStack.slice(0, -n)
    return es
  }

  // pop n patterns out of patternStack
  private popParams (n: number): string[][] {
    assert(this.paramStack.length >= n, 'popParams: too few elements in patternStack')
    const es: string[][] = this.paramStack.slice(-n)
    this.paramStack = this.paramStack.slice(0, -n)
    return es
  }

  // pop a type
  private popType (): TntType {
    // the user has specified a type
    const tp = this.typeStack.pop()
    return tp!
  }

  // produce the next number in a sequence
  private nextId (): bigint {
    const id = this.lastId
    this.lastId += 1n
    return id
  }
}
