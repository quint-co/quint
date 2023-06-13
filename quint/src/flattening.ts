/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for modules, replacing instances and (soon) imports with their definitions.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IdGenerator } from './idGenerator'
import { LookupTable } from './lookupTable'
import {
  FlatDef,
  FlatModule,
  QuintDef,
  QuintEx,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintOpDef,
  isAnnotatedDef,
  isFlat,
} from './quintIr'
import { defaultValueDefinitions } from './definitionsCollector'
import { definitionToString } from './IRprinting'
import { QuintType, Row } from './quintTypes'
import { Loc, parsePhase3importAndNameResolution } from './quintParserFrontend'
import { compact, uniqBy } from 'lodash'
import { AnalysisOutput } from './quintAnalyzer'

interface FlatteningContext {
  idGenerator: IdGenerator
  table: LookupTable
  currentModuleNames: Set<string>
  sourceMap: Map<bigint, Loc>
  analysisOutput: AnalysisOutput
  importedModules: Map<string, QuintModule>
}

/**
 * Flatten an array of modules, replacing instances, imports and exports with their definitions.
 *
 * @param modules The modules to flatten
 * @param table The lookup table to for all referred names
 * @param idGenerator The id generator to use for new definitions
 * @param sourceMap The source map for all modules involved
 * @param analysisOutput The analysis output for all modules involved
 *
 * @returns An object containing the flattened modules, flattened lookup table and flattened analysis output
 */
export function flattenModules(
  modules: QuintModule[],
  table: LookupTable,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): { flattenedModules: FlatModule[]; flattenedTable: LookupTable; flattenedAnalysis: AnalysisOutput } {
  const importedModules = new Map(modules.map(m => [m.name, m]))

  // FIXME: use copies of parameters so the original objects are not mutated.
  // This is not a problem atm, but might be in the future.

  // Reduce the array of modules to a single object containing the flattened
  // modules, flattened lookup table and flattened analysis output
  return modules.reduce(
    (acc, module) => {
      const { flattenedModules, flattenedTable, flattenedAnalysis } = acc

      // Flatten the current module
      const flattened = flatten(module, flattenedTable, importedModules, idGenerator, sourceMap, flattenedAnalysis)

      // Add the flattened module to the imported modules map
      importedModules.set(module.name, flattened)

      // The lookup table has to be updated for every new module that is flattened
      // Since the flattened modules have new ids for both the name expressions
      // and their definitions, and the next iteration might depend on an updated
      // lookup table
      const newEntries = parsePhase3importAndNameResolution({ modules: [flattened], sourceMap })
        .mapLeft(errors => {
          // This should not happen, as the flattening should not introduce any
          // errors, since parsePhase3 analysis of the original modules has already
          // assured all names are correct.
          throw new Error(`Error on resolving names for flattened modules: ${errors.map(e => e.explanation)}`)
        })
        .unwrap().table

      // Return the updated flattened modules, flattened lookup table and flattened analysis output
      return {
        flattenedModules: [...flattenedModules, flattened],
        flattenedTable: new Map([...flattenedTable.entries(), ...newEntries.entries()]),
        flattenedAnalysis: flattenedAnalysis,
      }
    },
    { flattenedModules: [] as FlatModule[], flattenedTable: table, flattenedAnalysis: analysisOutput }
  )
}

export function flattenDef(context: FlatteningContext, def: QuintDef): FlatDef[] {
  if (isFlat(def)) {
    // Not an instance, import or export, keep the same def
    return [def]
  }

  if (def.kind === 'instance') {
    return flattenInstance(context, def)
  }

  return flattenImportOrExport(context, def)
}

export function buildFlatteningContext(
  module: QuintModule,
  table: LookupTable,
  importedModules: Map<string, QuintModule>,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): FlatteningContext {
  const currentModuleNames = new Set([
    // builtin names
    ...defaultValueDefinitions().map(d => d.identifier),
    // names from the current module
    ...compact(module.defs.map(d => (isFlat(d) ? d.name : undefined))),
  ])

  return { idGenerator, table, currentModuleNames, sourceMap, analysisOutput, importedModules }
}

function flatten(
  module: QuintModule,
  table: LookupTable,
  importedModules: Map<string, QuintModule>,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): FlatModule {
  const context = buildFlatteningContext(module, table, importedModules, idGenerator, sourceMap, analysisOutput)
  const newDefs = module.defs.flatMap(def => flattenDef(context, def))

  return { ...module, defs: uniqBy(newDefs, 'name') }
}

