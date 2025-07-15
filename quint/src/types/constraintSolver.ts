/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Constraint solving for Quint's type system by unifying equality constraints
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree } from '../errorTree'
import { rowToString, typeToString } from '../ir/IRprinting'
import { QuintConstType, QuintType, Row, rowNames, typeNames } from '../ir/quintTypes'
import { Constraint, compareConstraints } from './base'
import { Substitutions, applySubstitution, applySubstitutionToConstraint, compose } from './substitutions'
import { unzip } from 'lodash'
import { LookupTable } from '../names/base'
import { simplifyRow } from './simplification'

/*
 * Try to solve a constraint by unifying all pairs of types in equality
 * constraints inside it.
 *
 * @param table the lookup table for the module
 * @param constraint the constraint to be solved
 *
 * @returns the substitutions from the unifications, if successful. Otherwise, a
 *          map from source ids to errors.
 */
export function solveConstraint(
  table: LookupTable,
  constraint: Constraint
): Either<Map<bigint, ErrorTree>, Substitutions> {
  const errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()
  switch (constraint.kind) {
    case 'empty':
      return right([])
    case 'eq':
      return unify(table, constraint.types[0], constraint.types[1]).mapLeft(e => {
        errors.set(constraint.sourceId, e)
        return errors
      })
    case 'conjunction': {
      // Chain solving of inner constraints, collecting all errors (even after the first failure)
      return constraint.constraints
        .sort(compareConstraints)
        .reduce((result: Either<Map<bigint, ErrorTree>, Substitutions>, con) => {
          // If previous result is a failure, try to solve the original constraint
          // to gather all errors instead of just propagating the first one
          let newCons = con
          result.map(s => {
            newCons = applySubstitutionToConstraint(table, s, con)
          })
          return solveConstraint(table, newCons)
            .mapLeft(e => {
              e.forEach((error, id) => errors.set(id, error))
              return errors
            })
            .chain(newSubs => result.map(s => compose(table, newSubs, s)))
        }, right([]))
    }
    case 'isDefined': {
      for (const def of table.values()) {
        if (def.kind === 'typedef' && def.type) {
          const subst = unify(table, def.type, constraint.type)
          if (subst.isRight()) {
            // We found a defined type unifying with the given schema
            return right(subst.unwrap())
          }
        }
      }
      errors.set(
        constraint.sourceId,
        buildErrorLeaf(
          `Looking for defined type unifying with ${typeToString(constraint.type)}`,
          'Expected type is not defined'
        )
      )
      return left(errors)
    }
  }
}

