#!/usr/bin/env node

/**
 * Command-line interface for quint.
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2023
 */


import yargs from 'yargs/yargs'

import {
  docs, load, outputResult, parse, runRepl, runSimulator, runTests, typecheck
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
  desc: 'run an interactive Read-Evaluate-Print-Loop',
  builder: (yargs: any) =>
    yargs
      .option('require', {
        desc: 'filename[::module]. Preload the file and, optionally, import the module',
        alias: 'r',
        type: 'string',
      })
      .option('quiet', {
        desc: 'Disable banners and prompts, to simplify scripting',
        alias: 'q',
        type: 'boolean',
      })
      .default('quiet', false),
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

// construct run commands with yargs
const runCmd = {
  command: 'run <input>',
  desc: 'Simulate a Quint specification and (optionally) check invariants',
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
      .option('max-samples', {
        desc: 'the maximum on the number of traces to try',
        type: 'number',
      })
      .default('max-samples', 10000)
      .option('max-steps', {
        desc: 'the maximum on the number of steps in every trace',
        type: 'number',
      })
      .default('max-steps', 20)
      .option('init', {
        desc: 'name of the initializer action',
        type: 'string',
      })
      .default('init', 'init')
      .option('step', {
        desc: 'name of the step action',
        type: 'string',
      })
      .default('step', 'step')
      .option('invariant', {
        desc: 'invariant to check: a definition name or an expression',
        type: 'string',
      })
      .default('invariant', ['true'])
      .option('seed', {
        desc: 'random seed to use for non-deterministic choice',
        type: 'string',
      }),
// Timeouts are postponed for:
// https://github.com/informalsystems/quint/issues/633
//
//      .option('timeout', {
//        desc: 'timeout in seconds',
//        type: 'number',
//      })
  handler: (args: any) =>
    outputResult(load(args).chain(parse).chain(typecheck).chain(runSimulator)),
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
  .command(runCmd)
  .command(testCmd)
  .command(docsCmd)
  .demandCommand(1)
  .strict()
  .parse()
