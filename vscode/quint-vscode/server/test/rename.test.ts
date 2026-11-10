import { describe, it } from 'mocha'
import { assert } from 'chai'
import { analyzeModules, newIdGenerator } from '@informalsystems/quint'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { URI } from 'vscode-uri'
import { findFieldRenameEdits } from '../src/rename'
import { parseDocument } from '../src/parsing'

const moduleText = `module test {
  type S = {
    close: int,
    // close: is a comment
    other: bool,
  }
  type T = { close: str }
  pure def getClose(s: S): int = s.close
  pure def setClose(s: S): S = { ...s, close: 1 }
  pure def explicitClose(s: S): int = field(s, "close")
  pure def anyClose(r) = r.close
  pure def mkT: T = { close: "x" }
  pure def nested: { inner: { close: int }, close: int } = { inner: { close: 1 }, close: 2 }
}`

function renameAt(search: string, offsetInSearch: number = 0): string | undefined {
  const uri = URI.parse('untitled:mocked_path')
  const parsedData = parseDocument(newIdGenerator(), uri, moduleText)
  assert.isEmpty(parsedData.errors)
  const [errors, analysisOutput] = analyzeModules(parsedData.table, parsedData.modules)
  assert.isEmpty(errors)

  const document = TextDocument.create(uri.toString(), 'quint', 1, moduleText)
  const position = document.positionAt(moduleText.indexOf(search) + offsetInSearch)
  const edits = findFieldRenameEdits(parsedData, analysisOutput, document, uri.path, position, 'NEW')
  return edits ? TextDocument.applyEdits(document, edits) : undefined
}

describe('findFieldRenameEdits', () => {
  it('renames a field in all records of the same shape', () => {
    const renamed = renameAt('s.close', 2)
    assert.equal(
      renamed,
      `module test {
  type S = {
    NEW: int,
    // close: is a comment
    other: bool,
  }
  type T = { close: str }
  pure def getClose(s: S): int = s.NEW
  pure def setClose(s: S): S = { ...s, NEW: 1 }
  pure def explicitClose(s: S): int = field(s, "NEW")
  pure def anyClose(r) = r.NEW
  pure def mkT: T = { close: "x" }
  pure def nested: { inner: { close: int }, close: int } = { inner: { close: 1 }, close: 2 }
}`
    )
  })

  it('renames from the field declaration in a type', () => {
    assert.equal(renameAt('close: int,'), renameAt('s.close', 2))
  })

  it('renames with the cursor right after the field name', () => {
    assert.equal(renameAt('s.close', 's.close'.length), renameAt('s.close', 2))
  })

  it('renames the outer field without the nested one', () => {
    const renamed = renameAt('close: 2')
    assert.include(renamed, 'pure def nested: { inner: { close: int }, NEW: int } = { inner: { close: 1 }, NEW: 2 }')
  })

  it('renames the nested field without the outer one', () => {
    const renamed = renameAt('close: 1 },')
    assert.include(renamed, 'pure def nested: { inner: { NEW: int }, close: int } = { inner: { NEW: 1 }, close: 2 }')
  })

  it('keeps fields of records with a different field type', () => {
    const renamed = renameAt('close: "x"')
    assert.include(renamed, 'type T = { NEW: str }')
    assert.include(renamed, 'pure def mkT: T = { NEW: "x" }')
    assert.include(renamed, 'pure def getClose(s: S): int = s.close')
    assert.include(
      renamed,
      'pure def nested: { inner: { close: int }, close: int } = { inner: { close: 1 }, close: 2 }'
    )
  })

  it('returns undefined when the cursor is not on a field name', () => {
    assert.isUndefined(renameAt('getClose'))
  })
})
