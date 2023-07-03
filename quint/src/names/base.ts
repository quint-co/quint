import { QuintType } from '../quintTypes'

/**
 * Possible kinds for value definitions
 */
export type ValueDefinitionKind = 'module' | 'def' | 'val' | 'assumption' | 'param' | 'var' | 'const'

/**
 * A named operator definition. Can be scoped or module-wide (unscoped).
 */
export interface ValueDefinition {
  /* Same as QuintDef kinds */
  kind: ValueDefinitionKind
  /* The name given to the defined operator */
  identifier: string
  /* Expression or definition id from where the name was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the QuintIr node that introduces the name */
  scoped?: boolean
  /* Optional type annotation */
  typeAnnotation?: QuintType
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  kind: 'type'
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased (none for uninterpreted type) */
  type?: QuintType
  /* Expression or definition id from where the type was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the QuintIr node that introduces the name */
  scoped?: bigint
}

export type DefinitionsByName = Map<string, ValueDefinition | TypeDefinition>
/**
 * Definitions tables for each module
 */
export type DefinitionsByModule = Map<string, DefinitionsByName>

/**
 * The source of a conflict occurrences
 */
export type ConflictSource =
  /* A user definition, referencing its IR node id */
  | { kind: 'user'; reference: bigint }
  /* A built-in definition, no reference */
  | { kind: 'builtin' }

/**
 * Error report for a found name conflict
 */
export interface Conflict {
  /* The name that has a conflict */
  identifier: string
  /* Sources of the occurrences of the conflicting name */
  sources: ConflictSource[]
}
/**
 * Information stored for each id in the lookup table
 */
export interface Definition {
  reference: bigint
  kind: ValueDefinitionKind | 'type'
  typeAnnotation?: QuintType
}

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
 * Built-in name definitions that are always included in definitions collection
 * This is a function instead of a constant to ensure a new instance is generated
 * every call
 */
export function defaultValueDefinitions(): ValueDefinition[] {
  return [
    { kind: 'def', identifier: 'not' },
    { kind: 'def', identifier: 'and' },
    { kind: 'def', identifier: 'or' },
    { kind: 'def', identifier: 'iff' },
    { kind: 'def', identifier: 'implies' },
    { kind: 'def', identifier: 'exists' },
    { kind: 'def', identifier: 'forall' },
    { kind: 'def', identifier: 'in' },
    { kind: 'def', identifier: 'union' },
    { kind: 'def', identifier: 'contains' },
    { kind: 'def', identifier: 'fold' },
    { kind: 'def', identifier: 'intersect' },
    { kind: 'def', identifier: 'exclude' },
    { kind: 'def', identifier: 'subseteq' },
    { kind: 'def', identifier: 'map' },
    { kind: 'def', identifier: 'applyTo' },
    { kind: 'def', identifier: 'filter' },
    { kind: 'def', identifier: 'powerset' },
    { kind: 'def', identifier: 'flatten' },
    { kind: 'def', identifier: 'allLists' },
    { kind: 'def', identifier: 'chooseSome' },
    { kind: 'def', identifier: 'oneOf' },
    { kind: 'def', identifier: 'isFinite' },
    { kind: 'def', identifier: 'size' },
    { kind: 'def', identifier: 'get' },
    { kind: 'def', identifier: 'put' },
    { kind: 'def', identifier: 'keys' },
    { kind: 'def', identifier: 'mapBy' },
    { kind: 'def', identifier: 'setToMap' },
    { kind: 'def', identifier: 'setOfMaps' },
    { kind: 'def', identifier: 'set' },
    { kind: 'def', identifier: 'setBy' },
    { kind: 'def', identifier: 'fields' },
    { kind: 'def', identifier: 'with' },
    { kind: 'def', identifier: 'tuples' },
    { kind: 'def', identifier: 'append' },
    { kind: 'def', identifier: 'concat' },
    { kind: 'def', identifier: 'head' },
    { kind: 'def', identifier: 'tail' },
    { kind: 'def', identifier: 'length' },
    { kind: 'def', identifier: 'nth' },
    { kind: 'def', identifier: 'indices' },
    { kind: 'def', identifier: 'replaceAt' },
    { kind: 'def', identifier: 'slice' },
    { kind: 'def', identifier: 'select' },
    { kind: 'def', identifier: 'foldl' },
    { kind: 'def', identifier: 'foldr' },
    { kind: 'def', identifier: 'to' },
    { kind: 'def', identifier: 'always' },
    { kind: 'def', identifier: 'eventually' },
    { kind: 'def', identifier: 'next' },
    { kind: 'def', identifier: 'then' },
    { kind: 'def', identifier: 'repeated' },
    { kind: 'def', identifier: 'reps' },
    { kind: 'def', identifier: 'fail' },
    { kind: 'def', identifier: 'assert' },
    { kind: 'def', identifier: 'orKeep' },
    { kind: 'def', identifier: 'mustChange' },
    { kind: 'def', identifier: 'enabled' },
    { kind: 'def', identifier: 'weakFair' },
    { kind: 'def', identifier: 'strongFair' },
    { kind: 'def', identifier: 'guarantees' },
    { kind: 'def', identifier: 'existsConst' },
    { kind: 'def', identifier: 'forallConst' },
    { kind: 'def', identifier: 'chooseConst' },
    { kind: 'def', identifier: 'Bool' },
    { kind: 'def', identifier: 'Int' },
    { kind: 'def', identifier: 'Nat' },
    { kind: 'def', identifier: 'Set' },
    { kind: 'def', identifier: 'Map' },
    { kind: 'def', identifier: 'List' },
    { kind: 'def', identifier: 'Tup' },
    { kind: 'def', identifier: 'Rec' },
    { kind: 'def', identifier: 'range' },
    { kind: 'def', identifier: 'igt' },
    { kind: 'def', identifier: 'ilt' },
    { kind: 'def', identifier: 'igte' },
    { kind: 'def', identifier: 'ilte' },
    { kind: 'def', identifier: 'iadd' },
    { kind: 'def', identifier: 'isub' },
    { kind: 'def', identifier: 'iuminus' },
    { kind: 'def', identifier: 'imul' },
    { kind: 'def', identifier: 'idiv' },
    { kind: 'def', identifier: 'imod' },
    { kind: 'def', identifier: 'ipow' },
    { kind: 'def', identifier: 'actionAll' },
    { kind: 'def', identifier: 'actionAny' },
    { kind: 'def', identifier: 'field' },
    { kind: 'def', identifier: 'fieldNames' },
    { kind: 'def', identifier: 'item' },
    { kind: 'def', identifier: 'unionMatch' },
    { kind: 'def', identifier: 'assign' },
    { kind: 'def', identifier: 'of' },
    { kind: 'def', identifier: 'eq' },
    { kind: 'def', identifier: 'neq' },
    { kind: 'def', identifier: 'ite' },
    { kind: 'def', identifier: 'cross' },
    { kind: 'def', identifier: 'difference' },
  ]
}
