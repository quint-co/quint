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

import { typeToString } from '../IRprinting'
import { TntType } from '../tntTypes'
import { Constraint } from './constraintSolver'

/*
 * Substitutions can be applied to TNT types, type variables with another type
 */
export type Substitutions = Substitution[]

interface Substitution {
  name: string,
  value: TntType,
}

/*
 * Compose two substitutions by applying the first one to the second one's values
 *
 * @param s1 substitutions to be applied and returned unchanged
 * @param s2 substitutions to be updated and returned
 *
 * @returns a new substitutions list containing the composition of given substitutions
 */
export function compose (s1: Substitutions, s2: Substitutions): Substitutions {
  const newS2 = applySubstitutionsToSubstitutions(s1, s2)
  return s1.concat(newS2)
}
export function substitutionsToString (subs: Substitutions): string {
  const subsString = subs.map(s => {
    return `${s.name} |-> ${typeToString(s.value)}`
  })

  return `[${subsString}]`
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
export function applySubstitution (subs: Substitutions, t: TntType): TntType {
  let result = t
  switch (t.kind) {
    case 'var': {
      const sub = subs.find(s => s.name === t.name)
      if (sub) {
        result = sub.value
      }
      break
    }
    case 'oper': {
      const arrowParams = t.args.map(ef => applySubstitution(subs, ef))
      const arrowResult = applySubstitution(subs, t.res)
      result = { kind: t.kind, args: arrowParams, res: arrowResult }
      break
    }
    case 'seq':
    case 'set': {
      result = { kind: t.kind, elem: applySubstitution(subs, t.elem) }
      break
    }
    case 'fun': {
      result = { kind: t.kind, arg: applySubstitution(subs, t.arg), res: applySubstitution(subs, t.res) }
      break
    }
    case 'tuple': {
      result = { kind: t.kind, elems: t.elems.map(e => applySubstitution(subs, e)) }
      break
    }
    case 'record': {
      result = { kind: t.kind, fields: t.fields.map(f => ({ fieldName: f.fieldName, fieldType: applySubstitution(subs, f.fieldType) })) }
      break
    }
    case 'union': {
      result = {
        kind: t.kind,
        tag: t.tag,
        records: t.records.map(r => {
          return {
            tagValue: r.tagValue,
            fields: r.fields.map(f => ({ fieldName: f.fieldName, fieldType: applySubstitution(subs, f.fieldType) })),
          }
        }),
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
export function applySubstitutionToConstraint (subs: Substitutions, c: Constraint): Constraint {
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

function applySubstitutionsToSubstitutions (s1: Substitutions, s2: Substitutions): Substitutions {
  return s2.map((s: Substitution): Substitution => {
    return { name: s.name, value: applySubstitution(s1, s.value) }
  })
}
