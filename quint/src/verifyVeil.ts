/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * The Veil backend of `quint verify`: its model checker, and its SMT backend for
 * inductive invariants, reported as the Apalache backend's results are; its invariant
 * synthesizer, its bounded symbolic checks, and the checks of proofs.
 *
 * @module
 */

import chalk from 'chalk'
import fs from 'fs'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { ApalacheError, ApalacheResult } from './apalache'
import { CLIProcedure, CompiledStage, InductionCheckSummary, TracingStage } from './cliCommands'
import { observationInvariantName, toExpr } from './cliHelpers'
import {
  cliErr,
  elapsed,
  notObservedErr,
  outputJson,
  printInductiveInvariantProgress,
  processApalacheResult,
  processObservedResult,
} from './cliReporting'
import { QuintModule } from './ir/quintIr'
import { QuintType } from './ir/quintTypes'
import { ObservationRound } from './observationSearch'
import { inlineAliasesInType } from './types/aliasInliner'
import { unreachable } from './util'
import { verbosity } from './verbosity'
import {
  VeilWorkspace,
  checkInduction,
  checkProofs,
  checkSymbolic,
  ensureVeil,
  check as runVeil,
  synthesize,
} from './veil'
import {
  InductionCheck,
  InductionOutcome,
  SymbolicAnswer,
  UpdrCertificate,
  VeilOutcome,
  VeilVariable,
  inductionOutcome,
  toItfTrace,
} from './veilItf'
import { KeysInvariant } from './veilKeys'
import { searchObservationsOnceVerified } from './verify'

/** Whether `quint verify` checks the proofs of `--proofs`, which `--inductive-invariant` takes the place of. */
export function checksProofs(args: { backend?: string; proofs?: string; inductiveInvariant?: string }): boolean {
  return args.backend === 'veil' && args.proofs !== undefined && !args.inductiveInvariant
}

/** The failure of a Veil check that found nothing, with `more` in its stage. */
const refuse = (msg: string, verifying: TracingStage, more: Partial<TracingStage> = {}): CLIProcedure<TracingStage> =>
  cliErr(msg, { ...verifying, errors: [], ...more })

/**
 * The invariants that a check of Veil's SMT backend states, given those that `--invariants` selects, for the checks
 * that add the keys invariants that `veilKeys.ts` infers: `--inductive-invariant`, `--synthesize-invariant` and
 * `--symbolic`. Undefined for any other check, which adds none.
 */
export function keysCheckedWith(
  args: { backend?: string; inductiveInvariant?: string; synthesizeInvariant?: string; symbolic?: boolean },
  invariants: string[]
): string[] | undefined {
  if (args.backend !== 'veil') {
    return undefined
  }
  if (args.inductiveInvariant) {
    return [args.inductiveInvariant]
  }
  if (args.synthesizeInvariant !== undefined) {
    return [args.synthesizeInvariant, ...invariants]
  }
  return args.symbolic ? invariants : undefined
}

/** What `--synthesize-invariant` found, as `--out` writes it. */
export interface SynthesisSummary {
  invariant: string
  outcome: 'invariant' | 'counterexample' | 'none'
  frame?: number
  /** The strengthening clauses, as `#updr` writes them. */
  clauses?: string[]
  /** Whether a theorem that Lean's kernel checked, on Lean's standard axioms, certifies the outcome. */
  certified: boolean
  theorem?: string
  axioms?: string[]
  /** Veil's report of a counterexample, or of why it found no invariant. */
  report?: string
}

/**
 * What `--symbolic` found of an invariant, as `--out` writes it: that it holds in every execution of up to
 * `--max-steps` steps, a counterexample of the fewest `steps`, in Veil's words, or the lengths of execution that
 * Veil gave no answer for, with what it said.
 */
export interface SymbolicSummary {
  invariant: string
  status: 'holds' | 'violated' | 'undecided'
  steps?: number
  trace?: string
  undecided?: { steps: number; answer: string }[]
}

/**
 * Verify with Veil. Its compiled model checker explores every reachable state, as TLC
 * does, rather than up to `--max-steps`: it checks invariants and `--observation`s with
 * `#model_check`, then temporal properties with `#temporal_check`, in the states where every
 * `--state-constraints` definition holds, and with `--search-observations` searches for the
 * observations as the other backends do. An inductive invariant is proved by Veil's SMT
 * backend instead (`verifyInductiveInvariant`), over every state, and so are the proofs of
 * `--proofs` checked (`verifyProofs`). Veil's `#updr` searches for an inductive invariant
 * (`verifySynthesis`), and its SMT solver checks the executions of up to `--max-steps` steps
 * (`verifySymbolic`), both for every value of the constants.
 */
