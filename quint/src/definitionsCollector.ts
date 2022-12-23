/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Find and collect definitions from a Quint module, along with a default list for built-in
 * definitions. Collect both operator and type alias definitions. For scoped operators,
 * collect scope information.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from './IRVisitor'
import {
  LookupTable, LookupTableByModule, ValueDefinition, ValueDefinitionKind,
  addTypeToTable, addValueToTable, copyTable, newTable
} from './lookupTable'
import { QuintAssume, QuintConst, QuintLambda, QuintLet, QuintModule, QuintModuleDef, QuintOpDef, QuintTypeDef, QuintVar } from './quintIr'
import { QuintType } from './quintTypes'

/**
 * Built-in name definitions that are always included in definitions collection
 * This is a function instead of a constant to ensure a new instance is generated
 * every call
 */
export function defaultValueDefinitions(): ValueDefinition[] {
  return [
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
    { kind: 'def', identifier: 'allLists' },
    { kind: 'def', identifier: 'chooseSome' },
    { kind: 'def', identifier: 'oneOf' },
    { kind: 'def', identifier: 'isFinite' },
    { kind: 'def', identifier: 'size' },
    { kind: 'def', identifier: 'get' },
    { kind: 'def', identifier: 'put' },
    { kind: 'def', identifier: 'keys' },
    { kind: 'def', identifier: 'mapBy' },
    { kind: 'def', identifier: 'setToMap' },
    { kind: 'def', identifier: 'setOfMaps' },
    { kind: 'def', identifier: 'set' },
    { kind: 'def', identifier: 'setBy' },
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
    { kind: 'def', identifier: 'then' },
    { kind: 'def', identifier: 'repeated' },
    { kind: 'def', identifier: 'assert' },
    { kind: 'def', identifier: 'orKeep' },
    { kind: 'def', identifier: 'mustChange' },
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
    { kind: 'def', identifier: 'Set' },
    { kind: 'def', identifier: 'Map' },
    { kind: 'def', identifier: 'List' },
    { kind: 'def', identifier: 'Tup' },
    { kind: 'def', identifier: 'Rec' },
    { kind: 'def', identifier: 'range' },
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
    { kind: 'def', identifier: 'actionAll' },
    { kind: 'def', identifier: 'actionAny' },
    { kind: 'def', identifier: 'field' },
    { kind: 'def', identifier: 'fieldNames' },
    { kind: 'def', identifier: 'item' },
    { kind: 'def', identifier: 'unionMatch' },
    { kind: 'def', identifier: 'assign' },
    { kind: 'def', identifier: 'of' },
    { kind: 'def', identifier: 'eq' },
    { kind: 'def', identifier: 'neq' },
    { kind: 'def', identifier: 'ite' },
    { kind: 'def', identifier: 'cross' },
    { kind: 'def', identifier: 'difference' },
  ]
}

/**
 * Recursively iterate over a module's definition collecting all names and type aliases
 * into a definition table. Also includes all default definitions for built-in names.
 *
 * @param quintModule the Quint module to have definitions collected from
 *
 * @returns a lookup table with all defined values for the module
 */
export function collectDefinitions(quintModule: QuintModule): LookupTableByModule {
  const visitor = new DefinitionsCollectorVisitor()
  walkModule(visitor, quintModule)
  return visitor.tables
}

class DefinitionsCollectorVisitor implements IRVisitor {
  tables: LookupTableByModule = new Map<string, LookupTable>()

  private currentModuleName: string = ''
  private currentTable: LookupTable = newTable({})
  private moduleStack: string[] = []
  private scopeStack: bigint[] = []

  enterModuleDef(def: QuintModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrentModule()
  }

  exitModuleDef(def: QuintModuleDef): void {
    // Collect all definitions namespaced to module
    const innerModuleTable = copyTable(this.currentTable)

    this.moduleStack.pop()
    this.updateCurrentModule()

    if (this.moduleStack.length > 0) {
      innerModuleTable.valueDefinitions.forEach((defs) => {
        defs.filter(d => !d.scope)
          .forEach(d => this.collectValueDefinition(d.kind, `${def.module.name}::${d.identifier}`, d.reference))
      })

      innerModuleTable.typeDefinitions.forEach((defs) => {
        defs.forEach(d => this.collectTypeDefinition(`${def.module.name}::${d.identifier}`, d.type, d.reference))
      })

      this.collectValueDefinition('module', def.module.name, def.id)
    }
  }

  enterVar(def: QuintVar): void {
    this.collectValueDefinition(def.kind, def.name, def.id)
  }

  enterConst(def: QuintConst): void {
    this.collectValueDefinition(def.kind, def.name, def.id)
  }

  enterOpDef(def: QuintOpDef): void {
    if (this.scopeStack.length > 0) {
      const scope = this.scopeStack[this.scopeStack.length - 1]
      this.collectValueDefinition(def.kind, def.name, def.id, scope)
    } else {
      this.collectValueDefinition(def.kind, def.name, def.id)
    }
  }

  enterTypeDef(def: QuintTypeDef): void {
    this.collectTypeDefinition(def.name, def.type, def.id)
  }

  enterAssume(def: QuintAssume): void {
    this.collectValueDefinition('assumption', def.name, def.id)
  }

  enterLambda(expr: QuintLambda): void {
    expr.params.forEach(p => {
      this.collectValueDefinition('param', p, expr.id, expr.id)
    })
  }

  enterLet(def: QuintLet): void {
    this.scopeStack.push(def.id)
  }

  exitLet(_: QuintLet): void {
    this.scopeStack.pop()
  }

  private collectValueDefinition(
    kind: ValueDefinitionKind, identifier: string, reference?: bigint, scope?: bigint
  ): void {
    if (identifier === '_') {
      // Don't collect underscores, as they are special identifiers that allow no usage
      return
    }

    const def: ValueDefinition = {
      kind,
      identifier,
      reference,
      scope,
    }

    addValueToTable(def, this.currentTable)
  }

  private collectTypeDefinition(identifier: string, type?: QuintType, reference?: bigint): void {
    const def = {
      identifier,
      type,
      reference,
    }

    addTypeToTable(def, this.currentTable)
  }

  private updateCurrentModule(): void {
    if (this.moduleStack.length > 0) {
      this.currentModuleName = this.moduleStack[this.moduleStack.length - 1]

      let moduleTable = this.tables.get(this.currentModuleName)
      if (!moduleTable) {
        // Initialize module tables with a copy from default definitions
        moduleTable = newTable({ valueDefinitions: defaultValueDefinitions() })
        this.tables.set(this.currentModuleName, moduleTable)
      }
      this.currentTable = moduleTable
    }
  }
}
