import { spawn } from 'child_process'
import { join } from 'path'
import { describe, it } from 'mocha'
import { expect } from 'chai'

import { apalacheSpawnCommand, apalacheSpawnOptions, exitWithError, parseServerEndpoint } from '../src/apalache'

describe('apalacheSpawnOptions', () => {
  it('spawns with a shell on win32, so that the .bat launcher can run', () => {
    // Node refuses to spawn .bat/.cmd files with shell: false on Windows
    // (CVE-2024-27980), failing with EINVAL. shell: true is required.
    expect(apalacheSpawnOptions('win32', 'ignore')).to.deep.equal({ shell: true, stdio: 'ignore' })
  })

  it('spawns without a shell on non-Windows platforms', () => {
    // Avoiding an intermediate shell process lets us terminate Apalache directly.
    expect(apalacheSpawnOptions('linux', 'ignore')).to.deep.equal({ shell: false, stdio: 'ignore' })
    expect(apalacheSpawnOptions('darwin', 'ignore')).to.deep.equal({ shell: false, stdio: 'ignore' })
  })
})

describe('apalacheSpawnCommand', () => {
  it('quotes the launcher path on win32, so that paths with spaces work', () => {
    // With shell: true, Node joins the command and its arguments without quoting them
    const exe = 'C:\\Users\\Jane Doe\\.quint\\apalache-dist-0.62.4\\apalache\\bin\\apalache-mc.bat'
    expect(apalacheSpawnCommand('win32', exe, 8822)).to.deep.equal({
      command: `"${exe}" server --port=8822`,
      args: [],
    })
  })

  it('passes the launcher path and arguments separately on non-Windows platforms', () => {
    const exe = '/home/jane doe/.quint/apalache-dist-0.62.4/apalache/bin/apalache-mc'
    expect(apalacheSpawnCommand('linux', exe, 8822)).to.deep.equal({
      command: exe,
      args: ['server', '--port=8822'],
    })
  })
})

// Spawn a fresh process: the Apalache listener and the verify `.catch` both
// call `process.exit`, which a mock in this process cannot observe.
function runVerifyExit(mode: 'uncaught' | 'cli'): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-r', 'ts-node/register', join(__dirname, 'scripts/verifyExitOnError.ts')], {
      cwd: join(__dirname, '..'),
      env: { ...process.env, QUINT_VERIFY_EXIT_MODE: mode },
    })
    let stderr = ''
    const timer = setTimeout(() => child.kill('SIGKILL'), 20000)
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', code => {
      clearTimeout(timer)
      resolve({ code, stderr })
    })
  })
}

function countOf(text: string, needle: string): number {
  return text.split(needle).length - 1
}

describe('verify exits non-zero after Apalache handlers are installed (#2074)', () => {
  const errorLine = 'error: forced reporting failure'

  it('reports an unhandled rejection from the uncaughtException listener', async function () {
    this.timeout(20000)
    const { code, stderr } = await runVerifyExit('uncaught')
    expect(code, stderr).to.equal(1)
    expect(countOf(stderr, errorLine), stderr).to.equal(1)
    // exitHandler runs in the listener and again on process exit.
    expect(countOf(stderr, 'shutdown'), stderr).to.equal(2)
    expect(stderr.indexOf('shutdown'), stderr).to.be.lessThan(stderr.indexOf(errorLine))
  })

  it('reports a verify-promise rejection once via .catch(exitWithError)', async function () {
    this.timeout(20000)
    const { code, stderr } = await runVerifyExit('cli')
    expect(code, stderr).to.equal(1)
    expect(countOf(stderr, errorLine), stderr).to.equal(1)
    // The catch exits before the uncaughtException listener, so Apalache is
    // stopped only from the process 'exit' hook.
    expect(countOf(stderr, 'shutdown'), stderr).to.equal(1)
    expect(stderr.indexOf(errorLine), stderr).to.be.lessThan(stderr.indexOf('shutdown'))
  })
})

describe('exitWithError', () => {
  it('prints the error on stderr and exits non-zero (#2074)', () => {
    const exit = process.exit
    const error = console.error
    const messages: string[] = []
    try {
      process.exit = ((code?: number) => {
        throw new Error(`exit ${code}`)
      }) as typeof process.exit
      console.error = ((msg?: unknown) => {
        messages.push(String(msg))
      }) as typeof console.error

      expect(() => exitWithError(new Error('Cannot convert Rec("v") to a runtime value'))).to.throw('exit 1')
      expect(messages).to.deep.equal(['error: Cannot convert Rec("v") to a runtime value'])
    } finally {
      process.exit = exit
      console.error = error
    }
  })
})

describe('parseServerEndpoint', () => {
  it('parses a valid hostname:port', () => {
    const result = parseServerEndpoint('localhost:8822')
    expect(result.isRight()).to.be.true
    expect(result.value).to.deep.equal({ hostname: 'localhost', port: 8822 })
  })
})
