import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseEffect } from '../../src/effects/parser'

describe('parseEffect', () => {
  it('parses read and update effect', () => {
    const effect = parseEffect("Read['x', 'y'] & Update[v]")

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      const { value } = effect
      assert.deepEqual(value, {
        kind: 'concrete',
        components: [
          {
            kind: 'read',
            entity: {
              kind: 'concrete',
              stateVariables: [
                { name: 'x', reference: 1n },
                { name: 'y', reference: 2n },
              ],
            },
          },
          { kind: 'update', entity: { kind: 'variable', name: 'v' } },
        ],
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
        components: [
          {
            kind: 'read',
            entity: {
              kind: 'concrete',
              stateVariables: [
                { name: 'x', reference: 1n },
                { name: 'y', reference: 2n },
              ],
            },
          },
          { kind: 'temporal', entity: { kind: 'variable', name: 'v' } },
        ],
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
        components: [
          {
            kind: 'temporal',
            entity: { kind: 'variable', name: 'v' },
          },
        ],
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
            components: [
              {
                kind: 'read',
                entity: { kind: 'variable', name: 'v' },
              },
            ],
          },
        ],
        result: {
          kind: 'concrete',
          components: [
            {
              kind: 'update',
              entity: { kind: 'variable', name: 'v' },
            },
          ],
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
            params: [{ kind: 'concrete', components: [] }],
            result: {
              kind: 'concrete',
              components: [
                {
                  kind: 'read',
                  entity: { kind: 'variable', name: 'v' },
                },
              ],
            },
          },
          {
            kind: 'arrow',
            params: [{ kind: 'concrete', components: [] }],
            result: { kind: 'variable', name: 'E' },
          },
        ],
        result: {
          kind: 'concrete',
          components: [
            {
              kind: 'update',
              entity: { kind: 'variable', name: 'v' },
            },
          ],
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
            components: [
              {
                kind: 'read',
                entity: {
                  kind: 'union',
                  entities: [
                    { kind: 'variable', name: 'v' },
                    { kind: 'variable', name: 'w' },
                  ],
                },
              },
            ],
          },
        ],
        result: {
          kind: 'concrete',
          components: [
            {
              kind: 'update',
              entity: { kind: 'variable', name: 'v' },
            },
          ],
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
            components: [
              {
                kind: 'read',
                entity: {
                  kind: 'union',
                  entities: [
                    { kind: 'variable', name: 'v' },
                    { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }] },
                  ],
                },
              },
            ],
          },
        ],
        result: {
          kind: 'concrete',
          components: [
            {
              kind: 'update',
              entity: {
                kind: 'union',
                entities: [
                  { kind: 'variable', name: 'v' },
                  { kind: 'concrete', stateVariables: [{ name: 'y', reference: 2n }] },
                ],
              },
            },
          ],
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
          components: [
            {
              kind: 'update',
              entity: { kind: 'variable', name: 'v' },
            },
          ],
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
            components: [
              {
                kind: 'read',
                entity: { kind: 'concrete', stateVariables: [] },
              },
            ],
          },
        ],
        result: {
          kind: 'concrete',
          components: [
            {
              kind: 'update',
              entity: { kind: 'concrete', stateVariables: [] },
            },
          ],
        },
      })
    }
  })

  it('parses two components of the same kind', () => {
    // Previously rejected by the hardcoded two-way grammar; now valid.
    const effect = parseEffect('Read[v] & Read[w]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      assert.deepEqual(effect.value, {
        kind: 'concrete',
        components: [
          { kind: 'read', entity: { kind: 'variable', name: 'v' } },
          { kind: 'read', entity: { kind: 'variable', name: 'w' } },
        ],
      })
    }
  })

  it('parses three-way Read & Update & Temporal combination', () => {
    const effect = parseEffect('Read[r] & Update[u] & Temporal[t]')

    assert.isTrue(effect.isRight())
    if (effect.isRight()) {
      assert.deepEqual(effect.value, {
        kind: 'concrete',
        components: [
          { kind: 'read', entity: { kind: 'variable', name: 'r' } },
          { kind: 'update', entity: { kind: 'variable', name: 'u' } },
          { kind: 'temporal', entity: { kind: 'variable', name: 't' } },
        ],
      })
    }
  })

  it('throws error when effect is invalid', () => {
    // Trailing & with no following component is a parse error
    const effect = parseEffect('Read[v] &')

    assert.isTrue(effect.isLeft())
  })
})
