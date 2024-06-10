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

/** The constraint kinds, in order of "generality"
 *
 * Constraint solving is order dependent, and we need the most general constraints
 * to be solved first. "More general" is here understood to mean "requires less
 * information to solve correctly".
 */
const constraintKinds = ['empty', 'eq', 'conjunction', 'isDefined'] as const

export interface QuantifiedVariables {
  typeVariables: Set<string>
  rowVariables: Set<string>
}

export type TypeScheme = { type: QuintType } & QuantifiedVariables

export type Signature = (_arity: number) => TypeScheme

// Does not bind any type variables in `type`, which we take to assume
// that `type` has no free variables in the context.
export function toScheme(type: QuintType): TypeScheme {
  return { typeVariables: new Set([]), rowVariables: new Set([]), type }
}

/**  compares two constraints based on the order of generality of their kind
 *
 * @returns a negative value if the kind of the first constraint is more general than the second,
 *          a positive value if the kind of the first constraint is more specific than the second,
 *          and 0 if the two constraints are the same kind.
 */
export function compareConstraints(a: Constraint, b: Constraint): number {
  const aIdx: number = constraintKinds.findIndex(s => s === a.kind)
  const bIdx: number = constraintKinds.findIndex(s => s === b.kind)
  return aIdx - bIdx
}
