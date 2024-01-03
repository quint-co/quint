import { rowToString, typeToString } from '../ir/IRprinting'
import { QuintType } from '../ir/quintTypes'
import { Constraint, TypeScheme } from './base'
import { Substitutions, applySubstitution, compose } from './substitutions'

/**
 * Formats the string representation of a constraint
 *
 * @param c the Constraint to be formatted
 *
 * @returns a string with the formatted constraint
 */
export function constraintToString(c: Constraint): string {
  switch (c.kind) {
    case 'eq':
      return `${typeToString(c.types[0])} ~ ${typeToString(c.types[1])}`
    case 'conjunction':
      return c.constraints.map(constraintToString).join(' /\\ ')
    case 'isDefined':
      return `${typeToString(c.type)} is defined`
    case 'empty':
      return 'true'
  }
}

/**
 * Formats the string representation of a type scheme
 *
 * @param t the type scheme to be formatted
 *
 * @returns a string with the formatted type scheme
 */
export function typeSchemeToString(t: TypeScheme): string {
  const [vars, type] = canonicalTypeScheme(t)

  const varsString = vars.length > 0 ? `∀ ${vars.join(', ')} . ` : ''
  return `${varsString}${typeToString(type)}`
}

export function canonicalTypeScheme(t: TypeScheme): [string[], QuintType] {
  const typeNames = Array.from(t.typeVariables)
  const rowNames = Array.from(t.rowVariables)
  const vars: string[] = []

  const typeSubs: Substitutions = typeNames.map((name, i) => {
    vars.push(`t${i}`)
    return { kind: 'type', name, value: { kind: 'var', name: `t${i}` } }
  })

  const rowSubs: Substitutions = rowNames.map((name, i) => {
    vars.push(`r${i}`)
    return { kind: 'row', name: name, value: { kind: 'var', name: `r${i}` } }
  })

  const subs = compose(new Map(), typeSubs, rowSubs)
  const type = applySubstitution(new Map(), subs, t.type)

  return [vars, type]
}

/**
 * Formats the string representation of substitutions
 *
 * @param subs the Substitution to be formatted
 *
 * @returns a string with the pretty printed substitution
 */
export function substitutionsToString(subs: Substitutions): string {
  const subsString = subs.map(s => {
    if (s.kind === 'type') {
      return `${s.name} |-> ${typeToString(s.value)}`
    } else {
      return `${s.name} |-> ${rowToString(s.value)}`
    }
  })

  return `[ ${subsString.join(', ')} ]`
}
