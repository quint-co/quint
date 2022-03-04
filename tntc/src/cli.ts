#!/usr/bin/env node

/**
 * Command-line interface for tntc.
 *
 * See the description at:
 * https://github.com/informalsystems/tnt/blob/main/doc/tntc.md
 *
 * @author Igor Konnov, Informal Systems, 2021
 */

import { readFile, writeFileSync } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'
import JSONbig = require('json-bigint')

// TODO: move this interface definition to another file
import { Loc } from './ToIrListener'
import { parsePhase1, parsePhase2, ErrorMessage } from './tntParserFrontend'
import { NameError } from './nameResolver'

import yargs from 'yargs/yargs'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse (argv: any) {
  // a callback to parse the text that we get from readFile
  const parseText = (text: string) => {
    const phase1Result = parsePhase1(text)
    if (phase1Result.kind === 'error') {
      reportPhase1Error(argv, phase1Result)
      process.exit(1)
    }

    const phase2Result = parsePhase2(phase1Result.module)
    if (phase2Result.kind === 'error') {
      reportPhase2Error(argv, phase2Result, phase1Result.sourceMap)
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
    // TODO: write source map (issue #20)
    process.exit(0)
  }

  // read either the standard input or an input file
  const reader = async () => {
    await readFile(argv.input, 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        process.exit(99)
      }
      parseText(data)
    })
  }
  reader()
}

function reportPhase1Error (argv: any, result: { kind: 'error', messages: ErrorMessage[] }) {
  if (argv.out) {
    // write the errors to the output file
    writeToJson(argv.out, result)
  } else {
    // write the errors to stderr
    result.messages.forEach((m) => {
      // TODO: use m.source instead of argv.input (issue #21)
      const loc = `${argv.input}:${m.start.line + 1}:${m.start.col + 1}`
      console.error(`${loc} - error ${m.explanation}`)
    })
  }
}

function reportPhase2Error (argv: any, result: { kind: 'error', errors: NameError[] }, sourceMap: Map<BigInt, Loc>) {
  if (argv.out) {
    // write the errors to the output file
    writeToJson(argv.out, result)
  } else {
    // TODO: add locs for these errors (issue #41)
    result.errors.forEach(error => {
      console.error(`Couldn't resolve name ${error.name} in definition for ${error.definitionName}`)
      error.trace.forEach(a => console.error('in', sourceMap.get(a.id)))
    })
  }
}

/**
 * Write json to a file.
 *
 * @param filename name of the file to write to
 * @param json is an object tree to write
 */
function writeToJson (filename: string, json: any) {
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

// parse the command-line arguments and execute the handlers
yargs(process.argv.slice(2))
  .command(parseCmd)
  .strict()
  .parse()
