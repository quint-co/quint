import chalk from 'chalk'
import { Doc, docJoin, group, line, linebreak, nest, richtext, text } from '../../prettierimp'
import JSONbig from 'json-bigint'
import { RuntimeValue } from './runtimeValue'

/**
 * Configuration for diff rendering behavior
 */
export interface DiffConfig {
  /**
   * Threshold for collapsing unchanged subtrees. If an unchanged subtree has
   * more than this many items/fields, it will be shown as "..."
   */
  collapseThreshold: number
}

// Color constants
const GRAY = chalk.gray
const RED = chalk.red
const GREEN = chalk.green

// Helper functions for colored rendering
const tint = (s: string, c: (s: string) => string): Doc => richtext(c, s)
const grayRV = (v: RuntimeValue, config?: DiffConfig) => prettyRVWith(v, GRAY, config)
const greenRV = (v: RuntimeValue, config?: DiffConfig) => prettyRVWith(v, GREEN, config)
const redRV = (v: RuntimeValue, config?: DiffConfig) => prettyRVWith(v, RED, config)

/**
 * Check if a runtime value should be collapsed based on its size
 */
function shouldCollapseValue(value: RuntimeValue, config?: DiffConfig): boolean {
  if (!config || config.collapseThreshold <= 0) {
    return false
  }

  // Try different value types to check their size
  const checkers = [
    () => value.toOrderedMap().size, // Records
    () => value.toMap().size, // Maps
    () => value.toList().size, // Lists/tuples
    () => (value.isSetLike ? value.toSet().size : 0), // Sets
  ]

  for (const checker of checkers) {
    try {
      const size = checker()
      if (size > config.collapseThreshold) {
        return true
      }
    } catch {
      // This type check failed, continue to next
      continue
    }
  }

  return false
}

/**
 * Check if a runtime value is a primitive (bool, int, string)
 */
function tryRenderPrimitive(value: RuntimeValue, color: (s: string) => string): Doc | undefined {
  const primitiveCheckers = [
    () => tint(String(value.toBool()), color),
    () => tint(value.toInt().toString(), color),
    () => group([tint('"', color), tint(value.toStr(), color), tint('"', color)]),
  ]

  for (const checker of primitiveCheckers) {
    try {
      return checker()
    } catch {
      // This primitive type check failed, continue to next
      continue
    }
  }
  return undefined
}

/**
 * Main public function to create a diff between two runtime values
 */
