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
import { buildErrorLeaf, Error } from '../errorTree'
import { expressionToString } from '../IRprinting'
import { TntEx } from '../tntIr'
import { TntType, TntVarType } from '../tntTypes'
import { Constraint } from './base'

/*
 * Generate constraints for operators for which signatures cannot be expressed as normal signatures
 *
 * @param opcode The name of the operator
 * @param id The id of the component for which constraints are being generated
 * @param args The arguments to the operator
 * @param argTypes The types of the arguments
 * @param resultTypeVar A fresh type variable for the result type
 *
 * @returns Either an error or a list of constraints
 */
export function specialConstraints (opcode: string, id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  switch (opcode) {
    case 'Rec': return recordConstructorConstraints(id, args, argTypes, resultTypeVar)
    case 'field': return fieldConstraints(id, args, argTypes, resultTypeVar)
    case 'fieldNames': return fieldNamesConstraints(id, args, argTypes, resultTypeVar)
    case 'with': return withConstraints(id, args, argTypes, resultTypeVar)
    default: return right([])
  }
}

function recordConstructorConstraints (id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const constraints: Constraint[] = []
  const fields = Array.from(Array(args.length / 2).keys()).map(i => {
    const key = args[i * 2]
    const keyType = argTypes[i * 2]
    const valueType = argTypes[i * 2 + 1]

    const constraint: Constraint = { kind: 'eq', types: [keyType, { kind: 'str' }], sourceId: key.id }
    constraints.push(constraint)

    if (key.kind !== 'str') {
      return left(buildErrorLeaf(
          `Generating record constraints for ${args.map(expressionToString)}`,
          `Record field name must be a name expression but is ${key.kind}: ${expressionToString(key)}`))
    }

    return right({ fieldName: key.value, fieldType: valueType })
  })

  return mergeInMany(fields).map(fs => {
    const t2: TntType = { kind: 'rec', fields: { kind: 'row', fields: fs, other: { kind: 'empty' } } }
    const c: Constraint = { kind: 'eq', types: [t2, resultTypeVar], sourceId: id }
    constraints.push(c)
    return constraints
  })
}

function fieldConstraints (id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const recType = argTypes[0]
  const fieldName = args[1]
  const fieldNameType = argTypes[1]

  const c1: Constraint = { kind: 'eq', types: [fieldNameType, { kind: 'str' }], sourceId: fieldName.id }

  if (fieldName.kind !== 'str') {
    return left(buildErrorLeaf(
            `Generating record constraints for ${args.map(expressionToString)}`,
            `Record field name must be a name expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`))
  }

  const generalRecType: TntType = { kind: 'rec', fields: { kind: 'row', fields: [{ fieldName: fieldName.value, fieldType: resultTypeVar }], other: { kind: 'var', name: `tail_${resultTypeVar.name}` } } }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

function fieldNamesConstraints (id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const recType = argTypes[0]

  const c1: Constraint = { kind: 'eq', types: [resultTypeVar, { kind: 'set', elem: { kind: 'str' } }], sourceId: id }

  const generalRecType: TntType = { kind: 'rec', fields: { kind: 'var', name: `rec_${resultTypeVar.name}` } }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }

  return right([c1, c2])
}

function withConstraints (id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const recType = argTypes[0]
  const fieldName = args[1]
  const fieldNameType = argTypes[1]
  const valueType = argTypes[2]

  const c1: Constraint = { kind: 'eq', types: [fieldNameType, { kind: 'str' }], sourceId: fieldName.id }

  if (fieldName.kind !== 'str') {
    return left(buildErrorLeaf(
            `Generating record constraints for ${args.map(expressionToString)}`,
            `Record field name must be a name expression but is ${fieldName.kind}: ${expressionToString(fieldName)}`))
  }

  const generalRecType: TntType = { kind: 'rec', fields: { kind: 'row', fields: [{ fieldName: fieldName.value, fieldType: valueType }], other: { kind: 'var', name: `tail_${resultTypeVar.name}` } } }
  const c2: Constraint = { kind: 'eq', types: [recType, generalRecType], sourceId: id }
  const c3: Constraint = { kind: 'eq', types: [resultTypeVar, generalRecType], sourceId: id }

  return right([c1, c2, c3])
}
