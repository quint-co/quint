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
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Substitutions, applySubstitution, compose } from './substitutions'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree } from '../errorTree'
import { flattenUnions, simplify } from './simplification'
import isEqual from 'lodash.isequal'

/* Concrete atomic efects specifying variables that the expression reads and updates */
export interface ConcreteEffect { kind: 'concrete', read: Variables, update: Variables, temporal: Variables }

/* Arrow effects for expressions with effects depending on parameters */
export interface ArrowEffect { kind: 'arrow', params: Effect[], result: Effect }

/* A quantification variable, referring to an effect */
export interface QuantifiedEffect { kind: 'quantified', name: string }

/*
 * The effect of a TNT expression, regarding which state variables are read
 * and/or updated
 */
export type Effect =
  | ConcreteEffect
  | ArrowEffect
  | QuantifiedEffect

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
export type Signature = (_arity: number) => Effect

/*
 * A quantified name that can refer either to an effect or a variable
 */
export interface Name {
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
export function unify(ea: Effect, eb: Effect): Either<ErrorTree, Substitutions> {
  const location = `Trying to unify ${effectToString(ea)} and ${effectToString(eb)}`

  const simplificationResults = mergeInMany([ea, eb].map(simplify))
  return simplificationResults.chain(([e1, e2]): Either<Error, Substitutions> => {
    if (effectToString(e1) === effectToString(e2)) {
      return right([])
    } else if (e1.kind === 'arrow' && e2.kind === 'arrow') {
      return unifyArrows(location, e1, e2)
    } else if (e1.kind === 'concrete' && e2.kind === 'concrete') {
      return unifyConcrete(location, e1, e2)
    } else if (e1.kind === 'quantified') {
      return bindEffect(e1.name, e2)
        .mapLeft(msg => buildErrorLeaf(location, msg))
    } else if (e2.kind === 'quantified') {
      return bindEffect(e2.name, e1)
        .mapLeft(msg => buildErrorLeaf(location, msg))
    } else {
      return left({
        location,
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
export function effectNames(effect: Effect): Name[] {
  switch (effect.kind) {
    case 'concrete':
      return variablesNames(effect.read)
        .concat(variablesNames(effect.update))
        .concat(variablesNames(effect.temporal))
    case 'arrow': return effect.params.flatMap(effectNames).concat(effectNames(effect.result))
    case 'quantified': return [{ kind: 'effect', name: effect.name }]
  }
}

function bindEffect(name: string, effect: Effect): Either<string, Substitutions> {
  if (effectNames(effect).some(n => n.kind === 'effect' && n.name === name)) {
    return left(`Can't bind ${name} to ${effectToString(effect)}: cyclical binding`)
  } else {
    return right([{ kind: 'effect', name, value: effect }])
  }
}

function bindVariables(name: string, variables: Variables): Either<string, Substitutions> {
  if (variablesNames(variables).some(n => n.kind === 'variable' && n.name === name)) {
    return left(`Can't bind ${name} to ${variablesToString(variables)}: cyclical binding`)
  } else {
    return right([{ kind: 'variable', name, value: variables }])
  }
}

function variablesNames(variables: Variables): Name[] {
  switch (variables.kind) {
    case 'concrete': return []
    case 'quantified': return [{ kind: 'variable', name: variables.name }]
    case 'union': return variables.variables.flatMap(variablesNames)
  }
}

function unifyArrows(location: string, e1: ArrowEffect, e2: ArrowEffect): Either<ErrorTree, Substitutions> {
  return right([e1.params, e2.params])
    .chain(params => {
      const [p1, p2] = params
      if (p1.length === p2.length) {
        return right(params)
      } else {
        return tryToUnpack(location, p1, p2)
      }
    })
    .chain(params => {
      const [p1, p2] = params
      const [arrow1, subs1] = simplifyArrowEffect(p1, e1.result)
      const [arrow2, subs2] = simplifyArrowEffect(p2, e2.result)
      const subs = compose(subs1, subs2)
      return arrow1.params.reduce((result: Either<Error, Substitutions>, e, i) => {
        return result.chain(subs => applySubstitutionsAndUnify(subs, e, arrow2.params[i]))
      }, subs)
        .chain(subs => applySubstitutionsAndUnify(subs, arrow1.result, arrow2.result))
        .mapLeft(err => buildErrorTree(location, err))
    })
}

function unifyConcrete(location: string, e1: ConcreteEffect, e2: ConcreteEffect): Either<Error, Substitutions> {
  const readUnificationResult = unifyVariables(e1.read, e2.read)
  return readUnificationResult.chain(subs => {
    const effectsWithReadSubstitution = mergeInMany([
      applySubstitution(subs, e1),
      applySubstitution(subs, e2),
    ]).map(effects => effects.map(ensureConcreteEffect))

    if ((isTemporal(e1) && isAction(e2)) || (isAction(e1) && isTemporal(e2))) {
      return left(`Couldn't unify temporal and action effects: ${effectToString(e1)} and ${effectToString(e2)}` as Error)
    }

    const otherUnificationResult = effectsWithReadSubstitution.chain(([e1s, e2s]) => {
      if (isAction(e1s) || isAction(e2s)) {
        return unifyVariables(e1s.update, e2s.update)
      } else {
        return unifyVariables(e1s.temporal, e2s.temporal)
      }
    })

    return otherUnificationResult.chain(r => compose(r, subs)).mapLeft(e => buildErrorTree(location, e))
  })
}

export function isTemporal(e: ConcreteEffect): boolean {
  switch (e.temporal.kind) {
    case 'concrete': return e.temporal.vars.length > 0
    case 'quantified': return true
    case 'union': return e.temporal.variables.length > 0
  }
}

export function isAction(e: ConcreteEffect): boolean {
  switch (e.update.kind) {
    case 'concrete': return e.update.vars.length > 0
    case 'quantified': return true
    case 'union': return e.update.variables.length > 0
  }
}

export function isState(e: ConcreteEffect): boolean {
  switch (e.read.kind) {
    case 'concrete': return e.read.vars.length > 0
    case 'quantified': return true
    case 'union': return e.read.variables.length > 0
  }
}

export function unifyVariables(va: Variables, vb: Variables): Either<ErrorTree, Substitutions> {
  const v1 = flattenUnions(va)
  const v2 = flattenUnions(vb)
  const location = `Trying to unify variables [${variablesToString(v1)}] and [${variablesToString(v2)}]`

  if (v1.kind === 'concrete' && v2.kind === 'concrete') {
    // Both state
    if (isEqual(new Set(v1.vars), new Set(v2.vars))) {
      return right([])
    } else {
      return left({
        location,
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

    if (v1.kind === 'union' && v2.kind === 'concrete') {
      return mergeInMany(v1.variables.map(v => unifyVariables(v, v2)))
        .map(subs => subs.flat())
        .mapLeft(err => buildErrorTree(location, err))
    }

    if (v1.kind === 'concrete' && v2.kind === 'union') {
      return unifyVariables(v2, v1)
    }

    // At least one of the variables is a union
    // Unifying sets is complicated and we should never have to do this in TNT's
    // use case for this effect system
    return left({
      location,
      message: 'Unification for unions of variables is not implemented',
      children: [],
    })
  }
}

function applySubstitutionsAndUnify(subs: Substitutions, e1: Effect, e2: Effect): Either<Error, Substitutions> {
  return mergeInMany([
    applySubstitution(subs, e1),
    applySubstitution(subs, e2),
  ])
    .chain(effectsWithSubstitutions => unify(...effectsWithSubstitutions))
    .chain(newSubstitutions => compose(newSubstitutions, subs))
}

// Ensure the type system that an effect has the 'concrete' kind
function ensureConcreteEffect(e: Effect): ConcreteEffect {
  if (e.kind !== 'concrete') {
    throw new Error(`Unexpected format on ${effectToString(e)} - should have kind 'concrete'`)
  }

  return e
}

function tryToUnpack(
  location: string, effects1: Effect[], effects2: Effect[]
): Either<ErrorTree, [Effect[], Effect[]]> {
  // Ensure that effects1 is always the smallest
  if (effects2.length < effects1.length) {
    return tryToUnpack(location, effects2, effects1)
  }

  // We only handle unpacking 1 tuple into N args
  if (effects1.length !== 1) {
    return left(buildErrorLeaf(location, `Expected ${effects2.length} arguments, got ${effects1.length}`))
  }

  const read: Variables[] = []
  const update: Variables[] = []
  const temporal: Variables[] = []

  // Combine the other effects into a single effect, to be unified with the unpacked effect 
  effects2.forEach(e => {
    if (e.kind === 'concrete') {
      read.push(e.read)
      update.push(e.update)
      temporal.push(e.temporal)
    } else {
      return left(`Found non concrete efffect while trying to unpack: ${effectToString(e)}`)
    }
  })

  const unpacked: ConcreteEffect = {
    kind: 'concrete',
    read: { kind: 'union', variables: read },
    update: { kind: 'union', variables: update },
    temporal: { kind: 'union', variables: temporal },
  }

  return simplify(unpacked).map(e => [effects1, [e]])
}

/**
 * Simplifies effects of the form (Read[v0, ..., vn]) => Read[v0, ..., vn] into
 * (Read[v0#...#vn]) => Read[v0#...#vn] so the variables can be unified with other
 * sets of variables. All of the variables v0, ..., vn are bound to the single variable 
 * named v0#...#vn. E.g., for variables v0, v1, v2, we will produce the new unique variable 
 * v0#v1#v2 and the bindings v1 |-> v0#v1#v2, v1 |-> v0#v1#v2, v2 |-> v0#v1#v2.
 * This new name could be a fresh variable, but we use an unique name since there is no
 * fresh variable generation in this pure unification environment.
 * 
 * @param params the arrow effect parameters 
 * @param result the arrow effect result 
 * @returns an arrow effect with the new format and the substitutions with binded variables
 */
function simplifyArrowEffect(params: Effect[], result: Effect): [ArrowEffect, Substitutions] {
  if (params.length === 1 && effectToString(params[0]) === effectToString(result) && params[0].kind === 'concrete') {
    const effect = params[0]
    const read: Variables = hashVariables(effect.read)
    const temporal: Variables = hashVariables(effect.temporal)
    const update: Variables = hashVariables(effect.update)

    const arrow: ArrowEffect = { kind: 'arrow', params: [{ kind: 'concrete', read, update, temporal }], result }
    const subs: Substitutions = []
    variablesNames(effect.read).forEach(n => {
      subs.push({ kind: 'variable', name: n.name, value: read })
    })
    variablesNames(effect.temporal).forEach(n => {
      subs.push({ kind: 'variable', name: n.name, value: temporal })
    })
    variablesNames(effect.update).forEach(n => {
      subs.push({ kind: 'variable', name: n.name, value: update })
    })

    return [arrow, subs]
  }

  return [{ kind: 'arrow', params, result }, []]
}

function hashVariables(va: Variables): Variables {
  switch (va.kind) {
    case 'concrete': {
      const name = va.vars.join('#')
      return name === '' ? emptyVariables : { kind: 'quantified', name }
    }
    case 'quantified': return va
    case 'union': {
      const name = va.variables.map(hashVariables).join('#')
      return name === '' ? emptyVariables : { kind: 'quantified', name }
    }
  }
}
