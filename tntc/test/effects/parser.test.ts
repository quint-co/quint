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
        update: { kind: 'quantified', name: 'v' },
        temporal: emptyVariables,
      })
    }
  })

  it('parses read and temporal effect', () => {
    const effect = parseEffect("Read['x', 'y'] & Temporal[v]")

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'concrete',
        read: { kind: 'concrete', vars: ['x', 'y'] },
        update: emptyVariables,
        temporal: { kind: 'quantified', name: 'v' },
      })
    }
  })

  it('parses temporal effect', () => {
    const effect = parseEffect('Temporal[v]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'concrete',
        read: emptyVariables,
        update: emptyVariables,
        temporal: { kind: 'quantified', name: 'v' },
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
        params: [
          {
            kind: 'concrete',
            read: { kind: 'quantified', name: 'v' },
            update: emptyVariables,
            temporal: emptyVariables,
          },
        ],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: { kind: 'quantified', name: 'v' },
          temporal: emptyVariables,
        },
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
        params: [
          {
            kind: 'arrow',
            params: [
              { kind: 'concrete', read: emptyVariables, update: emptyVariables, temporal: emptyVariables },
            ],
            result: { kind: 'concrete', read: { kind: 'quantified', name: 'v' }, update: emptyVariables, temporal: emptyVariables },
          },
          {
            kind: 'arrow',
            params: [
              { kind: 'concrete', read: emptyVariables, update: emptyVariables, temporal: emptyVariables },
            ],
            result: { kind: 'quantified', name: 'E' },
          },
        ],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: { kind: 'quantified', name: 'v' },
          temporal: emptyVariables,
        },
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
        params: [
          {
            kind: 'concrete',
            read: { kind: 'union', variables: [{ kind: 'quantified', name: 'v' }, { kind: 'quantified', name: 'w' }] },
            update: emptyVariables,
            temporal: emptyVariables,
          },
        ],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: { kind: 'quantified', name: 'v' },
          temporal: emptyVariables,
        },
      })
    }
  })

  it('parses union effect with concrete vars', () => {
    const effect = parseEffect("(Read[v, 'x']) => Update[v, 'y']")

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        params: [
          {
            kind: 'concrete',
            read: { kind: 'union', variables: [{ kind: 'quantified', name: 'v' }, { kind: 'concrete', vars: ['x'] }] },
            update: emptyVariables,
            temporal: emptyVariables,
          },
        ],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: { kind: 'union', variables: [{ kind: 'quantified', name: 'v' }, { kind: 'concrete', vars: ['y'] }] },
          temporal: emptyVariables,
        },
      })
    }
  })

  it('parses arrow effect with empty args', () => {
    const effect = parseEffect('() => Update[v]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        params: [],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: { kind: 'quantified', name: 'v' },
          temporal: emptyVariables,
        },
      })
    }
  })

  it('parses concrete effects with empty vars', () => {
    const effect = parseEffect('(Read[]) => Update[]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'arrow',
        params: [
          {
            kind: 'concrete',
            read: emptyVariables,
            update: emptyVariables,
            temporal: emptyVariables,
          },
        ],
        result: {
          kind: 'concrete',
          read: emptyVariables,
          update: emptyVariables,
          temporal: emptyVariables,
        },
      })
    }
  })

  it('throws error when effect is invalid', () => {
    const effect = parseEffect('Read[v] & Read[w]')

    assert.isTrue(effect.isLeft())
    if (effect.isLeft()) {
      const { value } = effect
      assert.sameDeepMembers(value, [
        {
          explanation: "no viable alternative at input 'Read[v]&Read'",
          locs: [{ start: { line: 0, col: 10, index: 10 }, end: { line: 0, col: 13, index: 13 } }],
        },
      ])
    }
  })
})
