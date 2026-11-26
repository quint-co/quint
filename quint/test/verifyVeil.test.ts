import { after, before, describe, it } from 'mocha'
import { assert } from 'chai'
import chalk from 'chalk'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { left, right } from '@sweet-monads/either'
import { CompiledStage, TracingStage, compile, parse, stage, typecheck, verifySpec } from '../src/cliCommands'
import { observationInvariantName } from '../src/cliHelpers'
import { outputJson } from '../src/cliReporting'
import { VeilOutcome } from '../src/veilItf'
import { searchObservationsOnceVerified } from '../src/verify'
import {
  inductionChecksOf,
  inductionResult,
  printAddedKeys,
  symbolicSummary,
  veilInvariants,
  veilObservationRound,
  verifyWithVeilBackend,
  violatedBy,
  withFindings,
} from '../src/verifyVeil'

const fixtures = join(__dirname, '..', 'testFixture', 'veil')

describe('a Veil run searching for observations', () => {
  it('reaches the observations whose invariants the counterexample violates', () => {
    const outcome = { kind: 'violation' as const, violates: ['q::noObservation2'], states: [], variables: [] }

    assert.deepEqual(veilObservationRound(outcome, [0, 2]), { kind: 'reached', observations: [2] })
  })

  it('finds every checked observation unreachable when Veil explores every state without a violation', () => {
    assert.deepEqual(veilObservationRound({ kind: 'ok', exploredStates: 12 }, [0, 2]), { kind: 'unreachable' })
  })

  it('fails when the violated invariant is none of the checked observations', () => {
    const outcome = { kind: 'violation' as const, violates: ['q::inv'], states: [], variables: [] }

    assert.deepEqual(veilObservationRound(outcome, [0]), {
      kind: 'error',
      message: 'Veil violated q::inv, none of the checked observations',
    })
  })

  it('fails with the reason when Veil could not check', () => {
    assert.deepEqual(veilObservationRound({ kind: 'error', message: 'no checker built' }, [0]), {
      kind: 'error',
      message: 'no checker built',
    })
  })

  it('writes the observations that it reached to --out', async () => {
    const compiled = await compileCounter({ backend: 'veil', searchObservations: true })
    // Veil reaches `xIsTwo` and no state of `xIsTen`.
    const reachesTwo = async (remaining: number[]) => {
      const outcome: VeilOutcome = remaining.includes(0)
        ? { kind: 'violation', violates: [observationInvariantName(0)], states: [], variables: [] }
        : { kind: 'ok', exploredStates: 5 }
      return veilObservationRound(outcome, remaining)
    }
    const verified = right<never, TracingStage>({ ...compiled, stage: 'verifying' as stage, status: 'ok' })

    const result = await searchObservationsOnceVerified(compiled, 0, verified, '[Veil]', 'unreached', reachesTwo)

    assert.deepInclude(JSON.parse(outputJson(result.unwrap())), { status: 'ok', reached: ['xIsTwo'] })
  })
})

describe('the invariants Veil states', () => {
  it('are those the spec names, one by one, so that a counterexample names the one it violates', () => {
    assert.deepEqual(veilInvariants(['MemInv', 'trees::NonMemInv']), ['MemInv', 'trees::NonMemInv'])
  })

  it('are their conjunction q::inv when one is an expression rather than a name', () => {
    assert.deepEqual(veilInvariants(['inv', 'x >= 0']), ['q::inv'])
  })

  it('are none when the spec names none', () => {
    assert.deepEqual(veilInvariants([]), [])
  })
})

