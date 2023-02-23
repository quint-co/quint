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

import { effectComponentToString, effectToString, variablesToString } from './printing'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Substitutions, applySubstitution, applySubstitutionToVariables, compose } from './substitutions'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree } from '../errorTree'
import { flattenUnions, simplify } from './simplification'
import isEqual from 'lodash.isequal'

/* Kinds for concrete effect components */
export type ComponentKind = 'read' | 'update' | 'temporal'

/* A concrete effect component, specifying a kind and the variables it acts upon */
export interface EffectComponent { kind: ComponentKind, variables: Variables }

/* Concrete atomic effects specifying which kinds of effects act upon which variables */
export interface ConcreteEffect { kind: 'concrete', components: EffectComponent[] }

/* Arrow effects for expressions with effects depending on parameters */
export interface ArrowEffect { kind: 'arrow', params: Effect[], result: Effect }

/* A quantification variable, referring to an effect */
export interface QuantifiedEffect { kind: 'quantified', name: string }

/*
 * The effect of a Quint expression, regarding which state variables are read
 * and/or updated
 */
export type Effect =
  | ConcreteEffect
  | ArrowEffect
  | QuantifiedEffect

export type EffectScheme = {
  effect: Effect,
  effectVariables: Set<string>,
  variables: Set<string>,
}

/* A state variable */
export interface StateVariable {
  /* The variable name */
  name: string,
  /* The variable id */
  reference: bigint
}

/*
 * The variables an effect acts upon. Either a list of state variables, a
 * quantification over them or a combination of other variables.
 * Uses the plural form since all forms represent a plurality of variables.
 */
export type Variables =
  /* A list of state variables */
  | { kind: 'concrete', vars: StateVariable[] }
  /* A quantification variable, referring to an array of state variables, to be substituted */
  | { kind: 'quantified', name: string, reference?: bigint }
  /* A combination of variables to be computed as a union when concrete */
  | { kind: 'union', variables: Variables[] }

/*
 * An effect signature, which can vary according to the number of arguments.
 * Signatures assume an additional level of quantification over all names and
 * should be instantiated before being used
 */
export type Signature = (_arity: number) => EffectScheme

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

  const [e1, e2] = [ea, eb].map(simplify)
  if (effectToString(e1) === effectToString(e2)) {
    return right([])
  } else if (e1.kind === 'arrow' && e2.kind === 'arrow') {
    return unifyArrows(location, e1, e2)
  } else if (e1.kind === 'concrete' && e2.kind === 'concrete') {
    return unifyConcrete(location, e1, e2).mapLeft(err => buildErrorTree(location, err))
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
}

/**
 * Finds all names that occur in an effect
 *
 * @param effect the Effect to have its names found
 *
 * @returns a list of names with all quantified names for effects and variables
 * in the given effect
 */
export function effectNames(effect: Effect): { effectVariables: Set<string>, variables: Set<string> } {
  switch (effect.kind) {
    case 'concrete':
      return {
        effectVariables: new Set(),
        variables: new Set(effect.components.flatMap(c => variablesNames(c.variables))),
      }
    case 'arrow': {
      const nested = effect.params.concat(effect.result).flatMap(effectNames)
      return nested.reduce((set, { effectVariables, variables }) => ({
        effectVariables: new Set([...set.effectVariables, ...effectVariables]),
        variables: new Set([...set.variables, ...variables]),
      }), { effectVariables: new Set(), variables: new Set() })
    }
    case 'quantified': return { effectVariables: new Set([effect.name]), variables: new Set() }
  }
}

export function toScheme(effect: Effect): EffectScheme {
  return {
    effect: effect,
    effectVariables: new Set(),
    variables: new Set(),
  }
}

function bindEffect(name: string, effect: Effect): Either<string, Substitutions> {
  if (effectNames(effect).effectVariables.has(name)) {
    return left(`Can't bind ${name} to ${effectToString(effect)}: cyclical binding`)
  } else {
    return right([{ kind: 'effect', name, value: effect }])
  }
}

function bindVariables(name: string, variables: Variables): Either<string, Substitutions> {
  if (variablesNames(variables).includes(name)) {
    return left(`Can't bind ${name} to ${variablesToString(variables)}: cyclical binding`)
  } else {
    return right([{ kind: 'variable', name, value: variables }])
  }
}

function variablesNames(variables: Variables): string[] {
  switch (variables.kind) {
    case 'concrete': return []
    case 'quantified': return [variables.name]
    case 'union': return variables.variables.flatMap(variablesNames)
  }
}

