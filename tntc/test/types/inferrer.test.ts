import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { typeToString } from '../../src/IRprinting'
import { inferTypes } from '../../src/types/inferrer'

describe('inferTypes', () => {
  it('infers types for basic expressions', () => {
    const tntModule = buildModuleWithDefs([
      'def a = 1 + 2',
      'def b(x, y) = x + y',
      'def c = val x = 2 { x }',
      'def d(S) = S.map(x => x + 10)',
    ])

    const result = inferTypes(tntModule)
    assert.isTrue(result.isRight())
    result.map(r => {
      const stringTypes = Array.from(r.entries()).map(([id, type]) => [id, typeToString(type)])
      assert.sameDeepMembers(stringTypes, [
        [1n, 'int'],
        [2n, 'int'],
        [3n, 'int'],
        [4n, 'int'],
        [5n, 'int'],
        [6n, 'int'],
        [7n, 'int'],
        [8n, '(int, int) => int'],
        [9n, 'int'],
        [10n, 'int'],
        [11n, 'int'],
        [12n, 'int'],
        [13n, 'int'],
        [14n, 'set(int)'],
        [15n, 'int'],
        [16n, 'int'],
        [17n, 'int'],
        [18n, '(int) => int'],
        [19n, 'set(int)'],
        [20n, '(set(int)) => set(int)'],
      ])
    })
  })

  it('fails when types are not unifiable', () => {
    const tntModule = buildModuleWithDefs([
      'def a = 1.map(x => x + 10)',
    ])

    const result = inferTypes(tntModule)
    assert.isTrue(result.isLeft())
    result.mapLeft(errors => {
      assert.sameDeepMembers([...errors.entries()], [
        [6n, {
          location: 'Trying to unify (set(t2), (t2) => t3) => set(t3) and (int, (int) => int) => t4',
          children: [{
            location: 'Trying to unify set(t2) and int',
            message: "Couldn't unify set and int",
            children: [],
          }],
        }],
      ])
    })
  })
})
