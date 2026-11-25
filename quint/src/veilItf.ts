/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Reading what Veil's compiled model checker prints, what the induction checks of the
 * Quint library for Lean report, and their counterexamples as ITF; and what Veil's invariant
 * synthesizer `#updr` and its bounded symbolic queries `unsat trace` report.
 *
 * The checker prints JSON documents one after another: progress reports, then the
 * result, which carries a trace when it found a violation. A state in the trace is
 * a record of the module's fields, each value shown by Veil's `Display`: numbers,
 * booleans and lists as JSON, sets and maps tagged `"$veil"`, records and
 * constructors as `"$veil"` records and constructors (the Quint library for Lean
 * gives every type it generates such a `Display`), and anything else, strings
 * included, as the Lean text of the value. Which of these a value is follows from
 * its Quint type, so the conversion is driven by the types of the state variables.
 *
 * @module
 */

import { Either, left, merge, right } from '@sweet-monads/either'
import JSONbig from 'json-bigint'
import { ItfState, ItfTrace, ItfValue } from './itf'
import { parseJsonBig } from './jsonHelper'
import { QuintType, Row } from './ir/quintTypes'
import { unreachable } from './util'
import { LeanMessage, STANDARD_AXIOMS, jsonMessage } from './veilProofs'

/**
 * The outcome of one run of the checker, from its last document. A counterexample's states
 * hold the fields of `variables`. The counterexample to a temporal property is a lasso:
 * `loop` is the index of the state its last state steps back to, from which the execution
 * repeats forever.
 */
export type VeilOutcome =
  | { kind: 'ok'; exploredStates: number }
  | { kind: 'violation'; violates: string[]; states: VeilState[]; variables: VeilVariable[]; loop?: number }
  | { kind: 'error'; message: string }

/**
 * A state variable of the module the Quint library for Lean declares: its name in an ITF
 * trace, the id of its declaration, whose type the compiled spec infers, and its field in
 * the module's states.
 */
export interface VeilVariable {
  readonly name: string
  readonly id: bigint
  readonly field: string
}

/**
 * How the checker writes a value: by Veil's `Display`, as a trace's states are, or by `ToJson`, as a
 * lasso's are, which the Quint library for Lean gives the shape of `Display` for the records and
 * variants it generates. The two differ in a string, written as itself rather than as a Lean string
 * literal, and in a pair, written as a JSON array.
 */
export type VeilEncoding = 'display' | 'json'

/** A state of a counterexample: the value of each field of the module, by field name. */
export interface VeilState {
  readonly fields: ReadonlyMap<string, unknown>
  readonly encoding: VeilEncoding
}

/**
 * The JSON documents in the checker's output, in order. A document may span lines
 * (the result is pretty-printed), so they are split where the nesting closes.
 */
export function splitDocuments(output: string): Either<string, unknown[]> {
  const docs: unknown[] = []
  let depth = 0
  let inString = false
  let start = -1
  for (let i = 0; i < output.length; i++) {
    const c = output[i]
    if (inString) {
      if (c === '\\') {
        i++
      } else if (c === '"') {
        inString = false
      }
      continue
    }
    if (c === '"' && depth > 0) {
      inString = true
    } else if (c === '{' || c === '[') {
      if (depth === 0) {
        start = i
      }
      depth++
    } else if (c === '}' || c === ']') {
      // Below zero only in output trimmed in the middle of a document, whose rest is skipped.
      depth = Math.max(depth - 1, 0)
      if (depth === 0 && start >= 0) {
        try {
          docs.push(parseJsonBig(output.slice(start, i + 1), { nativeBigInt: true }))
        } catch (e) {
          return left(`unreadable output from the Veil model checker: ${e}`)
        }
        start = -1
      }
    }
  }
  return right(docs)
}

/**
 * The outcome the checker's output reports, from its result document, for a module with the state
 * variables `variables`. `ended` is how the checker ended, `signal …` when it was stopped from
 * outside, as when it runs out of memory.
 */
