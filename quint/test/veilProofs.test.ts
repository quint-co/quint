import { describe, it } from 'mocha'
import { assert } from 'chai'
import fc from 'fast-check'
import { Either } from '@sweet-monads/either'
import {
  LeanJsonMessage,
  ProofFile,
  obligationName,
  proofSource,
  proofSources,
  readProofChecks,
  writtenSorries,
} from '../src/veilProofs'

/** A proof file as an agent writes it, with the line numbers its checks refer to. */
const PROOFS = [
  'module',
  '',
  'public import Quint',
  '',
  'quint_module "../specs/flag.qnt" (main := flag)',
  '  (invariants := [typed, (down)])',
  '',
  'theorem typed_holds : holds% typed := by',
  '  intros',
  '  unfold typed',
  '  simp',
  '',
  'end flag',
].join('\n')

describe('the Lean file that checks a proof file', () => {
  const checked = sources(proofSource(PROOFS, 'flag', ['typed', 'RM::down']))
  const lines = checked.source('Quint.Cache.S0123').split('\n')

  it('imports the module that loads the compiled spec, and re-opens its module where the file loads the spec', () => {
    assert.equal(lines[2], 'public import Quint.Cache.S0123 public import Quint')
    assert.equal(lines[4], 'veil module flag')
    assert.equal(lines[5], '')
    assert.deepEqual(lines.slice(6, 12), PROOFS.split('\n').slice(6, 12))
  })

  it('gives the options of the file, which the module that loads the spec takes', () => {
    assert.deepEqual(checked.options, [
      { name: 'main', value: 'flag' },
      { name: 'invariants', value: '[typed, (down)]' },
    ])
  })

  it('keeps every line of the file where it is, however the options of quint_module are spread', () => {
    const separator = fc.constantFrom(' ', '\n', '\n  ', '\n\n', '  ')
    fc.assert(
      fc.property(fc.array(separator, { minLength: 2, maxLength: 2 }), ([beforeMain, beforeInvariants]) => {
        const load = `quint_module "flag.qnt"${beforeMain}(main := flag)${beforeInvariants}(invariants := [typed])  -- loads`
        const proofs = [
          'module',
          'public import Quint',
          'import Bridge -- the steps',
          load,
          'theorem typed_holds : holds% typed := by',
          'end flag',
        ].join('\n')
        const loadLines = load.split('\n').length

        const checking = sources(proofSource(proofs, 'flag', ['typed']))
          .source('Quint.Cache.S0', m => (m === 'Bridge' ? 'Quint.Cache.P0.Bridge' : undefined))
          .split('\n')

        assert.equal(checking[2], 'import Quint.Cache.P0.Bridge -- the steps')
        assert.equal(checking[3], `veil module flag${loadLines === 1 ? '  -- loads' : ''}`)
        assert.deepEqual(checking.slice(3 + loadLines, 4 + loadLines), ['theorem typed_holds : holds% typed := by'])
        assert.equal(checking[checking.length - 1], 'end flag')
        assert.equal(checking.length, proofs.split('\n').length + 2)
      })
    )
  })

  it('imports the module outside the module system as the file does, and ahead of a comment on its import', () => {
    const plain = PROOFS.replace('module\n', '\n').replace('public import Quint', 'import Quint -- the library')

    const checking = sources(proofSource(plain, 'flag', ['typed']))
      .source('Quint.Cache.S0')
      .split('\n')

    assert.equal(checking[2], 'import Quint.Cache.S0 import Quint -- the library')
  })

  it('refuses a file that imports nothing before it loads the spec', () => {
    const unimported = PROOFS.replace('public import Quint', '')

    assert.equal(
      refusal(proofSource(unimported, 'flag', ['typed'])),
      'the proof file imports nothing before its quint_module'
    )
  })

  it('states each obligation itself before the module ends, and prints the axioms of its theorem', () => {
    assert.deepEqual(lines.slice(12), [
      'example : holds% typed := typed_holds',
      '#print axioms typed_holds',
      'example : holds% «RM::down» := «RM::down_holds»',
      '#print axioms «RM::down_holds»',
      'end flag',
    ])
    assert.deepEqual(
      [...checked.checkedAt],
      [
        [13, 'typed'],
        [14, 'typed'],
        [15, 'RM::down'],
        [16, 'RM::down'],
      ]
    )
  })

  it('states the obligation of a temporal property, holds_temporal%, after those of the invariants', () => {
    const temporal = PROOFS.replace('(main := flag)', '(main := flag) (temporalProps := [settles])')
    const checking = sources(proofSource(temporal, 'flag', ['typed'], 'the proof file', ['settles']))

    assert.deepEqual(checking.source('Quint.Cache.S0123').split('\n').slice(12), [
      'example : holds% typed := typed_holds',
      '#print axioms typed_holds',
      'example : holds_temporal% settles := settles_holds',
      '#print axioms settles_holds',
      'end flag',
    ])
    assert.deepEqual(
      [...checking.checkedAt],
      [
        [13, 'typed'],
        [14, 'typed'],
        [15, 'settles'],
        [16, 'settles'],
      ]
    )
  })

  it('refuses a file that loads no spec, or more than one', () => {
    const unloaded = { text: 'theorem t : True := trivial', path: 'proofs/flag.lean' }
    assert.equal(
      refusal(proofSources(unloaded, () => undefined, 'flag', ['typed'], [])),
      'the proof file loads no spec with quint_module'
    )
    const twice = `${PROOFS}\nquint_module "other.qnt"`
    assert.equal(
      refusal(proofSource(twice, 'flag', ['typed'])),
      'the proof file loads more than one spec with quint_module'
    )
  })

  it('refuses an option that changes the spec, and another main module', () => {
    const stepped = PROOFS.replace('(main := flag)', '(main := flag) (step := idle)')
    assert.equal(
      refusal(proofSource(stepped, 'flag', ['typed'])),
      "the proof file's quint_module sets step, which changes the spec that the proofs are about"
    )
    const other = PROOFS.replace('(main := flag)', '(main := flag3)')
    assert.equal(
      refusal(proofSource(other, 'flag', ['typed'])),
      "the proof file's quint_module loads the module flag3, not flag"
    )
  })
})

