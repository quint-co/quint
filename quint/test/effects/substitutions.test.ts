import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Substitutions, applySubstitution, compose } from '../../src/effects/substitutions'
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
})

describe('applySubstitution', () => {
  it('substitutes with transitivity', () => {
    const s: Substitutions = [
      { kind: 'effect', name: 'e0', value: { kind: 'variable', name: 'e1' } },
      { kind: 'effect', name: 'e1', value: { kind: 'variable', name: 'e2' } },
    ]

    const e = parseEffectOrThrow('e0')

    const result = applySubstitution(s, e).unwrap()

    assert.deepEqual(result, parseEffectOrThrow('e2'))
  })
})