export async function verifyWithVeilBackend(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number
): Promise<CLIProcedure<TracingStage>> {
  const args = prev.args
  const stateConstraints: string[] = args.stateConstraints ?? []
  const expressions = stateConstraints.filter(c => !isDefinitionName(c))
  if (expressions.length > 0) {
    return refuse(
      `the Veil backend takes a state constraint by the name of a definition, not ${expressions.join(', ')}`,
      verifying
    )
  }
  const refused = refusal(prev)
  if (refused !== undefined) {
    return refuse(refused, verifying)
  }
  const stopping = prev.stoppingObservations.map(i => prev.observations[i])
  const workspace = await ensureVeil(verbosityLevel)
  if (workspace.isLeft()) {
    return refuse(workspace.value, verifying)
  }
  if (args.inductiveInvariant) {
    return verifyInductiveInvariant(prev, verifying, verbosityLevel, workspace.value)
  }
  if (args.synthesizeInvariant !== undefined) {
    return verifySynthesis(prev, verifying, verbosityLevel, workspace.value)
  }
  if (args.symbolic) {
    return verifySymbolic(prev, verifying, verbosityLevel, workspace.value)
  }
  if (checksProofs(args)) {
    return verifyProofs(prev, verifying, verbosityLevel, workspace.value)
  }

  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(
      chalk.green('[Veil]') + " Running Veil's model checker, which is compiled at the first check of a spec..."
    )
  }
  const startMs = Date.now()
  // The invariants Veil states are exactly the ones the compiled spec lists, and the temporal
  // properties only those of a temporal check, which has a checker of its own.
  const runChecking = (invariants: string[]) => {
    const spec = outputJson({ ...prev, modules: [withoutTemporalProperties(prev.mainModule)], invariants })
    return runVeil(workspace.value, spec, prev.mainModule.name, 'invariants', stateConstraints, verbosityLevel)
  }
  const stated = veilInvariants(prev.invariants)
  const firstPass = [...stated, ...prev.stoppingObservations.map(observationInvariantName)]
  const safety = firstPass.length > 0 || !args.temporal ? await runChecking(firstPass) : undefined
  if (safety?.kind === 'ok' && verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.green('[Veil]') + ` Explored ${safety.exploredStates} states.`)
  }

  // An `--observation` reached before any invariant is violated ends the run as observed, as in `quint run`, and
  // the run fails when no reachable state reaches one.
  const unreached = 'No reachable state satisfies'
  if (stopping.length > 0 && safety !== undefined) {
    if (safety.kind === 'ok') {
      const notObserved = notObservedErr(verbosityLevel, verifying, stopping, unreached, elapsed(startMs))
      return withFindings(notObserved, { elapsedMs: Date.now() - startMs, exploredStates: safety.exploredStates })
    }
    const violatesInvariant = (violates: string[]) => violates.some(v => stated.map(shortName).includes(shortName(v)))
    if (safety.kind === 'violation' && !violatesInvariant(safety.violates)) {
      const round = veilObservationRound(safety, prev.stoppingObservations)
      if (round.kind === 'reached') {
        const itf = typedVariables(prev, safety.variables).chain(vars => toItfTrace(safety.states, vars))
        const observed = round.observations.map(i => prev.observations[i])
        const result = processObservedResult(
          itf.isRight() ? itf.value : undefined,
          observed,
          startMs,
          verbosityLevel,
          verifying
        )
        return withFindings(result, { elapsedMs: Date.now() - startMs })
      }
    }
  }

  const checkTemporal = async (): Promise<VeilOutcome> => {
    if (verbosity.hasProgress(verbosityLevel)) {
      console.log(chalk.green('[Veil]') + ` Checking temporal properties: ${args.temporal}`)
    }
    const spec = outputJson({ ...prev, modules: [prev.mainModule], invariants: [] })
    const temporal = await runVeil(
      workspace.value,
      spec,
      prev.mainModule.name,
      'temporal',
      stateConstraints,
      verbosityLevel
    )
    if (temporal.kind === 'ok' && verbosity.hasProgress(verbosityLevel)) {
      console.log(chalk.green('[Veil]') + ` Explored ${temporal.exploredStates} product states.`)
    }
    return temporal
  }
  const outcome = safety !== undefined && (safety.kind !== 'ok' || !args.temporal) ? safety : await checkTemporal()

  // A lasso violates a temporal property, which says nothing of the invariants at its last state.
  const invariantsList = outcome.kind === 'violation' && outcome.loop !== undefined ? [] : prev.invariants
  const invariantExprs =
    invariantsList.length > 1 ? mergeInMany(invariantsList.map(inv => toExpr(prev, inv))) : undefined
  const result = await processApalacheResult(
    veilResult(outcome, prev),
    startMs,
    verbosityLevel,
    verifying,
    invariantsList,
    invariantExprs?.isRight() ? invariantExprs.value : undefined,
    prev.resolver.table,
    false
  )
  const searched = await searchObservationsOnceVerified(
    prev,
    verbosityLevel,
    result,
    '[Veil]',
    unreached,
    async remaining => veilObservationRound(await runChecking(remaining.map(observationInvariantName)), remaining)
  )
  return withFindings(searched, {
    elapsedMs: Date.now() - startMs,
    exploredStates: safety?.kind === 'ok' ? safety.exploredStates : undefined,
    violated: outcome.kind === 'violation' ? violatedBy(outcome, stated, args.temporal) : undefined,
  })
}

