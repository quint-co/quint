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
import { DefinitionTable, DefinitionTableByModule, emptyTable, ValueDefinition } from '../definitionsCollector'
import { expressionToString } from '../IRprinting'
import { IRVisitor, walkModule } from '../IRVisitor'
import { TntApp, TntBool, TntEx, TntInt, TntLambda, TntLet, TntModule, TntModuleDef, TntName, TntOpDef, TntStr } from '../tntIr'
import { Effect, emptyVariables, unify, Signature, effectNames } from './base'
import { applySubstitution, Substitutions, compose } from './substitutions'
import { ErrorTree, errorTreeToString } from '../errorTree'
import { scopesForId, ScopeTree, treeFromModule } from '../scoping'

/**
 * Infers an effect for every expression in a module based on predefined
 * context and the definitions table for that module
 *
 * @param context a map from operator identifiers to their effect signature
 * @param definitionsTable the collected definitions for the module under inference
 * @param module: the TNT module to infer effects for
 *
 * @returns a map from expression ids to their effects when inferrence succeeds.
 *          Otherwise, a map from expression ids to the corresponding error for
 *          the problematic expressions.
 */
export function inferEffects (builtinSignatures: Map<string, Signature>, definitionsTable: DefinitionTableByModule, module: TntModule): Either<Map<bigint, ErrorTree>, Map<bigint, Effect>> {
  const visitor = new EffectInferrerVisitor(builtinSignatures, definitionsTable)
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
  constructor(builtinSignatures: Map<string, Signature>, definitionsTable: DefinitionTableByModule) {
    this.builtinSignatures = builtinSignatures
    this.definitionsTable = definitionsTable
  }

  effects: Map<bigint, Effect> = new Map<bigint, Effect>()
  errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()

  private builtinSignatures: Map<string, Signature>
  private definitionsTable: DefinitionTableByModule
  private context: Map<bigint, Signature> = new Map<bigint, Signature>()
  private freshVarCounters: Map<string, number> = new Map<string, number>()

  private currentModule?: TntModule
  private currentTable: DefinitionTable = emptyTable()
  private currentScopeTree: ScopeTree = { value: 0n, children: [] }
  private moduleStack: TntModule[] = []

  private substitutions: Substitutions = []

  enterModuleDef (def: TntModuleDef): void {
    this.moduleStack.push(def.module)

    this.updateCurrentModule()
  }

  exitModuleDef (_: TntModuleDef): void {
    this.moduleStack.pop()

    this.updateCurrentModule()
  }

  exitName (expr: TntName): void {
    const location = `Inferring effect for name ${expr.name}`

    this.fetchFromDefinitionsTable(expr.name, expr.id).map(def => {
      switch (def.kind) {
        case 'param': {
          /*  { kind: 'param', identifier: p } ∈ Γ
           * ------------------------------------ (NAME-PARAM)
           *          Γ ⊢ v: Read[r_p]
           */
          // Context values are functions over arity, call it with arity 1 since
          // arity doesn't matter for lambda-introduced names
          const paramEffect = this.context.get(expr.id)!(1)
          if (!paramEffect) {
            throw new Error(`Couldn't find lambda parameter named ${expr.name} in context`)
          }

          this.effects.set(expr.id, paramEffect)
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
      }
    }).mapLeft(m => this.errors.set(expr.id, { message: m, location: location, children: [] }))
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
        const effect: Effect = {
          kind: 'arrow',
          params: expr.args.map((a: TntEx) => {
            return this.effects.get(a.id)!
          }),
          result: resultEffect,
        }

        const substitution = unify(signature, effect)

        const resultEffectWithSubs = substitution.chain(s => compose(s, this.substitutions)).chain(s => {
          this.substitutions = s

          this.effects.forEach((effect, id) => {
            applySubstitution(s, effect).map(e => this.effects.set(id, e))
          })

          return applySubstitution(s, resultEffect)
        })

        return resultEffectWithSubs
          .map(e => this.effects.set(expr.id, e))
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

    // Set the expression effect as the definition effect for it to be available at the result
    this.effects.set(def.id, e)
    this.context.set(def.id, (_) => e)
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
   * Γ ⊢ (p0, ..., pn) => e: (E0, ..., En) => E
   */

  enterLambda (expr: TntLambda): void {
    expr.params
      .forEach(p => {
        const name = `e_${p}_${expr.id}`
        const id = this.currentTable.index.get(p)!
        this.context.set(id, (_) => ({
          kind: 'quantified',
          name: name,
        }))
      })
  }

  exitLambda (expr: TntLambda): void {
    if (!this.effects.get(expr.expr.id)) {
      return
    }
    const e = this.effects.get(expr.expr.id)!

    const params = mergeInMany(expr.params
      .map(p => {
        // Context values are functions over arity, call it with arity 1 since
        // arity doesn't matter for lambda-introduced names
        const id = this.currentTable.index.get(p)!
        const paramEffect = this.context.get(id)!(1)
        this.context.delete(id)
        return applySubstitution(this.substitutions, paramEffect)
      }))

    params.map(ps => {
      const effect: Effect = { kind: 'arrow', params: ps, result: e }
      this.effects.set(expr.id, effect)
    })
  }

  private freshVar (prefix: string): string {
    const counter = this.freshVarCounters.get(prefix)! ?? 0
    this.freshVarCounters.set(prefix, counter + 1)

    return `${prefix}${counter}`
  }

  private fetchFromDefinitionsTable (name: string, scope: bigint): Either<string, ValueDefinition> {
    const value = this.currentTable.valueDefinitions.find(def => {
      return def.identifier === name && (!def.scope || scopesForId(this.currentScopeTree, scope).includes(def.scope))
    })
    if (value) {
      return right(value)
    } else {
      return left(`Couldn't find definition for ${name} in definition table in scope`)
    }
  }

  private fetchSignature (opcode: string, arity: number): Either<string, Effect> {
    // Assumes a valid number of arguments
    const opcodeId = this.currentTable.index.get(opcode)!
    if (!opcodeId && !this.builtinSignatures.get(opcode)) {
      return left(`Signature not found for operator: ${opcode}`)
    }
    const signatureFunction = this.builtinSignatures.get(opcode) ?? this.context.get(opcodeId)!
    const signature = signatureFunction(arity)
    return right(this.replaceEffectNamesWithFresh(signature))
  }

  private replaceEffectNamesWithFresh (effect: Effect): Effect {
    const names = effectNames(effect)
    const subs: Substitutions = names.map(name => {
      return { kind: name.kind, name: name.name, value: { kind: 'quantified', name: this.freshVar('v') } }
    })

    // FIXME: Add effect schemes to avoid this hack
    // We need to keep track of substitutions applied to lambda-introduced names (e.*), which are unique
    // But can't keep track of substitutions applied to builtin signatures because they will conflict
    compose(subs.filter(s => s.name.startsWith('e_')), this.substitutions).map(s => this.substitutions = s)

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

      const moduleTable = this.definitionsTable.get(this.currentModule!.name)!
      this.currentTable = moduleTable
      this.currentScopeTree = treeFromModule(this.currentModule)
    }
  }
}
