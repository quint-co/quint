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
  reference?: bigint
  /* Additional data for the error */
  data?: QuintErrorData
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
  /* QNT008: Simple identifiers cannot be qualified (i.e. contain `::`) */
  | 'QNT008'
  /* QNT009: Missing arguments or parameters. You should omit the parentheses */
  | 'QNT009'
  /* QNT011: Records in disjoint union have different tag fields: <tag> and <otherTag> */
  | 'QNT011'
  /* QNT012: '...' may be used once in '{ ...record, <fields> }' */
  | 'QNT012'
  /* QNT013: import ... from <source>: could not load */
  | 'QNT013'
  /* QNT098: Cyclic imports */
  | 'QNT098'
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
  /* QNT501: Internal compiler error */
  | 'QNT501'
  /* QNT502: Variable not set */
  | 'QNT502'
  /* QNT503: Invalid arithmetics */
  | 'QNT503'
  /* QNT504: Range out of bounds */
  | 'QNT504'
  /* QNT505: Tail on empty list */
  | 'QNT505'
  /* QNT506: Invalid slice */
  | 'QNT506'
  /* QNT507: Missing map key */
  | 'QNT507'
  /* QNT508: Assertion failed */
  | 'QNT508'
  /* QNT509: Called oneOf() in an empty set */
  | 'QNT509'
  /* QNT510: Array acces out of bounds */
  | 'QNT510'
  /* QNT511: Test returned false */
  | 'QNT511'
  /* QNT512: Simulation failure */
  | 'QNT512'

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
