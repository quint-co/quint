/**
 * Define the commands for QuintC
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2023
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import JSONbig from 'json-bigint'
import { basename, dirname, resolve } from 'path'
import { cwd } from 'process'
import chalk from 'chalk'

import {
  SourceMap,
  compactSourceMap,
  parseDefOrThrow,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
  parsePhase4toposort,
} from './parsing/quintParserFrontend'
import { ErrorMessage } from './ErrorMessage'

import { Either, left, right } from '@sweet-monads/either'
import { EffectScheme } from './effects/base'
import { LookupTable, UnusedDefinitions } from './names/base'
import { ReplOptions, quintRepl } from './repl'
import { OpQualifier, QuintEx, QuintModule, QuintOpDef, qualifier } from './ir/quintIr'
import { TypeScheme } from './types/base'
import lineColumn from 'line-column'
import { formatError } from './errorReporter'
import { DocumentationEntry, produceDocs, toMarkdown } from './docs'
import { QuintError, quintErrorToString } from './quintError'
import { TestOptions, TestResult, compileAndTest } from './runtime/testing'
import { IdGenerator, newIdGenerator } from './idGenerator'
import { SimulatorOptions, compileAndRun } from './simulation'
import { ofItf, toItf } from './itf'
import { printExecutionFrameRec, printTrace, terminalWidth } from './graphics'
import { verbosity } from './verbosity'
import { Rng, newRng } from './rng'
import { fileSourceResolver } from './parsing/sourceResolver'
import { verify } from './quintVerifier'
import { flattenModules } from './flattening/fullFlattener'
import { analyzeInc, analyzeModules } from './quintAnalyzer'
import { ExecutionFrame } from './runtime/trace'
import { flow, isEqual, uniqWith } from 'lodash'

export type stage = 'loading' | 'parsing' | 'typechecking' | 'testing' | 'running' | 'documentation'

/** The data from a ProcedureStage that may be output to --out */
interface OutputStage {
  stage: stage
  // the modules and the lookup table produced by 'parse'
  modules?: QuintModule[]
  table?: LookupTable
  unusedDefinitions?: UnusedDefinitions
  // the tables produced by 'typecheck'
  types?: Map<bigint, TypeScheme>
  effects?: Map<bigint, EffectScheme>
  modes?: Map<bigint, OpQualifier>
  // Test names output produced by 'test'
  passed?: string[]
  failed?: string[]
  ignored?: string[]
  // Test names output produced by 'run'
  status?: 'ok' | 'violation' | 'failure'
  trace?: QuintEx[]
  /* Docstrings by defintion name by module name */
  documentation?: Map<string, Map<string, DocumentationEntry>>
  errors?: ErrorMessage[]
  warnings?: any[] // TODO it doesn't look like this is being used for anything. Should we remove it?
  sourceCode?: Map<string, string> // Should not printed, only used in formatting errors
}

// Extract just the parts of a ProcedureStage that we use for the output
// See https://stackoverflow.com/a/39333479/1187277
const pickOutputStage = ({
  stage,
  warnings,
  modules,
  table,
  unusedDefinitions,
  types,
  effects,
  errors,
  documentation,
  passed,
  failed,
  ignored,
  status,
  trace,
}: ProcedureStage) => {
  return {
    stage,
    warnings,
    modules,
    table,
    unusedDefinitions,
    types,
    effects,
    errors,
    documentation,
    passed,
    failed,
    ignored,
    status,
    trace,
  }
}

interface ProcedureStage extends OutputStage {
  args: any
}

interface LoadedStage extends ProcedureStage {
  // Path to the source file
  path: string
  sourceCode: Map<string, string>
}

interface ParsedStage extends LoadedStage {
  modules: QuintModule[]
  sourceMap: SourceMap
  table: LookupTable
  unusedDefinitions: UnusedDefinitions
  idGen: IdGenerator
}

