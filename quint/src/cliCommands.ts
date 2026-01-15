/**
 * The commands for the quint CLI
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2025
 */

import { existsSync, readFileSync } from 'fs'
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

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { EffectScheme } from './effects/base'
import { LookupTable } from './names/base'
import { ReplOptions, quintRepl } from './repl'
import { OpQualifier, QuintEx, QuintModule } from './ir/quintIr'
import { TypeScheme } from './types/base'
import { createFinders, formatError } from './errorReporter'
import { DocumentationEntry, produceDocs, toMarkdown } from './docs'
import { IdGenerator, newIdGenerator } from './idGenerator'
import { Outcome, SimulatorOptions, showTraceStatistics } from './simulation'
import { verbosity } from './verbosity'
import { fileSourceResolver } from './parsing/sourceResolver'
import { verifyWithApalacheBackend } from './quintMCWrapper'
import { flattenModules } from './flattening/fullFlattener'
import { AnalysisOutput, analyzeInc, analyzeModules } from './quintAnalyzer'
import { newTraceRecorder } from './runtime/trace'
import { flow, isEqual, uniqWith } from 'lodash'
import { Maybe, just, none } from '@sweet-monads/maybe'
import { compileToTlaplus } from './compileToTlaplus'
import { Evaluator } from './runtime/impl/evaluator'
import { NameResolver } from './names/resolver'
import { convertInit } from './ir/initToPredicate'
import { QuintRustWrapper } from './quintRustWrapper'
import {
  cliErr,
  findMainModule,
  handleMainModuleError,
  maybePrintCounterExample,
  maybePrintWitnesses,
  outputJson,
  outputTestErrors,
  outputTestResults,
  prepareOnTrace,
  printViolatedInvariants,
  writeOutputToJson,
  writeToJson,
} from './cliReporting'
import { deriveVerbosity, getInvariants, guessMainModule, isMatchingTest, mkErrorMessage, toExpr } from './cliHelpers'
import { fail } from 'assert'
import { newRng } from './rng'
import { TestOptions } from './runtime/testing'

export type stage =
  | 'loading'
  | 'parsing'
  | 'typechecking'
  | 'testing'
  | 'running'
  | 'compiling'
  | 'outputting target'
  | 'documentation'

/** The data from a ProcedureStage that may be output to --out */
interface OutputStage {
  stage: stage
  // the modules and the lookup table produced by 'parse'
  modules?: QuintModule[]
  table?: LookupTable
  // the tables produced by 'typecheck'
  types?: Map<bigint, TypeScheme>
  effects?: Map<bigint, EffectScheme>
  modes?: Map<bigint, OpQualifier>
  // Test names output produced by 'test'
  passed?: string[]
  failed?: string[]
  ignored?: string[]
  // Possible results from 'run'
  status?: 'ok' | 'violation' | 'failure' | 'error'
  trace?: QuintEx[]
  seed?: bigint
  /* Docstrings by definition name by module name */
  documentation?: Map<string, Map<string, DocumentationEntry>>
  errors?: ErrorMessage[]
  warnings?: any[] // TODO it doesn't look like this is being used for anything. Should we remove it?
  sourceCode?: Map<string, string> // Should not be printed, only used in formatting errors
  main?: string
}

export interface ProcedureStage extends OutputStage {
  args: any
}

export interface LoadedStage extends ProcedureStage {
  // Path to the source file
  path: string
  sourceCode: Map<string, string>
}

export interface ParsedStage extends LoadedStage {
  modules: QuintModule[]
  defaultModuleName: Maybe<string>
  sourceMap: SourceMap
  table: LookupTable
  resolver: NameResolver
  idGen: IdGenerator
}

export interface TypecheckedStage extends ParsedStage {
  types: Map<bigint, TypeScheme>
  effects: Map<bigint, EffectScheme>
  modes: Map<bigint, OpQualifier>
}

export interface CompiledStage extends TypecheckedStage, AnalysisOutput {
  mainModule: QuintModule
}

export interface TestedStage extends LoadedStage {
  // the names of the passed tests
  passed: string[]
  // the names of the failed tests
  failed: string[]
  // the names of the ignored tests
  ignored: string[]
}

