import { describe, it } from 'mocha'
import { expect } from 'chai'
import { generateCfg, namedInvariantsModule } from '../src/tlc'

const config = { tlaCode: 'compiled', moduleName: 'Model', hasInvariant: true, hasTemporal: false }

describe('named invariants for TLC', () => {
  it('lists one line per name instead of the combined invariant, so TLC reports the violated one', () => {
    expect(generateCfg({ ...config, invariantNames: ['safe', 'that_one'] })).to.equal(
      'INIT q_init\nNEXT q_step\nINVARIANT q_inv_safe\nINVARIANT q_inv_that_one\n'
    )
  })

  it('writes the same cfg as before when no names are given', () => {
    expect(generateCfg(config)).to.equal('INIT q_init\nNEXT q_step\nINVARIANT q_inv\n')
  })

  it('adds no named lines without an invariant', () => {
    expect(generateCfg({ ...config, hasInvariant: false, invariantNames: ['safe'] })).to.equal(
      'INIT q_init\nNEXT q_step\n'
    )
  })

  it('defines each name in a module that extends the compiled one', () => {
    expect(namedInvariantsModule({ ...config, invariantNames: ['safe', 'that_one'] }, 'Model_Quint')).to.equal(
      '---- MODULE Model_Quint ----\nEXTENDS Model\nq_inv_safe == safe\nq_inv_that_one == that_one\n====\n'
    )
  })
})
