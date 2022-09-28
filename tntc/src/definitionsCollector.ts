/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Find and collect definitions from a TNT module, along with a default list for built-in
 * definitions. Collect both operator and type alias definitions. For scoped operators,
 * collect scope information.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from './IRVisitor'
import { TntModule, TntVar, TntModuleDef, TntConst, TntOpDef, TntTypeDef, TntAssume, TntLambda, TntLet } from './tntIr'
import { TntType } from './tntTypes'

/**
 * A named operator defined. Can be scoped or module-wide (unscoped).
 */
export interface ValueDefinition {
  /* Same as TntDef kinds */
  kind: string
  /* The name given to the defined operator */
  identifier: string
  /* Expression or definition id from where the name was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the TntIr node that introduces the name */
  scope?: bigint
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased (none for uninterpreted type) */
  type?: TntType
  /* Expression or definition id from where the type was collected */
  reference?: bigint
}

/**
 * A lookup table aggregating operator and type alias definitions
 */
export interface DefinitionTable {
  /* Names for operators defined */
  valueDefinitions: ValueDefinition[]
  /* Type aliases defined */
  typeDefinitions: TypeDefinition[]
}

export type DefinitionTableByModule = Map<string, DefinitionTable>

/**
 * Built-in name definitions that are always included in definitions collection
 * This is a function instead of a constant to ensure a new instance is generated
 * every call
*/

export function emptyTable (): DefinitionTable {
  return {
    valueDefinitions: [],
    typeDefinitions: [],
  }
}

export function defaultDefinitions (): DefinitionTable {
  return {
    valueDefinitions: [
      { kind: 'def', identifier: 'not' },
      { kind: 'def', identifier: 'and' },
      { kind: 'def', identifier: 'or' },
      { kind: 'def', identifier: 'iff' },
      { kind: 'def', identifier: 'implies' },
      { kind: 'def', identifier: 'exists' },
      { kind: 'def', identifier: 'guess' },
      { kind: 'def', identifier: 'forall' },
      { kind: 'def', identifier: 'in' },
      { kind: 'def', identifier: 'notin' },
      { kind: 'def', identifier: 'union' },
      { kind: 'def', identifier: 'contains' },
      { kind: 'def', identifier: 'fold' },
      { kind: 'def', identifier: 'intersect' },
      { kind: 'def', identifier: 'exclude' },
      { kind: 'def', identifier: 'subseteq' },
      { kind: 'def', identifier: 'map' },
      { kind: 'def', identifier: 'applyTo' },
      { kind: 'def', identifier: 'filter' },
      { kind: 'def', identifier: 'powerset' },
      { kind: 'def', identifier: 'flatten' },
      { kind: 'def', identifier: 'seqs' },
      { kind: 'def', identifier: 'chooseSome' },
      { kind: 'def', identifier: 'isFinite' },
      { kind: 'def', identifier: 'cardinality' },
      { kind: 'def', identifier: 'get' },
      { kind: 'def', identifier: 'put' },
      { kind: 'def', identifier: 'keys' },
      { kind: 'def', identifier: 'mapOf' },
      { kind: 'def', identifier: 'setOfMaps' },
      { kind: 'def', identifier: 'update' },
      { kind: 'def', identifier: 'updateAs' },
      { kind: 'def', identifier: 'fields' },
      { kind: 'def', identifier: 'with' },
      { kind: 'def', identifier: 'tuples' },
      { kind: 'def', identifier: 'append' },
      { kind: 'def', identifier: 'concat' },
      { kind: 'def', identifier: 'head' },
      { kind: 'def', identifier: 'tail' },
      { kind: 'def', identifier: 'length' },
      { kind: 'def', identifier: 'nth' },
      { kind: 'def', identifier: 'indices' },
      { kind: 'def', identifier: 'replaceAt' },
      { kind: 'def', identifier: 'slice' },
      { kind: 'def', identifier: 'select' },
      { kind: 'def', identifier: 'foldl' },
      { kind: 'def', identifier: 'foldr' },
      { kind: 'def', identifier: 'to' },
      { kind: 'def', identifier: 'always' },
      { kind: 'def', identifier: 'eventually' },
      { kind: 'def', identifier: 'next' },
      { kind: 'def', identifier: 'shift' }, // For simulator usage only
      { kind: 'def', identifier: 'stutter' },
      { kind: 'def', identifier: 'nostutter' },
      { kind: 'def', identifier: 'enabled' },
      { kind: 'def', identifier: 'weakFair' },
      { kind: 'def', identifier: 'strongFair' },
      { kind: 'def', identifier: 'guarantees' },
      { kind: 'def', identifier: 'existsConst' },
      { kind: 'def', identifier: 'forallConst' },
      { kind: 'def', identifier: 'chooseConst' },
      { kind: 'def', identifier: 'Bool' },
      { kind: 'def', identifier: 'Int' },
      { kind: 'def', identifier: 'Nat' },
      { kind: 'def', identifier: 'set' },
      { kind: 'def', identifier: 'seq' },
      { kind: 'def', identifier: 'tup' },
      { kind: 'def', identifier: 'rec' },
      { kind: 'def', identifier: 'record' },
      { kind: 'def', identifier: 'igt' },
      { kind: 'def', identifier: 'ilt' },
      { kind: 'def', identifier: 'igte' },
      { kind: 'def', identifier: 'ilte' },
      { kind: 'def', identifier: 'iadd' },
      { kind: 'def', identifier: 'isub' },
      { kind: 'def', identifier: 'iuminus' },
      { kind: 'def', identifier: 'imul' },
      { kind: 'def', identifier: 'idiv' },
      { kind: 'def', identifier: 'imod' },
      { kind: 'def', identifier: 'ipow' },
      { kind: 'def', identifier: 'andAction' },
      { kind: 'def', identifier: 'orAction' },
      { kind: 'def', identifier: 'andExpr' },
      { kind: 'def', identifier: 'orExpr' },
      { kind: 'def', identifier: 'field' },
      { kind: 'def', identifier: 'fieldNames' },
      { kind: 'def', identifier: 'item' },
      { kind: 'def', identifier: 'match' },
      { kind: 'def', identifier: 'assign' },
      { kind: 'def', identifier: 'of' },
      { kind: 'def', identifier: 'eq' },
      { kind: 'def', identifier: 'neq' },
      { kind: 'def', identifier: 'ite' },
      { kind: 'def', identifier: 'cross' },
      { kind: 'def', identifier: 'difference' },
    ],
    typeDefinitions: [],
  }
}
/**
 * Recursively iterate over a module's definition collecting all names and type aliases
 * into a definition table. Also includes all default definitions for built-in names.
 *
 * @param tntModule the TNT module to have definitions collected from
 *
 * @returns a lookup table with all defined values for the module
 */
