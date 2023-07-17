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

import { ErrorTree } from './errorTree'

/* General representation of a Quint error */
export interface QuintError {
  /* The error code in the form QNTnnn */
  code: ErrorCode
  /* The error explanation */
  message: string
  /* The id of the component that caused the error */
  reference: bigint
  /* Additional data for the error */
  data: QuintErrorData
}

export type ErrorCode =
  /* Placeholder for errors that have not been assigned a proper code yet */
  | 'QNT000'
  /* QNT001: Expected 'const', 'var', 'def', 'type', etc. */
  | 'QNT001'
  /* QNT002: Missing ': type' after 'var' or 'const' */
  | 'QNT002'
  /* QNT003: Expected an expression */
  | 'QNT003'
  /* QNT004: Unexpected symbol after expression */
  | 'QNT004'
  /* QNT005: Keywords are not allowed as record fields in record.field */
  | 'QNT005'
  /* QNT006: Unexpected '=', did you mean '=='? */
  | 'QNT006'
  /* QNT007: Type names must start with an uppercase letter */
  | 'QNT007'
  /* QNT099: Found cyclic definitions */
  | 'QNT099'
  /* QNT101: Conflicting definitions for '<name>' */
  | 'QNT101'
  /* QNT102: Module with name '<name>' was already defined */
  | 'QNT102'
  /* QNT200: Mode error */
  | 'QNT200'
  /* QNT201: Instance overrides must be pure */
  | 'QNT201'
  /* QNT202: Multiple updates of the same variable */
  | 'QNT202'
  /* QNT404: Name '<name>' not found */
  | 'QNT404'
  /* QNT405: Module '<name>' not found */
  | 'QNT405'
  /* QNT406: Instantiation error */
  | 'QNT406'
  /* QNT407: Cannot import self */
  | 'QNT407'
  /* QNT500: Unitialized constant */
  | 'QNT500'

/* Additional data for a Quint error */
export interface QuintErrorData {
  /* Information on how to fix the error, when possible */
  fix?: QuintErrorFix
  /* A more detailed description of how the error was found */
  trace?: ErrorTree
}

/* Information on how to fix a quint error */
export type QuintErrorFix =
  /* Replace a string with another */
  { kind: 'replace'; original: string; replacement: string }

/** Formats a Quint error as a string
 *
 * @param err the error to be formatted
 *
 * @returns a string representation of the error
 */
export function quintErrorToString(err: QuintError): string {
  return `[${err.code}] ${err.message}`
}
