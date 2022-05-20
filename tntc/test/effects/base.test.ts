import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, unify } from '../../src/effects/base'

describe('unify', () => {
  const e1: Effect = {
    kind: 'arrow', effects: [
      { kind: 'effect', read: { kind: 'quantification', name: 'v' }, update: { kind: 'state', vars: [] } },
      { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'quantification', name: 'v' } },
    ]
  }

  it('unifies effects with parameters', () => {
    // Read[v] -> Update[v]
    // Read['x'] -> E
    // v ~> ['x'], E ~> Update['x']
    const e2: Effect = {
      kind: 'arrow', effects: [
        { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
        { kind: 'var', name: 'E' },
      ]
    }

    const result = unify(e1, e2)

    assert.deepEqual(result.kind, 'ok')
    if (result.kind === 'ok') {
      assert.sameDeepMembers(result.substitutions, [
        { kind: 'variable', name: 'v', value: { kind: 'state', vars: ['x'] } },
        {
          kind: 'effect', name: 'E', value: {
            kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['x'] }
          },
        },
      ])
    }
  })

  it('returns error when cannot unify variables', () => {
    // Read[v] -> Update[v]
    // Read['x'] -> Update['y']
    const e2: Effect = {
      kind: 'arrow', effects: [
        { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
        { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['y'] } },
      ]
    }

    const result = unify(e1, e2)

    assert.deepEqual(result.kind, 'error')
    if (result.kind === 'error') {
      assert.deepEqual(result.errors, [{ message: 'Expected effect on variable(s) x instead of y' }])
    }
  })
})
