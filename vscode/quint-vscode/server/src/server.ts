/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  CompletionItem,
  CompletionItemKind,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  DocumentUri,
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
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection
} from 'vscode-languageserver/node'

import {
  TextDocument
} from 'vscode-languageserver-textdocument'

import { DocumentationEntry, Effect, Loc, LookupTableByModule, ParserPhase2, QuintModule, builtInDocs, checkModes, effectToString, errorTreeToString, inferEffects, inferTypes, parsePhase1, parsePhase2, produceDocs, typeSchemeToString } from '@informalsystems/quint'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

let hasConfigurationCapability = false
let hasWorkspaceFolderCapability = false

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  )
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  )

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['('],
      },
    },
  }
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    }
  }
  return result
})

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined)
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.')
    })
  }
})

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 }
let globalSettings: ExampleSettings = defaultSettings

// Cache the settings of all open documents
const documentSettings: Map<string, Promise<ExampleSettings>> = new Map()

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear()
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    )
  }

  // Revalidate all open text documents
  documents.all().forEach(d => {
    validateTextDocument(d)
      .then((result) => {
        return checkTypesAndEffects(d, result.module, result.sourceMap, result.table)
      })
      .catch(diagnostics => {
        // Send the computed diagnostics to VSCode.
        connection.sendDiagnostics({ uri: d.uri, diagnostics })
      })
  })
})

function _getDocumentSettings(resource: string): Promise<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings)
  }
  let result = documentSettings.get(resource)
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'quintLspClient',
    })
    documentSettings.set(resource, result)
  }
  return result
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri)
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  console.log('File content changed, checking types and effects again')
  validateTextDocument(change.document)
    .then((result) => {
      docsByDocument.set(change.document.uri, produceDocs(result.module))
      return checkTypesAndEffects(change.document, result.module, result.sourceMap, result.table)
    })
    // Clear possible old diagnostics
    .then((_) => connection.sendDiagnostics({ uri: change.document.uri, diagnostics: [] }))
    .catch(diagnostics => {
      // Send the computed diagnostics to VSCode.
      connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
    })
})

connection.onHover((params: HoverParams): Hover | undefined => {
  const effects = effectsByDocument.get(params.textDocument.uri)
  const types = typesByDocument.get(params.textDocument.uri)

  if (effects === undefined || types === undefined) {
    console.log('effects or types not found')
    return
  }

  const document = documentsByUri.get(params.textDocument.uri)!
  const type = findResult(types, params.position, document)
  const effect = findResult(effects, params.position, document)

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

function findResult(results: Map<Loc, string>, position: Position, document: TextDocument): string {
  const resultsOnPosition: [string, string, Loc][] = []

  results.forEach((result, loc) => {
    if (position.line >= loc.start.line && (!loc.end || position.line <= loc.end.line) &&
      position.character >= loc.start.col && (!loc.end || position.character <= loc.end.col)) {
      // Position is part of effect's expression range
      const text = document.getText({
        start: { line: loc.start.line, character: loc.start.col },
        end: loc.end
          ? { line: loc.end.line, character: loc.end.col + 1 }
          : { line: loc.start.line, character: loc.start.col },
      })

      resultsOnPosition.push([text, result, loc])
    }
  })

  // Sort effects by range size. We want to show the most specific effect for the position.
  const sortedResults = resultsOnPosition.sort(([_t1, _e1, a], [_t2, _e2, b]) => {
    if (!a.end) {
      return -1
    } else if (!b.end) {
      return 1
    } else if (a.end.index - a.start.index > b.end.index - b.start.index) {
      return 1
    } else {
      return -1
    }
  }).map(([_e, r, _]) => r)

  return sortedResults[0]
}

function assembleDiagnostic(explanation: string, loc: Loc): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: {
      start: { line: loc.start.line, character: loc.start.col },
      end: {
        line: loc.end ? loc.end.line : loc.start.line,
        character: loc.end ? loc.end.col + 1 : loc.start.col,
      },
    },
    message: explanation,
    source: 'parser',
  }
}

