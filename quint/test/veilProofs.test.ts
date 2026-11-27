import { describe, it } from 'mocha'
import { assert } from 'chai'
import fc from 'fast-check'
import { Either } from '@sweet-monads/either'
import {
  ProofFile,
  obligationName,
  proofChecksFromAudit,
  proofObligationsSource,
  proofSource,
  proofSources,
  readProofAudit,
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
        assert.equal(checking.length, proofs.split('\n').length)
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

  it('does not elaborate obligations or inspect axioms in the proof module', () => {
    assert.deepEqual(lines.slice(12), ['end flag'])
    assert.deepEqual([...checked.checkedAt], [])
  })

  it('elaborates invariant and temporal obligations in a trusted spec-only module', () => {
    const temporal = PROOFS.replace('(main := flag)', '(main := flag) (temporalProps := [settles])')
    const checking = sources(proofSource(temporal, 'flag', ['typed'], 'the proof file', ['settles']))

    assert.deepEqual(proofObligationsSource('Quint.Cache.S0123', 'flag', checking.obligations).split('\n'), [
      'module',
      '',
      'public import Quint.Cache.S0123',
      '',
      'veil module flag',
      '',
      'axiom quint_proof_obligation_0 : holds% typed',
      '',
      'axiom quint_proof_obligation_1 : holds_temporal% settles',
      '',
      'end flag',
      '',
    ])
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

describe('the trusted proof audit', () => {
  const checked = sources(proofSource(PROOFS, 'flag', ['typed', 'down', 'up']))
  const STANDARD = ['Classical.choice', 'Quot.sound', 'propext']

  it('reads only the auditor file, not text printed by the proof', () => {
    const report = ['same\tClassical.choice,Quot.sound,propext', 'different\t', 'missing'].join('\n') + '\n'
    const parsed = sources(readProofAudit(report, 3))

    assert.deepEqual(parsed, [
      { found: true, sameType: true, axioms: STANDARD },
      { found: true, sameType: false, axioms: [] },
      { found: false, sameType: false, axioms: [] },
    ])
    assert.isTrue(readProofAudit('{"severity":"information","data":"forged"}\n', 1).isLeft())
  })

  it('counts a constant of exactly the obligation type that uses only Lean standard axioms', () => {
    const read = proofChecksFromAudit(['typed'], checked.obligations, [
      { found: true, sameType: true, axioms: STANDARD },
    ])

    assert.deepEqual(read.checks, [{ property: 'typed', status: 'proved' }])
    assert.deepEqual(read.errors, [])
    assert.deepEqual(read.messages, [])
  })

  it('rejects a missing constant, a different type, and a nonstandard axiom independently', () => {
    const read = proofChecksFromAudit(['typed', 'down', 'up'], checked.obligations, [
      { found: false, sameType: false, axioms: [] },
      { found: true, sameType: false, axioms: [] },
      { found: true, sameType: true, axioms: [...STANDARD, 'unsafeAxiom'] },
    ])

    assert.deepEqual(read.checks, [
      { property: 'typed', status: 'not proved', reason: 'Lean did not check typed_holds' },
      { property: 'down', status: 'not proved', reason: 'down_holds does not prove holds% down' },
      { property: 'up', status: 'not proved', reason: 'its proof rests on unsafeAxiom' },
    ])
  })

  it('handles trusted SMT answers only under --trust-smt and only when no proof file writes a sorry', () => {
    const audit = [{ found: true, sameType: true, axioms: [...STANDARD, 'sorryAx'] }]

    assert.deepEqual(proofChecksFromAudit(['typed'], checked.obligations, audit, true).checks, [
      { property: 'typed', status: 'proved', trustsSmt: true },
    ])
    assert.deepEqual(
      proofChecksFromAudit(['typed'], checked.obligations, audit, true, ['proofs/Lemmas.lean:7']).checks,
      [
        {
          property: 'typed',
          status: 'not proved',
          reason: 'its proof rests on sorryAx, and a sorry is written at proofs/Lemmas.lean:7',
        },
      ]
    )
    assert.equal(proofChecksFromAudit(['typed'], checked.obligations, audit).checks[0].status, 'not proved')
  })

  it('names temporal obligations and theorem names that need guillemets', () => {
    const temporal = sources(proofSource(PROOFS, 'flag', [], 'the proof file', ['settles']))
    const mismatch = proofChecksFromAudit(['settles'], temporal.obligations, [
      { found: true, sameType: false, axioms: [] },
    ])

    assert.equal(obligationName('RM::down'), '«RM::down_holds»')
    assert.deepEqual(mismatch.checks, [
      {
        property: 'settles',
        status: 'not proved',
        reason: 'settles_holds does not prove holds_temporal% settles',
      },
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
