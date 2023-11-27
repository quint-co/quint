import { describe, it } from 'mocha'
import { assert } from 'chai'
import { getSignatures } from '../../src/types/builtinSignatures'
import { parseTypeOrThrow } from '../../src/types/parser'
import { TypeScheme } from '../../src/types/base'
import { typeSchemeToString } from '../../src/types/printing'

describe('getSignatures', () => {
  const signatures = getSignatures()

  it('contains quantified signatures for List', () => {
    const listSignature = signatures.get('List')!

    const expectedSignature = {
      type: parseTypeOrThrow('(a, a, a) => List[a]'),
      typeVariables: new Set(['a']),
      rowVariables: new Set([]),
    }

    const result = listSignature(3)

    assert.deepEqual(
      result,
      expectedSignature,
      `expected ${typeSchemeToString(expectedSignature)}, got ${typeSchemeToString(result)}`
    )
  })

  it('contains quantified signatures for tuples', () => {
    const tuplesSignature = signatures.get('tuples')!

    const expectedSignature: TypeScheme = {
      type: parseTypeOrThrow('(Set[t0], Set[t1], Set[t2]) => Set[(t0, t1, t2)]'),
      typeVariables: new Set(['t0', 't1', 't2']),
      rowVariables: new Set([]),
    }

    const result = tuplesSignature(3)

    assert.deepEqual(
      result,
      expectedSignature,
      `expected ${typeSchemeToString(expectedSignature)}, got ${typeSchemeToString(result)}`
    )
  })
})
