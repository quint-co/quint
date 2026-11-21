/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Uses the Rust evaluator to determine which invariants are violated, or which
 * observations hold, at a given state.
 *
 * @module
 */

import { QuintEx } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { ItfState } from '../itf'
import { CommandWrapper } from './commandWrapper'
import { Either, left, right } from '@sweet-monads/either'
import { QuintError } from '../quintError'

/**
 * Evaluate invariant expressions at a given ITF state using the Rust evaluator,
 * and return the indices of invariants that evaluated to false.
 *
 * @param state - The last state as a raw ITF value.
 * @param table - The lookup table for name resolution.
 * @param exprs - The parsed invariant expressions.
 * @param verbosityLevel - The verbosity level for logging.
 *
 * @returns Either an error or the indices of violated invariants.
 */
export async function findViolatedInvariants(
  state: ItfState,
  table: LookupTable,
  exprs: QuintEx[],
  verbosityLevel: number
): Promise<Either<QuintError, number[]>> {
  return indicesEvaluatingTo(false, state, table, exprs, verbosityLevel)
}

/**
 * Evaluate observation expressions at a given ITF state using the Rust evaluator,
 * and return the indices of observations that evaluated to true.
 *
 * @param state - The state as a raw ITF value.
 * @param table - The lookup table for name resolution.
 * @param exprs - The parsed observation expressions.
 * @param verbosityLevel - The verbosity level for logging.
 *
 * @returns Either an error or the indices of the observations that hold at the state.
 */
export async function findSatisfiedObservations(
  state: ItfState,
  table: LookupTable,
  exprs: QuintEx[],
  verbosityLevel: number
): Promise<Either<QuintError, number[]>> {
  return indicesEvaluatingTo(true, state, table, exprs, verbosityLevel)
}

/** The indices of the expressions that evaluate to `expected` at `state`, by the Rust evaluator. */
async function indicesEvaluatingTo(
  expected: boolean,
  state: ItfState,
  table: LookupTable,
  exprs: QuintEx[],
  verbosityLevel: number
): Promise<Either<QuintError, number[]>> {
  const wrapper = new CommandWrapper(verbosityLevel)
  const evalResults = await wrapper.evaluateAtState(state, table, exprs)

  if (evalResults.isLeft()) {
    return left(evalResults.value)
  }

  const indices = evalResults.value
    .map((value, i) => ({ value, i }))
    .filter(({ value }) => value === expected)
    .map(({ i }) => i)

  return right(indices)
}
