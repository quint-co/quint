/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Checks effects for multiple updates of the same variable.
 *
 * @author Gabriela Moreira
 *
 * @module
 */


import { QuintError } from "../quintError";
import { ConcreteEffect, Effect, StateVariable, Variables } from "./base";
import { EffectVisitor, walkEffect } from "./EffectVisitor";
import { groupBy, pickBy, values } from "lodash";

/**
 * Checks effects for multiple updates of the same variable.
 */
export class MultipleUpdatesChecker implements EffectVisitor {
  errors: Map<bigint, QuintError> = new Map()

  /**
   * Checks effects for multiple updates of the same variable.
   *
   * @param effects the effects to look for multiple updates on
   *
   * @returns a map of errors, where the key is the variable id
   */
  checkEffects(effects: Effect[]): Map<bigint, QuintError> {
    effects.forEach(e => walkEffect(this, e))
    return this.errors
  }

  exitConcrete(e: ConcreteEffect) {
    const updateVariables = e.components.reduce((updates: Variables[], c) => {
      if (c.kind === "update") {
        updates.push(c.variables);
      }
      return updates;
    }, [])

    const vars = findVars({ kind: 'union', variables: updateVariables })
    const repeated = values(pickBy(groupBy(vars, v => v.name), x => x.length > 1)).flat()
    if (repeated.length > 0) {
      repeated.forEach(v => {
        this.errors.set(v.reference, {
          code: 'QNT202',
          message: `Multiple updates of variable ${v.name}`,
          data: {},
        })
      })
    }
  }
}

function findVars(variables: Variables): StateVariable[] {
  switch (variables.kind) {
    case 'quantified':
      return []
    case 'concrete':
      return variables.vars
    case 'union':
      return variables.variables.flatMap(findVars)
  }
}
