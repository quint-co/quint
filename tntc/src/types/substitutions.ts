/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Substitutions for types and its variables, including composition and application
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either } from '@sweet-monads/either'
import { ErrorTree, errorTreeToString } from '../errorTree'
import { Row, TntType } from '../tntTypes'
import { Constraint } from './base'
import { unify, unifyRows } from './constraintSolver'
import { substitutionsToString } from './printing'

/*
 * Substitutions can be applied to TNT types, type variables with another type
 */
export type Substitutions = Substitution[]

type Substitution =
  | { kind: 'type', name: string, value: TntType }
  | { kind: 'row', name: string, value: Row }

/*
 * Compose two substitutions by applying the first one to the second one's values
 *
 * @param s1 substitutions to be applied and returned unchanged
 * @param s2 substitutions to be updated and returned
 *
 * @returns a new substitutions list containing the composition of given substitutions
 */
export function compose(s1: Substitutions, s2: Substitutions): Substitutions {
  const newS2 = applySubstitutionsToSubstitutions(s1, s2)
  return newS2.concat(s1)
}

/**
 * Applies substitutions to a type, replacing all type variables with their
 * substitution values when they are defined.
 *
 * @param subs the substitutions to be applied
 * @param t the type to be transformed
 *
 * @returns the type resulting from the substitutions' application on the
 *          given type
 */
export function applySubstitution(subs: Substitutions, t: TntType): TntType {
  let result = t
  switch (t.kind) {
    case 'var': {
      const sub = subs.find(s => s.name === t.name)
      if (sub && sub.kind === 'type') {
        result = sub.value
      }
      break
    }
    case 'oper': {
      const arrowParams = t.args.map(ef => applySubstitution(subs, ef))
      const arrowResult = applySubstitution(subs, t.res)
      result = { kind: t.kind, args: arrowParams, res: arrowResult, id: t.id }
      break
    }
    case 'list':
    case 'set': {
      result = { kind: t.kind, elem: applySubstitution(subs, t.elem), id: t.id }
      break
    }
    case 'fun': {
      result = { kind: t.kind, arg: applySubstitution(subs, t.arg), res: applySubstitution(subs, t.res), id: t.id }
      break
    }
    case 'tup': {
      result = { kind: t.kind, elems: t.elems.map(e => applySubstitution(subs, e)), id: t.id }
      break
    }
    case 'rec': {
      result = {
        kind: t.kind,
        fields: applySubstitutionToRow(subs, t.fields),
        id: t.id,
      }
      break
    }
    case 'union': {
      result = {
        kind: t.kind,
        tag: t.tag,
        records: t.records.map(r => {
          return {
            tagValue: r.tagValue,
            fields: applySubstitutionToRow(subs, r.fields),
          }
        }),
        id: t.id,
      }
      break
    }
  }

  return result
}

/**
 * Applies substitutions to a constraint, by applying the substitutions to all
 * types occurring in that constraint
 *
 * @param subs the substitutions to be applied
 * @param c the constraint to be transformed
 *
 * @returns the constraint resulting from the substitutions' application on the
 *          given constraint
 */
export function applySubstitutionToConstraint(subs: Substitutions, c: Constraint): Constraint {
  switch (c.kind) {
    case 'eq': {
      const ts: [TntType, TntType] = [applySubstitution(subs, c.types[0]), applySubstitution(subs, c.types[1])]
      return { kind: c.kind, types: ts, sourceId: c.sourceId }
    }
    case 'empty': return c
    case 'conjunction': {
      const cs = c.constraints.map(con => applySubstitutionToConstraint(subs, con))
      return { kind: 'conjunction', constraints: cs, sourceId: c.sourceId }
    }
  }
}

function applySubstitutionsToSubstitutions(s1: Substitutions, s2: Substitutions): Substitutions {
  return s2.flatMap(s => {
    const sub = s1.find(sub => s.name === sub.name)
    if (sub) {
      let result: Either<ErrorTree, Substitutions>
      if (sub.kind === 'type' && s.kind === 'type') {
        result = unify(s.value, sub.value)
      } else if (sub.kind === 'row' && s.kind === 'row') {
        result = unifyRows(s.value, sub.value)
      } else {
        throw new Error(`Substitutions with same name (${s.name}) but incompatible kinds: ${substitutionsToString([sub, s])}`)
      }

      if (result.isLeft()) {
        throw new Error(`Unifying substitutions with same name: ${s.name}, ${errorTreeToString(result.value)}`)
      } else {
        return result.value
      }
    }

    switch (s.kind) {
      case 'type': return [{ kind: s.kind, name: s.name, value: applySubstitution(s1, s.value) }]
      case 'row': return [{ kind: s.kind, name: s.name, value: applySubstitutionToRow(s1, s.value) }]
    }
  })
}

function applySubstitutionToRow(s: Substitutions, r: Row): Row {
  switch (r.kind) {
    case 'row':
      return {
        kind: 'row',
        fields: r.fields.map(f => ({ fieldName: f.fieldName, fieldType: applySubstitution(s, f.fieldType) })),
        other: applySubstitutionToRow(s, r.other),
      }
    case 'var': {
      const sub = s.find(s => s.name === r.name)
      if (sub && sub.kind === 'row') {
        return sub.value
      } else {
        return r
      }
    }
    case 'empty':
      return r
  }
}
