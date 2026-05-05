#!/usr/bin/env node

/* ----------------------------------------------------------------------------------
 * Copyright 2021 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */
import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  CompletionItem,
  CompletionParams,
  CompletionTriggerKind,
  Connection,
  DefinitionLink,
  DefinitionParams,
  DocumentSymbol,
  DocumentSymbolParams,
  HandlerResult,
  Hover,
  HoverParams,
  InitializeParams,
  InitializeResult,
  MarkupContent,
  MarkupKind,
  ProposedFeatures,
  ReferenceParams,
  RenameParams,
  SignatureHelp,
  SignatureHelpParams,
  TextDocumentSyncKind,
  TextDocuments,
  TextEdit,
  WorkspaceEdit,
  createConnection,
} from 'vscode-languageserver/node'
import { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument'
import { URI } from 'vscode-uri'
import { isEnabled, logger, overrideConsole } from './logger'

import {
  AnalysisOutput,
  DocumentationEntry,
  ParserPhase4,
  QuintErrorData,
  builtinDocs,
  findDefinitionWithId,
  newIdGenerator,
} from '@informalsystems/quint'

import { completeIdentifier, getFieldCompletions, getSuggestedBuiltinsForType } from './complete'
import { findDefinition } from './definitions'
import { getDocumentSymbols } from './documentSymbols'
import { hover } from './hover'
import { findReferencesAtPosition } from './references'
import { getDeclRegExp } from './rename'
import { diagnosticsFromErrors, findBestMatchingResult, locToRange, stringToRegex } from './reporting'
import { findParameterWithId } from '@informalsystems/quint/dist/src/ir/IRFinder'
import { AnalysisResult, CompilationPipeline, CompilationResult } from './workerPipeline'

// Redirect logs to file logger to prevent corrupting the JSON-RPC stream.
overrideConsole()

export class QuintLanguageServer {
  // Store auxiliary information by document
  private parsedDataByDocument: Map<DocumentUri, ParserPhase4> = new Map()
  private analysisOutputByDocument: Map<DocumentUri, AnalysisOutput> = new Map()

  // Documentation entries by id, by document
  private docsByDocument: Map<DocumentUri, Map<bigint, DocumentationEntry>> = new Map()

  // Worker pipeline for compilation and analysis
  private pipeline: CompilationPipeline

  constructor(private readonly connection: Connection, private readonly documents: TextDocuments<TextDocument>) {
    const idGenerator = newIdGenerator()
    const loadedBuiltInDocs = builtinDocs(idGenerator)

    this.pipeline = new CompilationPipeline(idGenerator.nextId() - 1n, {
      onParsingResult: result => this.handleParsingResult(result),
      onAnalysisResult: result => this.handleAnalysisResult(result),
      onError: message => this.connection.console.error(message),
    })

    connection.onInitialize((_params: InitializeParams) => {
      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          definitionProvider: true,
          documentSymbolProvider: true,
          codeActionProvider: true,
          completionProvider: {
            triggerCharacters: ['.'],
          },
          hoverProvider: true,
          renameProvider: true,
          referencesProvider: true,
          signatureHelpProvider: {
            triggerCharacters: ['('],
          },
        },
      }
      return result
    })

    connection.onShutdown(() => this.pipeline.terminate())

    // Only keep information for open documents
    documents.onDidClose(e => this.deleteData(e.document.uri))

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    documents.onDidChangeContent(change => {
      this.pipeline.scheduleCompilation(change.document.uri, change.document.getText())
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
        ? {
            name: signature.name,
            label: signature.signature,
            documentation: { kind: 'markdown', value: signature.documentation } as MarkupContent,
          }
        : { name: signature.name, label: signature.signature }

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
      const parsedSource = URI.parse(loc.source)
      const uri = parsedSource.scheme ? parsedSource.toString() : URI.file(loc.source).toString()

      // Definitions start with a qualifier. This finds where the definition name
      // actually starts and corrects the range. If the file is not opened in the
      // editor yet, we just use the original range. In the future, we should find
      // another way of positioning the cursor in the editor, or read the file from
      // disk.
      const text = documents.get(uri)?.getText(range) ?? name
      const unqualifiedName = name.split('::').pop()!
      const start = text.search(new RegExp(unqualifiedName))
      const startOffset = start >= 0 ? start : 0
      return [
        {
          // The range for the name being hover over
          originSelectionRange: locToRange(parsedData.sourceMap.get(nameId)!),
          targetUri: uri,
          // The range for the entire definition (including the qualifier and body)
          targetRange: range,
          // The range for the definition's name
          targetSelectionRange: { ...range, start: { ...range.start, character: range.start.character + startOffset } },
        },
      ]
    })

    connection.onCodeAction((params: CodeActionParams): HandlerResult<CodeAction[], void> => {
      return params.context.diagnostics.reduce((actions, diagnostic) => {
        const data = diagnostic.data as QuintErrorData
        if (!data) {
          return actions
        }

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

            const matchResult = line.match(stringToRegex(fix.original))
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

    connection.onCompletion((params: CompletionParams): CompletionItem[] => {
      if (isEnabled('DEBUG')) {
        logger.debug(
          'Completion requested at position %s in %s',
          JSON.stringify(params.position),
          params.textDocument.uri
        )
      }

      if (params.context?.triggerKind !== CompletionTriggerKind.Invoked) {
        logger.debug('Completion triggered by non-invoked action, ignoring.')
        return []
      }

      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      const document = this.documents.get(params.textDocument.uri)

      if (!parsedData || !document) {
        logger.debug('No parsed data or document found for completion.')
        return []
      }

      const triggeringLine = document.getText({
        start: { ...params.position, character: 0 },
        end: params.position,
      })

      const dotAccessMatch = triggeringLine?.trim().match(/([a-zA-Z_][a-zA-Z0-9_]*)\.$/)
      const sourceFile = URI.parse(params.textDocument.uri).path

      // Use available (possibly stale) analysis data
      const analysisOutput = this.analysisOutputByDocument.get(params.textDocument.uri)
      if (!analysisOutput) {
        logger.debug('No analysis output available for completion.')
        return []
      }

      if (dotAccessMatch) {
        const baseIdentifier = dotAccessMatch[1]
        logger.debug('Detected dot-access on identifier: %s', baseIdentifier)

        const ref = [...parsedData.table.entries()].find(([_, v]) => v.name === baseIdentifier)
        if (!ref) {
          logger.debug('Could not resolve identifier: %s', baseIdentifier)
          return []
        }

        const [declId, _binding] = ref
        const type = analysisOutput.types.get(declId)?.type
        if (!type) {
          logger.debug('No type found for identifier: %s', baseIdentifier)
          return []
        }

        if (isEnabled('DEBUG')) {
          logger.debug(
            "Resolved type for '%s': %s",
            baseIdentifier,
            JSON.stringify(type, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
          )
        }

        const builtinCompletions: CompletionItem[] = getSuggestedBuiltinsForType(type).map(op => {
          const docs = loadedBuiltInDocs.get(op.name)
          return {
            label: op.name,
            detail: docs?.signature,
            documentation: docs?.documentation ? { kind: MarkupKind.Markdown, value: docs.documentation } : undefined,
          }
        })

        const fieldCompletions = getFieldCompletions(type)

        return builtinCompletions.concat(fieldCompletions)
      }

      // Fallback: regular identifier completion
      const identifierMatch = triggeringLine?.trim().match(/([a-zA-Z_][a-zA-Z0-9_]*)$/)
      if (!identifierMatch) {
        logger.debug('No matching identifier found in line: %s', triggeringLine)
        return []
      }

      const triggeringIdentifier = identifierMatch[1]

      return completeIdentifier(
        triggeringIdentifier,
        parsedData,
        analysisOutput,
        sourceFile,
        params.position,
        loadedBuiltInDocs
      )
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

    connection.onRenameRequest((params: RenameParams): WorkspaceEdit | null => {
      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      if (!parsedData) {
        return null
      }

      // Find the name under the cursor.
      const { modules, sourceMap, table } = parsedData
      const results: [bigint, null][] = [...sourceMap.keys()].map(id => [id, null])
      const sourceFile = URI.parse(params.textDocument.uri).path
      const result = findBestMatchingResult(sourceMap, results, params.position, sourceFile)
      if (!result) {
        return null
      }

      // Look up where the name was declared.
      const declToRename = table.get(result.id)?.id ?? result.id

      // Find all references to `declToRename`.
      const references = [...table.entries()].reduce((references, [key, value]) => {
        if (value.id == declToRename) {
          references.push(key)
        }
        return references
      }, [] as bigint[])

      // Construct a `TextEdit` for each reference.
      const changes = references.reduce((changes, ref) => {
        const loc = sourceMap.get(ref)
        if (loc) {
          changes.push({ range: locToRange(loc), newText: params.newName })
        }
        return changes
      }, [] as TextEdit[])

      // Construct a `TextEdit` for the decl itself.
      const param = findParameterWithId(modules, declToRename)
      if (param) {
        // The simple case: the name is declared as a parameter.
        // In this case, the source map gives us exactly the range of the symbol
        // to replace.
        const declLoc = sourceMap.get(param.id)
        if (declLoc) {
          changes.push({ range: locToRange(declLoc), newText: params.newName })
        }
      } else {
        const decl = findDefinitionWithId(modules, declToRename)
        if (!decl) {
          return null
        }
        // The tricky case: the name is declared as a definition.
        // In this case, the location pointed by the source map includes its
        // entire body and quantifiers, while we're only looking to replace
        // its name. Thus, we try to parse the declaration using a regular
        // expression, and extract offsets to account for offsets caused by
        // preceeding qualifiers.

        const declLoc = sourceMap.get(decl.id)
        if (!declLoc) {
          return null
        }
        const triggeringLine = documents.get(params.textDocument.uri)?.getText(locToRange(declLoc))
        if (!triggeringLine) {
          return null
        }

        const re = getDeclRegExp(decl)
        const match = re.exec(triggeringLine)
        if (!match) {
          return null
        }
        const modificationLoc = {
          ...declLoc,
          start: { ...declLoc.start, col: declLoc.start.col + match[0].length - match[2].length },
          end: { ...declLoc.start, col: declLoc.start.col + match[0].length - 1 },
        }
        changes.push({ range: locToRange(modificationLoc), newText: params.newName })
      }

      return { changes: { [params.textDocument.uri]: changes } }
    })

    connection.onReferences((params: ReferenceParams) => {
      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri)
      if (!parsedData) {
        return []
      }

      return findReferencesAtPosition(
        parsedData,
        params.textDocument.uri,
        params.position,
        params.context.includeDeclaration
      )
    })

    // Make the text document manager listen on the connection
    // for open, change and close text document events
    documents.listen(connection)

    // Listen on the connection
    connection.listen()
  }

  private deleteData(uri: string): void {
    this.parsedDataByDocument.delete(uri)
    this.docsByDocument.delete(uri)
    this.analysisOutputByDocument.delete(uri)
    this.pipeline.deleteDocument(uri)
  }

  private handleParsingResult(result: CompilationResult): void {
    const { uri, parsedData, errors } = result
    this.parsedDataByDocument.set(uri, parsedData)

    const diagnosticsByFile = diagnosticsFromErrors(errors, parsedData.sourceMap)
    const sourceFile = URI.parse(uri).path
    const diagnostics = diagnosticsByFile.get(sourceFile) ?? []
    this.connection.sendDiagnostics({ uri, diagnostics })
  }

  private handleAnalysisResult(result: AnalysisResult): void {
    const { uri, analysisOutput, docs, errors } = result
    this.analysisOutputByDocument.set(uri, analysisOutput)
    this.docsByDocument.set(uri, docs)

    const parsedData = this.parsedDataByDocument.get(uri)!
    const diagnosticsByFile = diagnosticsFromErrors(errors, parsedData.sourceMap)
    const sourceFile = URI.parse(uri).path
    const diagnostics = diagnosticsByFile.get(sourceFile) ?? []
    this.connection.sendDiagnostics({ uri, diagnostics })
    logger.debug('Analysis completed for: %s, errors found: %d', uri, diagnostics.length)
  }
}

new QuintLanguageServer(createConnection(ProposedFeatures.all), new TextDocuments(TextDocument))
logger.info('🚀 Quint Language Server Started!')
