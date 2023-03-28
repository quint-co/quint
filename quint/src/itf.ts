/*
 * Support for the Informal Trace Format (ITF):
 * https://apalache.informal.systems/docs/adr/015adr-trace.html
 *
 * Igor Konnov, Informal Systems, 2023
 *
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, merge, right } from '@sweet-monads/either'
import { chunk } from 'lodash'

import { QuintEx } from './quintIr'

// The minimal value that can be reliably represented with number
const minJsInt = -(2n ** 53n) + 1n
// The maximal value that can be reliably represented with number
const maxJsInt = (2n ** 53n) - 1n

/**
 * Convert a typed Quint expression into an object that matches the JSON
 * representation of the ITF trace.
 *
 * @param vars variable names
 * @param states an array of expressions that represent the states
 * @returns an object that represent the trace in the ITF format
 */
export function toItf(vars: string[], states: QuintEx[]): Either<string, any> {
  const exprToItf = (ex: QuintEx): Either<string, any> => {
    switch (ex.kind) {
      case 'int':
        if (ex.value >= minJsInt && ex.value <= maxJsInt) {
          // OK to convert to a number, when saving to JSON
          return right(ex.value)
        } else {
          // convert to a special structure, when saving to JSON
          return right({ '#bigint': `${ex.value}` })
        }

      case 'str':
      case 'bool':
        return right(ex.value)

      case 'app':
        switch (ex.opcode) {
          case 'List':
            return merge(ex.args.map(exprToItf))

          case 'Set':
            return merge(ex.args.map(exprToItf))
                  .mapRight(es => { return { '#set': es } })

          case 'Tup':
            return merge(ex.args.map(exprToItf))
                  .mapRight(es => { return { '#tup': es } })

          case 'Rec': {
            if (ex.args.length % 2 !== 0) {
              return left('record: expected an even number of arguments, found:' + ex.args.length)
            }
            return merge(ex.args.map(exprToItf)).mapRight(kvs => {
              let obj: any = {}
              chunk(kvs, 2).forEach(([k, v]) => {
                obj[k] = v
              })
              return obj
            })
          }

          case 'Map':
            return merge(ex.args.map(exprToItf)).mapRight(pairs => {
              return { '#map': pairs.map(p => p['#tup']) }
            })

          default:
            return left(`Unexpected operator type: ${ex.opcode}`)
        }

      default:
        return left(`Unexpected expression kind: ${ex.kind}`)
    }
  }

  return merge(states.map(exprToItf))
    .mapRight(s => {
      return {
        "vars": vars,
        "states": s,
      }
    })
}
