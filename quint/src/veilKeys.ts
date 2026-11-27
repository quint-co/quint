/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * The keys of a spec's maps, as invariants `m.keys() == S` for a set `S` that reads no state, which a check of
 * Veil's SMT encoding states beside its own invariants. The encoding reads a map at a key that it lacks as an
 * unspecified value, so a check whose invariants leave a map's keys open can fail in a state that lacks a key
 * that every reachable state has. An inferred keys invariant rules those states out.
 *
 * The inference is conservative. It infers `m.keys() == S` only when `init` gives `m` the keys `S`, and every
 * assignment to `m` that a step makes keeps them: `m' = m`, `m.put(k, v)`, `m.set(k, v)` or `m.setBy(k, f)` on
 * such a map, with `k` drawn from `S` by a `nondet` or passed as a parameter that one draws, or `S.mapBy(f)`
 * again. A check proves each invariant it infers together with its own invariants, so an invariant inferred
 * wrongly fails the check rather than making it unsound.
 *
 * @module
 */

import { TypecheckedStage } from './cliCommands'
import { guessMainModule, toExpr } from './cliHelpers'
import { expressionToString } from './ir/IRprinting'
import { QuintEx, QuintVar } from './ir/quintIr'
import { LookupDefinition, LookupTable } from './names/base'
import { inlineAliasesInType } from './types/aliasInliner'

/** An invariant `m.keys() == S` that the analysis infers, as the compiled spec defines it. */
export interface KeysInvariant {
  /** The name of the definition that states it, which compilation adds to the main module. */
  readonly name: string
  /** The invariant, as Quint text. */
  readonly text: string
  /** The state variable `m`, as the spec names it. */
  readonly variable: string
  /** The id of the declaration of `m`. */
  readonly variableId: bigint
}

/** For each parameter or `nondet` in scope, by the id of its declaration, the set its value is drawn from. */
type Drawn = ReadonlyMap<bigint, QuintEx | undefined>

/** An assignment `variable' = rhs`, with what `rhs` draws its keys from. */
interface Assignment {
  readonly variable: LookupDefinition & QuintVar
  readonly rhs: QuintEx
  readonly drawn: Drawn
}

/** A set of keys: its Quint text, and what compares it, which tells sets that print the same apart. */
interface Keys {
  readonly text: string
  readonly key: string
}

/**
 * The invariants `m.keys() == S` that the analysis infers for the spec whose initializer and step are the
 * actions `init` and `step`, for the state variables whose keys neither the invariants `stated` state, nor a
 * definition of the main module that is such an equation, which the SMT encoding states with an invariant
 * that reads the map. Each one resolves in the main module as it does where the analysis read it, and is named
 * `q::keys::m`.
 */
export function inferKeysInvariants(
  stage: TypecheckedStage,
  init: string,
  step: string,
  stated: readonly string[]
): KeysInvariant[] {
  const table = stage.resolver.table
  const resolved = (text: string) => {
    const expr = toExpr(stage, text)
    return expr.isRight() ? expr.value : undefined
  }
  const [initEx, stepEx] = [resolved(init), resolved(step)]
  if (initEx === undefined || stepEx === undefined) {
    return []
  }
  const main = stage.modules.find(m => m.name === guessMainModule(stage))
  const keyDefinitions = (main?.declarations ?? []).flatMap(d =>
    d.kind === 'def' && d.expr.kind === 'app' && d.expr.opcode === 'eq' ? keysStatedBy(table, d.expr) : []
  )
  const known = new Set([...stated.flatMap(s => keysStatedBy(table, resolved(s))), ...keyDefinitions])
  return inferredKeys(table, initEx, stepEx)
    .filter(k => !known.has(k.variableId))
    .filter(k => {
      // The text names the variable as the action did, which the main module may not see under that name.
      const expr = resolved(k.text)
      return expr?.kind === 'app' && keysVariable(table, expr.args[0]) === k.variableId
    })
}

/**
 * The invariants `m.keys() == S` that every state reachable from `init` by steps of `step` satisfies, as the
 * analysis infers them, with the names that `inferKeysInvariants` gives them.
 */
