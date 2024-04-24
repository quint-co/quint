/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Trace of states representing a single execution path
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { List } from 'immutable'
import { RuntimeValue } from './runtimeValue'

export class Trace {
  private states: List<RuntimeValue> = List<RuntimeValue>()

  get(): RuntimeValue[] {
    return this.states.toArray()
  }

  reset(values: RuntimeValue[] = []) {
    this.states = List(values)
  }

  extend(state: RuntimeValue) {
    this.states = this.states.push(state)
  }
}
