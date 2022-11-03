/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Inference for effects. Walks through a module and infers effects for all expressions.
 * See ADR 0004 for additional information
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, right, left, mergeInMany } from '@sweet-monads/either'
import { LookupTable, LookupTableByModule, lookupValue, newTable } from '../lookupTable'
import { expressionToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { TntApp, TntBool, TntEx, TntInt, TntLambda, TntLet, TntModule, TntModuleDef, TntName, TntOpDef, TntStr } from '../tntIr'
import { Effect, emptyVariables, unify, Signature, effectNames, Name } from './base'
import { applySubstitution, Substitutions, compose } from './substitutions'
import { buildErrorLeaf, buildErrorTree, ErrorTree, errorTreeToString, Error } from '../errorTree'
import { ScopeTree, treeFromModule } from '../scoping'
import isEqual from 'lodash.isequal'

/**
 * Infers an effect for every expression in a module based on predefined
 * builtinSignatures and the definitions table for that module
 *
 * @param builtinSignatures a map from operator identifiers to their effect signature
 * @param lookupTable the collected definitions for the module under inference
 * @param module: the TNT module to infer effects for
 *
 * @returns a map from expression ids to their effects when inferrence succeeds.
 *          Otherwise, a map from expression ids to the corresponding error for
 *          the problematic expressions.
 */
export function inferEffects (builtinSignatures: Map<string, Signature>, lookupTable: LookupTableByModule, module: TntModule): Either<Map<bigint, ErrorTree>, Map<bigint, Effect>> {
  const visitor = new EffectInferrerVisitor(builtinSignatures, lookupTable)
  walkModule(visitor, module)
  if (visitor.errors.size > 0) {
    return left(visitor.errors)
  } else {
    return right(visitor.effects)
  }
}

/* Walks the IR from node to root inferring effects for expressions and
 * assigning them to the effects attribute map, to be used in upward
 * expressions. Errors are written to the errors attribute.
 */
class EffectInferrerVisitor implements IRVisitor {
  constructor (builtinSignatures: Map<string, Signature>, lookupTable: LookupTableByModule) {
    this.builtinSignatures = builtinSignatures
    this.lookupTable = lookupTable
  }

    // Public values with results by expression ID
    effects: Map<bigint, Effect> = new Map<bigint, Effect>()
    errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()

    private substitutions: Substitutions = []

    private builtinSignatures: Map<string, Signature>
    private lookupTable: LookupTableByModule
    private freshVarCounters: Map<string, number> = new Map<string, number>()

    // Track location descriptions for error tree traces
    private location: string = ''

    private currentModule?: TntModule
    private currentTable: LookupTable = newTable({})
    private currentScopeTree: ScopeTree = { value: 0n, children: [] }
    private moduleStack: TntModule[] = []

    enterModuleDef (def: TntModuleDef): void {
      this.moduleStack.push(def.module)

      this.updateCurrentModule()
    }

    exitModuleDef (_: TntModuleDef): void {
      this.moduleStack.pop()

      this.updateCurrentModule()
    }

    enterExpr (e: TntEx) {
      this.location = `Inferring effect for ${expressionToString(e)}`
    }

    exitName (expr: TntName): void {
      if (this.errors.size > 0) {
        // Don't try to infer application if there are errors with the args
        return
      }
      const def = lookupValue(this.currentTable, this.currentScopeTree, expr.name, expr.id)

      switch (def?.kind) {
        case 'param': {
          /*  { kind: 'param', identifier: p } ∈ Γ
           * ------------------------------------ (NAME-PARAM)
           *          Γ ⊢ v: Read[r_p]
           */
          let result: Either<Error, Effect>
          if (def.reference) {
            result = right({ kind: 'quantified', name: `e_${expr.name}_${def.reference}` })
          } else {
            result = left(buildErrorLeaf(
              this.location,
               `Couldn't find an effect for lambda parameter named ${expr.name} in context.`
            ))
          }

          this.addToResults(expr.id, result)
          break
        }
        case 'const': {
          /* { kind: 'const', identifier: c } ∈ Γ
           * ------------------------------------- (NAME-CONST)
           *       Γ ⊢ c: Pure
           */
          const effect: Effect = {
            kind: 'concrete', read: emptyVariables, update: emptyVariables, temporal: emptyVariables,
          }
          this.addToResults(expr.id, right(effect))
          break
        }
        case 'var': {
          /*  { kind: 'var', identifier: v } ∈ Γ
           * ------------------------------------ (NAME-VAR)
           *          Γ ⊢ v: Read[v]
           */
          const effect: Effect = {
            kind: 'concrete', read: { kind: 'concrete', vars: [expr.name] }, update: emptyVariables, temporal: emptyVariables,
          }
          this.addToResults(expr.id, right(effect))
          break
        }
        case 'val':
        case 'def': {
          if (!def.reference) {
            this.addToResults(expr.id, left(buildErrorLeaf(
              this.location,
              `Couldn't find an effect for ${def.kind} named ${expr.name} in context. Looked for id: ${def.reference}.`
            )))
            return
          }
          this.addToResults(expr.id, this.fetchResult(def.reference))
          break
        }
        default: {
          /* { identifier: op, effect: E } ∈ Γ
           * -------------------------------------- (NAME-OP)
           *           Γ ⊢ op: E
           */
          const result = this.fetchSignature(expr.name, expr.id, 2)
            .mapLeft(err => buildErrorTree(this.location, err))

          this.addToResults(expr.id, result)
        }
      }
    }

    /* { identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
     * Eres <- freshVar   S = unify(E, (E0, ...,  EN) => Eres)
     * ------------------------------------------------------ (APP)
     *           Γ ⊢ op(p0, ..., pn): S(Eres)
     */
    exitApp (expr: TntApp): void {
      if (this.errors.size > 0) {
        // Don't try to infer application if there are errors with the args
        return
      }

      this.location = `Trying to infer effect for operator application in ${expressionToString(expr)}`

      const paramsResult = mergeInMany(expr.args.map((a: TntEx) => {
        return this.fetchResult(a.id)
      }))

      const resultEffect: Effect = { kind: 'quantified', name: this.freshVar('e') }
      const arrowEffect = paramsResult.map(params => {
        const effect: Effect = {
          kind: 'arrow',
          params: params,
          result: resultEffect,
        }

        return effect
      })

      const result = this.fetchSignature(expr.opcode, expr.id, expr.args.length)
        .mapLeft(err => buildErrorTree(this.location, err))
        .chain(signature => {
          const substitution = arrowEffect.chain(effect => unify(signature, effect))

          const resultEffectWithSubs = substitution
            .chain(s => compose(s, this.substitutions))
            .chain(s => {
              this.substitutions = s

              this.effects.forEach((effect, id) => {
                const r = applySubstitution(s, effect)
                this.addToResults(id, r)
              })

              return applySubstitution(s, resultEffect)
            })

          return resultEffectWithSubs
        })

      this.addToResults(expr.id, result)
    }

    // Literals are always Pure
    exitLiteral (expr: TntBool | TntInt | TntStr): void {
      this.addToResults(expr.id, right({
        kind: 'concrete',
        read: emptyVariables,
        update: emptyVariables,
        temporal: emptyVariables,
      }))
    }

    /*                        Γ ⊢ e: E
     * ------------------------------------------------------------- (OPDEF)
     * Γ ∪ { identifier: op, effect: E } ⊢ (def op(params) = e): Pure
     */
    exitOpDef (def: TntOpDef): void {
      if (this.errors.size > 0) {
        // Don't try to infer let if there are errors with the defined expression
        return
      }
      const e = this.fetchResult(def.expr.id)!

      // Set the expression effect as the definition effect for it to be available at the result
      this.addToResults(def.id, e)
    }

    /*     Γ ⊢ e: E
     * ----------------------- (LET)
     * Γ ⊢ <opdef> { e }: E
     */
    exitLet (expr: TntLet): void {
      if (this.errors.size > 0) {
        // Don't try to infer let if there are errors with the defined expression
        return
      }
      const e = this.fetchResult(expr.expr.id)!

      this.addToResults(expr.id, e)
    }

    /*                  Γ ⊢ e: E
     * ---------------------------------------------- (LAMBDA)
     * Γ ⊢ (p0, ..., pn) => e: (E0, ..., En) => E
     */
    exitLambda (e: TntLambda): void {
      if (this.errors.size > 0) {
        return
      }
      const exprResult = this.fetchResult(e.expr.id)
      const params = mergeInMany(e.params.map(p => {
        return this.fetchSignature(p, e.expr.id, 2)
          .chain(e => applySubstitution(this.substitutions, e))
      }))

      if (exprResult.isLeft() || params.isLeft()) {
        return
      }

      const result = exprResult.chain(resultEffect => {
        return params.map((ps): Effect => {
          return { kind: 'arrow', params: ps, result: resultEffect }
        })
      })

      this.addToResults(e.id, result)
    }

    private addToResults (exprId: bigint, result: Either<Error, Effect>) {
      result
        .mapLeft(err => this.errors.set(exprId, buildErrorTree(this.location, err)))
        .map(r => this.effects.set(exprId, r))
    }

    private fetchResult (id: bigint): Either<ErrorTree, Effect> {
      const successfulResult = this.effects.get(id)
      const failedResult = this.errors.get(id)
      if (failedResult) {
        return left(failedResult)
      } else if (successfulResult) {
        return right(successfulResult)
      } else {
        throw new Error(`Couldn't find any result for id ${id} while ${this.location}`)
      }
    }

    private freshVar (prefix: string): string {
      const counter = this.freshVarCounters.get(prefix)! ?? 0
      this.freshVarCounters.set(prefix, counter + 1)

      return `${prefix}${counter}`
    }

    private fetchSignature (opcode: string, scope: bigint, arity: number): Either<ErrorTree, Effect> {
      // Assumes a valid number of arguments
      let effect
      if (this.builtinSignatures.has(opcode)) {
        const signatureFunction = this.builtinSignatures.get(opcode)!
        effect = signatureFunction(arity)
        return right(this.newInstance(effect))
      } else {
        const def = lookupValue(this.currentTable, this.currentScopeTree, opcode, scope)
        const id = def?.reference
        if (!def || !id) {
          return left(buildErrorLeaf(this.location, `Signature not found for name: ${opcode}`))
        }

        if (def.kind === 'param') {
          return right({ kind: 'quantified', name: `e_${opcode}_${id}` })
        }

        return this.fetchResult(id).map(e => {
          if (e.kind === 'arrow') {
            return this.newInstance(e)
          } else {
            return e
          }
        })
      }
    }

    private newInstance (effect: Effect): Effect {
      const names: Name[] = effectNames(effect)
      const uniqueNames: Name[] = []
      names.forEach(name => {
        if (!uniqueNames.some(n => isEqual(n, name))) {
          uniqueNames.push(name)
        }
      })
      const subs: Substitutions = uniqueNames.map(name => {
        return { kind: name.kind, name: name.name, value: { kind: 'quantified', name: this.freshVar('v') } }
      })

      const result = applySubstitution(subs, effect)
      if (result.isLeft()) {
        throw new Error(`Error applying fresh names substitution: ${errorTreeToString(result.value)} `)
      } else {
        return result.value
      }
    }

    private updateCurrentModule (): void {
      if (this.moduleStack.length > 0) {
        this.currentModule = this.moduleStack[this.moduleStack.length - 1]

        const moduleTable = this.lookupTable.get(this.currentModule!.name)!
        this.currentTable = moduleTable
        this.currentScopeTree = treeFromModule(this.currentModule)
      }
    }
}