export function readOutcome(output: string, variables: VeilVariable[], ended?: string): VeilOutcome {
  const docs = splitDocuments(output)
  if (docs.isLeft()) {
    return { kind: 'error', message: docs.value }
  }
  const result = docs.value.filter(isObject).find(d => typeof d.result === 'string')
  if (result === undefined) {
    return ended?.startsWith('signal')
      ? { kind: 'error', message: `the Veil model checker was stopped by ${ended} before it reported a result` }
      : { kind: 'error', message: `the Veil model checker reported no result:\n${output.slice(-2000)}` }
  }
  if (result.result === 'no_violation_found') {
    return { kind: 'ok', exploredStates: Number(result.explored_states ?? 0) }
  }
  if (result.result === 'found_violation') {
    const violation = isObject(result.violation) ? result.violation : {}
    const violates = Array.isArray(violation.violates) ? violation.violates.map(v => unguillemet(String(v))) : []
    if (violation.kind === 'safety_failure') {
      const trace = isObject(result.trace) ? result.trace : {}
      const states = Array.isArray(trace.states) ? trace.states : []
      const read = states.map(s => stateOf(isObject(s) ? s.fields : undefined))
      return { kind: 'violation', violates, states: read, variables }
    }
    if (violation.kind === 'liveness_failure') {
      // `stem` ends at the state `q` the cycle closes at, and `loop` is `q` followed by the cycle, which
      // starts at `q` too: past those two, `loop` holds the rest of the cycle.
      const lasso = isObject(result.lasso) ? result.lasso : {}
      const stem = Array.isArray(lasso.stem) ? lasso.stem : []
      const loop = Array.isArray(lasso.loop) ? lasso.loop : []
      const states = [...stem, ...loop.slice(2)].map(lassoStateOf)
      return { kind: 'violation', violates, states, variables, loop: stem.length - 1 }
    }
    return { kind: 'error', message: `the Veil model checker reported ${String(violation.kind)}` }
  }
  return { kind: 'error', message: `the Veil model checker ended with ${String(result.result)}` }
}

/**
 * One check that `#quint_check_induction` reports, of an invariant at the initializer or after an action:
 * Veil's status (`proven`, `disproven`, `unknown`, `error` or `timeout`), and the solver's reasons when it
 * decided nothing. A counterexample has its states, before the step and, after an action, after it, unless
 * they could not be read, and why.
 */
export interface InductionCheck {
  readonly invariant: string
  readonly action: string
  readonly status: string
  readonly reasons: string[]
  readonly states?: VeilState[]
  readonly unreadable?: string
}

/** What starts the line of the Lean output that `#quint_check_induction` reports on. */
const INDUCTION_MARKER = 'QUINT_INDUCTION '

/** The checks that `#quint_check_induction` reports in `output`, the output of the Lean file that runs it. */
export function readInduction(output: string): Either<string, InductionCheck[]> {
  const line = output.split('\n').find(l => l.includes(INDUCTION_MARKER))
  if (line === undefined) {
    return left(`Veil reported no induction checks:\n${output.slice(-2000)}`)
  }
  let doc: unknown
  try {
    doc = parseJsonBig(line.slice(line.indexOf(INDUCTION_MARKER) + INDUCTION_MARKER.length), { nativeBigInt: true })
  } catch (e) {
    return left(`unreadable induction checks from Veil: ${e}`)
  }
  const entries = isObject(doc) && Array.isArray(doc.conditions) ? doc.conditions.filter(isObject) : []
  return right(
    entries.map(c => ({
      invariant: unguillemet(String(c.invariant)),
      action: unguillemet(String(c.action)),
      status: typeof c.status === 'string' ? c.status : 'unknown',
      reasons: Array.isArray(c.reasons) ? c.reasons.map(String) : [],
      states: Array.isArray(c.states) ? c.states.map(stateOf) : undefined,
      unreadable: typeof c.unreadable === 'string' ? c.unreadable : undefined,
    }))
  )
}

/**
 * What the checks of an inductive invariant establish: that they all hold, a counterexample to one of
 * them, the initializer's when it fails one, or the checks the solver decided neither way. No check at
 * all establishes nothing.
 */
