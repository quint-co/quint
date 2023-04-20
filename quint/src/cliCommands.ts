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
import { dirname, basename, resolve } from 'path'
import { cwd } from 'process'
import chalk from 'chalk'

import {
  ErrorMessage, Loc, compactSourceMap, parsePhase1fromText, parsePhase2sourceResolution, parsePhase3importAndNameResolution
} from './quintParserFrontend'

import { Either, left, right } from '@sweet-monads/either'
import { EffectScheme } from './effects/base'
import { LookupTable } from './lookupTable'
import { ReplOptions, quintRepl } from './repl'
import { OpQualifier, QuintEx, QuintModule } from './quintIr'
import { TypeScheme } from './types/base'
import lineColumn from 'line-column'
import { formatError } from './errorReporter'
import { DocumentationEntry, produceDocs, toMarkdown } from './docs'
import { QuintAnalyzer } from './quintAnalyzer'
import { QuintError, quintErrorToString } from './quintError'
import { TestOptions, TestResult, compileAndTest } from './runtime/testing'
import { newIdGenerator } from './idGenerator'
import { SimulatorOptions, compileAndRun } from './simulation'
import { toItf } from './itf'
import { printTrace, printExecutionFrameRec } from './graphics'
import { verbosity } from './verbosity'
import { Rng, newRng } from './rng'
import { fileSourceResolver } from './sourceResolver'

export type stage =
  'loading' | 'parsing' | 'typechecking' |
  'testing' | 'running' | 'documentation'

/** The data from a ProcedureStage that may be output to --out */
interface OutputStage {
  stage: stage,
  // the modules and the lookup table produced by 'parse'
  modules?: QuintModule[],
  table?: LookupTable,
  // the tables produced by 'typecheck'
  types?: Map<bigint, TypeScheme>,
  effects?: Map<bigint, EffectScheme>,
  modes?: Map<bigint, OpQualifier>,
  // Test names output produced by 'test'
  passed?: string[],
  failed?: string[],
  ignored?: string[],
  // Test names output produced by 'run'
  status?: 'ok' | 'violation' | 'failure',
  trace?: QuintEx[],
  /* Docstrings by defintion name by module name */
  documentation?: Map<string, Map<string, DocumentationEntry>>,
  errors?: ErrorMessage[],
  warnings?: any[], // TODO it doesn't look like this is being used for anything. Should we remove it?
  sourceCode?: string, // Should not printed, only used in formatting errors
}

// Extract just the parts of a ProcedureStage that we use for the output
// See https://stackoverflow.com/a/39333479/1187277
function pickOutputStage(o: ProcedureStage): OutputStage {
  const picker = ({
    stage, warnings, modules, table, types, effects, errors, documentation,
    passed, failed, ignored, status, trace,
  }: ProcedureStage) => {
    switch (o.stage) {
      case 'parsing':
        if (o.args.withLookup) {
          return { stage, warnings, modules, table, errors }
        } else {
          return { stage, warnings, modules, errors }
        }

      case 'testing':
        return { stage, errors, passed, failed, ignored }

      case 'running':
        return { stage, errors, status, trace }

      default:
        return {
          stage, warnings, modules, types, effects, errors,
          passed, failed, ignored, documentation,
        }
    }
  }
  return picker(o)
}

interface ProcedureStage extends OutputStage {
  args: any,
}

interface LoadedStage extends ProcedureStage {
  // Path to the source file
  path: string,
  sourceCode: string
}

interface ParsedStage extends LoadedStage {
  modules: QuintModule[],
  sourceMap: Map<bigint, Loc>,
  table: LookupTable,
}

interface TypecheckedStage extends ParsedStage {
  types: Map<bigint, TypeScheme>,
  effects: Map<bigint, EffectScheme>,
  modes: Map<bigint, OpQualifier>,
}

interface TestedStage extends LoadedStage {
  // the names of the passed tests
  passed: string[],
  // the names of the failed tests
  failed: string[],
  // the names of the ignored tests
  ignored: string[],
}

interface SimulatorStage extends LoadedStage {
  status: 'ok' | 'violation' | 'failure',
  trace?: QuintEx[],
}

interface DocumentationStage extends LoadedStage {
  documentation?: Map<string, Map<string, DocumentationEntry>>,
}

// A procedure stage which is guaranteed to have `errors` and `sourceCode`
interface ErrorData extends ProcedureStage {
  errors: ErrorMessage[],
  sourceCode: string
}

type ErrResult = { msg: String, stage: ErrorData }

function cliErr<Stage>(msg: String, stage: ErrorData): Either<ErrResult, Stage> {
  return left({ msg, stage })
}

export type CLIProcedure<Stage> = Either<ErrResult, Stage>

/** Load a file into a string
 *
 * @param args the CLI arguments parsed by yargs */
