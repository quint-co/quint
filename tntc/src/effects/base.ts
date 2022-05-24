import { printEffect, printVariables } from './printing'
import { Either, merge, right, left, mergeInMany } from '@sweet-monads/either'

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

interface ErrorTree { message?: string, location: string, children: ErrorTree[] }

type UnificationResult =
  | { kind: 'ok', substitutions: Substitution[] }
  | { kind: 'error', error: ErrorTree }

interface UnificationPartialResult { substitutions: Substitution[], errors: ErrorTree[] }

function compose (s1: Substitution[], s2: Substitution[]): Substitution[] {
  return s1.concat(s2)
}

export function unify (ea: Effect, eb: Effect): UnificationResult {
  const location = `Trying to unify ${printEffect(ea)} and ${printEffect(eb)}`
  const simplificationResult = mergeInMany([ea, eb].map(simplify))
  if (simplificationResult.isLeft()) {
    const { value } = simplificationResult
    return { kind: 'error', error: { location: location, children: value } }
  }

  const { value } = simplificationResult
  const e1 = value[0]
  const e2 = value[1]

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
      const subsResult = mergeInMany([e1s, e2s])
      if (subsResult.isLeft()) {
        const { value } = subsResult
        return {
          substitutions: r.substitutions,
          errors: r.errors.concat(value),
        }
      }

      const { value } = subsResult
      const result = unify(value[0], value[1])
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
      return { kind: 'error', error: { location: location, children: [result.error] } }
    }
    const e1r = applySubstitution(result.substitutions, e1)
    const e2r = applySubstitution(result.substitutions, e2)
    const subsResult = mergeInMany([e1r, e2r])
    if (subsResult.isLeft()) {
      const { value } = subsResult
      return { kind: 'error', error: { location: location, children: value } }
    }

    const { value } = subsResult
    const e1s = value[0]
    const e2s = value[1]

    if (e1s.kind === 'effect' && e2s.kind === 'effect') {
      // I think this is always true
      const updateResult = unifyVariables(e1s.update, e2s.update)
      if (updateResult.kind === 'error') {
        return { kind: 'error', error: { location: location, children: [updateResult.error] } }
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

function unifyVariables (va: Variables, vb: Variables): UnificationResult {
  const v1 = simplifyVariables(va, false)
  const v2 = simplifyVariables(vb, false)
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

    const v1filtered = v1.variables.filter(v => !v2.variables.includes(v))
    const v2filtered = v2.variables.filter(v => !v1.variables.includes(v))

    if (v1filtered.length !== v2filtered.length) {
      const expected = v1.variables.length
      const got = v2.variables.length
      return {
        kind: 'error',
        error: {
          location: location,
          message: `Expected ${expected} variables, got ${got}`,
          children: [],
        },
      }
    }

    const partialResult = v1filtered.reduce((r: UnificationPartialResult, variables, i) => {
      const v1s = applySubstitutionToVariables(r.substitutions, variables)
      const v2s = applySubstitutionToVariables(r.substitutions, v2filtered[i])
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
  } else if (v1.kind === 'quantification' && v2.kind === 'quantification' && v1.name === v2.name) {
    return { kind: 'ok', substitutions: [] }
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
  return array.sort((n1, n2) => n1 > n2 ? 1 : -1)
}

function sortVariables (array: Variables[]): Variables[] {
  return array.sort((v1, v2) => {
    if (v1.kind !== 'quantification' || v2.kind !== 'quantification') {
      return 0
    }

    return v1.name > v2.name ? 1 : -1
  })
}

function simplify (e: Effect): Either<ErrorTree, Effect> {
  if (e.kind !== 'effect') {
    return right(e)
  }

  const read = simplifyVariables(e.read, false)
  const update = simplifyVariables(e.update, true)

  const updateVars = findVars(e.update)
  const repeated = updateVars.filter(v => updateVars.filter(v2 => v === v2).length > 1)
  if (repeated.length > 0) {
    return left({
      location: `Trying to simplify effect ${printEffect(e)}`,
      message: `Multiple updates of variable(s): ${Array.from(new Set(repeated))}`,
      children: [],
    })
  } else {
    return right({ kind: 'effect', read: read, update: update })
  }
}

function findVars (variables: Variables): string[] {
  switch (variables.kind) {
    case 'quantification':
      return []
    case 'state':
      return variables.vars
    case 'union':
      return variables.variables.flatMap(findVars)
  }
}

function simplifyVariables (variables: Variables, checkRepeated: Boolean): Variables {
  const unionVariables: Variables[] = []
  const vars: string[] = []
  switch (variables.kind) {
    case 'quantification':
      unionVariables.push(variables)
      break
    case 'state':
      vars.push(...variables.vars)
      break
    case 'union': {
      const flattenVariables = variables.variables.map(v => simplifyVariables(v, checkRepeated))
      flattenVariables.forEach(v => {
        switch (v.kind) {
          case 'quantification':
            unionVariables.push(v)
            break
          case 'state':
            vars.push(...v.vars)
            break
          case 'union':
            unionVariables.push(...v.variables)
            break
        }
      })
      break
    }
  }

  const sortedUnionVariables = sortVariables(unionVariables)
  if (unionVariables.length > 0) {
    const variables = vars.length > 0 ? sortedUnionVariables.concat({ kind: 'state', vars: vars }) : unionVariables
    return variables.length > 1 ? { kind: 'union', variables: variables } : variables[0]
  } else {
    return { kind: 'state', vars: vars }
  }
}

// function mapResults<T> (array: T[], f: ((t: T) => SimplificationResult)): SimplificationResult {
//   const effects: Effect[] = []
//   const errors: ErrorTree[] = []
//   array.forEach(x => {
//     const r = f(x)
//     if (r.kind === 'ok') {
//       effects.push(r.effect)
//     } else {
//       errors.push(r.error)
//     }
//   })

//   if (errors.length > 0) {
//     return:
//   }
// }

function applySubstitution (subs: Substitution[], e: Effect): Either<ErrorTree, Effect> {
  let result: Either<ErrorTree, Effect> = right(e)
  switch (e.kind) {
    case 'var': {
      const sub = subs.find(s => s.name === e.name)
      if (sub && sub.kind === 'effect') {
        result = right(sub.value)
      }
      break
    }
    case 'arrow':
      result = merge(e.effects.map(ef => applySubstitution(subs, ef))).map(es => {
        return {
          kind: e.kind,
          effects: es,
        }
      })
      break
    case 'effect': {
      const read = applySubstitutionToVariables(subs, e.read)
      const update = applySubstitutionToVariables(subs, e.update)

      result = right({ kind: 'effect', read: read, update: update })
      break
    }
  }

  return result.map(simplify).join()
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
