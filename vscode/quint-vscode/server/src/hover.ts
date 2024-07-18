import {
  AnalysisOutput,
  DocumentationEntry,
  Loc,
  ParserPhase3,
  QuintDef,
  QuintEx,
  QuintModule,
  TypeScheme,
  effectSchemeToString,
  findDefinitionWithId,
  findExpressionWithId,
  format,
  prettyQuintDeclaration,
  prettyTypeScheme,
  qualifierToString,
} from '@informalsystems/quint'
import { Hover, MarkupKind, Position } from 'vscode-languageserver/node'
import { findBestMatchingResult, locToRange } from './reporting'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { QuintDefinitionLink, findDefinition } from './definitions'

// Line length for pretty printing
const lineLength = 120

export function hover(
  parsedData: ParserPhase3,
  analysisOutput: AnalysisOutput | undefined,
  docs: Map<bigint, DocumentationEntry> | undefined,
  sourceFile: string,
  position: Position,
  document: TextDocument,
  builtInDocs: Map<string, DocumentationEntry>
): Hover | undefined {
  const link = findDefinition(parsedData, sourceFile, position)

  const hoverText = [
    inferredDataHover(link, parsedData, analysisOutput, sourceFile, position, document),
    documentationHover(link, docs, builtInDocs),
  ]
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
}

function inferredDataHover(
  link: QuintDefinitionLink | undefined,
  parsedData: ParserPhase3,
  analysisOutput: AnalysisOutput | undefined,
  sourceFile: string,
  position: Position,
  document: TextDocument
): string[] {
  if (!analysisOutput) {
    return []
  }

  const typeResult = findBestMatchingResult(
    parsedData.sourceMap,
    [...analysisOutput.types.entries()],
    position,
    sourceFile
  )
  // There are cases where we have types but not effects, but not the other way around
  // Therefore, we only check for typeResult here and handle missing effects later
  // As if there are no types, there are no effects either
  if (!typeResult) {
    return []
  }

  const { id, loc, result } = typeResult

  // Find the text for which we got the type and effect results and show it in
  // the hover, since the user might not understand which part of an expression
  // the hover is capturing
  const expr = findExpressionWithId(parsedData.modules, id)
  const def = findDefinitionWithId(parsedData.modules, id)

  if (!expr && !def) {
    return []
  }

  const text = def
    ? format(lineLength, 0, prettyQuintDeclaration(def, false, result))
    : expressionToShow(expr!, parsedData.modules, link, document, loc, result)

  if (!text) {
    return []
  }

  let hoverText = ['```quint', text, '```', '']

  const effectResult = findBestMatchingResult(
    parsedData.sourceMap,
    [...analysisOutput.effects.entries()],
    position,
    sourceFile
  )

  if (effectResult) {
    hoverText.push(`**effect**: \`${effectSchemeToString(effectResult.result)}\`\n`)
  }

  return hoverText
}

function expressionToShow(
  expr: QuintEx,
  modules: QuintModule[],
  link: QuintDefinitionLink | undefined,
  document: TextDocument,
  loc: Loc,
  type: TypeScheme
): string | undefined {
  if (expr.kind !== 'name' && expr.kind !== 'lambda' && expr.kind !== 'app') {
    // Only show hover for names, lambdas and (some) apps
    return undefined
  }

  if (expr.kind === 'app') {
    // For applications, only show hovers for record field access.
    if (expr.opcode === 'field' && expr.args[1].kind === 'str') {
      const fieldName = expr.args[1].value
      const fieldType = prettyPrintTypeScheme(type)
      return `(field) ${fieldName}: ${fieldType}`
    }

    return undefined
  }

  if (expr.kind === 'name' && link?.definitionId) {
    const def = findDefinitionWithId(modules, link.definitionId)
    const qualifier = def ? defQualifier(def) : '(parameter)'
    const name = link.name
    const typeString = prettyPrintTypeScheme(type)
    return `${qualifier} ${name}: ${typeString}`
  }

  const text = document.getText(locToRange(loc))
  const typeString = prettyPrintTypeScheme(type)
  return `${text}: ${typeString}`
}

function defQualifier(def: QuintDef): string {
  switch (def.kind) {
    case 'def':
      return qualifierToString(def.qualifier)
    default:
      return def.kind
  }
}

function documentationHover(
  link: QuintDefinitionLink | undefined,
  docs: Map<bigint, DocumentationEntry> | undefined,
  builtInDocs: Map<string, DocumentationEntry>
): string[] {
  if (!link) {
    return []
  }

  const signature = link.definitionId ? docs?.get(link.definitionId) : builtInDocs?.get(link.name)

  if (!signature) {
    return []
  }

  let hoverText = ['```quint', signature.signature, '```', '']
  if (signature.documentation) {
    hoverText.push(signature.documentation)
  }
  return hoverText
}

function prettyPrintTypeScheme(type: TypeScheme): string {
  return format(lineLength, 0, prettyTypeScheme(type))
}
