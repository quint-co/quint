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

import { parsePhase1, parsePhase2 } from './tntParserFrontend'

import yargs from 'yargs/yargs'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse (argv: any) {
  // a callback to parse the text that we get from readFile
  const parseText = (text: string) => {
    const result = parsePhase1(text)
    if (result.kind !== 'error') {
      parsePhase2(result.module)
      // TODO: check result from phase 2
      if (argv.out) {
        // write the parsed IR to the output file
        writeToJson(argv.out, {
          status: 'parsed',
          warnings: [],
          module: result.module
        })
      }
      // TODO: write source map (issue #20)
      process.exit(0)
    } else {
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
      process.exit(1)
    }
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
        type: 'string'
      })
      .option('source-map', {
        desc: 'name of the source map',
        type: 'string'
      }),
  handler: parse
}

// parse the command-line arguments and execute the handlers
yargs(process.argv.slice(2))
  .command(parseCmd)
  .strict()
  .parse()