async function validateTextDocument(textDocument: TextDocument): Promise<ParserPhase2> {
  // The validator creates diagnostics for all uppercase words length 2 and more
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

const effectsByDocument: Map<DocumentUri, Map<Loc, string>> = new Map<DocumentUri, Map<Loc, string>>()
const originalEffectsByDocument: Map<DocumentUri, Map<bigint, Effect>> = new Map<DocumentUri, Map<bigint, Effect>>()
const typesByDocument: Map<DocumentUri, Map<Loc, string>> = new Map<DocumentUri, Map<Loc, string>>()
const documentsByUri: Map<DocumentUri, TextDocument> = new Map<DocumentUri, TextDocument>()

const docsByDocument: Map<DocumentUri, Map<string, DocumentationEntry>> =
  new Map<DocumentUri, Map<string, DocumentationEntry>>()

function checkTypesAndEffects(
  textDocument: TextDocument, quintModule: QuintModule, sourceMap: Map<bigint, Loc>, table: LookupTableByModule
): Promise<boolean> {
  const testDiags = checkTypes(textDocument, quintModule, sourceMap, table)
  const effectDiags = checkEffects(textDocument, quintModule, sourceMap, table)
  const modeDiags = checkDefinitionModes(textDocument, quintModule, sourceMap)

  const diags = testDiags.concat(effectDiags).concat(modeDiags)
  if (diags.length > 0) {
    return new Promise((_resolve, reject) => reject(diags))
  } else {
    return new Promise((resolve, _reject) => resolve(true))
  }
}

function checkEffects(
  textDocument: TextDocument, quintModule: QuintModule, sourceMap: Map<bigint, Loc>, table: LookupTableByModule
): Diagnostic[] {
  const [errors, inferredEffects] = inferEffects(table, quintModule)
  const diagnostics: Diagnostic[] = []
  const effects: Map<Loc, string> = new Map<Loc, string>()

  errors.forEach((error, id) => {
    const loc = sourceMap.get(id)
    if (!loc) {
      console.log(`loc for ${id} not found in source map`)
    } else {
      const diag = assembleDiagnostic(errorTreeToString(error), loc)
      diagnostics.push(diag)
    }
  })

  inferredEffects.forEach((effect, id) => effects.set(sourceMap.get(id)!, effectToString(effect)))
  effectsByDocument.set(textDocument.uri, effects)
  originalEffectsByDocument.set(textDocument.uri, inferredEffects)
  documentsByUri.set(textDocument.uri, textDocument)

  return diagnostics
}

function checkTypes(
  textDocument: TextDocument, quintModule: QuintModule, sourceMap: Map<bigint, Loc>, table: LookupTableByModule
): Diagnostic[] {
  const [errors, inferredTypes] = inferTypes(table, quintModule)
  const diagnostics: Diagnostic[] = []
  const types: Map<Loc, string> = new Map<Loc, string>()
  errors.forEach((error, id) => {
    const loc = sourceMap.get(id)!
    if (!loc) {
      console.log(`loc for ${id} not found in source map`)
    } else {
      const diag = assembleDiagnostic(errorTreeToString(error), loc)
      diagnostics.push(diag)
    }
  })
  inferredTypes.forEach((type, id) => types.set(sourceMap.get(id)!, typeSchemeToString(type)))
  typesByDocument.set(textDocument.uri, types)
  documentsByUri.set(textDocument.uri, textDocument)

  return diagnostics
}

function checkDefinitionModes(
  textDocument: TextDocument, quintModule: QuintModule, sourceMap: Map<bigint, Loc>
): Diagnostic[] {
  const result = checkModes(quintModule, originalEffectsByDocument.get(textDocument.uri)!)
  const diagnostics: Diagnostic[] = []
  result.mapLeft(e => {
    console.log(`${e.size} Mode errors found, sending diagnostics`)
    e.forEach((error, id) => {
      const loc = sourceMap.get(id)
      if (!loc) {
        console.log(`loc for ${id} not found in source map`)
      } else {
        const diag = assembleDiagnostic(errorTreeToString(error), loc)
        diagnostics.push(diag)
      }
    })
  })

  return diagnostics
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  connection.console.log('We received a file change event')
})

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
      {
        label: 'TypeScript',
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: 'JavaScript',
        kind: CompletionItemKind.Text,
        data: 2,
      },
    ]
  }
)

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
      item.detail = 'TypeScript details'
      item.documentation = 'TypeScript documentation'
    } else if (item.data === 2) {
      item.detail = 'JavaScript details'
      item.documentation = 'JavaScript documentation'
    }
    return item
  }
)
const ds = builtInDocs()
const loadedBuiltInDocs = ds.isRight() ? ds.value : undefined

connection.onSignatureHelp((params: SignatureHelpParams): HandlerResult<SignatureHelp, void> => {
  const document = documents.get(params.textDocument.uri)!
  const lineUpToPosition = document.getText({
    start: { line: params.position.line, character: 0 },
    end: params.position,
  })
  const matchingNames = lineUpToPosition.match(/(\w+)\s*\(\s*$/)
  if (matchingNames === null) {
    return { signatures: [], activeSignature: 0, activeParameter: 0 }
  }

  const name = matchingNames[1]
  const signature = docsByDocument.get(params.textDocument.uri)!.get(name)! ?? loadedBuiltInDocs?.get(name)!
  const signatureWithMarkupKind = signature?.documentation ? { ...signature, documentation: { kind: 'markdown', value: signature.documentation } as MarkupContent} : signature

  return {
    signatures: [signatureWithMarkupKind],
    activeSignature: 0,
    activeParameter: 0,
  }
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
