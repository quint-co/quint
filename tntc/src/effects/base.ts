/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Essentials for handling Effects: types, interfaces and unification
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { effectToString, variablesToString } from './printing'
import { Either, merge, right, left, mergeInMany } from '@sweet-monads/either'
import { applySubstitution, compose, Substitutions } from './substitutions'
import { ErrorTree, Error, buildErrorTree, buildErrorLeaf } from '../errorTree'
import { flattenUnions, simplifyConcreteEffect } from './simplification'
import isEqual from 'lodash.isequal'

/* Concrete atomic efects specifying variables that the expression reads and updates */
export interface ConcreteEffect { kind: 'concrete', read: Variables, update: Variables }

/* Arrow effects for expressions with effects depending on parameters */
interface ArrowEffect { kind: 'arrow', params: Effect[], result: Effect }

/*
 * The effect of a TNT expression, regarding which state variables are read
 * and/or updated
 */
export type Effect =
  /* A quantification variable, referring to an effect */
  | { kind: 'quantified', name: string }
  | ConcreteEffect
  | ArrowEffect
  | { kind: 'temporal' }

/*
 * The variables an effect acts upon. Either a list of state variables, a
 * quantification over them or a combination of other variables.
 * Uses the plural form since all forms represent a plurality of variables.
 */
export type Variables =
  /* A list of state variables */
  | { kind: 'concrete', vars: string[] }
  /* A quantification variable, referring to an array of state variables, to be substituted */
  | { kind: 'quantified', name: string }
  /* A combination of variables to be computed as a union when concrete */
  | { kind: 'union', variables: Variables[] }

/*
 * An effect signature, which can vary according to the number of arguments.
 * Signatures assume an additional level of quantification over all names and
 * should be instantiated before being used
 */
export type Signature = (arity: number) => Effect

/*
 * A quantified name that can refer either to an effect or a variable
 */
interface Name {
  kind: 'effect' | 'variable'
  name: string
}

/*
 * A shortcut to writting the empty set of variables
 */
export const emptyVariables: Variables = { kind: 'concrete', vars: [] }

/**
 * Unifies two effects by matching effect types and unifying their variables.
 *
 * @param ea an effect to be unified
 * @param eb the effect to be unified with
 *
 * @returns an array of substitutions that unifies both effects, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unify (ea: Effect, eb: Effect): Either<ErrorTree, Substitutions> {
  const location = `Trying to unify ${effectToString(ea)} and ${effectToString(eb)}`

  const simplificationResults = mergeInMany([ea, eb].map(e => {
    return e.kind === 'concrete' ? simplifyConcreteEffect(e) : right(e)
  }))
  return simplificationResults.chain(([e1, e2]): Either<Error, Substitutions> => {
    if (e1.kind === 'arrow' && e2.kind === 'arrow') {
      return unifyArrows(location, e1, e2)
    } else if (e1.kind === 'concrete' && e2.kind === 'concrete') {
      return unifyConcrete(location, e1, e2)
    } else if (e1.kind === 'temporal' && e2.kind === 'temporal') {
      return right([])
    } else if (e1.kind === 'quantified') {
      return bindEffect(e1.name, e2)
        .mapLeft(msg => buildErrorLeaf(location, msg))
    } else if (e2.kind === 'quantified') {
      return bindEffect(e2.name, e1)
        .mapLeft(msg => buildErrorLeaf(location, msg))
    } else {
      return left({
        location: location,
        message: "Can't unify different types of effects",
        children: [],
      })
    }
  }).mapLeft(error => buildErrorTree(location, error))
}

/**
 * Finds all names that occur in an effect
 *
 * @param effect the Effect to have its names found
 *
 * @returns a list of names with all quantified names for effects and variables
 * in the given effect
 */
export function effectNames (effect: Effect): Name[] {
  switch (effect.kind) {
    case 'concrete': return variablesNames(effect.read).concat(variablesNames(effect.update))
    case 'arrow': return effect.params.flatMap(effectNames).concat(effectNames(effect.result))
    case 'quantified': return [{ kind: 'effect', name: effect.name }]
    case 'temporal': return []
  }
}

