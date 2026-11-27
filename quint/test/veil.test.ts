import { after, before, describe, it } from 'mocha'
import { assert } from 'chai'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { delimiter, join } from 'path'
import {
  builtBinary,
  checkerArgs,
  checkerDir,
  checkerSource,
  elanEnv,
  ensureVeil,
  findElan,
  inductionSource,
  installChecker,
  leanSourcesDir,
  moduleSource,
  proofModulesName,
  pruneCheckers,
  specModuleName,
  symbolicSource,
  synthesisSource,
  veilStatus,
  workspaceDir,
} from '../src/veil'

const fixtures = join(__dirname, '..', 'testFixture', 'veil')

describe("the Lean file that builds a spec's checker", () => {
  const source = checkerSource(
    '/tmp/a "quoted" dir/spec.json',
    '/tmp/a "quoted" dir/variables.json',
    'two_phase_commit_3',
    'invariants',
    []
  )

  it('loads the spec as it runs, stating only the invariants the compiled spec lists', () => {
    assert.include(source, 'quint_module "/tmp/a \\"quoted\\" dir/spec.json" (declared := false)')
    assert.notInclude(source, '(smt := true)')
  })

  it('states no state constraint when it is given none', () => {
    assert.notInclude(source, 'stateConstraints')
  })

  it('states the definitions it is given as state constraints, quoted so that a qualified name reads as one', () => {
    for (const what of ['invariants', 'temporal'] as const) {
      const constrained = checkerSource('/tmp/spec.json', '/tmp/v.json', 'MCCount2', what, ['Bounded', 'I::fewMsgs'])

      assert.include(
        constrained,
        'quint_module "/tmp/spec.json" (declared := false) (variables := "/tmp/v.json") ' +
          '(stateConstraints := [«Bounded», «I::fewMsgs»])\n'
      )
    }
  })

  it('has the module write its state variables where the backend reads them', () => {
    assert.include(source, '(variables := "/tmp/a \\"quoted\\" dir/variables.json")')
  })

  it('builds the compiled checker without running it, and closes the module it opened', () => {
    assert.include(source, 'set_option veil.modelChecker.buildOnly true')
    assert.include(source, '#model_check compiled {} {}')
    assert.isTrue(source.trimEnd().endsWith('end two_phase_commit_3'))
  })

  it('builds the checker of the temporal properties instead, for a temporal check', () => {
    const temporal = checkerSource('/tmp/spec.json', '/tmp/variables.json', 'two_phase_commit_3', 'temporal', [])

    assert.include(temporal, 'set_option veil.modelChecker.buildOnly true')
    assert.include(temporal, '#temporal_check compiled {} {}')
    assert.notInclude(temporal, '#model_check')
  })

  it("is a file of Lean's module system, which the compiled checker requires", () => {
    assert.isTrue(source.startsWith('module\n'))
    assert.include(source, 'public import Quint')
  })
})

describe("the Lean file that checks a spec's inductive invariant", () => {
  const source = inductionSource('/tmp/a "quoted" dir/spec.json', '/tmp/a "quoted" dir/variables.json', 'mutex', {
    onlyInit: false,
    initEquations: false,
  })

  it('loads the spec in the encoding SMT reasons about, stating only the invariants the compiled spec lists', () => {
    assert.include(source, 'quint_module "/tmp/a \\"quoted\\" dir/spec.json" (smt := true) (declared := false)')
  })

  it('has the module write its state variables, which the states of a counterexample hold', () => {
    assert.include(source, '(variables := "/tmp/a \\"quoted\\" dir/variables.json")')
  })

  it('checks the initializer and every action, keeping the assignments of the initializer, and closes the module', () => {
    assert.include(source, '(initEquations := false)')
    assert.include(source, '#quint_check_induction\n')
    assert.isTrue(source.trimEnd().endsWith('end mutex'))
  })

  it('checks only the initializer, with its assignments as equations, to show the state it reaches', () => {
    const init = inductionSource('/tmp/spec.json', '/tmp/variables.json', 'mutex', {
      onlyInit: true,
      initEquations: true,
    })

    assert.include(init, '(initEquations := true)')
    assert.include(init, '#quint_check_induction initializer')
  })
})

