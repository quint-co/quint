import { describe, it } from 'mocha'
import { assert } from 'chai'
import { effectToString } from '../../src/effects/printing'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { addNamespaces } from '../../src/effects/namespaces'

describe('addNamespace', () => {
  it('adds namespaces to state variable names', () => {
    const namespaces = ['Second', 'First']
    const effect = parseEffectOrThrow("Read['x'] & Update[e0, 'y']")

    const result = addNamespaces(effect, namespaces)

    assert.deepEqual(effectToString(result), "Read['First::Second::x'] & Update[e0, 'First::Second::y']")
  })
})