/** Why the Veil backend refuses the arguments of `prev`, before Veil is set up, if it does. */
function refusal(prev: CompiledStage): string | undefined {
  const args = prev.args
  const given: [string, boolean][] = [
    ['--inductive-invariant', Boolean(args.inductiveInvariant)],
    ['--proofs', args.proofs !== undefined],
    ['--synthesize-invariant', args.synthesizeInvariant !== undefined],
    ['--symbolic', args.symbolic === true],
  ]
  if (args.inductiveInvariant && args.proofs !== undefined) {
    return '--proofs cannot be combined with --inductive-invariant'
  }
  for (const [flag] of given.slice(2).filter(([, on]) => on)) {
    const other = given.find(([f, on]) => on && f !== flag)
    if (other !== undefined) {
      return `${flag} cannot be combined with ${other[0]}`
    }
  }
  const instead = args.inductiveInvariant
    ? '--inductive-invariant'
    : checksProofs(args)
    ? '--proofs'
    : given.slice(2).find(([, on]) => on)?.[0]
  if (instead !== undefined && (prev.stoppingObservations.length > 0 || args.searchObservations)) {
    const flag = prev.stoppingObservations.length > 0 ? '--observation' : '--search-observations'
    return `${flag} cannot be combined with ${instead}`
  }
  if (args.temporal && (args.inductiveInvariant || args.synthesizeInvariant !== undefined || args.symbolic)) {
    return `--temporal cannot be combined with ${instead}`
  }
  if (args.trustSmt && !checksProofs(args)) {
    return '--trust-smt applies only to a check of --proofs'
  }
  if (args.synthesizeInvariant !== undefined) {
    if (!isDefinitionName(args.synthesizeInvariant)) {
      return `--synthesize-invariant takes the name of a definition, not ${args.synthesizeInvariant}`
    }
    const expressions = prev.invariants.filter(i => !isDefinitionName(i))
    if (expressions.length > 0) {
      return `--synthesize-invariant states the invariants of the check by name, not ${expressions.join(
        ', '
      )}: give them with --invariants`
    }
  }
  if (args.symbolic && prev.invariants.length === 0) {
    return '--symbolic checks invariants, and none is given with --invariant or --invariants, or declared by the main module'
  }
  return undefined
}

/** What a Veil check found, which `--out` writes beside its status. */
type VeilFindings = Pick<
  TracingStage,
  | 'elapsedMs'
  | 'exploredStates'
  | 'violated'
  | 'inductionChecks'
  | 'proofs'
  | 'synthesis'
  | 'symbolic'
  | 'addedInvariants'
>

/** `result`, failed or not, with `found` in its stage. */
export function withFindings(result: CLIProcedure<TracingStage>, found: VeilFindings): CLIProcedure<TracingStage> {
  return result
    .map(stage => ({ ...stage, ...found }))
    .mapLeft(({ msg, stage }) => ({ msg, stage: { ...stage, ...found } }))
}

/**
 * The properties a counterexample violates, by the names the spec gives them: the stated invariants
 * that Veil names, or the temporal property of a lasso. Undefined when Veil checked a conjunction,
 * which does not say which of its parts fails.
 */
export function violatedBy(
  counterexample: { violates: string[]; loop?: number },
  stated: string[],
  temporal: string | undefined
): string[] | undefined {
  if (counterexample.loop !== undefined) {
    return temporal !== undefined && isDefinitionName(temporal) ? [temporal] : undefined
  }
  if (stated.includes('q::inv')) {
    return undefined
  }
  const named = counterexample.violates.map(shortName)
  return stated.filter(i => named.includes(shortName(i)))
}

/**
 * Interpret a Veil run that checked the invariants `observationInvariantName(i)` for the
 * indices in `remaining`: Veil names the invariants a counterexample violates.
 */
export function veilObservationRound(outcome: VeilOutcome, remaining: number[]): ObservationRound {
  switch (outcome.kind) {
    case 'ok':
      return { kind: 'unreachable' }
    case 'violation': {
      const reached = remaining.filter(i => outcome.violates.includes(observationInvariantName(i)))
      return reached.length > 0
        ? { kind: 'reached', observations: reached }
        : { kind: 'error', message: `Veil violated ${outcome.violates.join(', ')}, none of the checked observations` }
    }
    case 'error':
      return { kind: 'error', message: outcome.message }
    default:
      return unreachable(outcome)
  }
}

/**
 * The state variables Veil's checker reports, with the types the compiled spec infers for them. Without
 * flattening, a type may name an alias, which the lookup table resolves.
 */
export function typedVariables(
  prev: CompiledStage,
  variables: VeilVariable[]
): Either<string, [VeilVariable, QuintType][]> {
  return mergeInMany(
    variables.map(v => {
      const scheme = prev.types.get(v.id)
      return scheme
        ? right<string, [VeilVariable, QuintType]>([v, inlineAliasesInType(scheme.type, prev.table)])
        : left(`no type inferred for ${v.name}`)
    })
  ).mapLeft(errors => errors.join('\n'))
}

