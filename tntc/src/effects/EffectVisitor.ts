/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern implementation for TNT IR components. Use this to navigate the IR instead
 * of implementing a recursion over it yourself.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { ArrowEffect, ConcreteEffect, Effect, QuantifiedEffect } from './base'

/**
 * Interface to be implemented by visitor classes.
 * Optionally defines functions for each IR component.
 */
export interface EffectVisitor {
  /** General components */
  enterConcrete?: (effect: ConcreteEffect) => void
  exitConcrete?: (effect: ConcreteEffect) => void
  enterArrow?: (effect: ArrowEffect) => void
  exitArrow?: (effect: ArrowEffect) => void
  enterQuantified?: (effect: QuantifiedEffect) => void
  exitQuantified?: (effect: QuantifiedEffect) => void
}

/**
 * Navigates a TNT module with a visitor, invoking the correspondent function for each
 * found IR component.
 *
 * @param visitor: the IRVisitor instance with the functions to be invoked
 * @param tntModule: the TNT module to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the IRVisitor instance.
 */
export function walkEffect (visitor: EffectVisitor, effect: Effect): void {
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
    case 'quantified': {
      if (visitor.enterQuantified) {
        visitor.enterQuantified(effect)
      }
      if (visitor.exitQuantified) {
        visitor.exitQuantified(effect)
      }
      break
    }
    case 'arrow': {
      if (visitor.enterArrow) {
        visitor.enterArrow(effect)
      }

      effect.params.forEach(e => walkEffect(visitor, e))
      walkEffect(visitor, effect.result)

      if (visitor.exitArrow) {
        visitor.exitArrow(effect)
      }
    }
  }
}
