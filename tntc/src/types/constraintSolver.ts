/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Constraint solving for TNT's type system by unifying equality constraints
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree } from '../errorTree'
import { rowToString, typeToString } from '../IRprinting'
import { Row, TntType, rowNames, typeNames } from '../tntTypes'
import { Constraint } from './base'
import { Substitutions, applySubstitution, applySubstitutionToConstraint, compose } from './substitutions'
import { unzip } from 'lodash'

/*
 * Try to solve a constraint by unifying all pairs of types in equality
 * constraints inside it.
 *
 * @param constraint the constraint to be solved
 *
 * @returns the substitutions from the unifications, if successful. Otherwise, a
 *          map from source ids to errors.
 */
export function solveConstraint(constraint: Constraint): Either<Map<bigint, ErrorTree>, Substitutions> {
  const errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()
  switch (constraint.kind) {
    case 'eq': return unify(constraint.types[0], constraint.types[1]).mapLeft(e => {
      errors.set(constraint.sourceId, e)
      return errors
    })
    case 'conjunction': {
      // Chain solving of inner constraints, collecting all errors (even after the first failure)
      return constraint.constraints.reduce((result: Either<Map<bigint, ErrorTree>, Substitutions>, con) => {
        // If previous result is a failure, try to solve the original constraint
        // to gather all errors instead of just propagating the first one
        let newCons = con
        result.map(s => {
          newCons = applySubstitutionToConstraint(s, con)
        })
        return solveConstraint(newCons)
          .mapLeft(e => {
            e.forEach((error, id) => errors.set(id, error))
            return errors
          })
          .chain(newSubs => result.map(s => compose(newSubs, s)))
      }, right([]))
    }
    case 'empty': return right([])
  }
}

