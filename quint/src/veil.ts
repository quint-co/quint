/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * The Veil backend of `quint verify`: Veil's compiled model checker, which the Quint
 * library for Lean (`lean/` in the Quint repository) runs on a compiled spec.
 *
 * An elan, Lean's toolchain manager, already on PATH is used as it is; without one,
 * the first run downloads elan into Quint's configuration directory. The first run
 * builds a Lake workspace there from the Lean sources the package ships: Lake fetches
 * the Lean toolchain, Veil and Veil's dependencies, and compiles them. Later runs
 * reuse both. Each check writes
 * a Lean file that loads the spec with `quint_module`, and either has Veil compile its
 * model checker into a native binary, and runs the binary, or has Veil's SMT backend
 * check its inductive invariant, search for one with `#updr`, or answer bounded queries
 * about its executions, or checks the theorems of a proof (`veilProofs.ts`).
 * The workspace keeps the binaries used last, under `.lake/quint_checkers`, and a later
 * check of the same spec runs its binary without loading the spec in Lean again.
 * A proof is checked against a Lean module that loads the spec, which Lake builds
 * once for the spec and the proof file's options, under `Quint/Cache` in the workspace, and again
 * when the Quint library changes. The other files of the proof are built as modules there too.
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import type { Buffer } from 'buffer'
import { spawn } from 'child_process'
import { createHash, randomBytes } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { veilDir } from './config'
import {
  ProofChecks,
  ProofFile,
  QuintModuleOption,
  leanIdent,
  proofSources,
  readProofChecks,
  writtenSorries,
} from './veilProofs'
import { downloadAndUnpack, installAtomically, releaseTarget } from './download'
import { unreachable } from './util'
import {
  InductionCheck,
  SymbolicAnswer,
  SymbolicQuery,
  SynthesisOutcome,
  VeilOutcome,
  VeilVariable,
  readInduction,
  readOutcome,
  readSymbolic,
  readSynthesis,
  readVariables,
  withoutFollowingErrors,
} from './veilItf'

/** The elan release installed, which in turn installs the Lean of the workspace's `lean-toolchain`. */
const ELAN_VERSION = 'v4.2.4'

/** Verbosity level at which the output of Lake and of the checker is shown. */
export const VEIL_OUTPUT_VERBOSITY = 4

/**
 * How much of a process's output is kept, in characters. A checker on an infinite
 * state space reports progress until it is stopped, more than a string holds; what
 * is read back, the result and its trace, comes last.
 */
const OUTPUT_KEPT = 8 * 1024 * 1024

/** The files that pin the workspace's dependencies: Veil, what Veil needs, and Lean. */
const DEPENDENCY_FILES = ['lakefile.lean', 'lean-toolchain', 'lake-manifest.json']

/** How many compiled checkers a workspace keeps, each of about 100 MB. */
const CHECKERS_KEPT = 4

/**
 * How long after its last use a checker is kept, however many checkers are used after it: a check that found it
 * may be about to run it.
 */
const CHECKER_IN_USE_MS = 60_000

/** The files of a compiled checker's folder: the binary, and the state variables of its spec. */
const CHECKER_BINARY = 'checker'
const CHECKER_VARIABLES = 'variables.json'

/** A built workspace: where it is, the environment its `lake` runs in, and what it is built from. */
export interface VeilWorkspace {
  readonly dir: string
  readonly env: NodeJS.ProcessEnv
  /** A digest of the sources of the Quint library that the workspace is built from. */
  readonly library: string
}

/**
 * The Lean sources: where `QUINT_LEAN_DIR` points, for a `quint` that cannot read
 * files beside itself, such as a single binary; else next to this file in the
 * published package, where the build copies them; else at the root of the
 * repository in a checkout.
 */
export function leanSourcesDir(): string {
  if (process.env.QUINT_LEAN_DIR) {
    return process.env.QUINT_LEAN_DIR
  }
  const shipped = path.resolve(__dirname, 'lean')
  return fs.existsSync(shipped) ? shipped : path.resolve(__dirname, '..', '..', 'lean')
}

/** The Quint library's sources, relative to `sources`. */
function librarySources(sources: string): string[] {
  const modules = fs
    .readdirSync(path.join(sources, 'Quint'))
    .filter(f => f.endsWith('.lean'))
    .map(f => path.join('Quint', f))
  return ['Quint.lean', ...modules.sort()]
}