export function collectDefinitions (tntModule: TntModule): DefinitionTableByModule {
  const visitor = new DefinitionsCollectorVisitor()
  walkModule(visitor, tntModule)
  const fullTable = visitor.tables

  fullTable.forEach(table => {
    table.valueDefinitions = table.valueDefinitions.filter(d => d.identifier !== '_')
    table.valueDefinitions.push(...defaultDefinitions().valueDefinitions)
  })
  return fullTable
}

class DefinitionsCollectorVisitor implements IRVisitor {
  tables: DefinitionTableByModule = new Map<string, DefinitionTable>()

  private currentModuleName: string = ''
  private currentTable: DefinitionTable = emptyTable()
  private moduleStack: string[] = []
  private scopeStack: bigint[] = []

  enterModuleDef (def: TntModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrentModule()
  }

  exitModuleDef (def: TntModuleDef): void {
    // Collect all definitions namespaced to module
    const namespacedDefinitions = this.currentTable.valueDefinitions
      .filter(d => !d.scope)
      .map(d => {
        return { kind: d.kind, identifier: `${def.module.name}::${d.identifier}`, reference: d.reference }
      })

    this.moduleStack.pop()
    this.updateCurrentModule()

    if (this.moduleStack.length > 0) {
      this.currentTable.valueDefinitions.push(...namespacedDefinitions)
      this.currentTable.valueDefinitions.push({ kind: 'module', identifier: def.module.name, reference: def.id })
    }
  }

  enterVar (def: TntVar): void {
    this.collectValueDefinition(def.kind, def.name, def.id)
  }

  enterConst (def: TntConst): void {
    this.collectValueDefinition(def.kind, def.name, def.id)
  }

  enterOpDef (def: TntOpDef): void {
    if (this.scopeStack.length > 0) {
      const scope = this.scopeStack[this.scopeStack.length - 1]
      this.collectValueDefinition(def.kind, def.name, def.id, scope)
    } else {
      this.collectValueDefinition(def.kind, def.name, def.id)
    }
  }

  enterTypeDef (def: TntTypeDef): void {
    this.currentTable.typeDefinitions.push({
      identifier: def.name,
      type: def.type,
      reference: def.id,
    })
  }

  enterAssume (def: TntAssume): void {
    this.collectValueDefinition('assumption', def.name, def.id)
  }

  enterLambda (expr: TntLambda): void {
    expr.params.forEach(p => {
      this.collectValueDefinition('param', p, expr.id, expr.id)
    })
  }

  enterLet (def: TntLet): void {
    this.scopeStack.push(def.id)
  }

  exitLet (_: TntLet): void {
    this.scopeStack.pop()
  }

  private collectValueDefinition (kind: string, identifier: string, reference: bigint, scope?: bigint): void {
    this.currentTable.valueDefinitions.push({
      kind: kind,
      identifier: identifier,
      reference: reference,
      scope: scope,
    })
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
}
