import { Either, right, mergeInMany } from '@sweet-monads/either'
import { buildErrorTree, ErrorTree } from "../errorTree";
import { Effect, Variables } from "./base";
import { effectToString, substitutionToString } from './printing';
import { simplifyConcreteEffect } from './simplification';

/*
 * Substitutions can be applied to both effects and variables, replacing
 * quantified values with concrete ones
 */
export type Substitution =
  | { kind: 'variable', name: string, value: Variables }
  | { kind: 'effect', name: string, value: Effect }

export function compose (s1: Substitution[], s2: Substitution[]): Either<ErrorTree, Substitution[]> {
  return mergeInMany(s2.map(s => applySubstitutionsToSubstitution(s1, s)))
    .map((s: Substitution[]) => s1.concat(s))
    .mapLeft(error => buildErrorTree(`Composing substitutions [${s1.map(substitutionToString)}] and [${s2.map(substitutionToString)}]`, error))
}

/**
 * Applies substitutions to an effect, replacing all quantified names with their
 * substitution values when they are defined.
 *
 * @param subs the substitutions to be applied
 * @param e the effect to be transformed
 *
 * @returns the effect resulting from the substitutions application on the given
 *          effect, when successful. Otherwise, an error tree with an error message and its trace.
 */
export function applySubstitution (subs: Substitution[], e: Effect): Either<ErrorTree, Effect> {
  let result: Either<ErrorTree, Effect> = right(e)
  switch (e.kind) {
    case 'quantified': {
      // e is an effect variable
      const sub = subs.find(s => s.name === e.name)
      if (sub && sub.kind === 'effect') {
        result = right(sub.value)
      }
      break
    }
    case 'arrow': {
      // e takes effects as parameters and returs an effect as result
      const arrowParams = mergeInMany(e.params.map(ef => applySubstitution(subs, ef)))
      result = arrowParams.chain(ps => {
        const arrowResult = applySubstitution(subs, e.result)
        return arrowResult.map(r => ({ kind: e.kind, params: ps, result: r }))
      }).mapLeft(error => buildErrorTree(`Applying substitution to arrow effect ${effectToString(e)}`, error))
      break
    }
    case 'concrete': {
      // e is a an effect of the form Read[r] & Update[u]
      const read = applySubstitutionToVariables(subs, e.read)
      const update = applySubstitutionToVariables(subs, e.update)

      result = right({ kind: 'concrete', read: read, update: update })
      break
    }
  }

  return result.chain(e => e.kind === 'concrete' ? simplifyConcreteEffect(e) : right(e))
}

export function applySubstitutionToVariables (subs: Substitution[], variables: Variables): Variables {
  switch (variables.kind) {
    case 'quantified': {
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

function applySubstitutionsToSubstitution (subs: Substitution[], s: Substitution): Either<ErrorTree, Substitution> {
  switch (s.kind) {
    case 'effect': return applySubstitution(subs, s.value).map(v => ({ kind: s.kind, name: s.name, value: v }))
    case 'variable': return right({ kind: s.kind, name: s.name, value: applySubstitutionToVariables(subs, s.value) })
  }
}
