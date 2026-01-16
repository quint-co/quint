import chalk from 'chalk'
import { printExecutionFrameRec, printTrace, terminalWidth } from './graphics'
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
import { ofItfNormalized, toItf } from './itf'
import { addItfHeader, expandNamedOutputTemplate, expandOutputTemplate, mkErrorMessage, toExpr } from './cliHelpers'
import { Either, left } from '@sweet-monads/either'
import { cwd } from 'process'
import { replacer } from './jsonHelper'
import { ApalacheResult } from './apalache'
import { QuintError } from './quintError'
import { TestResult } from './runtime/testing'
import { createFinders, formatError } from './errorReporter'
import { ErrorMessage } from './ErrorMessage'

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
  frames: ExecutionFrame[] = [],
  hideVars: string[] = []
): void {
  if (verbosity.hasStateOutput(verbosityLevel)) {
    console.log(chalk.gray('An example execution:\n'))
    const myConsole = {
      width: terminalWidth(),
      out: (s: string) => process.stdout.write(s),
    }
    printTrace(myConsole, states, frames, hideVars)
  }
}

/**
 * Print witnesses if the appropriate verbosity is set.
 *
 * @param verbosityLevel The verbosity level.
 * @param outcome The simulation outcome.
 * @param witnesses The list of witnesses.
 */
export function maybePrintWitnesses(verbosityLevel: number, outcome: Outcome, witnesses: string[]): void {
  if (verbosity.hasWitnessesOutput(verbosityLevel)) {
    if (outcome.witnessingTraces.length > 0) {
      console.log(chalk.green('Witnesses:'))
    }
    outcome.witnessingTraces.forEach((n, i) => {
      const percentage = chalk.gray(`(${(((1.0 * n) / outcome.samples) * 100).toFixed(2)}%)`)
      console.log(
        `${chalk.yellow(witnesses[i])} was witnessed in ${chalk.green(n)} trace(s) out of ${
          outcome.samples
        } explored ${percentage}`
      )
    })
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
  if (invariants.length <= 1 && prev.args.inductiveInvariant === undefined) {
    return
  }

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
 * Process the result of a verification call.
 *
 * @param res The result of the verification.
 * @param startMs The start time in milliseconds.
 * @param verbosityLevel The verbosity level.
 * @param verifying The current tracing stage.
 * @param invariantsList The list of invariants.
 * @param prev The previous stage context.
 * @returns The processed result.
 */
export function processApalacheResult(
  res: ApalacheResult<void>,
  startMs: number,
  verbosityLevel: number,
  stage: TracingStage,
  invariantsList: string[]
): CLIProcedure<TracingStage> {
  const elapsedMs = Date.now() - startMs

  return res
    .map((): TracingStage => {
      if (verbosity.hasResults(verbosityLevel)) {
        console.log(chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
        if (verbosity.hasHints(verbosityLevel)) {
          console.log(chalk.gray('You may increase --max-steps.'))
          console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
        }
      }
      return { ...stage, status: 'ok', errors: [] }
    })
    .mapLeft(err => {
      const trace: QuintEx[] | undefined = err.traces ? ofItfNormalized(err.traces[0]) : undefined
      const status = trace !== undefined ? 'violation' : 'failure'

      if (trace !== undefined) {
        maybePrintCounterExample(verbosityLevel, trace, [], stage.args.hide || [])

        if (verbosity.hasResults(verbosityLevel)) {
          console.log(chalk.red(`[${status}]`) + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
          printViolatedInvariants(trace[trace.length - 1], invariantsList, stage)
        }

        if (stage.args.outItf && err.traces) {
          writeToJson(stage.args.outItf, err.traces[0])
        }
      }
      return {
        msg: err.explanation,
        stage: { ...stage, status, errors: err.errors, trace },
      }
    })
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
      }
      if (res.status === 'failed') {
        const errNo = chalk.red(nFailures)
        out(`    ${errNo}) ${res.name} failed after ${res.nsamples} test(s)`)
        nFailures++
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
        testResult.frames.forEach((f, index) => {
          out(`[${chalk.bold('Frame ' + index)}]`)
          const console = {
            width: columns,
            out: (s: string) => process.stdout.write(s),
          }
          printExecutionFrameRec(console, f, [])
          out('')
        })

        if (testResult.frames.length == 0) {
          out('    [No execution]')
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
