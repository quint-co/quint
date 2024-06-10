/* ----------------------------------------------------------------------------------
 * Copyright 2021-2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { IRVisitor, walkType } from './IRVisitor'

/**
 * Quint Types, representing annotated or inferred types.
 *
 * @author Igor Konnov, Gabriela Moreira
 */

/**
 * Quint expressions, declarations and types carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
interface WithOptionalId {
  id?: bigint
}

export interface QuintBoolType extends WithOptionalId {
  kind: 'bool'
}

export interface QuintIntType extends WithOptionalId {
  kind: 'int'
}

export interface QuintStrType extends WithOptionalId {
  kind: 'str'
}

export interface QuintConstType extends WithOptionalId {
  kind: 'const'
  name: string
}

export interface QuintVarType extends WithOptionalId {
  kind: 'var'
  name: string
}

export interface QuintSetType extends WithOptionalId {
  kind: 'set'
  elem: QuintType
}

export interface QuintSeqType extends WithOptionalId {
  kind: 'list'
  elem: QuintType
}

export interface QuintFunType extends WithOptionalId {
  kind: 'fun'
  arg: QuintType
  res: QuintType
}

export interface QuintOperType extends WithOptionalId {
  kind: 'oper'
  args: QuintType[]
  res: QuintType
}

export interface QuintTupleType extends WithOptionalId {
  kind: 'tup'
  fields: Row
}

// A value of the unit type, i.e. an empty record
export function unitType(id: bigint): QuintTupleType {
  return {
    id,
    kind: 'tup',
    fields: { kind: 'row', fields: [], other: { kind: 'empty' } },
  }
}

export function isUnitType(r: QuintType): Boolean {
  return r.kind === 'tup' && r.fields.kind === 'row' && r.fields.fields.length === 0 && r.fields.other.kind === 'empty'
}

export interface QuintRecordType extends WithOptionalId {
  kind: 'rec'
  fields: Row
}

export interface QuintSumType extends WithOptionalId {
  kind: 'sum'
  fields: ConcreteRow
}

export function sumType(labelTypePairs: [string, QuintType][], rowVar?: string, id?: bigint): QuintSumType {
  const fields = labelTypePairs.map(([fieldName, fieldType]) => ({ fieldName, fieldType }))
  const other: Row = rowVar ? { kind: 'var', name: rowVar } : { kind: 'empty' }
  return { kind: 'sum', fields: { kind: 'row', fields, other }, id }
}

/**
 * Type application
 *
 * E.g.,
 *
 * ```
 * T[int, str]
 * ```
 *
 * for a type constant `T`.
 */
export interface QuintAppType extends WithOptionalId {
  kind: 'app'
  ctor: QuintConstType /** The type constructor applied */
  args: QuintType[] /** The arguments to which the constructor is applied */
}

/**
 * A type in Type System 1.2.
 */
export type QuintType =
  | QuintBoolType
  | QuintIntType
  | QuintStrType
  | QuintConstType
  | QuintVarType
  | QuintSetType
  | QuintSeqType
  | QuintFunType
  | QuintOperType
  | QuintTupleType
  | QuintRecordType
  | QuintSumType
  | QuintAppType

/**
 * Row types, used to express tuples and records.
 */
export type RowField = { fieldName: string; fieldType: QuintType }
export interface ConcreteRow {
  kind: 'row'
  fields: RowField[]
  other: Row
}
export interface ConcreteFixedRow extends ConcreteRow {
  kind: 'row'
  fields: RowField[]
  other: EmptyRow
}
export type VarRow = { kind: 'var'; name: string }
export type EmptyRow = { kind: 'empty' }

export type Row = ConcreteFixedRow | ConcreteRow | VarRow | EmptyRow

/*
 * Gives all of a row's field names
 */
export function rowFieldNames(r: Row): string[] {
  switch (r.kind) {
    case 'row':
      return r.fields.map(f => f.fieldName).concat(rowFieldNames(r.other))
    case 'var':
    case 'empty':
      return []
  }
}

/*
 * Collects all type and row variable names from a given type
 *
 * @param t the type to have its names collected
 *
 * @returns the set of type variables and the set of row variables
 */
export function typeNames(t: QuintType): { typeVariables: Set<string>; rowVariables: Set<string> } {
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

  exitVarType(t: QuintVarType) {
    this.typeNames.add(t.name)
  }

  exitVarRow(t: VarRow) {
    this.rowNames.add(t.name)
  }
}
