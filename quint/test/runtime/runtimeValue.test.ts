import { describe, it } from 'mocha'
import { assert } from 'chai'

import { expressionToString } from '../../src/ir/IRprinting'
import { parseExpressionOrDeclaration, quintErrorToString, walkExpression } from '../../src'
import { parse } from '../../src/parsing/quintParserFrontend'
import { fileSourceResolver } from '../../src/parsing/sourceResolver'
import { newIdGenerator } from '../../src/idGenerator'
import { newRng } from '../../src/rng'
import { Evaluator } from '../../src/runtime/impl/evaluator'
import { newTraceRecorder } from '../../src/runtime/trace'

// Evaluate one expression with the TypeScript evaluator and return its Quint text.
// #2058: equality of lazy sets (tuples / setOfMaps / powerset / intervals).
function evaluate(input: string): string {
  const idGen = newIdGenerator()
  const mockLookupPath = fileSourceResolver(new Map()).lookupPath('/', './mock')
  const { resolver, sourceMap } = parse(idGen, '<test>', mockLookupPath, 'module contextM {}')
  const parseResult = parseExpressionOrDeclaration(input, '<input>', idGen, sourceMap)
  if (parseResult.kind !== 'expr') {
    assert.fail(`Expected an expression, found ${parseResult.kind}: ${input}`)
  }

  walkExpression(resolver, parseResult.expr)
  if (resolver.errors.length > 0) {
    assert.fail(`Resolver errors for ${input}: ${resolver.errors.map(quintErrorToString).join(', ')}`)
  }

  const rng = newRng()
  const evaluator = new Evaluator(resolver.table, newTraceRecorder(0, rng), rng)
  const result = evaluator.evaluate(parseResult.expr)
  if (result.isLeft()) {
    assert.fail(`Runtime error for ${input}: ${quintErrorToString(result.value)}`)
  }
  return expressionToString(result.value)
}

function expectEqual(input: string, expected: string) {
  it(input, () => {
    assert.equal(evaluate(input), expected)
  })
}

