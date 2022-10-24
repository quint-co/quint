import { describe, it } from 'mocha'
import { assert } from 'chai'
import { expressionToString } from '../../src/IRprinting'
import { kindName, ComputableKind } from '../../src/runtime/runtime'
import { compile } from '../../src/runtime/compile'
import { dedent } from '../textUtils'

// Compile an expression, evaluate it, convert to TlaEx, then to a string,
// compare the result. This is the easiest path to test the results.
function assertResultAsString (input: string, expected: string | undefined) {
  const moduleText = `module __runtime { val __expr = ${input} }`
  const context = compile(moduleText).values
  const value = context.get(kindName('callable', '__expr'))
  if (value === undefined) {
    assert(false, `Missing value for ${input}`)
  } else {
    const result = value
      .eval()
      .map(r => r.toTntEx())
      .map(expressionToString)
      .map(s => assert(s === expected, `Expected ${expected}, found ${s}`))
    if (result.isNone()) {
      assert(expected === undefined, `Expected ${expected}, found undefined`)
    }
  }
}

// Compile a definition and check that the compiled value is defined.
function assertDef (kind: ComputableKind, name: string, input: string) {
  const moduleText = `module __runtime { ${input} }`
  const context = compile(moduleText).values
  assert(context.get(kindName(kind, name)),
    `Expected a definition for ${name}, compiled from: ${input}`)
}