describe('the other files of a proof', () => {
  const load = 'quint_module "../specs/flag.qnt" (main := flag)\n  (invariants := [typed, (down)])'
  const folder = new Map([
    ['Bridge', ['import Quint', 'import Lemmas', '', load, '', 'theorem bridge : True := trivial', '', 'end flag']],
    ['Lemmas', ['import Quint', '', 'theorem lemma : True := trivial']],
    ['Unused', ['import Quint', load, 'end flag']],
  ])
  const read = (files: Map<string, string[]>) => (module: string) => {
    const lines = files.get(module)
    return lines === undefined ? undefined : { text: lines.join('\n'), path: `proofs/${module}.lean` }
  }
  const proofs = { text: PROOFS.replace('public import Quint', 'public import Quint\npublic import Bridge'), path: 'p' }
  const { entry, modules } = sources(proofSources(proofs, read(folder), 'flag', ['typed'], []))
  const moduleOf = (m: string) => (modules.has(m) ? `Quint.Cache.P1.${m}` : undefined)

  it('are the files of its folder that the proof file imports, directly or through one another, and no other', () => {
    assert.deepEqual([...modules.keys()].sort(), ['Bridge', 'Lemmas'])
    assert.equal(modules.get('Lemmas')?.path, 'proofs/Lemmas.lean')
  })

  it('are imported by the names of the modules that check them, on the lines that import them', () => {
    const checking = entry.source('Quint.Cache.S0', moduleOf).split('\n')
    const bridge = modules.get('Bridge')?.checked.source('Quint.Cache.S0', moduleOf).split('\n')

    assert.deepEqual(checking.slice(2, 4), [
      'public import Quint.Cache.S0 public import Quint',
      'public import Quint.Cache.P1.Bridge',
    ])
    assert.deepEqual(bridge?.slice(0, 5), [
      'import Quint.Cache.S0 import Quint',
      'import Quint.Cache.P1.Lemmas',
      '',
      'veil module flag',
      '',
    ])
    assert.equal(bridge?.length, folder.get('Bridge')?.join('\n').split('\n').length)
  })

  it('leaves a file that loads no spec as it is, but for its imports', () => {
    const lemmas = modules.get('Lemmas')?.checked

    assert.equal(lemmas?.source('Quint.Cache.S0', moduleOf), folder.get('Lemmas')?.join('\n'))
    assert.isUndefined(lemmas?.options)
  })

  it('refuses a file that loads the spec with other options than the proof file, but not the same ones spread otherwise', () => {
    const fewer = new Map([
      ...folder,
      ['Bridge', ['import Quint', 'quint_module "x.qnt" (main := flag) (invariants := [typed])']],
    ])
    const spread = new Map([
      ...folder,
      ['Bridge', ['import Quint', 'quint_module "x.qnt" (invariants := [typed,(down)]) (main := flag)']],
    ])

    assert.equal(
      refusal(proofSources(proofs, read(fewer), 'flag', ['typed'], [])),
      'proofs/Bridge.lean loads the spec with other quint_module options than the proof file'
    )
    assert.isTrue(proofSources(proofs, read(spread), 'flag', ['typed'], []).isRight())
  })

  it('are refused as the proof file is, by their own paths', () => {
    const stepped = new Map([...folder, ['Lemmas', ['import Quint', `${load} (step := idle)`]]])

    assert.equal(
      refusal(proofSources(proofs, read(stepped), 'flag', ['typed'], [])),
      "proofs/Lemmas.lean's quint_module sets step, which changes the spec that the proofs are about"
    )
  })
})