describe('semantic set equality (#2058)', () => {
  describe('empty sets built differently are equal', () => {
    expectEqual('tuples(Set(), Set(1)) == tuples(Set(2), Set())', 'true')
    expectEqual('setOfMaps(Set(1), Set()) == setOfMaps(Set(2), Set())', 'true')
    expectEqual('tuples(Set(), Set(1), Set(2)) == tuples(Set(3), Set(), Set(4))', 'true')
    expectEqual('tuples(3.to(1), Set(1)) == tuples(Set(), Set(2))', 'true')
    expectEqual('setOfMaps(Set(1), 3.to(1)) == setOfMaps(Set(2), Set())', 'true')
    expectEqual('setOfMaps(Set(1, 2), Set()) == setOfMaps(3.to(4), 5.to(1))', 'true')
    expectEqual('tuples(Set(), Nat) == tuples(Set(1), Set())', 'true')
    expectEqual('tuples(Set(), Nat) == tuples(Nat, Set())', 'true')
    expectEqual('tuples(Set(), Nat) == Set()', 'true')
    expectEqual('setOfMaps(Nat, Set()) == setOfMaps(Int, Set())', 'true')
    expectEqual('setOfMaps(Nat, Set()) == Set()', 'true')
    expectEqual('tuples(Set(), Set(1)) != tuples(Set(2), Set())', 'false')
  })

  describe('setOfMaps with an empty domain is Set(Map())', () => {
    expectEqual('setOfMaps(Set(), Set(1)) == setOfMaps(Set(), Set(2))', 'true')
    expectEqual('setOfMaps(Set(), Set(1)) == setOfMaps(Set(), Set())', 'true')
    expectEqual('setOfMaps(3.to(1), Set(5)) == setOfMaps(Set(), Set(9))', 'true')
    expectEqual('setOfMaps(tuples(Set(), Set(1)), Set(5)) == setOfMaps(Set(), Set(9))', 'true')
    expectEqual('setOfMaps(Set(), Nat) == setOfMaps(Set(), Int)', 'true')
    expectEqual('setOfMaps(Set(), Nat) == Set(Map())', 'true')
    expectEqual('setOfMaps(Set(), Set(1)) == Set(Map())', 'true')
    expectEqual('setOfMaps(Set(), Set()) == Set()', 'false')
  })

  describe('other lazy sets on the same equality path', () => {
    expectEqual('powerset(tuples(Set(), Set(1))) == powerset(tuples(Set(2), Set()))', 'true')
    expectEqual('powerset(Set()) == powerset(tuples(Set(), Set(1)))', 'true')
    expectEqual('powerset(3.to(1)) == powerset(Set())', 'true')
    expectEqual('powerset(Set()) == Set(Set())', 'true')
    expectEqual('3.to(1) == 5.to(2)', 'true')
    expectEqual('3.to(1) == Set()', 'true')
    expectEqual('3.to(1) == 8.to(4)', 'true')
  })

  describe('the same values inside a set, and equality with Set()', () => {
    expectEqual('tuples(Set(), Set(1)) == Set()', 'true')
    expectEqual('Set() == tuples(Set(2), Set())', 'true')
    expectEqual('Set(tuples(Set(), Set(1)), tuples(Set(2), Set())).size()', '1')
    expectEqual('Set(setOfMaps(Set(), Set(1)), setOfMaps(Set(), Set(2))).size()', '1')
    expectEqual('Set(setOfMaps(Set(1), Set()), setOfMaps(Set(2), Set())).size()', '1')
    expectEqual('setOfMaps(Set(1), Set()) == Set()', 'true')
  })

  describe('equality does not enumerate huge or infinite operands', () => {
    expectEqual('tuples(1.to(2^62), Set()) == Set()', 'true')
    expectEqual('tuples(1.to(2^62), Set()) == tuples(Set(), Set(1))', 'true')
    expectEqual('setOfMaps(Set(), 1.to(2^62)) == setOfMaps(Set(), Set(1))', 'true')
    expectEqual('setOfMaps(Set(), 1.to(2^62)) == Set(Map())', 'true')
    expectEqual('setOfMaps(1.to(2^62), Set()) == Set()', 'true')
    expectEqual('powerset(tuples(1.to(2^62), Set())) == powerset(Set())', 'true')
    expectEqual('1.to(2^62) == Set()', 'false')
    expectEqual('1.to(2^62) == 1.to(2^62)', 'true')
  })

  describe('non-empty sets keep structural equality', () => {
    expectEqual('tuples(1.to(2), Set(3)) == tuples(Set(1, 2), Set(3))', 'true')
    expectEqual('tuples(1.to(2), 3.to(4)) == tuples(Set(1, 2), Set(3, 4))', 'true')
    expectEqual('2.to(3).setOfMaps(5.to(6)) == 2.to(4 - 1).setOfMaps(5.to(7 - 1))', 'true')
    expectEqual('Set(1, 2) == Set(2, 1)', 'true')
    expectEqual('1.to(3) == Set(1, 2, 3)', 'true')
    expectEqual('tuples(Set(1), Set(2)) == tuples(Set(1), Set(3))', 'false')
    expectEqual('tuples(Set(1), Set(2)) == tuples(Set(3), Set())', 'false')
    expectEqual('setOfMaps(Set(1), Set(2)) == setOfMaps(Set(1), Set(3))', 'false')
    expectEqual('setOfMaps(1.to(2), Set(3)) == setOfMaps(1.to(3), Set(3))', 'false')
    expectEqual('powerset(Set(1)) == powerset(Set(1, 2))', 'false')
    expectEqual('1.to(3) == 1.to(4)', 'false')
    expectEqual('Nat == Int', 'false')
    expectEqual('Nat == Set()', 'false')
    expectEqual('Set(1) == Set()', 'false')
    expectEqual('Set(Map(1 -> 2)) == setOfMaps(Set(), Set(1))', 'false')
  })
})
