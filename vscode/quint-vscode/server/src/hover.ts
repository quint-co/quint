import { AnalyzisOutput, DocumentationEntry, ParserPhase3, effectSchemeToString, typeSchemeToString } from "@informalsystems/quint"
import { Hover, MarkupKind, Position } from "vscode-languageserver/node"
import { findBestMatchingResult, locToRange } from "./reporting"
import { findDefinition } from "./definitions"
import { TextDocument } from "vscode-languageserver-textdocument"

export function hover(
  parsedData: ParserPhase3,
  analysisOutput: AnalyzisOutput | undefined,
  docs: Map<bigint, DocumentationEntry> | undefined,
  sourceFile: string,
  position: Position,
  document: TextDocument,
  builtInDocs: Map<string, DocumentationEntry>
): Hover | undefined {
  const hoverText = [
    inferredDataHover(parsedData, analysisOutput, sourceFile, position, document),
    documentationHover(parsedData, docs, sourceFile, position, builtInDocs),
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
  const effectResult = findBestMatchingResult(
    parsedData.sourceMap, [...analysisOutput.effects.entries()], position, sourceFile
  )

  // There are cases where we have types but not effects, but not the other way around
  // Therefore, we only check for typeResult here and handle missing effects later
  // As if there are no types, there are no effects either
  if (!typeResult) {
    return []
  }

  const [loc, type] = typeResult
  // Find the text for which we got the type and effect results and show it in
  // the hover, since the user might not understand which part of an expression
  // the hover is capturing
  const text = document.getText(locToRange(loc))
  let hoverText = ["```qnt", text, "```", '']

  hoverText.push(`**type**: \`${typeSchemeToString(type)}\`\n`)

  if (effectResult) {
    const [, effect] = effectResult
    hoverText.push(`**effect**: \`${effectSchemeToString(effect)}\`\n`)
  }

  return hoverText
}

function documentationHover(
  parsedData: ParserPhase3,
  docs: Map<bigint, DocumentationEntry> | undefined,
  sourceFile: string,
  position: Position,
  builtInDocs: Map<string, DocumentationEntry>
): string[] {
  const link = findDefinition(parsedData, sourceFile, position)

  if (!link) {
    return []
  }

  const signature = link.definitionId
    ? docs?.get(link.definitionId)
    : builtInDocs?.get(link.name)

  if (!signature) {
    return []
  }

  let hoverText = ["```qnt", signature.label, "```", '']
  if (signature.documentation) {
    hoverText.push(signature.documentation)
  }
  return hoverText
}
