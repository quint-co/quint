/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Essentials for handling Effects: types, interfaces and unification
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { effectComponentToString, effectToString, entityToString } from './printing'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Substitutions, applySubstitution, applySubstitutionToEntity, compose } from './substitutions'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree } from '../errorTree'
import { flattenUnions, simplify } from './simplification'
import isEqual from 'lodash.isequal'
import { differenceWith, intersectionWith } from 'lodash'

/* Kinds for concrete effect components */
export type ComponentKind = 'read' | 'update' | 'temporal'

/* A concrete effect component, specifying a kind and the entity it acts upon */
export interface EffectComponent {
  kind: ComponentKind
  entity: Entity
}

/* Concrete atomic effects specifying which kinds of effects act upon which entities */
export interface ConcreteEffect {
  kind: 'concrete'
  components: EffectComponent[]
}

/* Arrow effects for expressions with effects depending on parameters */
export interface ArrowEffect {
  kind: 'arrow'
  params: Effect[]
  result: Effect
}

/* A variable standing for an unknown effect */
export interface EffectVariable {
  kind: 'variable'
  name: string
}

/*
 * The effect of a Quint expression, regarding which state entities are read
 * and/or updated
 */
export type Effect = ConcreteEffect | ArrowEffect | EffectVariable

/*
 * An effect scheme, listing which effect variables (represented by the names of effect variables)
 * and entity variables (represented by the names of entity variables) are universally quantified
 * in the effect
 */
export type EffectScheme = {
  /* The effect */
  effect: Effect
  /* The names of universally quantified Effect variables */
  effectVariables: Set<string>
  /* The names of universally quantified Entity variables */
  entityVariables: Set<string>
}

/* A state variable */
export interface StateVariable {
  /* The variable name */
  name: string
  /* The id of the expression in which the state variable occurred */
  reference: bigint
}

/*
 * The Entity an effect acts upon. Either a list of state variables, an
 * entity variable or a combination of other entities.
 */
export type Entity =
  /* A set of state variables, represented as a list */
  | { kind: 'concrete'; stateVariables: StateVariable[] }
  /* A variable representing some set of entities */
  | { kind: 'variable'; name: string; reference?: bigint }
  /* The union of sets of entities, represented as a list */
  | { kind: 'union'; entities: Entity[] }

/*
 * An effect signature, which can vary according to the number of arguments.
 */
export type Signature = (_arity: number) => EffectScheme

/**
 * Unifies two effects by matching effect types and unifying their entities.
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
  } else if (e1.kind === 'variable') {
    return bindEffect(e1.name, e2).mapLeft(msg => buildErrorLeaf(location, msg))
  } else if (e2.kind === 'variable') {
    return bindEffect(e2.name, e1).mapLeft(msg => buildErrorLeaf(location, msg))
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
 * @returns the set of effect variables and the set of entity variables
 */
export function effectNames(effect: Effect): { effectVariables: Set<string>; entityVariables: Set<string> } {
  switch (effect.kind) {
    case 'concrete':
      return {
        effectVariables: new Set(),
        entityVariables: new Set(effect.components.flatMap(c => entityNames(c.entity))),
      }
    case 'arrow': {
      const nested = effect.params.concat(effect.result).flatMap(effectNames)
      return nested.reduce(
        (acc, { effectVariables: effectVariables, entityVariables: entityVariables }) => ({
          effectVariables: new Set([...acc.effectVariables, ...effectVariables]),
          entityVariables: new Set([...acc.entityVariables, ...entityVariables]),
        }),
        { effectVariables: new Set(), entityVariables: new Set() }
      )
    }
    case 'variable':
      return { effectVariables: new Set([effect.name]), entityVariables: new Set() }
  }
}

/**
 * Converts an effect to an effect scheme without any quantification
 *
 * @param effect the effect to be converted
 *
 * @returns an effect scheme with that effect and no quantification
 */
export function toScheme(effect: Effect): EffectScheme {
  return {
    effect: effect,
    effectVariables: new Set(),
    entityVariables: new Set(),
  }
}

