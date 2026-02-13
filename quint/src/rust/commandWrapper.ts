/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Wrapper for running one-shot commands using the Rust evaluator.
 * Handles both simulation (quint run) and testing (quint test).
 *
 * @author Gabriela Moreira
 *
 * @module
 */
import { QuintApp, QuintEx, QuintModule, QuintStr } from '../ir/quintIr'
import { Outcome } from '../simulation'
import { TraceHook } from '../cliReporting'
import { debugLog } from '../verbosity'
import JSONbig from 'json-bigint'
import { LookupDefinition, LookupTable } from '../names/base'
import { reviver } from '../jsonHelper'
import { diagnosticsOfItf, ofItf } from '../itf'
import { Presets, SingleBar } from 'cli-progress'
import readline from 'readline'
import { spawn } from 'child_process'
import { QuintError, isQuintError } from '../quintError'
import { TestResult } from '../runtime/testing'
import { List } from 'immutable'
import { nameWithNamespaces } from '../runtime/impl/builder'
import { Either, left, right } from '@sweet-monads/either'
import { getRustEvaluatorPath } from './binaryManager'
import { bigintCheckerReplacer } from './helpers'

export type ParsedQuint = {
  modules: QuintModule[]
  table: LookupTable
  main: string
  init: QuintEx
  step: QuintEx
  invariants: QuintEx[]
  witnesses: QuintEx[]
}

export class CommandWrapper {
  private verbosityLevel: number

  /**
   * Constructor for CommandWrapper.
   * @param {number} verbosityLevel - The level of verbosity for logging.
   */
  constructor(verbosityLevel: number) {
    this.verbosityLevel = verbosityLevel
  }

  /**
   * Simulate the parsed Quint model using the Rust evaluator
   *
   * @param {ParsedQuint} parsed - The parsed Quint model.
   * @param {string} source - The source code of the Quint model.
   * @param {QuintEx[]} witnesses - The witnesses for the simulation.
   * @param {number} nruns - The number of runs for the simulation.
   * @param {number} nsteps - The number of steps per run.
   * @param {number} ntraces - The number of traces to store.
   * @param {number} nthreads - The number of threads to use.
   * @param {bigint} [seed] - Optional seed for reproducibility.
   * @param {boolean} [mbt] - Whether to produce metadata for model-based testing.
   * @param {TraceHook} onTrace - A callback function to be called with trace information for each simulation run.
   *
   * @returns {Outcome} The outcome of the simulation.
   * @throws Will throw an error if the Rust evaluator fails to launch or returns an error.
   */
  async simulate(
    parsed: ParsedQuint,
    source: string,
    nruns: number,
    nsteps: number,
    ntraces: number,
    nthreads: number,
    seed?: bigint,
    mbt?: boolean,
    onTrace?: TraceHook
  ): Promise<Outcome> {
    const input = {
      parsed: parsed,
      source: source,
      nruns: nruns,
      nsteps: nsteps,
      ntraces: ntraces,
      nthreads: nthreads,
      seed: seed,
      mbt: mbt ?? false,
      verbosity: this.verbosityLevel,
    }

    const result = await this.runRustEvaluator(
      'simulate-from-stdin',
      input,
      'Running... [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples | {speed} samples/s',
      nruns
    )

    // Handle errors from rust processes failing, where we don't manage to get output from rust
    if (result.isLeft()) {
      const error = result.value
      return {
        status: 'error',
        errors: [error],
        bestTraces: [],
        witnessingTraces: [],
        samples: 0,
        traceStatistics: { averageTraceLength: 0, minTraceLength: 0, maxTraceLength: 0 },
        violatedInvariants: [],
      }
    }

    const output = result.value

    try {
      const parsed: Outcome = JSONbig.parse(output, reviver)

      // Convert traces to ITF and ensure seed is bigint Note: When a
      // SimulationError occurs in Rust, the error trace is included in
      // bestTraces with result=false
      parsed.bestTraces = parsed.bestTraces.map((trace: any) => ({
        ...trace,
        seed: BigInt(trace.seed),
        states: ofItf(trace.states),
        diagnostics: diagnosticsOfItf(trace.states),
      }))

      // Call onTrace callback for each trace
      if (onTrace && parsed.bestTraces.length > 0 && parsed.bestTraces[0].states.length > 0) {
        const firstState = parsed.bestTraces[0].states[0] as QuintApp
        const vars: string[] = []
        for (let i = 0; i < firstState.args.length; i += 2) {
          vars.push((firstState.args[i] as QuintStr).value)
        }

        parsed.bestTraces.forEach((trace: any, index: number) => {
          const status = trace.result ? 'ok' : 'violation'
          onTrace(index, status, vars, trace.states)
        })
      }

      return parsed
    } catch (error) {
      throw new Error(`Failed to parse data from Rust evaluator: ${error} ${JSONbig.stringify(error)}`)
    }
  }

