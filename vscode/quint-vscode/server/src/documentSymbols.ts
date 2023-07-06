import { DocumentSymbol, SymbolKind } from 'vscode-languageserver/node'

import { Loc, QuintConst, QuintModule, QuintOpDef, QuintVar } from '@informalsystems/quint'
import { locToRange } from './reporting'

export function getDocumentSymbols(modules: QuintModule[], sourceMap: Map<bigint, Loc>): DocumentSymbol[] {
  return getModules(modules, sourceMap)
}

/**
 * Get VSCode `SymbolKind` of a Quint def
 */
function symbolKind(def: QuintOpDef | QuintConst | QuintVar): SymbolKind {
  switch (def.kind) {
    case 'def':
      return SymbolKind.Function
    case 'const':
      return SymbolKind.Constant
    case 'var':
      return SymbolKind.Variable
  }
}

/**
 * Return the def symbols defined in a module
 */
function getDefs(module: QuintModule, sourceMap: Map<bigint, Loc>): DocumentSymbol[] {
  return module.defs.reduce((symbols, def) => {
    // skip certain kinds of defs
    if (
      def.kind === 'assume' ||
      def.kind === 'instance' ||
      def.kind === 'import' ||
      def.kind === 'export' ||
      def.kind === 'typedef'
    ) {
      return symbols
    }
    const loc = sourceMap.get(def.id)
    if (!loc) {
      return symbols
    }
    const range = locToRange(loc)
    symbols.push({
      name: def.name,
      kind: symbolKind(def),
      range: range,
      selectionRange: range,
    })
    return symbols
  }, [] as DocumentSymbol[])
}

/**
 * Return all module symbols
 */
function getModules(modules: QuintModule[], sourceMap: Map<bigint, Loc>): DocumentSymbol[] {
  return modules.reduce((symbols, module) => {
    const loc = sourceMap.get(module.id)
    if (!loc) {
      return symbols
    }
    const range = locToRange(loc)
    symbols.push({
      name: module.name,
      kind: SymbolKind.Module,
      range: range,
      selectionRange: range,
      children: getDefs(module, sourceMap),
    })
    return symbols
  }, [] as DocumentSymbol[])
}
