// Unit tests for CLI procedures
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, it } from 'mocha'
import { assert } from 'chai'
import { CompiledStage, ErrResult, compile, outputResult, parse, runTests, stage, typecheck } from '../src/cliCommands'
import {
  declaredProperties,
  getInvariants,
  getObservations,
  isMatchingTest,
  noTestsMatchedMessage,
  observationInvariantName,
  propertyExpr,
  propertyFlagErrors,
  propertyFlags,
  toExpr,
} from '../src/cliHelpers'
import { expressionToString } from '../src/ir/IRprinting'
import { QuintError } from '../src/quintError'
import { firstPassInvariants } from '../src/verify'

const exModule = `
module exModule {
  const C: int
  val s: Set[int] = Set(1, 2)
}
`

const loaded = {
  args: {},
  path: 'mocked/path',
  sourceCode: new Map([['mocked/path', exModule]]),
  stage: 'loading' as stage,
  warnings: [],
}

describe('the parse CLI routine', () =>
  it('succeeds with "parsed" status', () => {
    parse(loaded).then(res => res.map(s => assert.equal(s.stage, 'parsing')))
  }))

describe('the typecheck CLI routine', () =>
  it('succeeds with "typechecked" status', () => {
    parse(loaded)
      .then(parsed => parsed.asyncChain(typecheck))
      .then(res => res.map(s => assert.equal(s.stage, 'typechecking')))
  }))

// Module where a state variable named 'step' shadows the default --step action name.
const stepVarModule = `
module stepVarModule {
  var x: int
  var step: int

  action init = all { x' = 0, step' = 0 }
  action doStep = all { x' = x + 1, step' = step + 1 }
  val inv = x >= 0
}
`

const stepVarLoaded = {
  args: {},
  path: 'mocked/stepVar',
  sourceCode: new Map([['mocked/stepVar', stepVarModule]]),
  stage: 'loading' as stage,
  warnings: [],
}

// Module where a val named 'step' shadows the default --step action name.
const stepValModule = `
module stepValModule {
  var x: int
  val step = 42

  action init = all { x' = 0 }
  action doStep = all { x' = x + 1 }
}
`

const stepValLoaded = {
  args: {},
  path: 'mocked/stepVal',
  sourceCode: new Map([['mocked/stepVal', stepValModule]]),
  stage: 'loading' as stage,
  warnings: [],
}

describe('toExpr with expectedRole', () => {
  it('rejects a state variable when expectedRole is action', async () => {
    const parsed = await parse(stepVarLoaded)
    const typechecked = await parsed.asyncChain(typecheck)

    typechecked.map(tc => {
      const result = toExpr(tc, 'step', { kind: 'action', flag: 'step' })
      assert.isTrue(result.isLeft(), 'expected toExpr to return Left for var named step')
      result.mapLeft(err => {
        assert.include(err.message, 'is used by a')
        assert.include(err.message, '--step')
      })
    })
  })

  it('rejects a val when expectedRole is action', async () => {
    const parsed = await parse(stepValLoaded)
    const typechecked = await parsed.asyncChain(typecheck)

    typechecked.map(tc => {
      const result = toExpr(tc, 'step', { kind: 'action', flag: 'step' })
      assert.isTrue(result.isLeft(), 'expected toExpr to return Left for val named step')
      result.mapLeft(err => {
        assert.include(err.message, 'is used by a')
        assert.include(err.message, '--step')
      })
    })
  })

  it('accepts an action when expectedRole is action', async () => {
    const parsed = await parse(stepVarLoaded)
    const typechecked = await parsed.asyncChain(typecheck)

    typechecked.map(tc => {
      const result = toExpr(tc, 'doStep', { kind: 'action', flag: 'step' })
      assert.isTrue(result.isRight(), 'expected toExpr to return Right for action named doStep')
    })
  })

  it('accepts a state variable when expectedRole is not set', async () => {
    const parsed = await parse(stepVarLoaded)
    const typechecked = await parsed.asyncChain(typecheck)

    typechecked.map(tc => {
      const result = toExpr(tc, 'step')
      assert.isTrue(result.isRight(), 'expected toExpr to accept var when no expectedRole')
    })
  })

  it('rejects a state variable named init when expectedRole is action', async () => {
    const initVarModule = `
module initVarModule {
  var x: int
  var init: int
  action myInit = all { x' = 0, init' = 0 }
  action step = all { x' = x + 1, init' = init }
  val inv = x >= 0
}
`
    const initVarLoaded = {
      args: {},
      path: 'mocked/initVar',
      sourceCode: new Map([['mocked/initVar', initVarModule]]),
      stage: 'loading' as stage,
      warnings: [],
    }
    const parsed = await parse(initVarLoaded)
    const typechecked = await parsed.asyncChain(typecheck)

    typechecked.map(tc => {
      const result = toExpr(tc, 'init', { kind: 'action', flag: 'init' })
      assert.isTrue(result.isLeft(), 'expected toExpr to return Left for var named init')
      result.mapLeft(err => {
        assert.include(err.message, 'is used by a')
        assert.include(err.message, '--init')
      })
    })
  })
})

