/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Simplification for effects, including a check on multiple updates of the same entity
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import isEqual from 'lodash.isequal'
import { unreachable } from '../util'
import { ConcreteEffect, Effect, Entity, StateVariable } from './base'

/**
 * Simplifies a concrete effect by:
 *   1. Removing repeated entities (except for updates)
 *   2. Flattening nested unions
 *
 * @param e the concrete effect to be simplified
 *
 * @returns the simplified effect
 */
function simplifyConcreteEffect(e: ConcreteEffect): Effect {
  const components = e.components.map(c => {
    const flatEntity = flattenUnions(c.entity)
    const entity = c.kind === 'update' ? flatEntity : deduplicateEntity(flatEntity)
    return { kind: c.kind, entity }
  })

  return { kind: 'concrete', components }
}

export function simplify(e: Effect): Effect {
  switch (e.kind) {
    case 'concrete':
      return simplifyConcreteEffect(e)
    case 'variable':
      return e
    case 'arrow': {
      const params = e.params.map(simplify)
      const result = simplify(e.result)
      return { kind: 'arrow', params, result }
    }
  }
}

/**
 * Transforms entities of form [x, [y, z]] into [x, y, z]
 *
 * @param entity the entity to be transformed
 *
 * @returns the flattened form of union if a union.
 *          Otherwise, the entity without change.
 */
export function flattenUnions(entity: Entity): Entity {
  if (entity.kind == 'union') {
    const unionEntities: Entity[] = []
    const vars: StateVariable[] = []
    const flattenEntities = entity.entities.map(v => flattenUnions(v))
    flattenEntities.map(v => {
      switch (v.kind) {
        case 'variable':
          unionEntities.push(v)
          break
        case 'concrete':
          vars.push(...v.stateVariables)
          break
        case 'union':
          unionEntities.push(...v.entities)
          break
        default:
          unreachable(v)
      }
    })

    if (unionEntities.length > 0) {
      const entities =
        vars.length > 0 ? unionEntities.concat({ kind: 'concrete', stateVariables: vars }) : unionEntities
      return entities.length > 1 ? { kind: 'union', entities: entities } : entities[0]
    } else {
      return { kind: 'concrete', stateVariables: vars }
    }
  } else {
    return entity
  }
}

function deduplicateEntity(entity: Entity): Entity {
  switch (entity.kind) {
    case 'variable':
      return entity
    case 'concrete':
      return { kind: 'concrete', stateVariables: Array.from(new Set<StateVariable>(entity.stateVariables)) }
    case 'union': {
      const nestedEntities = entity.entities.map(v => deduplicateEntity(v))
      const unique: Entity[] = []
      nestedEntities.forEach(entity => {
        if (!unique.some(v => isEqual(v, entity))) {
          unique.push(entity)
        }
      })
      return { kind: 'union', entities: unique }
    }
  }
}
