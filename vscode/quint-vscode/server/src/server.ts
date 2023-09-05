#!/usr/bin/env node

/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Connection,
  DefinitionLink,
  DefinitionParams,
  Diagnostic,
  DocumentSymbol,
  DocumentSymbolParams,
  HandlerResult,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  MarkupContent,
  ProposedFeatures,
  SignatureHelp,
  SignatureHelpParams,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from 'vscode-languageserver/node'

import { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument'

import {
  AnalysisOutput,
  DocumentationEntry,
  ParserPhase3,
  QuintErrorData,
  analyzeModules,
  builtinDocs,
  newIdGenerator,
  produceDocsById,
} from '@informalsystems/quint'
import { diagnosticsFromErrors, locToRange } from './reporting'
import { URI } from 'vscode-uri'
import { hover } from './hover'
import { findDefinition } from './definitions'
import { parseDocument } from './parsing'
import { getDocumentSymbols } from './documentSymbols'

export class QuintLanguageServer {
  // Create one generator of unique identifiers
  private idGenerator = newIdGenerator()

  // Store auxiliary information by document
  private parsedDataByDocument: Map<DocumentUri, ParserPhase3> = new Map()
  private analysisOutputByDocument: Map<DocumentUri, AnalysisOutput> = new Map()

  // Documentation entries by id, by document
  private docsByDocument: Map<DocumentUri, Map<bigint, DocumentationEntry>> = new Map()

  // A timeout to store scheduled analysis
  private analysisTimeout: NodeJS.Timeout = setTimeout(() => {}, 0)

  constructor(private readonly connection: Connection, private readonly documents: TextDocuments<TextDocument>) {
    const loadedBuiltInDocs = builtinDocs(this.idGenerator).unwrap()

    connection.onInitialize((_params: InitializeParams) => {
      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Full,
          hoverProvider: true,
          signatureHelpProvider: {
            triggerCharacters: ['('],
          },
          definitionProvider: true,
          codeActionProvider: true,
          documentSymbolProvider: true,
        },
      }
      return result
    })

    // Only keep information for open documents
    documents.onDidClose(e => this.deleteData(e.document.uri))

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    documents.onDidChangeContent(async change => {
      parseDocument(this.idGenerator, change.document)
        .then(result => {
          this.parsedDataByDocument.set(change.document.uri, result)
          this.scheduleAnalysis(change.document)
        })
        .catch(diagnostics => {
          this.connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
          this.scheduleAnalysis(change.document, diagnostics)
        })
    })

    connection.onHover((params: HoverParams): Hover | undefined => {
      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      if (!parsedData) {
        return
      }

      const analysisOutput = this.analysisOutputByDocument.get(params.textDocument.uri)
      const docs = this.docsByDocument.get(params.textDocument.uri)
      const source = URI.parse(params.textDocument.uri).path
      const document = documents.get(params.textDocument.uri)!

      return hover(parsedData, analysisOutput, docs, source, params.position, document, loadedBuiltInDocs)
    })

    connection.onSignatureHelp((params: SignatureHelpParams): HandlerResult<SignatureHelp, void> => {
      const emptySignatures = { signatures: [], activeSignature: 0, activeParameter: 0 }

      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      if (!parsedData) {
        return emptySignatures
      }

      const link = findDefinition(parsedData, params.textDocument.uri, params.position)
      if (!link) {
        return emptySignatures
      }

      const signature = link.definitionId
        ? this.docsByDocument.get(params.textDocument.uri)?.get(link.definitionId)
        : loadedBuiltInDocs?.get(link.name)

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

    connection.onDefinition((params: DefinitionParams): HandlerResult<DefinitionLink[], void> => {
      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
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
      return [
        {
          // The range for the name being hover over
          originSelectionRange: locToRange(parsedData.sourceMap.get(nameId)!),
          targetUri: uri,
          // The range for the entire definition (including the qualifier and body)
          targetRange: range,
          // The range for the definition's name
          targetSelectionRange: { ...range, start: { ...range.start, character: range.start.character + start } },
        },
      ]
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
                  [params.textDocument.uri]: [
                    {
                      range: editRange,
                      newText: fix.replacement,
                    },
                  ],
                },
              },
            }

            actions.push(action)
          }
        }

        return actions
      }, [] as CodeAction[])
    })

    connection.onDocumentSymbol((params: DocumentSymbolParams): HandlerResult<DocumentSymbol[], void> => {
      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      if (!parsedData) {
        return []
      }

      // filter for modules defined in the requested textDocument
      const localModules = parsedData.modules.filter(module => {
        const loc = parsedData.sourceMap.get(module.id)
        if (!loc) {
          return false
        }
        const moduleUri = URI.parse(loc.source).toString()
        return moduleUri == params.textDocument.uri
      })

      return getDocumentSymbols(localModules, parsedData.sourceMap)
    })

    // Make the text document manager listen on the connection
    // for open, change and close text document events
    documents.listen(connection)

    // Listen on the connection
    connection.listen()
  }

  private deleteData(uri: string) {
    this.parsedDataByDocument.delete(uri)
    this.docsByDocument.delete(uri)
    this.analysisOutputByDocument.delete(uri)
  }

  private scheduleAnalysis(document: TextDocument, previousDiagnostics: Diagnostic[] = []) {
    clearTimeout(this.analysisTimeout)
    const timeoutMillis = 1000
    this.connection.console.info(`Scheduling analysis in ${timeoutMillis} ms`)
    this.analysisTimeout = setTimeout(() => {
      this.analyze(document, previousDiagnostics).catch(err =>
        this.connection.console.error(`Failed to analyze: ${err.message}`)
      )
    }, timeoutMillis)
  }

  private async analyze(document: TextDocument, previousDiagnostics: Diagnostic[] = []) {
    const parsedData = this.parsedDataByDocument.get(document.uri)
    if (!parsedData) {
      return
    }

    const { modules, sourceMap, table } = parsedData

    this.docsByDocument.set(document.uri, new Map(modules.flatMap(m => [...produceDocsById(m).entries()])))

    const [errors, analysisOutput] = analyzeModules(table, modules)

    this.analysisOutputByDocument.set(document.uri, analysisOutput)

    const diagnostics = diagnosticsFromErrors(errors, sourceMap)
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics: previousDiagnostics.concat(diagnostics) })
  }
}

new QuintLanguageServer(createConnection(ProposedFeatures.all), new TextDocuments(TextDocument))