describe('the arguments that the Veil backend refuses before Veil is set up', () => {
  const savedHome = process.env.QUINT_HOME
  let home: string

  before(() => {
    home = mkdtempSync(join(tmpdir(), 'quint-veil-arguments-'))
    process.env.QUINT_HOME = home
  })

  after(() => {
    rmSync(home, { recursive: true, force: true })
    if (savedHome === undefined) {
      delete process.env.QUINT_HOME
    } else {
      process.env.QUINT_HOME = savedHome
    }
  })

  /** The message that the Veil backend fails with on the counter, given `args`. */
  async function refusal(args: object): Promise<string> {
    const compiled = await compileCounter({ backend: 'veil', ...args })
    const result = await verifyWithVeilBackend(compiled, { ...compiled, stage: 'verifying' as stage }, 0)

    assert.deepEqual(readdirSync(home), [], 'nothing is installed')
    return result.isLeft() ? result.value.msg : 'verified'
  }

  it('refuses a state constraint that is an expression, which names no definition', async () => {
    assert.equal(
      await refusal({ stateConstraints: ['small', 'x < 3'] }),
      'the Veil backend takes a state constraint by the name of a definition, not x < 3'
    )
  })

  it('refuses checks that an inductive-invariant proof would ignore', async () => {
    assert.equal(
      await refusal({ inductiveInvariant: 'xNonNegative', proofs: 'missing.lean' }),
      '--proofs cannot be combined with --inductive-invariant'
    )
    assert.equal(
      await refusal({ inductiveInvariant: 'xNonNegative', temporal: 'eventually(x == 2)' }),
      '--temporal cannot be combined with --inductive-invariant'
    )
    assert.equal(
      await refusal({ inductiveInvariant: 'x >= 0', searchObservations: true }),
      '--search-observations cannot be combined with --inductive-invariant'
    )
  })

  it('refuses to look for an observation in a check of proofs, which proves only invariants', async () => {
    assert.equal(
      await refusal({ proofs: 'counter_proofs.lean', invariants: ['xNonNegative'], observation: ['x == 3'] }),
      '--observation cannot be combined with --proofs'
    )
  })

  it('refuses to synthesize an invariant in a check of another kind', async () => {
    const synthesis = { synthesizeInvariant: 'xNonNegative' }

    assert.equal(
      await refusal({ ...synthesis, inductiveInvariant: 'x >= 0' }),
      '--synthesize-invariant cannot be combined with --inductive-invariant'
    )
    assert.equal(
      await refusal({ ...synthesis, proofs: 'counter_proofs.lean' }),
      '--synthesize-invariant cannot be combined with --proofs'
    )
    assert.equal(
      await refusal({ ...synthesis, symbolic: true }),
      '--synthesize-invariant cannot be combined with --symbolic'
    )
  })

  it('refuses a symbolic check in a check of another kind', async () => {
    assert.equal(
      await refusal({ symbolic: true, inductiveInvariant: 'x >= 0' }),
      '--symbolic cannot be combined with --inductive-invariant'
    )
    assert.equal(
      await refusal({ symbolic: true, proofs: 'counter_proofs.lean' }),
      '--symbolic cannot be combined with --proofs'
    )
  })

  it('refuses a symbolic check of temporal properties or observations, which it does not check', async () => {
    assert.equal(
      await refusal({ symbolic: true, temporal: 'eventually(x == 2)' }),
      '--temporal cannot be combined with --symbolic'
    )
    assert.equal(
      await refusal({ symbolic: true, observation: ['x == 3'] }),
      '--observation cannot be combined with --symbolic'
    )
  })

  it('refuses to synthesize an invariant given as an expression, which #updr names', async () => {
    assert.equal(
      await refusal({ synthesizeInvariant: 'x >= 0' }),
      '--synthesize-invariant takes the name of a definition, not x >= 0'
    )
  })

  it('refuses a symbolic check of no invariant', async () => {
    assert.equal(
      await refusal({ symbolic: true, noInvariant: true }),
      '--symbolic checks invariants, and none is given with --invariant or --invariants, or declared by the main module'
    )
  })

  it('refuses every Veil-only option with another backend, before it starts', async () => {
    for (const [args, message] of [
      [{ synthesizeInvariant: 'xNonNegative' }, '--synthesize-invariant applies only to --backend veil'],
      [{ symbolic: true }, '--symbolic applies only to --backend veil'],
      [{ proofs: 'missing.lean' }, '--proofs applies only to --backend veil'],
      [{ trustSmt: true }, '--trust-smt applies only to a Veil proof check'],
      [{ stateConstraints: ['xNonNegative'] }, '--state-constraints applies only to --backend veil'],
    ] as const) {
      const compiled = await compileCounter({ backend: 'tlc', ...args })
      const result = await verifySpec(compiled)

      assert.equal(result.isLeft() ? result.value.msg : 'verified', message)
    }
  })
})

