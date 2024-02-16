import { assert } from 'chai'
import { describe, it } from 'mocha'
import { findDefinitionWithId, findExpressionWithId, findParameterWithId, findTypeWithId } from '../../src/ir/IRFinder'
import { buildModuleWithDecls, buildModuleWithExpressions } from '../builders/ir'

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
  const modules = [buildModuleWithDecls(['const N: MY_TYPE'])]

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
  const modules = [buildModuleWithDecls(['val a = 1'])]

  it('finds definition for existing id', () => {
    const def = findDefinitionWithId(modules, 2n)

    assert.isDefined(def)
    assert.deepEqual(def, {
      id: 2n,
      kind: 'def',
      qualifier: 'val',
      name: 'a',
      expr: { id: 1n, kind: 'int', value: 1n },
    })
  })

  it('returns undefined for inexisting id', () => {
    const def = findDefinitionWithId(modules, 99n)

    assert.isUndefined(def)
  })
})

describe('findParameterWithId', () => {
  const modules = [buildModuleWithDecls(['pure def x(a: int): int = a'])]

  it('finds definition for existing id', () => {
    const def = findParameterWithId(modules, 2n)
    assert.isDefined(def)
    assert.deepEqual(def, {
      id: 2n,
      name: 'a',
      typeAnnotation: {
        id: 1n,
        kind: 'int',
      },
    })
  })

  it('returns undefined for inexisting id', () => {
    const def = findDefinitionWithId(modules, 99n)

    assert.isUndefined(def)
  })
})
