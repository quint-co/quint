import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { QuintDef, QuintEx, isFlat } from '../../src/internal_representation/quintIr'
import { moduleToString } from '../../src/internal_representation/IRprinting'
import { IRTransformer, transformModule } from '../../src/internal_representation/IRTransformer'
import { ConcreteRow, QuintType } from '../../src/internal_representation/quintTypes'

const quintModule = buildModuleWithDefs([
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

    const expectedModule = buildModuleWithDefs([
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
})

describe('enterDef', () => {
  it('transforms definitions', () => {
    class TestTransformer implements IRTransformer {
      enterDef(def: QuintDef): QuintDef {
        if (isFlat(def)) {
          return { ...def, name: 'NewName' }
        }

        return def
      }
    }

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModule)

    const expectedModule = buildModuleWithDefs([
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

    const expectedModule = buildModuleWithDefs([
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

    const quintModuleWithRow = buildModuleWithDefs(['type T = { x: int, y: bool }'])

    const transformer = new TestTransformer()
    const result = transformModule(transformer, quintModuleWithRow)

    const expectedModule = buildModuleWithDefs(['type T = { newField: int }'])

    assert.deepEqual(moduleToString(result), moduleToString(expectedModule))
  })
})
