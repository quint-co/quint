import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Substitutions, compose } from '../../src/effects/substitutions'
import { parseEffectOrThrow } from '../../src/effects/parser'

describe('compose', () => {
  it('applies the first substitutions to all values', () => {
    const s1: Substitutions = [
      { kind: 'entity', name: 'v1', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 0n }] } },
    ]
    const s2: Substitutions = [{ kind: 'effect', name: 'e1', value: parseEffectOrThrow('Read[v1] & Update[v1]') }]

    const result = compose(s1, s2)

    result.map(r =>
      assert.sameDeepMembers(
        r,
        s1.concat([
          {
            kind: 'effect',
            name: 'e1',
            value: {
              kind: 'concrete',
              components: [
                { kind: 'read', entity: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 0n }] } },
                { kind: 'update', entity: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 0n }] } },
              ],
            },
          },
        ])
      )
    )

    assert.isTrue(result.isRight())
  })

  it('unifies values of substitutions with same name', () => {
    const s1: Substitutions = [
      { kind: 'entity', name: 'v1', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 2n }] } },
    ]
    const s2: Substitutions = [{ kind: 'entity', name: 'v1', value: { kind: 'variable', name: 'q' } }]

    const result = compose(s1, s2)

    result.map(r =>
      assert.sameDeepMembers(
        r,
        s1.concat([
          { kind: 'entity', name: 'q', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 2n }] } },
        ])
      )
    )

    assert.isTrue(result.isRight())
  })
})
