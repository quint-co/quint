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
import { IRVisitor, walkType } from '../IRVisitor'
import { TntOperType, TntTupleType, TntType, TntVarType } from '../tntTypes'
import { applySubstitution, applySubstitutionToConstraint, compose, Substitutions } from './substitutions'

/*
 * A type constraint can be either an equality of two types, a conjunction of
 * constraints or an empty constraint
 */
export type Constraint =
  | { kind: 'eq', types: [TntType, TntType], sourceId: bigint }
  | { kind: 'conjunction', constraints: Constraint[], sourceId: bigint }
  | { kind: 'empty' }

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
    return unifyArrows(location, t1, t2).mapLeft(error => buildErrorTree(location, error))
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
    return unifyTuples(location, t1, t2).mapLeft(error => buildErrorTree(location, error))
  } else {
    return left(buildErrorLeaf(
      location,
      `Couldn't unify ${t1.kind} and ${t2.kind}`
    ))
  }
}

/*
 * Collects all type variable names from a given type
 *
 * @param t the type to have its names collected
 *
 * @returns a list with collected names
 */
export function typeNames (t: TntType): string[] {
  const collector = new TypeNamesCollector()
  walkType(collector, t)
  return collector.names
}

class TypeNamesCollector implements IRVisitor {
  names: string[] = []

  exitVarType (t: TntVarType) {
    this.names.push(t.name)
  }
}

function bindType (name: string, type: TntType): Either<string, Substitutions> {
  if (typeNames(type).includes(name)) {
    return left(`Can't bind ${name} to ${typeToString(type)}: cyclical binding`)
  } else {
    return right([{ name: name, value: type }])
  }
}

function unifyArrows (location: string, t1: TntOperType, t2: TntOperType): Either<Error, Substitutions> {
  if (t1.args.length !== t2.args.length) {
    const expected = t1.args.length
    const got = t2.args.length
    return left({
      location: location,
      message: `Expected ${expected} arguments, got ${got}`,
      children: [],
    })
  }

  return chainUnifications([...t1.args, t1.res], [...t2.args, t2.res])
}

function unifyTuples (location: string, t1: TntTupleType, t2: TntTupleType): Either<Error, Substitutions> {
  if (t1.elems.length !== t2.elems.length) {
    const expected = t1.elems.length
    const got = t2.elems.length
    return left({
      location: location,
      message: `Expected ${expected} arguments, got ${got}`,
      children: [],
    })
  }

  return chainUnifications(t1.elems, t2.elems)
}

function applySubstitutionsAndUnify (subs: Substitutions, t1: TntType, t2: TntType): Either<Error, Substitutions> {
  const newSubstitutions = unify(
    applySubstitution(subs, t1),
    applySubstitution(subs, t2)
  )
  return newSubstitutions.map(newSubs => compose(subs, newSubs))
}

function chainUnifications (types1: TntType[], types2: TntType[]): Either<Error, Substitutions> {
  return types1.reduce((result: Either<Error, Substitutions>, t, i) => {
    return result.chain(subs => applySubstitutionsAndUnify(subs, t, types2[i]))
  }, right([]))
}
