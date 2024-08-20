import { Either, left, right } from '@sweet-monads/either'
import { isEqual, takeRight } from 'lodash'
import { LookupTable } from '../../names/base'
import { QuintError } from '../../quintError'
import { RuntimeValue } from './runtimeValue'
import { TraceRecorder } from '../trace'
import { Map as ImmutableMap, List, is } from 'immutable'
import { VarStorage } from './VarStorage'

export interface NondetPick {
  name: string
  value: Either<QuintError, RuntimeValue>
}

export class Context {
  public memo: Map<bigint, Either<QuintError, RuntimeValue>> = new Map()
  public memoEnabled: boolean = true
  public params: ImmutableMap<bigint, Either<QuintError, RuntimeValue>> = ImmutableMap()
  public consts: ImmutableMap<bigint, Either<QuintError, RuntimeValue>> = ImmutableMap()
  public namespaces: List<string> = List()
  public varStorage: VarStorage = new VarStorage()
  public rand: (n: bigint) => bigint
  public table: LookupTable
  public pureKeys: Set<bigint> = new Set()
  public nondetPicks: ImmutableMap<bigint, NondetPick> = ImmutableMap()
  public recorder: TraceRecorder

  private constHistory: ImmutableMap<bigint, Either<QuintError, RuntimeValue>>[] = []
  private paramHistory: ImmutableMap<bigint, Either<QuintError, RuntimeValue>>[] = []
  private namespacesHistory: List<string>[] = []

  constructor(table: LookupTable, recorder: TraceRecorder, rand: (n: bigint) => bigint) {
    this.table = table
    this.recorder = recorder
    this.rand = rand
  }

  reset() {
    this.memo = new Map()
    this.params = ImmutableMap()
    this.varStorage = new VarStorage()
  }

  discoverVar(id: bigint, name: string) {
    this.varStorage.varNames.set(id, name)
  }

  getVar(id: bigint): Either<QuintError, RuntimeValue> {
    const varName = this.varWithNamespaces(id)
    const key = [id, varName].join('#')
    const result = this.varStorage.vars.get(key)
    // console.log('getting', id, varName, result)
    if (!result) {
      return left({ code: 'QNT502', message: `Variable ${varName} not set` })
    }

    return result
  }

  setNextVar(id: bigint, value: RuntimeValue) {
    const varName = this.varWithNamespaces(id)
    // console.log('setting', id, varName, value)
    const key = [id, varName].join('#')
    this.varStorage.nextVars.set(key, right(value))
  }

  private varWithNamespaces(id: bigint): string {
    const revertedNamespaces = this.namespaces.slice().reverse()
    return revertedNamespaces.concat([this.varStorage.varNames.get(id)!] || []).join('::')
  }

  addParams(params: [bigint, RuntimeValue][]) {
    this.paramHistory.push(this.params)
    this.params = this.params.merge(params.map(([id, param]) => [id, right(param)]))
  }

  removeParams() {
    this.params = this.paramHistory.pop()!
  }

  clearMemo() {
    this.memo = new Map()
  }

  disableMemo() {
    this.memoEnabled = false
  }

  enableMemo() {
    this.memoEnabled = true
  }

  withMemo(f: () => Either<QuintError, RuntimeValue>) {
    const memoStateBefore = this.memoEnabled
    this.memoEnabled = true
    const result = f()
    this.memoEnabled = memoStateBefore
    return result
  }

  addConstants(consts: ImmutableMap<bigint, Either<QuintError, RuntimeValue>>) {
    this.constHistory.push(this.consts)
    this.consts = this.consts.merge(consts)
  }

  removeConstants() {
    this.consts = this.constHistory.pop()!
  }

  addNamespaces(namespaces: List<string> | undefined) {
    this.namespacesHistory.push(this.namespaces)
    if (is(this.namespaces.take(namespaces?.size ?? 0), namespaces)) {
      // Redundant namespaces, nothing to add
      return
    }

    this.namespaces = this.namespaces.concat(namespaces || [])
  }

  removeNamespaces() {
    this.namespaces = this.namespacesHistory.pop()!
  }

  constsSnapshot(): [bigint, Either<QuintError, RuntimeValue>][] {
    return [...this.consts.entries()]
  }
}
