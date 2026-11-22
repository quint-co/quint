import { describe, it } from 'mocha'
import { assert } from 'chai'
import { left, right } from '@sweet-monads/either'
import { findViolatedInvariant, generateCfg } from '../src/tlc'
import { tlcObservationRound } from '../src/verify'

describe('the TLC configuration', () => {
  const config = { tlaCode: '', moduleName: 'M', invariants: [], hasTemporal: false }

  it('checks one INVARIANT per invariant, spelled as in the TLA+ output', () => {
    const cfg = generateCfg({ ...config, invariants: ['q::inv', 'q::noObservation0'] })

    assert.equal(cfg, 'INIT q_init\nNEXT q_step\nINVARIANT q_inv\nINVARIANT q_noObservation0\n')
  })

  it('checks no invariant when there is none', () => {
    assert.equal(generateCfg(config), 'INIT q_init\nNEXT q_step\n')
  })
})

describe('reading the violated invariant from TLC output', () => {
  const output = [
    'Running breadth-first search Model-Checking with fp 2',
    'Error: Invariant q_noObservation1 is violated.',
    'Error: The behavior up to this point is:',
  ].join('\n')

  it('names the violated invariant by its Quint name', () => {
    assert.equal(findViolatedInvariant(output, ['q::noObservation0', 'q::noObservation1']), 'q::noObservation1')
  })

  it('names none when TLC violated an invariant that was not checked', () => {
    assert.isUndefined(findViolatedInvariant(output, ['q::noObservation0']))
  })

  it('names none when TLC reports no invariant violation', () => {
    assert.isUndefined(findViolatedInvariant('Model checking completed. No error has been found.', ['q::inv']))
  })
})

describe('interpreting a TLC run that searched for observations', () => {
  it('reaches no observation when TLC finds no violation', () => {
    assert.deepEqual(tlcObservationRound(right(undefined), [0, 2]), { kind: 'unreachable' })
  })

  it('reaches the observation whose negation TLC reports as violated', () => {
    const res = left({ explanation: '', errors: [], isViolation: true, violatedInvariant: 'q::noObservation2' })
    assert.deepEqual(tlcObservationRound(res, [0, 2]), { kind: 'reached', observations: [2] })
  })

  it('fails on a violation of another invariant, or on a TLC error', () => {
    const otherInvariant = left({ explanation: 'found a counterexample', errors: [], isViolation: true })
    assert.deepEqual(tlcObservationRound(otherInvariant, [0]), { kind: 'error', message: 'found a counterexample' })

    const error = left({ explanation: 'TLC error', errors: [], isViolation: false })
    assert.deepEqual(tlcObservationRound(error, [0]), { kind: 'error', message: 'TLC error' })
  })
})
