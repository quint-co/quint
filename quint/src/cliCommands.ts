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
import { resolve } from 'path'
import { cwd } from 'process'

import { ErrorMessage, Loc, compactSourceMap, parsePhase1, parsePhase2 } from './quintParserFrontend'


import { Either, left, right } from '@sweet-monads/either'
import { Effect } from './effects/base'
import { LookupTableByModule } from './lookupTable'
import { ReplOptions, quintRepl } from './repl'
import { OpQualifier, QuintModule } from './quintIr'
import { TypeScheme } from './types/base'
import lineColumn from 'line-column'
import { formatError } from './errorReporter'
import { DocumentationEntry, produceDocs, toMarkdown } from './docs'
import { QuintAnalyzer } from './quintAnalyzer'
import { QuintError, quintErrorToString } from './quintError'

export type stage = 'loading' | 'parsing' | 'typechecking' | 'documentation'

/** The data from a ProcedureStage that may be output to --out */
interface OutputStage {
  stage: stage,
  modules?: QuintModule[],
  types?: Map<bigint, TypeScheme>,
  effects?: Map<bigint, Effect>,
  modes?: Map<bigint, OpQualifier>,
  /* Docstrings by defintion name by module name */
  documentation?: Map<string, Map<string, DocumentationEntry>>,
  errors?: ErrorMessage[],
  warnings?: any[], // TODO it doesn't look like this is being used for anything. Should we remove it?
  sourceCode?: string, // Should not printed, only used in formatting errors
}

// Extract just the parts of a ProcedureStage that we use for the output
// See https://stackoverflow.com/a/39333479/1187277
function pickOutputStage(o: ProcedureStage): OutputStage {
  const picker = ({ stage, warnings, modules, types, effects, errors, documentation }: ProcedureStage) => (
    { stage, warnings, modules, types, effects, errors, documentation }
  )
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
  effects: Map<bigint, Effect>,
  modes: Map<bigint, OpQualifier>,
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
  return parsePhase1(sourceCode, path)
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
 * Produces documentation from docstrings in a Quint specification.
 *
 * @param loaded the procedure stage produced by `load`
 */
export function docs(loaded: LoadedStage): CLIProcedure<DocumentationStage> {
  const { sourceCode, path } = loaded
  const parsing = { ...loaded, stage: 'documentation' as stage }
  return parsePhase1(sourceCode, path)
    .mapLeft(newErrs => {
      const errors = parsing.errors ? parsing.errors.concat(newErrs) : newErrs
      return { msg: "parsing failed", stage: { ...parsing, errors } }
    })
    .map(phase1Data => {
      const allEntries: [string, Map<string, DocumentationEntry>][] = phase1Data.modules.map(module => {
        const documentationEntries = produceDocs(module)
        const title = `# Documentation for ${module.name}\n\n`
        const markdown = title + [...documentationEntries.values()].map(toMarkdown).join('\n\n')
        writeToFile(`${module.name}.md`, markdown)

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
 * Write text to a file.
 *
 * @param filename name of the file to write to
 * @param text is a string to write
 */
function writeToFile(filename: string, text: string) {
  const path = resolve(cwd(), filename)
  writeFileSync(path, text)
}
