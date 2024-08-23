import { Either, left } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { Map as ImmutableMap } from 'immutable'
import { Register } from './Context'

export interface NamedRegister extends Register {
  name: string
}

interface Snapshot {
  nextVars: ImmutableMap<string, NamedRegister>
  nondetPicks: Map<string, RuntimeValue | undefined>
  actionTaken: string | undefined
}

const initialRegisterValue: Either<QuintError, RuntimeValue> = left({ code: 'QNT502', message: 'Variable not set' })

export class VarStorage {
  public vars: ImmutableMap<string, NamedRegister> = ImmutableMap()
  public nextVars: ImmutableMap<string, NamedRegister> = ImmutableMap()
  public nondetPicks: Map<string, RuntimeValue | undefined> = new Map()
  public actionTaken: string | undefined
  private storeMetadata: boolean

  constructor(storeMetadata: boolean, nondetPicks: Map<string, RuntimeValue | undefined>) {
    this.storeMetadata = storeMetadata
    this.nondetPicks = nondetPicks
  }

  shiftVars() {
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

    if (this.storeMetadata) {
      const nondetPicksRecord = rv.mkRecord(
        [...this.nondetPicks.entries()].map(([name, value]) => {
          const valueVariant = value ? rv.mkVariant('Some', value) : rv.mkVariant('None', rv.mkTuple([]))
          return [name, valueVariant]
        })
      )
      map.push(['nondet_picks', nondetPicksRecord])
      map.push(['action_taken', rv.mkStr(this.actionTaken ?? '')])
    }

    return rv.mkRecord(map)
  }

  reset() {
    this.vars.forEach(reg => (reg.value = initialRegisterValue))
    this.nextVars.forEach(reg => (reg.value = initialRegisterValue))
  }

  snapshot(): Snapshot {
    return {
      nextVars: this.nextVars.map(reg => ({ ...reg })),
      nondetPicks: new Map(this.nondetPicks),
      actionTaken: this.actionTaken,
    }
  }

  recoverSnapshot(snapshot: Snapshot) {
    this.nextVars.forEach((reg, key) => {
      const snapshotReg = snapshot.nextVars.get(key)
      if (snapshotReg) {
        reg.value = snapshotReg.value
      }
    })
    this.nondetPicks = snapshot.nondetPicks
    this.actionTaken = snapshot.actionTaken
  }
}
