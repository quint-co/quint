/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  DefinitionLink,
  DefinitionParams,
  HandlerResult,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  MarkupContent,
  MarkupKind,
  Position,
  ProposedFeatures,
  SignatureHelp,
  SignatureHelpParams,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection
} from 'vscode-languageserver/node'

import {
  DocumentUri,
  TextDocument
} from 'vscode-languageserver-textdocument'

import {
  AnalyzisOutput, DocumentationEntry, Loc, ParserPhase3, QuintAnalyzer, QuintError, QuintErrorData, builtinDocs, effectSchemeToString, newIdGenerator,
  parsePhase1fromText, parsePhase2sourceResolution, parsePhase3importAndNameResolution, produceDocsById, typeSchemeToString
} from '@informalsystems/quint'
import { assembleDiagnostic, diagnosticsFromErrors, findBestMatchingResult, findName, locToRange } from './reporting'
import { fileSourceResolver } from '@informalsystems/quint/dist/src/sourceResolver'
import { URI } from 'vscode-uri'
import { basename, dirname } from 'path'

// Create one generator of unique identifiers
const idGenerator = newIdGenerator()

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

// Store auxiliary information by document
const parsedDataByDocument: Map<DocumentUri, ParserPhase3> = new Map()
const analysisOutputByDocument: Map<DocumentUri, AnalyzisOutput> = new Map()
// Documentation entries by id, by document
const docsByDocument: Map<DocumentUri, Map<bigint, DocumentationEntry>> = new Map()

const ds = builtinDocs(idGenerator)
const loadedBuiltInDocs = ds.isRight() ? ds.value : undefined

connection.onInitialize((_params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
      definitionProvider: true,
      codeActionProvider: true,
    },
  }
  return result
})

// Only keep information for open documents
documents.onDidClose(e => {
  parsedDataByDocument.delete(e.document.uri)
  docsByDocument.delete(e.document.uri)
  analysisOutputByDocument.delete(e.document.uri)
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  console.log('File content changed, checking types and effects again')

  parseDocument(change.document).then((result) => {
    parsedDataByDocument.set(change.document.uri, result)
    docsByDocument.set(change.document.uri, new Map(result.modules.flatMap(m => [...produceDocsById(m).entries()])))

    const analyzer = new QuintAnalyzer(result.table)
    result.modules.forEach(module => analyzer.analyze(module))
    const [errors, analysisOutput] = analyzer.getResult()

    analysisOutputByDocument.set(change.document.uri, analysisOutput)

    const diagnostics = diagnosticsFromErrors(errors, result.sourceMap)
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
  }).catch(diagnostics => {
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
  })
})

connection.onHover((params: HoverParams): Hover | undefined => {
  function inferredDataHover(): string[] {
    const parsedData = parsedDataByDocument.get(params.textDocument.uri)
    const analysisOutput = analysisOutputByDocument.get(params.textDocument.uri)
    if (!parsedData || !analysisOutput) {
      return []
    }
    const source = URI.parse(params.textDocument.uri).path

    const typeResult = findBestMatchingResult(
      parsedData.sourceMap, [...analysisOutput.types.entries()], params.position, source
    )
    const effectResult = findBestMatchingResult(
      parsedData.sourceMap, [...analysisOutput.effects.entries()], params.position, source
    )

    // There are cases where we have types but not effects, but not the other way around
    // Therefore, we only check for typeResult here and handle missing effects later
    // As if there are no types, there are no effects either
    if (!typeResult) {
      return []
    }

    const [loc, type] = typeResult

    const document = documents.get(params.textDocument.uri)!
    const text = document.getText(locToRange(loc))

    let hoverText = ["```qnt", text, "```", '']

    hoverText.push(`**type**: \`${typeSchemeToString(type)}\`\n`)

    if (effectResult) {
      const [, effect] = effectResult
      hoverText.push(`**effect**: \`${effectSchemeToString(effect)}\`\n`)
    }

    return hoverText
  }

  function documentationHover(): string[] {
    const parsedData = parsedDataByDocument.get(params.textDocument.uri)
    if (!parsedData) {
      return []
    }

    const link = findDefinition(parsedData, params.textDocument.uri, params.position)
    if (!link) {
      return []
    }

    const signature = link.definitionId
      ? docsByDocument.get(params.textDocument.uri)?.get(link.definitionId)
      : loadedBuiltInDocs?.get(link.name)

    if (!signature) {
      return []
    }

    let hoverText = ["```qnt", signature.label, "```", '']
    if (signature.documentation) {
      hoverText.push(signature.documentation)
    }
    return hoverText
  }

  const hoverText = [inferredDataHover(), documentationHover()]
    .filter(s => s.length > 0)
    .map(s => s.join('\n'))
    .join('\n-----\n')

  if (hoverText === '') {
    return undefined
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: hoverText,
    },
  }
})

connection.onSignatureHelp((params: SignatureHelpParams): HandlerResult<SignatureHelp, void> => {
  const emptySignatures = { signatures: [], activeSignature: 0, activeParameter: 0 }

  const parsedData = parsedDataByDocument.get(params.textDocument.uri)
  if (!parsedData) {
    return emptySignatures
  }

  const link = findDefinition(parsedData, params.textDocument.uri, params.position)
  if (!link) {
    return emptySignatures
  }

  const signature = link.definitionId
    ? docsByDocument.get(params.textDocument.uri)?.get(link.definitionId)
    : loadedBuiltInDocs?.get(link.name)

  console.log(signature)
  if (!signature) {
    return emptySignatures
  }

  const signatureWithMarkupKind = signature?.documentation
    ? { ...signature, documentation: { kind: 'markdown', value: signature.documentation } as MarkupContent }
    : signature

  return {
    signatures: [signatureWithMarkupKind],
    activeSignature: 0,
    activeParameter: 0,
  }
})

