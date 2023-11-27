import { describe, it } from 'mocha'
import { assert } from 'chai'
import { MultipleUpdatesChecker } from '../../src/effects/MultipleUpdatesChecker'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { quintErrorToString, toScheme } from '../../src'

const checker = new MultipleUpdatesChecker()

describe('checkEffects', () => {
  it('returns empty map for effects with no problems', () => {
    const effects = [
      parseEffectOrThrow("(Read[v1]) => Read[v1] & Update['x']"),
      parseEffectOrThrow("(Update['x', 'y']) => Update['x', 'y']"),
    ].map(toScheme)

    const errors = checker.checkEffects(effects)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
  })

  it('returns a map with errors for all problems', () => {
    const effects = [
      parseEffectOrThrow("(Read[v1]) => Read[v1] & Update['x']"),
      parseEffectOrThrow("(Update['x', 'y']) => Update['x', 'y', 'y']"),
      parseEffectOrThrow("Update['z', 'z', 'z']"),
    ].map(toScheme)

    const errors = checker.checkEffects(effects)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [1n, { code: 'QNT202', message: 'Multiple updates of variable z', reference: 1n, data: {} }],
        [2n, { code: 'QNT202', message: 'Multiple updates of variable z', reference: 2n, data: {} }],
        [3n, { code: 'QNT202', message: 'Multiple updates of variable z', reference: 3n, data: {} }],
        [4n, { code: 'QNT202', message: 'Multiple updates of variable y', reference: 4n, data: {} }],
        [5n, { code: 'QNT202', message: 'Multiple updates of variable y', reference: 5n, data: {} }],
      ]
    )
  })
})