// Data resulting from stages that can produce a trace
export interface TracingStage extends LoadedStage {
  trace?: QuintEx[]
}

export interface DocumentationStage extends LoadedStage {
  documentation?: Map<string, Map<string, DocumentationEntry>>
}

// A procedure stage which is guaranteed to have `errors` and `sourceCode`
export interface ErrorData extends ProcedureStage {
  errors: ErrorMessage[]
  sourceCode: Map<string, string>
}

export type ErrResult = { msg: string; stage: ErrorData }

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
    () => {
      const phase1Data = parsePhase1fromText(idGen, text, path)
      // if there is exactly one module in the original text, make it the main one
      const defaultModuleName = phase1Data.modules.length === 1 ? just(phase1Data.modules[0].name) : none()
      return { ...phase1Data, defaultModuleName }
    },
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
/**
 * Check types and effects of a Quint specification.
 *
 * @param parsed the procedure stage produced by `parse`
 */
export async function typecheck(parsed: ParsedStage): Promise<CLIProcedure<TypecheckedStage>> {
  const { table, modules, sourceMap } = parsed

  const [errorMap, result] = analyzeModules(table, modules)

  const typechecking = { ...parsed, ...result, stage: 'typechecking' as stage }
  if (errorMap.length === 0) {
    return right(typechecking)
  } else {
    const errors = errorMap.map(mkErrorMessage(sourceMap))
    return cliErr('typechecking failed', { ...typechecking, errors })
  }
}

/**
 * Run REPL.
 *
 * @param argv parameters as provided by yargs
 */
export async function runRepl(argv: any) {
  let filename: string | undefined = undefined
  let moduleName: string | undefined = undefined
  if (argv.require) {
    // quint -r FILE.qnt or quint -r FILE.qnt::MODULE
    const m = /^(.*?)(?:|::([a-zA-Z_]\w*))$/.exec(argv.require)
    if (m) {
      ;[filename, moduleName] = m.slice(1, 3)
    }
  }
  const options: ReplOptions = {
    preloadFilename: filename,
    importModule: moduleName,
    replInput: argv.commands,
    verbosity: argv.quiet ? 0 : argv.verbosity,
  }
  quintRepl(process.stdin, process.stdout, options)
}

/**
 * Run the tests. We imitate the output of mocha.
 *
 * @param typedStage the procedure stage produced by `typecheck`
 */
/**
 * Main function to run tests.
 */
export async function runTests(prev: TypecheckedStage): Promise<CLIProcedure<TestedStage>> {
  const testing = { ...prev, stage: 'testing' as stage }
  const verbosityLevel = deriveVerbosity(prev.args)
  const mainName = guessMainModule(prev)
  const main = findMainModule(prev, mainName)

  if (!main) {
    return handleMainModuleError(prev, mainName)
  }

  const options: TestOptions = {
    testMatch: (n: string) => isMatchingTest(prev.args.match, n),
    maxSamples: prev.args.maxSamples,
    rng: newRng(prev.args.seed),
    verbosity: verbosityLevel,
    onTrace: prepareOnTrace(prev.args.input, prev.args.outItf, prev.args.nTraces, false),
  }

  const startMs = Date.now()

  if (verbosity.hasResults(verbosityLevel)) {
    console.log(`\n  ${mainName}`)
  }

  const testDefs = Array.from(prev.resolver.collector.definitionsByModule.get(mainName)!.values())
    .flat()
    .filter(d => d.kind === 'def' && options.testMatch(d.name))

  const evaluator = new Evaluator(prev.table, newTraceRecorder(verbosityLevel, options.rng, 1), options.rng)
  const results = testDefs.map((def, index) => evaluator.test(def, options.maxSamples, index, options.onTrace))

  const elapsedMs = Date.now() - startMs
  outputTestResults(results, verbosityLevel, elapsedMs)

  const passed = results.filter(r => r.status === 'passed')
  const failed = results.filter(r => r.status === 'failed')
  const ignored = results.filter(r => r.status === 'ignored')

  const stage = {
    ...testing,
    passed: passed.map(r => r.name),
    failed: failed.map(r => r.name),
    ignored: ignored.map(r => r.name),
    errors: [],
  }

  if (failed.length === 0) {
    return right(stage)
  }

  outputTestErrors(stage, verbosityLevel, failed)

  return cliErr('Tests failed', stage)
}

