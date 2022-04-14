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
export interface WithId {
  id: bigint
}

export interface TntBoolType extends WithId {
  kind: 'bool'
}

export interface TntIntType extends WithId {
  kind: 'int'
}

export interface TntStrType extends WithId {
  kind: 'str'
}

export interface TntConstType extends WithId {
  kind: 'const',
  name: string,
}

export interface TntVarType extends WithId {
  kind: 'var',
  name: string,
}

export interface TntSetType extends WithId {
  kind: 'set',
  elem: TntType,
}

export interface TntSeqType extends WithId {
  kind: 'seq',
  elem: TntType,
}

export interface TntFunType extends WithId {
  kind: 'fun',
  arg: TntType,
  res: TntType,
}

export interface TntOperType extends WithId {
  kind: 'oper',
  args: TntType[],
  res: TntType,
}

export interface TntTupleType extends WithId {
  kind: 'tuple',
  elems: TntType[],
}

export interface TntRecordType extends WithId {
  kind: 'record',
  fields: { fieldName: string, fieldType: TntType }[]
}

export interface TntUnionType extends WithId {
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
