import { Either, left } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { QuintEx, QuintStr } from '../../ir/quintIr'
import { Map as ImmutableMap } from 'immutable'
import { Register } from './Context'

export interface VarRegister extends Register {
  name: string
}

const initialRegisterValue: Either<QuintError, RuntimeValue> = left({ code: 'QNT502', message: 'Variable not set' })

export class VarStorage {
  public vars: ImmutableMap<string, VarRegister> = ImmutableMap()
  public nextVars: ImmutableMap<string, VarRegister> = ImmutableMap()

  shiftVars() {
    // TODO: change this so registers are kept
    this.vars.forEach((reg, key) => {
      reg.value = this.nextVars.get(key)?.value ?? initialRegisterValue
    })

    this.nextVars.forEach(reg => (reg.value = initialRegisterValue))
  }

  asRecord(): RuntimeValue {
    const map: [string, RuntimeValue][] = this.vars
      .valueSeq()
      .toArray()
      .filter(r => r.value.isRight())
      .map(r => [r.name, r.value.unwrap()])

    // if (this.storeMetadata) {
    //   if (this.actionTaken.isJust()) {
    //     map.push(['action_taken', this.actionTaken.value!])
    //     map.push(['nondet_picks', this.nondetPicks])
    //   }
    // }

    return rv.mkRecord(map)
  }

  reset() {
    this.vars.forEach(reg => (reg.value = initialRegisterValue))
    this.nextVars.forEach(reg => (reg.value = initialRegisterValue))
  }

  nextVarsSnapshot(): ImmutableMap<string, VarRegister> {
    return this.nextVars.map(reg => ({ ...reg }))
  }

  recoverNextVars(snapshot: ImmutableMap<string, VarRegister>) {
    this.nextVars.forEach((reg, key) => {
      const snapshotReg = snapshot.get(key)
      if (snapshotReg) {
        reg.value = snapshotReg.value
      }
    })
  }
}
