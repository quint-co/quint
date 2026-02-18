/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Utilities for testing
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import {
  Loc,
  LookupTable,
  ParserPhase4,
  QuintModule,
  fileSourceResolver,
  newIdGenerator,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
} from '@informalsystems/quint'
import { mkdirSync, readFileSync, rmdirSync, writeFileSync } from 'fs'
import { parseDocument } from '../src/parsing'
import { URI } from 'vscode-uri'
import { dirname, join } from 'path'

/**
 * Parses a mocked module and returns the result of the parsing phases, or
 * throws an error if the parsing fails. To be used in tests only.
 *
 * @param moduleText the text of the mocked module
 *
 * @throws Error if the parsing fails
 *
 * @returns A triple with the combined result of the parsing phases
 */
export function parseOrThrow(moduleText: string): [QuintModule[], Map<bigint, Loc>, LookupTable] {
  const idgen = newIdGenerator()
  const phase1Data = parsePhase1fromText(idgen, moduleText, 'mocked_path')

  const resolver = fileSourceResolver(new Map())
  const mainPath = resolver.lookupPath('mocked_path', './main')
  const phase2Data = parsePhase2sourceResolution(idgen, resolver, mainPath, phase1Data)

  const phase3Data = parsePhase3importAndNameResolution(phase2Data)

  if (phase3Data.errors.length > 0) {
    throw new Error('Failed to parse mocked module')
  }

  return [phase2Data.modules, phase2Data.sourceMap, phase3Data.table]
}

/**
 * Builds a temporary project on disk and parses the `entryFile`.
 * This is useful for testing imports across multiple files.
 */
export function parseProjectOrThrow(
  entryFile: string,
  files: Record<string, string>
): [ParserPhase4, { rootDir: string; entryUri: string }] {
  const rootDir = join(process.cwd(), `.tmp-quint-lsp-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(rootDir, { recursive: true })

  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const absPath = join(rootDir, relativePath)
      mkdirSync(dirname(absPath), { recursive: true })
      writeFileSync(absPath, content, 'utf8')
    }

    const entryAbsPath = join(rootDir, entryFile)
    const entryText = readFileSync(entryAbsPath, 'utf8')
    const entryUri = URI.file(entryAbsPath).toString()
    const parsedData = parseDocument(newIdGenerator(), URI.file(entryAbsPath), entryText)

    if (parsedData.errors.length > 0) {
      throw new Error('Failed to parse mocked project')
    }

    return [parsedData, { rootDir, entryUri }]
  } finally {
    // Parsing already loaded all imported files into memory.
       rmdirSync(rootDir, { recursive: true })
    }
}
