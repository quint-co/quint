/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Constraint generation for TNT's type system
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from '../IRVisitor'
import { TntApp, TntBool, TntConst, TntEx, TntInt, TntLambda, TntLet, TntModule, TntName, TntOpDef, TntStr, TntVar } from '../tntIr'
import { TntType } from '../tntTypes'
import { expressionToString } from '../IRprinting'
import { solveConstraint, typeNames } from './constraintSolver'
import { Either, right, left, mergeInMany } from '@sweet-monads/either'
import { buildErrorTree, ErrorTree, Error } from '../errorTree'
import { getSignatures } from './builtinSignatures'
import { Constraint, Signature, TypeScheme } from './base'
import { Substitutions, applySubstitution, applySubstitutionToConstraint } from './substitutions'

// export function generateConstraint (tntModule: TntModule): Either<Map<bigint, ErrorTree>, Constraint> {
// }

export class ConstraintGeneratorVisitor implements IRVisitor {
  expressionResults: Map<bigint, [TntType, Constraint]> = new Map<bigint, [TntType, Constraint]>()
  errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()
  private freshVarCounter: number = 0
  private context: Map<string, Signature> = getSignatures()
  private location: string = ''

  private setResult (exprId: bigint, result: Either<Error, [TntType, Constraint]>) {
    result
      .mapLeft(err => this.errors.set(exprId, buildErrorTree(this.location, err)))
      .map(r => this.expressionResults.set(exprId, r))
  }

  enterExpr (e: TntEx) {
    this.location = `Generating constraints for ${expressionToString(e)}`
  }

  exitVar (e: TntVar) {
    this.context.set(e.name, (_) => ({ type: e.type, variables: new Set() }))
  }

  exitConst (e: TntConst) {
    this.context.set(e.name, (_) => ({ type: e.type, variables: new Set() }))
  }

  //   n: t ∈ Γ
  // ----------------- (NAME)
  //  Γ ⊢ n: (t, true)
  enterName (e: TntName) {
    if (this.errors.size !== 0) {
      return
    }
    this.setResult(
      e.id,
      this.fetchSignature(e.name, 2).map(t => [t, { kind: 'empty' }])
    )
  }

  // Literals have always the same type and the empty constraint
  enterLiteral (e: TntBool | TntInt | TntStr) {
    this.expressionResults.set(e.id, [{ kind: e.kind }, { kind: 'empty' }])
  }

  //   op: q ∈ Γ   Γ ⊢  p0, ..., pn: (t0, c0), ..., (tn, cn)   a is fresh
  // ------------------------------------------------------------------------ (APP)
  //    Γ ⊢ op(p0, ..., pn): (a, q ~ (t0, ..., tn) => a ∧ c0 ∧ ... ∧ cn)
  exitApp (e: TntApp) {
    if (this.errors.size !== 0) {
      return
    }
    const result = this.fetchSignature(e.opcode, e.args.length)
      .chain(t1 => {
        const argsResult: Either<Error, [TntType, Constraint][]> = mergeInMany(e.args.map(e => this.fetchResult(e)))

        return argsResult
          .map((argConstraints: [TntType, Constraint][]): [TntType, Constraint] => {
            const a: TntType = { kind: 'var', name: this.freshVar() }
            const t2: TntType = { kind: 'oper', args: argConstraints.map(([t, _]) => t), res: a }
            const c: Constraint = { kind: 'eq', types: [t1, t2], sourceId: e.id }
            const cs: Constraint = { kind: 'conjunction', constraints: [...argConstraints.map(([_, c]) => c), c], sourceId: e.id }
            return [a, cs]
          })
      })

    this.setResult(e.id, result)
  }

  //    Γ ∪ {p0: t0, ..., pn: tn} ⊢ e: (te, c)    t0, ..., tn are fresh
  // ---------------------------------------------------------------------- (LAMBDA)
  //            Γ ⊢ (p0, ..., pn) => e: ((t0, ..., tn) => te, c)
  enterLambda (e: TntLambda) {
    e.params.forEach(p => {
      const t: TntType = { kind: 'var', name: this.freshVar() }
      this.context.set(p, (_) => ({ type: t, variables: new Set() }))
    })
  }

