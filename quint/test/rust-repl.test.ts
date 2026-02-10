import { describe, it } from 'mocha'
import { assert, expect } from 'chai'
import { once } from 'events'
import { PassThrough, Writable } from 'stream'
import { Buffer } from 'buffer'
import chalk from 'chalk'

import { quintRepl } from '../src/repl'
import { dedent } from './textUtils'
import { version } from '../src/version'

// A simple implementation of Writable to a string:
// After: https://bensmithgall.com/blog/jest-mock-trick
//
// Note that the writable string is used to wait for the repl's output. The
// reply is considered to be done processing the input if it emits a prompt
// prefix (>>>, ...) or an internal "Error".
class ToStringWritable extends Writable {
  buffer: string = ''
  waiter: () => void = () => {}

  _write(chunk: Buffer, _encoding: string, next: (_error?: Error | null) => void): void {
    this.buffer += chunk
    if (chunk.includes('>>> ') || chunk.includes('... ') || chunk.includes('Error')) {
      this.waiter()
    }
    next()
  }

  reset() {
    this.buffer = ''
  }

  async isReady() {
    if (this.buffer.endsWith('>>> ') || this.buffer.endsWith('... ')) {
      return
    }
    await new Promise((resolve, _reject) => {
      this.waiter = () => resolve(null)
    })
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
  // Pipe input to output to simulate terminal echo behavior
  // (readline doesn't echo input from non-TTY streams)
  // Use { end: false } to prevent ending output when input ends
  input.pipe(output, { end: false })

  const rl = quintRepl(input, output, { verbosity: 2, backend: 'rust' }, () => {})
  await output.isReady()

  // Send input line-by-line to the REPL. We emit 'data' events for each line,
  // with a wait between each one to give the REPL's async processing time to
  // handle each line before the next one arrives. This prevents race conditions
  // where lines are queued faster than the REPL can process them.
  const lines = inputText.split(/(?<=\n)/)
  for (const line of lines) {
    input.emit('data', line)
    await output.isReady()
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
const banner = `Quint REPL ${version} (using the Rust backend)
Type ".exit" to exit, or ".help" for more information`

async function assertRepl(input: string, output: string) {
  const expected = `${banner}
${output}`

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
      |Trying to unify (int, int) => int and (int, bool) => _t0
      |
      |1 + false
      |^^^^^^^^^
      |
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
      |static analysis error: error: [QNT404] Name 'n' not found
      |n * n
      |^
      |
      |static analysis error: error: [QNT404] Name 'n' not found
      |n * n
      |    ^
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  xit('change verbosity and track executions', async () => {
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
      |plus(2, 3) => 5
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  xit('change verbosity and show execution on failure', async () => {
    const input = dedent(
      `pure def div(x, y) = x / y
      |.verbosity=4
      |div(2, 0)
      |`
    )
    const output = dedent(
      `>>> pure def div(x, y) = x / y
      |
      |>>> .verbosity=4
      |.verbosity=4
      |>>> div(2, 0)
      |
      |[Frame 0]
      |div(2, 0) => none
      |
      |runtime error: error: [QNT503] Division by zero
      |pure def div(x, y) = x / y
      |                     ^^^^^
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  xit('caching nullary definitions', async () => {
    const input = dedent(
      `var x: int
      |.verbosity=4
      |x' = 0
      |action step = x' = x + 1
      |action input1 = step
      |action input2 = step
      |input1
      |input2
      |`
    )
    const output = dedent(
      // a regression test for the behavior uncovered in:
      // https://github.com/informalsystems/quint/issues/982
      `>>> var x: int
      |
      |>>> .verbosity=4
      |.verbosity=4
      |>>> x' = 0
      |true
      |>>> action step = x' = x + 1
      |
      |>>> action input1 = step
      |
      |>>> action input2 = step
      |
      |>>> input1
      |true
      |
      |[Frame 0]
      |input1 => true
      |└─ step => true
      |
      |>>> input2
      |true
      |
      |[Frame 0]
      |input2 => true
      |└─ step => true
      |
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('update the seed between evaluations', async () => {
    // A regression test.
    // Test that two consecutive steps produce two different integers.
    // If this test fails, it is almost certainly because of the seed
    // not being updated between consecutive calls of `step`.
    // There is a neglible probability of this test failing,
    // since we are using randomization.
    const input = dedent(
      `var S: Set[int]
      |S' = Set()
      |action step = { nondet y = 1.to(2^62).oneOf(); S' = Set(y).union(S) }
      |step
      |step
      |step
      |step
      |size(S) > 1
      |`
    )
    const output = dedent(
      `>>> var S: Set[int]
      |
      |>>> S' = Set()
      |true
      |>>> action step = { nondet y = 1.to(2^62).oneOf(); S' = Set(y).union(S) }
      |
      |>>> step
      |true
      |>>> step
      |true
      |>>> step
      |true
      |>>> step
      |true
      |>>> size(S) > 1
      |true
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

  xit('handle exceptions', async () => {
    const input = dedent(
      `Set(Int)
      |`
    )
    const output = dedent(
      `>>> Set(Int)
      |runtime error: error: [QNT501] Infinite set Int is non-enumerable
      |Set(Int)
      |^^^^^^^^
      |
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

  xit('nondet and oneOf', async () => {
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
      |nondet m = 1.to(5).setOfMaps(Int).oneOf(); x' = m.get(3)
      |x.in(Int)
      |nondet m = Set().oneOf(); x' = m
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
      |>>> nondet m = 1.to(5).setOfMaps(Int).oneOf(); x' = m.get(3)
      |true
      |>>> x.in(Int)
      |true
      |>>> nondet m = Set().oneOf(); x' = m
      |false
      |>>> `
    )
    await assertRepl(input, output)
  })

  it('nondet and oneOf over sets of sets', async () => {
    const input = dedent(
      `var S: Set[int]
      |nondet y = oneOf(powerset(1.to(3))); S' = y
      |S.subseteq(1.to(3))
      |`
    )
    const output = dedent(
      `>>> var S: Set[int]
      |
      |>>> nondet y = oneOf(powerset(1.to(3))); S' = y
      |true
      |>>> S.subseteq(1.to(3))
      |true
      |>>> `
    )
    await assertRepl(input, output)
  })

  xit('actions introduce their own frames', async () => {
    const input = dedent(
      `var n: int
      |action init = n' = 0
      |action step = n' = n + 1
      |.verbosity=3
      |init.then(step).then(step)
      |`
    )
    const output = dedent(
      `>>> var n: int
      |
      |>>> action init = n' = 0
      |
      |>>> action step = n' = n + 1
      |
      |>>> .verbosity=3
      |.verbosity=3
      |>>> init.then(step).then(step)
      |true
      |
      |[Frame 0]
      |init => true
      |
      |[Frame 1]
      |step => true
      |
      |[Frame 2]
      |step => true
      |
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
      |q::testOnce(5, 1, Init, Next, Inv)
      |q::testOnce(10, 1, Init, Next, Inv)
      |q::test(5, 5, 1, Init, Next, Inv)
      |q::test(5, 10, 1, Init, Next, Inv)
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
      |>>> q::testOnce(5, 1, Init, Next, Inv)
      |"ok"
      |>>> q::testOnce(10, 1, Init, Next, Inv)
      |"violation"
      |>>> q::test(5, 5, 1, Init, Next, Inv)
      |"ok"
      |>>> q::test(5, 10, 1, Init, Next, Inv)
      |"violation"
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
      |>>> all {
      |...   true,
      |...   true
      |... }
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
      |>>> >>> all {
      |... ...   true,
      |... ...   true
      |... ... }
      |... 
      |true
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
