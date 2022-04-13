
/*
 * Intermediate representation of TNT. It almost mirrors the IR of Apalache,
 * which assumes that module instances are flattened. TNT extends the Apalache IR
 * by supporting hierarchical modules and instances.
 *
 * Igor Konnov, 2021
 *
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { TntType, WithId } from './tntTypes'

/**
 * TNT expressions and declarations carry an optional type tag.
 * If a type tag is missing, it means that the type has not been computed yet.
 */
export interface WithType {
  type?: TntType
}

/**
 * Operator qualifier, which refines a mode:
 *
 *  - val: an expression over constants and state variables,
 *
 *  - def: a parameterized expression over constants, state variables,
 *    and definition parameters. When the defined expression produces a Boolean
 *    value, you should use `pred` instead. However, this is only a convention,
 *    not a requirement.
 *
 *  - pred: a (possibly parameterized) expression over constants,
 *    state variables, and definition parameters. This expression must
 *    produce a Boolean value.
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
export type OpQualifier = 'val' | 'def' | 'pred' | 'action' | 'temporal'

export interface TntName extends WithId, WithType {
  /** Expressions kind ('name' -- name reference) */
  kind: 'name',
  /** A name of: a variable, constant, parameter, user-defined operator */
  name: string,
}

export interface TntBool extends WithId, WithType {
  /** Expressions kind ('bool' -- a boolean literal) */
  kind: 'bool',
  /** The boolean literal value */
  value: boolean,
}

export interface TntInt extends WithId, WithType {
  /** Expressions kind ('int' -- an integer literal) */
  kind: 'int',
  /** The integer literal value */
  value: bigint,
}

export interface TntStr extends WithId, WithType {
  /** Expressions kind ('str' -- a string literal) */
  kind: 'str',
  /** The string literal value */
  value: string,
}

export interface TntApp extends WithId, WithType {
  /** Expressions kind ('app' -- operator application) */
  kind: 'app',
  /** The name of the operator being applied */
  opcode: string,
  /** A list of arguments to the operator */
  args: TntEx[],
}

export interface TntLambda extends WithId, WithType {
  /** Expressions kind ('lambda' -- operator abstraction) */
  kind: 'lambda',
  /** Identifiers for the formal parameters */
  params: string[],
  /** The qualifier for the defined operator */
  qualifier: OpQualifier,
  /** The definition body */
  expr: TntEx,
}

export interface TntLet extends WithId, WithType {
  /** Expressions kind ('let' -- a let-in binding defined via 'def', 'val', etc.) */
  kind: 'let',
  /** The operator being defined to be used in the body */
  opdef: TntOpDef,
  /** The body */
  expr: TntEx,
}

/**
 * Discriminated union of TNT expressions.
 */
export type TntEx = TntName | TntBool | TntInt | TntStr | TntApp | TntLambda | TntLet

/**
 * A user-defined operator that is defined via one of the qualifiers:
 * val, def, pred, action, or temporal.
 * Note that TntOpDef does not have any formal parameters.
 * If an operator definition has formal parameters, then `expr`
 * should be a lambda expression over those parameters.
 */
export interface TntOpDef extends WithId, WithType {
  /** definition kind ('def' -- operator definition) */
  kind: 'def',
  /** definition name */
  name: string,
  /** definition qualifier: 'val', 'def', 'pred', 'action', 'temporal' */
  qualifier: OpQualifier,
  /** expression to be associated with the definition */
  expr: TntEx
}

export interface TntConst extends WithId, WithType {
  /** definition kind ('const') */
  kind: 'const',
  /** name of the constant */
  name: string,
}

export interface TntVar extends WithId, WithType {
  /** definition kind ('var') */
  kind: 'var',
  /** name of the variable */
  name: string
}

export interface TntAssume extends WithId, WithType {
  /** definition kind ('assume') */
  kind: 'assume',
  /** name of the assumption, may be '_' */
  name: string,
  /** an expression to associate with the name */
  assumption: TntEx
}

export interface TntTypeDef extends WithId, WithType {
  /** definition kind ('typedef') */
  kind: 'typedef',
  /** name of a type alias */
  name: string,
  /** type to associate with the alias (none for uninterpreted type) */
  type?: TntType
}

export interface TntImport extends WithId, WithType {
  /** definition kind ('import') */
  kind: 'import',
  /** name to import, or '*' to denote all */
  name: string,
  /** path to the module, e.g., Foo.Bar */
  path: string
}

export interface TntInstance extends WithId, WithType {
  /** definition kind ('instance') */
  kind: 'instance',
  /** instance name */
  name: string,
  /** the name of the module to instantiate */
  protoName: string,
  /** how to override constants and variables */
  overrides: [string, TntEx][],
  /** whether to use identity substitution on missing names */
  identityOverride: boolean
}

export interface TntModuleDef extends WithId, WithType {
  /** definition kind ('module') */
  kind: 'module',
  /** nested module */
  module: TntModule
}

/**
 * Definition: constant, state variable, operator definition, assumption, instance, module.
 */
export type TntDef = TntOpDef | TntConst | TntVar | TntAssume | TntTypeDef | TntImport | TntInstance | TntModuleDef

/**
 * Module definition.
 */
export interface TntModule extends WithId {
  name: string,
  defs: TntDef[]
}