export type InductionOutcome =
  | { kind: 'proved' }
  | { kind: 'counterexample'; check: InductionCheck }
  | { kind: 'undecided'; checks: InductionCheck[] }

export function inductionOutcome(checks: InductionCheck[]): InductionOutcome {
  const disproven = checks.filter(c => c.status === 'disproven')
  const counterexample = disproven.find(c => c.action === 'initializer') ?? disproven[0]
  if (counterexample !== undefined) {
    return { kind: 'counterexample', check: counterexample }
  }
  const undecided = checks.filter(c => c.status !== 'proven')
  return undecided.length > 0 || checks.length === 0 ? { kind: 'undecided', checks: undecided } : { kind: 'proved' }
}

/** A theorem that `#updr certify` proves: its name, its axioms, and what Veil says of them. */
export interface UpdrCertificate {
  readonly theorem: string
  readonly axioms: string[]
  readonly status: string
  /** Whether Lean's kernel checked the theorem, on Lean's standard axioms only. */
  readonly kernelChecked: boolean
}

/** A strengthening clause that `#updr` found, by the name of the invariant it would be declared as. */
export interface UpdrClause {
  readonly name: string
  readonly clause: string
}

/**
 * What `#updr` found: invariants that make the module's invariants inductive, at the frame where the search
 * closed, with the theorem that certifies them when it proved one; an execution that violates the invariants;
 * no invariant, for a reason that its report gives; or nothing, for the errors of the Lean file. A report is
 * Veil's own message.
 */
export type SynthesisOutcome =
  | { kind: 'invariant'; frame: number; clauses: UpdrClause[]; certificate?: UpdrCertificate; errors: string[] }
  | { kind: 'counterexample'; report: string; certificate?: UpdrCertificate }
  | { kind: 'none'; report: string }
  | { kind: 'error'; message: string }

/**
 * What `#updr` reports in `output`, which Lean writes as JSON, with Veil's summary of its solver calls. `ended` is
 * how Lean ended, which says why there is no report when Lean was stopped, as when it runs out of memory.
 */
export function readSynthesis(output: string, ended?: string): { outcome: SynthesisOutcome; solverCalls?: string } {
  const messages = leanJsonMessages(output)
  const solverCalls = messages.find(m => m.text.startsWith('solver calls: '))?.text
  const starting = (prefix: string) => messages.find(m => m.text.startsWith(prefix))
  const certificate = certificateOf(starting('Certified: theorem ')?.text)
  const found = starting('Inductive invariant found at frame ')
  const violated = starting('Violated: ')
  const stopped = messages.find(m =>
    /^(No universal inductive invariant|IC3 stopped:|IC3 internal error:)/.test(m.text)
  )
  const errors = withoutFollowingErrors(
    messages.filter(m => m.severity === 'error' && m !== violated && m !== stopped).map(m => m.text)
  )
  if (found !== undefined) {
    const clauses = found.text.split('\n').flatMap(l => {
      const c = /^invariant \[([^\]]+)\] (.*)$/.exec(l)
      return c === null ? [] : [{ name: c[1], clause: c[2] }]
    })
    const frame = Number(/^Inductive invariant found at frame (\d+)/.exec(found.text)?.[1])
    return { outcome: { kind: 'invariant', frame, clauses, certificate, errors }, solverCalls }
  }
  if (violated !== undefined) {
    return { outcome: { kind: 'counterexample', report: violated.text, certificate }, solverCalls }
  }
  if (errors.length > 0) {
    return { outcome: { kind: 'error', message: errors.join('\n') }, solverCalls }
  }
  if (stopped !== undefined) {
    return { outcome: { kind: 'none', report: stopped.text }, solverCalls }
  }
  const shown = output.trim() === '' ? '' : `:\n${output.slice(-2000)}`
  const message = `Lean ended with ${ended ?? 'no error'} before Veil's #updr reported an outcome${shown}`
  return { outcome: { kind: 'error', message }, solverCalls }
}

