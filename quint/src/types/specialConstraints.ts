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
import { Error, ErrorTree, buildErrorLeaf } from '../errorTree'
import { expressionToString } from '../ir/IRprinting'
import { QuintEx } from '../ir/quintIr'
import { QuintOperType, QuintType, QuintVarType, sumType } from '../ir/quintTypes'
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

// The rule for the `variant` operator:
//
//   Γ ⊢ e: (t, c)            Γ ⊢ 'l' : str                v is fresh
// --------------------------------------------------------------------
//    Γ ⊢ variant('l', e) : (s, c /\ s ~ < l : t | v > /\ isDefined(s))
//
// Where < ... > is a row-based variant.
//
// This rule is explained in /doc/rfcs/rfc001-sum-types/rfc001-sum-types.org
export function variantConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // `_valuEx : valueType` is checked already via the constraintGenerator
  const [[labelExpr, labelType], [_valueEx, valueType]] = args

  if (labelExpr.kind !== 'str') {
    return left(
      buildErrorLeaf(
        `Generating variant constraints for ${args.map(a => expressionToString(a[0]))}`,
        `Variant label must be a string expression but is ${labelType.kind}: ${expressionToString(labelExpr)}`
      )
    )
  }

  // A tuple with item acess of N should have at least N fields
  // Fill previous fields with type variables
  const variantField: RowField = { fieldName: labelExpr.value, fieldType: valueType }

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

// The rule for the `match` operator:
//
// Γ ⊢ e:(s, c)
// Γ, x1:(t1, c1') ⊢ e1:(t, c1) ... Γ, xn:(tn, cn') ⊢ en:(t, cn)
// ------------------------------------------------------------------------------
//  Γ ⊢ match e { i1 : x1 => e1, ..., in : xn => en } : (t, c /\
//    c1 /\ c1' /\ ... /\ cn /\ cn' /\
//    s ~ < i1 : t1, ..., in : tn > )
//
// Where
//
// - < ... > is a row-based variant.
// - {l1 : x1 => e1, ..., ln : xn => en } coordinates label `li` with an eliminator `xi => ei`
//   for each label in sum-type `s`.
//
// This rule is explained in /doc/rfcs/rfc001-sum-types/rfc001-sum-types.org
export function matchConstraints(
  id: bigint,
  args: [QuintEx, QuintType][],
  resultTypeVar: QuintVarType
): Either<Error, Constraint[]> {
  // A match eliminator has the normal form `matchVariant(expr, 'field1', elim1,..., 'fieldn', elimn)`.
  // We separate the `expr` we are matching against into the `_variantExpr` and the
  // `labelsAndCases`, which holds the pairs of field labels and eliminators.
  const [[_variantExpr, variantType], ...labelsAndcases] = args
  // We group the `labelsAndCases` in chunks of size 2 fur subsequent analysis.
  const labelAndElimPairs = chunk(labelsAndcases, 2)

  // Now we verify that each label is a string literal and each eliminator is a unary operator.
  // This is a well-formedness check prior to checking that the match expression fits the
  // `sumType` of the value we are matching on.
  const validatedFields: Either<ErrorTree, [string, QuintType]>[] = []
  const fieldValidationError = (msg: string) =>
    validatedFields.push(
      left(buildErrorLeaf(`Generating match constraints for ${labelsAndcases.map(a => expressionToString(a[0]))}`, msg))
    )
  let wildCardMatch = false
  for (const [[labelExpr, _labelType], [elimExpr, elimType]] of labelAndElimPairs) {
    labelExpr.kind !== 'str'
      ? fieldValidationError(
          `Match variant name must be a string literal but it is a ${labelExpr.kind}: ${expressionToString(labelExpr)}`
        )
      : elimType.kind !== 'oper'
      ? fieldValidationError(
          `Match case eliminator must be an operator expression but it is a ${elimType.kind}: ${expressionToString(
            elimExpr
          )}`
        )
      : elimType.args.length !== 1
      ? fieldValidationError(
          `Match case eliminator must be a unary operator but it is an operator of ${
            elimType.args.length
          } arguments: ${expressionToString(elimExpr)}`
        )
      : !wildCardMatch && labelExpr.value === '_'
      ? (wildCardMatch = true) // The wildcard case, `_ => foo`, means we can match anything else
      : wildCardMatch // There should only ever be 1 wildcard match, and it should be the last case
      ? fieldValidationError(
          `Invalid wildcard match ('_') in match expression: ${expressionToString(
            elimExpr
          )}. Only one wildcard can appear and it must be the final case of a match.`
        )
      : validatedFields.push(right([labelExpr.value, elimType.args[0]])) // label and associated type of a variant case
  }

  // TODO: Support more expressive and informative type errors.
  //       This will require tying into the constraint checking system.
  //       See https://github.com/informalsystems/quint/issues/1231
  return mergeInMany(validatedFields).map((fields: [string, QuintType][]): Constraint[] => {
    // Form a constraint ensuring that the match expression fits the sum-type it is applied to:
    const matchCaseType = wildCardMatch ? sumType(fields, `${resultTypeVar.name}_wildcard`) : sumType(fields) // The sum-type implied by the match elimination cases.
    // s ~ < i1 : t1, ..., in : tn > )
    const variantTypeIsMatchCaseType: Constraint = { kind: 'eq', types: [variantType, matchCaseType], sourceId: id }

    // Form a set of constraints ensuring that all the result types of the match cases are the same:
    // We extract just the types of the eliminator operators, which we've ensured are operators during field validation.
    const eliminatorOpResultTypes = labelAndElimPairs.map(([_, elim]) => (elim[1] as QuintOperType).res)
    // These equality constraints implement the fact that all return values of cases, and the value of
    // the match expression as a whole, are of the same type, `t`
    const resultTypesAreEqual: Constraint[] = []
    for (const resultType of eliminatorOpResultTypes) {
      resultTypesAreEqual.push({ kind: 'eq', types: [resultTypeVar, resultType], sourceId: id })
    }

    return [variantTypeIsMatchCaseType, ...resultTypesAreEqual]
  })
}
