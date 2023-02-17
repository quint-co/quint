import { QuintError } from "../quintError";
import { ConcreteEffect, Effect, StateVariable, Variables } from "./base";
import { EffectVisitor, walkEffect } from "./EffectVisitor";

export class MultipleUpdatesChecker implements EffectVisitor {
  errors: Map<bigint, QuintError> = new Map()

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
    console.log(vars)

    const repeated = vars.filter(v => vars.filter(v2 => v.name === v2.name).length > 1)
    console.log('repeated', repeated)
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
