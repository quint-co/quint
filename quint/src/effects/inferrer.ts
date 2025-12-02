/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
import { LookupTable } from '../names/base'
import { expressionToString } from '../ir/IRprinting'
import { IRVisitor, walkDeclaration } from '../ir/IRVisitor'
import {
  QuintApp,
  QuintBool,
  QuintConst,
  QuintDeclaration,
  QuintEx,
  QuintInt,
  QuintLambda,
  QuintLet,
  QuintName,
  QuintOpDef,
  QuintStr,
  QuintVar,
} from '../ir/quintIr'
import { Effect, EffectScheme, Signature, effectNames, entityNames, toScheme, unify } from './base'
import { Substitutions, applySubstitution, compose } from './substitutions'
import { Error, ErrorTree, buildErrorLeaf, buildErrorTree, errorTreeToString } from '../errorTree'
import { getSignatures, standardPropagation } from './builtinSignatures'
import { FreshVarGenerator } from '../FreshVarGenerator'
import { effectToString } from './printing'
import { zip } from '../util'
import { addNamespaces } from './namespaces'

export type EffectInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, EffectScheme>]

/* Walks the IR from node to root inferring effects for expressions and
 * assigning them to the effects attribute map, to be used in upward
 * expressions. Errors are written to the errors attribute.
 */
export class EffectInferrer implements IRVisitor {
  constructor(lookupTable: LookupTable, effects?: Map<bigint, EffectScheme>) {
    this.lookupTable = lookupTable
    this.freshVarGenerator = new FreshVarGenerator()
    if (effects) {
      this.effects = effects
    }
  }

