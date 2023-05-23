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
import {
  Doc,
  braces,
  brackets,
  docJoin,
  format,
  group,
  line,
  linebreak,
  nest,
  parens,
  richtext,
  text,
  textify,
} from './prettierimp'

import { QuintDef, QuintEx, isAnnotatedDef } from './quintIr'
import { ExecutionFrame } from './runtime/trace'
import { zerog } from './idGenerator'
import { QuintType, Row } from './quintTypes'
import { TypeScheme } from './types/base'
import { canonicalTypeScheme } from './types/printing'
import { definitionToString, flattenRow, qualifierToString, rowToString } from './IRprinting'

/**
 * An abstraction of a Console of bounded text width.
 */
export interface ConsoleBox {
  width: number
  out: (s: string) => void
}

/**
 * Find out the terminal width for text formatting.
 * Since this number may change while running, it is a function.
 * Also, when the output is redirected, the number of columns is undefined.
 */
export const terminalWidth = () => {
  const cols = process.stdout.columns
  return cols !== undefined && cols > 0 ? cols : 80
}

// convert a Quint expression to a colored pretty-printed doc, tuned for REPL
export function prettyQuintEx(ex: QuintEx): Doc {
  switch (ex.kind) {
    case 'bool':
      return richtext(chalk.yellow, ex.value.toString())

    case 'int':
      return richtext(chalk.yellow, ex.value.toString())

    case 'str':
      return richtext(chalk.green, `"${ex.value}"`)

    case 'app':
      switch (ex.opcode) {
        case 'Set':
          return group([richtext(chalk.green, 'Set'), nary(text('('), ex.args.map(prettyQuintEx), text(')'))])

        case 'Map': {
          const ps: Doc[] = ex.args.map(tup => {
            if (tup.kind === 'app' && tup.opcode === 'Tup' && tup.args.length === 2) {
              const [k, v] = tup.args
              return group([prettyQuintEx(k), richtext(chalk.gray, ' ->'), nest('  ', [line(), prettyQuintEx(v)])])
            } else {
              return text('<expected-pair>')
            }
          })
          return group([richtext(chalk.green, 'Map'), nary(text('('), ps, text(')'))])
        }

        case 'Tup':
          return nary(text('('), ex.args.map(prettyQuintEx), text(')'))

        case 'List': {
          return nary(text('['), ex.args.map(prettyQuintEx), text(']'))
        }

        case 'Rec': {
          const kvs = []
          for (let i = 0; i < ex.args.length / 2; i++) {
            const key = ex.args[2 * i]
            if (key && key.kind === 'str') {
              const value = prettyQuintEx(ex.args[2 * i + 1])
              kvs.push(group([text(key.value), richtext(chalk.gray, ':'), nest('  ', [line(), value])]))
            }
          }
          return nary(text('{'), kvs, text('}'), line())
        }

        default:
          // instead of throwing, show it in red
          return richtext(chalk.red, `unsupported operator: ${ex.opcode}(...)`)
      }

    case 'lambda': {
      const params = parens(
        docJoin(
          [text(','), line()],
          ex.params.map(p => text(p.name))
        )
      )

      return braces(group(textify([params, line(), '=>', line(), '...'])))
    }

    default:
      return richtext(chalk.red, `unsupported operator: ${ex.kind}`)
  }
}

export function prettyQuintDef(def: QuintDef, includeBody: boolean = true, type?: TypeScheme): Doc {
  const typeAnnotation = isAnnotatedDef(def)
    ? [text(': '), prettyQuintType(def.typeAnnotation)]
    : type // If annotation is not present, but type is, use the type
    ? [text(': '), prettyTypeScheme(type)]
    : []

  switch (def.kind) {
    case 'def': {
      const header = group([
        richtext(chalk.magenta, qualifierToString(def.qualifier)),
        text(' '),
        richtext(chalk.blue, def.name),
        ...typeAnnotation,
      ])
      return includeBody ? group([header, text(' = '), prettyQuintEx(def.expr)]) : header
    }
    case 'typedef': {
      const header = group([text('type '), richtext(chalk.blue, def.name)])
      if (def.type) {
        return group([header, text(' = '), prettyQuintType(def.type)])
      }
      return header
    }
    default:
      // TODO, not used for now
      return text(definitionToString(def))
  }
}

export function prettyTypeScheme(scheme: TypeScheme): Doc {
  const [vars, type] = canonicalTypeScheme(scheme)
  const varsDoc =
    vars.length > 0 ? group([text('∀ '), docJoin([text(','), line()], vars.map(text)), text(' . ')]) : text('')
  return group([varsDoc, prettyQuintType(type)])
}

