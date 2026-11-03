import { describe, it } from 'mocha'
import { expect } from 'chai'

import { completeQuint } from '../src/replCompletion'

const names = ['counter', 'count', 'N::foo', 'N::fob', 'N::bar', 'foo']

describe('completeQuint', () => {
  it('completes a plain prefix', () => {
    expect(completeQuint('cou', names)).to.deep.equal([['count', 'counter'], 'cou'])
  })

  it('completes the last token of an expression', () => {
    expect(completeQuint('1 + (counter + fo', names)).to.deep.equal([['foo'], 'fo'])
  })

  it('completes qualified names', () => {
    expect(completeQuint('N::fo', names)).to.deep.equal([['N::fob', 'N::foo'], 'N::fo'])
    expect(completeQuint('N::', names)).to.deep.equal([['N::bar', 'N::fob', 'N::foo'], 'N::'])
  })

  it('completes keywords', () => {
    expect(completeQuint('va', [])).to.deep.equal([['val', 'var'], 'va'])
  })

  it('completes REPL commands', () => {
    expect(completeQuint('.lo', names)).to.deep.equal([['.load'], '.lo'])
    expect(completeQuint('.re', names)).to.deep.equal([['.reload'], '.re'])
  })

  it('returns nothing without a token or a match', () => {
    expect(completeQuint('1 + ', names)[0]).to.deep.equal([])
    expect(completeQuint('zzz', names)[0]).to.deep.equal([])
  })

  describe('type positions', () => {
    const typeNames = ['Person', 'Shape', 'Option', 'Team', 'Set', 'List']

    it('completes in annotations and compound types', () => {
      expect(completeQuint('val p: Per', typeNames)).to.deep.equal([['Person'], 'Per'])
      expect(completeQuint('type G = Set[Per', typeNames)).to.deep.equal([['Person'], 'Per'])
      expect(completeQuint('type P = (int, Sha', typeNames)).to.deep.equal([['Shape'], 'Sha'])
      expect(completeQuint('type R = { owner: Per', typeNames)).to.deep.equal([['Person'], 'Per'])
      expect(completeQuint('type F = int -> Opt', typeNames)).to.deep.equal([['Option'], 'Opt'])
      expect(completeQuint('  lead: Te', typeNames)).to.deep.equal([['Team'], 'Te'])
    })

    it('completes primitive type keywords', () => {
      expect(completeQuint('type A = { a: in', [])[0]).to.deep.equal(['int'])
      expect(completeQuint('type A = st', [])[0]).to.deep.equal(['str'])
      expect(completeQuint('val b: bo', [])[0]).to.deep.equal(['bool'])
    })
  })

  it('deduplicates candidates', () => {
    expect(completeQuint('fo', ['foo', 'foo'])[0]).to.deep.equal(['foo'])
  })

  it('includes exact-match name when other completions also match', () => {
    expect(completeQuint('foo', ['foo', 'fooBar'])[0]).to.deep.equal(['foo', 'fooBar'])
  })
})