function inferredKeys(table: LookupTable, init: QuintEx, step: QuintEx): KeysInvariant[] {
  const atInit = assignmentsIn(table, init, new Map())
  const inSteps = assignmentsIn(table, step, new Map())
  const variables = [...new Map(atInit.map(a => [a.variable.id, a.variable])).values()]
  return variables.flatMap(v => {
    if (!isMap(table, v) || v.importedFrom?.kind === 'instance') {
      return []
    }
    const given = atInit.filter(a => a.variable.id === v.id).map(a => keysGiven(table, a.rhs))
    const keys = given[0]
    if (keys === undefined || given.some(g => g?.key !== keys.key)) {
      return []
    }
    const kept = inSteps.filter(a => a.variable.id === v.id).every(a => keepsKeys(table, a.rhs, a.drawn, v.id, keys))
    return kept
      ? [{ name: `q::keys::${v.name}`, text: `${v.name}.keys() == ${keys.text}`, variable: v.name, variableId: v.id }]
      : []
  })
}

/**
 * The assignments that `expr` makes, through the actions it calls: `drawn` gives the sets that the parameters and
 * `nondet`s in scope draw their values from. `calling` holds the actions being called, which a spec cannot call
 * again from within.
 */
function assignmentsIn(
  table: LookupTable,
  expr: QuintEx,
  drawn: Drawn,
  calling: ReadonlySet<bigint> = new Set()
): Assignment[] {
  switch (expr.kind) {
    case 'name': {
      const def = table.get(expr.id)
      return def?.kind === 'def' && def.qualifier === 'action' && !calling.has(def.id)
        ? assignmentsIn(table, def.expr, new Map(), new Set([...calling, def.id]))
        : []
    }
    case 'app': {
      const inArgs = expr.args.flatMap(a => assignmentsIn(table, a, drawn, calling))
      if (expr.opcode === 'assign') {
        const variable = table.get(expr.args[0].id)
        return variable?.kind === 'var' ? [{ variable, rhs: expr.args[1], drawn }, ...inArgs] : inArgs
      }
      const callee = table.get(expr.id)
      if (callee?.kind !== 'def' || callee.qualifier !== 'action' || calling.has(callee.id)) {
        return inArgs
      }
      if (callee.expr.kind !== 'lambda') {
        return [...inArgs, ...assignmentsIn(table, callee.expr, new Map(), new Set([...calling, callee.id]))]
      }
      const params = new Map(callee.expr.params.map((p, i) => [p.id, drawnFrom(table, expr.args[i], drawn)]))
      return [...inArgs, ...assignmentsIn(table, callee.expr.expr, params, new Set([...calling, callee.id]))]
    }
    case 'let': {
      const { opdef } = expr
      const from =
        opdef.qualifier === 'nondet' && opdef.expr.kind === 'app' && opdef.expr.opcode === 'oneOf'
          ? opdef.expr.args[0]
          : undefined
      return [
        ...assignmentsIn(table, opdef.expr, drawn, calling),
        ...assignmentsIn(table, expr.expr, new Map([...drawn, [opdef.id, from]]), calling),
      ]
    }
    case 'lambda':
      return assignmentsIn(table, expr.expr, drawn, calling)
    default:
      return []
  }
}

/** The set that `arg` is drawn from, when it names a parameter or a `nondet` that `drawn` knows one for. */
function drawnFrom(table: LookupTable, arg: QuintEx | undefined, drawn: Drawn): QuintEx | undefined {
  const def = arg?.kind === 'name' ? table.get(arg.id) : undefined
  return def === undefined ? undefined : drawn.get(def.id)
}

/** The keys that `rhs` gives a map: those of `S.mapBy(f)`, or of a map literal whose keys are literals. */
function keysGiven(table: LookupTable, rhs: QuintEx): Keys | undefined {
  if (rhs.kind !== 'app') {
    return undefined
  }
  if (rhs.opcode === 'mapBy' && rhs.args.length === 2) {
    return keysOf(table, rhs.args[0])
  }
  if (rhs.opcode === 'Map') {
    const keys = rhs.args.map(entry =>
      entry.kind === 'app' && entry.opcode === 'Tup' && ['str', 'int', 'bool'].includes(entry.args[0]?.kind)
        ? expressionToString(entry.args[0])
        : undefined
    )
    if (keys.some(k => k === undefined)) {
      return undefined
    }
    const text = `Set(${keys.join(', ')})`
    return { text, key: JSON.stringify([text]) }
  }
  return undefined
}

