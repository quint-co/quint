/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern implementation for Effect components. Use this to navigate an
 * Effect instead of implementing a recursion over it yourself.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { unreachable } from '../util'
import { ArrowEffect, ConcreteEffect, Effect, EffectVariable } from './base'

/**
 * Interface to be implemented by visitor classes.
 * Optionally defines functions for each Effect component.
 */
export interface EffectVisitor {
  /** General components */
  enterConcrete?: (_effect: ConcreteEffect) => void
  exitConcrete?: (_effect: ConcreteEffect) => void
  enterArrow?: (_effect: ArrowEffect) => void
  exitArrow?: (_effect: ArrowEffect) => void
  enterVariable?: (_effect: EffectVariable) => void
  exitVariable?: (_effect: EffectVariable) => void
}

/**
 * Navigates an Effect with a visitor, invoking the correspondent function for each
 * found Effect.
 *
 * @param visitor: the EffectVisitor instance with the functions to be invoked
 * @param effect: the effect to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the EffectVisitor instance.
 */
export function walkEffect(visitor: EffectVisitor, effect: Effect): void {
  switch (effect.kind) {
    case 'concrete': {
      if (visitor.enterConcrete) {
        visitor.enterConcrete(effect)
      }
      if (visitor.exitConcrete) {
        visitor.exitConcrete(effect)
      }
      break
    }
    case 'variable': {
      if (visitor.enterVariable) {
        visitor.enterVariable(effect)
      }
      if (visitor.exitVariable) {
        visitor.exitVariable(effect)
      }
      break
    }
    case 'arrow':
      {
        if (visitor.enterArrow) {
          visitor.enterArrow(effect)
        }

        effect.params.forEach(e => walkEffect(visitor, e))
        walkEffect(visitor, effect.result)

        if (visitor.exitArrow) {
          visitor.exitArrow(effect)
        }
      }
      break
    default:
      unreachable(effect)
  }
}