/** The certificate of a `Certified: theorem …` report of `#updr`. */
function certificateOf(report: string | undefined): UpdrCertificate | undefined {
  const c =
    report === undefined
      ? null
      : /^Certified: theorem (\S+).*?; axioms: #\[([^\]]*)\]; (.*?)\. Use #gen_theorems/s.exec(report)
  if (c === null) {
    return undefined
  }
  const axioms = c[2]
    .split(',')
    .map(a => a.trim())
    .filter(a => a !== '')
  const kernelChecked =
    c[3] === 'kernel-checked, standard axioms only' && axioms.every(a => STANDARD_AXIOMS.includes(a))
  return { theorem: c[1], axioms, status: c[3], kernelChecked }
}

/** A query of a bounded symbolic check: that no execution of `steps` steps ends where `invariant` fails. */
export interface SymbolicQuery {
  readonly invariant: string
  readonly steps: number
}

/**
 * What Veil answered to a query: that it holds, which Veil reports with silence; a counterexample, an execution
 * that Veil shows as text, its states in the fields of the SMT encoding; or no answer, in Veil's words.
 */
export type SymbolicAnswer =
  | { kind: 'holds' }
  | { kind: 'violated'; trace: string }
  | { kind: 'undecided'; answer: string }

/**
 * Veil's answers to `queries` in `output`, which Lean writes as JSON for the file where query `i` starts at line
 * `lines[i]`, given how Lean ended. An error elsewhere in the file, as when the spec does not load, leaves no
 * answer; so does a Lean that stopped without one.
 */
export function readSymbolic(
  output: string,
  lines: readonly number[],
  ended: { code: number | null; ended: string }
): Either<string, SymbolicAnswer[]> {
  const messages = leanJsonMessages(output)
  const elsewhere = messages.filter(m => m.severity === 'error' && !lines.includes(m.line))
  if (elsewhere.length > 0) {
    return left(elsewhere.map(m => m.text).join('\n'))
  }
  const errors = messages.filter(m => m.severity === 'error')
  // A query that holds says nothing, so only a Lean that ended normally, or on the errors it reported, answers.
  if (ended.code !== 0 && !(ended.code === 1 && errors.length > 0)) {
    return left(`Lean ended with ${ended.ended} before Veil answered every query:\n${output.slice(-2000)}`)
  }
  return right(
    lines.map((line): SymbolicAnswer => {
      const own = errors.filter(m => m.line === line).map(m => m.text)
      if (own.length === 0) {
        return { kind: 'holds' }
      }
      const counterexample = own.find(t => t.startsWith('Counterexample found'))
      if (counterexample !== undefined) {
        const shown = counterexample.split('\n')
        const violation = shown.findIndex(l => l.includes('Violation:'))
        return { kind: 'violated', trace: shown.slice(violation + 1).join('\n') }
      }
      return { kind: 'undecided', answer: own.join('\n') }
    })
  )
}

/**
 * `errors` without those that only follow from a `quint_module` that failed: the commands after it find no
 * module, or one whose specification is not closed. All of them when no other error is among them.
 */
export function withoutFollowingErrors(errors: string[]): string[] {
  const causes = errors.filter(e => !FOLLOWING_ERRORS.some(f => f.test(e)))
  return causes.length > 0 ? causes : errors
}

const FOLLOWING_ERRORS = [
  /#quint_check_induction runs inside the module of a quint_module/,
  /The specification of module \S+ has not been finalized/,
]

/** The messages that Lean writes as JSON in `output`. */
function leanJsonMessages(output: string): LeanMessage[] {
  return output.split('\n').flatMap(l => jsonMessage(l) ?? [])
}

/** The variables in `text`, the file that `quint_module (variables := …)` writes. */
export function readVariables(text: string): Either<string, VeilVariable[]> {
  let doc: unknown
  try {
    doc = parseJsonBig(text, { nativeBigInt: true })
  } catch (e) {
    return left(`unreadable state variables from the Quint library for Lean: ${e}`)
  }
  const entries = Array.isArray(doc) ? doc : []
  const vars = entries.flatMap(v =>
    isObject(v) && typeof v.name === 'string' && typeof v.field === 'string' && isId(v.id)
      ? [{ name: v.name, id: BigInt(v.id), field: v.field }]
      : []
  )
  return Array.isArray(doc) && vars.length === entries.length
    ? right(vars)
    : left(`unreadable state variables from the Quint library for Lean: ${text.slice(0, 2000)}`)
}