function flattenInstance(context: FlatteningContext, def: QuintInstance): FlatDef[] {
  // Build pure val definitions from overrides to replace the constants in the
  // instance. Index them by name to make it easier to replace the corresponding constants.
  const overrides: Map<string, FlatDef> = new Map(
    def.overrides.map(([param, expr]) => {
      const constDef = context.table.get(param.id)!

      return [
        param.name,
        {
          kind: 'def',
          qualifier: 'pureval',
          name: param.name,
          expr,
          typeAnnotation: constDef.typeAnnotation,
          id: param.id,
        },
      ]
    })
  )

  const protoModule = context.importedModules.get(def.protoName)!

  // Overrides replace the original constant definitions, in the same position as they appear originally
  const newProtoDefs = protoModule.defs.map(d => {
    if (isFlat(d) && overrides.has(d.name)) {
      return overrides.get(d.name)!
    }

    return d
  })

  // Add the new defs to the modules table under the instance name
  if (def.qualifiedName) {
    context.importedModules.set(def.qualifiedName, { ...protoModule, defs: newProtoDefs })
  }

  return newProtoDefs.map(protoDef => copyDef(context, protoDef, def.qualifiedName))
}

function flattenImportOrExport(context: FlatteningContext, def: QuintImport | QuintExport): FlatDef[] {
  const qualifiedName = def.defName ? undefined : def.qualifiedName ?? def.protoName

  const protoModule = context.importedModules.get(def.protoName)!

  // Add the new defs to the modules table under the qualified name
  if (qualifiedName) {
    context.importedModules.set(qualifiedName, { ...protoModule, name: qualifiedName })
  }

  const defsToFlatten = filterDefs(protoModule.defs, def.defName)

  return defsToFlatten.map(protoDef => copyDef(context, protoDef, qualifiedName))
}

function filterDefs(defs: QuintDef[], name: string | undefined): QuintDef[] {
  if (!name || name === '*') {
    return defs
  }

  return defs.filter(def => isFlat(def) && def.name === name)
}

function copyDef(ctx: FlatteningContext, def: QuintDef, qualifier: string | undefined): FlatDef {
  if (!isFlat(def)) {
    throw new Error(`Impossible: ${definitionToString(def)} should have been flattened already`)
  }

  if (!isAnnotatedDef(def)) {
    return addNamespaceToDef(ctx, qualifier, def)
  }

  const type = addNamespaceToType(ctx, qualifier, def.typeAnnotation)
  const newDef = addNamespaceToDef(ctx, qualifier, def)
  if (!isAnnotatedDef(newDef)) {
    throw new Error(`Impossible: transformation should preserve kind`)
  }

  return { ...newDef, typeAnnotation: type }
}

function addNamespaceToDef(ctx: FlatteningContext, name: string | undefined, def: QuintDef): FlatDef {
  switch (def.kind) {
    case 'def':
      return addNamespaceToOpDef(ctx, name, def)
    case 'assume':
      return {
        ...def,
        name: namespacedName(name, def.name),
        assumption: addNamespaceToExpr(ctx, name, def.assumption),
        id: getNewIdWithSameData(ctx, def.id),
      }
    case 'const':
    case 'var':
      return { ...def, name: namespacedName(name, def.name), id: getNewIdWithSameData(ctx, def.id) }
    case 'typedef':
      return {
        ...def,
        name: namespacedName(name, def.name),
        type: def.type ? addNamespaceToType(ctx, name, def.type) : undefined,
        id: getNewIdWithSameData(ctx, def.id),
      }
    case 'instance':
      throw new Error(`Instance in ${definitionToString(def)} should have been flatenned already`)
    case 'import':
      throw new Error(`Import in ${definitionToString(def)} should have been flatenned already`)
    case 'export':
      throw new Error(`Export in ${definitionToString(def)} should have been flatenned already`)
  }
}

function addNamespaceToOpDef(ctx: FlatteningContext, name: string | undefined, opdef: QuintOpDef): QuintOpDef {
  return {
    ...opdef,
    name: namespacedName(name, opdef.name),
    expr: addNamespaceToExpr(ctx, name, opdef.expr),
    id: getNewIdWithSameData(ctx, opdef.id),
  }
}

