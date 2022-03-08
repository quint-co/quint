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
import JSONbig from 'json-bigint'
import lineColumn from 'line-column'

import { parsePhase1, parsePhase2, ErrorMessage } from './tntParserFrontend'

import yargs from 'yargs/yargs'

/**
 * Parse a TNT specification.
 *
 * @param argv parameters as provided by yargs
 */
function parse (argv: any) {
  // a callback to parse the text that we get from readFile
  const parseText = (text: string) => {
    const finder = lineColumn(text)

    const phase1Result = parsePhase1(text)
    if (phase1Result.kind === 'error') {
      reportError(argv, text, finder, phase1Result)
      process.exit(1)
    }

    const phase2Result = parsePhase2(phase1Result.module, phase1Result.sourceMap)
    if (phase2Result.kind === 'error') {
      reportError(argv, text, finder, phase2Result)
      process.exit(1)
    }

    if (argv.out) {
      // write the parsed IR to the output file
      writeToJson(argv.out, {
        status: 'parsed',
        warnings: [],
        module: removeIds(phase1Result.module),
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

function reportError (argv: any, text: string, finder: any, result: { kind: 'error', messages: ErrorMessage[] }) {
  if (argv.out) {
    // write the errors to the output file
    writeToJson(argv.out, result)
  } else {
    // write the errors to stderr
    result.messages.forEach((m) => {
      // TODO: use m.source instead of argv.input (issue #21)
      const loc = `${argv.input}:${m.loc.start.line + 1}:${m.loc.start.col + 1}`
      console.error(`${loc} - error: ${m.explanation}`)

      const endLine = m.loc.end ? m.loc.end.line : m.loc.start.line
      for (let i = m.loc.start.line; i <= endLine; i++) {
        const lineIndex = finder.toIndex(i + 1, 1)
        const line = text.slice(lineIndex).split('\n')[0]
        const lineLoc = `${i + 1}: `
        console.log(`${lineLoc}${line}`)

        const startCol = i === m.loc.start.line ? m.loc.start.col : 0
        const endCol = m.loc.end ? (i === endLine ? (m.loc.end.index != 0 ? m.loc.end.index - lineIndex : m.loc.end.col) : line.length) : m.loc.start.col

        // padding
        for (let j = 0; j < lineLoc.length; j++) {
          process.stdout.write(' ')
        }
        for (let j = 0; j < line.length; j++) {
          const str = j >= startCol && j <= endCol ? '^' : ' '
          process.stdout.write(str)
        }
        process.stdout.write('\n')
      }
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
