import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Maybe } from '@sweet-monads/maybe'
import { compileExpr } from '../../src/runtime/compile'

function assertDefined<T> (m: Maybe<T>) {
  assert(m.isJust(), 'undefined value')
}

function assertResult<T> (input: string, result: T) {
  assertDefined(
    compileExpr(input)
      .eval()
      .map(v => assert(v === result, `Expected ${v} equal to ${result}`))
  )
}

describe('compiling specs to runtime values', () => {
  describe('compileExpr over integers', () => {
    it('computes positive integer literals', () => {
      assertResult('15', 15n)
    })

    it('computes negative integer literals', () => {
      assertResult('-15', -15n)
    })

    it('computes addition', () => {
      assertResult('2 + 3', 5n)
    })

    it('computes subtraction', () => {
      assertResult('2 - 3', -1n)
    })

    it('computes negation', () => {
      assertResult('-(2 + 3)', -5n)
    })

    it('computes multiplication', () => {
      assertResult('2 * 3', 6n)
    })

    it('computes division', () => {
      assertResult('7 / 2', 3n)
    })

    it('computes remainder', () => {
      assertResult('7 % 2', 1n)
    })

    it('computes power', () => {
      assertResult('3^4', 81n)
    })

    it('computes greater than', () => {
      assertResult('5 > 3', true)
      assertResult('5 > 5', false)
      assertResult('3 > 5', false)
    })

    it('computes less than', () => {
      assertResult('5 < 3', false)
      assertResult('5 < 5', false)
      assertResult('3 < 5', true)
    })

    it('computes greater than or equal', () => {
      assertResult('5 >= 4', true)
      assertResult('5 >= 5', true)
      assertResult('4 >= 5', false)
    })

    it('computes less than or equal', () => {
      assertResult('5 <= 4', false)
      assertResult('5 <= 5', true)
      assertResult('4 <= 5', true)
    })

    it('computes integer equality', () => {
      assertResult('5 == 4', false)
      assertResult('4 == 4', true)
    })

    it('computes integer inequality', () => {
      assertResult('5 != 4', true)
      assertResult('4 != 4', false)
    })
  })

  describe('compileExpr over Booleans', () => {
    it('computes Boolean literals', () => {
      assertResult('false', false)
      assertResult('true', true)
    })

    it('computes not', () => {
      assertResult('not(false)', true)
      assertResult('not(true)', false)
    })

    it('computes and', () => {
      assertResult('false and false', false)
      assertResult('false and true', false)
      assertResult('true and false', false)
      assertResult('true and true', true)
    })

    it('computes or', () => {
      assertResult('false or false', false)
      assertResult('false or true', true)
      assertResult('true or false', true)
      assertResult('true or true', true)
    })

    it('computes implies', () => {
      assertResult('false implies false', true)
      assertResult('false implies true', true)
      assertResult('true implies false', false)
      assertResult('true implies true', true)
    })

    it('computes iff', () => {
      assertResult('false iff false', true)
      assertResult('false iff true', false)
      assertResult('true iff false', false)
      assertResult('true iff true', true)
    })

    it('computes Boolean equality', () => {
      assertResult('false == false', true)
      assertResult('true  == true', true)
      assertResult('false == true', false)
      assertResult('true  == false', false)
    })

    it('computes Boolean inequality', () => {
      assertResult('false != false', false)
      assertResult('true  != true', false)
      assertResult('false != true', true)
      assertResult('true  != false', true)
    })
  })

  describe('compileExpr over other operators', () => {
    it('computes Boolean if-then-else', () => {
      assertResult('if (false) false else true', true)
      assertResult('if (true) false else true', false)
    })

    it('computes integer if-then-else', () => {
      assertResult('if (3 > 5) 1 else 2', 2n)
      assertResult('if (5 > 3) 1 else 2', 1n)
    })
  })

  describe('compileExpr over definitions', () => {
    it('computes value definitions', () => {
      const input =
        `val x = 3 + 4
         val y = 2 * x
         y - x`
      assertResult(input, 7n)
    })
  })
})