interface TypecheckedStage extends ParsedStage {
  types: Map<bigint, TypeScheme>
  effects: Map<bigint, EffectScheme>
  modes: Map<bigint, OpQualifier>
}

interface TestedStage extends LoadedStage {
  // the names of the passed tests
  passed: string[]
  // the names of the failed tests
  failed: string[]
  // the names of the ignored tests
  ignored: string[]
}

interface SimulatorStage extends LoadedStage {
  status: 'ok' | 'violation' | 'failure'
  trace?: QuintEx[]
}

interface VerifiedStage extends LoadedStage {
  status: 'ok' | 'violation' | 'failure'
  trace?: QuintEx[]
}

interface DocumentationStage extends LoadedStage {
  documentation?: Map<string, Map<string, DocumentationEntry>>
}

// A procedure stage which is guaranteed to have `errors` and `sourceCode`
interface ErrorData extends ProcedureStage {
  errors: ErrorMessage[]
  sourceCode: Map<string, string>
}

type ErrResult = { msg: string; stage: ErrorData }

function cliErr<Stage>(msg: string, stage: ErrorData): Either<ErrResult, Stage> {
  return left({ msg, stage })
}

export type CLIProcedure<Stage> = Either<ErrResult, Stage>

/** Load a file into a string
 *
 * @param args the CLI arguments parsed by yargs */
export async function load(args: any): Promise<CLIProcedure<LoadedStage>> {
  const stage: ProcedureStage = { stage: 'loading', args }
  if (existsSync(args.input)) {
    try {
      const path = resolve(cwd(), args.input)
      const sourceCode = readFileSync(path, 'utf8')
      return right({
        ...stage,
        args,
        path,
        sourceCode: new Map([[path, sourceCode]]),
        warnings: [],
      })
    } catch (err: unknown) {
      return cliErr(`file ${args.input} could not be opened due to ${err}`, {
        ...stage,
        errors: [],
        sourceCode: new Map(),
      })
    }
  } else {
    return cliErr(`file ${args.input} does not exist`, { ...stage, errors: [], sourceCode: new Map() })
  }
}

/**
 * Parse a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export async function parse(loaded: LoadedStage): Promise<CLIProcedure<ParsedStage>> {
  const { args, sourceCode, path } = loaded
  const text = sourceCode.get(path)!
  const parsing = { ...loaded, stage: 'parsing' as stage }
  const idGen = newIdGenerator()
  return flow([
    () => parsePhase1fromText(idGen, text, path),
    phase1Data => {
      const resolver = fileSourceResolver(sourceCode)
      const mainPath = resolver.lookupPath(dirname(path), basename(path))
      return parsePhase2sourceResolution(idGen, resolver, mainPath, phase1Data)
    },
    phase2Data => {
      if (args.sourceMap) {
        // Write source map to the specified file
        writeToJson(args.sourceMap, compactSourceMap(phase2Data.sourceMap))
      }
      return parsePhase3importAndNameResolution(phase2Data)
    },
    phase3Data => parsePhase4toposort(phase3Data),
    phase4Data => ({ ...parsing, ...phase4Data, idGen }),
    result => {
      if (result.errors.length > 0) {
        const newErrorMessages = result.errors.map(mkErrorMessage(result.sourceMap))
        const errorMessages = parsing.errors ? parsing.errors.concat(newErrorMessages) : newErrorMessages
        return left({ msg: 'parsing failed', stage: { ...result, errors: errorMessages } })
      }

      return right(result)
    },
  ])()
}

export function mkErrorMessage(sourceMap: SourceMap): (_: QuintError) => ErrorMessage {
  return error => {
    const loc = error.reference ? sourceMap.get(error.reference) : undefined
    return {
      explanation: quintErrorToString(error),
      locs: loc ? [loc] : [],
    }
  }
}
/**
 * Check types and effects of a Quint specification.
 *
 * @param parsed the procedure stage produced by `parse`
 */
