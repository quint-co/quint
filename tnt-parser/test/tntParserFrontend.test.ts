import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { ErrorMessage, parsePhase1, ParseResult }
  from '../src/tntParserFrontend'
import { TntDef, TntOpDef, OpQualifier, OpScope } from '../src/tntIr'

function readTest (name: string): string {
  const p = resolve(__dirname, '../testFixture', name + '.tnt')
  return readFileSync(p).toString('utf8')
}

describe('parse modules', () => {
  it('parse empty module', () => {
    const result = parsePhase1(readTest('_0001emptyModule'))
    const module = { id: 1n, name: 'empty', defs: [] }
    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('error message on error in module unit', () => {
    const result = parsePhase1(readTest('_0002emptyWithError'))
    const msg: ErrorMessage = {
      explanation: 'TNT001: expected a const, var, def, typedef, etc.',
      start: { line: 4, col: 0 },
      end: { line: 4, col: 1 }
    }
    const expected: ParseResult = { kind: 'error', messages: [msg] }
    assert.deepEqual(result, expected, 'expected error')
  })

  it('parse constants', () => {
    const result = parsePhase1(readTest('_0003consts'))
    // const N: int
    const constN: TntDef = {
      id: 1n,
      kind: 'const',
      name: 'N',
      type: { kind: 'int' }
    }
    // const MySet: set(int)
    const constMySet: TntDef = {
      id: 2n,
      kind: 'const',
      name: 'MySet',
      type: { kind: 'set', elem: { kind: 'int' } }
    }
    // const MySeq: seq(int)
    const constMySeq: TntDef = {
      id: 3n,
      kind: 'const',
      name: 'MySeq',
      type: { kind: 'seq', elem: { kind: 'bool' } }
    }
    // const MyFun: int -> str
    const constMyFun: TntDef = {
      id: 4n,
      kind: 'const',
      name: 'MyFun',
      type: { kind: 'fun', arg: { kind: 'int' }, res: { kind: 'str' } }
    }
    // const MyFun: (int -> str) -> bool
    const constMyFunFun: TntDef = {
      id: 5n,
      kind: 'const',
      name: 'MyFunFun',
      type: {
        kind: 'fun',
        arg: { kind: 'fun', arg: { kind: 'int' }, res: { kind: 'str' } },
        res: { kind: 'bool' }
      }
    }
    // const MyOper: (int, str) => bool
    const constMyOper: TntDef = {
      id: 6n,
      kind: 'const',
      name: 'MyOper',
      type: {
        kind: 'oper',
        args: [{ kind: 'int' }, { kind: 'str' }],
        res: { kind: 'bool' }
      }
    }
    // const MyTuple: (int, bool, str)
    const constMyTuple: TntDef = {
      id: 7n,
      kind: 'const',
      name: 'MyTuple',
      type: {
        kind: 'tuple',
        elems: [{ kind: 'int' }, { kind: 'bool' }, { kind: 'str' }]
      }
    }
    // the module that contains all these constants
    const module = {
      id: 8n,
      name: 'withConsts',
      defs: [constN, constMySet, constMySeq, constMyFun,
        constMyFunFun, constMyOper, constMyTuple]
    }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse record types in constants', () => {
    const result = parsePhase1(readTest('_0004constRecords'))
    // const MyRecord: { 'i': int, 'b': bool, 's': str }
    const constMyRecord: TntDef = {
      id: 1n,
      kind: 'const',
      name: 'MyRecord',
      type: {
        kind: 'record',
        fields: [{ fieldName: 'i', fieldType: { kind: 'int' } },
          { fieldName: 'b', fieldType: { kind: 'bool' } },
          { fieldName: 's', fieldType: { kind: 'str' } }]
      }
    }

    // disjoint unions are the most complex type in our type system
    const constMyUnion: TntDef =
      {
        id: 2n,
        kind: 'const',
        name: 'MyUnion',
        type: {
          kind: 'union',
          tag: 'tag',
          records: [
            {
              tagValue: 'circle',
              fields: [{ fieldName: 'radius', fieldType: { kind: 'int' } }]
            },
            {
              tagValue: 'rectangle',
              fields: [
                { fieldName: 'width', fieldType: { kind: 'int' } },
                { fieldName: 'height', fieldType: { kind: 'int' } }
              ]
            },
            {
              tagValue: 'dog',
              fields: [{ fieldName: 'name', fieldType: { kind: 'str' } }]
            }
          ]
        }
      }

    // the module that contains all these constants
    const module = {
      id: 3n,
      name: 'withConsts',
      defs: [constMyRecord, constMyUnion]
    }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('error message in malformed disjoint union', () => {
    const result = parsePhase1(readTest('_0005constRecordsError'))
    const msg: ErrorMessage = {
      explanation: 'TNT011: Records in disjoint union have different tag fields: tag and kind',
      start: { line: 5, col: 2 },
      end: { line: 6, col: 49 }
    }
    const expected: ParseResult = { kind: 'error', messages: [msg] }
    assert.deepEqual(result, expected, 'expected error')
  })

  it('parse vars', () => {
    const result = parsePhase1(readTest('_0006vars'))
    // var x: int
    const x: TntDef = { id: 1n, kind: 'var', name: 'x', type: { kind: 'int' } }
    // var y: bool
    const y: TntDef = {
      id: 2n,
      kind: 'var',
      name: 'y',
      type: { kind: 'bool' }
    }

    // the module that contains all these constants
    const module = { id: 3n, name: 'withVars', defs: [x, y] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse untyped val', () => {
    const result = parsePhase1(readTest('_0008vals_untyped'))
    // val add_1_to_2: _ = 1 + 2

    const add1To2: TntOpDef = {
      id: 4n,
      kind: 'def',
      name: 'add_1_to_2',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'add',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [add1To2] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse untagged val', () => {
    const result = parsePhase1(readTest('_0009vals_untagged'))
    // val VeryTrue = { 2 + 2 = 4 }
    const VeryTrue: TntOpDef = {
      id: 6n,
      kind: 'def',
      name: 'VeryTrue',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 5n,
        kind: 'opapp',
        opcode: 'eq',
        args: [
          {
            id: 3n,
            kind: 'opapp',
            opcode: 'add',
            args: [
              { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
              { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } }
            ]
          },
          { id: 4n, kind: 'int', value: 4n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withVals', defs: [VeryTrue] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse private val', () => {
    const result = parsePhase1(readTest('_0010vals_private'))
    // private val details = -123
    const details: TntOpDef = {
      id: 3n,
      kind: 'def',
      name: 'details',
      qualifier: OpQualifier.Val,
      scope: OpScope.Private,
      expr: {
        id: 2n,
        kind: 'opapp',
        opcode: 'uminus',
        args: [{ id: 1n, kind: 'int', value: 123n, type: { kind: 'int' } }]
      }
    }

    // the module that contains all these constants
    const module = { id: 4n, name: 'withVals', defs: [details] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse typed val', () => {
    const result = parsePhase1(readTest('_0011vals_typed'))
    // withType: set(int) = set(1, 2)
    const details: TntOpDef = {
      id: 4n,
      kind: 'def',
      name: 'withType',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      type: { kind: 'set', elem: { kind: 'int' } },
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'set',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [details] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse untagged def', () => {
    const result = parsePhase1(readTest('_0012defs_untagged'))
    // def F(x, y) = x + y
    const defF: TntOpDef = {
      id: 5n,
      kind: 'def',
      name: 'F',
      qualifier: OpQualifier.Def,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opabs',
        params: ['x', 'y'],
        expr: {
          id: 3n,
          kind: 'opapp',
          opcode: 'add',
          args: [
            { id: 1n, kind: 'name', name: 'x' },
            { id: 2n, kind: 'name', name: 'y' }
          ]
        }
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withDefs', defs: [defF] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse untyped def', () => {
    const result = parsePhase1(readTest('_0013defs_untyped'))
    // def G(x, y) = x + y
    const defG: TntOpDef = {
      id: 5n,
      kind: 'def',
      name: 'G',
      qualifier: OpQualifier.Def,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opabs',
        params: ['x', 'y'],
        expr: {
          id: 3n,
          kind: 'opapp',
          opcode: 'add',
          args: [
            { id: 1n, kind: 'name', name: 'x' },
            { id: 2n, kind: 'name', name: 'y' }
          ]
        }
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withDefs', defs: [defG] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse typed def', () => {
    const result = parsePhase1(readTest('_0014defs_typed'))
    // def H(x, y): (int, int) => int = x + y
    const defH: TntOpDef = {
      id: 5n,
      kind: 'def',
      name: 'H',
      qualifier: OpQualifier.Def,
      scope: OpScope.Public,
      type: {
        kind: 'oper',
        args: [{ kind: 'int' }, { kind: 'int' }],
        res: { kind: 'int' }
      },
      expr: {
        id: 4n,
        kind: 'opabs',
        params: ['x', 'y'],
        expr: {
          id: 3n,
          kind: 'opapp',
          opcode: 'add',
          args: [
            { id: 1n, kind: 'name', name: 'x' },
            { id: 2n, kind: 'name', name: 'y' }
          ]
        }
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withDefs', defs: [defH] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse typed def rec', () => {
    const result = parsePhase1(readTest('_0015defs_rec'))
    // def rec R(n): (int) => int = { R(n - 1) }
    const defR: TntOpDef = {
      id: 6n,
      kind: 'def',
      name: 'R',
      qualifier: OpQualifier.DefRec,
      scope: OpScope.Public,
      type: {
        kind: 'oper',
        args: [{ kind: 'int' }],
        res: { kind: 'int' }
      },
      expr: {
        id: 5n,
        kind: 'opabs',
        params: ['n'],
        expr: {
          id: 4n,
          kind: 'opapp',
          opcode: 'R',
          args: [
            {
              id: 3n,
              kind: 'opapp',
              opcode: 'sub',
              args: [
                { id: 1n, kind: 'name', name: 'n' },
                { id: 2n, kind: 'int', value: 1n, type: { kind: 'int' } }]
            }
          ]
        }
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withDefs', defs: [defR] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse add', () => {
    const result = parsePhase1(readTest('_0100expr_add'))
    // val add_1_to_2: _ = 1 + 2
    const add1To2: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'add_1_to_2',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'add',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [add1To2] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse sub', () => {
    const result = parsePhase1(readTest('_0101expr_sub'))
    // val sub_1_to_2: _ = 1 - 2
    const sub1To2: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'sub_1_to_2',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'sub',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [sub1To2] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse mul', () => {
    const result = parsePhase1(readTest('_0102expr_mul'))
    // val mul_2_to_3: _ = 2 * 3
    const mul2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'mul_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'mul',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [mul2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse div', () => {
    const result = parsePhase1(readTest('_0103expr_div'))
    // val div_2_to_3: _ = 2 / 3
    const div2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'div_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'div',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [div2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse mod', () => {
    const result = parsePhase1(readTest('_0104expr_mod'))
    // val mod_2_to_3: _ = 2 % 3
    const mod2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'mod_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'mod',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [mod2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse pow', () => {
    const result = parsePhase1(readTest('_0105expr_pow'))
    // val pow_2_to_3: _ = 2^3
    const pow2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'pow_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'pow',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [pow2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse uminus', () => {
    const result = parsePhase1(readTest('_0106expr_uminus'))
    // val uminus: _ = -100
    const uminus: TntDef = {
      id: 3n,
      kind: 'def',
      name: 'uminus',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 2n,
        kind: 'opapp',
        opcode: 'uminus',
        args: [{ id: 1n, kind: 'int', value: 100n, type: { kind: 'int' } }]
      }
    }

    // the module that contains all these constants
    const module = { id: 4n, name: 'withVals', defs: [uminus] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse gt', () => {
    const result = parsePhase1(readTest('_0107expr_gt'))
    // val gt_2_to_3: _ = 2 > 3
    const gt2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'gt_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'gt',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [gt2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse ge', () => {
    const result = parsePhase1(readTest('_0108expr_ge'))
    // val ge_2_to_3: _ = 2 >= 3
    const ge2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'ge_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'gte',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [ge2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse lt', () => {
    const result = parsePhase1(readTest('_0109expr_lt'))
    // val lt_2_to_3: _ = 2 < 3
    const lt2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'lt_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'lt',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [lt2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse le', () => {
    const result = parsePhase1(readTest('_0110expr_le'))
    // val le_2_to_3: _ = 2 <= 3
    const le2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'le_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'lte',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [le2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse eq', () => {
    const result = parsePhase1(readTest('_0111expr_eq'))
    // val eq_2_to_3: _ = 2 = 3
    const eq2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'eq_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'eq',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [eq2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse eqeq', () => {
    const result = parsePhase1(readTest('_0112expr_eqeq'))
    // val eqeq_2_to_3: _ = 2 == 3
    const eqeq2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'eqeq_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'eq',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [eqeq2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse ne', () => {
    const result = parsePhase1(readTest('_0113expr_ne'))
    // val ne_2_to_3: _ = 2 != 3
    const ne2To3: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'ne_2_to_3',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'neq',
        args: [
          { id: 1n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [ne2To3] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse asgn', () => {
    const result = parsePhase1(readTest('_0114expr_asgn'))
    // var x: int
    const x: TntDef = { id: 1n, kind: 'var', name: 'x', type: { kind: 'int' } }
    // val asgn: _ = x := 3
    const asgn: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'asgn',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'assign',
        args: [
          { id: 2n, kind: 'name', name: 'x' },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [x, asgn] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse and', () => {
    const result = parsePhase1(readTest('_0115expr_and'))
    // val test_and: _ = false and true
    const testAnd: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'test_and',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'and',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [testAnd] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse or', () => {
    const result = parsePhase1(readTest('_0116expr_or'))
    // val test_or: _ = false or true
    const testOr: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'test_or',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'or',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [testOr] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse implies', () => {
    const result = parsePhase1(readTest('_0117expr_implies'))
    // val test_implies: _ = false implies true
    const testImplies: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'test_implies',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'implies',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [testImplies] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse iff', () => {
    const result = parsePhase1(readTest('_0118expr_iff'))
    // val test_iff: _ = false iff true
    const testIff: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'test_iff',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'iff',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [testIff] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse block_and', () => {
    const result = parsePhase1(readTest('_0119expr_block_and'))
    // val block_and: _ = { false & true & false }
    const testBlockAnd: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_block_and',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'andBlock',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } },
          { id: 3n, kind: 'bool', value: false, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testBlockAnd] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse block_or', () => {
    const result = parsePhase1(readTest('_0120expr_block_or'))
    // val block_or: _ = { false | true | false }
    const testBlockOr: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_block_or',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'orBlock',
        args: [
          { id: 1n, kind: 'bool', value: false, type: { kind: 'bool' } },
          { id: 2n, kind: 'bool', value: true, type: { kind: 'bool' } },
          { id: 3n, kind: 'bool', value: false, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testBlockOr] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse ite', () => {
    const result = parsePhase1(readTest('_0121expr_ite'))
    // val test_ite: _ = if (true) 1 else 0
    const testIte: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_ite',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'ite',
        args: [
          { id: 1n, kind: 'bool', value: true, type: { kind: 'bool' } },
          { id: 2n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 0n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testIte] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse case', () => {
    const result = parsePhase1(readTest('_0122expr_case'))
    // val case: _ = { p1 -> e1 | p2 -> e2 | p3 -> e3 }
    const testCase: TntDef = {
      id: 8n,
      kind: 'def',
      name: 'test_case',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 7n,
        kind: 'opapp',
        opcode: 'caseBlock',
        args: [
          { id: 1n, kind: 'name', name: 'p1' },
          { id: 2n, kind: 'name', name: 'e1' },
          { id: 3n, kind: 'name', name: 'p2' },
          { id: 4n, kind: 'name', name: 'e2' },
          { id: 5n, kind: 'name', name: 'p3' },
          { id: 6n, kind: 'name', name: 'e3' }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 9n, name: 'withVals', defs: [testCase] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse case with default', () => {
    const result = parsePhase1(readTest('_0123expr_case_default'))
    // val case: _ = { p1 -> e1 | p2 -> e2 | p3 -> e3 | _ -> e4 }
    const testCaseDefault: TntDef = {
      id: 9n,
      kind: 'def',
      name: 'test_case',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 8n,
        kind: 'opapp',
        opcode: 'caseBlock',
        args: [
          { id: 1n, kind: 'name', name: 'p1' },
          { id: 2n, kind: 'name', name: 'e1' },
          { id: 3n, kind: 'name', name: 'p2' },
          { id: 4n, kind: 'name', name: 'e2' },
          { id: 5n, kind: 'name', name: 'p3' },
          { id: 6n, kind: 'name', name: 'e3' },
          { id: 7n, kind: 'name', name: 'e4' }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 10n, name: 'withVals', defs: [testCaseDefault] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse function application', () => {
    const result = parsePhase1(readTest('_0124expr_funapp'))
    // var f: str -> int
    const f: TntDef = {
      id: 1n,
      kind: 'var',
      name: 'f',
      type: { kind: 'fun', arg: { kind: 'str' }, res: { kind: 'int' } }
    }
    // val funapp = f['a']
    const funapp: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'funapp',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'of',
        args: [
          { id: 2n, kind: 'name', name: 'f' },
          { id: 3n, kind: 'str', value: 'a', type: { kind: 'str' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [f, funapp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse operator application', () => {
    const result = parsePhase1(readTest('_0125expr_oper_app'))
    // val oper_app = MyOper('a', 42)
    const operApp: TntDef = {
      id: 4n,
      kind: 'def',
      name: 'oper_app',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 3n,
        kind: 'opapp',
        opcode: 'MyOper',
        args: [
          { id: 1n, kind: 'str', value: 'a', type: { kind: 'str' } },
          { id: 2n, kind: 'int', value: 42n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 5n, name: 'withVals', defs: [operApp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse infix operator application', () => {
    const result = parsePhase1(readTest('_0126expr_oper_infix_app'))
    // val oper_app = 'a' MyOper 42, true
    const operApp: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'oper_app',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'MyOper',
        args: [
          { id: 1n, kind: 'str', value: 'a', type: { kind: 'str' } },
          { id: 2n, kind: 'int', value: 42n, type: { kind: 'int' } },
          { id: 3n, kind: 'bool', value: true, type: { kind: 'bool' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [operApp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse infix operator application with lambda', () => {
    const result = parsePhase1(readTest('_0127expr_oper_infix_app_lambda'))
    // val oper_app = S filter { x -> x > 10 }
    const operApp: TntDef = {
      id: 7n,
      kind: 'def',
      name: 'oper_app',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 6n,
        kind: 'opapp',
        opcode: 'filter',
        args: [
          { id: 1n, kind: 'name', name: 'S' },
          {
            id: 5n,
            kind: 'opabs',
            params: ['x'],
            expr: {
              id: 4n,
              kind: 'opapp',
              opcode: 'gt',
              args: [
                { id: 2n, kind: 'name', name: 'x' },
                { id: 3n, kind: 'int', value: 10n, type: { kind: 'int' } }
              ]
            }
          }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 8n, name: 'withVals', defs: [operApp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse dot operator application with lambda', () => {
    const result = parsePhase1(readTest('_0128expr_oper_dot_lambda'))
    // val oper_app = S.filter(x -> x > 10)
    const operApp: TntDef = {
      id: 7n,
      kind: 'def',
      name: 'oper_app',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 6n,
        kind: 'opapp',
        opcode: 'filter',
        args: [
          { id: 1n, kind: 'name', name: 'S' },
          {
            id: 5n,
            kind: 'opabs',
            params: ['x'],
            expr: {
              id: 4n,
              kind: 'opapp',
              opcode: 'gt',
              args: [
                { id: 2n, kind: 'name', name: 'x' },
                { id: 3n, kind: 'int', value: 10n, type: { kind: 'int' } }
              ]
            }
          }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 8n, name: 'withVals', defs: [operApp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse dot operator application with non-lambda', () => {
    const result = parsePhase1(readTest('_0129expr_oper_dot_args'))
    // val oper_app = f.except(3, 4)
    const operApp: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'oper_app',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'except',
        args: [
          { id: 1n, kind: 'name', name: 'f' },
          { id: 2n, kind: 'int', value: 3n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 4n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [operApp] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse tuple', () => {
    const result = parsePhase1(readTest('_0130expr_tuple'))
    // val test_tuple = (1, 2, 3)
    const testTuple: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_tuple',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'tuple',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testTuple] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse seq', () => {
    const result = parsePhase1(readTest('_0131expr_seq'))
    // val test_seq = [1, 2, 3]
    const testSeq: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_seq',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'seq',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testSeq] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse record', () => {
    const result = parsePhase1(readTest('_0132expr_record'))
    // val test_record = { name: 'igor', year: 1981 }
    const testRecord: TntDef = {
      id: 6n,
      kind: 'def',
      name: 'test_record',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 5n,
        kind: 'opapp',
        opcode: 'record',
        args: [
          { id: 3n, kind: 'str', value: 'name', type: { kind: 'str' } },
          { id: 1n, kind: 'str', value: 'igor', type: { kind: 'str' } },
          { id: 4n, kind: 'str', value: 'year', type: { kind: 'str' } },
          { id: 2n, kind: 'int', value: 1981n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withVals', defs: [testRecord] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse record set', () => {
    const result = parsePhase1(readTest('_0133expr_record_set'))
    // val test_record_set = [ name in Str, year in Int ]
    const testRecordSet: TntDef = {
      id: 6n,
      kind: 'def',
      name: 'test_record_set',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 5n,
        kind: 'opapp',
        opcode: 'recordSet',
        args: [
          { id: 3n, kind: 'str', value: 'name', type: { kind: 'str' } },
          { id: 1n, kind: 'name', name: 'Str' },
          { id: 4n, kind: 'str', value: 'year', type: { kind: 'str' } },
          { id: 2n, kind: 'name', name: 'Int' }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withVals', defs: [testRecordSet] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse set as operator', () => {
    const result = parsePhase1(readTest('_0135expr_set_as_oper'))
    // val test_set = set(1, 2, 3)
    const testSet: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_set',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'set',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testSet] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse seq as operator', () => {
    const result = parsePhase1(readTest('_0136expr_seq_as_oper'))
    // val test_seq = seq(1, 2, 3)
    const testSeq: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_seq',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'seq',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testSeq] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse tuple as operator', () => {
    const result = parsePhase1(readTest('_0137expr_tuple_as_oper'))
    // val test_tuple = tuple(1, 2, 3)
    const testTuple: TntDef = {
      id: 5n,
      kind: 'def',
      name: 'test_tuple',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 4n,
        kind: 'opapp',
        opcode: 'tuple',
        args: [
          { id: 1n, kind: 'int', value: 1n, type: { kind: 'int' } },
          { id: 2n, kind: 'int', value: 2n, type: { kind: 'int' } },
          { id: 3n, kind: 'int', value: 3n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 6n, name: 'withVals', defs: [testTuple] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse record as operator', () => {
    const result = parsePhase1(readTest('_0138expr_record_as_oper'))
    // val test_record = record('name', 'igor', 'year', 1981)
    const testRecord: TntDef = {
      id: 6n,
      kind: 'def',
      name: 'test_record',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 5n,
        kind: 'opapp',
        opcode: 'record',
        args: [
          { id: 1n, kind: 'str', value: 'name', type: { kind: 'str' } },
          { id: 2n, kind: 'str', value: 'igor', type: { kind: 'str' } },
          { id: 3n, kind: 'str', value: 'year', type: { kind: 'str' } },
          { id: 4n, kind: 'int', value: 1981n, type: { kind: 'int' } }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withVals', defs: [testRecord] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  it('parse record set as operator', () => {
    const result = parsePhase1(readTest('_0139expr_record_set_as_oper'))
    // val test_record_set = recordSet('name', Str, 'year', Int)
    const testRecordSet: TntDef = {
      id: 6n,
      kind: 'def',
      name: 'test_record_set',
      qualifier: OpQualifier.Val,
      scope: OpScope.Public,
      expr: {
        id: 5n,
        kind: 'opapp',
        opcode: 'recordSet',
        args: [
          { id: 1n, kind: 'str', value: 'name', type: { kind: 'str' } },
          { id: 2n, kind: 'name', name: 'Str' },
          { id: 3n, kind: 'str', value: 'year', type: { kind: 'str' } },
          { id: 4n, kind: 'name', name: 'Int' }
        ]
      }
    }

    // the module that contains all these constants
    const module = { id: 7n, name: 'withVals', defs: [testRecordSet] }

    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })
})