export function prettyQuintType(type: QuintType): Doc {
  switch (type.kind) {
    case 'bool':
    case 'int':
    case 'str':
      return richtext(chalk.yellow, type.kind)
    case 'const':
    case 'var':
      return richtext(chalk.blue, type.name)
    case 'set':
      return group([richtext(chalk.green, 'Set'), text('['), prettyQuintType(type.elem), text(']')])
    case 'list':
      return group([richtext(chalk.green, 'List'), text('['), prettyQuintType(type.elem), text(']')])
    case 'fun':
      return group([prettyQuintType(type.arg), richtext(chalk.gray, ' -> '), prettyQuintType(type.res)])
    case 'oper': {
      const args = type.args.map(prettyQuintType)
      return group([nary(text('('), args, text(')')), text(' => '), prettyQuintType(type.res)])
    }
    case 'tup':
      return prettyRow(type.fields, false)
    case 'rec': {
      if (rowToString(type.fields) === '{}') {
        return text('{}')
      }
      return group([text('{ '), prettyRow(type.fields), text('}')])
    }
    case 'union': {
      const records = type.records.map(rec => {
        return group([
          richtext(chalk.magenta, '|'),
          text('{ '),
          richtext(chalk.blue, type.tag),
          text(': '),
          richtext(chalk.green, `"${rec.tagValue}"`),
          prettyRow(rec.fields),
          text('}'),
        ])
      })
      return group(records)
    }
  }
}

function prettyRow(row: Row, showFieldName = true): Doc {
  const [fields, other] = flattenRow(row)

  const fieldsDocs = fields.map(f => {
    const prefix = showFieldName ? `${f.fieldName}: ` : ''
    return group([text(prefix), prettyQuintType(f.fieldType)])
  })
  const otherDoc = other.kind === 'var' ? [text(` | ${other.name}`)] : []

  return group([nest('  ', [linebreak, docJoin([text(','), line()], fieldsDocs)]), ...otherDoc, linebreak])
}

/**
 * Print an execution frame and its children recursively.
 * Since this function is printing a tree, we need precise text alignment.
 * Using a tree here with an optional line break would produce incorrect output.
 *
 * @param box the box to print in
 * @param frame the frame to print
 * @param isLast the array of booleans, one per ancestor, that indicates whether
 *       an ancestor does not have siblings to the right, the last index
 *       corresponds to the direct parent.
 */
export function printExecutionFrameRec(box: ConsoleBox, frame: ExecutionFrame, isLast: boolean[]): void {
  // convert the arguments and the result to strings
  const args = docJoin(
    [text(','), line()],
    frame.args.map(a => prettyQuintEx(a.toQuintEx(zerog)))
  )
  const r = frame.result.isNone() ? text('none') : prettyQuintEx(frame.result.value.toQuintEx(zerog))
  const depth = isLast.length
  // generate the tree ASCII graphics for this frame
  let treeArt = isLast
    .map((il, i) =>
      i < depth - 1
        ? // continue the ancestor's branch, unless it's the last one
          il
          ? '   '
          : '│  '
        : // close or close & continue the leaf branch,
        // depending on whether this frame is the last one
        il
        ? '└─ '
        : '├─ '
    )
    .join('')
  box.out(treeArt)

  // format the call with its arguments and place it right after the tree art
  const argsDoc = group(textify(['(', nest('  ', [linebreak, group(args)]), linebreak, ')']))
  // draw proper branches in the indentation
  const indentTreeArt = isLast.map(il => (il ? '   ' : '│  ')).join('')
  // pretty print the arguments and the result
  const callDoc = group(
    nest(indentTreeArt, [text(frame.app.opcode), group([argsDoc, nest('  ', group([text(' =>'), line(), r]))])])
  )

  box.out(format(box.width, treeArt.length, callDoc))
  box.out('\n')
  const n = frame.subframes.length
  // visualize the children
  frame.subframes.forEach((f, i) => printExecutionFrameRec(box, f, isLast.concat([i === n - 1])))
}

/**
 * Print a trace with chalk.
 */
export function printTrace(console: ConsoleBox, states: QuintEx[], frames: ExecutionFrame[]): void {
  const b = chalk.bold

  states.forEach((state, index) => {
    assert(state.kind === 'app' && state.opcode === 'Rec' && state.args.length % 2 === 0)

    if (index < frames.length) {
      // be lenient to broken input
      console.out(`[${b('Frame ' + index)}]\n`)
      printExecutionFrameRec(console, frames[index], [])
      console.out('\n')
    }

    const stateDoc: Doc = [group([brackets(richtext(b, `State ${index}`)), line()]), prettyQuintEx(state)]
    console.out(format(console.width, 0, stateDoc))
    console.out('\n\n')
  })
}

// a helper function to produce specific indentation
function nary(left: Doc, args: Doc[], right: Doc, padding: Doc = linebreak): Doc {
  const as = group([nest('  ', [padding, docJoin([text(','), line()], args)]), padding])
  return group([left, as, right])
}
