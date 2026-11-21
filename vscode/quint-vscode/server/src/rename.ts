import {
  AnalysisOutput,
  IRVisitor,
  LookupTable,
  ParserPhase3,
  QuintApp,
  QuintDef,
  QuintEx,
  QuintRecordType,
  QuintType,
  Row,
  rowFieldNames,
  walkModule,
} from '@informalsystems/quint'
import { unify } from '@informalsystems/quint/dist/src/types/constraintSolver'
import { Position, Range, ResponseError, TextEdit } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { locToRange } from './reporting'

/**
 * Return a regular expression that accepts the qualifiers and name of a Quint definition.
 *
 * The regular expression recognizes two capture groups:
 *   - the first capture group matches the qualifiers,
 *   - the second capture group matches the declaration's name.
 */
export function getDeclRegExp(decl: QuintDef): RegExp {
  switch (decl.kind) {
    case 'const':
    case 'var':
    case 'assume':
      return RegExp(`(${decl.kind})\\s+(${decl.name})`)
    case 'typedef':
      return RegExp(`(type)\\s+(${decl.name})`)
    case 'def':
      switch (decl.qualifier) {
        case 'def':
        case 'val':
        case 'nondet':
        case 'action':
        case 'run':
        case 'temporal':
          return RegExp(`(${decl.qualifier})\\s+(${decl.name})`)
        case 'pureval':
          return RegExp(`(pure\\s+val)\\s+(${decl.name})`)
        case 'puredef':
          return RegExp(`(pure\\s+def)\\s+(${decl.name})`)
      }
  }
}

/**
 * A place in the document that names a record field, with the type of the
 * record it belongs to. The type is undefined if it is unknown.
 */
interface FieldOccurrence {
  name: string
  range: Range
  recordType: QuintRecordType | undefined
}

// `RequestFailed` of LSP 3.17, which our version of vscode-languageserver does
// not define yet. Unlike `ContentModified`, VS Code shows its message.
const requestFailed = -32803

/**
 * The results of the compilation pipeline for a document, with the document
 * text that each of them was computed from.
 */
export interface CompiledDocument {
  parsedData: ParserPhase3
  parsedText: string
  analysisOutput: AnalysisOutput | undefined
  analyzedText: string | undefined
}

/**
 * Check that the parse result belongs to the current document text. If the
 * document changed since, the locations in the source map point to the wrong
 * places, and no rename edit can be computed.
 *
 * @returns an error if the parse result is out of date, undefined otherwise
 */
export function checkParsedTextIsCurrent(
  compiled: CompiledDocument,
  document: TextDocument
): ResponseError<void> | undefined {
  return compiled.parsedText === document.getText()
    ? undefined
    : new ResponseError(requestFailed, 'The document is still being processed. Try again.')
}

/**
 * Compute the edits to rename the record field under the cursor.
 *
 * Field names are not in the lookup table: in expressions they are string
 * arguments of `Rec`, `field` and `with`, and in types they are row fields
 * without an ID. Thus, we collect all field names in the document and rename
 * those with the same name in records whose type unifies with the type of the
 * record under the cursor.
 *
 * Assumes that the parse result belongs to the current document text, see
 * `checkParsedTextIsCurrent`.
 *
 * @returns the edits, an error if the field cannot be renamed safely, or
 *   undefined if the cursor is not on a field name
 */
export function findFieldRenameEdits(
  compiled: CompiledDocument,
  document: TextDocument,
  sourceFile: string,
  position: Position,
  newName: string
): TextEdit[] | ResponseError<void> | undefined {
  const { parsedData, parsedText, analyzedText } = compiled
  // The analysis output refers to expressions by ID. IDs are reused across
  // compilations, so types of another text belong to other expressions.
  const analysisOutput = analyzedText === parsedText ? compiled.analysisOutput : undefined
  const occurrences = collectFieldOccurrences(parsedData, analysisOutput, document, sourceFile)
  const target = occurrences.find(o => containsPosition(o.range, position))
  if (!target) {
    return undefined
  }
  const targetType = target.recordType
  if (!targetType) {
    return new ResponseError(
      requestFailed,
      analysisOutput
        ? `The type of the record with field '${target.name}' is unknown.`
        : `Renaming field '${target.name}' needs the types of the current text. Fix the errors in the document, or wait until it is processed.`
    )
  }

  const { table } = parsedData
  const unifies = (t1: QuintRecordType, t2: QuintRecordType) => unify(table, t1, t2).isRight()
  const sameName = occurrences.filter(o => o.name === target.name)
  const renamed = new Set(sameName.filter(o => o.recordType && unifies(o.recordType, targetType)))
  const kept = sameName.filter(o => !renamed.has(o))

  // A record with an open row, as in `pure def f(r) = r.close`, unifies with
  // records that do not unify with each other. If we rename its field, records
  // that we keep and that are passed to it no longer type check.
  const conflict = [...renamed].find(
    o =>
      o.recordType &&
      isOpenRow(o.recordType.fields) &&
      kept.some(k => k.recordType && unifies(o.recordType!, k.recordType))
  )
  if (conflict) {
    return new ResponseError(
      requestFailed,
      `Field '${target.name}' is accessed on line ${conflict.range.start.line + 1} on a record of unknown type, ` +
        'which may be any of several record types. Annotate its type to rename the field.'
    )
  }

  const edits = new Map<string, TextEdit>()
  renamed.forEach(o => edits.set(JSON.stringify(o.range), { range: o.range, newText: newName }))
  return [...edits.values()]
}

