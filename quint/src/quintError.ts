/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Representation for quint errors
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { ErrorTree } from "./errorTree"

/* General representation of a Quint error */
export interface QuintError {
  /* The error code in the form QNTnnn */
  code: string,
  /* The error explanation */
  message: string,
  /* Additional data for the error */
  data: QuintErrorData
}

/* Additional data for a Quint error */
export interface QuintErrorData {
  /* Information on how to fix the error, when possible */
  fix?: QuintErrorFix,
  /* A more detailed description of how the error was found */
  trace?: ErrorTree
}

/* Information on how to fix a quint error */
export type QuintErrorFix =
  /* Replace a string with another */
  | { kind: 'replace', original: string, replacement: string }

/** Formats a Quint error as a string
 *
 * @param err the error to be formatted
 *
 * @returns a string representation of the error
 */
export function quintErrorToString(err: QuintError): string {
  return `${err.code}: ${err.message}`
}
