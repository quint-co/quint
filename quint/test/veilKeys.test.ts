import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { CompiledStage, compile, parse, stage, typecheck } from '../src/cliCommands'
import { inferKeysInvariants } from '../src/veilKeys'

const fixtures = join(__dirname, '..', 'testFixture', 'veil')

describe('the keys invariants inferred for a check of Veil', () => {
  it('state the keys that init gives a map, which every step keeps with a key drawn from them', async () => {
    const spec = `module tpc {
      const participants: Set[str]
      type Stage = Working | Prepared | Aborted
      var stages: str -> Stage
      action init = stages' = participants.mapBy(_ => Working)
      action prepares(p: str): bool = all { stages.get(p) == Working, stages' = stages.put(p, Prepared) }
      action aborts(p: str): bool = stages' = stages.put(p, Aborted)
      action step = {
        nondet p = participants.oneOf()
        any { prepares(p), aborts(p) }
      }
    }`

    assert.deepEqual(texts(await compileSpec(spec, { main: 'tpc' })), ['stages.keys() == participants'])
  })

  it('follow a key through the parameter of the action that a nondet passes it to', async () => {
    const compiled = await compileSpec(fixture('lock.qnt'), { main: 'lock' })

    assert.deepEqual(texts(compiled), ['stage.keys() == procs'])
  })

  it('take the keys of a map literal, which a step keeps by setting one of them', async () => {
    const spec = `module m {
      var balances: str -> int
      action init = balances' = Map("a" -> 0, "b" -> 0)
      action step = {
        nondet k = Set("a", "b").oneOf()
        balances' = balances.set(k, balances.get(k) + 1)
      }
      val nonNegative = balances.get("a") >= 0
    }`

    assert.deepEqual(texts(await compileSpec(spec, { main: 'm', invariant: 'nonNegative' })), [
      'balances.keys() == Set("a", "b")',
    ])
  })

  it('infer nothing for a map whose step puts a key drawn from a set that reads the state', async () => {
    const compiled = await compileSpec(fixture('ballot.qnt'), { main: 'ballot', invariant: 'counted' })

    assert.deepEqual(texts(compiled), [])
  })

  it('infer nothing for a map that grows from no keys', async () => {
    const spec = `module m {
      const names: Set[str]
      var balances: str -> int
      action init = balances' = Map()
      action step = {
        nondet n = names.oneOf()
        balances' = balances.put(n, 0)
      }
    }`

    assert.deepEqual(texts(await compileSpec(spec, { main: 'm' })), [])
  })

  it('infer nothing for a map that a step builds anew over other keys', async () => {
    const spec = `module m {
      const names: Set[str]
      var seen: str -> bool
      action init = seen' = names.mapBy(_ => false)
      action step = seen' = names.filter(n => n != "x").mapBy(_ => true)
    }`

    assert.deepEqual(texts(await compileSpec(spec, { main: 'm' })), [])
  })

  it('add nothing for a map whose keys an invariant of the check states already', async () => {
    const spec = `module m {
      const names: Set[str]
      var seen: str -> bool
      action init = seen' = names.mapBy(_ => false)
      action step = { nondet n = names.oneOf() seen' = seen.set(n, true) }
      val seenKeys = and { seen.keys() == names, names.size() >= 0 }
      val anySeen = names.exists(n => seen.get(n))
    }`
    const compiled = await compileSpec(spec, { ...symbolic, main: 'm', invariants: ['anySeen', 'seenKeys'] })

    assert.deepEqual(texts(compiled), [])
    assert.deepEqual(
      inferKeysInvariants(compiled, 'init', 'step', ['anySeen']).map(k => k.text),
      ['seen.keys() == names']
    )
  })

  it('add nothing for a map whose keys a definition of the main module states, as the SMT encoding reads it', async () => {
    const compiled = await compileSpec(fixture('lock.qnt'), { main: 'lockMutexOnly' })

    assert.deepEqual(texts(compiled), [])
  })

  it('are named q::keys::m, and defined in the main module that the check loads', async () => {
    const spec = `${fixture('lock.qnt')}\nmodule lockImported {\n  import lock.*\n}`
    const compiled = await compileSpec(spec, { main: 'lockImported' })

    assert.deepEqual(
      compiled.keysInvariants.map(k => k.name),
      ['q::keys::stage']
    )
    assert.isTrue(compiled.mainModule.declarations.some(d => d.kind === 'def' && d.name === 'q::keys::stage'))
  })

  it('are added for --synthesize-invariant and --symbolic too, but not for the checks of other backends', async () => {
    const spec = readFileSync(join(fixtures, 'lock.qnt'), 'utf8')

    for (const mode of [{ inductiveInvariant: undefined, synthesizeInvariant: 'mutex' }, symbolic]) {
      const compiled = await compileSpec(spec, { main: 'lock', invariants: ['mutex'], ...mode })

      assert.deepEqual(texts(compiled), ['stage.keys() == procs'])
    }
    const apalache = { ...symbolic, main: 'lock', invariants: ['mutex'], backend: 'apalache' }

    assert.deepEqual(texts(await compileSpec(spec, apalache)), [])
  })

  it('are not added for a check of --proofs, whose file states its own invariants', async () => {
    const spec = readFileSync(join(fixtures, 'lock.qnt'), 'utf8')

    const proofs = { inductiveInvariant: undefined, proofs: 'lock.lean', invariants: ['mutex'] }

    assert.deepEqual(texts(await compileSpec(spec, { main: 'lock', ...proofs })), [])
  })
})

/** The arguments of a bounded symbolic check, in place of the inductive invariant check that `compileSpec` assumes. */
const symbolic = { inductiveInvariant: undefined, symbolic: true }

/** The text of the keys invariants that compilation adds. */
function texts(compiled: CompiledStage): string[] {
  return compiled.keysInvariants.map(k => k.text)
}

function fixture(name: string): string {
  return readFileSync(join(fixtures, name), 'utf8')
}

/** `spec`, compiled for an inductive invariant check of Veil unless `args` say otherwise. */
async function compileSpec(spec: string, args: object): Promise<CompiledStage> {
  const path = 'mocked/spec.qnt'
  const loaded = {
    args: { input: path, init: 'init', step: 'step', backend: 'veil', inductiveInvariant: 'true', ...args },
    path,
    sourceCode: new Map([[path, spec]]),
    stage: 'loading' as stage,
    warnings: [],
  }
  const compiled = await (await (await parse(loaded)).asyncChain(typecheck)).asyncChain(compile)
  if (compiled.isLeft()) {
    assert.fail(`the spec does not compile: ${compiled.value.msg}`)
  }
  return compiled.value
}
