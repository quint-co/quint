import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/modules'
import { scopesForId, treeFromModule } from '../src/scoping'

describe('scopesForId', () => {
  const tree = {
    value: BigInt(1),
    children: [
      { value: BigInt(2) },
      { value: BigInt(3), children: [{ value: BigInt(4) }] },
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
      value: BigInt(26),
      children: [
        { value: BigInt(1) },
        { value: BigInt(2) },
        { value: BigInt(3) },
        { value: BigInt(7) },
        { value: BigInt(8) },
        {
          value: BigInt(11),
          children: [
            { value: BigInt(10), children: [{ value: BigInt(9) }] },
          ],
        },
        { value: BigInt(13), children: [{ value: BigInt(12) }] },
        {
          value: BigInt(20),
          children: [
            {
              value: BigInt(19),
              children: [
                { value: BigInt(14) },
                {
                  value: BigInt(18),
                  children: [
                    {
                      value: BigInt(17),
                      children: [
                        { value: BigInt(15) },
                        { value: BigInt(16) },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: BigInt(25),
          children: [
            {
              value: BigInt(24),
              children: [
                {
                  value: BigInt(22),
                  children: [
                    { value: BigInt(21) },
                  ],
                },
                { value: BigInt(23) },
              ],
            },
          ],
        },
      ],
    })
  })
})
