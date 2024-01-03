/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Builtin operators and values, defined in `builtin.qnt`
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { DocumentationEntry, produceDocs } from './docs'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { ParseResult, parsePhase1fromText } from './parsing/quintParserFrontend'
import { lf } from 'eol'

import { IdGenerator } from './idGenerator'

/**
 * The documentation map for the builtin definitions
 *
 * @returns a map of builtin definition names to their documentation
 */
export function builtinDocs(gen: IdGenerator): ParseResult<Map<string, DocumentationEntry>> {
  const path = resolve(__dirname, 'builtin.qnt')
  // Read file and remove windows line endings (\r) using `lf`
  const sourceCode = lf(readFileSync(path, 'utf8'))

  const { modules } = parsePhase1fromText(gen, sourceCode, path)
  return produceDocs(modules[0])
}

// TODO: Move builtinSignatures() to this file and read it from builtin.qnt, see https://github.com/informalsystems/quint/issues/452
