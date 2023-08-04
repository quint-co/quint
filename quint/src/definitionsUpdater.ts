import { IRTransformer, transformDefinition } from './IRTransformer'
import { IdGenerator } from './idGenerator'
import { Loc } from './parsing/quintParserFrontend'
import { AnalysisOutput } from './quintAnalyzer'
import { QuintApp, QuintDef, QuintEx, QuintLambda, QuintName, isFlat } from './quintIr'
import { QuintConstType } from './quintTypes'

export interface NamespaceAdditionConfig {
  namespace: string
  namesToPreserve: Set<string>
}

export interface NewIdGenerationConfig {
  idGenerator: IdGenerator
  sourceMap: Map<bigint, Loc>
  analysisOutput: AnalysisOutput
}

export function updateDefinition(
  def: QuintDef,
  namespaceAddition?: NamespaceAdditionConfig,
  newIdGeneration?: NewIdGenerationConfig
): QuintDef {
  const updater = new DefinitionsUpdater(namespaceAddition, newIdGeneration)
  return transformDefinition(updater, def)
}

class DefinitionsUpdater implements IRTransformer {
  private namespaceAdditionConfig?: NamespaceAdditionConfig
  private newIdGenerationConfig?: NewIdGenerationConfig

  constructor(namespaceAddition?: NamespaceAdditionConfig, newIdGeneration?: NewIdGenerationConfig) {
    this.namespaceAdditionConfig = namespaceAddition
    this.newIdGenerationConfig = newIdGeneration
  }

  /* New ID generation */

  enterDef(def: QuintDef): QuintDef {
    if (this.newIdGenerationConfig) {
      return { ...def, id: getNewIdWithSameData(this.newIdGenerationConfig, def.id) }
    }

    return def
  }

  enterLambda(expr: QuintLambda): QuintLambda {
    if (this.newIdGenerationConfig) {
      const config = this.newIdGenerationConfig

      return {
        ...expr,
        params: expr.params.map(p => ({ ...p, id: getNewIdWithSameData(config, p.id) })),
      }
    }

    return expr
  }

  enterExpr(expr: QuintEx): QuintEx {
    if (this.newIdGenerationConfig) {
      return { ...expr, id: getNewIdWithSameData(this.newIdGenerationConfig, expr.id) }
    }

    return expr
  }

  /* Namespace addition */

  exitDef(def: QuintDef): QuintDef {
    if (isFlat(def) && this.namespaceAdditionConfig && !this.namespaceAdditionConfig.namesToPreserve.has(def.name)) {
      return { ...def, name: namespacedName(this.namespaceAdditionConfig.namespace, def.name) }
    }

    return def
  }

  exitLambda(expr: QuintLambda): QuintLambda {
    if (this.namespaceAdditionConfig) {
      return {
        ...expr,
        params: expr.params.map(p => ({ ...p, name: namespacedName(this.namespaceAdditionConfig!.namespace, p.name) })),
      }
    }

    return expr
  }

  exitName(expr: QuintName): QuintName {
    if (this.namespaceAdditionConfig && !this.namespaceAdditionConfig.namesToPreserve.has(expr.name)) {
      return { ...expr, name: namespacedName(this.namespaceAdditionConfig.namespace, expr.name) }
    }

    return expr
  }

  exitApp(expr: QuintApp): QuintApp {
    if (this.namespaceAdditionConfig && !this.namespaceAdditionConfig.namesToPreserve.has(expr.opcode)) {
      return { ...expr, opcode: namespacedName(this.namespaceAdditionConfig.namespace, expr.opcode) }
    }

    return expr
  }

  exitConstType(type: QuintConstType): QuintConstType {
    if (this.namespaceAdditionConfig && !this.namespaceAdditionConfig.namesToPreserve.has(type.name)) {
      return { ...type, name: namespacedName(this.namespaceAdditionConfig.namespace, type.name) }
    }

    return type
  }
}

function namespacedName(namespace: string | undefined, name: string): string {
  return namespace ? `${namespace}::${name}` : name
}

function getNewIdWithSameData(config: NewIdGenerationConfig, id: bigint): bigint {
  const newId = config.idGenerator.nextId()

  const type = config.analysisOutput.types.get(id)
  const effect = config.analysisOutput.effects.get(id)
  const mode = config.analysisOutput.modes.get(id)
  const source = config.sourceMap.get(id)

  if (type) {
    config.analysisOutput.types.set(newId, type)
  }
  if (effect) {
    config.analysisOutput.effects.set(newId, effect)
  }
  if (mode) {
    config.analysisOutput.modes.set(newId, mode)
  }
  if (source) {
    config.sourceMap.set(newId, source)
  }

  return newId
}
