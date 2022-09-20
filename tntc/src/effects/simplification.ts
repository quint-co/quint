/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Simplification for effects, including a check on multiple updates of the same variable
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import isEqual from 'lodash.isequal'
import { buildErrorTree, ErrorTree } from '../errorTree'
import { ConcreteEffect, Effect, Variables } from './base'
import { effectToString } from './printing'

/*
 * Simplifies a concrete effect Read[r] & Update[u] by:
 *   1. Removing repeated variables in r
 *   2. Flattening nested unions under r and u
 *   3. Checking for any repeated state variables in u and reporting if found
 *
 * @param e the concrete effect to be simplified
 *
 * @returns the simplified effect if no multiple updates are found. Otherwise, the error.
 */
export function simplifyConcreteEffect (e: ConcreteEffect): Either<ErrorTree, Effect> {
  const read = uniqueVariables(flattenUnions(e.read))
  const update = flattenUnions(e.update)
  const temporal = uniqueVariables(flattenUnions(e.temporal))

  const updateVars = findVars(e.update)
  const repeated = updateVars.filter(v => updateVars.filter(v2 => v === v2).length > 1)
  if (repeated.length > 0) {
    return left({
      location: `Trying to simplify effect ${effectToString(e)}`,
      message: `Multiple updates of variable(s): ${Array.from(new Set(repeated))}`,
      children: [],
    })
  } else {
    return right({ kind: 'concrete', read: read, update: update, temporal: temporal })
  }
}

export function simplify (e: Effect): Either<ErrorTree, Effect> {
  switch (e.kind) {
    case 'concrete': return simplifyConcreteEffect(e)
    case 'quantified': return right(e)
    case 'arrow': {
      const params = mergeInMany(e.params.map(simplify))
      const result = simplify(e.result)
      return params.chain(ps => {
        return result.map(r => ({ ...e, params: ps, result: r }))
      }).mapLeft(err => buildErrorTree(`Trying to simplify effect ${effectToString(e)}`, err))
    }
  }
}

/*
 * Transforms variables of form [x, [y, z]] into [x, y, z]
 *
 * @param variables the variables to be transformed
 *
 * @returns the flattened form of union if a union.
 *          Otherwise, the variables without change.
 */
export function flattenUnions (variables: Variables): Variables {
  switch (variables.kind) {
    case 'union': {
      const unionVariables: Variables[] = []
      const vars: string[] = []
      const flattenVariables = variables.variables.map(v => flattenUnions(v))
      flattenVariables.forEach(v => {
        switch (v.kind) {
          case 'quantified':
            unionVariables.push(v)
            break
          case 'concrete':
            vars.push(...v.vars)
            break
          case 'union':
            unionVariables.push(...v.variables)
            break
        }
      })

      if (unionVariables.length > 0) {
        const variables = vars.length > 0 ? unionVariables.concat({ kind: 'concrete', vars: vars }) : unionVariables
        return variables.length > 1 ? { kind: 'union', variables: variables } : variables[0]
      } else {
        return { kind: 'concrete', vars: vars }
      }
    }
    default:
      return variables
  }
}

function findVars (variables: Variables): string[] {
  switch (variables.kind) {
    case 'quantified':
      return []
    case 'concrete':
      return variables.vars
    case 'union':
      return variables.variables.flatMap(findVars)
  }
}

function uniqueVariables (variables: Variables): Variables {
  switch (variables.kind) {
    case 'quantified':
      return variables
    case 'concrete':
      return { kind: 'concrete', vars: Array.from(new Set<string>(variables.vars)) }
    case 'union': {
      const nestedVariables = variables.variables.map(v => uniqueVariables(v))
      const unique: Variables[] = []
      nestedVariables.forEach(variable => {
        if (!unique.some(v => isEqual(v, variable))) {
          unique.push(variable)
        }
      })
      return { kind: 'union', variables: unique }
    }
  }
}
