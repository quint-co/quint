import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, emptyVariables, unify } from '../../src/effects/base'
import { parseEffectOrThrow } from '../../src/effects/parser'

describe('unify', () => {
  describe('simple effects', () => {
    it('returns error for each effect updating a variable more than once', () => {
      const e1 = parseEffectOrThrow("Update['x', 'x']")
      const e2 = parseEffectOrThrow("Update['y', 'y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify Update['x', 'x'] and Update['y', 'y']",
        children: [
          {
            location: "Trying to simplify effect Update['x', 'x']",
            message: 'Multiple updates of variable(s): x',
            children: [],
          },
          {
            location: "Trying to simplify effect Update['y', 'y']",
            message: 'Multiple updates of variable(s): y',
            children: [],
          },
        ],
      }))
    })

    it('unifies temporal effects', () => {
      const e1 = parseEffectOrThrow('Temporal[t1]')
      const e2 = parseEffectOrThrow("Temporal['x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 't1', value: { kind: 'concrete', vars: ['x'] } },
      ]))
    })

    it('returns error unifying temporal and update effects', () => {
      const e1 = parseEffectOrThrow("Update['x']")
      const e2 = parseEffectOrThrow("Temporal['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify Update['x'] and Temporal['y']",
        message: "Counld't unify temporal and action effects: Update['x'] and Temporal['y']",
        children: [],
      }))
    })

    it('unifies variables with different orders', () => {
      const e1 = parseEffectOrThrow("Read['x', 'y']")
      const e2 = parseEffectOrThrow("Read['y', 'x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, []))
    })

    it('flattens any nested unions', () => {
      const e1 = parseEffectOrThrow('E')

      const e2: Effect = {
        kind: 'concrete',
        read: {
          kind: 'union',
          variables: [
            { kind: 'union', variables: [{ kind: 'quantified', name: 'r1' }, { kind: 'quantified', name: 'r2' }] },
            { kind: 'concrete', vars: ['x', 'y'] },
          ],
        },
        update: emptyVariables,
        temporal: emptyVariables,
      }

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        {
          kind: 'effect',
          name: 'E',
          value: parseEffectOrThrow("Read[r1, r2, 'x', 'y']"),
        },
      ]))
    })

    it('unifies unions when they are the exact same for temporal', () => {
      const e = parseEffectOrThrow('Temporal[v1, v2]')

      const result = unify(e, e)

      result.map(r => assert.deepEqual(r, []))
      assert.isTrue(result.isRight())
    })

    it('unifies unions when they are the exact same for updates', () => {
      const e = parseEffectOrThrow('Update[v1, v2]')

      const result = unify(e, e)

      result.map(r => assert.deepEqual(r, []))
      assert.isTrue(result.isRight())
    })
  })

  describe('simple arrow effects', () => {
    it('unifies effects with parameters', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("(Read['x']) => E")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'v', value: { kind: 'concrete', vars: ['x'] } },
        { kind: 'effect', name: 'E', value: parseEffectOrThrow("Update['x']") },
      ]))
    })

    it('returns error for each effect updating a variable more than once', () => {
      const e1 = parseEffectOrThrow("(Update['x', 'x']) => Read['x']")
      const e2 = parseEffectOrThrow("(Update['y', 'y']) => Read['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Update['x', 'x']) => Read['x'] and (Update['y', 'y']) => Read['y']",
        children: [
          {
            location: "Trying to simplify effect (Update['x', 'x']) => Read['x']",
            children: [{
              location: "Trying to simplify effect Update['x', 'x']",
              message: 'Multiple updates of variable(s): x',
              children: [],
            }],
          },
          {
            location: "Trying to simplify effect (Update['y', 'y']) => Read['y']",
            children: [{
              location: "Trying to simplify effect Update['y', 'y']",
              message: 'Multiple updates of variable(s): y',
              children: [],
            }],
          },
        ],
      }))
    })

    it('returns error when cannot unify variables', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("(Read['x']) => Update['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[v]) => Update[v] and (Read['x']) => Update['y']",
        children: [{
          location: "Trying to unify Update['x'] and Update['y']",
          children: [{
            location: "Trying to unify variables ['x'] and ['y']",
            message: 'Expected variables [x] and [y] to be the same',
            children: [],
          }],
        }],
      }))
    })

    it('returns error when there are not enough parameters', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("() => Update['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[v]) => Update[v] and () => Update['y']",
        message: 'Expected 1 arguments, got 0',
        children: [],
      }))
    })

    it('returns error when trying to unify with non-arrow effect', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("Update['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[v]) => Update[v] and Update['y']",
        message: "Can't unify different types of effects",
        children: [],
      }))
    })
  })

  describe('nested arrow effects', () => {
    it('unifies effects with parameters', () => {
      const e1 = parseEffectOrThrow('((Pure) => E) => E')
      const e2 = parseEffectOrThrow("((Pure) => Read['x']) => Read['x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'effect', name: 'E', value: parseEffectOrThrow("Read['x']") },
      ]))
    })

    it('returns error when an invalid effect is constructed', () => {
      const e1 = parseEffectOrThrow('(Read[v1], Read[v2]) => (Read[v1, v2]) => Update[v1, v2]')
      const e2 = parseEffectOrThrow("(Read['x'], Read['x']) => e0")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[v1], Read[v2]) => (Read[v1, v2]) => Update[v1, v2] and (Read['x'], Read['x']) => e0",
        children: [{
          location: 'Applying substitution to arrow effect (Read[v1, v2]) => Update[v1, v2]',
          children: [{
            location: "Trying to simplify effect Update['x', 'x']",
            message: 'Multiple updates of variable(s): x',
            children: [],
          }],
        }],
      }))
    })
  })

  describe('effects with multiple quantified variables', () => {
    it('unfies with concrete and unifiable effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update['x'], Read['y', 'z'] & Update['x']) => Read['x', 'y', 'z'] & Update['x']")

      const result = unify(e1, e2)
      const reversedResult = unify(e2, e1)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: ['x'] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: ['y', 'z'] } },
        { kind: 'variable', name: 'u', value: { kind: 'concrete', vars: ['x'] } },
      ]))
      assert.deepEqual(result, reversedResult, 'Result should be the same regardless of the effect order in parameters')
    })

    it('returns error with incompatible effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update['x'], Read['y'] & Update['y']) => E")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u] and (Read['x'] & Update['x'], Read['y'] & Update['y']) => E",
        children: [{
          location: "Trying to unify Read[r2] & Update['x'] and Read['y'] & Update['y']",
          children: [{
            location: "Trying to unify variables ['x'] and ['y']",
            message: 'Expected variables [x] and [y] to be the same',
            children: [],
          }],
        }],
      }))
    })

    it('returns partial quantified when unifying with another quantified effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update[v], Read['y'] & Update[v]) => Read['x', 'y'] & Update[v]")

      const result = unify(e1, e2)
      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: ['x'] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: ['y'] } },
        { kind: 'variable', name: 'u', value: { kind: 'quantified', name: 'v' } },
      ]))
    })

    it('returns error with incompatible quantified effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['y'] & Update['x'], Read['z'] & Update['x']) => Read['y'] & Update[u]")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u] and (Read['y'] & Update['x'], Read['z'] & Update['x']) => Read['y'] & Update[u]",
        children: [{
          location: "Trying to unify Read['y', 'z'] & Update['x'] and Read['y'] & Update['x']",
          children: [{
            location: "Trying to unify variables ['y', 'z'] and ['y']",
            message: 'Expected variables [y,z] and [y] to be the same',
            children: [],
          }],
        }],
      }))
    })

    it('returns error when unifying union with another union', () => {
      const e1 = parseEffectOrThrow('Read[r1, r2]')
      const e2 = parseEffectOrThrow("Read[r, 'x', 'y']")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify Read[r1, r2] and Read[r, 'x', 'y']",
        children: [{
          location: "Trying to unify variables [r1, r2] and [r, 'x', 'y']",
          message: 'Unification for unions of variables is not implemented',
          children: [],
        }],
      }))
    })

    it('returs error when effect names are cyclical', () => {
      const e1 = parseEffectOrThrow('e1')
      const e2 = parseEffectOrThrow('() => e1')

      const result = unify(e1, e2)

      result
        .mapLeft(e => assert.deepEqual(e, {
          location: 'Trying to unify e1 and () => e1',
          message: "Can't bind e1 to () => e1: cyclical binding",
          children: [],
        }))

      assert.isTrue(result.isLeft())
    })

    it('returs error when effect names are cyclical in other way', () => {
      const e1 = parseEffectOrThrow('() => e1')
      const e2 = parseEffectOrThrow('e1')

      const result = unify(e1, e2)

      result
        .mapLeft(e => assert.deepEqual(e, {
          location: 'Trying to unify () => e1 and e1',
          message: "Can't bind e1 to () => e1: cyclical binding",
          children: [],
        }))

      assert.isTrue(result.isLeft())
    })

    it('returs error when variable names are cyclical', () => {
      const e1 = parseEffectOrThrow('Read[v1]')
      const e2 = parseEffectOrThrow('Read[v1, v2]')

      const result = unify(e1, e2)

      result
        .mapLeft(e => assert.deepEqual(e, {
          location: 'Trying to unify Read[v1] and Read[v1, v2]',
          children: [
            {
              location: 'Trying to unify variables [v1] and [v1, v2]',
              message: "Can't bind v1 to v1, v2: cyclical binding",
              children: [],
            },
          ],
        }))

      assert.isTrue(result.isLeft())
    })

    it('returs error when variable names are cyclical in other way', () => {
      const e1 = parseEffectOrThrow('Read[v1, v2]')
      const e2 = parseEffectOrThrow('Read[v1]')

      const result = unify(e1, e2)

      result
        .mapLeft(e => assert.deepEqual(e, {
          location: 'Trying to unify Read[v1, v2] and Read[v1]',
          children: [
            {
              location: 'Trying to unify variables [v1, v2] and [v1]',
              message: "Can't bind v1 to v1, v2: cyclical binding",
              children: [],
            },
          ],
        }))

      assert.isTrue(result.isLeft())
    })
  })
})
