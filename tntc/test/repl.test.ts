import { describe, it } from 'mocha'
import { assert, expect } from 'chai'
import { once } from 'events'
import { Writable, PassThrough } from 'stream'
import chalk from 'chalk'

import { tntRepl, settings } from '../src/repl'
import { dedent } from './textUtils'

// A simple implementation of Writable to a string:
// After: https://bensmithgall.com/blog/jest-mock-trick
class ToStringWritable extends Writable {
  buffer: string = ''

  _write (chunk: string,
    encoding: string,
    next: (error?: Error | null) => void): void {
    this.buffer += chunk
    next()
  }

  reset () {
    this.buffer = ''
  }
}

// run a test with mocked input/output and return the input + output
const withIO = async (inputText: string): Promise<string> => {
  // save the current chalk level and reset chalk to no color
  const savedSettings = settings
  settings.prompt = ''
  settings.continuePrompt = ''
  const savedChalkLevel = chalk.level
  chalk.level = 0
  // setup:
  //  - the output that writes to a string
  //  - the input that consumes events
  const output = new ToStringWritable()
  const input = new PassThrough()

  const rl = tntRepl(input, output, () => {})

  input.emit('data', inputText)
  input.end()
  input.destroy()

  // readline is asynchronous, wait till it terminates
  await once(rl, 'close')
  chalk.level = savedChalkLevel
  settings.prompt = savedSettings.prompt
  settings.continuePrompt = savedSettings.continuePrompt
  return output.buffer
}

// the standard banner, which gets repeated
const banner =
`TNT REPL v0.0.1
Type ".exit" to exit, or ".help" for more information`

async function assertRepl (input: string, output: string) {
  const expected =
`${banner}
${output}
`

  const result = await withIO(input)
  assert(typeof result === 'string', 'expected result to be a string')
  expect(result).to.equal(expected)
}

describe('repl ok', () => {
  it('input', async () => {
    await assertRepl('', '')
  })

  it('set(2 + 3)', async () => {
    const input = 'set(2 + 3)\n'
    const output = dedent(
      `set(5)
      |`
    )
    await assertRepl(input, output)
  })

  it('basic expressions', async () => {
    const input = dedent(
      `1 + 1
      |3 > 1
      |1.to(3).map(x => 2 * x)
      |1.to(4).filter(x => x > 2)
      |set(1, 3).union(set(5, 6))
      |1.to(4).forall(x => x > 1)
      |(5 - 1, 5, 6)
      |`
    )
    const output = dedent(
      `2
      |true
      |set(2, 4, 6)
      |set(3, 4)
      |set(1, 3, 5, 6)
      |false
      |(4, 5, 6)
      |`
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
      `6
      |24
      |`
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
      `
      |
      |400
      |
      |800
      |`
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
      `
      |16
      |
      |2:1: Couldn't resolve name n in definition for __input, in module __REPL
      |2:5: Couldn't resolve name n in definition for __input, in module __REPL
      |<result undefined>
      |
      |`
    )
    await assertRepl(input, output)
  })

  it('assignments', async () => {
    const input = dedent(
      `var x: int
      |action Init = x <- 0
      |action Next = x <- x + 1
      |Init
      |x
      |Next
      |x
      |Next
      |x
      |`
    )
    const output = dedent(
      `
      |
      |
      |true
      |0
      |true
      |1
      |true
      |2
      |`
    )
    await assertRepl(input, output)
  })

  it('action-level disjunctions and conjunctions', async () => {
    const input = dedent(
      `
      |var x: int
      |action Init = x <- 0
      |action Next = {
      |  | { x == 0 & x <- 1 }
      |  | { x == 1 & x <- 0 }
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
      `
      |
      |
      |true
      |0
      |true
      |1
      |true
      |0
      |true
      |1
      |`
    )
    await assertRepl(input, output)
  })

  it('action-level disjunctions and non-determinism', async () => {
    const input = dedent(
      `
      |var x: int
      |action Init = x <- 0
      |action Next = {
      |  | x <- x + 1
      |  | x <- x - 1
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
      `
      |
      |
      |true
      |true
      |true
      |true
      |true
      |true
      |true
      |true
      |`
    )
    await assertRepl(input, output)
  })

  it('guess and non-determinism', async () => {
    const input = dedent(
      `
      |var x: int
      |
      |x <- 0
      |x == 0
      |set(1, 2, 3).guess(y => x <- y)
      |1 <= x and x <= 3
      |2.to(5).guess(y => x <- y)
      |2 <= x and x <= 5
      |tuples(2.to(5), 3.to(4)).guess(t => x <- t._1 + t._2)
      |5 <= x and x <= 9
      |`
    )
    const output = dedent(
      `
      |true
      |true
      |true
      |true
      |true
      |true
      |true
      |true
      |`
    )
    await assertRepl(input, output)
  })
})