describe('the invariants that a proof file names', () => {
  const proofs = (text: string): ProofFile => ({ text, path: 'proofs/flag.lean' })
  const check = (text: string, invariants: string[], declared: string[]) =>
    proofSources(proofs(text), () => undefined, 'flag', invariants, declared)

  it('are the ones that a proof is checked for, with those that the spec declares unless it says otherwise', () => {
    const named = PROOFS.replace('[typed, (down)]', '[typed, «RM::down»]')
    const undeclared = named.replace('(main := flag)', '(main := flag) (declared := false)')

    assert.isTrue(check(named, ['typed', 'RM::down', 'up'], ['up']).isRight())
    assert.equal(
      refusal(check(named, ['typed', 'up', 'idle'], [])),
      "the proof file's quint_module does not name up, idle: add them to (invariants := [...])"
    )
    assert.equal(
      refusal(check(undeclared, ['typed', 'up'], ['up'])),
      "the proof file's quint_module does not name up: add it to (invariants := [...])"
    )
  })
})

describe('the temporal properties that a proof file names', () => {
  const proofs = (text: string): ProofFile => ({ text, path: 'proofs/flag.lean' })
  const check = (text: string, temporal: string[]) =>
    proofSources(proofs(text), () => undefined, 'flag', ['typed'], [], temporal)
  const named = PROOFS.replace('(main := flag)', '(main := flag) (temporalProps := [settles, «RM::calm»])')

  it('are exactly the ones that a proof is checked for, since they decide the actions of the module', () => {
    assert.isTrue(check(named, ['RM::calm', 'settles']).isRight())
    assert.equal(
      refusal(check(named, ['settles'])),
      "the proof file's quint_module names the temporal properties settles, RM::calm, and the check proves " +
        'settles: they must be the same, since they decide the actions of the module'
    )
    assert.equal(
      refusal(check(PROOFS, ['settles'])),
      "the proof file's quint_module names the temporal properties none, and the check proves settles: they " +
        'must be the same, since they decide the actions of the module'
    )
  })
})

