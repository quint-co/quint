/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Inlining for type aliases, to be used when resolving type aliases with the
 * lookup table is not feasible.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformDefinition, transformModule, transformType } from '../IRTransformer'
import { LookupTable } from '../names/lookupTable'
import { QuintDef, QuintModule } from '../quintIr'
import { QuintType } from '../quintTypes'

/**
 * Replaces all type aliases in a QuintModule with their resolved types, using
 * the provided LookupTable. Uninterpreted types are left unchanged.
 *
 * @param lookupTable - The LookupTable containing the type aliases to be
 * resolved.
 * @param quintModule - The QuintModule to transform.
 *
 * @returns The transformed QuintModule with all type aliases replaced with
 * their resolved types.
 */
export function inlineAliases(quintModule: QuintModule, lookupTable: LookupTable): QuintModule {
  const inliner = new AliasInliner(lookupTable)
  return transformModule(inliner, quintModule)
}

/**
 * Inlines type aliases in a QuintType using the provided LookupTable.
 *
 * @param lookupTable - The LookupTable containing the type aliases to be
 * resolved.
 * @param type - The QuintType to transform.
 *
 * @returns The transformed QuintType with all type aliases replaced with
 * their resolved types.
 */
export function inlineAliasesInType(type: QuintType, lookupTable: LookupTable): QuintType {
  const inliner = new AliasInliner(lookupTable)
  return transformType(inliner, type)
}

/**
 * Inlines type aliases in a QuintDef using the provided LookupTable.
 *
 * @param lookupTable - The LookupTable containing the type aliases to be
 * resolved.
 * @param def - The QuintDef to transform.
 *
 * @returns The transformed QuintDef with all type aliases replaced with
 * their resolved types.
 */
export function inlineAliasesInDef(def: QuintDef, lookupTable: LookupTable): QuintDef {
  const inliner = new AliasInliner(lookupTable)
  return transformDefinition(inliner, def)
}

class AliasInliner implements IRTransformer {
  private lookupTable: LookupTable

  constructor(lookupTable: LookupTable) {
    this.lookupTable = lookupTable
  }

  enterType(type: QuintType): QuintType {
    return resolveAlias(this.lookupTable, type)
  }
}

function resolveAlias(lookupTable: LookupTable, type: QuintType): QuintType {
  if (type.kind === 'const' && type.id) {
    const aliasValue = lookupTable.get(type.id)
    if (aliasValue && aliasValue.typeAnnotation) {
      return resolveAlias(lookupTable, aliasValue.typeAnnotation)
    }
  }
  return type
}