function bindEffect(name: string, effect: Effect): Either<string, Substitutions> {
  if (effectNames(effect).effectVariables.has(name)) {
    return left(`Can't bind ${name} to ${effectToString(effect)}: cyclical binding`)
  } else {
    return right([{ kind: 'effect', name, value: effect }])
  }
}

function bindEntity(name: string, entity: Entity): Substitutions {
  switch (entity.kind) {
    case 'concrete':
    case 'variable':
      return [{ kind: 'entity', name, value: entity }]
    case 'union':
      if (entityNames(entity).includes(name)) {
        // An entity variable (which always stands for a set of state variables)
        // unifies with the union of n sets of entities that may include itself,
        // iff it unifies with each set.
        //
        // I.e.:
        //
        //   (v1 =.= v1 ∪ ... ∪ vn) <=> (v1 =.= ... =.= vn)
        //
        // We call this function recursively because, in the general case,
        // occurrences of `v1` may be nested, as in:
        //
        //    v1 =.= v1 ∪ (v2 ∪ (v3 ∪ v1)) ∪ v4
        //
        // In practice, we are flattening unions before we call this function,
        // but solving the general case ensures we preserve correct behavior
        // even if this function is used on its own, without incurring any
        // notable overhead when `entities` is already flat.
        return entity.entities.flatMap(e => bindEntity(name, e))
      } else {
        // Otherwise, the variable may be bound to the union of the entities
        // without qualification.
        return [{ kind: 'entity', name, value: entity }]
      }
  }
}

/**
 * Finds all entity names refered to by an entity
 *
 * @param entity the entity to be searched
 *
 * @returns a list of names
 */
export function entityNames(entity: Entity): string[] {
  switch (entity.kind) {
    case 'concrete':
      return []
    case 'variable':
      return [entity.name]
    case 'union':
      return entity.entities.flatMap(entityNames)
  }
}

/**
 * Finds all state variables refered to by an entity
 *
 * @param entity the entity to be searched
 *
 * @returns a list of state entities
 */
export function stateVariables(entity: Entity): StateVariable[] {
  switch (entity.kind) {
    case 'variable':
      return []
    case 'concrete':
      return entity.stateVariables
    case 'union':
      return entity.entities.flatMap(stateVariables)
  }
}

function unifyArrows(location: string, e1: ArrowEffect, e2: ArrowEffect): Either<ErrorTree, Substitutions> {
  const paramsTuple: [Effect[], Effect[]] = [e1.params, e2.params]
  return right(paramsTuple)
    .chain(([p1, p2]): Either<ErrorTree, [Effect[], Effect[], Substitutions]> => {
      if (p1.length === p2.length) {
        return right([p1, p2, [] as Substitutions])
      } else {
        return left(buildErrorLeaf(location, `Expected ${p1.length} arguments, got ${p2.length}`))
      }
    })
    .chain(([p1, p2, unpackingSubs]) => {
      const e1r = applySubstitution(unpackingSubs, e1.result)
      const e2r = applySubstitution(unpackingSubs, e2.result)
      return mergeInMany([e1r, e2r])
        .chain(([e1result, e2result]) => {
          const [arrow1, subs1] = simplifyArrowEffect(p1, e1result)
          const [arrow2, subs2] = simplifyArrowEffect(p2, e2result)
          const subs = compose(subs1, subs2).chain(s => compose(s, unpackingSubs))
          return arrow1.params
            .reduce((result: Either<Error, Substitutions>, e, i) => {
              return result.chain(subs => applySubstitutionsAndUnify(subs, e, arrow2.params[i]))
            }, subs)
            .chain(subs => applySubstitutionsAndUnify(subs, arrow1.result, arrow2.result))
        })
        .mapLeft(err => buildErrorTree(location, err))
    })
}

const compatibleComponentKinds = [
  ['read', 'update'],
  ['read', 'temporal'],
]

