import { compact } from 'lodash'
import { MarkupContent } from 'vscode-languageclient'
import { CompletionItem, CompletionItemKind, MarkupKind, Position } from 'vscode-languageserver/node'
import {
  AnalysisOutput,
  DocumentationEntry,
  IRVisitor,
  ParserPhase3,
  QuintDeclaration,
  QuintDef,
  QuintEx,
  QuintLambda,
  QuintModule,
  QuintType,
  booleanOperators,
  findDefinitionWithId,
  findExpressionWithId,
  integerOperators,
  listOperators,
  mapOperators,
  recordOperators,
  setOperators,
  tupleOperators,
  typeToString,
  walkDeclaration,
  walkExpression,
} from '@informalsystems/quint'
import { findMatchingResults } from './reporting'

export function completeIdentifier(
  identifier: string,
  parsedData: ParserPhase3,
  analysisOutput: AnalysisOutput,
  sourceFile: string,
  position: Position,
  builtinDocs: Map<string, DocumentationEntry>
): CompletionItem[] {
  const { table } = parsedData

  // Until we have incremental parsing, try to lookup `triggeringIdentifier` by name
  const declIds = findDeclByNameAtPos(identifier, position, sourceFile, parsedData)

  // Lookup types for the found declarations
  const types = declIds.map(declId => {
    const refId = table.get(declId)?.id ?? declId
    return analysisOutput.types.get(refId)?.type
  })
  const properTypes = compact(
    types.map(type => {
      if (type?.kind === 'const') {
        // Resolve constant type
        const alias = type.id ? table.get(type.id) : undefined
        if (alias?.kind !== 'typedef' || !alias.type) {
          return undefined
        }
        return alias.type
      } else if (type?.kind === 'var') {
        // TODO(#693): Workaround for #693, filter overly general types
        return undefined
      }
      return type
    })
  )
  if (properTypes.length === 0) {
    return []
  }
  const type = properTypes[0]

  // Get completions for builtins of this type
  const builtinCompletions = builtinCompletionsWithDocs(getSuggestedBuiltinsForType(type), builtinDocs)
  // Get completions for field access
  const fieldCompletions = getFieldCompletions(type)
  // TODO: offer visible custom operators

  return builtinCompletions.concat(fieldCompletions)
}

/**
 * Find a declaration of `name` by name inside `decl`.
 */
function findDeclByNameInDecl(name: string, decl: QuintDeclaration): bigint[] {
  const visitor = new DeclOfNameFinder(name)
  walkDeclaration(visitor, decl)
  return visitor.namesFound
}

/**
 * Find a declaration of `name` by name inside `expr`.
 */
function findDeclByNameInExpr(name: string, expr: QuintEx): bigint[] {
  const visitor = new DeclOfNameFinder(name)
  walkExpression(visitor, expr)
  return visitor.namesFound
}

class DeclOfNameFinder implements IRVisitor {
  nameToFind: string
  namesFound: bigint[]

  constructor(nameToFind: string) {
    this.nameToFind = nameToFind
    this.namesFound = []
  }

  /** Definitions **/
  exitDef(def: QuintDef) {
    if (def.name == this.nameToFind) {
      this.namesFound.push(def.id)
    }
  }

  /** Expressions **/
  exitLambda(lambda: QuintLambda) {
    lambda.params.forEach(param => {
      if (param.name == this.nameToFind) {
        this.namesFound.push(param.id)
      }
    })
  }
}

/**
 * Search `modules` for a declaration of `name` inside the module, definition, or expression identified by `scope`.
 *
 * If `scopeId` identifies a definition or expression, search it recursively.
 * If `scopeId` identifies a module, search the module's top-level variables, but
 * don't descend into any of its declarations.
 *
 * @param name Find a declaration of this name.
 * @param scopeId ID of the module, definition, or expression to search.
 * @param modules Array of modules that contain `scope`.
 *
 * @returns Array of IDs that declare `name`.
 */
