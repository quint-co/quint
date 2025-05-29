#!/usr/bin/env node

/**
 * Command-line interface for quint.
 *
 * See the description at:
 * https://github.com/informalsystems/quint/blob/main/doc/quint.md
 *
 * @author Igor Konnov, Gabriela Moreira, Shon Feder, Informal Systems, 2021-2023
 * @author Igor Konnov, konnov.phd, 2024
 */

import yargs from 'yargs/yargs'

import {
  CLIProcedure,
  compile,
  docs,
  load,
  outputCompilationTarget,
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
import { DEFAULT_APALACHE_VERSION_TAG, parseServerEndpoint } from './apalache'

const defaultOpts = (yargs: any) =>
  yargs.option('out', {
    desc: 'output file (suppresses all console output)',
    type: 'string',
  })

// Arguments used by routines that pass thru the `compile` stage
const compileOpts = (yargs: any) =>
  defaultOpts(yargs)
    .option('main', {
      desc: 'name of the main module (by default, computed from filename)',
      type: 'string',
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
      desc: 'the invariants to check, separated by commas',
      type: 'string',
    })
    .option('temporal', {
      desc: 'the temporal properties to check, separated by commas',
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
  handler: (args: any) => load(args).then(chainCmd(parse)).then(outputResult),
}

// construct typecheck commands with yargs
const typecheckCmd = {
  command: 'typecheck <input>',
  desc: 'check types and effects of a Quint specification',
  builder: defaultOpts,
  handler: (args: any) => load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(outputResult),
}

// construct the compile subcommand
const compileCmd = {
  command: 'compile <input>',
  desc: 'compile a Quint specification into the target, the output is written to stdout',
  builder: (yargs: any) =>
    compileOpts(yargs)
      .option('target', {
        desc: `the compilation target.`,
        type: 'string',
        choices: ['tlaplus', 'json'],
        default: 'json',
      })
      .option('flatten', {
        desc: 'Whether or not to flatten the modules into one. Use --flatten=false to disable',
        type: 'boolean',
        default: true,
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
        default: verbosity.defaultLevel,
      })
      .option('apalache-version', {
        desc: 'The version of Apalache to use, if no running server is found (using this option may result in incompatibility)',
        type: 'string',
        default: DEFAULT_APALACHE_VERSION_TAG,
      })
      .option('server-endpoint', {
        desc: 'Apalache server endpoint hostname:port',
        type: 'string',
        default: 'localhost:8822',
      })
      .coerce('server-endpoint', (arg: string) => {
        const errorOrEndpoint = parseServerEndpoint(arg)
        if (errorOrEndpoint.isLeft()) {
          throw new Error(errorOrEndpoint.value)
        } else {
          return errorOrEndpoint.value
        }
      }),
  handler: (args: any) =>
    load(args)
      .then(chainCmd(parse))
      .then(chainCmd(typecheck))
      .then(chainCmd(compile))
      .then(chainCmd(outputCompilationTarget))
      .then(outputResult),
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
        default: false,
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
        default: verbosity.defaultLevel,
      }),
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
      .option('out-itf', {
        desc: 'write a trace for every test, e.g., out_{test}_{seq}.itf.json where {test} is the name of a test, and {seq} is the test sequence number',
        type: 'string',
      })
      // Hidden alias for `--out-itf`
      .option('output', {
        type: 'string',
      })
      .hide('output')
      .option('max-samples', {
        desc: 'the maximum number of successful runs to try for every randomized test',
        type: 'number',
        default: 10000,
      })
      .option('seed', {
        desc: 'random seed to use for non-deterministic choice',
        type: 'string',
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
        default: verbosity.defaultLevel,
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
  handler: (args: any) => {
    if (args.output != null) {
      args.outItf = args['out-itf'] = args.output
      delete args.output
    }

    load(args).then(chainCmd(parse)).then(chainCmd(typecheck)).then(chainCmd(runTests)).then(outputResult)
  },
}

// construct run commands with yargs
const runCmd = {
  command: 'run <input>',
  desc: 'Simulate a Quint specification and (optionally) check invariants',
  builder: (yargs: any) =>
    defaultOpts(yargs)
      .option('main', {
        desc: 'name of the main module (by default, computed from filename)',
        type: 'string',
      })
      .option('out-itf', {
        desc: 'output the trace in the Informal Trace Format to file, e.g., out_{seq}.itf.json where {seq} is the trace sequence number',
        type: 'string',
      })
      .option('max-samples', {
        desc: 'the maximum number of runs to attempt before giving up',
        type: 'number',
        default: 10000,
      })
      .option('n-traces', {
        desc: 'how many traces to generate (only affects output to out-itf)',
        type: 'number',
        default: 1,
      })
      .option('max-steps', {
        desc: 'the maximum on the number of steps in every trace',
        type: 'number',
        default: 20,
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
        desc: 'invariant to check: a definition name or an expression',
        type: 'string',
        default: 'true',
      })
      .option('witnesses', {
        desc: 'space separated list of witnesses to report on (counting for how many traces the witness is true)',
        type: 'array',
        default: [],
      })
      .option('hide', {
        desc: 'space separated list of variable names to hide from the terminal output (does not affect ITF output)',
        type: 'array',
        default: [],
      })
      .option('seed', {
        desc: 'random seed to use for non-deterministic choice',
        type: 'string',
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
        default: verbosity.defaultLevel,
      })
      .option('mbt', {
        desc: '(experimental) whether to produce metadata to be used by model-based testing',
        type: 'boolean',
        default: false,
      })
      .option('backend', {
        desc: 'the backend to use for simulation',
        type: 'string',
        choices: ['typescript', 'rust'],
        default: 'typescript',
      }),
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
    compileOpts(yargs)
      .option('out-itf', {
        desc: 'output the trace in the Informal Trace Format to file, e.g., out.itf.json (suppresses all console output)',
        type: 'string',
      })
      .option('max-steps', {
        desc: 'the maximum number of steps in every trace',
        type: 'number',
        default: 10,
      })
      .option('random-transitions', {
        desc: 'choose transitions at random (= use symbolic simulation)',
        type: 'boolean',
        default: false,
      })
      .option('apalache-config', {
        desc: 'path to an additional Apalache configuration file (in JSON)',
        type: 'string',
      })
      .option('verbosity', {
        desc: 'control how much output is produced (0 to 5)',
        type: 'number',
        default: verbosity.defaultLevel,
      })
      .option('apalache-version', {
        desc: 'The version of Apalache to use, if no running server is found (using this option may result in incompatibility)',
        type: 'string',
        default: DEFAULT_APALACHE_VERSION_TAG,
      })
      .option('server-endpoint', {
        desc: 'Apalache server endpoint hostname:port',
        type: 'string',
        default: 'localhost:8822',
      })
      .coerce('server-endpoint', (arg: string) => {
        const errorOrEndpoint = parseServerEndpoint(arg)
        if (errorOrEndpoint.isLeft()) {
          throw new Error(errorOrEndpoint.value)
        } else {
          return errorOrEndpoint.value
        }
      }),
  // Timeouts are postponed for:
  // https://github.com/informalsystems/quint/issues/633
  //
  //      .option('timeout', {
  //        desc: 'timeout in seconds',
  //        type: 'number',
  //      })
  handler: (args: any) =>
    load(args)
      .then(chainCmd(parse))
      .then(chainCmd(typecheck))
      .then(chainCmd(compile))
      .then(chainCmd(verifySpec))
      .then(outputResult),
}

// construct documenting commands with yargs
const docsCmd = {
  command: 'docs <input>',
  desc: 'produces documentation from docstrings in a Quint specification',
  builder: defaultOpts,
  handler: (args: any) => load(args).then(chainCmd(docs)).then(outputResult),
}

const validate = (_argv: any) => {
  return true
}

async function main() {
  // parse the command-line arguments and execute the handlers
  await yargs(process.argv.slice(2))
    .command(parseCmd)
    .command(typecheckCmd)
    .command(compileCmd)
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
