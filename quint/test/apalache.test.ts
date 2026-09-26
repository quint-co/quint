import { describe, it } from 'mocha'
import { expect } from 'chai'

import { apalacheSpawnOptions, parseServerEndpoint } from '../src/apalache'

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

describe('parseServerEndpoint', () => {
  it('parses a valid hostname:port', () => {
    const result = parseServerEndpoint('localhost:8822')
    expect(result.isRight()).to.be.true
    expect(result.value).to.deep.equal({ hostname: 'localhost', port: 8822 })
  })
})
