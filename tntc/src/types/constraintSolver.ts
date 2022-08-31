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
import { buildErrorLeaf, buildErrorTree, ErrorTree, Error } from '../errorTree'
import { typeToString } from '../IRprinting'
import { TntType, typeNames } from '../tntTypes'
import { Constraint } from './base'
import { applySubstitution, applySubstitutionToConstraint, compose, Substitutions } from './substitutions'

/*
 * Try to solve a constraint by unifying all pairs of types in equality
 * constraints inside it.
 *
 * @param constraint the constraint to be solved
 *
 * @returns the substitutions from the unifications, if successful. Otherwise, a
 *          map from source ids to errors.
 */
export function solveConstraint (constraint: Constraint): Either<Map<bigint, ErrorTree>, Substitutions> {
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
export function unify (t1: TntType, t2: TntType): Either<ErrorTree, Substitutions> {
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
  } else if (t1.kind === 'seq' && t2.kind === 'seq') {
    return unify(t1.elem, t2.elem)
  } else if (t1.kind === 'fun' && t2.kind === 'fun') {
    const result = unify(t1.arg, t2.arg)
    return result.chain(subs => {
      const subs2 = unify(applySubstitution(subs, t1.res), applySubstitution(subs, t2.res))
      return subs2.map(s => compose(subs, s))
    })
  } else if (t1.kind === 'tuple' && t2.kind === 'tuple') {
    return checkSameLength(location, t1.elems, t2.elems)
      .chain(([elems1, elems2]) => chainUnifications(elems1, elems2))
      .mapLeft(error => buildErrorTree(location, error))
  } else {
    return left(buildErrorLeaf(
      location,
      `Couldn't unify ${t1.kind} and ${t2.kind}`
    ))
  }
}

function bindType (name: string, type: TntType): Either<string, Substitutions> {
  if (typeNames(type).has(name)) {
    return left(`Can't bind ${name} to ${typeToString(type)}: cyclical binding`)
  } else {
    return right([{ name: name, value: type }])
  }
}

function applySubstitutionsAndUnify (subs: Substitutions, t1: TntType, t2: TntType): Either<Error, Substitutions> {
  const newSubstitutions = unify(
    applySubstitution(subs, t1),
    applySubstitution(subs, t2)
  )
  return newSubstitutions.map(newSubs => compose(newSubs, subs))
}

function checkSameLength (location: string, types1: TntType[], types2: TntType[]): Either<Error, [TntType[], TntType[]]> {
  if (types1.length !== types2.length) {
    const expected = types1.length
    const got = types2.length
    return left({
      location: location,
      message: `Expected ${expected} arguments, got ${got}`,
      children: [],
    })
  }

  return right([types1, types2])
}

function chainUnifications (types1: TntType[], types2: TntType[]): Either<Error, Substitutions> {
  return types1.reduce((result: Either<Error, Substitutions>, t, i) => {
    return result.chain(subs => applySubstitutionsAndUnify(subs, t, types2[i]))
  }, right([]))
}
