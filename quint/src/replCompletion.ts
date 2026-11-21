/*
 * Tab-completion for the REPL, plugged into Node's `readline` `completer` option.
 *
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

export const replCommands = ['.clear', '.exit', '.help', '.load', '.reload', '.save', '.seed', '.verbosity']

export const quintKeywords = [
  'action',
  'all',
  'any',
  'bool',
  'const',
  'def',
  'else',
  'export',
  'if',
  'import',
  'int',
  'match',
  'module',
  'nondet',
  'pure',
  'run',
  'str',
  'temporal',
  'type',
  'val',
  'var',
]

// The trailing identifier at the end of the line, possibly qualified: `foo`, `M::fo`, `M::`
const trailingToken = /[A-Za-z_][A-Za-z0-9_]*(?:::[A-Za-z0-9_]+)*(?:::)?$/

/**
 * Compute completions for a line of REPL input.
 *
 * @param line - the text left of the cursor, as passed by readline
 * @param names - names in scope (definitions, built-ins, ...)
 * @returns a pair `[candidates, matchedText]`, as expected by `readline`
 */
export function completeQuint(line: string, names: Iterable<string>): [string[], string] {
  if (/^\s*\.\w*$/.test(line)) {
    const cmd = line.trim()
    return [replCommands.filter(c => c.startsWith(cmd)), cmd]
  }

  // arguments of dot commands (e.g., file names for `.load`) are not Quint code
  if (/^\s*\.\w+\s/.test(line)) {
    return [[], line]
  }

  const token = trailingToken.exec(line)?.[0]
  if (token === undefined) {
    return [[], line]
  }

  const candidates = new Set<string>()
  for (const name of [...names, ...quintKeywords]) {
    if (name.startsWith(token)) {
      candidates.add(name)
    }
  }

  return [[...candidates].sort(), token]
}
