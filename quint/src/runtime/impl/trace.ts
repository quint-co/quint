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
import { QuintEx } from '../../ir/quintIr'

export class Trace {
  private states: List<QuintEx> = List<QuintEx>()

  get(): QuintEx[] {
    return this.states.toArray()
  }

  reset(values: QuintEx[] = []) {
    this.states = List(values)
  }

  extend(state: QuintEx) {
    this.states = this.states.push(state)
  }
}
