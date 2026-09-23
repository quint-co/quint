/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Fixes to the TLA+ produced by Apalache's pretty printer.
 *
 * Quint compiles to TLA+ via Apalache. When the printed TLA+ is not accepted by
 * SANY/TLC, we patch it here instead of waiting on a new Apalache release.
 * Each fix must be a no-op on output that is already correct, so that it keeps
 * working once Apalache is fixed.
 *
 * @module
 */

/**
 * Apply all fixes to the TLA+ code produced by Apalache.
 *
 * @param tla TLA+ module, as printed by Apalache
 * @returns the fixed TLA+ module
 */
export function postprocessTlaplus(tla: string): string {
  return fixes.reduce((code, fix) => fix(code), tla)
}

const fixes: ((tla: string) => string)[] = [fixAngleActions]

/**
 * Apalache prints `<A>_v` for `mustChange(A, v)` (TLA+'s `<<A>>_v`), which SANY cannot parse.
 * Rewrite such occurrences into `<<A>>_v`.
 *
 * Outside comments and strings, `>_` only appears at the end of an angle action (binary operators
 * are printed surrounded by spaces, and `[A]_v` ends with `]_`). From each `>_`, we go back over the
 * action, which Apalache prints either as an operator application (`Next`, `A(i)`) or wrapped in
 * parentheses, and expect the opening `<`.
 */
export function fixAngleActions(tla: string): string {
  const isCode = codeMask(tla)
  // Positions of the `<` and `>` to be doubled
  const positions: number[] = []

  for (let close = tla.indexOf('>_'); close >= 0; close = tla.indexOf('>_', close + 1)) {
    if (!isCode[close] || (close > 0 && tla[close - 1] === '>')) {
      // In a comment or string, or already a `>>_`
      continue
    }

    const start = skipActionBackwards(tla, isCode, close)
    const open = start - 1
    if (start < close && open >= 0 && tla[open] === '<' && isCode[open] && (open === 0 || tla[open - 1] !== '<')) {
      positions.push(open, close)
    }
  }

  // Insert from the end, so that earlier positions remain valid
  return positions.sort((a, b) => b - a).reduce((code, pos) => code.slice(0, pos) + tla[pos] + code.slice(pos), tla)
}

/**
 * Starting right before `end`, go backwards over an expression made of identifier characters and
 * balanced parentheses/brackets, e.g., `Next`, `A(i)`, `f[x]` or `(x' > x)`.
 *
 * @returns the index where the expression starts (`end` if there is no such expression)
 */
function skipActionBackwards(tla: string, isCode: boolean[], end: number): number {
  const closing: Record<string, string> = { ')': '(', ']': '[' }
  let i = end - 1
  while (i >= 0) {
    const c = tla[i]
    if (closing[c] !== undefined && isCode[i]) {
      const matching = findMatchingOpen(tla, isCode, i, c, closing[c])
      if (matching < 0) {
        return end
      }
      i = matching - 1
    } else if (/[A-Za-z0-9_!']/.test(c)) {
      i--
    } else {
      break
    }
  }
  return i + 1
}

function findMatchingOpen(tla: string, isCode: boolean[], closeIdx: number, close: string, open: string): number {
  let depth = 0
  for (let i = closeIdx; i >= 0; i--) {
    if (!isCode[i]) {
      continue
    }
    if (tla[i] === close) {
      depth++
    } else if (tla[i] === open) {
      depth--
      if (depth === 0) {
        return i
      }
    }
  }
  return -1
}

/**
 * Compute which characters are code, as opposed to being inside comments (`\* ...`, `(* ... *)`,
 * which may be nested) or string literals.
 */
function codeMask(tla: string): boolean[] {
  const mask: boolean[] = new Array(tla.length).fill(true)
  let i = 0
  let commentDepth = 0
  while (i < tla.length) {
    if (commentDepth > 0) {
      if (tla.startsWith('(*', i)) {
        commentDepth++
        mask[i] = mask[i + 1] = false
        i += 2
      } else if (tla.startsWith('*)', i)) {
        commentDepth--
        mask[i] = mask[i + 1] = false
        i += 2
      } else {
        mask[i++] = false
      }
    } else if (tla.startsWith('(*', i)) {
      commentDepth = 1
      mask[i] = mask[i + 1] = false
      i += 2
    } else if (tla.startsWith('\\*', i)) {
      while (i < tla.length && tla[i] !== '\n') {
        mask[i++] = false
      }
    } else if (tla[i] === '"') {
      mask[i++] = false
      while (i < tla.length && tla[i] !== '"') {
        if (tla[i] === '\\') {
          mask[i++] = false
        }
        mask[i++] = false
      }
      if (i < tla.length) {
        mask[i++] = false
      }
    } else {
      i++
    }
  }
  return mask
}
