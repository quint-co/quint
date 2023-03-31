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

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { LookupTable } from '../lookupTable'
import { expressionToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { QuintApp, QuintBool, QuintConst, QuintEx, QuintInt, QuintLambda, QuintLet, QuintModule, QuintName, QuintOpDef, QuintStr, QuintVar } from '../quintIr'
import { Effect, EffectScheme, Signature, effectNames, toScheme, unify } from './base'
import { Substitutions, applySubstitution, compose } from './substitutions'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree, errorTreeToString } from '../errorTree'
import { getSignatures, standardPropagation } from './builtinSignatures'
import { FreshVarGenerator } from '../FreshVarGenerator'
import { effectToString } from './printing'
import { zip } from 'lodash'

export type EffectInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, EffectScheme>]

/* Walks the IR from node to root inferring effects for expressions and
 * assigning them to the effects attribute map, to be used in upward
 * expressions. Errors are written to the errors attribute.
 */
export class EffectInferrer implements IRVisitor {
  constructor(lookupTable: LookupTable) {
    this.lookupTable = lookupTable
    this.freshVarGenerator = new FreshVarGenerator()
  }

  /**
   * Infers an effect for every expression in a module based on
   * the definitions table for that module
   *
   * @param module: the Quint module to infer effects for
   *
   * @returns a map from expression ids to their effects and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferEffects(module: QuintModule): EffectInferenceResult {
    walkModule(this, module)
    return [this.errors, this.effects]
  }

  // Public values with results by expression ID
  private effects: Map<bigint, EffectScheme> = new Map<bigint, EffectScheme>()
  private errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()

  private substitutions: Substitutions = []

  private builtinSignatures: Map<string, Signature> = getSignatures()
  private lookupTable: LookupTable
  private freshVarGenerator: FreshVarGenerator

  // Track location descriptions for error tree traces
  private location: string = ''

  enterExpr(e: QuintEx) {
    this.location = `Inferring effect for ${expressionToString(e)}`
  }

  /* { kind: 'const', identifier: c } ∈ Γ
   * ------------------------------------- (NAME-CONST)
   *       Γ ⊢ c: Pure
   */
  exitConst(def: QuintConst) {
    const pureEffect: Effect = { kind: 'concrete', components: [] }

    if (def.typeAnnotation.kind === 'oper') {
      // Operators need to have arrow effects of proper arity
      this.addToResults(def.id, right(standardPropagation(def.typeAnnotation.args.length)))
      return
    }

    this.addToResults(def.id, right(toScheme(pureEffect)))
  }

  /*  { kind: 'var', identifier: v } ∈ Γ
   * ------------------------------------ (NAME-VAR)
   *          Γ ⊢ v: Read[v]
   */
  exitVar(def: QuintVar) {
    const effect: Effect = {
      kind: 'concrete', components: [{ kind: 'read', entity: { kind: 'concrete', stateVariables: [{ name: def.name, reference: def.id }] } }],
    }
    this.addToResults(def.id, right(toScheme(effect)))
  }

  /* { identifier: op, effect: E } ∈ Γ
   * -------------------------------------- (NAME-OP)
   *           Γ ⊢ op: E
   */
  exitName(expr: QuintName): void {
    if (this.errors.size > 0) {
      // Don't try to infer application if there are errors with the args
      return
    }
    this.addToResults(expr.id, this.effectForName(expr.name, expr.id, 2).map(toScheme))
  }

  /* { identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
   * Eres <- freshVar   S = unify(E, (E0, ...,  EN) => Eres)
   * ------------------------------------------------------ (APP)
   *           Γ ⊢ op(p0, ..., pn): S(Eres)
   */
  exitApp(expr: QuintApp): void {
    if (this.errors.size > 0) {
      // Don't try to infer application if there are errors with the args
      return
    }

    this.location = `Trying to infer effect for operator application in ${expressionToString(expr)}`
    const paramsResult = mergeInMany(expr.args.map((a: QuintEx) => {
      return this.fetchResult(a.id).map(e => this.newInstance(e))
    }))

    const resultEffect: Effect = { kind: 'variable', name: this.freshVarGenerator.freshVar('e') }
    const arrowEffect = paramsResult.map(params => {
      const effect: Effect = {
        kind: 'arrow',
        params,
        result: resultEffect,
      }

      return effect
    })

    this.effectForName(expr.opcode, expr.id, expr.args.length)
      .mapLeft(err => buildErrorTree(this.location, err))
      .chain(signature => {
        const substitution = arrowEffect.chain(effect => unify(signature, effect))

        const resultEffectWithSubs = substitution
          .chain(s => compose(this.substitutions, s))
          .chain(s => {
            this.substitutions = s

            paramsResult.map(effects =>
              zip(effects, expr.args.map(a => a.id)).forEach(([effect, id]) => {
                if (!effect || !id) {
                  // Impossible: effects and expr.args are the same length
                  throw new Error(`Expected ${expr.args.length} effects, but got ${effects.length}`)
                }

                const r = applySubstitution(s, effect).map(toScheme)
                this.addToResults(id, r)
              })
            )

            return applySubstitution(s, resultEffect)
          })

        return resultEffectWithSubs
      }).map(effect => {
        this.addToResults(expr.id, right(toScheme(effect)))
      }).mapLeft(err => {
        this.addToResults(expr.id, left(err))
      })

  }

