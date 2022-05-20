import { printEffect, printVariables } from './printing'

export type Variables =
  | { kind: 'state', vars: string[] }
  | { kind: 'quantification', name: string }
  | { kind: 'union', variables: Variables[] }

export type Effect =
  | { kind: 'var', name: string }
  | { kind: 'effect', read: Variables, update: Variables }
  | { kind: 'arrow', effects: Effect[] }

type Substitution =
  | { kind: 'variable', name: string, value: Variables }
  | { kind: 'effect', name: string, value: Effect }

// interface Error { message: string }
interface ErrorTree { message?: string, location: string, children: ErrorTree[] }

type UnificationResult =
  | { kind: 'ok', substitutions: Substitution[] }
  | { kind: 'error', error: ErrorTree }

interface UnificationPartialResult { substitutions: Substitution[], errors: ErrorTree[] }

function compose (s1: Substitution[], s2: Substitution[]): Substitution[] {
  return s1.concat(s2)
}

export function unify (ea: Effect, eb: Effect): UnificationResult {
  const e1 = simplify(ea)
  const e2 = simplify(eb)
  const location = `Trying to unify ${printEffect(e1)} and ${printEffect(e2)}`

  if (e1.kind === 'arrow' && e2.kind === 'arrow') {
    // Both arrow
    if (e1.effects.length !== e2.effects.length) {
      const expected = e1.effects.length - 1
      const got = e2.effects.length - 1
      return {
        kind: 'error',
        error: {
          location: location,
          message: `Expected ${expected} arguments, got ${got}`,
          children: [],
        },
      }
    }

    const partialResult = e1.effects.reduce((r: UnificationPartialResult, e, i) => {
      const e1s = applySubstitution(r.substitutions, e)
      const e2s = applySubstitution(r.substitutions, e2.effects[i])
      const result = unify(e1s, e2s)
      if (result.kind === 'ok') {
        return {
          substitutions: r.substitutions.concat(result.substitutions),
          errors: r.errors,
        }
      } else {
        return {
          substitutions: r.substitutions,
          errors: r.errors.concat(result.error),
        }
      }
    }, { substitutions: [], errors: [] })

    if (partialResult.errors.length > 0) {
      return {
        kind: 'error', error: { location: location, children: partialResult.errors },
      }
    } else {
      return { kind: 'ok', substitutions: partialResult.substitutions }
    }
  } else if (e1.kind === 'effect' && e2.kind === 'effect') {
    // Both actual effect
    const result = unifyVariables(e1.read, e2.read)
    if (result.kind === 'error') {
      return result
    }
    const e1s = applySubstitution(result.substitutions, e1)
    const e2s = applySubstitution(result.substitutions, e2)
    if (e1s.kind === 'effect' && e2s.kind === 'effect') {
      // I think this is always true
      const updateResult = unifyVariables(e1s.update, e2s.update)
      if (updateResult.kind === 'error') {
        return updateResult
      }
      return { kind: 'ok', substitutions: compose(result.substitutions, updateResult.substitutions) }
    } else {
      throw new Error(`Unexpected format on ${printEffect(e1s)} and/or ${printEffect(e2s)}`)
    }
  } else if (e1.kind === 'var') {
    const substitutions: Substitution[] = [{ kind: 'effect', name: e1.name, value: e2 }]
    return { kind: 'ok', substitutions: substitutions }
  } else if (e2.kind === 'var') {
    const substitutions: Substitution[] = [{ kind: 'effect', name: e2.name, value: e1 }]
    return { kind: 'ok', substitutions: substitutions }
  } else {
    return {
      kind: 'error',
      error: {
        location: location,
        message: "Can't unify different types of effects",
        children: [],
      },
    }
  }
}

