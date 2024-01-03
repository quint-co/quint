/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for instances, creating a new module for each instance and updating names.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { compact, flow } from 'lodash'
import { IdGenerator } from '../idGenerator'
import { IRTransformer, transformModule } from '../ir/IRTransformer'
import { addNamespaceToDefinition } from '../ir/namespacer'
import { QuintApp, QuintDeclaration, QuintModule, QuintName, isDef } from '../ir/quintIr'
import { LookupTable, builtinNames } from '../names/base'
import { SourceMap } from '../parsing/quintParserFrontend'
import { AnalysisOutput } from '../quintAnalyzer'
import { dependentDefinitions, getNamespaceForDef } from './flattener'
import { generateFreshIds } from '../ir/idRefresher'

/**
 * Flattens instances from a module, creating a new module for each instance, updating names, and replacing the instance
 * declaration with an import. Assumes that the module doesn't have any imports and exports (that is, those were already
 * flattened).
 *
 * @param quintModule The module with instances to flatten
 * @param modulesByName The referenced modules, by name
 * @param lookupTable The lookup table for the module and its dependencies
 * @param idGenerator The id generator to be used for generating fresh ids for the new modules
 * @param sourceMap The source map for the module and its dependencies
 * @param analysisOutput The analysis output for the module and its dependencies
 *
 * @returns The new modules, including the given module (with modifications) and the new modules for the instances
 */
export function flattenInstances(
  quintModule: QuintModule,
  modulesByName: Map<string, QuintModule>,
  lookupTable: LookupTable,
  idGenerator: IdGenerator,
  sourceMap: SourceMap,
  analysisOutput: AnalysisOutput
): QuintModule[] {
  const flattener = new InstanceFlattener(modulesByName, lookupTable, idGenerator, sourceMap, analysisOutput)
  const moduleCopy: QuintModule = { ...quintModule, declarations: [...quintModule.declarations] }
  const newModule = transformModule(flattener, moduleCopy)
  return [...flattener.newModules, newModule]
}

class InstanceFlattener implements IRTransformer {
  // The new modules created by the flattener for each instance.
  newModules: QuintModule[] = []

  private modulesByName: Map<string, QuintModule>
  private lookupTable: LookupTable
  private currentModuleName?: string

  /* Parameters for `generateFreshIds` */
  private idGenerator: IdGenerator
  private sourceMap: SourceMap
  private analysisOutput: AnalysisOutput

  constructor(
    modulesByName: Map<string, QuintModule>,
    lookupTable: LookupTable,
    idGenerator: IdGenerator,
    sourceMap: SourceMap,
    analysisOutput: AnalysisOutput
  ) {
    this.modulesByName = modulesByName
    this.lookupTable = lookupTable
    this.idGenerator = idGenerator
    this.sourceMap = sourceMap
    this.analysisOutput = analysisOutput
  }

  enterModule(quintModule: QuintModule): QuintModule {
    this.currentModuleName = quintModule.name
    return quintModule
  }

  enterName(expr: QuintName): QuintName {
    const def = this.lookupTable.get(expr.id)
    if (def?.importedFrom?.kind !== 'instance') {
      // Don't change anything from names not related to instances
      return expr
    }

    const namespace = getNamespaceForDef(def)
    return { ...expr, name: compact([namespace, def.name]).join('::') }
  }

  enterApp(expr: QuintApp): QuintApp {
    const def = this.lookupTable.get(expr.id)
    if (def?.importedFrom?.kind !== 'instance') {
      // Don't change anything from names not related to instances
      return expr
    }

    const namespace = getNamespaceForDef(def)
    return { ...expr, opcode: compact([namespace, def.name]).join('::') }
  }

  exitDecl(decl: QuintDeclaration): QuintDeclaration {
    if (decl.kind !== 'instance') {
      // We just want to transform instances. However, it is not possible to use `exitInstance` since that requires us
      // to return an instance, and in this case we want to return an import. So we use `exitDecl` and ignore
      // non-instances.
      return decl
    }

    const protoModule = this.modulesByName.get(decl.protoName)!

    // We are going to construct a new module.
    const newModuleDecls: QuintDeclaration[] = []

    // A unique name for the new module. To ensure uniqueness, we add the source of the instance (the current module) to
    // the name, as well as the qualifier (or the proto name itself, if no qualifier is present)
    // If the current module is named "myModule":
    // - The module for `import A.*` will be named `myModule::A`
    // - The module for `import A as B.*` will be named `myModule::B`
    const newName = [this.currentModuleName!, decl.qualifiedName ?? protoModule.name].join('::')

    decl.overrides.forEach(([param, expr]) => {
      // Find dependencies of `expr` and add those to the new module
      newModuleDecls.push(...dependentDefinitions(expr, this.lookupTable))

      // Add a definition for the parameter, which replaces the constant in the proto module.
      newModuleDecls.push({
        kind: 'def',
        qualifier: 'pureval',
        expr: expr,
        id: param.id,
        name: [newName, param.name].join('::'),
        typeAnnotation: this.lookupTable.get(param.id)?.typeAnnotation,
      })
    })

    // We will copy everything but the constants, since we already introduce definitions to replace the constants
    const protoDeclarations = protoModule.declarations.filter(d => d.kind !== 'const')

    const transformedDecls = protoDeclarations.map(decl => {
      if (!isDef(decl)) {
        // Keep imports/exports/instances as is
        // TODO: further test and explore scenarios where the proto module has imports/exports/instances
        return decl
      }

      // `flow` is used to compose functions, so that we can apply multiple transformations to the definition.
      return flow(
        // Add the new module's name as the namespace, to make sure the defs are uniquely identified and won't conflict
        // with other defs in the module (i.e. from other instance). Those will be imported without a qualifier.
        d => addNamespaceToDefinition(d, newName, new Set(builtinNames)),
        // Generate new ids for the definition and its subcomponents, since the same definition in different instances
        // might evaluate to different values.
        d => generateFreshIds(d, this.idGenerator, this.sourceMap, this.analysisOutput)
      )(decl)
    })

    newModuleDecls.push(...transformedDecls)

    this.newModules.push({ ...protoModule, declarations: newModuleDecls, name: newName })

    // Return the import statement for the new module, which replaces the instance declaration.
    return { kind: 'import', id: decl.id, protoName: newName, defName: '*' }
  }
}
