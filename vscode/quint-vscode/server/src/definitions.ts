import { Loc, ParserPhase3 } from '@informalsystems/quint'
import { findName } from './reporting'
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
    return { nameId: id, name }
  }

  return {
    nameId: id,
    name,
    definitionId: def.id,
  }
}
