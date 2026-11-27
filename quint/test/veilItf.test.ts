import { describe, it } from 'mocha'
import { assert } from 'chai'
import fc from 'fast-check'
import { readFileSync } from 'fs'
import { basename, join } from 'path'
import { compile, parse, stage, typecheck } from '../src/cliCommands'
import { QuintType } from '../src/ir/quintTypes'
import { ItfValue, ofItfNormalized } from '../src/itf'
import { typedVariables } from '../src/verifyVeil'
import {
  InductionCheck,
  VeilVariable,
  inductionOutcome,
  leanString,
  readInduction,
  readOutcome,
  readSymbolic,
  readSynthesis,
  readVariables,
  splitDocuments,
  toItfTrace,
} from '../src/veilItf'
import { symbolicSource } from '../src/veil'

const fixtures = join(__dirname, '..', 'testFixture', 'veil')

describe("reading the Veil model checker's output", () => {
  it('reports no violation, with the number of states it explored', () => {
    assert.deepEqual(readOutcome(fixture('two_phase_commit_ok.out'), []), { kind: 'ok', exploredStates: 288 })
  })

  it('reports the invariant a counterexample violates by its Quint name, with every state and the variables', () => {
    const variables = fixtureVariables('two_phase_commit_bug.qnt')
    const outcome = readOutcome(fixture('two_phase_commit_bug.out'), variables)

    assert.equal(outcome.kind, 'violation')
    if (outcome.kind === 'violation') {
      assert.deepEqual(outcome.violates, ['consistencyInv'])
      assert.equal(outcome.states.length, 3)
      assert.deepEqual(outcome.variables, variables)
    }
  })

  it('reports an invariant whose name Lean quotes, as the conjunction of an expression, without the quotes', () => {
    const outcome = readOutcome(fixture('values_scalars.out'), [])

    assert.deepEqual(outcome.kind === 'violation' ? outcome.violates : [], ['q::inv'])
  })

  it('preserves an invariant label that differs from its Lean-escaped declaration name', () => {
    const output = JSON.stringify({
      result: 'found_violation',
      violation: { kind: 'safety_failure', violates: ['safety'] },
      trace: { states: [] },
    })

    const outcome = readOutcome(output, [])

    assert.deepEqual(outcome.kind === 'violation' ? outcome.violates : [], ['safety'])
  })

  it('reports the temporal property a lasso violates, with the state its last state steps back to', () => {
    const outcome = readOutcome(fixture('tlcLeadsTo_lasso.out'), [])

    assert.equal(outcome.kind, 'violation')
    if (outcome.kind === 'violation') {
      assert.deepEqual(outcome.violates, ['zeroLeadsToTwoNoFairness'])
      assert.equal(outcome.states.length, 2)
      assert.equal(outcome.loop, 1)
    }
  })

  it('reads a lasso whose state variable name contains constructor', () => {
    const state = { constructorCount: 1 }
    const output = JSON.stringify({
      result: 'found_violation',
      violation: { kind: 'liveness_failure', violates: ['p'] },
      lasso: { stem: [state], loop: [state, state] },
    })

    assert.equal(readOutcome(output, []).kind, 'violation')
  })

  it('fails, showing the output, when the checker stopped before reporting a result', () => {
    const output = fixture('two_phase_commit_ok.out')
    const truncated = output.slice(0, output.lastIndexOf('{"termination_reason"'))

    const outcome = readOutcome(truncated, [])

    assert.equal(outcome.kind, 'error')
    assert.include(outcome.kind === 'error' ? outcome.message : '', 'reported no result')
  })

  it('says what stopped the checker when a signal ended it before it reported a result', () => {
    const output = fixture('two_phase_commit_ok.out')
    const truncated = output.slice(0, output.lastIndexOf('{"termination_reason"'))

    const outcome = readOutcome(truncated, [], 'signal SIGKILL')

    assert.deepEqual(outcome, {
      kind: 'error',
      message: 'the Veil model checker was stopped by signal SIGKILL before it reported a result',
    })
  })

  it('reads the result from output kept only from a line onwards, as a long run keeps its end', () => {
    const output = fixture('two_phase_commit_ok.out')
    const trimmed = output.slice(output.indexOf('\n', output.length / 2) + 1)

    assert.deepEqual(readOutcome(trimmed, []), { kind: 'ok', exploredStates: 288 })
  })

  it('splits any sequence of JSON documents back into the documents', () => {
    // The checker prints integers, never floating-point numbers, which json-bigint reads differently.
    const { value } = fc.letrec(tie => ({
      value: fc.oneof(
        { depthSize: 'small' },
        fc.boolean(),
        fc.integer(),
        fc.string(),
        fc.constant(null),
        fc.array(tie('value')),
        fc.dictionary(fc.string(), tie('value'))
      ),
    }))
    const document = fc.oneof(fc.dictionary(fc.string(), value), fc.array(value))
    // json-bigint refuses `__proto__` and `constructor` keys, which the checker never prints.
    const documents = fc.array(document).filter(docs => !/"(__proto__|constructor)"/.test(JSON.stringify(docs)))
    fc.assert(
      fc.property(documents, fc.boolean(), (docs, pretty) => {
        const text = docs.map(d => JSON.stringify(d, null, pretty ? 1 : undefined)).join('\n')
        const split = splitDocuments(text)
        assert.isTrue(split.isRight(), split.isLeft() ? split.value : '')
        assert.deepEqual(JSON.parse(JSON.stringify(split.value)), JSON.parse(JSON.stringify(docs)))
      })
    )
  })
})

