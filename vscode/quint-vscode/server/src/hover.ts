import { AnalyzisOutput, DocumentationEntry, Loc, ParserPhase3, QuintDef, QuintEx, QuintModule, TypeScheme, effectSchemeToString, findDefinitionWithId, findExpressionWithId, format, prettyQuintDef, prettyTypeScheme, qualifierToString } from "@informalsystems/quint"
import { Hover, MarkupKind, Position } from "vscode-languageserver/node"
import { findBestMatchingResult, locToRange } from "./reporting"
import { TextDocument } from "vscode-languageserver-textdocument"
import { QuintDefinitionLink, findDefinition } from "./definitions"

export function hover(
  parsedData: ParserPhase3,
  analysisOutput: AnalyzisOutput | undefined,
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
  ].filter(s => s.length > 0)
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
  analysisOutput: AnalyzisOutput | undefined,
  sourceFile: string,
  position: Position,
  document: TextDocument
): string[] {
  if (!analysisOutput) {
    return []
  }

  const typeResult = findBestMatchingResult(
    parsedData.sourceMap, [...analysisOutput.types.entries()], position, sourceFile
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
    ? format(120, 0, prettyQuintDef(def, false, result))
    : expressionToShow(expr!, parsedData.modules, link, document, loc, result)

  if (!text) {
    return []
  }

  let hoverText = ["```quint", text, "```", '']

  const effectResult = findBestMatchingResult(
    parsedData.sourceMap, [...analysisOutput.effects.entries()], position, sourceFile
  )

  if (effectResult) {
    hoverText.push(`**effect**: \`${effectSchemeToString(effectResult.result)}\`\n`)
  }

  return hoverText
}

function expressionToShow(
  expr: QuintEx, modules: QuintModule[], link: QuintDefinitionLink | undefined,
  document: TextDocument, loc: Loc, type: TypeScheme
): string | undefined {
  if (expr && expr.kind !== 'name' && expr.kind !== 'lambda' && expr.kind !== 'app') {
    // Only show hover for names, lambdas and (some) apps
    return
  }

  if (expr.kind === 'app') {
    if (expr.opcode === 'field') {
      const fieldName = expr.args[1]
      if (fieldName.kind !== 'str') {
        return ''
      }

      return `(field) ${fieldName.value}: ${prettyPrintTypeScheme(type)}`
    }

    return
  }

  if(expr.kind === 'name' && link?.definitionId) {
    const def = findDefinitionWithId(modules, link.definitionId)
    const qual = def ? qualifier(def) : '(parameter)'
    return `${qual} ${link.name}: ${prettyPrintTypeScheme(type)}`
  }

  return `${document.getText(locToRange(loc))}: ${prettyPrintTypeScheme(type)}`
}

function qualifier(def: QuintDef): string {
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

  const signature = link.definitionId
    ? docs?.get(link.definitionId)
    : builtInDocs?.get(link.name)

  if (!signature) {
    return []
  }

  let hoverText = ["```quint", signature.label, "```", '']
  if (signature.documentation) {
    hoverText.push(signature.documentation)
  }
  return hoverText
}

function prettyPrintTypeScheme(type: TypeScheme): string {
  return format(120, 0, prettyTypeScheme(type))
}
