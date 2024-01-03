/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
  message?: string
  /* A description of the context within which the current node is encountered */
  location: string
  /* The node's children */
  children: ErrorTree[]
}

/*
 * A simple disjunction over error representations to make it easier to chain
 * different operations and handle errors all at once (see buildErrorTree()).
 *
 * Strings can be errors since they can represent an error message that,
 * combined with a location in buildErrorTree() and an empty array of children,
 * can be transformed into an ErrorTree.
 */
export type Error = ErrorTree | ErrorTree[] | string

/*
 * Builds a node in the error tree with one or more errors as children
 *
 * @param location a description of where these errors occurred
 * @param errors one or more ErrorTree instances
 *
 * @returns an error tree with the given location and errors, avoiding duplication
 */
export function buildErrorTree(location: string, errors: Error): ErrorTree {
  if (typeof errors === 'string') {
    return buildErrorLeaf(location, errors)
  } else if (!Array.isArray(errors) && location === errors.location) {
    // Avoid redundant locations
    return errors
  }

  return { location, children: Array.isArray(errors) ? errors : [errors] }
}

/*
 * Builds a leaf with given attributes
 *
 * @param location the description of where the error occurred
 * @param message the description of the error
 *
 * @returns an ErrorTree with given attributes and no children
 */
export function buildErrorLeaf(location: string, message: string): ErrorTree {
  return { location, message, children: [] }
}

/**
 * Formats the string representation of an error tree
 *
 * @param e the ErrorTree to be formatted
 *
 * @returns a multiline string with the pretty printed error tree
 */
export function errorTreeToString(e: ErrorTree): string {
  const childrenErrors = e.children.map(errorTreeToString)
  let out = childrenErrors.join('and\n')
  out += e.message ? e.message + '\n' : ''
  out += e.location + '\n'

  return out
}
