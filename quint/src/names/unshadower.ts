/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Renamer for shadowed names.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformModule } from '../ir/IRTransformer'
import { LookupTable } from './base'
import { QuintApp, QuintLambda, QuintLambdaParameter, QuintLet, QuintModule, QuintName } from '../ir/quintIr'

/**
 * Replace all names with unique names, to avoid shadowing.
 * - Lambda parameters are renamed to `<name>_<lambda-id>`
 * - Nested definitions (from let expressions) are renamed to `<name>_<let-id>`
 *
 * @param module The module to unshadow
 * @param lookupTable The lookup table with the module's name references
 *
 * @returns The module with no shadowed names
 */
export function unshadowNames(module: QuintModule, lookupTable: LookupTable): QuintModule {
  const transformer = new Unshadower(lookupTable)
  return transformModule(transformer, module)
}

class Unshadower implements IRTransformer {
  private nestedNames = new Map<bigint, string>()
  private lookupTable: LookupTable

  constructor(lookupTable: LookupTable) {
    this.lookupTable = lookupTable
  }

  enterLambda(lambda: QuintLambda): QuintLambda {
    const newParams: QuintLambdaParameter[] = lambda.params.map(p => {
      const newName = `${p.name}_${lambda.id}`
      this.nestedNames.set(p.id, newName)

      return { ...p, name: newName }
    })
    return { ...lambda, params: newParams }
  }

  enterLet(expr: QuintLet): QuintLet {
    const newName = `${expr.opdef.name}_${expr.id}`
    this.nestedNames.set(expr.opdef.id, newName)

    return { ...expr, opdef: { ...expr.opdef, name: newName } }
  }

  enterName(expr: QuintName): QuintName {
    const def = this.lookupTable.get(expr.id)
    if (!def) {
      return expr
    }

    const newName = this.nestedNames.get(def.id)
    if (newName) {
      this.lookupTable.set(expr.id, { ...def, name: newName })
      return { ...expr, name: newName }
    }

    return expr
  }

  enterApp(expr: QuintApp): QuintApp {
    const def = this.lookupTable.get(expr.id)
    if (!def) {
      return expr
    }

    const newName = this.nestedNames.get(def.id)
    if (newName) {
      this.lookupTable.set(expr.id, { ...def, name: newName })
      return { ...expr, opcode: newName }
    }

    return expr
  }
}
