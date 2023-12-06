/*
 * A reimplementation of the prettier printer
 * (originally, introduced by Philip Wadler for Haskell).
 *
 * Our implementation has two important features:
 *
 *  - It is compatible with ANSI color codes. This is why we could not use
 *    prettier-printer from npm.
 *  - It is written in TypeScript.
 *
 * This implementation is following the non-lazy algorithm for OCaml by:
 *
 * Christian Lindig. Strictly Pretty. March 6, 2000.
 *
 * https://lindig.github.io/papers/strictly-pretty-2000.pdf
 *
 * We further adopt the algorithm to TypeScript, by using
 * an immutable stack to simulate recursion.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Stack } from 'immutable'

/**
 * Layout a document. This is the end function that produces produces a string
 * for the best document layout.
 *
 * @param maxWidth the maximum width
 * @param firstColumn the column to use as the starting position
 * @param doc the document to format
 * @returns a resulting string
 */
export const format = (maxWidth: number, firstColumn: number, doc: Doc): string => {
  const fits: FitsElem = {
    indentText: [],
    indentLen: 0,
    mode: 'flat',
    doc: group(doc),
  }
  return formatInternal(maxWidth, firstColumn, fits).join('')
}

/**
 * A string-like object that returns its width in columns and its string
 * representation. Note that `length` and `toString().length` do not have to be
 * equal. For instance, this happens when the string representation contains
 * ANSI characters that encode text colors.
 *
 * Note that strings, e.g., `"abc"`, implement the `StringLike` interface.
 */
export interface StringLike {
  /**
   * The number of characters printed on the screen.
   */
  length: number

  /**
   * Get the string representation of the text to print, which may be longer
   * than `length`.
   *
   * @returns the string representation
   */
  toString: () => string
}

/**
 * The document data type that is generalized by a StringLike implementation.
 * This is input of the layout algorithm.
 */
export type Doc =
  | { kind: 'text'; text: StringLike }
  | { kind: 'line'; linefeed: StringLike; space: StringLike }
  | { kind: 'nest'; indent: StringLike; child: Doc }
  | { kind: 'group'; child: Doc }
  | Doc[]

/**
 * A type guard to distinguish an array document from other documents.
 * @param d the document to test
 * @returns the type predicate that evaluates to true on Doc[]
 */
function isDocArray(d: Doc): d is Doc[] {
  return Array.isArray(d)
}

/**
 * Create a document that carries an indivisible piece of text
 * @param text a string-like text
 * @returns a new document that contains the text
 */
export const text = (text: StringLike): Doc => {
  return { kind: 'text', text: text }
}

/**
 * Create a document that carries decorated text, e.g., adding color or emphasis.
 * It is your responsibility to make sure that the number of columns occupied by
 * `decorator(s)` equals to the number of columns occupied by `s`.
 * For example, adding ANSI color does not affect the space, but it changes
 * string length.
 *
 * @param decorator a function that decorates plain text
 * @param s the string to decorate
 * @returns a string-like object
 */
export const richtext = (decorator: (s: string) => string, s: string): Doc => {
  return text({
    length: s.length,
    toString: () => decorator(s),
  })
}

/**
 * A convenience operator that wraps all strings with `text(...)` while keeping
 * all documents untouched.
 *
 * @param ds an array of documents and strings
 * @returns an array of documents, in which all strings are wrapped with `text(...)`
 */
export const textify = (ds: (Doc | string)[]): Doc[] => {
  return ds.map(d => (typeof d === 'string' ? text(d) : d))
}

/**
 * Create an optional line feed.
 * @param lf the text to use as a line feed
 * @param space the text to use a space
 * @returns a new document that represents a line break
 */
export const line = (lf: StringLike = '\n', space: StringLike = ' '): Doc => {
  return { kind: 'line', linefeed: lf, space }
}

/**
 * A potential line break that is either a line feed, or an empty string.
 */
export const linebreak: Doc = { kind: 'line', linefeed: '\n', space: '' }

/**
 * Simply a non-breaking space, that is, `' '`.
 */
export const space: Doc = text(' ')

/**
 * Create a document that introduces `indent` spaces after every line break.
 * @param indent the text to use for indentation, e.g., a few spaces
 * @param doc the document to decorate with indentation
 * @returns a new document that decorates doc
 */
export const nest = (indent: StringLike, doc: Doc): Doc => {
  return { kind: 'nest', indent, child: doc }
}

/**
 * Create a group document. If all of its children fit on a single line,
 * it should turn all line breaks into spaces. Otherwise, the group stacks
 * its non-group children vertically.
 * @param doc the document to group
 * @returns a new document that groups doc
 */
export const group = (child: Doc): Doc => {
  return { kind: 'group', child }
}

/**
 * Join documents with a separator.
 * @param separator the separator to use
 * @param docs documents to join
 * @returns a new document that contains the elements joined with the separator
 */
