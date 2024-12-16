/*
 * Support for the Informal Trace Format (ITF):
 * https://apalache.informal.systems/docs/adr/015adr-trace.html
 *
 * Igor Konnov, Shon Feder, Informal Systems, 2023
 *
 * Copyright 2021 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Either, left, merge, right } from '@sweet-monads/either'
import { chunk } from 'lodash'
import { QuintApp, QuintStr } from './ir/quintIr'

import { QuintEx } from './ir/quintIr'

/** The type of IFT traces.
 * See https://github.com/apalache-mc/apalache/blob/main/docs/src/adr/015adr-trace.md */
export type ItfTrace = {
  '#meta'?: any
  params?: string[]
  vars: string[]
  states: ItfState[]
  loop?: number
}

export const ACTION_TAKEN = 'mbt::actionTaken'
export const NONDET_PICKS = 'mbt::nondetPicks'

export type ItfState = {
  '#meta'?: any
  // Mapping of state variables to their values in a state
  [index: string]: ItfValue
}

export type ItfValue =
  | boolean
  | string
  | number
  | ItfValue[] // Sequence
  | ItfBigint
  | ItfTup
  | ItfSet
  | ItfMap
  | ItfUnserializable
  | ItfRecord
  | ItfVariant

type ItfBigint = { '#bigint': string }
type ItfTup = { '#tup': ItfValue[] }
type ItfSet = { '#set': ItfValue[] }
type ItfMap = { '#map': [ItfValue, ItfValue][] }
type ItfUnserializable = { '#unserializable': string }
type ItfRecord = { [index: string]: ItfValue }
type ItfVariant = { tag: ItfValue; value: ItfValue }

// Type predicates to help with type narrowing
function isBigint(v: ItfValue): v is ItfBigint {
  return (v as ItfBigint)['#bigint'] !== undefined
}

function isTup(v: ItfValue): v is ItfTup {
  return (v as ItfTup)['#tup'] !== undefined
}

function isSet(v: ItfValue): v is ItfSet {
  return (v as ItfSet)['#set'] !== undefined
}

function isMap(v: ItfValue): v is ItfMap {
  return (v as ItfMap)['#map'] !== undefined
}

function isVariant(v: ItfValue): v is ItfVariant {
  return (v as ItfVariant)['tag'] !== undefined
}

function isUnserializable(v: ItfValue): v is ItfUnserializable {
  return (v as ItfUnserializable)['#unserializable'] !== undefined
}

/**
 * Convert a list of Quint expressions into an object that matches the JSON
 * representation of the ITF trace. This function does not add metadata
 * to the trace. This should be done by the caller.
 *
 * @param vars variable names
 * @param states an array of expressions that represent the states
 * @returns an object that represent the trace in the ITF format
 */
export function toItf(vars: string[], states: QuintEx[], mbtMetadata: boolean = false): Either<string, ItfTrace> {
  const exprToItf = (ex: QuintEx): Either<string, ItfValue> => {
    switch (ex.kind) {
      case 'int':
        // convert to a special structure, when saving to JSON
        return right({ '#bigint': `${ex.value}` })

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
              let obj: ItfRecord = {}
              chunk(kvs, 2).forEach(([k, v]) => {
                if (typeof k === 'string') {
                  obj[k] = v
                } else {
                  left(`Invalid record field: ${ex}`)
                }
              })
              return obj
            })
          }

          case 'Map':
            return merge(
              // Convert all the entries of the map
              ex.args.map(exprToItf)
            ).chain(pairs =>
              merge(
                // Quint represents map entries as tuples, but in ITF they are 2 element arrays,
                // so we unpack all the ITF tuples into arrays
                pairs.map(p => (isTup(p) ? right(p['#tup']) : left(`Invalid value in quint Map ${p}`)))
              ).map(entries =>
                // Finally, we can form the ITF representation of a map
                ({
                  '#map': entries,
                })
              )
            )

          case 'variant':
            return merge(ex.args.map(exprToItf)).map(([label, value]) => ({ tag: label, value: value }))

          default:
            return left(`Unexpected operator type: ${ex.opcode}`)
        }

      default:
        return left(`Unexpected expression kind: ${ex.kind}`)
    }
  }

  return merge(
    states.map((e, i) =>
      exprToItf(e).chain(obj =>
        typeof obj === 'object'
          ? right({ '#meta': { index: i }, ...obj } as ItfState)
          : left(`Expected a valid ITF state, but found ${obj}`)
      )
    )
  ).mapRight(s => {
    if (mbtMetadata) {
      vars = [...vars, ACTION_TAKEN, NONDET_PICKS]
    }
    return {
      vars: vars,
      states: s,
    }
  })
}

export function ofItf(itf: ItfTrace): QuintEx[] {
  // Benign state to synthesize ids for the Quint expressions
  let nextId = 0n
  // Produce the next ID in sequence
  const getId = (): bigint => {
    const id = nextId
    nextId = nextId + 1n
    return id
  }

  const ofItfValue = (value: ItfValue): QuintEx => {
    const id = getId()
    if (typeof value === 'boolean') {
      return { id, kind: 'bool', value }
    } else if (typeof value === 'string') {
      if (value === 'U_OF_UNIT') {
        // Apalache converts empty tuples to its unit value, "U_OF_UNIT".
        // We need to convert it back to Quint's unit value, the empty tuple.
        return { id, kind: 'app', opcode: 'Tup', args: [] }
      }

      return { id, kind: 'str', value }
    } else if (isBigint(value)) {
      // this is the standard way of encoding an integer in ITF.
      return { id, kind: 'int', value: BigInt(value['#bigint']) }
    } else if (typeof value === 'number') {
      // We never encode an integer as a JS number,
      // but we consume it for backwards compatibility with older ITF traces.
      // See: https://apalache.informal.systems/docs/adr/015adr-trace.html
      return { id, kind: 'int', value: BigInt(value) }
    } else if (Array.isArray(value)) {
      return { id, kind: 'app', opcode: 'List', args: value.map(ofItfValue) }
    } else if (isTup(value)) {
      return { id, kind: 'app', opcode: 'Tup', args: value['#tup'].map(ofItfValue) }
    } else if (isSet(value)) {
      return { id, kind: 'app', opcode: 'Set', args: value['#set'].map(ofItfValue) }
    } else if (isUnserializable(value)) {
      return { id, kind: 'name', name: value['#unserializable'] }
    } else if (isMap(value)) {
      const args = value['#map'].map(([key, value]) => {
        const k = ofItfValue(key)
        const v = ofItfValue(value)
        return { id: getId(), kind: 'app', opcode: 'Tup', args: [k, v] } as QuintApp
      })
      return {
        id,
        kind: 'app',
        opcode: 'Map',
        args,
      }
    } else if (isVariant(value)) {
      const l = ofItfValue(value.tag)
      const v = ofItfValue(value.value)
      return { id, kind: 'app', opcode: 'variant', args: [l, v] }
    } else if (typeof value === 'object') {
      // Any other object must represent a record
      // For each key/value pair in the object, form the quint expressions representing
      // the record field and value
      const args = Object.keys(value)
        .filter(key => key !== '#meta') // Must be removed from top-level ojects representing states
        .map(f => [{ id: getId(), kind: 'str', value: f }, ofItfValue(value[f])] as [QuintStr, QuintEx])
        .flat() // flatten the converted pairs of fields into a single array
      return { id, kind: 'app', opcode: 'Rec', args }
    } else {
      // This should be impossible, but TypeScript can't tell we've handled all cases
      throw new Error(`internal error: unhandled ITF value ${value}`)
    }
  }

  return itf.states.map(ofItfValue)
}
