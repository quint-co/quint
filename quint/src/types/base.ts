import { QuintType } from '../ir/quintTypes'

/*
 * Type constraints
 */
export type Constraint =
  /// equality of two types, defined as unifiability
  | { kind: 'eq'; types: [QuintType, QuintType]; sourceId: bigint }
  /// a conjunction of constraints
  | { kind: 'conjunction'; constraints: Constraint[]; sourceId: bigint }
  /// a type unifying with `type` is defined in the context
  | { kind: 'isDefined'; type: QuintType; sourceId: bigint }
  /// the empty constraint (always satisfied)
  | { kind: 'empty' }

export interface TypeScheme {
  type: QuintType
  typeVariables: Set<string>
  rowVariables: Set<string>
}

export type Signature = (_arity: number) => TypeScheme

export function toScheme(type: QuintType): TypeScheme {
  return { typeVariables: new Set([]), rowVariables: new Set([]), type }
}
