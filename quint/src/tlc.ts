/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Interface to TLC model checker
 *
 * @author Yassine Boukhari, 2025
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { spawn } from 'child_process'
import fs, { readFileSync } from 'fs'
import path from 'path'
import os from 'os'
import AdmZip from 'adm-zip'
import { apalacheDistDir } from './config'
import { ErrorMessage } from './ErrorMessage'

// Default JVM configuration for TLC
const JVM_MAX_HEAP = '-Xmx8G'
const JVM_STACK_SIZE = '-Xss515m'
const DEFAULT_WORKERS: number | 'auto' = 'auto'

// Verbosity level at which to show TLC's raw output
const TLC_OUTPUT_VERBOSITY = 3

export interface TlcRuntimeConfig {
  maxHeap?: string
  stackSize?: string
  workers?: number | 'auto'
}

export function loadTlcConfig(configPath: string | undefined): TlcRuntimeConfig {
  if (!configPath) {
    return {}
  }
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch (err: any) {
    console.warn(`Warning: failed to read TLC config: ${err.message}, using defaults`)
    return {}
  }
}

// TLC exit codes (from tlc2.tool.EC)
// See: https://github.com/tlaplus/tlaplus/blob/master/tlatools/org.lamport.tlatools/src/tlc2/tool/EC.java
const TLC_EXIT_SUCCESS = 0
const TLC_EXIT_VIOLATION_MIN = 10 // ExitStatus.VIOLATION_ASSUMPTION
const TLC_EXIT_VIOLATION_MAX = 14 // ExitStatus.VIOLATION_ASSERT

function isViolationExitCode(code: number): boolean {
  return code >= TLC_EXIT_VIOLATION_MIN && code <= TLC_EXIT_VIOLATION_MAX
}

export interface TlcConfig {
  tlaCode: string
  moduleName: string
  hasInvariant: boolean
  invariantNames?: string[]
  hasTemporal: boolean
  constraint?: string
}

export type TlcError = {
  explanation: string
  errors: ErrorMessage[]
  isViolation: boolean
}

export type TlcResult<T> = Either<TlcError, T>

export function generateCfg(config: TlcConfig): string {
  let cfg = `INIT q_init\nNEXT q_step\n`

  if (config.hasInvariant) {
    // TLC reports the first violated invariant in the list, so with named invariants the combined `q_inv` (their
    // conjunction) would always be the one reported: list the names instead.
    const names = config.invariantNames ?? []
    if (names.length === 0) cfg += `INVARIANT q_inv\n`
    for (const name of names) cfg += `INVARIANT q_inv_${name}\n`
  }
  if (config.hasTemporal) {
    cfg += `PROPERTY q_temporalProps\n`
  }
  if (config.constraint) cfg += 'CONSTRAINT q_constraint\n'
  return cfg
}

/**
 * The module that extends the compiled one and defines `q_inv_<name> == <name>` for each named invariant,
 * and `q_constraint` when there is a constraint.
 */
export function namedInvariantsModule(config: TlcConfig, wrapper: string): string {
  const definitions = (config.invariantNames ?? []).map(name => `q_inv_${name} == ${name}\n`).join('')
  const constraint = config.constraint ? `q_constraint == ${config.constraint}\n` : ''
  return `---- MODULE ${wrapper} ----\nEXTENDS ${config.moduleName}\n${definitions}${constraint}====\n`
}

export function emitDirectory(config: TlcConfig, directory: string, jarPath: string): string {
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, `${config.moduleName}.tla`), config.tlaCode)
  const wrapper = `${config.moduleName}_Quint`
  fs.writeFileSync(path.join(directory, `${wrapper}.tla`), namedInvariantsModule(config, wrapper))
  fs.writeFileSync(path.join(directory, `${wrapper}.cfg`), generateCfg(config))
  const jar = new AdmZip(jarPath)
  for (const name of ['Apalache', 'Variants', 'Option']) {
    const entry = jar.getEntry(`tla2sany/StandardModules/${name}.tla`)
    if (!entry) throw new Error(`Missing ${name}.tla in ${jarPath}`)
    fs.writeFileSync(path.join(directory, `${name}.tla`), entry.getData())
  }
  return path.join(directory, `${wrapper}.tla`)
}

function findApalacheJar(apalacheVersion: string): Either<string, string> {
  const jarPath = path.join(apalacheDistDir(apalacheVersion), 'apalache', 'lib', 'apalache.jar')
  if (fs.existsSync(jarPath)) {
    return right(jarPath)
  }
  return left(`Apalache JAR not found at ${jarPath}. Run 'quint verify' with Apalache backend first to download it.`)
}

function tlcErr(explanation: string, isViolation: boolean): TlcError {
  return { explanation, errors: [], isViolation }
}

export async function verify(
  config: TlcConfig,
  apalacheVersion: string,
  runtimeConfig: TlcRuntimeConfig = {},
  verbosityLevel: number = 2,
  emitDir?: string
): Promise<TlcResult<void>> {
  const jarResult = findApalacheJar(apalacheVersion)
  if (jarResult.isLeft()) {
    return left(tlcErr(jarResult.value, false))
  }
  const jarPath = jarResult.value

  if (emitDir) {
    try {
      emitDirectory(config, emitDir, jarPath)
      return right(undefined)
    } catch (err: any) {
      return left(tlcErr(`Failed to emit directory: ${err.message}`, false))
    }
  }

  const maxHeap = runtimeConfig.maxHeap ?? JVM_MAX_HEAP
  const stackSize = runtimeConfig.stackSize ?? JVM_STACK_SIZE
  const workers = runtimeConfig.workers ?? DEFAULT_WORKERS

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quint-tlc-'))
  const tlaFile = path.join(tmpDir, `${config.moduleName}.tla`)
  const cfgFile = path.join(tmpDir, `${config.moduleName}.cfg`)

  fs.writeFileSync(tlaFile, config.tlaCode)
  fs.writeFileSync(cfgFile, generateCfg(config))

  return new Promise(resolve => {
    const proc = spawn('java', [
      maxHeap,
      stackSize,
      `-Djava.io.tmpdir=${tmpDir}`,
      '-cp',
      jarPath,
      'tlc2.TLC',
      '-deadlock',
      '-workers',
      String(workers),
      '-metadir',
      tmpDir,
      tlaFile,
    ])

    proc.stdout.on('data', data => {
      if (verbosityLevel >= TLC_OUTPUT_VERBOSITY) {
        process.stdout.write(data.toString())
      }
    })

    proc.stderr.on('data', data => {
      if (verbosityLevel >= TLC_OUTPUT_VERBOSITY) {
        process.stderr.write(data.toString())
      }
    })

    proc.on('close', code => {
      fs.rmSync(tmpDir, { recursive: true, force: true })

      if (code === TLC_EXIT_SUCCESS) {
        resolve(right(undefined))
      } else if (code !== null && isViolationExitCode(code)) {
        resolve(left(tlcErr('found a counterexample', true)))
      } else {
        resolve(left(tlcErr('TLC error (see output above)', false)))
      }
    })

    proc.on('error', err => {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      resolve(left(tlcErr(`Failed to spawn TLC: ${err.message}`, false)))
    })
  })
}
