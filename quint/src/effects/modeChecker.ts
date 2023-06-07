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
import { IRVisitor, walkDefinition } from '../IRVisitor'
import { QuintError } from '../quintError'
import { OpQualifier, QuintDef, QuintInstance, QuintOpDef } from '../quintIr'
import { ArrowEffect, ComponentKind, EffectScheme, Entity, entityNames, stateVariables } from './base'
import { effectToString, entityToString } from './printing'

export type ModeCheckingResult = [Map<bigint, QuintError>, Map<bigint, OpQualifier>]

export class ModeChecker implements IRVisitor {
  /**
   * Constructs a new instance of ModeChecker with optional suggestions.
   *
   * @constructor
   * @param suggestions - Optional map of suggestions for annotations that could
   * be more strict. To be used as a starting point
   */
  constructor(suggestions?: Map<bigint, OpQualifier>) {
    if (suggestions) {
      this.suggestions = suggestions
    }
  }

  /**
   * Matches annotated modes for each definition with its inferred effect. Returns
   * errors for incorrect annotations and suggestions for annotations that could
   * be more strict.
   *
   * @param defs: the list of definitions to be checked
   * @param effects: the map from expression ids to their inferred effects
   *
   * @returns The mode errors, if any is found. Otherwise, a map with potential suggestions.
   */
  checkModes(defs: QuintDef[], effects: Map<bigint, EffectScheme>): ModeCheckingResult {
    this.effects = effects
    defs.forEach(def => walkDefinition(this, def))
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
        message: `${qualifierToString(def.qualifier)} operators ${modeConstraint(def.qualifier)}, but operator \`${
          def.name
        }\` ${explanation}. Use ${qualifierToString(mode)} instead.`,
        data: {
          fix: { kind: 'replace', original: qualifierToString(def.qualifier), replacement: qualifierToString(mode) },
        },
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

      if (mode === 'pureval' || mode === 'puredef') {
        return
      }

      this.errors.set(ex.id, {
        code: 'QNT201',
        message: `Instance overrides must be pure, but the value for ${name.name} ${explanation}`,
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

function modeForEffect(scheme: EffectScheme): [OpQualifier, string] {
  const effect = scheme.effect
  const nonFreeVars = scheme.entityVariables

  switch (effect.kind) {
    case 'concrete': {
      const kind = componentKindPriority.find(kind => {
        return effect.components.some(c => {
          if (c.kind !== kind) {
            return false
          }
          const nonFreeEntities = entityNames(c.entity)
            .filter(v => nonFreeVars.has(v))
            .concat(stateVariables(c.entity).map(v => v.name))

          return nonFreeEntities && nonFreeEntities.length > 0
        })
      })

      if (!kind) {
        return ['pureval', "doesn't read or update any state variable"]
      }

      const components = effect.components.filter(c => c.kind === kind)
      return [
        modesForConcrete.get(kind)!,
        `${componentDescription.get(kind)} variables ${components.map(c => entityToString(c.entity))}`,
      ]
    }
    case 'arrow': {
      const r = effect.result
      if (r.kind === 'arrow') {
        throw new Error(`Unexpected arrow found in operator result: ${effectToString(effect)}`)
      }

      if (r.kind === 'variable') {
        return ['puredef', "doesn't read or update any state variable"]
      }

      const entitiesByComponentKind = paramEntitiesByEffect(effect)
      const addedEntitiesByComponentKind = new Map<ComponentKind, Entity[]>()

      r.components.forEach(c => {
        const paramEntities = entitiesByComponentKind.get(c.kind) ?? []
        addedEntitiesByComponentKind.set(c.kind, addedEntities(paramEntities, c.entity))
      })

      const kind = componentKindPriority.find(kind => {
        const entities = addedEntitiesByComponentKind.get(kind)
        const nonFreeEntities = entities?.flatMap(vs => {
          return entityNames(vs)
            .filter(v => nonFreeVars.has(v))
            .concat(stateVariables(vs).map(v => v.name))
        })
        return nonFreeEntities && nonFreeEntities.length > 0
      })

      if (!kind) {
        return ['puredef', "doesn't read or update any state variable"]
      }

      return [
        modesForArrow.get(kind)!,
        `${componentDescription.get(kind)} variables ${addedEntitiesByComponentKind.get(kind)!.map(entityToString)}`,
      ]
    }
    case 'variable': {
      return ['pureval', "doesn't read or update any state variable"]
    }
  }
}

/*
 * If there is a entity with an effect in the results that is not present on the
 * parameters, then the operator is adding that and this should
 * promote the operators mode.
 *
 * For example, an operator with the effect `(Read[v]) => Read[v, 'x']` is adding `Read['x']`
 * to the parameter effect and should be promoted to `def`.
 */
function addedEntities(paramEntities: Entity[], resultEntity: Entity): Entity[] {
  switch (resultEntity.kind) {
    case 'union':
      return resultEntity.entities.filter(v => !paramEntities.some(p => isEqual(p, v)))
    case 'concrete': {
      const vars = resultEntity.stateVariables.filter(v => !paramEntities.some(p => isEqual(p, v)))
      if (vars.length === 0) {
        return []
      }

      return [{ kind: 'concrete', stateVariables: vars }]
    }
    case 'variable':
      return !paramEntities.some(p => isEqual(p, resultEntity)) ? [resultEntity] : []
  }
}

function paramEntitiesByEffect(effect: ArrowEffect): Map<ComponentKind, Entity[]> {
  const entitiesByComponentKind: Map<ComponentKind, Entity[]> = new Map()

  effect.params.forEach(p => {
    switch (p.kind) {
      case 'concrete': {
        p.components.forEach(c => {
          const existing = entitiesByComponentKind.get(c.kind) || []
          entitiesByComponentKind.set(c.kind, existing.concat(c.entity))
        })
        break
      }
      case 'arrow': {
        const nested = paramEntitiesByEffect(p)
        nested.forEach((entities, kind) => {
          const existing = entitiesByComponentKind.get(kind) || []
          entitiesByComponentKind.set(kind, existing.concat(entities))
        })
        if (p.result.kind === 'concrete') {
          p.result.components.forEach(c => {
            const existing = entitiesByComponentKind.get(c.kind) || []
            entitiesByComponentKind.set(c.kind, existing.concat(c.entity))
          })
        }
      }
    }
  })

  return entitiesByComponentKind
}

const modeOrder = ['pureval', 'puredef', 'val', 'def', 'nondet', 'action', 'temporal', 'run']

function isMoreGeneral(m1: OpQualifier, m2: OpQualifier): boolean {
  const p1 = modeOrder.findIndex(elem => elem === m1)
  const p2 = modeOrder.findIndex(elem => elem === m2)

  return p1 > p2
}
