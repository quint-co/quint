#!/usr/bin/env node

/**
 * Command-line interface for quint.
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Informal Systems, 2021-2022
 */


import yargs from 'yargs/yargs'

import {
  docs, load, outputResult, parse, runRepl, runTests, typecheck
} from './cliCommands'

// construct parsing commands with yargs
const parseCmd = {
  command: 'parse <input>',
  desc: 'parse a Quint specification',
  builder: (yargs: any) =>
    yargs
      .option('out', {
        desc: 'output file',
        type: 'string',
      })
      .option('source-map', {
        desc: 'name of the source map',
        type: 'string',
      })
      .option('with-lookup', {
        desc: 'add the lookup table to the output file (see --out)',
        type: 'boolean',
      }),
  handler: (args: any) => outputResult(load(args).chain(parse)),
}

// construct typecheck commands with yargs
const typecheckCmd = {
  command: 'typecheck <input>',
  desc: 'check types (TBD) and effects of a Quint specification',
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
  builder: (yargs: any) =>
    yargs
      .option('require', {
        desc: 'filename[::module]. Preload the file and, optionally, import the module',
        alias: 'r',
        type: 'string',
      }),
  handler: runRepl,
}

// construct test commands with yargs
const testCmd = {
  command: 'test <input>',
  desc: 'Run tests against a Quint specification',
  builder: (yargs: any) =>
    yargs
      .option('main', {
        desc: 'name of the main module (by default, computed from filename)',
        type: 'string',
      })
      .option('out', {
        desc: 'output file (suppresses all console output)',
        type: 'string',
      })
      .option('seed', {
        desc: 'random seed to use for non-deterministic choice',
        type: 'string',
      })
// Timeouts are postponed for:
// https://github.com/informalsystems/quint/issues/633
//
//      .option('timeout', {
//        desc: 'timeout in seconds',
//        type: 'number',
//      })
      .option('match', {
        desc: 'a string or regex that selects names to use as tests',
        type: 'string',
      }),
  handler: (args: any) =>
    outputResult(load(args).chain(parse).chain(typecheck).chain(runTests)),
}

// construct documenting commands with yargs
const docsCmd = {
  command: 'docs <input>',
  desc: 'produces documentation from docstrings in a Quint specification',
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
  .command(testCmd)
  .command(docsCmd)
  .demandCommand(1)
  .strict()
  .parse()
