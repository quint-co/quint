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

import { compileExpr } from './runtime/compile'
import { ExecError } from './runtime/runtime'

export function tntRepl () {
  const out = console.log
  out(chalk.gray('TNT REPL v0.0.1'))
  out(chalk.gray('Type ".exit" to exit, or ".help" for more information'))
  // create a readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>>> ',
  })

  rl.prompt()

  const tryEval = (text: string) => {
    const val = compileExpr(text, chalkHandler).exec()
    if (val !== undefined) {
      // Print on success, similar to node repl.
      // In the future, we should introduce a color printer
      // that analyzes the value structure.
      switch (typeof val) {
        case 'bigint':
          out(chalk.yellow(`${val}`))
          break
        case 'boolean':
          out(chalk.yellow(`${val}`))
          break
        case 'string':
          out(chalk.green(`"${val}"`))
          break
        default:
          out(`${val}`)
      }
    }
  }

  // we let the user type a multiline string, which is collected here:
  let multilineText = ''

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
        if (multilineText === '') {
          if (line.indexOf('val ') >= 0) {
            // enter a multiline mode
            multilineText += '\n' + line
            rl.setPrompt('... ')
          } else {
            tryEval(line)
          }
        } else {
          if (line.trim() === '') {
            // end the multiline mode
            tryEval(multilineText + '\n' + line)
            multilineText = ''
            rl.setPrompt('>>> ')
          } else {
            // continue the multiline mode
            multilineText += '\n' + line
          }
        }
        break
    }
    rl.prompt()
  }).on('close', () => {
    process.exit(0)
  })
}

// private definitions

// output errors to the console in red
const chalkHandler = (err: ExecError) => {
  console.error(chalk.red(`${err.sourceAndLoc}: ${err.msg}`))
}
