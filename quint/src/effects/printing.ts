/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Pretty printing for Effects.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Effect, EffectComponent, EffectScheme, Entity } from './base'
import { Substitutions, applySubstitution } from './substitutions'

/**
 * Formats the string representation of  an effect
 *
 * @param e the effect to be formatted
 *
 * @returns a string with the pretty printed effect
 */
export function effectToString(e: Effect): string {
  switch (e.kind) {
    case 'concrete': {
      const output = e.components.map(effectComponentToString)

      if (output.length > 0) {
        return output.join(' & ')
      } else {
        return 'Pure'
      }
    }
    case 'variable':
      return e.name
    case 'arrow': {
      const params = e.params.map(effectToString)
      const result = effectToString(e.result)
      return `(${params.join(', ')}) => ${result}`
    }
  }
}

/**
 * Formats the string representation of an effect scheme
 *
 * @param e the effect scheme to be formatted
 *
 * @returns a string with the formatted effect scheme
 */
export function effectSchemeToString(e: EffectScheme): string {
  const effectNames = Array.from(e.effectVariables)
  const entityNames = Array.from(e.entityVariables)
  const vars: string[] = []

  const effectSubs: Substitutions = effectNames.map((name, i) => {
    vars.push(`e${i}`)
    return { kind: 'effect', name, value: { kind: 'variable', name: `e${i}` } }
  })

  const entitySubs: Substitutions = entityNames.map((name, i) => {
    vars.push(`v${i}`)
    return { kind: 'entity', name: name, value: { kind: 'variable', name: `v${i}` } }
  })

  const subs = effectSubs.concat(entitySubs)
  const effect = applySubstitution(subs, e.effect)
  if (effect.isLeft()) {
    throw new Error('Unexpected error while formatting effect scheme')
  } else {
    const varsString = vars.length > 0 ? `∀ ${vars.join(', ')} . ` : ''
    return `${varsString}${effectToString(effect.value)}`
  }
}

export function effectComponentToString(c: EffectComponent): string {
  switch (c.kind) {
    case 'read':
      return `Read[${entityToString(c.entity)}]`
    case 'update':
      return `Update[${entityToString(c.entity)}]`
    case 'temporal':
      return `Temporal[${entityToString(c.entity)}]`
  }
}
/**
 * Formats the string representation of effect entities
 *
 * @param v the Entity to be formatted
 *
 * @returns a string with the pretty printed entity
 */
export function entityToString(v: Entity): string {
  switch (v.kind) {
    case 'concrete':
      return v.stateVariables.map(v => `'${v.name}'`).join(', ')
    case 'variable':
      return v.name
    case 'union':
      return v.entities.map(entityToString).join(', ')
  }
}

/**
 * Formats the string representation of substitutions
 *
 * @param s the Substitution to be formatted
 *
 * @returns a string with the pretty printed substitution
 */
export function substitutionsToString(subs: Substitutions): string {
  const subsString = subs.map(s => {
    switch (s.kind) {
      case 'effect':
        return `${s.name} |-> ${effectToString(s.value)}`
      case 'entity':
        return `${s.name} |-> ${entityToString(s.value)}`
    }
  })

  return `[${subsString}]`
}
