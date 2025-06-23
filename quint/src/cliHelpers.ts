import { basename } from 'path'

import { SourceMap, parseExpressionOrDeclaration } from './parsing/quintParserFrontend'
import { ErrorMessage } from './ErrorMessage'

import { Either, left, right } from '@sweet-monads/either'
import { QuintEx } from './ir/quintIr'
import { QuintError, quintErrorToString } from './quintError'
import { walkExpression } from './ir/IRVisitor'

import { CompiledStage, TypecheckedStage } from './cliCommands'
import { readFileSync } from 'fs'
import { ApalacheConfig } from './apalache'
import { cliErr } from './cliReporting'

export function mkErrorMessage(sourceMap: SourceMap): (_: QuintError) => ErrorMessage {
  return error => {
    const loc = error.reference ? sourceMap.get(error.reference) : undefined
    return {
      explanation: quintErrorToString(error),
      locs: loc ? [loc] : [],
    }
  }
}

export function toExpr(prev: TypecheckedStage, input: string): Either<QuintError, QuintEx> {
  const mainName = guessMainModule(prev)
  const parseResult = parseExpressionOrDeclaration(input, '<input>', prev.idGen, prev.sourceMap)
  if (parseResult.kind !== 'expr') {
    return left({ code: 'QNT501', message: `Expected ${input} to be a valid expression` })
  }

  prev.resolver.switchToModule(mainName)
  walkExpression(prev.resolver, parseResult.expr)
  if (prev.resolver.errors.length > 0) {
    return left(prev.resolver.errors[0])
  }

  return right(parseResult.expr)
}

export function guessMainModule(stage: TypecheckedStage): string {
  if (stage.args.main) {
    // the main module is specified via --main
    return stage.args.main
  }
  if (stage.defaultModuleName.isJust()) {
    // there is only one module in the source file, make it main
    return stage.defaultModuleName.unwrap()
  }
  // guess the name from the filename
  return basename(stage.args.input, '.qnt')
}

/**
 * Process invariants from arguments and return the combined invariant string
 * and individual invariants list.
 *
 * @param args The arguments containing invariant and invariants options.
 * @returns A tuple [invariantString, individualInvariants].
 */
export function getInvariants(args: { invariant?: string; invariants?: string[] }): [string, string[]] {
  let invariantsList: string[] = []

  // Add single invariant if specified and not 'true'
  if (args.invariant && args.invariant !== 'true') {
    invariantsList.push(args.invariant)
  }

  // Add multiple invariants if specified
  if (args.invariants && args.invariants.length > 0) {
    invariantsList = invariantsList.concat(args.invariants)
  }

  // Determine the combined invariant string and individual invariants
  const invariantString = invariantsList.length > 0 ? invariantsList.join(' and ') : 'true'

  return [invariantString, invariantsList]
}

export function addItfHeader(source: string, status: string, traceInJson: any): any {
  return {
    '#meta': {
      format: 'ITF',
      'format-description': 'https://apalache-mc.org/docs/adr/015adr-trace.html',
      source,
      status,
      description: 'Created by Quint on ' + new Date(),
      timestamp: Date.now(),
    },
    ...traceInJson,
  }
}

export function loadApalacheConfig(stage: CompiledStage, apalacheConfig?: string): ApalacheConfig {
  try {
    if (apalacheConfig) {
      return JSON.parse(readFileSync(apalacheConfig, 'utf-8'))
    }
  } catch (err: any) {
    return cliErr(`failed to read Apalache config: ${err.message}`, { ...stage, errors: [], sourceCode: new Map() })
  }
}

/**
 * Does a definition name match the expected test criteria.
 *
 * @param tests an optional array of test names
 * @param name the name of a definition to match
 * @returns whether the name matches the tests, if tests are not undefined,
 *          or name ends with 'Test'
 *
 */
export function isMatchingTest(match: string | undefined, name: string) {
  if (match) {
    return new RegExp(match).exec(name) !== null
  } else {
    return name.endsWith('Test')
  }
}

// Derive the verbosity for simulation and verification routines
export function deriveVerbosity(args: { out: string | undefined; verbosity: number }): number {
  return args.out ? 0 : args.verbosity
}

export const PLACEHOLDERS = {
  test: '{test}',
  seq: '{seq}',
}

/**
 * Expand the output template with the name of the test and the index of the trace.
 *
 * Possible placeholders:
 * - {test} is replaced with the name of the test
 * - {seq} is replaced with the index of the trace
 *
 * If {seq} is not present and `options.autoAppend` is true,
 * the index is appended to the filename, before the extension.
 *
 * @param template the output template
 * @param name the name of the test
 * @param index the index of the trace
 * @param options An object of the form `{ autoAppend: boolean }`
 * @returns the expanded output template
 */
export function expandNamedOutputTemplate(
  template: string,
  name: string,
  index: number,
  options: { autoAppend: boolean }
): string {
  return expandOutputTemplate(template.replaceAll(PLACEHOLDERS.test, name), index, options)
}

/**
 * Expand the output template with the index of the trace.
 *
 * The {seq} placeholder is replaced with the index of the trace.
 *
 * If {seq} is not present and `options.autoAppend` is true,
 * the index is appended to the filename, before the extension.
 *
 * @param template the output template
 * @param index the index of the trace
 * @param options An object of the form `{ autoAppend: boolean }`
 * @returns the expanded output template
 */
export function expandOutputTemplate(template: string, index: number, options: { autoAppend: boolean }): string {
  if (template.includes(PLACEHOLDERS.seq)) {
    return template.replaceAll(PLACEHOLDERS.seq, index.toString())
  }

  if (options.autoAppend) {
    const parts = template.split('.')
    parts[0] += `${index}`
    return parts.join('.')
  }

  return template
}
