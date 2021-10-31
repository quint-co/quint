/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { TntType } from './tntTypes';

/*
 * Intermediate representation of TNT. It almost mirrors the IR of Apalache,
 * which assumes that module instances are flattened. TNT extends the Apalache IR
 * by supporting hierarchical modules and instances.
 */

/**
 * TNT expressions and declarations carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
export interface WithId {
	id: bigint;
}

/**
 * TNT expressions and declarations carry an optional type tag.
 * Note that if a type tag is missing, it does not mean that an expression (or declaration)
 * is untyped. It means that the type has not been computed yet.
 */
export interface WithType {
	type?: TntType
}

/**
 * Discriminated union of TNT expressions.
 */
export type TntEx =
	// A name of: a variable, constant, parameter, user-defined operator.
	| { kind: "name", name: string } & WithId & WithType
	// A Boolean literal.
	| { kind: "bool", value: boolean } & WithId & WithType
	// An integer literal.
	| { kind: "int", value: bigint } & WithId & WithType
	// A string literal
	| { kind: "str", value: string } & WithId & WithType
	// Operator application: apply an operator by its name, supplying the arguments in `args`.
	| { kind: "opapp", opcode: string, args: TntEx[] } & WithId & WithType
	// Operator abstraction: an anonymous operator (lambda) over a list of parameters.
	| { kind: "opabs", params: string[], expr: TntEx } & WithId & WithType
	// A let-in binding (defined via 'def', 'def rec', 'val', etc.).
	| { kind: "let", opdef: TntOpDef, expr: TntEx } & WithId & WithType

/**
 * Operator qualifier that refines the operator shape:
 * 
 *  - val: an expression over constants and state variables,
 * 
 *  - def: a parameterized expression over constants, state variables,
 *    and definition parameters. When the defined expression produces a Boolean
 *    value, you should use `pred` instead. However, this is only a convention,
 *    not a requirement.
 * 
 *  - def rec: like `def` but the expression is recursive, that is,
 * 	  its name can be used in the definition.
 * 
 *  - pred: a (possibly parameterized) expression over constants,
 * 	  state variables, and definition parameters. This expression must
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
export enum OpQualifier {
	Val,
	Def,
	DefRec,
	Pred,
	Action,
	Temporal
}

/**
 * Operator scope:
 *
 *  - Public is a global definition that is visible via `extends` and `instance`.
 *  - Private is a global definition that is not visible via `extends` and `instance`.
 *  - Local is a local operator definition, invisible outside the containing definition.
 */
export enum OpScope {
	Public,
	Private,
	Local
}

/**
 * A user-defined operator that is defined via one of the qualifiers:
 * val, def, def rec, pred, action, or temporal.
 * Note that TntOpDef does not have any formal parameters.
 * If an operator definition has formal parameters, then `expr`
 * should be a lambda expression over those parameters.
 */
export interface TntOpDef extends WithId, WithType {
	kind: "def",
	name: string,
	qualifier: OpQualifier,
	scope: OpScope,
	expr: TntEx
}

/**
 * Definition: constant, state variable, operator definition, assumption, instance, module.
 */
export type TntDef =
	| TntOpDef
	| { kind: "const", name: string } & WithId & WithType
	| { kind: "var", name: string } & WithId & WithType
	| { kind: "assume", name: string, assumption: TntEx } & WithId
	| { kind: "instance", name: string,
		moduleName: string, overrides: [string, TntEx][] } & WithId
	| { kind: "module", module: TntModule } & WithId

/**
 * Module definition.
 */	
export interface TntModule extends WithId {
	name: string,
	defs: TntDef[]
}