function addNamespaceToExpr(ctx: FlatteningContext, name: string | undefined, expr: QuintEx): QuintEx {
  const id = getNewIdWithSameData(ctx, expr.id)

  switch (expr.kind) {
    case 'name':
      if (shouldAddNamespace(ctx, expr.name)) {
        return { ...expr, name: namespacedName(name, expr.name), id }
      }

      return { ...expr, id }
    case 'bool':
    case 'int':
    case 'str':
      return { ...expr, id }
    case 'app': {
      if (shouldAddNamespace(ctx, expr.opcode)) {
        return {
          ...expr,
          opcode: namespacedName(name, expr.opcode),
          args: expr.args.map(arg => addNamespaceToExpr(ctx, name, arg)),
          id,
        }
      }

      return {
        ...expr,
        args: expr.args.map(arg => addNamespaceToExpr(ctx, name, arg)),
        id,
      }
    }
    case 'lambda':
      return {
        ...expr,
        params: expr.params.map(param => ({
          name: namespacedName(name, param.name),
          id: getNewIdWithSameData(ctx, param.id),
        })),
        expr: addNamespaceToExpr(ctx, name, expr.expr),
        id,
      }

    case 'let':
      return {
        ...expr,
        opdef: addNamespaceToOpDef(ctx, name, expr.opdef),
        expr: addNamespaceToExpr(ctx, name, expr.expr),
        id,
      }
  }
}

function addNamespaceToType(ctx: FlatteningContext, name: string | undefined, type: QuintType): QuintType {
  const id = type.id ? getNewIdWithSameData(ctx, type.id) : undefined

  switch (type.kind) {
    case 'bool':
    case 'int':
    case 'str':
    case 'var':
      return { ...type, id }
    case 'const':
      return { ...type, name: namespacedName(name, type.name), id }
    case 'set':
    case 'list':
      return { ...type, elem: addNamespaceToType(ctx, name, type.elem), id }
    case 'fun':
      return {
        ...type,
        arg: addNamespaceToType(ctx, name, type.arg),
        res: addNamespaceToType(ctx, name, type.res),
        id,
      }
    case 'oper':
      return {
        ...type,
        args: type.args.map(arg => addNamespaceToType(ctx, name, arg)),
        res: addNamespaceToType(ctx, name, type.res),
        id,
      }
    case 'tup':
    case 'rec':
      return {
        ...type,
        fields: addNamespaceToRow(ctx, name, type.fields),
        id,
      }
    case 'union':
      return {
        ...type,
        records: type.records.map(record => {
          return {
            ...record,
            fields: addNamespaceToRow(ctx, name, record.fields),
          }
        }),
        id,
      }
  }
}

function addNamespaceToRow(ctx: FlatteningContext, name: string | undefined, row: Row): Row {
  if (row.kind !== 'row') {
    return row
  }

  return {
    ...row,
    fields: row.fields.map(field => {
      return {
        ...field,
        fieldType: addNamespaceToType(ctx, name, field.fieldType),
      }
    }),
  }
}

function namespacedName(namespace: string | undefined, name: string): string {
  return namespace ? `${namespace}::${name}` : name
}

/**
 * Whether a name should be prefixed with the namespace.
 *
 * @param ctx the context with auxiliary information
 * @param name the name to be prefixed
 * @param id the id of the expression in which the name appears
 *
 * @returns false if the name is on the curentModulesName list, true otherwise
 */
function shouldAddNamespace(ctx: FlatteningContext, name: string): boolean {
  if (ctx.currentModuleNames.has(name)) {
    return false
  }

  return true
}

function getNewIdWithSameData(ctx: FlatteningContext, id: bigint): bigint {
  const newId = ctx.idGenerator.nextId()

  const type = ctx.analysisOutput.types.get(id)
  const effect = ctx.analysisOutput.effects.get(id)
  const mode = ctx.analysisOutput.modes.get(id)
  const source = ctx.sourceMap.get(id)

  if (type) {
    ctx.analysisOutput.types.set(newId, type)
  }
  if (effect) {
    ctx.analysisOutput.effects.set(newId, effect)
  }
  if (mode) {
    ctx.analysisOutput.modes.set(newId, mode)
  }
  if (source) {
    ctx.sourceMap.set(newId, source)
  }

  return newId
}