describe('what Lean says of a proof file', () => {
  // The check adds the lines 13 to 18: an `example` and a `#print axioms` for each invariant.
  const checked = sources(proofSource(PROOFS, 'flag', ['typed', 'down', 'up']))
  const STANDARD = 'propext, Classical.choice, Quot.sound'
  const modules = new Map([['Quint/Cache/P1/Bridge.lean', 'proofs/Bridge.lean']])

  it('counts a theorem that states the obligation and rests on Lean’s standard axioms alone', () => {
    const output = axioms(14, 'typed_holds', STANDARD)

    assert.deepInclude(readProofChecks(output, checked, ['typed'], 'proofs/flag.lean').checks, {
      property: 'typed',
      status: 'proved',
    })
  })

  it('does not count a sorry, a theorem that states something else, or one that Lean never checked', () => {
    const output = [
      axioms(14, 'typed_holds', 'propext, sorryAx, Classical.choice, Quot.sound'),
      lean('error', 15, 'Type mismatch'),
      axioms(16, 'down_holds', 'propext'),
    ].join('\n')

    const { checks } = readProofChecks(output, checked, ['typed', 'down', 'up'], 'proofs/flag.lean')

    assert.deepEqual(checks, [
      {
        property: 'typed',
        status: 'not proved',
        reason: 'its proof rests on sorryAx, which a sorry, an unfinished proof or a trusted SMT answer leaves',
      },
      { property: 'down', status: 'not proved', reason: 'down_holds does not prove holds% down: Type mismatch' },
      { property: 'up', status: 'not proved', reason: 'Lean did not check up_holds' },
    ])
  })

  it('names the errors of each file of the proof by its path and lines, and leaves out those of the checks', () => {
    const output = [
      'error: ./././Quint/Cache/P1/Bridge.lean:17:2: Unknown identifier',
      lean('error', 9, 'unsolved goals'),
      lean('error', 15, 'Type mismatch'),
    ].join('\n')

    const read = readProofChecks(output, checked, ['typed', 'up'], 'proofs/flag.lean', modules)

    assert.deepEqual(read.errors, [
      'proofs/Bridge.lean:17:2: Unknown identifier',
      'proofs/flag.lean:9:4: unsolved goals',
    ])
    assert.deepInclude(read.checks, { property: 'up', status: 'not proved', reason: 'Lean did not check up_holds' })
  })

  it('gives each error in full, with the goal that the proof left', () => {
    const goal = ['s : State', 'h : s.n < 6', '', '⊢ s.n ≤ 6']
    const output = [
      'error: Quint/Cache/P1/Bridge.lean:17:2: Tactic `rfl` failed: The left-hand side',
      '  1',
      'is not definitionally equal to the right-hand side',
      '  2',
      'Some required targets logged failures:',
      '- Quint.Cache.P1.Bridge',
      'error: build failed',
      lean('error', 9, ['unsolved goals', ...goal].join('\n')),
    ].join('\n')

    const { errors } = readProofChecks(output, checked, ['typed'], 'proofs/flag.lean', modules)

    assert.deepEqual(errors, [
      [
        'proofs/Bridge.lean:17:2: Tactic `rfl` failed: The left-hand side',
        '  1',
        'is not definitionally equal to the right-hand side',
        '  2',
      ].join('\n'),
      ['proofs/flag.lean:9:4: unsolved goals', ...goal].join('\n'),
    ])
  })

  it('proves no invariant when a file of the proof has an error, even one whose theorem checks', () => {
    const output = [axioms(14, 'typed_holds', STANDARD), lean('error', 9, 'unsolved goals')].join('\n')

    const read = readProofChecks(output, checked, ['typed'], 'proofs/flag.lean')

    assert.deepEqual(read.checks, [
      { property: 'typed', status: 'not proved', reason: 'the files of the proof have errors' },
    ])
    assert.deepEqual(read.errors, ['proofs/flag.lean:9:4: unsolved goals'])
  })

  it('reports a message after the checks at its line in the proof file', () => {
    // `end flag` is line 13 of PROOFS, and line 19 of the checked file, after the six lines of the checks.
    const output = lean('error', 19, "invalid 'end'")

    const { errors } = readProofChecks(output, checked, ['typed', 'down', 'up'], 'proofs/flag.lean')

    assert.deepEqual(errors, ["proofs/flag.lean:13:4: invalid 'end'"])
  })

  it('gives the other messages of the files of the proof, but not those of the checks, of other modules or of Veil', () => {
    const output = [
      'warning: Quint/Cache/S0123.lean:5:0: unable to generate local abstract equality for state predicate Inv',
      'warning: Quint/Cache/P1/Bridge.lean:3:8: unused variable `x`',
      'Note: This linter can be disabled with `set_option linter.unusedVariables false`',
      'info: Quint/Cache/P1/Bridge.lean:5:0: Module flag has been previously defined. Importing it here.',
      lean('information', 5, 'Module flag has been previously defined. Importing it here.'),
      lean('information', 11, 'typed_holds : holds% typed'),
      axioms(14, 'typed_holds', STANDARD),
    ].join('\n')

    const read = readProofChecks(output, checked, ['typed'], 'proofs/flag.lean', modules)

    assert.deepEqual(read.messages, [
      [
        'proofs/Bridge.lean:3:8: warning: unused variable `x`',
        'Note: This linter can be disabled with `set_option linter.unusedVariables false`',
      ].join('\n'),
      'proofs/flag.lean:11:4: info: typed_holds : holds% typed',
    ])
    assert.deepEqual(read.checks, [{ property: 'typed', status: 'proved' }])
  })

  it('counts the trusted answers of the SMT solver with --trust-smt, unless a file of the proof writes a sorry', () => {
    const output = axioms(14, 'typed_holds', `${STANDARD}, sorryAx`)

    assert.deepEqual(readProofChecks(output, checked, ['typed'], 'proofs/flag.lean', new Map(), true).checks, [
      { property: 'typed', status: 'proved', trustsSmt: true },
    ])
    assert.deepEqual(
      readProofChecks(output, checked, ['typed'], 'proofs/flag.lean', new Map(), true, ['proofs/Lemmas.lean:7']).checks,
      [
        {
          property: 'typed',
          status: 'not proved',
          reason: 'its proof rests on sorryAx, and a sorry is written at proofs/Lemmas.lean:7',
        },
      ]
    )
    assert.equal(readProofChecks(output, checked, ['typed'], 'proofs/flag.lean').checks[0].status, 'not proved')
  })

  it('reports a proof that rests on Lean’s standard axioms alone as not trusting the SMT solver, even with --trust-smt', () => {
    const output = axioms(14, 'typed_holds', STANDARD)

    assert.deepEqual(readProofChecks(output, checked, ['typed'], 'proofs/flag.lean', new Map(), true).checks, [
      { property: 'typed', status: 'proved' },
    ])
  })

  it('names the statement of a temporal property that a theorem does not prove', () => {
    const temporal = sources(proofSource(PROOFS, 'flag', [], 'the proof file', ['settles']))
    const output = lean('error', 13, 'Type mismatch')

    assert.deepEqual(readProofChecks(output, temporal, ['settles'], 'proofs/flag.lean').checks, [
      {
        property: 'settles',
        status: 'not proved',
        reason: 'settles_holds does not prove holds_temporal% settles: Type mismatch',
      },
    ])
  })

  it('reads a theorem whose name needs guillemets', () => {
    const output = lean('information', 14, `'flag.«RM::down_holds»' depends on axioms: [${STANDARD}]`)
    const guarded = sources(proofSource(PROOFS, 'flag', ['RM::down']))

    assert.equal(obligationName('RM::down'), '«RM::down_holds»')
    assert.deepEqual(readProofChecks(output, guarded, ['RM::down'], 'p.lean').checks, [
      { property: 'RM::down', status: 'proved' },
    ])
  })
})

