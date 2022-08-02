import { Either, left, right } from "@sweet-monads/either"
import { ErrorTree } from "../errorTree"
import { ConcreteEffect, Effect, Variables } from "./base"
import { effectToString } from "./printing"

export function simplifyConcreteEffect (e: ConcreteEffect): Either<ErrorTree, Effect> {
  const read = uniqueVariables(flattenUnions(e.read))
  const update = flattenUnions(e.update)

  const updateVars = findVars(e.update)
  const repeated = updateVars.filter(v => updateVars.filter(v2 => v === v2).length > 1)
  if (repeated.length > 0) {
    return left({
      location: `Trying to simplify effect ${effectToString(e)}`,
      message: `Multiple updates of variable(s): ${Array.from(new Set(repeated))}`,
      children: [],
    })
  } else {
    return right({ kind: 'concrete', read: read, update: update })
  }
}

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

export function sameVars (v1: string[], v2: string[]): Boolean {
  const v1s = sortStrings(v1)
  const v2s = sortStrings(v2)

  return v1s.length === v2s.length && v1s.every((value, index) => value === v2s[index])
}

function sortStrings (array: string[]): string[] {
  return array.sort((n1, n2) => n1 > n2 ? 1 : -1)
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
      return { kind: 'union', variables: Array.from(new Set<Variables>(nestedVariables)) }
    }
  }
}
