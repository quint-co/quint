import * as p from '../generated/QuintParser'
import { IdGenerator } from '../idGenerator'
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext'
import { QuintListener } from '../generated/QuintListener'
import {
  OpQualifier,
  QuintApp,
  QuintBuiltinApp,
  QuintDeclaration,
  QuintDef,
  QuintEx,
  QuintLambda,
  QuintLambdaParameter,
  QuintLet,
  QuintModule,
  QuintName,
  QuintOpDef,
  QuintStr,
  isAnnotatedDef,
} from '../ir/quintIr'
import {
  ConcreteFixedRow,
  QuintAppType,
  QuintConstType,
  QuintSumType,
  QuintType,
  QuintVarType,
  Row,
  RowField,
  isUnitType,
  typeNames,
  unitType,
} from '../ir/quintTypes'
import { SourceMap } from './quintParserFrontend'
import { compact, times, zipWith } from 'lodash'
import { Maybe, just, none } from '@sweet-monads/maybe'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import { QuintTypeDef } from '../ir/quintIr'
import { zip } from '../util'
import { QuintError } from '../quintError'
import { lowercaseTypeError, mapSyntaxError, tooManySpreadsError, undeclaredTypeParamsError } from './parseErrors'
import { Loc } from '../ErrorMessage'
import assert, { fail } from 'assert'
import { typeToString } from '../ir/IRprinting'

/**
 * An ANTLR4 listener that constructs QuintIr objects out of the abstract
 * syntax tree. This listener does the minimal work of translating the AST
 * into IR. All semantic checks and type checking must be done at later
 * phases, as the IR may be constructed by other means.
 *
 * The listener should be able to execute on top of malformed ASTs. It produces
 * undefined/default components to fill in the gaps. The issues found while
 * producing an AST should be reported, but should not prevent an IR to be
 * constructed. This allow us to gather additional static analysis information
 * to report before aborting.
 *
 * @author Igor Konnov, Gabriela Moreira
 */
export class ToIrListener implements QuintListener {
  constructor(sourceLocation: string, idGen: IdGenerator) {
    this.sourceLocation = sourceLocation
    this.idGen = idGen
  }

  /**
   * The modules derived as a result of parsing
   */
  modules: QuintModule[] = []
  /**
   * The stack of types that can be used as a result of type parsing.
   */
  typeStack: QuintType[] = []

  sourceMap: SourceMap = new Map()

  /**
   * If errors occur in the listener, this array contains explanations.
   */
  errors: QuintError[] = []

  private sourceLocation: string = ''

  // the stack of definitions
  protected declarationStack: QuintDeclaration[] = []
  // the stack of expressions
  protected exprStack: QuintEx[] = []
  // the stack of parameter lists
  protected paramStack: QuintLambdaParameter[] = []
  // the stack for imported names
  protected identOrStarStack: string[] = []
  // the stack of rows for records
  protected rowStack: Row[] = []
  // the stack of variants for a sum
  protected variantStack: RowField[] = []
  // an internal counter to assign unique numbers
  protected idGen: IdGenerator

  // translate: module <name> { ... }
  exitModule(ctx: p.ModuleContext) {
    if (
      this.exprStack.length > 0 ||
      this.identOrStarStack.length > 0 ||
      this.rowStack.length > 0 ||
      this.variantStack.length > 0
    ) {
      // This used to be an assumption, but I'm not sure if it still holds after
      // #1220. However, we don't want components leaking from one module to
      // another, so it's better not to hide this completely. We should turn this
      // back into `assert`s after we feel more confident about it.
      console.error(
        'ATTENTION: There is some component(s) left on the stack(s) after parsing a module, please report a bug'
      )
    }

    const moduleId = this.getId(ctx)

    const module: QuintModule = {
      id: moduleId,
      name: ctx.qualId().text,
      declarations: this.declarationStack,
    }

    this.declarationStack = []

    const doc = getDocText(ctx.DOCCOMMENT())

    if (doc) {
      this.modules.push({ ...module, doc })
      return
    }

    this.modules.push(module)
  }

  // translate: const x: type
  exitConst(ctx: p.ConstContext) {
    const typeTag = this.popType().unwrap()

    const id = this.getId(ctx)
    const constDef: QuintDef = {
      kind: 'const',
      name: ctx.qualId().text,
      typeAnnotation: typeTag,
      id,
    }
    this.declarationStack.push(constDef)
  }

  // translate: var x: type
  exitVar(ctx: p.VarContext) {
    const typeTag = this.popType().unwrap()

    const id = this.getId(ctx)
    const varDef: QuintDef = {
      kind: 'var',
      name: ctx.qualId().text,
      typeAnnotation: typeTag,
      id,
    }
    this.declarationStack.push(varDef)
  }

  exitLetIn(ctx: p.LetInContext) {
    const def = this.declarationStack.pop() ?? this.undefinedDeclaration(ctx)()
    const expr = this.exprStack.pop() ?? this.undefinedExpr(ctx)()

    const id = this.getId(ctx)
    const letExpr: QuintEx = { id, kind: 'let', opdef: def as QuintOpDef, expr }
    this.exprStack.push(letExpr)
  }

  /** **************** translate operator definititons **********************/

  // translate a top-level or nested operator definition
  exitAnnotatedOperDef(ctx: p.AnnotatedOperDefContext) {
    const name = ctx.normalCallName().text

    const params = ctx._annotOperParam.map(_ => popOrFail(this.paramStack, 'annotated AnnotatedOperDef')).reverse()
    const res = this.popType().unwrap(() => 'violated grammar of annotated params return type')
    const args = params.map(p => {
      assert(isAnnotatedDef(p), 'violated grammar of annotated param type')
      return p.typeAnnotation
    })
    const typeAnnotation: QuintType = { kind: 'oper', args, res }

    this.putDeclarationOnStack(ctx, name, params, just(typeAnnotation))
  }

