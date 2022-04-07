import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ValueDefinition, DefinitionTable, TypeDefinition } from '../src/definitionsCollector'
import { ConflictSource, scanConflicts } from '../src/definitionsScanner'
import { ScopeTree } from '../src/scoping'
import { TntType } from '../src/tntTypes'

describe('scanConflicts', () => {
  const myType: TntType = { id: BigInt(100), kind: 'int' }

  it('finds top-level name conflicts', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(1) },
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(2) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(3), scope: BigInt(3) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = {
      value: BigInt(0),
      children: [
        { value: BigInt(1), children: [] },
        { value: BigInt(2), children: [] },
        { value: BigInt(3), children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: BigInt(2) },
      { kind: 'user', reference: BigInt(3) },
    ]

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'value', identifier: 'conflicting_name', sources: expectedSources }],
    })
  })

  it('finds type alias conflicts', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(1) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType, reference: BigInt(2) },
      { identifier: 'MY_TYPE', type: { id: BigInt(4), kind: 'str' }, reference: BigInt(3) },
    ]

    const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = {
      value: BigInt(0),
      children: [
        { value: BigInt(1), children: [] },
        { value: BigInt(2), children: [] },
        { value: BigInt(3), children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: BigInt(2) },
      { kind: 'user', reference: BigInt(3) },
    ]

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'type', identifier: 'MY_TYPE', sources: expectedSources }],
    })
  })

  it('finds name conflicts within nested scopes', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(1), scope: BigInt(1) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(2), scope: BigInt(2) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = { value: BigInt(1), children: [{ value: BigInt(2), children: [] }] }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'user', reference: BigInt(1) },
      { kind: 'user', reference: BigInt(2) },
    ]

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'value', identifier: 'conflicting_name', sources: expectedSources }],
    })
  })

  it('finds conflicts with built-in definitions', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name' },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(2) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType },
      { identifier: 'MY_TYPE', type: myType, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = {
      value: BigInt(0),
      children: [
        { value: BigInt(1), children: [] },
        { value: BigInt(2), children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    const expectedSources: ConflictSource[] = [
      { kind: 'builtin' },
      { kind: 'user', reference: BigInt(2) },
    ]
    const expectedTypeSources: ConflictSource[] = [
      { kind: 'builtin' },
      { kind: 'user', reference: BigInt(1) },
    ]

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [
        { kind: 'value', identifier: 'conflicting_name', sources: expectedSources },
        { kind: 'type', identifier: 'MY_TYPE', sources: expectedTypeSources },
      ],
    })
  })

  it('finds no conflicts when there are none', () => {
    const valueDefinitions: ValueDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(1) },
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(2), scope: BigInt(2) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(3), scope: BigInt(3) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: myType, reference: BigInt(4) },
      { identifier: 'OTHER_TYPE', type: myType, reference: BigInt(5) },
    ]

    const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = {
      value: BigInt(0),
      children: [
        { value: BigInt(1), children: [] },
        { value: BigInt(2), children: [] },
        { value: BigInt(3), children: [] },
      ],
    }

    const result = scanConflicts(table, tree)

    assert.deepEqual(result, { kind: 'ok' })
  })
})
