import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildDef } from '../builders/ir'
import { definitionToString } from '../../src/ir/IRprinting'
import { addNamespaceToDefinition } from '../../src/ir/namespacer'
import { builtinNames } from '../../src/names/base'

describe('addNamespaceToDefinition', () => {
  it('adds namespace to variables', () => {
    const def = buildDef('var x: int')

    const result = addNamespaceToDefinition(def, 'M', new Set())

    assert.deepEqual(definitionToString(result), 'var M::x: int')
  })

  it('adds namespace to constants and type aliases', () => {
    const def = buildDef('const N: MY_TYPE')

    const result = addNamespaceToDefinition(def, 'M', new Set())

    assert.deepEqual(definitionToString(result), 'const M::N: M::MY_TYPE')
  })

  it('adds namespace to type defs', () => {
    const def = buildDef('type MY_TYPE = int')

    const result = addNamespaceToDefinition(def, 'M', new Set())

    assert.deepEqual(definitionToString(result), 'type M::MY_TYPE = int')
  })

  it('adds namespace to operators, ignoring builtins', () => {
    const def = buildDef('val a = pure val b = Set(1, 2) { b.map(x => x) }')

    const result = addNamespaceToDefinition(def, 'M', new Set(builtinNames))

    assert.deepEqual(definitionToString(result), 'val M::a = pure val M::b = Set(1, 2) { map(M::b, ((M::x) => M::x)) }')
  })

  it('keeps imports as is', () => {
    const def = buildDef('import A.*')

    const result = addNamespaceToDefinition(def, 'M', new Set())

    assert.deepEqual(definitionToString(result), 'import A.*')
  })
})
