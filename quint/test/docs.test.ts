import { assert } from 'chai'
import { describe, it } from 'mocha'
import { produceDocs, toMarkdown } from '../src/docs'
import { buildModuleWithDefs } from './builders/ir'
import { dedent } from './textUtils'

describe('produceDocs', () => {
  const module = buildModuleWithDefs([
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
          label: 'val foo',
          documentation: 'This is a docstring for foo',
        },
      ]
    )
  })
})

describe('toMarkdown', () => {
  const doc = {
    label: 'val foo',
    documentation: 'This is a docstring for foo',
  }

  it('produces markdown out of a documentation entry', () => {
    const expectedMarkdown = dedent(
      `## \`val foo\`
      |
      |This is a docstring for foo`
    )

    assert.deepEqual(toMarkdown(doc), expectedMarkdown)
  })
})
