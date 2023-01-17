/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  DefinitionParams,
  HandlerResult,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  Location,
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

import { DocumentationEntry, Loc, ParserPhase2, builtinDocs, parsePhase1, parsePhase2, produceDocs, treeFromModule } from '@informalsystems/quint'
import { InferredData, checkTypesAndEffects } from './inferredData'
import { assembleDiagnostic, findBestMatchingResult, findName, locToRange } from './reporting'
import { lookupValue } from '@informalsystems/quint/dist/src/lookupTable'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

// Store auxiliary information by document
const parsedDataByDocument: Map<DocumentUri, ParserPhase2> = new Map<DocumentUri, ParserPhase2>()
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
      definitionProvider: true,
    },
  }
  return result
})

// Only keep information for open documents
documents.onDidClose(e => {
  parsedDataByDocument.delete(e.document.uri)
  docsByDocument.delete(e.document.uri)
  inferredDataByDocument.delete(e.document.uri)
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  console.log('File content changed, checking types and effects again')

  parseDocument(change.document)
    .then((result) => {
      parsedDataByDocument.set(change.document.uri, result)
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
  function inferredDataHover(): string[] {
    const inferredData = inferredDataByDocument.get(params.textDocument.uri)
    if (!inferredData) {
      return []
    }

    const typeResult = findBestMatchingResult([...inferredData.types.entries()], params.position)
    const effectResult = findBestMatchingResult([...inferredData.effects.entries()], params.position)

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

    hoverText.push(`**type**: \`${type}\`\n`)

    if (effectResult) {
      const [, effect] = effectResult
      hoverText.push(`**effect**: \`${effect}\`\n`)
    }

    return hoverText
  }

  function documentationHover(): string[] {
    const parsedData = parsedDataByDocument.get(params.textDocument.uri)
    if (!parsedData) {
      return []
    }

    const { module, sourceMap } = parsedData
    const results: [Loc, bigint][] = [...sourceMap.entries()].map(([id, loc]) => [loc, id])
    const [name, _] = findName(module, results, params.position) ?? [undefined, undefined]
    if (!name) {
      return []
    }

    const signature = docsByDocument.get(params.textDocument.uri)!.get(name)! ?? loadedBuiltInDocs?.get(name)!
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

connection.onDefinition((params: DefinitionParams): HandlerResult<Location, void> => {
  const parsedData = parsedDataByDocument.get(params.textDocument.uri)
  if (!parsedData) {
    return Promise.reject('Document not parsed')
  }

  const { module, sourceMap, table } = parsedData
  const results: [Loc, bigint][] = [...sourceMap.entries()].map(([id, loc]) => [loc, id])
  const [name, scope] = findName(module, results, params.position) ?? [undefined, undefined]
  if (!name) {
    return Promise.reject('No name found')
  }

  const scopeTree = treeFromModule(module)

  const def = lookupValue(table.get(module.name)!, scopeTree, name, scope)
  if (def?.reference) {
    const loc = sourceMap.get(def.reference)
    if (loc) {
      return { uri: params.textDocument.uri, range: locToRange(loc) }
    }
  }

  return Promise.reject(`Definition for name ${name} not found`)
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
