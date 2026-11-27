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
 * own, which Lake builds again only when it, or a file that it imports, changed. A trusted module that imports
 * only the compiled spec elaborates each `holds% p` obligation. A trusted Lean auditor then compares its type with
 * the proof constant's type and calls `Lean.collectAxioms` directly. Thus no elaborator or stdout supplied by the
 * proof decides the result. A `sorry`, an unfinished proof and a trusted SMT answer all rest on `sorryAx`, and none
 * of them counts unless the check explicitly trusts SMT answers.
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

/** A Lean module made from one file of a proof. */
export interface ProofSource {
  /**
   * The file, which imports the Lean module `specModule` and re-opens the module of the spec it loads, and
   * imports each other file of the proof by the module name that `moduleOf` gives it.
   */
  readonly source: (specModule: string, moduleOf?: (imported: string) => string | undefined) => string
  /** Kept empty for compatibility; obligations are never inserted into the proof module. */
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
 * The Lean module made from one file of a proof, `proofs`, against the compiled spec whose main module is
 * `moduleName`, recording the obligations for `invariants` and the temporal properties `temporal`; `file` names it
 * in the reasons it is refused for. A file that loads no spec is left as it is, but for its imports. It fails when
 * the file loads more than one spec, loads it with an option that changes it, or imports nothing before it loads the
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
  const lines = `${proofs.slice(0, loadStart)}${reopen}${proofs.slice(loadEnd)}`.split('\n')
  const obligations = new Map([
    ...invariants.map(p => [p, `holds% ${leanIdent(p)}`] as const),
    ...temporal.map(p => [p, `holds_temporal% ${leanIdent(p)}`] as const),
  ])
  // The proof module contains only the user's declarations. Obligations are elaborated separately by
  // `proofObligationsSource`, in a module that imports only the trusted spec module.
  const checkedAt = new Map<number, string>()
  // Before the file's first import, since a comment may end that line.
  const source = (specModule: string, moduleOf?: (imported: string) => string | undefined) =>
    renamed(lines, moduleOf)
      .map((line, i) => (i === importLine ? `${inModuleSystem ? 'public ' : ''}import ${specModule} ${line}` : line))
      .join('\n')
  return right({ source, checkedAt, obligations, options })
}

/** The declaration in a trusted obligation module whose type is the obligation at `index`. */
export const proofObligationName = (index: number): string => `quint_proof_obligation_${index}`

/**
 * A trusted module that elaborates `obligations` while importing only the compiled specification. The proof audit
 * compares proof constants with these declarations directly, after both modules have already been elaborated.
 */
export function proofObligationsSource(
  specModule: string,
  moduleName: string,
  obligations: ReadonlyMap<string, string>
): string {
  return [
    'module',
    '',
    `public import ${specModule}`,
    '',
    `veil module ${moduleName}`,
    '',
    ...[...obligations.values()].flatMap((obligation, i) => [`axiom ${proofObligationName(i)} : ${obligation}`, '']),
    `end ${moduleName}`,
    '',
  ].join('\n')
}

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

/** A message of Lean as `lean --json` writes it. Shared with the other Veil output readers. */
export interface LeanJsonMessage {
  readonly severity: 'information' | 'warning' | 'error'
  readonly pos: { readonly line: number; readonly column: number }
  readonly data: string
}

export interface LeanMessage {
  readonly severity: LeanJsonMessage['severity']
  readonly path?: string
  readonly line: number
  readonly column: number
  readonly text: string
}

/** Parse one genuine-or-otherwise Lean JSON line. Proof verification never uses this parser. */
export function jsonMessage(line: string): LeanMessage | undefined {
  if (!line.startsWith('{"')) {
    return undefined
  }
  try {
    const parsed: unknown = JSON.parse(line)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'severity' in parsed &&
      (parsed.severity === 'information' || parsed.severity === 'warning' || parsed.severity === 'error') &&
      'data' in parsed &&
      typeof parsed.data === 'string' &&
      'pos' in parsed &&
      typeof parsed.pos === 'object' &&
      parsed.pos !== null &&
      'line' in parsed.pos &&
      typeof parsed.pos.line === 'number' &&
      'column' in parsed.pos &&
      typeof parsed.pos.column === 'number'
    ) {
      return {
        severity: parsed.severity,
        line: parsed.pos.line,
        column: parsed.pos.column,
        text: parsed.data.trimEnd(),
      }
    }
  } catch {
    // Not a JSON message.
  }
  return undefined
}

