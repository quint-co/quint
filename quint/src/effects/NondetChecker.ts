import { IRVisitor, walkDeclaration } from '../ir/IRVisitor'
import { OpQualifier, QuintApp, QuintDeclaration, QuintLet, QuintOpDef } from '../ir/quintIr'
import { QuintError } from '../quintError'
import { TypeScheme } from '../types/base'

export class NondetChecker implements IRVisitor {
  private lastDefQualifier: OpQualifier = 'def'
  private types: Map<bigint, TypeScheme> = new Map()

  private errors: Map<bigint, QuintError> = new Map()

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
