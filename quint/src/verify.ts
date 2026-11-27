/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Core verification functionality
 *
 * @author Yassine Boukhari, 2025
 *
 * @module
 */

import chalk from 'chalk'
import { QuintEx, QuintModule } from './ir/quintIr'
import { ApalacheResult, ServerEndpoint, connect, createConfig, fetchApalache } from './apalache'
import { TlcResult, loadTlcConfig, verify as runTlc } from './tlc'
import { compileToTlaplus } from './compileToTlaplus'
import { convertInit } from './ir/initToPredicate'
import { CLIProcedure, CompiledStage, TracingStage } from './cliCommands'
import {
  cliErr,
  elapsed,
  maybePrintObservationReachability,
  notObservedErr,
  outputJson,
  printInductiveInvariantProgress,
  processApalacheResult,
  processObservedResult,
  processTlcResult,
} from './cliReporting'
import {
  PLACEHOLDERS,
  declaredProperties,
  guessMainModule,
  loadApalacheConfig,
  mkErrorMessage,
  observationInvariantName,
  toExpr,
} from './cliHelpers'
import { verbosity } from './verbosity'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { ObservationRound, searchObservations } from './observationSearch'
import { findSatisfiedObservations, findViolatedInvariants } from './rust/invariantsReporter'
import { unreachable } from './util'
import { LookupTable } from './names/base'

// --------------------------------------------------------------------------------
// TLC
// --------------------------------------------------------------------------------

export async function verifyWithTlcBackend(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number
): Promise<CLIProcedure<TracingStage>> {
  const args = prev.args

  const removeRuns = (module: QuintModule): QuintModule => {
    return { ...module, declarations: module.declarations.filter(d => d.kind !== 'def' || d.qualifier !== 'run') }
  }
  const mainModule = convertInit(removeRuns(prev.mainModule), prev.table, prev.modes)
  if (mainModule.isLeft()) {
    return cliErr('Failed to convert init to predicate', {
      ...verifying,
      errors: mainModule.value.map(mkErrorMessage(prev.sourceMap)),
    })
  }

  const verifyingFlat = { ...prev, modules: [mainModule.value] }
  const parsedSpec = outputJson(verifyingFlat)

  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.green('[TLC]') + ' Compiling to TLA+ (via Apalache)...')
  }

  const tlaResult = await compileToTlaplus(args.serverEndpoint, args.apalacheVersion, parsedSpec, verbosityLevel)

  if (tlaResult.isLeft()) {
    return cliErr('error', { ...verifying, errors: tlaResult.value.errors })
  }

  const tlcRuntimeConfig = loadTlcConfig(args.tlcConfig)

  // Ensure the Apalache distribution is available locally (TLC needs the JAR)
  const distResult = await fetchApalache(args.apalacheVersion, verbosityLevel)
  if (distResult.isLeft()) {
    return cliErr('error', { ...verifying, errors: distResult.value.errors })
  }

  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.green('[TLC]') + ' Running TLC model checker...\n')
  }

  const startMs = Date.now()
  const tlcResult = await runTlc(
    {
      tlaCode: tlaResult.value,
      moduleName: prev.main!,
      invariants: firstPassInvariants(prev),
      hasTemporal: !!args.temporal,
    },
    args.apalacheVersion,
    tlcRuntimeConfig,
    verbosityLevel
  )

  const stopping = prev.stoppingObservations.map(i => prev.observations[i])
  const unreached = 'No reachable state satisfies'
  if (stopping.length > 0) {
    if (tlcResult.isRight()) {
      return notObservedErr(verbosityLevel, verifying, stopping, unreached, elapsed(startMs))
    }
    const round = tlcObservationRound(tlcResult, prev.stoppingObservations)
    if (round.kind === 'reached') {
      const observed = round.observations.map(i => prev.observations[i])
      return processObservedResult(undefined, observed, startMs, verbosityLevel, verifying)
    }
  }

  const result = processTlcResult(tlcResult, startMs, verbosityLevel, verifying)
  const tlaCode = tlaResult.value
  return searchObservationsOnceVerified(prev, verbosityLevel, result, '[TLC]', unreached, async remaining => {
    const config = {
      tlaCode,
      moduleName: prev.main!,
      invariants: remaining.map(observationInvariantName),
      hasTemporal: false,
    }
    return tlcObservationRound(await runTlc(config, args.apalacheVersion, tlcRuntimeConfig, verbosityLevel), remaining)
  })
}

/**
 * Interpret a TLC run that checked the invariants `observationInvariantName(i)` for
 * the indices in `remaining`.
 */
export function tlcObservationRound(res: TlcResult<void>, remaining: number[]): ObservationRound {
  if (res.isRight()) {
    return { kind: 'unreachable' }
  }
  const index = remaining.find(i => observationInvariantName(i) === res.value.violatedInvariant)
  if (!res.value.isViolation || index === undefined) {
    return { kind: 'error', message: res.value.explanation }
  }
  return { kind: 'reached', observations: [index] }
}

