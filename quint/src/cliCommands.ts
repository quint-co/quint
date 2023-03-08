/**
 * Define the commands for QuintC
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2022
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import JSONbig from 'json-bigint'
import { basename, resolve } from 'path'
import { cwd } from 'process'
import chalk from 'chalk'
import seedrandom from 'seedrandom'

import {
  ErrorMessage, Loc, compactSourceMap, parsePhase1, parsePhase2
} from './quintParserFrontend'

import { Either, left, right } from '@sweet-monads/either'
import { EffectScheme } from './effects/base'
import { LookupTableByModule } from './lookupTable'
import { ReplOptions, quintRepl } from './repl'
import { OpQualifier, QuintEx, QuintModule } from './quintIr'
import { TypeScheme } from './types/base'
import lineColumn from 'line-column'
import { formatError } from './errorReporter'
import { DocumentationEntry, produceDocs, toMarkdown } from './docs'
import { QuintAnalyzer } from './quintAnalyzer'
import { QuintError, quintErrorToString } from './quintError'
import { compileAndTest } from './runtime/testing'
import { newIdGenerator } from './idGenerator'
import { SimulatorOptions, compileAndRun, printTrace } from './simulation'

export type stage =
  'loading' | 'parsing' | 'typechecking' |
  'testing' | 'running' | 'documentation'

/** The data from a ProcedureStage that may be output to --out */
interface OutputStage {
  stage: stage,
  // the modules and the lookup table produced by 'parse'
  modules?: QuintModule[],
  table?: LookupTableByModule,
  // the tables produced by 'typecheck'
  types?: Map<bigint, TypeScheme>,
  effects?: Map<bigint, EffectScheme>,
  modes?: Map<bigint, OpQualifier>,
  // Test names output produced by 'test'
  passed?: string[],
  failed?: string[],
  ignored?: string[],
  // Test names output produced by 'run'
  status?: 'ok' | 'violation',
  trace?: QuintEx,
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
  table: LookupTableByModule,
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
  status: 'ok' | 'violation',
  trace?: QuintEx,
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
  return parsePhase1(newIdGenerator(), sourceCode, path)
    .mapLeft(newErrs => {
      const errors = parsing.errors ? parsing.errors.concat(newErrs) : newErrs
      return { msg: "parsing failed", stage: { ...parsing, errors } }
    })
    .chain(phase1Data => {
      if (args.sourceMap) {
        // Write source map to the specified file
        writeToJson(args.sourceMap, compactSourceMap(phase1Data.sourceMap))
      }
      return parsePhase2(phase1Data)
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
  }
  quintRepl(process.stdin, process.stdout, options)
}

/**
 * Run the tests. We imitate the output of mocha.
 *
 * @param typedStage the procedure stage produced by `typecheck`
 */
export function runTests(prev: TypecheckedStage): CLIProcedure<TestedStage> {
  // output to the console, unless the json output is enabled
  const isConsole = !prev.args.out
  function out(text: string): void {
    if (isConsole) {
      console.log(text)
    }
  }

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
    let passed: string[] = []
    let failed: string[] = []
    let ignored: string[] = []
    let namedErrors: [string, ErrorMessage][] = []

    const startMs = Date.now()
    out(`\n  ${mainName}`)

    const matchFun =
      (n: string): boolean => isMatchingTest(prev.args.match, n)

    const testOut =
      compileAndTest(prev.modules, main, prev.sourceMap,
                     prev.table, prev.types, matchFun, mkRng(prev.args.seed))
    if (testOut.isRight()) {
      const elapsedMs = Date.now() - startMs
      const results = testOut.unwrap()
      // output the status for every test
      results.forEach(res => {
        if (res.status === 'passed') {
          out('    ' + chalk.green('ok ') + res.name)
        }
        if (res.status === 'failed') {
          const errNo = namedErrors.length + 1
          out('    ' + chalk.red(`${errNo}) `)  + res.name)

          res.errors.forEach(e => namedErrors.push([res.name, e]))
        }
      })

      // output the statistics banner
      const passed = results.filter(r => r.status === 'passed').map(r => r.name)
      const failed = results.filter(r => r.status === 'failed').map(r => r.name)
      const ignored = results.filter(r => r.status === 'ignored').map(r => r.name)
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

      // output errors, if there are any
      if (isConsole && namedErrors.length > 0) {
        const code = prev.sourceCode!
        const finder = lineColumn(code)
        out('')
        namedErrors.forEach(([name, err], index) => {
          const details = formatError(code, finder, err)
          // output the header
          out(`  ${index + 1}) ${name}:`)
          const lines = details.split('\n')
          // output the first line in red
          if (lines.length > 0) {
            out(chalk.red('      ' + lines[0]))
          }
          // and the rest in gray
          lines.slice(1).forEach(line => {
            out(chalk.gray('      ' + line))
          })
        })
        out('')
      }
    } // else: we have handled the case of module not found already

    const errors = namedErrors.map(([_, e]) => e)
    return right({ ...testing, passed, failed, ignored, errors })
  }
}

/**
 * Run the simulator.
 *
 * @param prev the procedure stage produced by `typecheck`
 */
export function runSimulator(prev: TypecheckedStage):
  CLIProcedure<SimulatorStage> {
  const mainArg = prev.args.main
  const mainName = mainArg ? mainArg : basename(prev.args.input, '.qnt')
  const options: SimulatorOptions = {
    init: prev.args.init,
    step: prev.args.step,
    invariant: prev.args.invariant,
    maxSamples: prev.args.maxSamples,
    maxSteps: prev.args.maxSteps,
    rand: mkRng(prev.args.seed),
  }
  const startMs = Date.now()
  const simulator = { ...prev, stage: 'running' as stage }
  return compileAndRun(newIdGenerator(), prev.sourceCode, mainName, options)
    .map(result => {
      const isConsole = !prev.args.out
      if (isConsole) {
        const elapsedMs = Date.now() - startMs
        console.log(result.status === 'ok'
          ? chalk.green('[ok]')
            + ' No violation found ' + chalk.gray(`(${elapsedMs}ms).\n`)
            + chalk.gray(' You may increase --max-samples and --max-steps.\n')
            + '\nSee the example:'
          : chalk.red('[violation]') + chalk.gray(` (${elapsedMs}ms).`)
            + chalk.gray(' See the example:'))
        console.log('---------------------------------------------')
        printTrace(console.log, result.trace)
        console.log('---------------------------------------------')
      }

      return {
        ...simulator,
        status: result.status,
        trace: result.trace,
      }
    })
    .mapLeft(newErrs => {
      const errors = prev.errors ? prev.errors.concat(newErrs) : newErrs
      const newStage = { ...simulator, errors }
      return { msg: 'run failed', stage: newStage }
    })
}

/**
 * Produces documentation from docstrings in a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export function docs(loaded: LoadedStage): CLIProcedure<DocumentationStage> {
  const { sourceCode, path } = loaded
  const parsing = { ...loaded, stage: 'documentation' as stage }
  return parsePhase1(newIdGenerator(), sourceCode, path)
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
function mkRng(seed: string | undefined): () => number {
  if (seed) {
    return seedrandom(seed)
  } else {
    return seedrandom()
  }
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
