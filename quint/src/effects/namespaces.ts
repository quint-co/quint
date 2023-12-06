/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Updating effects with namespaces for state variables. To be used when a module with variables is instantiated.
 *
 * @author Gabriela Moreira
 *
 * @module
 */
import { Effect, Entity } from './base'

/**
 * Adds a namespace, in the format of the namespaces attribute in LookupDefinition, to all state variables in an effect.
 *
 * @param effect - The effect to add the namespaces to
 * @param namespaces - The namespaces to add
 *
 * @return The effect with namespaces added to all state variables
 */
export function addNamespaces(effect: Effect, namespaces: string[]): Effect {
  switch (effect.kind) {
    case 'variable': {
      return effect
    }
    case 'arrow': {
      return {
        ...effect,
        params: effect.params.map(p => addNamespaces(p, namespaces)),
        result: addNamespaces(effect.result, namespaces),
      }
    }
    case 'concrete': {
      return {
        ...effect,
        components: effect.components.map(c => ({ ...c, entity: addNamespacesToEntity(c.entity, namespaces) })),
      }
    }
  }
}

function addNamespacesToEntity(entity: Entity, namespaces: string[]): Entity {
  switch (entity.kind) {
    case 'variable': {
      return entity
    }
    case 'union': {
      return { ...entity, entities: entity.entities.map(p => addNamespacesToEntity(p, namespaces)) }
    }
    case 'concrete': {
      if (namespaces.length === 0) {
        return entity
      }

      const pathPrefix = namespaces.reduce((a, b) => `${b}::${a}`)
      return {
        ...entity,
        stateVariables: entity.stateVariables.map(v => ({
          ...v,
          name: `${pathPrefix}::${v.name}`,
        })),
      }
    }
  }
}
