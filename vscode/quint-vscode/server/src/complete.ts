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
import { isEnabled, logger, overrideConsole } from './logger'
import JSONbig from 'json-bigint'

overrideConsole()

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
    try {
      const declBigInt = BigInt(declId)
      const refId = table.get(declBigInt)?.id ?? declBigInt
      const type = analysisOutput.types.get(refId)?.type

      if (isEnabled('INFO')) {
        logger.info(
          'DeclId: %s (BigInt: %s), RefId: %s, Type: %s',
          declId,
          declBigInt.toString(),
          refId.toString(),
          JSON.stringify(type, (_, val) => (typeof val === 'bigint' ? val.toString() : val))
        )
      }
      return type
    } catch (error) {
      logger.error('Error processing declId %s: %s', declId, error)
      return undefined
    }
  })

  const properTypes = compact(
    types.map(type => {
      if (type?.kind === 'const') {
        const alias = type.id ? table.get(type.id) : undefined
        if (alias?.kind !== 'typedef' || !alias.type) {
          if (isEnabled('DEBUG')) {
            logger.debug('Skipping const type alias: %s', JSON.stringify(alias))
          }
          return undefined
        }
        if (isEnabled('DEBUG')) {
          logger.debug('Resolved const alias: %s', JSON.stringify(alias.type))
        }
        return alias.type
        // TODO(#693): Workaround for #693, filter overly general types
      } else if (type?.kind === 'var') {
        logger.debug("Skipping 'var' type...")
        return undefined
      }
      return type
    })
  )

  if (properTypes.length === 0) {
    logger.debug('No valid types found, returning empty list.')
    return []
  }

  const type = properTypes[0]

  logger.debug('Fetching built-in completions...')
  const builtinCompletions = builtinCompletionsWithDocs(getSuggestedBuiltinsForType(type), builtinDocs)
  if (isEnabled('DEBUG')) {
    logger.debug('Builtin completions: %s', JSON.stringify(builtinCompletions))
  }

  const fieldCompletions = getFieldCompletions(type)
  if (isEnabled('DEBUG')) {
    logger.debug('Field completions: %s', JSON.stringify(fieldCompletions))
  }

  let responseObject = builtinCompletions.concat(fieldCompletions)
  if (isEnabled('DEBUG')) {
    logger.debug('Raw response object before conversion: %s', JSONbig.stringify(responseObject))
  }

  // Explicitly remove any lingering BigInt values
  if (isEnabled('INFO')) {
    logger.info('Returning safe completion response: %s', JSON.stringify(responseObject))
  }

  return responseObject
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
  const module = modules.find(module => module.id === scopeId)
  if (module) {
    return module.declarations.filter(decl => decl.kind === 'var' && decl.name === name).map(decl => decl.id)
  }
  const expr = findExpressionWithId(modules, scopeId)
  // scope is an expression; recursively search it for declarations of the name `name`
  if (expr) {
    return findDeclByNameInExpr(name, expr)
  }
  const def = findDefinitionWithId(modules, scopeId)
  // scope is a declaration; recursively search it for declarations of the name `name`
  if (def) {
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

export function getSuggestedBuiltinsForType(type: QuintType): { name: string }[] {
  logger.info('🔍 Checking builtins for type: %s', type.kind)

  switch (type.kind) {
    case 'bool':
      logger.trace('✅ Boolean type detected')
      return booleanOperators.filter(opCode => opCode.name == 'iff' || opCode.name == 'implies')

    case 'int':
      logger.trace('✅ Integer type detected')
      return integerOperators.filter(opCode => !opCode.name.startsWith('i'))

    case 'set':
      logger.trace('✅ Set type detected')
      return setOperators

    case 'list':
      logger.trace('✅ List type detected')
      return listOperators.filter(opCode => opCode.name != 'nth')

    case 'fun':
      logger.trace('✅ Map type detected')
      return mapOperators

    case 'tup':
      logger.trace('✅ Tuple type detected')
      return tupleOperators.filter(opCode => opCode.name != 'item')

    case 'rec':
      logger.trace('✅ Record type detected')
      return recordOperators.filter(opCode => opCode.name != 'field')

    case 'const':
    case 'str':
    case 'oper':
    case 'var':
    case 'sum':
    case 'app':
      return []

    default:
      logger.warn('⚠️ Unknown type encountered:')
      return []
  }
}

export function getFieldCompletions(type: QuintType): CompletionItem[] {
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