describe('what a symbolic check establishes of an invariant', () => {
  const queries = [0, 1, 2, 3].flatMap(steps => [
    { invariant: 'a', steps },
    { invariant: 'b', steps },
  ])
  const holds = { kind: 'holds' as const }

  it('holds when every query of it holds', () => {
    assert.deepEqual(
      symbolicSummary(
        'a',
        queries,
        queries.map(() => holds)
      ),
      { invariant: 'a', status: 'holds' }
    )
  })

  it('is violated by the counterexample of the fewest steps, past queries that Veil did not answer', () => {
    const answers = queries.map(q =>
      q.invariant === 'b' && q.steps === 1
        ? { kind: 'undecided' as const, answer: 'Solver returned unknown' }
        : q.invariant === 'b' && q.steps >= 2
        ? { kind: 'violated' as const, trace: `after ${q.steps}` }
        : holds
    )

    assert.deepEqual(symbolicSummary('b', queries, answers), {
      invariant: 'b',
      status: 'violated',
      steps: 2,
      trace: 'after 2',
    })
  })

  it('is undecided, with the lengths Veil gave no answer for, when nothing violates it', () => {
    const answers = queries.map(q =>
      q.steps === 3 ? { kind: 'undecided' as const, answer: 'Solver timed out' } : holds
    )

    assert.deepEqual(symbolicSummary('a', queries, answers), {
      invariant: 'a',
      status: 'undecided',
      undecided: [{ steps: 3, answer: 'Solver timed out' }],
    })
  })
})

describe('the keys invariants that a check of Veil adds', () => {
  const keys = [{ name: 'q::keys::stage', text: 'stage.keys() == procs', variable: 'stage', variableId: 1n }]

  it('are each reported on a line that says where they come from', () => {
    const logged: string[] = []
    const [log, level] = [console.log, chalk.level]
    console.log = (line: string) => logged.push(line)
    chalk.level = 0
    try {
      printAddedKeys({ keysInvariants: keys } as CompiledStage, 2)
    } finally {
      console.log = log
      chalk.level = level
    }

    assert.deepEqual(logged, [
      '[Veil] Added stage.keys() == procs (from init) to the invariants of this check; it is proved together with them.',
    ])
  })

  it('are named by their text when the check of one fails, which then says to write it by hand', async () => {
    const lock = await compileFile('lock.qnt', { main: 'lock', backend: 'veil', inductiveInvariant: 'mutex' })
    const check = { invariant: 'q::keys::stage', action: 'enter', status: 'disproven', reasons: [] }

    const result = inductionResult({ kind: 'counterexample', check }, lock, [])

    assert.equal(
      result.isLeft() ? result.value.explanation : '',
      'stage.keys() == procs fails after enter, in a state Veil could not show: the solver gave no state\n' +
        'quint added stage.keys() == procs from init: write an invariant that states the keys of stage yourself, ' +
        'in the inductive invariant.'
    )
  })

  it('are written to --out', () => {
    const stage: TracingStage = { stage: 'running', args: {}, path: 'mocked.qnt', sourceCode: new Map() }
    const result = withFindings(right({ ...stage, status: 'ok' }), { addedInvariants: ['stage.keys() == procs'] })

    assert.deepInclude(JSON.parse(outputJson(result.unwrap())), { addedInvariants: ['stage.keys() == procs'] })
  })
})

describe('proving an inductive invariant with Veil', () => {
  const check = (status: string, action: string, reasons: string[] = []) => ({
    invariant: 'q::inductiveInv',
    action,
    status,
    reasons,
  })
  let counter: CompiledStage

  before(async () => {
    counter = await compileCounter({ backend: 'veil', inductiveInvariant: 'x >= 0' })
  })

  it('finds no violation when Veil proves every check', () => {
    assert.isTrue(inductionResult({ kind: 'proved' }, counter, []).isRight())
  })

  it('fails with every check the solver decided neither way, where it is and why', () => {
    const outcome = { kind: 'undecided' as const, checks: [check('unknown', 'step', ['INCOMPLETE', 'INCOMPLETE'])] }

    const result = inductionResult(outcome, counter, [])

    assert.deepEqual(
      result.isLeft() ? result.value.explanation : '',
      ['Veil could not decide:', '  the inductive invariant after step: unknown: INCOMPLETE'].join('\n')
    )
  })

  it('reports a counterexample at the initializer whose state the solver did not give, without a trace', () => {
    const outcome = { kind: 'counterexample' as const, check: check('disproven', 'initializer') }

    const result = inductionResult(outcome, counter, [])

    assert.deepEqual(result.isLeft() ? result.value : undefined, {
      explanation:
        'the inductive invariant fails at the initializer, in a state Veil could not show: the solver gave no state',
      errors: [],
      traces: undefined,
    })
  })
})

