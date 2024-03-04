import { assert } from 'chai'
import { describe, it } from 'mocha'
import { flattenModules } from '../../src/flattening/fullFlattener'
import { newIdGenerator } from '../../src/idGenerator'
import { parse, parsePhase3importAndNameResolution } from '../../src/parsing/quintParserFrontend'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { analyzeModules } from '../../src/quintAnalyzer'

describe('flattenModules', () => {
  function assertFlattenedModule(text: string) {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }
    const { modules, table, sourceMap, errors } = parse(idGenerator, 'fake_location', fake_path, text)

    const [analysisErrors, analysisOutput] = analyzeModules(table, modules)

    const { flattenedModules, flattenedTable } = flattenModules(modules, table, idGenerator, sourceMap, analysisOutput)

    it('has proper names in flattened modules', () => {
      const { table, errors: err } = parsePhase3importAndNameResolution({
        modules: flattenedModules,
        sourceMap,
        errors,
      })

      assert.isEmpty(err, 'Failed to parse mocked up module')

      assert.sameDeepMembers(
        [...flattenedTable.entries()].map(([id, def]) => [id, def.id]),
        [...table.entries()].map(([id, def]) => [id, def.id])
      )
    })

    it('has proper analysis output in flattened modules', () => {
      assert.isEmpty(analysisErrors)
    })
  }

  describe('flattenning simple imports', () => {
    const text = `module A {
      val a = 1
    }

    module B {
      import A.*
      val b = a + 1
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning simple instances', () => {
    const text = `module A {
      const N: int
      val a = N
    }

    module B {
      import A(N=1).*
      val b = a + 1
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning simple exports', () => {
    const text = `module A {
      val a = 1
    }

    module B {
      export A.*
    }

    module C {
      import B.*
      val c = a + 1
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning multiple instances', () => {
    const text = `module A {
      const N: int
      val a = N
    }

    module B {
      import A(N=1).*
      val b = a + 1
    }

    module C {
      import A(N=2).*
      val c = a + 1
    }

    module D {
      import B
      import C
      val d = B::b + C::c
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning exports of abstract modules (to be instantiated in another module)', () => {
    const text = `module A {
      const N: int
      val a = N
    }

    module B {
      import A.*
      export A.*
      val b = a + 1
    }

    module C {
      import B(N=1).*
      val c = a + 1
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning exported instance', () => {
    const text = `module A {
      const N: int
      val a = N
    }

    module B {
      import A(N=1) as A1
      val b = A1::a + 1
      export A1
    }

    module C {
      import B.*
      val c = A1::a + b
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning with names that should not conflict', () => {
    const text = `module A {
      val a = 1
      def f(x) = x
    }

    module B {
      var x: int
      import A.*
      val b = a + x
    }

    module C {
      import A.*
      import B
      def g(x) = x + B::x
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning import of single name', () => {
    const text = `module A {
      val a1 = 1
      val a = a1
    }

    module B {
      import A.a
      val b = a + 1
    }

    module C {
      import B.*
      val c = b + 1
    }`

    assertFlattenedModule(text)
  })

  describe('flattenning instances with the same name in different modules', () => {
    const text = `module A {
      const N: int
      val a = N
    }

    module B {
      import A(N=1) as A1
      val b = A1::a + 1
    }

    module C {
      import A(N=1) as A1
      val c = A1::a + 1
    }`

    assertFlattenedModule(text)
  })

  describe('can have definitions with same id but different name (#1141)', () => {
    const text = `module A {
      val a = 1
    }

    module B {
      import A.*
      val b = a
    }

    module C {
      import A.*
      import B as B
      val c = a + B::b
    }`

    assertFlattenedModule(text)
  })

  describe('can have shadowing between different modules (#802)', () => {
    const text = `module A {
      def f(b) = b
    }

    module B {
      import A.*
      val b = f(1)
    }`

    assertFlattenedModule(text)
  })

  // Regression test for https://github.com/informalsystems/quint/issues/1391
  describe('can flatten with polymorphic types between different modules (#802)', () => {
    const text = `module A {
      type Foo[a] = F(a)
      def mapFoo(x: Foo[a], f: a => b): Foo[b] = match x { F(v) => F(f(v)) }
    }

    module B {
      import A.*
      val b: Foo[int] = F("one").mapFoo(_ => 1)
    }`

    assertFlattenedModule(text)
  })
})
