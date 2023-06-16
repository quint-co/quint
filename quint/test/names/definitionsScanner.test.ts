import { describe, it } from 'mocha'
import { assert } from 'chai'
import { TypeDefinition, ValueDefinition, newTable } from '../../src/names/definitionsByName'
import { ConflictSource, scanConflicts } from '../../src/names/definitionsScanner'
import { ScopeTree } from '../../src/names/scoping'
import { QuintType } from '../../src/quintTypes'

describe('scanConflicts', () => {
  const myType: QuintType = { id: 100n, kind: 'int' }

  it('finds top-level name conflicts', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name', reference: 2n },
      { kind: 'val', identifier: 'conflicting_name', reference: 3n, scope: 3n },
    ]

    const table = newTable({ valueDefinitions })

    const tree: ScopeTree = {
      value: 0n,
      children: [
        { value: 1n, children: [] },
        { value: 2n, children: [] },
        { value: 3n, children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: 2n },
      { kind: 'user', reference: 3n },
    ]

    result
      .mapLeft(conflicts =>
        assert.deepEqual(conflicts, [{ kind: 'value', identifier: 'conflicting_name', sources: expectedSources }])
      )
      .map(_ => assert.fail('Expected conflicts'))
  })

  it('finds type alias conflicts', () => {
    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType, reference: 2n },
      { identifier: 'MY_TYPE', type: { id: 4n, kind: 'str' }, reference: 3n },
    ]

    const table = newTable({ typeDefinitions })

    const tree: ScopeTree = {
      value: 0n,
      children: [
        { value: 1n, children: [] },
        { value: 2n, children: [] },
        { value: 3n, children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: 2n },
      { kind: 'user', reference: 3n },
    ]

    result
      .mapLeft(conflicts =>
        assert.deepEqual(conflicts, [{ kind: 'type', identifier: 'MY_TYPE', sources: expectedSources }])
      )
      .map(_ => assert.fail('Expected conflicts'))
  })

  it('finds name conflicts within nested scopes', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name', reference: 1n, scope: 1n },
      { kind: 'val', identifier: 'conflicting_name', reference: 2n, scope: 2n },
    ]

    const table = newTable({ valueDefinitions })

    const tree: ScopeTree = { value: 1n, children: [{ value: 2n, children: [] }] }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: 1n },
      { kind: 'user', reference: 2n },
    ]

    result
      .mapLeft(conflicts =>
        assert.deepEqual(conflicts, [{ kind: 'value', identifier: 'conflicting_name', sources: expectedSources }])
      )
      .map(_ => assert.fail('Expected conflicts'))
  })

  it('finds conflicts with built-in definitions', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name' },
      { kind: 'val', identifier: 'conflicting_name', reference: 2n },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType },
      { identifier: 'MY_TYPE', type: myType, reference: 1n },
    ]

    const table = newTable({ valueDefinitions, typeDefinitions })

    const tree: ScopeTree = {
      value: 0n,
      children: [
        { value: 1n, children: [] },
        { value: 2n, children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [{ kind: 'builtin' }, { kind: 'user', reference: 2n }]
    const expectedTypeSources: ConflictSource[] = [{ kind: 'builtin' }, { kind: 'user', reference: 1n }]

    result
      .mapLeft(conflicts =>
        assert.deepEqual(conflicts, [
          { kind: 'value', identifier: 'conflicting_name', sources: expectedSources },
          { kind: 'type', identifier: 'MY_TYPE', sources: expectedTypeSources },
        ])
      )
      .map(_ => assert.fail('Expected conflicts'))
  })

  it('finds no conflicts when there are none', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name', reference: 2n, scope: 2n },
      { kind: 'val', identifier: 'conflicting_name', reference: 3n, scope: 3n },
    ]

    const typeDefinitions: TypeDefinition[] = [{ identifier: 'MY_TYPE', type: myType, reference: 4n }]

    const table = newTable({ valueDefinitions, typeDefinitions })

    const tree: ScopeTree = {
      value: 0n,
      children: [
        { value: 1n, children: [] },
        { value: 2n, children: [] },
        { value: 3n, children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    assert.isTrue(result.isRight())
  })
})
