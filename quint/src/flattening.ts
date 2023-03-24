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

import { IdGenerator } from "./idGenerator"
import { LookupTable } from "./lookupTable"
import { QuintAssume, QuintConst, QuintDef, QuintEx, QuintModule, QuintOpDef, QuintTypeDef, QuintVar, WithOptionalDoc, isAnnotatedDef } from "./quintIr"
import { defaultValueDefinitions } from "./definitionsCollector"
import { definitionToString } from "./IRprinting"
import { QuintType, Row } from "./quintTypes"
import { Loc } from "./quintParserFrontend"

/**
 * Flatten a module, replacing instances and (todo) imports with their definitions.
 *
 * @param module The module to flatten
 * @param table The lookup table to for all refered names
 * @param importedModules The map of all refered modules
 *
 * @returns The flattened module
 */
export function flatten(
  module: QuintModule,
  table: LookupTable,
  importedModules: Map<string, QuintModule>,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>
): QuintModule {
  const builtinNames = new Set(defaultValueDefinitions().map(d => d.identifier))

  const context = { idGenerator, table, builtinNames, sourceMap }

  const newDefs = module.defs.reduce((newDefs, def) => {
    if (isFlattened(def)) {
      // Not an instance or import, keep the same def
      newDefs.push(def)
      return newDefs
    }

    if (def.kind == 'instance') {
      // def is QuintInstance. Replace every parameter with the assigned expression.
      def.overrides.forEach(([param, expr]) => {
        const constDef = table.get(param.id)!
        const name = namespacedName(def.qualifiedName, param.name)
        const typeAnnotation = constDef.typeAnnotation
          ? addNamespaceToType(context, def.qualifiedName, constDef.typeAnnotation)
          : undefined

        newDefs.push({
          kind: 'def',
          qualifier: 'pureval',
          name,
          expr,
          typeAnnotation,
          id: getNewIdWithSameLoc(context, param.id),
        })
      })
    }

    const moduleNameToFlatten = def.kind == 'import' ? def.path : def.protoName
    const protoModule = importedModules.get(moduleNameToFlatten)!
    const defsToFlatten = def.kind == 'instance' ? protoModule.defs : filterDefs(protoModule.defs, def.name)

    defsToFlatten.forEach(protoDef => {
      if (alreadyDefined(newDefs, def.qualifiedName, protoDef)) {
        // Previously defined by an override, don't push it again
        return
      }

      newDefs.push(flattenDef(context, protoDef, def.qualifiedName))
    })

    return newDefs
  }, [] as DefAfterFlattening[])

  return { ...module, defs: newDefs }
}

function filterDefs(defs: QuintDef[], name: string): QuintDef[] {
  if (name === '*') {
    return defs
  }

  return defs.filter(def => isFlattened(def) && def.name === name)
}

function alreadyDefined(newDefs: DefAfterFlattening[], qualifier: string | undefined, def: QuintDef) {
  if (!isFlattened(def)) {
    throw new Error(`Impossible: ${definitionToString(def)} should have been flattened already`)
  }

  return newDefs.some(d => d.name === namespacedName(qualifier, def.name))
}


function flattenDef(ctx: FlatteningContext, def: QuintDef, qualifier: string | undefined): DefAfterFlattening {
  if (!isFlattened(def)) {
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

type DefAfterFlattening = (
  QuintOpDef
  | QuintConst
  | QuintVar
  | QuintAssume
  | QuintTypeDef
) & WithOptionalDoc

function isFlattened(def: QuintDef): def is DefAfterFlattening {
  return def.kind !== 'instance' && def.kind !== 'import'
}

interface FlatteningContext {
  idGenerator: IdGenerator,
  table: LookupTable,
  builtinNames: Set<string>,
  sourceMap: Map<bigint, Loc>
}

function addNamespaceToDef(ctx: FlatteningContext, name: string | undefined, def: QuintDef): DefAfterFlattening {
  switch (def.kind) {
    case 'def':
      return addNamespaceToOpDef(ctx, name, def)
    case 'assume':
      return {
        ...def,
        name: namespacedName(name, def.name),
        assumption: addNamespaceToExpr(ctx, name, def.assumption),
        id: getNewIdWithSameLoc(ctx, def.id),
      }
    case 'const':
    case 'var':
      return { ...def, name: namespacedName(name, def.name), id: getNewIdWithSameLoc(ctx, def.id) }
    case 'typedef':
      return {
        ...def,
        name: namespacedName(name, def.name),
        type: def.type ? addNamespaceToType(ctx, name, def.type) : undefined,
        id: getNewIdWithSameLoc(ctx, def.id),
      }
    case 'instance':
      throw new Error(`Instance in ${definitionToString(def)} should have been flatenned already`)
    case 'import':
      throw new Error(`Import in ${definitionToString(def)} should have been flatenned already`)
  }
}

function addNamespaceToOpDef(ctx: FlatteningContext, name: string | undefined, opdef: QuintOpDef): QuintOpDef {
  return {
    ...opdef,
    name: namespacedName(name, opdef.name),
    expr: addNamespaceToExpr(ctx, name, opdef.expr),
    id: getNewIdWithSameLoc(ctx, opdef.id),
  }
}

function addNamespaceToExpr(ctx: FlatteningContext, name: string | undefined, expr: QuintEx): QuintEx {
  const id = getNewIdWithSameLoc(ctx, expr.id)

  switch (expr.kind) {
    case 'name':
      if (shouldAddNamespace(ctx, expr.name, expr.id)) {
        return { ...expr, name: namespacedName(name, expr.name), id }
      }

      return { ...expr, id }
    case 'bool':
    case 'int':
    case 'str':
      return { ...expr, id }
    case 'app': {
      if (shouldAddNamespace(ctx, expr.opcode, expr.id)) {
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
        params: expr.params.map(param => ({ ...param, id: getNewIdWithSameLoc(ctx, param.id) })),
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
  const id = type.id ? getNewIdWithSameLoc(ctx, type.id) : undefined

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
    ...row, fields: row.fields.map(field => {
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
 * @returns false if the name is a builtin or a parameter, true otherwise
 */
function shouldAddNamespace(ctx: FlatteningContext, name: string, id: bigint): boolean {
  if (ctx.builtinNames.has(name)) {
    return false
  }

  const def = ctx.table.get(id)
  if (!def) {
    throw new Error(`Could not find def for id ${id}, name: ${name}`)
  }

  if (def.kind === 'param') {
    return false
  }

  return true
}

function getNewIdWithSameLoc(ctx: FlatteningContext, id: bigint): bigint {
  const newId = ctx.idGenerator.nextId()
  ctx.sourceMap.set(newId, ctx.sourceMap.get(id)!)
  return newId
}
