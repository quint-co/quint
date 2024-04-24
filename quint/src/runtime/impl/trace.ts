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
