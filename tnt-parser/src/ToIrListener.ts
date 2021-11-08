import * as p from './generated/TntParser'
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
   * The module that is constructed in the end
   */
  rootModule?: TntModule = undefined
  /**
   * If errors occur in the listener, this array contains explanations.
   */
  errors: ErrorMessage[] = []
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

  // translate: module <name> { ... }
  exitModule (ctx: p.ModuleContext) {
    const module: TntModule = {
      id: this.nextId(),
      name: ctx.IDENTIFIER().text,
      defs: this.definitionStack
    }
    this.definitionStack = [] // reset the definitions
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
        qualifier = 'def'
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
      assert(false, 'undefined expr or params in exitOperDef')
    }
  }

  // translate a top-level def
  exitOper () {
    const def = this.definitionStack[this.definitionStack.length - 1]
    assert(def, 'undefined operDef in exitOper')
  }

  exitParams (ctx: p.ParamsContext) {
    const params = ctx.IDENTIFIER().map(n => n.text)
    this.paramStack.push(params)
  }

  /** ******************* translate expressions **************************/

  // an identifier or a literal, e.g., foo, 42, "hello", false
  exitLiteralOrId (ctx: p.LiteralOrIdContext) {
    const ident = ctx.IDENTIFIER()
    if (ident) { // we have met an identifier
      this.exprStack.push({
        id: this.nextId(),
        kind: 'name',
        name: ident.text
      })
    }
    const intNode = ctx.INT()
    if (intNode) { // we have met an integer literal
      this.exprStack.push({
        id: this.nextId(),
        kind: 'int',
        type: { kind: 'int' },
        value: BigInt(intNode.text)
      })
    }
    const boolNode = ctx.BOOL()
    if (boolNode) { // we have met a Boolean literal
      this.exprStack.push({
        id: this.nextId(),
        kind: 'bool',
        type: { kind: 'bool' },
        value: (boolNode.text === 'true')
      })
    }
    const strNode = ctx.STRING()
    if (strNode) { // we have met a string, remove the quotes!
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
      kind: 'opapp',
      opcode: 'of',
      args: args
    })
  }

  // operator application in the normal form, e.g., MyOper("foo", 42)
  exitOperApp (ctx: p.OperAppContext) {
    const name = ctx.normalCallName().text
    const wrappedArgs = this.exprStack.pop()
    if (wrappedArgs && wrappedArgs.kind === 'opapp') {
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
        opcode: name,
        args: wrappedArgs.args
      })
    } else {
      assert(false, 'exitOperApp: expected wrapped arguments')
    }
  }

  // infix operator application, e.g., S union T
  exitInfixCall (ctx: p.InfixCallContext) {
    const name = ctx.IDENTIFIER().text
    const wrappedArgs = this.exprStack.pop()
    const firstArg = this.exprStack.pop()
    if (firstArg && wrappedArgs && wrappedArgs.kind === 'opapp' &&
        wrappedArgs.opcode === 'wrappedArgs') {
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
        opcode: name,
        args: [firstArg].concat(wrappedArgs.args)
      })
    } else {
      assert(false, 'exitInfixCall: expected leading arg and wrapped arguments')
    }
  }

  // operator application via dot, e.g., S.union(T)
  exitDotCall () {
    // pop: the first argument, operator name, either lambda or the rest of arguments (packed)
    const wrappedArgsOrLambda = this.exprStack.pop()
    const name = this.exprStack.pop()
    const firstArg = this.exprStack.pop()
    if (firstArg && wrappedArgsOrLambda && name && name.kind === 'name') {
      let args
      if (wrappedArgsOrLambda.kind === 'opapp' &&
          wrappedArgsOrLambda.opcode === 'wrappedArgs') {
        args = [firstArg].concat(wrappedArgsOrLambda.args)
      } else {
        args = [firstArg, wrappedArgsOrLambda]
      }
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
        opcode: name.name,
        args: args
      })
    } else {
      assert(false, 'exitDotCall: expected leading arg, name, and wrapped arguments')
    }
  }

  // an identifier or some operators that are allowed as a name in f(...)
  exitNormalCallName (ctx: p.NormalCallNameContext) {
    const ident = ctx.IDENTIFIER()
    if (ident) {
      this.exprStack.push({ id: 0n, kind: 'name', name: ident.text })
    } else {
      const op = ctx._op
      if (op) {
        let name = 'undefined'
        switch (op.type) {
          case p.TntParser.AND: name = 'and'; break
          case p.TntParser.OR: name = 'or'; break
          case p.TntParser.IMPLIES: name = 'implies'; break
          case p.TntParser.IFF: name = 'iff'; break
          case p.TntParser.IN: name = 'in'; break
          case p.TntParser.NOTIN: name = 'notin'; break
          case p.TntParser.SUBSETEQ: name = 'subseteq'; break
          case p.TntParser.SET: name = 'set'; break
        }
        this.exprStack.push({ id: 0n, kind: 'name', name: name })
      } else {
        assert(false, 'exitName_after_dot: expected an operator')
      }
    }
  }

  // an identifier or some operators that are allowed after '.'
  exitNameAfterDot (ctx: p.NameAfterDotContext) {
    const ident = ctx.IDENTIFIER()
    if (ident) {
      this.exprStack.push({ id: 0n, kind: 'name', name: ident.text })
    } else {
      const op = ctx._op
      if (op) {
        let name = 'undefined'
        switch (op.type) {
          case p.TntParser.AND: name = 'and'; break
          case p.TntParser.OR: name = 'or'; break
          case p.TntParser.IMPLIES: name = 'implies'; break
          case p.TntParser.IFF: name = 'iff'; break
          case p.TntParser.IN: name = 'in'; break
          case p.TntParser.NOTIN: name = 'notin'; break
          case p.TntParser.SUBSETEQ: name = 'subseteq'; break
        }
        this.exprStack.push({ id: 0n, kind: 'name', name: name })
      } else {
        assert(false, 'exitName_after_dot: expected an operator')
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
      kind: 'opapp',
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
      assert(false, 'exitLambda: expected an expression')
    }
  }

  // a single parameter in a lambda expression: an identifier or '_'
  exitIdentOrHole (ctx: p.IdentOrHoleContext) {
    const ident = ctx.IDENTIFIER()
    if (ident) {
      this.paramStack.push([ident.text])
    } else {
      this.paramStack.push(['_'])
    }
  }

  // tuple constructor, e.g., (1, 2, 3)
  exitTuple (ctx: p.TupleContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'tuple',
      args: args
    })
  }

  // sequence constructor, e.g., [1, 2, 3]
  exitSequence (ctx: p.SequenceContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
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
    this.exprStack.push({ id: this.nextId(), kind: 'opapp', opcode: 'record', args: namesAndValues })
  }

  // '+' or '-'
  exitPlusMinus (ctx: p.PlusMinusContext) {
    const opcode = (ctx.ADD() !== undefined) ? 'add' : 'sub'
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
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
        case p.TntParser.MUL: opcode = 'mul'; break
        case p.TntParser.DIV: opcode = 'div'; break
        case p.TntParser.MOD: opcode = 'mod'; break
      }
      const args = this.popExprs(2)
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
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
      kind: 'opapp',
      opcode: 'pow',
      args: args
    })
  }

  // unary minus, e.g., -x
  exitUminus () {
    const arg = this.exprStack.pop()
    if (arg) {
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
        opcode: 'uminus',
        args: [arg]
      })
    }
  }

  // GT | LT | GE | LE | NE | EQEQ | EQ | ASGN | IN | NOTIN | SUBSETEQ
  exitRelations (ctx: p.RelationsContext) {
    const op = ctx._op
    if (op) {
      let opcode = ''
      switch (op.type) {
        case p.TntParser.GT: opcode = 'gt'; break
        case p.TntParser.GE: opcode = 'gte'; break
        case p.TntParser.LT: opcode = 'lt'; break
        case p.TntParser.LE: opcode = 'lte'; break
        case p.TntParser.EQ: opcode = 'eq'; break
        case p.TntParser.EQEQ: opcode = 'eq'; break
        case p.TntParser.ASGN: opcode = 'assign'; break
        case p.TntParser.NE: opcode = 'neq'; break
        case p.TntParser.IN: opcode = 'in'; break
        case p.TntParser.NOTIN: opcode = 'notin'; break
        case p.TntParser.SUBSETEQ: opcode = 'subseteq'; break
      }
      const args = this.popExprs(2)
      this.exprStack.push({
        id: this.nextId(),
        kind: 'opapp',
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
      kind: 'opapp',
      opcode: 'and',
      args: args
    })
  }

  // p or q
  exitOr () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'or',
      args: args
    })
  }

  // p implies q
  exitImplies () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'implies',
      args: args
    })
  }

  // p iff q
  exitIff () {
    const args = this.popExprs(2)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'iff',
      args: args
    })
  }

  // { p & q & r }
  exitAndBlock (ctx: p.AndBlockContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'andBlock',
      args: args
    })
  }

  // { p | q | r }
  exitOrBlock (ctx: p.OrBlockContext) {
    const args = this.popExprs(ctx.expr().length)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
      opcode: 'orBlock',
      args: args
    })
  }

  // if (p) e1 else e2
  exitIfElse () {
    const args = this.popExprs(3)
    this.exprStack.push({
      id: this.nextId(),
      kind: 'opapp',
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
            const msg = `TNT011: Records in disjoint union have different tag fields: ${tag} and ${one.tag}`
            const start = { line: ctx.start.line, col: ctx.start.charPositionInLine }
            const end = ctx.stop
              ? { line: ctx.stop.line, col: ctx.stop.charPositionInLine }
              : start
            this.errors.push({ explanation: msg, start: start, end: end })
          }
        } else {
          assert(false, 'exitTypeUnionRec: no union in exitTypeUnionRec')
        }
      }
      this.typeStack.push({ kind: 'union', tag: tag, records: records })
    } else {
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
    if (tp) {
      return tp
    } else {
      assert(false, 'popType: no type in typeStack')
      // this line should not be reachable
      return { kind: 'bool' }
    }
  }

  // produce the next number in a sequence
  private nextId (): bigint {
    const id = this.lastId
    this.lastId += 1n
    return id
  }
}
