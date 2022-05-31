import { Effect, Variables, emptyVariables } from './base'
import { EffectListener } from '../generated/EffectListener'
import * as p from '../generated/EffectParser'

export class ToEffectVisitor implements EffectListener {
  effect?: Effect = undefined

  private effectStack: Effect[][] = []
  private variablesStack: Variables[] = []
  private stateVars: string[] = []

  private pushEffect (effect: Effect): void {
    this.effect = effect
    if (this.effectStack.length > 0) {
      this.effectStack[this.effectStack.length - 1].push(effect)
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
    this.effectStack.push([])
  }

  exitArrowEffect () {
    const effects = this.effectStack.pop()!
    const result = effects.pop()!
    const effect: Effect = { kind: 'arrow', params: effects, result: result }
    this.pushEffect(effect)
  }

  exitConcreteVariables () {
    const variables: Variables = { kind: 'concrete', vars: this.stateVars }
    this.stateVars = []
    this.variablesStack.push(variables)
  }

  exitQuantifiedVariables (ctx: p.QuantifiedVariablesContext) {
    const names: string[] = ctx.IDENTIFIER().map(i => i.text)
    if (names.length === 1) {
      const variables: Variables = { kind: 'quantified', name: names[0] }
      this.variablesStack.push(variables)
    } else {
      const unionVariables: Variables[] = names.map(name => ({ kind: 'quantified', name: name }))
      this.variablesStack.push({ kind: 'union', variables: unionVariables })
    }
  }

  exitStateVarRef (ctx: p.StateVarRefContext) {
    const varRef = ctx.IDENTIFIER().text
    this.stateVars.push(varRef)
  }
}