describe('the state variables the Quint library for Lean writes', () => {
  it("reads each variable's name in an ITF trace, its declaration id and its field", () => {
    const vars = readVariables(fixture('kettle.vars.json'))

    assert.isTrue(vars.isRight(), vars.isLeft() ? vars.value : '')
    assert.deepEqual(vars.value, [
      { name: 'kettle', id: 31n, field: 'kettle_' },
      { name: 'reading', id: 33n, field: 'reading' },
    ])
  })

  it('rejects a file that is not a list of variables, each with its name, id and field', () => {
    assert.isTrue(readVariables(JSON.stringify([{ name: 'x', id: 1 }])).isLeft())
    assert.isTrue(readVariables(JSON.stringify({ name: 'x', id: 1, field: 'x' })).isLeft())
    assert.isTrue(readVariables('[{').isLeft())
  })
})

describe('reading the induction checks Veil reports', () => {
  it('reads each check, with the states of a counterexample before and after the step it fails in', () => {
    const checks = readInduction(fixture('lock_induction.out'))

    assert.isTrue(checks.isRight(), checks.isLeft() ? checks.value : '')
    const read = checks.isRight() ? checks.value : []
    assert.deepEqual(
      read.filter(c => c.invariant === 'mutex').map(c => [c.action, c.status]),
      [
        ['initializer', 'proven'],
        ['request', 'proven'],
        ['enter', 'disproven'],
        ['leave', 'proven'],
      ]
    )
    assert.equal(read.find(c => c.status === 'disproven')?.states?.length, 2)
  })

  it('preserves an invariant label that differs from its Lean-escaped declaration name', () => {
    const checks = readInduction(
      'QUINT_INDUCTION {"conditions":[{"action":"initializer","invariant":"safety","status":"proven","reasons":[]}]}'
    )

    assert.equal(checks.isRight() ? checks.value[0].invariant : '', 'safety')
  })

  it('fails, showing the output, when Lean reported no checks', () => {
    const checks = readInduction('error: unknown identifier\n')

    assert.isTrue(checks.isLeft())
    assert.include(checks.isLeft() ? checks.value : '', 'unknown identifier')
  })

  it('gives a counterexample to induction as the Quint values of its states', async () => {
    const vars = await variables('lock.qnt', 'lockMutexOnly')
    const checks = readInduction(fixture('lock_induction.out'))
    const states = (checks.isRight() ? checks.value : []).find(c => c.status === 'disproven')?.states ?? []

    const itf = toItfTrace(states, vars)

    assert.isTrue(itf.isRight(), itf.isLeft() ? itf.value : '')
    if (itf.isRight()) {
      const [before, after] = itf.value.states
      const proc = (at: string, visits: string): ItfValue => ({
        at: { tag: at, value: { '#tup': [] } },
        visits: { '#bigint': visits },
      })
      assert.deepEqual(before.stage, {
        '#map': [
          ['c', proc('Idle', '1')],
          ['a', proc('Critical', '1')],
          ['b', proc('Waiting', '-1')],
        ],
      })
      assert.deepEqual(before.lock, { tag: 'Free', value: { '#tup': [] } })
      assert.deepEqual(after.stage, {
        '#map': [
          ['c', proc('Idle', '1')],
          ['a', proc('Critical', '1')],
          ['b', proc('Critical', '0')],
        ],
      })
      assert.deepEqual(after.lock, { tag: 'HeldBy', value: 'b' })
    }
  })
})

