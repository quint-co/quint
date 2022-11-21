/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Special constraint cases for TNT types, including record and tuple related operators
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Error, buildErrorLeaf } from '../errorTree'
import { expressionToString } from '../IRprinting'
import { TntEx } from '../tntIr'
import { TntType, TntVarType } from '../tntTypes'
import { Constraint } from './base'
import { chunk } from 'lodash'

/*
 * Generate constraints for operators for which signatures cannot be expressed as normal signatures
 *
 * @param opcode The name of the operator
 * @param id The id of the component for which constraints are being generated
 * @param args The arguments to the operator and their respective types
 * @param resultTypeVar A fresh type variable for the result type
 *
 * @returns Either an error or a list of constraints
 */
export function specialConstraints(
  opcode: string, id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType
): Either<Error, Constraint[]> {
  switch (opcode) {
    // Record operators
    case 'Rec': return recordConstructorConstraints(id, args, resultTypeVar)
    case 'field': return fieldConstraints(id, args, resultTypeVar)
    case 'fieldNames': return fieldNamesConstraints(id, args, resultTypeVar)
    case 'with': return withConstraints(id, args, resultTypeVar)
    // Tuple operators
    case 'Tup': return tupleConstructorConstraints(id, args, resultTypeVar)
    case 'item': return itemConstraints(id, args, resultTypeVar)
    default: return right([])
  }
}

function recordConstructorConstraints(
  id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType
): Either<Error, Constraint[]> {
  const constraints: Constraint[] = []
  // A record constructor has the normal form Rec('field1', value1, 'field2', value2, ...)
  // So we iterate over the arguments in pairs (chunks of size 2)
  const fields = chunk(args, 2).map(([[key, keyType], [_value, valueType]]) => {
    if (key.kind !== 'str') {
      return left(buildErrorLeaf(
        `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Record field name must be a name expression but is ${key.kind}: ${expressionToString(key)}`))
    }

    const constraint: Constraint = { kind: 'eq', types: [keyType, { kind: 'str' }], sourceId: key.id }
    constraints.push(constraint)

    return right({ fieldName: key.value, fieldType: valueType })
  })

  return mergeInMany(fields).map(fs => {
    const t: TntType = { kind: 'rec', fields: { kind: 'row', fields: fs, other: { kind: 'empty' } } }
    const c: Constraint = { kind: 'eq', types: [t, resultTypeVar], sourceId: id }
    constraints.push(c)
    return constraints
  })
}

function fieldConstraints(
  id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType
): Either<Error, Constraint[]> {
  const [[_rec, recType], [fieldName, fieldNameType]] = args

  if (fieldName.kind !== 'str') {
    return left(buildErrorLeaf(
            `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
            `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`))
  }

  const generalRecType: TntType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: resultTypeVar }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const c1: Constraint = { kind: 'eq', types: [fieldNameType, { kind: 'str' }], sourceId: fieldName.id }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

function fieldNamesConstraints(
  id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType
): Either<Error, Constraint[]> {
  const [[_rec, recType]] = args

  const generalRecType: TntType = { kind: 'rec', fields: { kind: 'var', name: `rec_${resultTypeVar.name}` } }

  const c1: Constraint = { kind: 'eq', types: [resultTypeVar, { kind: 'set', elem: { kind: 'str' } }], sourceId: id }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

function withConstraints(id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const [[_rec, recType], [fieldName, fieldNameType], [_value, valueType]] = args

  if (fieldName.kind !== 'str') {
    return left(buildErrorLeaf(
            `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
            `Record field name must be a string expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`))
  }

  const generalRecType: TntType = {
    kind: 'rec',
    fields: {
      kind: 'row',
      fields: [{ fieldName: fieldName.value, fieldType: valueType }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }

  const c1: Constraint = { kind: 'eq', types: [fieldNameType, { kind: 'str' }], sourceId: fieldName.id }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }
  const c3: Constraint = { kind: 'eq', types: [resultTypeVar, generalRecType], sourceId: id }

  return right([c1, c2, c3])
}

function tupleConstructorConstraints(
  id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType
): Either<Error, Constraint[]> {
  const fields = args.map(([_, type], i) => {
    return { fieldName: `${i}`, fieldType: type }
  })

  const t2: TntType = { kind: 'tup', fields: { kind: 'row', fields: fields, other: { kind: 'empty' } } }
  const c: Constraint = { kind: 'eq', types: [t2, resultTypeVar], sourceId: id }
  return right([c])
}

function itemConstraints(id: bigint, args: [TntEx, TntType][], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const [[_tup, tupType], [itemName, itemNameType]] = args

  const c1: Constraint = { kind: 'eq', types: [itemNameType, { kind: 'int' }], sourceId: itemName.id }

  if (itemName.kind !== 'int') {
    return left(buildErrorLeaf(
            `Generating record constraints for ${args.map(a => expressionToString(a[0]))}`,
            `Tup field index must be an int expression but is ${itemName.kind}: ${expressionToString(itemName)}`))
  }

  const generalTupType: TntType = {
    kind: 'tup',
    fields: {
      kind: 'row',
      fields: [{ fieldName: `${itemName.value - 1n}`, fieldType: resultTypeVar }],
      other: { kind: 'var', name: `tail_${resultTypeVar.name}` },
    },
  }
  const c2: Constraint = { kind: 'eq', types: [tupType, generalTupType], sourceId: id }

  return right([c1, c2])
}