/**
 * The invariants Veil states for those `--invariant` gives: each on its own when all are names of
 * definitions, so that a counterexample names the one it violates, else their conjunction `q::inv`.
 * Veil also elaborates large invariants one by one where their conjunction can exceed its heartbeats,
 * as ics23's does.
 */
export function veilInvariants(invariants: string[]): string[] {
  return invariants.every(isDefinitionName) ? invariants : ['q::inv']
}

/** Whether `text` is the name of a definition, possibly qualified, rather than an expression. */
function isDefinitionName(text: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*(::[A-Za-z_][A-Za-z0-9_]*)*$/.test(text)
}

/** A name without the modules that qualify it, as the Quint library for Lean names an invariant. */
function shortName(name: string): string {
  return name.split('::').pop() ?? name
}

/** `module` without the definition of `--temporal`, so that a check of invariants states no temporal property. */
function withoutTemporalProperties(module: QuintModule): QuintModule {
  return {
    ...module,
    declarations: module.declarations.filter(d => d.kind !== 'def' || d.name !== 'q::temporalProps'),
  }
}

/** A failed result, in the shape Apalache's is reported in. */
const failure = (explanation: string, traces?: ApalacheError['traces']): ApalacheResult<void> =>
  left({ explanation, errors: [], traces })

/** Veil's outcome in the shape Apalache's is reported in, with its counterexample as ITF. */
function veilResult(outcome: VeilOutcome, prev: CompiledStage): ApalacheResult<void> {
  switch (outcome.kind) {
    case 'ok':
      return right(undefined)
    case 'violation': {
      const itf = typedVariables(prev, outcome.variables)
        .chain(vars => toItfTrace(outcome.states, vars))
        .map(trace => (outcome.loop === undefined ? trace : { ...trace, loop: outcome.loop }))
      return itf.isRight()
        ? failure('found a counterexample', [itf.value])
        : failure(`found a counterexample, which could not be read: ${itf.value}`)
    }
    case 'error':
      return failure(outcome.message)
    default:
      return unreachable(outcome)
  }
}

/**
 * Prove the inductive invariant `I` of `--inductive-invariant` with Veil's SMT backend, in the phases
 * the Apalache backend checks it in: the initializer establishes `I`, and every action preserves it, in
 * one run, then, with `--invariant P`, `I` implies `P`, as a module whose initializer only requires `I`.
 * A check the solver decides neither way fails verification, with the checks and the solver's reasons.
 */
async function verifyInductiveInvariant(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number,
  workspace: VeilWorkspace
): Promise<CLIProcedure<TracingStage>> {
  const args = prev.args
  const main = withoutTemporalProperties(prev.mainModule)
  const ordinary = prev.invariants
  const keys = prev.keysInvariants.map(k => k.name)
  const nPhases = ordinary.length > 0 ? 3 : 2
  const startMs = Date.now()
  const report = async (res: ApalacheResult<void>, invariants: string[], checks: InductionCheckSummary[] = []) =>
    withFindings(
      await processApalacheResult(res, startMs, verbosityLevel, verifying, invariants, undefined, undefined, false),
      { elapsedMs: Date.now() - startMs, inductionChecks: checks, addedInvariants: addedInvariants(prev) }
    )

  printAddedKeys(prev, verbosityLevel)
  printInductiveInvariantProgress(verbosityLevel, args, 1, nPhases)
  // The keys invariants are stated beside the inductive invariant, so that a counterexample names the one it breaks.
  const inductiveSpec = outputJson({ ...prev, modules: [main], invariants: ['q::inductiveInv', ...keys] })
  const run = (spec: string, onlyInit: boolean, initEquations: boolean) =>
    checkInduction(workspace, spec, main.name, { onlyInit, initEquations }, verbosityLevel)
  const inductive = await run(inductiveSpec, false, false)
  if (inductive.isLeft()) {
    return report(failure(inductive.value), [args.inductiveInvariant])
  }
  const { checks, variables } = inductive.value
  const checked = inductionChecksOf(checks)
  const atInit = inductionOutcome(checks.filter(c => c.action === 'initializer'))
  if (atInit.kind === 'counterexample') {
    // The state the initializer reaches is in the model only when its assignments are equations.
    const again = await run(inductiveSpec, true, true)
    const shown = again.isRight() ? again.value.checks.find(c => c.invariant === atInit.check.invariant) : undefined
    const check = shown?.states !== undefined ? shown : atInit.check
    return report(
      inductionResult({ kind: 'counterexample', check }, prev, variables),
      [args.inductiveInvariant],
      checked
    )
  }
  if (atInit.kind === 'undecided') {
    return report(inductionResult(atInit, prev, variables), [args.inductiveInvariant], checked)
  }

  printInductiveInvariantProgress(verbosityLevel, args, 2, nPhases)
  const preserved = inductionOutcome(checks)
  if (preserved.kind !== 'proved' || ordinary.length === 0) {
    return report(inductionResult(preserved, prev, variables), [args.inductiveInvariant], checked)
  }

  printInductiveInvariantProgress(verbosityLevel, args, 3, nPhases, ordinary.join(' and '))
  // The inductive invariant and the keys invariants are stated too, which hold at an initializer that is their
  // conjunction: a read of a map in an ordinary invariant may rely on the keys that they state. Their own checks
  // are left out of the result.
  const implies = outputJson({
    ...prev,
    modules: [initializedBy(main, keys.length > 0 ? 'q::inductiveInvWithKeys' : 'q::inductiveInv')],
    invariants: ['q::inductiveInv', ...keys, ...veilInvariants(ordinary)],
  })
  const implied = await run(implies, true, true)
  if (implied.isLeft()) {
    return report(failure(implied.value), ordinary, checked)
  }
  const impliedChecks = implied.value.checks.filter(
    c => c.invariant !== 'q::inductiveInv' && !keys.includes(c.invariant)
  )
  const outcome = inductionOutcome(impliedChecks)
  return report(inductionResult(outcome, prev, implied.value.variables, 'implication'), ordinary, [
    ...checked,
    ...inductionChecksOf(impliedChecks, 'implication'),
  ])
}

