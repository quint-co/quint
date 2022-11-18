#!/usr/bin/env node

/**
 * Command-line interface for tntc.
 *
 * See the description at:
 * https://github.com/informalsystems/tnt/blob/main/doc/tntc.md
 *
 * @author Igor Konnov, Gabriela Moreira, Informal Systems, 2021-2022
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'
import { lf } from 'eol'
import JSONbig from 'json-bigint'
import lineColumn from 'line-column'

import { ErrorMessage, Phase1Result, compactSourceMap, parsePhase1, parsePhase2 } from './tntParserFrontend'
import { formatError } from './errorReporter'

import yargs from 'yargs/yargs'
import { inferEffects } from './effects/inferrer'
import { checkModes } from './effects/modeChecker'
import { LookupTableByModule } from './lookupTable'
import { errorTreeToString } from './errorTree'

import { tntRepl } from './repl'
import { inferTypes } from './types/inferrer'
import { effectToString } from './effects/printing'
import { typeSchemeToString } from './types/printing'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse(argv: any) {
  parseModule(argv)
  process.exit(0)
}

/**
 * Check types (TBD) and effects of a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function typecheck(argv: any) {
  const [parseResult, definitionsTable, sourceCode] = parseModule(argv)

  if (parseResult.kind === 'error') {
    process.exit(1)
  }
  const finder = lineColumn(sourceCode)

  const [typeErrors, types] = inferTypes(parseResult.module, definitionsTable)
  types.forEach((value, key) => console.log(`${key}: ${typeSchemeToString(value)}`))

  typeErrors.forEach((value, key) => {
    const loc = parseResult.sourceMap.get(key)!
    const message: ErrorMessage = {
      explanation: errorTreeToString(value),
      locs: [loc],
    }

    console.error(formatError(sourceCode, finder, message))
  })

  const [errors, effects] = inferEffects(definitionsTable, parseResult.module)
  effects.forEach((value, key) => console.log(`${key}: ${effectToString(value)}`))

  errors.forEach((value, key) => {
    const loc = parseResult.sourceMap.get(key)!
    const message: ErrorMessage = {
      explanation: errorTreeToString(value),
      locs: [loc],
    }

    console.error(formatError(sourceCode, finder, message))
  })

  const modes = checkModes(parseResult.module, effects)
  const finalResult = modes
    .map(e => e.forEach((value, key) => console.log(`${key}: ${value}`)))
    .mapLeft(e => e.forEach((value, key) => {
      const loc = parseResult.sourceMap.get(key)!
      const message: ErrorMessage = {
        explanation: errorTreeToString(value),
        locs: [loc],
      }
      console.error(formatError(sourceCode, finder, message))
    }))

  finalResult.isRight() ? process.exit(0) : process.exit(1)
}

/**
 * Run REPL.
 *
 * @param _argv parameters as provided by yargs
 */
function runRepl(_argv: any) {
  tntRepl(process.stdin, process.stdout)
}

// read either the standard input or an input file
function parseModule(argv: any): [Phase1Result, LookupTableByModule, string] {
  const data = readFileSync(argv.input, 'utf8')
  return parseText(argv, lf(data))
}

// a callback to parse the text that we get from readFile
function parseText(argv: any, text: string): [Phase1Result, LookupTableByModule, string] {
  const path = resolve(cwd(), argv.input)
  const phase1Result = parsePhase1(text, path)
  if (phase1Result.kind === 'error') {
    reportError(argv, text, phase1Result)
    process.exit(1)
  }

  if (argv.sourceMap) {
    // Write source map to the specified file
    writeToJson(argv.sourceMap, compactSourceMap(phase1Result.sourceMap))
  }

  const phase2Result = parsePhase2(phase1Result.module, phase1Result.sourceMap)
  if (phase2Result.kind === 'error') {
    reportError(argv, text, phase2Result)
    process.exit(1)
  }

  if (argv.out) {
    // write the parsed IR to the output file
    writeToJson(argv.out, {
      status: 'parsed',
      warnings: [],
      module: phase1Result.module,
    })
  }

  return [phase1Result, phase2Result.table, text]
}

function reportError(argv: any, sourceCode: string, result: { kind: 'error', messages: ErrorMessage[] }) {
  if (argv.out) {
    // write the errors to the output file
    writeToJson(argv.out, result)
  } else {
    const finder = lineColumn(sourceCode)
    // write the errors to stderr
    result.messages.forEach((m) => console.error(formatError(sourceCode, finder, m)))
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
  handler: parse,
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
  handler: typecheck,
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
