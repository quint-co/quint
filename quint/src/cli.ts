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
  CLIProcedure,
  docs,
  load,
  outputResult,
  parse,
  runRepl,
  runSimulator,
  runTests,
  typecheck,
  verifySpec,
} from './cliCommands'

import { verbosity } from './verbosity'

import { version } from './version'

const defaultOpts = (yargs: any) =>
  yargs.option('out', {
    desc: 'output file (suppresses all console output)',
    type: 'string',
  })

// Chain async CLIProcedures
//
// This saves us having to manually thread the result argument like
//
// `prevCmd.then(prevResult => prevResult.asyncChain(nextCmd))`
//
// Instead writing:
//
// `prevCmd.then(chainCmd(nextCmd))`
function chainCmd<S, T>(
  nextCmd: (data: S) => Promise<CLIProcedure<T>>
): (prev: CLIProcedure<S>) => Promise<CLIProcedure<T>> {
  return (prevResult: CLIProcedure<S>) => prevResult.asyncChain(nextCmd)
}

// construct parsing commands with yargs
const parseCmd = {
  command: 'parse <input>',
  desc: 'parse a Quint specification',
  builder: (yargs: any) =>
    defaultOpts(yargs).option('source-map', {
      desc: 'name of the source map',
      type: 'string',
    }),
  handler: async (args: any) => load(args).then(chainCmd(parse)).then(outputResult),
}

// construct typecheck commands with yargs
const typecheckCmd = {
  command: 'typecheck <input>',
  desc: 'check types and effects of a Quint specification',
  builder: defaultOpts,
  handler: (args: any) => load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(outputResult),
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
        desc: 'Disable banners and prompts, to simplify scripting (alias for --verbosity=0)',
        alias: 'q',
        type: 'boolean',
      })
      .default('quiet', false)
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
      })
      .default('verbosity', verbosity.defaultLevel),
  handler: runRepl,
}

// construct test commands with yargs
const testCmd = {
  command: 'test <input>',
  desc: 'Run tests against a Quint specification',
  builder: (yargs: any) =>
    defaultOpts(yargs)
      .option('main', {
        desc: 'name of the main module (by default, computed from filename)',
        type: 'string',
      })
      .option('output', {
        desc: `write a trace for every test, e.g., out{#}{}.itf.json
{} is the name of a test, {#} is the test sequence number`,
        type: 'string',
      })
      .option('max-samples', {
        desc: 'the maximum number of successful runs to try for every randomized test',
        type: 'number',
      })
      .default('max-samples', 10000)
      .option('seed', {
        desc: 'random seed to use for non-deterministic choice',
        type: 'string',
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
      })
      .default('verbosity', verbosity.defaultLevel)
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
    load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(chainCmd(runTests)).then(outputResult),
}

// construct run commands with yargs
const runCmd = {
  command: 'run <input>',
  desc: 'Simulate a Quint specification and check invariants',
  builder: (yargs: any) =>
    defaultOpts(yargs)
      .option('main', {
        desc: 'name of the main module (by default, computed from filename)',
        type: 'string',
      })
      .option('out-itf', {
        desc: 'output the trace in the Informal Trace Format to file (supresses all console output)',
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
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
      })
      .default('verbosity', verbosity.defaultLevel),
  // Timeouts are postponed for:
  // https://github.com/informalsystems/quint/issues/633
  //
  //      .option('timeout', {
  //        desc: 'timeout in seconds',
  //        type: 'number',
  //      })
  handler: (args: any) =>
    load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(chainCmd(runSimulator)).then(outputResult),
}

// construct verify commands with yargs
const verifyCmd = {
  command: 'verify <input>',
  desc: `Verify a Quint specification via Apalache`,
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
      .option('out-itf', {
        desc: 'output the trace in the Informal Trace Format to file (supresses all console output)',
        type: 'string',
      })
      .option('max-steps', {
        desc: 'the maximum number of steps in every trace',
        type: 'number',
        default: 10,
      })
      .option('init', {
        desc: 'name of the initializer action',
        type: 'string',
        default: 'init',
      })
      .option('step', {
        desc: 'name of the step action',
        type: 'string',
        default: 'step',
      })
      .option('invariant', {
        desc: 'the invariants to check, separated by a comma',
        type: 'string',
        coerce: (s: string) => s.split(','),
      })
      .option('apalache-config', {
        desc: 'Filename of the additional Apalache configuration (in the HOCON format, a superset of JSON)',
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
    load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(chainCmd(verifySpec)).then(outputResult),
}

// construct documenting commands with yargs
const docsCmd = {
  command: 'docs <input>',
  desc: 'produces documentation from docstrings in a Quint specification',
  builder: defaultOpts,
  handler: (args: any) => load(args).then(chainCmd(docs)).then(outputResult),
}

const validate = (argv: any) => {
  if (argv.output && typeof argv.output === 'string') {
    const output = argv.output
    if (!output.endsWith('.itf.json')) {
      throw new Error(`Unexpected format in --output: ${output}`)
    }
    if (!output.includes('{}') && !output.includes('{#}')) {
      throw new Error(`The output should contain at least one of variables: {}, {#}`)
    }
  }

  return true
}

async function main() {
  // parse the command-line arguments and execute the handlers
  await yargs(process.argv.slice(2))
    .command(parseCmd)
    .command(typecheckCmd)
    .command(replCmd)
    .command(runCmd)
    .command(testCmd)
    .command(verifyCmd)
    .command(docsCmd)
    .demandCommand(1)
    .check(validate)
    .version(version)
    .strict()
    .parse()
}

main()