  // TODO Mark as deprecated, then remove
  //      See https://github.com/informalsystems/quint/issues/923
  exitDeprecatedOperDef(ctx: p.DeprecatedOperDefContext) {
    const name = ctx.normalCallName().text

    // The deprecated annotation grammar
    const typeAnnotation: Maybe<QuintType> = ctx._annotatedRetType ? this.popType() : none()
    const params = ctx._operParam
      .map(_ => popOrFail(this.paramStack, 'violated grammar of non-annotated params'))
      .reverse()
    // TODO Enable after builtins are fixed
    // if (params.length > 0 && typeAnnotation.isJust()) {
    //   console.warn(
    //     'post-operator-head annotations are deprecated; see https://github.com/informalsystems/quint/issues/923'
    //   )
    // }
    this.putDeclarationOnStack(ctx, name, params, typeAnnotation)
  }

  private putDeclarationOnStack(
    ctx: p.DeprecatedOperDefContext | p.AnnotatedOperDefContext,
    name: string,
    params: QuintLambdaParameter[],
    typeAnnotation: Maybe<QuintType>
  ) {
    const expr: QuintEx = ctx.expr()
      ? this.exprStack.pop() ?? this.undefinedExpr(ctx)()
      : // This is only a definition header, use a default body since the IR
        // does not have a representation for this at the moment
        { id: this.getId(ctx), kind: 'bool', value: true }

    // The grammar should guarantee we only parse valid OpQualifiers here
    const qualifier: OpQualifier = ctx.qualifier().text as OpQualifier

    const body: QuintEx =
      params.length === 0
        ? expr
        : // If the definition has parameters, introduce a lambda
          { id: this.getId(ctx), kind: 'lambda', params, qualifier, expr }

    const def: QuintOpDef = {
      id: this.getId(ctx),
      kind: 'def',
      name,
      qualifier,
      expr: body,
    }
    if (typeAnnotation.isJust()) {
      def.typeAnnotation = typeAnnotation.value
    }
    this.declarationStack.push(def)
  }

  // assume name = expr
  exitAssume(ctx: p.AssumeContext) {
    const expr = this.exprStack.pop()!
    const name = ctx._assumeName.text
    const id = this.getId(ctx)
    const assume: QuintDef = {
      id,
      kind: 'assume',
      name: name,
      assumption: expr,
    }
    this.declarationStack.push(assume)
  }

  // import Foo, import Foo as F, import Foo.x, import Foo.*
  // import Foo from "./foo.qnt", import Foo as F from "./foo.qnt",
  // import Foo.x from "./foo.qnt", import Foo.* from "./foo.qnt"
  exitImportMod(ctx: p.ImportModContext) {
    const defName = ctx.identOrStar() ? this.identOrStarStack.pop()! : undefined
    const protoName = ctx.name()[0].text
    const qualifier = ctx.name().length > 1 ? ctx.name()[1].text : undefined
    // slice <path> from the quoted string "<path>", if the path is present
    const fromSource = ctx.fromSource() ? ctx.fromSource()!.text.slice(1, -1) : undefined
    const id = this.getId(ctx)
    const importDecl: QuintDeclaration = {
      id,
      kind: 'import',
      defName: defName,
      protoName: protoName,
      qualifiedName: qualifier,
      fromSource,
    }
    this.declarationStack.push(importDecl)
  }

  exitExportMod(ctx: p.ExportModContext) {
    const defName = ctx.identOrStar() ? this.identOrStarStack.pop()! : undefined
    const protoName = ctx.name()[0].text
    const qualifier = ctx.name().length > 1 ? ctx.name()[1].text : undefined
    const id = this.getId(ctx)
    const exportDecl: QuintDeclaration = {
      id,
      kind: 'export',
      defName: defName,
      protoName: protoName,
      qualifiedName: qualifier,
    }
    this.declarationStack.push(exportDecl)
  }

  // type T
  exitTypeAbstractDef(ctx: p.TypeAbstractDefContext) {
    const name = ctx.qualId()!.text
    const id = this.getId(ctx)

    this.checkForUppercaseTypeName(id, name)

    const def: QuintTypeDef = {
      id,
      kind: 'typedef',
      name,
    }

    this.declarationStack.push(def)
  }

  // E.g.,
  //
  // - type Alias = Set[int]
  // - type Constr[a, b] = (Set[a], Set[b])
  exitTypeAliasDef(ctx: p.TypeAliasDefContext) {
    const id = this.getId(ctx)

    const defHead = ctx.typeDefHead()
    const name = defHead._typeName.text
    const type = this.popType().unwrap(() =>
      fail('internal error: type alias declaration parsed with no right hand side')
    )

    this.checkForUppercaseTypeName(id, name)

    let defWithoutParams: QuintTypeDef = { id: id, kind: 'typedef', name, type }
    const def: QuintTypeDef =
      defHead._typeVars.length > 0
        ? { ...defWithoutParams, params: defHead._typeVars.map(t => t.text!) }
        : defWithoutParams

    this.checkForUndeclaredTypeVariables(id, def)

    this.declarationStack.push(def)
  }

