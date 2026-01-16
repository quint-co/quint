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
import { DiffConfig, diffRuntimeValueDoc } from './runtimeValueDiff'
import { format } from '../../prettierimp'

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

  dropLast() {
    this.states = this.states.pop()
  }

  renderDiff(width: number, config?: DiffConfig): string {
    if (this.states.size == 0) {
      return ''
    }

    const comparisonBase = this.states.size > 1 ? this.states.get(this.states.size - 2)! : this.states.last()!

    const doc = diffRuntimeValueDoc(comparisonBase, this.states.last()!, config)
    return format(width, 0, doc)
  }
}
