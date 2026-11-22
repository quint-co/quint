/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Searching for observations with a model checker that reports reachability only
 * as an invariant violation. An observation `O` is searched for by checking the
 * invariant `not(O)`, and a counterexample marks every observation that it reaches.
 * Each round checks only the observations not reached yet, so a search with `n`
 * observations takes at most `n` model checker runs.
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { unreachable } from './util'

/** What one model checker run found about the observations it checked. */
export type ObservationRound =
  /** No checked observation is reachable (within the model checker's bound). */
  | { kind: 'unreachable' }
  /** A counterexample reaches these observations, by index. */
  | { kind: 'reached'; observations: number[] }
  | { kind: 'error'; message: string }

/**
 * Run rounds until every observation is reached or a round reaches none.
 *
 * @param count the number of observations, indexed from 0
 * @param runRound checks the invariants `not(O_i)` for the given indices `i`
 * @returns which observations are reachable, by index, or the message of a failed round
 */
export async function searchObservations(
  count: number,
  runRound: (remaining: number[]) => Promise<ObservationRound>
): Promise<Either<string, boolean[]>> {
  const reached: boolean[] = new Array(count).fill(false)
  let remaining = reached.map((_, i) => i)

  while (remaining.length > 0) {
    const round = await runRound(remaining)
    switch (round.kind) {
      case 'unreachable':
        return right(reached)
      case 'error':
        return left(round.message)
      case 'reached': {
        const found = remaining.filter(i => round.observations.includes(i))
        if (found.length === 0) {
          // Without progress the next round would check the same observations again
          return left('found a counterexample that reaches none of the checked observations')
        }
        found.forEach(i => (reached[i] = true))
        remaining = remaining.filter(i => !reached[i])
        break
      }
      default:
        unreachable(round)
    }
  }

  return right(reached)
}
