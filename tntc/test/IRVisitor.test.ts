import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/ir'
import { IRVisitor, walkModule } from '../src/IRVisitor'
import { TntEx, TntDef } from '../src/tntIr'
import { definitionToString, expressionToString, typeToString } from '../src/IRprinting'
import { TntType } from '../src/tntTypes'

describe('walkModule', () => {
  const tntModule = buildModuleWithDefs([
    'var a: int',
    'const B: int',
    'type MY_TYPE = int',
    'assume _ = N > 1',
    'import M.*',
    'module A { var x: int }',
    'module A1 = A(x = "rainbow")',
    'val f = S.filter(x -> x + 1)',
    'def l = val x = false { x }',
  ])

  it('finds expressions', () => {
    class TestVisitor implements IRVisitor {
      visited: TntEx[] = []

      visitExpr (expr: TntEx): void {
        this.visited.push(expr)
      }
    }

    const expectedExpressions = [
      'igt(N, 1)',
      'N',
      '1',
      '"rainbow"',
      'filter(S, (x -> iadd(x, 1)))',
      'S',
      '(x -> iadd(x, 1))',
      'iadd(x, 1)',
      'x',
      '1',
      'val x = false { x }',
      'false',
      'x',
    ]

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
  })

  it('finds definitions', () => {
    class TestVisitor implements IRVisitor {
      visited: TntDef[] = []

      visitDef (def: TntDef): void {
        this.visited.push(def)
      }
    }

    const expectedDefinitions = [
      'var a: int',
      'const B: int',
      'type MY_TYPE = int',
      'assume _ = igt(N, 1)',
      'import M.*',
      'module A {\n  var x: int\n}',
      'var x: int', // From inside module A
      'module A1 = A(x = "rainbow")',
      'val f = filter(S, (x -> iadd(x, 1)))',
      'def l = val x = false { x }',
      'val x = false', // From the let definition
    ]

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
  })

  it('finds types', () => {
    class TestVisitor implements IRVisitor {
      visited: TntType[] = []

      visitType (type: TntType): void {
        this.visited.push(type)
      }
    }

    const expectedTypes = [
      'int', // var a: int
      'int', // const B: int
      'int', // type MY_TYPE = int
      'int', // module A {\n  var x: int\n}
    ]

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
  })

  describe('visiting specific definitions', () => {
    it('finds operator definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitOpDef (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'val f = filter(S, (x -> iadd(x, 1)))',
        'def l = val x = false { x }',
        'val x = false', // From the let definition
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds constant definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitConst (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'const B: int',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds variable definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitVar (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'var a: int',
        'var x: int',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds assume definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitAssume (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'assume _ = igt(N, 1)',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds typedef definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitTypeDef (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'type MY_TYPE = int',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds import definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitImport (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'import M.*',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds instance definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitInstance (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'module A1 = A(x = "rainbow")',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })

    it('finds module definitions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntDef[] = []

        visitModuleDef (def: TntDef): void {
          this.visited.push(def)
        }
      }

      const expectedDefinitions = [
        'module A {\n  var x: int\n}',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(definitionToString), expectedDefinitions)
    })
  })

  describe('visiting specific expressions', () => {
    it('finds name expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitName (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        'N',
        'S',
        'x',
        'x',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds bool expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitBool (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        'false',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds integer expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitInt (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        '1',
        '1',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds string expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitStr (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        '"rainbow"',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds application expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitApp (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        'igt(N, 1)',
        'filter(S, (x -> iadd(x, 1)))',
        'iadd(x, 1)',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds lambda expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitLambda (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        '(x -> iadd(x, 1))',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })

    it('finds let expressions', () => {
      class TestVisitor implements IRVisitor {
        visited: TntEx[] = []

        visitLet (expr: TntEx): void {
          this.visited.push(expr)
        }
      }

      const expectedExpressions = [
        'val x = false { x }',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(expressionToString), expectedExpressions)
    })
  })

  describe('visiting specific types', () => {
    const tntModule = buildModuleWithDefs([
      'var a: bool',
      'const b: int',
      'val c: str = "rainbow"',
      'var d: MY_CONST_TYPE',
      'var e: a -> set(a)',
      'var f: set(int)',
      'var g: seq(set(str))',
      'var h: (int -> str) -> seq(bool)',
      'def i: (int, a) => bool = false',
      'var j: (int, seq(bool), MY_CONST_TYPE)',
      'var k: { name: str, age: int }',
      'var l: | { tag: "a", a: int } | { tag: "b", b: bool }',
    ])

    it('finds bool types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitBoolType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'bool', // var a: bool
        'bool', // var h: (int -> str) -> seq(bool)
        'bool', // def i: (int, a) => bool
        'bool', // var j: (int, seq(bool), MY_CONST_TYPE)
        'bool', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds int types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitIntType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'int', // const b: int
        'int', // var f: set(int)
        'int', // var h: (int -> str) -> seq(bool)
        'int', // def i: (int, a) => bool = false
        'int', // var j: (int, seq(bool), MY_CONST_TYPE)
        'int', // var k: { name: str, age: int }
        'int', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds string types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitStrType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'str', // val c: str = "rainbow"
        'str', // var g: seq(set(str))
        'str', // var h: (int -> str) -> seq(bool)
        'str', // var k: { name: str, age: int }
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds const types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitConstType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'MY_CONST_TYPE', // var d: MY_CONST_TYPE
        'MY_CONST_TYPE', // var j: (int, seq(bool), MY_CONST_TYPE)
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds var types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitVarType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'a', // var e: a -> set(a)
        'a', // var e: a -> set(a)
        'a', // def i: (int, a) => bool = false
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds set types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitSetType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'set(a)', // var e: a -> set(a)
        'set(int)', // var f: set(int)
        'set(str)', // var g: seq(set(str))
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds sequence types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitSeqType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        'seq(set(str))', // var g: seq(set(str))
        'seq(bool)', // var h: (int -> str) -> seq(bool)
        'seq(bool)', // var j: (int, seq(bool), MY_CONST_TYPE)
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds function types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitFunType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        '(a -> set(a))', // var e: a -> set(a)
        '((int -> str) -> seq(bool))', // var h: (int -> str) -> seq(bool)
        '(int -> str)', // var h: (int -> str) -> seq(bool)
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds operator types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitOperType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        '(int, a) => bool', // def i: (int, a) => bool = false
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds tuple types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitTupleType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        '(int, seq(bool), MY_CONST_TYPE)', // var j: (int, seq(bool), MY_CONST_TYPE)
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds record types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitRecordType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        '{ name: str, age: int }', // var k: { name: str, age: int }
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })

    it('finds union types', () => {
      class TestVisitor implements IRVisitor {
        visited: TntType[] = []

        visitUnionType (type: TntType): void {
          this.visited.push(type)
        }
      }

      const expectedTypes = [
        '| { tag: "a", a: int }\n| { tag: "b", b: bool }', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.visited.map(typeToString), expectedTypes)
    })
  })
})
