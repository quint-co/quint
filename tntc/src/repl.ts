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
import chalk from 'chalk'

import { TntEx } from './tntIr'
import { compileExpr } from './runtime/compile'
import { ExecError } from './runtime/runtime'

// tunable settings
export const settings = {
  prompt: '>>> ',
  continuePrompt: '... ',
}

// the entry point to the REPL
export function tntRepl () {
  const out = console.log
  out(chalk.gray('TNT REPL v0.0.1'))
  out(chalk.gray('Type ".exit" to exit, or ".help" for more information'))
  // create a readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: settings.prompt,
  })

  rl.prompt()

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
    out(chalk.yellow('<cancelled>'))
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
        line.trim() === '' || tryEval(line)
      }
    } else {
      if (line.trim() === '' && nOpenBraces <= 0 && nOpenParen <= 0) {
        // end the multiline mode
        tryEval(multilineText)
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
    switch (line.trim()) {
      case '.help':
        out('.exit\tExit the REPL')
        out('.help\tPrint this help message')
        out('\nType an expression and press Enter to evaluate it.')
        out('When the REPL switches to multiline mode "...", finish it with an empty line.')
        out('\nPress Ctrl+C to abort current expression, Ctrl+D to exit the REPL')
        break

      case '.exit':
        process.exit(0)

      default:
        nextLine(line)
        break
    }
    rl.prompt()
  }).on('close', () => {
    process.exit(0)
  })
}

// private definitions

// convert a TNT expression to a colored string, tuned for REPL
function chalkTntEx (ex: TntEx): string {
  switch (ex.kind) {
    case 'bool':
      return chalk.yellow(`${ex.value}`)

    case 'int':
      return chalk.yellow(`${ex.value}`)

    case 'app':
      if (ex.opcode !== 'set') {
        // instead of throwing, show it in red
        return chalk.red(`unsupported operator: ${ex.opcode}(...))`)
      } else {
        const as = ex.args.map(chalkTntEx).join(', ')
        return chalk.green('set') + chalk.black(`(${as})`)
      }

    default:
      return chalk.red(`unsupported operator: ${ex.kind}`)
  }
}

// try to evaluate the expression in a string and print it, if successful
function tryEval (text: string) {
  const val = compileExpr(text, chalkHandler).exec()
  if (val !== undefined) {
    // Print on success, similar to node repl.
    console.log(chalkTntEx(val.toTntEx()))
  }
}

// output errors to the console in red
function chalkHandler (err: ExecError) {
  console.error(chalk.red(`${err.sourceAndLoc}: ${err.msg}`))
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
