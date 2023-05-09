import { QuintType } from '../quintTypes'

/*
 * A type constraint can be either an equality of two types, a conjunction of
 * constraints or an empty constraint
 */
export type Constraint =
  | { kind: 'eq'; types: [QuintType, QuintType]; sourceId: bigint }
  | { kind: 'conjunction'; constraints: Constraint[]; sourceId: bigint }
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
