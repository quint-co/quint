/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { TntTypeTag } from './tntTypes';

/*
 * Intermediate representation of TNT. It almost mirrors the IR of Apalache,
 * which assumes that module instances are flattened.
 */

/**
 * TNT expressions and declarations may be assigned an identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
export interface WithId {
	id: bigint;
}

/**
 * TNT expressions and declarations carry a type tag.
 */
export interface WithTypeTag {
	typeTag: TntTypeTag
}

/**
 * Discriminated union of TNT expressions.
 */
export type TntEx =
	// A name of: a variable, constant, parameter, user-defined operator.
	| { kind: "name", name: string } & WithId & WithTypeTag
	// An integer literal.
	| { kind: "number", value: bigint } & WithId & WithTypeTag
	// A string literal
	| { kind: "string", value: string } & WithId & WithTypeTag
	// An operator application.
	| { kind: "oper", opcode: string, args: TntEx[] } & WithId & WithTypeTag
	// A let-in binding (defined via 'def', 'def rec', or 'val').
	| { kind: "let", opdef: TntOpDef, body: TntEx } & WithId & WithTypeTag

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
 * A user-defined operator that is defined via one of the qualifiers: val, def, def rec, pred, action, or temporal.
 */
export interface TntOpDef extends WithId, WithTypeTag {
	kind: "def",
	name: string,
	params: string[],
	qualifier: OpQualifier,
	isPrivate: boolean
}

/**
 * Definition: constant, state variable, operator definition, assumption, instance, module.
 */
export type TntDef =
	| TntOpDef
	| { kind: "const", name: string } & WithId & WithTypeTag
	| { kind: "var", name: string } & WithId & WithTypeTag
	| { kind: "assume", name: string, assumption: TntEx } & WithId & WithTypeTag
	| { kind: "instance", name: string, moduleName: string, overrides: [string, TntEx][] } & WithId
	| { kind: "module", module: TntModule } & WithId

/**
 * Module definition.
 */	
export interface TntModule extends WithId {
	name: string,
	extends: string[],
	defs: TntDef[]
}