  // Literals are always Pure
  exitLiteral(expr: QuintBool | QuintInt | QuintStr): void {
    this.addToResults(expr.id, right(toScheme({
      kind: 'concrete', components: [],
    })))
  }

  /*                        Γ ⊢ e: E
   * ------------------------------------------------------------- (OPDEF)
   * Γ ∪ { identifier: op, effect: E } ⊢ (def op(params) = e): Pure
   */
  exitOpDef(def: QuintOpDef): void {
    if (this.errors.size > 0) {
      // Don't try to infer let if there are errors with the defined expression
      return
    }
    const result = this.fetchResult(def.expr.id)

    // Set the expression effect as the definition effect for it to be available at the result
    this.addToResults(def.id, result)
  }

  /*     Γ ⊢ e: E
   * ----------------------- (LET)
   * Γ ⊢ <opdef> { e }: E
   */
  exitLet(expr: QuintLet): void {
    if (this.errors.size > 0) {
      // Don't try to infer let if there are errors with the defined expression
      return
    }
    const e = this.fetchResult(expr.expr.id)

    this.addToResults(expr.id, e)
  }

  enterLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      const varName = p.name === '_' ? this.freshVarGenerator.freshVar('e') : `e_${p.name}_${p.id}`
      this.addToResults(p.id, right(toScheme({ kind: 'variable', name: varName })))
    })
  }

  /*                  Γ ⊢ e: E
   * ---------------------------------------------- (LAMBDA)
   * Γ ⊢ (p0, ..., pn) => e: (E0, ..., En) => E
   */
  exitLambda(lambda: QuintLambda): void {
    if (this.errors.size > 0) {
      return
    }
    const exprResult = this.fetchResult(lambda.expr.id)
    const params = mergeInMany(lambda.params.map(p => {
      const result = this.fetchResult(p.id)
        .map(e => this.newInstance(e))
        .chain(e => applySubstitution(this.substitutions, e))

      this.addToResults(p.id, result.map(toScheme))
      return result
    }))

    exprResult
      .chain(resultEffect => {
        return params.map((ps): EffectScheme => {
          return { ...resultEffect, effect: { kind: 'arrow', params: ps, result: resultEffect.effect } }
        })
      })
      .map(this.newInstance)
      .chain(effect => applySubstitution(this.substitutions, effect))
      .map(effect => {
        if (effect.kind !== 'arrow') {
          // Impossible
          throw new Error(`Arrow effect after substitution should be an arrow: ${effectToString(effect)}`)
        }

        const nonFreeNames = effect.params.reduce((names, p) => {
          const { effectVariables: effectVariables, entityVariables: entityVariables } = effectNames(p)
          return {
            effectVariables: new Set([...names.effectVariables, ...effectVariables]),
            entityVariables: new Set([...names.entityVariables, ...entityVariables]),
          }
        }, { effectVariables: new Set<string>(), entityVariables: new Set<string>() })

        this.addToResults(lambda.id, right({ ...nonFreeNames, effect }))
      })
      .mapLeft(err => {
        this.addToResults(lambda.id, left(err))
      })
  }

  private addToResults(exprId: bigint, result: Either<Error, EffectScheme>) {
    result
      .mapLeft(err => this.errors.set(exprId, buildErrorTree(this.location, err)))
      .map(r => this.effects.set(exprId, r))
  }

  private fetchResult(id: bigint): Either<ErrorTree, EffectScheme> {
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

  private effectForName(name: string, nameId: bigint, arity: number): Either<ErrorTree, Effect> {
    // Assumes a valid number of arguments

    if (this.builtinSignatures.has(name)) {
      const signatureFunction = this.builtinSignatures.get(name)!
      const signature = signatureFunction(arity)
      return right(this.newInstance(signature))
    } else {
      const def = this.lookupTable.get(nameId)
      const id = def?.reference
      if (!def || !id) {
        return left(buildErrorLeaf(this.location, `Signature not found for name: ${name}`))
      }

      return this.fetchResult(id).map(e => {
        return this.newInstance(e)
      })
    }
  }

  private newInstance(effect: EffectScheme): Effect {
    const effectSubs: Substitutions = [...effect.effectVariables].map(name => {
      return { kind: 'effect', name: name, value: { kind: 'variable', name: this.freshVarGenerator.freshVar('e') } }
    })
    const entitySubs: Substitutions = [...effect.entityVariables].map(name => {
      return { kind: 'entity', name: name, value: { kind: 'variable', name: this.freshVarGenerator.freshVar('v') } }
    })

    const result = compose(effectSubs, entitySubs).chain(s => applySubstitution(s, effect.effect))

    if (result.isLeft()) {
      throw new Error(`Error applying fresh names substitution: ${errorTreeToString(result.value)} `)
    } else {
      return result.value
    }
  }
}