function unifyVariables (v1: Variables, v2: Variables): UnificationResult {
  const location = `Trying to unify variables ${printVariables(v1)} and ${printVariables(v2)}`

  if (v1.kind === 'state' && v2.kind === 'state') {
    // Both state
    if (sameVars(v1.vars, v2.vars)) {
      return { kind: 'ok', substitutions: [] }
    } else {
      return {
        kind: 'error',
        error: {
          location: location,
          message: `Expected effect to act over variable(s) ${v1.vars} instead of ${v2.vars}`,
          children: [],
        },
      }
    }
  } else if (v1.kind === 'union' && v2.kind === 'union') {
    // Both union
    if (v1.variables.length !== v2.variables.length) {
      // TODO: see about ordering
      const expected = v1.variables.length - 1
      const got = v2.variables.length - 1
      return {
        kind: 'error',
        error: {
          location: location,
          message: `Expected ${expected} variables, got ${got}`,
          children: [],
        },
      }
    }

    const partialResult = v1.variables.reduce((r: UnificationPartialResult, v, i) => {
      const v1s = applySubstitutionToVariables(r.substitutions, v)
      const v2s = applySubstitutionToVariables(r.substitutions, v2.variables[i])
      const result = unifyVariables(v1s, v2s)
      if (result.kind === 'ok') {
        return {
          substitutions: r.substitutions.concat(result.substitutions),
          errors: r.errors,
        }
      } else {
        return {
          substitutions: r.substitutions,
          errors: r.errors.concat(result.error),
        }
      }
    }, { substitutions: [], errors: [] })

    if (partialResult.errors.length > 0) {
      return {
        kind: 'error', error: { location: location, children: partialResult.errors },
      }
    } else {
      return { kind: 'ok', substitutions: partialResult.substitutions }
    }
  } else if (v1.kind === 'quantification') {
    const substitutions: Substitution[] = [{ kind: 'variable', name: v1.name, value: v2 }]
    return { kind: 'ok', substitutions: substitutions }
  } else if (v2.kind === 'quantification') {
    const substitutions: Substitution[] = [{ kind: 'variable', name: v2.name, value: v1 }]
    return { kind: 'ok', substitutions: substitutions }
  } else {
    return {
      kind: 'error',
      error: { location: location, message: "Can't unify different types of variables", children: [] },
    }
  }
}

function sameVars (v1: string[], v2: string[]): Boolean {
  const v1s = sortStrings(v1)
  const v2s = sortStrings(v2)

  return v1s.length === v2s.length && v1s.every((value, index) => value === v2s[index])
}

function sortStrings (array: string[]): string[] {
  return array.sort((n1, n2) => {
    if (n1 > n2) {
      return 1
    }

    if (n1 < n2) {
      return -1
    }

    return 0
  })
}

function simplify (e: Effect): Effect {
  if (e.kind !== 'effect') {
    return e
  }

  const read = simplifyVariables(e.read, false)
  const update = simplifyVariables(e.update, true)

  return { kind: 'effect', read: read, update: update }
}

function simplifyVariables (variables: Variables, checkRepeated: Boolean): Variables {
  if (variables.kind === 'union') {
    const unionVariables: Variables[] = []
    const vars: string[] = []
    variables.variables.forEach(v => {
      switch (v.kind) {
        case 'quantification':
          unionVariables.push(v)
          break
        case 'state':
          vars.push(...v.vars)
          break
        case 'union': {
          const vs = simplifyVariables(v, checkRepeated)
          switch (vs.kind) {
            case 'quantification':
              unionVariables.push(vs)
              break
            case 'state':
              vars.push(...vs.vars)
              break
            case 'union':
              unionVariables.push(...vs.variables)
              break
          }
          break
        }
      }
    })
    const repeated = vars.filter(v => vars.filter(v2 => v === v2).length > 1)
    if (checkRepeated && repeated.length > 0) {
      throw new Error(`Multiple updates of variables: ${repeated}`)
    }
    if (unionVariables.length > 0) {
      const variables = vars.length > 0 ? unionVariables.concat({ kind: 'state', vars: vars }) : unionVariables
      return { kind: 'union', variables: variables }
    } else {
      return { kind: 'state', vars: vars }
    }
  }
  return variables
}

function applySubstitution (subs: Substitution[], e: Effect): Effect {
  if (e.kind === 'var') {
    const sub = subs.find(s => s.name === e.name)
    if (sub && sub.kind === 'effect') {
      return sub.value
    } else {
      return e
    }
  } else if (e.kind === 'arrow') {
    return {
      kind: e.kind, effects: e.effects.map(ef => applySubstitution(subs, ef)),
    }
  } else if (e.kind === 'effect') {
    const read = applySubstitutionToVariables(subs, e.read)
    const update = applySubstitutionToVariables(subs, e.update)

    return { kind: 'effect', read: read, update: update }
  }

  return e
}

function applySubstitutionToVariables (subs: Substitution[], variables: Variables): Variables {
  switch (variables.kind) {
    case 'quantification': {
      // what is wrong with TS type system here??
      const sub = subs.find(s => s.name === (variables.kind === 'quantification' ? variables.name : ''))
      if (sub && sub.kind === 'variable') {
        return sub.value
      }
      break
    }
    case 'union': {
      const newVariables = variables.variables.map(v => applySubstitutionToVariables(subs, v))
      return { kind: 'union', variables: newVariables }
    }
  }
  return variables
}
