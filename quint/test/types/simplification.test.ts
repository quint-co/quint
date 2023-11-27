import { describe, it } from 'mocha'
import { assert } from 'chai'
import { typeSchemeToString } from '../../src/types/printing'
import { simplify } from '../../src/types/simplification'
import { toScheme } from '../../src/types/base'
import { QuintRecordType } from '../../src'

describe('simplify', () => {
  it('flattens nested row tails', () => {
    // { a: int | { b: bool | { c: str | v } } }
    const type: QuintRecordType = {
      kind: 'rec',
      fields: {
        kind: 'row',
        fields: [{ fieldName: 'a', fieldType: { kind: 'int' } }],
        other: {
          kind: 'row',
          fields: [{ fieldName: 'b', fieldType: { kind: 'bool' } }],
          other: {
            kind: 'row',
            fields: [{ fieldName: 'c', fieldType: { kind: 'str' } }],
            other: { kind: 'var', name: 'v' },
          },
        },
      },
    }

    const simplifiedType = simplify(toScheme(type))

    assert.deepEqual(typeSchemeToString(simplifiedType), '{ a: int, b: bool, c: str | v }')
  })

  it('simplifies rows with empty fields', () => {
    // { | { b: bool | { c: str | v } } }
    const type: QuintRecordType = {
      kind: 'rec',
      fields: {
        kind: 'row',
        fields: [],
        other: {
          kind: 'row',
          fields: [{ fieldName: 'b', fieldType: { kind: 'bool' } }],
          other: {
            kind: 'row',
            fields: [{ fieldName: 'c', fieldType: { kind: 'str' } }],
            other: { kind: 'var', name: 'v' },
          },
        },
      },
    }

    const simplifiedType = simplify(toScheme(type))

    assert.deepEqual(typeSchemeToString(simplifiedType), '{ b: bool, c: str | v }')
  })
})