export function load(args: any): CLIProcedure<LoadedStage> {
  const stage: ProcedureStage = { stage: 'loading', args }
  if (existsSync(args.input)) {
    try {
      const path = resolve(cwd(), args.input)
      const sourceCode = readFileSync(path, 'utf8')
      return right({
        ...stage,
        args,
        path,
        sourceCode,
        warnings: [],
      })
    } catch (err: unknown) {
      return cliErr(`file ${args.input} could not be opened due to ${err}`, { ...stage, errors: [], sourceCode: '' })
    }
  } else {
    return cliErr(`file ${args.input} does not exist`, { ...stage, errors: [], sourceCode: '' })
  }
}


/**
 * Parse a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export function parse(loaded: LoadedStage): CLIProcedure<ParsedStage> {
  const { args, sourceCode, path } = loaded
  const parsing = { ...loaded, stage: 'parsing' as stage }
  const idgen = newIdGenerator()
  return parsePhase1fromText(idgen, sourceCode, path)
    .chain(phase1Data => {
      const resolver = fileSourceResolver()
      const mainPath = resolver.lookupPath(dirname(path), basename(path))
      return parsePhase2sourceResolution(idgen, resolver, mainPath, phase1Data)
    })
    .mapLeft(newErrs => {
      const errors = parsing.errors ? parsing.errors.concat(newErrs) : newErrs
      return { msg: "parsing failed", stage: { ...parsing, errors } }
    })
    .chain(phase1Data => {
      if (args.sourceMap) {
        // Write source map to the specified file
        writeToJson(args.sourceMap, compactSourceMap(phase1Data.sourceMap))
      }
      return parsePhase3importAndNameResolution(phase1Data)
        .mapLeft(newErrs => {
          const errors = parsing.errors ? parsing.errors.concat(newErrs) : newErrs
          return { msg: "parsing failed", stage: { ...parsing, errors } }
        })
    })
    .map(phase2Data => ({ ...parsing, ...phase2Data }))
}

export function mkErrorMessage(sourceMap: Map<bigint, Loc>): (_: [bigint, QuintError]) => ErrorMessage {
  return ([key, value]) => {
    const loc = sourceMap.get(key)!
    return {
      explanation: quintErrorToString(value),
      locs: [loc],
    }
  }
}
/**
 * Check types and effects of a Quint specification.
 *
 * @param parsed the procedure stage produced by `parse`
 */
export function typecheck(parsed: ParsedStage): CLIProcedure<TypecheckedStage> {
  const { table, modules, sourceMap } = parsed
  const typechecking = { ...parsed, stage: 'typechecking' as stage }

  const analyzer = new QuintAnalyzer(table)
  modules.forEach(module => analyzer.analyze(module))
  const [errorMap, result] = analyzer.getResult()

  if (errorMap.length === 0) {
    return right({ ...typechecking, ...result })
  } else {
    const errorLocator = mkErrorMessage(sourceMap)
    const errors = Array.from(errorMap, errorLocator)
    return cliErr("typechecking failed", { ...typechecking, errors })
  }
}

/**
 * Run REPL.
 *
 * @param _argv parameters as provided by yargs
 */
