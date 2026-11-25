import { describe, it } from 'mocha'
import { assert } from 'chai'
import { releaseTarget } from '../src/download'

describe('the release a platform downloads', () => {
  it('names Linux and macOS releases by their Rust target, as gzipped tarballs', () => {
    const targets = [
      ['linux', 'x64', 'x86_64-unknown-linux-gnu'],
      ['linux', 'arm64', 'aarch64-unknown-linux-gnu'],
      ['darwin', 'x64', 'x86_64-apple-darwin'],
      ['darwin', 'arm64', 'aarch64-apple-darwin'],
    ]
    for (const [platform, arch, triple] of targets) {
      const target = releaseTarget(platform, arch)
      assert.isTrue(target.isRight(), `${platform} ${arch}: ${target.value}`)
      assert.deepEqual(target.value, { triple, archive: '.tar.gz' })
    }
  })

  it('names the Windows release as a zip', () => {
    const target = releaseTarget('win32', 'x64')

    assert.isTrue(target.isRight(), `${target.value}`)
    assert.deepEqual(target.value, { triple: 'x86_64-pc-windows-msvc', archive: '.zip' })
  })

  it('has no release for a platform nothing is built for', () => {
    for (const [platform, arch] of [
      ['win32', 'arm64'],
      ['linux', 'ia32'],
      ['freebsd', 'x64'],
    ]) {
      const target = releaseTarget(platform, arch)
      assert.isTrue(target.isLeft(), `${platform} ${arch} has a release`)
      assert.include(target.value, `${platform} ${arch}`)
    }
  })
})