export const docJoin = (separator: Doc, docs: Doc[]): Doc => {
  const j = (l: Doc[], d: Doc): Doc[] => {
    return l.length === 0 ? [d] : l.concat([separator, d])
  }

  return docs.reduce(j, [])
}

/**
 * Enclose a document in braces `{ ... }`
 * @param doc the document to enclose
 * @returns the document `{doc}`
 */
export const braces = (doc: Doc): Doc => {
  return [text('{'), doc, text('}')]
}

/**
 * Enclose a document in parentheses `( ... )`
 * @param doc the document to enclose
 * @returns the document `(doc)`
 */
export const parens = (doc: Doc): Doc => {
  return [text('('), doc, text(')')]
}

/**
 * Enclose a document in brackets `[ ... ]`
 * @param doc the document to enclose
 * @returns the document `[doc]`
 */
export const brackets = (doc: Doc): Doc => {
  return [text('['), doc, text(']')]
}

//-------------------- the implementation -------------------------------

// an iteration element that is used in `fits` below
type FitsElem = {
  indentText: string[]
  indentLen: number
  mode: 'flat' | 'break'
  doc: Doc
}

/**
 * Test whether documents fit into `width` columns.
 * We have to manually implement tail recursion via stack.
 * Otherwise, recursive calls may produce a stack overflow in JS.
 *
 * @param width the number of columns to fit into
 * @param inputStack the elements to fit in, as a stack
 * @returns true if and only if `docs` fit into `w` columns
 */
const fits = (width: number, inputStack: Stack<FitsElem>): boolean => {
  let columnBudget = width
  let stack = inputStack
  while (!stack.isEmpty() && columnBudget >= 0) {
    const elem = stack.first()!
    stack = stack.shift()
    if (isDocArray(elem.doc)) {
      // push the children on the stack with the same indentation and mode
      stack = stack.unshiftAll(
        elem.doc.map(d => {
          return { ...elem, doc: d }
        })
      )
    } else {
      switch (elem.doc.kind) {
        case 'text':
          // consume the columns required by the text
          columnBudget -= elem.doc.text.length
          break

        case 'line':
          if (elem.mode === 'flat') {
            // consume the columns required by the space
            columnBudget -= elem.doc.space.length
          } else {
            // Although the paper says that this case is imposssible,
            // it is triggered by their own test. Following the authors,
            // we return true immediately.
            return true
          }
          break

        case 'nest':
          // increase the indentation level and check again (in the next iteration)
          stack = stack.unshift({
            ...elem,
            indentText: elem.indentText.concat([elem.doc.indent.toString()]),
            indentLen: elem.indentLen + elem.doc.indent.length,
            doc: elem.doc.child,
          })
          break

        case 'group':
          // assume that the group fits and check further
          stack = stack.unshift({
            ...elem,
            mode: 'flat',
            doc: elem.doc.child,
          })
          break
      }
    }
  }

  return columnBudget >= 0
}

/**
 * A stack-based implementation of `format`. Since it is using FitsElem,
 * we do not expose this function to the user.
 *
 * In the future, we should consider using generators, as this function
 * produces an array of strings in memory, whereas the documents could
 * be consumed by an output function directly.
 *
 * @param maxWidth the intended width in columns
 * @param start the number of columns already consumed on the current line
 * @param elems the elements to format
 */
const formatInternal = (maxWidth: number, start: number, elem: FitsElem): string[] => {
  let columnBudget = maxWidth
  let consumedOnLine = start
  let output: string[] = []
  let stack: Stack<FitsElem> = Stack([elem])
  while (!stack.isEmpty()) {
    const elem = stack.first()!
    stack = stack.shift()
    if (isDocArray(elem.doc)) {
      stack = stack.unshiftAll(
        elem.doc.map(d => {
          return { ...elem, doc: d }
        })
      )
    } else {
      switch (elem.doc.kind) {
        case 'text':
          output.push(elem.doc.text.toString())
          consumedOnLine += elem.doc.text.length
          break

        case 'nest':
          stack = stack.unshift({
            ...elem,
            indentText: elem.indentText.concat([elem.doc.indent.toString()]),
            indentLen: elem.indentLen + elem.doc.indent.length,
            doc: elem.doc.child,
          })
          break

        case 'line':
          if (elem.mode === 'flat') {
            output.push(elem.doc.space.toString())
            consumedOnLine += elem.doc.space.length
          } else {
            output.push(elem.doc.linefeed.toString())
            output.push(elem.indentText.join(''))
            consumedOnLine = elem.indentLen
          }
          break

        case 'group': {
          const first: FitsElem = { ...elem, mode: 'flat', doc: elem.doc.child }
          if (fits(columnBudget - consumedOnLine, stack.unshift(first))) {
            // the whole group can be printed without a break
            stack = stack.unshift(first)
          } else {
            // the group needs a break on every line, but subgroups may flow
            stack = stack.unshift({ ...first, mode: 'break' })
          }
          break
        }
      }
    }
  }

  return output
}
