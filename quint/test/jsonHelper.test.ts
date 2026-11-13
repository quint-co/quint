import { assert } from 'chai'
import { describe, it } from 'mocha'

import { parseJsonBig } from '../src/jsonHelper'

describe('parseJsonBig', () => {
  it('accepts keys that contain constructor', () => {
    const parsed = parseJsonBig(
      '{"vars":["constructorPanicked","myconstructor"],"states":[{"constructorPanicked":false,"myconstructor":1}]}'
    )

    assert.deepEqual(parsed.vars, ['constructorPanicked', 'myconstructor'])
    assert.strictEqual(parsed.states[0].constructorPanicked, false)
    assert.strictEqual(parsed.states[0].myconstructor, 1)
  })

  it('rejects the exact constructor key', () => {
    assert.throws(() => parseJsonBig('{"constructor":1}'), /Object contains forbidden constructor property/)
  })

  it('rejects a nested constructor key', () => {
    assert.throws(
      () => parseJsonBig('{"states":[{"constructor":false}]}'),
      /Object contains forbidden constructor property/
    )
  })

  it('rejects __proto__', () => {
    assert.throws(() => parseJsonBig('{"__proto__":{"admin":true}}'), /Object contains forbidden prototype property/)
    assert.throws(
      () => parseJsonBig('{"state":{"__proto__":{"admin":true}}}'),
      /Object contains forbidden prototype property/
    )
  })

  it('keeps big integers exact', () => {
    const parsed = parseJsonBig('{"small":42,"big":9007199254740993}')

    assert.strictEqual(parsed.small, 42)
    assert.strictEqual(parsed.big.toString(), '9007199254740993')
  })
})
