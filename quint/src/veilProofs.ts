/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * The proof files that `quint verify --backend veil --proofs` checks. A proof file is a Lean file that
 * loads the spec with `quint_module` and proves, for each invariant `p`, a theorem `p_holds` stating
 * `holds% p`: that `p` holds in every reachable state, for every value of the constants. For each temporal
 * property `p`, the theorem `p_holds` states `holds_temporal% p`: that every behavior of the spec satisfies `p`,
 * for every value of the constants.
 *
 * A proof may span several files. The proof file imports the other files of its folder by their module
 * names: `import Bridge` imports `Bridge.lean`, and `import Groups.Leaders` imports `Groups/Leaders.lean`.
 * Those files may import one another. Each of them that loads the spec loads it with the options of the
 * proof file, and a file that loads no spec holds lemmas of its own.
 *
 * The proof file names each invariant that it proves in its `quint_module`, with `(invariants := [...])` or,
 * for an invariant that the spec declares, by leaving `declared` on. `quint_module` states each named invariant
 * as a proposition, so `holds% p` is the same statement whichever invariants a check proves. It names the
 * temporal properties that it proves with `(temporalProps := [...])`, exactly those that the check proves, since
 * they decide the actions of the module: one that lets every state stutter, and one for each step that a fairness
 * assumption reads.
 *
 * The check loads the compiled spec in place of the one the files name, so a proof is about the spec as
 * it is now, and refuses a `quint_module` option that would change that spec. The spec is loaded by a
 * Lean module of its own, built once for the spec and the options (`veil.ts`), which each checked file
 * imports and re-opens with `veil module`. Each other file of the proof is checked as a Lean module of its
 * own, which Lake builds again only when it, or a file that it imports, changed. The check then states
 * `holds% p` in the proof file and requires the theorem to prove it, on Lean's standard axioms alone: a
 * `sorry`, an unfinished proof and a trusted SMT answer all rest on `sorryAx`, and none of them counts.
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { unguillemet } from './veilItf'

/** What a proof file proves of one invariant or temporal property. */
export interface ProofCheck {
  readonly property: string
  readonly status: 'proved' | 'not proved'
  /** Why the proof does not count. */
  readonly reason?: string
  /** Whether the proof rests on answers of the SMT solver that Lean's kernel did not check (`--trust-smt`). */
  readonly trustsSmt?: boolean
}

/** A `quint_module` option, `(name := value)`. */
export interface QuintModuleOption {
  readonly name: string
  readonly value: string
}

/** A Lean file of a proof, and its path as the user gave it. */
export interface ProofFile {
  readonly text: string
  readonly path: string
}

/** The Lean file that checks a file of a proof, and the property that each line it adds checks. */
export interface ProofSource {
  /**
   * The file, which imports the Lean module `specModule` and re-opens the module of the spec it loads, and
   * imports each other file of the proof by the module name that `moduleOf` gives it.
   */
  readonly source: (specModule: string, moduleOf?: (imported: string) => string | undefined) => string
  /** The property that each line that the check adds checks, by line, from 1, of the file. */
  readonly checkedAt: ReadonlyMap<number, string>
  /** The statement of the obligation of each property that the file is checked for, such as `holds% p`. */
  readonly obligations: ReadonlyMap<string, string>
  /** The options of the file's `quint_module`, which `specModule` loads the spec with; absent when it loads none. */
  readonly options?: readonly QuintModuleOption[]
}

/** The Lean files that check a proof: the proof file's, and one module for each other file of the proof. */
export interface ProofSources {
  readonly entry: ProofSource
  /** The options of the proof file's `quint_module`, which every file of the proof loads the spec with. */
  readonly options: readonly QuintModuleOption[]
  /** Each other file of the proof, and the module that checks it, by the module name that imports it. */
  readonly modules: ReadonlyMap<string, ProofFile & { readonly checked: ProofSource }>
}

/** The axioms a proof may rest on: Lean's own. */
export const STANDARD_AXIOMS: readonly string[] = ['propext', 'Classical.choice', 'Quot.sound']

