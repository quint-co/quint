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

import { Either, right, left } from '@sweet-monads/either'
import { DefinitionTableByModule } from '../definitionsCollector'
import { expressionToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { TntApp, TntBool, TntEx, TntInt, TntLambda, TntLet, TntModule, TntModuleDef, TntName, TntOpDef, TntStr } from '../tntIr'
import { Effect, emptyVariables, unify, Signature, effectNames, Variables } from './base'
import { applySubstitution, applySubstitutionToVariables, Substitutions, compose } from './substitutions'
import { ErrorTree, errorTreeToString } from '../errorTree'

/**
 * Infers an effect for every expression in a module based on predefined
 * signatures and the definitions table for that module
 *
 * @param signatures a map from operator identifiers to their effect signature
 * @param definitionsTable the collected definitions for the module under inference
 * @param module: the TNT module to infer effects for
 *
 * @returns a map from expression ids to their effects when inferrence succeeds.
 *          Otherwise, a map from expression ids to the corresponding error for
 *          the problematic expressions.
 */
export function inferEffects (signatures: Map<string, Signature>, definitionsTable: DefinitionTableByModule, module: TntModule): Either<Map<BigInt, ErrorTree>, Map<BigInt, Effect>> {
  // pre-populate the table that maps each definition id to its kind
  const table: Map<string, Map<string, string>> = new Map<string, Map<string, string>>()
  definitionsTable.forEach((value, key) => {
    const moduleTable: Map<string, string> = new Map<string, string>()
    value.valueDefinitions.forEach(d => moduleTable.set(d.identifier, d.kind))
    table.set(key, moduleTable)
  })

  const visitor = new EffectInferrerVisitor(signatures, table)
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
  constructor (signatures: Map<string, Signature>, definitionsTable: Map<string, Map<string, string>>) {
    this.signatures = signatures
    this.definitionsTable = definitionsTable
  }

  effects: Map<BigInt, Effect> = new Map<BigInt, Effect>()
  errors: Map<BigInt, ErrorTree> = new Map<BigInt, ErrorTree>()

  private signatures: Map<string, Signature>
  private definitionsTable: Map<string, Map<string, string>>
  private params: Map<string, string> = new Map<string, string>()
  private freshVarCounters: Map<string, number> = new Map<string, number>()

  private currentModuleName: string = ''
  private currentTable: Map<string, string> = new Map<string, string>()
  private moduleStack: string[] = []

  private substitutions: Substitutions = []

  enterModuleDef (def: TntModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrentModule()
  }

  exitModuleDef (_: TntModuleDef): void {
    this.moduleStack.pop()

    this.updateCurrentModule()
  }

  exitName (expr: TntName): void {
    const kind = this.currentTable.get(expr.name)!
    switch (kind) {
      case 'param':
        /*  { kind: 'param', identifier: p } ∈ Γ
         * ------------------------------------ (NAME-PARAM)
         *          Γ ⊢ v: Read[r_p]
         */
        this.effects.set(expr.id, {
          kind: 'concrete',
          read: { kind: 'quantified', name: this.params.get(expr.name)! },
          update: emptyVariables,
          temporal: emptyVariables,
        })
        break
      case 'const': {
        /* { kind: 'const', identifier: c } ∈ Γ
         * ------------------------------------- (NAME-CONST)
         *       Γ ⊢ c: Pure
         */
        const effect: Effect = {
          kind: 'concrete', read: emptyVariables, update: emptyVariables, temporal: emptyVariables,
        }
        this.effects.set(expr.id, effect)
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
        this.effects.set(expr.id, effect)
        break
      }
      default:
        /* { identifier: op, effect: E } ∈ Γ
         * -------------------------------------- (NAME-OP)
         *           Γ ⊢ op: E
         */
        this.fetchSignature(expr.name, 2)
          .map(s => this.effects.set(expr.id, s))
          .mapLeft(m => this.errors.set(expr.id, { message: m, location: `Inferring effect for name ${expr.name}`, children: [] }))
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

    const location = `Trying to infer effect for operator application in ${expressionToString(expr)}`

    this.fetchSignature(expr.opcode, expr.args.length)
      .mapLeft(m => this.errors.set(expr.id, { message: m, location: location, children: [] }))
      .map(signature => {
        const resultEffect: Effect = { kind: 'quantified', name: this.freshVar('e') }
        const substitution = unify(signature, {
          kind: 'arrow',
          params: expr.args.map((a: TntEx) => {
            return this.effects.get(a.id)!
          }),
          result: resultEffect,
        })

        const resultEffectWithSubs = substitution.chain(s => compose(this.substitutions, s)).chain(s => {
          this.substitutions = s

          this.effects.forEach((effect, id) => {
            applySubstitution(s, effect).map(e => this.effects.set(id, e))
          })

          return applySubstitution(s, resultEffect)
        })

        return resultEffectWithSubs
          .map(effect => this.effects.set(expr.id, effect))
          .mapLeft(error => this.errors.set(expr.id, { location: location, children: [error] }))
      })
  }

  // Literals are always Pure
  exitLiteral (expr: TntBool | TntInt | TntStr): void {
    this.effects.set(expr.id, { kind: 'concrete', read: emptyVariables, update: emptyVariables, temporal: emptyVariables })
  }

  /*                        Γ ⊢ e: E
   * ------------------------------------------------------------- (OPDEF)
   * Γ ∪ { identifier: op, effect: E } ⊢ (def op(params) = e): Pure
   */
  exitOpDef (def: TntOpDef): void {
    if (!this.effects.get(def.expr.id)) {
      return
    }
    const e = this.effects.get(def.expr.id)!
    this.signatures.set(def.name, (_) => e)
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
    const e = this.effects.get(expr.expr.id)!

    this.effects.set(expr.id, e)
  }

  /*                  Γ ⊢ e: E
   * ---------------------------------------------- (LAMBDA)
   * Γ ⊢ (p0, ..., pn) => e: (Read[r_p0], ..., Read[r_pn]) => E
   */

  enterLambda (expr: TntLambda): void {
    expr.params
      .forEach(p => {
        const name = `r_${p}_${this.freshVar('')}`
        this.params.set(p, name)
      })
  }

  exitLambda (expr: TntLambda): void {
    if (!this.effects.get(expr.expr.id)) {
      return
    }
    const e = this.effects.get(expr.expr.id)!

    const paramsVariables: Variables[] = expr.params
      .map(p => {
        const name = this.params.get(p)!
        this.params.delete(p)
        return applySubstitutionToVariables(this.substitutions, { kind: 'quantified', name: name })
      })

    const params = paramsVariables.map((v): Effect => {
      return { kind: 'concrete', read: v, update: emptyVariables, temporal: emptyVariables }
    })
    this.effects.set(expr.id, { kind: 'arrow', params: params, result: e })
  }

  private freshVar (prefix: string): string {
    const counter = this.freshVarCounters.get(prefix)! ?? 0
    this.freshVarCounters.set(prefix, counter + 1)

    return `${prefix}${counter}`
  }

  private fetchSignature (opcode: string, arity: number): Either<string, Effect> {
    // Assumes a valid number of arguments
    if (!this.signatures.get(opcode)) {
      return left(`Signature not found for operator: ${opcode}`)
    }
    const signatureFunction = this.signatures.get(opcode)!
    const signature = signatureFunction(arity)
    return right(this.replaceEffectNamesWithFresh(signature))
  }

  private replaceEffectNamesWithFresh (effect: Effect): Effect {
    const names = effectNames(effect)
    const subs: Substitutions = names.map(name => {
      return { kind: name.kind, name: name.name, value: { kind: 'quantified', name: this.freshVar('v') } }
    })

    const result = applySubstitution(subs, effect)
    if (result.isLeft()) {
      throw new Error(`Error applying fresh names substitution: ${errorTreeToString(result.value)}`)
    } else {
      return result.value
    }
  }

  private updateCurrentModule (): void {
    if (this.moduleStack.length > 0) {
      this.currentModuleName = this.moduleStack[this.moduleStack.length - 1]

      const moduleTable = this.definitionsTable.get(this.currentModuleName)!
      this.currentTable = moduleTable
    }
  }
}
