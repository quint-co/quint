/*
 * A collection of CLI functions that implement color output and pseudo-graphics.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import chalk from 'chalk'
import { strict as assert } from 'assert'
import { range } from 'lodash'

import { QuintEx } from './quintIr'
import { ExecutionFrame } from './runtime/trace'
import { zerog } from './idGenerator'

// convert a Quint expression to a colored string, tuned for REPL
export function chalkQuintEx(ex: QuintEx): string {
  switch (ex.kind) {
    case 'bool':
      return chalk.yellow(`${ex.value}`)

    case 'int':
      return chalk.yellow(`${ex.value}`)

    case 'str':
      return chalk.green(`"${ex.value}"`)

    case 'app':
      switch (ex.opcode) {
        case 'Set': {
          const as = ex.args.map(chalkQuintEx).join(', ')
          return chalk.green('Set') + `(${as})`
        }

        case 'Map': {
          const ps = ex.args.map(tup => {
            if (tup.kind === 'app' &&
                   tup.opcode === 'Tup' && tup.args.length === 2) {
              const [k, v] = tup.args
              return `${chalkQuintEx(k)} -> ${chalkQuintEx(v)}`
            } else {
              return '<expected-pair>'
            }
          })
          const as = ps.join(', ')
          return chalk.green('Map') + `(${as})`
        }

        case 'Tup': {
          const as = ex.args.map(chalkQuintEx).join(', ')
          return `(${as})`
        }

        case 'List': {
          const as = ex.args.map(chalkQuintEx).join(', ')
          return `[${as}]`
        }

        case 'Rec': {
          const kvs = []
          for (let i = 0; i < ex.args.length / 2; i++) {
            const key = ex.args[2 * i]
            if (key && key.kind === 'str') {
              const value = chalkQuintEx(ex.args[2 * i + 1])
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

export function
printExecutionFrameRec(out: (line: string) => void,
    frame: ExecutionFrame,
    isLast: boolean[]) {
  // convert the arguments and the result to strings
  const args =
    frame.args.map(a => chalkQuintEx(a.toQuintEx(zerog))).join(', ')
  const r =
    frame.result.isNone()
      ? 'none'
      : chalkQuintEx(frame.result.value.toQuintEx(zerog))
  const depth = isLast.length
  // generate the tree ASCII graphics for this frame
  let treeArt = isLast.map((il, i) =>
    (i < depth - 1)
      // continue the ancestor's branch, unless it's the last one
      ? (il ? '   ' : '│  ')
      // close or close & continue the leaf branch,
      // depending on whether this frame is the last one
      : (il ? '└─ ' : '├─ ')
  ).join('')
  out(`${treeArt}${frame.app.opcode}(${args}) => ${r}`)
  const n = frame.subframes.length
  // visualize the children
  frame.subframes.forEach((f, i) =>
    printExecutionFrameRec(out, f, isLast.concat([i === n - 1]))
  )
}

/**
 * Print a trace with chalk.
 */
export function printTrace(out: (line: string) => void,
                           states: QuintEx[],
                           frames: ExecutionFrame[]) {
  const colon = chalk.gray(':')
  states.forEach((state, index) => {
    assert(state.kind === 'app'
           && state.opcode === 'Rec' && state.args.length % 2 === 0)

    if (index < frames.length) {
      // be lenient to broken input
      out(`[Frame ${index}]`)
      printExecutionFrameRec(l => out(' ' + l), frames[index], [])
      out('')
    }

    out(`[State ${index}]`)
    range(0, Math.trunc(state.args.length / 2))
      .forEach(i => {
        const key = state.args[2 * i]
        assert(key.kind === 'str')
        const valueText = chalkQuintEx(state.args[2 * i + 1])
        out(` ${key.value}${colon} ${valueText}`)
      })

    out(''.padStart(80, '─') + '\n')
  })
}

