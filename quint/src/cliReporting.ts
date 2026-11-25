import chalk from 'chalk'
import { prettyQuintEx, printExecutionFrameRec, printTrace, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { QuintEx, QuintModule } from './ir/quintIr'
import { ExecutionFrame, newTraceRecorder } from './runtime/trace'
import { Outcome } from './simulation'
import JSONbig from 'json-bigint'
import { Evaluator } from './runtime/impl/evaluator'
import { newRng } from './rng'
import {
  CLIProcedure,
  ErrResult,
  ErrorData,
  ParsedStage,
  ProcedureStage,
  TestedStage,
  TracingStage,
} from './cliCommands'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { DebugMessage, ItfState, ItfTrace, ofItfNormalized, toItf } from './itf'
import { addItfHeader, expandNamedOutputTemplate, expandOutputTemplate, mkErrorMessage, toExpr } from './cliHelpers'
import { Either, left, right } from '@sweet-monads/either'
import { cwd } from 'process'
import { replacer } from './jsonHelper'
import { ApalacheResult } from './apalache'
import { TlcError } from './tlc'
import { QuintError } from './quintError'
import { LookupTable } from './names/base'
import { findViolatedInvariants } from './rust/invariantsReporter'
import { TestResult } from './runtime/testing'
import { createFinders, formatError } from './errorReporter'
import { ErrorMessage } from './ErrorMessage'
import { Doc, brackets, format, line, nest, space, text } from './prettierimp'

export type TraceHook = (index: number, status: string, vars: string[], states: QuintEx[], name?: string) => void

/**
 * Print a counterexample if the appropriate verbosity is set.
 *
 * @param verbosityLevel The verbosity level.
 * @param states The states of the counterexample.
 * @param frames The execution frames (optional).
 * @param hideVars Variables to hide in the output (optional).
 */
export function maybePrintCounterExample(
  verbosityLevel: number,
  states: QuintEx[],
  diagnostics: DebugMessage[][],
  frames: ExecutionFrame[] = [],
  hideVars: string[] = [],
  pendingDiagnostics?: DebugMessage[]
): void {
  if (verbosity.hasStateOutput(verbosityLevel)) {
    console.log(chalk.gray('An example execution:\n'))
    const myConsole = {
      width: terminalWidth(),
      out: (s: string) => process.stdout.write(s),
    }
    printTrace(myConsole, states, diagnostics, frames, hideVars, pendingDiagnostics)
  }
}

/**
 * Print how many traces reach each observation, if the appropriate verbosity is set.
 *
 * @param verbosityLevel The verbosity level.
 * @param outcome The simulation outcome.
 * @param observations The list of observations.
 */
export function maybePrintObservations(verbosityLevel: number, outcome: Outcome, observations: string[]): void {
  if (verbosity.hasObservationsOutput(verbosityLevel)) {
    if (outcome.observingTraces.length > 0) {
      console.log(chalk.green('Observations:'))
    }
    outcome.observingTraces.forEach((n, i) => {
      const percentage = chalk.gray(`(${(((1.0 * n) / outcome.samples) * 100).toFixed(2)}%)`)
      console.log(
        `${chalk.yellow(observations[i])} was observed in ${chalk.green(n)} trace(s) out of ${
          outcome.samples
        } explored ${percentage}`
      )
    })
  }
}

/** Print whether a model checker reached each observation, if the appropriate verbosity is set. */
export function maybePrintObservationReachability(
  verbosityLevel: number,
  observations: string[],
  reached: boolean[]
): void {
  if (!verbosity.hasObservationsOutput(verbosityLevel) || observations.length === 0) {
    return
  }
  console.log(chalk.green('Observations:'))
  observations.forEach((observation, i) => {
    if (reached[i]) {
      console.log(`${chalk.yellow(observation)} was observed`)
    } else {
      console.log(`${chalk.yellow(observation)} was ${chalk.red('not observed')}`)
    }
  })
}

/**
 * Print the invariants that a run checked and found no violation of, if the appropriate verbosity is set.
 * The invariants are collected from the spec when no flag selects them, so the user cannot tell them from
 * the command line alone.
 */
export function maybePrintCheckedInvariants(verbosityLevel: number, invariants: string[]): void {
  if (verbosity.hasHints(verbosityLevel) && invariants.length > 0) {
    console.log(chalk.gray(`Checked invariants: ${invariants.join(', ')}`))
  }
}

/** The time since `startMs`, as a model checker's result line ends with it. */
export function elapsed(startMs: number): string {
  return chalk.gray(`(${Date.now() - startMs}ms).`)
}

/** Print that the observations `observed`, given with `--observation`, stopped a run. */
export function maybePrintObserved(verbosityLevel: number, observed: string[], timing: string): void {
  if (verbosity.hasResults(verbosityLevel)) {
    const reached = observed.map(o => chalk.yellow(o)).join(', ')
    console.log(chalk.green('[observed]') + ` Observed ${reached}, which stopped the run ` + timing)
  }
}

/**
 * Report a run that reached none of the observations given with `--observation`.
 *
 * @param summary what was not found, e.g. `No trace reached`, followed by the observations
 */
export function notObservedErr(
  verbosityLevel: number,
  stage: TracingStage,
  observations: string[],
  summary: string,
  timing: string
): CLIProcedure<TracingStage> {
  if (verbosity.hasResults(verbosityLevel)) {
    const names = observations.map(o => chalk.yellow(o)).join(', ')
    console.log(chalk.red('[not observed]') + ` ${summary} ${names} ` + timing)
  }
  return cliErr(observations.length > 1 ? 'Observations not reached' : 'Observation not reached', {
    ...stage,
    status: 'not observed',
    errors: [],
  })
}

/**
 * Report a model checker run that was stopped by `--observation`: print its counterexample,
 * which reaches the observations `observed`, and succeed with status `observed`.
 */
export function processObservedResult(
  trace: ItfTrace | undefined,
  observed: string[],
  startMs: number,
  verbosityLevel: number,
  stage: TracingStage
): CLIProcedure<TracingStage> {
  const states = printAndSaveTrace(stage, verbosityLevel, trace)
  maybePrintObserved(verbosityLevel, observed, elapsed(startMs))
  return right({ ...stage, status: 'observed', errors: [], trace: states, reached: observed })
}

/**
 * Print a model checker's counterexample, if the appropriate verbosity is set, and write it to the `--out-itf` file.
 *
 * @returns the states of the counterexample, if there is one
 */
function printAndSaveTrace(
  stage: TracingStage,
  verbosityLevel: number,
  itfTrace: ItfTrace | undefined
): QuintEx[] | undefined {
  if (itfTrace === undefined) {
    return undefined
  }
  const states = ofItfNormalized(itfTrace)
  maybePrintCounterExample(verbosityLevel, states, [], [], stage.args.hide || [])
  if (stage.args.outItf) {
    writeToJson(stage.args.outItf, itfTrace)
  }
  return states
}

/**
 * Print violated invariants using indices provided by the Rust backend.
 *
 * @param violatedIndices The indices of invariants that were violated.
 * @param invariants The list of invariant names/expressions.
 */
export function printViolatedInvariantsByIndex(violatedIndices: number[], invariants: string[]): void {
  if (violatedIndices.length === 0) {
    return
  }

  for (const idx of violatedIndices) {
    if (idx < invariants.length) {
      console.log(chalk.red(`  ❌ ${invariants[idx]}`))
    }
  }
}

/**
 * Print violated invariants in the final state.
 *
 * @param state The final state.
 * @param invariants The list of invariants.
 * @param prev The previous stage context.
 */
export function printViolatedInvariants(state: QuintEx, invariants: string[], prev: any): void {
  const evaluator = new Evaluator(prev.resolver.table, newTraceRecorder(0, newRng()), newRng(), false)

  for (const inv of invariants) {
    const invExpr = toExpr(prev, inv).unwrap()
    evaluator.evaluate(invExpr)
    evaluator.updateState(state)
    const evalResult = evaluator.evaluate(invExpr)

    if (evalResult.isRight() && evalResult.value.kind === 'bool' && !evalResult.value.value) {
      console.log(chalk.red(`  ❌ ${inv}`))
    }
  }
}

/**
 * Process verification result from TLC.
 */
export function processTlcResult(
  res: Either<TlcError, void>,
  startMs: number,
  verbosityLevel: number,
  stage: TracingStage
): CLIProcedure<TracingStage> {
  const elapsedMs = Date.now() - startMs

  return res
    .map((): TracingStage => {
      if (verbosity.hasResults(verbosityLevel)) {
        console.log('\n' + chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
      }
      return { ...stage, status: 'ok', errors: [] }
    })
    .mapLeft(err => {
      const status = err.isViolation ? 'violation' : 'failure'
      const summary = err.isViolation ? 'Found an issue' : 'TLC encountered an error'
      if (verbosity.hasResults(verbosityLevel)) {
        console.log('\n' + chalk.red(`[${status}]`) + ' ' + summary + ' ' + chalk.gray(`(${elapsedMs}ms).`))
      }
      return {
        msg: err.explanation,
        stage: { ...stage, status, errors: err.errors },
      }
    })
}

/**
 * Process the result of a verification call.
 *
 * @param res The result of the verification.
 * @param startMs The start time in milliseconds.
 * @param verbosityLevel The verbosity level.
 * @param stage The current tracing stage.
 * @param invariantsList The list of invariants.
 * @param invariantExprs Optional parsed invariant expressions for Rust-based evaluation.
 * @param table Optional lookup table for Rust-based evaluation.
 * @param bounded Whether the check was bounded by `--max-steps`, which a passing run then suggests raising.
 * @returns The processed result.
 */
export async function processApalacheResult(
  res: ApalacheResult<void>,
  startMs: number,
  verbosityLevel: number,
  stage: TracingStage,
  invariantsList: string[],
  invariantExprs?: QuintEx[],
  table?: LookupTable,
  bounded: boolean = true
): Promise<CLIProcedure<TracingStage>> {
  const elapsedMs = Date.now() - startMs

  if (res.isRight()) {
    if (verbosity.hasResults(verbosityLevel)) {
      console.log(chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
      if (verbosity.hasHints(verbosityLevel)) {
        if (bounded) {
          console.log(chalk.gray('You may increase --max-steps.'))
        }
        console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
      }
    }
    return right({ ...stage, status: 'ok', errors: [] } as TracingStage)
  }

  const err = res.value
  const trace = printAndSaveTrace(stage, verbosityLevel, err.traces?.[0])
  const status = trace !== undefined ? 'violation' : 'failure'
  const loop = err.traces?.[0]?.loop
  if (trace !== undefined && loop !== undefined && verbosity.hasStateOutput(verbosityLevel)) {
    console.log(
      chalk.gray(`The last state steps back to [State ${loop}], and the execution repeats from there forever.\n`)
    )
  }

  if (trace !== undefined && verbosity.hasResults(verbosityLevel)) {
    console.log(chalk.red(`[${status}]`) + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
    const itfStates = err.traces?.[0]?.states
    const lastItfState = itfStates?.[itfStates.length - 1]
    if (invariantExprs && table && lastItfState) {
      await printViolatedInvariantsWithRust(invariantsList, verbosityLevel, invariantExprs, table, lastItfState)
    }
  }
  return left({
    msg: err.explanation,
    stage: { ...stage, status, errors: err.errors, trace },
  })
}

/**
 * Print violated invariants using the Rust evaluator.
 */
async function printViolatedInvariantsWithRust(
  invariantsList: string[],
  verbosityLevel: number,
  invariantExprs: QuintEx[],
  table: LookupTable,
  itfState: ItfState
): Promise<void> {
  const result = await findViolatedInvariants(itfState, table, invariantExprs, verbosityLevel)
  if (result.isRight()) {
    printViolatedInvariantsByIndex(result.value, invariantsList)
  } else {
    console.warn(chalk.yellow(`Warning: could not determine violated invariants: ${result.value.message}`))
  }
}

export function outputJson(stage: ProcedureStage): string {
  return jsonStringOfOutputStage(pickOutputStage(stage))
}

export function writeOutputToJson(filename: string, stage: ProcedureStage): void {
  const path = resolve(cwd(), filename)
  writeFileSync(path, outputJson(stage))
}

export function jsonStringOfOutputStage(json: any): string {
  return JSONbig.stringify(json, replacer)
}

/**
 * Write json to a file.
 *
 * @param filename name of the file to write to
 * @param json is an object tree to write
 */
export function writeToJson(filename: string, json: any) {
  const path = resolve(cwd(), filename)
  writeFileSync(path, jsonStringOfOutputStage(json))
}

// Extract just the parts of a ProcedureStage that we use for the output
// See https://stackoverflow.com/a/39333479/1187277
const pickOutputStage = ({
  stage,
  warnings,
  modules,
  table,
  types,
  effects,
  errors,
  documentation,
  passed,
  failed,
  ignored,
  status,
  trace,
  seed,
  invariants,
  violated,
  exploredStates,
  elapsedMs,
  reached,
  inductionChecks,
  proofs,
  synthesis,
  symbolic,
  addedInvariants,
  messages,
  message,
  main,
}: ProcedureStage) => {
  return {
    stage,
    warnings,
    modules,
    table,
    types,
    effects,
    errors,
    documentation,
    passed,
    failed,
    ignored,
    status,
    trace,
    seed,
    invariants,
    violated,
    exploredStates,
    elapsedMs,
    reached,
    inductionChecks,
    proofs,
    synthesis,
    symbolic,
    addedInvariants,
    messages,
    message,
    main,
  }
}

export function cliErr<Stage>(msg: string, stage: ErrorData): Either<ErrResult, Stage> {
  return left({ msg, stage })
}

/**
 * Find the main module by name.
 */
export function findMainModule(prev: ParsedStage, mainName: string): QuintModule | undefined {
  return prev.modules.find(m => m.name === mainName)
}

/**
 * Handle errors when the main module is not found.
 */
export function handleMainModuleError(prev: ParsedStage, mainName: string): CLIProcedure<TestedStage> {
  const error: QuintError = { code: 'QNT405', message: `Main module ${mainName} not found` }
  return cliErr('Argument error', { ...prev, errors: [mkErrorMessage(prev.sourceMap)(error)] })
}

export function prepareOnTrace(
  source: string,
  outputTemplate: string | undefined,
  nTraces: number,
  metadata: boolean
): TraceHook {
  return (index: number, status: string, vars: string[], states: QuintEx[], name: string | undefined) => {
    if (outputTemplate) {
      const filename = name
        ? expandNamedOutputTemplate(outputTemplate, name, index, { autoAppend: nTraces > 1 })
        : expandOutputTemplate(outputTemplate, index, { autoAppend: nTraces > 1 })

      const trace = toItf(vars, states, metadata)
      if (trace.isRight()) {
        const jsonObj = addItfHeader(source, status, trace.value)
        writeToJson(filename, jsonObj)
      } else {
        console.error(`ITF conversion failed on ${index}: ${trace.value}`)
      }
    }
  }
}

/**
 * Output test results.
 */
export function outputTestResults(results: TestResult[], verbosityLevel: number, elapsedMs: number): void {
  const out = console.log
  let nFailures = 1

  if (verbosity.hasResults(verbosityLevel)) {
    results.forEach(res => {
      if (res.status === 'passed') {
        out(`    ${chalk.green('ok')} ${res.name} passed ${res.nsamples} test(s)`)
      } else if (res.status === 'failed') {
        const errNo = chalk.red(nFailures)
        out(`    ${errNo}) ${res.name} failed after ${res.nsamples} test(s)`)
        nFailures++
      }
      if (res.status !== 'ignored') {
        for (const msgs of res.traces?.at(0)?.diagnostics || []) {
          for (const msg of msgs) {
            const doc: Doc = nest('       ', [
              text('       '),
              brackets(text('DEBUG')),
              space,
              text(msg.label),
              line(),
              prettyQuintEx(msg.value),
            ])
            out(format(terminalWidth(), 5, doc))
          }
        }
      }
    })

    const passed = results.filter(r => r.status === 'passed')
    const failed = results.filter(r => r.status === 'failed')
    const ignored = results.filter(r => r.status === 'ignored')

    out('')
    if (passed.length > 0) {
      out(chalk.green(`  ${passed.length} passing`) + chalk.gray(` (${elapsedMs}ms)`))
    }
    if (failed.length > 0) {
      out(chalk.red(`  ${failed.length} failed`))
    }
    if (ignored.length > 0) {
      out(chalk.gray(`  ${ignored.length} ignored`))
    }
  }
}

export function outputTestErrors(prev: ParsedStage, verbosityLevel: number, failed: TestResult[]): void {
  const namedErrors: [TestResult, ErrorMessage][] = failed.reduce(
    (acc: [TestResult, ErrorMessage][], failure) =>
      acc.concat(failure.errors.map(e => [failure, mkErrorMessage(prev.sourceMap)(e)])),
    []
  )
  const out = console.log

  // We know that there are errors, so report as required by the verbosity configuration
  if (verbosity.hasTestDetails(verbosityLevel)) {
    const code = prev.sourceCode!
    const finders = createFinders(code)
    const columns = !prev.args.out ? terminalWidth() : 80
    out('')
    namedErrors.forEach(([testResult, err], index) => {
      const details = formatError(code, finders, err)
      // output the header
      out(`  ${index + 1}) ${testResult.name}:`)
      const lines = details.split('\n')
      // output the error lines in red
      lines.filter(l => l.trim().length > 0).forEach(l => out(chalk.red('      ' + l)))

      if (verbosity.hasActionTracking(verbosityLevel)) {
        out('')
        // Skip frame display for Rust backend
        if (!testResult.traces) {
          testResult.frames?.forEach((f, index) => {
            out(`[${chalk.bold('Frame ' + index)}]`)
            const console = {
              width: columns,
              out: (s: string) => process.stdout.write(s),
            }
            printExecutionFrameRec(console, f, [])
            out('')
          })

          if (testResult.frames?.length == 0) {
            out('    [No execution]')
          }
        }
      }
      // output the seed
      out(chalk.gray(`    Use --seed=0x${testResult.seed.toString(16)} --match=${testResult.name} to repeat.`))
    })
    out('')
  }

  if (verbosity.hasHints(verbosityLevel) && !verbosity.hasActionTracking(verbosityLevel)) {
    out(chalk.gray(`\n  Use --verbosity=3 to show executions.`))
    out(chalk.gray(`  Further debug with: quint test --verbosity=3 ${prev.args.input}`))
  }
}

export function printInductiveInvariantProgress(
  verbosityLevel: number,
  args: any,
  phase: number,
  nPhases: number,
  invariantsString: string = ''
): void {
  if (verbosity.hasProgress(verbosityLevel)) {
    switch (phase) {
      case 1:
        console.log(
          chalk.gray(
            `> [1/${nPhases}] Checking whether the inductive invariant '${args.inductiveInvariant}' holds in the initial state(s) defined by '${args.init}'...`
          )
        )
        break
      case 2:
        console.log(
          chalk.gray(
            `> [2/${nPhases}] Checking whether '${args.step}' preserves the inductive invariant '${args.inductiveInvariant}'...`
          )
        )
        break
      case 3:
        console.log(
          chalk.gray(
            `> [3/3] Checking whether the inductive invariant '${args.inductiveInvariant}' implies '${invariantsString}'...`
          )
        )
        break
    }
  }
}
