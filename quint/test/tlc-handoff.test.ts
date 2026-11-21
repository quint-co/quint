import { expect } from 'chai'
import fs from 'fs'
import os from 'os'
import path from 'path'
import AdmZip from 'adm-zip'
import { Buffer } from 'buffer'
import { emitDirectory, verify } from '../src/tlc'
import { freeServerEndpoint } from '../src/compileToTlaplus'

describe('emitDirectory', () => {
  it('writes a constrained wrapper and the Apalache modules', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quint-emit-test-'))
    try {
      const lib = path.join(root, 'apalache.jar')
      const out = path.join(root, 'out')
      const jar = new AdmZip()
      for (const name of ['Apalache', 'Variants', 'Option'])
        jar.addFile(`tla2sany/StandardModules/${name}.tla`, Buffer.from(name))
      jar.writeZip(lib)
      emitDirectory(
        {
          tlaCode: 'compiled',
          moduleName: 'Model',
          hasInvariant: true,
          hasTemporal: true,
          invariantNames: ['safe', 'that_one'],
          constraint: 'now <= 6',
        },
        out,
        lib
      )
      expect(fs.readFileSync(path.join(out, 'Model.tla'), 'utf8')).to.equal('compiled')
      expect(fs.readFileSync(path.join(out, 'Model_Quint.tla'), 'utf8'))
        .to.contain('EXTENDS Model')
        .and.contain('now <= 6')
      expect(fs.readFileSync(path.join(out, 'Model_Quint.cfg'), 'utf8')).to.equal(
        'INIT q_init\nNEXT q_step\nINVARIANT q_inv_safe\nINVARIANT q_inv_that_one\nPROPERTY q_temporalProps\nCONSTRAINT q_constraint\n'
      )
      expect(fs.readFileSync(path.join(out, 'Model_Quint.tla'), 'utf8'))
        .to.contain('q_inv_safe == safe')
        .and.contain('q_inv_that_one == that_one')
      expect(fs.readFileSync(path.join(out, 'Option.tla'), 'utf8')).to.equal('Option')
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('checker handoff', () => {
  it('allocates distinct free endpoints', async () => {
    const endpoints = await Promise.all([freeServerEndpoint(), freeServerEndpoint()])
    expect(endpoints[0].port).not.to.equal(endpoints[1].port)
  })

  it('writes the directory instead of running a checker', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quint-check-test-'))
    const oldHome = process.env.QUINT_HOME
    try {
      process.env.QUINT_HOME = root
      const lib = path.join(root, 'apalache-dist-test', 'apalache', 'lib')
      fs.mkdirSync(lib, { recursive: true })
      const jar = new AdmZip()
      for (const name of ['Apalache', 'Variants', 'Option'])
        jar.addFile(`tla2sany/StandardModules/${name}.tla`, Buffer.from(name))
      jar.writeZip(path.join(lib, 'apalache.jar'))
      const out = path.join(root, 'out')
      const result = await verify(
        { tlaCode: 'compiled', moduleName: 'Model', hasInvariant: true, hasTemporal: false },
        'test',
        {},
        0,
        out
      )
      expect(result.isRight()).to.be.true
      expect(fs.readFileSync(path.join(out, 'Model_Quint.cfg'), 'utf8')).to.equal(
        'INIT q_init\nNEXT q_step\nINVARIANT q_inv\n'
      )
    } finally {
      if (oldHome === undefined) delete process.env.QUINT_HOME
      else process.env.QUINT_HOME = oldHome
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
