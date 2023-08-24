import { compact } from 'lodash'
import { IdGenerator } from '../idGenerator'
import { IRTransformer, transformDefinition, transformModule } from '../ir/IRTransformer'
import { addNamespaceToDefinition } from '../ir/namespacer'
import { QuintApp, QuintDeclaration, QuintDef, QuintImport, QuintModule, QuintName, isDef } from '../ir/quintIr'
import { LookupTable, builtinNames } from '../names/base'
import { Loc } from '../parsing/quintParserFrontend'
import { AnalysisOutput } from '../quintAnalyzer'
import { dependentDefinitions, getNamespaceForDef } from './flattener'
import { generateFreshIds } from '../ir/idRefresher'

export function flattenInstances(
  quintModule: QuintModule,
  modulesByName: Map<string, QuintModule>,
  lookupTable: LookupTable,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): QuintModule[] {
  const flattener = new InstanceFlattener(modulesByName, lookupTable, idGenerator, sourceMap, analysisOutput)
  const moduleCopy: QuintModule = { ...quintModule, declarations: [...quintModule.declarations] }
  const newModule = transformModule(flattener, moduleCopy)
  return [...flattener.newModules, newModule]
}

class InstanceFlattener implements IRTransformer {
  private modulesByName: Map<string, QuintModule>
  private lookupTable: LookupTable
  currentModuleName?: string
  newModules: QuintModule[] = []

  private idGenerator: IdGenerator
  private sourceMap: Map<bigint, Loc>
  private analysisOutput: AnalysisOutput

  constructor(
    modulesByName: Map<string, QuintModule>,
    lookupTable: LookupTable,
    idGenerator: IdGenerator,
    sourceMap: Map<bigint, Loc>,
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
      return expr
    }

    const namespace = getNamespaceForDef(def)
    return { ...expr, name: compact([namespace, def.name]).join('::') }
  }

  enterApp(expr: QuintApp): QuintApp {
    const def = this.lookupTable.get(expr.id)
    if (def?.importedFrom?.kind !== 'instance') {
      return expr
    }

    const namespace = getNamespaceForDef(def)
    return { ...expr, opcode: compact([namespace, def.name]).join('::') }
  }

  exitDecl(decl: QuintDeclaration): QuintDeclaration {
    if (decl.kind !== 'instance') {
      return decl
    }

    const module = this.modulesByName.get(decl.protoName)!
    const newDefs: QuintDef[] = []
    decl.overrides.forEach(([param, ex]) => {
      const defsToAdd = dependentDefinitions(ex, this.modulesByName, this.lookupTable)
      newDefs.push(...defsToAdd)
      if (ex.kind === 'name' && ex.name === param.name) {
        // Special case for instances like `import A(x = x) ...`
        // In this case, the definition for `x` would have already been added by the dependentDefinitions call above
        // so there is no need to add a new definition for `x` here. In fact, that would introduce a conflict,
        return
      }
      newDefs.push({
        kind: 'def',
        qualifier: 'pureval',
        expr: ex,
        id: param.id,
        name: param.name,
        typeAnnotation: this.lookupTable.get(param.id)?.typeAnnotation,
      })
    })

    newDefs.push(
      ...module.declarations.filter(d => d.kind !== 'const').filter(isDef) // is there a case where filter(isDef) is a problem?
    )

    const newName = [this.currentModuleName!, decl.qualifiedName ?? module.name].join('::')

    const transformedDefs = newDefs
      .map(d => addNamespaceToDefinition(d, newName, new Set(builtinNames)))
      .map(d => generateFreshIds(d, this.idGenerator, this.sourceMap, this.analysisOutput))
      .map(d => transformDefinition(this, d))

    this.newModules.push({ ...module, declarations: transformedDefs, name: newName })

    const r: QuintImport = {
      kind: 'import',
      id: decl.id,
      protoName: newName,
      qualifiedName: undefined,
      defName: '*',
    }
    return r
  }
}
