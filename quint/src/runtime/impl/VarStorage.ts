/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A storage to keep track of Quint state variables in the current and next state.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { Map as ImmutableMap } from 'immutable'
import { CachedValue, Register } from './Context'
import { ACTION_TAKEN, NONDET_PICKS } from '../../itf'

/**
 * A named pointer to a value, so we can use the same reference in multiple places, and just update the value.
 * The name is used for error messages.
 */
export interface NamedRegister extends Register {
  name: string
}

/**
 * A snapshot of the VarStorage at a given point in time. Stores only information that is needed to backtrack.
 */
interface Snapshot {
  nextVars: ImmutableMap<string, NamedRegister>
  nondetPicks: Map<string, RuntimeValue | undefined>
  actionTaken: string | undefined
}

/**
 * Initializes the register value for a given variable name.
 *
 * @param name - The name of the variable to initialize, to be used in error messages
 * @returns a QuintError indicating the variable is not set
 */
export function initialRegisterValue(name: string): Either<QuintError, RuntimeValue> {
  return left({ code: 'QNT502', message: `Variable ${name} not set` })
}

/**
 * A storage to keep track of Quint state variables in the current and next state.
 */
export class VarStorage {
  /**
   * An immutable map with registers for the current state variables.
   */
  public vars: ImmutableMap<string, NamedRegister> = ImmutableMap()

  /**
   * An immutable map with registers for the next state variables.
   */
  public nextVars: ImmutableMap<string, NamedRegister> = ImmutableMap()

  /**
   * Non-deterministic picks and their values for the current step.
   */
  public nondetPicks: Map<string, RuntimeValue | undefined> = new Map()

  /**
   * The action taken in the current step.
   */
  public actionTaken: string | undefined

  /**
   * Cached values that need to be cleared when shifting.
   */
  public cachesToClear: CachedValue[] = []

  /**
   * Indicates whether to store metadata.
   */
  private storeMetadata: boolean

  /**
   * Constructs a new VarStorage instance.
   *
   * @param storeMetadata - Indicates whether to store metadata.
   * @param nondetPicks - Non-deterministic picks and their values for the current step. Should be
                          the one constructed in the builder.
   */
  constructor(storeMetadata: boolean, nondetPicks: Map<string, RuntimeValue | undefined>) {
    this.storeMetadata = storeMetadata
    this.nondetPicks = nondetPicks
  }

  /**
   * Shifts the current state variables to the next state variables.
   * This method updates the current state variable registers with the values
   * from the next state variable registers, initializes the next state variable
   * registers, and clears cached values.
   */
  shiftVars() {
    this.vars.forEach((reg, key) => {
      reg.value = this.nextVars.get(key)?.value ?? initialRegisterValue(reg.name)
    })

    this.nextVars.forEach(reg => (reg.value = initialRegisterValue(reg.name)))
    this.clearCaches()
  }

  /**
   * Converts the current state variables and metadata into a RuntimeValue record.
   *
   * @returns A RuntimeValue representing the current state variables and metadata.
   */
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
      map.push([NONDET_PICKS, nondetPicksRecord])
      map.push([ACTION_TAKEN, rv.mkStr(this.actionTaken ?? '')])
    }

    return rv.mkRecord(map)
  }

  /**
   * Resets the current and next state variable registers to their initial values.
   * This method sets the value of each register in both the current and next state
   * variable maps to an undefined (error) value.
   */
  reset() {
    this.vars.forEach(reg => (reg.value = initialRegisterValue(reg.name)))
    this.nextVars.forEach(reg => (reg.value = initialRegisterValue(reg.name)))
    if (this.storeMetadata) {
      this.actionTaken = undefined
      this.nondetPicks.forEach((_, key) => {
        this.nondetPicks.set(key, undefined)
      })
    }
  }

  /**
   * Creates a snapshot of the current state of the VarStorage, with the relevant information to backtrack.
   * @returns A snapshot of the current state of the VarStorage.
   */
  snapshot(): Snapshot {
    return {
      nextVars: this.nextVars.map(reg => ({ ...reg })),
      nondetPicks: new Map(this.nondetPicks),
      actionTaken: this.actionTaken,
    }
  }

  /**
   * Recovers the state of the VarStorage from a snapshot.
   *
   * @param snapshot - the snapshot to recover the state from
   */
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

  private clearCaches() {
    this.cachesToClear.forEach(cachedValue => {
      cachedValue.value = undefined
    })
  }
}
