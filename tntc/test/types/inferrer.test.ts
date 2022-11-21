import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { inferTypes } from '../../src/types/inferrer'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { typeSchemeToString } from '../../src/types/printing'
import { errorTreeToString } from '../../src/errorTree'

describe('inferTypes', () => {
  // Names are mocked without scope to keep tests simple
  // Be careful not to use the same name twice in different scopes
  const table: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'param', identifier: 'p', reference: 1n },
      { kind: 'param', identifier: 'q', reference: 2n },
      { kind: 'const', identifier: 'N', reference: 3n },
      { kind: 'var', identifier: 'x', reference: 3n },
      { kind: 'var', identifier: 'y', reference: 5n },
      { kind: 'val', identifier: 'm', reference: 6n },
      { kind: 'val', identifier: 't', reference: 7n },
      { kind: 'val', identifier: 'a', reference: 8n },
      { kind: 'def', identifier: 'b', reference: 9n },
      { kind: 'val', identifier: 'c', reference: 10n },
      { kind: 'def', identifier: 'd', reference: 11n },
      { kind: 'param', identifier: 'S', reference: 12n },
      { kind: 'param', identifier: 'f', reference: 13n },
      { kind: 'param', identifier: 'g', reference: 14n },
      { kind: 'def', identifier: 'e', reference: 18n },
    ],
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

  it('infers types for basic expressions', () => {
    const tntModule = buildModuleWithDefs([
      'def a = 1 + 2',
      'def b(p, q) = p + q',
      'val c = val m = 2 { m }',
      'def d(S) = S.map(p => p + 10)',
    ])

    const [errors, types] = inferTypes(tntModule, definitionsTable)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
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
      [14n, 'Set[int]'],
      [15n, 'int'],
      [16n, 'int'],
      [17n, 'int'],
      [18n, '(int) => int'],
      [19n, 'Set[int]'],
      [20n, '(Set[int]) => Set[int]'],
    ])
  })

  it('infers types for high-order operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(f, p) = f(p)',
      'def b(g, q) = g(q) + g(not(q))',
    ])

    const [errors, types] = inferTypes(tntModule, definitionsTable)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [1n, '∀ t0 . t0'],
      [2n, '∀ t0 . t0'],
      [3n, '∀ t0, t1 . ((t0) => t1, t0) => t1'],
      [4n, 'bool'],
      [5n, 'int'],
      [6n, 'bool'],
      [7n, 'bool'],
      [8n, 'int'],
      [9n, 'int'],
      [10n, '((bool) => int, bool) => int'],
    ])
  })

  it('infers types for records', () => {
    const tntModule = buildModuleWithDefs([
      'var x: { f1: int | r1 }',
      'val m = Set(x, { f1: 1, f2: true })',
      'def e(p) = x.with("f1", p.f1)',
      'val a = e({ f1: 2 }).fieldNames()',
    ])

    const [errors, types] = inferTypes(tntModule, definitionsTable)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [3n, '{ f1: int, f2: bool }'],
      [4n, '{ f1: int, f2: bool }'],
      [5n, 'int'],
      [6n, 'bool'],
      [7n, 'str'],
      [8n, 'str'],
      [9n, '{ f1: int, f2: bool }'],
      [10n, 'Set[{ f1: int, f2: bool }]'],
      [11n, 'Set[{ f1: int, f2: bool }]'],
      [12n, '{ f1: int, f2: bool }'],
      [13n, 'str'],
      [14n, '∀ r0 . { f1: int | r0 }'],
      [15n, 'str'],
      [16n, 'int'],
      [17n, '{ f1: int, f2: bool }'],
      [18n, '∀ r0 . ({ f1: int | r0 }) => { f1: int, f2: bool }'],
      [19n, 'int'],
      [20n, 'str'],
      [21n, '{ f1: int }'],
      [22n, '{ f1: int, f2: bool }'],
      [23n, 'Set[str]'],
      [24n, 'Set[str]'],
    ])
  })

  it('fails when types are not unifiable', () => {
    const tntModule = buildModuleWithDefs([
      'def a = 1.map(p => p + 10)',
    ])

    const [errors] = inferTypes(tntModule, definitionsTable)

    assert.sameDeepMembers([...errors.entries()], [
      [6n, {
        location: 'Trying to unify (Set[t1], (t1) => t2) => Set[t2] and (int, (int) => int) => t3',
        children: [{
          location: 'Trying to unify Set[t1] and int',
          message: "Couldn't unify set and int",
          children: [],
        }],
      }],
    ])
  })
})
