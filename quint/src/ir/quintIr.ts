/*
 * Intermediate representation of Quint. It almost mirrors the IR of Apalache,
 * which assumes that module instances are flattened. Quint extends the Apalache IR
 * by supporting hierarchical modules and instances.
 *
 * Igor Konnov, Gabriela Moreira, Shon Feder, 2021-2023
 *
 * Copyright 2021-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { QuintType } from './quintTypes'

/**
 * Quint expressions, declarations and types carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
export interface WithId {
  id: bigint
}

/**
 * Quint expressions and declarations carry an optional type tag.
 * If a type tag is missing, it means that the type has not been computed yet.
 */
interface WithOptionalTypeAnnotation {
  typeAnnotation?: QuintType
}

/**
 * Some declarations require a type tag.
 */
interface WithTypeAnnotation {
  typeAnnotation: QuintType
}

export interface WithOptionalDoc {
  /** optionally, docstrings for the operator */
  doc?: string
}

/**
 * Operator qualifier, which refines a mode:
 *
 *  - val: an expression over constants and state variables (when impure),
 *
 *  - def: a parameterized expression over constants, state variables
 *    (when impure),
 *    and definition parameters. When the defined expression produces a Boolean
 *    value, you should use `pred` instead. However, this is only a convention,
 *    not a requirement.
 *
 *  - nondet: a non-parameterized binding,
 *    state variables, and definition parameters. This expression must contain
 *    at least one assignment or an action operator.
 *
 *  - action: a (possibly parameterized) expression over constants,
 *    state variables, and definition parameters. This expression must contain
 *    at least one assignment or an action operator.
 *
 *  - temporal: a (possibly parameterized) expression over constants,
 *    state variables, and definition parameters. This expression must contain
 *    at least one temporal operator.
 *
 * A qualifier is purely a language feature that we introduced for convenience.
 * Given an operator definition, we can compute its qualifier automatically.
 * However, it is often hard for the specification reader to figure out the
 * TLA+ level of an expression. So we optimize specifications for the reader
 * by requiring an explicit qualifier.
 */
export type OpQualifier = 'pureval' | 'puredef' | 'val' | 'def' | 'nondet' | 'action' | 'run' | 'temporal'

export interface QuintName extends WithId {
  /** Expressions kind ('name' -- name reference) */
  kind: 'name'
  /** A name of: a variable, constant, parameter, user-defined operator */
  name: string
}

export interface QuintBool extends WithId {
  /** Expressions kind ('bool' -- a boolean literal) */
  kind: 'bool'
  /** The boolean literal value */
  value: boolean
}

export interface QuintInt extends WithId {
  /** Expressions kind ('int' -- an integer literal) */
  kind: 'int'
  /** The integer literal value */
  value: bigint
}

export interface QuintStr extends WithId {
  /** Expressions kind ('str' -- a string literal) */
  kind: 'str'
  /** The string literal value */
  value: string
}

export interface QuintApp extends WithId {
  /** Expressions kind ('app' -- operator application) */
  kind: 'app'
  /** The name of the operator being applied */
  opcode: string
  /** A list of arguments to the operator */
  args: QuintEx[]
}

/** A subtype of `QuintApp` covering all quint builtin operators */
export interface QuintBuiltinApp extends QuintApp {
  /** The name of the builtin being applied */
  opcode: QuintBuiltinOpcode
}

/** A type guard to narrow the type of a `QuintApp` to a `QuintBuiltinApp`
 *
 * See https://stackoverflow.com/a/61129291
 */
export function isQuintBuiltin(app: QuintApp): app is QuintBuiltinApp {
  return builtinOpCodes.includes(app.opcode as QuintBuiltinOpcode)
}

