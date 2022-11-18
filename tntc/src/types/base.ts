import { TntType } from '../tntTypes'

/*
 * A type constraint can be either an equality of two types, a conjunction of
 * constraints or an empty constraint
 */
export type Constraint =
  | { kind: 'eq', types: [TntType, TntType], sourceId: bigint }
  | { kind: 'conjunction', constraints: Constraint[], sourceId: bigint }
  | { kind: 'empty' }

export interface TypeScheme {
  type: TntType,
  variables: Set<string>,
}

export type Signature = (_arity: number) => TypeScheme
