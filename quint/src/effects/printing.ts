/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Pretty printing for Effects.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Effect, EffectComponent, EffectScheme, Variables } from './base'
import { Substitutions, applySubstitution, compose } from './substitutions'

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
    case 'quantified': return e.name
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
  const variableNames = Array.from(e.variables)
  const vars: string[] = []

  const effectSubs: Substitutions = effectNames.map((name, i) => {
    vars.push(`e${i}`)
    return { kind: 'effect', name, value: { kind: 'quantified', name: `e${i}` } }
  })

  const variableSubs: Substitutions = variableNames.map((name, i) => {
    vars.push(`v${i}`)
    return { kind: 'variable', name: name, value: { kind: 'quantified', name: `v${i}` } }
  })

  const subs = compose(effectSubs, variableSubs)
  const effect = subs.chain(s => applySubstitution(s, e.effect))
  if (effect.isLeft()) {
    throw new Error('Unexpected error while formatting effect scheme')
  } else {
    const varsString = vars.length > 0 ? `∀ ${vars.join(', ')} . ` : ''
    return `${varsString}${effectToString(effect.value)}`
  }
}

export function effectComponentToString(c: EffectComponent): string {
  switch (c.kind) {
    case 'read': return `Read[${variablesToString(c.variables)}]`
    case 'update': return `Update[${variablesToString(c.variables)}]`
    case 'temporal': return `Temporal[${variablesToString(c.variables)}]`
  }
}
/**
 * Formats the string representation of effect variables
 *
 * @param v the Variables instance to be formatted
 *
 * @returns a string with the pretty printed variables
 */
export function variablesToString(v: Variables): string {
  switch (v.kind) {
    case 'concrete': return v.vars.map(v => `'${v.name}'`).join(', ')
    case 'quantified': return v.name
    case 'union': return v.variables.map(variablesToString).join(', ')
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
      case 'effect': return `${s.name} |-> ${effectToString(s.value)}`
      case 'variable': return `${s.name} |-> ${variablesToString(s.value)}`
    }
  })

  return `[${subsString}]`
}