/** The `quint_module` options a proof file may set: none of them changes the spec the proofs are about. */
const KEPT_OPTIONS: readonly string[] = [
  'main',
  'smt',
  'invariants',
  'declared',
  'temporalProps',
  'initEquations',
  'code',
]

/** The name of the theorem that proves `property`, as Lean reads it. */
export function obligationName(property: string): string {
  return leanIdent(`${property}_holds`)
}

/** `name` as a Lean identifier: as it is when it is one, else between guillemets. */
export function leanIdent(name: string): string {
  return /^[A-Za-z_][A-Za-z0-9_']*$/.test(name) ? name : `«${name}»`
}

/**
 * The Lean files that check the proof file `proofs` against the compiled spec whose main module is `moduleName`,
 * for each of `invariants` and of the temporal properties `temporal`, and the other files of the proof: those that
 * `read` finds for the modules that the proof file imports, directly or through one another. `read(m)` is the file
 * of the module `m` in the proof file's folder, or undefined when the folder has none. `declared` are the invariants
 * that the main module declares, which the proof file names unless it sets `(declared := false)`.
 *
 * Fails as `proofSource` does for any of the files, when the proof file loads no spec, when it does not name each
 * of `invariants` in its `quint_module`, when it names other temporal properties than `temporal`, and when another
 * file loads the spec with other options than the proof file.
 */
export function proofSources(
  proofs: ProofFile,
  read: (module: string) => ProofFile | undefined,
  moduleName: string,
  invariants: readonly string[],
  declared: readonly string[],
  temporal: readonly string[] = []
): Either<string, ProofSources> {
  const entry = proofSource(proofs.text, moduleName, invariants, 'the proof file', temporal)
  if (entry.isLeft()) {
    return left(entry.value)
  }
  const options = entry.value.options
  if (options === undefined) {
    return left('the proof file loads no spec with quint_module')
  }
  const named = new Set([...listed(options, 'invariants'), ...(setTo(options, 'declared', 'false') ? [] : declared)])
  const unnamed = invariants.filter(inv => !named.has(inv))
  if (unnamed.length > 0) {
    const them = unnamed.length === 1 ? 'it' : 'them'
    return left(
      `the proof file's quint_module does not name ${unnamed.join(', ')}: add ${them} to (invariants := [...])`
    )
  }
  const temporalProps = listed(options, 'temporalProps')
  if ([...temporalProps].sort().join(',') !== [...temporal].sort().join(',')) {
    const names = (ps: readonly string[]) => (ps.length === 0 ? 'none' : ps.join(', '))
    return left(
      `the proof file's quint_module names the temporal properties ${names(temporalProps)}, and the check ` +
        `proves ${names(temporal)}: they must be the same, since they decide the actions of the module`
    )
  }
  const modules = new Map<string, ProofFile & { readonly checked: ProofSource }>()
  const seen = new Set<string>()
  const pending = importsOf(proofs.text)
  for (let module = pending.pop(); module !== undefined; module = pending.pop()) {
    const file = seen.has(module) ? undefined : read(module)
    seen.add(module)
    if (file === undefined) {
      continue
    }
    const checked = proofSource(file.text, moduleName, [], file.path)
    if (checked.isLeft()) {
      return left(checked.value)
    }
    if (checked.value.options !== undefined && optionsKey(checked.value.options) !== optionsKey(options)) {
      return left(`${file.path} loads the spec with other quint_module options than the proof file`)
    }
    modules.set(module, { ...file, checked: checked.value })
    pending.push(...importsOf(file.text))
  }
  return right({ entry: entry.value, options, modules })
}

/**
 * The Lean file that checks one file of a proof, `proofs`, against the compiled spec whose main module is
 * `moduleName`, for each of `invariants` and of the temporal properties `temporal`; `file` names it in the reasons
 * it is refused for. A file that loads no spec is left as it is, but for its imports. Fails when the file loads
 * more than one spec, or the spec with an option that changes it, or when it imports nothing before it loads the
 * spec.
 */
export function proofSource(
  proofs: string,
  moduleName: string,
  invariants: readonly string[],
  file: string = 'the proof file',
  temporal: readonly string[] = []
): Either<string, ProofSource> {
  const loads = [...proofs.matchAll(/quint_module\s+"(?:[^"\\]|\\.)*"/g)]
  if (loads.length > 1) {
    return left(`${file} loads more than one spec with quint_module`)
  }
  if (loads.length === 0) {
    const lines = proofs.split('\n')
    return right({
      source: (_, moduleOf) => renamed(lines, moduleOf).join('\n'),
      checkedAt: new Map(),
      obligations: new Map(),
    })
  }
  const loadStart = loads[0].index ?? 0
  const parsed = optionsAfter(proofs, loadStart + loads[0][0].length, file)
  if (parsed.isLeft()) {
    return left(parsed.value)
  }
  const { options, end: loadEnd } = parsed.value
  for (const { name, value } of options) {
    if (!KEPT_OPTIONS.includes(name)) {
      return left(`${file}'s quint_module sets ${name}, which changes the spec that the proofs are about`)
    }
    if (name === 'main' && value !== moduleName) {
      return left(`${file}'s quint_module loads the module ${value}, not ${moduleName}`)
    }
  }
  const imports = proofs.slice(0, loadStart).split('\n')
  const importLine = imports.findIndex(line => IMPORT.test(line))
  if (importLine < 0) {
    return left(`${file} imports nothing before its quint_module`)
  }
  const inModuleSystem = imports.slice(0, importLine).some(line => /^\s*module\s*$/.test(line))
  // `veil module` takes the place of the `quint_module` command, on as many lines, which keeps the file's
  // errors on their lines.
  const reopen = `veil module ${moduleName}${'\n'.repeat(proofs.slice(loadStart, loadEnd).split('\n').length - 1)}`
  // The checks go before the `end` that closes the module, where `holds%` finds it.
  const lines = `${proofs.slice(0, loadStart)}${reopen}${proofs.slice(loadEnd)}`.split('\n')
  const ends = lines.map((line, i) => (new RegExp(`^\\s*end\\s+${escaped(moduleName)}\\s*$`).test(line) ? i : -1))
  const end = Math.max(...ends)
  const at = end >= 0 ? end : lines.length
  const obligations = new Map([
    ...invariants.map(p => [p, `holds% ${leanIdent(p)}`] as const),
    ...temporal.map(p => [p, `holds_temporal% ${leanIdent(p)}`] as const),
  ])
  const properties = [...obligations.keys()]
  const checks = properties.flatMap(p => [
    `example : ${obligations.get(p)} := ${obligationName(p)}`,
    `#print axioms ${obligationName(p)}`,
  ])
  const checkedAt = new Map(checks.map((_, i) => [at + i + 1, properties[Math.floor(i / 2)]]))
  const checking = [...lines.slice(0, at), ...checks, ...lines.slice(at)]
  // Before the file's first import, since a comment may end that line.
  const source = (specModule: string, moduleOf?: (imported: string) => string | undefined) =>
    renamed(checking, moduleOf)
      .map((line, i) => (i === importLine ? `${inModuleSystem ? 'public ' : ''}import ${specModule} ${line}` : line))
      .join('\n')
  return right({ source, checkedAt, obligations, options })
}

/**
 * A line that ends a message of Lake before it: another message, as Lake writes one or as Lean writes one in JSON,
 * or a line of Lake's progress or summary.
 */
const MESSAGE_END = /^(\{"|(error|warning|info|trace): |[✔✖⚠ℹ] \[|Some required targets logged failures:)/

/** A line that imports a Lean module: what precedes the module's name, and the name. */
const IMPORT = /^(\s*(?:public\s+)?(?:meta\s+)?import\s+(?:all\s+)?)(\S+)/

/** The modules that the Lean file `text` imports. */
function importsOf(text: string): string[] {
  return text.split('\n').flatMap(line => IMPORT.exec(line)?.[2] ?? [])
}

/** `lines`, where each import of a module that `moduleOf` names imports the module of that name instead. */
function renamed(lines: readonly string[], moduleOf?: (imported: string) => string | undefined): string[] {
  return lines.map(line => {
    const found = IMPORT.exec(line)
    const to = found === null ? undefined : moduleOf?.(found[2])
    return found === null || to === undefined ? line : `${found[1]}${to}${line.slice(found[0].length)}`
  })
}

/** The names that the option `name` of `options` lists, as `quint_module` reads them, or none when it is unset. */
function listed(options: readonly QuintModuleOption[], name: string): string[] {
  const value = options.find(o => o.name === name)?.value ?? '[]'
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(n => unguillemet(n.trim()))
    .filter(n => n !== '')
}

/** Whether `options` set the option `name` to `value`. */
const setTo = (options: readonly QuintModuleOption[], name: string, value: string): boolean =>
  options.some(o => o.name === name && o.value === value)

/** `options` in one form whatever their order and spacing, as `quint_module` reads them. */
const optionsKey = (options: readonly QuintModuleOption[]): string =>
  options
    .map(o => `${o.name}:=${o.value.replace(/\s+/g, '')}`)
    .sort()
    .join(' ')

/** What a check of a proof found: what it proves of each property, and what Lean said of the files of the proof. */
export interface ProofChecks {
  readonly checks: ProofCheck[]
  /** Lean's errors, each in full at its file and line. A check with an error proves no property. */
  readonly errors: string[]
  /** Lean's other messages, such as the output of `#check`, each with its severity, file and line. */
  readonly messages: string[]
}

/** A message of Lean about the file that it elaborates, as `lean --json` writes it. */
export interface LeanJsonMessage {
  readonly severity: 'information' | 'warning' | 'error'
  readonly pos: { readonly line: number; readonly column: number }
  readonly data: string
}

/** A message of Lean about a file of the proof, which is the proof file itself when `path` is absent. */
export interface LeanMessage {
  readonly severity: LeanJsonMessage['severity']
  readonly path?: string
  readonly line: number
  readonly column: number
  readonly text: string
}

/** Veil's note that a file opens again a module that another file defined, which every file of a proof gets. */
const REOPENED = /^Module \S+ has been previously defined\. Importing it here\.$/

/**
 * What Lean's `output` for the file of `checked` says of each of `properties`, and the messages about the files of
 * the proof, each in full and at its own path and lines: the proof file at `proofsPath`, and each other file at the
 * path that `modules` gives for the file of its module, relative to the workspace. Lean writes the messages of the
 * file of `checked` as JSON (`LeanJsonMessage`). An error anywhere in the proof leaves every property not proved.
 */
export function readProofChecks(
  output: string,
  checked: ProofSource,
  properties: readonly string[],
  proofsPath: string,
  modules: ReadonlyMap<string, string> = new Map(),
  trustSmt: boolean = false,
  sorries: readonly string[] = []
): ProofChecks {
  const messages = leanMessages(output, modules).filter(m => !REOPENED.test(m.text))
  // On a line that the check adds, an error misstates an obligation, and an information gives a theorem's axioms.
  const ofCheck = (m: LeanMessage) => m.path === undefined && checked.checkedAt.has(m.line)
  // The checks push the lines after them down, the `end` of the module among them.
  const lastCheck = Math.max(0, ...checked.checkedAt.keys())
  const at = (m: LeanMessage) => {
    const line = m.path === undefined && m.line > lastCheck ? m.line - checked.checkedAt.size : m.line
    return `${m.path ?? proofsPath}:${line}:${m.column}: `
  }
  const errors = messages.filter(m => m.severity === 'error' && !ofCheck(m)).map(m => `${at(m)}${m.text}`)
  // With --trust-smt and no sorry written, each declaration that uses `sorry` holds a trusted answer of the solver.
  const ofTrust = (m: LeanMessage) => trustSmt && sorries.length === 0 && m.text === 'declaration uses `sorry`'
  const others = messages
    .filter(m => m.severity !== 'error' && !ofCheck(m) && !ofTrust(m))
    .map(m => `${at(m)}${m.severity === 'information' ? 'info' : m.severity}: ${m.text}`)
  const axioms = new Map(
    messages.filter(ofCheck).flatMap(m => {
      const a =
        /'(?:[^'«]*\.)?«?([^'«»]+)_holds»?' (?:depends on axioms: \[([^\]]*)\]|does not depend on any axioms)/.exec(
          m.text
        )
      return a === null ? [] : [[a[1], a[2] === undefined ? [] : a[2].split(',').map(x => x.trim())] as const]
    })
  )
  const checks = properties.map((property): ProofCheck => {
    const misstated = messages.find(
      m => m.severity === 'error' && ofCheck(m) && checked.checkedAt.get(m.line) === property
    )
    if (misstated !== undefined) {
      return {
        property,
        status: 'not proved',
        reason: `${obligationName(property)} does not prove ${obligationOf(checked, property)}: ${misstated.text}`,
      }
    }
    const used = axioms.get(property)
    if (used === undefined) {
      return { property, status: 'not proved', reason: `Lean did not check ${obligationName(property)}` }
    }
    const extra = used.filter(a => !STANDARD_AXIOMS.includes(a))
    // With --trust-smt, `sorryAx` is the trusted answers of the SMT solver, once no file of the proof writes one.
    const trusted = trustSmt && extra.length > 0 && extra.every(a => a === 'sorryAx') && sorries.length === 0
    if (extra.length > 0 && !trusted) {
      const sorry = !extra.includes('sorryAx')
        ? ''
        : trustSmt
        ? `, and a sorry is written at ${sorries.join(', ')}`
        : ', which a sorry, an unfinished proof or a trusted SMT answer leaves'
      return { property, status: 'not proved', reason: `its proof rests on ${extra.join(', ')}${sorry}` }
    }
    if (errors.length > 0) {
      return { property, status: 'not proved', reason: 'the files of the proof have errors' }
    }
    return trusted ? { property, status: 'proved', trustsSmt: true } : { property, status: 'proved' }
  })
  return { checks, errors, messages: others }
}

/** The statement of the obligation of `property` that the file of `checked` is checked for. */
const obligationOf = (checked: ProofSource, property: string): string =>
  checked.obligations.get(property) ?? `holds% ${leanIdent(property)}`

/**
 * The messages of Lean in `output` about the files of the proof: those of the proof file, which Lean writes as JSON,
 * and those of each other file, which Lake writes as it builds the file's module, named in `modules`.
 */
function leanMessages(output: string, modules: ReadonlyMap<string, string>): LeanMessage[] {
  const lines = output.split('\n')
  return lines.flatMap((line, i): LeanMessage[] => {
    const own = jsonMessage(line)
    if (own !== undefined) {
      return [own]
    }
    const m = /^(error|warning|info): (.*\.lean):(\d+):(\d+): (.*)$/.exec(line)
    // Lake also reports on modules that are not files of the proof, such as the one that loads the spec.
    const module = m === null ? undefined : [...modules].find(([file]) => m[2].endsWith(file))
    if (m === null || module === undefined) {
      return []
    }
    // A message goes on over the lines that follow, such as the goals that a proof left.
    const after = lines.slice(i + 1)
    const ends = after.findIndex(l => MESSAGE_END.test(l))
    const text = [m[5], ...after.slice(0, ends < 0 ? after.length : ends)].join('\n').trimEnd()
    const severity = m[1] === 'info' ? 'information' : m[1] === 'warning' ? 'warning' : 'error'
    return [{ severity, path: module[1], line: Number(m[3]), column: Number(m[4]), text }]
  })
}

/** The message that `line` holds, when it is one that Lean wrote as JSON. */
export function jsonMessage(line: string): LeanMessage | undefined {
  if (!line.startsWith('{"')) {
    return undefined
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(line)
  } catch {
    return undefined
  }
  return isLeanJsonMessage(parsed)
    ? { severity: parsed.severity, line: parsed.pos.line, column: parsed.pos.column, text: parsed.data.trimEnd() }
    : undefined
}

const isLeanJsonMessage = (v: unknown): v is LeanJsonMessage =>
  typeof v === 'object' &&
  v !== null &&
  'severity' in v &&
  (v.severity === 'information' || v.severity === 'warning' || v.severity === 'error') &&
  'data' in v &&
  typeof v.data === 'string' &&
  'pos' in v &&
  typeof v.pos === 'object' &&
  v.pos !== null &&
  'line' in v.pos &&
  typeof v.pos.line === 'number' &&
  'column' in v.pos &&
  typeof v.pos.column === 'number'

/**
 * The `(name := value)` options that follow `from` in `text`, up to the first text that is not one, and where
 * the last one ends; `file` names the file in the reasons it is refused for.
 */
function optionsAfter(
  text: string,
  from: number,
  file: string
): Either<string, { options: QuintModuleOption[]; end: number }> {
  const options: QuintModuleOption[] = []
  let at = from
  let last = from
  for (;;) {
    while (at < text.length && /\s/.test(text[at])) {
      at++
    }
    if (text[at] !== '(') {
      return right({ options, end: last })
    }
    const end = closing(text, at)
    if (end === undefined) {
      return left(`${file}'s quint_module has an option that is not closed`)
    }
    const option = /^\(\s*(\w+)\s*:=\s*([\s\S]*)\)$/.exec(text.slice(at, end + 1))
    if (option === null) {
      return left(`${file}'s quint_module has an option it cannot read: ${text.slice(at, end + 1)}`)
    }
    options.push({ name: option[1], value: option[2].trim() })
    at = end + 1
    last = at
  }
}

/** The index of the bracket that closes the one at `open` in `text`, skipping strings. */
function closing(text: string, open: number): number | undefined {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      i = text.indexOf('"', i + 1)
      if (i < 0) {
        return undefined
      }
    } else if (c === '(' || c === '[') {
      depth++
    } else if (c === ')' || c === ']') {
      depth--
      if (depth === 0) {
        return i
      }
    }
  }
  return undefined
}

