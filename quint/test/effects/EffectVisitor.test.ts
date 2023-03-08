import { describe, it } from 'mocha'
import { assert } from 'chai'
import { EffectVisitor, walkEffect } from '../../src/effects/EffectVisitor'
import { Effect, effectToString } from '../../src'
import { parseEffectOrThrow } from '../../src/effects/parser'

describe('walkEffect', () => {
  const effect = parseEffectOrThrow("(Read[v] & Update['x'], Temporal['y']) => (E1) => Update['x', 'y', v]")

  it('finds concrete effects', () => {
    class TestVisitor implements EffectVisitor {
      entered: Effect[] = []
      exited: Effect[] = []

      enterConcrete(e: Effect): void {
        this.entered.push(e)
      }

      exitConcrete(e: Effect): void {
        this.exited.push(e)
      }
    }

    const enteredEffects = [
      "Read[v] & Update['x']",
      "Temporal['y']",
      "Update[v, 'x', 'y']",
    ]

    const exitedEffects = [
      "Read[v] & Update['x']",
      "Temporal['y']",
      "Update[v, 'x', 'y']",
    ]

    const visitor = new TestVisitor()
    walkEffect(visitor, effect)
    assert.deepEqual(visitor.entered.map(effectToString), enteredEffects)
    assert.deepEqual(visitor.exited.map(effectToString), exitedEffects)
  })

  it('finds arrow effects', () => {
    class TestVisitor implements EffectVisitor {
      entered: Effect[] = []
      exited: Effect[] = []

      enterArrow(e: Effect): void {
        this.entered.push(e)
      }

      exitArrow(e: Effect): void {
        this.exited.push(e)
      }
    }

    const enteredEffects = [
      "(Read[v] & Update['x'], Temporal['y']) => (E1) => Update[v, 'x', 'y']",
      "(E1) => Update[v, 'x', 'y']",
    ]

    const exitedEffects = [
      "(E1) => Update[v, 'x', 'y']",
      "(Read[v] & Update['x'], Temporal['y']) => (E1) => Update[v, 'x', 'y']",
    ]

    const visitor = new TestVisitor()
    walkEffect(visitor, effect)
    assert.deepEqual(visitor.entered.map(effectToString), enteredEffects)
    assert.deepEqual(visitor.exited.map(effectToString), exitedEffects)
  })

  it('finds variable effects', () => {
    class TestVisitor implements EffectVisitor {
      entered: Effect[] = []
      exited: Effect[] = []

      enterVariable(e: Effect): void {
        this.entered.push(e)
      }

      exitVariable(e: Effect): void {
        this.exited.push(e)
      }
    }

    const enteredEffects = [
      'E1',
    ]

    const exitedEffects = [
      'E1',
    ]

    const visitor = new TestVisitor()
    walkEffect(visitor, effect)
    assert.deepEqual(visitor.entered.map(effectToString), enteredEffects)
    assert.deepEqual(visitor.exited.map(effectToString), exitedEffects)
  })
})
