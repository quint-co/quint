import { assert } from 'chai'
import { describe, it } from 'mocha'
import { produceDocs, toMarkdown } from '../src/docs'
import { buildModuleWithDefs } from './builders/ir'

describe('produceDocs', () => {
  const module = buildModuleWithDefs([
    `/// This is a docstring for foo\nval foo = 1`,
  ])

  it('produces documentation for all definitions', () => {
    const docs = produceDocs(module)

    assert.sameDeepMembers([...docs.values()], [{
      label: 'val foo',
      documentation: 'This is a docstring for foo',
    }])
  })
})

describe('toMarkdown', () => {
  const doc = {
    label: 'val foo',
    documentation: 'This is a docstring for foo',
  }

  it('produces markdown out of a documentation entry', () => {
    const expectedMarkdown = `## \`val foo\`\n\nThis is a docstring for foo`

    assert.deepEqual(toMarkdown(doc), expectedMarkdown)
  })
})