describe("the Lean file that has #updr search for a spec's inductive invariant", () => {
  const source = synthesisSource('/tmp/spec.json', 'two_phase_commit', ['consistency', 'q::keys::stages'])

  it('loads the spec in the encoding SMT reasons about, with the invariants it names, quoted where they must be', () => {
    assert.include(
      source,
      'quint_module "/tmp/spec.json" (smt := true) (declared := false) (invariants := [consistency, «q::keys::stages»])\n'
    )
  })

  it('has #updr certify what it finds, and closes the module', () => {
    assert.include(source, '\n#updr certify\n')
    assert.isTrue(source.trimEnd().endsWith('end two_phase_commit'))
  })
})

describe('the Lean file of a bounded symbolic check', () => {
  const queries = [0, 1, 2].map(steps => ({ invariant: 'consistency', steps }))
  const { source, lines } = symbolicSource('/tmp/spec.json', 'two_phase_commit', queries)
  const sourceLines = source.split('\n')

  it('loads the spec in the encoding SMT reasons about, with each invariant that a query names once', () => {
    assert.include(source, '(smt := true) (declared := false) (invariants := [consistency])\n')
  })

  it('asks each query as an unsat trace of its number of steps, which ends where the invariant fails', () => {
    assert.deepEqual(
      lines.map(l => sourceLines.slice(l - 1, sourceLines.indexOf('}', l - 1) + 1).join('\n')),
      [
        'unsat trace [quint_query_0] {\n  assert ¬ consistency\n}',
        'unsat trace [quint_query_1] {\n  any action\n  assert ¬ consistency\n}',
        'unsat trace [quint_query_2] {\n  any 2 actions\n  assert ¬ consistency\n}',
      ]
    )
  })
})

describe('the Lean module that loads a spec for the checks of its proofs', () => {
  const options = [
    { name: 'main', value: 'flag' },
    { name: 'invariants', value: '[typed, down]' },
  ]

  it('loads the spec with the options of the proof file, and does nothing else in its module', () => {
    assert.equal(
      moduleSource('S0123.json', 'flag', options, []),
      'module\n\npublic import Quint\n\nquint_module "S0123.json" (main := flag) (invariants := [typed, down])\n\nend flag\n'
    )
  })

  it('is the same module for the same spec and options, under the Quint library where Lake builds it', () => {
    const name = specModuleName('{"modules":[]}', options, '58c29764b4549839')

    assert.match(name, /^Quint\.Cache\.S[0-9a-f]{16}$/)
    assert.equal(
      specModuleName(
        '{"modules":[]}',
        options.map(o => ({ ...o })),
        '58c29764b4549839'
      ),
      name
    )
  })

  it('is another module once the spec, an option or the Quint library changes', () => {
    const name = specModuleName('{"modules":[]}', options, '58c29764b4549839')

    assert.notEqual(specModuleName('{"modules":[ ]}', options, '58c29764b4549839'), name)
    const fewer = [options[0], { name: 'invariants', value: '[typed]' }]
    assert.notEqual(specModuleName('{"modules":[]}', fewer, '58c29764b4549839'), name)
    const more = [...options, { name: 'smt', value: 'true' }]
    assert.notEqual(specModuleName('{"modules":[]}', more, '58c29764b4549839'), name)
    assert.notEqual(specModuleName('{"modules":[]}', options, '0d1e2f3a4b5c6d7e'), name)
  })

  it('has the other files of a proof built under a name of their own for each folder and spec module', () => {
    const name = proofModulesName('Quint.Cache.S0123', 'proofs')

    assert.match(name, /^Quint\.Cache\.P[0-9a-f]{16}$/)
    assert.equal(proofModulesName('Quint.Cache.S0123', './proofs/'), name)
    assert.notEqual(proofModulesName('Quint.Cache.S0123', 'proofs/raft'), name)
    assert.notEqual(proofModulesName('Quint.Cache.S4567', 'proofs'), name)
  })
})