  // E.g.,
  //
  // - type T = | A | B(t1) | C(t2)
  // - type Result[ok, err] = | Ok(ok) | Err(err)
  exitTypeSumDef(ctx: p.TypeSumDefContext) {
    const id = this.getId(ctx)

    const defHead = ctx.typeDefHead()
    const name = defHead._typeName.text

    // Build the type declaraion
    const fields: RowField[] = popMany(this.variantStack, this.variantStack.length, this.undefinedVariant(ctx))
    const row: ConcreteFixedRow = { kind: 'row', fields, other: { kind: 'empty' } }
    const type: QuintSumType = { id, kind: 'sum', fields: row }

    let defWithoutParams: QuintTypeDef = { id: id, kind: 'typedef', name, type }
    const def: QuintTypeDef =
      defHead._typeVars.length > 0
        ? { ...defWithoutParams, params: defHead._typeVars.map(t => t.text!) }
        : defWithoutParams

    this.checkForUndeclaredTypeVariables(id, def)

    // Used for annotations in the variant constructors
    let constructorReturnType: QuintType
    // The constant identifying the type definition. E.g. `Result`
    const typeConst: QuintConstType = { id: this.getId(ctx), kind: 'const', name }
    if (def.params) {
      // The type takes parameters, so we need a type application as the return type. E.g., `Result[ok, err]`
      const args: QuintVarType[] = def.params.map(name => ({ id: this.getId(ctx), kind: 'var', name }))
      constructorReturnType = { id, kind: 'app', ctor: typeConst, args }
    } else {
      // The type takes no parameters, so we only need the constant name
      constructorReturnType = typeConst
    }

    // Generate all the variant constructors implied by a variant type definition
    // a variant constructor is an operator that injects an expression
    // into the sum type by wrapping it in a label
    //
    // E.g., given the type definition
    //
    // ```
    // type T = A(int) | B
    // ```
    //
    // We will generate
    //
    // ```
    // def A(__AParam: int) : T = variant("A", __AParam)
    // val B : T = {}
    // ```
    //
    // Allowing users to write:
    //
    // ```
    // val a: T = A(42)
    // val b: T = B
    // ```
    if (fields.length == 1 && isUnitType(fields[0].fieldType) && ctx.sumTypeDefinition()._separator == undefined) {
      // A single type constructor with no parameters is parsed as an alias, unless it has the `|` separator:
      // type T = A
      // The only proper way to disambiguate it between an alias and
      // a constructor over the unit type would be to use name resolution.
      // Users can use `type T = | A` to make it into a sum type.
      const variantCtx = ctx.sumTypeDefinition().typeSumVariant()[0]
      const def: QuintTypeDef = {
        id: id,
        kind: 'typedef',
        name,
        type: { id: this.getId(variantCtx), kind: 'const', name: variantCtx.text },
      }

      this.declarationStack.push(def)
      return
    }

    const constructors: QuintOpDef[] = zip(fields, ctx.sumTypeDefinition().typeSumVariant()).map(
      ([{ fieldName, fieldType }, variantCtx]) => {
        // Mangle the parameter name to avoid clashes
        // This shouldn't be visible to users
        const paramName = `__${fieldName}Param`

        let qualifier: OpQualifier
        let expr: QuintEx
        let typeAnnotation: QuintType

        const label: QuintStr = { id: this.getId(variantCtx), kind: 'str', value: fieldName }
        if (isUnitType(fieldType)) {
          // Its a `val` cause it has no parameters
          //
          // E.g., for B we will produce
          //
          // ```
          // val B: T = variant("B", {})
          // ```
          qualifier = 'val'

          // The nullary variant constructor is actually
          // a variant pairing a label with the unit.
          const wrappedExpr = unitValue(this.getId(variantCtx._sumLabel))

          typeAnnotation = constructorReturnType
          expr = {
            id: this.getId(variantCtx),
            kind: 'app',
            opcode: 'variant',
            args: [label, wrappedExpr],
          }
        } else {
          // Otherwise we will build a constructor that takes one parameter
          //
          // E.g., for A(int) we will produce a
          //
          // ```
          // def A(x:int): T = variant("A", x)
          // ```
          qualifier = 'def'

          const params = [{ id: this.getId(variantCtx.type()!), name: paramName }]
          const wrappedExpr: QuintName = { kind: 'name', name: paramName, id: this.getId(variantCtx._sumLabel) }
          const variant: QuintBuiltinApp = {
            id: this.getId(variantCtx),
            kind: 'app',
            opcode: 'variant',
            args: [label, wrappedExpr],
          }

          typeAnnotation = { kind: 'oper', args: [fieldType], res: constructorReturnType }
          expr = { id: this.getId(variantCtx), kind: 'lambda', params, qualifier, expr: variant }
        }

        return { id: this.getId(variantCtx), kind: 'def', name: fieldName, qualifier, typeAnnotation, expr }
      }
    )

    this.declarationStack.push(def, ...constructors)
  }

  exitTypeSumVariant(ctx: p.TypeSumVariantContext) {
    const fieldName = ctx._sumLabel!.text!
    const poppedType = this.popType().value
    // Check if we have an accompanying type, and if not, then synthesize the
    // unit type.
    //
    // I.e., we interpret a variant `A` as `A({})`.
    const fieldType: QuintType = poppedType ? poppedType : unitType(this.getId(ctx))
    this.variantStack.push({ fieldName, fieldType })
  }

  private checkForUndeclaredTypeVariables(id: bigint, typeDef: QuintTypeDef) {
    if (!typeDef.type) {
      return
    }

    const typeVars = typeNames(typeDef.type)
    const undeclaredTypeVariables: string[] =
      // We are just checking if the type variables appearing in `type` are a subset of the type params
      // but our version of node has no sensible set operations?
      [...typeVars.typeVariables, ...typeVars.rowVariables].filter(v => !(typeDef.params ?? []).includes(v))

    if (undeclaredTypeVariables.length > 0) {
      this.errors.push(undeclaredTypeParamsError(id, undeclaredTypeVariables))
    }
  }

