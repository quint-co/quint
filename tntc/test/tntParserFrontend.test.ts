import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import JSONbig = require('json-bigint')
import { ErrorMessage, parsePhase1, ParseResult }
  from '../src/tntParserFrontend'

// read a TNT file from the test data directory
function readTnt (name: string): string {
  const p = resolve(__dirname, '../testFixture', name + '.tnt')
  return readFileSync(p).toString('utf8')
}

// read the expected JSON outcome from the test data directory
function readJson (name: string): any {
  const p = resolve(__dirname, '../testFixture', name + '.json')
  return JSONbig.parse(readFileSync(p).toString('utf8'))
}

// read the TNT file and the expected JSON, parse and compare the results
function parseAndCompare (artifact: string, wrap: (json: any) => any): void {
  // read the input from the data directory and parse it
  const result = parsePhase1(readTnt(artifact))
  // run it through stringify-parse to obtain the same json (due to bigints)
  const reparsedResult = JSONbig.parse(JSONbig.stringify(result))
  // read the expected result as JSON
  const expected = readJson(artifact)
  // compare the JSON trees
  assert.deepEqual(reparsedResult, wrap(expected),
    "expected JSON trees to be equal")
}

// identity function that can be used as a default wrapper
function nowrap (arg: any): any {
  return arg
}

// test via parseAndCompare, expect no error
function parseAsExpected (artifact: string, description: string): void {
  it(description, () => {
    parseAndCompare(artifact,
      function (module: any) {
        return { kind: 'ok', module: module }
      })
  })
}

// plenty of tests

describe('parse ok', () => {
  it('parse empty module', () => {
    const result = parsePhase1(readTnt('_0001emptyModule'))
    const module = { id: 1n, name: 'empty', defs: [] }
    assert.deepEqual(result, { kind: 'ok', module: module }, 'expected ok')
  })

  parseAsExpected(
    '_0003consts',
    'parse constants'
  )

  parseAsExpected(
    '_0004constRecords',
    'parse record types in constants'
  )

  parseAsExpected(
    '_0006vars',
    'parse vars'
  )

  parseAsExpected(
    '_0008vals_untyped',
    'parse untyped val'
  )

  parseAsExpected(
    '_0009vals_untagged',
    'parse untagged val'
  )

  parseAsExpected(
    '_0011vals_typed',
    'parse typed val'
  )

  parseAsExpected(
    '_0012defs_untagged',
    'parse untagged def'
  )

  parseAsExpected(
    '_0013defs_untyped',
    'parse untyped def'
  )

  parseAsExpected(
    '_0014defs_typed',
    'parse typed def'
  )

  parseAsExpected(
    '_0100expr_add',
    'parse iadd'
  )

  parseAsExpected(
    '_0101expr_sub',
    'parse isub'
  )

  parseAsExpected(
    '_0102expr_mul',
    'parse imul'
  )

  parseAsExpected(
    '_0103expr_div',
    'parse idiv'
  )

  parseAsExpected(
    '_0104expr_mod',
    'parse imod'
  )

  parseAsExpected(
    '_0105expr_pow',
    'parse ipow'
  )

  parseAsExpected(
    '_0106expr_uminus',
    'parse iuminus'
  )

  parseAsExpected(
    '_0107expr_gt',
    'parse igt'
  )

  parseAsExpected(
    '_0108expr_ge',
    'parse ige'
  )

  parseAsExpected(
    '_0109expr_lt',
    'parse ilt'
  )

  parseAsExpected(
    '_0110expr_le',
    'parse ile'
  )

  parseAsExpected(
    '_0112expr_eqeq',
    'parse eq'
  )

  parseAsExpected(
    '_0113expr_ne',
    'parse ne'
  )

  parseAsExpected(
    '_0142expr_infix_in',
    'parse infix in'
  )

  parseAsExpected(
    '_0143expr_infix_notin',
    'parse infix notin'
  )

  parseAsExpected(
    '_0144expr_infix_subseteq',
    'parse infix subseteq'
  )

  parseAsExpected(
    '_0114expr_asgn',
    'parse asgn'
  )

  parseAsExpected(
    '_0115expr_and',
    'parse and'
  )

  parseAsExpected(
    '_0116expr_or',
    'parse or'
  )

  parseAsExpected(
    '_0117expr_implies',
    'parse implies'
  )

  parseAsExpected(
    '_0118expr_iff',
    'parse iff'
  )

  parseAsExpected(
    '_0119expr_block_and',
    'parse expr_and'
  )

  parseAsExpected(
    '_0120expr_block_or',
    'parse expr_or'
  )

  parseAsExpected(
    '_0140expr_action_and',
    'parse action_and'
  )

  parseAsExpected(
    '_0141expr_action_or',
    'parse action_or'
  )

  parseAsExpected(
    '_0121expr_ite',
    'parse ite'
  )

  parseAsExpected(
    '_0124expr_funapp',
    'parse function application'
  )

  parseAsExpected(
    '_0125expr_oper_app',
    'parse operator application'
  )

  parseAsExpected(
    '_0126expr_oper_infix_app',
    'parse infix operator application'
  )

  parseAsExpected(
    '_0127expr_oper_infix_app_lambda',
    'parse infix operator application with lambda'
  )

  parseAsExpected(
    '_0128expr_oper_dot_lambda',
    'parse dot operator application with lambda'
  )

  parseAsExpected(
    '_0129expr_oper_dot_args',
    'parse dot operator application with non-lambda'
  )

  parseAsExpected(
    '_0130expr_tuple',
    'parse tuple'
  )

  parseAsExpected(
    '_0131expr_seq',
    'parse seq'
  )

  parseAsExpected(
    '_0132expr_record',
    'parse record'
  )

  parseAsExpected(
    '_0135expr_set_as_oper',
    'parse set as operator'
  )

  parseAsExpected(
    '_0136expr_seq_as_oper',
    'parse seq as operator'
  )

  parseAsExpected(
    '_0137expr_tuple_as_oper',
    'parse tuple as operator'
  )

  parseAsExpected(
    '_0138expr_record_as_oper',
    'parse record as operator'
  )

  parseAsExpected(
    '_0150module_nested',
    'parse nested modules'
  )

  parseAsExpected(
    '_0151assume',
    'parse assumptions'
  )

  parseAsExpected(
    '_0152import',
    'parse imports'
  )

  parseAsExpected(
    '_0153typedef',
    'parse typedef'
  )

  parseAsExpected(
    '_0154instance',
    'parse instance'
  )
})

describe('parse errors', () => {
  it('error in module unit', () => {
    parseAndCompare('_1002emptyWithError', nowrap)
  })

  it('error on malformed disjoint union', () => {
    parseAndCompare('_1005constRecordsError', nowrap)
  })

  it('error on unexpected symbol after expression', () => {
    parseAndCompare('_1006unexpectedExpr', nowrap)
  })
})