/**
 * Run the simulator.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export async function runSimulator(prev: TypecheckedStage): Promise<CLIProcedure<TracingStage>> {
  const simulator = { ...prev, stage: 'running' as stage }
  const startMs = Date.now()
  // Verboity level controls how much of the output is shown
  const verbosityLevel = deriveVerbosity(prev.args)
  const mainName = guessMainModule(prev)
  const main = prev.modules.find(m => m.name === mainName)
  if (!main) {
    return handleMainModuleError(prev, mainName)
  }

  const rng = newRng(prev.args.seed)

  // We use:
  // - 'invariantString' as the combined invariant string for the simulator to check
  // - 'individualInvariants' for reporting which specific invariants were violated
  const [invariantString, invariantsList] = getInvariants(prev.args)
  const individualInvariants = invariantsList.length > 0 ? invariantsList : ['true']

  const options: SimulatorOptions = {
    init: prev.args.init,
    step: prev.args.step,
    invariant: invariantString,
    individualInvariants: individualInvariants,
    maxSamples: prev.args.maxSamples,
    maxSteps: prev.args.maxSteps,
    rng,
    verbosity: verbosityLevel,
    storeMetadata: prev.args.mbt,
    hideVars: prev.args.hide || [],
    numberOfTraces: prev.args.nTraces,
    onTrace: prepareOnTrace(prev.args.input, prev.args.outItf, prev.args.nTraces, prev.args.mbt),
  }

  const recorder = newTraceRecorder(options.verbosity, options.rng, options.numberOfTraces)

  const argsParsingResult = mergeInMany(
    [prev.args.init, prev.args.step, invariantString, ...prev.args.witnesses].map(e => toExpr(prev, e))
  )
  if (argsParsingResult.isLeft()) {
    return cliErr('Argument error', {
      ...simulator,
      errors: argsParsingResult.value.map(mkErrorMessage(new Map())),
    })
  }
  const [init, step, invariant, ...witnesses] = argsParsingResult.value

  let outcome: Outcome
  if (prev.args.backend == 'rust') {
    if (prev.args.mbt || prev.args.witnesses.length > 0) {
      console.warn(
        chalk.yellow('Warning: --mbt and --witnesses are ignored when using the Rust backend (at this time).')
      )
      console.warn(chalk.yellow('Use the typescript backend if you need that functionality.'))
    }

    // Parse the combined invariant for the Rust backend
    const invariantExpr = toExpr(prev, invariantString)
    if (invariantExpr.isLeft()) {
      return cliErr('Argument error', {
        ...simulator,
        errors: [mkErrorMessage(prev.sourceMap)(invariantExpr.value)],
      })
    }

    const quintRustWrapper = new QuintRustWrapper(verbosityLevel)
    const nThreads = Math.min(prev.args.maxSamples, prev.args.nThreads)
    outcome = await quintRustWrapper.simulate(
      { modules: [], table: prev.resolver.table, main: mainName, init, step, invariant: invariantExpr.value },
      prev.path,
      witnesses,
      prev.args.maxSamples,
      prev.args.maxSteps,
      prev.args.nTraces ?? 1,
      nThreads,
      prev.args.seed,
      options.onTrace
    )
  } else {
    // Use the typescript simulator
    const evaluator = new Evaluator(prev.resolver.table, recorder, options.rng, options.storeMetadata)
    outcome = evaluator.simulate(
      init,
      step,
      invariant,
      witnesses,
      prev.args.maxSamples,
      prev.args.maxSteps,
      prev.args.nTraces ?? 1,
      options.onTrace
    )
  }

  const elapsedMs = Date.now() - startMs

  simulator.seed = outcome.bestTraces[0]?.seed
  const states = outcome.bestTraces[0]?.states
  const frames = recorder.bestTraces[0]?.frame?.subframes

  switch (outcome.status) {
    case 'error':
      return cliErr('Runtime error', {
        ...simulator,
        status: outcome.status,
        seed: prev.args.seed,
        errors: outcome.errors.map(mkErrorMessage(prev.sourceMap)),
      })

    case 'ok':
      maybePrintCounterExample(verbosityLevel, states, frames, prev.args.hide || [])
      if (verbosity.hasResults(verbosityLevel)) {
        console.log(
          chalk.green('[ok]') +
            ' No violation found ' +
            chalk.gray(`(${elapsedMs}ms at ${Math.round((1000 * outcome.samples) / elapsedMs)} traces/second).`)
        )
        if (verbosity.hasHints(verbosityLevel)) {
          console.log(chalk.gray(showTraceStatistics(outcome.traceStatistics)))
          console.log(chalk.gray('You may increase --max-samples and --max-steps.'))
          console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
        }
      }
      maybePrintWitnesses(verbosityLevel, outcome, prev.args.witnesses)

      return right({
        ...simulator,
        status: outcome.status,
        trace: states,
      })

    case 'violation':
      maybePrintCounterExample(verbosityLevel, states, frames, prev.args.hide || [])
      if (verbosity.hasResults(verbosityLevel)) {
        console.log(
          chalk.red(`[violation]`) +
            ' Found an issue ' +
            chalk.gray(`(${elapsedMs}ms at ${Math.round((1000 * outcome.samples) / elapsedMs)} traces/second).`)
        )

        printViolatedInvariants(states[states.length - 1], individualInvariants, prev)
      }

      if (verbosity.hasHints(verbosityLevel)) {
        console.log(chalk.gray('Use --verbosity=3 to show executions.'))
      }

      maybePrintWitnesses(verbosityLevel, outcome, prev.args.witnesses)

      return cliErr('Invariant violated', {
        ...simulator,
        status: outcome.status,
        trace: states,
        errors: [],
      })
  }
}

/**  Compile to a flattened module, that includes the special q::* declarations
 *
 * @param typechecked the output of a preceding type checking stage
 */