describe('reading what #updr reports', () => {
  it('finds the strengthening clauses, the frame, and the theorem that certifies them on the standard axioms', () => {
    const { outcome, solverCalls } = readSynthesis(fixture('semaphore_updr.out'))

    assert.deepEqual(outcome, {
      kind: 'invariant',
      frame: 1,
      clauses: [{ name: 'ic3_0', clause: '∀ (x0 : str), ¬ critical x0 ∨ ¬ free' }],
      certificate: {
        theorem: 'semaphore.ic3_safe',
        axioms: ['propext', 'Classical.choice', 'Quot.sound'],
        status: 'kernel-checked, standard axioms only',
        kernelChecked: true,
      },
      errors: [],
    })
    assert.match(solverCalls ?? '', /^solver calls: \d+/)
  })

  it('does not take a certificate on other axioms for one that the kernel checked', () => {
    const trusting = fixture('semaphore_updr.out').replace(
      'axioms: #[propext, Classical.choice, Quot.sound]; kernel-checked, standard axioms only',
      'axioms: #[propext, sorryAx]; depends on #[sorryAx] beyond the standard axioms'
    )

    const { outcome } = readSynthesis(trusting)

    assert.isFalse(outcome.kind === 'invariant' && outcome.certificate?.kernelChecked)
  })

  it('reports a counterexample in the words of Veil, with the theorem that certifies it', () => {
    const { outcome } = readSynthesis(fixture('violate_on_five_updr.out'))

    assert.equal(outcome.kind, 'counterexample')
    if (outcome.kind === 'counterexample') {
      assert.match(outcome.report, /^Violated: the declared invariants\. Execution of 4 step\(s\):/)
      assert.equal(outcome.certificate?.theorem, 'violateOnFive.ic3_unsafe')
      assert.isTrue(outcome.certificate?.kernelChecked)
    }
  })

  it('reports no invariant in the words of Veil when the search ends without one', () => {
    const { outcome } = readSynthesis(fixture('token_updr.out'))

    assert.equal(outcome.kind, 'none')
    if (outcome.kind === 'none') {
      assert.match(outcome.report, /^No universal inductive invariant over the module's vocabulary proves/)
    }
  })

  it('says how Lean ended when it was stopped before #updr reported anything', () => {
    const { outcome } = readSynthesis('', 'signal SIGKILL')

    assert.deepEqual(outcome, {
      kind: 'error',
      message: "Lean ended with signal SIGKILL before Veil's #updr reported an outcome",
    })
  })

  it('reports the error of a spec that does not load, without the errors that follow from it', () => {
    const { outcome } = readSynthesis(fixture('dining_updr_refused.out'))

    assert.deepEqual(outcome, {
      kind: 'error',
      message: 'quint_module: the size of a set whose elements are not known is not supported',
    })
  })
})

describe('reading the answers to the queries of a bounded symbolic check', () => {
  const queries = [0, 1, 2, 3, 4, 5].map(steps => ({ invariant: 'inv', steps }))
  const { lines } = symbolicSource('spec.json', 'violateOnFive', queries)
  const normally = { code: 1, ended: 'exit code 1' }

  it('finds that a query holds where Veil says nothing, and the counterexample of a query that fails', () => {
    const answers = readSymbolic(fixture('violate_on_five_symbolic.out'), lines, normally)

    assert.isTrue(answers.isRight())
    if (answers.isRight()) {
      assert.deepEqual(
        answers.value.map(a => a.kind),
        ['holds', 'holds', 'holds', 'holds', 'violated', 'violated']
      )
      const shortest = answers.value[4]
      assert.equal(
        shortest.kind === 'violated' ? shortest.trace : '',
        [
          '  State 0 (via init):',
          '    n = 1',
          '  State 1 (via step_):',
          '    n = 2',
          '  State 2 (via step_):',
          '    n = 3',
          '  State 3 (via step_):',
          '    n = 4',
          '  State 4 (via step_):',
          '    n = 5',
        ].join('\n')
      )
    }
  })

  it('gives no answer for a spec that does not load, with its error and not those that follow from it', () => {
    const dining = symbolicSource(
      'spec.json',
      'DiningPhilosophers5',
      ['Safety', 'q::keys::states'].flatMap(invariant => [0, 1, 2].map(steps => ({ invariant, steps })))
    )

    const answers = readSymbolic(fixture('dining_refused.out'), dining.lines, normally)

    assert.deepEqual(
      answers.isLeft() ? answers.value : '',
      ['quint_module: the size of a set whose elements are not known is not supported'].join('\n')
    )
  })

  it('finds that Veil did not answer a query, in its words', () => {
    const voted = symbolicSource(
      'spec.json',
      'voted',
      [0, 1].map(steps => ({ invariant: 'counted', steps }))
    )

    const answers = readSymbolic(fixture('voted_symbolic.out'), voted.lines, normally)

    assert.deepEqual(answers.isRight() ? answers.value : [], [
      { kind: 'holds' },
      { kind: 'undecided', answer: 'Verification error\ncvc5.Error.error "Symbol \'true\' not declared as a type"' },
    ])
  })

  it('gives no answer when Lean stopped before it answered, as when it runs out of memory', () => {
    const answers = readSymbolic('', lines, { code: null, ended: 'signal SIGKILL' })

    assert.isTrue(answers.isLeft() && answers.value.startsWith('Lean ended with signal SIGKILL'))
  })
})

describe('what the induction checks of an invariant establish', () => {
  const check = (action: string, status: string): InductionCheck => ({ invariant: 'inv', action, status, reasons: [] })

  it('is a proof when every check is proven', () => {
    assert.deepEqual(inductionOutcome([check('initializer', 'proven'), check('step', 'proven')]), { kind: 'proved' })
  })

  it("is a counterexample, the initializer's first, when a check is disproven", () => {
    const outcome = inductionOutcome([check('step', 'disproven'), check('initializer', 'disproven')])

    assert.deepEqual(outcome, { kind: 'counterexample', check: check('initializer', 'disproven') })
  })

  it('is undecided, with the checks the solver did not decide, when none is disproven and one is not proven', () => {
    const outcome = inductionOutcome([check('initializer', 'proven'), check('step', 'unknown')])

    assert.deepEqual(outcome, { kind: 'undecided', checks: [check('step', 'unknown')] })
  })

  it('establishes nothing when there is no check', () => {
    assert.deepEqual(inductionOutcome([]), { kind: 'undecided', checks: [] })
  })
})

describe('a Veil counterexample as an ITF trace', () => {
  it('gives the two-phase commit counterexample as the Quint values of its variables', async () => {
    const vars = await variables('two_phase_commit_bug.qnt', 'two_phase_commit_3')
    const outcome = readOutcome(fixture('two_phase_commit_bug.out'), [])
    assert.equal(outcome.kind, 'violation')

    const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], vars)

    assert.isTrue(itf.isRight(), itf.isLeft() ? itf.value : '')
    if (itf.isRight()) {
      assert.deepEqual(
        itf.value.vars,
        vars.map(([v]) => v.name)
      )
      const last = itf.value.states[2]
      assert.deepEqual(last['two_phase_commit_3::two_phase_commit::RM::states'], {
        '#map': [
          ['rm1', { tag: 'Aborted', value: { '#tup': [] } }],
          ['rm2', { tag: 'Committed', value: { '#tup': [] } }],
          ['rm3', { tag: 'Working', value: { '#tup': [] } }],
        ],
      })
      assert.deepEqual(last['two_phase_commit_3::two_phase_commit::TM::state'], { tag: 'Init', value: { '#tup': [] } })
      assert.equal(ofItfNormalized(itf.value).length, 3)
    }
  })

  it('gives a lasso as the states up to where its cycle closes, without repeating the state it stutters in', async () => {
    const vars = await variables('../apalache/tlcLeadsTo.qnt', 'tlcLeadsTo')
    const outcome = readOutcome(fixture('tlcLeadsTo_lasso.out'), [])

    const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], vars)

    assert.isTrue(itf.isRight(), itf.isLeft() ? itf.value : '')
    if (itf.isRight()) {
      assert.deepEqual(
        itf.value.states.map(s => s.n),
        [{ '#bigint': '0' }, { '#bigint': '1' }]
      )
    }
  })

  it("reads a lasso's strings, tuples, records and variants, which the checker writes by ToJson", async () => {
    const vars = await variables('kettle.qnt', 'kettle')
    const outcome = readOutcome(fixture('kettle_lasso.out'), [])

    const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], vars)

    assert.isTrue(itf.isRight(), itf.isLeft() ? itf.value : '')
    if (itf.isRight()) {
      assert.deepEqual(itf.value.states[0].reading, {
        state: { tag: 'RoomTemperature', value: { '#tup': [] } },
        label: 'cold',
        pair: { '#tup': [{ '#bigint': '0' }, false] },
      })
      assert.deepEqual(itf.value.states[2].kettle, { tag: 'Cooling', value: { '#tup': [] } })
    }
  })

  it('reads integers, Booleans, records, tuples and lists back at their Quint types', async () => {
    const state = await lastState('values_scalars.qnt', 'values_scalars')

    assert.deepEqual(state['n'], { '#bigint': '0' })
    assert.deepEqual(state['b'], true)
    assert.deepEqual(state['r'], { n: { '#bigint': '3' }, who: 'a' })
    assert.deepEqual(state['t'], { '#tup': [{ '#bigint': '4' }, 'x'] })
    assert.deepEqual(state['l'], [{ '#bigint': '1' }, { '#bigint': '2' }, { '#bigint': '-1' }])
  })

  it('reads maps, sets and variants with payloads back at their Quint types', async () => {
    const state = await lastState('values_containers.qnt', 'values_containers')

    assert.deepEqual(state['m'], {
      '#map': [
        ['a', { '#bigint': '1' }],
        ['b', { '#bigint': '2' }],
      ],
    })
    assert.deepEqual(state['s'], {
      '#set': [
        { tag: 'Ping', value: { '#bigint': '-1' } },
        { tag: 'Ping', value: { '#bigint': '4' } },
        { tag: 'Pong', value: { '#tup': [] } },
      ],
    })
    assert.deepEqual(state['e'], { tag: 'Pong', value: { '#tup': [] } })
  })

  it('fails, naming the variable, when a state has no field for it', async () => {
    const vars = await variables('two_phase_commit_bug.qnt', 'two_phase_commit_3')
    const outcome = readOutcome(fixture('two_phase_commit_bug.out'), [])
    const votes: VeilVariable = { name: 'two_phase_commit_3::two_phase_commit::votes', id: 0n, field: 'votes' }
    const missing: [VeilVariable, QuintType] = [votes, { kind: 'int' }]

    const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], [...vars, missing])

    assert.isTrue(itf.isLeft())
    assert.include(`${itf.value}`, 'two_phase_commit_3::two_phase_commit::votes')
  })

  it('fails, naming the variable, when a value does not have its type', async () => {
    const outcome = readOutcome(fixture('two_phase_commit_bug.out'), [])
    const messages: VeilVariable = { name: 'two_phase_commit::messages', id: 0n, field: 'messages' }
    const misread: [VeilVariable, QuintType] = [messages, { kind: 'int' }]

    const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], [misread])

    assert.isTrue(itf.isLeft())
    assert.include(`${itf.value}`, 'two_phase_commit::messages in state 0: expected an integer')
  })
})