function unifyArrows(location: string, e1: ArrowEffect, e2: ArrowEffect): Either<ErrorTree, Substitutions> {
  const params: [Effect[], Effect[]] = [e1.params, e2.params]
  return right(params)
    .chain((params): Either<ErrorTree, [[Effect[], Effect[]], Substitutions]> => {
      const [p1, p2] = params
      if (p1.length === p2.length) {
        return right([params, [] as Substitutions])
      } else {
        return tryToUnpack(location, p1, p2)
      }
    })
    .chain(([[p1, p2], unpackingSubs]) => {
      const e1r = applySubstitution(unpackingSubs, e1.result)
      const e2r = applySubstitution(unpackingSubs, e2.result)
      return mergeInMany([e1r, e2r]).chain(([e1result, e2result]) => {
        const [arrow1, subs1] = simplifyArrowEffect(p1, e1result)
        const [arrow2, subs2] = simplifyArrowEffect(p2, e2result)
        const subs = compose(subs1, subs2).chain(s => compose(s, unpackingSubs))
        return arrow1.params.reduce((result: Either<Error, Substitutions>, e, i) => {
          return result.chain(subs => applySubstitutionsAndUnify(subs, e, arrow2.params[i]))
        }, subs)
          .chain(subs => applySubstitutionsAndUnify(subs, arrow1.result, arrow2.result))
      })
      .mapLeft(err => buildErrorTree(location, err))
    })
}

const compatibleComponentKinds = [['read', 'update'], ['read', 'temporal']]

function canCoexist(c1: EffectComponent, c2: EffectComponent): boolean {
  return compatibleComponentKinds.some(kinds => kinds.includes(c1.kind) && kinds.includes(c2.kind))
}

function isDominant(c1: EffectComponent, c2: EffectComponent): boolean {
  return c1.kind === 'update' && c2.kind === 'temporal'
}

function unifyConcrete(location: string, e1: ConcreteEffect, e2: ConcreteEffect): Either<Error, Substitutions> {
  const generalResult = e1.components.reduce((result: Either<Error, Substitutions>, ca) => {
    return e2.components.reduce((innerResult: Either<Error, Substitutions>, cb) => {
      return innerResult.chain(subs => {
        const c1: EffectComponent = { ...ca, variables: applySubstitutionToVariables(subs, ca.variables) }
        const c2: EffectComponent = { ...cb, variables: applySubstitutionToVariables(subs, cb.variables) }

        if (c1.kind === c2.kind) {
          return unifyVariables(c1.variables, c2.variables)
        } else if (canCoexist(c1, c2)) {
          return right([] as Substitutions)
        } else if (isDominant(c1, c2)) {
          // The dominated component has to be nullified
          return unifyVariables({ kind: 'concrete', vars: [] }, c2.variables)
        } else if (isDominant(c2, c1)) {
          // The dominated component has to be nullified
          return unifyVariables(c1.variables, { kind: 'concrete', vars: [] })
        } else {
          // We should never reach this. Instead, one of the kinds should
          // dominate the other, and then we nullify the dominated component
          return left({
            location,
            message: `Can't unify ${c1.kind} ${effectComponentToString(c1)} and ${c2.kind} ${effectComponentToString(c2)}`,
            children: [],
          })
        }
      }).chain(s => innerResult.chain(s2 => compose(s2, s)))
    }, result)
  }, right([]))

  return nullifyUnmatchedComponents(e1.components, e2.components)
    .chain(s1 => nullifyUnmatchedComponents(e2.components, e1.components).chain(s2 => compose(s1, s2)))
    .chain(s1 => generalResult.chain(s2 => compose(s1, s2)))
}

