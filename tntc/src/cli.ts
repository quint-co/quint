#!/usr/bin/env node

/**
 * Command-line interface for tntc.
 *
 * See the description at:
 * https://github.com/informalsystems/tnt/blob/main/doc/tntc.md
 *
 * @author Igor Konnov, Gabriela Moreira, Informal Systems, 2021-2022
 */

import { PathLike, existsSync, readFileSync, writeFileSync } from 'fs'
import JSONbig from 'json-bigint'
import lineColumn from 'line-column'
import { resolve } from 'path'
import { cwd } from 'process'

import { formatError } from './errorReporter'
import { ErrorMessage, ParserPhase2, compactSourceMap, parsePhase1, parsePhase2 } from './tntParserFrontend'

import yargs from 'yargs/yargs'
import { inferEffects } from './effects/inferrer'
import { checkModes } from './effects/modeChecker'
import { errorTreeToString } from './errorTree'

import { Either, left, right } from '@sweet-monads/either'
import { Arguments } from 'yargs'
import { effectToString } from './effects/printing'
import { tntRepl } from './repl'
import { inferTypes } from './types/inferrer'
import { typeSchemeToString } from './types/printing'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse(argv: any): Either<String, [ParserPhase2, string]> {
  return loadFile(argv.input).chain(text => parseText(argv, text))
}

/**
 * Check types and effects of a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
// TODO Should return Phase2 parsing data + typing data
function typecheck(argv: any): Either<String, void> {
  return parse(argv).chain(d => {
    const [parseData, sourceCode] = d
    const finder = lineColumn(sourceCode)
    const definitionsTable = parseData.table
    const [typeErrors, types] = inferTypes(parseData.module, definitionsTable)
    types.forEach((value, key) => console.log(`${key}: ${typeSchemeToString(value)}`))

    typeErrors.forEach((value, key) => {
      const loc = parseData.sourceMap.get(key)!
      const message: ErrorMessage = {
        explanation: errorTreeToString(value),
        locs: [loc],
      }

      console.error(formatError(sourceCode, finder, message))
    })

    const [errors, effects] = inferEffects(definitionsTable, parseData.module)
    effects.forEach((value, key) => console.log(`${key}: ${effectToString(value)}`))

    errors.forEach((value, key) => {
      const loc = parseData.sourceMap.get(key)!
      const message: ErrorMessage = {
        explanation: errorTreeToString(value),
        locs: [loc],
      }

      console.error(formatError(sourceCode, finder, message))
    })

    return checkModes(parseData.module, effects)
      .map(e => e.forEach((value, key) => console.log(`${key}: ${value}`)))
      .mapLeft(e => {
        e.forEach((value, key) => {
          const loc = parseData.sourceMap.get(key)!
          const message: ErrorMessage = {
            explanation: errorTreeToString(value),
            locs: [loc],
          }
          console.error(formatError(sourceCode, finder, message))
        })

        return "typechecking failed"
      })
  })
}

/**
 * Run REPL.
 *
 * @param _argv parameters as provided by yargs
 */
function runRepl(_argv: any) {
  tntRepl(process.stdin, process.stdout)
}

// Load a file into a string
function loadFile(p: PathLike): Either<string, string> {
  if (existsSync(p)) {
    try {
      return right(readFileSync(p, 'utf8'))
    } catch (err: unknown) {
      return left(`file ${p} could not be opened due to ${err}`)
    }
  } else {
    return left(`file ${p} does not exist`)
  }
}

// a callback to parse the text that we get from readFile
function parseText(argv: any, text: string): Either<String, [ParserPhase2, string]> {
  const path = resolve(cwd(), argv.input)
  return parsePhase1(text, path)
    .mapLeft(errs => {
      reportParseError(argv, text, errs)
      return "parsing failed in phase 1"
    })
    .chain(phase1Data => {
      if (argv.sourceMap) {
        // Write source map to the specified file
        writeToJson(argv.sourceMap, compactSourceMap(phase1Data.sourceMap))
      }
      return parsePhase2(phase1Data)
        .mapLeft(errs => {
          reportParseError(argv, text, errs)
          return "parsing failed in phase 2"
        })
    }).map(phase2Data => {
      // TODO move into helper combinator
      if (argv.out) {
        // write the parsed IR to the output file
        writeToJson(argv.out, {
          status: 'parsed',
          warnings: [],
          module: phase2Data.module,
        })
      }
      return [phase2Data, text]
    })
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
 * Write json to a file.
 *
 * @param filename name of the file to write to
 * @param json is an object tree to write
 */
function writeToJson(filename: string, json: any) {
  const path = resolve(cwd(), filename)
  writeFileSync(path, JSONbig.stringify(json))
}

function handleCmd<A>(cmd: (_: Arguments) => Either<String, A>): (_: Arguments) => void {
  return (args) => {
    cmd(args)
      .mapLeft(msg => { console.error(`error: ${msg}`); process.exit(1) })
      .mapRight(_ => process.exit(0))
  }
}

// construct parsing commands with yargs
const parseCmd = {
  command: 'parse <input>',
  desc: 'parse a TNT specification',
  builder: (yargs: any) =>
    yargs
      .option('out', {
        desc: 'output file',
        type: 'string',
      })
      .option('source-map', {
        desc: 'name of the source map',
        type: 'string',
      }),
  handler: handleCmd(parse),
}

// construct typecheck commands with yargs
const typecheckCmd = {
  command: 'typecheck <input>',
  desc: 'check types (TBD) and effects of a TNT specification',
  builder: (yargs: any) =>
    yargs
      .option('out', {
        desc: 'output file',
        type: 'string',
      }),
  handler: handleCmd(typecheck),
}

// construct repl commands with yargs
const replCmd = {
  command: 'repl',
  desc: 'run REPL',
  builder: (yargs: any) =>
    yargs,
  handler: runRepl,
}

// parse the command-line arguments and execute the handlers
yargs(process.argv.slice(2))
  .command(parseCmd)
  .command(typecheckCmd)
  .command(replCmd)
  .demandCommand(1)
  .strict()
  .parse()