describe('the checker that a check runs', () => {
  const workspace = { dir: '/mocked/workspace', env: {}, library: '58c29764b4549839' }
  const source = checkerSource('spec.json', 'variables.json', 'two_phase_commit_3', 'invariants', [])
  let root: string

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'quint-veil-checkers-'))
  })

  after(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it('is the same checker for the same spec and check, kept in the workspace', () => {
    const dir = checkerDir(workspace, '{"modules":[]}', source)

    assert.match(dir, /^\/mocked\/workspace\/\.lake\/quint_checkers\/[0-9a-f]{16}$/)
    assert.equal(checkerDir({ ...workspace }, '{"modules":[]}', `${source}`), dir)
  })

  it('searches on every core for invariants, and on one thread for temporal properties', () => {
    assert.deepEqual(checkerArgs('invariants', 8), ['8', '20', '1'])
    assert.deepEqual(checkerArgs('invariants', 1), [])
    assert.deepEqual(checkerArgs('temporal', 8), [])
  })

  it('is another checker once the spec, the check or the Quint library changes', () => {
    const dir = checkerDir(workspace, '{"modules":[]}', source)

    assert.notEqual(checkerDir(workspace, '{"modules":[ ]}', source), dir)
    const temporal = checkerSource('spec.json', 'variables.json', 'two_phase_commit_3', 'temporal', [])
    assert.notEqual(checkerDir(workspace, '{"modules":[]}', temporal), dir)
    assert.notEqual(checkerDir({ ...workspace, library: '0d1e2f3a4b5c6d7e' }, '{"modules":[]}', source), dir)
  })

  it('is installed whole, with the state variables of its spec, under its folder', async () => {
    const built = join(root, 'built')
    mkdirSync(built)
    writeFileSync(join(built, 'binary'), 'the checker')
    writeFileSync(join(built, 'variables.json'), '[]')
    const dir = join(root, 'installed', 'c0ffee')

    const installed = await installChecker(join(built, 'binary'), join(built, 'variables.json'), dir)

    assert.isTrue(installed.isRight())
    assert.equal(readFileSync(join(dir, 'checker'), 'utf8'), 'the checker')
    assert.equal(readFileSync(join(dir, 'variables.json'), 'utf8'), '[]')
    assert.isFalse(existsSync(join(built, 'binary')), 'the binary is moved, not copied')
    assert.deepEqual(readdirSync(join(root, 'installed')), ['c0ffee'])
  })

  it('stays the checker that another check installed first', async () => {
    const dir = join(root, 'raced', 'c0ffee')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'checker'), 'the first checker')
    writeFileSync(join(root, 'second'), 'the second checker')
    writeFileSync(join(root, 'variables.json'), '[]')

    const installed = await installChecker(join(root, 'second'), join(root, 'variables.json'), dir)

    assert.isTrue(installed.isRight())
    assert.equal(readFileSync(join(dir, 'checker'), 'utf8'), 'the first checker')
    assert.deepEqual(readdirSync(join(root, 'raced')), ['c0ffee'])
  })

  it('is deleted once the workspace keeps enough checkers that were used after it', () => {
    const kept = join(root, 'kept')
    for (const [i, name] of ['a', 'b', 'c', 'd', 'e'].entries()) {
      mkdirSync(join(kept, name), { recursive: true })
      writeFileSync(join(kept, name, 'checker'), name)
      utimesSync(join(kept, name), 1_000_000 + i, 1_000_000 + i)
    }
    // `a` was built first and used last.
    utimesSync(join(kept, 'a'), 2_000_000, 2_000_000)

    pruneCheckers(kept, 3)

    assert.sameMembers(readdirSync(kept), ['a', 'd', 'e'])
    assert.equal(readFileSync(join(kept, 'a', 'checker'), 'utf8'), 'a')
  })

  it('stays for a minute after it was used, however many checkers were used after it', () => {
    const recent = join(root, 'recent')
    for (const name of ['a', 'b', 'c']) {
      mkdirSync(join(recent, name), { recursive: true })
    }

    pruneCheckers(recent, 1)

    assert.sameMembers(readdirSync(recent), ['a', 'b', 'c'])
  })
})

