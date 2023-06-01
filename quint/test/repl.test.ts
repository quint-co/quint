import { describe, it } from 'mocha'
import { assert, expect } from 'chai'
import { once } from 'events'
import { PassThrough, Writable } from 'stream'
import chalk from 'chalk'

import { quintRepl } from '../src/repl'
import { dedent } from './textUtils'
import { version } from '../src/version'

// A simple implementation of Writable to a string:
// After: https://bensmithgall.com/blog/jest-mock-trick
class ToStringWritable extends Writable {
  buffer: string = ''

  _write(chunk: string, encoding: string, next: (_error?: Error | null) => void): void {
    this.buffer += chunk
    next()
  }

  reset() {
    this.buffer = ''
  }
}

// run a test with mocked input/output and return the input + output
const withIO = async (inputText: string): Promise<string> => {
  // save the current chalk level and reset chalk to no color
  const savedChalkLevel = chalk.level
  chalk.level = 0
  // setup:
  //  - the output that writes to a string
  //  - the input that consumes events
  const output = new ToStringWritable()
  // an input mock designed for testing
  const input = new PassThrough()
  // whatever is written on the input goes to the output
  input.pipe(output)

  const rl = quintRepl(input, output, { verbosity: 2 }, () => {})

  // Emit the input line-by-line, as nodejs is printing prompts.
  // TODO: is it a potential source of race conditions in unit tests?
  const lines = inputText.split('\n')
  let linesLeft = lines.length
  for (const line of lines) {
    input.emit('data', line)
    linesLeft--
    if (linesLeft > 0) {
      input.emit('data', '\n')
    }
  }
  input.end()
  input.unpipe(output)
  input.destroy()

  // readline is asynchronous, wait till it terminates
  await once(rl, 'close')
  chalk.level = savedChalkLevel
  return output.buffer
}

// the standard banner, which gets repeated
const banner = `Quint REPL ${version}
Type ".exit" to exit, or ".help" for more information`

async function assertRepl(input: string, output: string) {
  const expected = `${banner}
${output}
`

  const result = await withIO(input)
  assert(typeof result === 'string', 'expected result to be a string')
  expect(result).to.equal(expected)
}

