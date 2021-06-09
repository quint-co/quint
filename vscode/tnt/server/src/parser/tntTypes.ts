/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * TNT Types. Every expression or definition is either untyped, or decorated with
 * a type in Type System 1.2.
 * 
 * @author Igor Konnov
 */

/**
 * Every name is assigned either an untyped "value" tag, or an "oper" tag
 * that carries the untyped operator signature. For the "oper" tag,
 * we just specify the arity of the operator arguments.
 * As TLA+ does not let higher order operators to have other
 * higher order operators as parameters, a flat array of integers is sufficient.
 */
 export type TntUntyped =
 	| { kind: "value" }
	| { kind: "oper", signature: bigint[] }

 /**
  * A type in Type System 1.2.
  */
 export type TntType =
	| { kind: "bool" }
	| { kind: "int" }
	| { kind: "str" }
	| { kind: "const", name: string }
	| { kind: "var", name: string }
	| { kind: "set", elem: TntType }
	| { kind: "seq", elem: TntType }
	| { kind: "fun", arg: TntType, res: TntType }
	| { kind: "oper", args: TntType[], res: TntType }
	| { kind: "tuple", elems: TntType[] }
	| { kind: "record", elems: [string, TntType][] }
	| { kind: "union", tag: string, records: [string, TntType][] }

/**
 * A type tag is either an untyped signature
 */
export type TntTypeTag = TntUntyped | TntType	