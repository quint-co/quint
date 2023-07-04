import { QuintType } from '../quintTypes'

/**
 * Possible kinds for definitions
 */
export type DefinitionKind = 'module' | 'def' | 'val' | 'assumption' | 'param' | 'var' | 'const' | 'type'
/**
 * Information stored for each id in the lookup table
 */
export interface Definition {
  kind: DefinitionKind
  reference: bigint
  typeAnnotation?: QuintType
}

export type DefinitionsByName = Map<string, Definition & { scoped?: boolean }>

/**
 * Definitions tables for each module
 */
export type DefinitionsByModule = Map<string, DefinitionsByName>

/**
 * A lookup table from IR component ids to their definitions.
 * Should have an entry for every IR component with a name
 * That is:
 * - Name expressions
 * - App expressions (opcode is a name)
 * - Override parameters in instance definitions
 * - Constant types (which are references to type aliases or uninterpreted types)
 *
 * This should be created by `resolveNames` from `nameResolver.ts`
 */
export type LookupTable = Map<bigint, Definition>

/**
 * Copy the names of a definitions table to a new one, ignoring scoped
 * definitions, and optionally adding a namespace.
 *
 * @param originTable the definitions table to copy from
 * @param namespace optional namespace to be added to copied names
 * @param scope whether to the copied definitions are scoped
 *
 * @returns a definitions table with the filtered and namespaced names
 */
export function copyNames(originTable: DefinitionsByName, namespace?: string, scoped?: boolean): DefinitionsByName {
  const table = new Map()

  originTable.forEach((def, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier
    if (!def.scoped || def.kind === 'const') {
      table.set(name, { ...def, identifier: name, scoped })
    }
  })

  return table
}

/**
 * Built-in name definitions that are always included in definitions collection
 * This is a function instead of a constant to ensure a new instance is generated
 * every call
 */
export const builtinNames = [
  'not',
  'and',
  'or',
  'iff',
  'implies',
  'exists',
  'forall',
  'in',
  'union',
  'contains',
  'fold',
  'intersect',
  'exclude',
  'subseteq',
  'map',
  'applyTo',
  'filter',
  'powerset',
  'flatten',
  'allLists',
  'chooseSome',
  'oneOf',
  'isFinite',
  'size',
  'get',
  'put',
  'keys',
  'mapBy',
  'setToMap',
  'setOfMaps',
  'set',
  'setBy',
  'fields',
  'with',
  'tuples',
  'append',
  'concat',
  'head',
  'tail',
  'length',
  'nth',
  'indices',
  'replaceAt',
  'slice',
  'select',
  'foldl',
  'foldr',
  'to',
  'always',
  'eventually',
  'next',
  'then',
  'repeated',
  'reps',
  'fail',
  'assert',
  'orKeep',
  'mustChange',
  'enabled',
  'weakFair',
  'strongFair',
  'guarantees',
  'existsConst',
  'forallConst',
  'chooseConst',
  'Bool',
  'Int',
  'Nat',
  'Set',
  'Map',
  'List',
  'Tup',
  'Rec',
  'range',
  'igt',
  'ilt',
  'igte',
  'ilte',
  'iadd',
  'isub',
  'iuminus',
  'imul',
  'idiv',
  'imod',
  'ipow',
  'actionAll',
  'actionAny',
  'field',
  'fieldNames',
  'item',
  'unionMatch',
  'assign',
  'of',
  'eq',
  'neq',
  'ite',
  'cross',
  'difference',
]