// --------------------------------------------------------------------------------
// Observations
// --------------------------------------------------------------------------------

/**
 * The invariants that a model checker's first run checks: `q::inv`, when there are
 * invariants, and `not(O)` for each `--observation` O, which stops the run like a
 * violated invariant.
 */
export function firstPassInvariants(prev: CompiledStage): string[] {
  return [...(prev.invariants.length > 0 ? ['q::inv'] : []), ...prev.stoppingObservations.map(observationInvariantName)]
}

/**
 * Search for the observations of `prev` once the first model checker run verified the spec, and report whether each
 * one is reached: a failed search fails `verify`, and an observation that is not reached gives a warning. Nothing is
 * searched for when the first run failed, or when it looked for `--observation` names. Without
 * `--search-observations`, `prev` has no observations, and a hint names the declared ones.
 *
 * @param backendTag the tag of the progress line, e.g. `[TLC]`
 * @param unreached what was not found, e.g. `No reachable state satisfies`, followed by the observations
 * @param runRound checks the invariants `not(O_i)` for the given indices `i`
 * @returns `verified`, with the observations that the search reached as `reached` when it ran
 */
export async function searchObservationsOnceVerified(
  prev: CompiledStage,
  verbosityLevel: number,
  verified: CLIProcedure<TracingStage>,
  backendTag: string,
  unreached: string,
  runRound: (remaining: number[]) => Promise<ObservationRound>
): Promise<CLIProcedure<TracingStage>> {
  if (verified.isLeft() || prev.stoppingObservations.length > 0) {
    return verified
  }
  if (prev.observations.length === 0) {
    const declared = declaredProperties(prev, guessMainModule(prev), 'observation')
    if (declared.length > 0 && verbosity.hasHints(verbosityLevel)) {
      console.log(chalk.gray(`Use --search-observations to search for the observations ${declared.join(', ')}.`))
    }
    return verified
  }
  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.green(backendTag) + ` Searching for observations: ${prev.observations.join(', ')}`)
  }

  const search = await searchObservations(prev.observations.length, runRound)
  if (search.isLeft()) {
    return cliErr(`observation search failed: ${search.value}`, { ...verified.value, errors: [] })
  }
  const unobserved = prev.observations.filter((_, i) => !search.value[i])
  if (unobserved.length > 0 && verbosity.hasResults(verbosityLevel)) {
    console.log(chalk.yellow('[warning]') + ` ${unreached} ${unobserved.map(o => chalk.yellow(o)).join(', ')}.`)
  }
  maybePrintObservationReachability(verbosityLevel, prev.observations, search.value)
  return right({ ...verified.value, reached: prev.observations.filter((_, i) => search.value[i]) })
}

// --------------------------------------------------------------------------------
// Apalache
// --------------------------------------------------------------------------------

