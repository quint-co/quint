import { Loc } from '@informalsystems/quint'
import { Position } from 'vscode-languageserver/node'
import { isPositionInLoc } from './reporting'

interface SymbolBinding {
  id: bigint
  name?: string
}

export interface SymbolBindingMatch<T extends SymbolBinding> {
  refId: bigint
  binding: T
}

/**
 * Select the best matching symbol binding in one pass:
 * 1) local positional match
 * 2) declaration entry (refId === binding.id)
 * 3) first name match
 */
export function selectBestBindingMatch<T extends SymbolBinding>(
  table: Map<bigint, T>,
  sourceMap: Map<bigint, Loc>,
  name: string,
  sourceFile: string,
  position: Position
): SymbolBindingMatch<T> | undefined {
  let firstMatch: SymbolBindingMatch<T> | undefined
  let declarationMatch: SymbolBindingMatch<T> | undefined

  for (const [refId, binding] of table.entries()) {
    if (binding.name !== name) {
      continue
    }

    const candidate: SymbolBindingMatch<T> = { refId, binding }
    if (!firstMatch) {
      firstMatch = candidate
    }
    if (!declarationMatch && refId === binding.id) {
      declarationMatch = candidate
    }

    const loc = sourceMap.get(refId)
    if (loc && isPositionInLoc(loc, position, sourceFile)) {
      return candidate
    }
  }

  return declarationMatch ?? firstMatch
}