describe('Lean string literals', () => {
  it('denote their characters when nothing in them is escaped', () => {
    const plain = fc.string().filter(s => !s.includes('"') && !s.includes('\\'))
    fc.assert(
      fc.property(plain, s => {
        const read = leanString(`"${s}"`)
        assert.isTrue(read.isRight(), read.isLeft() ? read.value : '')
        assert.equal(read.value, s)
      })
    )
  })

  it('denote what their escapes stand for', () => {
    const read = leanString('"a\\"b\\\\c\\nd\\te\\x41\\u{1F600}"')

    assert.isTrue(read.isRight(), read.isLeft() ? read.value : '')
    assert.equal(read.value, 'a"b\\c\nd\teA\u{1F600}')
  })

  it('are rejected when they are not quoted or escape something unknown', () => {
    assert.isTrue(leanString('rm1').isLeft())
    assert.isTrue(leanString('"\\q"').isLeft())
  })

  it('rejects malformed hexadecimal escapes without throwing', () => {
    assert.doesNotThrow(() => leanString('"\\xzz"'))
    assert.isTrue(leanString('"\\xzz"').isLeft())
    assert.doesNotThrow(() => leanString('"\\u{110000}"'))
    assert.isTrue(leanString('"\\u{110000}"').isLeft())
  })
})