/**
 * Verifies the configuration `config` by model checking it with the Apalache server
 *
 * @param serverEndpoint
 *   a server endpoint
 *
 * @param config
 *   an apalache configuration. See https://github.com/apalache-mc/apalache/blob/main/mod-infra/src/main/scala/at/forsyte/apalache/infra/passes/options.scala#L255
 *
 * @returns right(void) if verification succeeds, or left(err) explaining the failure
 */
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

  const invariantsList = prev.invariants
  const invariantsString = invariantsList.join(' and ')
  const stopping = prev.stoppingObservations.map(i => prev.observations[i])

  // Parse individual invariants into QuintEx for Rust-based violation reporting.
  let invariantExprs: QuintEx[] | undefined
  if (invariantsList.length > 0) {
    const parsed = mergeInMany(invariantsList.map(inv => toExpr(prev, inv)))
    if (parsed.isRight()) {
      invariantExprs = parsed.value
    }
  }

  if (args.inductiveInvariant) {
    if (stopping.length > 0 || args.searchObservations) {
      const flag = stopping.length > 0 ? '--observation' : '--search-observations'
      return cliErr(`${flag} cannot be combined with --inductive-invariant`, { ...verifying, errors: [] })
    }
    const hasOrdinaryInvariant = invariantsList.length > 0
    const nPhases = hasOrdinaryInvariant ? 3 : 2
    const initConfig = createConfig(loadedConfig, parsedSpec, { ...args, maxSteps: 0 }, ['q::inductiveInv'])

    // Checking whether the inductive invariant holds in the initial state(s)
    printInductiveInvariantProgress(verbosityLevel, args, 1, nPhases)

    const startMs = Date.now()
    return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, initConfig, verbosityLevel).then(async res => {
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

      return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, stepConfig, verbosityLevel).then(
        async res => {
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

          return verifyWithApalache(args.serverEndpoint, args.apalacheVersion, propConfig, verbosityLevel).then(
            async res => {
              return processApalacheResult(
                res,
                startMs,
                verbosityLevel,
                verifying,
                invariantsList,
                invariantExprs,
                prev.resolver.table
              )
            }
          )
        }
      )
    })
  }

  // We need to insert the data from CLI args into their appropriate locations
  // in the Apalache config
  const config = createConfig(loadedConfig, parsedSpec, args, firstPassInvariants(prev))
  const startMs = Date.now()

  const observationParsing = mergeInMany(prev.observations.map(o => toExpr(prev, o)))
  if (observationParsing.isLeft()) {
    return cliErr('Argument error', { ...verifying, errors: observationParsing.value.map(mkErrorMessage(new Map())) })
  }
  const observationExprs = observationParsing.value

  const res = await verifyWithApalache(args.serverEndpoint, args.apalacheVersion, config, verbosityLevel)
  const unreached = `No trace of up to ${args.maxSteps} steps reached`
  if (stopping.length > 0) {
    if (res.isRight()) {
      const result = notObservedErr(verbosityLevel, verifying, stopping, unreached, elapsed(startMs))
      if (verbosity.hasHints(verbosityLevel)) {
        console.log(chalk.gray('You may increase --max-steps.'))
      }
      return result
    }
    const stoppedBy = await apalacheStoppedBy(res, prev, observationExprs, invariantExprs, verbosityLevel)
    if (stoppedBy.isLeft()) {
      return cliErr(stoppedBy.value, { ...verifying, errors: [] })
    }
    if (stoppedBy.value.length > 0) {
      const observed = stoppedBy.value.map(i => prev.observations[i])
      return processObservedResult(res.value.traces?.[0], observed, startMs, verbosityLevel, verifying)
    }
  }

  const result = await processApalacheResult(
    res,
    startMs,
    verbosityLevel,
    verifying,
    invariantsList,
    invariantExprs,
    prev.resolver.table
  )
  return searchObservationsOnceVerified(prev, verbosityLevel, result, '[Apalache]', unreached, async remaining => {
    const observationConfig = createConfig(loadedConfig, parsedSpec, args, remaining.map(observationInvariantName))
    const res = await verifyWithApalache(args.serverEndpoint, args.apalacheVersion, observationConfig, verbosityLevel)
    return apalacheObservationRound(res, remaining, observationExprs, prev.resolver.table, verbosityLevel)
  })
}

/**
 * The stopping observations that an Apalache counterexample to `firstPassInvariants`
 * reaches, by index: none when the counterexample violates an invariant, which
 * takes precedence as in `quint run`.
 */
async function apalacheStoppedBy(
  res: ApalacheResult<void>,
  prev: CompiledStage,
  observationExprs: QuintEx[],
  invariantExprs: QuintEx[] | undefined,
  verbosityLevel: number
): Promise<Either<string, number[]>> {
  const states = res.isLeft() ? res.value.traces?.[0]?.states : undefined
  if (states === undefined || states.length === 0) {
    return right([])
  }
  if (invariantExprs !== undefined) {
    const violated = await findViolatedInvariants(
      states[states.length - 1],
      prev.resolver.table,
      invariantExprs,
      verbosityLevel
    )
    if (violated.isLeft()) {
      return left(violated.value.message)
    }
    if (violated.value.length > 0) {
      return right([])
    }
  }
  const round = await apalacheObservationRound(
    res,
    prev.stoppingObservations,
    observationExprs,
    prev.resolver.table,
    verbosityLevel
  )
  switch (round.kind) {
    case 'error':
      return left(round.message)
    case 'reached':
      return right(round.observations)
    case 'unreachable':
      return right([])
    default:
      return unreachable(round)
  }
}

/**
 * Interpret an Apalache run that checked the invariants `observationInvariantName(i)`
 * for the indices in `remaining`: a counterexample reaches every observation that
 * holds in one of its states.
 */
async function apalacheObservationRound(
  res: ApalacheResult<void>,
  remaining: number[],
  observationExprs: QuintEx[],
  table: LookupTable,
  verbosityLevel: number
): Promise<ObservationRound> {
  if (res.isRight()) {
    return { kind: 'unreachable' }
  }
  const states = res.value.traces?.[0]?.states
  if (states === undefined) {
    return { kind: 'error', message: res.value.explanation }
  }

  const reached = new Set<number>()
  const exprs = remaining.map(i => observationExprs[i])
  for (const state of states) {
    const satisfied = await findSatisfiedObservations(state, table, exprs, verbosityLevel)
    if (satisfied.isLeft()) {
      return { kind: 'error', message: satisfied.value.message }
    }
    satisfied.value.forEach(j => reached.add(remaining[j]))
  }
  return { kind: 'reached', observations: [...reached] }
}
