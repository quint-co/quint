import { Effect, Variables, emptyVariables } from './base'
import { EffectListener } from '../generated/EffectListener'
import * as p from '../generated/EffectParser'

export class ToEffectVisitor implements EffectListener {
  // The resulting effect
  effect?: Effect = undefined

  // Stack of lists of effects, each list will hold the effects of an arrow effect
  private arrowEffectsStack: Effect[][] = []
  private variablesStack: Variables[] = []
  private stateVars: string[] = []

  private pushEffect (effect: Effect): void {
    this.effect = effect
    // If inside an arrow effect, push it this effect to the arrow's effects list
    if (this.arrowEffectsStack.length > 0) {
      this.arrowEffectsStack[this.arrowEffectsStack.length - 1].push(effect)
    }
  }

  exitReadOnly () {
    const variables = this.variablesStack.pop()!
    const effect: Effect = { kind: 'concrete', read: variables, update: emptyVariables }
    this.pushEffect(effect)
  }

  exitUpdateOnly () {
    const variables = this.variablesStack.pop()!
    const effect: Effect = { kind: 'concrete', read: emptyVariables, update: variables }
    this.pushEffect(effect)
  }

  exitReadAndUpdate () {
    const update = this.variablesStack.pop()!
    const read = this.variablesStack.pop()!

    const effect: Effect = { kind: 'concrete', read: read, update: update }
    this.pushEffect(effect)
  }

  exitPure () {
    const effect: Effect = { kind: 'concrete', read: emptyVariables, update: emptyVariables }
    this.pushEffect(effect)
  }

  exitQuantifiedEffect (ctx: p.QuantifiedEffectContext) {
    const name = ctx.IDENTIFIER().text
    const effect: Effect = { kind: 'quantified', name: name }
    this.pushEffect(effect)
  }

  enterArrowEffect () {
    this.arrowEffectsStack.push([])
  }

  exitArrowEffect () {
    const effects = this.arrowEffectsStack.pop()!
    const result = effects.pop()!
    const effect: Effect = { kind: 'arrow', params: effects, result: result }
    this.pushEffect(effect)
  }

  exitVars (ctx: p.VarsContext) {
    const names: string[] = ctx.IDENTIFIER().map(i => i.text)
    const unionVariables: Variables[] = names.map(name => ({ kind: 'quantified', name: name }))
    if (this.stateVars.length > 0) {
      unionVariables.push({ kind: 'concrete', vars: this.stateVars })
    }

    if (unionVariables.length === 0) {
      this.variablesStack.push({ kind: 'concrete', vars: [] })
    } else if (unionVariables.length === 1) {
      this.variablesStack.push(unionVariables[0])
    } else {
      this.variablesStack.push({ kind: 'union', variables: unionVariables })
    }

    this.stateVars = []
  }

  exitStateVarRef (ctx: p.StateVarRefContext) {
    const varRef = ctx.IDENTIFIER().text
    this.stateVars.push(varRef)
  }
}
