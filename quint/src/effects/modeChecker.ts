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
import { qualifierToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { QuintError } from '../quintError'
import { OpQualifier, QuintInstance, QuintModule, QuintOpDef } from '../quintIr'
import { ArrowEffect, ComponentKind, EffectScheme, Variables } from './base'
import { effectToString, variablesToString } from './printing'

export type ModeCheckingResult = [Map<bigint, QuintError>, Map<bigint, OpQualifier>]

export class ModeChecker implements IRVisitor {
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
  checkModes(quintModule: QuintModule, effects: Map<bigint, EffectScheme>): ModeCheckingResult {
    this.effects = effects
    walkModule(this, quintModule)
    return [this.errors, this.suggestions]
  }

  private errors: Map<bigint, QuintError> = new Map<bigint, QuintError>()
  private suggestions: Map<bigint, OpQualifier> = new Map<bigint, OpQualifier>()

  private effects: Map<bigint, EffectScheme> = new Map<bigint, EffectScheme>()

  exitOpDef(def: QuintOpDef) {
    const effect = this.effects.get(def.id)
    if (!effect) {
      return
    }

    const [mode, explanation] = modeForEffect(effect)

    if (mode === def.qualifier) {
      return
    }

    if (isMoreGeneral(mode, def.qualifier)) {
      this.errors.set(def.id, {
        code: 'QNT200',
        message: `${qualifierToString(def.qualifier)} operators ${modeConstraint(def.qualifier)}, but operator \`${def.name}\` ${explanation}. Use ${qualifierToString(mode)} instead.`,
        data: { fix: { kind: 'replace', original: qualifierToString(def.qualifier), replacement: qualifierToString(mode) } },
      })
    } else {
      this.suggestions.set(def.id, mode)
    }
  }

  exitInstance(def: QuintInstance) {
    // For each override, check that the value a pure val
    def.overrides.forEach(([name, ex]) => {
      const effect = this.effects.get(ex.id)
      if (!effect) {
        return
      }

      const [mode, explanation] = modeForEffect(effect)

      if (mode === 'pureval') {
        return
      }

      this.errors.set(ex.id, {
        code: 'QNT201',
        message: `Instance overrides must be pure values, but the value for ${name} ${explanation}`,
        data: {},
      })
    })
  }
}

function modeConstraint(mode: OpQualifier): string {
  switch (mode) {
    case 'pureval':
    case 'puredef':
      return 'may not interact with state variables'
    case 'val':
    case 'def':
      return 'may only read state variables'
    case 'action':
      return 'may only read and update state variables'
    case 'temporal':
      return 'may not update state variables'
    case 'nondet':
    case 'run':
      return '[not supported by the mode checker]'
  }
}

const componentKindPriority: ComponentKind[] = ['temporal', 'update', 'read']
const componentDescription = new Map<ComponentKind, string>([
  ['temporal', 'performs temporal operations over'],
  ['update', 'updates'],
  ['read', 'reads'],
])
const modesForArrow = new Map<ComponentKind, OpQualifier>([
  ['temporal', 'temporal'],
  ['update', 'action'],
  ['read', 'def'],
])
const modesForConcrete = new Map<ComponentKind, OpQualifier>([
  ['temporal', 'temporal'],
  ['update', 'action'],
  ['read', 'val'],
])

function modeForEffect(temp: EffectScheme): [OpQualifier, string] {
  // Ignore quantification for now. That will be handled in a followup PR
  const effect = temp.effect
  switch (effect.kind) {
    case 'concrete': {
      const kind = componentKindPriority.find(kind => effect.components.some(c => c.kind === kind))

      if (!kind) {
        return ['pureval', "doesn't read or update any variable"]
      }

      const components = effect.components.filter(c => c.kind === kind)
      return [modesForConcrete.get(kind)!, `${componentDescription.get(kind)} variables ${components.map(c => variablesToString(c.variables))}`]
    }
    case 'arrow': {
      const r = effect.result
      if (r.kind === 'arrow') {
        throw new Error(`Unexpected arrow found in operator result: ${effectToString(r)}`)
      }

      if (r.kind === 'quantified') {
        return ['puredef', "doesn't read or update any variable"]
      }

      const variablesByComponentKind = paramVariablesByEffect(effect)
      const addedVariablesByComponentKind = new Map<ComponentKind, Variables[]>()

      r.components.forEach(c => {
        const paramVariables = variablesByComponentKind.get(c.kind) ?? []
        addedVariablesByComponentKind.set(c.kind, addedVariables(paramVariables, c.variables))
      })

      const kind = componentKindPriority.find(kind => {
        const addedVariables = addedVariablesByComponentKind.get(kind)
        return addedVariables && addedVariables.length > 0
      })

      if (!kind) {
        return ['puredef', "doesn't read or update any variable"]
      }

      return [modesForArrow.get(kind)!, `${componentDescription.get(kind)} variables ${addedVariablesByComponentKind.get(kind)!.map(variablesToString)}`]
    }
    case 'quantified': {
      return ['pureval', "doesn't read or update any variable"]
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
function addedVariables(paramVariables: Variables[], resultVariables: Variables): Variables[] {
  switch (resultVariables.kind) {
    case 'union':
      return resultVariables.variables.filter(v => !paramVariables.some(p => isEqual(p, v)))
    case 'concrete': {
      const vars = resultVariables.vars.filter(v => !paramVariables.some(p => isEqual(p, v)))
      if (vars.length === 0) {
        return []
      }

      return [{ kind: 'concrete', vars }]
    }
    case 'quantified':
      return !paramVariables.some(p => isEqual(p, resultVariables)) ? [resultVariables] : []
  }
}

function paramVariablesByEffect(effect: ArrowEffect): Map<ComponentKind, Variables[]> {
  const variablesByComponentKind: Map<ComponentKind, Variables[]> = new Map()

  effect.params.forEach(p => {
    if (p.kind === 'concrete') {
      p.components.forEach(c => {
        const existing = variablesByComponentKind.get(c.kind) || []
        variablesByComponentKind.set(c.kind, existing.concat(c.variables))
      })
    }
  })

return variablesByComponentKind
}

const modeOrder =
  ['pureval', 'puredef', 'val', 'def', 'nondet', 'action', 'temporal', 'run']

function isMoreGeneral(m1: OpQualifier, m2: OpQualifier): boolean {
  const p1 = modeOrder.findIndex(elem => elem === m1)
  const p2 = modeOrder.findIndex(elem => elem === m2)

  return p1 > p2
}
