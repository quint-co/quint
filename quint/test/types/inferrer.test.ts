import { describe, it } from 'mocha'
import { assert } from 'chai'
import { TypeInferenceResult, TypeInferrer } from '../../src/types/inferrer'
import { typeSchemeToString } from '../../src/types/printing'
import { ErrorTree, errorTreeToString } from '../../src/errorTree'
import { parseMockedModule } from '../util'
import { TypeApplicationResolver } from '../../src/types/typeApplicationResolution'

// Utility used to print update `stringType` values to make
// updating the expected values in the following tests less
// painful.
function _printUpdatedStringTypes(stringTypes: (string | bigint)[][]) {
  console.log('[')
  stringTypes.forEach(([n, t]) => console.log(`[${n}n, '${t}'],`))
  console.log(']')
}

describe('inferTypes', () => {
  function inferTypesForModules(text: string): TypeInferenceResult {
    const { modules: parsedModules, table } = parseMockedModule(text)

    // Type inference assumes all type applications (e.g., `Foo[int, str]`) have been resolved.
    const resolver = new TypeApplicationResolver(table)
    const inferrer = new TypeInferrer(table)

    // Used to collect errors found during type application
    let typeAppErrs: Map<bigint, ErrorTree> = new Map()
    const modules = parsedModules.map(m => {
      const [errs, declarations] = resolver.resolveTypeApplications(m.declarations)
      typeAppErrs = new Map([...typeAppErrs, ...errs])
      return { ...m, declarations }
    })
    const [inferenceErrors, inferenceSchemes] = inferrer.inferTypes(modules.flatMap(m => m.declarations))
    const combinedErrors = new Map([...inferenceErrors, ...typeAppErrs])
    return [combinedErrors, inferenceSchemes]
  }

  function inferTypesForDefs(defs: string[]): TypeInferenceResult {
    const text = `module wrapper { ${defs.join('\n')} }`
    return inferTypesForModules(text)
  }

  it('infers types for basic expressions', () => {
    const defs = ['def a = 1 + 2', 'def b(p, q) = p + q', 'val c = val m = 2 { m }', 'def d(S) = S.map(p => p + 10)']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [1n, 'int'],
      [2n, 'int'],
      [3n, 'int'],
      [4n, 'int'],
      [5n, 'int'],
      [6n, 'int'],
      [7n, 'int'],
      [8n, 'int'],
      [9n, 'int'],
      [10n, '(int, int) => int'],
      [11n, '(int, int) => int'],
      [12n, 'int'],
      [13n, 'int'],
      [14n, 'int'],
      [15n, 'int'],
      [16n, 'int'],
      [17n, 'Set[int]'],
      [18n, 'Set[int]'],
      [19n, 'int'],
      [20n, 'int'],
      [21n, 'int'],
      [22n, 'int'],
      [23n, '(int) => int'],
      [24n, 'Set[int]'],
      [25n, '(Set[int]) => Set[int]'],
      [26n, '(Set[int]) => Set[int]'],
    ])
  })

  it('infers types for high-order operators', () => {
    const defs = ['def a(f, p) = f(p)', 'def b(g, q) = g(q) + g(not(q))']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [7n, '(bool) => int'],
      [8n, 'bool'],
      [9n, 'bool'],
      [10n, 'int'],
      [11n, 'bool'],
      [12n, 'bool'],
      [13n, 'int'],
      [14n, 'int'],
      [15n, '((bool) => int, bool) => int'],
      [16n, '((bool) => int, bool) => int'],
      [1n, '(t_p_2) => _t4'],
      [2n, 't_p_2'],
      [3n, 't_p_2'],
      [4n, '_t4'],
      [5n, '((t_p_2) => _t4, t_p_2) => _t4'],
      [6n, '∀ t0, t1 . ((t0) => t1, t0) => t1'],
    ])
  })

  it('infers types for records', () => {
    const defs = [
      'var x: { f1: int, f2: bool }',
      'val m = Set(x, { f1: 1, f2: true })',
      'def e(p) = x.with("f1", p.f1)',
      'val a = e({ f1: 2 }).fieldNames()',
    ]

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [4n, '{ f1: int, f2: bool }'],
      [5n, '{ f1: int, f2: bool }'],
      [7n, 'str'],
      [6n, 'int'],
      [9n, 'str'],
      [8n, 'bool'],
      [10n, '{ f1: int, f2: bool }'],
      [11n, 'Set[{ f1: int, f2: bool }]'],
      [12n, 'Set[{ f1: int, f2: bool }]'],
      [13n, '{ f1: int | tail__t3 }'],
      [14n, '{ f1: int, f2: bool }'],
      [15n, 'str'],
      [16n, '{ f1: int | tail__t3 }'],
      [17n, 'str'],
      [18n, 'int'],
      [19n, '{ f1: int, f2: bool }'],
      [20n, '({ f1: int | tail__t3 }) => { f1: int, f2: bool }'],
      [21n, '∀ r0 . ({ f1: int | r0 }) => { f1: int, f2: bool }'],
      [23n, 'str'],
      [22n, 'int'],
      [24n, '{ f1: int }'],
      [25n, '{ f1: int, f2: bool }'],
      [26n, 'Set[str]'],
      [27n, 'Set[str]'],
    ])
  })

  it('infers types for tuples', () => {
    const defs = ['def e(p, q) = (p._1, q._2)']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [1n, '(_t0 | tail__t0)'],
      [2n, '(tup__t1_0, _t1 | tail__t1)'],
      [3n, '(_t0 | tail__t0)'],
      [4n, 'int'],
      [5n, '_t0'],
      [6n, '(tup__t1_0, _t1 | tail__t1)'],
      [7n, 'int'],
      [8n, '_t1'],
      [9n, '(_t0, _t1)'],
      [10n, '((_t0 | tail__t0), (tup__t1_0, _t1 | tail__t1)) => (_t0, _t1)'],
      [11n, '∀ t0, t1, t2, r0, r1 . ((t0 | r0), (t1, t2 | r1)) => (t0, t2)'],
    ])
  })

  it('infers types for variants', () => {
    const defs = ['type T = A(int) | B', 'val a = variant("A", 3)']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [15n, 'str'],
      [16n, 'int'],
      [17n, '(A(int) | B(()))'],
      [18n, '(A(int) | B(()))'],
      [6n, 'int'],
      [5n, 'str'],
      [7n, 'int'],
      [8n, '(A(int) | B(()))'],
      [9n, '(int) => (A(int) | B(()))'],
      [10n, '(int) => (A(int) | B(()))'],
      [11n, 'str'],
      [12n, '()'],
      [13n, '(B(()) | A(int))'],
      [14n, '(B(()) | A(int))'],
    ])
  })

  it('infers types for different sum type declarations with the same label but different values', () => {
    // See https://github.com/informalsystems/quint/issues/1275
    const text = `
module A {
  type T1 = | A(int)
}

module B {
  type T2 = | A(bool)
}
`

    const [errors, _] = inferTypesForModules(text)
    assert.deepEqual([...errors.entries()], [])
  })

  it('infers types for match expression', () => {
    const defs = ['type T = A(int) | B', 'val a = variant("A", 3)', 'val nine = match a { A(n) => n * n | B => 9 }']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [15n, 'str'],
      [16n, 'int'],
      [17n, '(A(int) | B(()))'],
      [18n, '(A(int) | B(()))'],
      [6n, 'int'],
      [5n, 'str'],
      [7n, 'int'],
      [8n, '(A(int) | B(()))'],
      [9n, '(int) => (A(int) | B(()))'],
      [10n, '(int) => (A(int) | B(()))'],
      [11n, 'str'],
      [12n, '()'],
      [13n, '(B(()) | A(int))'],
      [14n, '(B(()) | A(int))'],
      [19n, '(A(int) | B(()))'],
      [25n, 'str'],
      [27n, 'int'],
      [20n, 'int'],
      [21n, 'int'],
      [22n, 'int'],
      [26n, '(int) => int'],
      [28n, 'str'],
      [30n, '()'],
      [23n, 'int'],
      [29n, '(()) => int'],
      [24n, 'int'],
      [31n, 'int'],
    ])
  })

  it('infers types for match expression with wildcard case', () => {
    const defs = ['type T = A(int) | B', 'val nine : int = match B { _ => 9 }']

    const [errors, _] = inferTypesForDefs(defs)
    assert.isEmpty(errors)
  })

  it('reports a type error for match expressions that return inconsistent types in cases', () => {
    const defs = [
      'type T = A(int) | B',
      'val a = variant("A", 3)',
      'val nine = match a { A(n) => n * n | B => "not an int" }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp("Couldn't unify int and str"))
  })

  it('reports a type error for match expressions with multiple wildcard cases', () => {
    const defs = [
      'type T = A(int) | B | C',
      'val a = variant("A", 3)',
      'val nine = match B { A(n) => "OK" | _ => "first wildcard" | _ => "second, invalid wildcard" }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp('Invalid wildcard match'))
  })

  it('reports a type error for match expressions with non-final wildcard case', () => {
    const defs = [
      'type T = A(int) | B | C',
      'val a = variant("A", 3)',
      'val nine = match B { A(n) => "OK" | _ => "invalid, non-final wildcard" | C => "OK" }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp('Invalid wildcard match'))
  })

  it('reports a type error for match expressions on non-variant expressions', () => {
    const defs = [
      'val notAVariant = "this is not a variant"',
      'val invalid = match notAVariant { A(n) => n * n | B => 9 }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp(`Couldn't unify str and sum`))
  })

  it('reports a type error for matchVariant operator with non-label arguments', () => {
    const defs = ['type T = A(int) | B', 'val a = variant("A", 3)', 'val nine = matchVariant(a, 3, (_ => 9))']

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match(
      [...errors.values()].map(errorTreeToString)[0],
      RegExp('Match variant name must be a string literal but it is a int: 3')
    )
  })

  it('reports a type error for a non-applicable case', () => {
    const defs = [
      'type T = A(int) | B',
      'val a = variant("A", 3)',
      'val nonExhaustive = match a { A(x) => x * x | B => 9 | NotAVariant => 9 }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp(`Couldn't unify empty and row`))
  })

  it('reports a type error for non-exhaustive match', () => {
    const defs = [
      'type T = A(int) | B',
      'val a = variant("A", 3)',
      'val nonExhaustive = match a { NoMatch(x) => x * x }',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors)
    assert.match([...errors.values()].map(errorTreeToString)[0], RegExp('Incompatible tails for rows'))
  })

  it('keeps track of free variables in nested scopes (#966)', () => {
    const defs = ['def f(a) = a == "x"', 'def g(b) = val nested = (1,2) { f(b) }']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    assert.includeDeepMembers(stringTypes, [[15n, '(str) => bool']])
  })

  it('considers annotations', () => {
    const defs = ['def e(p): (int) => int = p']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [1n, 'int'],
      [5n, 'int'],
      [6n, '(int) => int'],
      [7n, '(int) => int'],
    ])
  })

  it('keeps track of free names properly (#693)', () => {
    const defs = ['val b(x: int -> str): int = val c = x.keys() { 1 }']

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // _printUpdatedStringTypes(stringTypes)
    assert.sameDeepMembers(stringTypes, [
      [4n, '(int -> str)'],
      [6n, '(int -> str)'],
      [7n, 'Set[int]'],
      [8n, 'Set[int]'],
      [9n, 'int'],
      [10n, 'int'],
      [11n, '((int -> str)) => int'],
      [12n, '((int -> str)) => int'],
    ])
  })

  it('checks annotations', () => {
    const defs = ['def e(p): (t) => t = p + 1']

    const [errors] = inferTypesForDefs(defs)
    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          4n,
          {
            location: 'Checking type annotation (t) => t',
            children: [
              {
                location: 'Checking variable t',
                message: 'Type annotation is too general: t should be int',
                children: [],
              },
            ],
          },
        ],
      ]
    )
  })

  it('checks correct polymorphic types', () => {
    const defs = [
      'type Option[a] = Some(a) | None',
      'type Result[ok, err] = Ok(ok) | Err(err)',
      `def result_map(r: Result[a, e], f: a => b): Result[b, e] =
          match r {
          | Ok(x)  => Ok(f(x))
          | Err(_) => r
          }`,
      `def option_to_result(o: Option[ok], e: err): Result[ok, err] =
          match o {
          | Some(x) => Ok(x)
          | None    => Err(e)
          }`,
      'val nested_type_application: Result[Option[int], str] = Ok(Some(42))',
    ]

    const [errors, _] = inferTypesForDefs(defs)
    assert.sameDeepMembers([...errors.entries()], [])
  })

  it('fails when polymorphic types are not unifiable', () => {
    const defs = [
      'type Result[ok, err] = Ok(ok) | Err(err)',
      `def result_map(r: Result[bool, e]): Result[int, e] =
          match r {
          | Ok(x)  => Ok(x)
          | Err(_) => r
          }`,
    ]

    const [errors] = inferTypesForDefs(defs)
    assert.isNotEmpty([...errors.entries()])

    const actualErrors = [...errors.entries()].map(e => errorTreeToString(e[1]))
    const expectedError = `Couldn't unify bool and int
Trying to unify bool and int
Trying to unify { Ok: bool, Err: _t5 } and { Ok: int, Err: _t5 }
Trying to unify (Ok(bool) | Err(_t5)) and (Ok(int) | Err(_t5))
Trying to unify ((Ok(bool) | Err(_t5))) => (Ok(bool) | Err(_t5)) and ((Ok(bool) | Err(_t5))) => (Ok(int) | Err(_t5))
`
    assert.deepEqual(actualErrors, [expectedError])
  })

  it('errors when polymorphic types are applied to invalid numbers of arguments', () => {
    const defs = [
      'type Result[ok, err] = Ok(ok) | Err(err)',
      `val too_many: Result[a, b, c] = Ok(1)`,
      `val too_few: Result[a] = Ok(1)`,
    ]

    const [errors] = inferTypesForDefs(defs)
    assert.isNotEmpty([...errors.entries()])

    const actualErrors = [...errors.entries()].map(e => errorTreeToString(e[1]))
    const expectedErrors = [
      `Couldn't unify sum and app
Trying to unify (Ok(int) | Err(_t3)) and Result[a, b, c]
`,
      `too many arguments supplied: Result only accepts 2 parameters
applying type constructor Result to arguments a, b, c
`,
      `too few arguments supplied: Result only accepts 2 parameters
applying type constructor Result to arguments a
`,
    ]
    assert.deepEqual(actualErrors, expectedErrors)
  })

  it('fails when types are not unifiable', () => {
    const defs = ['def a = 1.map(p => p + 10)']

    const [errors] = inferTypesForDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          7n,
          {
            location: 'Trying to unify (Set[_t1], (_t1) => _t2) => Set[_t2] and (int, (int) => int) => _t3',
            children: [
              {
                location: 'Trying to unify Set[_t1] and int',
                message: "Couldn't unify set and int",
                children: [],
              },
            ],
          },
        ],
      ]
    )
  })

  it('prioritizes solving constraints from type annotations', () => {
    // Regression test for https://github.com/informalsystems/quint/issues/1177
    // The point is that we expect to report an error trying to unify a string with a
    const defs = [
      `pure def foo(s: str): int = {
  val x = 1.in(s) // We SHOULD identify an error here, since s is annotated as a str
  val y = s + 1   // and NOT identify an error here, incorrectly expecting s to be a set
  y
}`,
    ]

    const [errors] = inferTypesForDefs(defs)
    const msgs: string[] = [...errors.values()].map(errorTreeToString)
    const expectedMessage = `Couldn't unify set and str
Trying to unify Set[int] and str
Trying to unify (_t0, Set[_t0]) => bool and (int, str) => _t1
`
    assert.equal(msgs[0], expectedMessage)
  })

  it('infers types for tuple destructuring', () => {
    const defs = [
      'val (x, y, z) = (1, 2, 3)',
      'val sum = x + y + z',
      'val (a, _, b) = (10, 20, 30)',
      'val diff = a - b',
    ]

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    // Check that destructured variables have correct types
    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    // All destructured values and computations should be int
    const intTypes = stringTypes.filter(([_, type]) => type === 'int')
    assert.isAtLeast(intTypes.length, 10, 'Should have multiple int-typed values from destructuring')
  })

  it('infers types for record destructuring', () => {
    const defs = [
      'val { x, y } = { x: 1, y: 2, z: 3 }',
      'val sum = x + y',
      'val person = { name: "Alice", age: 30 }',
      'val { name, age } = person',
    ]

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    // Check that we have both int and str types from destructuring
    const stringTypes = Array.from(types.entries()).map(([id, type]) => [id, typeSchemeToString(type)])
    const intTypes = stringTypes.filter(([_, type]) => type === 'int')
    const strTypes = stringTypes.filter(([_, type]) => type === 'str')
    assert.isAtLeast(intTypes.length, 3, 'Should have int values from destructuring')
    assert.isAtLeast(strTypes.length, 1, 'Should have str values from destructuring')
  })

  it('infers types for nested destructuring', () => {
    const defs = [
      'val nested = ((1, 2), (3, 4))',
      'val (first, second) = nested',
      'val (a, b) = first',
      'val (c, d) = second',
      'val total = a + b + c + d',
    ]

    const [errors, types] = inferTypesForDefs(defs)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
  })

  it('reports errors for mismatched tuple destructuring', () => {
    const defs = ['val (x, y) = 42'] // Can't destructure non-tuple

    const [errors] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors, 'Should find type errors')
  })

  it('reports errors for mismatched record destructuring', () => {
    const defs = ['val { x, y } = 42'] // Can't destructure non-record

    const [errors] = inferTypesForDefs(defs)
    assert.isNotEmpty(errors, 'Should find type errors')
  })
})