describe('the unfinished proofs that a file of a proof writes', () => {
  it('are each sorry, admit and stop of the code, by line, and none of a comment or a string', () => {
    const text = [
      'theorem a : True := by sorry',
      '-- sorry in a comment',
      '/- a block comment /- nested -/ with admit -/',
      'theorem b : True := by',
      '  admit',
      'def s := "sorry \\" admit"',
      'theorem c : True := by',
      '  stop',
      '  trivial',
      'def stopped := 1',
      'theorem d : True := by exact sorry_lemma',
    ].join('\n')

    assert.deepEqual(writtenSorries({ text, path: 'p.lean' }), ['p.lean:1', 'p.lean:5', 'p.lean:8'])
  })

  it('counts a sorryAx written in the code', () => {
    const text = ['theorem a : True := by', '  exact sorryAx _ false'].join('\n')

    assert.deepEqual(writtenSorries({ text, path: 'p.lean' }), ['p.lean:2'])
  })
})

/** A message of Lean about the proof file at `line`, as `lean --json` writes it. */
function lean(severity: LeanJsonMessage['severity'], line: number, data: string): string {
  const message: LeanJsonMessage = { severity, pos: { line, column: 4 }, data }
  return JSON.stringify(message)
}

/** What `#print axioms` at `line` of the proof file says of `theorem` of the module `flag`. */
function axioms(line: number, theorem: string, used: string): string {
  return lean('information', line, `'flag.${theorem}' depends on axioms: [${used}]`)
}

/** What `built` holds; fails the test when it holds a refusal. */
function sources<T>(built: Either<string, T>): T {
  if (built.isLeft()) {
    throw new Error(built.value)
  }
  return built.value
}

/** The refusal `built` holds; fails the test when it holds a source. */
function refusal<T>(built: Either<string, T>): string {
  if (built.isRight()) {
    throw new Error('the proof file was not refused')
  }
  return built.value
}
