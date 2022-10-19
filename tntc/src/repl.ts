/*
 * REPL for tntc.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import * as readline from 'readline'
import { Readable, Writable } from 'stream'
import { readFileSync, writeFileSync } from 'fs'
import lineColumn from 'line-column'
import chalk from 'chalk'

import { Maybe, just, none } from '@sweet-monads/maybe'

import { TntEx, IrErrorMessage } from './tntIr'
import { compile, CompilationContext, lastTraceName } from './runtime/compile'
import { formatError } from './errorReporter'
import {
  EvalResult, Register, kindName, ComputableKind
} from './runtime/runtime'
import { probeParse, ErrorMessage, Loc } from './tntParserFrontend'

// tunable settings
export const settings = {
  prompt: '>>> ',
  continuePrompt: '... ',
}

type writer = (text: string) => void

// the internal state of the REPL
interface ReplState {
  // definitions history
  defsHist: string,
  // expressions history (for saving and loading)
  exprHist: string[],
  // state variables
  vars: Map<string, EvalResult>,
  // variables internal to the simulator and REPL
  shadowVars: Map<string, EvalResult>,
}

// The default exit terminates the process.
// Since it is inconvenient for testing, do not use it in tests :)
function defaultExit () {
  process.exit(0)
}

// the entry point to the REPL
export function tntRepl
(input: Readable, output: Writable, exit: () => void = defaultExit) {
  function out (text: string) {
    output.write(text + '\n')
  }
  out(chalk.gray('TNT REPL v0.0.2'))
  out(chalk.gray('Type ".exit" to exit, or ".help" for more information'))
  // create a readline interface
  const rl = readline.createInterface({
    input: input,
    output: output,
    prompt: settings.prompt,
  })

  rl.prompt()

  // the state
  let state: ReplState = {
    defsHist: '',
    exprHist: [],
    vars: new Map<string, EvalResult>(),
    shadowVars: new Map<string, EvalResult>(),
  }
  // we let the user type a multiline string, which is collected here:
  let multilineText = ''
  // when the number of open braces or parentheses is positive,
  // we enter the multiline mode
  let nOpenBraces = 0
  let nOpenParen = 0

  // Ctrl-C handler
  rl.on('SIGINT', () => {
    // if the user is stuck and presses Ctrl-C, reset the multiline mode
    multilineText = ''
    nOpenBraces = 0
    nOpenParen = 0
    rl.setPrompt(settings.prompt)
    out(chalk.yellow(' <cancelled>'))
    // clear the line and show the prompt
    rl.write(null, { ctrl: true, name: 'u' })
    rl.prompt()
  })

  // next line handler
  function nextLine (line: string) {
    const [nob, nop] = countBraces(line)
    nOpenBraces += nob
    nOpenParen += nop
    if (multilineText === '') {
      if (nOpenBraces > 0 || nOpenParen > 0) {
        // enter a multiline mode
        multilineText += '\n' + line
        rl.setPrompt(settings.continuePrompt)
      } else {
        line.trim() === '' || tryEval(out, state, line)
      }
    } else {
      if (line.trim() === '' && nOpenBraces <= 0 && nOpenParen <= 0) {
        // end the multiline mode
        tryEval(out, state, multilineText)
        multilineText = ''
        rl.setPrompt(settings.prompt)
      } else {
        // continue the multiline mode
        multilineText += '\n' + line
      }
    }
  }

  // the read-eval-print loop
  rl.on('line', (line) => {
    const args = line.trim().split(/\s+/)
    switch (args[0]) {
      case '.help':
        out('.clear\tClear the history')
        out('.exit\tExit the REPL')
        out('.help\tPrint this help message')
        out('.load <filename>\tLoad the code from a file into the REPL session')
        out('.save <filename>\tSave the accumulated definitions to a file')
        out('\nType an expression and press Enter to evaluate it.')
        out('When the REPL switches to multiline mode "...", finish it with an empty line.')
        out('\nPress Ctrl+C to abort current expression, Ctrl+D to exit the REPL')
        break

      case '.exit':
        exit()
        break

      case '.clear':
        out('') // be nice to external programs
        state.defsHist = ''
        state.exprHist = []
        break

      case '.load':
        if (!args[1]) {
          out(chalk.red('.load requires a filename'))
        } else {
          loadFromFile(out, state, args[1])
        }
        rl.prompt()
        break

      case '.save':
        if (!args[1]) {
          out(chalk.red('.save requires a filename'))
        } else {
          saveToFile(out, state, args[1])
        }
        rl.prompt()
        break

      default:
        nextLine(line)
        break
    }
    rl.prompt()
  }).on('close', () => {
    out('')
    exit()
  })

  return rl
}

// private definitions

function saveToFile (out: writer, state: ReplState, filename: string) {
  // as top-level expressions are not supported by the language,
  // we are wrapping them into special comments
  try {
    const text = `${state.defsHist}\n//! expressions\n` +
      state.exprHist.map(s => `/*! ${s} !*/\n`).join('\n')
    writeFileSync(filename, text)
    out(`Session saved to: ${filename}`)
  } catch (error) {
    out(chalk.red(error))
  }
}

function loadFromFile (out: writer, state: ReplState, filename: string) {
  try {
    const data = readFileSync(filename, 'utf8')
    // split the definitions from the expression
    const frags = data.split(/^\/\/! expressions$/gsm)
    state.defsHist += '\n' + frags[0]
    out(frags[0])
    // unwrap the expressions from the specially crafted comments
    const exprs =
      (frags[1] ?? '').matchAll(/\/\*! (.*?) !\*\//gsm) ?? []
    // and replay them one by one
    let replayed = false
    for (const groups of exprs) {
      replayed = true
      out(groups[1])
      if (!tryEval(out, state, groups[1])) {
        break
      }
    }
    if (!replayed) {
      // nothing to replay, evaluate 'true', to trigger parsing
      if (tryEval(out, state, 'true')) {
        // remove 'true' from the expression history
        state.exprHist.pop()
      }
    }
  } catch (error) {
    out(chalk.red(error))
  }
}

function evalAndSaveRegisters (kind: ComputableKind, names: string[],
  context: CompilationContext, targetMap: Map<string, EvalResult>) {
  targetMap.clear()
  for (const v of names) {
    const computable = context.values.get(kindName(kind, v))
    if (computable) {
      computable.eval().map(result => {
        targetMap.set(v, result)
      })
    }
  }
}

function saveVars (state: ReplState, context: CompilationContext): void {
  function isNextSet (name: string) {
    const register = context.values.get(kindName('nextvar', name)) as Register
    if (register) {
      return register.registerValue.isJust()
    } else {
      return false
    }
  }
  const isAction = [...context.vars].some(name => isNextSet(name))
  if (isAction) {
    evalAndSaveRegisters('nextvar', context.vars, context, state.vars)
  }
}

function saveShadowVars (state: ReplState, context: CompilationContext): void {
  evalAndSaveRegisters('shadow', context.shadowVars, context, state.shadowVars)
}

function loadRegisters (kind: ComputableKind,
  vars: Map<string, EvalResult>, context: CompilationContext): void {
  vars.forEach((value, name) => {
    const register = context.values.get(kindName(kind, name)) as Register
    if (register) {
      register.registerValue = just(value)
    }
  })
}

function loadVars (state: ReplState, context: CompilationContext): void {
  loadRegisters('var', state.vars, context)
}

function loadShadowVars (state: ReplState, context: CompilationContext): void {
  loadRegisters('shadow', state.shadowVars, context)
}

// convert a TNT expression to a colored string, tuned for REPL
function chalkTntEx (ex: TntEx): string {
  switch (ex.kind) {
    case 'bool':
      return chalk.yellow(`${ex.value}`)

    case 'int':
      return chalk.yellow(`${ex.value}`)

    case 'str':
      return chalk.green(`"${ex.value}"`)

    case 'app':
      switch (ex.opcode) {
        case 'set': {
          const as = ex.args.map(chalkTntEx).join(', ')
          return chalk.green('set') + chalk.black(`(${as})`)
        }

        case 'setToMap': {
          const as = ex.args.map(chalkTntEx).join(', ')
          return chalk.green('setToMap') + chalk.black(`(${as})`)
        }

        case 'tup': {
          const as = ex.args.map(chalkTntEx).join(', ')
          return chalk.black(`(${as})`)
        }

        case 'list': {
          const as = ex.args.map(chalkTntEx).join(', ')
          return chalk.black(`[${as}]`)
        }

        case 'rec': {
          const kvs = []
          for (let i = 0; i < ex.args.length / 2; i++) {
            const key = ex.args[2 * i]
            if (key && key.kind === 'str') {
              const value = chalkTntEx(ex.args[2 * i + 1])
              kvs.push(`${chalk.green(key.value)}: ${value}`)
            }
          }
          return `{ ${kvs.join(', ')} }`
        }

        default:
          // instead of throwing, show it in red
          return chalk.red(`unsupported operator: ${ex.opcode}(...)`)
      }

    default:
      return chalk.red(`unsupported operator: ${ex.kind}`)
  }
}

// Declarations that are overloaded by the simulator.
// In the future, we will declare them in a separate module.
const simulatorBuiltins =
`val ${lastTraceName} = [];
def _test(__nruns, __nsteps, __init, __next, __inv) = false;
def _testOnce(__nsteps, __init, __next, __inv) =
  _test(1, __nsteps, __init, __next, __inv);
