import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ParserPhase3 } from '@informalsystems/quint'
import { Position } from 'vscode-languageserver/node'
import { findDefinition } from '../src/definitions'
import { parseOrThrow, parseProjectOrThrow } from './util'

function indexToPosition(text: string, index: number): Position {
  const upToIndex = text.slice(0, index)
  const lines = upToIndex.split('\n')
  return {
    line: lines.length - 1,
    character: lines[lines.length - 1].length,
  }
}

describe('findDefinition', () => {
  const mockedUri = 'untitled:mocked_path'

  it('finds val definition from usage', () => {
    const text = `module test {
  val foo = 1
  val x = foo + foo
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const usageIndex = text.indexOf('foo +')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds def definition from usage', () => {
    const text = `module test {
  def addOne(x) = x + 1
  val y = addOne(1) + addOne(2)
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const usageIndex = text.indexOf('addOne(1)')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds const definition from usage inside def', () => {
    const text = `module test {
  const LIMIT: int
  def f(x) = x < LIMIT
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    // Pick the usage in the def body, not the declaration.
    const usageIndex = text.lastIndexOf('LIMIT')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds var definition from usage inside def', () => {
    const text = `module test {
  var counter: int
  def f() = counter + 1
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const usageIndex = text.indexOf('counter +')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds type alias definition from usage inside def signature', () => {
    const text = `module test {
  type Amount = int
  def f(x: Amount): Amount = x
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const usageIndex = text.indexOf('Amount):')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds parameter definition from usage inside def body', () => {
    const text = `module test {
  def f(amount) = amount + 1
}`
    const [modules, sourceMap, table] = parseOrThrow(text)
    const parsedData = { modules, sourceMap, table } as unknown as ParserPhase3
    const usageIndex = text.indexOf('amount +')
    const position = indexToPosition(text, usageIndex)

    const link = findDefinition(parsedData, mockedUri, position)

    assert.isDefined(link?.definitionId)
  })

  it('finds imported val/type/def definitions across files', () => {
    const [parsedData, { rootDir, entryUri }] = parseProjectOrThrow('B.qnt', {
      'A.qnt': `module A {
  val X = 1
  type T = int
  def inc(v: T): T = v + X
}`,
      'B.qnt': `module B {
  import A.* from "./A"
  def f(y: T): T = inc(y) + X
}`,
    })

    const sourcePath = `${rootDir}/B.qnt`
    const source = `module B {
  import A.* from "./A"
  def f(y: T): T = inc(y) + X
}`

    const tPos = indexToPosition(source, source.indexOf('T):'))
    const incPos = indexToPosition(source, source.indexOf('inc(y)'))
    const xPos = indexToPosition(source, source.lastIndexOf('X'))

    const tLink = findDefinition(parsedData as unknown as ParserPhase3, entryUri, tPos)
    const incLink = findDefinition(parsedData as unknown as ParserPhase3, entryUri, incPos)
    const xLink = findDefinition(parsedData as unknown as ParserPhase3, entryUri, xPos)

    assert.isDefined(tLink?.definitionId)
    assert.isDefined(incLink?.definitionId)
    assert.isDefined(xLink?.definitionId)
    assert.notEqual(parsedData.sourceMap.get(tLink!.definitionId!)?.source, sourcePath)
    assert.notEqual(parsedData.sourceMap.get(incLink!.definitionId!)?.source, sourcePath)
    assert.notEqual(parsedData.sourceMap.get(xLink!.definitionId!)?.source, sourcePath)
  })
})
