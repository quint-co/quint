import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/modules'
import { IRVisitor, walkModule } from '../src/IRVisitor'
import { TntEx } from '../src/tntIr'

describe('walkModule', () => {
  const tntModule = buildModuleWithDefs([
    'var a: int',
    'const B: int',
    'type MY_TYPE = int',
    'assume _ = N > 1',
    'import M.*',
    'module A { var x: int }',
    'module A1 = A(x = 33)',
    'val f = S.filter(x -> x + 1)',
    'def l = val x = 2 { x }',
  ])

  it('finds expressions', () => {
    class TestVisitor implements IRVisitor {
      visited: TntEx[] = []

      visitExpr (expr: TntEx): void {
        this.visited.push(expr)
      }
    }

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.visited.length, 13)
  })
})