describe('what --out says a Veil counterexample violates', () => {
  it('names the stated invariants that Veil names, whatever modules qualify them', () => {
    const counterexample = { violates: ['agreement'] }

    assert.deepEqual(violatedBy(counterexample, ['RM::agreement', 'validity'], undefined), ['RM::agreement'])
  })

  it('names none when Veil checked the conjunction of the invariants, which does not say which part fails', () => {
    assert.isUndefined(violatedBy({ violates: ['q::inv'] }, ['q::inv'], undefined))
  })

  it('names the temporal property that a lasso violates', () => {
    assert.deepEqual(violatedBy({ violates: [], loop: 2 }, ['agreement'], 'eventuallyDecides'), ['eventuallyDecides'])
  })

  it('names none for a lasso that violates a conjunction of temporal properties', () => {
    assert.isUndefined(violatedBy({ violates: [], loop: 2 }, [], 'decides,terminates'))
  })
})

describe('the induction checks that --out lists', () => {
  const check = (invariant: string, action: string, status: string) => ({ invariant, action, status, reasons: [] })

  it('has one per invariant and per initializer or action, with the status Veil gave it', () => {
    const checks = [check('q::inductiveInv', 'initializer', 'proven'), check('q::inductiveInv', 'vote', 'disproven')]

    assert.deepEqual(inductionChecksOf(checks), [
      { invariant: 'q::inductiveInv', check: 'initializer', status: 'proven' },
      { invariant: 'q::inductiveInv', check: 'vote', status: 'disproven' },
    ])
  })

  it('makes every check of an ordinary invariant an implication, since its initializer is the inductive invariant', () => {
    assert.deepEqual(inductionChecksOf([check('agreement', 'initializer', 'unknown')], 'implication'), [
      { invariant: 'agreement', check: 'implication', status: 'unknown' },
    ])
  })
})

describe('the findings of a Veil check in --out', () => {
  const stage: TracingStage = { stage: 'running', args: {}, path: 'mocked.qnt', sourceCode: new Map() }

  it('are written beside the status of a check that passed', () => {
    const result = withFindings(right({ ...stage, status: 'ok' }), { exploredStates: 288, elapsedMs: 12 })

    const written = JSON.parse(outputJson(result.unwrap()))

    assert.include(written, { status: 'ok', exploredStates: 288, elapsedMs: 12 })
  })

  it('are written, with the reason, beside the status of a check that failed', () => {
    const failed = withFindings(left({ msg: 'found a counterexample', stage: { ...stage, errors: [] } }), {
      violated: ['agreement'],
    })
    if (failed.isRight()) {
      assert.fail('the check should have stayed failed')
    }

    const written = JSON.parse(outputJson({ ...failed.value.stage, message: failed.value.msg }))

    assert.deepInclude(written, { violated: ['agreement'], message: 'found a counterexample' })
  })
})

// A counter that stops at 4, with an invariant and two observations.
const counterModule = `
module counter {
  var x: int

  action init = x' = 0
  action step = x' = if (x < 4) x + 1 else x

  invariant xNonNegative = x >= 0
  observation xIsTwo = x == 2
  observation xIsTen = x == 10
}
`

/** The fixture `name`, compiled with the arguments `args`. */
async function compileFile(name: string, args: object): Promise<CompiledStage> {
  const path = join(fixtures, name)
  const loaded = {
    args: { input: path, init: 'init', step: 'step', ...args },
    path,
    sourceCode: new Map([[path, readFileSync(path, 'utf8')]]),
    stage: 'loading' as stage,
    warnings: [],
  }
  const compiled = await (await (await parse(loaded)).asyncChain(typecheck)).asyncChain(compile)
  if (compiled.isLeft()) {
    assert.fail(`${name} does not compile: ${compiled.value.msg}`)
  }
  return compiled.value
}

/** The counter, compiled with the arguments `args`. */
async function compileCounter(args: object): Promise<CompiledStage> {
  const path = 'mocked/counter.qnt'
  const loaded = {
    args: { input: path, init: 'init', step: 'step', ...args },
    path,
    sourceCode: new Map([[path, counterModule]]),
    stage: 'loading' as stage,
    warnings: [],
  }
  const compiled = await (await (await parse(loaded)).asyncChain(typecheck)).asyncChain(compile)
  if (compiled.isLeft()) {
    assert.fail(`the counter does not compile: ${compiled.value.msg}`)
  }
  return compiled.value
}
