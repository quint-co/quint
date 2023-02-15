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

import { Effect, EffectComponent, Variables } from './base'
import { Substitutions } from './substitutions'

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
