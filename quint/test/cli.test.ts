// Unit tests for CLI procedures
import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parse, runTests, stage, typecheck } from '../src/cliCommands'
import { isMatchingTest, toExpr } from '../src/cliHelpers'

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

describe('runTests when no definitions match', () => {
  it('fails and explains the default Test suffix when --match is omitted (#2056)', async () => {
    const typechecked = await typecheckModule('trap1', unmatchedModule)
    const result = await runTests(typechecked)

    assert.isTrue(result.isLeft(), 'expected runTests to fail when nothing matches the default filter')
    result.mapLeft(err => {
      assert.include(err.msg, 'no tests matched')
      assert.include(err.msg, '--match')
      assert.include(err.msg, 'Test')
    })
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
    result.mapLeft(err => {
      assert.include(err.msg, 'no tests matched')
      assert.include(err.msg, '--match')
      assert.include(err.msg, 'doesNotExist')
      assert.include(err.msg, 'Test')
    })
  })
})
