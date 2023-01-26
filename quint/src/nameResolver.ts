/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Name resolution for Quint. From a lookup table of scoped and unscoped names,
 * navigate a module in the internal representation and check that each name
 * has either an unscoped definition or a scoped definition with a scope containing
 * the name expression.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { QuintApp, QuintDef, QuintModule, QuintModuleDef, QuintName } from './quintIr'
import { QuintConstType } from './quintTypes'
import { ScopeTree } from './scoping'
import { LookupTable, LookupTableByModule, lookupType, lookupValue, newTable } from './lookupTable'
import { IRVisitor, walkModule } from './IRVisitor'
import { Either, left, right } from '@sweet-monads/either'

/**
 * A single name resolution error
 */
export interface NameError {
  /* Either a 'type' or 'value' name error */
  kind: 'type' | 'value';
  /* The name that couldn't be resolved */
  name: string;
  /* The module-level definition containing the error */
  definitionName: string;
  /* The name of the module containing the error */
  moduleName: string;
  /* The identifier of the IR node where the error occurs */
  reference?: bigint;
}

/**
 * The result of name resolution for a Quint Module.
 */
export type NameResolutionResult = Either<NameError[], void>

/**
 * Explore the IR checking all name expressions for undefined names
 *
 * @param quintModule the Quint module to be checked
 * @param table lists of names and type aliases collected for all modules
 *
 * @returns a successful result in case all names are resolved, or an aggregation of errors otherwise
 */
export function resolveNames(
  quintModule: QuintModule, table: LookupTableByModule, scopeTree: ScopeTree
): NameResolutionResult {
  const visitor = new NameResolverVisitor(table, scopeTree)
  walkModule(visitor, quintModule)
  const errors: NameError[] = visitor.errors
  return errors.length > 0 ? left(errors) : right(undefined)
}

class NameResolverVisitor implements IRVisitor {
  constructor(tables: LookupTableByModule, scopeTree: ScopeTree) {
    this.tables = tables
    this.scopeTree = scopeTree
  }

  errors: NameError[] = []

  private scopeTree: ScopeTree
  private tables: LookupTableByModule
  private lastDefName: string = ''

  private currentModuleName: string = ''
  private currentTable: LookupTable = newTable({})
  private moduleStack: string[] = []

  enterDef(def: QuintDef): void {
    // Keep the last visited definition name
    // so it can be showen in the reported error
    if (def.kind === 'module') {
      this.lastDefName = def.module.name
    } else {
      this.lastDefName = def.name
    }
  }

  enterModuleDef(def: QuintModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrentModule()
  }

  exitModuleDef(_: QuintModuleDef): void {
    this.moduleStack.pop()

    this.updateCurrentModule()
  }

  enterName(nameExpr: QuintName): void {
    // This is a name expression, the name must be defined
    // either globally or under a scope that contains the expression
    // The list of scopes containing the expression is accumulated in param scopes
    this.checkScopedName(nameExpr.name, nameExpr.id)
  }

  enterApp(appExpr: QuintApp): void {
    // Application, check that the operator being applied is defined
    this.checkScopedName(appExpr.opcode, appExpr.id)
  }

  enterConstType(type: QuintConstType): void {
    // Type is a name, check that it is defined
    if (!lookupType(this.currentTable, type.name)) {
      this.recordError('type', type.name, type.id)
    }
  }

  // Check that there is a value definition for `name` under scope `id`
  private checkScopedName(name: string, id: bigint) {
    const def = lookupValue(this.currentTable, this.scopeTree, name, id)
    if (!def) {
      this.recordError('value', name, id)
    }
  }

  private updateCurrentModule(): void {
    if (this.moduleStack.length > 0) {
      this.currentModuleName = this.moduleStack[this.moduleStack.length - 1]

      const moduleTable = this.tables.get(this.currentModuleName)
      if (!moduleTable) {
        throw new Error(`Lookup table not found for module: ${this.currentModuleName}`)
      }
      this.currentTable = moduleTable
    }
  }

  private recordError(kind: 'type' | 'value', name: string, id?: bigint) {
    this.errors.push({
      kind,
      name,
      definitionName: this.lastDefName,
      moduleName: this.currentModuleName,
      reference: id,
    })
  }
}