  // module Foo = Proto(x = a, y = b)
  // module Foo = Proto(x = a, y = b) from "<path>"
  exitInstanceMod(ctx: p.InstanceModContext) {
    const protoName = ctx.moduleName().text
    const qualifiedName = ctx.qualifiedName()?.text
    const names = ctx.name()!
    const nexprs = ctx.expr().length
    const overrides: [QuintLambdaParameter, QuintEx][] = []
    // slice <path> from the quoted string "<path>", if the path is present
    const fromSource = ctx.fromSource() ? ctx.fromSource()!.text.slice(1, -1) : undefined
    if (nexprs > 0) {
      const exprs = popMany(this.exprStack, nexprs, this.undefinedExpr(ctx))
      for (let i = 0; i < nexprs; i++) {
        const id = this.getId(names[i])
        const name = names[i].text
        overrides.push([{ id, name }, exprs[i]])
      }
    }
    const identityOverride = ctx.MUL() !== undefined

    const id = this.getId(ctx)
    const instance: QuintDeclaration = {
      id,
      kind: 'instance',
      qualifiedName: qualifiedName,
      protoName,
      overrides,
      identityOverride,
      fromSource,
    }
    this.declarationStack.push(instance)
  }

  /** ******************* translate expressions **************************/

  // an identifier or a literal, e.g., foo, 42, "hello", false
  exitLiteralOrId(ctx: p.LiteralOrIdContext) {
    const ident = ctx.qualId()

    const id = this.getId(ctx)
    if (ident) {
      // identifier
      this.exprStack.push({
        id,
        kind: 'name',
        name: ident.text,
      })
    }
    const intNode = ctx.INT()
    if (intNode) {
      // integer literal
      this.exprStack.push({
        id,
        kind: 'int',
        value: BigInt(intNode.text.replaceAll('_', '')),
      })
    }
    const boolNode = ctx.BOOL()
    if (boolNode) {
      // Boolean literal
      this.exprStack.push({
        id,
        kind: 'bool',
        value: boolNode.text === 'true',
      })
    }
    const strNode = ctx.STRING()
    if (strNode) {
      // string, remove the quotes!
      this.exprStack.push({
        id,
        kind: 'str',
        value: strNode.text.slice(1, -1),
      })
    }
  }

  // list access, e.g., f[10]
  exitListApp(ctx: any) {
    this.pushApplication(ctx, 'nth', popMany(this.exprStack, 2, this.undefinedExpr(ctx)))
  }

  // operator application in the normal form, e.g., MyOper("foo", 42)
  exitOperApp(ctx: p.OperAppContext) {
    const name = ctx.normalCallName().text
    let args: QuintEx[] = []
    if (ctx.argList()) {
      // this operator has at least one argument
      const wrappedArgs = this.exprStack.pop() ?? this.undefinedExpr(ctx)()

      if (wrappedArgs.kind !== 'app' || wrappedArgs.opcode !== 'wrappedArgs') {
        // the wrapped arguments should be an application
        // see exitArgList()
        console.debug(`[DEBUG] unexpected arguments found in arg list from: ${ctx.text}`)
        return
      }

      args = wrappedArgs.args
    } // else no arguments, e.g., set(), list()

    this.pushApplication(ctx, name, args)
  }

  // operator application via dot, e.g., S.union(T)
  exitDotCall(ctx: p.DotCallContext) {
    // pop: the first argument, operator name, the rest of arguments (wrapped)
    const wrappedArgs = ctx.argList() ? this.exprStack.pop() ?? this.undefinedExpr(ctx)() : undefined
    const name = ctx.nameAfterDot().text
    const callee = this.exprStack.pop() ?? this.undefinedExpr(ctx)()
    const hasParen = ctx.LPAREN()
    if (hasParen) {
      // the UFCS form e_1.f(e_2, ..., e_n)
      let args: QuintEx[] = []
      if (wrappedArgs) {
        // n >= 2: there is at least one argument in parentheses
        if (wrappedArgs.kind !== 'app' || wrappedArgs.opcode !== 'wrappedArgs') {
          // the wrapped arguments should be an application
          // see exitArgList()
          console.debug(`[DEBUG] unexpected arguments found in arg list from: ${ctx.text}`)
          return
        }

        args = [callee!].concat(wrappedArgs.args)
      } else {
        // no arguments, as in e.g., s.head()
        args = [callee!]
      }
      // apply the operator to the arguments
      this.pushApplication(ctx, name, args)
    } else {
      // accessing a tuple element, a record field, or name in a module
      const id = this.getId(ctx)
      const m = name.match(/^_([1-9][0-9]?)$/)
      if (m) {
        // accessing a tuple element via _1, _2, _3, etc.
        const idx: QuintEx = {
          id,
          kind: 'int',
          value: BigInt(m[1]),
        }

        this.pushApplication(ctx, 'item', [callee!, idx])
      } else {
        const field: QuintEx = {
          id,
          kind: 'str',
          value: name,
        }
        this.pushApplication(ctx, 'field', [callee!, field])
      }
    }
  }

  // a list of arguments
  exitArgList(ctx: p.ArgListContext) {
    const nargs = ctx.expr().length
    const args = popMany(this.exprStack, nargs, this.undefinedExpr(ctx))
    // wrap the arguments with a temporary operator,
    // to be unwrapped later
    this.exprStack.push({
      id: 0n,
      kind: 'app',
      opcode: 'wrappedArgs',
      args,
    })
  }