`

// try to evaluate the expression in a string and print it, if successful
function tryEval (out: writer, state: ReplState, newInput: string): boolean {
  // output errors to the console in red
  function printErrors (moduleText: string, context: CompilationContext) {
    printErrorMessages(out, 'syntax error', moduleText, context.syntaxErrors)
    const resolved = resolveErrors(context.sourceMap, context.compileErrors)
    printErrorMessages(out, 'compile error', moduleText, resolved)
    out('') // be nice to external programs
  }

  const probeResult = probeParse(newInput, '<input>')
  if (probeResult.kind === 'error') {
    printErrorMessages(out, 'syntax error', newInput, probeResult.messages)
    out('') // be nice to external programs
    return false
  }
  if (probeResult.kind === 'expr') {
    // embed expression text into a value definition inside a module
    const moduleText = `module __REPL {
${simulatorBuiltins}
${state.defsHist}
  val __input =
${newInput}
}`
    // compile the expression or definition and evaluate it
    const context = compile(moduleText)
    if (context.syntaxErrors.length > 0 || context.compileErrors.length > 0) {
      printErrors(moduleText, context)
      return false
    }
    loadVars(state, context)
    loadShadowVars(state, context)
    const computable = context.values.get(kindName('callable', '__input'))
    let resultDefined: Maybe<void> = none()
    if (computable) {
      resultDefined =
        computable
          .eval()
          .map(value => {
            const ex = value.toTntEx()
            out(chalkTntEx(ex))
            if (ex.kind === 'bool' && ex.value) {
              // if this was an action and it was successful, save the state
              // as actions are always boolean,
              // don't even try to save the state for non-boolean expressions
              saveVars(state, context)
            }
            // save shadow vars in any case, e.g., the example trace
            saveShadowVars(state, context)
          })

      state.exprHist.push(newInput.trim())
    }
    if (resultDefined.isNone()) {
      const resolved = resolveErrors(context.sourceMap, context.runtimeErrors)
      printErrorMessages(out, 'runtime error', moduleText, resolved)
      out(chalk.red('<result undefined>'))
      out('') // be nice to external programs
      return false
    }
  }
  if (probeResult.kind === 'toplevel') {
    // embed expression text into a module at the top level
    const moduleText = `module __REPL {
${simulatorBuiltins}
${state.defsHist}
${newInput}
}`
    // compile the module and add it to history if everything worked
    const context = compile(moduleText)
    if (context.values.size === 0 ||
        context.compileErrors.length > 0 || context.syntaxErrors.length > 0) {
      printErrors(moduleText, context)
      return false
    } else {
      out('') // be nice to external programs
      state.defsHist = state.defsHist + '\n' + newInput // update the history
    }
  }

  return true
}

// resolve source locations of IR errors
function resolveErrors
(sourceMap: Map<bigint, Loc>, errors: IrErrorMessage[]): ErrorMessage[] {
  const unknownLoc = {
    source: '<unknown>',
    start: { line: 0, col: 0, index: 0 },
  }
  return errors.map(msg => {
    return {
      explanation: msg.explanation,
      locs: msg.refs.map(id => sourceMap.get(id) ?? unknownLoc),
    }
  })
}

// print error messages with proper colors
function printErrorMessages
(out: writer, kind: string, text: string, messages: ErrorMessage[]) {
  // display the error messages and highlight the error places
  const finder = lineColumn(text)
  for (const e of messages) {
    const msg = formatError(text, finder, e)
    out(chalk.red(`${kind}: ${msg}`))
  }
}

// count the difference between the number of '{' and '}'
// as well as the difference between the number of '(' and ')' in a string
function countBraces (str: string): [number, number] {
  let nOpenBraces = 0
  let nOpenParen = 0
  for (let i = 0; i < str.length; i++) {
    switch (str[i]) {
      case '{':
        nOpenBraces++
        break

      case '}':
        nOpenBraces--
        break

      case '(':
        nOpenParen++
        break

      case ')':
        nOpenParen--
        break

      default:
    }
  }

  return [nOpenBraces, nOpenParen]
}