/**
 * A counterexample as an ITF trace over the state variables `vars`, each given with
 * its Quint type, in the order of the trace.
 */
export function toItfTrace(states: VeilState[], vars: [VeilVariable, QuintType][]): Either<string, ItfTrace> {
  return merge(
    states.map((state, index) =>
      merge(
        vars.map(([v, type]) => {
          const value = state.fields.get(v.field)
          if (value === undefined) {
            return left(`state ${index} of the counterexample has no field for ${v.name}`)
          }
          return toItfValue(value, type, state.encoding).mapLeft(e => `${v.name} in state ${index}: ${e}`)
        })
      ).map((values): ItfState => {
        const itfState: ItfState = { '#meta': { index } }
        vars.forEach(([v], i) => {
          itfState[v.name] = values[i]
        })
        return itfState
      })
    )
  ).map(itfStates => ({ vars: vars.map(([v]) => v.name), states: itfStates }))
}

/** A value as the checker writes it in `encoding`, read back at Quint type `type`. */
function toItfValue(value: unknown, type: QuintType, encoding: VeilEncoding = 'display'): Either<string, ItfValue> {
  const read = (v: unknown, t: QuintType) => toItfValue(v, t, encoding)
  switch (type.kind) {
    case 'int':
      return typeof value === 'number' || typeof value === 'bigint'
        ? right({ '#bigint': `${value}` })
        : left(`expected an integer, found ${show(value)}`)
    case 'bool':
      return typeof value === 'boolean' ? right(value) : left(`expected a Boolean, found ${show(value)}`)
    case 'str':
      if (typeof value !== 'string') {
        return left(`expected a string, found ${show(value)}`)
      }
      return encoding === 'display' ? leanString(value) : right(value)
    case 'list':
      return Array.isArray(value)
        ? merge(value.map(v => read(v, type.elem)))
        : left(`expected a list, found ${show(value)}`)
    case 'set':
      return tagged(value, 'set', 'elements').chain(elems =>
        merge(elems.map(e => read(e, type.elem))).map(es => ({ '#set': es }))
      )
    case 'fun':
      return tagged(value, 'map', 'entries').chain(entries =>
        merge(
          entries.map(e =>
            isObject(e)
              ? merge([read(e.key, type.arg), read(e.value, type.res)]).map(([k, v]): [ItfValue, ItfValue] => [k, v])
              : left(`expected a map entry, found ${show(e)}`)
          )
        ).map(es => ({ '#map': es }))
      )
    case 'tup':
      return tupleOf(value, rowTypes(type.fields), encoding).map(es => ({ '#tup': es }))
    case 'rec': {
      if (!isObject(value) || value.$veil !== 'record' || !Array.isArray(value.fields)) {
        return left(`expected a record, found ${show(value)}`)
      }
      const shown = new Map(value.fields.filter(isObject).map(f => [String(f.name), f.value]))
      const fields = rowFields(type.fields)
      return merge(
        fields.map(([name, t]) => (shown.has(name) ? read(shown.get(name), t) : left(`missing field ${name}`)))
      ).map(values => Object.fromEntries(fields.map(([name], i) => [name, values[i]])))
    }
    case 'sum': {
      if (!isObject(value) || value.$veil !== 'ctor' || typeof value.name !== 'string') {
        return left(`expected a variant, found ${show(value)}`)
      }
      const label = value.name
      const payload = rowFields(type.fields).find(([name]) => name === label)
      if (payload === undefined) {
        return left(`unknown variant ${label}`)
      }
      const args = Array.isArray(value.args) ? value.args : []
      const arg = isObject(args[0]) ? args[0].value : undefined
      const isUnit = payload[1].kind === 'tup' && rowFields(payload[1].fields).length === 0
      return (isUnit ? right<string, ItfValue>({ '#tup': [] }) : read(arg, payload[1])).map(v => ({
        tag: label,
        value: v,
      }))
    }
    case 'const':
    case 'var':
    case 'oper':
    case 'app':
      return left(`values of type ${type.kind} are not supported by the Veil backend`)
    default:
      return unreachable(type)
  }
}

