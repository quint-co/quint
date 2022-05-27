import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseEffect } from '../../src/effects/parser'
import { emptyVariables } from '../../src/effects/base'

describe('parseEffect', () => {
  it('parses read and update effect', () => {
    const effect = parseEffect("Read['x', 'y'] & Update[v]")

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'concrete',
        read: { kind: 'concrete', vars: ['x', 'y'] },
        update: { kind: 'quantification', name: 'v' },
      })
    }
  })

  it('parses arrow effect', () => {
    const effect = parseEffect('(Read[v]) => Update[v]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        effects: [
          {
            kind: 'concrete',
            read: { kind: 'quantification', name: 'v' },
            update: { kind: 'concrete', vars: [] },
          },
          {
            kind: 'concrete',
            read: { kind: 'concrete', vars: [] },
            update: { kind: 'quantification', name: 'v' },
          },
        ],
      })
    }
  })

  it('parses nested arrow effect', () => {
    const effect = parseEffect('((Pure) => Read[v], (Pure) => E) => Update[v]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        effects: [
          {
            kind: 'arrow',
            effects: [
              { kind: 'concrete', read: emptyVariables, update: emptyVariables },
              { kind: 'concrete', read: { kind: 'quantification', name: 'v' }, update: emptyVariables },
            ],
          },
          {
            kind: 'arrow',
            effects: [
              { kind: 'concrete', read: emptyVariables, update: emptyVariables },
              { kind: 'var', name: 'E' },
            ],
          },
          {
            kind: 'concrete',
            read: { kind: 'concrete', vars: [] },
            update: { kind: 'quantification', name: 'v' },
          },
        ],
      })
    }
  })

  it('parses union effect', () => {
    const effect = parseEffect('(Read[v, w]) => Update[v]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        effects: [
          {
            kind: 'concrete',
            read: { kind: 'union', variables: [{ kind: 'quantification', name: 'v' }, { kind: 'quantification', name: 'w' }] },
            update: { kind: 'concrete', vars: [] },
          },
          {
            kind: 'concrete',
            read: { kind: 'concrete', vars: [] },
            update: { kind: 'quantification', name: 'v' },
          },
        ],
      })
    }
  })

})
