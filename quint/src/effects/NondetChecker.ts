/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Checking for the misuse of 'nondet' and 'oneOf'. Necessary to ensure they are
 * compatible with the exists operator from TLA+.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkDeclaration } from '../ir/IRVisitor'
import { OpQualifier, QuintApp, QuintDeclaration, QuintLet, QuintOpDef } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { QuintError } from '../quintError'
import { TypeScheme } from '../types/base'

export class NondetChecker implements IRVisitor {
  private table: LookupTable
  private types: Map<bigint, TypeScheme> = new Map()
  private lastDefQualifier: OpQualifier = 'def'

  private errors: QuintError[] = []

  constructor(table: LookupTable) {
    this.table = table
  }

  /**
   * Checks declarations for misuse of 'nondet' and 'oneOf'.
   *
   * @param types - the types of the declarations
   * @param declarations - the declarations to check
   *
   * @returns a list of errors (empty if no errors are found)
   */
  checkNondets(types: Map<bigint, TypeScheme>, declarations: QuintDeclaration[]): QuintError[] {
    this.types = types

    declarations.forEach(d => walkDeclaration(this, d))
    return this.errors
  }

  enterOpDef(def: QuintOpDef) {
    this.lastDefQualifier = def.qualifier

    if (def.qualifier === 'nondet' && this.table.get(def.id)!.depth === 0) {
      this.errors.push({
        code: 'QNT206',
        message: `'nondet' can only be used inside actions, not at the top level`,
        reference: def.id,
        data: {},
      })
    }
  }

  enterApp(app: QuintApp) {
    if (app.opcode !== 'oneOf') {
      // nothing to check
      return
    }

    if (this.lastDefQualifier !== 'nondet') {
      this.errors.push({
        code: 'QNT203',
        message: `'oneOf' must be used inside a nondet definition`,
        reference: app.id,
        data: {},
      })
      return
    }
  }

  enterLet(expr: QuintLet) {
    if (expr.opdef.qualifier !== 'nondet') {
      return
    }

    // body of nondet must be an application of oneOf
    const body = expr.opdef.expr
    if (body.kind !== 'app' || body.opcode !== 'oneOf') {
      this.errors.push({
        code: 'QNT204',
        message: `'oneOf' must be the outtermost expression in a nondet definition`,
        reference: body.id,
        data: {},
      })
    }

    // if the opdef is nondet, the return type must be bool
    const expressionType = this.types.get(expr.expr.id)
    if (expressionType?.type.kind !== 'bool') {
      this.errors.push({
        code: 'QNT205',
        message: `nondet bindings can only be used with boolean expressions`,
        reference: expr.id,
        data: {},
      })
    }
  }
}
