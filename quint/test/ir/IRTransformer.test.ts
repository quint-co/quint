import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDecls } from '../builders/ir'
import { QuintDeclaration, QuintDef, QuintEx, isDef } from '../../src/ir/quintIr'
import { moduleToString } from '../../src/ir/IRprinting'
import { IRTransformer, transformModule } from '../../src/ir/IRTransformer'
import { ConcreteRow, QuintType } from '../../src/ir/quintTypes'

const quintModule = buildModuleWithDecls([
  'var a: int',
  'const B: int',
  'type MY_TYPE = int',
  'assume _ = N > 1',
  'import M.*',
  'import A(x = "rainbow") as A1',
  'val f = S.filter(x => x + 1)',
  'def l = val x = false { x }',
])

describe('enterExpr', () => {
  it('transforms expressions', () => {
    class TestTransformer implements IRTransformer {
      enterExpr(expr: QuintEx): QuintEx {
        return { kind: 'int', value: 42n, id: expr.id }
      }
    }

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModule)

    const expectedModule = buildModuleWithDecls([
      'var a: int',
      'const B: int',
      'type MY_TYPE = int',
      'assume _ = 42',
      'import M.*',
      'import A(x = 42) as A1',
      'val f = 42',
      'def l = 42',
    ])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })

  it('transforms parameter type annotations', () => {
    class TestTransformer implements IRTransformer {
      exitType(_: QuintType): QuintType {
        return { kind: 'var', name: 'trans' }
      }
    }

    const transformer = new TestTransformer()

    const m = buildModuleWithDecls(['def foo(x: int, b: int, c: str): int = 42'])

    const transformedDecl = transformModule(transformer, m).declarations[0]
    assert(transformedDecl.kind === 'def')
    assert(transformedDecl.expr.kind === 'lambda')
    transformedDecl.expr.params.forEach(p => {
      assert(p.typeAnnotation)
      assert.deepEqual(p.typeAnnotation, { kind: 'var', name: 'trans' })
    })
  })
})

describe('enterDecl', () => {
  it('transforms declarations', () => {
    class TestTransformer implements IRTransformer {
      enterDecl(decl: QuintDeclaration): QuintDeclaration {
        if (isDef(decl)) {
          return { ...decl, name: 'NewName' }
        } else {
          return { ...decl, protoName: 'NewModuleName' }
        }
      }
    }

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModule)

    const expectedModule = buildModuleWithDecls([
      'var NewName: int',
      'const NewName: int',
      'type NewName = int',
      'assume NewName = N > 1',
      'import NewModuleName.*',
      'import NewModuleName(x = "rainbow") as A1',
      'val NewName = S.filter(x => x + 1)',
      'def NewName = val x = false { x }',
    ])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })
})

describe('enterDef', () => {
  it('transforms definitions', () => {
    class TestTransformer implements IRTransformer {
      enterDef(def: QuintDef): QuintDef {
        return { ...def, name: 'NewName' }
      }
    }

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModule)

    const expectedModule = buildModuleWithDecls([
      'var NewName: int',
      'const NewName: int',
      'type NewName = int',
      'assume NewName = N > 1',
      'import M.*',
      'import A(x = "rainbow") as A1',
      'val NewName = S.filter(x => x + 1)',
      'def NewName = val NewName = false { x }',
    ])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })
})

describe('enterType', () => {
  it('transforms types', () => {
    class TestTransformer implements IRTransformer {
      enterType(type: QuintType): QuintType {
        return { kind: 'bool', id: type.id }
      }
    }

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModule)

    const expectedModule = buildModuleWithDecls([
      'var a: bool',
      'const B: bool',
      'type MY_TYPE = bool',
      'assume _ = N > 1',
      'import M.*',
      'import A(x = "rainbow") as A1',
      'val f = S.filter(x => x + 1)',
      'def l = val x = false { x }',
    ])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })
})

describe('enterConcreteRow', () => {
  it('transforms rows', () => {
    class TestTransformer implements IRTransformer {
      enterConcreteRow(row: ConcreteRow): ConcreteRow {
        return { ...row, fields: [{ fieldName: 'newField', fieldType: { kind: 'int' } }] }
      }
    }

    const quintModuleWithRow = buildModuleWithDecls(['type T = { x: int, y: bool }'])

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModuleWithRow)

    const expectedModule = buildModuleWithDecls(['type T = { newField: int }'])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })
})
