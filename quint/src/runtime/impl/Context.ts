import { Either, left, right } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue } from './runtimeValue'
import { TraceRecorder } from '../trace'
import { Map as ImmutableMap, List, is } from 'immutable'
import { VarRegister, VarStorage } from './VarStorage'
import { Trace } from './trace'

export interface NondetPick {
  name: string
  value: Either<QuintError, RuntimeValue>
}

export interface Register {
  value: Either<QuintError, RuntimeValue>
}

export class Context {
  public rand: (n: bigint) => bigint
  public nondetPicks: ImmutableMap<bigint, NondetPick> = ImmutableMap()
  public recorder: TraceRecorder
  public trace: Trace = new Trace()
  public varStorage: VarStorage

  constructor(recorder: TraceRecorder, rand: (n: bigint) => bigint, varStorage: VarStorage) {
    this.recorder = recorder
    this.rand = rand
    this.varStorage = varStorage
  }

  reset() {
    this.varStorage = new VarStorage()
  }

  shift() {
    this.varStorage.shiftVars()
    this.trace.extend(this.varStorage.asRecord())
    // TODO: save on trace
    this.nondetPicks = ImmutableMap()
  }
}
