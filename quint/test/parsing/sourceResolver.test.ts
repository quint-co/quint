import { describe, it } from 'mocha'
import { assert } from 'chai'
import { left, right } from '@sweet-monads/either'
import { resolve } from 'path'

import { fileSourceResolver } from '../../src/parsing/sourceResolver'
import { readFileSync } from 'fs'
import { lf } from 'eol'

const basename = resolve(__dirname, '../../testFixture')

// read a Quint file from the test data directory
function readQuint(name: string): string {
  const p = resolve(__dirname, '../../testFixture', name + '.qnt')
  const content = readFileSync(p).toString('utf8')
  return lf(content)
}

describe('resolve sources from files', () => {
  it('resolves relative path on same dir', () => {
    const expected = readQuint('./_0001emptyModule')
    const r = fileSourceResolver()
    const result = r.load(r.lookupPath(basename, './_0001emptyModule.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('resolves relative path on parent dir', () => {
    const expected = readQuint('./_0001emptyModule')
    const r = fileSourceResolver()
    const result = r.load(r.lookupPath(basename, '../testFixture/_0001emptyModule.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('errors on non-existant', () => {
    const r = fileSourceResolver()
    const result = r.load(r.lookupPath(basename, 'does-not-exist'))
    const filenameInError = resolve(basename, 'does-not-exist')
    assert.deepEqual(result, left(`ENOENT: no such file or directory, open '${filenameInError}'`))
  })

  it('stemname', () => {
    const r = fileSourceResolver()
    const result = r.stempath(r.lookupPath(`${basename}/testFixture`, './_0001emptyModule.qnt'))
    const expected = resolve(basename, 'testFixture')
    assert.deepEqual(result, expected)
  })
})
