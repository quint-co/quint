/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Check that all definitions in a module have correctly annotated modes
 * according to inferred effects
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import isEqual from 'lodash.isequal'
import { ErrorTree } from '../errorTree'
import { definitionToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { OpQualifier, TntModule, TntOpDef } from '../tntIr'
import { ArrowEffect, ConcreteEffect, Effect, Variables, isAction, isState, isTemporal } from './base'
import { EffectVisitor, walkEffect } from './EffectVisitor'
import { effectToString } from './printing'

/**
 * Matches annotated modes for each definition with its inferred effect. Returns
 * errors for incorrect annotations and suggestions for annotations that could
 * be more strict.
 *
 * @param tntModule: the module to be checked
 * @param effects: the map from expression ids to their inferred effects
 *
 * @returns The mode errors, if any is found. Otherwise, a map with potential suggestions.
 */
export function checkModes (tntModule: TntModule, effects: Map<bigint, Effect>): Either<Map<bigint, ErrorTree>, Map<bigint, OpQualifier>> {
  const visitor = new ModeCheckerVisitor(effects)
  walkModule(visitor, tntModule)
  if (visitor.errors.size > 0) {
    return left(visitor.errors)
  } else {
    return right(visitor.suggestions)
  }
}

class ModeCheckerVisitor implements IRVisitor {
  public errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()
  public suggestions: Map<bigint, OpQualifier> = new Map<bigint, OpQualifier>()
  effects: Map<bigint, Effect>
  modeFinderVisitor: ModeFinderVisitor = new ModeFinderVisitor()

  constructor (effects: Map<bigint, Effect>) {
    this.effects = effects
  }

  exitOpDef (def: TntOpDef) {
    const effect = this.effects.get(def.id)
    if (!effect) {
      return
    }

    walkEffect(this.modeFinderVisitor, effect)
    const mode = this.modeFinderVisitor.currentMode
    this.modeFinderVisitor.currentMode = 'pureval'

    if (mode === def.qualifier) {
      return
    }

    const generalMode = commonMode(mode, def.qualifier)

    if (generalMode === mode) {
      this.errors.set(def.id, {
        location: `Checking modes for ${definitionToString(def)}`,
        message: `Expected ${mode} mode, found: ${def.qualifier}`,
        children: [],
      })
    } else if (generalMode === def.qualifier) {
      this.suggestions.set(def.id, mode)
    }
  }
}

class ModeFinderVisitor implements EffectVisitor {
  public currentMode: OpQualifier = 'pureval'

  exitConcrete (effect: ConcreteEffect) {
    let mode: OpQualifier
    if (isAction(effect)) {
      mode = 'action'
    } else if (isTemporal(effect)) {
      mode = 'temporal'
    } else if (isState(effect)) {
      mode = 'val'
    } else {
      mode = 'pureval'
    }

    this.currentMode = commonMode(this.currentMode, mode)
  }

  exitArrow (effect: ArrowEffect) {
    if (this.currentMode === 'action' || this.currentMode === 'temporal') {
      return
    }

    const r = effect.result
    if (r.kind === 'arrow') {
      throw new Error(`Unexpected arrow found in operator result: ${effectToString(r)}`)
    }

    this.currentMode = 'puredef'

    if (r.kind === 'quantified') {
      return
    }

    const paramReads: Variables[] = []
    effect.params.forEach(p => {
      if (p.kind === 'concrete') {
        if (p.read.kind === 'union') {
          paramReads.push(...p.read.variables)
        } else {
          paramReads.push(p.read)
        }
      }
    })

    // If there is a variable read in the results that is not present on the
    // parameters, then the operator is adding a read effect and this should be
    // a "def" instead of "pure def"
    if (r.read.kind === 'union') {
      if (!r.read.variables.every(v => paramReads.some(p => isEqual(p, v)))) {
        this.currentMode = 'def'
      }
    } else if (!paramReads.some(p => isEqual(p, r.read))) {
      this.currentMode = 'def'
    }
  }
}

const modeOrder = ['pureval', 'puredef', 'val', 'def', 'action', 'temporal']

function commonMode (m1: OpQualifier, m2: OpQualifier): OpQualifier {
  const p1 = modeOrder.findIndex(elem => elem === m1)
  const p2 = modeOrder.findIndex(elem => elem === m2)

  return p1 > p2 ? m1 : m2
}
