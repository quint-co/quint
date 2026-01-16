/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Quint wrapper for model checkers (Apalache)
 *
 * @author Yassine Boukhari, 2025
 *
 * @module
 */

import chalk from 'chalk'
import { ApalacheResult, ServerEndpoint, connect, createConfig } from './apalache'
import { CLIProcedure, CompiledStage, TracingStage } from './cliCommands'
import { outputJson, printInductiveInvariantProgress, processApalacheResult } from './cliReporting'
import { PLACEHOLDERS, getInvariants, loadApalacheConfig } from './cliHelpers'

// --------------------------------------------------------------------------------
// Apalache
// --------------------------------------------------------------------------------

async function verifyWithApalache(
  serverEndpoint: ServerEndpoint,
  apalacheVersion: string,
  config: any,
  verbosityLevel: number
): Promise<ApalacheResult<void>> {
  const connectionResult = await connect(serverEndpoint, apalacheVersion, verbosityLevel)
  return connectionResult.asyncChain(conn => conn.check(config))
}

export async function verifyWithApalacheBackend(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number
): Promise<CLIProcedure<TracingStage>> {
  const args = prev.args

  const itfFile: string | undefined = prev.args.outItf
  if (itfFile) {
    if (itfFile.includes(PLACEHOLDERS.test) || itfFile.includes(PLACEHOLDERS.seq)) {
      console.log(
        `${chalk.yellow('[warning]')} the output file contains ${chalk.grey(PLACEHOLDERS.test)} or ${chalk.grey(
          PLACEHOLDERS.seq
        )}, but this has no effect since at most a single trace will be produced.`
      )
    }
  }

  const loadedConfig = loadApalacheConfig(prev, args.apalacheConfig)

  const verifyingFlat = { ...prev, modules: [prev.mainModule] }
  const parsedSpec = outputJson(verifyingFlat)

  const [invariantsString, invariantsList] = getInvariants(prev.args)

  if (args.inductiveInvariant) {
    const hasOrdinaryInvariant = invariantsList.length > 0
    const nPhases = hasOrdinaryInvariant ? 3 : 2
    const initConfig = createConfig(loadedConfig, parsedSpec, { ...args, maxSteps: 0 }, ['q::inductiveInv'])

    // Checking whether the inductive invariant holds in the initial state(s)
    printInductiveInvariantProgress(verbosityLevel, args, 1, nPhases)

    const startMs = Date.now()
    return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, initConfig, verbosityLevel).then(res => {
      if (res.isLeft()) {
        return processApalacheResult(res, startMs, verbosityLevel, verifying, [args.inductiveInvariant])
      }

      // Checking whether the inductive invariant is preserved by the step
      printInductiveInvariantProgress(verbosityLevel, args, 2, nPhases)

      const stepConfig = createConfig(
        loadedConfig,
        parsedSpec,
        { ...args, maxSteps: 1 },
        ['q::inductiveInv'],
        'q::inductiveInv'
      )

      return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, stepConfig, verbosityLevel).then(res => {
        if (res.isLeft() || !hasOrdinaryInvariant) {
          return processApalacheResult(res, startMs, verbosityLevel, verifying, [args.inductiveInvariant])
        }

        // Checking whether the inductive invariant implies the ordinary invariant
        printInductiveInvariantProgress(verbosityLevel, args, 3, nPhases, invariantsString)

        const propConfig = createConfig(
          loadedConfig,
          parsedSpec,
          { ...args, maxSteps: 0 },
          ['q::inv'],
          'q::inductiveInv'
        )

        return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, propConfig, verbosityLevel).then(res => {
          return processApalacheResult(res, startMs, verbosityLevel, verifying, invariantsList)
        })
      })
    })
  }

  // We need to insert the data from CLI args into their appropriate locations
  // in the Apalache config
  const config = createConfig(loadedConfig, parsedSpec, args, invariantsList.length > 0 ? ['q::inv'] : [])
  const startMs = Date.now()

  return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, config, verbosityLevel).then(res => {
    return processApalacheResult(res, startMs, verbosityLevel, verifying, invariantsList)
  })
}
