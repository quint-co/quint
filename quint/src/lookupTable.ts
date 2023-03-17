import { ValueDefinitionKind } from './definitionsByName'
import { QuintType } from './quintTypes'

/**
 * Information stored for each id in the lookup table
 */
export interface Definition {
  reference: bigint,
  kind: ValueDefinitionKind | 'type',
  typeAnnotation?: QuintType,
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
