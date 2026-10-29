import { describe, it } from 'mocha'
import { expect } from 'chai'
import { once } from 'events'
import { PassThrough, Writable } from 'stream'
import { Buffer } from 'buffer'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { quintRepl } from '../src/repl'

// Collects the output and lets the test wait until the REPL prints a prompt
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

  async isReady() {
    if (this.buffer.endsWith('>>> ') || this.buffer.endsWith('... ')) {
      return
    }
    await new Promise(resolve => {
      this.waiter = () => resolve(null)
    })
  }
}

// readline wraps a sync completer into a callback-style one
type Completer = (line: string) => Promise<[string[], string]>

async function withReplCompleter(lines: string[], check: (complete: Completer) => Promise<void>) {
  const output = new ToStringWritable()
  const input = new PassThrough()
  input.pipe(output, { end: false })

  const rl = quintRepl(input, output, { verbosity: 1, backend: 'typescript' }, () => {})
  await output.isReady()

  for (const line of lines) {
    input.emit('data', line + '\n')
    await output.isReady()
  }

  try {
    const raw = (rl as any).completer as (line: string, cb: (err: Error | null, r: [string[], string]) => void) => void
    await check(line => new Promise((resolve, reject) => raw(line, (err, r) => (err ? reject(err) : resolve(r)))))
  } finally {
    input.end()
    input.unpipe(output)
    input.destroy()
    await once(rl, 'close')
  }
}

describe('repl tab-completion', () => {
  const typeDefs = [
    'type Person = { name: str, age: int }',
    'type Shape = Circle(int) | Rect({ w: int, h: int })',
    'type Option[a] = Some(a) | None',
    'type Team = { lead: Person, members: Set[Person], shapes: List[Shape] }',
  ]

  it('completes user-defined types and variant constructors', async () => {
    await withReplCompleter(typeDefs, async complete => {
      expect((await complete('val t: Te'))[0]).to.deep.equal(['Team'])
      expect((await complete('type X = Set[Pe'))[0]).to.deep.equal(['Person'])
      expect((await complete('Cir'))[0]).to.deep.equal(['Circle'])
      expect((await complete('Re'))[0]).to.include('Rect')
      expect((await complete('So'))[0]).to.deep.equal(['Some'])
      expect((await complete('Op'))[0]).to.deep.equal(['Option'])
      expect((await complete('type Y = { a: in'))[0]).to.include('int')
    })
  })

  it('completes definitions made in the REPL', async () => {
    await withReplCompleter(['val counter = 3', 'def double(x) = x * 2'], async complete => {
      expect((await complete('cou'))[0]).to.deep.equal(['counter'])
      expect((await complete('dou'))[0]).to.deep.equal(['double'])
    })
  })

  it('completes names from wildcard and qualified imports', async () => {
    const file = path.join(os.tmpdir(), `replCompletion-${process.pid}.qnt`)
    fs.writeFileSync(file, 'module M {\n  val mval = 1\n}\nmodule N {\n  val nval = 2\n}\n')
    const lines = [`.load ${file.replace(/\\/g, '/')}`, 'import M.*', 'import N']
    await withReplCompleter(lines, async complete => {
      expect((await complete('mva'))[0]).to.deep.equal(['mval'])
      expect((await complete('N::nv'))[0]).to.deep.equal(['N::nval'])
    }).finally(() => fs.unlinkSync(file))
  })

  it('does not complete arguments of dot commands', async () => {
    await withReplCompleter(['val myval = 1'], async complete => {
      expect((await complete('.load my'))[0]).to.deep.equal([])
      expect((await complete('.lo'))[0]).to.deep.equal(['.load'])
    })
  })

  it('keeps names after a failed definition', async () => {
    await withReplCompleter(['type Person = { name: str }', 'type Person = int'], async complete => {
      expect((await complete('Per'))[0]).to.deep.equal(['Person'])
    })
  })
})
