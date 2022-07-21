import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Maybe } from '@sweet-monads/maybe'
import { Set } from 'immutable'
import { EvalResult, toTntEx } from '../../src/runtime/runtime'
import { expressionToString } from '../../src/IRprinting'
import { compileExpr } from '../../src/runtime/compile'

function assertDefined<T> (m: Maybe<T>) {
  assert(m.isJust(), 'undefined value')
}

// Compile an expression, evaluate it and compare the result.
// This only works reliably for literals.
// For collections, use assertResultText.
function assertResult<T extends EvalResult> (input: string, result: T) {
  assertDefined(
    compileExpr(input)
      .eval()
      .map(v => assert(v === result, `Expected ${result}, found ${v}`))
  )
}

// Compile an expression, evaluate it, convert to TlaEx, then to a string,
// compare the result. This is the easiest path to test the results.
function assertResultAsString (input: string, result: string) {
  assertDefined(
    compileExpr(input)
      .eval()
      .map(toTntEx)
      .map(expressionToString)
      .map(s => assert(s === result, `Expected ${result}, found ${s}`))
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

  describe('compileExpr over sets', () => {
    it('computes a flat set', () => {
      const input = 'set(1, 3 - 1, 3)'
      assertResultAsString(input, 'set(1, 2, 3)')
    })

    it('computes a flat set without duplicates', () => {
      const input = 'set(1, 2, 3 - 1, 3, 1)'
      assertResultAsString(input, 'set(1, 2, 3)')
    })

    it('computes a set of sets', () => {
      const input = 'set(set(1, 2), set(2, 3), set(1, 3))'
      assertResultAsString(input, 'set(set(1, 2), set(1, 3), set(2, 3))')
    })

    it('computes equality over sets', () => {
      assertResult('set(1, 2) == set(1, 3 - 1)', true)
      assertResult('set(1, 2) == set(1, 3 - 3)', false)
    })

    it('computes inequality over sets', () => {
      assertResult('set(1, 2) != set(1, 3 - 1)', false)
      assertResult('set(1, 2) != set(1, 3 - 3)', true)
    })

    it('computes a set of sets without duplicates', () => {
      const input = 'set(set(1, 2), set(2, 3), set(1, 3), set(2 - 1, 2 + 1))'
      assertResultAsString(input, 'set(set(1, 2), set(1, 3), set(2, 3))')
    })

    it('computes contains', () => {
      assertResult('set(1, 2, 3).contains(2)', true)
      assertResult('set(1, 2, 3).contains(4)', false)
    })

    it('computes in', () => {
      assertResult('2 in set(1, 2, 3)', true)
      assertResult('4.in(set(1, 2, 3))', false)
    })

    it('computes in over nested sets', () => {
      assertResult('set(1, 2) in set(set(1, 2), set(2, 3))', true)
      assertResult('set(1, 3) in set(set(1, 2), set(2, 3))', false)
    })

    it('computes subseteq', () => {
      assertResult('set(1, 2).subseteq(set(1, 2, 3))', true)
      assertResult('set(1, 2, 4).subseteq(set(1, 2, 3))', false)
    })

    it('computes union', () => {
      assertResultAsString(
        'set(1, 2).union(set(1, 3))',
        'set(1, 2, 3)'
      )
    })

    it('computes intersect', () => {
      assertResultAsString(
        'set(1, 2, 4).intersect(set(1, 3, 4))',
        'set(1, 4)'
      )
    })

    it('computes exclude', () => {
      assertResultAsString(
        'set(1, 2, 4).exclude(set(1, 3))',
        'set(2, 4)'
      )
    })

    it('computes exists', () => {
      assertResult('set(1, 2, 3).exists(x => true)', true)
      assertResult('set(1, 2, 3).exists(x => false)', false)
      assertResult('set(1, 2, 3).exists(x => x >= 2)', true)
      assertResult('set(1, 2, 3).exists(x => x >= 5)', false)
    })

    it('computes forall', () => {
      assertResult('set(1, 2, 3).forall(x => true)', true)
      assertResult('set(1, 2, 3).forall(x => false)', false)
      assertResult('set(1, 2, 3).forall(x => x >= 2)', false)
      assertResult('set(1, 2, 3).forall(x => x >= 0)', true)
    })

    it('computes forall over nested sets', () => {
      const input =
        'set(set(1, 2), set(2, 3)).forall(s => 2 in s)'
      assertResult(input, true)
    })

    it('computes map', () => {
      // a bijection
      assertResultAsString(
        'set(1, 2, 3).map(x => 2 * x)',
        'set(2, 4, 6)'
      )
      // not an injection: 2 and 3 are mapped to 1
      assertResultAsString(
        'set(1, 2, 3).map(x => x / 2)',
        'set(0, 1)'
      )
    })

    it('computes filter', () => {
      assertResultAsString(
        'set(1, 2, 3, 4).filter(x => false)',
        'set()'
      )
      assertResultAsString(
        'set(1, 2, 3, 4).filter(x => true)',
        'set(1, 2, 3, 4)'
      )
      assertResultAsString(
        'set(1, 2, 3, 4).filter(x => x % 2 == 0)',
        'set(2, 4)'
      )
    })
  })
})
