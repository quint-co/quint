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
import { reviver } from '../jsonHelper'
import { bigintCheckerReplacer } from './helpers'
import { ofItfValue } from '../itf'
import { RuntimeValue, rv } from '../runtime/impl/runtimeValue'
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
  | { response: 'FatalError'; message: string }

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
  private fatalError: string | null = null
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
        const response: ReplResponse = JSONbig.parse(line, reviver)

        if (response.response === 'FatalError') {
          // Store the fatal error and shut down
          this.fatalError = response.message
          console.error(`Fatal error from Rust evaluator: ${response.message}`)

          // Resolve any pending response with the error
          if (this.pendingResponse) {
            this.pendingResponse(response)
            this.pendingResponse = null
          }

          // Shut down the process
          this.shutdown()
          return
        }

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
    // Check if we've encountered a fatal error
    if (this.fatalError !== null) {
      return {
        response: 'FatalError',
        message: this.fatalError,
      }
    }

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
        commandJson = JSONbig.stringify(command, bigintCheckerReplacer)
      } catch (error) {
        this.pendingResponse = null
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
  async evaluate(expr: QuintEx): Promise<Either<QuintError, QuintEx>> {
    await this.initializationPromise

    let response: ReplResponse
    try {
      response = await this.sendCommand({ cmd: 'Evaluate', expr })
    } catch (error) {
      // Handle QuintError thrown by bigintCheckerReplacer
      if (isQuintError(error)) {
        return left(error)
      }
      throw error
    }

    if (response.response === 'FatalError') {
      return left({ code: 'QNT000', message: response.message, reference: undefined })
    } else if (response.response === 'EvaluationResult') {
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

  async updateTable(table: LookupTable): Promise<void> {
    await this.initializationPromise
    await this.sendCommand({ cmd: 'UpdateTable', table })
  }

  async replShift(): Promise<[boolean, string[], RuntimeValue | undefined, RuntimeValue | undefined]> {
    await this.initializationPromise
    const response = await this.sendCommand({ cmd: 'ReplShift' })

    if (response.response === 'FatalError') {
      throw new Error(`Fatal error: ${response.message}`)
    }

    if (response.response === 'ReplShiftResult') {
      if (response.shifted) {
        // Invalidate the cache when a shift happens
        // Traces will be fetched lazily when getTrace() is called
        this.traceCache = undefined

        const old_state = rv.fromQuintEx(ofItfValue(response.old_state, zerog.nextId))
        const new_state = rv.fromQuintEx(ofItfValue(response.new_state, zerog.nextId))

        return [response.shifted, response.missing_vars, old_state, new_state]
      }

      return [response.shifted, response.missing_vars, undefined, undefined]
    }

    throw new Error('Failed to perform REPL shift')
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

    if (statesResponse.response === 'FatalError') {
      throw new Error(`Fatal error: ${statesResponse.message}`)
    }

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
