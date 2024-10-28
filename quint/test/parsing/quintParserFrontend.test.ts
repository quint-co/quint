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
  parsePhase4toposort,
} from '../../src/parsing/quintParserFrontend'
import { lf } from 'eol'
import { newIdGenerator } from '../../src/idGenerator'
import { collectIds } from '../util'
import { fileSourceResolver } from '../../src/parsing/sourceResolver'
import { mkErrorMessage } from '../../src/cliCommands'
import { QuintError } from '../../src'

// the name that we are using by default
const defaultSourceName = 'moduleName'

// read a Quint file from the test data directory
function readQuint(name: string): string {
  const p = resolve(__dirname, '../../testFixture', name + '.qnt')
  const content = readFileSync(p).toString('utf8')
  return lf(content)
}

// read the expected JSON outcome from the test data directory
function readJson(name: string): any {
  const p = resolve(__dirname, '../../testFixture', name + '.json')
  return JSONbig.parse(readFileSync(p).toString('utf8'))
}

// parse the text and return all parse errors (of phase 1)
function parseErrorsFrom(sourceName: string, code: string): QuintError[] {
  const gen = newIdGenerator()
  return parsePhase1fromText(gen, code, sourceName).errors
}

// read the Quint file and the expected JSON, parse and compare the results
function parseAndCompare(artifact: string): void {
  // read the expected result as JSON
  const expected = readJson(artifact)
  // We're not interested in testing the contens of the table here
  delete expected.table
  let outputToCompare

  // read the input from the data directory and parse it
  const gen = newIdGenerator()
  const basepath = resolve(__dirname, '../../testFixture')
  const resolver = fileSourceResolver(new Map(), (path: string) => {
    // replace the absolute path with a generic mocked path,
    // so the same fixtures work accross different setups
    return path.replace(basepath, 'mocked_path/testFixture')
  })
  const mainPath = resolver.lookupPath(basepath, `${artifact}.qnt`)
  const phase1Result = parsePhase1fromText(gen, readQuint(artifact), mainPath.toSourceName())
  const phase2Result = parsePhase2sourceResolution(gen, resolver, mainPath, phase1Result)

  const phase3Result = parsePhase3importAndNameResolution(phase2Result)
  const { modules, sourceMap, errors } = parsePhase4toposort(phase3Result)

  if (errors.length === 0) {
    // Only check source map if there are no errors. Otherwise, ids generated for error nodes might be missing from the
    // actual modules
    const expectedIds = modules.flatMap(m => collectIds(m)).sort()
    assert.sameDeepMembers([...sourceMap.keys()].sort(), expectedIds, 'expected source map to contain all ids')
    const expectedSourceMap = readJson(`${artifact}.map`)
    const sourceMapResult = JSONbig.parse(JSONbig.stringify(compactSourceMap(sourceMap)))

    assert.deepEqual(sourceMapResult, expectedSourceMap, 'expected source maps to be equal')
  }
  // All phases succeeded, check that the module is correclty output
  outputToCompare = {
    stage: 'parsing',
    warnings: [],
    modules: modules,
    errors: errors.map(mkErrorMessage(sourceMap)),
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
    const module = { id: 1n, name: 'empty', declarations: [] }
    assert.deepEqual(result.modules[0], module)
  })

  it('parses SuperSpec', () => {
    const result = parsePhase1fromText(
      newIdGenerator(),
      readQuint('SuperSpec'),
      'mocked_path/testFixture/SuperSpec.qnt'
    )
    assert.deepEqual(result.errors, [])
  })

  it('parses SuperSpec correctly', () => {
    parseAndCompare('SuperSpec')
  })

  it('parses out of order definitions', () => {
    parseAndCompare('_0099unorderedDefs')
  })

  it('parses sum types', () => {
    parseAndCompare('_1043sumTypeDecl')
  })

  it('parses polymorphic type declarations', () => {
    parseAndCompare('_1045polymorphicTypeDecl')
  })

  it('parses match expressions', () => {
    parseAndCompare('_1044matchExpression')
  })
})

