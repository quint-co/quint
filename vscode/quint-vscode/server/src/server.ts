/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  HandlerResult,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  MarkupContent,
  MarkupKind,
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

import { DocumentationEntry, ParserPhase2, builtinDocs, parsePhase1, parsePhase2, produceDocs } from '@informalsystems/quint'
import { InferredData, checkTypesAndEffects } from './inferredData'
import { assembleDiagnostic, findResult } from './reporting'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

// Store auxiliary information by document
const inferredDataByDocument: Map<DocumentUri, InferredData> = new Map<DocumentUri, InferredData>()
const docsByDocument: Map<DocumentUri, Map<string, DocumentationEntry>> =
  new Map<DocumentUri, Map<string, DocumentationEntry>>()

const ds = builtinDocs()
const loadedBuiltInDocs = ds.isRight() ? ds.value : undefined

connection.onInitialize((_params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  }
  return result
})

// Only keep information for open documents
documents.onDidClose(e => {
  docsByDocument.delete(e.document.uri)
  inferredDataByDocument.delete(e.document.uri)
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  console.log('File content changed, checking types and effects again')

  parseDocument(change.document)
    .then((result) => {
      docsByDocument.set(change.document.uri, produceDocs(result.module))
      return checkTypesAndEffects(result.module, result.sourceMap, result.table)
    })
    .then((inferredData) => {
      inferredDataByDocument.set(change.document.uri, inferredData)

      // Clear possible old diagnostics
      connection.sendDiagnostics({ uri: change.document.uri, diagnostics: [] })
    })
    .catch(diagnostics => {
      // Send the computed diagnostics to VSCode.
      connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
    })
})

connection.onHover((params: HoverParams): Hover | undefined => {
  const inferredData = inferredDataByDocument.get(params.textDocument.uri)
  if (!inferredData) {
    console.log('Cound not find inferred data for document')
    return
  }

  const type = findResult(inferredData.types, params.position)
  const effect = findResult(inferredData.effects, params.position)

  let hoverText = ''
  if (type !== undefined) {
    hoverText += `type: ${type}\n`
  }
  if (effect !== undefined) {
    hoverText += `effect: ${effect}\n`
  }

  return {
    contents: {
      kind: MarkupKind.PlainText,
      value: hoverText,
    },
  }
})

connection.onSignatureHelp((params: SignatureHelpParams): HandlerResult<SignatureHelp, void> => {
  const document = documents.get(params.textDocument.uri)!
  const lineUpToPosition = document.getText({
    start: { line: params.position.line, character: 0 },
    end: params.position,
  })

  // Match the last word before the `(` character (which triggered the request)
  const matchingNames = lineUpToPosition.match(/(\w+)\s*\(\s*$/)
  if (matchingNames === null) {
    return { signatures: [], activeSignature: 0, activeParameter: 0 }
  }

  const name = matchingNames[1]
  const signature = docsByDocument.get(params.textDocument.uri)!.get(name)! ?? loadedBuiltInDocs?.get(name)!
  const signatureWithMarkupKind = signature?.documentation
    ? { ...signature, documentation: { kind: 'markdown', value: signature.documentation } as MarkupContent }
    : signature

  return {
    signatures: [signatureWithMarkupKind],
    activeSignature: 0,
    activeParameter: 0,
  }
})

async function parseDocument(textDocument: TextDocument): Promise<ParserPhase2> {
  const text = textDocument.getText()

  const result = parsePhase1(text, textDocument.uri)
    .chain(phase1Data => parsePhase2(phase1Data))
    .mapLeft(messages => messages.flatMap(msg => msg.locs.map(loc => assembleDiagnostic(msg.explanation, loc))))

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