// Issue #2056: `quint test` with no matching definitions must not exit successfully.
const unmatchedModule = `
module trap1 {
  val x = 1
  run runOne = x == 1
}
`

const defaultMatchModule = `
module trap1 {
  val x = 1
  run runOne = x == 1
  run runOneTest = x == 1
}
`

function loadedModule(name: string, source: string, args: Record<string, unknown> = {}) {
  const path = `mocked/${name}.qnt`
  return {
    args: { input: path, verbosity: 0, maxSamples: 1, ...args },
    path,
    sourceCode: new Map([[path, source]]),
    stage: 'loading' as stage,
    warnings: [],
  }
}

async function typecheckModule(name: string, source: string, args: Record<string, unknown> = {}) {
  const parsed = await parse(loadedModule(name, source, args))
  const typechecked = await parsed.asyncChain(typecheck)
  if (typechecked.isLeft()) {
    assert.fail(`typecheck failed: ${typechecked.value.msg}`)
  }
  return typechecked.unwrap()
}

describe('isMatchingTest', () => {
  it('matches names ending in Test when --match is omitted', () => {
    assert.isTrue(isMatchingTest(undefined, 'runOneTest'))
    assert.isFalse(isMatchingTest(undefined, 'runOne'))
  })

  it('uses --match as a regular expression when it is set', () => {
    assert.isTrue(isMatchingTest('runOne', 'runOne'))
    assert.isFalse(isMatchingTest('doesNotExist', 'runOneTest'))
  })
})

function assertNoMatchDiagnostic(err: ErrResult, match?: string) {
  assert.include(err.msg, 'no tests matched')
  assert.include(err.msg, '--match')
  assert.include(err.msg, 'Test')
  if (match) {
    assert.include(err.msg, match)
  }
  assert.deepEqual(err.stage.passed, [])
  assert.deepEqual(err.stage.failed, [])
  assert.deepEqual(err.stage.ignored, [])
  assert.lengthOf(err.stage.errors, 1)
  assert.deepEqual(err.stage.errors[0].locs, [])
  assert.equal(err.stage.errors[0].explanation, err.msg)
}

