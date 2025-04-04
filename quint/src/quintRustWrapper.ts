/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A wrapper around the Rust simulator for Quint.
 *
 * @author Gabriela Moreira
 *
 * @module
 */
import { QuintEx, QuintModule } from './ir/quintIr'
import { Outcome } from './simulation'
import { debugLog } from './verbosity'
import JSONbig from 'json-bigint'
import path from 'path'
import os from 'os'
import { LookupTable } from './names/base'
import { replacer } from './jsonHelper'
import { ofItf } from './itf'
const spawn = require('cross-spawn')

/**
 * Get the configuration directory for Quint.
 * @returns {string} The path to the Quint configuration directory.
 */
function quintConfigDir(): string {
  return path.join(os.homedir(), '.quint')
}

export type ParsedQuint = {
  modules: QuintModule[]
  table: LookupTable
  main: string
  init: QuintEx
  step: QuintEx
  invariant: QuintEx
}

export class QuintRustWrapper {
  private verbosityLevel: number

  /**
   * Constructor for QuintRustWrapper.
   * @param {number} verbosityLevel - The level of verbosity for logging.
   */
  constructor(verbosityLevel: number) {
    this.verbosityLevel = verbosityLevel
  }

  /**
   * Simulate the parsed Quint model using the Rust simulator
   *
   * @param {ParsedQuint} parsed - The parsed Quint model.
   * @param {string} source - The source code of the Quint model.
   * @param {QuintEx[]} witnesses - The witnesses for the simulation.
   * @param {number} nruns - The number of runs for the simulation.
   * @param {number} nsteps - The number of steps per run.
   * @param {number} ntraces - The number of traces to store.
   *
   * @returns {Outcome} The outcome of the simulation.
   * @throws Will throw an error if the Rust simulator fails to launch or returns an error.
   */
  simulate(
    parsed: ParsedQuint,
    source: string,
    witnesses: QuintEx[],
    nruns: number,
    nsteps: number,
    ntraces: number
  ): Outcome {
    // TODO: Download executable from GitHub if it doesn't exist
    const exe = path.join(quintConfigDir(), 'quint_simulator')
    const args = ['simulate-from-stdin']
    const input = JSONbig.stringify(
      {
        parsed: parsed,
        source: source,
        witnesses: witnesses,
        nruns: nruns,
        nsteps: nsteps,
        ntraces: ntraces,
      },
      replacer
    )

    debugLog(this.verbosityLevel, 'Starting Rust simulator synchronously')
    const result = spawn.sync(exe, args, {
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

      // Convert traces to ITF
      parsed.bestTraces = parsed.bestTraces.map((trace: any) => ({ ...trace, states: ofItf(trace.states) }))

      return parsed
    } catch (error) {
      throw new Error(`Failed to parse data from Rust simulator: ${JSONbig.stringify(error)}`)
    }
  }
}
