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

import { Effect, ErrorTree, Substitution, Variables } from './base'

/**
 * Pretty prints an effect
 *
 * @param e the effect to be formatted
 *
 * @returns a string with the pretty printed effect
 */
export function effectToString (e: Effect): string {
  switch (e.kind) {
    case 'concrete': {
      const output = []
      if (e.read.kind !== 'concrete' || e.read.vars.length > 0) {
        output.push(`Read[${variablesToString(e.read)}]`)
      }
      if (e.update.kind !== 'concrete' || e.update.vars.length > 0) {
        output.push(`Update[${variablesToString(e.update)}]`)
      }
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
 * Pretty prints effect variables
 *
 * @param v the Variables instance to be formatted
 *
 * @returns a string with the pretty printed variables
 */
export function variablesToString (v: Variables): string {
  switch (v.kind) {
    case 'concrete': return v.vars.map(v => `'${v}'`).join(', ')
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
export function substitutionToString (s: Substitution): string {
  switch (s.kind) {
    case 'effect': return `${s.name} |-> ${effectToString(s.value)}`
    case 'variable': return `${s.name} |-> ${variablesToString(s.value)}`
  }
}

/**
 * Pretty prints an error tree
 *
 * @param e the ErrorTree to be formatted
 *
 * @returns a multiline string with the pretty printed error tree
 */
export function errorTreeToString (e: ErrorTree): string {
  const childrenErrors = e.children.map(errorTreeToString)
  let out = childrenErrors.join('and\n')
  out += e.message ? e.message + '\n' : ''
  out += e.location + '\n'

  return out
}
