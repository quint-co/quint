import chalk from 'chalk'
import { Doc, docJoin, group, line, linebreak, nest, richtext, text } from '../../prettierimp'
import JSONbig from 'json-bigint'
import { RuntimeValue } from './runtimeValue'

const grayRV = (v: RuntimeValue) => prettyRVWith(v, GRAY)
const greenRV = (v: RuntimeValue) => prettyRVWith(v, GREEN)
const redRV = (v: RuntimeValue) => prettyRVWith(v, RED)

export function diffRuntimeValueDoc(a: RuntimeValue, b: RuntimeValue): Doc {
  // Entire value equal -> all gray
  if (a.equals(b)) return grayRV(a)

  // Primitive old => new
  const atomOld = (() => {
    try {
      return tint(String(a.toBool()), RED)
    } catch {}
    try {
      return tint(a.toInt().toString(), RED)
    } catch {}
    try {
      return group([tint('"', RED), tint(a.toStr(), RED), tint('"', RED)])
    } catch {}
    return undefined
  })()
  const atomNew = (() => {
    try {
      return tint(String(b.toBool()), GREEN)
    } catch {}
    try {
      return tint(b.toInt().toString(), GREEN)
    } catch {}
    try {
      return group([tint('"', GREEN), tint(b.toStr(), GREEN), tint('"', GREEN)])
    } catch {}
    return undefined
  })()
  if (atomOld && atomNew) return group([atomOld, text(' => '), atomNew])

  // Records (diff by field)
  try {
    const ra = a.toOrderedMap()
    const rb = b.toOrderedMap()
    const keys = new Set<string>([...ra.keySeq().toArray(), ...rb.keySeq().toArray()])
    const fields: Doc[] = []
    Array.from(keys)
      .sort()
      .forEach(k => {
        const inA = ra.has(k),
          inB = rb.has(k)
        if (inA && inB) {
          fields.push(
            group([tint(k, GRAY), tint(':', GRAY), nest('  ', [line(), diffRuntimeValueDoc(ra.get(k)!, rb.get(k)!)])])
          )
        } else if (inA) {
          fields.push(group([tint(k, RED), tint(':', RED), nest('  ', [line(), redRV(ra.get(k)!)])]))
        } else {
          fields.push(group([tint(k, GREEN), tint(':', GREEN), nest('  ', [line(), greenRV(rb.get(k)!)])]))
        }
      })
    return nary(GRAY, tint('{', GRAY), fields, tint('}', GRAY), line())
  } catch {}

  // Maps (match keys by equals)
  try {
    const ma = a.toMap(),
      mb = b.toMap()
    const aKeys = ma.keySeq().toArray(),
      bKeys = mb.keySeq().toArray()
    const consumed = new Set<number>()
    const pairs: Doc[] = []

    aKeys.forEach(ka => {
      const idx = matchKeyIdx(ka, bKeys)
      if (idx >= 0) {
        consumed.add(idx)
        pairs.push(
          group([
            diffRuntimeValueDoc(ka, bKeys[idx]),
            tint(' -> ', GRAY),
            diffRuntimeValueDoc(ma.get(ka)!, mb.get(bKeys[idx])!),
          ])
        )
      } else {
        pairs.push(group([redRV(ka), tint(' -> ', RED), redRV(ma.get(ka)!)]))
      }
    })
    bKeys.forEach((kb, i) => {
      if (!consumed.has(i)) {
        pairs.push(group([greenRV(kb), tint(' -> ', GREEN), greenRV(mb.get(kb)!)]))
      }
    })

    return group([tint('Map', GRAY), nary(GRAY, tint('(', GRAY), pairs, tint(')', GRAY))])
  } catch {}

  // Lists / Tuples (element-wise when arity matches)
  try {
    const la = a.toList().toArray()
    const lb = b.toList().toArray()
    if (la.length === lb.length) {
      const items = la.map((x, i) => diffRuntimeValueDoc(x, lb[i]))
      return nary(GRAY, tint('[', GRAY), items, tint(']', GRAY))
    } else {
      return group([
        nary(RED, tint('[', RED), la.map(redRV), tint(']', RED)),
        text(' => '),
        nary(GREEN, tint('[', GREEN), lb.map(greenRV), tint(']', GREEN)),
      ])
    }
  } catch {}

  // Variant
  try {
    const [la, va] = a.toVariant()
    const [lb, vb] = b.toVariant()

    const payloadIsEmptyTuple = (rv: RuntimeValue): boolean => {
      try {
        return rv.toList().toArray().length === 0
      } catch {
        return false
      }
    }

    const renderVariant = (label: string, payload: RuntimeValue, color: (s: string) => string): Doc => {
      const labelDoc = tint(label, color)
      return payloadIsEmptyTuple(payload)
        ? labelDoc
        : group([labelDoc, text('('), prettyRVWith(payload, color), text(')')])
    }

    if (la === lb) {
      // Same label: keep label gray and diff the payload
      const labelDoc = tint(la, GRAY)
      if (payloadIsEmptyTuple(va) && payloadIsEmptyTuple(vb)) {
        return labelDoc
      } else {
        return group([labelDoc, text('('), diffRuntimeValueDoc(va, vb), text(')')])
      }
    } else {
      // Different label: show old (red) => new (green)
      const oldDoc = renderVariant(la, va, RED)
      const newDoc = renderVariant(lb, vb, GREEN)
      return group([oldDoc, text(' => '), newDoc])
    }
  } catch {}

  // Sets (presence/absence by equals)
  if (a.isSetLike || b.isSetLike) {
    try {
      const sa = a.isSetLike ? Array.from(a.toSet()) : []
      const sb = b.isSetLike ? Array.from(b.toSet()) : []
      const matchedB = new Array<boolean>(sb.length).fill(false)
      const items: Doc[] = []

      for (const ea of sa) {
        let matched = false
        for (let i = 0; i < sb.length; i++) {
          if (!matchedB[i] && ea.equals(sb[i])) {
            matchedB[i] = true
            matched = true
            items.push(grayRV(ea))
            break
          }
        }
        if (!matched) items.push(redRV(ea))
      }
      for (let i = 0; i < sb.length; i++) {
        if (!matchedB[i]) items.push(greenRV(sb[i]))
      }

      return group([tint('Set', GRAY), nary(GRAY, tint('(', GRAY), items, tint(')', GRAY))])
    } catch {}
  }

  // Fallback when shapes differ
  return group([prettyRVWith(a, RED), text(' => '), prettyRVWith(b, GREEN)])
}

