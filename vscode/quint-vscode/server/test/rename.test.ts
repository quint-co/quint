import { describe, it } from 'mocha'
import { assert } from 'chai'
import { analyzeModules, newIdGenerator } from '@informalsystems/quint'
import { ResponseError, TextEdit } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { URI } from 'vscode-uri'
import { CompiledDocument, checkParsedTextIsCurrent, findFieldRenameEdits } from '../src/rename'
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
  pure def mkT: T = { close: "x" }
  pure def nested: { inner: { close: int }, close: int } = { inner: { close: 1 }, close: 2 }
}`

const uri = URI.parse('untitled:mocked_path')

// Compile like the server does: every compilation starts with the same IDs.
function compile(parsedText: string, analyzedText: string = parsedText): CompiledDocument {
  const parsedData = parseDocument(newIdGenerator(), uri, parsedText)
  const analyzed = parseDocument(newIdGenerator(), uri, analyzedText)
  assert.isEmpty(analyzed.errors)
  const [errors, analysisOutput] = analyzeModules(analyzed.table, analyzed.modules)
  assert.isEmpty(errors)
  return { parsedData, parsedText, analysisOutput, analyzedText }
}

function fieldRenameEdits(
  compiled: CompiledDocument,
  search: string,
  offsetInSearch: number
): [TextDocument, TextEdit[] | ResponseError<void> | undefined] {
  const text = compiled.parsedText
  const document = TextDocument.create(uri.toString(), 'quint', 1, text)
  const position = document.positionAt(text.indexOf(search) + offsetInSearch)
  return [document, findFieldRenameEdits(compiled, document, uri.path, position, 'NEW')]
}

function renameAt(search: string, offsetInSearch: number = 0, text: string = moduleText): string | undefined {
  const compiled = compile(text)
  assert.isEmpty(compiled.parsedData.errors)
  const [document, edits] = fieldRenameEdits(compiled, search, offsetInSearch)
  assert.notInstanceOf(edits, ResponseError)
  return edits ? TextDocument.applyEdits(document, edits as TextEdit[]) : undefined
}

function renameErrorAt(compiled: CompiledDocument, search: string, offsetInSearch: number = 0): string {
  const [, edits] = fieldRenameEdits(compiled, search, offsetInSearch)
  assert.instanceOf(edits, ResponseError)
  return (edits as ResponseError<void>).message
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

  describe('on a record of unknown type', () => {
    const openText = `module test {
  type S = { close: int }
  type T = { close: str }
  pure def anyClose(r) = r.close
  pure def getClose(s: S): int = s.close
  pure def mkT: T = { close: "x" }
}`

    it('refuses to rename a field that is also accessed on it', () => {
      const message = renameErrorAt(compile(openText), 's.close', 2)
      assert.include(message, 'line 4')
    })

    it('renames the field in all records when the cursor is on it', () => {
      const renamed = renameAt('r.close', 2, openText)
      assert.include(renamed, 'pure def anyClose(r) = r.NEW')
      assert.include(renamed, 'pure def getClose(s: S): int = s.NEW')
      assert.include(renamed, 'pure def mkT: T = { NEW: "x" }')
    })
  })

  describe('with out-of-date types', () => {
    // A definition before the others shifts the IDs of all later expressions.
    const editedText = moduleText.replace('  type T =', '  pure def one: int = 1\n  type T =')

    it('refuses to rename while the types are for an earlier text', () => {
      const message = renameErrorAt(compile(editedText, moduleText), 's.close', 2)
      assert.include(message, 'needs the types of the current text')
    })

    it('refuses to rename while the document has a syntax error', () => {
      const brokenText = editedText.replace('pure def one: int = 1', 'pure def one: int =')
      const compiled = compile(brokenText, moduleText)
      assert.isNotEmpty(compiled.parsedData.errors)
      const message = renameErrorAt(compiled, 's.close', 2)
      assert.include(message, 'needs the types of the current text')
    })
  })
})

describe('checkParsedTextIsCurrent', () => {
  it('accepts a parse of the current text', () => {
    const document = TextDocument.create(uri.toString(), 'quint', 1, moduleText)
    assert.isUndefined(checkParsedTextIsCurrent(compile(moduleText), document))
  })

  it('refuses a parse of an earlier text', () => {
    const document = TextDocument.create(uri.toString(), 'quint', 2, moduleText + '\n')
    assert.instanceOf(checkParsedTextIsCurrent(compile(moduleText), document), ResponseError)
  })
})