export function unifyVariables(va: Variables, vb: Variables): Either<ErrorTree, Substitutions> {
  const v1 = flattenUnions(va)
  const v2 = flattenUnions(vb)
  const location = `Trying to unify variables [${variablesToString(v1)}] and [${variablesToString(v2)}]`

  if (v1.kind === 'concrete' && v2.kind === 'concrete') {
    // Both state
    if (isEqual(new Set(v1.vars.map(v => v.name)), new Set(v2.vars.map(v => v.name)))) {
      return right([])
    } else {
      return left({
        location,
        message: `Expected variables [${v1.vars.map(v => v.name)}] and [${v2.vars.map(v => v.name)}] to be the same`,
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
    if (isEqual(v1, v2)) {
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
    // Unifying sets is complicated and we should never have to do this in Quint's
    // use case for this effect system
    return left({
      location,
      message: 'Unification for unions of variables is not implemented',
      children: [],
    })
  }
}

/** Check if there are any components in c1 that are not in c2
 * If so, they have to be nullified
 */
function nullifyUnmatchedComponents(
  components1: EffectComponent[], components2: EffectComponent[]
): Either<Error, Substitutions> {
  return components1.reduce((result: Either<Error, Substitutions>, c2) => {
    return result.chain(subs => {
      if (!components2.some(c1 => c1.kind === c2.kind)) {
        const newSubs = unifyVariables(c2.variables, { kind: 'concrete', vars: [] })
        return newSubs.chain(s => compose(subs, s))
      }

      return right(subs)
    })
  }, right([]))
}

function applySubstitutionsAndUnify(subs: Substitutions, e1: Effect, e2: Effect): Either<Error, Substitutions> {
  return mergeInMany([
    applySubstitution(subs, e1),
    applySubstitution(subs, e2),
  ])
    .chain(effectsWithSubstitutions => unify(...effectsWithSubstitutions))
    .chain(newSubstitutions => compose(newSubstitutions, subs))
}

function tryToUnpack(
  location: string, effects1: Effect[], effects2: Effect[]
): Either<ErrorTree, [[Effect[], Effect[]], Substitutions]> {
  // Ensure that effects1 is always the smallest
  if (effects2.length < effects1.length) {
    return tryToUnpack(location, effects2, effects1)
  }

  // We only handle unpacking 1 tuple into N args
  if (effects1.length !== 1) {
    return left(buildErrorLeaf(location, `Expected ${effects2.length} arguments, got ${effects1.length}`))
  }

  const variablesByComponentKind: Map<ComponentKind, Variables[]> = new Map()

  // Combine the other effects into a single effect, to be unified with the unpacked effect
  if (effects2.every(e => e.kind === 'concrete')) {
    effects2.forEach(e => {
      if (e.kind === 'concrete') {
        e.components.forEach(c => {
          const variables = variablesByComponentKind.get(c.kind) || []
          variables.push(c.variables)
          variablesByComponentKind.set(c.kind, variables)
        })
      }
    })

    const unpacked: ConcreteEffect = {
      kind: 'concrete',
      components: [...variablesByComponentKind.entries()].map(([kind, variables]) => {
        return { kind, variables: { kind: 'union', variables } }
      }),
    }

    const result = simplify(unpacked)
    return right([[effects1, [result]], []])
  }

  if (effects2.every(e => e.kind === 'quantified')) {
    const names = effects2.map(e => e.kind === 'quantified' ? e.name : '')

    const unpacked: Effect = {
      kind: 'quantified',
      name: names.join('#'),
    }

    const subs: Substitutions = names.map((name) => ({
      kind: 'effect',
      name,
      value: unpacked,
    }))
    const result = simplify(unpacked)

    return right([[effects1, [result]], subs])
  }

  return left(buildErrorLeaf(
    `Trying to unpack effects: ${effects1.map(effectToString)} and ${effects2.map(effectToString)}`,
    'Can only unpack effects if they are all of the same kind (and no arrows)'
  ))
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

    const hashedComponents = effect.components.map(c => ({ kind: c.kind, variables: hashVariables(c.variables) }))

    const arrow: ArrowEffect = { kind: 'arrow', params: [{ kind: 'concrete', components: hashedComponents }], result }
    const subs: Substitutions = effect.components.flatMap(c => {
      return variablesNames(c.variables).map(n => {
        return { kind: 'variable', name: n, value: hashVariables(c.variables) }
      })
    })

    return [arrow, subs]
  }

  return [{ kind: 'arrow', params, result }, []]
}

function hashVariables(va: Variables): Variables {
  switch (va.kind) {
    case 'concrete': {
      return va
    }
    case 'quantified': return va
    case 'union': {
      const nested = va.variables.map(hashVariables)

      // Separate quantified variables from the rest
      const [name, variables] = nested.reduce(([name, variables]: [string[], Variables[]], v) => {
        if (v.kind === 'quantified') {
          name.push(v.name)
        } else {
          variables.push(v)
        }
        return [name, variables]
      }, [[], []])

      // Consider all cases of name and variables being empty or not
      if (name.length === 0) {
        if (variables.length === 0) {
          return { kind: 'concrete', vars: [] }
        } else {
          return { kind: 'union', variables }
        }
      } else {
        if (variables.length === 0) {
          return { kind: 'quantified', name: name.join('#') }
        } else {
          return { kind: 'union', variables: [{ kind: 'quantified', name: name.join('#') }, ...variables] }
        }
      }
    }
  }
}