/**
 * Unifies two TNT types
 *
 * @param t1 a type to be unified
 * @param t2 the type to be unified with
 *
 * @returns an array of substitutions that unifies both types, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unify(t1: TntType, t2: TntType): Either<ErrorTree, Substitutions> {
  // TODO: resolve type aliases
  const location = `Trying to unify ${typeToString(t1)} and ${typeToString(t2)}`

  if (typeToString(t1) === typeToString(t2)) {
    return right([])
  } else if (t1.kind === 'var') {
    return bindType(t1.name, t2).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (t2.kind === 'var') {
    return bindType(t2.name, t1).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (t1.kind === 'oper' && t2.kind === 'oper') {
    return checkSameLength(location, t1.args, t2.args)
      .chain(([args1, args2]) => chainUnifications([...args1, t1.res], [...args2, t2.res]))
      .mapLeft(error => buildErrorTree(location, error))
  } else if (t1.kind === 'set' && t2.kind === 'set') {
    return unify(t1.elem, t2.elem)
  } else if (t1.kind === 'list' && t2.kind === 'list') {
    return unify(t1.elem, t2.elem)
  } else if (t1.kind === 'fun' && t2.kind === 'fun') {
    const result = unify(t1.arg, t2.arg)
    return result.chain(subs => {
      const subs2 = unify(applySubstitution(subs, t1.res), applySubstitution(subs, t2.res))
      return subs2.map(s => compose(subs, s))
    })
  } else if (t1.kind === 'tup' && t2.kind === 'tup') {
    return unifyRows(t1.fields, t2.fields)
      .mapLeft(error => buildErrorTree(location, error))
  } else if (t1.kind === 'const' || t2.kind === 'const') {
    // FIXME: Type aliases unify with anything for now
    return right([])
  } else if (t1.kind === 'rec' && t2.kind === 'rec') {
    return unifyRows(t1.fields, t2.fields)
      .mapLeft(error => buildErrorTree(location, error))
  } else {
    return left(buildErrorLeaf(
      location,
      `Couldn't unify ${t1.kind} and ${t2.kind}`
    ))
  }
}

/**
 * Unifies two TNT rows
 *
 * @param r1 a row to be unified
 * @param r2 the row to be unified with
 *
 * @returns an array of substitutions that unifies both rows, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unifyRows(r1: Row, r2: Row): Either<ErrorTree, Substitutions> {
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
        return s1.chain(sa => s2.map(sb => compose(sa, sb)))
          .mapLeft(msg => buildErrorLeaf(location, msg))
      } else {
        return left(buildErrorLeaf(
          location,
          `Incompatible tails for rows with disjoint fields: ${rowToString(ra.other)} and ${rowToString(rb.other)}`
        ))
      }
    } else {
      // There are shared fields.
      const uniqueFields1 = ra.fields.filter(f => !sharedFieldNames.includes(f.fieldName))
      const uniqueFields2 = rb.fields.filter(f => !sharedFieldNames.includes(f.fieldName))

      // Unify the disjoint fields with tail variables
      // This call will fit in the above case of row unification
      const tailSubs = unifyRows({ ...ra, fields: uniqueFields1 }, { ...rb, fields: uniqueFields2 })

      // Sort shared fields by field name, and get the their types
      const fieldTypes: [TntType, TntType][] = sharedFieldNames.map(n => {
        const f1 = ra.fields.find(f => f.fieldName === n)!
        const f2 = rb.fields.find(f => f.fieldName === n)!
        return [f1.fieldType, f2.fieldType]
      })

      // Now, for each shared field, we need to unify the types
      const fieldSubs = chainUnifications(...unzip(fieldTypes) as [TntType[], TntType[]])

      // Return the composition of the two substitutions
      return tailSubs.chain(subs => fieldSubs.map(s => compose(subs, s)))
        .mapLeft(error => buildErrorTree(location, error))
    }
  } else {
    return left(buildErrorLeaf(location, `Couldn't unify ${ra.kind} and ${rb.kind}`))
  }
}

function bindType(name: string, type: TntType): Either<string, Substitutions> {
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

function applySubstitutionsAndUnify(subs: Substitutions, t1: TntType, t2: TntType): Either<Error, Substitutions> {
  const newSubstitutions = unify(
    applySubstitution(subs, t1),
    applySubstitution(subs, t2)
  )
  return newSubstitutions.map(newSubs => compose(newSubs, subs))
}

function checkSameLength(
  location: string, types1: TntType[], types2: TntType[]
): Either<Error, [TntType[], TntType[]]> {
  if (types1.length !== types2.length) {
    return tryToUnpack(location, types1, types2)
  }

  return right([types1, types2])
}

function chainUnifications(types1: TntType[], types2: TntType[]): Either<Error, Substitutions> {
  return types1.reduce((result: Either<Error, Substitutions>, t, i) => {
    return result.chain(subs => applySubstitutionsAndUnify(subs, t, types2[i]))
  }, right([]))
}

function simplifyRow(r: Row): Row {
  if (r.kind !== 'row') {
    return r
  }

  let result = r
  const otherSimplified = simplifyRow(r.other)
  if (otherSimplified.kind === 'row') {
    result = { kind: 'row', fields: r.fields.concat(otherSimplified.fields), other: otherSimplified.other }
  }

  if (result.fields.length > 0) {
    return result
  } else {
    return otherSimplified
  }
}

function tryToUnpack(
  location: string, types1: TntType[], types2: TntType[]
): Either<ErrorTree, [TntType[], TntType[]]> {
  // Ensure that types1 is always the smallest
  if (types2.length < types1.length) {
    return tryToUnpack(location, types2, types1)
  }
  
  // We only handle unpacking 1 tuple into N args
  if (types1.length === 1 && types1[0].kind === 'tup') {
    const row = types1[0].fields
    if (row.kind === 'row' && row.fields.length === types2.length) {
      return right([row.fields.map(f => f.fieldType), types2])
    }
  }


  return left(buildErrorLeaf(location, `Expected ${types2.length} arguments, got ${types1.length}`))
}
