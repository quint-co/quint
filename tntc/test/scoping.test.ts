import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/ir'
import { scopesForId, treeFromModule } from '../src/scoping'

describe('scopesForId', () => {
  const tree = {
    value: 1n,
    children: [
      { value: 2n, children: [] },
      { value: 3n, children: [{ value: 4n, children: [] }] },
    ],
  }

  it('finds scopes for 2', () => {
    assert.deepEqual(scopesForId(tree, 2n), [2n, 1n])
  })

  it('finds scopes for 4', () => {
    assert.deepEqual(scopesForId(tree, 4n), [4n, 3n, 1n])
  })
})

describe('treeFromModule', () => {
  const tntModule = buildModuleWithDefs([
    'var a: int',
    'const B: int',
    'type MY_TYPE = int',
    'assume _ = N > 1',
    'import M.*',
    'module A { var x: int }',
    'module A1 = A(x = 33)',
    'val f = S.filter(x => x + 1)',
    'def l = val x = 2 { x }',
  ])

  it('builds a scope tree', () => {
    assert.deepEqual(treeFromModule(tntModule), {
      value: 30n,
      children: [
        { value: 2n, children: [] },
        { value: 4n, children: [] },
        { value: 6n, children: [] },
        {
          value: 10n,
          children: [
            {
              value: 9n,
              children: [
                { value: 7n, children: [] },
                { value: 8n, children: [] },
              ],
            },
          ],
        },
        { value: 11n, children: [] },
        {
          value: 15n,
          children: [
            { value: 14n, children: [{ value: 13n, children: [] }] },
          ],
        },
        { value: 17n, children: [{ value: 16n, children: [] }] },
        {
          value: 24n,
          children: [
            {
              value: 23n,
              children: [
                { value: 18n, children: [] },
                {
                  value: 22n,
                  children: [
                    {
                      value: 21n,
                      children: [
                        { value: 19n, children: [] },
                        { value: 20n, children: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: 29n,
          children: [
            {
              value: 28n,
              children: [
                {
                  value: 26n,
                  children: [
                    { value: 25n, children: [] },
                  ],
                },
                { value: 27n, children: [] },
              ],
            },
          ],
        },
      ],
    })
  })
})
