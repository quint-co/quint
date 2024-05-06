import { IRVisitor, walkDeclaration } from '../ir/IRVisitor'
import { OpQualifier, QuintApp, QuintDeclaration, QuintLet, QuintOpDef } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { QuintError } from '../quintError'
import { TypeScheme } from '../types/base'

export class NondetChecker implements IRVisitor {
  private table: LookupTable
  private types: Map<bigint, TypeScheme> = new Map()
  private lastDefQualifier: OpQualifier = 'def'

  private errors: Map<bigint, QuintError> = new Map()

  constructor(table: LookupTable) {
    this.table = table
  }

  /**
   * Checks effects for multiple updates of the same state variable.
   *
   * @param effects the effects to look for multiple updates on
   *
   * @returns a map of errors, where the key is the variable id
   */
  checkNondets(types: Map<bigint, TypeScheme>, declarations: QuintDeclaration[]): Map<bigint, QuintError> {
    this.types = types

    declarations.forEach(d => walkDeclaration(this, d))
    return this.errors
  }

  enterOpDef(def: QuintOpDef) {
    this.lastDefQualifier = def.qualifier

    if (def.qualifier === 'nondet' && this.table.get(def.id)!.depth === 0) {
      this.errors.set(def.id, {
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
      this.errors.set(app.id, {
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
      this.errors.set(body.id, {
        code: 'QNT204',
        message: `'oneOf' must be the outtermost expression in a nondet definition`,
        reference: body.id,
        data: {},
      })
    }

    // if the opdef is nondet, the return type must be bool
    const expressionType = this.types.get(expr.expr.id)
    if (expressionType?.type.kind !== 'bool') {
      this.errors.set(expr.id, {
        code: 'QNT205',
        message: `nondet bindings can only be used with boolean expressions`,
        reference: expr.id,
        data: {},
      })
    }
  }
}
