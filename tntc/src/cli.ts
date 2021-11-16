#!/usr/bin/env node

/**
 * CLI for tntc.
 *
 * @author Igor Konnov, Informal Systems, 2021
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'

import { parsePhase1 } from './tntParserFrontend'

import yargs from 'yargs/yargs'

/**
 * Parse a TNT specification.
 */
function parse (argv: any): number {
  const path = resolve(cwd(), argv.input)
  const text = readFileSync(path).toString('utf8')
  const result = parsePhase1(text)
  if (result.kind !== 'error') {
    return 0
  } else {
    result.messages.forEach((m) => {
      // TODO: use m.source instead of argv.input
      const loc = `${argv.input}:${m.start.line + 1}:${m.start.col + 1}`
      console.error(`${loc} - error ${m.explanation}`)
    })
    return 1
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
        type: 'string'
      })
      .option('source-map', {
        desc: 'name of the source map',
        type: 'string'
      }),
  handler: (argv: any) =>
    process.exit(parse(argv))
}

yargs(process.argv.slice(2))
  .command(parseCmd)
  .strict()
  .parse()