  // a lambda operator over multiple parameters
  exitLambdaUnsugared(ctx: p.LambdaUnsugaredContext) {
    const expr = this.exprStack.pop() ?? this.undefinedExpr(ctx)()
    const params = popMany(this.paramStack, ctx.parameter().length, this.undefinedParam(ctx))
    const id = this.getId(ctx)
    this.exprStack.push({
      id,
      kind: 'lambda',
      params: params,
      qualifier: 'def',
      expr,
    })
  }

  // a lambda operator over a single tuple parameter,
  // unpacked into named fields
  exitLambdaTupleSugar(ctx: p.LambdaTupleSugarContext) {
    const expr = this.exprStack.pop() ?? this.undefinedExpr(ctx)()
    const params = popMany(this.paramStack, ctx.parameter().length, this.undefinedParam(ctx))

    const id = this.getId(ctx)
    // a fresh parameter to substitute for the tupled parameters
    const freshLambdaParam = { id, name: `quintTupledLambdaParam${id}` }
    const letBindingForTupleParams = params.reduce(this.letBindingForTupleParam(ctx, freshLambdaParam), expr)
    const untupledLambda: QuintEx = {
      id: this.getId(ctx),
      kind: 'lambda',
      params: [freshLambdaParam],
      qualifier: 'def',
      expr: letBindingForTupleParams,
    }
    this.exprStack.push(untupledLambda)
  }

  exitParameter(ctx: p.ParameterContext) {
    const name = ctx._paramName.text
    const id = this.getId(ctx)
    this.paramStack.push({ id, name })
  }

  // TODO Consolidate with `exitParameter`, see https://github.com/informalsystems/quint/issues/923
  exitAnnotatedParameter(ctx: p.AnnotatedParameterContext) {
    const name = ctx._paramName.text
    const id = this.getId(ctx)
    const typeAnnotation = this.popType().unwrap(() =>
      fail('internal error: the grammar guarantees a type should be on the stack')
    )
    this.paramStack.push({ id, name, typeAnnotation })
  }

  // an identifier or star '*' in import
  exitIdentOrStar(ctx: p.IdentOrStarContext) {
    if (ctx.text === '*') {
      // a hole '_'
      this.identOrStarStack.push('*')
    } else {
      // a variable name
      this.identOrStarStack.push(ctx.qualId()!.text)
    }
  }

