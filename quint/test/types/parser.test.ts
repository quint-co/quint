import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseType } from '../../src/types/parser'

describe('parseType', () => {
  it('parses tuple of literal types', () => {
    const type = parseType('(bool, int, str)')

    assert.isTrue(type.isRight())
    type.map(value =>
      assert.deepEqual(value, {
        kind: 'tup',
        fields: {
          kind: 'row',
          fields: [
            { fieldName: '0', fieldType: { kind: 'bool', id: 1n } },
            { fieldName: '1', fieldType: { kind: 'int', id: 2n } },
            { fieldName: '2', fieldType: { kind: 'str', id: 3n } },
          ],
          other: { kind: 'empty' },
        },
        id: 4n,
      })
    )
  })

  it('parses operator with type vars', () => {
    const type = parseType('(a, b) => ((a) => b)')

    assert.isTrue(type.isRight())
    type.map(value =>
      assert.deepEqual(value, {
        kind: 'oper',
        args: [
          { kind: 'var', name: 'a', id: 1n },
          { kind: 'var', name: 'b', id: 2n },
        ],
        res: {
          kind: 'oper',
          args: [{ kind: 'var', name: 'a', id: 3n }],
          res: { kind: 'var', name: 'b', id: 4n },
          id: 5n,
        },
        id: 6n,
      })
    )
  })

  // Regression test for https://github.com/informalsystems/quint/issues/1336
  it('parses qualified type constants', () => {
    const type = parseType('modname::TypeConstructor')

    assert.isTrue(type.isRight())
    type.map(value => {
      assert(value.kind === 'const')
      assert.deepEqual(value.name, 'modname::TypeConstructor')
    })
  })

  it('parses function of const types', () => {
    const type = parseType('T1 -> (T2 -> T1)')

    assert.isTrue(type.isRight())
    type.map(value =>
      assert.deepEqual(value, {
        kind: 'fun',
        arg: { kind: 'const', name: 'T1', id: 1n },
        res: {
          kind: 'fun',
          arg: { kind: 'const', name: 'T2', id: 2n },
          res: { kind: 'const', name: 'T1', id: 3n },
          id: 4n,
        },
        id: 5n,
      })
    )
  })

  it('parses records of sets and lists', () => {
    const type = parseType('{ mySet: Set[a], mySeq: List[a] | r }')

    assert.isTrue(type.isRight())
    type.map(value =>
      assert.deepEqual(value, {
        kind: 'rec',
        fields: {
          kind: 'row',
          fields: [
            { fieldName: 'mySet', fieldType: { kind: 'set', elem: { kind: 'var', name: 'a', id: 1n }, id: 2n } },
            { fieldName: 'mySeq', fieldType: { kind: 'list', elem: { kind: 'var', name: 'a', id: 3n }, id: 4n } },
          ],
          other: { kind: 'var', name: 'r' },
        },
        id: 5n,
      })
    )
  })

  it('parses type application', () => {
    const type = parseType('Foo[int, bool, str]')

    assert.isTrue(type.isRight())
    type.map(value =>
      assert.deepEqual(value, {
        kind: 'app',
        ctor: { kind: 'const', name: 'Foo', id: 5n },
        args: [
          { kind: 'int', id: 1n },
          { kind: 'bool', id: 2n },
          { kind: 'str', id: 3n },
        ],
        id: 4n,
      })
    )
  })

  it('throws error when type is invalid', () => {
    const type = parseType('Set(int)')

    assert.isTrue(type.isLeft())
    type.mapLeft(error => assert.deepEqual(error[0].explanation, "missing '[' at '('"))
  })

  it('throws error when row separators are invalid', () => {
    const type = parseType('{ f1: int, | r }')

    assert.isTrue(type.isLeft())
    type.mapLeft(error =>
      assert.sameDeepMembers(error, [
        {
          // TODO We should not expect a '=>' here,
          // but do because of https://github.com/informalsystems/quint/issues/456
          explanation: "mismatched input '|' expecting '}'",
          locs: [{ start: { line: 0, col: 11, index: 11 }, end: { line: 0, col: 11, index: 11 } }],
        },
      ])
    )
  })
})