interface QuintDefinitionLink {
  nameId: bigint,
  name: string,
  definitionId?: bigint,
}

function findDefinition(parsedData: ParserPhase3, uri: string, position: Position): QuintDefinitionLink | undefined {
  // Find name under position
  const { modules, sourceMap, table } = parsedData
  const results: [Loc, bigint][] = [...sourceMap.entries()].map(([id, loc]) => [loc, id])
  const source = URI.parse(uri).path
  const [_module, name, id] = findName(modules, results, position, source) ?? [undefined, undefined, undefined]
  if (!name) {
    return undefined
  }

  // Find definition of name
  const def = table.get(id)
  if (!def || !def.reference) {
    return { nameId: id, name }
  }

  return {
    nameId: id,
    name,
    definitionId: def?.reference,
  }
}

connection.onDefinition((params: DefinitionParams): HandlerResult<DefinitionLink[], void> => {
  const parsedData = parsedDataByDocument.get(params.textDocument.uri)
  if (!parsedData) {
    return []
  }

  const link = findDefinition(parsedData, params.textDocument.uri, params.position)
  if (!link) {
    return []
  }

  const { nameId, name, definitionId } = link
  if (!definitionId) {
    return []
  }

  const loc = parsedData.sourceMap.get(definitionId)
  if (!loc) {
    return []
  }

  const range = locToRange(loc)
  const uri = URI.parse(loc.source).toString()

  // Definitions start with a qualifier. This finds where the definition name
  // actually starts and corrects the range. If the file is not opened in the
  // editor yet, we just use the original range. In the future, we should find
  // another way of positioning the cursor in the editor, or read the file from
  // disk.
  const text = documents.get(uri)?.getText(range) ?? name
  const unqualifiedName = name.split('::').pop()!
  const start = text.search(new RegExp(unqualifiedName))
  return [{
    // The range for the name being hover over
    originSelectionRange: locToRange(parsedData.sourceMap.get(nameId)!),
    targetUri: uri,
    // The range for the entire definition (including the qualifier and body)
    targetRange: range,
    // The range for the definition's name
    targetSelectionRange: { ...range, start: { ...range.start, character: range.start.character + start } },
  }]
})

connection.onCodeAction((params: CodeActionParams): HandlerResult<CodeAction[], void> => {
  return params.context.diagnostics.reduce((actions, diagnostic) => {
    const data = diagnostic.data as QuintErrorData
    const fix = data.fix

    switch (fix?.kind) {
      case 'replace': {
        const document = documents.get(params.textDocument.uri)!
        // For now, we try to apply the fix only for the first line in the range
        // which should be the most common case
        const lineNum = params.range.start.line
        const line = document.getText({
          start: { line: lineNum, character: 0 },
          end: { line: lineNum + 1, character: 0 },
        })

        const matchResult = line.match(new RegExp(fix.original))
        if (!matchResult) {
          return actions
        }

        const editRange = {
          ...diagnostic.range,
          end: {
            line: diagnostic.range.start.line,
            character: diagnostic.range.start.character + matchResult![0].length,
          },
        }

        const action: CodeAction = {
          title: `Replace ${fix.original} with ${fix.replacement}`,
          kind: CodeActionKind.QuickFix,
          isPreferred: true,
          diagnostics: [diagnostic],
          edit: {
            changes: {
              [params.textDocument.uri]: [{
                range: editRange,
                newText: fix.replacement,
              }],
            },
          },
        }

        actions.push(action)
      }
    }

    return actions
  }, [] as CodeAction[])
})

async function parseDocument(textDocument: TextDocument): Promise<ParserPhase3> {
  const text = textDocument.getText()

  // parse the URI to resolve imports
  const parsedUri = URI.parse(textDocument.uri)
  // currently, we only support the 'file://' scheme
  if (parsedUri.scheme !== 'file') {
    // see https://github.com/informalsystems/quint/issues/831
    return new Promise((_resolve, reject) =>
      reject(`Support imports from file, found: ${parsedUri.scheme}`))
  }

  const result = parsePhase1fromText(idGenerator, text, parsedUri.path)
    .chain(phase1Data => {
      const resolver = fileSourceResolver()
      const mainPath =
        resolver.lookupPath(dirname(parsedUri.fsPath), basename(parsedUri.fsPath))
      return parsePhase2sourceResolution(idGenerator, resolver, mainPath, phase1Data)
    })
    .chain(phase2Data => parsePhase3importAndNameResolution(phase2Data))
    .mapLeft(messages => messages.flatMap(msg => {
      // TODO: Parse errors should be QuintErrors
      const error: QuintError = { code: 'QNT000', message: msg.explanation, data: {} }
      return msg.locs.map(loc => assembleDiagnostic(error, loc))
    }))

  // result.map(data => console.log('parsed', data.modules.map(m => m.name)))

  if (result.isRight()) {
    return new Promise((resolve, _reject) => resolve(result.value))
  } else {
    return new Promise((_resolve, reject) => reject(result.value))
  }
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