function bindEffect (name: string, effect: Effect): Either<string, Substitutions> {
  if (effectNames(effect).some(n => n.kind === 'effect' && n.name === name)) {
    return left(`Can't bind ${name} to ${effectToString(effect)}: cyclical binding`)
  } else {
    return right([{ kind: 'effect', name: name, value: effect }])
  }
}

function bindVariables (name: string, variables: Variables): Either<string, Substitutions> {
  if (variablesNames(variables).some(n => n.kind === 'variable' && n.name === name)) {
    return left(`Can't bind ${name} to ${variablesToString(variables)}: cyclical binding`)
  } else {
    return right([{ kind: 'variable', name: name, value: variables }])
  }
}

function variablesNames (variables: Variables): Name[] {
  switch (variables.kind) {
    case 'concrete': return []
    case 'quantified': return [{ kind: 'variable', name: variables.name }]
    case 'union': return variables.variables.flatMap(variablesNames)
  }
}

function unifyArrows (location: string, e1: ArrowEffect, e2: ArrowEffect) {
  if (e1.params.length !== e2.params.length) {
    const expected = e1.params.length
    const got = e2.params.length
    return left({
      location: location,
      message: `Expected ${expected} arguments, got ${got}`,
      children: [],
    })
  }

  function applySubstitutionsAndUnify (subs: Substitutions, e1: Effect, e2: Effect): Either<Error, Substitutions> {
    const effectsWithSubstitutions = mergeInMany([
      applySubstitution(subs, e1),
      applySubstitution(subs, e2),
    ])
    const newSubstitutions = effectsWithSubstitutions.chain(es => unify(...es))
    return newSubstitutions.chain(newSubs => compose(subs, newSubs))
  }

  const paramsUnification = e1.params.reduce((result: Either<Error, Substitutions>, e, i) => {
    return result.chain(subs => applySubstitutionsAndUnify(subs, e, e2.params[i]))
  }, right([]))

  return paramsUnification.chain(subs => applySubstitutionsAndUnify(subs, e1.result, e2.result))
}

function unifyConcrete (_location: string, e1: ConcreteEffect, e2: ConcreteEffect) {
  const readUnificationResult = unifyVariables(e1.read, e2.read)
  const updateUnificationResult = readUnificationResult.chain(subs => {
    const effectsWithReadSubstitution = mergeInMany([
      applySubstitution(subs, e1),
      applySubstitution(subs, e2),
    ]).map(effects => effects.map(ensureConcreteEffect))

    return effectsWithReadSubstitution.chain(([e1s, e2s]) => unifyVariables(e1s.update, e2s.update))
  })

  return merge([readUnificationResult, updateUnificationResult]).map(s => s.flat())
}

function unifyVariables (va: Variables, vb: Variables): Either<ErrorTree, Substitutions> {
  const v1 = flattenUnions(va)
  const v2 = flattenUnions(vb)
  const location = `Trying to unify variables [${variablesToString(v1)}] and [${variablesToString(v2)}]`

  if (v1.kind === 'concrete' && v2.kind === 'concrete') {
    // Both state
    if (isEqual(new Set(v1.vars), new Set(v2.vars))) {
      return right([])
    } else {
      return left({
        location: location,
        message: `Expected variables [${v1.vars}] and [${v2.vars}] to be the same`,
        children: [],
      })
    }
  } else if (v1.kind === 'quantified' && v2.kind === 'quantified' && v1.name === v2.name) {
    return right([])
  } else if (v1.kind === 'quantified') {
    return bindVariables(v1.name, v2)
      .mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (v2.kind === 'quantified') {
    return bindVariables(v2.name, v1)
      .mapLeft(msg => buildErrorLeaf(location, msg))
  } else {
    if (JSON.stringify(v1) === JSON.stringify(v2)) {
      return right([])
    }

    // At least one of the variables is a union
    // Unifying sets is complicated and we should never have to do this in TNT's
    // use case for this effect system
    return left({
      location: location,
      message: 'Unification for unions of variables is not implemented',
      children: [],
    })
  }
}

// Ensure the type system that an effect has the 'concrete' kind
function ensureConcreteEffect (e: Effect): ConcreteEffect {
  if (e.kind !== 'concrete') {
    throw new Error(`Unexpected format on ${effectToString(e)} - should have kind 'concrete'`)
  }

  return e
}
