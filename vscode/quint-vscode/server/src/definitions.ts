import { Loc, ParserPhase3 } from '@informalsystems/quint'
import { findName, isPositionInLoc } from './reporting'
import { Position } from 'vscode-languageserver/node'
import { URI } from 'vscode-uri'

export interface QuintDefinitionLink {
  nameId: bigint
  name: string
  definitionId?: bigint
}

export function findDefinition(
  parsedData: ParserPhase3,
  uri: string,
  position: Position
): QuintDefinitionLink | undefined {
  const { modules, sourceMap, table } = parsedData
  const results: [Loc, bigint][] = [...sourceMap.entries()].map(([id, loc]) => [loc, id])
  const source = URI.parse(uri).path

  // Find name under position
  const [name, id] = findName(modules, results, position, source) ?? [undefined, undefined, undefined]
  if (!name) {
    return undefined
  }

  // Find definition of name
  const def = table.get(id)
  if (!def) {
    // Some positions (e.g., on app nodes) may not map directly by id.
    // Resolve by name, preferring refs that match the cursor position.
    const candidates = [...table.entries()].filter(([_, binding]) => binding.name === name)
    if (candidates.length === 0) {
      return { nameId: id, name }
    }

    const localRef = candidates.find(([refId, _]) => {
      const loc = sourceMap.get(refId)
      return loc ? isPositionInLoc(loc, position, source) : false
    })

    if (localRef) {
      return {
        nameId: id,
        name,
        definitionId: localRef[1].id,
      }
    }

    const declaration = candidates.find(([refId, binding]) => refId === binding.id)
    const byName = declaration?.[1] ?? candidates[0][1]
    return {
      nameId: id,
      name,
      definitionId: byName.id,
    }
  }

  return {
    nameId: id,
    name,
    definitionId: def.id,
  }
}
