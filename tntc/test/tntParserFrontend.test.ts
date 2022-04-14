import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import JSONbig from 'json-bigint'
import { parsePhase1, parsePhase2, Loc, compactSourceMap } from '../src/tntParserFrontend'
import { lf } from 'eol'

// read a TNT file from the test data directory
function readTnt (name: string): string {
  const p = resolve(__dirname, '../testFixture', name + '.tnt')
  const content = readFileSync(p).toString('utf8')
  return lf(content)
}

// read the expected JSON outcome from the test data directory
function readJson (name: string): any {
  const p = resolve(__dirname, '../testFixture', name + '.json')
  return JSONbig.parse(readFileSync(p).toString('utf8'))
}

// read the TNT file and the expected JSON, parse and compare the results
function parseAndCompare (artifact: string, wrap: (json: any) => any, checkNameError: Boolean): void {
  // read the input from the data directory and parse it
  const phase1Result = parsePhase1(readTnt(artifact), `mocked_path/testFixture/${artifact}.tnt`)
  // read the expected result as JSON
  const expected = readJson(artifact)
  let outputToCompare

  if (phase1Result.kind === 'error') {
    // An error occurred at phase 1, check if it is the expected result
    outputToCompare = phase1Result
  } else {
    // Phase 1 succeded, check that the source map is correct
    const expectedSourceMap = readJson(`${artifact}.map`)
    const sourceMapResult = JSONbig.parse(JSONbig.stringify(compactSourceMap(phase1Result.sourceMap)))
    assert.deepEqual(sourceMapResult, expectedSourceMap, 'expected source maps to be equal')

    if (checkNameError) {
      // An error occurred at phase 2, check if it is the expected result
      outputToCompare = parsePhase2(phase1Result.module, phase1Result.sourceMap)
    } else {
      // Both phases succeeded, check that the module is correclty outputed
      outputToCompare = { status: 'parsed', warnings: [], module: phase1Result.module }
    }
  }

  // run it through stringify-parse to obtain the same json (due to bigints)
  const reparsedResult = JSONbig.parse(JSONbig.stringify(outputToCompare))
  // compare the JSON trees
  assert.deepEqual(reparsedResult, expected, 'expected JSON results to be equal')
}

// identity function that can be used as a default wrapper
function nowrap (arg: any): any {
  return arg
}

describe('parse ok', () => {
  it('parse empty module', () => {
    const result = parsePhase1(readTnt('_0001emptyModule'), 'mocked_path/testFixture/_0001emptyModule.tnt')
    const module = { id: 1n, name: 'empty', defs: [] }
    assert.deepEqual(result.kind, 'ok')
    if (result.kind === 'ok') {
      assert.deepEqual(result.module, module)
    }
  })

  it('parse SuperSpec', () => {
    parseAndCompare('SuperSpec',
      function (module: any) {
        return { kind: 'ok', module: module, sourceMap: new Map<BigInt, Loc>() }
      }, false)
  })
})

describe('parse errors', () => {
  it('error in module unit', () => {
    parseAndCompare('_1002emptyWithError', nowrap, false)
  })

  it('error on malformed disjoint union', () => {
    parseAndCompare('_1005constRecordsError', nowrap, false)
  })

  it('error on unexpected symbol after expression', () => {
    parseAndCompare('_1006unexpectedExpr', nowrap, false)
  })

  it('error on unrecognized token', () => {
    parseAndCompare('_1007unexpectedToken', nowrap, false)
  })

  it('error on unexpected "="', () => {
    parseAndCompare('_1008unexpectedEq', nowrap, false)
  })

  it('error on infix without arguments', () => {
    parseAndCompare('_1009infixFewArgs', nowrap, false)
  })

  it('error on unresolved name', () => {
    parseAndCompare('_1010undefinedName', nowrap, true)
  })

  it('error on unresolved scoped name', () => {
    parseAndCompare('_1011nameOutOfScope', nowrap, true)
  })

  it('error on unresolved type alias', () => {
    parseAndCompare('_1012unknownType', nowrap, true)
  })

  it('error on unresolved type alias inside let', () => {
    parseAndCompare('_1013unknownTypeLetIn', nowrap, true)
  })

  it('error on conflicting names', () => {
    parseAndCompare('_1014conflictingNames', nowrap, true)
  })
})
