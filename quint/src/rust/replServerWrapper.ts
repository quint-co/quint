/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Wrapper for the Rust REPL evaluator server.
 * Spawns a long-lived Rust subprocess and communicates via line-delimited JSON.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { QuintEx } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { QuintError, isQuintError } from '../quintError'
import { Rng } from '../rng'
import { TraceRecorder } from '../runtime/trace'
import { Trace } from '../runtime/impl/trace'
import { ChildProcess, spawn } from 'child_process'
import readline from 'readline'
import JSONbig from 'json-bigint'
import { replacer } from './helpers'
import { ofItfValue } from '../itf'
import { rv } from '../runtime/impl/runtimeValue'
import { zerog } from '../idGenerator'
import { getRustEvaluatorPath } from './binaryManager'

/**
 * Commands sent to the Rust REPL evaluator
 */
type ReplCommand =
  | { cmd: 'Initialize'; table: LookupTable; seed?: bigint; verbosity?: number }
  | { cmd: 'UpdateTable'; table: LookupTable }
  | { cmd: 'Evaluate'; expr: QuintEx }
  | { cmd: 'ReplShift' }
  | { cmd: 'GetTraceStates' }
  | { cmd: 'Reset' }

/**
 * Responses received from the Rust REPL evaluator
 */
type ReplResponse =
  | { response: 'Initialized'; success: boolean }
  | { response: 'TableUpdated'; success: boolean }
  | { response: 'EvaluationResult'; ok?: any; err?: QuintError }
  | {
      response: 'ReplShiftResult'
      shifted: boolean
      missing_vars: string[]
      old_state?: any
      new_state?: any
    }
  | { response: 'TraceStates'; states: any[] }
  | { response: 'ResetComplete' }
  | { response: 'Error'; message: string }

/**
 * Wrapper for the long-lived Rust REPL evaluator server.
 * Maintains a subprocess and communicates via JSON.
 *
 * Communication is synchronous: send a command, wait for response, process it.
 * The only async aspect is that the main process can handle Ctrl+C while waiting.
 */
export class ReplServerWrapper {
  private process: ChildProcess | null = null
  private stdout: readline.Interface | null = null
  private pendingResponse: ((response: ReplResponse) => void) | null = null
  private processExited: boolean = false
  public recorder: TraceRecorder
  private verbosityLevel: number
  private traceCache?: Trace

