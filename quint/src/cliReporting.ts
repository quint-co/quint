import chalk from 'chalk'
import { printTrace, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { QuintEx } from './ir/quintIr'
import { ExecutionFrame, newTraceRecorder } from './runtime/trace'
import { Outcome } from './simulation'
import JSONbig from 'json-bigint'
import { Evaluator } from './runtime/impl/evaluator'
import { newRng } from './rng'
import { CLIProcedure, ErrResult, ErrorData, ProcedureStage, TracingStage } from './cliCommands'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { ofItf } from './itf'
import { toExpr } from './cliHelpers'
import { Either, left } from '@sweet-monads/either'
import { cwd } from 'process'
import { replacer } from './jsonHelper'
import { ApalacheResult } from './apalache'

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
  if (invariants.length <= 1) {
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
export function processVerifyResult(
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
      const trace: QuintEx[] | undefined = err.traces ? ofItf(err.traces[0]) : undefined
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
