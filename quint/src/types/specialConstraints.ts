/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Special constraint cases for Quint operators that we are not able to type in our system,
 * including record and tuple related operators
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Error, buildErrorLeaf } from '../errorTree'
import { expressionToString } from '../ir/IRprinting'
import { QuintEx, QuintStr } from '../ir/quintIr'
import { QuintType, QuintVarType } from '../ir/quintTypes'
import { Constraint } from './base'
import { chunk, times } from 'lodash'
import { RowField } from '../ir/quintTypes'

export function recordConstructorConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // A record constructor has the normal form Rec('field1', value1, 'field2', value2, ...)
  // So we iterate over the arguments in pairs (chunks of size 2)
  //
  // - We can ignore the _keyType because we are verifying here that every key is a string litteral
  // - We can ignore the _value because we are only doing type checking
  const fields = chunk(args, 2).map(([[key, _keyType], [_value, valueType]]) => {
    if (key.kind !== 'str') {
      return left(
        buildErrorLeaf(
          `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
          `Record field name must be a name expression but is ${key.kind}: ${expressionToString(key)}`
        )
      )
    }

    return right({ fieldName: key.value, fieldType: valueType })
  })

  return mergeInMany(fields).map(fs => {
    const t: QuintType = { kind: 'rec', fields: { kind: 'row', fields: fs, other: { kind: 'empty' } } }
    const constraint: Constraint = { kind: 'eq', types: [t, resultTypeVar], sourceId: id }
    return [constraint]
  })
}

export function fieldConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _fieldNameType because we are verifying here that every key is a string litteral
  const [[_rec, recType], [fieldName, _fieldNameType]] = args

  if (fieldName.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`
      )
    )
  }

  const generalRecType: QuintType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: resultTypeVar }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const constraint: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([constraint])
}

export function fieldNamesConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  const [[_rec, recType]] = args

  const generalRecType: QuintType = { kind: 'rec', fields: { kind: 'var', name: `rec_${resultTypeVar.name}` } }

  const c1: Constraint = { kind: 'eq', types: [resultTypeVar, { kind: 'set', elem: { kind: 'str' } }], sourceId: id }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

export function withConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _fieldNameType because we are verifying here that every key is a string litteral
  const [[_rec, recType], [fieldName, _fieldNameType], [_value, valueType]] = args

  if (fieldName.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`
      )
    )
  }

  const generalRecType: QuintType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: valueType }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const c1: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }
  const c2: Constraint = { kind: 'eq', types: [resultTypeVar, generalRecType], sourceId: id }

  return right([c1, c2])
}

export function tupleConstructorConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  const fields = args.map(([_, type], i) => {
    return { fieldName: `${i}`, fieldType: type }
  })

  const t2: QuintType = { kind: 'tup', fields: { kind: 'row', fields: fields, other: { kind: 'empty' } } }
  const c: Constraint = { kind: 'eq', types: [t2, resultTypeVar], sourceId: id }
  return right([c])
}

export function itemConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // We can ignore the _itemNameType because we are verifying here that every key is a string litteral
  const [[_tup, tupType], [itemName, _itemNameType]] = args

  if (itemName.kind !== 'int') {
    return left(
      buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Tup field index must be an int expression but is ${itemName.kind}: ${expressionToString(itemName)}`
      )
    )
  }

  // A tuple with item acess of N should have at least N fields
  // Fill previous fileds with type variables
  const fields: RowField[] = times(Number(itemName.value - 1n)).map(i => {
    return { fieldName: `${i}`, fieldType: { kind: 'var', name: `tup_${resultTypeVar.name}_${i}` } }
  })
  fields.push({ fieldName: `${itemName.value - 1n}`, fieldType: resultTypeVar })

  const generalTupType: QuintType = {
    kind: 'tup',
    fields: {
      kind: 'row',
      fields: fields,
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }
  const constraint: Constraint = { kind: 'eq', types: [tupType, generalTupType], sourceId: id }

  return right([constraint])
}

export function variantConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // `_valuEx : valueType` is checked already via the constaintGenerato
  const [[labelExpr, labelType], [_valueEx, valueType]] = args

  if (labelExpr.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating variant constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Variant label must be a string expression but is ${labelType.kind}: ${expressionToString(labelExpr)}`
      )
    )
  }
  // We now know the label must be a quint string
  const labelStr = labelExpr as QuintStr

  // A tuple with item acess of N should have at least N fields
  // Fill previous fileds with type variables
  const variantField: RowField = { fieldName: labelStr.value, fieldType: valueType }

  const generalVarType: QuintType = {
    kind: 'sum',
    fields: {
      kind: 'row',
      fields: [variantField],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }
  const isDefinedConstraint: Constraint = { kind: 'isDefined', type: generalVarType, sourceId: id }
  const propagateResultConstraint: Constraint = { kind: 'eq', types: [resultTypeVar, generalVarType], sourceId: id }

  return right([isDefinedConstraint, propagateResultConstraint])
}
