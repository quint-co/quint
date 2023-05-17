/*
 * Support for the Informal Trace Format (ITF):
 * https://apalache.informal.systems/docs/adr/015adr-trace.html
 *
 * Igor Konnov, Shon Feder, Informal Systems, 2023
 *
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, merge, right } from '@sweet-monads/either'
import { chunk } from 'lodash'

import { QuintEx } from './quintIr'

export type ItfValue =
  | boolean
  | string
  | number
  | ItfValue[] // Sequence
  | { '#bigint': string }
  | { '#tup': ItfValue[] }
  | { '#set': ItfValue[] }
  | { '#map': [ItfValue, ItfValue][] }
  | { '#unserializable': string }
  | { [index: string]: ItfValue } // Record

export type ItfState = {
  '#meta'?: any
  // Mapping of State variables to their values in a state
  [index: string]: ItfValue
}

/** The type of IFT traces.
 * See https://github.com/informalsystems/apalache/blob/main/docs/src/adr/015adr-trace.md */
export type ItfTrace = {
  '#meta'?: any
  params?: string[]
  vars: string[]
  states: ItfState[]
  loop?: number
}

const minJsInt: bigint = BigInt(Number.MIN_SAFE_INTEGER)
const maxJsInt: bigint = BigInt(Number.MAX_SAFE_INTEGER)

/**
 * Convert a list of Quint expressions into an object that matches the JSON
 * representation of the ITF trace. This function does not add metadata
 * to the trace. This should be done by the caller.
 *
 * @param vars variable names
 * @param states an array of expressions that represent the states
 * @returns an object that represent the trace in the ITF format
 */
export function toItf(vars: string[], states: QuintEx[]): Either<string, ItfTrace> {
  const exprToItf = (ex: QuintEx): Either<string, any> => {
    switch (ex.kind) {
      case 'int':
        if (ex.value >= minJsInt && ex.value <= maxJsInt) {
          // We can represent safely as a JS number
          return right(Number(ex.value))
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
            return merge(ex.args.map(exprToItf)).mapRight(es => {
              return { '#set': es }
            })

          case 'Tup':
            return merge(ex.args.map(exprToItf)).mapRight(es => {
              return { '#tup': es }
            })

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

  return merge(
    states.map((e, i) =>
      exprToItf(e).mapRight(obj => {
        return { '#meta': { index: i }, ...obj }
      })
    )
  ).mapRight(s => {
    return {
      vars: vars,
      states: s,
    }
  })
}

// export function ofItf(itf: any[]): Either<string, QuintEx[]> {
//   const stateToExpr = (any: )
// }
