import { Either } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue } from './runtimeValue'
import { TraceRecorder } from '../trace'
import { VarStorage } from './VarStorage'
import { Trace } from './trace'

export interface Register {
  value: Either<QuintError, RuntimeValue>
}

export interface CachedValue {
  value: Either<QuintError, RuntimeValue> | undefined
}

export class Context {
  public rand: (n: bigint) => bigint
  public recorder: TraceRecorder
  public trace: Trace = new Trace()
  public varStorage: VarStorage

  constructor(recorder: TraceRecorder, rand: (n: bigint) => bigint, varStorage: VarStorage) {
    this.recorder = recorder
    this.rand = rand
    this.varStorage = varStorage
  }

  shift() {
    this.varStorage.shiftVars()
    this.trace.extend(this.varStorage.asRecord())
  }
}