/**
 * Unifies two Quint types
 *
 * @param t1 a type to be unified
 * @param t2 the type to be unified with
 *
 * @returns an array of substitutions that unifies both types, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unify(table: LookupTable, t1: QuintType, t2: QuintType): Either<ErrorTree, Substitutions> {
  const location = `Trying to unify ${typeToString(t1)} and ${typeToString(t2)}`

  if (typeToString(t1) === typeToString(t2)) {
    return right([])
  } else if (t1.kind === 'var') {
    return bindType(t1.name, t2).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (t2.kind === 'var') {
    return bindType(t2.name, t1).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (t1.kind === 'oper' && t2.kind === 'oper') {
    return checkSameLength(location, t1.args, t2.args)
      .chain(([args1, args2]) => chainUnifications(table, [...args1, t1.res], [...args2, t2.res]))
      .mapLeft(error => buildErrorTree(location, error))
  } else if (t1.kind === 'set' && t2.kind === 'set') {
    return unify(table, t1.elem, t2.elem)
  } else if (t1.kind === 'list' && t2.kind === 'list') {
    return unify(table, t1.elem, t2.elem)
  } else if (t1.kind === 'fun' && t2.kind === 'fun') {
    const result = unify(table, t1.arg, t2.arg)
    return result.chain(subs => {
      const subs2 = unify(table, applySubstitution(table, subs, t1.res), applySubstitution(table, subs, t2.res))
      return subs2.map(s => compose(table, subs, s))
    })
  } else if (t1.kind === 'tup' && t2.kind === 'tup') {
    return unifyRows(table, t1.fields, t2.fields).mapLeft(error => buildErrorTree(location, error))
  } else if (t1.kind === 'const') {
    return unifyWithAlias(table, t1, t2)
  } else if (t2.kind === 'const') {
    return unifyWithAlias(table, t2, t1)
  } else if ((t1.kind === 'rec' && t2.kind === 'rec') || (t1.kind === 'sum' && t2.kind === 'sum')) {
    return unifyRows(table, t1.fields, t2.fields).mapLeft(error => buildErrorTree(location, error))
  } else {
    return left(buildErrorLeaf(location, `Couldn't unify ${t1.kind} and ${t2.kind}`))
  }
}

/**
 * Unifies two Quint rows
 *
 * @param r1 a row to be unified
 * @param r2 the row to be unified with
 *
 * @returns an array of substitutions that unifies both rows, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unifyRows(table: LookupTable, r1: Row, r2: Row): Either<ErrorTree, Substitutions> {
  // The unification algorithm assumes that rows are simplified to a normal form.
  // That means that the `other` field is either a row variable or an empty row
  // and `fields` is never an empty list
  const ra = simplifyRow(r1)
  const rb = simplifyRow(r2)

  const location = `Trying to unify ${rowToString(ra)} and ${rowToString(rb)}`

  // Standard comparison and variable binding
  if (rowToString(ra) === rowToString(rb)) {
    return right([])
  } else if (ra.kind === 'var') {
    return bindRow(ra.name, rb).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (rb.kind === 'var') {
    return bindRow(rb.name, ra).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (ra.kind === 'row' && rb.kind === 'row') {
    // Both rows are normal rows, so we need to compare their fields
    const sharedFieldNames = ra.fields.map(f => f.fieldName).filter(n => rb.fields.some(f => n === f.fieldName))

    if (sharedFieldNames.length === 0) {
      // No shared fields, so we can just bind the tails, if they exist and are different.
      if (ra.other.kind === 'var' && rb.other.kind === 'var' && ra.other.name !== rb.other.name) {
        // The result should be { ra.fields + rb.fields, tailVar }
        const tailVar: Row = { kind: 'var', name: `$${ra.other.name}$${rb.other.name}` }
        const s1 = bindRow(ra.other.name, { ...rb, other: tailVar })
        const s2 = bindRow(rb.other.name, { ...ra, other: tailVar })
        // These bindings + composition should always succeed. I couldn't find a scenario where they don't.
        return s1.chain(sa => s2.map(sb => compose(table, sa, sb))).mapLeft(msg => buildErrorLeaf(location, msg))
      } else {
        return left(
          buildErrorLeaf(
            location,
            `Incompatible tails for rows with disjoint fields: ${rowToString(ra.other)} and ${rowToString(rb.other)}`
          )
        )
      }
    } else {
      // There are shared fields.
      const uniqueFields1 = ra.fields.filter(f => !sharedFieldNames.includes(f.fieldName))
      const uniqueFields2 = rb.fields.filter(f => !sharedFieldNames.includes(f.fieldName))

      // Unify the disjoint fields with tail variables
      // This call will fit in the above case of row unification
      const tailSubs = unifyRows(table, { ...ra, fields: uniqueFields1 }, { ...rb, fields: uniqueFields2 })

      // Sort shared fields by field name, and get their types
      const fieldTypes: [QuintType, QuintType][] = sharedFieldNames.map(n => {
        const f1 = ra.fields.find(f => f.fieldName === n)!
        const f2 = rb.fields.find(f => f.fieldName === n)!
        return [f1.fieldType, f2.fieldType]
      })

      // Now, for each shared field, we need to unify the types
      const fieldSubs = chainUnifications(table, ...(unzip(fieldTypes) as [QuintType[], QuintType[]]))

      // Return the composition of the two substitutions
      return tailSubs
        .chain(subs => fieldSubs.map(s => compose(table, subs, s)))
        .mapLeft(error => buildErrorTree(location, error))
    }
  } else {
    return left(buildErrorLeaf(location, `Couldn't unify ${ra.kind} and ${rb.kind}`))
  }
}

function unifyWithAlias(table: LookupTable, t1: QuintConstType, t2: QuintType) {
  const aliasValue = t1.id ? table.get(t1.id) : undefined
  if (aliasValue?.kind !== 'typedef') {
    return left(
      buildErrorLeaf(`Trying to unify ${t1.name} and ${typeToString(t2)}`, `Couldn't find type alias ${t1.name}`)
    )
  }

  if (!aliasValue.type) {
    return left(
      buildErrorLeaf(
        `Trying to unify ${t1.name} and ${typeToString(t2)}`,
        `Couldn't unify uninterpreted type ${t1.name} with different type`
      )
    )
  }

  return unify(table, aliasValue.type, t2)
}

function bindType(name: string, type: QuintType): Either<string, Substitutions> {
  if (typeNames(type).typeVariables.has(name)) {
    return left(`Can't bind ${name} to ${typeToString(type)}: cyclical binding`)
  } else {
    return right([{ kind: 'type', name: name, value: type }])
  }
}

function bindRow(name: string, row: Row): Either<string, Substitutions> {
  if (rowNames(row).has(name)) {
    return left(`Can't bind ${name} to ${rowToString(row)}: cyclical binding`)
  } else {
    return right([{ kind: 'row', name: name, value: row }])
  }
}

function applySubstitutionsAndUnify(
  table: LookupTable,
  subs: Substitutions,
  t1: QuintType,
  t2: QuintType
): Either<Error, Substitutions> {
  const newSubstitutions = unify(table, applySubstitution(table, subs, t1), applySubstitution(table, subs, t2))
  return newSubstitutions.map(newSubs => compose(table, newSubs, subs))
}

function checkSameLength(
  location: string,
  types1: QuintType[],
  types2: QuintType[]
): Either<Error, [QuintType[], QuintType[]]> {
  if (types1.length !== types2.length) {
    return left(buildErrorLeaf(location, `Expected ${types1.length} arguments, got ${types2.length}`))
  }

  return right([types1, types2])
}

function chainUnifications(table: LookupTable, types1: QuintType[], types2: QuintType[]): Either<Error, Substitutions> {
  return types1.reduce((result: Either<Error, Substitutions>, t, i) => {
    return result.chain(subs => applySubstitutionsAndUnify(table, subs, t, types2[i]))
  }, right([]))
}
