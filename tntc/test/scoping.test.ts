import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/ir'
import { scopesForId, treeFromModule } from '../src/scoping'

describe('scopesForId', () => {
  const tree = {
    value: BigInt(1),
    children: [
      { value: BigInt(2), children: [] },
      { value: BigInt(3), children: [{ value: BigInt(4), children: [] }] },
    ],
  }

  it('finds scopes for 2', () => {
    assert.deepEqual(scopesForId(tree, BigInt(2)), [BigInt(2), BigInt(1)])
  })

  it('finds scopes for 4', () => {
    assert.deepEqual(scopesForId(tree, BigInt(4)), [BigInt(4), BigInt(3), BigInt(1)])
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
    'val f = S.filter(x -> x + 1)',
    'def l = val x = 2 { x }',
  ])

  it('builds a scope tree', () => {
    assert.deepEqual(treeFromModule(tntModule), {
      value: BigInt(30),
      children: [
        { value: BigInt(2), children: [] },
        { value: BigInt(4), children: [] },
        { value: BigInt(6), children: [] },
        { value: BigInt(10), children: [] },
        { value: BigInt(11), children: [] },
        {
          value: BigInt(15),
          children: [
            { value: BigInt(14), children: [{ value: BigInt(13), children: [] }] },
          ],
        },
        { value: BigInt(17), children: [{ value: BigInt(16), children: [] }] },
        {
          value: BigInt(24),
          children: [
            {
              value: BigInt(23),
              children: [
                { value: BigInt(18), children: [] },
                {
                  value: BigInt(22),
                  children: [
                    {
                      value: BigInt(21),
                      children: [
                        { value: BigInt(19), children: [] },
                        { value: BigInt(20), children: [] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: BigInt(29),
          children: [
            {
              value: BigInt(28),
              children: [
                {
                  value: BigInt(26),
                  children: [
                    { value: BigInt(25), children: [] },
                  ],
                },
                { value: BigInt(27), children: [] },
              ],
            },
          ],
        },
      ],
    })
  })
})
