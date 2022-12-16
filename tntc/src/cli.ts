#!/usr/bin/env node

/**
 * Command-line interface for tntc.
 *
 * See the description at:
 * https://github.com/informalsystems/tnt/blob/main/doc/tntc.md
 *
 * @author Igor Konnov, Gabriela Moreira, Informal Systems, 2021-2022
 */


import yargs from 'yargs/yargs'

import { docs, load, outputResult, parse, runRepl, typecheck } from './cliCommands'

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
  handler: (args: any) => outputResult(load(args).chain(parse)),
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
  handler: (args: any) => outputResult(load(args).chain(parse).chain(typecheck)),
}

// construct repl commands with yargs
const replCmd = {
  command: ['repl', '*'],
  desc: 'run REPL',
  builder: (yargs: any) => yargs,
  handler: runRepl,
}

// construct documenting commands with yargs
const docsCmd = {
  command: 'docs <input>',
  desc: 'produces documentation from docstrings in a TNT specification',
  builder: (yargs: any) =>
    yargs
      .option('out', {
        desc: 'output file',
        type: 'string',
      }),
  handler: (args: any) => outputResult(load(args).chain(docs)),
}
// parse the command-line arguments and execute the handlers
yargs(process.argv.slice(2))
  .command(parseCmd)
  .command(typecheckCmd)
  .command(replCmd)
  .command(docsCmd)
  .demandCommand(1)
  .strict()
  .parse()
