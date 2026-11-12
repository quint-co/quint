/**
 * Subprocess entry for the #2074 exit-code regression.
 *
 * Registers the real Apalache process handlers, then forces the same kind of
 * rejection `quint verify` hits when reporting a counterexample throws.
 *
 * QUINT_VERIFY_EXIT_MODE=uncaught  unhandled rejection (the listener must exit 1)
 * QUINT_VERIFY_EXIT_MODE=cli       rejection inside the verify command promise
 */
import { createRequire } from 'module'
import { EventEmitter } from 'events'
import { join } from 'path'
import type { ChildProcess } from 'child_process'
import { stopWithQuint } from '../../src/apalache'

const FORCED_REPORTING_FAILURE = 'forced reporting failure'

function fakeApalache(): ChildProcess {
  const proc = Object.assign(new EventEmitter(), {
    pid: 12345,
    kill: () => {
      process.stderr.write('shutdown\n')
      return true
    },
  })
  return proc as unknown as ChildProcess
}

const mode = process.env.QUINT_VERIFY_EXIT_MODE
const apalache = fakeApalache()
stopWithQuint(apalache, false, 0)

if (mode === 'uncaught') {
  // No .catch: only the uncaughtException listener can report this and exit.
  Promise.reject(new Error(FORCED_REPORTING_FAILURE))
} else if (mode === 'cli') {
  const nodeRequire = createRequire(join(__dirname, 'verifyExitOnError.ts'))
  const cliCommands = nodeRequire('../../src/cliCommands')
  cliCommands.verifySpec = async () => {
    throw new Error(FORCED_REPORTING_FAILURE)
  }
  const spec = join(__dirname, '../../testFixture/apalache/violateOnFive.qnt')
  process.argv = [process.argv[0], process.argv[1], 'verify', spec, '--verbosity=0']
  nodeRequire('../../src/cli')
} else {
  process.stderr.write(`unknown QUINT_VERIFY_EXIT_MODE ${mode}\n`)
  process.exit(2)
}
