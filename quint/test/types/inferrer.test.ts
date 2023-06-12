import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { TypeInferenceResult, TypeInferrer } from '../../src/types/inferrer'
import { DefinitionsByName, mergeTables, newTable } from '../../src/definitionsByName'
import { typeSchemeToString } from '../../src/types/printing'
import { errorTreeToString } from '../../src/errorTree'
import { collectDefinitions } from '../../src/definitionsCollector'
import { QuintModule } from '../../src/quintIr'
import { resolveNames } from '../../src/nameResolver'
import { treeFromModule } from '../../src/scoping'

describe('inferTypes', () => {
  const table: DefinitionsByName = newTable({
    valueDefinitions: [
      { kind: 'const', identifier: 'N', reference: 3n },
      { kind: 'var', identifier: 'x', reference: 3n },
      { kind: 'var', identifier: 'y', reference: 5n },
    ],
  })

  function inferTypesForModule(quintModule: QuintModule): TypeInferenceResult {
    const mergedTable = mergeTables(collectDefinitions(quintModule), table)
    const lookupTable = resolveNames(quintModule, mergedTable, treeFromModule(quintModule))
    if (lookupTable.isLeft()) {
      throw new Error('Failed to resolve names in mocked up module')
    }

    const inferrer = new TypeInferrer(lookupTable.value)
    return inferrer.inferTypes(quintModule.defs)
  }

  it('infers types for basic expressions', () => {
    const quintModule = buildModuleWithDefs([
      'def a = 1 + 2',
      'def b(p, q) = p + q',
      'val c = val m = 2 { m }',
      'def d(S) = S.map(p => p + 10)',
    ])

    const [errors, types] = inferTypesForModule(quintModule)
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
      [8n, 'int'],
      [9n, 'int'],
      [10n, '(int, int) => int'],
      [11n, 'int'],
      [12n, 'int'],
      [13n, 'int'],
      [14n, 'int'],
      [15n, 'int'],
      [16n, 'Set[int]'],
      [17n, 'Set[int]'],
      [18n, 'int'],
      [19n, 'int'],
      [20n, 'int'],
      [21n, 'int'],
      [22n, '(int) => int'],
      [23n, 'Set[int]'],
      [24n, '(Set[int]) => Set[int]'],
    ])
  })

  it('infers types for high-order operators', () => {
    const quintModule = buildModuleWithDefs(['def a(f, p) = f(p)', 'def b(g, q) = g(q) + g(not(q))'])

    const [errors, types] = inferTypesForModule(quintModule)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [1n, '∀ t0, t1 . (t0) => t1'],
      [2n, '∀ t0 . t0'],
      [3n, '∀ t0 . t0'],
      [4n, '∀ t0 . t0'],
      [5n, '∀ t0, t1 . ((t0) => t1, t0) => t1'],
      [6n, '(bool) => int'],
      [7n, 'bool'],
      [8n, 'bool'],
      [9n, 'int'],
      [10n, 'bool'],
      [11n, 'bool'],
      [12n, 'int'],
      [13n, 'int'],
      [14n, '((bool) => int, bool) => int'],
    ])
  })

  it('infers types for records', () => {
    const quintModule = buildModuleWithDefs([
      'var x: { f1: int, f2: bool }',
      'val m = Set(x, { f1: 1, f2: true })',
      'def e(p) = x.with("f1", p.f1)',
      'val a = e({ f1: 2 }).fieldNames()',
    ])

    const [errors, types] = inferTypesForModule(quintModule)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [4n, '{ f1: int, f2: bool }'],
      [5n, '{ f1: int, f2: bool }'],
      [6n, 'int'],
      [7n, 'str'],
      [8n, 'bool'],
      [9n, 'str'],
      [10n, '{ f1: int, f2: bool }'],
      [11n, 'Set[{ f1: int, f2: bool }]'],
      [12n, 'Set[{ f1: int, f2: bool }]'],
      [13n, '∀ r0 . { f1: int | r0 }'],
      [14n, '{ f1: int, f2: bool }'],
      [15n, 'str'],
      [16n, '∀ r0 . { f1: int | r0 }'],
      [17n, 'str'],
      [18n, 'int'],
      [19n, '{ f1: int, f2: bool }'],
      [20n, '∀ r0 . ({ f1: int | r0 }) => { f1: int, f2: bool }'],
      [21n, 'int'],
      [22n, 'str'],
      [23n, '{ f1: int }'],
      [24n, '{ f1: int, f2: bool }'],
      [25n, 'Set[str]'],
      [26n, 'Set[str]'],
    ])
  })

  it('infers types for tuples', () => {
    const quintModule = buildModuleWithDefs(['def e(p, q) = (p._1, q._2)'])

    const [errors, types] = inferTypesForModule(quintModule)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [1n, '∀ t0, r0 . (t0 | r0)'],
      [2n, '∀ t0, t1, r0 . (t0, t1 | r0)'],
      [3n, '∀ t0, r0 . (t0 | r0)'],
      [4n, 'int'],
      [5n, '∀ t0 . t0'],
      [6n, '∀ t0, t1, r0 . (t0, t1 | r0)'],
      [7n, 'int'],
      [8n, '∀ t0 . t0'],
      [9n, '∀ t0, t1 . (t0, t1)'],
      [10n, '∀ t0, t1, t2, r0, r1 . ((t0 | r0), (t1, t2 | r1)) => (t0, t2)'],
    ])
  })

  it('considers annotations', () => {
    const quintModule = buildModuleWithDefs(['def e(p): (int) => int = p'])

    const [errors, types] = inferTypesForModule(quintModule)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.sameDeepMembers(stringTypes, [
      [1n, 'int'],
      [5n, 'int'],
      [6n, '(int) => int'],
    ])
  })

  it('checks annotations', () => {
    const quintModule = buildModuleWithDefs(['def e(p): (t) => t = p + 1'])

    const [errors] = inferTypesForModule(quintModule)
    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          4n,
          {
            location: 'Checking type annotation (t) => t',
            children: [
              {
                location: 'Checking variable t',
                message: 'Type annotation is too general: t should be int',
                children: [],
              },
            ],
          },
        ],
      ]
    )
  })

  it('fails when types are not unifiable', () => {
    const quintModule = buildModuleWithDefs(['def a = 1.map(p => p + 10)'])

    const [errors] = inferTypesForModule(quintModule)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          7n,
          {
            location: 'Trying to unify (Set[t1], (t1) => t2) => Set[t2] and (int, (int) => int) => t3',
            children: [
              {
                location: 'Trying to unify Set[t1] and int',
                message: "Couldn't unify set and int",
                children: [],
              },
            ],
          },
        ],
      ]
    )
  })
})
