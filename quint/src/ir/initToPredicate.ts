/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Convert init definitions to predicates to be compatible with TLA+.
 * Returns errors if some action is re-used between init and step, as that would require generating new actions.
 * We ask for user intervention in such edge cases.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { LookupTable } from '../names/base'
import { QuintError } from '../quintError'
import { IRTransformer, transformModule } from './IRTransformer'
import { IRVisitor, walkDefinition, walkModule } from './IRVisitor'
import { OpQualifier, QuintApp, QuintDef, QuintModule, QuintName } from './quintIr'

/**
 * Converts the action named as "q::init" and all its dependencies to
 * predicates (transforming assignments into equalities). If one of the
 * converted dependencies is also used outside of init, this produces an error
 * as that case would be more complicated to handle.
 *
 * @param module: the module with the init definition and its dependencies
 * @param lookupTable: the lookup table for the module
 * @param modes: the result of mode checking the module
 *
 * @returns The converted module, or errors instructing manual fix.
 */
export function convertInit(
  module: QuintModule,
  lookupTable: LookupTable,
  modes: Map<bigint, OpQualifier>
): Either<QuintError[], QuintModule> {
  const defsFinder = new InitDefsFinder(lookupTable)
  walkModule(defsFinder, module)
  const converter = new InitConverter(defsFinder.insideInitDefs, lookupTable, modes)
  const convertedModule = transformModule(converter, module)
  if (converter.errors.length > 0) {
    return left(converter.errors)
  } else {
    return right(convertedModule)
  }
}

class InitDefsFinder implements IRVisitor {
  insideInitDefs = ['q::init']
  private insideInit = 0
  private lookupTable: LookupTable

  constructor(lookupTable: LookupTable) {
    this.lookupTable = lookupTable
  }

  enterDef(def: QuintDef) {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit++
    }
  }

  exitDef(def: QuintDef) {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit--
    }
  }

  enterName(expr: QuintName) {
    if (this.insideInit > 0) {
      const def = this.lookupTable.get(expr.id)
      if (!def || def.kind != 'def') {
        return
      }

      this.insideInitDefs.push(expr.name)
      walkDefinition(this, def as QuintDef)
    }
  }

  enterApp(app: QuintApp) {
    if (this.insideInit > 0) {
      const def = this.lookupTable.get(app.id)
      if (!def || def.kind != 'def') {
        return
      }

      this.insideInitDefs.push(app.opcode)
      walkDefinition(this, def as QuintDef)
    }
  }
}

class InitConverter implements IRTransformer {
  errors: QuintError[] = []
  private insideInit = 0
  private insideInitDefs: String[]
  private lookupTable: LookupTable
  private modes: Map<bigint, OpQualifier>

  constructor(insideInitDefs: String[], lookupTable: LookupTable, modes: Map<bigint, OpQualifier>) {
    this.insideInitDefs = insideInitDefs
    this.lookupTable = lookupTable
    this.modes = modes
  }

  enterDef(def: QuintDef): QuintDef {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit++
    }

    return def
  }

  exitDef(def: QuintDef): QuintDef {
    if (this.insideInitDefs.includes(def.name)) {
      this.insideInit--
    }

    return def
  }

  enterApp(app: QuintApp): QuintApp {
    this.checkMixedUsage(app.id, app.opcode)
    if (this.insideInit && app.opcode == 'assign') {
      return { ...app, opcode: 'eq' }
    }

    return app
  }

  enterName(expr: QuintName): QuintName {
    this.checkMixedUsage(expr.id, expr.name)

    return expr
  }

  private checkMixedUsage(id: bigint, name: string) {
    if (this.insideInit == 0 && this.insideInitDefs.includes(name) && this.hasAssignment(id)) {
      this.errors.push({
        code: 'QNT409',
        message: `Action ${name} is used both for init and for step, and therefore can't be converted into TLA+. You can duplicate this with a different name to use on init. Sorry Quint can't do it for you yet.`,
        reference: id,
      })
    }
  }

  private hasAssignment(id: bigint): boolean {
    const def = this.lookupTable.get(id)
    if (!def) {
      return false
    }

    const mode = this.modes.get(def.id)!
    if (mode == 'action') {
      // The mode checker says the mode should be action
      return true
    }

    if (mode == undefined) {
      // The mode checker doesn't have suggestions, so the annotation is correct
      return def.kind == 'def' && def.qualifier == 'action'
    }

    // Mode is not action
    return false
  }
}
