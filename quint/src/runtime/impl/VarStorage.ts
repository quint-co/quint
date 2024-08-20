import { Either } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { QuintEx, QuintStr } from '../../ir/quintIr'
import { Map as ImmutableMap } from 'immutable'

export class VarStorage {
  public vars: ImmutableMap<string, Either<QuintError, RuntimeValue>> = ImmutableMap()
  public nextVars: Map<string, Either<QuintError, RuntimeValue>> = new Map()
  public varNames: Map<bigint, string> = new Map()

  shiftVars() {
    this.vars = ImmutableMap(this.nextVars)
    this.nextVars = new Map()
  }

  asRecord(): QuintEx {
    return {
      id: 0n,
      kind: 'app',
      opcode: 'Rec',
      args: [...this.vars.entries()]
        .map(([key, value]) => {
          const [id, varName] = key.split('#')
          const nameEx: QuintStr = { id: BigInt(id), kind: 'str', value: varName }
          return [nameEx, rv.toQuintEx(value.unwrap())]
        })
        .flat(),
    }
  }

  nextVarsSnapshot(): Map<string, Either<QuintError, RuntimeValue>> {
    return this.nextVars
  }
}
