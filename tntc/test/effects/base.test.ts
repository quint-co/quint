import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, unify } from '../../src/effects/base'

describe('unify', () => {
  describe('simple effects', () => {
    it('returns error for each effect updating a variable more than once', () => {
      const e1: Effect = {
        kind: 'effect',
        read: { kind: 'state', vars: [] },
        update: { kind: 'state', vars: ['x', 'x'] },
      }

      const e2: Effect = {
        kind: 'effect',
        read: { kind: 'state', vars: [] },
        update: { kind: 'state', vars: ['x', 'x'] },
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Update['x', 'x'] and Update['x', 'x']",
          children: [
            {
              location: "Trying to simplify effect Update['x', 'x']",
              message: 'Multiple updates of variable(s): x',
              children: [],
            },
            {
              location: "Trying to simplify effect Update['x', 'x']",
              message: 'Multiple updates of variable(s): x',
              children: [],
            },
          ],
        })
      }
    })

    it('unifies variables with different orders', () => {
      const e1: Effect = {
        kind: 'effect',
        read: { kind: 'state', vars: ['x', 'y'] },
        update: { kind: 'state', vars: [] },
      }

      const e2: Effect = {
        kind: 'effect',
        read: { kind: 'state', vars: ['y', 'x'] },
        update: { kind: 'state', vars: [] },
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [])
      }
    })

    it('flattens any nested unions', () => {
      const e1: Effect = {
        kind: 'effect',
        read: {
          kind: 'union',
          variables: [
            { kind: 'quantification', name: 'r1' },
            { kind: 'state', vars: ['x', 'y'] },
            { kind: 'quantification', name: 'r2' },
          ],
        },
        update: { kind: 'state', vars: [] },
      }

      const e2: Effect = {
        kind: 'effect',
        read: {
          kind: 'union',
          variables: [
            { kind: 'union', variables: [{ kind: 'quantification', name: 'r1' }, { kind: 'state', vars: ['x', 'y'] }] },
            { kind: 'quantification', name: 'r2' },
          ],
        },
        update: { kind: 'state', vars: [] },
      }

      const result = unify(e1, e2)
      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [])
      }
    })
  })

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
            location: "Trying to unify Update['x'] and Update['y']",
            children: [{
              location: "Trying to unify variables 'x' and 'y'",
              message: 'Expected effect to act over variable(s) x instead of y',
              children: [],
            }],
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

  describe('nested arrow effects', () => {
    const e1: Effect = {
      kind: 'arrow',
      effects: [
        {
          kind: 'arrow',
          effects: [
            { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: [] } },
            { kind: 'var', name: 'E' },
          ],
        },
        { kind: 'var', name: 'E' },
      ],
    }

    it('unifies effects with parameters', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          {
            kind: 'arrow',
            effects: [
              { kind: 'effect', read: { kind: 'state', vars: [] }, update: { kind: 'state', vars: [] } },
              { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
            ],
          },
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
        ],
      }

      const result = unify(e1, e2)

      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [
          {
            kind: 'effect',
            name: 'E',
            value: { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: [] } },
          },
        ])
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

    it('unfies with concrete and unifiable effect', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['x'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'state', vars: ['y', 'z'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'state', vars: ['x', 'y', 'z'] }, update: { kind: 'state', vars: ['x'] } },
        ],
      }

      const result = unify(e1, e2)
      const reversedResult = unify(e2, e1)

      assert.deepEqual(result, reversedResult, 'Result should be the same regardless of the effect order in parameters')
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
            location: "Trying to unify Read[r2] & Update['x'] and Read['y'] & Update['y']",
            children: [{
              location: "Trying to unify variables 'x' and 'y'",
              message: 'Expected effect to act over variable(s) x instead of y',
              children: [],
            }],
          }],
        })
      }
    })

    it('returns partial quantification when unifying with another quantified effect', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'quantification', name: 'r1' }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'quantification', name: 'r2' }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'union', variables: [{ kind: 'quantification', name: 'r1' }, { kind: 'quantification', name: 'r2' }] }, update: { kind: 'quantification', name: 'u' } },
        ],
      }

      const result = unify(e1, e2)
      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        assert.sameDeepMembers(result.substitutions, [
          { kind: 'variable', name: 'u', value: { kind: 'state', vars: ['x'] } },
        ])
      }
    })

    it('returns error with incompatible quantified effect', () => {
      const e2: Effect = {
        kind: 'arrow',
        effects: [
          { kind: 'effect', read: { kind: 'state', vars: ['y'] }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'quantification', name: 'r2' }, update: { kind: 'state', vars: ['x'] } },
          { kind: 'effect', read: { kind: 'union', variables: [{ kind: 'quantification', name: 'r2' }, { kind: 'state', vars: ['z'] }] }, update: { kind: 'quantification', name: 'u' } },
        ],
      }

      const result = unify(e1, e2)
      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[r1] & Update[u] -> Read[r2] & Update[u] -> Read[r1, r2] & Update[u] and Read['y'] & Update['x'] -> Read[r2] & Update['x'] -> Read[r2, 'z'] & Update[u]",
          children: [{
            location: "Trying to unify Read[r2, 'y'] & Update['x'] and Read[r2, 'z'] & Update['x']",
            children: [{
              location: "Trying to unify variables r2, 'y' and r2, 'z'",
              children: [{
                location: "Trying to unify variables 'y' and 'z'",
                message: 'Expected effect to act over variable(s) y instead of z',
                children: [],
              }],
            }],
          }],
        })
      }
    })

    it('returns error with different number of union variables', () => {
      const e1: Effect = {
        kind: 'effect',
        read: { kind: 'union', variables: [{ kind: 'quantification', name: 'r1' }, { kind: 'quantification', name: 'r2' }, { kind: 'quantification', name: 'r3' }] },
        update: { kind: 'state', vars: [] },
      }
      const e2: Effect = {
        kind: 'effect',
        read: { kind: 'union', variables: [{ kind: 'state', vars: ['x', 'y'] }, { kind: 'quantification', name: 'r' }] },
        update: { kind: 'state', vars: [] },
      }

      const result = unify(e1, e2)
      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.error, {
          location: "Trying to unify Read[r1, r2, r3] and Read['x', 'y', r]",
          children: [{
            location: "Trying to unify variables r1, r2, r3 and r, 'x', 'y'",
            message: 'Expected 3 variables, got 2',
            children: [],
          }],
        })
      }
    })
  })
})
