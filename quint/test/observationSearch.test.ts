import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ObservationRound, searchObservations } from '../src/observationSearch'

describe('searching for observations one model checker run at a time', () => {
  it('stops after the first run when no observation is reachable', async () => {
    const rounds = recordingRounds([{ kind: 'unreachable' }])

    const result = await searchObservations(2, rounds.run)

    assert.deepEqual(result.unwrap(), [false, false])
    assert.deepEqual(rounds.checked, [[0, 1]])
  })

  it('checks only the observations not reached yet, until a run reaches none', async () => {
    const rounds = recordingRounds([
      { kind: 'reached', observations: [1] },
      { kind: 'reached', observations: [0] },
      { kind: 'unreachable' },
    ])

    const result = await searchObservations(3, rounds.run)

    assert.deepEqual(result.unwrap(), [true, true, false])
    assert.deepEqual(rounds.checked, [[0, 1, 2], [0, 2], [2]])
  })

  it('needs no final run once every observation is reached', async () => {
    const rounds = recordingRounds([{ kind: 'reached', observations: [0, 1] }])

    const result = await searchObservations(2, rounds.run)

    assert.deepEqual(result.unwrap(), [true, true])
    assert.equal(rounds.checked.length, 1)
  })

  it('runs nothing when there are no observations', async () => {
    const rounds = recordingRounds([])

    const result = await searchObservations(0, rounds.run)

    assert.deepEqual(result.unwrap(), [])
    assert.isEmpty(rounds.checked)
  })

  it('reports the message of a failed run', async () => {
    const rounds = recordingRounds([
      { kind: 'reached', observations: [0] },
      { kind: 'error', message: 'out of memory' },
    ])

    const result = await searchObservations(2, rounds.run)

    assert.equal(result.value, 'out of memory')
  })

  it('fails instead of repeating a run that reaches none of the checked observations', async () => {
    const rounds = recordingRounds([
      { kind: 'reached', observations: [0] },
      { kind: 'reached', observations: [0] },
    ])

    const result = await searchObservations(2, rounds.run)

    assert.isTrue(result.isLeft())
    assert.include(String(result.value), 'reaches none of the checked observations')
    assert.equal(rounds.checked.length, 2)
  })
})

// Answers each run with the next of `answers` and records the observations it was asked to check
function recordingRounds(answers: ObservationRound[]) {
  const checked: number[][] = []
  const run = async (remaining: number[]): Promise<ObservationRound> => {
    checked.push(remaining)
    const answer = answers[checked.length - 1]
    if (answer === undefined) {
      assert.fail(`unexpected run #${checked.length} checking ${remaining}`)
    }
    return answer
  }
  return { checked, run }
}