/** A digest of named contents, each name followed by its content. */
function digest(contents: readonly (readonly [string, string | Buffer])[]): string {
  const hash = createHash('sha256')
  for (const [name, content] of contents) {
    hash.update(name).update(content)
  }
  return hash.digest('hex').slice(0, 16)
}

/** The files `files` under `sources`, each named by its path there. */
function readSources(sources: string, files: string[]): [string, Buffer][] {
  return files.map(f => [f, fs.readFileSync(path.join(sources, f))])
}

/**
 * The workspace for these sources, keyed by the files that pin its dependencies:
 * building Veil and its dependencies takes most of an hour, so a release of Quint
 * that changes only the Quint library reuses them, and rebuilds only the library.
 */
export function workspaceDir(sources: string): string {
  return path.join(veilDir(), `workspace-${digest(readSources(sources, DEPENDENCY_FILES))}`)
}

/** The elan that runs Lake: one already on PATH, or the one Quint installs in its configuration directory. */
export type Elan = { readonly kind: 'onPath' } | { readonly kind: 'quint'; readonly home: string }

/**
 * The elan in a directory of `searchPath`, else the one Quint installs. An elan on
 * PATH is preferred because on NixOS only nixpkgs' elan patches the toolchains it
 * installs to run there; the release Quint downloads does not.
 */
export function findElan(searchPath: string): Elan {
  return onPath(searchPath, 'elan') ? { kind: 'onPath' } : { kind: 'quint', home: path.join(veilDir(), 'elan') }
}

/** Whether a directory of `searchPath` holds the program `name`. */
function onPath(searchPath: string, name: string): boolean {
  return searchPath.split(path.delimiter).some(dir => dir !== '' && isExecutableFile(path.join(dir, name)))
}

/** The environment Lake runs in under `elan`. */
export function elanEnv(elan: Elan): NodeJS.ProcessEnv {
  switch (elan.kind) {
    case 'onPath':
      return process.env
    case 'quint':
      return {
        ...process.env,
        ELAN_HOME: elan.home,
        PATH: [path.join(elan.home, 'bin'), process.env.PATH ?? ''].join(path.delimiter),
      }
    default:
      return unreachable(elan)
  }
}

