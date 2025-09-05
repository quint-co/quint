/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Inlining for type aliases, to be used when resolving type aliases with the
 * lookup table is not feasible.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformDefinition, transformModule, transformType } from '../ir/IRTransformer'
import { LookupDefinition, LookupTable } from '../names/base'
import { AnalysisOutput } from '../quintAnalyzer'
import { QuintDef, QuintModule } from '../ir/quintIr'
import { QuintType } from '../ir/quintTypes'

/**
 * Inlines all type aliases in a set of QuintModules, LookupTable and AnalysisOutput.
 *
 * @param modules - The array of QuintModules to transform.
 * @param table - The LookupTable containing the type aliases to be resolved.
 * @param analysisOutput - The AnalysisOutput to transform.
 *
 * @returns An object containing the transformed QuintModules, LookupTable and AnalysisOutput.
 */
export function inlineTypeAliases(
  modules: QuintModule[],
  table: LookupTable,
  analysisOutput: AnalysisOutput
): { modules: QuintModule[]; table: LookupTable; analysisOutput: AnalysisOutput } {
  const modulesWithInlinedAliases = modules.map(m => inlineAliasesInModule(m, table))
  const tableWithInlinedAliases = new Map(
    [...table.entries()].map(([id, def]): [bigint, LookupDefinition] => {
      if (def.kind === 'param') {
        const typeAnnotation = def.typeAnnotation ? inlineAliasesInType(def.typeAnnotation, table) : undefined
        return [id, { ...def, typeAnnotation }]
      }

      return [id, inlineAliasesInDef(def, table)]
    })
  )

  return {
    modules: modulesWithInlinedAliases,
    table: tableWithInlinedAliases,
    analysisOutput: inlineAnalysisOutput(analysisOutput, table),
  }
}

/**
 * Inlines all type aliases in the AnalysisOutput using the provided LookupTable.
 *
 * @param analysisOutput - The AnalysisOutput to transform.
 * @param table - The LookupTable containing the type aliases to be resolved.
 *
 * @returns The transformed AnalysisOutput with all type aliases replaced with their resolved types.
 */
export function inlineAnalysisOutput(analysisOutput: AnalysisOutput, table: LookupTable): AnalysisOutput {
  const typesWithInlinedAliases = new Map(
    [...analysisOutput.types.entries()].map(([id, typeScheme]) => {
      const inlinedType = inlineAliasesInType(typeScheme.type, table)
      return [id, { ...typeScheme, type: inlinedType }]
    })
  )
  const analysisOutputWithInlinedAliases: AnalysisOutput = {
    ...analysisOutput,
    types: typesWithInlinedAliases,
  }

  return analysisOutputWithInlinedAliases
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
function inlineAliasesInModule(quintModule: QuintModule, lookupTable: LookupTable): QuintModule {
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
function inlineAliasesInType(type: QuintType, lookupTable: LookupTable): QuintType {
  const inliner = new AliasInliner(lookupTable)
  return transformType(inliner, type)
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

export function resolveAlias(lookupTable: LookupTable, type: QuintType): QuintType {
  if (type.kind === 'const' && type.id) {
    const aliasValue = lookupTable.get(type.id)
    if (aliasValue && aliasValue.kind === 'typedef' && aliasValue.type) {
      return resolveAlias(lookupTable, aliasValue.type)
    }
  }
  return type
}
