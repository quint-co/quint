import { Either, left, right } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue } from './runtimeValue'
import { TraceRecorder } from '../trace'
import { Map as ImmutableMap, List, is } from 'immutable'
import { VarStorage } from './VarStorage'
import { Trace } from './trace'

export interface NondetPick {
  name: string
  value: Either<QuintError, RuntimeValue>
}

export interface Register {
  value: Either<QuintError, RuntimeValue>
}

export class Context {
  public namespaces: List<string> = List()
  public varStorage: VarStorage = new VarStorage()
  public rand: (n: bigint) => bigint
  public nondetPicks: ImmutableMap<bigint, NondetPick> = ImmutableMap()
  public recorder: TraceRecorder
  public trace: Trace = new Trace()

  constructor(recorder: TraceRecorder, rand: (n: bigint) => bigint) {
    this.recorder = recorder
    this.rand = rand
  }

  reset() {
    this.varStorage = new VarStorage()
  }

  shift() {
    if (this.varStorage.nextVars.size === 0) {
      return
    }
    this.varStorage.shiftVars()
    this.trace.extend(this.varStorage.asRecord())
    // TODO: save on trace
    this.nondetPicks = ImmutableMap()
  }

  discoverVar(id: bigint, name: string) {
    this.varStorage.varNames.set(id, name)
  }

  getVar(id: bigint): Either<QuintError, RuntimeValue> {
    const varName = this.varWithNamespaces(id)
    const key = [id, varName].join('#')
    const result = this.varStorage.vars.get(key)
    if (!result) {
      return left({ code: 'QNT502', message: `Variable ${varName} not set` })
    }

    return result
  }

  setNextVar(id: bigint, value: RuntimeValue) {
    const varName = this.varWithNamespaces(id)
    const key = [id, varName].join('#')
    this.varStorage.nextVars.set(key, right(value))
  }

  private varWithNamespaces(id: bigint): string {
    const revertedNamespaces = this.namespaces.slice().reverse()
    return revertedNamespaces.concat([this.varStorage.varNames.get(id)!] || []).join('::')
  }
}
