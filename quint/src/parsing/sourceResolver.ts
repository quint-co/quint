/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Source resolution for Quint. This module deals with loading sources from strings
 * and files.
 *
 * @author Igor Konnov
 *
 * @module
 */
import { Either, left, right } from '@sweet-monads/either'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import { lf } from 'eol'

/**
 * An abstraction of a full path that is used to distinguish the same module,
 * when it is resolved via different paths. Note that this path may be
 * system-dependent and resolver dependent.
 */
export interface SourceLookupPath {
  /**
   * An internal representation of a path, which may be system-dependent.
   * The important property is that this path is normalized, that is,
   * when the same module is referred via different paths, we should still
   * arrive at the same internal path representation.
   */
  normalizedPath: string

  /**
   * Produce the source name that will be shown in errors and stored in source maps.
   * This name must be platform-independent, and it must be the same across
   * different platforms (e.g., Linux and Windows)
   * @returns a string representation of the path that is written in source maps
   */
  toSourceName: () => string
}

/**
 * A general interface for resolving sources.
 */
export interface SourceResolver {
  /**
   * Generate a source lookup path from a (system-dependent) basepath and
   * the part that is used in the 'from' clause of imports.

   * @param stempath a resolver-dependent and system dependent stem path
   * @param importPath a path that is used in 'import ... from ...'
   * @returns normalized source lookup path
   */
  lookupPath: (stempath: string, importPath: string) => SourceLookupPath

  /**
   * Load text from the source pointed by the path. The path must be relative to the
   * basepath.
   *
   * @param lookupPath a source lookup path created via `mkLookupPath`.
   * @returns either `left(errorMessage)` if the source cannot be loaded, or `right(text)`.
   */
  load: (lookupPath: SourceLookupPath) => Either<string, string>

  /**
   * Extract the resolver-specific stem from a path, e.g., the directory name
   * if path is a path in a filesystem.
   *
   * @param lookupPath a source lookup path created via `mkLookupPath`.
   * @returns the stem of a path, e.g., the parent directory
   */
  stempath: (lookupPath: SourceLookupPath) => string
}

/**
 * Read the source code in UTF-8 from the filesystem via NodeJS API.
 * @param sourceCode an optional map of paths to source code,
 *        to be updated when reading new files
 * @param replacer an optional path replacement function,
 *        which is used to produce a source name
 * @returns A filesystem resolver. For each path, it returns
 *          either `left(errorMessage)`, or `right(fileContents)`.
 */
export function fileSourceResolver(
  sourceCode: Map<string, string> = new Map(),
  replacer: (path: string) => string = path => path
): SourceResolver {
  return {
    lookupPath: (basepath: string, importPath: string) => {
      return {
        normalizedPath: join(basepath, importPath),
        toSourceName: () => {
          return replacer(join(basepath, importPath))
        },
      }
    },

    load: (lookupPath: SourceLookupPath): Either<string, string> => {
      try {
        const code = lf(readFileSync(lookupPath.normalizedPath, 'utf8'))
        sourceCode.set(lookupPath.normalizedPath, code)
        return right(code)
      } catch (err: any) {
        return left(err.message)
      }
    },

    stempath: (lookupPath: SourceLookupPath): string => {
      return dirname(lookupPath.normalizedPath)
    },
  }
}

/**
 * Read the source code from a map of strings. This resolver is especially
 * useful for tests.
 * @param sources a map of paths mapped to text
 * @returns a static resolver that uses the map to read the contents.
 */
export const stringSourceResolver = (sources: Map<string, string>): SourceResolver => {
  return {
    lookupPath: (stempath: string, importPath: string) => {
      return {
        normalizedPath: join(stempath, importPath),
        toSourceName: () => {
          return join(stempath, importPath)
        },
      }
    },

    load: (lookupPath: SourceLookupPath): Either<string, string> => {
      // We are using nodejs path.join here.
      // If we have to decouple this resolver from nodejs in the future,
      // we would have to write our own version of join.
      const contents = sources.get(lookupPath.normalizedPath)
      return contents ? right(contents) : left(`Source not found: '${lookupPath.normalizedPath}'`)
    },

    stempath: (lookupPath: SourceLookupPath): string => {
      return dirname(lookupPath.normalizedPath)
    },
  }
}
