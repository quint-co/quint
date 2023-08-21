/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Name resolution for Quint modules.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { IRVisitor, walkModule } from '../ir/IRVisitor'
import { QuintApp, QuintInstance, QuintLambda, QuintLet, QuintModule, QuintName, QuintOpDef } from '../ir/quintIr'
import { QuintConstType } from '../ir/quintTypes'
import { LookupTable, builtinNames } from './base'
import { QuintError } from '../quintError'
import { NameCollector } from './collector'

/**
 * Resolves all names in the given Quint modules and returns a lookup table of definitions.
 *
 * @param quintModules - The Quint modules to resolve names in.
 * @returns A lookup table of definitions if successful, otherwise a list of errors.
 */
export function resolveNames(quintModules: QuintModule[]): Either<QuintError[], LookupTable> {
  const visitor = new NameResolver()
  quintModules.forEach(module => {
    walkModule(visitor, module)
  })
  return visitor.errors.length > 0 ? left(visitor.errors) : right(visitor.table)
}

/**
 * `NameResolver` uses `NameCollector` to collect top-level definitions. Scoped
 * definitions are collected inside of `NameResolver` as it navigates the IR.
 */
class NameResolver implements IRVisitor {
  collector: NameCollector
  errors: QuintError[] = []
  table: LookupTable = new Map()
  private definitionDepth: number = 0

  constructor() {
    this.collector = new NameCollector()
    // bind the errors so they are aggregated in the same array
    this.collector.errors = this.errors
  }

  enterModule(module: QuintModule): void {
    // First thing to do in resolving names for a module is to collect all
    // top-level definitions for that module. This has to be done in a separate
    // pass because names can appear before they are defined.
    walkModule(this.collector, module)
  }

  enterOpDef(def: QuintOpDef): void {
    // Top-level definitions were already collected, so we only need to collect
    // scoped definitions.
    if (this.definitionDepth > 0) {
      this.collector.collectDefinition(def)
    }

    this.definitionDepth++
  }

  exitOpDef(_def: QuintOpDef): void {
    this.definitionDepth--
  }

  exitLet(expr: QuintLet): void {
    // When exiting a let, delete the operator defintition so it is not acessed
    // outside of the let scope
    this.collector.deleteDefinition(expr.opdef.name)
  }

  enterLambda(expr: QuintLambda): void {
    // Lambda parameters are scoped, so they are collected here
    expr.params.forEach(p => {
      this.collector.collectDefinition({ ...p, kind: 'param' })
    })
  }

  exitLambda(expr: QuintLambda): void {
    // Similar to let, delete the parameter definitions when exiting the lambda
    // so they are not accessed outside of the lambda scope
    expr.params.forEach(p => {
      this.collector.deleteDefinition(p.name)
    })
  }

  enterName(nameExpr: QuintName): void {
    // Name expression, check that the name is defined
    this.resolveName(nameExpr.name, nameExpr.id)
  }

  enterApp(appExpr: QuintApp): void {
    // Application, check that the operator being applied is defined
    this.resolveName(appExpr.opcode, appExpr.id)
  }

  enterConstType(type: QuintConstType): void {
    // Type is a name, check that it is defined
    const def = this.collector.getDefinition(type.name)
    if (!def || def.kind !== 'typedef') {
      this.recordNameError('type', type.name, type.id!)
      return
    }

    this.table.set(type.id!, def)
  }

  enterInstance(def: QuintInstance): void {
    // Resolve overriden param names in the current module
    def.overrides.forEach(([param, _]) => {
      const qualifiedName = def.qualifiedName ? `${def.qualifiedName}::${param.name}` : param.name
      this.resolveName(qualifiedName, param.id)
    })
  }

  private resolveName(name: string, id: bigint) {
    if (builtinNames.includes(name)) {
      return
    }

    const def = this.collector.getDefinition(name)
    if (!def || def.kind === 'typedef') {
      this.recordNameError('name', name, id)
      return
    }

    this.table.set(id, def)
  }

  private recordNameError(kind: 'name' | 'type', name: string, id: bigint) {
    const description = kind === 'name' ? 'Name' : 'Type alias'
    this.errors.push({
      code: 'QNT404',
      message: `${description} '${name}' not found`,
      reference: id,
      data: {},
    })
  }
}