  // tuple constructor, e.g., (1, 2, 3)
  exitTuple(ctx: p.TupleContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))

    this.pushApplication(ctx, 'Tup', args)
  }

  // The unit, (), represented by the empty tuple
  exitUnit(ctx: p.UnitContext) {
    this.exprStack.push(unitValue(this.getId(ctx)))
  }

  // pair constructor, e.g., 2 -> 3
  exitPair(ctx: p.PairContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'Tup', args)
  }

  // list constructor, e.g., [1, 2, 3]
  exitList(ctx: p.ListContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'List', args)
  }

  // field: expr, or ...record
  exitRecElem(ctx: p.RecElemContext) {
    const expr = this.exprStack.pop()!
    // Wrap a pair 'field: expr' or a singleton 'record' into a tuple,
    // so we would be able to extract them in `exitRecord`.
    // The tuple here is a temporary container and nothing else.
    // Hence, we do not even need a unique id for it.
    if (ctx.simpleId()) {
      // field: expr
      const id = this.getId(ctx)
      const nameEx: QuintEx = {
        id,
        kind: 'str',
        value: ctx.simpleId()?.text!,
      }
      this.exprStack.push({
        id: 0n,
        kind: 'app',
        opcode: 'Tup',
        args: [nameEx, expr],
      })
    } else {
      // ...expr
      this.exprStack.push({
        id: 0n,
        kind: 'app',
        opcode: 'Tup',
        args: [expr],
      })
    }
  }

  // record constructor, e.g., { name: "igor", year: 2021 }
  exitRecord(ctx: p.RecordContext) {
    const elems = popMany(this.exprStack, ctx.recElem().length, this.undefinedExpr(ctx))
    const spreads = elems.filter(e => e.kind === 'app' && e.args.length === 1)
    const pairs = elems.map(e => (e.kind === 'app' && e.args.length === 2 ? e.args : [])).filter(es => es.length > 0)

    if (spreads.length === 0) {
      // { field1: value1, field2: value2 }
      this.pushApplication(ctx, 'Rec', pairs.flat())
    } else if (spreads.length > 1) {
      // error
      const id = this.getId(ctx)
      this.errors.push(tooManySpreadsError(id))
    } else {
      // { ...record, field1: value1, field2: value2 }
      // translate to record.with("field1", value1).with("field2", value2)
      let record: QuintEx = (spreads[0] as QuintApp).args[0]
      for (const p of pairs) {
        const id = this.getId(ctx)
        record = {
          id,
          kind: 'app',
          opcode: 'with',
          args: [record, ...p],
        }
      }
      this.exprStack.push(record)
    }
  }

  // '+' or '-'
  exitPlusMinus(ctx: p.PlusMinusContext) {
    const opcode = ctx.PLUS() !== undefined ? 'iadd' : 'isub'
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, opcode, args)
  }

  // '*', '/', or '%'
  exitMultDiv(ctx: p.MultDivContext) {
    const op = ctx._op
    if (op) {
      let opcode = ''
      switch (op.type) {
        case p.QuintParser.MUL:
          opcode = 'imul'
          break
        case p.QuintParser.DIV:
          opcode = 'idiv'
          break
        case p.QuintParser.MOD:
          opcode = 'imod'
          break
      }
      const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
      this.pushApplication(ctx, opcode, args)
    }
  }

  // integer power, e.g., x^y
  exitPow(ctx: any) {
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'ipow', args)
  }

  // unary minus, e.g., -x
  exitUminus(ctx: any) {
    const arg = this.exprStack.pop()
    if (arg) {
      this.pushApplication(ctx, 'iuminus', [arg])
    }
  }

  // x' = e
  exitAsgn(ctx: p.AsgnContext) {
    const id = this.getId(ctx)

    const lhs: QuintName = {
      id,
      kind: 'name',
      name: ctx.qualId().text,
    }
    const [rhs] = popMany(this.exprStack, 1, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'assign', [lhs, rhs])
  }

  // GT | LT | GE | LE | NE | EQ
  exitRelations(ctx: p.RelationsContext) {
    const op = ctx._op
    if (op) {
      let opcode = ''
      switch (op.type) {
        case p.QuintParser.GT:
          opcode = 'igt'
          break
        case p.QuintParser.GE:
          opcode = 'igte'
          break
        case p.QuintParser.LT:
          opcode = 'ilt'
          break
        case p.QuintParser.LE:
          opcode = 'ilte'
          break
        case p.QuintParser.EQ:
          opcode = 'eq'
          break
        case p.QuintParser.NE:
          opcode = 'neq'
          break
      }
      const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
      this.pushApplication(ctx, opcode, args)
    }
  }

  exitErrorEq(ctx: p.ErrorEqContext) {
    // An error was already reported. We push a valid expression to recover from the error
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'eq', args)
  }

  // p and q
  exitAnd(ctx: any) {
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'and', args)
  }

  // p or q
  exitOr(ctx: any) {
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'or', args)
  }

  // p implies q
  exitImplies(ctx: any) {
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'implies', args)
  }

  // p iff q
  exitIff(ctx: any) {
    const args = popMany(this.exprStack, 2, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'iff', args)
  }

  // and { p, q, r }
  exitAndExpr(ctx: p.AndExprContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'and', args)
  }

  // or { p, q, r }
  exitOrExpr(ctx: p.OrExprContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'or', args)
  }

  // all { p, q, r }
  exitActionAll(ctx: p.ActionAllContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'actionAll', args)
  }

  // any { p, q, r }
  exitActionAny(ctx: p.ActionAnyContext) {
    const args = popMany(this.exprStack, ctx.expr().length, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'actionAny', args)
  }

  // if (p) e1 else e2
  exitIfElse(ctx: p.IfElseContext) {
    const args = popMany(this.exprStack, 3, this.undefinedExpr(ctx))
    this.pushApplication(ctx, 'ite', args)
  }

  // match expr {
  //    | Variant1(var1) => expr1
  //    | Variantk(_) => exprk    // a hole in the payload
  //    | ...
  //    | Variantn(varn) => exprn
  //    | _ => exprm              // A wildcard match, acting as a catchall
  // }
  //
  // The above is represented in the UFC using an exotic `matchVariant` operator of the form
  //
  // matchVariant(epxr, label1, (var1) => expr1, ..., labeln, (varn) => exprn, "_", (_) => exprm)
  exitMatchSumExpr(ctx: p.MatchSumExprContext) {
    const matchId = this.getId(ctx)

    // We will have one expression for the matched expression, plus one for each elimination case
    const exprs = popMany(this.exprStack, ctx._matchCase.length + 1, this.undefinedExpr(ctx))

    // The first expression is the one we are matching on
    // the syntax rules ensure that at least this expression is given
    const expr = exprs.shift()!

    // after shifting off the match expr, the remaing exprs are the cases of the match expression
    const cases: (QuintStr | QuintLambda)[] = zip(exprs, ctx._matchCase).reduce(
      (acc: (QuintStr | QuintLambda)[], matchCase: [QuintEx, p.MatchSumCaseContext]) =>
        acc.concat(this.formMatchCase(matchCase)),
      []
    )
    const matchExpr: QuintBuiltinApp = {
      id: matchId,
      kind: 'app',
      opcode: 'matchVariant',
      args: [expr].concat(cases),
    }
    this.exprStack.push(matchExpr)
  }

  // A helper for forming match expressions
  //
  // For a single case parsed `matchCase`, we form the pair of the variant label
  // and the lambda that will eliminate the value carried by the variant.
  //
  // E.g., `A(x) => <expr>` becomes `["A", (x) => <expr>]`
  private formMatchCase([caseExpr, caseCtx]: [QuintEx, p.MatchSumCaseContext]): (QuintStr | QuintLambda)[] {
    const labelId = this.getId(caseCtx)
    const elimId = this.getId(caseCtx)
    const variantMatch = caseCtx._variantMatch

    // If there is not a variant param, then we have one of two things
    //
    // - a wildcard case, `_ => foo`
    // - a hole in the paramater position, `Foo(_) => bar`
    const name = variantMatch && variantMatch._variantParam ? variantMatch._variantParam.text : '_'
    const params = [{ name, id: this.getId(caseCtx) }]

    // If there is not a variant label, then we have a wildcard case
    const label = variantMatch ? variantMatch._variantLabel.text : '_'
    const labelStr: QuintStr = { id: labelId, kind: 'str', value: label }

    const elim: QuintLambda = { id: elimId, kind: 'lambda', qualifier: 'def', expr: caseExpr, params }
    return [labelStr, elim]
  }

  /** ******************* translate types ********************************/

  // the integer type, that is, int
  exitTypeInt(ctx: p.TypeIntContext) {
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'int' })
  }

  // the Boolean type, that is, bool
  exitTypeBool(ctx: p.TypeBoolContext) {
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'bool' })
  }

  // the string type, that is, str
  exitTypeStr(ctx: p.TypeStrContext) {
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'str' })
  }

  exitTypeVar(ctx: p.TypeVarContext) {
    const name = ctx.LOW_ID().text
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'var', name })
  }

  // a type variable, a type constant, or a reference to a type alias
  exitTypeConst(ctx: p.TypeConstContext) {
    const name = ctx.qualId().text
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'const', name })
  }

  // E.g., Result[int, str]
  exitTypeApp(ctx: p.TypeAppContext) {
    this.processTypeApp(ctx, ctx.typeApplication()._typeCtor.text, ctx.typeApplication().typeArgs()._typeArg)
  }

  exitWrongTypeApp(ctx: p.WrongTypeAppContext) {
    this.processTypeApp(ctx, ctx.wrongTypeApplication()._typeCtor.text, ctx.wrongTypeApplication().typeArgs()._typeArg)
  }

  private processTypeApp(ctx: ParserRuleContext, name: string, types: ParserRuleContext[]) {
    const id = this.getId(ctx)
    const args = types
      .map(_ =>
        // We require that there is one parsed type for each typeArg recorded
        this.popType().unwrap()
      ) // The stack stores the arguments in reverse order
      .reverse()
    // The next type on the stack after the args should be the applied
    // type constructor
    const ctor: QuintConstType = { id: this.getId(ctx), kind: 'const', name }

    // Check for Map[a, b] syntax
    if (ctor.name === 'Map' && args.length === 2) {
      // Extract the key and value type names
      const keyType = typeToString(args[0])
      const valueType = typeToString(args[1])

      // Add error with fix suggestion
      this.errors.push(mapSyntaxError(id, keyType, valueType))

      // Create a function type instead (which is the correct representation for maps)
      const funType: QuintType = { id, kind: 'fun', arg: args[0], res: args[1] }
      this.typeStack.push(funType)
    } else {
      const typeApp: QuintAppType = { id, kind: 'app', ctor, args }
      this.typeStack.push(typeApp)
    }
  }

  // TODO: replace with general type application
  // a set type, e.g., set(int)
  exitTypeSet(ctx: p.TypeSetContext) {
    const last = this.popType().unwrap()
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'set', elem: last })
  }

  // TODO: replace with general type application
  // a list type, e.g., list(int)
  exitTypeList(ctx: p.TypeListContext) {
    const top = this.popType().unwrap()
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'list', elem: top })
  }

  // A function type, e.g., str => int
  exitTypeFun(ctx: p.TypeFunContext) {
    const res = this.popType().unwrap()
    const arg = this.popType().unwrap()
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'fun', arg, res })
  }

  // The unit type
  exitTypeUnit(ctx: p.TypeUnitContext) {
    const id = this.getId(ctx)

    this.typeStack.push({
      id: id,
      kind: 'tup',
      fields: { kind: 'empty' },
    })
  }

  // A tuple type, e.g., (int, bool)
  // the type stack contains the types of the elements
  exitTypeTuple(ctx: p.TypeTupleContext) {
    const elemTypes: QuintType[] = popMany(this.typeStack, ctx.type().length, this.undefinedType(ctx))
    const id = this.getId(ctx)

    const fields = elemTypes.map((t, i) => ({ fieldName: `${i}`, fieldType: t }))
    this.typeStack.push({
      id: id,
      kind: 'tup',
      fields: { kind: 'row', fields: fields, other: { kind: 'empty' } },
    })
  }

  exitRow(ctx: p.RowContext) {
    const names = ctx.rowLabel().map(n => n.text)
    const elemTypes: QuintType[] = popMany(this.typeStack, ctx.type().length, this.undefinedType(ctx))

    const fields = compact(
      zipWith(names, elemTypes, (name, elemType) => {
        if (name !== undefined && elemType !== undefined) {
          return { fieldName: name, fieldType: elemType }
        } else {
          return undefined
        }
      })
    )

    let other: Row = ctx._rowVar! ? { kind: 'var', name: ctx._rowVar!.text! } : { kind: 'empty' }

    const row: Row = { kind: 'row', fields, other }
    this.rowStack.push(row)
  }

  // A record type, e.g.,
  // { name: str, year: int }
  // The row stack contains the row with the types of the fields.
  exitTypeRec(ctx: p.TypeRecContext) {
    const row = this.popRow()
    const id = this.getId(ctx)
    this.typeStack.push({ id, kind: 'rec', fields: row })
  }

  // an operator type, e.g., (int, str) => bool
  exitTypeOper(ctx: p.TypeOperContext) {
    const resType = this.popType().unwrap()
    const nargs = ctx.type().length - 1
    const argTypes: QuintType[] = popMany(this.typeStack, nargs, this.undefinedType(ctx))
    const id = this.getId(ctx)
    this.typeStack.push({
      id,
      kind: 'oper',
      args: argTypes,
      res: resType,
    })
  }

  exitDocumentedDeclaration(ctx: p.DocumentedDeclarationContext) {
    const doc = getDocText(ctx.DOCCOMMENT())

    if (doc) {
      // Pop last declaration and re-push it with the doc
      const decl = this.declarationStack.pop()!
      this.declarationStack.push({ doc, ...decl })
    }
  }

  // Generate an id and add it to the sourceMap
  private getId(ctx: ParserRuleContext): bigint {
    const id = this.idGen.nextId()
    this.sourceMap.set(id, this.loc(ctx))
    return id
  }

  private loc(ctx: ParserRuleContext): Loc {
    if (ctx.stop) {
      // Try to use index. If not available, use column instead.
      // This is what works best with the information provided by the parser
      const endCol =
        ctx.stop.stopIndex !== 0
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
  private pushApplication(ctx: any, name: string, args: QuintEx[]) {
    const id = this.getId(ctx)

    // Special handling for q::debug with a single argument
    if (name === 'q::debug' && args.length === 1) {
      // Get the expression text from the context
      const expressionText = ctx.text

      // Create a string literal with the expression text
      const expressionStrLiteral: QuintStr = {
        id: this.idGen.nextId(),
        kind: 'str',
        value: expressionText,
      }

      // Create the application with two arguments: the expression text and the original argument
      this.exprStack.push({
        id,
        kind: 'app',
        opcode: name,
        args: [expressionStrLiteral, args[0]],
      })
      return
    }

    this.exprStack.push({
      id,
      kind: 'app',
      opcode: name,
      args,
    })
  }

  // pop a type
  private popType(): Maybe<QuintType> {
    // the user has specified a type
    const tp = this.typeStack.pop()
    return tp ? just(tp) : none()
  }

  // pop a row
  private popRow(): Row {
    // the user has specified a row
    return this.rowStack.pop() ?? { kind: 'empty' }
  }

  private undefinedExpr(ctx: any): () => QuintEx {
    return () => {
      console.debug(`[DEBUG] generating undefined expr to fill hole in: ${ctx.text}`)
      const name = '__undefinedExprGenerated'

      // This is our undefined expr:
      // val __undefinedExprGenerated = true; __undefinedExprGenerated }
      // It doesn't cause any name resolution issues while still being easy to spot while debugging
      return {
        id: this.getId(ctx),
        kind: 'let',
        opdef: {
          id: this.getId(ctx),
          kind: 'def',
          qualifier: 'val',
          name,
          expr: { id: this.getId(ctx), kind: 'bool', value: true },
        },
        expr: { id: this.getId(ctx), kind: 'name', name },
      }
    }
  }

  private undefinedDeclaration(ctx: any): () => QuintDeclaration {
    return () => {
      console.debug(`[DEBUG] generating undefined declaration to fill hole in: ${ctx.text}`)
      const id = this.getId(ctx)
      return { id, kind: 'assume', name: `_undefinedDeclaration${id}`, assumption: this.undefinedExpr(ctx)() }
    }
  }

  private undefinedParam(ctx: any): () => QuintLambdaParameter {
    return () => {
      console.debug(`[DEBUG] generating undefined parameter to fill hole in: ${ctx.text}`)
      const id = this.getId(ctx)
      return { id, name: `__undefinedParam${id}` }
    }
  }

  private undefinedType(ctx: any): () => QuintType {
    return () => {
      console.debug(`[DEBUG] generating undefined type to fill hole in: ${ctx.text}`)
      const id = this.getId(ctx)
      return { id, kind: 'var', name: 'undefinedType' }
    }
  }

  private undefinedVariant(ctx: any): () => RowField {
    return () => {
      console.debug(`[DEBUG] generating undefined variant to fill hole in: ${ctx.text}`)
      return { fieldName: `__undefinedField`, fieldType: this.undefinedType(ctx)() }
    }
  }

  /**
   * Return a function that takes a QuintEx `body`, a QuintLambdaParameter `param`,
   * and the parameter's `index` and returns a let-in definition of the form
   * `let ${param.name} = ${freshParam.name}._${index} ; body`.
   *
   * Intended use: Reduce tupled Quint lambda parameters into an equivalent let-in
   * form ("tuple unboxing"). For example, `((a, b)) => body` can be reduced to
   * `freshParam => let a = freshParam._1; let b = freshParam._2; body`.
   *
   * @param ctx         parser context of the tuple-sugared lambda
   * @param freshParam  a fresh QuintLambdaParameter to substitute for the tupled parameters
   */
  private letBindingForTupleParam(ctx: p.LambdaTupleSugarContext, freshParam: QuintLambdaParameter) {
    return (body: QuintEx, param: QuintLambdaParameter, index: number): QuintLet => {
      return {
        id: this.getId(ctx),
        kind: 'let',
        opdef: {
          id: param.id,
          kind: 'def',
          name: param.name,
          qualifier: 'pureval',
          expr: {
            id: this.getId(ctx),
            kind: 'app',
            opcode: 'item',
            args: [
              { id: this.getId(ctx), kind: 'name', name: freshParam.name },
              { id: this.getId(ctx), kind: 'int', value: BigInt(index + 1) },
            ],
          },
        },
        expr: body,
      }
    }
  }

  private checkForUppercaseTypeName(id: bigint, qualifiedName: string) {
    const parts = qualifiedName.split('::')
    const unqualifiedName = parts.pop()!

    if (unqualifiedName[0].match('[a-z]')) {
      this.errors.push(lowercaseTypeError(id, unqualifiedName, parts))
    }
  }
}

function popMany<T>(stack: T[], n: number, defaultGen: () => T): T[] {
  if (n === 0) {
    // Special case since splice(-0) returns the whole array
    return []
  }
  if (stack.length < n) {
    // Not enough elements in the stack, push default ones.
    times(n - stack.length, () => stack.push(defaultGen()))
  }

  return stack.splice(-n)
}

/* The comment content is the text of the comment minus the `/// ` prefix */
function getDocText(doc: TerminalNode[]): string {
  return doc.map(l => l.text.slice(4, -1)).join('\n')
}

// Helper to construct an empty record (the unit value)
function unitValue(id: bigint): QuintBuiltinApp {
  return {
    id,
    kind: 'app',
    opcode: 'Tup',
    args: [],
  }
}

function popOrFail<T>(stack: T[], msg: string): T {
  const x = stack.pop()
  if (typeof x === 'undefined') {
    fail(`internal error: violated grammar guarantee ${msg}`)
  }
  return x
}
