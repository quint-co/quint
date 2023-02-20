import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, unify } from '../../src/effects/base'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { errorTreeToString } from '../../src/errorTree'
import { substitutionsToString } from '../../src'

describe('unify', () => {
  describe('simple effects', () => {
    it('unifies temporal effects', () => {
      const e1 = parseEffectOrThrow('Temporal[t1]')
      const e2 = parseEffectOrThrow("Temporal['x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 't1', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
      ]))
    })

    it('returns error unifying temporal and update effects', () => {
      const e1 = parseEffectOrThrow("Update['x']")
      const e2 = parseEffectOrThrow("Temporal['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify Update['x'] and Temporal['y']",
        children: [{
          location: "Trying to unify variables ['x'] and []",
          message: 'Expected variables [x] and [] to be the same',
          children: [],
        }],
      }))
    })

    it('returns error unifying temporal and pure effects', () => {
      const e1 = parseEffectOrThrow('Pure')
      const e2 = parseEffectOrThrow("Temporal['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify Pure and Temporal['y']",
        children: [{
          location: "Trying to unify variables ['y'] and []",
          message: 'Expected variables [y] and [] to be the same',
          children: [],
        }],
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
        components: [
          {
            kind: 'read',
            variables: {
              kind: 'union',
              variables: [
                { kind: 'union', variables: [{ kind: 'quantified', name: 'r1' }, { kind: 'quantified', name: 'r2' }] },
                { kind: 'concrete', vars: [{ name: 'x', reference: 1n }, { name: 'y', reference: 2n }] },
              ],
            },
          },
        ],
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
        { kind: 'variable', name: 'v', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
        { kind: 'effect', name: 'E', value: parseEffectOrThrow("Update['x']") },
      ]))
    })

    it('unpacks arguments as tuples', () => {
      const e1 = parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')
      const e2 = parseEffectOrThrow("(Pure) => E")

      const result = unify(e1, e2)

      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: [] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: [] } },
        { kind: 'effect', name: 'E', value: parseEffectOrThrow('Pure') },
      ])).mapLeft(err => assert.fail(`Should find no errros, found ${errorTreeToString(err)}`))
    })

    it('unpacks arguments as tuples with read and temporal effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]')
      const e2 = parseEffectOrThrow("(Read['x'] & Temporal['t']) => E")

      const result = unify(e1, e2)

      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
        { kind: 'variable', name: 't1', value: { kind: 'concrete', vars: [{ name: 't', reference: 2n }] } },
        { kind: 'variable', name: 't2', value: { kind: 'concrete', vars: [{ name: 't', reference: 2n }] } },
        {
          kind: 'effect', name: 'E', value: {
            kind: 'concrete', components: [
              { kind: 'read', variables: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
              { kind: 'temporal', variables: { kind: 'concrete', vars: [{ name: 't', reference: 2n }] } },
            ],
          },
        },
      ])).mapLeft(err => assert.fail(`Should find no errros, found ${errorTreeToString(err)}`))
    })

    it('results in the same effect regardless of unpacked projection', () => {
      const e1 = parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1]')
      const e2 = parseEffectOrThrow("(Read['x', 'y']) => E")

      const e3 = parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r2]')
      const e4 = parseEffectOrThrow("(Read['x', 'y']) => E")

      const result1 = unify(e1, e2)
      const result2 = unify(e3, e4)

      result1.map(r1 => result2.map(r2 => assert.deepEqual(substitutionsToString(r1), substitutionsToString(r2))))
    })

    it('returns error when unpacked values cannot unify', () => {
      const e1 = parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')
      const e2 = parseEffectOrThrow("(Temporal['x']) => E")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r => assert.deepEqual(r, {
        location: "Trying to unify (Read[r1], Read[r2]) => Read[r1, r2] and (Temporal['x']) => E",
        children: [
          {
            location: "Trying to unify Temporal['x'] and Read[r1, r2]",
            children: [{
              location: "Trying to unify variables ['x'] and []",
              message: 'Expected variables [x] and [] to be the same',
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
  })

  describe('effects with multiple quantified variables', () => {
    it('unfies with concrete and unifiable effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update['x'], Read['y', 'z'] & Update['x']) => Read['x', 'y', 'z'] & Update['x']")

      const result = unify(e1, e2)
      const reversedResult = unify(e2, e1)

      assert.isTrue(result.isRight())
      result.map(r => assert.sameDeepMembers(r, [
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: [{ name: 'y', reference: 3n }, { name: 'z', reference: 4n }] } },
        { kind: 'variable', name: 'u', value: { kind: 'concrete', vars: [{ name: 'x', reference: 2n }] } },
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
        { kind: 'variable', name: 'r1', value: { kind: 'concrete', vars: [{ name: 'x', reference: 1n }] } },
        { kind: 'variable', name: 'r2', value: { kind: 'concrete', vars: [{ name: 'y', reference: 2n }] } },
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
      const e1 = parseEffectOrThrow('Temporal[v1, v2]')
      const e2 = parseEffectOrThrow('Temporal[v1]')

      const result = unify(e1, e2)

      result
        .mapLeft(e => assert.deepEqual(e, {
          location: 'Trying to unify Temporal[v1, v2] and Temporal[v1]',
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
