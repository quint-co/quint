import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from './builders/ir'
import { IRVisitor, walkModule } from '../src/IRVisitor'
import { TntDef, TntEx } from '../src/tntIr'
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
    'val f = S.filter(x => x + 1)',
    'def l = val x = false { x }',
  ])

  it('finds expressions', () => {
    class TestVisitor implements IRVisitor {
      entered: TntEx[] = []
      exited: TntEx[] = []

      enterExpr(expr: TntEx): void {
        this.entered.push(expr)
      }

      exitExpr(expr: TntEx): void {
        this.exited.push(expr)
      }
    }

    const enteredExpressions = [
      'igt(N, 1)',
      'N',
      '1',
      '"rainbow"',
      'filter(S, (x => iadd(x, 1)))',
      'S',
      '(x => iadd(x, 1))',
      'iadd(x, 1)',
      'x',
      '1',
      'val x = false { x }',
      'false',
      'x',
    ]

    const exitedExpressions = [
      'N',
      '1',
      'igt(N, 1)',
      '"rainbow"',
      'S',
      'x',
      '1',
      'iadd(x, 1)',
      '(x => iadd(x, 1))',
      'filter(S, (x => iadd(x, 1)))',
      'false',
      'x',
      'val x = false { x }',
    ]

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
    assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
  })

  it('finds definitions', () => {
    class TestVisitor implements IRVisitor {
      entered: TntDef[] = []
      exited: TntDef[] = []

      enterDef(def: TntDef): void {
        this.entered.push(def)
      }

      exitDef(def: TntDef): void {
        this.exited.push(def)
      }
    }

    const enteredDefinitions = [
      `module wrapper {
  var a: int
  const B: int
  type MY_TYPE = int
  assume _ = igt(N, 1)
  import M.*
  module A {
  var x: int
}
  module A1 = A(x = "rainbow")
  val f = filter(S, (x => iadd(x, 1)))
  def l = val x = false { x }
}`,
      'var a: int',
      'const B: int',
      'type MY_TYPE = int',
      'assume _ = igt(N, 1)',
      'import M.*',
      'module A {\n  var x: int\n}',
      'var x: int', // From inside module A
      'module A1 = A(x = "rainbow")',
      'val f = filter(S, (x => iadd(x, 1)))',
      'def l = val x = false { x }',
      'val x = false', // From the let definition
    ]

    const exitedDefinitions = [
      'var a: int',
      'const B: int',
      'type MY_TYPE = int',
      'assume _ = igt(N, 1)',
      'import M.*',
      'var x: int', // From inside module A
      'module A {\n  var x: int\n}',
      'module A1 = A(x = "rainbow")',
      'val f = filter(S, (x => iadd(x, 1)))',
      'val x = false', // From the let definition
      'def l = val x = false { x }',
      `module wrapper {
  var a: int
  const B: int
  type MY_TYPE = int
  assume _ = igt(N, 1)
  import M.*
  module A {
  var x: int
}
  module A1 = A(x = "rainbow")
  val f = filter(S, (x => iadd(x, 1)))
  def l = val x = false { x }
}`,
    ]

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
    assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
  })

  it('finds types', () => {
    class TestVisitor implements IRVisitor {
      entered: TntType[] = []
      exited: TntType[] = []

      enterType(type: TntType): void {
        this.entered.push(type)
      }

      exitType(type: TntType): void {
        this.exited.push(type)
      }
    }

    const enteredTypes = [
      'int', // var a: int
      'int', // const B: int
      'int', // type MY_TYPE = int
      'int', // module A {\n  var x: int\n}
    ]

    const exitedTypes = enteredTypes

    const visitor = new TestVisitor()
    walkModule(visitor, tntModule)
    // assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
    assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
  })

  describe('visiting specific definitions', () => {
    it('finds operator definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterOpDef(def: TntDef): void {
          this.entered.push(def)
        }

        exitOpDef(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'val f = filter(S, (x => iadd(x, 1)))',
        'def l = val x = false { x }',
        'val x = false', // From the let definition
      ]

      const exitedDefinitions = [
        'val f = filter(S, (x => iadd(x, 1)))',
        'val x = false', // From the let definition
        'def l = val x = false { x }',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds constant definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterConst(def: TntDef): void {
          this.entered.push(def)
        }

        exitConst(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'const B: int',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds variable definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterVar(def: TntDef): void {
          this.entered.push(def)
        }

        exitVar(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'var a: int',
        'var x: int',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds assume definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterAssume(def: TntDef): void {
          this.entered.push(def)
        }

        exitAssume(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'assume _ = igt(N, 1)',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds typedef definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterTypeDef(def: TntDef): void {
          this.entered.push(def)
        }

        exitTypeDef(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'type MY_TYPE = int',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds import definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterImport(def: TntDef): void {
          this.entered.push(def)
        }

        exitImport(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'import M.*',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds instance definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterInstance(def: TntDef): void {
          this.entered.push(def)
        }

        exitInstance(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        'module A1 = A(x = "rainbow")',
      ]

      const exitedDefinitions = enteredDefinitions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })

    it('finds module definitions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntDef[] = []
        exited: TntDef[] = []

        enterModuleDef(def: TntDef): void {
          this.entered.push(def)
        }

        exitModuleDef(def: TntDef): void {
          this.exited.push(def)
        }
      }

      const enteredDefinitions = [
        `module wrapper {
  var a: int
  const B: int
  type MY_TYPE = int
  assume _ = igt(N, 1)
  import M.*
  module A {
  var x: int
}
  module A1 = A(x = "rainbow")
  val f = filter(S, (x => iadd(x, 1)))
  def l = val x = false { x }
}`,
        'module A {\n  var x: int\n}',
      ]

      const exitedDefinitions = [
        'module A {\n  var x: int\n}',
        `module wrapper {
  var a: int
  const B: int
  type MY_TYPE = int
  assume _ = igt(N, 1)
  import M.*
  module A {
  var x: int
}
  module A1 = A(x = "rainbow")
  val f = filter(S, (x => iadd(x, 1)))
  def l = val x = false { x }
}`,
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(d => definitionToString(d)), enteredDefinitions)
      assert.deepEqual(visitor.exited.map(d => definitionToString(d)), exitedDefinitions)
    })
  })

  describe('visiting specific expressions', () => {
    it('finds name expressions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntEx[] = []
        exited: TntEx[] = []

        enterName(expr: TntEx): void {
          this.entered.push(expr)
        }

        exitName(expr: TntEx): void {
          this.exited.push(expr)
        }
      }

      const enteredExpressions = [
        'N',
        'S',
        'x',
        'x',
      ]

      const exitedExpressions = enteredExpressions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
      assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
    })

    it('finds literal expressions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntEx[] = []
        exited: TntEx[] = []

        enterLiteral(expr: TntEx): void {
          this.entered.push(expr)
        }

        exitLiteral(expr: TntEx): void {
          this.exited.push(expr)
        }
      }

      const enteredExpressions = [
        '1',
        '"rainbow"',
        '1',
        'false',
      ]

      const exitedExpressions = enteredExpressions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
      assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
    })

    it('finds application expressions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntEx[] = []
        exited: TntEx[] = []

        enterApp(expr: TntEx): void {
          this.entered.push(expr)
        }

        exitApp(expr: TntEx): void {
          this.exited.push(expr)
        }
      }

      const enteredExpressions = [
        'igt(N, 1)',
        'filter(S, (x => iadd(x, 1)))',
        'iadd(x, 1)',
      ]

      const exitedExpressions = [
        'igt(N, 1)',
        'iadd(x, 1)',
        'filter(S, (x => iadd(x, 1)))',
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
      assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
    })

    it('finds lambda expressions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntEx[] = []
        exited: TntEx[] = []

        enterLambda(expr: TntEx): void {
          this.entered.push(expr)
        }

        exitLambda(expr: TntEx): void {
          this.exited.push(expr)
        }
      }

      const enteredExpressions = [
        '(x => iadd(x, 1))',
      ]

      const exitedExpressions = enteredExpressions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
      assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
    })

    it('finds let expressions', () => {
      class TestVisitor implements IRVisitor {
        entered: TntEx[] = []
        exited: TntEx[] = []

        enterLet(expr: TntEx): void {
          this.entered.push(expr)
        }

        exitLet(expr: TntEx): void {
          this.exited.push(expr)
        }
      }

      const enteredExpressions = [
        'val x = false { x }',
      ]

      const exitedExpressions = enteredExpressions

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(expressionToString), enteredExpressions)
      assert.deepEqual(visitor.exited.map(expressionToString), exitedExpressions)
    })
  })

  describe('visiting specific types', () => {
    const tntModule = buildModuleWithDefs([
      'var a: bool',
      'const b: int',
      'val c: str = "rainbow"',
      'var d: MY_CONST_TYPE',
      'var e: a -> Set[a]',
      'var f: Set[int]',
      'var g: List[Set[str]]',
      'var h: (int -> str) -> List[bool]',
      'def i: (int, a) => bool = false',
      'var j: (int, List[bool], MY_CONST_TYPE)',
      'var k: { name: str, age: int }',
      'var l: | { tag: "a", a: int } | { tag: "b", b: bool }',
    ])

    it('finds literal types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterLiteralType(type: TntType): void {
          this.entered.push(type)
        }

        exitLiteralType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        'bool', // var a: bool
        'int', // const b: int
        'str', // val c: str = "rainbow"
        'int', // var f: Set[int]
        'str', // var g: List[Set[str]]
        'int', // var h: (int -> str) -> List[bool]
        'str', // var h: (int -> str) -> List[bool]
        'bool', // var h: (int -> str) -> List[bool]
        'int', // def i: (int, a) => bool = false
        'bool', // def i: (int, a) => bool
        'int', // var j: (int, List[bool], MY_CONST_TYPE)
        'bool', // var j: (int, List[bool], MY_CONST_TYPE)
        'str', // var k: { name: str, age: int }
        'int', // var k: { name: str, age: int }
        'int', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
        'bool', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds const types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterConstType(type: TntType): void {
          this.entered.push(type)
        }

        exitConstType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        'MY_CONST_TYPE', // var d: MY_CONST_TYPE
        'MY_CONST_TYPE', // var j: (int, list(bool), MY_CONST_TYPE)
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds var types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterVarType(type: TntType): void {
          this.entered.push(type)
        }

        exitVarType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        'a', // var e: a -> Set[a]
        'a', // var e: a -> Set[a]
        'a', // def i: (int, a) => bool = false
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds set types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterSetType(type: TntType): void {
          this.entered.push(type)
        }

        exitSetType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        'Set[a]', // var e: a -> Set[a]
        'Set[int]', // var f: Set[int]
        'Set[str]', // var g: List[Set[str]]
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds list types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterSeqType(type: TntType): void {
          this.entered.push(type)
        }

        exitSeqType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        'List[Set[str]]', // var g: List[Set[str]]
        'List[bool]', // var h: (int -> str) -> List[bool]
        'List[bool]', // var j: (int, List[bool], MY_CONST_TYPE)
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds function types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterFunType(type: TntType): void {
          this.entered.push(type)
        }

        exitFunType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        '(a -> Set[a])', // var e: a -> Set[a]
        '((int -> str) -> List[bool])', // var h: (int -> str) -> List[bool]
        '(int -> str)', // var h: (int -> str) -> List[bool]
      ]

      const exitedTypes = [
        '(a -> Set[a])', // var e: a -> Set[a]
        '(int -> str)', // var h: (int -> str) -> List[bool]
        '((int -> str) -> List[bool])', // var h: (int -> str) -> List[bool]
      ]

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds operator types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterOperType(type: TntType): void {
          this.entered.push(type)
        }

        exitOperType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        '(int, a) => bool', // def i: (int, a) => bool = false
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds tuple types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterTupleType(type: TntType): void {
          this.entered.push(type)
        }

        exitTupleType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        '(int, List[bool], MY_CONST_TYPE)', // var j: (int, list(bool), MY_CONST_TYPE)
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds record types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterRecordType(type: TntType): void {
          this.entered.push(type)
        }

        exitRecordType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        '{ name: str, age: int }', // var k: { name: str, age: int }
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })

    it('finds union types', () => {
      class TestVisitor implements IRVisitor {
        entered: TntType[] = []
        exited: TntType[] = []

        enterUnionType(type: TntType): void {
          this.entered.push(type)
        }

        exitUnionType(type: TntType): void {
          this.exited.push(type)
        }
      }

      const enteredTypes = [
        '| { tag: "a", a: int }\n| { tag: "b", b: bool }', // var l: | { tag: "a", a: int } | { tag: "b", b: bool }
      ]

      const exitedTypes = enteredTypes

      const visitor = new TestVisitor()
      walkModule(visitor, tntModule)
      assert.deepEqual(visitor.entered.map(typeToString), enteredTypes)
      assert.deepEqual(visitor.exited.map(typeToString), exitedTypes)
    })
  })
})