function canCoexist(c1: EffectComponent, c2: EffectComponent): boolean {
  return compatibleComponentKinds.some(kinds => kinds.includes(c1.kind) && kinds.includes(c2.kind))
}

function isDominant(c1: EffectComponent, c2: EffectComponent): boolean {
  return c1.kind === 'update' && c2.kind === 'temporal'
}

function unifyConcrete(location: string, e1: ConcreteEffect, e2: ConcreteEffect): Either<Error, Substitutions> {
  const generalResult = e1.components.reduce((result: Either<Error, Substitutions>, ca) => {
    return e2.components.reduce((innerResult: Either<Error, Substitutions>, cb) => {
      return innerResult
        .chain(subs => {
          const c1: EffectComponent = { ...ca, entity: applySubstitutionToEntity(subs, ca.entity) }
          const c2: EffectComponent = { ...cb, entity: applySubstitutionToEntity(subs, cb.entity) }

          if (c1.kind === c2.kind) {
            return unifyEntities(c1.entity, c2.entity)
          } else if (canCoexist(c1, c2)) {
            return right([] as Substitutions)
          } else if (isDominant(c1, c2)) {
            // The dominated component has to be nullified
            return unifyEntities({ kind: 'concrete', stateVariables: [] }, c2.entity)
          } else if (isDominant(c2, c1)) {
            // The dominated component has to be nullified
            return unifyEntities(c1.entity, { kind: 'concrete', stateVariables: [] })
          } else {
            // We should never reach this. Instead, one of the kinds should
            // dominate the other, and then we nullify the dominated component
            return left({
              location,
              message: `Can't unify ${c1.kind} ${effectComponentToString(c1)} and ${c2.kind} ${effectComponentToString(
                c2
              )}`,
              children: [],
            })
          }
        })
        .chain(s => innerResult.chain(s2 => compose(s2, s)))
    }, result)
  }, right([]))

  return nullifyUnmatchedComponents(e1.components, e2.components)
    .chain(s1 => nullifyUnmatchedComponents(e2.components, e1.components).chain(s2 => compose(s1, s2)))
    .chain(s1 => generalResult.chain(s2 => compose(s1, s2)))
}

export function unifyEntities(va: Entity, vb: Entity): Either<ErrorTree, Substitutions> {
  const v1 = flattenUnions(va)
  const v2 = flattenUnions(vb)
  const location = `Trying to unify entities [${entityToString(v1)}] and [${entityToString(v2)}]`

  if (v1.kind === 'concrete' && v2.kind === 'concrete') {
    if (isEqual(new Set(v1.stateVariables.map(v => v.name)), new Set(v2.stateVariables.map(v => v.name)))) {
      return right([])
    } else {
      return left({
        location,
        message: `Expected [${v1.stateVariables.map(v => v.name)}] and [${v2.stateVariables.map(
          v => v.name
        )}] to be the same`,
        children: [],
      })
    }
  } else if (v1.kind === 'variable' && v2.kind === 'variable' && v1.name === v2.name) {
    return right([])
  } else if (v1.kind === 'variable') {
    return right(bindEntity(v1.name, v2))
  } else if (v2.kind === 'variable') {
    return right(bindEntity(v2.name, v1))
  } else if (isEqual(v1, v2)) {
    return right([])
  } else if (v1.kind === 'union' && v2.kind === 'concrete') {
    return mergeInMany(v1.entities.map(v => unifyEntities(v, v2)))
      .map(subs => subs.flat())
      .mapLeft(err => buildErrorTree(location, err))
  } else if (v1.kind === 'concrete' && v2.kind === 'union') {
    return unifyEntities(v2, v1)
  } else if (v1.kind === 'union' && v2.kind === 'union') {
    const intersection = intersectionWith(v1.entities, v2.entities, isEqual)
    if (intersection.length > 0) {
      const s1 = { ...v1, entities: differenceWith(v1.entities, intersection, isEqual) }
      const s2 = { ...v2, entities: differenceWith(v2.entities, intersection, isEqual) }

      // There was an intersection, try to unify the remaining entities
      return unifyEntities(s1, s2)
    }

    // At least one of the entities is a union
    // Unifying sets is complicated and we should never have to do this in Quint's
    // use case for this effect system
    return left({
      location,
      message: 'Unification for unions of entities is not implemented',
      children: [],
    })
  } else {
    throw new Error(`Impossible: all cases should be covered`)
  }
}