export async function typecheck(parsed: ParsedStage): Promise<CLIProcedure<TypecheckedStage>> {
  const { table, modules, sourceMap } = parsed
  const typechecking = { ...parsed, stage: 'typechecking' as stage }

  const [errorMap, result] = analyzeModules(table, modules)

  if (errorMap.length === 0) {
    return right({ ...typechecking, ...result })
  } else {
    const errors = errorMap.map(mkErrorMessage(sourceMap))
    return cliErr('typechecking failed', { ...typechecking, errors })
  }
}

/**
 * Run REPL.
 *
 * @param _argv parameters as provided by yargs
 */
export async function runRepl(_argv: any) {
  let filename: string | undefined = undefined
  let moduleName: string | undefined = undefined
  if (_argv.require) {
    const m = /^(.*?)(?:|::([a-zA-Z_]\w*))$/.exec(_argv.require)
    if (m) {
      ;[filename, moduleName] = m.slice(1, 3)
    }
  }
  const options: ReplOptions = {
    preloadFilename: filename,
    importModule: moduleName,
    verbosity: _argv.quiet ? 0 : _argv.verbosity,
  }
  quintRepl(process.stdin, process.stdout, options)
}

/**
 * Run the tests. We imitate the output of mocha.
 *
 * @param typedStage the procedure stage produced by `typecheck`
 */