/**
 * Check that the Lean file of `--proofs`, with the files that it imports, proves each invariant of `--invariants`,
 * or each one the main module declares, in every reachable state, and each temporal property of `--temporal` on
 * every behavior, for every value of the constants (`veilProofs.ts`). Verification fails unless every one is proved.
 */
async function verifyProofs(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number,
  workspace: VeilWorkspace
): Promise<CLIProcedure<TracingStage>> {
  const path: string = prev.args.proofs
  const startMs = Date.now()
  const invariants = prev.invariants.filter(isDefinitionName)
  const temporal: string[] = prev.args.temporal ? prev.args.temporal.split(',').map((t: string) => t.trim()) : []
  if (
    invariants.length + temporal.length === 0 ||
    invariants.length < prev.invariants.length ||
    !temporal.every(isDefinitionName)
  ) {
    return refuse(
      '--proofs proves invariants and temporal properties by name: give them with --invariants and --temporal',
      verifying
    )
  }
  if (!fs.existsSync(path)) {
    return refuse(`the proof file ${path} does not exist`, verifying)
  }
  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.green('[Veil]') + ` Checking the proofs of ${path}...`)
  }
  // Without the invariants of the check, the spec loads with the invariants that the proof file names, and
  // so does the same whichever invariants a check proves. It keeps the temporal properties that the check proves,
  // which the module declares.
  const main = temporal.length > 0 ? prev.mainModule : withoutTemporalProperties(prev.mainModule)
  const spec = outputJson({ ...prev, modules: [main], invariants: [] })
  // As `quint_module` reads them, from the module that it loads.
  const declared = prev.mainModule.declarations.flatMap(d =>
    d.kind === 'def' && d.qualifier === 'invariant' ? [d.name] : []
  )
  const proofs = { text: fs.readFileSync(path, 'utf8'), path }
  const checked = await checkProofs(
    workspace,
    spec,
    prev.mainModule.name,
    proofs,
    invariants,
    declared,
    verbosityLevel,
    prev.args.trustSmt === true,
    temporal
  )
  const elapsedMs = Date.now() - startMs
  if (checked.isLeft()) {
    return refuse(checked.value, verifying, { elapsedMs })
  }
  const { checks, errors, messages } = checked.value
  if (verbosity.hasResults(verbosityLevel)) {
    for (const c of checks) {
      console.log(
        c.status === 'proved'
          ? `${chalk.green('✓')} ${c.property} is proved${c.trustsSmt ? ', trusting the SMT solver' : ''}`
          : `${chalk.red('✗')} ${c.property} is not proved: ${c.reason}`
      )
    }
    messages.forEach(m => console.log(m))
    errors.forEach(e => console.log(chalk.red(e)))
  }
  const found = { ...verifying, errors: [], elapsedMs, proofs: checks, messages }
  const unproved = checks.filter(c => c.status !== 'proved').map(c => c.property)
  if (unproved.length > 0) {
    const msg = [`${unproved.join(', ')} ${unproved.length === 1 ? 'is' : 'are'} not proved`, ...errors].join('\n')
    return cliErr(msg, { ...found, status: 'failure' })
  }
  if (verbosity.hasResults(verbosityLevel)) {
    console.log(chalk.green('[ok]') + ' Every proof checks ' + chalk.gray(`(${elapsedMs}ms).`))
  }
  return right({ ...found, status: 'ok' })
}

/** The phase of an induction check: the induction itself, or the implication of an ordinary invariant. */
type InductionPhase = 'induction' | 'implication'

/**
 * Search with Veil's `#updr` for invariants that make the invariant of `--synthesize-invariant` inductive, together
 * with the other invariants of the check and the keys invariants it adds, for every value of the constants, and
 * have it certify what it finds with a theorem that Lean's kernel checks. Verification passes only when it finds
 * such invariants and certifies them on Lean's standard axioms.
 */
