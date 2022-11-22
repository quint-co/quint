/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021-2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { IRVisitor, walkType } from './IRVisitor'

/**
 * TNT Types, representing annotated or inferred types. 
 *
 * @author Igor Konnov, Gabriela Moreira
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
  fields: Row,
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

/**
 * Row types, used to express tuples and records.
 */
export type ConcreteRow = { kind: 'row', fields: { fieldName: string, fieldType: TntType }[], other: Row }
export type VarRow = { kind: 'var', name: string }
export type EmptyRow = { kind: 'empty' }

export type Row = ConcreteRow | VarRow | EmptyRow

/*
 * Collects all type and row variable names from a given type
 *
 * @param t the type to have its names collected
 *
 * @returns the set of type variables and the set of row variables
 */
export function typeNames(t: TntType): { typeVariables: Set<string>, rowVariables: Set<string> } {
  const collector = new TypeNamesCollector()
  walkType(collector, t)
  return { typeVariables: collector.typeNames, rowVariables: collector.rowNames }
}

/*
 * Collects all row variable names from a given type
 *
 * @param r the row to have its names collected
 *
 * @returns a set with collected names
 */
export function rowNames(r: Row): Set<string> {
  switch (r.kind) {
    case 'row':
      return rowNames(r.other)
    case 'var':
      return new Set<string>([r.name])
    case 'empty':
      return new Set<string>([])
  }
}

class TypeNamesCollector implements IRVisitor {
  typeNames: Set<string> = new Set()
  rowNames: Set<string> = new Set()

  exitVarType(t: TntVarType) {
    this.typeNames.add(t.name)
  }

  exitVarRow(t: VarRow) {
    this.rowNames.add(t.name)
  }
}
