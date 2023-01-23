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

import isEqual from 'lodash.isequal'
import { ErrorTree } from '../errorTree'
import { definitionToString, qualifierToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { OpQualifier, QuintModule, QuintOpDef } from '../quintIr'
import { ArrowEffect, ConcreteEffect, Effect, Variables, isAction, isState, isTemporal } from './base'
import { EffectVisitor, walkEffect } from './EffectVisitor'
import { effectToString } from './printing'

export type ModeCheckingResult = [Map<bigint, ErrorTree>, Map<bigint, OpQualifier>]

/**
 * Matches annotated modes for each definition with its inferred effect. Returns
 * errors for incorrect annotations and suggestions for annotations that could
 * be more strict.
 *
 * @param quintModule: the module to be checked
 * @param effects: the map from expression ids to their inferred effects
 *
 * @returns The mode errors, if any is found. Otherwise, a map with potential suggestions.
 */
export function checkModes(
  quintModule: QuintModule, effects: Map<bigint, Effect>, partialResult?: ModeCheckingResult
): ModeCheckingResult {
  const visitor = new ModeCheckerVisitor(effects, partialResult)
  walkModule(visitor, quintModule)
  return [visitor.errors, visitor.suggestions]
}

class ModeCheckerVisitor implements IRVisitor {
  constructor(effects: Map<bigint, Effect>, partialResult?: ModeCheckingResult) {
    this.effects = effects
    this.errors = partialResult?.[0] ?? new Map<bigint, ErrorTree>()
    this.suggestions = partialResult?.[1] ?? new Map<bigint, OpQualifier>()
  }

  errors: Map<bigint, ErrorTree>
  suggestions: Map<bigint, OpQualifier>

  private effects: Map<bigint, Effect>
  private modeFinderVisitor: ModeFinderVisitor = new ModeFinderVisitor()

  exitOpDef(def: QuintOpDef) {
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
        message: `Expected ${mode} mode, found: ${qualifierToString(def.qualifier)}`,
        children: [],
      })
    } else if (generalMode === def.qualifier) {
      this.suggestions.set(def.id, mode)
    }
  }
}

class ModeFinderVisitor implements EffectVisitor {
  public currentMode: OpQualifier = 'pureval'

  exitConcrete(effect: ConcreteEffect) {
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

  exitArrow(effect: ArrowEffect) {
    const r = effect.result
    if (r.kind === 'arrow') {
      throw new Error(`Unexpected arrow found in operator result: ${effectToString(r)}`)
    }

    this.currentMode = 'puredef'

    if (r.kind === 'quantified') {
      return
    }

    const [paramReads, paramUpdates, paramTemporals] = paramVariablesByEffect(effect)

    if (anyVariablesAdded(paramTemporals, r.temporal)) {
      this.currentMode = 'temporal'
    } else if (anyVariablesAdded(paramUpdates, r.update)) {
      this.currentMode = 'action'
    } else if (anyVariablesAdded(paramReads, r.read)) {
      this.currentMode = 'def'
    }
  }
}

/*
 * If there is a variable with an effect in the results that is not present on the
 * parameters, then the operator is adding that and this should
 * promote the operators mode.
 *
 * For example, an operator with the effect `(Read[v]) => Read[v, 'x']` is adding `Read['x']`
 * to the parameter effect and should be promoted to `def`.
 */
function anyVariablesAdded(paramVariables: Variables[], resultVariables: Variables): boolean {
  switch (resultVariables.kind) {
    case 'union':
      return resultVariables.variables.length > 0
        && !resultVariables.variables.every(v => paramVariables.some(p => isEqual(p, v)))
    case 'concrete':
      return resultVariables.vars.length > 0 && !paramVariables.some(p => isEqual(p, resultVariables))
    case 'quantified':
      return !paramVariables.some(p => isEqual(p, resultVariables))
  }
}

function paramVariablesByEffect(effect: ArrowEffect): [Variables[], Variables[], Variables[]] {
  const paramReads: Variables[] = []
  const paramUpdates: Variables[] = []
  const paramTemporals: Variables[] = []

  effect.params.forEach(p => {
    if (p.kind === 'concrete') {
      paramReads.push(...collectVariables(p.read))
      paramUpdates.push(...collectVariables(p.update))
      paramTemporals.push(...collectVariables(p.temporal))
    }
  })

  return [paramReads, paramUpdates, paramTemporals]
}

function collectVariables(v: Variables): Variables[] {
  if (v.kind === 'union') {
    return v.variables
  } else {
    return [v]
  }
}

const modeOrder =
  ['pureval', 'puredef', 'val', 'def', 'nondet', 'action', 'temporal', 'run']

function commonMode(m1: OpQualifier, m2: OpQualifier): OpQualifier {
  const p1 = modeOrder.findIndex(elem => elem === m1)
  const p2 = modeOrder.findIndex(elem => elem === m2)

  return p1 > p2 ? m1 : m2
}
