/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Substitutions for effects and its entities, including composition and application
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, mergeInMany, right } from '@sweet-monads/either'
import { ErrorTree, buildErrorTree } from '../errorTree'
import { Effect, Entity } from './base'
import { effectToString, substitutionsToString } from './printing'
import { simplify } from './simplification'
import { isDeepStrictEqual as isEqual } from 'node:util'

/*
 * Substitutions can be applied to both effects and entities, replacing
 * variable values with concrete ones
 */
export type Substitutions = Substitution[]

type Substitution = { kind: 'entity'; name: string; value: Entity } | { kind: 'effect'; name: string; value: Effect }

/*
 * Compose two substitutions by applying the first one to the second one's values
 *
 * @param s1 substitutions to be applied and returned unchanged
 * @param s2 substitutions to be updated and returned
 *
 * @returns a new substitutions list containing the composition of given substitutions, if succeeded.
 *          Otherwise, an error tree with the substitution application failure
 */
export function compose(s1: Substitutions, s2: Substitutions): Either<ErrorTree, Substitutions> {
  return applySubstitutionsToSubstitutions(s1, s2)
    .map((sb: Substitutions) => sb.concat(s1))
    .mapLeft(error =>
      buildErrorTree(`Composing substitutions ${substitutionsToString(s1)} and ${substitutionsToString(s2)}`, error)
    )
}

/**
 * Applies substitutions to an effect, replacing all variable names with their
 * substitution values when they are defined.
 *
 * @param subs the substitutions to be applied
 * @param e the effect to be transformed
 *
 * @returns the effect resulting from the substitutions' application on the given
 *          effect, when successful. Otherwise, an error tree with an error message and its trace.
 */
export function applySubstitution(subs: Substitutions, e: Effect): Either<ErrorTree, Effect> {
  let result: Either<ErrorTree, Effect> = right(e)
  switch (e.kind) {
    case 'variable': {
      // e is an effect entity
      const sub = subs.find(s => s.name === e.name)
      if (sub && sub.kind === 'effect') {
        result = right(sub.value)
      }
      break
    }
    case 'arrow': {
      // e takes effects as parameters and returns an effect as result
      const arrowParams = mergeInMany(e.params.map(ef => applySubstitution(subs, ef)))
      result = arrowParams
        .chain(ps => {
          const arrowResult = applySubstitution(subs, e.result)
          return arrowResult.map(r => ({ kind: e.kind, params: ps, result: r }))
        })
        .mapLeft(error => buildErrorTree(`Applying substitution to arrow effect ${effectToString(e)}`, error))
      break
    }
    case 'concrete': {
      // e is an effect of the form Read[r] & Update[u] or Read[r] & Temporal[t]
      const components = e.components
        .map(c => ({ kind: c.kind, entity: applySubstitutionToEntity(subs, c.entity) }))
        .filter(c => !emptyEntity(c.entity))

      result = right({ kind: 'concrete', components })
      break
    }
  }

  return result.map(simplify).chain(r => {
    if (!isEqual(r, e)) {
      // Keep re-applying the substitutions until the effect is unchanged.
      // Useful when substitutions have a transitive pattern [ a |-> b, b |-> c ]
      return applySubstitution(subs, r)
    }
    return right(r)
  })
}

/**
 * Applies substitutions to an entity, replacing all variable names with their
 * substitution values when they are defined.
 *
 * @param subs the substitutions to be applied
 * @param entity the entity to be transformed
 *
 * @returns the entity resulting from the substitutions' application on the
 *          given entity
 */
export function applySubstitutionToEntity(subs: Substitutions, entity: Entity): Entity {
  switch (entity.kind) {
    case 'variable': {
      const sub = subs.find(s => s.name === entity.name)
      if (sub && sub.kind === 'entity') {
        return sub.value
      }
      break
    }
    case 'union': {
      const newEntities = entity.entities.map(v => applySubstitutionToEntity(subs, v))
      return { kind: 'union', entities: newEntities }
    }
  }
  return entity
}

function emptyEntity(entity: Entity): boolean {
  switch (entity.kind) {
    case 'concrete':
      return entity.stateVariables.length === 0
    case 'variable':
      return false
    case 'union':
      return entity.entities.length === 0
  }
}

function applySubstitutionsToSubstitutions(s1: Substitutions, s2: Substitutions): Either<ErrorTree[], Substitutions> {
  return mergeInMany(
    s2.map((s: Substitution): Either<ErrorTree, Substitutions> => {
      switch (s.kind) {
        case 'effect':
          return applySubstitution(s1, s.value).map(v => [{ kind: s.kind, name: s.name, value: v }])
        case 'entity':
          return right([{ kind: s.kind, name: s.name, value: applySubstitutionToEntity(s1, s.value) }])
      }
    })
  ).map(s => s.flat())
}