  /**
   * Infers an effect for every expression in a module based on the definitions
   * table for that module. If there are missing effects in the effect map,
   * there will be at least one error.
   *
   * @param declarations: the list of QuintDeclarations to infer effects for
   *
   * @returns a map from expression ids to their effects and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferEffects(declarations: QuintDeclaration[]): EffectInferenceResult {
    declarations.forEach(decl => {
      walkDeclaration(this, decl)
    })
    return [this.errors, this.effects]
  }

  private effects: Map<bigint, EffectScheme> = new Map<bigint, EffectScheme>()
  private errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()

  private substitutions: Substitutions = []

  private builtinSignatures: Map<string, Signature> = getSignatures()
  private lookupTable: LookupTable
  private freshVarGenerator: FreshVarGenerator

  // Track location descriptions for error tree traces
  private location: string = ''

  // A stack of free effect variables and entity variables for lambda expressions.
  // Nested lambdas add new entries to the stack, and pop them when exiting.
  private freeNames: { effectVariables: Set<string>; entityVariables: Set<string> }[] = []

  // the current depth of operator definitions: top-level defs are depth 0
  // FIXME(#1279): The walk* functions update this value, but they need to be
  // initialized to -1 here for that to work on all scenarios.
  definitionDepth: number = -1

  enterExpr(e: QuintEx) {
    this.location = `Inferring effect for ${expressionToString(e)}`
  }

  exitConst(def: QuintConst) {
    const pureEffect: Effect = { kind: 'concrete', components: [] }

    if (def.typeAnnotation.kind === 'oper') {
      // Operators need to have arrow effects of proper arity

      // type annotation for c is oper with n args
      // --------------------------------------------------------(CONST - OPER)
      // Γ ⊢ const c: propagateComponents(['read', 'temporal'])(n)
      this.addToResults(def.id, right(standardPropagation(def.typeAnnotation.args.length)))
      return
    }

    //   type annotation for c is not oper
    // ------------------------------------- (CONST-VAL)
    //       Γ ⊢ const c: Pure
    this.addToResults(def.id, right(toScheme(pureEffect)))
  }

  // -------------------------------------- (VAR)
  //       Γ ⊢ var name: Read[name]
  exitVar(def: QuintVar) {
    const effect: Effect = {
      kind: 'concrete',
      components: [
        { kind: 'read', entity: { kind: 'concrete', stateVariables: [{ name: def.name, reference: def.id }] } },
      ],
    }
    this.addToResults(def.id, right(toScheme(effect)))
  }

  //   { identifier: name }: E ∈ Γ
  // ----------------------------- (NAME)
  //         Γ ⊢ name: E
  exitName(expr: QuintName): void {
    if (this.errors.size > 0) {
      // Don't try to infer application if there are errors with the args
      return
    }
    this.addToResults(expr.id, this.effectForName(expr.name, expr.id, 2).map(toScheme))
  }

  // { identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
  // Eres <- freshVar   S = unify(newInstance(E), (E0, ...,  EN) => Eres)
  // ------------------------------------------------------------------- (APP)
  //           Γ ⊢ op(p0, ..., pn): S(Eres)
  exitApp(expr: QuintApp): void {
    if (this.errors.size > 0) {
      // Don't try to infer application if there are errors with the args
      return
    }

    this.location = `Trying to infer effect for operator application in ${expressionToString(expr)}`
    const paramsResult = mergeInMany(
      expr.args.map((a: QuintEx) => {
        return this.fetchResult(a.id).map(e => this.newInstance(e))
      })
    )

    const resultEffect: Effect = { kind: 'variable', name: this.freshVarGenerator.freshVar('_e') }
    const arrowEffect = paramsResult
      .map(params => {
        const effect: Effect = {
          kind: 'arrow',
          params,
          result: resultEffect,
        }

        return effect
      })
      .chain(e => applySubstitution(this.substitutions, e))

    this.effectForName(expr.opcode, expr.id, expr.args.length)
      .mapLeft(err => buildErrorTree(this.location, err))
      .chain(signature => {
        const substitution = arrowEffect.chain(effect =>
          applySubstitution(this.substitutions, signature).chain(s => unify(s, effect))
        )

        const resultEffectWithSubs = substitution
          .chain(s => compose(this.substitutions, s))
          .chain(s => {
            this.substitutions = s

            paramsResult.map(effects =>
              zip(
                effects,
                expr.args.map(a => a.id)
              ).forEach(([effect, id]) => {
                const r = applySubstitution(s, effect).map(toScheme)
                this.addToResults(id, r)
              })
            )
            // For every free name we are binding in the substitutions, the names occurring in the value of the
            // substitution have to become free as well.
            this.addBindingsToFreeNames(s)

            return applySubstitution(s, resultEffect)
          })

        return resultEffectWithSubs
      })
      .map(effect => {
        this.addToResults(expr.id, right(toScheme(effect)))
      })
      .mapLeft(err => {
        this.addToResults(expr.id, left(err))
      })
  }

  // Literals are always Pure
  exitLiteral(expr: QuintBool | QuintInt | QuintStr): void {
    this.addToResults(
      expr.id,
      right(
        toScheme({
          kind: 'concrete',
          components: [],
        })
      )
    )
  }

  //           Γ ⊢ expr: E
  // ---------------------------------- (OPDEF)
  //  Γ ⊢ (def op(params) = expr): E
  exitOpDef(def: QuintOpDef): void {
    if (this.errors.size > 0) {
      // Don't try to infer let if there are errors with the defined expression
      return
    }

    this.fetchResult(def.expr.id).map(e => {
      this.addToResults(def.id, right(this.quantify(e.effect)))
    })

    // When exiting top-level definitions, clear the substitutions
    if (this.definitionDepth === 0) {
      this.substitutions = []
    }
  }

  //     Γ ⊢ expr: E
  // ------------------------- (LET)
  //   Γ ⊢ <opdef> { expr }: E
  exitLet(expr: QuintLet): void {
    if (this.errors.size > 0) {
      // Don't try to infer let if there are errors with the defined expression
      return
    }
    const e = this.fetchResult(expr.expr.id)

    this.addToResults(expr.id, e)
  }

  //  { kind: 'param', identifier: p, reference: ref } ∈ Γ
  // ------------------------------------------------------- (LAMBDA-PARAM)
  //                Γ ⊢ p: e_p_ref
  //
  //    { kind: 'param', identifier: '_', reference: ref } ∈ Γ
  //                 e < - freshVar
  // ------------------------------------------------------- (UNDERSCORE)
  //                   Γ ⊢ '_': e
  enterLambda(expr: QuintLambda): void {
    const lastParamNames = this.currentFreeNames()
    const paramNames = {
      effectVariables: new Set(lastParamNames.effectVariables),
      entityVariables: new Set(lastParamNames.entityVariables),
    }

    expr.params.forEach(p => {
      const varName = p.name === '_' ? this.freshVarGenerator.freshVar('_e') : `e_${p.name}_${p.id}`
      paramNames.effectVariables.add(varName)
      this.addToResults(p.id, right(toScheme({ kind: 'variable', name: varName })))
    })

    this.freeNames.push(paramNames)
  }

  //                  Γ ⊢ expr: E
  // ------------------------------------------------------- (LAMBDA)
  // Γ ⊢ (p0, ..., pn) => expr: quantify((E0, ..., En) => E)
  exitLambda(lambda: QuintLambda): void {
    if (this.errors.size > 0) {
      return
    }
    // For every free name we are binding in the substitutions, the names occurring in the value of the substitution
    // have to become free as well.
    this.addBindingsToFreeNames(this.substitutions)

    const exprResult = this.fetchResult(lambda.expr.id)
    const params = mergeInMany(
      lambda.params.map(p => {
        const result = this.fetchResult(p.id)
          .map(e => this.newInstance(e))
          .chain(e => applySubstitution(this.substitutions, e))

        this.addToResults(p.id, result.map(toScheme))
        return result
      })
    )

    const result = exprResult
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

        if (effect.result.kind == 'arrow') {
          const error = buildErrorLeaf(this.location, `Result cannot be an operator`)
          // Add result to the lambda body (instead of entire lambda expression)
          // to make reporting more precise
          this.addToResults(lambda.expr.id, left(error))
        }

        return toScheme(effect)
      })

    this.addToResults(lambda.id, result)
    this.freeNames.pop()
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
      const id = def?.id
      if (!def || !id) {
        return left(buildErrorLeaf(this.location, `Signature not found for name: ${name}`))
      }

      return this.fetchResult(id).map(e => {
        const effect = this.newInstance(e)
        if (def.importedFrom?.kind === 'instance') {
          // Names imported from instances might have effects that refer to
          // names that are shared between multiple instances. To properly infer
          // effects referring to those state variables, they need to be
          // namespaced in a way that makes them different between different
          // instances. For that, we use the namespaces attribute from lookup
          // table definition, which contains the proper namespaces to identify
          // unique names while flattening.
          return addNamespaces(effect, def.namespaces ?? [])
        }
        return effect
      })
    }
  }

  private newInstance(effect: EffectScheme): Effect {
    const effectSubs: Substitutions = [...effect.effectVariables].map(name => {
      return { kind: 'effect', name: name, value: { kind: 'variable', name: this.freshVarGenerator.freshVar('_e') } }
    })
    const entitySubs: Substitutions = [...effect.entityVariables].map(name => {
      return { kind: 'entity', name: name, value: { kind: 'variable', name: this.freshVarGenerator.freshVar('_v') } }
    })

    const result = compose(effectSubs, entitySubs).chain(s => applySubstitution(s, effect.effect))

    if (result.isLeft()) {
      throw new Error(`Error applying fresh names substitution: ${errorTreeToString(result.value)} `)
    } else {
      return result.value
    }
  }

  private currentFreeNames(): { effectVariables: Set<string>; entityVariables: Set<string> } {
    return (
      this.freeNames[this.freeNames.length - 1] ?? {
        effectVariables: new Set(),
        entityVariables: new Set(),
      }
    )
  }

  private quantify(effect: Effect): EffectScheme {
    const freeNames = this.currentFreeNames()
    const nonFreeNames = {
      effectVariables: new Set(
        [...effectNames(effect).effectVariables].filter(name => !freeNames.effectVariables.has(name))
      ),
      entityVariables: new Set(
        [...effectNames(effect).entityVariables].filter(name => !freeNames.entityVariables.has(name))
      ),
    }
    return { ...nonFreeNames, effect: effect }
  }

  private addBindingsToFreeNames(substitutions: Substitutions) {
    // Assumes substitutions are topologically sorted, i.e. [ t0 |-> (t1, t2), t1 |-> (t3, t4) ]
    substitutions.forEach(s => {
      switch (s.kind) {
        case 'effect':
          this.freeNames
            .filter(free => free.effectVariables.has(s.name))
            .forEach(free => {
              const names = effectNames(s.value)
              names.effectVariables.forEach(v => free.effectVariables.add(v))
              names.entityVariables.forEach(v => free.entityVariables.add(v))
            })
          return
        case 'entity':
          this.freeNames
            .filter(free => free.entityVariables.has(s.name))
            .forEach(free => entityNames(s.value).forEach(v => free.entityVariables.add(v)))
          return
      }
    })
  }
}