const escaped = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Where `file` writes a proof that it leaves unfinished, as `path:line`: a `sorry`, an `admit` or `sorryAx`
 * itself, or a `stop` on a line of its own, outside comments and strings. Each of them rests on `sorryAx`, as a
 * trusted answer of the SMT solver does.
 */
export function writtenSorries(file: ProofFile): string[] {
  const code = withoutCommentsAndStrings(file.text)
  return code
    .split('\n')
    .flatMap((line, i) =>
      /(?<![\w.'])(?:sorry|sorryAx|admit)(?![\w'!?])/.test(line) || /^\s*(?:[·.]\s*)?stop\s*$/.test(line)
        ? [`${file.path}:${i + 1}`]
        : []
    )
}

/** `text` with each comment and string of Lean, nested block comments included, blanked out to its line breaks. */
function withoutCommentsAndStrings(text: string): string {
  let out = ''
  let depth = 0
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const next = text[i + 1]
    const blank = c === '\n' ? '\n' : ' '
    if (depth > 0) {
      if (c === '/' && next === '-') {
        depth++
        out += '  '
        i++
      } else if (c === '-' && next === '/') {
        depth--
        out += '  '
        i++
      } else {
        out += blank
      }
    } else if (inString) {
      if (c === '\\' && next !== undefined) {
        out += next === '\n' ? ' \n' : '  '
        i++
      } else {
        inString = c !== '"'
        out += blank
      }
    } else if (c === '/' && next === '-') {
      depth = 1
      out += '  '
      i++
    } else if (c === '-' && next === '-') {
      const end = text.indexOf('\n', i)
      const stop = end === -1 ? text.length : end
      out += ' '.repeat(stop - i)
      i = stop - 1
    } else if (c === '"') {
      inString = true
      out += ' '
    } else {
      out += c
    }
  }
  return out
}