describe('repl ok', () => {
  it('empty input', async () => {
    await assertRepl('', '>>> ')
  })

  it('Set(2 + 3)', async () => {
    const input = 'Set(2 + 3)\n'
    const output = dedent(
      `>>> Set(2 + 3)
      |Set(5)
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('Map(1 -> 2, 3 -> 4)', async () => {
    const input = 'Map(1 -> 2, 3 -> 4)\n'
    const output = dedent(
      `>>> Map(1 -> 2, 3 -> 4)
      |Map(1 -> 2, 3 -> 4)
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('basic expressions', async () => {
    const input = dedent(
      `1 + 1
      |3 > 1
      |1.to(3).map(x => 2 * x)
      |1.to(4).filter(x => x > 2)
      |Set(1, 3).union(Set(5, 6))
      |1.to(4).forall(x => x > 1)
      |(5 - 1, 5, 6)
      |[5 - 1, 5, 6]
      |`
    )
    const output = dedent(
      `>>> 1 + 1
      |2
      |>>> 3 > 1
      |true
      |>>> 1.to(3).map(x => 2 * x)
      |Set(2, 4, 6)
      |>>> 1.to(4).filter(x => x > 2)
      |Set(3, 4)
      |>>> Set(1, 3).union(Set(5, 6))
      |Set(1, 3, 5, 6)
      |>>> 1.to(4).forall(x => x > 1)
      |false
      |>>> (5 - 1, 5, 6)
      |(4, 5, 6)
      |>>> [5 - 1, 5, 6]
      |[4, 5, 6]
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('ill-typed expressions', async () => {
    const input = dedent(
      `1 + false
      |`
    )
    const output = dedent(
      `>>> 1 + false
      |static analysis error: error: [QNT000] Couldn't unify int and bool
      |Trying to unify int and bool
      |Trying to unify (int, int) => int and (int, bool) => t0
      |
      |1 + false
      |^^^^^^^^^
      |
      |
      |1
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('definitions in expressions', async () => {
    const input = dedent(
      `val x = 3; 2 * x
      |def mult(x, y) = x * y; mult(2, mult(3, 4))
      |`
    )
    const output = dedent(
      `>>> val x = 3; 2 * x
      |6
      |>>> def mult(x, y) = x * y; mult(2, mult(3, 4))
      |24
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('top-level definitions', async () => {
    const input = dedent(
      `val n = 4
      |def mult(x, y) = x * y
      |mult(100, n)
      |def powpow(x, y) = x^y
      |mult(100, powpow(2, 3))
      |`
    )
    const output = dedent(
      `>>> val n = 4
      |
      |>>> def mult(x, y) = x * y
      |
      |>>> mult(100, n)
      |400
      |>>> def powpow(x, y) = x^y
      |
      |>>> mult(100, powpow(2, 3))
      |800
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('clear history', async () => {
    const input = dedent(
      `val n = 4
      |n * n
      |.clear
      |n * n
      |`
    )
    const output = dedent(
      `>>> val n = 4
      |
      |>>> n * n
      |16
      |>>> .clear
      |
      |>>> n * n
      |syntax error: error: Failed to resolve name n in definition for q::input, in module __repl__
      |n * n
      |^
      |
      |syntax error: error: Failed to resolve name n in definition for q::input, in module __repl__
      |n * n
      |    ^
      |
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('change verbosity and track executions', async () => {
    const input = dedent(
      `pure def plus(x, y) = x + y
      |.verbosity=4
      |plus(2, 3)
      |`
    )
    const output = dedent(
      `>>> pure def plus(x, y) = x + y
      |
      |>>> .verbosity=4
      |.verbosity=4
      |>>> plus(2, 3)
      |5
      |
      |[Frame 0]
      |q::input() => 5
      |└─ plus(2, 3) => 5
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('set and get the seed', async () => {
    const input = dedent(
      `.seed=4
      |.seed
      |.seed=0x1abc
      |`
    )
    const output = dedent(
      `>>> .seed=4
      |.seed=4
      |>>> .seed
      |.seed=4
      |>>> .seed=0x1abc
      |.seed=6844
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('handle exceptions', async () => {
    const input = dedent(
      `Set(Int)
      |`
    )
    const output = dedent(
      `>>> Set(Int)
      |runtime error: error: Infinite set Int is non-enumerable
      |Set(Int)
      |^^^^^^^^
      |
      |<undefined value>
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('assignments', async () => {
    const input = dedent(
      `var x: int
      |action Init = x' = 0
      |action Next = x' = x + 1
      |Init
      |x
      |Next
      |x
      |Next
      |x
      |`
    )
    const output = dedent(
      `>>> var x: int
      |
      |>>> action Init = x' = 0
      |
      |>>> action Next = x' = x + 1
      |
      |>>> Init
      |true
      |>>> x
      |0
      |>>> Next
      |true
      |>>> x
      |1
      |>>> Next
      |true
      |>>> x
      |2
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('action-level disjunctions and conjunctions', async () => {
    const input = dedent(
      `
      |var x: int
      |action Init = x' = 0
      |action Next = any {
      |  all {
      |    x == 0,
      |    x' = 1,
      |  },
      |  all {
      |    x == 1,
      |    x' = 0,
      |  },
      |}
      |
      |Init
      |x
      |Next
      |x
      |Next
      |x
      |Next
      |x
      |`
    )
    const output = dedent(
      `>>> 
      |>>> var x: int
      |
      |>>> action Init = x' = 0
      |
      |>>> action Next = any {
      |...   all {
      |...     x == 0,
      |...     x' = 1,
      |...   },
      |...   all {
      |...     x == 1,
      |...     x' = 0,
      |...   },
      |... }
      |... 
      |
      |>>> Init
      |true
      |>>> x
      |0
      |>>> Next
      |true
      |>>> x
      |1
      |>>> Next
      |true
      |>>> x
      |0
      |>>> Next
      |true
      |>>> x
      |1
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('action-level disjunctions and non-determinism', async () => {
    const input = dedent(
      `
      |var x: int
      |action Init = x' = 0
      |action Next = any {
      |  x' = x + 1,
      |  x' = x - 1,
      |}
      |
      |Init
      |-1 <= x and x <= 1
      |Next
      |-2 <= x and x <= 2
      |Next
      |-3 <= x and x <= 3
      |Next
      |-4 <= x and x <= 4
      |`
    )
    const output = dedent(
      `>>> 
      |>>> var x: int
      |
      |>>> action Init = x' = 0
      |
      |>>> action Next = any {
      |...   x' = x + 1,
      |...   x' = x - 1,
      |... }
      |... 
      |
      |>>> Init
      |true
      |>>> -1 <= x and x <= 1
      |true
      |>>> Next
      |true
      |>>> -2 <= x and x <= 2
      |true
      |>>> Next
      |true
      |>>> -3 <= x and x <= 3
      |true
      |>>> Next
      |true
      |>>> -4 <= x and x <= 4
      |true
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('nondet and oneOf', async () => {
    const input = dedent(
      `
      |var x: int
      |
      |x' = 0
      |x == 0
      |{ nondet y = oneOf(Set(1, 2, 3))
      |  x' = y }
      |
      |1 <= x and x <= 3
      |nondet y = oneOf(2.to(5)); x' = y
      |2 <= x and x <= 5
      |nondet t = oneOf(tuples(2.to(5), 3.to(4))); x' = t._1 + t._2
      |5 <= x and x <= 9
      |nondet i = oneOf(Nat); x' = i
      |x >= 0
      |nondet i = oneOf(Int); x' = i
      |Int.contains(x)
      |`
    )
    const output = dedent(
      `>>> 
      |>>> var x: int
      |
      |>>> 
      |>>> x' = 0
      |true
      |>>> x == 0
      |true
      |>>> { nondet y = oneOf(Set(1, 2, 3))
      |...   x' = y }
      |... 
      |true
      |>>> 1 <= x and x <= 3
      |true
      |>>> nondet y = oneOf(2.to(5)); x' = y
      |true
      |>>> 2 <= x and x <= 5
      |true
      |>>> nondet t = oneOf(tuples(2.to(5), 3.to(4))); x' = t._1 + t._2
      |true
      |>>> 5 <= x and x <= 9
      |true
      |>>> nondet i = oneOf(Nat); x' = i
      |true
      |>>> x >= 0
      |true
      |>>> nondet i = oneOf(Int); x' = i
      |true
      |>>> Int.contains(x)
      |true
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('run q::test, q::testOnce, and q::lastTrace', async () => {
    const input = dedent(
      `
      |var n: int
      |action Init = n' = 0
      |action Next = n' = n + 1
      |val Inv = n < 10
      |q::testOnce(5, Init, Next, Inv)
      |q::testOnce(10, Init, Next, Inv)
      |q::test(5, 5, Init, Next, Inv)
      |q::test(5, 10, Init, Next, Inv)
      |q::lastTrace.length()
      |q::lastTrace.nth(q::lastTrace.length() - 1)
      |`
    )
    const output = dedent(
      `>>> 
      |>>> var n: int
      |
      |>>> action Init = n' = 0
      |
      |>>> action Next = n' = n + 1
      |
      |>>> val Inv = n < 10
      |
      |>>> q::testOnce(5, Init, Next, Inv)
      |true
      |>>> q::testOnce(10, Init, Next, Inv)
      |false
      |>>> q::test(5, 5, Init, Next, Inv)
      |true
      |>>> q::test(5, 10, Init, Next, Inv)
      |false
      |>>> q::lastTrace.length()
      |11
      |>>> q::lastTrace.nth(q::lastTrace.length() - 1)
      |{ n: 10 }
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('REPL consumes its output', async () => {
    const input = dedent(
      `>>> 1 + 1
      |
      | >>> if (true) {
      | ...   3
      | ... } else {
      | ...   4
      | ... }
      |
      |>>> Set(2 + 3)
      |Set(5)
      |   // a multiline comment
      | /// a doc comment
      | /* a multiline
      |    comment
      |  */
      |`
    )
    const output = dedent(
      `>>> >>> 1 + 1
      |... 
      |2
      |>>>  >>> if (true) {
      |...  ...   3
      |...  ... } else {
      |...  ...   4
      |...  ... }
      |... 
      |3
      |>>> >>> Set(2 + 3)
      |... Set(5)
      |Set(5)
      |>>>    // a multiline comment
      |>>>  /// a doc comment
      |>>>  /* a multiline
      |...     comment
      |...   */
      |... `
    )
    await assertRepl(input, output)
  })
})
