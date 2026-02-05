/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
  /* QNT012: '...' may be used once in '{ ...record, <fields> }' */
  | 'QNT012'
  /* QNT013: import ... from <source>: could not load */
  | 'QNT013'
  /* QNT014: Type variables in a type declaration are not declared as parameters */
  | 'QNT014'
  /* QNT015: use a -> b instead of Map[a, b] */
  | 'QNT015'
  /* QNT016: Duplicated field on record */
  | 'QNT016'
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
  /* QNT203: 'oneOf' must be used inside a nondet definition */
  | 'QNT203'
  /* QNT204: 'oneOf' must be the outermost expression in a nondet definition */
  | 'QNT204'
  /* QNT205: nondet bindings can only be used with boolean expressions */
  | 'QNT205'
  /* QNT206: 'nondet' can only be used inside actions, not at the top level */
  | 'QNT206'
  /* QNT404: Name '<name>' not found */
  | 'QNT404'
  /* QNT405: Module '<name>' not found */
  | 'QNT405'
  /* QNT406: Instantiation error */
  | 'QNT406'
  /* QNT407: Cannot import self */
  | 'QNT407'
  /* QNT408: Case-sensitive filenames */
  | 'QNT408'
  /* QNT409: Init cannot be converted to TLA+ */
  | 'QNT409'
  /* QNT500: Uninitialized constant */
  | 'QNT500'
  /* QNT501: Internal compiler error */
  | 'QNT501'
  /* QNT502: Variable not set */
  | 'QNT502'
  /* QNT503: Invalid arithmetic */
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
  /* QNT510: Array access out of bounds */
  | 'QNT510'
  /* QNT511: Test returned false */
  | 'QNT511'
  /* QNT512: Simulation failure */
  | 'QNT512'
  /* QNT513: Cannot continue in 'then' */
  | 'QNT513'
  /* QNT514: Cardinality is infinite */
  | 'QNT514'
  /* QNT515: 'apalache::generate' is not supported by the simulator */
  | 'QNT515'
  /* QNT516: Rust evaluator process failure */
  | 'QNT516'
  /* QNT517: Rust evaluator killed by signal */
  | 'QNT517'

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

/** Type predicate to check if an unknown error is a QuintError
 *
 * @param error the error to check
 *
 * @returns true if the error is a QuintError
 */
export function isQuintError(error: unknown): error is QuintError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

/** Formats a Quint error as a string
 *
 * @param err the error to be formatted
 *
 * @returns a string representation of the error
 */
export function quintErrorToString(err: QuintError): string {
  return `[${err.code}] ${err.message}`
}