  /**
   * Execute a single test using the Rust evaluator
   *
   * @param {LookupDefinition} testDef - The test definition to execute
   * @param {LookupTable} table - The lookup table for name resolution
   * @param {bigint} [seed] - Optional random seed for reproducibility.
   * @param {number} maxSamples - The maximum number of samples to run
   * @param {number} index - The index of the test in the run order
   * @param {TraceHook} onTrace - A callback function to be called with trace information for ITF output
   *
   * @returns {TestResult} The result of the test execution
   * @throws Will throw an error if the Rust evaluator fails to launch or returns an error
   */
  async test(
    testDef: LookupDefinition,
    table: LookupTable,
    seed: bigint | undefined,
    maxSamples: number,
    index: number,
    onTrace?: TraceHook
  ): Promise<TestResult> {
    const testName = nameWithNamespaces(testDef.name, List(testDef.namespaces ?? []))
    const input = {
      name: testName,
      test_def: testDef,
      table: table,
      seed: seed,
      max_samples: maxSamples,
      verbosity: this.verbosityLevel,
    }

    const result = await this.runRustEvaluator(
      'test-from-stdin',
      input,
      `     ${testName} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples | {speed} samples/s`,
      maxSamples
    )

    // Handle process errors
    if (result.isLeft()) {
      const error = result.value
      return {
        name: testName,
        status: 'failed',
        seed: seed ?? 0n,
        errors: [error],
        frames: [],
        nsamples: 0,
      }
    }

    const output = result.value

    try {
      const parsed: TestResult = JSONbig.parse(output, reviver)

      // Convert seed to bigint
      parsed.seed = BigInt(parsed.seed)

      // Convert traces from ITF format
      if (parsed.traces && parsed.traces.length > 0) {
        parsed.traces = parsed.traces.map((trace: any) => ({
          ...trace,
          states: ofItf(trace.states),
          diagnostics: diagnosticsOfItf(trace.states),
        }))

        // Call onTrace callback for each trace
        if (onTrace) {
          const firstState = parsed.traces[0].states[0] as QuintApp
          const vars: string[] = []
          for (let i = 0; i < firstState.args.length; i += 2) {
            vars.push((firstState.args[i] as QuintStr).value)
          }

          parsed.traces.forEach((trace: any) => {
            const status = trace.result ? 'ok' : 'violation'
            onTrace(index, status, vars, trace.states, testName)
          })
        }
      }

      return parsed as TestResult
    } catch (error) {
      throw new Error(`Failed to parse test result from Rust evaluator: ${JSONbig.stringify(error)}`)
    }
  }

  /**
   * Evaluate expressions at a given state using the Rust evaluator.
   *
   * @param {LookupTable} table - The lookup table for name resolution.
   * @param {QuintEx} state - The state (as a record expression) to evaluate in.
   * @param {QuintEx[]} exprs - The expressions to evaluate at the given state.
   *
   * @returns The evaluation results for each expression.
   */
  async evaluateAtState(
    table: LookupTable,
    state: QuintEx,
    exprs: QuintEx[]
  ): Promise<{ results: { value?: any; error?: QuintError }[] }> {
    const input = { table, state, exprs }
    const result = await this.runRustEvaluatorSimple('evaluate-at-state-from-stdin', input)

    if (result.isLeft()) {
      throw new Error(`Rust evaluator failed: ${result.value.message}`)
    }

    return JSONbig.parse(result.value, reviver)
  }

