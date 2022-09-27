import * as p from './generated/TntParser'
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext'
import { TntListener } from './generated/TntListener'
import { OpQualifier, TntDef, TntModule, TntEx, TntOpDef } from './tntIr'
import { TntType } from './tntTypes'
import { strict as assert } from 'assert'
import { ErrorMessage, Loc } from './tntParserFrontend'

/**
 * An ANTLR4 listener that constructs TntIr objects out of the abstract
 * syntax tree. This listener does the minimal work of translating the AST
 * into IR. All semantic checks and type checking must be done at later
 * phases, as the IR may be constructed by other means.
 *
 * @author Igor Konnov, Gabriela Moreira
 */
export class ToIrListener implements TntListener {
  constructor (sourceLocation: string) {
    this.sourceLocation = sourceLocation
  }

  /**
   * The module that is constructed as a result of parsing
   */
  rootModule?: TntModule = undefined
  /**
   * The stack of types that can be used as a result of type parsing
   */
  typeStack: TntType[] = []

  sourceMap: Map<bigint, Loc> = new Map<bigint, Loc>()

  /**
   * If errors occur in the listener, this array contains explanations.
   */
  errors: ErrorMessage[] = []

  private sourceLocation: string = ''

  // the stack of definitions per module
  private moduleDefStack: TntDef[][] = []
  // the stack of definitions
  private definitionStack: TntDef[] = []
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
      defs: this.definitionStack,
    }
    // add the module to the definition stack
    this.definitionStack = this.moduleDefStack.pop()!

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.definitionStack.push({
      id: id,
      kind: 'module',
      module: module,
    })
    // advance the root module to this one
    this.rootModule = module
  }

  // translate: const x: type
  exitConst (ctx: p.ConstContext) {
    const typeTag = this.popType()

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    const constDef: TntDef = {
      kind: 'const',
      name: ctx.IDENTIFIER().text,
      type: typeTag,
      id: id,
    }
    this.definitionStack.push(constDef)
  }

  // translate: var x: type
  exitVar (ctx: p.VarContext) {
    const typeTag = this.popType()

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    const varDef: TntDef = {
      kind: 'var',
      name: ctx.IDENTIFIER().text,
      type: typeTag,
      id: id,
    }
    this.definitionStack.push(varDef)
  }

  exitLetIn (ctx: p.LetInContext) {
    const def = this.definitionStack.pop()
    const expr = this.exprStack.pop()

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    if (def && expr) {
      const letExpr: TntEx = { id: id, kind: 'let', opdef: def as TntOpDef, expr: expr }
      this.exprStack.push(letExpr)
    }
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
    if (ctx.qualifier()) {
      const qtext = ctx.qualifier().text
      // case distinction to make the type checker happy
      if (qtext === 'staticval' || qtext === 'staticdef' ||
        qtext === 'val' || qtext === 'def' ||
        qtext === 'action' || qtext === 'temporal') {
        qualifier = qtext
      } else {
        const ls = this.locStr(ctx)
        // istanbul ignore next
        assert(false, `exitOperDef: ${ls}: Unexpected qualifier: ${qtext}`)
      }
    }

    if (expr && params) {
      // if the definition has parameters, introduce a lambda
      let body = expr
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))

      if (params.length > 0) {
        body = {
          id: id,
          kind: 'lambda',
          params: params,
          qualifier: qualifier,
          expr: expr,
        }
      }
      const def: TntOpDef = {
        id: id,
        kind: 'def',
        name: name,
        qualifier: qualifier,
        expr: body,
      }
      if (typeTag) {
        def.type = typeTag
      }
      this.definitionStack.push(def)
    } else {
      const ls = this.locStr(ctx)
      // istanbul ignore next
      assert(false,
        `exitOperDef: ${ls}: undefined expr or params in exitOperDef`)
    }
  }

  // translate a top-level def
  exitOper (ctx: p.OperContext) {
    const def = this.definitionStack[this.definitionStack.length - 1]
    const ls = this.locStr(ctx)
    assert(def, `exitOper: ${ls}: undefined operDef in exitOper`)
  }

  // operator parameters
  exitParams (ctx: p.ParamsContext) {
    const params = ctx.IDENTIFIER().map(n => n.text)
    this.paramStack.push(params)
  }

  // assume name = expr
  exitAssume (ctx: any) {
    const expr = this.exprStack.pop()!
    const params = this.paramStack.pop()!
    assert(params.length === 1)
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    const assume: TntDef = {
      id: id,
      kind: 'assume',
      name: params[0],
      assumption: expr,
    }
    this.definitionStack.push(assume)
  }

  // import Foo.x or import Foo.*
  exitImportDef (ctx: any) {
    const ident = this.paramStack.pop()![0]
    const path = this.paramStack.pop()![0]
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    const importDef: TntDef = {
      id: id,
      kind: 'import',
      name: ident,
      path: path,
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
    const typeToAlias = this.typeStack.pop()

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))

    const def: TntDef = {
      id: id,
      kind: 'typedef',
      name: name,
    }

    if (typeToAlias) {
      def.type = typeToAlias
    }

    this.definitionStack.push(def)
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

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    const instance: TntDef = {
      id: id,
      kind: 'instance',
      name: instanceName,
      protoName: protoName,
      overrides: overrides,
      identityOverride: identityOverride,
    }
    this.definitionStack.push(instance)
  }

  /** ******************* translate expressions **************************/

  // an identifier or a literal, e.g., foo, 42, "hello", false
  exitLiteralOrId (ctx: p.LiteralOrIdContext) {
    const ident = ctx.IDENTIFIER()

    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    if (ident) { // identifier
      this.exprStack.push({
        id: id,
        kind: 'name',
        name: ident.text,
      })
    }
    const intNode = ctx.INT()
    if (intNode) { // integer literal
      this.exprStack.push({
        id: id,
        kind: 'int',
        type: { id: id, kind: 'int' },
        value: BigInt(intNode.text),
      })
    }
    const boolNode = ctx.BOOL()
    if (boolNode) { // Boolean literal
      this.exprStack.push({
        id: id,
        kind: 'bool',
        type: { id: id, kind: 'bool' },
        value: (boolNode.text === 'true'),
      })
    }
    const strNode = ctx.STRING()
    if (strNode) { // string, remove the quotes!
      this.exprStack.push({
        id: id,
        kind: 'str',
        type: { id: id, kind: 'str' },
        value: strNode.text.slice(1, -1),
      })
    }
  }

  // function application, e.g., f[10]
  exitFunApp (ctx: any) {
    this.pushApplication(ctx, 'get', this.popExprs(2))
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
        const ls = this.locStr(ctx)
        // istanbul ignore next
        assert(false, `exitOperApp: ${ls}: expected wrapped arguments`)
      }
    } // else no arguments, e.g., set(), seq()

    this.pushApplication(ctx, name, args)
  }

  // operator application via dot, e.g., S.union(T)
  exitDotCall (ctx: p.DotCallContext) {
    // pop: the first argument, operator name, the rest of arguments (wrapped)
    const wrappedArgs = ctx.argList() ? this.exprStack.pop() : undefined
    const name = ctx.nameAfterDot().text
    const callee = this.exprStack.pop()
    if (callee === undefined) {
      const ls = this.locStr(ctx)
      assert(false, `exitDotCall: ${ls} callee not found`)
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
          const ls = this.locStr(ctx)
          // istanbul ignore next
          assert(false,
            `exitDotCall: ${ls} expected wrappedArgs, found: ${wrappedArgs.kind}`)
        }
      } else {
        // no arguments, as in e.g., s.head()
        args = [callee!]
      }
      // apply the operator to the arguments
      this.pushApplication(ctx, name, args)
    } else {
      // accessing a tuple element, a record field, or name in a module
      const m = name.match(/^_([1-9][0-9]?)$/)
      if (m) {
        // accessing a tuple element via _1, _2, _3, etc.

        const id = this.nextId()
        this.sourceMap.set(id, this.loc(ctx))
        const idx: TntEx = {
          id: id,
          kind: 'int',
          value: BigInt(m[1]),
        }

        this.pushApplication(ctx, 'item', [callee!, idx])
      } else {
        // accessing a record field or a name in a module
        if (name === 'in' || name === 'notin' ||
          name === 'and' || name === 'or' ||
          name === 'iff' || name === 'implies' || name === 'subseteq') {
          const msg =
            'TNT006: no keywords allowed as record fields in record.field'
          this.pushError(ctx, msg)
        }

        const id = this.nextId()
        this.sourceMap.set(id, this.loc(ctx))
        const field: TntEx = {
          id: id,
          kind: 'str',
          value: name,
        }
        this.pushApplication(ctx, 'field', [callee!, field])
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
      args: args,
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

      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.exprStack.push({
        id: id,
        kind: 'lambda',
        params: singletons,
        qualifier: qualifier,
        expr: expr,
      })
    } else {
      const ls = this.locStr(ctx)
      // istanbul ignore next
      assert(false, `exitLambda: ${ls}: expected an expression`)
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

    this.pushApplication(ctx, 'tup', args)
  }

  // sequence constructor, e.g., [1, 2, 3]
  exitSequence (ctx: p.SequenceContext) {
    const args = this.popExprs(ctx.expr().length)
    this.pushApplication(ctx, 'seq', args)
  }

  // record constructor, e.g., { name: "igor", year: 2021 }
  exitRecord (ctx: p.RecordContext) {
    const names = ctx.IDENTIFIER().map((n) => n.text)
    const elems: TntEx[] = this.popExprs(ctx.expr().length)
    // since TS does not have zip, a loop is the easiest solution
    const namesAndValues: TntEx[] = []
    for (let i = 0; i < names.length; i++) {
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      namesAndValues.push({
        id: id,
        kind: 'str',
        value: names[i],
        type: { id: id, kind: 'str' },
      })
      namesAndValues.push(elems[i])
    }
    this.pushApplication(ctx, 'record', namesAndValues)
  }

  // '+' or '-'
  exitPlusMinus (ctx: p.PlusMinusContext) {
    const opcode = (ctx.PLUS() !== undefined) ? 'iadd' : 'isub'
    const args = this.popExprs(2)
    this.pushApplication(ctx, opcode, args)
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
      this.pushApplication(ctx, opcode, args)
    }
  }

  // integer power, e.g., x^y
  exitPow (ctx: any) {
    const args = this.popExprs(2)
    this.pushApplication(ctx, 'ipow', args)
  }

  // unary minus, e.g., -x
  exitUminus (ctx: any) {
    const arg = this.exprStack.pop()
    if (arg) {
      this.pushApplication(ctx, 'iuminus', [arg])
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
      this.pushApplication(ctx, opcode, args)
    }
  }

  // p and q
  exitAnd (ctx: any) {
    const args = this.popExprs(2)
    this.pushApplication(ctx, 'and', args)
  }

  // p or q
  exitOr (ctx: any) {
    const args = this.popExprs(2)
    this.pushApplication(ctx, 'or', args)
  }

  // p implies q
  exitImplies (ctx: any) {
    const args = this.popExprs(2)
    this.pushApplication(ctx, 'implies', args)
  }

  // p iff q
  exitIff (ctx: any) {
    const args = this.popExprs(2)
    this.pushApplication(ctx, 'iff', args)
  }

  // ( p & q & r )
  exitAndExpr (ctx: p.AndExprContext) {
    const args = this.popExprs(ctx.expr().length)
    this.pushApplication(ctx, 'andExpr', args)
  }

  // ( p | q | r )
  exitOrExpr (ctx: p.OrExprContext) {
    const args = this.popExprs(ctx.expr().length)
    this.pushApplication(ctx, 'orExpr', args)
  }

  // { p & q & r }
  exitAndAction (ctx: p.AndActionContext) {
    const args = this.popExprs(ctx.expr().length)
    this.pushApplication(ctx, 'andAction', args)
  }

  // { p | q | r }
  exitOrAction (ctx: p.OrActionContext) {
    const args = this.popExprs(ctx.expr().length)
    this.pushApplication(ctx, 'orAction', args)
  }

  // if (p) e1 else e2
  exitIfElse (ctx: any) {
    const args = this.popExprs(3)
    this.pushApplication(ctx, 'ite', args)
  }

  // entry match
  //   | "Cat": cat => cat.name != ""
  //   | "Dog": dog => dog.year > 0
  exitMatch (ctx: p.MatchContext) {
    const options = ctx.STRING().map((opt) => opt.text.slice(1, -1))
    const noptions = options.length
    // expressions in the right-hand sides, e.g., dog.year > 0
    const rhsExprs = this.popExprs(noptions)
    // parameters in the right-hand side
    const params = this.popParams(noptions)
    // matched expressionm e.g., entry
    const exprToMatch = this.popExprs(1)![0]
    const matchArgs: TntEx[] = [exprToMatch]
    // push the tag value and the corresponding lambda in matchArgs
    for (let i = 0; i < noptions; i++) {
      const tagId = this.nextId()
      this.sourceMap.set(tagId, this.loc(ctx))
      const tag: TntEx = {
        id: tagId,
        kind: 'str',
        value: options[i],
        type: { id: tagId, kind: 'str' },
      }
      const lamId = this.nextId()
      this.sourceMap.set(lamId, this.loc(ctx))
      const lam: TntEx = {
        id: lamId,
        kind: 'lambda',
        params: params[i],
        qualifier: 'def',
        expr: rhsExprs[i],
      }
      matchArgs.push(tag)
      matchArgs.push(lam)
    }
    // construct the match expression and push it in exprStack
    this.pushApplication(ctx, 'match', matchArgs)
  }

  /** ******************* translate types ********************************/

  // the integer type, that is, int
  exitTypeInt (ctx: p.TypeIntContext) {
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.typeStack.push({ id: id, kind: 'int' })
  }

  // the Boolean type, that is, bool
  exitTypeBool (ctx: p.TypeBoolContext) {
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.typeStack.push({ id: id, kind: 'bool' })
  }

  // the string type, that is, str
  exitTypeStr (ctx: p.TypeStrContext) {
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.typeStack.push({ id: id, kind: 'str' })
  }

  // a type variable, a type constant, or a reference to a type alias
  exitTypeConstOrVar (ctx: p.TypeConstOrVarContext) {
    const name = ctx.IDENTIFIER().text
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    if (name[0].match('[a-z]')) {
      // a type variable from: a, b, ... z
      this.typeStack.push({ id: id, kind: 'var', name: name })
    } else {
      // a type constant, e.g., declared via typedef
      this.typeStack.push({ id: id, kind: 'const', name: name })
    }
  }

  // a set type, e.g., set(int)
  exitTypeSet (ctx: p.TypeSetContext) {
    const last = this.typeStack.pop()
    if (last !== undefined) {
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.typeStack.push({ id: id, kind: 'set', elem: last })
    } // the other cases are excluded by the parser
  }

  // a sequence type, e.g., seq(int)
  exitTypeSeq (ctx: p.TypeSeqContext) {
    const top = this.typeStack.pop()
    if (top !== undefined) {
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.typeStack.push({ id: id, kind: 'seq', elem: top })
    } // the other cases are excluded by the parser
  }

  // A function type, e.g., str => int
  exitTypeFun (ctx: p.TypeFunContext) {
    const res = this.typeStack.pop()
    const arg = this.typeStack.pop()
    if (arg !== undefined && res !== undefined) {
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.typeStack.push({ id: id, kind: 'fun', arg: arg, res: res })
    }
  }

  // A tuple type, e.g., (int, bool)
  // the type stack contains the types of the elements
  exitTypeTuple (ctx: p.TypeTupleContext) {
    const elemTypes: TntType[] = this.popTypes(ctx.type().length)
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.typeStack.push({ id: id, kind: 'tuple', elems: elemTypes })
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
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.typeStack.push({ id: id, kind: 'record', fields: pairs })
  }

  // A disjoint union type, e.g.,
  //   | { type: "ack", from: address }
  //   | { type: "syn", to: address }
  exitTypeUnionRec (ctx: p.TypeUnionRecContext) {
    const size = ctx.typeUnionRecOne().length
    const ls = this.locStr(ctx)
    assert(size > 0, `exitTypeUnionRec: ${ls}: size == 0`)
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
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.typeStack.push({ id: id, kind: 'union', tag: tag, records: records })
    } else {
      const ls = this.locStr(ctx)
      // istanbul ignore next
      assert(false, `exitTypeUnionRec: ${ls} no union in exitTypeUnionRec`)
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
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    // construct a singleton disjoint union, which should be assembled above
    const singleton: TntType = {
      id: id,
      kind: 'union',
      tag: tagName,
      records: [{ tagValue: tagVal, fields: pairs }],
    }

    this.typeStack.push(singleton)
  }

  // an operator type, e.g., (int, str) => bool
  exitTypeOper (ctx: p.TypeOperContext) {
    const resType = this.typeStack.pop()
    const nargs = ctx.type().length - 1
    const argTypes: TntType[] = this.popTypes(nargs)
    if (resType !== undefined && argTypes.length === nargs) {
      const id = this.nextId()
      this.sourceMap.set(id, this.loc(ctx))
      this.typeStack.push({ id: id, kind: 'oper', args: argTypes, res: resType })
    }
  }

  /**
   * Produce a human-readable location string.
   */
  private locStr (ctx: ParserRuleContext) {
    const line = ctx.start.line
    const col = ctx.start.charPositionInLine
    return `${line}:${col}`
  }

  private loc (ctx: ParserRuleContext): Loc {
    if (ctx.stop) {
      // Try to use index. If not available, use column instead.
      // This is what works best with the information provided by the parser
      const endCol = ctx.stop.stopIndex !== 0
        ? ctx.start.charPositionInLine + (ctx.stop.stopIndex - ctx.start.startIndex)
        : ctx.stop.charPositionInLine
      return {
        source: this.sourceLocation,
        start: { line: ctx.start.line - 1, col: ctx.start.charPositionInLine, index: ctx.start.startIndex },
        end: { line: ctx.stop.line - 1, col: endCol, index: ctx.stop.stopIndex },
      }
    } else {
      return {
        source: this.sourceLocation,
        start: { line: ctx.start.line - 1, col: ctx.start.charPositionInLine, index: ctx.start.startIndex },
      }
    }
  }

  // Push the application of operator `name` to `args` onto the internal
  // stack of expressions
  private pushApplication (ctx: any, name: string, args: TntEx[]) {
    const id = this.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    this.exprStack.push({
      id: id,
      kind: 'app',
      opcode: name,
      args: args,
    })
  }

  // push an error from the context
  private pushError (ctx: ParserRuleContext, message: string) {
    const start = { line: ctx.start.line - 1, col: ctx.start.charPositionInLine, index: ctx.start.startIndex }
    // istanbul ignore next
    const end =
      ctx.stop
        ? { line: ctx.stop.line - 1, col: ctx.stop.charPositionInLine, index: ctx.stop.stopIndex }
        : start
    this.errors.push({ explanation: message, locs: [{ source: this.sourceLocation, start: start, end: end }] })
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
    if (n === 0) {
      // pop nothing and return the empty array
      return []
    } else {
      // remove n elements from exprStack and return those elements
      const es: TntEx[] = this.exprStack.slice(-n)
      this.exprStack = this.exprStack.slice(0, -n)
      return es
    }
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