/** Whether assigning `rhs` to the map declared with `variable`, whose keys are `keys`, keeps them. */
function keepsKeys(table: LookupTable, rhs: QuintEx, drawn: Drawn, variable: bigint, keys: Keys): boolean {
  if (rhs.kind === 'name') {
    return table.get(rhs.id)?.id === variable
  }
  if (rhs.kind !== 'app') {
    return false
  }
  if (['put', 'set', 'setBy'].includes(rhs.opcode) && rhs.args.length === 3) {
    const from = drawnFrom(table, rhs.args[1], drawn)
    return (
      keepsKeys(table, rhs.args[0], drawn, variable, keys) &&
      from !== undefined &&
      keysOf(table, from)?.key === keys.key
    )
  }
  return keysGiven(table, rhs)?.key === keys.key
}

/**
 * The set `s` as keys, when it reads no state and names nothing bound outside it: its text, and its text with
 * the declarations its names resolve to.
 */
function keysOf(table: LookupTable, s: QuintEx): Keys | undefined {
  const resolved: bigint[] = []
  return readsNoState(table, s, new Set(), resolved, new Set())
    ? { text: expressionToString(s), key: JSON.stringify([expressionToString(s), ...resolved.map(String)]) }
    : undefined
}

/**
 * Whether `expr` reads no state variable, through the definitions it names, and names no parameter or local
 * definition but those it binds itself (`bound`). Pushes the declarations its names resolve to onto `resolved`.
 */
function readsNoState(
  table: LookupTable,
  expr: QuintEx,
  bound: ReadonlySet<bigint>,
  resolved: bigint[],
  seen: Set<bigint>
): boolean {
  const named = (def: LookupDefinition | undefined): boolean => {
    if (def === undefined || bound.has(def.id)) {
      return true
    }
    resolved.push(def.id)
    switch (def.kind) {
      case 'const':
        return true
      case 'def':
        if (!['val', 'def', 'pureval', 'puredef'].includes(def.qualifier)) {
          return false
        }
        if (seen.has(def.id)) {
          return true
        }
        seen.add(def.id)
        return readsNoState(table, def.expr, new Set(), [], seen)
      default:
        return false
    }
  }
  switch (expr.kind) {
    case 'name':
      return named(table.get(expr.id))
    case 'app':
      return named(table.get(expr.id)) && expr.args.every(a => readsNoState(table, a, bound, resolved, seen))
    case 'lambda':
      return readsNoState(table, expr.expr, new Set([...bound, ...expr.params.map(p => p.id)]), resolved, seen)
    case 'let': {
      const inner = new Set([...bound, expr.opdef.id])
      return (
        readsNoState(table, expr.opdef.expr, bound, resolved, seen) &&
        readsNoState(table, expr.expr, inner, resolved, seen)
      )
    }
    default:
      return true
  }
}

/**
 * The state variables whose keys `expr` states as `m.keys() == S` among its conjuncts, through the definitions it
 * names, for a set `S` that reads no state.
 */
function keysStatedBy(table: LookupTable, expr: QuintEx | undefined, seen: Set<bigint> = new Set()): bigint[] {
  if (expr === undefined) {
    return []
  }
  if (expr.kind === 'name') {
    const def = table.get(expr.id)
    if (def?.kind !== 'def' || seen.has(def.id)) {
      return []
    }
    seen.add(def.id)
    return keysStatedBy(table, def.expr, seen)
  }
  if (expr.kind !== 'app') {
    return []
  }
  if (expr.opcode === 'and') {
    return expr.args.flatMap(a => keysStatedBy(table, a, seen))
  }
  if (expr.opcode === 'eq' && expr.args.length === 2) {
    const [a, b] = expr.args
    const equation = (keys: QuintEx, set: QuintEx) =>
      keys.kind === 'app' && keysOf(table, set) !== undefined ? keysVariable(table, keys) : undefined
    const variable = equation(a, b) ?? equation(b, a)
    return variable === undefined ? [] : [variable]
  }
  return []
}

/** The state variable `m` of `m.keys()`, by the id of its declaration. */
function keysVariable(table: LookupTable, keys: QuintEx): bigint | undefined {
  if (keys.kind !== 'app' || keys.opcode !== 'keys' || keys.args[0]?.kind !== 'name') {
    return undefined
  }
  const def = table.get(keys.args[0].id)
  return def?.kind === 'var' ? def.id : undefined
}

function isMap(table: LookupTable, variable: QuintVar): boolean {
  return inlineAliasesInType(variable.typeAnnotation, table).kind === 'fun'
}
