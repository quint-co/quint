/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { IRVisitor, walkType } from './IRVisitor'

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
  kind: 'list',
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
  kind: 'tup',
  elems: TntType[],
}

export interface TntRecordType extends WithOptionalId {
  kind: 'rec',
  fields: Row,
}

export interface TntUnionType extends WithOptionalId {
  kind: 'union',
  tag: string,
  records: {
    tagValue: string,
    fields: Row,
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

export type Row =
  | { kind: 'row', fields: { fieldName: string, fieldType: TntType }[], other: Row }
  | { kind: 'var', name: string }
  | { kind: 'empty' }

/*
 * Collects all type variable names from a given type
 *
 * @param t the type to have its names collected
 *
 * @returns a list with collected names
 */
export function typeNames (t: TntType): Set<string> {
  const collector = new TypeNamesCollector()
  walkType(collector, t)
  return collector.names
}

/*
 * Collects all row variable names from a given type
 *
 * @param r the row to have its names collected
 *
 * @returns a list with collected names
 */
export function rowNames (r: Row): Set<string> {
  switch(r.kind) {
    case 'row':     
      return rowNames(r.other)
    case 'var':
      return new Set<string>([r.name])
    case 'empty':
      return new Set<string>([])
  }
}

class TypeNamesCollector implements IRVisitor {
  names: Set<string> = new Set()

  exitVarType (t: TntVarType) {
    this.names.add(t.name)
  }
}
