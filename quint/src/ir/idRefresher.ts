import { IRTransformer, transformDefinition } from './IRTransformer'
import { IdGenerator } from '../idGenerator'
import { Loc } from '../parsing/quintParserFrontend'
import { AnalysisOutput } from '../quintAnalyzer'
import { QuintDef, QuintEx, QuintLambda } from './quintIr'
import { QuintType } from './quintTypes'

export function generateFreshIds(
  def: QuintDef,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): QuintDef {
  const transformer = new IdRefresher(idGenerator, sourceMap, analysisOutput)
  return transformDefinition(transformer, def)
}

class IdRefresher implements IRTransformer {
  private idGenerator: IdGenerator
  private sourceMap: Map<bigint, Loc>
  private analysisOutput: AnalysisOutput

  constructor(idGenerator: IdGenerator, sourceMap: Map<bigint, Loc>, analysisOutput: AnalysisOutput) {
    this.idGenerator = idGenerator
    this.sourceMap = sourceMap
    this.analysisOutput = analysisOutput
  }

  /* New ID generation */

  enterDef(def: QuintDef): QuintDef {
    return { ...def, id: this.getNewIdWithSameData(def.id) }
  }

  enterLambda(expr: QuintLambda): QuintLambda {
    return {
      ...expr,
      params: expr.params.map(p => ({ ...p, id: this.getNewIdWithSameData(p.id) })),
    }
  }

  enterExpr(expr: QuintEx): QuintEx {
    return { ...expr, id: this.getNewIdWithSameData(expr.id) }
  }

  enterType(type: QuintType): QuintType {
    if (!type.id) {
      return type
    }

    return { ...type, id: this.getNewIdWithSameData(type.id) }
  }

  private getNewIdWithSameData(id: bigint): bigint {
    const newId = this.idGenerator.nextId()

    const type = this.analysisOutput.types.get(id)
    const effect = this.analysisOutput.effects.get(id)
    const mode = this.analysisOutput.modes.get(id)
    const source = this.sourceMap.get(id)

    if (type) {
      this.analysisOutput.types.set(newId, type)
    }
    if (effect) {
      this.analysisOutput.effects.set(newId, effect)
    }
    if (mode) {
      this.analysisOutput.modes.set(newId, mode)
    }
    if (source) {
      this.sourceMap.set(newId, source)
    }

    return newId
  }
}
