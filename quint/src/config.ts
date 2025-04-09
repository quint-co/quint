/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Setting up the configuration directoty for Quint.
 *
 * This is ~/.quint by default, but can be overridden by setting the
 * QUINT_HOME environment variable.
 *
 * @author Gabriela Moreira, Informal Systems, 2026
 *
 * @module
 */
import path from 'path'
import os from 'os'

/**
 * Get the configuration directory for Quint.
 * @returns {string} The path to the Quint configuration directory.
 */
function quintConfigDir(): string {
  return process.env.QUINT_HOME ?? path.join(os.homedir(), '.quint')
}

/**
 * Get the path to the Apalache distribution directory.
 * @param {string} version - The version of Apalache.
 * @returns {string} The path to the Apalache distribution directory.
 */
export function apalacheDistDir(version: string): string {
  return path.join(quintConfigDir(), `apalache-dist-${version}`)
}

/**
 * Get the path to the Rust evaluator executable directory.
 * @param {string} version - The version of the evaluator.
 * @returns {string} The path to the directory that should contain the evaluator executable.
 */
export function rustEvaluatorDir(version: string): string {
  return path.join(quintConfigDir(), `rust-evaluator-${version}`)
}
