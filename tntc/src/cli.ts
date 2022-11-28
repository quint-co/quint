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

import { Either } from '@sweet-monads/either'
import { load, parse, runRepl, typecheck, withJsonToOutput } from './cliCommands'

function handleResult<A>(result: Either<String, A>) {
  result
    .mapLeft(msg => { console.error(`error: ${msg}`); process.exit(1) })
    .mapRight(_ => process.exit(0))
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
  handler: (args: any) => handleResult(
    load(args)
      .chain(parse)
      .chain(withJsonToOutput)
  ),
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
  handler: (args: any) =>
    handleResult(
      load(args)
        .chain(parse)
        .chain(typecheck)
        .chain(withJsonToOutput)
    ),
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
