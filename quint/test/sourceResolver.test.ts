import { describe, it } from 'mocha'
import { assert } from 'chai'
import { left, right } from '@sweet-monads/either'
import { resolve } from 'path'

import { fileSourceResolver, stringSourceResolver } from '../src/sourceResolver'
import { readFileSync  } from 'fs'
import { lf } from 'eol'

const basename = resolve(__dirname, '../testFixture')

// read a Quint file from the test data directory
function readQuint(name: string): string {
  const p = resolve(__dirname, '../testFixture', name + '.qnt')
  const content = readFileSync(p).toString('utf8')
  return lf(content)
}

describe('resolve sources from files', () => {
  it('parses empty module', () => {
    const expected = readQuint('./_0001emptyModule')
    const r = fileSourceResolver()
    const result = r.load(r.lookupPath(basename, './_0001emptyModule.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('parses via ..', () => {
    const expected = readQuint('./_0001emptyModule')
    const r = fileSourceResolver()
    const result =
      r.load(r.lookupPath(basename, '../testFixture/_0001emptyModule.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('errors on non-existant', () => {
    const r = fileSourceResolver()
    const result = r.load(r.lookupPath(basename, 'does-not-exist'))
    assert.deepEqual(result,
      left(`ENOENT: no such file or directory, open '${basename}/does-not-exist'`))
  })

  it('stemname', () => {
    const r = fileSourceResolver()
    const result =
      r.stempath(r.lookupPath(`${basename}/testFixture`, './_0001emptyModule.qnt'))
    assert.deepEqual(result, `${basename}/testFixture`)
  })
})

// a static table that contains sources in strings
const staticTable = new Map<string, string>([
  [ '/foo.qnt', 'module foo {}' ],
  [ '/bar.qnt', 'module bar {}' ],
  [ '/baz/baz.qnt', 'module baz {}' ],
])

describe('resolve sources from strings', () => {
  it('parses foo', () => {
    const expected = staticTable.get('/foo.qnt')
    const r = stringSourceResolver(staticTable)
    const result =
        r.load(r.lookupPath('/', './foo.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('parses bar via ..', () => {
    const expected = staticTable.get('/bar.qnt')
    const r = stringSourceResolver(staticTable)
    const result = r.load(r.lookupPath('/', './baz/../bar.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('parses baz via baz/baz.qnt', () => {
    const expected = staticTable.get('/baz/baz.qnt')
    const r = stringSourceResolver(staticTable)
    const result = r.load(r.lookupPath('/', './baz/baz.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('parses baz via baz.qnt', () => {
    const expected = staticTable.get('/baz/baz.qnt')
    const r = stringSourceResolver(staticTable)
    const result = r.load(r.lookupPath('/baz', './baz.qnt'))
    assert.deepEqual(result, right(expected))
  })

  it('errors on non-existant', () => {
    const r = stringSourceResolver(staticTable)
    const result = r.load(r.lookupPath('/', 'does-not-exist'))
    assert.deepEqual(result,
      left(`Source not found: '/does-not-exist'`))
  })

  it('stemname', () => {
    const r = stringSourceResolver(staticTable)
    const result = r.stempath(r.lookupPath('/baz', './baz.qnt'))
    assert.deepEqual(result, '/baz')
  })
})