export async function compile(typechecked: TypecheckedStage): Promise<CLIProcedure<CompiledStage>> {
  const args = typechecked.args
  const mainName = guessMainModule(typechecked)
  const main = typechecked.modules.find(m => m.name === mainName)
  if (!main) {
    return cliErr(`module ${mainName} does not exist`, { ...typechecked, errors: [], sourceCode: new Map() })
  }

  const extraDefsAsText = [`action q::init = ${args.init}`, `action q::step = ${args.step}`]

  const [invariantString, invariantsList] = getInvariants(typechecked.args)
  if (invariantsList.length > 0) {
    extraDefsAsText.push(`val q::inv = and(${invariantString})`)
  }

  if (args.inductiveInvariant) {
    extraDefsAsText.push(`val q::inductiveInv = ${args.inductiveInvariant}`)
  }

  if (args.temporal) {
    extraDefsAsText.push(`temporal q::temporalProps = and(${args.temporal})`)
  }

  const extraDefs = extraDefsAsText.map(d => parseDefOrThrow(d, typechecked.idGen, new Map()))
  main.declarations.push(...extraDefs)

  // We have to update the lookup table and analysis result with the new definitions. This is not ideal, and the problem
  // is that is hard to add this definitions in the proper stage, in our current setup. We should try to tackle this
  // while solving #1052.
  const resolutionResult = parsePhase3importAndNameResolution({ ...typechecked, errors: [] })
  if (resolutionResult.errors.length > 0) {
    const errors = resolutionResult.errors.map(mkErrorMessage(typechecked.sourceMap))
    return cliErr('name resolution failed', { ...typechecked, errors })
  }

  typechecked.table = resolutionResult.table
  analyzeInc(typechecked, typechecked.table, extraDefs)

  // CANNOT be `if (!args.flatten)`, we need to make sure it's a boolean value
  if (args.flatten === false) {
    if (args.target === 'tlaplus') {
      console.warn(chalk.yellow('Warning: flattening is required for TLA+ output, ignoring --flatten=false option.'))
    } else {
      // Early return with the original (unflattened) module and its fields
      return right({
        ...typechecked,
        mainModule: main,
        main: mainName,
        stage: 'compiling',
      })
    }
  }

  // Flatten modules, replacing instances, imports and exports with their definitions
  const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
    typechecked.modules,
    typechecked.table,
    typechecked.idGen,
    typechecked.sourceMap,
    typechecked
  )

  // Pick the main module
  const flatMain = flattenedModules.find(m => m.name === mainName)!

  return right({
    ...typechecked,
    ...flattenedAnalysis,
    mainModule: flatMain,
    table: flattenedTable,
    main: mainName,
    stage: 'compiling',
  })
}