describe('compiling specs to runtime values', () => {
  describe('compile over integers', () => {
    it('computes positive integer literals', () => {
      assertResultAsString('15', '15')
    })

    it('computes negative integer literals', () => {
      assertResultAsString('-15', '-15')
    })

    it('computes addition', () => {
      assertResultAsString('2 + 3', '5')
    })

    it('computes subtraction', () => {
      assertResultAsString('2 - 3', '-1')
    })

    it('computes negation', () => {
      assertResultAsString('-(2 + 3)', '-5')
    })

    it('computes multiplication', () => {
      assertResultAsString('2 * 3', '6')
    })

    it('computes division', () => {
      assertResultAsString('7 / 2', '3')
    })

    it('computes remainder', () => {
      assertResultAsString('7 % 2', '1')
    })

    it('computes power', () => {
      assertResultAsString('3^4', '81')
    })

    it('computes greater than', () => {
      assertResultAsString('5 > 3', 'true')
      assertResultAsString('5 > 5', 'false')
      assertResultAsString('3 > 5', 'false')
    })

    it('computes less than', () => {
      assertResultAsString('5 < 3', 'false')
      assertResultAsString('5 < 5', 'false')
      assertResultAsString('3 < 5', 'true')
    })

    it('computes greater than or equal', () => {
      assertResultAsString('5 >= 4', 'true')
      assertResultAsString('5 >= 5', 'true')
      assertResultAsString('4 >= 5', 'false')
    })

    it('computes less than or equal', () => {
      assertResultAsString('5 <= 4', 'false')
      assertResultAsString('5 <= 5', 'true')
      assertResultAsString('4 <= 5', 'true')
    })

    it('computes integer equality', () => {
      assertResultAsString('5 == 4', 'false')
      assertResultAsString('4 == 4', 'true')
    })

    it('computes integer inequality', () => {
      assertResultAsString('5 != 4', 'true')
      assertResultAsString('4 != 4', 'false')
    })
  })

  describe('compile over Booleans', () => {
    it('computes Boolean literals', () => {
      assertResultAsString('false', 'false')
      assertResultAsString('true', 'true')
    })

    it('computes not', () => {
      assertResultAsString('not(false)', 'true')
      assertResultAsString('not(true)', 'false')
    })

    it('computes and', () => {
      assertResultAsString('false and false', 'false')
      assertResultAsString('false and true', 'false')
      assertResultAsString('true and false', 'false')
      assertResultAsString('true and true', 'true')
      assertResultAsString('and(true, true, false)', 'false')
      assertResultAsString('and(true, true, true)', 'true')
    })

    it('computes or', () => {
      assertResultAsString('false or false', 'false')
      assertResultAsString('false or true', 'true')
      assertResultAsString('true or false', 'true')
      assertResultAsString('true or true', 'true')
      assertResultAsString('or(false, true, true)', 'true')
      assertResultAsString('or(true, true, false)', 'true')
      assertResultAsString('or(false, false, false)', 'false')
    })

    it('computes implies', () => {
      assertResultAsString('false implies false', 'true')
      assertResultAsString('false implies true', 'true')
      assertResultAsString('true implies false', 'false')
      assertResultAsString('true implies true', 'true')
    })

    it('computes iff', () => {
      assertResultAsString('false iff false', 'true')
      assertResultAsString('false iff true', 'false')
      assertResultAsString('true iff false', 'false')
      assertResultAsString('true iff true', 'true')
    })

    it('computes Boolean equality', () => {
      assertResultAsString('false == false', 'true')
      assertResultAsString('true  == true', 'true')
      assertResultAsString('false == true', 'false')
      assertResultAsString('true  == false', 'false')
    })

    it('computes Boolean inequality', () => {
      assertResultAsString('false != false', 'false')
      assertResultAsString('true  != true', 'false')
      assertResultAsString('false != true', 'true')
      assertResultAsString('true  != false', 'true')
    })
  })

  describe('compile over other operators', () => {
    it('computes Boolean if-then-else', () => {
      assertResultAsString('if (false) false else true', 'true')
      assertResultAsString('if (true) false else true', 'false')
    })

    it('computes integer if-then-else', () => {
      assertResultAsString('if (3 > 5) 1 else 2', '2')
      assertResultAsString('if (5 > 3) 1 else 2', '1')
    })
  })

  describe('compile over definitions', () => {
    it('computes value definitions', () => {
      const input =
        `val x = 3 + 4
         val y = 2 * x
         y - x`
      assertResultAsString(input, '7')
    })

    it('computes multi-arg definitions', () => {
      const input =
        `def mult(x, y) = (x * y)
         mult(2, mult(3, 4))`
      assertResultAsString(input, '24')
    })

    it('uses named def instead of lambda', () => {
      const input =
        `def positive(x) = x > 0
         (-3).to(3).filter(positive)`
      assertResultAsString(input, 'set(1, 2, 3)')
    })
  })

  describe('compile variables', () => {
    it('variable definitions', () => {
      const input = 'var x: int'
      assertDef('var', 'x', input)
    })
  })

  describe('compile over sets', () => {
    it('computes an interval', () => {
      const input = '2.to(5)'
      assertResultAsString(input, 'set(2, 3, 4, 5)')
    })

    it('interval cardinality', () => {
      const input = '2.to(5).size()'
      assertResultAsString(input, '4')
    })

    it('interval isFinite', () => {
      const input = '2.to(5).isFinite()'
      assertResultAsString(input, 'true')
    })

    it('computes a flat set', () => {
      const input = 'set(1, 3 - 1, 3)'
      assertResultAsString(input, 'set(1, 2, 3)')
    })

    it('flat set cardinality', () => {
      const input = 'set(1, 4 - 1, 3).size()'
      assertResultAsString(input, '2')
    })

    it('flat set isFinite', () => {
      const input = 'set(1, 4 - 1, 3).isFinite()'
      assertResultAsString(input, 'true')
    })

    it('computes a flat set without duplicates', () => {
      const input = 'set(1, 2, 3 - 1, 3, 1)'
      assertResultAsString(input, 'set(1, 2, 3)')
    })

    it('computes a set of sets', () => {
      const input = 'set(set(1, 2), set(2, 3), set(1, 3))'
      assertResultAsString(input, 'set(set(1, 2), set(1, 3), set(2, 3))')
    })

    it('cardinality of a set of sets', () => {
      const input = 'set(set(1, 2), set(2, 3), set(1, 3)).size()'
      assertResultAsString(input, '3')
    })

    it('computes a set of intervals', () => {
      const input = 'set(1.to(3), 3.to(4))'
      assertResultAsString(input, 'set(set(1, 2, 3), set(3, 4))')
    })

    it('computes equality over sets', () => {
      assertResultAsString('set(1, 2) == set(1, 3 - 1)', 'true')
      assertResultAsString('set(1, 2) == set(1, 3 - 3)', 'false')
    })

    it('computes equality over intervals', () => {
      assertResultAsString('1.to(3) == 1.to(4 - 1)', 'true')
      assertResultAsString('1.to(3) == set(1, 2, 3)', 'true')
      assertResultAsString('set(1, 2, 3) == 1.to(3)', 'true')
      assertResultAsString('(-3).to(4) == set(-3, -2, -1, 0, 1, 2, 3, 4)', 'true')
      assertResultAsString('(-2).to(-4) == set()', 'true')
      assertResultAsString('3.to(-2) == set()', 'true')
      assertResultAsString('1.to(3) == 1.to(4)', 'false')
      assertResultAsString('(-1).to(3) == 1.to(3)', 'false')
      assertResultAsString('2.to(4) == 1.to(4)', 'false')
      assertResultAsString('(-4).to(-2) == (-2).to(-4)', 'false')
      assertResultAsString('3.to(0) == 4.to(-1)', 'true')
    })

    it('computes inequality over sets', () => {
      assertResultAsString('set(1, 2) != set(1, 3 - 1)', 'false')
      assertResultAsString('set(1, 2) != set(1, 3 - 3)', 'true')
    })

    it('computes inequality over intervals', () => {
      assertResultAsString('1.to(3) != 1.to(4 - 1)', 'false')
      assertResultAsString('1.to(3) != set(1, 2, 3)', 'false')
      assertResultAsString('set(1, 2, 3) != 1.to(3)', 'false')
      assertResultAsString('1.to(3) != 1.to(4)', 'true')
      assertResultAsString('2.to(4) != 1.to(4)', 'true')
    })

    it('computes a set of sets without duplicates', () => {
      const input = 'set(set(1, 2), set(2, 3), set(1, 3), set(2 - 1, 2 + 1))'
      assertResultAsString(input, 'set(set(1, 2), set(1, 3), set(2, 3))')
    })

    it('computes contains', () => {
      assertResultAsString('set(1, 2, 3).contains(2)', 'true')
      assertResultAsString('set(1, 2, 3).contains(4)', 'false')
    })

    it('computes in', () => {
      assertResultAsString('2 in set(1, 2, 3)', 'true')
      assertResultAsString('4.in(set(1, 2, 3))', 'false')
    })

    it('computes in an interval', () => {
      assertResultAsString('2 in 1.to(3)', 'true')
      assertResultAsString('4.in(1.to(3))', 'false')
      assertResultAsString('1.to(3).in(set(1.to(3), 2.to(4)))', 'true')
    })

    it('computes in over nested sets', () => {
      assertResultAsString('set(1, 2) in set(set(1, 2), set(2, 3))', 'true')
      assertResultAsString('set(1, 3) in set(set(1, 2), set(2, 3))', 'false')
    })

    it('computes subseteq', () => {
      assertResultAsString('set(1, 2).subseteq(set(1, 2, 3))', 'true')
      assertResultAsString('set(1, 2, 4).subseteq(set(1, 2, 3))', 'false')
    })

    it('computes subseteq over intervals', () => {
      assertResultAsString('2.to(4).subseteq(1.to(10))', 'true')
      assertResultAsString('2.to(0).subseteq(3.to(0))', 'true')
      assertResultAsString('set(2, 3, 4).subseteq(1.to(10))', 'true')
      assertResultAsString('2.to(4).subseteq(1.to(3))', 'false')
      assertResultAsString('2.to(4).subseteq(set(1, 2, 3))', 'false')
    })

    it('computes union', () => {
      assertResultAsString('set(1, 2).union(set(1, 3))', 'set(1, 2, 3)')
      assertResultAsString('1.to(3).union(2.to(4))', 'set(1, 2, 3, 4)')
      assertResultAsString('set(1, 2, 3).union(2.to(4))', 'set(1, 2, 3, 4)')
      assertResultAsString('1.to(3).union(set(2, 3, 4))', 'set(1, 2, 3, 4)')
    })

    it('computes intersect', () => {
      assertResultAsString('set(1, 2).intersect(set(1, 3))', 'set(1)')
      assertResultAsString('1.to(3).intersect(2.to(4))', 'set(2, 3)')
      assertResultAsString('set(1, 2, 3).intersect(2.to(4))', 'set(2, 3)')
      assertResultAsString('1.to(3).intersect(set(2, 3, 4))', 'set(2, 3)')
    })

    it('computes exclude', () => {
      assertResultAsString('set(1, 2, 4).exclude(set(1, 3))', 'set(2, 4)')
      assertResultAsString('1.to(3).exclude(2.to(4))', 'set(1)')
      assertResultAsString('set(1, 2, 3).exclude(2.to(4))', 'set(1)')
      assertResultAsString('1.to(3).exclude(set(2, 3, 4))', 'set(1)')
    })

    it('computes flatten', () => {
      assertResultAsString(
        'set(set(1, 2), set(2, 3), set(3, 4)).flatten()',
        'set(1, 2, 3, 4)'
      )
    })

    it('computes flatten on nested sets', () => {
      assertResultAsString(
        'set(set(set(1, 2), set(2, 3)), set(set(3, 4))).flatten()',
        'set(set(1, 2), set(2, 3), set(3, 4))'
      )
    })

    it('computes exists', () => {
      assertResultAsString('set(1, 2, 3).exists(x => true)', 'true')
      assertResultAsString('set(1, 2, 3).exists(x => false)', 'false')
      assertResultAsString('set(1, 2, 3).exists(x => x >= 2)', 'true')
      assertResultAsString('set(1, 2, 3).exists(x => x >= 5)', 'false')
    })

    it('computes exists over intervals', () => {
      assertResultAsString('1.to(3).exists(x => true)', 'true')
      assertResultAsString('1.to(3).exists(x => false)', 'false')
      assertResultAsString('1.to(3).exists(x => x >= 2)', 'true')
      assertResultAsString('1.to(3).exists(x => x >= 5)', 'false')
    })

    it('computes forall', () => {
      assertResultAsString('set(1, 2, 3).forall(x => true)', 'true')
      assertResultAsString('set(1, 2, 3).forall(x => false)', 'false')
      assertResultAsString('set(1, 2, 3).forall(x => x >= 2)', 'false')
      assertResultAsString('set(1, 2, 3).forall(x => x >= 0)', 'true')
    })

    it('computes forall over nested sets', () => {
      const input =
        'set(set(1, 2), set(2, 3)).forall(s => 2 in s)'
      assertResultAsString(input, 'true')
    })

    it('computes forall over intervals', () => {
      assertResultAsString('1.to(3).forall(x => true)', 'true')
      assertResultAsString('1.to(3).forall(x => false)', 'false')
      assertResultAsString('1.to(3).forall(x => x >= 2)', 'false')
      assertResultAsString('1.to(3).forall(x => x >= 0)', 'true')
    })

    it('computes map', () => {
      // a bijection
      assertResultAsString('set(1, 2, 3).map(x => 2 * x)', 'set(2, 4, 6)')
      // not an injection: 2 and 3 are mapped to 1
      assertResultAsString('set(1, 2, 3).map(x => x / 2)', 'set(0, 1)')
    })

    it('computes map over intervals', () => {
      // a bijection
      assertResultAsString('1.to(3).map(x => 2 * x)', 'set(2, 4, 6)')
      // not an injection: 2 and 3 are mapped to 1
      assertResultAsString('1.to(3).map(x => x / 2)', 'set(0, 1)')
    })

    it('computes filter', () => {
      assertResultAsString('set(1, 2, 3, 4).filter(x => false)', 'set()')
      assertResultAsString('set(1, 2, 3, 4).filter(x => true)', 'set(1, 2, 3, 4)')
      assertResultAsString('set(1, 2, 3, 4).filter(x => x % 2 == 0)', 'set(2, 4)')
    })

    it('computes filter over intervals', () => {
      assertResultAsString('1.to(4).filter(x => false)', 'set()')
      assertResultAsString('1.to(4).filter(x => true)', 'set(1, 2, 3, 4)')
      assertResultAsString('1.to(4).filter(x => x % 2 == 0)', 'set(2, 4)')
    })

    it('computes filter over sets of intervals', () => {
      assertResultAsString('set(1.to(4), 2.to(3)).filter(S => S.contains(1))',
        'set(set(1, 2, 3, 4))')
      assertResultAsString('set(1.to(4), 2.to(3)).filter(S => S.contains(0))',
        'set()')
    })

    it('computes fold', () => {
      // sum
      assertResultAsString('set(1, 2, 3).fold(10, (v, x => v + x))', '16')
      assertResultAsString('set().fold(10, (v, x => v + x))', '10')
      // flatten
      const input1 = dedent(
        `set(1.to(3), 4.to(5), 6.to(7))
        |  .fold(set(0), (a, s => a.union(s)))`
      )
      assertResultAsString(input1, 'set(0, 1, 2, 3, 4, 5, 6, 7)')
      assertResultAsString('set().fold(set(), (a, s => a.union(s)))', 'set()')
      // product by using a definition
      const input2 = dedent(
        `def prod(x, y) = x * y;
        |2.to(4).fold(1, prod)`
      )
      assertResultAsString(input2, '24')
    })
  })

  describe('compile over powerset', () => {
    it('computes a powerset', () => {
      assertResultAsString(
        '2.to(4).powerset()',
        'set(set(), set(2), set(3), set(2, 3), set(4), set(2, 4), set(3, 4), set(2, 3, 4))'
      )
    })

    it('powerset equality', () => {
      assertResultAsString(
        '2.to(3).powerset() == set(set(), set(2), set(3), set(2, 3))',
        'true'
      )
      assertResultAsString(
        '2.to(3).powerset() == set(2, 3).powerset()',
        'true'
      )
      assertResultAsString(
        '2.to(4).powerset() == set(2, 3).powerset()',
        'false'
      )
    })

    it('powerset contains', () => {
      assertResultAsString('2.to(3).powerset().contains(set(2))', 'true')
      assertResultAsString('2.to(3).powerset().contains(set(2, 4))', 'false')
    })

    it('powerset subseteq', () => {
      assertResultAsString(
        '2.to(4).powerset().subseteq(1.to(5).powerset())',
        'true'
      )
    })

    it('powerset cardinality', () => {
      assertResultAsString('set().powerset().size()', '1')
      assertResultAsString('2.to(4).powerset().size()', '8')
      assertResultAsString('2.to(5).powerset().size()', '16')
    })
  })

  describe('compile over built-in sets', () => {
    it('computes Bool', () => {
      assertResultAsString('Bool', 'set(false, true)')
    })

    it('computes Int', () => {
      assertResultAsString('Int', 'Int')
    })

    it('computes Int.contains', () => {
      assertResultAsString('Int.contains(123)', 'true')
      assertResultAsString('Int.contains(0)', 'true')
      assertResultAsString('Int.contains(-123)', 'true')
    })

    it('computes Nat', () => {
      assertResultAsString('Nat', 'Nat')
    })

    it('computes Nat.contains', () => {
      assertResultAsString('Nat.contains(123)', 'true')
      assertResultAsString('Nat.contains(0)', 'true')
      assertResultAsString('Nat.contains(-123)', 'false')
    })

    it('computes isSubset', () => {
      assertResultAsString('Nat.subseteq(Nat)', 'true')
      assertResultAsString('Nat.subseteq(Int)', 'true')
      assertResultAsString('Int.subseteq(Int)', 'true')
      assertResultAsString('Int.subseteq(Nat)', 'false')
    })

    it('equality over Nat and Int', () => {
      assertResultAsString('Nat == Nat', 'true')
      assertResultAsString('Int == Int', 'true')
      assertResultAsString('Nat == Int', 'false')
      assertResultAsString('Int == Nat', 'false')
      assertResultAsString('Int == set(0, 1)', 'false')
    })
  })

  describe('compile over tuples', () => {
    it('tuple constructors', () => {
      assertResultAsString('tup(1, 2, 3)', 'tup(1, 2, 3)')
      assertResultAsString('(1, 2, 3)', 'tup(1, 2, 3)')
      assertResultAsString('(1, 2, 3,)', 'tup(1, 2, 3)')
    })

    it('tuple access', () => {
      assertResultAsString('tup(4, 5, 6)._1', '4')
      assertResultAsString('tup(4, 5, 6)._2', '5')
      assertResultAsString('tup(4, 5, 6)._3', '6')
    })

    it('tuple equality', () => {
      assertResultAsString('(4, 5, 6) == (5 - 1, 5, 6)', 'true')
      assertResultAsString('(4, 5, 6) == (5, 5, 6)', 'false')
    })

    it('cross products', () => {
      assertResultAsString('tuples(set(), set(), set())', 'set()')
      assertResultAsString('tuples(set(), 2.to(3))', 'set()')
      assertResultAsString('tuples(2.to(3), set(), 3.to(5))', 'set()')
      assertResultAsString('tuples(1.to(2), 2.to(3))',
        'set(tup(1, 2), tup(2, 2), tup(1, 3), tup(2, 3))')
      assertResultAsString('tuples(1.to(1), 1.to(1), 1.to(1))',
        'set(tup(1, 1, 1))')
      assertResultAsString(
        'tuples(1.to(3), 2.to(4)) == tuples(1.to(3), 2.to(5 - 1))',
        'true'
      )
      assertResultAsString(
        'tuples(1.to(3), 2.to(4)) == tuples(1.to(3), 2.to(5 + 1))',
        'false'
      )
      assertResultAsString(
        'tuples(1.to(3), 2.to(4)).subseteq(tuples(1.to(3), 2.to(5 + 1)))',
        'true'
      )
      assertResultAsString(
        'tuples(1.to(4), 2.to(4)).subseteq(tuples(1.to(3), 2.to(5)))',
        'false'
      )
      assertResultAsString('set(tuples(1.to(2), 2.to(3)))',
        'set(set(tup(1, 2), tup(1, 3), tup(2, 2), tup(2, 3)))')
    })

    it('cardinality of cross products', () => {
      assertResultAsString('tuples(1.to(4), 2.to(4)).size()', '12')
      assertResultAsString('tuples(set(), 2.to(4)).size()', '0')
    })
  })

  describe('compile over lists', () => {
    it('list constructors', () => {
      assertResultAsString('[4, 2, 3]', 'list(4, 2, 3)')
      assertResultAsString('[4, 2, 3, ]', 'list(4, 2, 3)')
      assertResultAsString('list(4, 2, 3)', 'list(4, 2, 3)')
    })

    it('list range', () => {
      assertResultAsString('range(3, 7)', 'list(3, 4, 5, 6)')
      assertResultAsString('range(4, 5)', 'list(4)')
      assertResultAsString('range(3, 3)', 'list()')
    })

    it('list equality', () => {
      assertResultAsString('[4, 5, 6] == [5 - 1, 5, 6]', 'true')
      assertResultAsString('[4, 5, 6] == [5, 5, 6]', 'false')
      // lists are not equal to tuples in the typed world
      assertResultAsString('[4, 5, 6] == (4, 5, 6)', 'false')
    })

    it('list access', () => {
      assertResultAsString('[4, 5, 6].nth(0)', '4')
      assertResultAsString('[4, 5, 6].nth(2)', '6')
      assertResultAsString('[4, 5, 6].nth(-1)', undefined)
      assertResultAsString('[4, 5, 6].nth(3)', undefined)
    })

    it('list length', () => {
      assertResultAsString('[4, 5, 6].length()', '3')
      assertResultAsString('[].length()', '0')
    })

    it('list indices', () => {
      assertResultAsString('[4, 5, 6].indices()', 'set(0, 1, 2)')
      assertResultAsString('[].indices()', 'set()')
    })

    it('list append', () => {
      assertResultAsString('[4, 2, 3].append(5)', 'list(4, 2, 3, 5)')
      assertResultAsString('[].append(3)', 'list(3)')
    })

    it('list concat', () => {
      assertResultAsString('[4, 2, 3].concat([5, 6])', 'list(4, 2, 3, 5, 6)')
      assertResultAsString('[].concat([3, 4])', 'list(3, 4)')
      assertResultAsString('[3, 4].concat([])', 'list(3, 4)')
      assertResultAsString('[].concat([])', 'list()')
    })

    it('list head', () => {
      assertResultAsString('[4, 5, 6].head()', '4')
      assertResultAsString('[].head()', undefined)
    })

    it('list tail', () => {
      assertResultAsString('[4, 5, 6].tail()', 'list(5, 6)')
      assertResultAsString('[4].tail()', 'list()')
      assertResultAsString('[].tail()', undefined)
    })

    it('list slice', () => {
      assertResultAsString('[4, 5, 6, 7].slice(1, 3)', 'list(5, 6)')
      assertResultAsString('[4, 5, 6, 7].slice(0, 4)', 'list(4, 5, 6, 7)')
      assertResultAsString('[4, 5, 6, 7].slice(1, 7)', undefined)
      assertResultAsString('[4, 5, 6, 7].slice(-1, 3)', undefined)
      assertResultAsString('[1, 2].slice(1, 2)', 'list(2)')
      assertResultAsString('[1, 2].slice(1, 1)', 'list()')
      assertResultAsString('[1, 2].slice(2, 2)', undefined)
      assertResultAsString('[1, 2].slice(2, 1)', undefined)
      assertResultAsString('[].slice(0, 0)', undefined)
      assertResultAsString('[].slice(1, 0)', undefined)
      assertResultAsString('[].slice(1, 1)', undefined)
      assertResultAsString('[].slice(0, -1)', undefined)
    })

    it('list replaceAt', () => {
      assertResultAsString('[4, 5, 6].replaceAt(0, 10)', 'list(10, 5, 6)')
      assertResultAsString('[4, 5, 6].replaceAt(2, 10)', 'list(4, 5, 10)')
      assertResultAsString('[4, 5, 6].replaceAt(4, 10)', undefined)
      assertResultAsString('[4, 5, 6].replaceAt(-1, 10)', undefined)
    })

    it('list foldl', () => {
      assertResultAsString('[].foldl(3, (i, e => i + e))', '3')
      assertResultAsString('[4, 5, 6, 7].foldl(1, (i, e => i + e))', '23')
      assertResultAsString('[4, 5, 6, 7].foldl([], (l, e => l.append(e)))',
        'list(4, 5, 6, 7)')
    })

    it('list foldr', () => {
      assertResultAsString('[].foldr(3, (i, e => i + e))', '3')
      assertResultAsString('[4, 5, 6, 7].foldr(1, (i, e => i + e))', '23')
      assertResultAsString('[4, 5, 6, 7].foldr([], (l, e => l.append(e)))',
        'list(7, 6, 5, 4)')
    })

    it('list select', () => {
      assertResultAsString('[].select(e => e % 2 == 0)', 'list()')
      assertResultAsString('[4, 5, 6].select(e => e % 2 == 0)', 'list(4, 6)')
    })
  })

  describe('compile over records', () => {
    it('record constructors', () => {
      assertResultAsString('rec("a", 2, "b", true)', 'rec("a", 2, "b", true)')
      assertResultAsString('{ a: 2, b: true }', 'rec("a", 2, "b", true)')
      assertResultAsString('{ a: 2, b: true, }', 'rec("a", 2, "b", true)')
    })

    it('record equality', () => {
      assertResultAsString('{ a: 2 + 3, b: true } == { a: 5, b: true }', 'true')
      assertResultAsString('{ a: 2 + 3, b: true } == { a: 1, b: false }', 'false')
    })

    it('record field access', () => {
      assertResultAsString('{ a: 2, b: true }.a', '2')
      assertResultAsString('{ a: 2, b: true }.b', 'true')
    })

    it('record field names', () => {
      assertResultAsString('{ a: 2, b: true }.fieldNames()', 'set("a", "b")')
    })

    it('record field update', () => {
      assertResultAsString('{ a: 2, b: true }.with("a", 3)', 'rec("a", 3, "b", true)')
      // The following query should not be possible, due to the type checker.
      // Just in case, we check that the simulator returns 'undefined'.
      assertResultAsString('{ a: 2, b: true }.with("c", 3)', undefined)
    })
  })

  describe('compile over maps', () => {
    it('mapBy constructor', () => {
      assertResultAsString('3.to(5).mapBy(i => 2 * i)',
        'mapOf(tup(3, 6), tup(4, 8), tup(5, 10))')
      assertResultAsString('set(2.to(4)).mapBy(s => s.size())',
        'mapOf(tup(set(2, 3, 4), 3))')
    })

    it('setToMap constructor', () => {
      assertResultAsString('setToMap(set((3, 6), (4, 10 - 2), (5, 10)))',
        'mapOf(tup(3, 6), tup(4, 8), tup(5, 10))')
    })

    it('mapOf constructor', () => {
      assertResultAsString('mapOf(3 -> 6, 4 -> 10 - 2, 5 -> 10)',
        'mapOf(tup(3, 6), tup(4, 8), tup(5, 10))')
    })

    it('map get', () => {
      assertResultAsString('3.to(5).mapBy(i => 2 * i).get(4)', '8')
      assertResultAsString(
        'set(2.to(4)).mapBy(s => s.size()).get(set(2, 3, 4))',
        '3'
      )
    })

    it('map update', () => {
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i).update(4, 20)',
        'mapOf(tup(3, 6), tup(4, 20), tup(5, 10))'
      )
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i).update(7, 20)',
        undefined
      )
    })

    it('map updateAs', () => {
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i).updateAs(4, (old => old + 1))',
        'mapOf(tup(3, 6), tup(4, 9), tup(5, 10))'
      )
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i).updateAs(7, (old => old + 1))',
        undefined
      )
    })

    it('map put', () => {
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i).put(10, 11)',
        'mapOf(tup(10, 11), tup(3, 6), tup(4, 8), tup(5, 10))'
      )
    })

    it('map keys', () => {
      assertResultAsString(
        'set(3, 5, 7).mapBy(i => 2 * i).keys()',
        'set(3, 5, 7)'
      )
    })

    it('map equality', () => {
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i) == 3.to(5).mapBy(i => 3 * i - i)',
        'true'
      )
      assertResultAsString(
        '3.to(5).mapBy(i => 2 * i) == 3.to(6).mapBy(i => 2 * i)',
        'false'
      )
    })

    it('map setOfMaps', () => {
      assertResultAsString(
        '2.to(3).setOfMaps(5.to(6))',
        'set(mapOf(tup(2, 5), tup(3, 5)), mapOf(tup(2, 6), tup(3, 5)), mapOf(tup(2, 5), tup(3, 6)), mapOf(tup(2, 6), tup(3, 6)))'
      )
      assertResultAsString(
        `2.to(3).setOfMaps(5.to(6)) ==
          set(mapOf(2 -> 5, 3 -> 5),
              mapOf(2 -> 6, 3 -> 5),
              mapOf(2 -> 5, 3 -> 6),
              mapOf(2 -> 6, 3 -> 6))`,
        'true'
      )
      assertResultAsString(
        'set(2).setOfMaps(5.to(6))',
        'set(mapOf(tup(2, 5)), mapOf(tup(2, 6)))'
      )
      assertResultAsString(
        '2.to(3).setOfMaps(set(5))',
        'set(mapOf(tup(2, 5), tup(3, 5)))'
      )
      assertResultAsString(
        '2.to(4).setOfMaps(5.to(8)).size()',
        '64'
      )
      assertResultAsString(
        '2.to(4).setOfMaps(5.to(7)).subseteq(2.to(4).setOfMaps(4.to(8)))',
        'true'
      )
      assertResultAsString(
        '2.to(4).setOfMaps(5.to(10)).subseteq(2.to(4).setOfMaps(4.to(8)))',
        'false'
      )
      assertResultAsString(
        '2.to(3).setOfMaps(5.to(6)).contains(mapOf(2 -> 5, 3 -> 5))',
        'true'
      )
      assertResultAsString(
        '2.to(3).setOfMaps(5.to(6)) == 2.to(4 - 1).setOfMaps(5.to(7 - 1))',
        'true'
      )
    })
  })
})
