import { Loc, ParserPhase3 } from '@informalsystems/quint'
import { Location, Position } from 'vscode-languageserver/node'
import { URI } from 'vscode-uri'
import { findDefinition } from './definitions'
import { findBestMatchingResult, isPositionInLoc, locToRange } from './reporting'

export function findReferencesAtPosition(
  parsedData: ParserPhase3,
  uri: string,
  position: Position,
  includeDeclaration: boolean
): Location[] {
  const { table, sourceMap } = parsedData
  const sourceFile = URI.parse(uri).path
  const allIds: [bigint, null][] = [...sourceMap.keys()].map(id => [id, null])
  const declarationId = resolveDeclarationIdAroundPosition(parsedData, uri, position, sourceMap, allIds, sourceFile)
  if (!declarationId) {
    return []
  }

  const referencedIds = [...table.entries()]
    .filter(([_, value]) => value.id === declarationId)
    .map(([id]) => id)

  if (includeDeclaration) {
    referencedIds.push(declarationId)
  }

  const dedupedIds = [...new Set(referencedIds.map(id => id.toString()))].map(id => BigInt(id))

  return dedupedIds.reduce((references, id) => {
    const loc = sourceMap.get(id)
    if (!loc) {
      return references
    }

    references.push({
      uri: asUri(loc.source),
      range: locToRange(loc),
    })
    return references
  }, [] as Location[])
}

function resolveDeclarationIdAroundPosition(
  parsedData: ParserPhase3,
  uri: string,
  position: Position,
  sourceMap: Map<bigint, Loc>,
  allIds: [bigint, null][],
  sourceFile: string
): bigint | undefined {
  const lookupPositions = [position]
  // VS Code can invoke references with the cursor at the end of a selected token.
  if (position.character > 0) {
    lookupPositions.push({ ...position, character: position.character - 1 })
  }

  for (const lookupPosition of lookupPositions) {
    const match = findBestMatchingResult(sourceMap, allIds, lookupPosition, sourceFile)
    if (!match) {
      continue
    }
    const declarationId = resolveDeclarationId(parsedData, uri, lookupPosition, match.id)
    if (declarationId) {
      return declarationId
    }
  }

  return undefined
}

function asUri(source: string): string {
  const parsed = URI.parse(source)
  return parsed.scheme ? parsed.toString() : URI.file(source).toString()
}

function resolveDeclarationId(parsedData: ParserPhase3, uri: string, position: Position, fallbackId: bigint): bigint | undefined {
  const { table, sourceMap } = parsedData
  const link = findDefinition(parsedData, uri, position)
  if (link?.definitionId) {
    return link.definitionId
  }

  // Some operator applications are not directly indexed by id in `table`.
  // In that case, resolve by name and use the declaration target id.
  if (link?.name) {
    const byName = [...table.entries()].filter(([_, binding]) => binding.name === link.name)
    if (byName.length > 0) {
      const source = URI.parse(uri).path
      const localRef = byName.find(([refId, _binding]) => {
        const loc = sourceMap.get(refId)
        return loc ? isPositionInLoc(loc, position, source) : false
      })
      if (localRef) {
        return localRef[1].id
      }
      const declarationEntry = byName.find(([id, binding]) => id === binding.id)
      return declarationEntry?.[1].id ?? byName[0][1].id
    }
  }

  const declarationFromRef = table.get(fallbackId)?.id
  if (declarationFromRef) {
    return declarationFromRef
  }

  // If this id is the declaration target of some references, treat it as a valid symbol declaration id.
  const isDeclarationId = [...table.values()].some(binding => binding.id === fallbackId)
  return isDeclarationId ? fallbackId : undefined
}
