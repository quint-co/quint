/**
 * Define the commands for TNTC
 *
 * See the description at:
 * https://github.com/informalsystems/tnt/blob/main/doc/tntc.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2022
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import JSONbig from 'json-bigint'
import lineColumn from 'line-column'
import { resolve } from 'path'
import { cwd } from 'process'

import { formatError } from './errorReporter'
import { compactSourceMap, ErrorMessage, Loc, parsePhase1, parsePhase2 } from './tntParserFrontend'

import { inferEffects } from './effects/inferrer'
import { checkModes } from './effects/modeChecker'
import { errorTreeToString } from './errorTree'

import { Either, left, right } from '@sweet-monads/either'
import { Effect } from './effects/base'
import { effectToString } from './effects/printing'
import { LookupTableByModule } from './lookupTable'
import { tntRepl } from './repl'
import { TntModule } from './tntIr'
import { TypeScheme } from './types/base'
import { inferTypes } from './types/inferrer'
import { typeSchemeToString } from './types/printing'

export type status = 'loaded' | 'parsed' | 'typechecked'

/** The data from a ProcedureStatus that may be output to --out */
interface OutputStatus {
  status: status,
  warnings: any[], // TODO it doesn't look like this is being used for anything. Should we remove it?
  module?: TntModule,
  types?: Map<bigint, TypeScheme>,
  effects?: Map<bigint, Effect>,
}

// Extract just the parts of a ProcedureStatus that we use for the output
// See https://stackoverflow.com/a/39333479/1187277
function pickOutputStatus(o: ProcedureStatus): OutputStatus {
  const picker = ({status, warnings, module, types, effects} : ProcedureStatus) => (
    {status, warnings, module, types, effects}
  )
  return picker(o)
}

interface ProcedureStatus extends OutputStatus {
  args: any,
}

interface LoadedStatus extends ProcedureStatus {
  // Path to the source file
  path: string,
  sourceCode: string
}

interface ParsedStatus extends LoadedStatus {
  module: TntModule,
  sourceMap: Map<bigint, Loc>,
  table: LookupTableByModule,
}

interface TypecheckedStatus extends ParsedStatus {
  types: Map<bigint, TypeScheme>,
  effects: Map<bigint, Effect>,
}

/** Load a file into a string
 *
 * @param args the CLI arguments parsed by yargs */
export function load(args: any): Either<string, LoadedStatus> {
  if (existsSync(args.input)) {
    try {
      const path = resolve(cwd(), args.input)
      const sourceCode = readFileSync(path, 'utf8')
      return right({
        args,
        path,
        sourceCode,
        status: 'loaded',
        warnings: [],
      })
    } catch (err: unknown) {
      return left(`file ${args.input} could not be opened due to ${err}`)
    }
  } else {
    return left(`file ${args.input} does not exist`)
  }
}


/**
 * Parse a TNT specification.
 *
 * @param loaded the procedure status produced by `load`
 */
export function parse(loaded: LoadedStatus): Either<String, ParsedStatus> {
  const { args, sourceCode, path } = loaded
  return parsePhase1(sourceCode, path)
    .mapLeft(errs => {
      reportParseError(args, sourceCode, errs)
      return "parsing failed in phase 1"
    })
    .chain(phase1Data => {
      if (args.sourceMap) {
        // Write source map to the specified file
        writeToJson(args.sourceMap, compactSourceMap(phase1Data.sourceMap))
      }
      return parsePhase2(phase1Data)
        .mapLeft(errs => {
          reportParseError(args, sourceCode, errs)
          return "parsing failed in phase 2"
        })
    }).map(phase2Data => ({ ...loaded, ...phase2Data, status: 'parsed' }))
}

function reportParseError(argv: any, sourceCode: string, errors: ErrorMessage[]) {
  if (argv.out) {
    // write the errors to the output file
    writeToJson(argv.out, errors)
  } else {
    const finder = lineColumn(sourceCode)
    // write the errors to stderr
    errors.forEach((m) => console.error(formatError(sourceCode, finder, m)))
  }
}


/**
 * Check types and effects of a TNT specification.
 *
 * @param parsed the procedure status produced by `parse`
 */
export function typecheck(parsed: ParsedStatus): Either<String, TypecheckedStatus> {
  const { sourceCode, table, module, sourceMap } = parsed
  const finder = lineColumn(sourceCode)
  const definitionsTable = table
  const [typeErrors, types] = inferTypes(module, definitionsTable)
  types.forEach((value, key) => console.log(`${key}: ${typeSchemeToString(value)}`))

  typeErrors.forEach((value, key) => {
    const loc = sourceMap.get(key)!
    const message: ErrorMessage = {
      explanation: errorTreeToString(value),
      locs: [loc],
    }

    console.error(formatError(sourceCode, finder, message))
  })

  const [errors, effects] = inferEffects(definitionsTable, module)
  effects.forEach((value, key) => console.log(`${key}: ${effectToString(value)}`))

  errors.forEach((value, key) => {
    const loc = sourceMap.get(key)!
    const message: ErrorMessage = {
      explanation: errorTreeToString(value),
      locs: [loc],
    }

    console.error(formatError(sourceCode, finder, message))
  })

  return checkModes(module, effects)
    .map(e => e.forEach((value, key) => console.log(`${key}: ${value}`)))
    .mapLeft(e => {
      e.forEach((value, key) => {
        const loc = sourceMap.get(key)!
        const message: ErrorMessage = {
          explanation: errorTreeToString(value),
          locs: [loc],
        }
        console.error(formatError(sourceCode, finder, message))
      })

      return "typechecking failed"
    })
    .map(_ => ({ ...parsed, types, effects, status: 'typechecked' }))
}

/**
 * Run REPL.
 *
 * @param _argv parameters as provided by yargs
 */
export function runRepl(_argv: any) {
  tntRepl(process.stdin, process.stdout)
}

/** Write the OutputStatus of the procedureStatus as JSON, if --out is set */
export function withJsonToOutput(procedureStatus: ProcedureStatus): Either<String, OutputStatus> {
  const args = procedureStatus.args
  const outputData = pickOutputStatus(procedureStatus)
  // TODO test/handle case of writing to non-existent file
  if (args.out) writeToJson(args.out, outputData);
  return right((outputData))
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