  /**
   * Run the Rust evaluator with the given command and input.
   * Simplified version without progress bar, for quick one-shot evaluations.
   */
  private async runRustEvaluatorSimple(command: string, input: any): Promise<Either<QuintError, string>> {
    const exe = await getRustEvaluatorPath()
    const args = [command]

    let inputStr: string
    try {
      inputStr = JSONbig.stringify(input, bigintCheckerReplacer)
    } catch (error) {
      if (isQuintError(error)) {
        return left(error)
      }
      throw error
    }

    debugLog(this.verbosityLevel, `Starting Rust evaluator with command: ${command}`)

    const process = spawn(exe, args, {
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    process.stdin.write(inputStr)
    process.stdin.end()

    process.on('error', (err: Error) => {
      throw new Error(`Failed to launch Rust evaluator: ${err.message}`)
    })

    const stdout = readline.createInterface({ input: process.stdout, terminal: false })

    let output = ''
    stdout.on('line', (line: string) => {
      if (line.trimStart()[0] !== '{') {
        console.log(line)
      } else {
        output = line
      }
    })

    const [exitCode, signal] = await new Promise<[number | null, string | null]>(resolve => {
      process.on('close', (code, signal) => resolve([code, signal]))
    })

    if (signal) {
      return left({ code: 'QNT517', message: `Rust evaluator was killed by signal: ${signal}` })
    } else if (exitCode !== 0) {
      return left({ code: 'QNT516', message: `Rust evaluator exited with code ${exitCode}` })
    }

    return right(output)
  }

  /**
   * Run the Rust evaluator with the given command and input.
   * Shared implementation for all one-shot commands.
   */
  private async runRustEvaluator(
    command: string,
    input: any,
    progressFormat: string,
    iterations: number
  ): Promise<Either<QuintError, string>> {
    const exe = await getRustEvaluatorPath()
    const args = [command]

    // Serialize input with BigInt validation
    let inputStr: string
    try {
      inputStr = JSONbig.stringify(input, bigintCheckerReplacer)
    } catch (error) {
      // If replacer throws a QuintError for out-of-bounds integers, return it
      if (isQuintError(error)) {
        return left(error)
      }
      throw error
    }

    debugLog(this.verbosityLevel, `Starting Rust evaluator with command: ${command}`)

    // Create progress bar
    const progressBar = new SingleBar(
      {
        clearOnComplete: true,
        forceRedraw: true,
        format: progressFormat,
      },
      Presets.rect
    )
    progressBar.start(iterations, 0, { speed: '0' })

    const startTime = Date.now()

    // Spawn the Rust evaluator in subprocess
    const process = spawn(exe, args, {
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Write the input to stdin
    process.stdin.write(inputStr)
    process.stdin.end()

    // Handle error on launch
    process.on('error', (err: Error) => {
      throw new Error(`Failed to launch Rust evaluator: ${err.message}`)
    })

    // Collect output from stdout
    const stdout = readline.createInterface({
      input: process.stdout,
      terminal: false,
    })

    let output = ''
    stdout.on('line', (line: string) => {
      if (line.trimStart()[0] !== '{') {
        console.log(line)
      } else {
        output = line
      }
    })

    // Convert stderr to a readable stream that emits its output line by line
    const stderr = readline.createInterface({
      input: process.stderr,
      terminal: false,
    })

    // Handle progress updates from stderr
    stderr.on('line', (line: string) => {
      try {
        const progress = JSON.parse(line)

        if (progress.type === 'progress') {
          const elapsedSeconds = (Date.now() - startTime) / 1000
          const speed = Math.round(progress.current / elapsedSeconds)
          progressBar.update(progress.current, { speed })
        }
      } catch (_) {
        progressBar.stop()
      }
    })

    // Wait for process completion
    const [exitCode, signal] = await new Promise<[number | null, string | null]>(resolve => {
      process.on('close', (code, signal) => resolve([code, signal]))
    })

    progressBar.stop()

    if (signal === 'SIGKILL') {
      return left({
        code: 'QNT517',
        message:
          `Rust evaluator was killed by SIGKILL. This is often caused by:\n` +
          `  - Out of memory (OOM killer)\n` +
          `  - Container/cgroup memory limits\n` +
          `  - Manual kill -9\n` +
          `Check 'dmesg | grep -i kill' for OOM messages.`,
      })
    } else if (signal) {
      return left({
        code: 'QNT517',
        message: `Rust evaluator was killed by signal: ${signal}`,
      })
    } else if (exitCode !== 0) {
      return left({
        code: 'QNT516',
        message: `Rust evaluator exited with code ${exitCode}`,
      })
    }

    return right(output)
  }
}