async function verifySynthesis(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number,
  workspace: VeilWorkspace
): Promise<CLIProcedure<TracingStage>> {
  const target: string = prev.args.synthesizeInvariant
  const stated = [target, ...prev.invariants.filter(i => i !== target)]
  const invariants = [...stated, ...prev.keysInvariants.map(k => k.name)]
  const startMs = Date.now()
  printAddedKeys(prev, verbosityLevel)
  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(
      chalk.green('[Veil]') +
        ` Searching with #updr for invariants that make ${stated.join(
          ', '
        )} inductive, for every value of the constants...`
    )
  }
  // The invariants are named in `quint_module`, which loads the spec as the compiled spec names none.
  const spec = outputJson({ ...prev, modules: [withoutTemporalProperties(prev.mainModule)], invariants: [] })
  const { outcome, solverCalls } = await synthesize(workspace, spec, prev.mainModule.name, invariants, verbosityLevel)
  const elapsedMs = Date.now() - startMs
  const found = { ...verifying, errors: [], elapsedMs, addedInvariants: addedInvariants(prev) }
  if (solverCalls !== undefined && verbosity.hasProgress(verbosityLevel)) {
    console.log(chalk.gray(`Veil's ${solverCalls}`))
  }
  const results = verbosity.hasResults(verbosityLevel)
  const certificateLine = (c: UpdrCertificate | undefined) =>
    c === undefined
      ? 'Not certified: Veil gave no certificate.'
      : `${c.kernelChecked ? 'Certified' : 'Not certified'}: theorem ${c.theorem}, on the axioms ${c.axioms.join(
          ', '
        )}; ${c.status}.`
  const failed = (
    msg: string,
    status: 'violation' | 'failure',
    synthesis: SynthesisSummary
  ): CLIProcedure<TracingStage> => cliErr(msg, { ...found, status, synthesis })
  switch (outcome.kind) {
    case 'invariant': {
      const { frame, clauses, certificate } = outcome
      const certified = certificate?.kernelChecked === true && outcome.errors.length === 0
      const synthesis: SynthesisSummary = {
        invariant: target,
        outcome: 'invariant',
        frame,
        clauses: clauses.map(c => c.clause),
        certified,
        theorem: certificate?.theorem,
        axioms: certificate?.axioms,
      }
      if (results) {
        console.log(
          clauses.length === 0
            ? `Veil found the invariants inductive on their own, at frame ${frame}.`
            : `Veil found ${clauses.length} strengthening clause${clauses.length === 1 ? '' : 's'}, at frame ${frame}:`
        )
        clauses.forEach(c => console.log(`invariant [${c.name}] ${c.clause}`))
        console.log(certificateLine(certificate))
        outcome.errors.forEach(e => console.log(chalk.red(e)))
      }
      if (!certified) {
        return failed(`the invariants that Veil found for ${target} are not certified`, 'failure', synthesis)
      }
      if (results) {
        console.log(
          chalk.green('[ok]') + ` Found an inductive invariant that proves ${target} ` + chalk.gray(`(${elapsedMs}ms).`)
        )
      }
      return right({ ...found, status: 'ok', synthesis })
    }
    case 'counterexample': {
      if (results) {
        console.log(outcome.report)
        if (outcome.certificate !== undefined) {
          console.log(certificateLine(outcome.certificate))
        }
        console.log(chalk.red('[violation]') + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
      }
      const synthesis: SynthesisSummary = {
        invariant: target,
        outcome: 'counterexample',
        certified: outcome.certificate?.kernelChecked === true,
        theorem: outcome.certificate?.theorem,
        axioms: outcome.certificate?.axioms,
        report: outcome.report,
      }
      const msg = `Veil found an execution that violates ${stated.join(', ')}${keysHint(
        prev.keysInvariants,
        'any',
        'invariants'
      )}`
      return failed(msg, 'violation', synthesis)
    }
    case 'none': {
      if (results) {
        console.log(outcome.report)
      }
      const synthesis: SynthesisSummary = {
        invariant: target,
        outcome: 'none',
        certified: false,
        report: outcome.report,
      }
      const msg = `Veil found no inductive invariant that proves ${target}${keysHint(
        prev.keysInvariants,
        'any',
        'invariants'
      )}`
      return failed(msg, 'failure', synthesis)
    }
    case 'error':
      return cliErr(outcome.message, found)
    default:
      return unreachable(outcome)
  }
}

/**
 * Check each invariant of the check, with the keys invariants it adds, in every execution of up to `--max-steps`
 * steps, for every value of the constants, with one query to Veil's SMT solver per invariant and length of
 * execution, since a spec need not let an execution go on. Verification fails on a counterexample, and on a query
 * that the solver does not answer.
 */
