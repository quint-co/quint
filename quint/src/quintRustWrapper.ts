import child_process, { StdioOptions } from 'child_process'
import { QuintEx, QuintModule } from './ir/quintIr'
import { Outcome } from './simulation'
import { debugLog, verbosity } from './verbosity'
import { right } from '@sweet-monads/either'
import JSONbig from 'json-bigint'
import path from 'path'
import os from 'os'
import { LookupTable } from './names/base'
import { replacer } from './jsonHelper'
import { ItfTrace, ofItf } from './itf'

function quintConfigDir(): string {
  return path.join(os.homedir(), '.quint')
}

export type ParsedQuint = {
  modules: QuintModule[]
  table: LookupTable
  main: string
}

export class QuintRustWrapper {
  private verbosityLevel: number

  constructor(verbosityLevel: number) {
    this.verbosityLevel = verbosityLevel
  }
  simulate(
    parsed: ParsedQuint,
    source: string,
    init: QuintEx,
    step: QuintEx,
    inv: QuintEx,
    witnesses: QuintEx[],
    nruns: number,
    nsteps: number,
    ntraces: number
  ): Outcome {
    const exe = path.join(quintConfigDir(), 'quint_simulator')
    const args = ['simulate-quint']
    const input = JSONbig.stringify(
      {
        parsed: parsed,
        source: source,
        init: init,
        step: step,
        inv: inv,
        witnesses: witnesses,
        nruns: nruns,
        nsteps: nsteps,
        ntraces: ntraces,
      },
      replacer
    )

    debugLog(this.verbosityLevel, 'Starting Rust simulator synchronously')
    const result = child_process.spawnSync(exe, args, {
      shell: false,
      input: input,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', process.stderr], // stdin, stdout, stderr
    })

    if (result.error) {
      throw new Error(`Failed to launch Rust simulator: ${result.error.message}`)
    }

    if (result.status !== 0) {
      throw new Error(`Rust simulator exited with code ${result.status}`)
    }

    if (!result.stdout) {
      throw new Error('No output received from Rust simulator')
    }

    debugLog(this.verbosityLevel, `Received data from Rust simulator: ${result.stdout}`)

    try {
      const parsed = JSONbig.parse(result.stdout)
      if (parsed.error) {
        throw new Error(parsed.error)
      }
      parsed.bestTraces = parsed.bestTraces.map((trace: any) => ({ ...trace, states: ofItf(trace.states) }))
      return parsed
    } catch (error) {
      throw new Error(`Failed to parse data from Rust simulator: ${JSONbig.stringify(error)}`)
    }
  }
}
