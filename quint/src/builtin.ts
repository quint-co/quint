/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
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
import { ErrorMessage, parsePhase1fromText } from './parsing/quintParserFrontend'
import { Either } from '@sweet-monads/either'
import { lf } from 'eol'

import { IdGenerator } from './idGenerator'

/**
 * The documentation map for the builtin definitions
 *
 * @returns a map of builtin definition names to their documentation
 */
export function builtinDocs(gen: IdGenerator): Either<ErrorMessage[], Map<string, DocumentationEntry>> {
  const path = resolve(__dirname, 'builtin.qnt')
  // Read file and remove windows line endings (\r) using `lf`
  const sourceCode = lf(readFileSync(path, 'utf8'))

  return parsePhase1fromText(gen, sourceCode, path).map(phase1Data => produceDocs(phase1Data.modules[0]))
}

// TODO: Move builtinSignatures() to this file and read it from builtin.qnt, see https://github.com/informalsystems/quint/issues/452