/** Lake diagnostics are for display only. They cannot establish that a proof passed. */
export function proofDiagnostics(output: string, paths: ReadonlyMap<string, string>, trustSmt: boolean) {
  const errors: string[] = []
  const messages: string[] = []
  const lines = output.split('\n')
  for (const [i, line] of lines.entries()) {
    const match = /^(error|warning|info): (.*\.lean):(\d+):(\d+): (.*)$/.exec(line)
    if (match === null) {
      continue
    }
    const [, severity, location, row, column, first] = match
    const path = paths.get(location)
    if (path === undefined || /^Module \S+ has been previously defined\. Importing it here\.$/.test(first)) {
      continue
    }
    if (trustSmt && first === 'declaration uses `sorry`') {
      continue
    }
    let end = i + 1
    while (end < lines.length && !/^(error|warning|info|trace): |^[✔✖⚠ℹ] \[|^Some required targets/.test(lines[end])) {
      end++
    }
    const message = [first, ...lines.slice(i + 1, end)].join('\n').trimEnd()
    if (severity === 'error') {
      errors.push(`${path}:${row}:${column}: ${message}`)
    } else {
      messages.push(`${path}:${row}:${column}: ${severity}: ${message}`)
    }
  }
  return { errors, messages }
}

/** What the trusted Lean auditor found by inspecting one proof constant. */
export interface ProofAudit {
  readonly found: boolean
  readonly sameType: boolean
  readonly axioms: readonly string[]
}

/** Read the trusted auditor's file. Each row is `same|different<TAB>axioms`, or `missing`. */
export function readProofAudit(report: string, count: number): Either<string, ProofAudit[]> {
  const lines = report.endsWith('\n') ? report.slice(0, -1).split('\n') : report.split('\n')
  if (lines.length !== count) {
    return left(`the trusted proof audit reported ${lines.length} results, expected ${count}`)
  }
  const audits: ProofAudit[] = []
  for (const line of lines) {
    if (line === 'missing') {
      audits.push({ found: false, sameType: false, axioms: [] })
      continue
    }
    const match = /^(same|different)\t(.*)$/.exec(line)
    if (match === null) {
      return left(`the trusted proof audit wrote an invalid result: ${line}`)
    }
    audits.push({
      found: true,
      sameType: match[1] === 'same',
      axioms: match[2] === '' ? [] : match[2].split(','),
    })
  }
  return right(audits)
}

/** Decide proof statuses solely from constants inspected by the trusted auditor. */
export function proofChecksFromAudit(
  properties: readonly string[],
  obligations: ReadonlyMap<string, string>,
  audits: readonly ProofAudit[],
  trustSmt: boolean = false,
  sorries: readonly string[] = []
): ProofChecks {
  const checks = properties.map((property, i): ProofCheck => {
    const audit = audits[i]
    if (audit === undefined || !audit.found) {
      return { property, status: 'not proved', reason: `Lean did not check ${obligationName(property)}` }
    }
    if (!audit.sameType) {
      const obligation = obligations.get(property) ?? `holds% ${leanIdent(property)}`
      return {
        property,
        status: 'not proved',
        reason: `${obligationName(property)} does not prove ${obligation}`,
      }
    }
    const extra = audit.axioms.filter(a => !STANDARD_AXIOMS.includes(a))
    const trusted = trustSmt && extra.length > 0 && extra.every(a => a === 'sorryAx') && sorries.length === 0
    if (extra.length > 0 && !trusted) {
      const sorry = !extra.includes('sorryAx')
        ? ''
        : trustSmt
        ? `, and a sorry is written at ${sorries.join(', ')}`
        : ', which a sorry, an unfinished proof or a trusted SMT answer leaves'
      return { property, status: 'not proved', reason: `its proof rests on ${extra.join(', ')}${sorry}` }
    }
    return trusted ? { property, status: 'proved', trustsSmt: true } : { property, status: 'proved' }
  })
  return { checks, errors: [], messages: [] }
}

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
