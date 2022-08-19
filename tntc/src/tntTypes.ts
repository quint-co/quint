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
 * TNT expressions, declarations and types carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
interface WithOptionalId {
  id?: bigint
}

export interface TntBoolType extends WithOptionalId {
  kind: 'bool'
}

export interface TntIntType extends WithOptionalId {
  kind: 'int'
}

export interface TntStrType extends WithOptionalId {
  kind: 'str'
}

export interface TntConstType extends WithOptionalId {
  kind: 'const',
  name: string,
}

export interface TntVarType extends WithOptionalId {
  kind: 'var',
  name: string,
}

export interface TntSetType extends WithOptionalId {
  kind: 'set',
  elem: TntType,
}

export interface TntSeqType extends WithOptionalId {
  kind: 'seq',
  elem: TntType,
}

export interface TntFunType extends WithOptionalId {
  kind: 'fun',
  arg: TntType,
  res: TntType,
}

export interface TntOperType extends WithOptionalId {
  kind: 'oper',
  args: TntType[],
  res: TntType,
}

export interface TntTupleType extends WithOptionalId {
  kind: 'tuple',
  elems: TntType[],
}

export interface TntRecordType extends WithOptionalId {
  kind: 'record',
  fields: { fieldName: string, fieldType: TntType }[]
}

export interface TntUnionType extends WithOptionalId {
  kind: 'union',
  tag: string,
  records: {
    tagValue: string,
    fields: { fieldName: string, fieldType: TntType }[]
  }[]
}

/**
 * A type in Type System 1.2.
 */
export type TntType =
  | TntBoolType
  | TntIntType
  | TntStrType
  | TntConstType
  | TntVarType
  | TntSetType
  | TntSeqType
  | TntFunType
  | TntOperType
  | TntTupleType
  | TntRecordType
  | TntUnionType
