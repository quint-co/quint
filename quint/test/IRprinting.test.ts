import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildDef, buildExpression, buildModuleWithDefs, buildType } from './builders/ir'
import { definitionToString, expressionToString, moduleToString, typeToString } from '../src/IRprinting'
import { toScheme } from '../src/types/base'

describe('moduleToString', () => {
  const quintModule = buildModuleWithDefs(['var S: Set[int]', 'val f = S.filter(x => x + 1)'])

  it('pretty prints the module', () => {
    const expectedModule = `module wrapper {
  var S: Set[int]
  val f = filter(S, ((x) => iadd(x, 1)))
}`
    assert.deepEqual(moduleToString(quintModule), expectedModule)
  })
})

describe('definitionToString', () => {
  it('pretty prints op definitions', () => {
    const def = buildDef('val f = S.filter(x => x + 1)')
    const expectedDef = 'val f = filter(S, ((x) => iadd(x, 1)))'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints typed op definitions', () => {
    const def = buildDef('val f: Set[int] = S.filter(x => x + 1)')
    const expectedDef = 'val f: Set[int] = filter(S, ((x) => iadd(x, 1)))'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints var definitions', () => {
    const def = buildDef('var x: int')
    const expectedDef = 'var x: int'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints const definitions', () => {
    const def = buildDef('const A: int')
    const expectedDef = 'const A: int'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints assume definitions', () => {
    const def = buildDef('assume _ = N > 1')
    const expectedDef = 'assume _ = igt(N, 1)'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints typedef definitions', () => {
    const def = buildDef('type T = int')
    const expectedDef = 'type T = int'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints uninterpreted type definitions', () => {
    const def = buildDef('type T')
    const expectedDef = 'type T'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints import definitions', () => {
    const def = buildDef('import M.*')
    const expectedDef = 'import M.*'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints instance definitions', () => {
    const def = buildDef('import M(x = N + 1, y = 3) as A')
    const expectedDef = 'import M(x = iadd(N, 1), y = 3) as A'
    assert.deepEqual(definitionToString(def), expectedDef)
  })

  it('pretty prints definitions with given type', () => {
    const def = buildDef('val f = 1')
    const expectedDef = 'val f: int = 1'
    assert.deepEqual(definitionToString(def, true, toScheme({ kind: 'int' })), expectedDef)
  })
})

describe('expressionToString', () => {
  it('pretty prints name expressions', () => {
    const expr = buildExpression('myName')
    const expectedExpr = 'myName'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints bool expressions', () => {
    const expr = buildExpression('true')
    const expectedExpr = 'true'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints integer expressions', () => {
    const expr = buildExpression('123')
    const expectedExpr = '123'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints string expressions', () => {
    const expr = buildExpression('"My String!"')
    const expectedExpr = '"My String!"'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints application expressions', () => {
    const expr = buildExpression('S.filter(f(x + 1))')
    const expectedExpr = 'filter(S, f(iadd(x, 1)))'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints lambda expressions', () => {
    const expr = buildExpression('S.map(x => f(x))')
    const expectedExpr = 'map(S, ((x) => f(x)))'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('multi argument lambdas retain correct semantics', () => {
    const expr = buildExpression('foo((f, b) => f(b), 1, 2)')
    const expectedExpr = 'foo(((f, b) => f(b)), 1, 2)'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })

  it('pretty prints let expressions', () => {
    const expr = buildExpression('val x = 1 val y = 2 { x + y }')
    const expectedExpr = 'val x = 1 { val y = 2 { iadd(x, y) } }'
    assert.deepEqual(expressionToString(expr), expectedExpr)
  })
})

describe('typeToString', () => {
  it('pretty prints simple types', () => {
    const type = buildType('(bool, int, str, CONST_TYPE, var_type)')
    const expectedType = '(bool, int, str, CONST_TYPE, var_type)'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints set types', () => {
    const type = buildType('Set[int]')
    const expectedType = 'Set[int]'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints list types', () => {
    const type = buildType('List[int]')
    const expectedType = 'List[int]'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints function types', () => {
    const type = buildType('int -> (bool -> bool) -> str')
    const expectedType = '(int -> ((bool -> bool) -> str))'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints operator types', () => {
    const type = buildType('(int, bool) => str')
    const expectedType = '(int, bool) => str'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints tuple types', () => {
    const type = buildType('(int, bool)')
    const expectedType = '(int, bool)'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints record types', () => {
    const type = buildType('{ name: str, fun: int -> bool, rec: { flag: bool } }')
    const expectedType = '{ name: str, fun: (int -> bool), rec: { flag: bool } }'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints union types', () => {
    const type = buildType('| { tag: "A", a: int } | { tag: "B", b: str }')
    const expectedType = '| { tag: "A", a: int }\n| { tag: "B", b: str }'
    assert.deepEqual(typeToString(type), expectedType)
  })
})
