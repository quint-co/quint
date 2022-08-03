import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Substitutions, compose } from '../../src/effects/substitutions'
import { parseEffectOrThrow } from '../../src/effects/parser'

describe('compose', () => {
  it('applies the first substitutions to all values', () => {
    const s1: Substitutions = [{ kind: 'variable', name: 'v1', value: { kind: 'concrete', vars: ['x'] } }]
    const s2: Substitutions = [{ kind: 'effect', name: 'e1', value: parseEffectOrThrow('Read[v1] & Update[v1]') }]

    const result = compose(s1, s2)

    result.map(r => assert.sameDeepMembers(r, s1.concat([
      { kind: 'effect', name: 'e1', value: parseEffectOrThrow("Read['x'] & Update['x']") },
    ])))

    assert.isTrue(result.isRight())
  })

  it('returns error when an invalid effect is constructed', () => {
    const s1: Substitutions = [{ kind: 'variable', name: 'v1', value: { kind: 'concrete', vars: ['x'] } }]
    const s2: Substitutions = [{ kind: 'effect', name: 'e1', value: parseEffectOrThrow('Read[v1] & Update[v1, v1]') }]

    const result = compose(s1, s2)

    result.mapLeft(e => assert.deepEqual(e, {
      location: "Composing substitutions [v1 |-> 'x'] and [e1 |-> Read[v1] & Update[v1, v1]]",
      children: [{
        location: "Trying to simplify effect Read['x'] & Update['x', 'x']",
        message: 'Multiple updates of variable(s): x',
        children: [],
      }],
    }))

    assert.isTrue(result.isLeft())
  })
})
