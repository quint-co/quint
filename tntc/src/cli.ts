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
import { lf } from 'eol'
import JSONbig from 'json-bigint'
import lineColumn from 'line-column'

import { parsePhase1, parsePhase2, ErrorMessage, compactSourceMap } from './tntParserFrontend'
import { formatError } from './errorReporter'

import yargs from 'yargs/yargs'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse (argv: any) {
  // a callback to parse the text that we get from readFile
  const parseText = (text: string) => {
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
    process.exit(0)
  }

  // read either the standard input or an input file
  const reader = async () => {
    await readFile(argv.input, 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        process.exit(99)
      }
      parseText(lf(data))
    })
  }
  reader()
}

function reportError (argv: any, sourceCode: string, result: { kind: 'error', messages: ErrorMessage[] }) {
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
  .demandCommand(1)
  .strict()
  .parse()
