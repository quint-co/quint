/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * The evaluation context for the Quint evaluator.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue } from './runtimeValue'
import { TraceRecorder } from '../trace'
import { VarStorage } from './VarStorage'
import { Trace } from './trace'

/**
 * A pointer to a value, so we can use the same reference in multiple places, and just update the value.
 */
export interface Register {
  /**
   * The value stored in the register, which can either be a runtime value or an error.
   */
  value: Either<QuintError, RuntimeValue>
}

/**
 * A pointer to an optional value, so we can use the same reference in multiple places, and just update the value.
 */
export interface CachedValue {
  /**
   * The cached value, which can either be a runtime value, an error, or undefined if not cached yet.
   */
  value: Either<QuintError, RuntimeValue> | undefined
}

export class Context {
  /**
   * Function to generate a random bigint up to a specified maximum value.
   */
  public rand: (n: bigint) => bigint

  /**
   * The recorder for tracing the evaluation process.
   */
  public recorder: TraceRecorder

  /**
   * The trace object for recording variable values at each state in an execution.
   */
  public trace: Trace = new Trace()

  /**
   * Storage for variables at current and next state.
   */
  public varStorage: VarStorage

  /**
   * Constructs a new evaluation context.
   *
   * @param recorder - The trace recorder to use.
   * @param rand - Function to generate random bigints.
   * @param varStorage - The variable storage to use (should be the same as the builder's)
   */
  constructor(recorder: TraceRecorder, rand: (n: bigint) => bigint, varStorage: VarStorage) {
    this.recorder = recorder
    this.rand = rand
    this.varStorage = varStorage
  }

  /**
   * Shifts the variables in storage and extends the trace with the current variable state.
   */
  shift() {
    this.varStorage.shiftVars()
    this.trace.extend(this.varStorage.asRecord())
  }
}
