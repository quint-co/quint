
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

import { TntType } from './tntTypes'
/**
 * TNT expressions and declarations carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
export interface WithId {
  id: bigint;
}

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

/**
 * Discriminated union of TNT expressions.
 */
export type TntEx =
  // A name of: a variable, constant, parameter, user-defined operator
  | { kind: 'name', name: string } & WithId & WithType
  // A Boolean literal
  | { kind: 'bool', value: boolean } & WithId & WithType
  // An integer literal
  | { kind: 'int', value: bigint } & WithId & WithType
  // A string literal
  | { kind: 'str', value: string } & WithId & WithType
  // Operator application by its name, supplying the arguments in `args`
  | { kind: 'app', opcode: string, args: TntEx[] } & WithId & WithType
  // Operator abstraction: an anonymous operator (lambda) over a list of parameters.
  | {
    kind: 'lambda',
    params: string[],
    qualifier: OpQualifier,
    expr: TntEx
  } & WithId & WithType
  // A let-in binding (defined via 'def', 'val', etc.).
  // eslint-disable-next-line no-use-before-define
  | { kind: 'let', opdef: TntOpDef, expr: TntEx } & WithId & WithType

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

/**
 * Definition: constant, state variable, operator definition, assumption, instance, module.
 */
export type TntDef =
  | TntOpDef
  | {
    /** definition kind ('const') */
    kind: 'const',
    /** name of the constant */
    name: string
  } & WithId & WithType
  | {
    /** definition kind ('var') */
    kind: 'var',
    /** name of the variable */
    name: string
  } & WithId & WithType
  | {
    /** definition kind ('assume') */
    kind: 'assume',
    /** name of the assumption, may be '_' */
    name: string,
    /** an expression to associate with the name */
    assumption: TntEx
  } & WithId
  | {
    /** definition kind ('typedef') */
    kind: 'typedef',
    /** name of a type alias */
    name: string,
    /** type to associate with the alias (none for uninterpreted type) */
    type?: TntType
  } & WithId
  | {
    /** definition kind ('import') */
    kind: 'import',
    /** name to import, or '*' to denote all */
    name: string,
    /** path to the module, e.g., Foo.Bar */
    path: string
  } & WithId
  | {
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
  } & WithId
  | {
    /** definition kind ('module') */
    kind: 'module',
    /** nested module */
    // eslint-disable-next-line no-use-before-define
    module: TntModule
  } & WithId

/**
 * Module definition.
 */
export interface TntModule extends WithId {
  name: string,
  defs: TntDef[]
}
