/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A checker for multiple updates in inferred effects.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { QuintError } from '../quintError'
import { ConcreteEffect, EffectScheme, Entity, stateVariables } from './base'
import { EffectVisitor, walkEffect } from './EffectVisitor'
import { groupBy, pickBy, values } from 'lodash'

/**
 * Checks effects for multiple updates of the same state variable.
 */
export class MultipleUpdatesChecker implements EffectVisitor {
  errors: Map<bigint, QuintError> = new Map()

  /**
   * Checks effects for multiple updates of the same state variable.
   *
   * @param effects the effects to look for multiple updates on
   *
   * @returns a map of errors, where the key is the variable id
   */
  checkEffects(effects: EffectScheme[]): Map<bigint, QuintError> {
    effects.forEach(e => walkEffect(this, e.effect))
    return this.errors
  }

  exitConcrete(e: ConcreteEffect) {
    const updateEntities = e.components.reduce((updates: Entity[], c) => {
      if (c.kind === 'update') {
        updates.push(c.entity)
      }
      return updates
    }, [])

    const vars = stateVariables({ kind: 'union', entities: updateEntities })

    const repeated = values(
      pickBy(
        groupBy(vars, v => v.name),
        x => x.length > 1
      )
    ).flat()

    if (repeated.length > 0) {
      repeated.forEach(v => {
        this.errors.set(v.reference, {
          code: 'QNT202',
          message: `Multiple updates of variable ${v.name}`,
          reference: v.reference,
          data: {},
        })
      })
    }
  }
}
