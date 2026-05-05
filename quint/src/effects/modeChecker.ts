/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Check that all definitions in a module have correctly annotated modes
 * according to inferred effects
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { isDeepStrictEqual as isEqual } from 'node:util'
import { qualifierToString } from '../ir/IRprinting'
import { IRVisitor, walkDeclaration } from '../ir/IRVisitor'
import { QuintError } from '../quintError'
import { OpQualifier, QuintDeclaration, QuintInstance, QuintOpDef } from '../ir/quintIr'
import { unreachable } from '../util'
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
   * Matches annotated modes for each declaration with its inferred effect. Returns
   * errors for incorrect annotations and suggestions for annotations that could
   * be more strict.
   *
   * @param decls: the list of declarations to be checked
   * @param effects: the map from expression ids to their inferred effects
   *
   * @returns The mode errors, if any is found. Otherwise, a map with potential suggestions.
   */
  checkModes(decls: QuintDeclaration[], effects: Map<bigint, EffectScheme>): ModeCheckingResult {
    this.effects = effects
    decls.forEach(decl => walkDeclaration(this, decl))
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

    const [mode, explanation] = modeForEffect(effect, def.qualifier)

    if (mode === def.qualifier) {
      return
    }

    if (isMoreGeneral(mode, def.qualifier)) {
      this.errors.set(def.id, {
        code: 'QNT200',
        message: `${qualifierToString(def.qualifier)} operators ${modeConstraint(
          def.qualifier,
          mode
        )}, but operator \`${def.name}\` ${explanation}. Use ${qualifierToString(mode)} instead.`,
        reference: def.id,
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

      const [mode, explanation] = modeForEffect(effect, 'puredef')

      if (mode === 'pureval' || mode === 'puredef') {
        return
      }

      this.errors.set(ex.id, {
        code: 'QNT201',
        message: `Instance overrides must be pure, but the value for ${name.name} ${explanation}`,
        reference: ex.id,
        data: {},
      })
    })
  }
}

function modeConstraint(mode: OpQualifier, expectedMode: OpQualifier): string {
  switch (mode) {
    case 'pureval':
      if (expectedMode === 'puredef') {
        return 'may not have parameters'
      } else {
        return 'may not interact with state variables'
      }
    case 'puredef':
      return 'may not interact with state variables'
    case 'val':
      if (expectedMode === 'def') {
        return 'may not have parameters'
      } else {
        return 'may only read state variables'
      }
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

function modeForEffect(scheme: EffectScheme, annotatedMode: OpQualifier): [OpQualifier, string] {
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

      const parametersMessage = `has ${effect.params.length} parameter${effect.params.length > 1 ? 's' : ''}`

      if (r.kind === 'variable') {
        return ['puredef', parametersMessage]
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

      if (annotatedMode === 'val' && (!kind || kind === 'read')) {
        return ['def', parametersMessage]
      }

      if (!kind) {
        return ['puredef', parametersMessage]
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
      return resultEntity.entities.flatMap(entity => addedEntities(paramEntities, entity))
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
      case 'concrete':
        {
          p.components.forEach(c => {
            const existing = entitiesByComponentKind.get(c.kind) || []
            entitiesByComponentKind.set(c.kind, concatEntity(existing, c.entity))
          })
        }
        break
      case 'arrow':
        {
          const nested = paramEntitiesByEffect(p)
          nested.forEach((entities, kind) => {
            const existing = entitiesByComponentKind.get(kind) || []
            entitiesByComponentKind.set(kind, entities.reduce(concatEntity, existing))
          })
          if (p.result.kind === 'concrete') {
            p.result.components.forEach(c => {
              const existing = entitiesByComponentKind.get(c.kind) || []
              entitiesByComponentKind.set(c.kind, concatEntity(existing, c.entity))
            })
          }
        }
        break
      case 'variable':
        // Nothing to gather
        break
      default:
        unreachable(p)
    }
  })

  return entitiesByComponentKind
}

function concatEntity(list: Entity[], entity: Entity): Entity[] {
  switch (entity.kind) {
    case 'union':
      return entity.entities.reduce(concatEntity, list)
    case 'concrete':
    case 'variable':
      return list.concat(entity)
  }
}

const modeOrder = ['pureval', 'val', 'puredef', 'def', 'nondet', 'action', 'temporal', 'run']

function isMoreGeneral(m1: OpQualifier, m2: OpQualifier): boolean {
  const p1 = modeOrder.findIndex(elem => elem === m1)
  const p2 = modeOrder.findIndex(elem => elem === m2)

  return p1 > p2
}
