import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ParserPhase3 } from '@informalsystems/quint'
import { Position } from 'vscode-languageserver/node'
import { findReferencesAtPosition } from '../src/references'
import { parseOrThrow, parseProjectOrThrow } from './util'

function indexToPosition(text: string, index: number): Position {
  const upToIndex = text.slice(0, index)
  const lines = upToIndex.split('\n')
  return {
    line: lines.length - 1,
    character: lines[lines.length - 1].length,
  }
}

describe('findReferencesAtPosition', () => {
  const mockedUri = 'untitled:mocked_path'
  const moduleText = `module test {
  val foo = 1
  val x = foo + foo
}`

  const [modules, sourceMap, table] = parseOrThrow(moduleText)
  const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
  const fooRefIndex = moduleText.indexOf('foo +')
  const position = indexToPosition(moduleText, fooRefIndex)

  it('returns references for the symbol at the given position', () => {
    const references = findReferencesAtPosition(parsedData, mockedUri, position, false)
    assert.isAtLeast(references.length, 1)
    assert.isTrue(references.every(reference => reference.uri.endsWith('mocked_path')))
  })

  it('includes declaration when requested', () => {
    const referencesWithoutDecl = findReferencesAtPosition(parsedData, mockedUri, position, false)
    const referencesWithDecl = findReferencesAtPosition(parsedData, mockedUri, position, true)

    assert.isAtLeast(referencesWithDecl.length, referencesWithoutDecl.length)
  })

  it('finds references when cursor is at end of selected symbol', () => {
    const fooStartIndex = moduleText.indexOf('foo +')
    const endOfFooPosition = indexToPosition(moduleText, fooStartIndex + 'foo'.length)
    const references = findReferencesAtPosition(parsedData, mockedUri, endOfFooPosition, false)

    assert.isAtLeast(references.length, 2)
  })

  it('finds references when the cursor is on the declaration', () => {
    const declIndex = moduleText.indexOf('foo = 1')
    const declPosition = indexToPosition(moduleText, declIndex)
    const references = findReferencesAtPosition(parsedData, mockedUri, declPosition, false)

    assert.isAtLeast(references.length, 2)
  })

  it('returns no references when cursor is on numeric literal', () => {
    const literalIndex = moduleText.indexOf('1')
    const literalPosition = indexToPosition(moduleText, literalIndex)
    const references = findReferencesAtPosition(parsedData, mockedUri, literalPosition, false)

    assert.deepEqual(references, [])
  })

  it('returns no references on numeric literal even with includeDeclaration', () => {
    const literalIndex = moduleText.indexOf('1')
    const literalPosition = indexToPosition(moduleText, literalIndex)
    const references = findReferencesAtPosition(parsedData, mockedUri, literalPosition, true)

    assert.deepEqual(references, [])
  })

  it('returns no references when cursor is on operator token', () => {
    const plusIndex = moduleText.indexOf('+')
    const plusPosition = indexToPosition(moduleText, plusIndex)
    const references = findReferencesAtPosition(parsedData, mockedUri, plusPosition, true)

    assert.deepEqual(references, [])
  })

  it('finds references for def usages', () => {
    const text = `module test {
  def addOne(x) = x + 1
  val y = addOne(1) + addOne(2)
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const callIndex = text.indexOf('addOne(1)')
    const callPosition = indexToPosition(text, callIndex)

    const references = findReferencesAtPosition(parsedData, mockedUri, callPosition, false)
    assert.isAtLeast(references.length, 2)
  })

  it('finds references for var declaration and usages', () => {
    const text = `module test {
  var counter: int
  def f() = counter + counter
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const declIndex = text.indexOf('counter: int')
    const declPosition = indexToPosition(text, declIndex)

    const references = findReferencesAtPosition(parsedData, mockedUri, declPosition, true)
    assert.isAtLeast(references.length, 3)
  })

  it('finds var references when cursor is at end of selected var name', () => {
    const text = `module test {
  var counter: int
  def f() = counter + counter
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const varNameStart = text.indexOf('counter: int')
    const endOfVarName = indexToPosition(text, varNameStart + 'counter'.length)

    const references = findReferencesAtPosition(parsedData, mockedUri, endOfVarName, true)
    assert.isAtLeast(references.length, 3)
  })

  it('finds references across imported files/modules', () => {
    const [parsedData, { rootDir, entryUri }] = parseProjectOrThrow('B.qnt', {
      'A.qnt': `module A {
  val X = 1
  def inc(v) = v + X
}`,
      'B.qnt': `module B {
  import A.* from "./A"
  def f(y) = inc(y) + X
}`,
    })

    const bSource = `module B {
  import A.* from "./A"
  def f(y) = inc(y) + X
}`
    const incPos = indexToPosition(bSource, bSource.indexOf('inc(y)'))
    const xPos = indexToPosition(bSource, bSource.lastIndexOf('X'))

    const incRefs = findReferencesAtPosition(parsedData as unknown as ParserPhase3, entryUri, incPos, true)
    const xRefs = findReferencesAtPosition(parsedData as unknown as ParserPhase3, entryUri, xPos, true)

    const aUriSuffix = `${rootDir}/A.qnt`
    const bUriSuffix = `${rootDir}/B.qnt`
    assert.isTrue(incRefs.some(r => r.uri.endsWith(aUriSuffix)))
    assert.isTrue(incRefs.some(r => r.uri.endsWith(bUriSuffix)))
    assert.isTrue(xRefs.some(r => r.uri.endsWith(aUriSuffix)))
    assert.isTrue(xRefs.some(r => r.uri.endsWith(bUriSuffix)))
  })
})