// This should be the source of truth for all builtin opcodes
export const builtinOpCodes = [
  'List',
  'Map',
  'Rec',
  'Set',
  'Tup',
  'actionAll',
  'actionAny',
  'allLists',
  'allListsUpTo',
  'always',
  'and',
  'append',
  'assert',
  'expect',
  'assign',
  'chooseSome',
  'concat',
  'contains',
  'enabled',
  'eq',
  'eventually',
  'exclude',
  'exists',
  'fail',
  'field',
  'fieldNames',
  'filter',
  'flatten',
  'fold',
  'foldl',
  'foldr',
  'forall',
  'get',
  'head',
  'iadd',
  'idiv',
  'iff',
  'igt',
  'igte',
  'ilt',
  'ilte',
  'imod',
  'implies',
  'imul',
  'in',
  'indices',
  'intersect',
  'ipow',
  'isFinite',
  'isub',
  'ite',
  'item',
  'iuminus',
  'keys',
  'length',
  'map',
  'mapBy',
  'matchVariant',
  'mustChange',
  'neq',
  'next',
  'not',
  'nth',
  'oneOf',
  'or',
  'orKeep',
  'powerset',
  'put',
  'q::test',
  'q::testOnce',
  'q::debug',
  'range',
  'replaceAt',
  'reps',
  'select',
  'set',
  'setBy',
  'setOfMaps',
  'setToMap',
  'size',
  'slice',
  'strongFair',
  'subseteq',
  'tail',
  'then',
  'to',
  'tuples',
  'union',
  'variant',
  'weakFair',
  'with',
] as const

export type QuintBuiltinOpcode = (typeof builtinOpCodes)[number]

export interface QuintLambdaParameter extends WithId, WithOptionalTypeAnnotation {
  /** The name of the formal parameter */
  name: string
}

export interface QuintLambda extends WithId {
  /** Expressions kind ('lambda' -- operator abstraction) */
  kind: 'lambda'
  /** The formal parameters */
  params: QuintLambdaParameter[]
  /** The qualifier for the defined operator */
  qualifier: OpQualifier
  /** The definition body */
  expr: QuintEx
}

export interface QuintLet extends WithId {
  /** Expressions kind ('let' -- a let-in binding defined via 'def', 'val', etc.) */
  kind: 'let'
  /** The operator being defined to be used in the body */
  opdef: QuintOpDef
  /** The body */
  expr: QuintEx
}

/**
 * Discriminated union of Quint expressions.
 */
export type QuintEx = QuintName | QuintBool | QuintInt | QuintStr | QuintApp | QuintLambda | QuintLet

/**
 * A user-defined operator that is defined via one of the qualifiers:
 * val, def, pred, action, or temporal.
 * Note that QuintOpDef does not have any formal parameters.
 * If an operator definition has formal parameters, then `expr`
 * should be a lambda expression over those parameters.
 */
export interface QuintOpDef extends WithId, WithOptionalTypeAnnotation, WithOptionalDoc {
  /** definition kind ('def' -- operator definition) */
  kind: 'def'
  /** definition name */
  name: string
  /** definition qualifier: 'val', 'def', 'action', 'temporal' */
  qualifier: OpQualifier
  /** expression to be associated with the definition */
  expr: QuintEx
}

export interface QuintConst extends WithId, WithTypeAnnotation {
  /** definition kind ('const') */
  kind: 'const'
  /** name of the constant */
  name: string
}

export interface QuintVar extends WithId, WithTypeAnnotation {
  /** definition kind ('var') */
  kind: 'var'
  /** name of the variable */
  name: string
}

export interface QuintAssume extends WithId {
  /** definition kind ('assume') */
  kind: 'assume'
  /** name of the assumption, may be '_' */
  name: string
  /** an expression to associate with the name */
  assumption: QuintEx
}

/** QuintTypeDefs represent declared type constructors and abstract types
 *
 * - Abstract types do not have an associated `type`
 * - Type constructors aliases have an associated `type` and `n >= 0` type parameters
 */
export interface QuintTypeDef extends WithId {
  /** definition kind ('typedef') */
  kind: 'typedef'
  /** name of a type alias */
  name: string
  /** type variables
   *
   *  `typeof params === 'undefined'` is taken to mean the same as `params.length === 0` */
  params?: string[]
  /** type to associate with the alias (none for uninterpreted type) */
  type?: QuintType
}

