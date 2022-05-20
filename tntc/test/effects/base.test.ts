import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, unify } from '../../src/effects/base'

describe('unify', () => {
  describe('simple arrow effects', () => {
    const e1: Effect = {
      kind: 'arrow',
      effects: [
        { kind: 'effect', read: { kind: 'quantification', name: 'v' }, update: { kind: 'state', vars: [] } },
        { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'quantification', name: 'v' } },
      ],
    }

    it('unifies effects with parameters', () => {
      // Read[v] -> Update[v]
      // Read['x'] -> E
      // v ~> ['x'], E ~> Update['x']
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
          { kind: 'var', name: 'E' },
        ],
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [
          { kind: 'variable', name: 'v', value: { kind: 'state', vars: ['x'] } },
          {
            kind: 'effect',
            name: 'E',
            value: {
              kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['x'] },
            },
          },
        ])
      }
    })

    it('returns error when cannot unify variables', () => {
      // Read[v] -> Update[v]
      // Read['x'] -> Update['y']
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
          { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['y'] } },
        ],
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[v] -> Update[v] and Read['x'] -> Update['y']",
          children: [{
            location: "Trying to unify variables 'x' and 'y'",
            message: 'Expected effect to act over variable(s) x instead of y',
            children: [],
          }],
        })
      }
    })

    it('returns error when there are not enough parameters', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['y'] } },
        ],
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[v] -> Update[v] and Update['y']",
          message: 'Expected 1 arguments, got 0',
          children: [],
        })
      }
    })

    it('returns error when trying to unify with non-arrow effect', () => {
      const e2: Effect = { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: ['y'] } }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[v] -> Update[v] and Update['y']",
          message: "Can't unify different types of effects",
          children: [],
        })
      }
    })
  })

  describe('effects with multiple quantified variables', () => {
    const e1: Effect = {
      kind: 'arrow',
      effects: [
        { kind: 'effect', read: { kind: 'quantification', name: 'r1' }, update: { kind: 'quantification', name: 'u' } },
        { kind: 'effect', read: { kind: 'quantification', name: 'r2' }, update: { kind: 'quantification', name: 'u' } },
        { kind: 'effect', read: { kind: 'union', variables: [{ kind: 'quantification', name: 'r1' }, { kind: 'quantification', name: 'r2' }] }, update: { kind: 'quantification', name: 'u' } },
      ],
    }

    it('unfies with unifiable effect', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'state', vars: ['y', 'z'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'state', vars: ['x', 'y', 'z'] }, update: { kind: 'state', vars: ['x'] } },
        ],
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [
          { kind: 'variable', name: 'r1', value: { kind: 'state', vars: ['x'] } },
          { kind: 'variable', name: 'r2', value: { kind: 'state', vars: ['y', 'z'] } },
          { kind: 'variable', name: 'u', value: { kind: 'state', vars: ['x'] } },
        ])
      }
    })

    it('returns error with incompatible effect', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'state', vars: ['y'] }, update: { kind: 'state', vars: ['y'] } },
          { kind: 'var', name: 'E' },
        ],
      }

      const result = unify(e1, e2)
      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[r1] & Update[u] -> Read[r2] & Update[u] -> Read[r1, r2] & Update[u] and Read['x'] & Update['x'] -> Read['y'] & Update['y'] -> E",
          children: [{
            location: "Trying to unify variables 'x' and 'y'",
            message: 'Expected effect to act over variable(s) x instead of y',
            children: [],
          }],
        })
      }
    })
  })
})