/**
 * A tuple's components: Lean nests a tuple of more than two to the right, `(a, (b,
 * c))`, and writes a tuple of one as its component.
 */
function tupleOf(value: unknown, types: QuintType[], encoding: VeilEncoding): Either<string, ItfValue[]> {
  if (types.length === 0) {
    return right([])
  }
  if (types.length === 1) {
    return toItfValue(value, types[0], encoding).map(v => [v])
  }
  const pair =
    encoding === 'json'
      ? Array.isArray(value) && value.length === 2
        ? value
        : undefined
      : isObject(value) && value.$veil === 'ctor' && value.type === 'Prod' && Array.isArray(value.args)
      ? value.args.map(a => (isObject(a) ? a.value : undefined))
      : undefined
  if (pair === undefined) {
    return left(`expected a tuple, found ${show(value)}`)
  }
  const [first, rest] = pair
  return toItfValue(first, types[0], encoding).chain(head =>
    tupleOf(rest, types.slice(1), encoding).map(tail => [head, ...tail])
  )
}

/** The members or entries of a container that Veil tags as `kind`. */
function tagged(value: unknown, kind: string, key: string): Either<string, unknown[]> {
  if (isObject(value) && value.$veil === kind && Array.isArray(value[key])) {
    return right(value[key])
  }
  return left(`expected a ${kind}, found ${show(value)}`)
}

/** The string a Lean string literal denotes, as `repr` writes one. */
export function leanString(literal: string): Either<string, string> {
  if (literal.length < 2 || !literal.startsWith('"') || !literal.endsWith('"')) {
    return left(`expected a Lean string literal, found ${literal}`)
  }
  let out = ''
  const body = literal.slice(1, -1)
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c !== '\\') {
      out += c
      continue
    }
    const e = body[++i]
    switch (e) {
      case 'n':
        out += '\n'
        break
      case 't':
        out += '\t'
        break
      case 'r':
        out += '\r'
        break
      case '\\':
      case '"':
      case "'":
        out += e
        break
      case 'x':
        out += String.fromCodePoint(parseInt(body.slice(i + 1, i + 3), 16))
        i += 2
        break
      case 'u': {
        const close = body.indexOf('}', i)
        out += String.fromCodePoint(parseInt(body.slice(i + 2, close), 16))
        i = close
        break
      }
      default:
        return left(`unknown escape \\${e} in ${literal}`)
    }
  }
  return right(out)
}

/** A state from the record of the module's fields that Veil shows for it. */
function stateOf(record: unknown): VeilState {
  const fields = isObject(record) && Array.isArray(record.fields) ? record.fields.filter(isObject) : []
  return { fields: new Map(fields.map(f => [unguillemet(String(f.name)), f.value])), encoding: 'display' }
}

/** A state of a lasso, which Veil writes as the `ToJson` of the module's state: field names to values. */
function lassoStateOf(state: unknown): VeilState {
  const fields = isObject(state) ? Object.entries(state) : []
  return { fields: new Map(fields.map(([name, value]) => [unguillemet(name), value])), encoding: 'json' }
}

/** A Lean name without the `«»` that quote it when it is not an identifier. */
export function unguillemet(name: string): string {
  return name.startsWith('«') && name.endsWith('»') ? name.slice(1, -1) : name
}

function rowFields(row: Row): [string, QuintType][] {
  return row.kind === 'row' ? row.fields.map(f => [f.fieldName, f.fieldType]) : []
}

/** The component types of a tuple row, whose fields are named by position from 0. */
function rowTypes(row: Row): QuintType[] {
  return rowFields(row)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, t]) => t)
}

/** An id as JSON gives it: a number, or a `bigint` past what a number holds. */
function isId(value: unknown): value is number | bigint {
  return (typeof value === 'number' && Number.isInteger(value)) || typeof value === 'bigint'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function show(value: unknown): string {
  return JSONbig.stringify(value) ?? String(value)
}