export function diffRuntimeValueDoc(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc {
  return diffRuntimeValueDocInternal(a, b, config, false)
}

/**
 * Internal diff function that tracks nesting context
 */
function diffRuntimeValueDocInternal(
  a: RuntimeValue,
  b: RuntimeValue,
  config?: DiffConfig,
  isNested: boolean = false
): Doc {
  // Equal values - render in gray, collapse if nested and large
  if (a.equals(b)) {
    if (isNested && shouldCollapseValue(a, config)) {
      return tint('...', GRAY)
    }
    return grayRV(a, config)
  }

  // Try to render as primitive values
  const atomOld = tryRenderPrimitive(a, RED)
  const atomNew = tryRenderPrimitive(b, GREEN)
  if (atomOld && atomNew) {
    return group([atomOld, text(' => '), atomNew])
  }

  // Try different composite types
  return (
    tryDiffRecords(a, b, config) ||
    tryDiffMaps(a, b, config) ||
    tryDiffLists(a, b, config) ||
    tryDiffVariants(a, b, config) ||
    tryDiffSets(a, b, config) ||
    // Fallback: show as old => new
    group([prettyRVWith(a, RED, config), text(' => '), prettyRVWith(b, GREEN, config)])
  )
}

/**
 * Try to diff two values as records
 */
function tryDiffRecords(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc | undefined {
  try {
    const ra = a.toOrderedMap()
    const rb = b.toOrderedMap()
    const keys = new Set<string>([...ra.keySeq().toArray(), ...rb.keySeq().toArray()])
    const fields: Doc[] = []

    Array.from(keys)
      .sort()
      .forEach(k => {
        const inA = ra.has(k)
        const inB = rb.has(k)

        if (inA && inB) {
          // Field exists in both - diff the values
          fields.push(
            group([
              tint(k, GRAY),
              tint(':', GRAY),
              nest('  ', [line(), diffRuntimeValueDocInternal(ra.get(k)!, rb.get(k)!, config, true)]),
            ])
          )
        } else if (inA) {
          // Field only in A (removed)
          fields.push(group([tint(k, RED), tint(':', RED), nest('  ', [line(), redRV(ra.get(k)!, config)])]))
        } else {
          // Field only in B (added)
          fields.push(group([tint(k, GREEN), tint(':', GREEN), nest('  ', [line(), greenRV(rb.get(k)!, config)])]))
        }
      })

    return nary(GRAY, tint('{', GRAY), fields, tint('}', GRAY), line())
  } catch {
    return undefined
  }
}

/**
 * Try to diff two values as maps
 */
function tryDiffMaps(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc | undefined {
  try {
    const ma = a.toMap()
    const mb = b.toMap()
    const aKeys = ma.keySeq().toArray()
    const bKeys = mb.keySeq().toArray()
    const consumed = new Set<number>()
    const pairs: Doc[] = []

    // Match keys from A with keys in B
    aKeys.forEach(ka => {
      const idx = matchKeyIdx(ka, bKeys)
      if (idx >= 0) {
        consumed.add(idx)
        pairs.push(
          group([
            diffRuntimeValueDocInternal(ka, bKeys[idx], config, true),
            tint(' -> ', GRAY),
            diffRuntimeValueDocInternal(ma.get(ka)!, mb.get(bKeys[idx])!, config, true),
          ])
        )
      } else {
        pairs.push(group([redRV(ka, config), tint(' -> ', RED), redRV(ma.get(ka)!, config)]))
      }
    })

    // Add unmatched keys from B
    bKeys.forEach((kb, i) => {
      if (!consumed.has(i)) {
        pairs.push(group([greenRV(kb, config), tint(' -> ', GREEN), greenRV(mb.get(kb)!, config)]))
      }
    })

    return group([tint('Map', GRAY), nary(GRAY, tint('(', GRAY), pairs, tint(')', GRAY))])
  } catch {
    return undefined
  }
}

/**
 * Try to diff two values as lists/tuples
 */
function tryDiffLists(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc | undefined {
  try {
    const la = a.toList().toArray()
    const lb = b.toList().toArray()

    if (la.length === lb.length) {
      // Same length - diff element by element
      const items = la.map((x, i) => diffRuntimeValueDocInternal(x, lb[i], config, true))
      return nary(GRAY, tint('[', GRAY), items, tint(']', GRAY))
    } else {
      // Different length - show as old => new
      return group([
        nary(
          RED,
          tint('[', RED),
          la.map(x => redRV(x, config)),
          tint(']', RED)
        ),
        text(' => '),
        nary(
          GREEN,
          tint('[', GREEN),
          lb.map(x => greenRV(x, config)),
          tint(']', GREEN)
        ),
      ])
    }
  } catch {
    return undefined
  }
}

/**
 * Try to diff two values as variants
 */
function tryDiffVariants(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc | undefined {
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
        : group([labelDoc, text('('), prettyRVWith(payload, color, config), text(')')])
    }

    if (la === lb) {
      // Same label - diff the payload
      const labelDoc = tint(la, GRAY)
      if (payloadIsEmptyTuple(va) && payloadIsEmptyTuple(vb)) {
        return labelDoc
      } else {
        return group([labelDoc, text('('), diffRuntimeValueDocInternal(va, vb, config, true), text(')')])
      }
    } else {
      // Different labels - show old => new
      const oldDoc = renderVariant(la, va, RED)
      const newDoc = renderVariant(lb, vb, GREEN)
      return group([oldDoc, text(' => '), newDoc])
    }
  } catch {
    return undefined
  }
}

/**
 * Try to diff two values as sets
 */
function tryDiffSets(a: RuntimeValue, b: RuntimeValue, config?: DiffConfig): Doc | undefined {
  if (!a.isSetLike && !b.isSetLike) {
    return undefined
  }

  try {
    const sa = a.isSetLike ? Array.from(a.toSet()) : []
    const sb = b.isSetLike ? Array.from(b.toSet()) : []
    const matchedB = new Array<boolean>(sb.length).fill(false)
    const items: Doc[] = []

    // Find matching elements
    for (const ea of sa) {
      let matched = false
      for (let i = 0; i < sb.length; i++) {
        if (!matchedB[i] && ea.equals(sb[i])) {
          matchedB[i] = true
          matched = true
          items.push(grayRV(ea, config))
          break
        }
      }
      if (!matched) {
        items.push(redRV(ea, config))
      }
    }

    // Add unmatched elements from B
    for (let i = 0; i < sb.length; i++) {
      if (!matchedB[i]) {
        items.push(greenRV(sb[i], config))
      }
    }

    return group([tint('Set', GRAY), nary(GRAY, tint('(', GRAY), items, tint(')', GRAY))])
  } catch {
    return undefined
  }
}

/**
 * Helper function for n-ary layouts (records, lists, etc.)
 * Same indentation behavior as graphics.ts
 */
function nary(c: (s: string) => string, left: Doc, args: Doc[], right: Doc, padding: Doc = linebreak): Doc {
  const as = group([nest('  ', [padding, docJoin([tint(',', c), line()], args)]), padding])
  return group([left, as, right])
}

/**
 * A neutral pretty-printer for RuntimeValue that applies a single color.
 * It deliberately avoids the per-token color scheme in prettyQuintEx, since diff colors
 * carry the semantics here.
 */
function prettyRVWith(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc {
  // Try primitive types first
  const primitive = tryRenderPrimitive(v, c)
  if (primitive) {
    return primitive
  }

  // Try composite types
  return (
    tryPrettyRecord(v, c, config) ||
    tryPrettyMap(v, c, config) ||
    tryPrettyList(v, c, config) ||
    tryPrettyVariant(v, c, config) ||
    tryPrettySet(v, c, config) ||
    // Fallback to JSON
    tryPrettyFallback(v, c)
  )
}

function tryPrettyRecord(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc | undefined {
  try {
    const om = v.toOrderedMap()
    const kvs: Doc[] = []
    om.forEach((val, key) => {
      kvs.push(group([tint(key, c), tint(':', c), nest('  ', [line(), prettyRVWith(val, c, config)])]))
    })
    return nary(c, tint('{', c), kvs, tint('}', c), line())
  } catch {
    return undefined
  }
}

function tryPrettyMap(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc | undefined {
  try {
    const m = v.toMap()
    const ps: Doc[] = []
    m.forEach((vv, kk) => {
      ps.push(group([prettyRVWith(kk, c, config), tint(' -> ', c), prettyRVWith(vv, c, config)]))
    })
    return group([tint('Map', c), nary(c, tint('(', c), ps, tint(')', c))])
  } catch {
    return undefined
  }
}

function tryPrettyList(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc | undefined {
  try {
    const list = v.toList()
    const items = list.toArray().map(x => prettyRVWith(x, c, config))
    return nary(c, tint('[', c), items, tint(']', c))
  } catch {
    return undefined
  }
}

function tryPrettyVariant(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc | undefined {
  try {
    const [label, value] = v.toVariant()

    // Check if variant has empty tuple payload
    let isEmptyTuple = false
    try {
      isEmptyTuple = value.toList().toArray().length === 0
    } catch {
      // Not a tuple or conversion failed
    }

    const labelDoc = tint(label, c)
    return isEmptyTuple
      ? labelDoc
      : group([labelDoc, nary(c, tint('(', c), [prettyRVWith(value, c, config)], tint(')', c))])
  } catch {
    return undefined
  }
}

function tryPrettySet(v: RuntimeValue, c: (s: string) => string, config?: DiffConfig): Doc | undefined {
  if (!v.isSetLike) {
    return undefined
  }

  try {
    const set = v.toSet()
    const elems = Array.from(set).map(x => prettyRVWith(x, c, config))
    return group([tint('Set', c), nary(c, tint('(', c), elems, tint(')', c))])
  } catch {
    // Non-enumerable (infinite) set - let it fall through
    return undefined
  }
}

function tryPrettyFallback(v: RuntimeValue, c: (s: string) => string): Doc {
  try {
    return tint(JSONbig.stringify(v), c)
  } catch {
    return tint('<value>', c)
  }
}

/**
 * Helper function to find the index of a matching key in an array
 */
function matchKeyIdx(key: RuntimeValue, keys: RuntimeValue[]): number {
  for (let i = 0; i < keys.length; i++) {
    if (key.equals(keys[i])) {
      return i
    }
  }
  return -1
}
