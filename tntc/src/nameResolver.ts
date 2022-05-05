/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Name resolution for TNT. From a lookup table of scoped and unscoped names,
 * navigate a module in the internal representation and check that each name
 * has either an unscoped definition or a scoped definition with a scope containing
 * the name expression.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { TntModule, TntName, TntApp, TntDef, TntModuleDef } from './tntIr'
import { TntConstType, TntVarType } from './tntTypes'
import { ScopeTree, scopesForId } from './scoping'
import { DefinitionTable, DefinitionTableByModule, ValueDefinition, emptyTable } from './definitionsCollector'
import { IRVisitor, walkModule } from './IRVisitor'

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
  reference: BigInt;
}

/**
 * The result of name resolution for a TNT Module.
 */
export type NameResolutionResult =
  /* Success, all names were resolved */
  | { kind: 'ok' }
  /* Error, at least one name couldn't be resolved. All errors are listed in errors */
  | { kind: 'error', errors: NameError[] }

/**
 * Explore the IR checking all name expressions for undefined names
 *
 * @param tntModule the TNT module to be checked
 * @param table lists of names and type aliases collected for all modules
 *
 * @returns a successful result in case all names are resolved, or an aggregation of errors otherwise
 */
export function resolveNames (tntModule: TntModule, table: DefinitionTableByModule, scopeTree: ScopeTree): NameResolutionResult {
  const visitor = new NameResolverVisitor(table, scopeTree)
  walkModule(visitor, tntModule)
  const errors: NameError[] = visitor.errors
  return errors.length > 0 ? { kind: 'error', errors: errors } : { kind: 'ok' }
}

class NameResolverVisitor implements IRVisitor {
  constructor (tables: DefinitionTableByModule, scopeTree: ScopeTree) {
    this.tables = tables
    this.scopeTree = scopeTree
  }

  errors: NameError[] = []

  private scopeTree: ScopeTree
  private tables: DefinitionTableByModule
  private lastDefName: string = ''

  private currentModuleName: string = ''
  private currentTable: DefinitionTable = emptyTable()
  private moduleStack: string[] = []

  enterDef (def: TntDef): void {
    // Keep the last visited definition name
    // so it can be showen in the reported error
    if (def.kind === 'module') {
      this.lastDefName = def.module.name
    } else {
      this.lastDefName = def.name
    }
  }

  enterModuleDef (def: TntModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrentModule()
  }

  exitModuleDef (_: TntModuleDef): void {
    this.moduleStack.pop()

    this.updateCurrentModule()
  }

  enterName (nameExpr: TntName): void {
    // This is a name expression, the name must be defined
    // either globally or under a scope that contains the expression
    // The list of scopes containing the expression is accumulated in param scopes
    const valueDefinitionsForScope = filterScope(this.currentTable.valueDefinitions, scopesForId(this.scopeTree, nameExpr.id))

    if (!valueDefinitionsForScope.some(name => name.identifier === nameExpr.name)) {
      this.recordError('value', nameExpr.name, nameExpr.id)
    }
  }

  enterApp (appExpr: TntApp): void {
    // Application, check that the operator being applied is defined
    const valueDefinitionsForScope = filterScope(this.currentTable.valueDefinitions, scopesForId(this.scopeTree, appExpr.id))

    if (!valueDefinitionsForScope.some(name => name.identifier === appExpr.opcode)) {
      this.recordError('value', appExpr.opcode, appExpr.id)
    }
  }

  enterVarType (type: TntVarType): void {
    // Type is a name, check that it is defined
    if (!this.currentTable.typeDefinitions.some(def => def.identifier === type.name)) {
      this.recordError('type', type.name, type.id)
    }
  }

  enterConstType (type: TntConstType): void {
    // Type is a name, check that it is defined
    if (!this.currentTable.typeDefinitions.some(def => def.identifier === type.name)) {
      this.recordError('type', type.name, type.id)
    }
  }

  private updateCurrentModule (): void {
    if (this.moduleStack.length > 0) {
      this.currentModuleName = this.moduleStack[this.moduleStack.length - 1]

      let moduleTable = this.tables.get(this.currentModuleName)
      if (!moduleTable) {
        moduleTable = emptyTable()
        this.tables.set(this.currentModuleName, moduleTable)
      }
      this.currentTable = moduleTable
    }
  }

  private recordError (kind: 'type' | 'value', name: string, id: bigint) {
    this.errors.push({
      kind: kind,
      name: name,
      definitionName: this.lastDefName,
      moduleName: this.currentModuleName,
      reference: id,
    })
  }
}

function filterScope (valueDefinitions: ValueDefinition[], scopes: BigInt[]): ValueDefinition[] {
  return valueDefinitions.filter(definition => {
    // A definition should be considered in a scope if it's either unscoped or its scope is included
    // in some scope containing the name expression's scope
    return !definition.scope || scopes.includes(definition.scope)
  })
}