/** Check if there are any components in c1 that are not in c2
 * If so, they have to be nullified
 */
function nullifyUnmatchedComponents(
  components1: EffectComponent[],
  components2: EffectComponent[]
): Either<Error, Substitutions> {
  return components1.reduce((result: Either<Error, Substitutions>, c2) => {
    return result.chain(subs => {
      if (!components2.some(c1 => c1.kind === c2.kind)) {
        const newSubs = unifyEntities(c2.entity, { kind: 'concrete', stateVariables: [] })
        return newSubs.chain(s => compose(subs, s))
      }

      return right(subs)
    })
  }, right([]))
}

function applySubstitutionsAndUnify(subs: Substitutions, e1: Effect, e2: Effect): Either<Error, Substitutions> {
  return mergeInMany([applySubstitution(subs, e1), applySubstitution(subs, e2)])
    .chain(effectsWithSubstitutions => unify(...effectsWithSubstitutions))
    .chain(newSubstitutions => compose(newSubstitutions, subs))
}

/**
 * Simplifies effects of the form (Read[v0, ..., vn]) => Read[v0, ..., vn] into
 * (Read[v0#...#vn]) => Read[v0#...#vn] so the entities can be unified with other
 * sets of entities. All of the entities v0, ..., vn are bound to the single entity
 * named v0#...#vn. E.g., for entities v0, v1, v2, we will produce the new unique entity
 * v0#v1#v2 and the bindings v1 |-> v0#v1#v2, v1 |-> v0#v1#v2, v2 |-> v0#v1#v2.
 * This new name could be a fresh name, but we use an unique name since there is no
 * fresh name generation in this pure unification environment.
 *
 * @param params the arrow effect parameters
 * @param result the arrow effect result
 * @returns an arrow effect with the new format and the substitutions with binded entities
 */
function simplifyArrowEffect(params: Effect[], result: Effect): [ArrowEffect, Substitutions] {
  if (params.length === 1 && effectToString(params[0]) === effectToString(result) && params[0].kind === 'concrete') {
    const effect = params[0]

    const hashedComponents = effect.components.map(c => ({ kind: c.kind, entity: hashEntity(c.entity) }))

    const arrow: ArrowEffect = { kind: 'arrow', params: [{ kind: 'concrete', components: hashedComponents }], result }
    const subs: Substitutions = effect.components.flatMap(c => {
      return entityNames(c.entity).map(n => {
        return { kind: 'entity', name: n, value: hashEntity(c.entity) }
      })
    })

    return [arrow, subs]
  }

  return [{ kind: 'arrow', params, result }, []]
}

function hashEntity(va: Entity): Entity {
  switch (va.kind) {
    case 'concrete':
      return va
    case 'variable':
      return va
    case 'union': {
      const nested = va.entities.map(hashEntity)

      // Separate variables from the rest
      const [name, entities] = nested.reduce(
        ([name, entities]: [string[], Entity[]], v) => {
          if (v.kind === 'variable') {
            name.push(v.name)
          } else {
            entities.push(v)
          }
          return [name, entities]
        },
        [[], []]
      )

      // Consider all cases of name and entities being empty or not
      if (name.length === 0) {
        if (entities.length === 0) {
          return { kind: 'concrete', stateVariables: [] }
        } else {
          return { kind: 'union', entities: entities }
        }
      } else {
        if (entities.length === 0) {
          return { kind: 'variable', name: name.join('#') }
        } else {
          return { kind: 'union', entities: [{ kind: 'variable', name: name.join('#') }, ...entities] }
        }
      }
    }
  }
}
