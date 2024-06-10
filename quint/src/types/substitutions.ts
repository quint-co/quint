/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
import { LookupTable } from '../names/base'
import { ConcreteFixedRow, QuintType, Row } from '../ir/quintTypes'
import { Constraint } from './base'
import { unify, unifyRows } from './constraintSolver'
import { substitutionsToString } from './printing'
import { isEqual } from 'lodash'

/*
 * Substitutions can be applied to Quint types, type variables with another type
 */
export type Substitutions = Substitution[]

type Substitution = { kind: 'type'; name: string; value: QuintType } | { kind: 'row'; name: string; value: Row }

/*
 * Compose two substitutions by applying the first one to the second one's values
 *
 * @param s1 substitutions to be applied and returned unchanged
 * @param s2 substitutions to be updated and returned
 *
 * @returns a new substitutions list containing the composition of given substitutions
 */
export function compose(table: LookupTable, s1: Substitutions, s2: Substitutions): Substitutions {
  const newS2 = applySubstitutionsToSubstitutions(table, s1, s2)
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
export function applySubstitution(table: LookupTable, subs: Substitutions, t: QuintType): QuintType {
  // We cannot assign the result of a switch to a value, so we use an arrow function instead
  const singleApplication = () => {
    switch (t.kind) {
      case 'var': {
        const sub = subs.find(s => s.name === t.name)
        if (sub && sub.kind === 'type') {
          return sub.value
        } else {
          return t
        }
      }
      case 'oper': {
        const arrowParams = t.args.map(ef => applySubstitution(table, subs, ef))
        const arrowResult = applySubstitution(table, subs, t.res)
        return { kind: t.kind, args: arrowParams, res: arrowResult, id: t.id }
      }
      case 'list':
      case 'set': {
        return { kind: t.kind, elem: applySubstitution(table, subs, t.elem), id: t.id }
      }
      case 'fun': {
        return {
          kind: t.kind,
          arg: applySubstitution(table, subs, t.arg),
          res: applySubstitution(table, subs, t.res),
          id: t.id,
        }
      }
      case 'tup': {
        return { kind: t.kind, fields: applySubstitutionToRow(table, subs, t.fields), id: t.id }
      }
      case 'rec': {
        return {
          kind: t.kind,
          fields: applySubstitutionToRow(table, subs, t.fields),
          id: t.id,
        }
      }
      case 'sum':
        return {
          ...t,
          // We know this has to end up as a concrete fixed row, since it must
          // start as one, and applying substitions cannot result in a wider type
          fields: applySubstitutionToRow(table, subs, t.fields) as ConcreteFixedRow,
        }
      case 'app':
        return {
          ...t,
          args: t.args.map(a => applySubstitution(table, subs, a)),
        }

      // The basic types have no variables, so don't require substitution
      case 'int':
      case 'bool':
      case 'str':
      case 'const':
        return t
    }
  }

  const result = singleApplication()
  if (isEqual(result, t)) {
    return t
  } else {
    return applySubstitution(table, subs, result)
  }
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
export function applySubstitutionToConstraint(table: LookupTable, subs: Substitutions, c: Constraint): Constraint {
  switch (c.kind) {
    case 'empty':
      return c
    case 'isDefined':
      return { ...c, type: applySubstitution(table, subs, c.type) }
    case 'eq': {
      const ts: [QuintType, QuintType] = [
        applySubstitution(table, subs, c.types[0]),
        applySubstitution(table, subs, c.types[1]),
      ]
      return { kind: c.kind, types: ts, sourceId: c.sourceId }
    }
    case 'conjunction': {
      const cs = c.constraints.map(con => applySubstitutionToConstraint(table, subs, con))
      return { kind: 'conjunction', constraints: cs, sourceId: c.sourceId }
    }
  }
}

function applySubstitutionsToSubstitutions(table: LookupTable, s1: Substitutions, s2: Substitutions): Substitutions {
  return s2.flatMap(s => {
    const sub = s1.find(sub => s.name === sub.name)
    if (sub) {
      let result: Either<ErrorTree, Substitutions>
      if (sub.kind === 'type' && s.kind === 'type') {
        result = unify(table, s.value, sub.value)
      } else if (sub.kind === 'row' && s.kind === 'row') {
        result = unifyRows(table, s.value, sub.value)
      } else {
        throw new Error(
          `Substitutions with same name (${s.name}) but incompatible kinds: ${substitutionsToString([sub, s])}`
        )
      }

      if (result.isLeft()) {
        throw new Error(`Unifying substitutions with same name: ${s.name}, ${errorTreeToString(result.value)}`)
      } else {
        return result.value
      }
    }

    switch (s.kind) {
      case 'type':
        return [{ kind: s.kind, name: s.name, value: applySubstitution(table, s1, s.value) }]
      case 'row':
        return [{ kind: s.kind, name: s.name, value: applySubstitutionToRow(table, s1, s.value) }]
    }
  })
}

function applySubstitutionToRow(table: LookupTable, s: Substitutions, r: Row): Row {
  switch (r.kind) {
    case 'row':
      return {
        kind: 'row',
        fields: r.fields.map(f => ({ fieldName: f.fieldName, fieldType: applySubstitution(table, s, f.fieldType) })),
        other: applySubstitutionToRow(table, s, r.other),
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