function fixture(name: string): string {
  return readFileSync(join(fixtures, name), 'utf8')
}

/** The state variables the Quint library for Lean wrote for the fixture `file`, recorded in the Veil fixtures. */
function fixtureVariables(file: string): VeilVariable[] {
  const read = readVariables(fixture(basename(file, '.qnt') + '.vars.json'))
  assert.isTrue(read.isRight(), read.isLeft() ? read.value : '')
  return read.isRight() ? read.value : []
}

/** The state variables of `main` in the fixture `file`, with their types, as the Veil backend reads them. */
async function variables(file: string, main: string): Promise<[VeilVariable, QuintType][]> {
  const path = join(fixtures, file)
  const loaded = {
    args: { input: path, main, init: 'init', step: 'step', backend: 'veil' },
    path,
    sourceCode: new Map([[path, fixture(file)]]),
    stage: 'loading' as stage,
    warnings: [],
  }
  const compiled = await (await (await parse(loaded)).asyncChain(typecheck)).asyncChain(compile)
  if (compiled.isLeft()) {
    assert.fail(`${file} does not compile: ${compiled.value.msg}`)
  }
  const vars = typedVariables(compiled.value, fixtureVariables(file))
  assert.isTrue(vars.isRight(), vars.isLeft() ? vars.value : '')
  return vars.isRight() ? vars.value : []
}

/** The last state of the counterexample recorded for the fixture `file`, as ITF. */
async function lastState(file: string, main: string): Promise<Record<string, ItfValue>> {
  const vars = await variables(file, main)
  const outcome = readOutcome(fixture(file.replace('.qnt', '.out')), [])
  assert.equal(outcome.kind, 'violation')
  const itf = toItfTrace(outcome.kind === 'violation' ? outcome.states : [], vars)
  assert.isTrue(itf.isRight(), itf.isLeft() ? itf.value : '')
  return itf.isRight() ? itf.value.states[itf.value.states.length - 1] : {}
}