// Same indentation behavior as graphics.ts
function nary(c: (s: string) => string, left: Doc, args: Doc[], right: Doc, padding: Doc = linebreak): Doc {
  const as = group([nest('  ', [padding, docJoin([tint(',', c), line()], args)]), padding])
  return group([left, as, right])
}

const GRAY = chalk.gray
const RED = chalk.red
const GREEN = chalk.green
const tint = (s: string, c: (s: string) => string): Doc => richtext(c, s)

// A neutral pretty-printer for RuntimeValue that applies a single tint (gray/green/red).
// It deliberately avoids the per-token color scheme in prettyQuintEx, since diff colors
// carry the semantics here.
function prettyRVWith(v: RuntimeValue, c: (s: string) => string): Doc {
  // Bool
  try {
    return tint(String(v.toBool()), c)
  } catch {}

  // Int
  try {
    return tint(v.toInt().toString(), c)
  } catch {}

  // Str
  try {
    return group([tint('"', c), tint(v.toStr(), c), tint('"', c)])
  } catch {}

  // Record
  try {
    const om = v.toOrderedMap()
    const kvs: Doc[] = []
    om.forEach((val, key) => {
      kvs.push(group([tint(key, c), tint(':', c), nest('  ', [line(), prettyRVWith(val, c)])]))
    })
    return nary(c, tint('{', c), kvs, tint('}', c), line())
  } catch (err) {}

  // Map
  try {
    const m = v.toMap()
    const ps: Doc[] = []
    m.forEach((vv, kk) => {
      ps.push(group([prettyRVWith(kk, c), tint(' -> ', c), prettyRVWith(vv, c)]))
    })
    return group([tint('Map', c), nary(c, tint('(', c), ps, tint(')', c))])
  } catch {}

  // List / Tuple (treated uniformly from outside runtimeValue.ts)
  try {
    const list = v.toList()
    const items = list.toArray().map(x => prettyRVWith(x, c))
    return nary(c, tint('[', c), items, tint(']', c))
  } catch {}

  // Variant
  try {
    const [label, value] = v.toVariant()

    // A variant with an empty tuple payload is rendered as a bare label
    let isEmptyTuple = false
    try {
      isEmptyTuple = value.toList().toArray().length === 0
    } catch {}

    const labelDoc = tint(label, c)
    return isEmptyTuple ? labelDoc : group([labelDoc, nary(c, tint('(', c), [prettyRVWith(value, c)], tint(')', c))])
  } catch {}

  // Set-like (finite)
  if (v.isSetLike) {
    try {
      const elems = Array.from(v.toSet()).map(x => prettyRVWith(x, c))
      return group([tint('Set', c), nary(c, tint('(', c), elems, tint(')', c))])
    } catch {
      // non-enumerable (infinite) falls through
    }
  }

  // Fallback
  try {
    return tint(JSONbig.stringify(v), c)
  } catch {
    return tint('<value>', c)
  }
}

function matchKeyIdx(key: RuntimeValue, keys: RuntimeValue[]): number {
  for (let i = 0; i < keys.length; i++) if (key.equals(keys[i])) return i
  return -1
}