describe('runTests when no definitions match', () => {
  it('fails and explains the default Test suffix when --match is omitted (#2056)', async () => {
    const typechecked = await typecheckModule('trap1', unmatchedModule)
    const result = await runTests(typechecked)

    assert.isTrue(result.isLeft(), 'expected runTests to fail when nothing matches the default filter')
    result.mapLeft(err => assertNoMatchDiagnostic(err))
  })

  it('runs definitions ending in Test when --match is omitted', async () => {
    const typechecked = await typecheckModule('trap1', defaultMatchModule, { seed: 1n })
    const result = await runTests(typechecked)

    assert.isTrue(result.isRight(), 'expected the default filter to run runOneTest')
    result.map(tested => {
      assert.deepEqual(tested.passed, ['runOneTest'])
      assert.deepEqual(tested.failed, [])
    })
  })

  it('runs a name that does not end in Test when --match selects it', async () => {
    const typechecked = await typecheckModule('trap1', unmatchedModule, { match: 'runOne', seed: 1n })
    const result = await runTests(typechecked)

    assert.isTrue(result.isRight(), 'expected --match runOne to run runOne')
    result.map(tested => {
      assert.deepEqual(tested.passed, ['runOne'])
    })
  })

  it('fails when an explicit --match selects nothing', async () => {
    const typechecked = await typecheckModule('trap1', defaultMatchModule, { match: 'doesNotExist' })
    const result = await runTests(typechecked)

    assert.isTrue(result.isLeft(), 'expected runTests to fail when --match selects nothing')
    result.mapLeft(err => assertNoMatchDiagnostic(err, 'doesNotExist'))
  })

  it('includes the diagnostic in --out JSON (#2056)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'quint-no-match-'))
    const out = join(dir, 'result.json')
    const exit = process.exit
    try {
      const typechecked = await typecheckModule('trap1', unmatchedModule, { out })
      const result = await runTests(typechecked)
      process.exit = ((code?: number) => {
        throw new Error(`exit ${code}`)
      }) as typeof process.exit

      assert.throws(() => outputResult(result), /exit 1/)

      const json = JSON.parse(readFileSync(out, 'utf8'))
      const message = noTestsMatchedMessage(undefined)
      assert.deepEqual(json.passed, [])
      assert.deepEqual(json.failed, [])
      assert.deepEqual(json.ignored, [])
      assert.deepEqual(json.errors, [{ explanation: message, locs: [] }])
      result.mapLeft(err => assert.equal(err.msg, message))
    } finally {
      process.exit = exit
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// A module with two `invariant` definitions and two `observation` definitions
const propertiesModule = `
module propertiesModule {
  var x: int

  action init = x' = 0
  action step = x' = x + 1

  invariant xNonNegative = x >= 0
  invariant xBelowHundred = x < 100
  observation xIsPositive = x > 0
  observation xIsTen = x == 10
}
`

// Main modules that bring the properties of a module in by importing it, by
// instantiating it, and by instantiating it under a qualifier
const importingModules = `
${propertiesModule}

module param {
  const N: int
  var y: int

  action init = y' = 0
  action step = y' = y + 1

  invariant yBelowN = y < N
  observation yIsOne = y == 1
}

module viaImport {
  import propertiesModule.*
}

module viaInstance {
  import param(N = 3).*
}

module viaQualifiedInstance {
  import param(N = 3) as p

  invariant pStarted = p::y >= 0
}
`

async function parseAndTypecheck(path: string, src: string) {
  const parsed = await parse({ args: {}, path, sourceCode: new Map([[path, src]]), stage: 'loading' as stage })
  return parsed.asyncChain(typecheck)
}

describe('declaredProperties', () => {
  it('collects the invariants and observations that the main module declares, in declaration order', async () => {
    const tc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    assert.deepEqual(declaredProperties(tc, 'propertiesModule', 'invariant'), ['xNonNegative', 'xBelowHundred'])
    assert.deepEqual(declaredProperties(tc, 'propertiesModule', 'observation'), ['xIsPositive', 'xIsTen'])
  })

  it('collects the properties of a module imported with .*', async () => {
    const tc = (await parseAndTypecheck('mocked/importing', importingModules)).unwrap()
    assert.deepEqual(declaredProperties(tc, 'viaImport', 'invariant'), ['xNonNegative', 'xBelowHundred'])
    assert.deepEqual(declaredProperties(tc, 'viaImport', 'observation'), ['xIsPositive', 'xIsTen'])
  })

  it('collects the properties of an instance imported with .*', async () => {
    const tc = (await parseAndTypecheck('mocked/importing', importingModules)).unwrap()
    assert.deepEqual(declaredProperties(tc, 'viaInstance', 'invariant'), ['yBelowN'])
    assert.deepEqual(declaredProperties(tc, 'viaInstance', 'observation'), ['yIsOne'])
  })

  it('leaves out the properties of a qualified instance, keeping the main module own ones', async () => {
    const tc = (await parseAndTypecheck('mocked/importing', importingModules)).unwrap()
    assert.deepEqual(declaredProperties(tc, 'viaQualifiedInstance', 'invariant'), ['pStarted'])
    assert.deepEqual(declaredProperties(tc, 'viaQualifiedInstance', 'observation'), [])
  })
})

describe('getInvariants', () => {
  const declared = ['xNonNegative', 'xBelowHundred']

  it('checks the declared invariants when no invariant is given', () => {
    assert.deepEqual(getInvariants({ invariants: [] }, declared), [
      'xNonNegative and xBelowHundred',
      ['xNonNegative', 'xBelowHundred'],
    ])
  })

  it('checks nothing without declared or given invariants', () => {
    assert.deepEqual(getInvariants({}), ['true', []])
  })

  it('replaces the declared invariants with --invariant and --invariants', () => {
    assert.deepEqual(getInvariants({ invariant: 'x < 5' }, declared), ['x < 5', ['x < 5']])
    assert.deepEqual(getInvariants({ invariants: ['xBelowHundred'] }, declared), ['xBelowHundred', ['xBelowHundred']])
    assert.deepEqual(getInvariants({ invariant: 'x < 5', invariants: ['xNonNegative'] }, declared)[1], [
      'x < 5',
      'xNonNegative',
    ])
  })

  it('checks nothing with --invariant true', () => {
    assert.deepEqual(getInvariants({ invariant: 'true' }, declared), ['true', []])
  })

  it('checks nothing with --no-invariant, which yargs parses as invariant: false', () => {
    assert.deepEqual(getInvariants({ invariant: false }, declared), ['true', []])
  })

  it('checks nothing with --no-invariant=true, which yargs parses as noInvariant', () => {
    assert.deepEqual(getInvariants({ noInvariant: true }, declared), ['true', []])
  })
})

describe('getObservations', () => {
  const declared = ['xIsPositive', 'xIsTen']

  it('counts the declared observations, and stops at none', () => {
    assert.deepEqual(getObservations({ observation: [] }, declared), {
      allObservations: ['xIsPositive', 'xIsTen'],
      stoppingObservations: [],
    })
  })

  it('adds the --witnesses and --observation names after the declared ones, and stops at the --observation names', () => {
    assert.deepEqual(getObservations({ witnesses: ['counted'], observation: ['stopper', 'xIsTen'] }, declared), {
      allObservations: ['xIsPositive', 'xIsTen', 'counted', 'stopper'],
      stoppingObservations: [3, 1],
    })
  })

  it('counts an observation once when it is declared and given', () => {
    assert.deepEqual(
      getObservations({ witnesses: ['xIsPositive'], observation: ['xIsPositive', 'xIsPositive'] }, declared),
      {
        allObservations: ['xIsPositive', 'xIsTen'],
        stoppingObservations: [0],
      }
    )
  })
})

describe('resolving the properties given on the command line', () => {
  it('maps each expression to the flag that gives it', () => {
    const flags = propertyFlags({
      invariant: 'x > 0',
      invariants: ['xNonNegative'],
      witnesses: ['x == 1'],
      observation: ['xIsTen', false],
    })
    assert.deepEqual(
      [...flags.entries()],
      [
        ['x > 0', '--invariant'],
        ['xNonNegative', '--invariants'],
        ['x == 1', '--witnesses'],
        ['xIsTen', '--observation'],
      ]
    )
  })

  it('names the flag of an expression that does not resolve', async () => {
    const tc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()

    assert.equal(
      (propertyExpr(tc, '--observation', 'xIsTwn').value as QuintError).message,
      "Name 'xIsTwn' not found (given with --observation)"
    )
    assert.equal((propertyExpr(tc, undefined, 'xIsTwn').value as QuintError).message, "Name 'xIsTwn' not found")
  })

  it('reports no error of an earlier expression for an expression that resolves', async () => {
    const tc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()

    assert.isTrue(toExpr(tc, 'xIsTwn').isLeft())
    assert.isTrue(toExpr(tc, 'xIsTen').isRight())
  })
})

describe('propertyFlagErrors', () => {
  it('accepts flags that can be honoured together', () => {
    assert.deepEqual(propertyFlagErrors({ invariant: 'inv', observation: ['obs'] }), [])
    assert.deepEqual(propertyFlagErrors({ invariant: false, searchObservations: true }), [])
  })

  it('rejects --no-invariant with an invariant, in either order', () => {
    const error = ['--no-invariant cannot be combined with --invariant or --invariants']
    assert.deepEqual(propertyFlagErrors({ invariant: ['inv', false] }), error)
    assert.deepEqual(propertyFlagErrors({ invariant: [false, 'inv'] }), error)
    assert.deepEqual(propertyFlagErrors({ invariant: false, invariants: ['inv'] }), error)
    assert.deepEqual(propertyFlagErrors({ noInvariant: true, invariant: 'inv' }), error)
  })

  it('rejects --no-observation, which yargs parses as observation: [false]', () => {
    assert.deepEqual(propertyFlagErrors({ observation: [false] }), ['Unknown argument: no-observation'])
    assert.deepEqual(propertyFlagErrors({ observation: ['obs', false] }), ['Unknown argument: no-observation'])
  })

  it('rejects --search-observations with --observation, which stops before any search', () => {
    assert.deepEqual(propertyFlagErrors({ observation: ['obs'], searchObservations: true }), [
      '--search-observations cannot be combined with --observation',
    ])
  })
})

describe('compiling the invariants and observations to check', () => {
  it('records what it compiles, with the invariant not(O) for each observation O', async () => {
    const tc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    const compiled = (await compile({ ...tc, args: { observation: ['x == 3'] } })).unwrap()

    assert.deepEqual(compiled.invariants, ['xNonNegative', 'xBelowHundred'])
    assert.deepEqual(compiled.observations, ['x == 3'])
    assert.deepEqual(compiled.stoppingObservations, [0])
    const defs = new Map(
      compiled.mainModule.declarations.flatMap(d => (d.kind === 'def' ? [[d.name, expressionToString(d.expr)]] : []))
    )
    assert.equal(defs.get('q::inv'), 'and(and(xNonNegative, xBelowHundred))')
    assert.equal(defs.get(observationInvariantName(0)), 'not(eq(x, 3))')
  })

  it('compiles the declared observations only to search for them, with --search-observations', async () => {
    const searchingTc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    const searching = (await compile({ ...searchingTc, args: { searchObservations: true } })).unwrap()
    assert.deepEqual(searching.observations, ['xIsPositive', 'xIsTen'])
    assert.deepEqual(searching.stoppingObservations, [])

    const plainTc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    const plain = (await compile({ ...plainTc, args: {} })).unwrap()
    assert.deepEqual(plain.observations, [])
    assert.notInclude(
      plain.mainModule.declarations.map(d => (d.kind === 'def' ? d.name : '')),
      observationInvariantName(0)
    )
  })

  it('checks the invariants and the --observation names in the first model checker run', async () => {
    const stoppingTc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    const stopping = (await compile({ ...stoppingTc, args: { observation: ['x == 3'] } })).unwrap()
    assert.deepEqual(firstPassInvariants(stopping), ['q::inv', observationInvariantName(0)])

    // The declared observations are searched for only after the first run
    const searchingTc = (await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap()
    const searching = (await compile({ ...searchingTc, args: { invariant: false, searchObservations: true } })).unwrap()
    assert.deepEqual(firstPassInvariants(searching), [])
  })

  it('compiles the invariants and observations of an imported instance', async () => {
    const tc = (await parseAndTypecheck('mocked/importing', importingModules)).unwrap()
    const compiled = (await compile({ ...tc, args: { main: 'viaInstance', searchObservations: true } })).unwrap()

    assert.deepEqual(compiled.invariants, ['yBelowN'])
    assert.deepEqual(compiled.observations, ['yIsOne'])
  })

  it('keeps an instance for the Veil backend, which resolves it through the lookup table', async () => {
    const tc = (await parseAndTypecheck('mocked/importing', importingModules)).unwrap()
    const compiled = (
      await compile({
        ...tc,
        args: { main: 'viaQualifiedInstance', init: 'p::init', step: 'p::step', backend: 'veil' },
      })
    ).unwrap()

    const kinds = compiled.mainModule.declarations.map(d => d.kind)
    assert.include(kinds, 'instance')
    assert.notInclude(kinds, 'var')
    assert.deepEqual(compiled.invariants, ['pStarted'])
  })

  it('leaves out their conjunction in a check of Lean proofs, whose spec is then the same for any invariants', async () => {
    // `compile` adds its definitions to the module that it is given, so each one gets a module of its own.
    const compileWith = async (args: object) =>
      (await compile({ ...(await parseAndTypecheck('mocked/properties', propertiesModule)).unwrap(), args })).unwrap()
    const proofs = { backend: 'veil', proofs: 'p.lean', invariants: ['xBelowHundred'] }
    const compiled = await compileWith(proofs)
    const checked = await compileWith({ ...proofs, invariants: ['xNonNegative', 'xBelowHundred'] })
    const modelChecked = await compileWith({ ...proofs, proofs: undefined })
    const names = (stage: CompiledStage) => stage.mainModule.declarations.map(d => (d.kind === 'def' ? d.name : ''))

    assert.deepEqual(compiled.invariants, ['xBelowHundred'])
    assert.notInclude(names(compiled), 'q::inv')
    assert.deepEqual(names(compiled), names(checked))
    assert.include(names(modelChecked), 'q::inv')
  })
})