/**
 * Verify a spec via Apalache.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export async function verifySpec(prev: CompiledStage): Promise<CLIProcedure<TracingStage>> {
  const verifying: TracingStage = { ...prev, stage: 'verifying' as stage }
  const verbosityLevel = deriveVerbosity(prev.args)
  return verifyWithApalacheBackend(prev, verifying, verbosityLevel)
}

/** output a compiled spec in the format specified in the `compiled.args.target` to stdout
 *
 * @param compiled The result of a preceding compile stage
 */
export async function outputCompilationTarget(compiled: CompiledStage): Promise<CLIProcedure<CompiledStage>> {
  const stage = 'outputting target'
  const args = compiled.args
  const verbosityLevel = deriveVerbosity(args)
  const target = (compiled.args.target as string).toLowerCase()

  const removeRuns = (module: QuintModule): QuintModule => {
    return { ...module, declarations: module.declarations.filter(d => d.kind !== 'def' || d.qualifier !== 'run') }
  }

  const main =
    target == 'tlaplus'
      ? convertInit(removeRuns(compiled.mainModule), compiled.table, compiled.modes)
      : right(compiled.mainModule)

  if (main.isLeft()) {
    return cliErr('Failed to convert init to predicate', {
      ...compiled,
      errors: main.value.map(mkErrorMessage(compiled.sourceMap)),
    })
  }

  const parsedSpecJson = outputJson({ ...compiled, modules: [main.value], table: compiled.table })
  switch (target) {
    case 'json':
      process.stdout.write(parsedSpecJson)
      return right(compiled)
    case 'tlaplus': {
      const toTlaResult = await compileToTlaplus(
        args.serverEndpoint,
        args.apalacheVersion,
        parsedSpecJson,
        verbosityLevel
      )
      return toTlaResult
        .mapRight(tla => {
          process.stdout.write(tla) // Write out, since all went right
          return compiled
        })
        .mapLeft(err => {
          return {
            msg: err.explanation,
            stage: { ...compiled, stage, status: 'error', errors: err.errors },
          }
        })
    }
    default:
      // This is validated in the arg parsing
      fail(`Invalid option for --target`)
  }
}

/** Write the OutputStage of the procedureStage as JSON, if --out is set
 * Otherwise, report any stage errors to STDOUT
 */
export function outputResult(result: CLIProcedure<ProcedureStage>): void {
  result
    .map(stage => {
      const verbosityLevel = deriveVerbosity(stage.args)
      if (stage.args.out) {
        writeOutputToJson(stage.args.out, stage)
      } else if (!stage.args.outItf && stage.seed && verbosity.hasResults(verbosityLevel)) {
        const backend = stage.args.backend ?? 'typescript'
        console.log(chalk.gray(`Use --seed=0x${stage.seed.toString(16)} --backend=${backend} to reproduce.`))
      }

      process.exit(0)
    })
    .mapLeft(({ msg, stage }) => {
      const { args, errors, sourceCode } = stage
      const verbosityLevel = deriveVerbosity(args)
      if (args.out) {
        writeOutputToJson(args.out, stage)
      } else {
        const finders = createFinders(sourceCode!)
        uniqWith(errors, isEqual).forEach(err => console.error(formatError(sourceCode, finders, err)))
        if (!stage.args.outItf && stage.seed && verbosity.hasResults(verbosityLevel)) {
          const backend = stage.args.backend ?? 'typescript'
          console.log(chalk.gray(`Use --seed=0x${stage.seed.toString(16)} --backend=${backend} to reproduce.`))
        }
        console.error(`error: ${msg}`)
      }
      process.exit(1)
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
