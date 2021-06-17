/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { TntTypeTag } from './tntTypes';

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
 * If an expression carries the tag TntUntyped, then its type should be ignored.
 */
export interface WithTypeTag {
	typeTag?: TntTypeTag
}

/**
 * Discriminated union of TNT expressions.
 */
export type TntEx =
	// A name of: a variable, constant, parameter, user-defined operator.
	| { kind: "name", name: string } & WithId & WithTypeTag
	// A Boolean literal.
	| { kind: "bool", value: boolean } & WithId & WithTypeTag
	// An integer literal.
	| { kind: "int", value: bigint } & WithId & WithTypeTag
	// A string literal
	| { kind: "str", value: string } & WithId & WithTypeTag
	// Operator application: apply an operator by its name, supplying the arguments in `args`.
	| { kind: "opapp", opcode: string, args: TntEx[] } & WithId & WithTypeTag
	// Operator abstraction: an anonymous operator (lambda) over parameters `params`.
	| { kind: "opabs", params: string[], expr: TntEx[] } & WithId & WithTypeTag
	// A let-in binding (defined via 'def', 'def rec', 'val', etc.).
	| { kind: "let", opdef: TntOpDef, expr: TntEx } & WithId & WithTypeTag

/**
 * Operator qualifier that refines the operator shape: val, def, def rec, pred, action, or temporal.
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
 * A user-defined operator that is defined via one of the qualifiers:
 * val, def, def rec, pred, action, or temporal.
 * Note that TntOpDef does not have any formal parameters.
 * If an operator definition has formal parameters, then `expr`
 * should be a lambda expression over those parameters.
 */
export interface TntOpDef extends WithId, WithTypeTag {
	kind: "def",
	name: string,
	qualifier: OpQualifier,
	isPrivate: boolean,
	expr: TntEx
}

/**
 * Definition: constant, state variable, operator definition, assumption, instance, module.
 */
export type TntDef =
	| TntOpDef
	| { kind: "const", name: string } & WithId & WithTypeTag
	| { kind: "var", name: string } & WithId & WithTypeTag
	| { kind: "assume", name: string, assumption: TntEx } & WithId
	| { kind: "instance", name: string,
		moduleName: string, overrides: [string, TntEx][] } & WithId
	| { kind: "module", module: TntModule } & WithId

/**
 * Module definition.
 */	
export interface TntModule extends WithId {
	name: string,
	extends: string[],
	defs: TntDef[]
}