async function verifySymbolic(
  prev: CompiledStage,
  verifying: TracingStage,
  verbosityLevel: number,
  workspace: VeilWorkspace
): Promise<CLIProcedure<TracingStage>> {
  const maxSteps: number = prev.args.maxSteps
  const invariants = [...veilInvariants(prev.invariants), ...prev.keysInvariants.map(k => k.name)]
  const named = (i: string) => invariantName(i, prev.keysInvariants)
  const queries = invariants.flatMap(invariant => [...Array(maxSteps + 1).keys()].map(steps => ({ invariant, steps })))
  const startMs = Date.now()
  printAddedKeys(prev, verbosityLevel)
  if (verbosity.hasProgress(verbosityLevel)) {
    console.log(
      chalk.green('[Veil]') +
        ` Checking ${invariants.map(named).join(', ')} in every execution of up to ${stepsOf(
          maxSteps
        )}, for every value of the constants...`
    )
  }
  const spec = outputJson({ ...prev, modules: [withoutTemporalProperties(prev.mainModule)], invariants: [] })
  const answers = await checkSymbolic(workspace, spec, prev.mainModule.name, queries, verbosityLevel)
  const elapsedMs = Date.now() - startMs
  const found = { ...verifying, errors: [], elapsedMs, addedInvariants: addedInvariants(prev) }
  if (answers.isLeft()) {
    return cliErr(answers.value, found)
  }
  const symbolic = invariants.map(invariant => symbolicSummary(invariant, queries, answers.value))
  const results = verbosity.hasResults(verbosityLevel)
  for (const s of symbolic) {
    if (!results) {
      break
    }
    if (s.status === 'holds') {
      console.log(`${chalk.green('✓')} ${named(s.invariant)} holds in every execution of up to ${stepsOf(maxSteps)}`)
    } else if (s.status === 'violated') {
      console.log(`${chalk.red('✗')} ${named(s.invariant)} fails after ${stepsOf(s.steps ?? 0)}:`)
      if (verbosity.hasStateOutput(verbosityLevel)) {
        console.log(s.trace)
      }
    } else {
      const lengths = (s.undecided ?? []).map(u => u.steps)
      const said = [...new Set((s.undecided ?? []).map(u => u.answer))].join('; ')
      const after = lengths.length === 1 ? stepsOf(lengths[0]) : `${lengths.join(', ')} steps`
      console.log(`${chalk.yellow('?')} ${named(s.invariant)} is undecided after ${after}: ${said}`)
    }
  }
  const violated = symbolic.filter(s => s.status === 'violated').map(s => s.invariant)
  if (violated.length > 0) {
    if (results) {
      console.log(chalk.red('[violation]') + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
    }
    const which = violated.map(named).join(', ')
    const msg = `${which} ${violated.length === 1 ? 'is' : 'are'} violated${keysHint(
      prev.keysInvariants,
      violated,
      'invariants'
    )}`
    return cliErr(msg, {
      ...found,
      status: 'violation',
      symbolic,
      violated: violated.filter(v => !v.startsWith('q::')),
    })
  }
  const undecided = symbolic.filter(s => s.status === 'undecided').map(s => named(s.invariant))
  if (undecided.length > 0) {
    const msg = `Veil could not decide whether ${undecided.join(', ')} ${
      undecided.length === 1 ? 'holds' : 'hold'
    } in every execution of up to ${stepsOf(maxSteps)}`
    return cliErr(msg, { ...found, status: 'failure', symbolic })
  }
  if (results) {
    console.log(chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
    if (verbosity.hasHints(verbosityLevel)) {
      console.log(chalk.gray('You may increase --max-steps.'))
    }
  }
  return right({ ...found, status: 'ok', symbolic })
}

/** `n` steps, in words. */
function stepsOf(n: number): string {
  return `${n} ${n === 1 ? 'step' : 'steps'}`
}

/** What Veil's answers to `queries`, one each, establish of `invariant`. */
export function symbolicSummary(
  invariant: string,
  queries: readonly { invariant: string; steps: number }[],
  answers: readonly SymbolicAnswer[]
): SymbolicSummary {
  const own = queries.flatMap((q, i) => (q.invariant === invariant ? [{ steps: q.steps, answer: answers[i] }] : []))
  const shortest = own.find(o => o.answer.kind === 'violated')
  if (shortest?.answer.kind === 'violated') {
    return { invariant, status: 'violated', steps: shortest.steps, trace: shortest.answer.trace }
  }
  const undecided = own.flatMap(o =>
    o.answer.kind === 'undecided' ? [{ steps: o.steps, answer: o.answer.answer }] : []
  )
  return undecided.length > 0 ? { invariant, status: 'undecided', undecided } : { invariant, status: 'holds' }
}

/**
 * The checks Veil reported, as `--out` writes them. In the phase `implication`, the initializer is the
 * inductive invariant, so each check is the implication of an ordinary invariant.
 */
export function inductionChecksOf(
  checks: InductionCheck[],
  phase: InductionPhase = 'induction'
): InductionCheckSummary[] {
  return checks.map(c => ({
    invariant: c.invariant,
    check: phase === 'implication' ? 'implication' : c.action,
    status: c.status,
  }))
}

/**
 * What the induction checks establish, in the shape Apalache's results are reported in. In the phase
 * `implication`, the initializer is the inductive invariant, so a counterexample at it is a state where
 * the inductive invariant holds and an ordinary one does not.
 */
export function inductionResult(
  outcome: InductionOutcome,
  prev: CompiledStage,
  variables: VeilVariable[],
  phase: InductionPhase = 'induction'
): ApalacheResult<void> {
  switch (outcome.kind) {
    case 'proved':
      return right(undefined)
    case 'counterexample': {
      const { check } = outcome
      const where = whereFails(check, phase)
      const invariant = invariantName(check.invariant, prev.keysInvariants)
      const hint = keysHint(prev.keysInvariants, [check.invariant], 'inductive')
      if (check.states === undefined) {
        const why = check.unreadable ?? 'the solver gave no state'
        return failure(`${invariant} fails ${where}, in a state Veil could not show: ${why}${hint}`)
      }
      const states = check.states
      const itf = typedVariables(prev, variables).chain(vars => toItfTrace(states, vars))
      return itf.isRight()
        ? failure(`${invariant} fails ${where}${hint}`, [itf.value])
        : failure(`${invariant} fails ${where}, in a state that could not be read: ${itf.value}${hint}`)
    }
    case 'undecided': {
      const lines = outcome.checks.map(
        c => `  ${invariantName(c.invariant, prev.keysInvariants)} ${describe(c, phase)}`
      )
      return failure(['Veil could not decide:', ...lines].join('\n'))
    }
    default:
      return unreachable(outcome)
  }
}

/**
 * Where the state of a check is: at the initializer, after an action, or, for an implication, anywhere the
 * inductive invariant holds.
 */
function whereFails(check: InductionCheck, phase: InductionPhase): string {
  if (phase === 'implication') {
    return 'in a state where the inductive invariant holds'
  }
  return check.action === 'initializer' ? 'at the initializer' : `after ${check.action}`
}

/** A check the solver did not decide: where, what it answered, and why. */
function describe(check: InductionCheck, phase: InductionPhase): string {
  const why = check.reasons.length > 0 ? `: ${[...new Set(check.reasons)].join(', ')}` : ''
  return `${whereFails(check, phase)}: ${check.status}${why}`
}

/**
 * The words for an invariant's check: `q::inductiveInv` is `--inductive-invariant`, `q::inv` the conjunction
 * of the `--invariant`s, a keys invariant of `keys` its text, and any other its name.
 */
function invariantName(name: string, keys: readonly KeysInvariant[]): string {
  switch (name) {
    case 'q::inductiveInv':
      return 'the inductive invariant'
    case 'q::inv':
      return 'the invariants'
    default:
      return keys.find(k => k.name === name)?.text ?? name
  }
}

/** The kinds of check that tell a user where to state the keys of a map: their invariants differ. */
export type KeysCheck = 'inductive' | 'invariants'

/** Where a check of `kind` takes an invariant that states the keys of a map. */
function keysWhere(kind: KeysCheck): string {
  switch (kind) {
    case 'inductive':
      return 'in the inductive invariant'
    case 'invariants':
      return 'and name it in --invariants'
    default:
      return unreachable(kind)
  }
}

/**
 * What to tell a user whose check failed in `failing`, among which a keys invariant of `keys` names the one that
 * failed, or all of them may have: that the inferred keys do not hold as the check needs, and that they are to
 * be written by hand. Empty when no keys invariant may have failed.
 */
function keysHint(keys: readonly KeysInvariant[], failing: readonly string[] | 'any', kind: KeysCheck): string {
  const failed = keys.filter(k => failing === 'any' || failing.includes(k.name))
  if (failed.length === 0) {
    return ''
  }
  const added = failed.map(k => k.text).join(' and ')
  const maps = failed.map(k => k.variable).join(' and ')
  const may = failing === 'any' ? `, which may be what fails` : ''
  return `\nquint added ${added} from init${may}: write an invariant that states the keys of ${maps} yourself, ${keysWhere(
    kind
  )}.`
}

/** The text of the keys invariants that the check of `prev` adds, for `--out`, unless it adds none. */
function addedInvariants(prev: CompiledStage): string[] | undefined {
  return prev.keysInvariants.length > 0 ? prev.keysInvariants.map(k => k.text) : undefined
}

/** Say which keys invariants the check of `prev` adds, and where they come from. */
export function printAddedKeys(prev: CompiledStage, verbosityLevel: number): void {
  if (verbosity.hasProgress(verbosityLevel)) {
    for (const k of prev.keysInvariants) {
      console.log(
        chalk.green('[Veil]') +
          ` Added ${k.text} (from init) to the invariants of this check; it is proved together with them.`
      )
    }
  }
}

/**
 * `module` with the initializer `q::init` replaced by the predicate that the definition `name` of `module`
 * is, which the state starts in. The predicate takes its definition's expression, whose names the lookup
 * table already resolves.
 */
function initializedBy(module: QuintModule, name: string): QuintModule {
  const predicate = module.declarations.find(d => d.kind === 'def' && d.name === name)
  return {
    ...module,
    declarations: module.declarations.map(d =>
      d.kind === 'def' && d.name === 'q::init' && predicate?.kind === 'def' ? { ...d, expr: predicate.expr } : d
    ),
  }
}
