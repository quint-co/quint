import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import JSONbig from 'json-bigint'
import {
  compactSourceMap,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
} from '../src/quintParserFrontend'
import { lf } from 'eol'
import { right } from '@sweet-monads/either'
import { newIdGenerator } from '../src/idGenerator'
import { collectIds } from './util'
import { fileSourceResolver } from '../src/sourceResolver'

// read a Quint file from the test data directory
function readQuint(name: string): string {
  const p = resolve(__dirname, '../testFixture', name + '.qnt')
  const content = readFileSync(p).toString('utf8')
  return lf(content)
}

// read the expected JSON outcome from the test data directory
function readJson(name: string): any {
  const p = resolve(__dirname, '../testFixture', name + '.json')
  return JSONbig.parse(readFileSync(p).toString('utf8'))
}

// read the Quint file and the expected JSON, parse and compare the results
function parseAndCompare(artifact: string): void {
  // read the input from the data directory and parse it
  const gen = newIdGenerator()
  const basepath = resolve(__dirname, '../testFixture')
  const resolver = fileSourceResolver((path: string) => {
    // replace the absolute path with a generic mocked path,
    // so the same fixtures work accross different setups
    return path.replace(basepath, 'mocked_path/testFixture')
  })
  const mainPath = resolver.lookupPath(basepath, `${artifact}.qnt`)
  const phase1Result = parsePhase1fromText(gen, readQuint(artifact), mainPath.toSourceName()).chain(res =>
    parsePhase2sourceResolution(gen, resolver, mainPath, res)
  )
  // read the expected result as JSON
  const expected = readJson(artifact)
  // We're not interested in testing the contens of the table here
  delete expected.table
  let outputToCompare

  if (phase1Result.isLeft()) {
    // An error occurred at phase 1, check if it is the expected result
    phase1Result.mapLeft(
      err =>
        (outputToCompare = {
          stage: 'parsing',
          errors: err,
          warnings: [],
        })
    )
  } else if (phase1Result.isRight()) {
    const { modules, sourceMap } = phase1Result.value
    const expectedIds = modules.flatMap(m => collectIds(m)).sort()
    // Phase 1 succeded, check that the source map is correct
    assert.sameDeepMembers(expectedIds, [...sourceMap.keys()].sort(), 'expected source map to contain all ids')

    const expectedSourceMap = readJson(`${artifact}.map`)
    const sourceMapResult = JSONbig.parse(JSONbig.stringify(compactSourceMap(sourceMap)))

    assert.deepEqual(sourceMapResult, expectedSourceMap, 'expected source maps to be equal')

    const phase3Result = parsePhase3importAndNameResolution(phase1Result.value)

    if (phase3Result.isLeft()) {
      // An error occurred at phase 2, check if it is the expected result
      phase3Result.mapLeft(
        err =>
          (outputToCompare = {
            stage: 'parsing',
            errors: err,
            warnings: [],
          })
      )
    } else {
      // Both phases succeeded, check that the module is correclty outputed
      outputToCompare = { stage: 'parsing', warnings: [], modules: modules }
    }
  }

  // run it through stringify-parse to obtain the same json (due to bigints)
  const reparsedResult = JSONbig.parse(JSONbig.stringify(outputToCompare))
  // compare the JSON trees
  assert.deepEqual(reparsedResult, expected, 'expected --out data to be equal')
}

describe('parsing', () => {
  it('parses empty module', () => {
    const result = parsePhase1fromText(
      newIdGenerator(),
      readQuint('_0001emptyModule'),
      'mocked_path/testFixture/_0001emptyModule.qnt'
    )
    const module = { id: 1n, name: 'empty', defs: [] }
    assert.deepEqual(
      result.map(r => r.modules[0]),
      right(module)
    )
  })

  it('parses SuperSpec', () => {
    const result = parsePhase1fromText(
      newIdGenerator(),
      readQuint('SuperSpec'),
      'mocked_path/testFixture/SuperSpec.qnt'
    )
    assert(result.isRight())
  })

  it('parses SuperSpec correctly', () => {
    parseAndCompare('SuperSpec')
  })
})

describe('parse errors', () => {
  it('error in module unit', () => {
    parseAndCompare('_1002emptyWithError')
  })

  it('error on malformed disjoint union', () => {
    parseAndCompare('_1005constRecordsError')
  })

  it('error on unexpected symbol after expression', () => {
    parseAndCompare('_1006unexpectedExpr')
  })

  it('error on unrecognized token', () => {
    parseAndCompare('_1007unexpectedToken')
  })

  it('error on unexpected "="', () => {
    parseAndCompare('_1008unexpectedEq')
  })

  it('error on infix without arguments', () => {
    parseAndCompare('_1009infixFewArgs')
  })

  it('error on unresolved name', () => {
    parseAndCompare('_1010undefinedName')
  })

  it('error on unresolved scoped name', () => {
    parseAndCompare('_1011nameOutOfScope')
  })

  it('error on unresolved type alias', () => {
    parseAndCompare('_1012unknownType')
  })

  it('error on unresolved type alias inside let', () => {
    parseAndCompare('_1013unknownTypeLetIn')
  })

  it('error on conflicting names', () => {
    parseAndCompare('_1014conflictingNames')
  })

  it('parses single import from ', () => {
    parseAndCompare('_1021importee1')
  })

  it('parses import from transtively', () => {
    parseAndCompare('_1020importFrom')
  })

  it('errors on incorrect import', () => {
    parseAndCompare('_1023importFromUnresolved')
  })

  it('errors on an import that contains syntax errors', () => {
    parseAndCompare('_1024importFromSyntaxError')
  })

  it('errors on cyclic imports', () => {
    parseAndCompare('_1026importCycleA')
  })

  // The test below needs a fix, see:
  //
  // https://github.com/informalsystems/quint/issues/378
  //it('error on top-level nondet', () => {
  //  parseAndCompare('_1015noToplevelNondet')
  //})

  it('error on overriding values that are not constants', () => {
    parseAndCompare('_1016nonConstOverride')
  })
})
