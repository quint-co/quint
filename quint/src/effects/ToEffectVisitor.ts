/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A visitor for the effects parser
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Effect, Entity } from './base'
import { EffectListener } from '../generated/EffectListener'
import * as p from '../generated/EffectParser'

/**
 * An ANTLR4 listener that constructs Effect objects out of the abstract
 * syntax tree.
 */
export class ToEffectVisitor implements EffectListener {
  // The resulting effect
  effect?: Effect = undefined

  // Stack of lists of effects, each list will hold the effects of an arrow effect
  private arrowEffectsStack: Effect[][] = []
  private entitiesStack: Entity[] = []
  private stateVars: string[] = []
  private idCounter: bigint = 0n

  private pushEffect(effect: Effect): void {
    this.effect = effect
    // If inside an arrow effect, push it this effect to the arrow's effects list
    if (this.arrowEffectsStack.length > 0) {
      this.arrowEffectsStack[this.arrowEffectsStack.length - 1].push(effect)
    }
  }

  exitReadOnly() {
    const entity = this.entitiesStack.pop()!
    const effect: Effect = { kind: 'concrete', components: [{ kind: 'read', entity: entity }] }
    this.pushEffect(effect)
  }

  exitUpdateOnly() {
    const entity = this.entitiesStack.pop()!
    const effect: Effect = { kind: 'concrete', components: [{ kind: 'update', entity: entity }] }
    this.pushEffect(effect)
  }

  exitTemporalOnly() {
    const entity = this.entitiesStack.pop()!
    const effect: Effect = { kind: 'concrete', components: [{ kind: 'temporal', entity: entity }] }
    this.pushEffect(effect)
  }

  exitReadAndUpdate() {
    const update = this.entitiesStack.pop()!
    const read = this.entitiesStack.pop()!

    const effect: Effect = {
      kind: 'concrete',
      components: [
        { kind: 'read', entity: read },
        { kind: 'update', entity: update },
      ],
    }
    this.pushEffect(effect)
  }

  exitReadAndTemporal() {
    const temporal = this.entitiesStack.pop()!
    const read = this.entitiesStack.pop()!

    const effect: Effect = {
      kind: 'concrete',
      components: [
        { kind: 'read', entity: read },
        { kind: 'temporal', entity: temporal },
      ],
    }
    this.pushEffect(effect)
  }

  exitPure() {
    const effect: Effect = { kind: 'concrete', components: [] }
    this.pushEffect(effect)
  }

  exitVariableEffect(ctx: p.VariableEffectContext) {
    const name = ctx.IDENTIFIER().text
    const effect: Effect = { kind: 'variable', name }
    this.pushEffect(effect)
  }

  enterArrowEffect() {
    this.arrowEffectsStack.push([])
  }

  exitArrowEffect() {
    const effects = this.arrowEffectsStack.pop()!
    const result = effects.pop()!
    const effect: Effect = { kind: 'arrow', params: effects, result }
    this.pushEffect(effect)
  }

  exitEntity(ctx: p.EntityContext) {
    const names: string[] = ctx.IDENTIFIER().map(i => i.text)
    const entityUnion: Entity[] = names.map(name => ({ kind: 'variable', name }))
    if (this.stateVars.length > 0) {
      entityUnion.push({
        kind: 'concrete',
        stateVariables: this.stateVars.map(v => ({ name: v, reference: this.nextId() })),
      })
    }

    if (entityUnion.length === 0) {
      this.entitiesStack.push({ kind: 'concrete', stateVariables: [] })
    } else if (entityUnion.length === 1) {
      this.entitiesStack.push(entityUnion[0])
    } else {
      this.entitiesStack.push({ kind: 'union', entities: entityUnion })
    }

    this.stateVars = []
  }

  exitStateVarRef(ctx: p.StateVarRefContext) {
    const varRef = ctx.IDENTIFIER().text
    this.stateVars.push(varRef)
  }

  private nextId(): bigint {
    return ++this.idCounter
  }
}
