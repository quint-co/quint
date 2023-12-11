import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildDecl, buildDef, buildExpression, buildModuleWithDecls, buildType } from '../builders/ir'
import {
  declarationToString,
  definitionToString,
  expressionToString,
  moduleToString,
  typeToString,
} from '../../src/ir/IRprinting'
import { toScheme } from '../../src/types/base'
import { QuintSumType, unitType } from '../../src'

describe('moduleToString', () => {
  const quintModule = buildModuleWithDecls(['var S: Set[int]', 'val f = S.filter(x => x + 1)'])

  it('pretty prints the module', () => {
    const expectedModule = `module wrapper {
  var S: Set[int]
  val f = filter(S, ((x) => iadd(x, 1)))
}`
    assert.deepEqual(moduleToString(quintModule), expectedModule)
  })
})

describe('declarationToString', () => {
  it('pretty prints import declarations', () => {
    const decl = buildDecl('import M.*')
    const expectedDecl = 'import M.*'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints import declarations with qualifier', () => {
    const decl = buildDecl('import M as M1')
    const expectedDecl = 'import M as M1'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints import declarations with the module name as qualifier', () => {
    const decl = buildDecl('import M')
    const expectedDecl = 'import M'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints import declarations with from statement', () => {
    const decl = buildDecl('import M.* from "./file"')
    const expectedDecl = 'import M.* from "./file"'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints instance declarations', () => {
    const decl = buildDecl('import M(x = N + 1, y = 3).*')
    const expectedDecl = 'import M(x = iadd(N, 1), y = 3).*'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints instance declarations with qualifier', () => {
    const decl = buildDecl('import M(x = N + 1, y = 3) as A')
    const expectedDecl = 'import M(x = iadd(N, 1), y = 3) as A'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints instance declarations with from statement', () => {
    const decl = buildDecl('import M(x = N + 1, y = 3) as A from "./file"')
    const expectedDecl = 'import M(x = iadd(N, 1), y = 3) as A from "./file"'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints export declarations', () => {
    const decl = buildDecl('export M.*')
    const expectedDecl = 'export M.*'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints export declarations with qualifier', () => {
    const decl = buildDecl('export M as M1')
    const expectedDecl = 'export M as M1'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints export declarations with the module name as qualifier', () => {
    const decl = buildDecl('export M')
    const expectedDecl = 'export M'
    assert.deepEqual(declarationToString(decl), expectedDecl)
  })

  it('pretty prints op definitions', () => {
    const decl = buildDecl('val f = S.filter(x => x + 1)')
    const expectedDecl = 'val f = filter(S, ((x) => iadd(x, 1)))'
    assert.deepEqual(declarationToString(decl), expectedDecl)
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

  it('pretty prints sum types', () => {
    const type: QuintSumType = {
      kind: 'sum',
      fields: {
        kind: 'row',
        fields: [
          { fieldName: 'A', fieldType: { kind: 'int', id: 0n } },
          { fieldName: 'B', fieldType: unitType(0n) },
        ],
        other: { kind: 'empty' },
      },
    }
    const expectedType = '(A(int) | B)'
    assert.deepEqual(typeToString(type), expectedType)
  })

  it('pretty prints type applications', () => {
    const input = 'Result[ok, err]'
    const type = buildType(input)
    assert.deepEqual(typeToString(type), input)
  })
})