function findDeclByNameInsideScope(name: string, scopeId: bigint, modules: QuintModule[]): bigint[] {
  const module = modules.find(module => module.id == scopeId)
  if (module) {
    // scope is a module; return all variables with name `name`
    return module.declarations.filter(decl => decl.kind == 'var' && decl.name == name).map(decl => decl.id)
  }
  const expr = findExpressionWithId(modules, scopeId)
  if (expr) {
    // scope is an expression; recursively search it for declarations of the name `name`
    return findDeclByNameInExpr(name, expr)
  }
  const def = findDefinitionWithId(modules, scopeId)
  if (def) {
    // scope is a declaration; recursively search it for declarations of the name `name`
    return findDeclByNameInDecl(name, def)
  }
  return []
}

/**
 * Search for a declaration of `name`, in increasingly wide effects around `pos`.
 *
 * @returns Array of IDs that declare `name`.
 */
function findDeclByNameAtPos(name: string, pos: Position, sourceFile: string, parsedData: ParserPhase3): bigint[] {
  // Compute effects that contain the triggering position, from the smallest to the largest.
  const { modules, sourceMap } = parsedData
  const results: [bigint, null][] = [...sourceMap.keys()].map(id => [id, null])
  const scopesContainingPos = findMatchingResults(sourceMap, results, pos, sourceFile)

  for (let { id } of scopesContainingPos) {
    const names = findDeclByNameInsideScope(name, id, modules)
    if (names.length > 0) {
      return names
    }
  }
  return []
}

// Return raw markdown string `s` as `MarkupContent`
function md(s: string | undefined): MarkupContent | undefined {
  if (!s) return undefined
  return { kind: MarkupKind.Markdown, value: s }
}

// Build completion items for the builtin operators `ops` from `builtinDocs`
function builtinCompletionsWithDocs(
  ops: { name: string }[],
  builtinDocs: Map<string, DocumentationEntry>
): CompletionItem[] {
  return ops.map(op => {
    const docs = builtinDocs.get(op.name)
    return {
      label: op.name,
      kind: CompletionItemKind.Function,
      detail: docs?.signature,
      documentation: md(docs?.documentation),
    }
  })
}

function getSuggestedBuiltinsForType(type: QuintType): { name: string }[] {
  switch (type.kind) {
    case 'bool':
      // only suggest non-infix operators
      return booleanOperators.filter(opCode => opCode.name == 'iff' || opCode.name == 'implies')
    case 'int':
      // only suggest non-infix operators
      return integerOperators.filter(opCode => !opCode.name.startsWith('i'))
    case 'set':
      return setOperators
    case 'list':
      // don't suggest "nth"
      return listOperators.filter(opCode => opCode.name != 'nth')
    case 'fun':
      return mapOperators
    case 'tup':
      // don't suggest "item"
      return tupleOperators.filter(opCode => opCode.name != 'item')
    case 'rec':
      // don't suggest "field"
      return recordOperators.filter(opCode => opCode.name != 'field')
    case 'const': // should have been resolved
    case 'str': // no builtins
    case 'oper': // no suggestions from here on
    case 'var':
    case 'sum':
    case 'app':
      return []
  }
}

function getFieldCompletions(type: QuintType): CompletionItem[] {
  // return `_1`, `_2`, ... for tuples
  if (type.kind == 'tup' && type.fields.kind == 'row') {
    return type.fields.fields.map((field, i) => ({
      label: `_${i + 1}`,
      kind: CompletionItemKind.Field,
      detail: typeToString(field.fieldType),
    }))
  }
  // return `someField`, `otherField`, ... for records
  if (type.kind == 'rec' && type.fields.kind == 'row') {
    return type.fields.fields.map(field => ({
      label: field.fieldName,
      kind: CompletionItemKind.Field,
      detail: typeToString(field.fieldType),
    }))
  }
  return []
}