  exitLambda (e: TntLambda) {
    if (this.errors.size !== 0) {
      return
    }
    const result = this.fetchResult(e.expr)
      .chain(([resultType, c]) => {
        const paramTypes = mergeInMany(e.params.map(p => this.fetchSignature(p, 2)))
        return paramTypes.map((ts): [TntType, Constraint] => {
          const t: TntType = { kind: 'oper', args: ts, res: resultType }
          return [t, c]
        }).mapLeft(e => e.join(','))
      })

    this.setResult(e.id, result)

    e.params.forEach(p => {
      this.context.delete(p)
    })
  }

  //   Γ ⊢ e1: (t1, c1)  s = solve(c1)     s(Γ ∪ {n: t1}) ⊢ e2: (t2, c2)
  // ------------------------------------------------------------------------ (LET-OPDEF)
  //               Γ ⊢ val n = e1 { e2 }: (t2, c1 ∧ c2)
  exitLet (e: TntLet) {
    if (this.errors.size !== 0) {
      return
    }
    // TODO: Consider annotations
    // TODO: Occurs check on operator body to prevent recursion
    const result = this.fetchResult(e.opdef.expr).chain(([opType, opConstraint]) => {
      this.context.set(e.opdef.name, (_) => ({ type: opType, variables: new Set() }))
      const r: Either<ErrorTree, [TntType, Constraint]> = this.fetchResult(e.expr)
        .map(([t, c]) => [t, { kind: 'conjunction', constraints: [opConstraint, c], sourceId: e.id }])
      this.context.delete(e.opdef.name)
      return r
    })

    this.setResult(e.id, result)
  }

  exitOpDef (e: TntOpDef) {
    if (this.errors.size !== 0) {
      return
    }

    this.fetchResult(e.expr)
      .map(([t, c]) => {
        const result: [TntType, Constraint] = [t, c]
        this.setResult(e.id, right(result))

        const constraints = Array.from(this.expressionResults.values()).map(([_, c]) => c)
        const constraint: Constraint = { kind: 'conjunction', constraints: constraints, sourceId: BigInt(0) }
        const solvingResult = solveConstraint(constraint)
        return solvingResult
          .map((subs) => {
            // Apply substitution to environment and remove solved constraints
            this.expressionResults = new Map<bigint, [TntType, Constraint]>(
              Array.from(this.expressionResults.entries()).map(([id, [te, _]]) => [
                id,
                [applySubstitution(subs, te), { kind: 'empty' }],
              ]))

            // Add specified type for operator to the context
            const [t2, _] = this.expressionResults.get(e.id)!
            this.context.set(e.name, (_) => ({ type: t2, variables: typeNames(t2) }))
          }).mapLeft(err => this.errors = new Map<bigint, ErrorTree>([...this.errors.entries(), ...err.entries()]))
      }).mapLeft(err => this.errors.set(e.id, err))
  }

  private fetchResult (e: TntEx): Either<ErrorTree, [TntType, Constraint]> {
    const successfulResult = this.expressionResults.get(e.id)!
    const failedResult = this.errors.get(e.id)!
    if (failedResult) {
      return left(failedResult)
    } else if (successfulResult) {
      return right(successfulResult)
    } else {
      throw new Error(`Couldn't find any result for ${expressionToString(e)}`)
    }
  }

  private freshVar (): string {
    return `t${this.freshVarCounter++}`
  }

  private fetchSignature (opcode: string, arity: number): Either<string, TntType> {
    // Assumes a valid number of arguments
    if (!this.context.get(opcode)) {
      return left(`Signature not found for operator: ${opcode}`)
    }
    const signatureFunction = this.context.get(opcode)!
    const signature = signatureFunction(arity)
    return right(this.newInstance(signature))
  }

  private newInstance (type: TypeScheme): TntType {
    const names = type.variables
    const subs: Substitutions = Array.from(names).map(name => {
      return { name: name, value: { kind: 'var', name: this.freshVar() } }
    })

    return applySubstitution(subs, type.type)
  }
}