function isExecutableFile(file: string): boolean {
  try {
    fs.accessSync(file, fs.constants.X_OK)
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}

/** The elan binary Quint installs under `home`. */
function quintElanBinary(home: string): string {
  return path.join(home, 'bin', 'elan')
}

/** Where Veil is installed, and whether it is ready: elan in place, and the workspace built from these sources. */
export interface VeilStatus {
  readonly ready: boolean
  readonly elan: Elan
  readonly workspace: string
  /** A digest of every file the workspace is built from, which its last successful build writes to `builtMarker`. */
  readonly library: string
}

/**
 * Whether Veil is installed and built for the current Lean sources, without
 * changing anything, or why the Lean sources cannot be read.
 */
export function veilStatus(): Either<string, VeilStatus> {
  const sources = leanSourcesDir()
  const missing = [...DEPENDENCY_FILES, 'Quint.lean', 'Quint'].filter(f => !fs.existsSync(path.join(sources, f)))
  if (missing.length > 0) {
    return left(`the Lean sources of the Veil backend are missing from ${sources}: ${missing.join(', ')}`)
  }
  const elan = findElan(process.env.PATH ?? '')
  const workspace = workspaceDir(sources)
  const library = digest(readSources(sources, buildFiles(sources)))
  const built = builtMarker(workspace)
  const ready =
    (elan.kind === 'onPath' || fs.existsSync(quintElanBinary(elan.home))) &&
    fs.existsSync(built) &&
    fs.readFileSync(built, 'utf8') === library
  return right({ ready, elan, workspace, library })
}

/** The file of `workspace` that holds the digest of every source its last successful build used. */
function builtMarker(workspace: string): string {
  return path.join(workspace, '.quint-built')
}

/** Every file the workspace is built from: what pins its dependencies, and the Quint library. */
function buildFiles(sources: string): string[] {
  return [...DEPENDENCY_FILES, ...librarySources(sources)]
}

/**
 * Install elan and build the workspace, unless an earlier run did.
 *
 * @returns the workspace, or why it could not be set up
 */
export async function ensureVeil(verbosityLevel: number): Promise<Either<string, VeilWorkspace>> {
  // Veil does not build on Windows yet (verse-lab/veil#41), though lean-cvc5 and lean-smt, which it needs, do.
  if (process.platform === 'win32') {
    return left('the Veil backend does not run on Windows, which Veil does not support yet; run quint in WSL instead')
  }
  const status = veilStatus()
  if (status.isLeft()) {
    return left(status.value)
  }
  const { ready, elan, workspace: dir, library } = status.value
  const env = elanEnv(elan)
  if (ready) {
    return right({ dir, env, library })
  }
  const built = builtMarker(dir)
  const firstBuild = !fs.existsSync(built)
  if (firstBuild) {
    // Lake runs these to fetch what the first build needs: git clones Veil and its dependencies, curl downloads
    // release archives, npm builds Veil's widgets, and on Linux unzip unpacks cvc5. Lake would stop for a missing
    // one only after downloading Lean, or after building all that does not need it.
    const tools = ['git', 'curl', 'npm', ...(process.platform === 'linux' ? ['unzip'] : [])]
    const missing = tools.filter(tool => !onPath(process.env.PATH ?? '', tool))
    if (missing.length > 0) {
      return left(
        'setting Veil up needs these programs on PATH, which Lake runs to fetch Veil and its dependencies: ' +
          missing.join(', ')
      )
    }
  }

  if (elan.kind === 'quint' && !fs.existsSync(quintElanBinary(elan.home))) {
    const installed = await installElan(elan.home, env, verbosityLevel)
    if (installed.isLeft()) {
      return left(installed.value)
    }
  }

  const sources = leanSourcesDir()
  fs.rmSync(path.join(dir, 'Quint'), { recursive: true, force: true })
  for (const f of buildFiles(sources)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    fs.copyFileSync(path.join(sources, f), path.join(dir, f))
  }
  console.log(
    firstBuild
      ? `Setting up Veil in ${dir}: Lake downloads Lean, Veil and its dependencies, and builds them. ` +
          'This happens once and takes a while.'
      : `Building the Quint library for Lean in ${dir}...`
  )
  const build = await run('lake', ['build', 'Quint'], dir, env, verbosityLevel)
  if (build.code !== 0) {
    return left(`building Veil and the Quint library failed:\n${build.output.slice(-4000)}`)
  }
  fs.writeFileSync(built, library)
  return right({ dir, env, library })
}

async function installElan(
  elanHome: string,
  env: NodeJS.ProcessEnv,
  verbosityLevel: number
): Promise<Either<string, null>> {
  const target = releaseTarget(process.platform, process.arch)
  if (target.isLeft()) {
    return left(target.value)
  }
  const url =
    `https://github.com/leanprover/elan/releases/download/${ELAN_VERSION}/` +
    `elan-${target.value.triple}${target.value.archive}`
  process.stdout.write(`Downloading elan ${ELAN_VERSION}...`)
  const init = await downloadAndUnpack(url, path.join(veilDir(), `elan-init-${ELAN_VERSION}`), 'elan-init')
  process.stdout.write(' done.\n')
  if (init.isLeft()) {
    return left(init.value)
  }
  const res = await run(
    init.value,
    ['-y', '--no-modify-path', '--default-toolchain', 'none'],
    veilDir(),
    env,
    verbosityLevel
  )
  return res.code === 0 ? right(null) : left(`installing elan failed:\n${res.output}`)
}

/**
 * What a checker checks: the invariants the compiled spec lists, with `#model_check`, or the
 * temporal properties of its `--temporal`, with `#temporal_check`.
 */
export type VeilCheck = 'invariants' | 'temporal'

/**
 * The Lean file, of Lean's module system, that loads the spec compiled to `specPath` with `quint_module`
 * and `options`, runs `commands` in the spec's main module `moduleName`, and closes it.
 */
export function moduleSource(
  specPath: string,
  moduleName: string,
  options: readonly QuintModuleOption[],
  commands: readonly string[]
): string {
  const load = [`quint_module ${JSON.stringify(specPath)}`, ...options.map(o => `(${o.name} := ${o.value})`)].join(' ')
  return [
    'module',
    '',
    'public import Quint',
    '',
    load,
    '',
    ...commands.flatMap(c => [c, '']),
    `end ${moduleName}`,
    '',
  ].join('\n')
}

/**
 * The Lean file that loads `specJson`, whose main module is `moduleName`, writes its state
 * variables to `variablesJson`, and builds its checker for `what`, which explores no state where
 * one of the definitions `stateConstraints` names fails.
 */
export function checkerSource(
  specJson: string,
  variablesJson: string,
  moduleName: string,
  what: VeilCheck,
  stateConstraints: string[]
): string {
  // Quoted, since `I::c` or a Lean keyword is no Lean identifier.
  const constrained =
    stateConstraints.length > 0
      ? [{ name: 'stateConstraints', value: `[${stateConstraints.map(c => `«${c}»`).join(', ')}]` }]
      : []
  const options = [
    { name: 'declared', value: 'false' },
    { name: 'variables', value: JSON.stringify(variablesJson) },
  ]
  return moduleSource(
    specJson,
    moduleName,
    [...options, ...constrained],
    [
      'set_option veil.modelChecker.buildOnly true',
      what === 'invariants' ? '#model_check compiled {} {}' : '#temporal_check compiled {} {}',
    ]
  )
}

/**
 * How the induction checks of a spec run: on every check, or only the initializer's, and whether the
 * initializer's assignments are equations the state satisfies, which a counterexample to an invariant at
 * the initializer needs to show the state it reaches, and which a solver decides less often.
 */
export interface InductionRun {
  readonly onlyInit: boolean
  readonly initEquations: boolean
}

/**
 * The Lean file that loads `specJson`, whose main module is `moduleName`, in the SMT encoding, writes its
 * state variables to `variablesJson`, and reports the induction checks of its invariants.
 */
export function inductionSource(
  specJson: string,
  variablesJson: string,
  moduleName: string,
  how: InductionRun
): string {
  const options = [
    { name: 'smt', value: 'true' },
    { name: 'declared', value: 'false' },
    { name: 'initEquations', value: String(how.initEquations) },
    { name: 'variables', value: JSON.stringify(variablesJson) },
  ]
  return moduleSource(specJson, moduleName, options, [
    how.onlyInit ? '#quint_check_induction initializer' : '#quint_check_induction',
  ])
}

/** The options that load a spec in the SMT encoding, with no invariants but those it names. */
const SMT_OPTIONS: readonly QuintModuleOption[] = [
  { name: 'smt', value: 'true' },
  { name: 'declared', value: 'false' },
]

/** The option that names `invariants` as the invariants of the module that `quint_module` declares. */
function invariantsOption(invariants: readonly string[]): QuintModuleOption {
  return { name: 'invariants', value: `[${invariants.map(leanIdent).join(', ')}]` }
}

/**
 * The Lean file that loads `specJson`, whose main module is `moduleName`, in the SMT encoding, with the invariants
 * `invariants`, and has `#updr` search for invariants that make them inductive, and certify what it finds.
 */
export function synthesisSource(specJson: string, moduleName: string, invariants: readonly string[]): string {
  return moduleSource(specJson, moduleName, [...SMT_OPTIONS, invariantsOption(invariants)], ['#updr certify'])
}

/**
 * The Lean file that loads `specJson`, whose main module is `moduleName`, in the SMT encoding, with the invariants
 * that `queries` name, and asks Veil each query as an `unsat trace`, with the line where each one starts.
 */
export function symbolicSource(
  specJson: string,
  moduleName: string,
  queries: readonly SymbolicQuery[]
): { source: string; lines: number[] } {
  const invariants = [...new Set(queries.map(q => q.invariant))]
  const steps = (n: number) => (n === 0 ? [] : n === 1 ? ['  any action'] : [`  any ${n} actions`])
  const commands = queries.map((q, i) =>
    [`unsat trace [quint_query_${i}] {`, ...steps(q.steps), `  assert ¬ ${leanIdent(q.invariant)}`, '}'].join('\n')
  )
  const source = moduleSource(specJson, moduleName, [...SMT_OPTIONS, invariantsOption(invariants)], commands)
  const sourceLines = source.split('\n')
  return { source, lines: queries.map((_, i) => sourceLines.indexOf(`unsat trace [quint_query_${i}] {`) + 1) }
}

/**
 * Elaborate the Lean file that `source` writes for a spec compiled to JSON, given where the spec is and
 * where the file writes the state variables, and read what came of it with `read`. `leanArgs` are passed
 * to Lean itself.
 */
async function elaborate<T>(
  workspace: VeilWorkspace,
  specJson: string,
  source: (specPath: string, variablesPath: string) => string,
  verbosityLevel: number,
  read: (build: RunResult, variablesPath: string) => Promise<T>,
  leanArgs: readonly string[] = []
): Promise<T> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quint-veil-'))
  // The file's name is its Lean module name, unique so that checks can run side by side.
  const leanFile = path.join(workspace.dir, `QuintVerify_${randomBytes(8).toString('hex')}.lean`)
  try {
    const specPath = path.join(tmpDir, 'spec.json')
    const variablesPath = path.join(tmpDir, 'variables.json')
    fs.writeFileSync(specPath, specJson)
    fs.writeFileSync(leanFile, source(specPath, variablesPath))
    const lean = leanArgs.length === 0 ? [] : ['--', ...leanArgs]
    const build = await run('lake', ['lean', leanFile, ...lean], workspace.dir, workspace.env, verbosityLevel)
    return await read(build, variablesPath)
  } finally {
    fs.rmSync(leanFile, { force: true })
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

/**
 * Model check a spec compiled to JSON (`quint compile --target json`): its `invariants`,
 * or the temporal properties it defines as `q::temporalProps`, in the states where the
 * definitions of its main module that `stateConstraints` names hold.
 */
export async function check(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  what: VeilCheck,
  stateConstraints: string[],
  verbosityLevel: number
): Promise<VeilOutcome> {
  const source = (spec: string, vars: string) => checkerSource(spec, vars, moduleName, what, stateConstraints)
  const dir = checkerDir(workspace, specJson, source('spec.json', CHECKER_VARIABLES))
  let used = usedChecker(dir)
  if (used === undefined) {
    const built = await buildChecker(workspace, specJson, source, dir, verbosityLevel)
    if (built.isLeft()) {
      return { kind: 'error', message: built.value }
    }
    used = usedChecker(dir)
  }
  if (used === undefined) {
    return { kind: 'error', message: `another check deleted the checker in ${dir} before this one could run it` }
  }
  const variables = readVariables(used)
  if (variables.isLeft()) {
    return { kind: 'error', message: variables.value }
  }
  const args = checkerArgs(what, os.cpus().length)
  const res = await run(path.join(dir, CHECKER_BINARY), args, workspace.dir, workspace.env, verbosityLevel)
  return readOutcome(res.output, variables.value, res.ended)
}

/**
 * The arguments that run a checker for `what` on `cores` cores. A checker without arguments searches on one thread,
 * so a check of invariants gets Veil's parallel search on every core, as TLC's `-workers auto` does: one worker for
 * each core, which explores in parallel once 20 states wait to be explored, as Veil's VS Code extension sets it.
 * Veil checks temporal properties on one thread.
 */
export function checkerArgs(what: VeilCheck, cores: number): string[] {
  return what === 'invariants' && cores > 1 ? [String(cores), '20', '1'] : []
}

/**
 * The state variables file of the checker in `dir`, once the checker is marked as used for `pruneCheckers`, or
 * undefined when `dir` holds no checker: none was built, or another check's `pruneCheckers` deleted it.
 */
function usedChecker(dir: string): string | undefined {
  try {
    const now = new Date()
    fs.utimesSync(dir, now, now)
    return fs.readFileSync(path.join(dir, CHECKER_VARIABLES), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

/**
 * The folder of the checker that the Lean file `source` builds for `specJson`: under `.lake/quint_checkers` in
 * the workspace, after a digest of both and of the Quint library, since the checker depends on nothing else that
 * changes within a workspace. `source` names the spec and its variables by fixed paths, since a check writes them
 * to a folder of its own.
 */
export function checkerDir(workspace: VeilWorkspace, specJson: string, source: string): string {
  const key = digest([
    ['library', workspace.library],
    ['spec.json', specJson],
    ['source', source],
  ])
  return path.join(workspace.dir, '.lake', 'quint_checkers', key)
}

/**
 * Have Veil build the checker that `source` writes for `specJson`, install it in `dir`, and delete the checkers of
 * the workspace beyond the `CHECKERS_KEPT` used last.
 *
 * @returns why the checker was not built or installed, if it was not
 */
async function buildChecker(
  workspace: VeilWorkspace,
  specJson: string,
  source: (specPath: string, variablesPath: string) => string,
  dir: string,
  verbosityLevel: number
): Promise<Either<string, string>> {
  return elaborate(workspace, specJson, source, verbosityLevel, async (build, variablesPath) => {
    const reported = reportedBinary(build.output)
    try {
      const built = builtBinary(build.output, build.ended)
      if (built.isLeft()) {
        return left<string, string>(built.value)
      }
      const installed = await installChecker(built.value.binary, variablesPath, dir)
      if (installed.isRight()) {
        pruneCheckers(path.dirname(dir), CHECKERS_KEPT)
      }
      return installed
    } finally {
      if (reported !== undefined) {
        fs.rmSync(reported.binary, { force: true })
        fs.rmSync(reported.buildFolder, { recursive: true, force: true })
      }
    }
  })
}

/**
 * Move the checker `binary`, with the state variables of its spec at `variablesPath`, into `dir`, whole, so that a
 * check running beside this one never finds part of it. When another check installed the same checker first, that
 * one is kept.
 *
 * @returns `dir`, or why the checker could not be installed
 */
export function installChecker(binary: string, variablesPath: string, dir: string): Promise<Either<string, string>> {
  return installAtomically(dir, async tmpDir => {
    fs.renameSync(binary, path.join(tmpDir, CHECKER_BINARY))
    // Copied, since the variables are under the system's temporary folder, which may be another file system.
    fs.copyFileSync(variablesPath, path.join(tmpDir, CHECKER_VARIABLES))
    return right(tmpDir)
  })
}

/**
 * Delete the checkers in `root` beyond the `kept` used last, as the times of their folders say, but for those used
 * in the last `CHECKER_IN_USE_MS`.
 */
export function pruneCheckers(root: string, kept: number): void {
  // A folder that another check deleted meanwhile has no time, and is deleted again, harmlessly.
  const byUse = fs
    .readdirSync(root)
    .map(name => path.join(root, name))
    .map(dir => ({ dir, used: fs.statSync(dir, { throwIfNoEntry: false })?.mtimeMs ?? 0 }))
    .sort((a, b) => b.used - a.used)
  const unused = Date.now() - CHECKER_IN_USE_MS
  for (const { dir } of byUse.slice(kept).filter(c => c.used < unused)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * Search with Veil's `#updr` for invariants that make `invariants` inductive in a spec compiled to JSON, for
 * every value of its constants, and certify them.
 */
export async function synthesize(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  invariants: readonly string[],
  verbosityLevel: number
): Promise<{ outcome: SynthesisOutcome; solverCalls?: string }> {
  const source = (spec: string) => synthesisSource(spec, moduleName, invariants)
  const read = async (build: RunResult) => readSynthesis(build.output, build.ended)
  return elaborate(workspace, specJson, source, verbosityLevel, read, ['--json'])
}

/**
 * Ask Veil each of `queries` about a spec compiled to JSON, for every value of its constants.
 *
 * @returns Veil's answer to each query, or why it gave none
 */
export async function checkSymbolic(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  queries: readonly SymbolicQuery[],
  verbosityLevel: number
): Promise<Either<string, SymbolicAnswer[]>> {
  const { lines } = symbolicSource(specJson, moduleName, queries)
  const source = (spec: string) => symbolicSource(spec, moduleName, queries).source
  return elaborate(
    workspace,
    specJson,
    source,
    verbosityLevel,
    async build => readSymbolic(build.output, lines, build),
    ['--json']
  )
}

/**
 * Check with Veil's SMT backend that the initializer establishes, and every action preserves, each invariant
 * of a spec compiled to JSON, as `how` says.
 *
 * @returns the checks, with the state variables their counterexamples' states hold, or why there are none
 */
export async function checkInduction(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  how: InductionRun,
  verbosityLevel: number
): Promise<Either<string, { checks: InductionCheck[]; variables: VeilVariable[] }>> {
  const source = (spec: string, vars: string) => inductionSource(spec, vars, moduleName, how)
  return elaborate(workspace, specJson, source, verbosityLevel, async (build, variablesPath) => {
    const errors = leanErrors(build.output)
    if (errors.length > 0) {
      return left(`Veil could not check the spec:\n${errors.join('\n')}`)
    }
    if (!fs.existsSync(variablesPath)) {
      return left(endedWithout('Veil could not check the spec', build.ended, build.output))
    }
    return readVariables(fs.readFileSync(variablesPath, 'utf8')).chain(variables =>
      readInduction(build.output).map(checks => ({ checks, variables }))
    )
  })
}

/**
 * Check the proof file `proofs`, read from `proofs.path`, with the files of its folder that it imports, against a
 * spec compiled to JSON, whose main module is `moduleName` and declares the invariants `declared`, for each of
 * `invariants` and of the temporal properties `temporal` (`veilProofs.ts`). Each file that it imports is written
 * as a module under `Quint/Cache` in the workspace, which Lake builds again only when the file, or one that it
 * imports, changed.
 *
 * @returns what the file proves of each property, with Lean's messages about the files of the proof, or why it
 * cannot be checked at all
 */
export async function checkProofs(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  proofs: ProofFile,
  invariants: readonly string[],
  declared: readonly string[],
  verbosityLevel: number,
  trustSmt: boolean = false,
  temporal: readonly string[] = []
): Promise<Either<string, ProofChecks>> {
  const folder = path.dirname(proofs.path)
  const read = (module: string): ProofFile | undefined => {
    const file = `${path.join(folder, ...module.split('.'))}.lean`
    return fs.existsSync(file) ? { text: fs.readFileSync(file, 'utf8'), path: file } : undefined
  }
  const sources = proofSources(proofs, read, moduleName, invariants, declared, temporal)
  if (sources.isLeft()) {
    return left(sources.value)
  }
  const { entry, options, modules } = sources.value
  const specModule = await buildSpecModule(workspace, specJson, moduleName, options, verbosityLevel)
  if (specModule.isLeft()) {
    return left(specModule.value)
  }
  const proofModules = proofModulesName(specModule.value, folder)
  const moduleOf = (imported: string) => (modules.has(imported) ? `${proofModules}.${imported}` : undefined)
  const written = new Map<string, string>()
  for (const [module, file] of modules) {
    const leanFile = `${path.join(...`${proofModules}.${module}`.split('.'))}.lean`
    fs.mkdirSync(path.dirname(path.join(workspace.dir, leanFile)), { recursive: true })
    fs.writeFileSync(path.join(workspace.dir, leanFile), file.checked.source(specModule.value, moduleOf))
    written.set(leanFile, file.path)
  }
  // `lake lean` builds the modules that the file imports first.
  const source = () => entry.source(specModule.value, moduleOf)
  // Lean writes each message of the file as JSON, with its position, which it leaves out of an information.
  return elaborate(
    workspace,
    specJson,
    source,
    verbosityLevel,
    async build => {
      const sorries = [proofs, ...modules.values()].flatMap(writtenSorries)
      const properties = [...invariants, ...temporal]
      const read = readProofChecks(build.output, entry, properties, proofs.path, written, trustSmt, sorries)
      // Lean stopped before it checked anything, as when it could not build what the proof imports, or ran out of
      // memory.
      const stopped = build.code !== 0 && read.errors.length === 0 && read.checks.every(c => c.status !== 'proved')
      return stopped
        ? left<string, ProofChecks>(endedWithout('Veil could not check the proofs', build.ended, build.output))
        : right<string, ProofChecks>(read)
    },
    ['--json']
  )
}

/**
 * The name of the Lean module under which the files of a proof in `folder` are built, besides its proof file,
 * for the spec module `specModule`: under `Quint.Cache`, after a digest of both, so that proofs in other
 * folders, or checks of one proof against other specs, write files of their own.
 */
export function proofModulesName(specModule: string, folder: string): string {
  return `Quint.Cache.P${digest([
    ['spec module', specModule],
    ['folder', path.resolve(folder)],
  ])}`
}

/**
 * The name of the Lean module that loads `specJson` with `options` through the Quint library whose sources
 * have the digest `library`: under `Quint.Cache`, after a digest of all three, so that a later check of the
 * same spec and options finds the module that an earlier check built. The library is in the name since
 * `quint_module` runs it, and a module built by another version of it may load the spec differently.
 */
export function specModuleName(specJson: string, options: readonly QuintModuleOption[], library: string): string {
  const named = options.map(o => [o.name, o.value] as const)
  return `Quint.Cache.S${digest([['library', library], ['spec.json', specJson], ...named])}`
}

/**
 * Build the Lean module that loads `specJson`, whose main module is `moduleName`, with `options`, unless an
 * earlier check did: elaborating `quint_module` is most of a check's time and memory, and a file that
 * imports the module re-opens the spec's module with `veil module`. The module lives in the workspace's
 * `Quint` folder, which `ensureVeil` empties when the Quint library changes.
 *
 * @returns the module's name, or why it does not build
 */
async function buildSpecModule(
  workspace: VeilWorkspace,
  specJson: string,
  moduleName: string,
  options: readonly QuintModuleOption[],
  verbosityLevel: number
): Promise<Either<string, string>> {
  const name = specModuleName(specJson, options, workspace.library)
  const file = path.join(workspace.dir, ...name.split('.'))
  if (!fs.existsSync(`${file}.lean`)) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(`${file}.json`, specJson)
    // `quint_module` reads a relative path beside the Lean file.
    fs.writeFileSync(`${file}.lean`, moduleSource(`${path.basename(file)}.json`, moduleName, options, []))
  }
  const build = await run('lake', ['build', name], workspace.dir, workspace.env, verbosityLevel)
  const errors = leanErrors(build.output)
  if (build.code === 0 && errors.length === 0) {
    return right(name)
  }
  fs.rmSync(`${file}.lean`, { force: true })
  fs.rmSync(`${file}.json`, { force: true })
  const failed = 'Veil could not load the spec'
  return left(errors.length > 0 ? `${failed}:\n${errors.join('\n')}` : endedWithout(failed, build.ended, build.output))
}

/** A checker Veil built: the binary, and the folder it was built in. */
interface BuiltChecker {
  readonly binary: string
  readonly buildFolder: string
}

/**
 * The checker Veil built for a spec, or the errors Lean reported. Any error fails the
 * check, even when Veil built a checker anyway: Veil goes on past a definition or an
 * action that does not elaborate, and its checker would then explore a different
 * system than the spec.
 */
export function builtBinary(output: string, ended: string): Either<string, BuiltChecker> {
  const errors = leanErrors(output)
  const reported = reportedBinary(output)
  if (errors.length === 0 && reported !== undefined) {
    return right(reported)
  }
  if (errors.length > 0) {
    return left(`Veil could not build a model checker for the spec:\n${errors.join('\n')}`)
  }
  return left(endedWithout('Veil could not build a model checker for the spec', ended, output))
}

/**
 * Why `failed`, when Lean stopped without reporting an error, as when the system stops it for lack of memory: how
 * it ended, and the end of its output.
 */
function endedWithout(failed: string, ended: string, output: string): string {
  const shown = output.trim() === '' ? 'no output' : output.slice(-4000)
  return `${failed}: Lean ended with ${ended}, and ${shown}`
}

/** The errors Lean reported in its output, without those that only follow from another one. */
function leanErrors(output: string): string[] {
  return withoutFollowingErrors(output.split('\n').filter(l => /(^|: )error[:(]/.test(l)))
}

/** The checker Veil reports building on its `VEIL_BUILD_ONLY` line, if it built one. */
function reportedBinary(output: string): BuiltChecker | undefined {
  const line = output.split('\n').find(l => l.includes('VEIL_BUILD_ONLY '))
  if (line === undefined) {
    return undefined
  }
  try {
    const report: unknown = JSON.parse(line.slice(line.indexOf('VEIL_BUILD_ONLY ') + 'VEIL_BUILD_ONLY '.length))
    if (
      typeof report === 'object' &&
      report !== null &&
      'binary' in report &&
      'build_folder' in report &&
      typeof report.binary === 'string' &&
      typeof report.build_folder === 'string'
    ) {
      return { binary: report.binary, buildFolder: report.build_folder }
    }
  } catch {
    // Not the report after all.
  }
  return undefined
}

/** How a process ended, and what it printed. */
interface RunResult {
  readonly code: number | null
  readonly ended: string
  readonly output: string
}

/**
 * Run `cmd` to completion with its stdin open, as Veil's checker stops as soon as its
 * stdin closes, and collect its output.
 */
function run(
  cmd: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  verbosityLevel: number
): Promise<RunResult> {
  return new Promise(resolve => {
    const proc = spawn(cmd, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
    // Decoded as streams, which keep a character whole when a chunk ends inside it.
    proc.stdout.setEncoding('utf8')
    proc.stderr.setEncoding('utf8')
    let output = ''
    const collect = (data: string) => {
      output += data
      // Twice the limit before trimming, so that a trim is rare; cut at a line, where a document starts.
      if (output.length > 2 * OUTPUT_KEPT) {
        const kept = output.slice(-OUTPUT_KEPT)
        output = kept.slice(kept.indexOf('\n') + 1)
      }
      if (verbosityLevel >= VEIL_OUTPUT_VERBOSITY) {
        process.stdout.write(data)
      }
    }
    proc.stdout.on('data', collect)
    proc.stderr.on('data', collect)
    proc.on('error', error => {
      resolve({ code: null, ended: String(error), output: `${output}\n${error}` })
    })
    proc.on('close', (code, signal) => {
      proc.stdin.end()
      resolve({ code, ended: code !== null ? `exit code ${code}` : `signal ${signal}`, output })
    })
  })
}
