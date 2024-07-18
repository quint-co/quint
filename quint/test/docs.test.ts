import { assert } from 'chai'
import { describe, it } from 'mocha'
import { produceDocs, toMarkdown } from '../src/docs'
import { buildModuleWithDecls } from './builders/ir'
import { dedent } from './textUtils'

describe('produceDocs', () => {
  const module = buildModuleWithDecls([
    dedent(
      `/// This is a docstring for foo
    |val foo = 1`
    ),
  ])

  it('produces documentation for all definitions', () => {
    const docs = produceDocs(module)

    assert.sameDeepMembers(
      [...docs.values()],
      [
        {
          name: 'foo',
          signature: 'val foo',
          documentation: 'This is a docstring for foo',
        },
      ]
    )
  })
})

describe('toMarkdown', () => {
  const doc = {
    name: 'foo',
    signature: 'val foo',
    documentation: 'This is a docstring for foo',
  }

  it('produces markdown out of a documentation entry', () => {
    const expectedMarkdown = dedent(
      `## foo
      |
      |Signature: \`val foo\`
      |
      |This is a docstring for foo`
    )

    assert.deepEqual(toMarkdown(doc), expectedMarkdown)
  })
})
