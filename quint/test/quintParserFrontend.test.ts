import { describe, it } from 'mocha'
import { assert } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import JSONbig from 'json-bigint'
import { compactSourceMap, parsePhase1, parsePhase2 } from '../src/quintParserFrontend'
import { lf } from 'eol'
import { right } from '@sweet-monads/either'
import { QuintDef, QuintEx, QuintModule, QuintModuleDef, QuintType, QuintTypeDef } from '../src'
import { IRVisitor, walkModule } from '../src/IRVisitor'

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
  const phase1Result = parsePhase1(readQuint(artifact), `mocked_path/testFixture/${artifact}.qnt`)
  // read the expected result as JSON
  const expected = readJson(artifact)
  let outputToCompare

  if (phase1Result.isLeft()) {
    // An error occurred at phase 1, check if it is the expected result
    phase1Result.mapLeft(err =>
      outputToCompare = {
        stage: 'parsing',
        errors: err,
      }
    )
  } else if (phase1Result.isRight()) {
    const { modules, sourceMap } = phase1Result.value
    const module = modules[0]
    // Phase 1 succeded, check that the source map is correct
    assert.sameDeepMembers(collectIds(module).sort(), [...sourceMap.keys()].sort(), 'expected source map to contain all ids')

    const expectedSourceMap = readJson(`${artifact}.map`)
    const sourceMapResult = JSONbig.parse(JSONbig.stringify(compactSourceMap(sourceMap)))

    assert.deepEqual(sourceMapResult,
      expectedSourceMap, 'expected source maps to be equal')

    const phase2Result = parsePhase2(phase1Result.value)

    if (phase2Result.isLeft()) {
      // An error occurred at phase 2, check if it is the expected result
      phase2Result.mapLeft(err =>
        outputToCompare = {
          stage: 'parsing',
          errors: err,
        }
      )
    } else {
      // Both phases succeeded, check that the module is correclty outputed
      outputToCompare = { stage: 'parsing', warnings: [], module: module }
    }
  }

  // run it through stringify-parse to obtain the same json (due to bigints)
  const reparsedResult = JSONbig.parse(JSONbig.stringify(outputToCompare))
  // compare the JSON trees
  assert.deepEqual(reparsedResult,
    expected, 'expected source maps to be equal')
}

describe('parsing', () => {
  it('parses empty module', () => {
    const result = parsePhase1(readQuint('_0001emptyModule'), 'mocked_path/testFixture/_0001emptyModule.qnt')
    const module = { id: 1n, name: 'empty', defs: [] }
    assert.deepEqual(result.map(r => r.modules[0]), right(module))
  })

  it('parses SuperSpec', () => {
    const result = parsePhase1(readQuint('SuperSpec'), 'mocked_path/testFixture/SuperSpec.qnt')
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

  // The test below needs a fix, see:
  //
  // https://github.com/informalsystems/quint/issues/378
  //it('error on top-level nondet', () => {
  //  parseAndCompare('_1015noToplevelNondet')
  //})
})

function collectIds(module: QuintModule): bigint[] {
  const ids = new Set<bigint>()
  const visitor: IRVisitor = {
    exitDef: (def: QuintDef) => {
      ids.add(def.id)
    },
    exitExpr(e: QuintEx) {
      ids.add(e.id)
    },
    exitTypeDef(t: QuintTypeDef) {
      ids.add(t.id)
    },
    exitType(t: QuintType) {
      if (t.id) {
        ids.add(t.id)
      }
    },
    exitModuleDef(m: QuintModuleDef) {
      ids.add(m.module.id)
    },
  }

  walkModule(visitor, module)
  return [...ids]
}