describe('reading what Lean reports when it builds a checker', () => {
  it('finds the binary and its build folder', () => {
    const built = builtBinary(readFileSync(join(fixtures, 'build_ok.txt'), 'utf8'), 'exit code 0')

    if (built.isLeft()) {
      assert.fail(built.value)
    }
    assert.match(built.value.binary, /^\/mocked\/workspace\/\.lake\/model_checkers\/QuintVerify_rec_model_check_\d+$/)
    assert.match(built.value.buildFolder, /^\/mocked\/workspace\/\.lake\/model_checker_builds\//)
  })

  it('refuses a checker Veil built past an action that did not elaborate', () => {
    const built = builtBinary(readFileSync(join(fixtures, 'build_partial.txt'), 'utf8'), 'exit code 0')

    assert.isTrue(built.isLeft(), 'a checker of a partly translated spec would explore another system')
    assert.include(built.value, 'Error in action DiningPhilosophers_pickBothForks: Type mismatch')
  })

  it('says how Lean ended when it stopped without a word, as when it runs out of memory', () => {
    const built = builtBinary('', 'signal SIGKILL')

    assert.isTrue(built.isLeft())
    assert.include(built.value, 'Lean ended with signal SIGKILL, and no output')
  })

  it("reports Lean's errors when it built no checker", () => {
    const built = builtBinary(readFileSync(join(fixtures, 'build_error.txt'), 'utf8'), 'exit code 1')

    assert.isTrue(built.isLeft())
    assert.include(built.value, "an init with 2 branches; Veil's after_init is one program is not supported")
  })
})

describe('the workspace a set of Lean sources is built in', () => {
  let home: string
  let sources: string
  const quintHome = process.env.QUINT_HOME

  before(() => {
    home = mkdtempSync(join(tmpdir(), 'quint-veil-home-'))
    process.env.QUINT_HOME = home
    sources = mkdtempSync(join(tmpdir(), 'quint-veil-sources-'))
    cpSync(leanSourcesDir(), sources, { recursive: true, filter: src => !src.includes('.lake') })
  })

  after(() => {
    rmSync(home, { recursive: true, force: true })
    rmSync(sources, { recursive: true, force: true })
    if (quintHome === undefined) {
      delete process.env.QUINT_HOME
    } else {
      process.env.QUINT_HOME = quintHome
    }
  })

  it("lives in Quint's configuration directory", () => {
    assert.isTrue(workspaceDir(sources).startsWith(join(home, 'veil', 'workspace-')))
  })

  it('stays the same when only the Quint library changes, so Veil is not built again', () => {
    const before = workspaceDir(sources)
    writeFileSync(join(sources, 'Quint', 'Embed.lean'), '-- another library\n', { flag: 'a' })

    assert.equal(workspaceDir(sources), before)
  })

  it('changes when the version of Veil changes', () => {
    const before = workspaceDir(sources)
    writeFileSync(join(sources, 'lake-manifest.json'), '\n', { flag: 'a' })

    assert.notEqual(workspaceDir(sources), before)
  })
})

describe('whether Veil is ready', () => {
  let home: string
  const saved = { home: process.env.QUINT_HOME, lean: process.env.QUINT_LEAN_DIR }

  before(() => {
    home = mkdtempSync(join(tmpdir(), 'quint-veil-home-'))
    process.env.QUINT_HOME = home
  })

  after(() => {
    rmSync(home, { recursive: true, force: true })
    for (const [name, value] of [
      ['QUINT_HOME', saved.home],
      ['QUINT_LEAN_DIR', saved.lean],
    ] as const) {
      if (value === undefined) {
        delete process.env[name]
      } else {
        process.env[name] = value
      }
    }
  })

  it('is not, in a home where nothing is installed, and says where it would be', () => {
    delete process.env.QUINT_LEAN_DIR
    const status = veilStatus()

    if (status.isLeft()) {
      assert.fail(status.value)
    }
    assert.isFalse(status.value.ready)
    assert.isTrue(status.value.workspace.startsWith(join(home, 'veil', 'workspace-')))
  })

  it('reads the Lean sources where QUINT_LEAN_DIR points', () => {
    process.env.QUINT_LEAN_DIR = join(home, 'lean')

    assert.equal(leanSourcesDir(), join(home, 'lean'))
  })

  it('names the Lean sources it cannot find', () => {
    process.env.QUINT_LEAN_DIR = join(home, 'no-lean-here')

    const status = veilStatus()

    assert.isTrue(status.isLeft())
    assert.include(status.isLeft() ? status.value : '', `missing from ${join(home, 'no-lean-here')}: lakefile.lean`)
  })

  it('runs Lake under an elan already on PATH, leaving its environment as it is', () => {
    const bin = dirWith('elan', 0o755)

    const env = elanEnv(findElan([join(home, 'empty'), bin].join(delimiter)))

    assert.equal(env.ELAN_HOME, process.env.ELAN_HOME)
    assert.equal(env.PATH, process.env.PATH)
  })

  it("installs its own elan in Quint's configuration directory when none is on PATH", () => {
    const elan = findElan(dirWith('lake', 0o755))

    const env = elanEnv(elan)

    assert.deepEqual(elan, { kind: 'quint', home: join(home, 'veil', 'elan') })
    assert.equal(env.ELAN_HOME, join(home, 'veil', 'elan'))
    assert.equal(env.PATH?.split(delimiter)[0], join(home, 'veil', 'elan', 'bin'))
  })

  it('does not take a file named elan that cannot run for an elan', () => {
    assert.equal(findElan(dirWith('elan', 0o644)).kind, 'quint')
  })

  it('is never set up on Windows, which Veil does not support, and nothing is downloaded there', async () => {
    delete process.env.QUINT_LEAN_DIR
    const platform = process.platform
    Object.defineProperty(process, 'platform', { value: 'win32' })
    try {
      const workspace = await ensureVeil(0)

      assert.isTrue(workspace.isLeft())
      assert.include(workspace.isLeft() ? workspace.value : '', 'does not run on Windows')
      assert.isFalse(existsSync(join(home, 'veil')))
    } finally {
      Object.defineProperty(process, 'platform', { value: platform })
    }
  })

  it('serializes concurrent setup and rechecks whether the first process finished it', async () => {
    const sources = join(home, 'concurrent-sources')
    const bin = join(home, 'concurrent-bin')
    const builds = join(home, 'builds')
    cpSync(leanSourcesDir(), sources, { recursive: true, filter: src => !src.includes('.lake') })
    writeFileSync(join(sources, 'lake-manifest.json'), '\n', { flag: 'a' })
    mkdirSync(bin)
    for (const tool of ['elan', 'git', 'curl', 'npm', 'unzip']) {
      writeFileSync(join(bin, tool), '#!/bin/sh\n', { mode: 0o755 })
    }
    writeFileSync(join(bin, 'lake'), '#!/bin/sh\nprintf "build\\n" >> "$QUINT_TEST_BUILDS"\n', {
      mode: 0o755,
    })
    const searchPath = process.env.PATH
    const leanDir = process.env.QUINT_LEAN_DIR
    process.env.PATH = bin
    process.env.QUINT_LEAN_DIR = sources
    process.env.QUINT_TEST_BUILDS = builds
    try {
      const [first, second] = await Promise.all([ensureVeil(0), ensureVeil(0)])

      assert.isTrue(first.isRight(), `${first.value}`)
      assert.isTrue(second.isRight(), `${second.value}`)
      assert.equal(readFileSync(builds, 'utf8'), 'build\n')
      if (first.isRight()) {
        rmSync(first.value.dir, { recursive: true, force: true })
      }
    } finally {
      process.env.PATH = searchPath
      if (leanDir === undefined) {
        delete process.env.QUINT_LEAN_DIR
      } else {
        process.env.QUINT_LEAN_DIR = leanDir
      }
      delete process.env.QUINT_TEST_BUILDS
    }
  })

  it('names the programs that Lake fetches Veil with, which are missing, before anything is downloaded', async () => {
    delete process.env.QUINT_LEAN_DIR
    const platform = process.platform
    const searchPath = process.env.PATH
    Object.defineProperty(process, 'platform', { value: 'linux' })
    process.env.PATH = [dirWith('git', 0o755), dirWith('npm', 0o755)].join(delimiter)
    try {
      const workspace = await ensureVeil(0)

      assert.isTrue(workspace.isLeft())
      assert.match(workspace.isLeft() ? workspace.value : '', /on PATH, .*: curl, unzip$/)
      assert.isFalse(existsSync(join(home, 'veil', '.setup.lock')))
    } finally {
      Object.defineProperty(process, 'platform', { value: platform })
      process.env.PATH = searchPath
    }
  })

  /** A fresh directory holding one file, `name`, with permissions `mode`. */
  function dirWith(name: string, mode: number): string {
    const dir = mkdtempSync(join(home, 'bin-'))
    writeFileSync(join(dir, name), '#!/bin/sh\n', { mode })
    return dir
  }
})
