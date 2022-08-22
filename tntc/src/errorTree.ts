/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A structure to track errors across nested function calls in a tree, along
 * with helpful build functions
 *
 * @author Gabriela Moreira
 *
 * @module
 */

/*
 * A tree of errors tracking the trace from the full given effect(s) to the part
 * where the error occurred
 */
export interface ErrorTree {
  /* The error message, used for the terminal node where the error occurred */
  message?: string,
  /* A description of the context within which the current node is encountered */
  location: string,
  /* The node's children */
  children: ErrorTree[]
}

/*
 * A simple disjunction over error representations to make it easier to chain
 * different operations and handle errors all at once (see buildErrorTree())
 * */
export type Error = ErrorTree | ErrorTree[]

/*
 * Builds a node in the error tree with one or more errors as children
 *
 * @param location a description of where these errors occurred
 * @param errors one or more ErrorTree instances
 *
 * @returns an error tree with the given location and errors, avoiding duplication
 */
export function buildErrorTree (location: string, errors: Error): ErrorTree {
  if (!Array.isArray(errors) && location === errors.location) {
    // Avoid redundant locations
    return errors
  }

  return { location: location, children: Array.isArray(errors) ? errors : [errors] }
}

/*
 * Builds a leaf with given attributes
 *
 * @param location the description of where the error occurred
 * @param message the description of the error
 *
 * @returns an ErrorTree with given attributes and no children
 */
export function buildErrorLeaf (location: string, message: string): ErrorTree {
  return { location: location, message: message, children: [] }
}

/**
 * Formats the string representation of an error tree
 *
 * @param e the ErrorTree to be formatted
 *
 * @returns a multiline string with the pretty printed error tree
 */
export function errorTreeToString (e: ErrorTree): string {
  const childrenErrors = e.children.map(errorTreeToString)
  let out = childrenErrors.join('and\n')
  out += e.message ? e.message + '\n' : ''
  out += e.location + '\n'

  return out
}