/** A QuintTypeAlias is a sub-type of QuintTypeDef which always has an associated type */
export interface QuintTypeAlias extends QuintTypeDef {
  /** type to associate with the alias (none for uninterpreted type) */
  type: QuintType
}

export function isTypeAlias(def: any): def is QuintTypeAlias {
  return def.kind === 'typedef' && def.type
}

export interface QuintImport extends WithId {
  /** definition kind ('import') */
  kind: 'import'
  /** path to the module, e.g., Foo in import Foo.* */
  protoName: string
  /** name to import, or '*' to denote all. Undefined when a qualifier is present. */
  defName?: string
  /** a qualifier, e.g. F in import Foo as F */
  qualifiedName?: string
  /**
   * An optional string that specifies the source of the import, e.g., a filename.
   * If the source is not specified, then the definitions are imported from the same
   * source, where the 'import' definition is met.
   */
  fromSource?: string
}

export interface QuintExport extends WithId {
  /** definition kind ('export') */
  kind: 'export'
  /** path to the module, e.g., Foo in import Foo.* */
  protoName: string
  /** name to import, or '*' to denote all. Undefined when a qualifier is present. */
  defName?: string
  /** a qualifier, e.g. F in import Foo as F */
  qualifiedName?: string
}

export interface QuintInstance extends WithId {
  /** definition kind ('instance') */
  kind: 'instance'
  /** instance name */
  qualifiedName?: string
  /** the name of the module to instantiate */
  protoName: string
  /** how to override constants and variables */
  overrides: [QuintLambdaParameter, QuintEx][]
  /** whether to use identity substitution on missing names */
  identityOverride: boolean
  /**
   * An optional string that specifies the source of the import, e.g., a filename.
   * If the source is not specified, then the definitions are imported from the same
   * source, where the 'import' definition is met.
   */
  fromSource?: string
}

/**
 * A declaration is a top-level construct in a module, including definitions,
 * imports, exports, and instances.
 */
export type QuintDeclaration = (QuintDef | QuintImport | QuintExport | QuintInstance) & WithOptionalDoc

/**
 * Module definition.
 */
export interface QuintModule extends WithId {
  /** The name of the module. */
  name: string
  /** The declarations in the module. */
  declarations: QuintDeclaration[]
  /** Optional documentation for the module. */
  doc?: string
}

/**
 * A QuintDef is a sub-type of QuintDeclaration which represents a definition.
 * A definition can be a constant, state variable, operator definition, assumption, or type definition.
 */
export type QuintDef = (QuintOpDef | QuintConst | QuintVar | QuintAssume | QuintTypeDef) & WithOptionalDoc

/**
 * Checks if a definition has a type annotation.
 *
 * @param def The definition to check.
 *
 * @returns True if the definition has a type annotation, false otherwise.
 */
export function isAnnotatedDef(def: any): def is WithTypeAnnotation {
  return def.typeAnnotation !== undefined
}

/**
 * A FlatModule represents a module with only definitions in its declarations.
 * That is, no imports, exports or instances.
 */
export interface FlatModule extends WithId {
  /** The name of the module. */
  name: string
  /** The declarations in the module, which are always definitions. */
  declarations: QuintDef[]
  /** Optional documentation for the module. */
  doc?: string
}

/**
 * Checks if a Declaration is a QuintDef, that is, it is not an import, an export, or an instance.
 * Useful because all QuintDefs have a `name` field, so we can use this to narrow the type.
 *
 * @param decl The Declaration to check.
 *
 * @returns True if the Declaration is a QuintDef, false otherwise.
 */
export function isDef(decl: QuintDeclaration): decl is QuintDef {
  return decl.kind !== 'instance' && decl.kind !== 'import' && decl.kind !== 'export'
}

export function qualifier(decl: QuintImport | QuintInstance | QuintExport): string | undefined {
  if (decl.kind === 'instance') {
    return decl.qualifiedName
  }

  return decl.defName ? undefined : decl.qualifiedName ?? decl.protoName
}
