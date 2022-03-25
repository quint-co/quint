import { describe, it } from 'mocha'
import { assert } from 'chai'
import { NameDefinition, DefinitionTable, TypeDefinition } from '../src/definitionsCollector'
import { scanConflicts } from '../src/definitionsScanner'
import { ScopeTree } from '../src/scoping'

describe('scanConflicts', () => {
  it('finds top-level name conflicts', () => {
    const nameDefinitions: NameDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(0) },
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(1) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(2), scope: BigInt(2) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' }, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = { value: BigInt(0), children: [{ value: BigInt(1) }, { value: BigInt(2) }] }

    const result = scanConflicts(table, tree)

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'operator', identifier: 'conflicting_name', references: [BigInt(1), BigInt(2)] }],
    })
  })

  it('finds type alias conflicts', () => {
    const nameDefinitions: NameDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(0) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' }, reference: BigInt(1) },
      { identifier: 'MY_TYPE', type: { kind: 'str' }, reference: BigInt(2) },
    ]

    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = { value: BigInt(0), children: [{ value: BigInt(1) }, { value: BigInt(2) }] }

    const result = scanConflicts(table, tree)

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'type', identifier: 'MY_TYPE', references: [BigInt(1), BigInt(2)] }],
    })
  })

  it('finds name conflicts within nested scopes', () => {
    const nameDefinitions: NameDefinition[] = [
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(1), scope: BigInt(1) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(2), scope: BigInt(2) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' }, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = { value: BigInt(1), children: [{ value: BigInt(2) }] }

    const result = scanConflicts(table, tree)

    assert.deepEqual(result, {
      kind: 'error',
      conflicts: [{ kind: 'operator', identifier: 'conflicting_name', references: [BigInt(1), BigInt(2)] }],
    })
  })

  it('finds no conflicts when there are none', () => {
    const nameDefinitions: NameDefinition[] = [
      { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(0) },
      { kind: 'def', identifier: 'conflicting_name', reference: BigInt(1), scope: BigInt(1) },
      { kind: 'val', identifier: 'conflicting_name', reference: BigInt(2), scope: BigInt(2) },
    ]

    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' }, reference: BigInt(1) },
      { identifier: 'OTHER_TYPE', type: { kind: 'int' }, reference: BigInt(1) },
    ]

    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const tree: ScopeTree = { value: BigInt(0), children: [{ value: BigInt(1) }, { value: BigInt(2) }] }

    const result = scanConflicts(table, tree)

    assert.deepEqual(result, { kind: 'ok' })
  })
})
