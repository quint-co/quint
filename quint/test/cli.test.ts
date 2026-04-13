// Unit tests for CLI procedures
import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parse, stage, typecheck } from '../src/cliCommands'
import { toExpr } from '../src/cliHelpers'

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