export function runRepl(_argv: any) {
  let filename: string | undefined = undefined
  let moduleName: string | undefined = undefined
  if (_argv.require) {
    const m = /^(.*?)(?:|::([a-zA-Z_]\w*))$/.exec(_argv.require)
    if (m) {
      [ filename, moduleName ] = m.slice(1, 3)
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
export function runTests(prev: TypecheckedStage): CLIProcedure<TestedStage> {
  const verbosityLevel = !prev.args.out ? prev.args.verbosity : 0
  const out = console.log

  const testing = { ...prev, stage: 'testing' as stage }
  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')
  const main = prev.modules.find(m => m.name === mainName)
  if (!main) {
    return left({
      msg: `Module ${mainName} not found`,
      stage: { ...prev, errors: [] },
    })
  } else {
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

    const matchFun =
      (n: string): boolean => isMatchingTest(testing.args.match, n)
    const options: TestOptions = {
      testMatch: matchFun,
      maxSamples: testing.args.maxSamples,
      rng,
      verbosity: verbosityLevel,
    }
    const testOut =
      compileAndTest(testing.modules, main,
                     testing.sourceMap, testing.table, testing.types, options)
    if (testOut.isLeft()) {
      return cliErr("Tests failed", { ...testing, errors: testOut.value })
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

            res.errors.forEach(e => namedErrors.push([res.name, e, res]))
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
          out(chalk.green(`  ${passed.length} passing`) +
                      chalk.gray(` (${elapsedMs}ms)`))
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
        const finder = lineColumn(code)
        out('')
        namedErrors.forEach(([name, err, testResult], index) => {
          const details = formatError(code, finder, err)
          // output the header
          out(`  ${index + 1}) ${name}:`)
          const lines = details.split('\n')
          // output the first two lines in red
          lines.slice(0, 2).forEach(l =>
            out(chalk.red('      ' + l))
          )

          if (verbosity.hasActionTracking(verbosityLevel)) {
            out('')
            testResult.frames.forEach((f, index) => {
              out(`    [Frame ${index}]`)
              printExecutionFrameRec(l => out('    ' + l), f, [])
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

      if (failed.length > 0 && verbosity.hasHints(options.verbosity)
          && !verbosity.hasActionTracking(options.verbosity)) {
        out(chalk.gray('\n  Use --verbosity=3 to show executions.'))
      }
    }

    const errors = namedErrors.map(([_, e]) => e)
    const stage = { ...testing, passed, failed, ignored, errors }
    if (errors.length == 0 && failed.length == 0) {
      return right(stage)
    } else {
      return cliErr("Tests failed", stage)
    }
  }
}

/**
 * Run the simulator.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export function runSimulator(prev: TypecheckedStage):
  CLIProcedure<SimulatorStage> {
  const simulator = { ...prev, stage: 'running' as stage }
  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')
  const verbosityLevel =
    (!prev.args.out && !prev.args.outItf) ? prev.args.verbosity : 0
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
  
  const mainPath =
    fileSourceResolver().lookupPath(dirname(prev.args.input), basename(prev.args.input))
  const result =
    compileAndRun(newIdGenerator(), prev.sourceCode, mainName, mainPath, options)
  
  if (result.status === 'error') {
      const errors =
        prev.errors ? prev.errors.concat(result.errors) : result.errors
      return cliErr('run failed', { ...simulator, errors })
  } else {
      if (verbosity.hasResults(verbosityLevel)) {
        const elapsedMs = Date.now() - startMs
        if (verbosity.hasStateOutput(options.verbosity)) {
          console.log(chalk.gray('An example execution:\n'))
          printTrace(console.log, result.states, result.frames)
        }
        if (result.status === 'ok') {
          console.log(chalk.green('[ok]')
            + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).`))
          if (verbosity.hasHints(options.verbosity)) {
            console.log(chalk.gray('You may increase --max-samples and --max-steps.'))
            console.log(chalk.gray('Use --verbosity to produce more (or less) output.'))
          }
        } else {
          console.log(chalk.red(`[${result.status}]`)
            + ' Found an issue ' + chalk.gray(`(${elapsedMs}ms).`))
          console.log(chalk.gray(`Use --seed=0x${result.seed.toString(16)} to reproduce.`))

          if (verbosity.hasHints(options.verbosity)) {
            console.log(chalk.gray('Use --verbosity=3 to show executions.'))
          }
        }
      }

      if (prev.args.outItf) {
        const trace = toItf(result.vars, result.states)
        if (trace.isRight()) {
          const jsonObj = {
            '#meta': {
              'format': 'ITF',
              'format-description': 'https://apalache.informal.systems/docs/adr/015adr-trace.html',
              'source': prev.args.input,
              'status': result.status,
              'description': 'Created by Quint on ' + new Date(),
              'timestamp': Date.now(),
            },
            ...trace.value,
          }
          writeToJson(prev.args.outItf, jsonObj)
        } else {
          const newStage = { ...simulator, errors: result.errors }
          return cliErr(`ITF conversion failed: ${trace.value}`, newStage)
        }
      }

      // If nothing found, return a success. Otherwise, return an error.
      let msg
      switch (result.status) {
        case 'ok':
          return right({
              ...simulator,
              status: result.status,
              trace: result.states,
          })

        case 'violation':
          msg = 'Invariant violated'
          break

        case 'failure':
          msg = 'Runtime error'
          break

        default:
          msg = 'Unknown error'
      }

      return cliErr(msg, {
            ...simulator,
            status: result.status,
            trace: result.states,
            errors: result.errors,
          })
    }
}

/**
 * Produces documentation from docstrings in a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export function docs(loaded: LoadedStage): CLIProcedure<DocumentationStage> {
  const { sourceCode, path } = loaded
  const parsing = { ...loaded, stage: 'documentation' as stage }
  return parsePhase1fromText(newIdGenerator(), sourceCode, path)
    .mapLeft(newErrs => {
      const errors = parsing.errors ? parsing.errors.concat(newErrs) : newErrs
      return { msg: "parsing failed", stage: { ...parsing, errors } }
    })
    .map(phase1Data => {
      const allEntries: [string, Map<string, DocumentationEntry>][] = phase1Data.modules.map(module => {
        const documentationEntries = produceDocs(module)
        const title = `# Documentation for ${module.name}\n\n`
        const markdown = title + [...documentationEntries.values()].map(toMarkdown).join('\n\n')
        console.log(markdown)

        return [module.name, documentationEntries]
      })
      return { ...parsing, documentation: new Map(allEntries) }
    })
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
        const finder = lineColumn(sourceCode!)
        errors.forEach(err => console.error(formatError(sourceCode, finder, err)))
        console.error(`error: ${msg}`)
      }
      process.exit(1)
    })
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

/**
 * Write json to a file.
 *
 * @param filename name of the file to write to
 * @param json is an object tree to write
 */
function writeToJson(filename: string, json: any) {
  const path = resolve(cwd(), filename)
  writeFileSync(path, JSONbig.stringify(json, replacer))
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
