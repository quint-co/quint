/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Essentials for handling Effects: unification, simplification and substitutions
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { effectToString, variablesToString } from './printing'
import { Either, merge, right, left, mergeInMany } from '@sweet-monads/either'

/*
 * The effect of a TNT expression, regarding which state variables are read
 * and/or updated
 */
export type Effect =
  /* Effect variables are quantifications over effects */
  | { kind: 'var', name: string }
  /* Concrete atomic efects specifying variables that the expression reads and updates */
  | { kind: 'effect', read: Variables, update: Variables }
  /* Arrow effects for expressions with effects depending on parameters */
  | { kind: 'arrow', effects: Effect[] }

/*
 * The variables an effect acts upon. Either a list of state variables, a
 * quantification over them or a combination of other variables.
 * Uses the plural form since all forms represent a plurality of variables.
 */
export type Variables =
  /* A list of state variables */
  | { kind: 'state', vars: string[] }
  /* A quantification variable, referring to an array of state variables, to be substituted */
  | { kind: 'quantification', name: string }
  /* A combination of variables to be computed as a union when concrete */
  | { kind: 'union', variables: Variables[] }

/*
 * A tree of errors tracking the trace from the full given effect(s) to the part
 * where the error occurred
 */
export interface ErrorTree {
  /* The error message, used for the terminal node where the error occurred */
  message?: string,
  /* A description of the context within which the current node is encountered */
  location: string,
  /* The node's children */
  children: ErrorTree[]
}

/*
 * A simple disjunction over error representations to make it easier to chain
 * different operations and handle errors all at once (see buildErrorTree())
 * */
type Error = ErrorTree | ErrorTree[]

/*
 * Substitutions can be applied to both effects and variables, replacing
 * quantified values with concrete ones
 */
type Substitution =
  | { kind: 'variable', name: string, value: Variables }
  | { kind: 'effect', name: string, value: Effect }

/**
 * Unifies two effects by matching effect types and unifying their variables.
 *
 * @param ea an effect to be unified
 * @param eb the effect to be unified with
 *
 * @returns an array of substitutions that unifies both effects, when possible.
 *          Otherwise, an error tree with an error message and its trace.
 */
export function unify (ea: Effect, eb: Effect): Either<ErrorTree, Substitution[]> {
  const location = `Trying to unify ${effectToString(ea)} and ${effectToString(eb)}`

  const simplificationResult = mergeInMany([ea, eb].map(simplify))
  return simplificationResult.chain(([e1, e2]): Either<Error, Substitution[]> => {
    if (e1.kind === 'arrow' && e2.kind === 'arrow') {
      // Both arrow
      if (e1.effects.length !== e2.effects.length) {
        const expected = e1.effects.length - 1
        const got = e2.effects.length - 1
        return left({
          location: location,
          message: `Expected ${expected} arguments, got ${got}`,
          children: [],
        })
      }

      return e1.effects.reduce((result: Either<Error, Substitution[]>, e, i) => {
        const effectsWithSubstitutions = result.chain(subs => mergeInMany([
          applySubstitution(subs, e),
          applySubstitution(subs, e2.effects[i]),
        ]))
        const newSubstitutions = effectsWithSubstitutions.chain(es => unify(...es))
        return newSubstitutions.chain(newSubs => result.map(currentSubs => currentSubs.concat(newSubs)))
      }, right([]))
    } else if (e1.kind === 'effect' && e2.kind === 'effect') {
      // Both actual effect
      const readUnificationResult = unifyVariables(e1.read, e2.read)
      const updateUnificationResult = readUnificationResult.chain(subs => {
        const effectsWithReadSubstitution = mergeInMany([
          applySubstitution(subs, e1),
          applySubstitution(subs, e2),
        ]).map(effects => effects.map(ensureEffect))

        return effectsWithReadSubstitution.chain(([e1s, e2s]) => unifyVariables(e1s.update, e2s.update))
      })

      const result = merge([readUnificationResult, updateUnificationResult]).map(s => s.flat())
      return result.mapLeft(error => buildErrorTree(location, error))
    } else if (e1.kind === 'var') {
      return right([{ kind: 'effect', name: e1.name, value: e2 }])
    } else if (e2.kind === 'var') {
      return right([{ kind: 'effect', name: e2.name, value: e1 }])
    } else {
      return left({
        location: location,
        message: "Can't unify different types of effects",
        children: [],
      })
    }
  }).mapLeft(error => buildErrorTree(location, error))
}

function unifyVariables (va: Variables, vb: Variables): Either<ErrorTree, Substitution[]> {
  const v1 = simplifyVariables(va, false)
  const v2 = simplifyVariables(vb, false)
  const location = `Trying to unify variables ${variablesToString(v1)} and ${variablesToString(v2)}`

  if (v1.kind === 'state' && v2.kind === 'state') {
    // Both state
    if (sameVars(v1.vars, v2.vars)) {
      return right([])
    } else {
      return left({
        location: location,
        message: `Expected effect to act over variable(s) ${v1.vars} instead of ${v2.vars}`,
        children: [],
      })
    }
  } else if (v1.kind === 'quantification' && v2.kind === 'quantification' && v1.name === v2.name) {
    return right([])
  } else if (v1.kind === 'quantification') {
    return right([{ kind: 'variable', name: v1.name, value: v2 }])
  } else if (v2.kind === 'quantification') {
    return right([{ kind: 'variable', name: v2.name, value: v1 }])
  } else { // At least one of the variables is a union
    // Unifying sets is complicated and we should never have to do this in TNT's
    // use case for this effect system

    return left({
      location: location,
      message: 'Unification for unions of variables is not implemented',
      children: [],
    })
  }
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
      location: `Trying to simplify effect ${effectToString(e)}`,
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
      result = mergeInMany(e.effects.map(ef => applySubstitution(subs, ef))).map(es => {
        return { kind: e.kind, effects: es }
      }).mapLeft(error => buildErrorTree(`Applying substitution to arrow effect ${effectToString(e)}`, error))
      break
    case 'effect': {
      const read = applySubstitutionToVariables(subs, e.read)
      const update = applySubstitutionToVariables(subs, e.update)

      result = right({ kind: 'effect', read: read, update: update })
      break
    }
  }

  return result.chain(simplify)
}

function applySubstitutionToVariables (subs: Substitution[], variables: Variables): Variables {
  switch (variables.kind) {
    case 'quantification': {
      const sub = subs.find(s => s.name === variables.name)
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

function buildErrorTree (location: string, errors: Error): ErrorTree {
  if (!Array.isArray(errors) && location === errors.location) {
    // Avoid redundant locations
    return errors
  }

  return { location: location, children: Array.isArray(errors) ? errors : [errors] }
}

// Ensure the types ystem that an effect has the 'effect' kind
function ensureEffect (e: Effect): { kind: 'effect', read: Variables, update: Variables } {
  if (e.kind !== 'effect') {
    throw new Error(`Unexpected format on ${effectToString(e)} - should have kind 'effect'`)
  }

  return e
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
