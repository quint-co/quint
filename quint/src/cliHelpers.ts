import { basename } from 'path'

import { SourceMap, parseExpressionOrDeclaration } from './parsing/quintParserFrontend'
import { ErrorMessage, resolveErrorLocation, resolveTraceLocations } from './ErrorMessage'

import { Either, left, right } from '@sweet-monads/either'
import { QuintEx } from './ir/quintIr'
import { QuintError, quintErrorToString } from './quintError'
import { walkExpression } from './ir/IRVisitor'

import { CompiledStage, TypecheckedStage } from './cliCommands'
import { readFileSync } from 'fs'
import { DefinitionsByName } from './names/base'
import { ApalacheConfig } from './apalache'
import { cliErr } from './cliReporting'

export function mkErrorMessage(sourceMap: SourceMap): (_: QuintError) => ErrorMessage {
  return error => {
    const loc = resolveErrorLocation(sourceMap, error)
    const traceLocs = resolveTraceLocations(sourceMap, error)
    return {
      explanation: quintErrorToString(error),
      locs: loc ? [loc] : [],
      traceLocs,
    }
  }
}

export function toExpr(
  prev: TypecheckedStage,
  input: string,
  expectedRole?: { kind: 'action'; flag: string }
): Either<QuintError, QuintEx> {
  const mainName = guessMainModule(prev)
  const parseResult = parseExpressionOrDeclaration(input, '<input>', prev.idGen, prev.sourceMap)
  if (parseResult.kind !== 'expr') {
    return left({ code: 'QNT501', message: `Expected ${input} to be a valid expression` })
  }

  // The resolver keeps the errors of earlier expressions, which are not this expression's
  const knownErrors = prev.resolver.errors.length
  prev.resolver.switchToModule(mainName)
  walkExpression(prev.resolver, parseResult.expr)
  if (prev.resolver.errors.length > knownErrors) {
    return left(prev.resolver.errors[knownErrors])
  }

  // When used as --init or --step, the resolved name must be an action.
  // A non-action definition (var, val, const, etc.) with the same name causes confusing
  // runtime errors or silently wrong results.
  if (expectedRole?.kind === 'action' && parseResult.expr.kind === 'name') {
    const def = prev.resolver.table.get(parseResult.expr.id)
    if (def && (def.kind !== 'def' || def.qualifier !== 'action')) {
      const defKind = def.kind === 'def' ? def.qualifier : def.kind
      return left({
        code: 'QNT501',
        message: `default --${expectedRole.flag} action name '${input}' is used by a ${defKind} declaration`,
      })
    }
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
 * The `invariant` or `observation` definitions that the main module declares or
 * imports into its own namespace (`import P.*`, `import P(N = 3).*`, `import
 * P.inv`), in declaration order. Qualified imports (`import P as p`) are left
 * out, since a module that imports several instances qualified starts only one
 * of them, and the properties of the others would read uninitialized variables.
 *
 * @param stage a stage whose names are resolved
 * @param mainName the main module
 * @param qualifier the qualifier to collect
 */
export function declaredProperties(
  stage: Pick<TypecheckedStage, 'resolver'>,
  mainName: string,
  qualifier: 'invariant' | 'observation'
): string[] {
  const defs: DefinitionsByName = stage.resolver.collector.definitionsByModule.get(mainName) ?? new Map()
  return [...defs.entries()]
    .filter(
      ([name, definitions]) =>
        !name.includes('::') && definitions.some(d => d.kind === 'def' && d.qualifier === qualifier)
    )
    .map(([name]) => name)
}

/**
 * The arguments that select invariants. yargs parses `--no-invariant` as
 * `invariant: false`, `--no-invariant=true` as `noInvariant: true`, and a
 * repeated `--invariant` as an array.
 */
export interface InvariantArgs {
  invariant?: string | false | (string | false)[]
  invariants?: string[]
  noInvariant?: boolean
}

/** Whether `--no-invariant` is given. */
function isNoInvariant(args: InvariantArgs): boolean {
  return args.noInvariant === true || [args.invariant].flat().includes(false)
}

function givenInvariants(args: InvariantArgs): string[] {
  return [args.invariant ?? []].flat().filter((inv): inv is string => inv !== false)
}

function explicitInvariants(args: InvariantArgs): string[] {
  return [...givenInvariants(args), ...(args.invariants ?? [])]
}

/**
 * Collect the invariants that a command checks. Any `--invariant` or
 * `--invariants` replaces the main module's declared invariants, and
 * `--invariant true` checks none. Without one, the declared invariants are
 * checked. `--no-invariant` checks none.
 *
 * @param declared The `invariant` definitions of the main module (see `declaredProperties`).
 * @returns A tuple [invariantString, individualInvariants], where the string is the
 *   invariants joined with `and`, or `'true'` when there are none.
 */
export function getInvariants(args: InvariantArgs, declared: string[] = []): [string, string[]] {
  if (isNoInvariant(args)) {
    return ['true', []]
  }

  const explicit = explicitInvariants(args)
  const invariantsList = explicit.length > 0 ? explicit.filter(inv => inv !== 'true') : declared
  const invariantString = invariantsList.length > 0 ? invariantsList.join(' and ') : 'true'

  return [invariantString, invariantsList]
}

/**
 * The arguments that select observations. yargs parses `--no-observation`,
 * which is not an option, as `observation: [false]`.
 */
export interface ObservationArgs {
  observation?: (string | false)[] | false
  witnesses?: string[]
  searchObservations?: boolean
}

function explicitObservations(args: ObservationArgs): string[] {
  return (args.observation || []).filter((o): o is string => o !== false)
}

/**
 * Collect the observations that a command counts: the main module's declared
 * `observation` definitions, the deprecated `--witnesses`, then the
 * `--observation` names, without duplicates.
 *
 * @param declared The `observation` definitions of the main module (see `declaredProperties`).
 * @returns the observations, and the indices in `allObservations` of the
 *   `--observation` names. `quint run` and `quint verify` stop at the first trace
 *   that reaches one of them, and fail when none is reached.
 */
export function getObservations(
  args: ObservationArgs,
  declared: string[] = []
): { allObservations: string[]; stoppingObservations: number[] } {
  const stopping = [...new Set(explicitObservations(args))]
  const allObservations = [...new Set([...declared, ...(args.witnesses ?? []), ...stopping])]
  const stoppingObservations = stopping.map(o => allObservations.indexOf(o))

  return { allObservations, stoppingObservations }
}

/**
 * The flag that gives each invariant and observation on the command line, by
 * expression, so that an expression that does not resolve can be blamed on its flag.
 */
export function propertyFlags(args: InvariantArgs & ObservationArgs): Map<string, string> {
  return new Map([
    ...givenInvariants(args).map((e): [string, string] => [e, '--invariant']),
    ...(args.invariants ?? []).map((e): [string, string] => [e, '--invariants']),
    ...(args.witnesses ?? []).map((e): [string, string] => [e, '--witnesses']),
    ...explicitObservations(args).map((e): [string, string] => [e, '--observation']),
  ])
}

/**
 * Like `toExpr`, for an invariant or observation. When the expression is given
 * with a flag (see `propertyFlags`), an error names that flag.
 */
export function propertyExpr(
  prev: TypecheckedStage,
  flag: string | undefined,
  input: string
): Either<QuintError, QuintEx> {
  return toExpr(prev, input).mapLeft(error =>
    flag ? { ...error, message: `${error.message} (given with ${flag})` } : error
  )
}

/**
 * Check the property flags for combinations that yargs accepts but that cannot
 * be honoured. `--no-invariant` with `--invariant` would otherwise let the last
 * flag win, and `--no-observation` would be read as an empty `--observation`.
 *
 * @returns an error message for each combination
 */
export function propertyFlagErrors(args: InvariantArgs & ObservationArgs): string[] {
  return [
    ...(isNoInvariant(args) && explicitInvariants(args).length > 0
      ? ['--no-invariant cannot be combined with --invariant or --invariants']
      : []),
    ...(args.observation === false || (args.observation ?? []).includes(false)
      ? ['Unknown argument: no-observation']
      : []),
    ...(args.searchObservations && explicitObservations(args).length > 0
      ? ['--search-observations cannot be combined with --observation']
      : []),
  ]
}

/**
 * The name that `compile` gives to the invariant `not(O)` for the `index`-th
 * observation of `getObservations(...).allObservations`. A model checker
 * reaches the observation exactly when it finds a violation of this invariant.
 */
export function observationInvariantName(index: number): string {
  return `q::noObservation${index}`
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

export function loadApalacheConfig(stage: CompiledStage, apalacheConfig: string | undefined): ApalacheConfig {
  try {
    if (apalacheConfig) {
      return JSON.parse(readFileSync(apalacheConfig, 'utf-8'))
    } else {
      return {}
    }
  } catch (err: any) {
    return cliErr(`failed to read Apalache config: ${err.message}`, { ...stage, errors: [], sourceCode: new Map() })
  }
}

/** Suffix used when `--match` is omitted. Names ending with this are tests. */
const DEFAULT_TEST_NAME_SUFFIX = 'Test'

/**
 * Does a definition name match the expected test criteria?
 *
 * When `match` is omitted, a name matches if it ends with 'Test'.
 * Otherwise `match` is treated as a regular expression.
 *
 * @param match an optional regular expression, as passed to `--match`
 * @param name the name of a definition to match
 */
export function isMatchingTest(match: string | undefined, name: string) {
  if (match) {
    return new RegExp(match).exec(name) !== null
  } else {
    return name.endsWith(DEFAULT_TEST_NAME_SUFFIX)
  }
}

/**
 * Explain that a `quint test` invocation selected no definitions.
 *
 * The message names the `--match` option and the default name suffix so a
 * silent empty suite cannot be confused with a passing one.
 */
export function noTestsMatchedMessage(match: string | undefined): string {
  const how =
    `By default, quint test runs definitions whose names end with "${DEFAULT_TEST_NAME_SUFFIX}". ` +
    `Use --match to select other names (for example, --match '.*')`
  if (match) {
    return `no tests matched --match '${match}'. ${how}`
  }
  return `no tests matched. ${how}`
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