  private initializationPromise: Promise<void>

  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng) {
    this.recorder = recorder
    this.verbosityLevel = recorder.verbosityLevel
    this.initializationPromise = this.initialize(table, rng.getState())
  }

  /**
   * Initialize the Rust evaluator process and wait for it to be ready
   */
  private async initialize(table: LookupTable, seed: bigint): Promise<void> {
    // Get the path to the Rust evaluator (async, may download)
    const evaluatorPath = await getRustEvaluatorPath()

    // Spawn the Rust process
    this.process = spawn(evaluatorPath, ['repl-from-stdin'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    // Handle process errors
    this.process.on('error', (err: Error) => {
      throw new Error(`Failed to spawn Rust REPL evaluator: ${err.message}`)
    })

    // Handle process exit
    this.process.on('close', code => {
      this.processExited = true
      if (this.pendingResponse) {
        this.pendingResponse({
          response: 'Error',
          message: `Rust REPL evaluator exited with code ${code}`,
        })
        this.pendingResponse = null
      }
      if (code !== 0 && code !== null) {
        console.error(`Rust REPL evaluator exited with code ${code}`)
      }
    })

    // Set up stdout reader for line-delimited JSON
    this.stdout = readline.createInterface({
      input: this.process.stdout!,
      terminal: false,
    })

    this.stdout.on('line', (line: string) => {
      // Check if this is debug output (starts with '>')
      if (line.startsWith('>')) {
        // Print debug output directly to stdout
        console.log(line)
        return
      }

      try {
        const response: ReplResponse = JSONbig.parse(line)

        if (this.pendingResponse) {
          this.pendingResponse(response)
          this.pendingResponse = null
        }
      } catch (err) {
        console.error('Failed to parse response from Rust evaluator:', err)
      }
    })

    // Send initialization command and WAIT for response
    await this.sendCommand({ cmd: 'Initialize', table, seed, verbosity: this.verbosityLevel })
  }

  /**
   * Send a command to the Rust evaluator and wait for response
   */
  private async sendCommand(command: ReplCommand): Promise<ReplResponse> {
    if (!this.process || !this.process.stdin || this.processExited) {
      throw new Error('Rust REPL evaluator process not initialized or has exited')
    }

    // CRITICAL: Check if we already have a pending response
    // This should NEVER happen - it means multiple requests are in-flight
    if (this.pendingResponse !== null) {
      console.error('Internal error on managing the rust evaluator. Please report a bug.')
      console.error('Trying to send command:', command.cmd)
    }

    return new Promise<ReplResponse>((resolve, reject) => {
      // Store the response handler
      this.pendingResponse = resolve

      // Serialize command with BigInt validation
      let commandJson: string
      try {
        commandJson = JSONbig.stringify(command, replacer)
      } catch (error) {
        this.pendingResponse = null
        // If replacer throws a QuintError for out-of-bounds integers, reject with it
        if (isQuintError(error)) {
          reject(error)
          return
        }
        reject(error)
        return
      }

      // Write command to stdin
      this.process!.stdin!.write(commandJson + '\n', err => {
        if (err) {
          this.pendingResponse = null
          reject(new Error(`Failed to send command: ${err.message}`))
        }
      })
    })
  }

  /**
   * Async version of evaluate (what we actually implement)
   */
  async evaluateAsync(expr: QuintEx): Promise<Either<QuintError, QuintEx>> {
    await this.initializationPromise
    const response = await this.sendCommand({ cmd: 'Evaluate', expr })

    if (response.response === 'EvaluationResult') {
      if (response.ok !== undefined) {
        return right(ofItfValue(response.ok, zerog.nextId))
      } else if (response.err !== undefined) {
        return left(response.err)
      }
    } else if (response.response === 'Error') {
      return left({ code: 'QNT000', message: response.message, reference: undefined })
    }

    return left({ code: 'QNT000', message: 'Unexpected response from evaluator', reference: undefined })
  }

  /**
   * Update the lookup table with new definitions
   */
  updateTable(table: LookupTable): void {
    // Fire and forget - async operation but sync interface
    this.updateTableAsync(table).catch(err => {
      console.error('Failed to update table:', err)
    })
  }

  async updateTableAsync(table: LookupTable): Promise<void> {
    await this.initializationPromise
    await this.sendCommand({ cmd: 'UpdateTable', table })
  }

  async replShiftAsync(): Promise<[boolean, string[], any, any]> {
    await this.initializationPromise
    const response = await this.sendCommand({ cmd: 'ReplShift' })

    if (response.response === 'ReplShiftResult') {
      // Invalidate the cache when a shift happens
      // Traces will be fetched lazily when getTrace() is called
      if (response.shifted) {
        this.traceCache = undefined
      }

      return [response.shifted, response.missing_vars, response.old_state, response.new_state]
    }

    return [false, [], undefined, undefined]
  }

  /**
   * Get the trace for rendering.
   * Returns cached trace states or fetches it from the Rust server.
   */
  async getTrace(): Promise<Trace> {
    if (this.traceCache !== undefined) {
      return this.traceCache
    }

    await this.initializationPromise
    const statesResponse = await this.sendCommand({ cmd: 'GetTraceStates' })

    if (statesResponse.response === 'TraceStates') {
      const states = statesResponse.states.map(itfValue => {
        const ex = ofItfValue(itfValue, zerog.nextId)
        return rv.fromQuintEx(ex)
      })

      this.traceCache = new Trace()
      this.traceCache.reset(states)
      return this.traceCache
    }

    throw new Error('Failed to get trace states from evaluator')
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInitialization(): Promise<void> {
    await this.initializationPromise
  }

  /**
   * Shutdown the Rust evaluator process
   */
  async shutdown(): Promise<void> {
    if (this.process) {
      this.process.stdin?.end()
      this.process.kill()
      this.process = null
    }
  }
}