function isOpenRow(row: Row): boolean {
  return row.kind === 'var' || (row.kind === 'row' && isOpenRow(row.other))
}

function collectFieldOccurrences(
  parsedData: ParserPhase3,
  analysisOutput: AnalysisOutput | undefined,
  document: TextDocument,
  sourceFile: string
): FieldOccurrence[] {
  const { modules, sourceMap, table } = parsedData
  const occurrences: FieldOccurrence[] = []

  const textOf = (id: bigint | undefined): [string, number] | undefined => {
    const loc = id !== undefined ? sourceMap.get(id) : undefined
    if (!loc || loc.source !== sourceFile) {
      return undefined
    }
    const range = locToRange(loc)
    return [document.getText(range), document.offsetAt(range.start)]
  }

  const recordTypeOf = (ex: QuintEx): QuintRecordType | undefined => {
    const type = analysisOutput?.types.get(ex.id)?.type
    return type ? asRecordType(table, type) : undefined
  }

  const addExprOccurrence = (nameEx: QuintEx, recordType: QuintRecordType | undefined) => {
    const text = textOf(nameEx.id)
    if (nameEx.kind !== 'str' || !text) {
      return
    }
    const offset = fieldNameOffset(text[0], nameEx.value)
    if (offset !== undefined) {
      occurrences.push({ name: nameEx.value, range: rangeAt(document, text[1] + offset, nameEx.value), recordType })
    }
  }

  const visitor: IRVisitor = {
    enterApp: (app: QuintApp) => {
      switch (app.opcode) {
        case 'Rec': {
          // Rec(name1, value1, name2, value2, ...)
          const recordType = recordTypeOf(app)
          app.args.filter((_, i) => i % 2 === 0).forEach(nameEx => addExprOccurrence(nameEx, recordType))
          break
        }
        case 'field':
        case 'with':
          // field(record, name) and with(record, name, value)
          if (app.args.length >= 2) {
            addExprOccurrence(app.args[1], recordTypeOf(app.args[0]))
          }
          break
      }
    },
    enterRecordType: (type: QuintRecordType) => {
      const text = textOf(type.id)
      if (!text) {
        return
      }
      for (const name of rowFieldNames(type.fields)) {
        for (const offset of fieldDeclarationOffsets(text[0], name)) {
          occurrences.push({ name, range: rangeAt(document, text[1] + offset, name), recordType: type })
        }
      }
    },
  }
  modules.forEach(m => walkModule(visitor, m))
  return occurrences
}

/**
 * The offset of a field name in the source text of its string expression.
 * The parser gives that expression one of these locations:
 *   - `name: value` in a record literal or spread,
 *   - `record.name` in a field access,
 *   - `"name"` in an explicit call such as `field(record, "name")`.
 */
function fieldNameOffset(text: string, name: string): number | undefined {
  if (text === `"${name}"`) {
    return 1
  }
  if (text.startsWith(name) && !isIdentChar(text.charAt(name.length))) {
    return 0
  }
  if (text.endsWith(name) && !isIdentChar(text.charAt(text.length - name.length - 1))) {
    return text.length - name.length
  }
  return undefined
}

/**
 * The offsets of `name:` directly inside the outermost braces of a record type.
 * Fields of nested record types and comments are skipped.
 */
function fieldDeclarationOffsets(text: string, name: string): number[] {
  const offsets: number[] = []
  let depth = 0
  let i = 0
  while (i < text.length) {
    if (text.startsWith('//', i)) {
      const end = text.indexOf('\n', i)
      i = end < 0 ? text.length : end
    } else if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 2
    } else if (text[i] === '{') {
      depth++
      i++
    } else if (text[i] === '}') {
      depth--
      i++
    } else if (isIdentChar(text[i])) {
      let end = i
      while (end < text.length && isIdentChar(text[end])) {
        end++
      }
      if (depth === 1 && text.slice(i, end) === name && /^\s*:/.test(text.slice(end))) {
        offsets.push(i)
      }
      i = end
    } else {
      i++
    }
  }
  return offsets
}

function asRecordType(table: LookupTable, type: QuintType): QuintRecordType | undefined {
  if (type.kind === 'const' && type.id) {
    const def = table.get(type.id)
    return def?.kind === 'typedef' && def.type ? asRecordType(table, def.type) : undefined
  }
  return type.kind === 'rec' ? type : undefined
}

function isIdentChar(c: string): boolean {
  return /[a-zA-Z0-9_]/.test(c)
}

function rangeAt(document: TextDocument, offset: number, name: string): Range {
  return { start: document.positionAt(offset), end: document.positionAt(offset + name.length) }
}

// The end is inclusive, so that a cursor right after the name also selects it.
function containsPosition(range: Range, position: Position): boolean {
  const after = (p: Position, q: Position) => p.line > q.line || (p.line === q.line && p.character >= q.character)
  return after(position, range.start) && after(range.end, position)
}
