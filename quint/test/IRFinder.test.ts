import { assert } from 'chai'
import { describe, it } from 'mocha'
import { findDefinitionWithId, findExpressionWithId, findTypeWithId } from '../src/IRFinder'
import { buildModuleWithDefs, buildModuleWithExpressions } from './builders/ir'

describe('findExpressionWithId', () => {
  const modules = [buildModuleWithExpressions(['Nat'])]

  it('finds expression for existing id', () => {
    const expr = findExpressionWithId(modules, 1n)

    assert.isDefined(expr)
    assert.deepEqual(expr, { id: 1n, kind: 'name', name: 'Nat' })
  })

  it('returns undefined for inexisting id', () => {
    const expr = findExpressionWithId(modules, 99n)

    assert.isUndefined(expr)
  })
})

describe('findTypeWithId', () => {
  const modules = [buildModuleWithDefs(['const N: MY_TYPE'])]

  it('finds type for existing id', () => {
    const type = findTypeWithId(modules, 1n)

    assert.isDefined(type)
    assert.deepEqual(type, { id: 1n, kind: 'const', name: 'MY_TYPE' })
  })

  it('returns undefined for inexisting id', () => {
    const type = findTypeWithId(modules, 99n)

    assert.isUndefined(type)
  })
})

describe('findDefinitionWithId', () => {
  const modules = [buildModuleWithDefs(['val a = 1'])]

  it('finds definition for existing id', () => {
    const def = findDefinitionWithId(modules, 2n)

    assert.isDefined(def)
    assert.deepEqual(def, { id: 2n, kind: 'def', qualifier: 'val', name: 'a', expr: { id: 1n, kind: 'int', value: 1n }, doc: undefined })
  })

  it('returns undefined for inexisting id', () => {
    const def = findDefinitionWithId(modules, 99n)

    assert.isUndefined(def)
  })
})
