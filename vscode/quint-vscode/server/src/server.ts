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
  ProposedFeatures,
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
import { logger, overrideConsole } from './logger';

overrideConsole();

import {
  AnalysisOutput,
  DocumentationEntry,
  ParserPhase4,
  QuintErrorData,
  analyzeModules,
  builtinDocs,
  findDefinitionWithId,
  newIdGenerator,
  produceDocsById,
} from '@informalsystems/quint'

import { completeIdentifier } from './complete'
import { findDefinition } from './definitions'
import { getDocumentSymbols } from './documentSymbols'
import { hover } from './hover'
import { parseDocument } from './parsing'
import { getDeclRegExp } from './rename'
import { diagnosticsFromErrors, findBestMatchingResult, locToRange } from './reporting'
import { findParameterWithId } from '@informalsystems/quint/dist/src/ir/IRFinder'

export class QuintLanguageServer {
  // Create one generator of unique identifiers
  private idGenerator = newIdGenerator()

  // Store auxiliary information by document
  private parsedDataByDocument: Map<DocumentUri, ParserPhase4> = new Map()
  private analysisOutputByDocument: Map<DocumentUri, AnalysisOutput> = new Map()

  // Documentation entries by id, by document
  private docsByDocument: Map<DocumentUri, Map<bigint, DocumentationEntry>> = new Map()

  // A timeout to store scheduled analysis
  private analysisTimeout: NodeJS.Timeout = setTimeout(() => {}, 0)

  constructor(private readonly connection: Connection, private readonly documents: TextDocuments<TextDocument>) {
    const loadedBuiltInDocs = builtinDocs(this.idGenerator)

    connection.onInitialize((_params: InitializeParams) => {
      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Full,
          definitionProvider: true,
          documentSymbolProvider: true,
          codeActionProvider: true,
          completionProvider: {
            triggerCharacters: ['.'],
          },
          hoverProvider: true,
          renameProvider: true,
          signatureHelpProvider: {
            triggerCharacters: ['('],
          },
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

          const diagnosticsByFile = diagnosticsFromErrors(result.errors, result.sourceMap)

          const sourceFile = URI.parse(change.document.uri).path
          const diagnostics = diagnosticsByFile.get(sourceFile) ?? []
          this.connection.sendDiagnostics({ uri: change.document.uri, diagnostics })

          if (diagnosticsByFile.size === 0) {
            // For now, only run analysis if there are no parsing errors
            this.scheduleAnalysis(change.document)
          }
        })
        .catch(err => {
          this.connection.console.error(`Error during parsing: ${err}`)
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

    connection.onCompletion((params: CompletionParams): CompletionItem[] => {
      logger.debug(`Completion requested at position ${JSON.stringify(params.position)} in ${params.textDocument.uri}`);

      if (params.context?.triggerKind !== CompletionTriggerKind.Invoked) {
        logger.debug(`Completion triggered by non-invoked action, ignoring.`);
        return [];
      }

      const parsedData = this.parsedDataByDocument.get(params.textDocument.uri);
      const document = this.documents.get(params.textDocument.uri);

      if (!parsedData || !document) {
        logger.debug(`No parsed data or document found for completion.`);
        return [];
      }

      const triggeringLine = document.getText({
        start: {...params.position, character: 0},
        end: params.position,
      });

      const match = triggeringLine?.trim().match(/([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+)\.$/);
      if (!match) {
        logger.debug(`No matching identifier found in line: ${triggeringLine}`);
        return [];
      }

      const triggeringIdentifier = match[1];
      const sourceFile = URI.parse(params.textDocument.uri).path;

      this.triggerAnalysis(document);

      const analysisOutput = this.analysisOutputByDocument.get(params.textDocument.uri);
      if (!analysisOutput) {
        logger.debug(`No analysis output available for completion.`);
        return [];
      }

      let completionItems = completeIdentifier(
          triggeringIdentifier,
          parsedData,
          analysisOutput,
          sourceFile,
          params.position,
          loadedBuiltInDocs
      );

      return completionItems;
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

  private triggerAnalysis(document: TextDocument) {
    clearTimeout(this.analysisTimeout)
    this.connection.console.info(`Triggering analysis`)
    this.analyze(document)
  }

  private scheduleAnalysis(document: TextDocument) {
    clearTimeout(this.analysisTimeout)
    const timeoutMillis = 1000
    this.connection.console.info(`Scheduling analysis in ${timeoutMillis} ms`)
    this.analysisTimeout = setTimeout(() => {
      this.analyze(document)
    }, timeoutMillis)
  }

  private analyze(document: TextDocument) {
    try {
      logger.debug(`Starting analysis for document: ${document.uri}`);
      const parsedData = this.parsedDataByDocument.get(document.uri)
      if (!parsedData) {
        logger.debug(`No parsed data found for document: ${document.uri}`);
        return
      }

      const { modules, sourceMap, table } = parsedData

      this.docsByDocument.set(document.uri, new Map(modules.flatMap(m => [...produceDocsById(m).entries()])))

      const [errors, analysisOutput] = analyzeModules(table, modules)

      this.analysisOutputByDocument.set(document.uri, analysisOutput)

      const sourceFile = URI.parse(document.uri).path
      const diagnosticsByFile = diagnosticsFromErrors(errors, sourceMap)
      const diagnostics = diagnosticsByFile.get(sourceFile) ?? []
      this.connection.sendDiagnostics({ uri: document.uri, diagnostics })
      logger.debug(`Analysis completed for document: ${document.uri}, errors found: ${diagnostics.length}`);
    } catch (e) {
      this.connection.console.error(`Error during analysis: ${e}`)
    }
  }
}

new QuintLanguageServer(createConnection(ProposedFeatures.all), new TextDocuments(TextDocument))
logger.info("🚀 Quint Language Server Started!");