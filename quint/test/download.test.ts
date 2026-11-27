import { describe, it } from 'mocha'
import { assert } from 'chai'
import { createHash } from 'crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import * as tar from 'tar'
import { downloadAndUnpack, releaseTarget } from '../src/download'

describe('downloading a release archive', () => {
  it('verifies its SHA-256 digest before unpacking it', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'quint-download-'))
    try {
      const contents = join(tmp, 'contents')
      const archive = join(tmp, 'release.tar.gz')
      mkdirSync(contents)
      writeFileSync(join(contents, 'tool'), 'the tool')
      await tar.create({ cwd: contents, file: archive, gzip: true }, ['tool'])
      const bytes = readFileSync(archive)
      const url = `data:application/gzip;base64,${bytes.toString('base64')}`
      const checksum = createHash('sha256').update(bytes).digest('hex')

      const installed = await downloadAndUnpack(url, join(tmp, 'dist'), 'tool', checksum)

      assert.isTrue(installed.isRight(), installed.value)
      assert.equal(readFileSync(join(tmp, 'dist', 'tool'), 'utf8'), 'the tool')
    } finally {
      rmSync(tmp, { recursive: true, force: true })
    }
  })

  it('does not unpack an archive whose SHA-256 digest does not match', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'quint-download-'))
    try {
      const contents = join(tmp, 'contents')
      const archive = join(tmp, 'release.tar.gz')
      mkdirSync(contents)
      writeFileSync(join(contents, 'tool'), 'the tool')
      await tar.create({ cwd: contents, file: archive, gzip: true }, ['tool'])
      const bytes = readFileSync(archive)
      const url = `data:application/gzip;base64,${bytes.toString('base64')}`

      const installed = await downloadAndUnpack(url, join(tmp, 'dist'), 'tool', '0'.repeat(64))

      assert.isTrue(installed.isLeft())
      assert.include(installed.value, 'Checksum mismatch')
      assert.isFalse(installed.isRight())
    } finally {
      rmSync(tmp, { recursive: true, force: true })
    }
  })
})

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
