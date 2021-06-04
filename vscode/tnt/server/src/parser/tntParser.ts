/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

interface ParseOk {
    kind: "ok"
}

interface ParseError {
    kind: "error",
    messages: String[]
}

type ParseResult = ParseOk | ParseError

// The main entry point for the TNT parser
export function parseTnt(text: string): ParseResult {
    return { kind: "ok" }
}