// instead of testing how errors are produced in json,
// we only test the error messages
describe('syntax errors', () => {
  it('unbalanced module definition', () => {
    const code = 'module empty {'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.equal(errors.length, 1)
    assert.equal(
      errors[0].message,
      `mismatched input '<EOF>' expecting {'}', 'const', 'var', 'assume', 'type', 'val', 'def', 'pure', 'action', 'run', 'temporal', 'nondet', 'import', 'export', DOCCOMMENT}`
    )
    assert.equal(errors[0].code, 'QNT000')
  })

  it('something unexpected in a module definition', () => {
    const code = 'module empty { something }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.equal(errors.length, 1)
    assert.equal(
      errors[0].message,
      `extraneous input 'something' expecting {'}', 'const', 'var', 'assume', 'type', 'val', 'def', 'pure', 'action', 'run', 'temporal', 'nondet', 'import', 'export', DOCCOMMENT}`
    )
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error in a constant definition', () => {
    const code = 'module err { const broken }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].message, `mismatched input '}' expecting {':', '::'}`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on unexpected symbol after expression', () => {
    // syntax error on: p !! name
    const code = 'module unexpectedExpr { def access(p) = p !! name }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `token recognition error at: '!!'`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on unexpected token', () => {
    // ~ is an unexpected token
    const code = 'module unexpectedToken { def access(p) = { p ~ name } }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `token recognition error at: '~'`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on unexpected hash', () => {
    // # is an unexpected token
    const code = 'module unexpectedToken { def access(p) = { p # name } }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `token recognition error at: '# '`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on unexpected hashbang', () => {
    // hashbang '#!' is only valid at the beginning of a file
    const code = 'module unexpectedToken { def access(p) = { p #! name } }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `token recognition error at: '#! name } }'`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on multiple hashbangs', () => {
    // only a single hashbang '#!' is valid at the beginning of a file
    const code = '#!foo\n#!bar\nmodule unexpectedToken { def access = { true } }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `extraneous input '#!bar\\n' expecting {'module', DOCCOMMENT}`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on unexpected token "="', () => {
    // "=" is unexpected
    const code = 'module unexpectedEq { val errorHere = x = 1 }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].message, `unexpected '=', did you mean '=='?`)
    assert.equal(errors[0].code, 'QNT006')
  })

  it('error on hanging operator name', () => {
    // the keyword cardinality is hanging
    const code = 'module hangingCardinality { def one(S) = { S cardinality } }'
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(
      errors[0].message,
      `extraneous input '(' expecting {'}', 'const', 'var', 'assume', 'type', 'val', 'def', 'pure', 'action', 'run', 'temporal', 'nondet', 'import', 'export', DOCCOMMENT}`
    )
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on double spread', () => {
    const code = `module spreadError {
  val rec = { a: 1, b: true }
  val errorRec = { ...rec, ...rec }
  }`
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.equal(errors.length, 1)
    assert.equal(errors[0].message, '... may be used once in { ...record, <fields> }')
    assert.equal(errors[0].code, 'QNT012')
  })

  it('error on single quotes in import', () => {
    // we should use double quotes
    const code = `module singleQuotes {  import I.* from './_1025importeeWithError' }`
    const errors = parseErrorsFrom(defaultSourceName, code)
    assert.isAtLeast(errors.length, 1)
    assert.equal(errors[0].message, `mismatched input ''' expecting STRING`)
    assert.equal(errors[0].code, 'QNT000')
  })

  it('error on type declarations with undeclared variables', () => {
    // we should use double quotes
    const code = `module singleQuotes {  type T = (List[a], Set[b]) }`
    const [error] = parseErrorsFrom(defaultSourceName, code)
    assert.deepEqual(error.code, 'QNT014')
    assert.deepEqual(
      error.message,
      `the type variables a, b are unbound.
E.g., in

   type T = List[a]

type variable 'a' is unbound. To fix it, write

   type T[a] = List[a]`
    )
  })
})

// Test the JSON error output. Most of the tests here should migrate to the
// above test suite called 'syntax errors' or other test suites for the later
// phases. It is sufficient to have a few tests that compare JSON. For the
// rest, we are interested in checking the error messages, not the JSON files.
describe('parse errors', () => {
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

  it('errors on cyclic imports', () => {
    parseAndCompare('_1026importCycleA')
  })

  it('a module with a constant', () => {
    parseAndCompare('_1030const')
  })

  it('an instance', () => {
    parseAndCompare('_1031instance')
  })

  it('docstrings', () => {
    parseAndCompare('_1032docstrings')
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

  it('error on cyclic definitions', () => {
    parseAndCompare('_0100cyclicDefs')
  })

  it('error on accidental recursion', () => {
    parseAndCompare('_0101noRecursion')
  })

  it('errors on invalid record fields', () => {
    parseAndCompare('_1042qualifiersInRecordsFieldsError')
  })
})