export async function runTests(prev: TypecheckedStage): Promise<CLIProcedure<TestedStage>> {
  const verbosityLevel = !prev.args.out ? prev.args.verbosity : 0
  const out = console.log
  const columns = !prev.args.out ? terminalWidth() : 80

  const testing = { ...prev, stage: 'testing' as stage }
  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')

  const outputTemplate = testing.args.output

  const rngOrError = mkRng(prev.args.seed)
  if (rngOrError.isLeft()) {
    return cliErr(rngOrError.value, { ...testing, errors: [] })
  }
  const rng = rngOrError.unwrap()

  let passed: string[] = []
  let failed: string[] = []
  let ignored: string[] = []
  let namedErrors: [string, ErrorMessage, TestResult][] = []

  const startMs = Date.now()
  if (verbosity.hasResults(verbosityLevel)) {
    out(`\n  ${mainName}`)
  }

  const matchFun = (n: string): boolean => isMatchingTest(testing.args.match, n)
  const options: TestOptions = {
    testMatch: matchFun,
    maxSamples: testing.args.maxSamples,
    rng,
    verbosity: verbosityLevel,
    onTrace: (index: number, name: string, status: string, vars: string[], states: QuintEx[]) => {
      if (outputTemplate && outputTemplate.endsWith('.itf.json')) {
        const filename = outputTemplate.replaceAll('{}', name).replaceAll('{#}', index)
        const trace = toItf(vars, states)
        if (trace.isRight()) {
          const jsonObj = addItfHeader(prev.args.input, status, trace.value)
          writeToJson(filename, jsonObj)
        } else {
          console.error(`ITF conversion failed on ${name}: ${trace.value}`)
        }
      }
    },
  }

  // Find tests that are not used in the main module. We need to add references to them in the main module so flattening
  // doesn't drop the definitions.
  const unusedTests = [...testing.unusedDefinitions(mainName)].filter(
    d => d.kind === 'def' && options.testMatch(d.name)
  )

  // Define name expressions referencing each test that is not referenced elsewhere, adding the references to the lookup
  // table
  const args: QuintEx[] = unusedTests.map(defToAdd => {
    const id = testing.idGen.nextId()
    testing.table.set(id, defToAdd)
    const namespace = defToAdd.importedFrom ? qualifier(defToAdd.importedFrom) : undefined
    const name = namespace ? [namespace, defToAdd.name].join('::') : defToAdd.name

    return { kind: 'name', id, name }
  })

  // Wrap all expressions in a single declaration
  const testDeclaration: QuintOpDef = {
    id: testing.idGen.nextId(),
    name: 'q::unitTests',
    kind: 'def',
    qualifier: 'run',
    expr: { kind: 'app', opcode: 'actionAll', args, id: testing.idGen.nextId() },
  }

  // Add the declaration to the main module
  const main = testing.modules.find(m => m.name === mainName)
  main?.declarations.push(testDeclaration)

  const analysisOutput = { types: testing.types, effects: testing.effects, modes: testing.modes }
  const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
    testing.modules,
    testing.table,
    testing.idGen,
    testing.sourceMap,
    analysisOutput
  )
  const compilationState = {
    originalModules: testing.modules,
    modules: flattenedModules,
    sourceMap: testing.sourceMap,
    analysisOutput: flattenedAnalysis,
    idGen: testing.idGen,
    sourceCode: testing.sourceCode,
  }
  const testOut = compileAndTest(compilationState, mainName, flattenedTable, options)

  if (testOut.isLeft()) {
    return cliErr('Tests failed', { ...testing, errors: testOut.value.map(mkErrorMessage(testing.sourceMap)) })
  } else if (testOut.isRight()) {
    const elapsedMs = Date.now() - startMs
    const results = testOut.unwrap()
    // output the status for every test
    if (verbosity.hasResults(verbosityLevel)) {
      results.forEach(res => {
        if (res.status === 'passed') {
          out(`    ${chalk.green('ok')} ${res.name} passed ${res.nsamples} test(s)`)
        }
        if (res.status === 'failed') {
          const errNo = chalk.red(namedErrors.length + 1)
          out(`    ${errNo}) ${res.name} failed after ${res.nsamples} test(s)`)

          res.errors.forEach(e => namedErrors.push([res.name, mkErrorMessage(testing.sourceMap)(e), res]))
        }
      })
    }

    passed = results.filter(r => r.status === 'passed').map(r => r.name)
    failed = results.filter(r => r.status === 'failed').map(r => r.name)
    ignored = results.filter(r => r.status === 'ignored').map(r => r.name)

    // output the statistics banner
    if (verbosity.hasResults(verbosityLevel)) {
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

    // output errors, if there are any
    if (verbosity.hasTestDetails(verbosityLevel) && namedErrors.length > 0) {
      const code = prev.sourceCode!
      const finders = createFinders(code)
      out('')
      namedErrors.forEach(([name, err, testResult], index) => {
        const details = formatError(code, finders, err)
        // output the header
        out(`  ${index + 1}) ${name}:`)
        const lines = details.split('\n')
        // output the first two lines in red
        lines.slice(0, 2).forEach(l => out(chalk.red('      ' + l)))

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

    if (failed.length > 0 && verbosity.hasHints(options.verbosity) && !verbosity.hasActionTracking(options.verbosity)) {
      out(chalk.gray(`\n  Use --verbosity=3 to show executions.`))
      out(chalk.gray(`  Further debug with: quint --verbosity=3 ${prev.args.input}`))
    }
  }

  const errors = namedErrors.map(([_, e]) => e)
  const stage = { ...testing, passed, failed, ignored, errors }
  if (errors.length == 0 && failed.length == 0) {
    return right(stage)
  } else {
    return cliErr('Tests failed', stage)
  }
}

// Print a counterexample if the appropriate verbosity is set
function maybePrintCounterExample(verbosityLevel: number, states: QuintEx[], frames: ExecutionFrame[] = []) {
  if (verbosity.hasStateOutput(verbosityLevel)) {
    console.log(chalk.gray('An example execution:\n'))
    const myConsole = {
      width: terminalWidth(),
      out: (s: string) => process.stdout.write(s),
    }
    printTrace(myConsole, states, frames)
  }
}

/**
 * Run the simulator.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export async function runSimulator(prev: TypecheckedStage): Promise<CLIProcedure<SimulatorStage>> {
  const simulator = { ...prev, stage: 'running' as stage }
  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')
  const verbosityLevel = !prev.args.out && !prev.args.outItf ? prev.args.verbosity : 0
  const rngOrError = mkRng(prev.args.seed)
  if (rngOrError.isLeft()) {
    return cliErr(rngOrError.value, { ...simulator, errors: [] })
  }
  const rng = rngOrError.unwrap()
  const options: SimulatorOptions = {
    init: prev.args.init,
    step: prev.args.step,
    invariant: prev.args.invariant,
    maxSamples: prev.args.maxSamples,
    maxSteps: prev.args.maxSteps,
    rng,
    verbosity: verbosityLevel,
  }
  const startMs = Date.now()

  const mainText = prev.sourceCode.get(prev.path)!
  const mainPath = fileSourceResolver(prev.sourceCode).lookupPath(dirname(prev.args.input), basename(prev.args.input))
  const mainId = prev.modules.find(m => m.name === mainName)!.id
  const mainStart = prev.sourceMap.get(mainId)!.start.index
  const mainEnd = prev.sourceMap.get(mainId)!.end!.index
  const result = compileAndRun(newIdGenerator(), mainText, mainStart, mainEnd, mainName, mainPath, options)

  if (result.status === 'error') {
    const newErrors = result.errors.map(mkErrorMessage(prev.sourceMap))
    const errors = prev.errors ? prev.errors.concat(newErrors) : newErrors
    return cliErr('run failed', { ...simulator, errors })
  } else {
    if (verbosity.hasResults(verbosityLevel)) {
      const elapsedMs = Date.now() - startMs
      maybePrintCounterExample(verbosityLevel, result.states, result.frames)
      if (result.status === 'ok') {
        console.log(chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
        console.log(chalk.gray(`Use --seed=0x${result.seed.toString(16)} to reproduce.`))
        if (verbosity.hasHints(options.verbosity)) {
          console.log(chalk.gray('You may increase --max-samples and --max-steps.'))
          console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
        }
      } else {
        console.log(chalk.red(`[${result.status}]`) + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
        console.log(chalk.gray(`Use --seed=0x${result.seed.toString(16)} to reproduce.`))

        if (verbosity.hasHints(options.verbosity)) {
          console.log(chalk.gray('Use --verbosity=3 to show executions.'))
        }
      }
    }

    if (prev.args.outItf) {
      const trace = toItf(result.vars, result.states)
      if (trace.isRight()) {
        const jsonObj = addItfHeader(prev.args.input, result.status, trace.value)
        writeToJson(prev.args.outItf, jsonObj)
      } else {
        const newStage = { ...simulator, errors: result.errors.map(mkErrorMessage(prev.sourceMap)) }
        return cliErr(`ITF conversion failed: ${trace.value}`, newStage)
      }
    }

    if (result.status === 'ok') {
      return right({
        ...simulator,
        status: result.status,
        trace: result.states,
      })
    } else {
      const msg = result.status === 'violation' ? 'Invariant violated' : 'Runtime error'
      return cliErr(msg, {
        ...simulator,
        status: result.status,
        trace: result.states,
        errors: result.errors.map(mkErrorMessage(prev.sourceMap)),
      })
    }
  }
}

/**
 * Verify a spec via Apalache.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export async function verifySpec(prev: TypecheckedStage): Promise<CLIProcedure<VerifiedStage>> {
  const verifying = { ...prev, stage: 'verifying' as stage }
  const args = verifying.args
  let loadedConfig: any = {}
  try {
    if (args.apalacheConfig) {
      loadedConfig = JSON.parse(readFileSync(args.apalacheConfig, 'utf-8'))
    }
  } catch (err: any) {
    return cliErr(`failed to read Apalache config: ${err.message}`, { ...verifying, errors: [], sourceCode: new Map() })
  }

  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')
  const main = verifying.modules.find(m => m.name === mainName)
  if (!main) {
    return cliErr(`module ${mainName} does not exist`, { ...verifying, errors: [], sourceCode: new Map() })
  }

  // Wrap init, step, invariant and temporal properties in other definitions,
  // to make sure they are not considered unused in the main module and,
  // therefore, ignored by the flattener
  const extraDefsAsText = [`action q::init = ${args.init}`, `action q::step = ${args.step}`]
  if (args.invariant) {
    extraDefsAsText.push(`val q::inv = and(${args.invariant.join(',')})`)
  }
  if (args.temporal) {
    extraDefsAsText.push(`temporal q::temporalProps = and(${args.temporal.join(',')})`)
  }

  const extraDefs = extraDefsAsText.map(d => parseDefOrThrow(d, verifying.idGen, new Map()))
  main.declarations.push(...extraDefs)

  // We have to update the lookup table and analysis result with the new definitions. This is not ideal, and the problem
  // is that is hard to add this definitions in the proper stage, in our current setup. We should try to tackle this
  // while solving #1052.
  const resolutionResult = parsePhase3importAndNameResolution({ ...prev, errors: [] })
  if (resolutionResult.errors.length > 0) {
    const errors = resolutionResult.errors.map(mkErrorMessage(prev.sourceMap))
    return cliErr('name resolution failed', { ...verifying, errors })
  }

  verifying.table = resolutionResult.table
  extraDefs.forEach(def => analyzeInc(verifying, verifying.table, def))

  // Flatten modules, replacing instances, imports and exports with their definitions
  const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
    verifying.modules,
    verifying.table,
    verifying.idGen,
    verifying.sourceMap,
    verifying
  )

  // Pick main module, we only pass this on to Apalache
  const flatMain = flattenedModules.find(m => m.name === mainName)!

  const veryfiyingFlat = { ...verifying, ...flattenedAnalysis, modules: [flatMain], table: flattenedTable }
  const parsedSpec = jsonStringOfOutputStage(pickOutputStage(veryfiyingFlat))

  // We need to insert the data form CLI args into thier appropriate locations
  // in the Apalache config
  const config = {
    ...loadedConfig,
    input: {
      ...(loadedConfig.input ?? {}),
      source: {
        type: 'string',
        format: 'qnt',
        content: parsedSpec,
      },
    },
    checker: {
      ...(loadedConfig.checker ?? {}),
      length: args.maxSteps,
      init: 'q::init',
      next: 'q::step',
      inv: args.invariant ? ['q::inv'] : undefined,
      'temporal-props': args.temporal ? ['q::temporalProps'] : undefined,
      tuning: {
        ...(loadedConfig.checker?.tuning ?? {}),
        'search.simulation': args.randomTransitions ? 'true' : 'false',
      },
    },
  }

  const startMs = Date.now()

  const verbosityLevel = !prev.args.out && !prev.args.outItf ? prev.args.verbosity : 0
  return verify(config, verbosityLevel).then(res => {
    const elapsedMs = Date.now() - startMs
    return res
      .map(_ => {
        if (verbosity.hasResults(verbosityLevel)) {
          console.log(chalk.green('[ok]') + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
          if (verbosity.hasHints(verbosityLevel)) {
            console.log(chalk.gray('You may increase --max-steps.'))
            console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
          }
        }
        return { ...verifying, status: 'ok', errors: [] } as VerifiedStage
      })
      .mapLeft(err => {
        const trace: QuintEx[] | undefined = err.traces ? ofItf(err.traces[0]) : undefined
        const status = trace !== undefined ? 'violation' : 'failure'
        if (trace !== undefined) {
          // Always print the conterexample, unless the output is being directed to one of the outfiles
          maybePrintCounterExample(verbosityLevel, trace)

          if (verbosity.hasResults(verbosityLevel)) {
            console.log(chalk.red(`[${status}]`) + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
          }

          if (prev.args.outItf) {
            writeToJson(prev.args.outItf, err.traces)
          }
        }
        return {
          msg: err.explanation,
          stage: { ...verifying, status, errors: err.errors, trace },
        }
      })
  })
}

/**
 * Produces documentation from docstrings in a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export async function docs(loaded: LoadedStage): Promise<CLIProcedure<DocumentationStage>> {
  const { sourceCode, path } = loaded
  const text = sourceCode.get(path)!
  const parsing = { ...loaded, stage: 'documentation' as stage }
  const phase1Data = parsePhase1fromText(newIdGenerator(), text, path)
  const allEntries: [string, Map<string, DocumentationEntry>][] = phase1Data.modules.map(module => {
    const documentationEntries = produceDocs(module)
    const title = `# Documentation for ${module.name}\n\n`
    const markdown = title + [...documentationEntries.values()].map(toMarkdown).join('\n\n')
    console.log(markdown)

    return [module.name, documentationEntries]
  })

  if (phase1Data.errors.length > 0) {
    const newErrorMessages = phase1Data.errors.map(mkErrorMessage(phase1Data.sourceMap))
    const errorMessages = parsing.errors ? parsing.errors.concat(newErrorMessages) : newErrorMessages
    return left({ msg: 'parsing failed', stage: { ...parsing, errors: errorMessages } })
  }

  return right({ ...parsing, documentation: new Map(allEntries) })
}

/** Write the OutputStage of the procedureStage as JSON, if --out is set
 * Otherwise, report any stage errors to STDOUT
 */
export function outputResult(result: CLIProcedure<ProcedureStage>) {
  result
    .map(stage => {
      const outputData = pickOutputStage(stage)
      if (stage.args.out) {
        writeToJson(stage.args.out, outputData)
      }

      process.exit(0)
    })
    .mapLeft(({ msg, stage }) => {
      const { args, errors, sourceCode } = stage
      const outputData = pickOutputStage(stage)
      if (args.out) {
        writeToJson(args.out, outputData)
      } else {
        const finders = createFinders(sourceCode!)
        uniqWith(errors, isEqual).forEach(err => console.error(formatError(sourceCode, finders, err)))
        console.error(`error: ${msg}`)
      }
      process.exit(1)
    })
}

/**
 * Produce a random-number generator: Either a predictable one using a seed,
 * or a reasonably unpredictable one.
 */
function mkRng(seedText?: string): Either<string, Rng> {
  let seed
  if (seedText !== undefined) {
    // since yargs does not has a type for big integers,
    // we do it with a fallback
    try {
      seed = BigInt(seedText)
    } catch (SyntaxError) {
      return left(`--seed must be a big integer, found: ${seedText}`)
    }
  }

  return right(seed ? newRng(seed) : newRng())
}

function addItfHeader(source: string, status: string, traceInJson: any): any {
  return {
    '#meta': {
      format: 'ITF',
      'format-description': 'https://apalache.informal.systems/docs/adr/015adr-trace.html',
      source,
      status,
      description: 'Created by Quint on ' + new Date(),
      timestamp: Date.now(),
    },
    ...traceInJson,
  }
}

// Preprocess troublesome types so they are represented in JSON.
//
// We need it particularly because, by default, serialization of Map
// objects just produces an empty object
// (see https://stackoverflow.com/questions/46634449/json-stringify-of-object-of-map-return-empty)
//
// The approach here follows https://stackoverflow.com/a/56150320/1187277
function replacer(_key: String, value: any): any {
  if (value instanceof Map) {
    // Represent Maps as JSON objects
    return Object.fromEntries(value)
  } else {
    return value
  }
}

function jsonStringOfOutputStage(json: any): string {
  return JSONbig.stringify(json, replacer)
}

/**
 * Write json to a file.
 *
 * @param filename name of the file to write to
 * @param json is an object tree to write
 */
function writeToJson(filename: string, json: any) {
  const path = resolve(cwd(), filename)
  writeFileSync(path, jsonStringOfOutputStage(json))
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
function isMatchingTest(match: string | undefined, name: string) {
  if (match) {
    return new RegExp(match).exec(name) !== null
  } else {
    return name.endsWith('Test')
  }
}

export function createFinders(sourceCode: Map<string, string>): Map<string, any> {
  return new Map([...sourceCode.entries()].map(([path, code]) => [path, lineColumn(code)]))
}
