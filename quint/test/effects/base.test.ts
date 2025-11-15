import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Effect, unify } from '../../src/effects/base'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { substitutionsToString } from '../../src'

describe('unify', () => {
  describe('simple effects', () => {
    it('unifies temporal effects', () => {
      const e1 = parseEffectOrThrow('Temporal[t1]')
      const e2 = parseEffectOrThrow("Temporal['x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [
          { kind: 'entity', name: 't1', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }] } },
        ])
      )
    })

    it('returns error unifying temporal and update effects', () => {
      const e1 = parseEffectOrThrow("Update['x']")
      const e2 = parseEffectOrThrow("Temporal['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location: "Trying to unify Update['x'] and Temporal['y']",
          children: [
            {
              location: "Trying to unify entities ['x'] and []",
              message: 'Expected [x] and [] to be the same',
              children: [],
            },
          ],
        })
      )
    })

    it('returns error unifying temporal and pure effects', () => {
      const e1 = parseEffectOrThrow('Pure')
      const e2 = parseEffectOrThrow("Temporal['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location: "Trying to unify Pure and Temporal['y']",
          children: [
            {
              location: "Trying to unify entities ['y'] and []",
              message: 'Expected [y] and [] to be the same',
              children: [],
            },
          ],
        })
      )
    })

    it('unifies entities with different orders', () => {
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
            entity: {
              kind: 'union',
              entities: [
                {
                  kind: 'union',
                  entities: [
                    { kind: 'variable', name: 'r1' },
                    { kind: 'variable', name: 'r2' },
                  ],
                },
                {
                  kind: 'concrete',
                  stateVariables: [
                    { name: 'x', reference: 1n },
                    { name: 'y', reference: 2n },
                  ],
                },
              ],
            },
          },
        ],
      }

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [
          {
            kind: 'effect',
            name: 'E',
            value: parseEffectOrThrow("Read[r1, r2, 'x', 'y']"),
          },
        ])
      )
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
      result.map(r =>
        assert.sameDeepMembers(r, [
          { kind: 'entity', name: 'v', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }] } },
          { kind: 'effect', name: 'E', value: parseEffectOrThrow("Update['x']") },
        ])
      )
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

    it('returns error when there are not enough parameters', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("() => Update['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location: "Trying to unify (Read[v]) => Update[v] and () => Update['y']",
          message: 'Expected 1 arguments, got 0',
          children: [],
        })
      )
    })

    it('returns error when trying to unify with non-arrow effect', () => {
      const e1 = parseEffectOrThrow('(Read[v]) => Update[v]')
      const e2 = parseEffectOrThrow("Update['y']")

      const result = unify(e1, e2)

      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location: "Trying to unify (Read[v]) => Update[v] and Update['y']",
          message: "Can't unify different types of effects",
          children: [],
        })
      )
    })
  })

  describe('nested arrow effects', () => {
    it('unifies effects with parameters', () => {
      const e1 = parseEffectOrThrow('((Pure) => E) => E')
      const e2 = parseEffectOrThrow("((Pure) => Read['x']) => Read['x']")

      const result = unify(e1, e2)

      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [{ kind: 'effect', name: 'E', value: parseEffectOrThrow("Read['x']") }])
      )
    })
  })

  describe('effects with multiple variable entities', () => {
    it('unfies with concrete and unifiable effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow(
        "(Read['x'] & Update['x'], Read['y', 'z'] & Update['x']) => Read['x', 'y', 'z'] & Update['x']"
      )

      const result = unify(e1, e2)
      const reversedResult = unify(e2, e1)

      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [
          { kind: 'entity', name: 'r1', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }] } },
          {
            kind: 'entity',
            name: 'r2',
            value: {
              kind: 'concrete',
              stateVariables: [
                { name: 'y', reference: 3n },
                { name: 'z', reference: 4n },
              ],
            },
          },
          { kind: 'entity', name: 'u', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 2n }] } },
        ])
      )
      assert.deepEqual(result, reversedResult, 'Result should be the same regardless of the effect order in parameters')
    })

    it('returns error with incompatible effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update['x'], Read['y'] & Update['y']) => E")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location:
            "Trying to unify (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u] and (Read['x'] & Update['x'], Read['y'] & Update['y']) => E",
          children: [
            {
              location: "Trying to unify Read[r2] & Update['x'] and Read['y'] & Update['y']",
              children: [
                {
                  location: "Trying to unify entities ['x'] and ['y']",
                  message: 'Expected [x] and [y] to be the same',
                  children: [],
                },
              ],
            },
          ],
        })
      )
    })

    it('returns partial bindings when unifying with another variable effect', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['x'] & Update[v], Read['y'] & Update[v]) => Read['x', 'y'] & Update[v]")

      const result = unify(e1, e2)
      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [
          { kind: 'entity', name: 'r1', value: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }] } },
          { kind: 'entity', name: 'r2', value: { kind: 'concrete', stateVariables: [{ name: 'y', reference: 2n }] } },
          { kind: 'entity', name: 'u', value: { kind: 'variable', name: 'v' } },
        ])
      )
    })

    it('simplifies unions of entities before giving up on unifying them', () => {
      const e1 = parseEffectOrThrow("Read[r1, r2, 'x']")
      const e2 = parseEffectOrThrow("Read[r1, 'x']")

      const result = unify(e1, e2)
      assert.isTrue(result.isRight())
      result.map(r =>
        assert.sameDeepMembers(r, [{ kind: 'entity', name: 'r2', value: { kind: 'concrete', stateVariables: [] } }])
      )
    })

    it('returns error with effect with incompatible entity variables', () => {
      const e1 = parseEffectOrThrow('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]')
      const e2 = parseEffectOrThrow("(Read['y'] & Update['x'], Read['z'] & Update['x']) => Read['y'] & Update[u]")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location:
            "Trying to unify (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u] and (Read['y'] & Update['x'], Read['z'] & Update['x']) => Read['y'] & Update[u]",
          children: [
            {
              location: "Trying to unify Read['y', 'z'] & Update['x'] and Read['y'] & Update['x']",
              children: [
                {
                  location: "Trying to unify entities ['y', 'z'] and ['y']",
                  message: 'Expected [y,z] and [y] to be the same',
                  children: [],
                },
              ],
            },
          ],
        })
      )
    })

    it('returns error when unifying union with another union', () => {
      const e1 = parseEffectOrThrow('Read[r1, r2]')
      const e2 = parseEffectOrThrow("Read[r, 'x', 'y']")

      const result = unify(e1, e2)
      assert.isTrue(result.isLeft())
      result.mapLeft(r =>
        assert.deepEqual(r, {
          location: "Trying to unify Read[r1, r2] and Read[r, 'x', 'y']",
          children: [
            {
              location: "Trying to unify entities [r1, r2] and [r, 'x', 'y']",
              message: 'Unification for unions of entities is not implemented',
              children: [],
            },
          ],
        })
      )
    })

    it('returns error when effect names are cyclical', () => {
      const e1 = parseEffectOrThrow('e1')
      const e2 = parseEffectOrThrow('() => e1')

      const result = unify(e1, e2)

      result.mapLeft(e =>
        assert.deepEqual(e, {
          location: 'Trying to unify e1 and () => e1',
          message: "Can't bind e1 to () => e1: cyclical binding",
          children: [],
        })
      )

      assert.isTrue(result.isLeft())
    })

    it('returns error when effect names are cyclical in other way', () => {
      const e1 = parseEffectOrThrow('() => e1')
      const e2 = parseEffectOrThrow('e1')

      const result = unify(e1, e2)

      result.mapLeft(e =>
        assert.deepEqual(e, {
          location: 'Trying to unify () => e1 and e1',
          message: "Can't bind e1 to () => e1: cyclical binding",
          children: [],
        })
      )

      assert.isTrue(result.isLeft())
    })

    it('can unify entities when a single variable in the lhs appears in a union on the rhs', () => {
      // E.g., given the unification problem
      //
      //    v1 =.= v1 ∪ v2
      //
      // We should be able to form a valid substitution iff v1 =.= v2, since
      // this then simplifies to
      //
      //   v1 =.= v1 =.= v2
      //
      // NOTE: This test was inverted after an incorrect occurs check was
      // causing erroneous effect checking failures, as reported in
      // https://github.com/informalsystems/quint/issues/1356
      //
      // Occurs checks are called for to prevent the attempt to unify a free
      // variable with a term that includes that variable as a subterm. E.g., `X
      // =.= foo(a, X)`, which can never be resolved into a ground term.
      // However, despite appearances, the unification of so called "entity
      // unions", as in the example above is not such a case. Each "entity
      // variable" stands for a set of possible state variables. As such, the
      // unification problem above can be expanded to
      //
      //     v1 ∪ {} =.= v1 ∪ v2 ∪ {}
      //
      // Which helps make clear why the unification succeeds iff v1 =.= v2.
      const read1 = parseEffectOrThrow('Read[v1]')
      const read2 = parseEffectOrThrow('Read[v1, v2]')
      assert.isTrue(unify(read1, read2).isRight())

      // Check the symmetrical case.
      const temporal1 = parseEffectOrThrow('Temporal[v1, v2]')
      const temporal2 = parseEffectOrThrow('Temporal[v1]')
      assert.isTrue(unify(temporal1, temporal2).isRight())
    })
  })
})
