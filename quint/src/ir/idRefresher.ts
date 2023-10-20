/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Generation of fresh ids for IR components. This is used to generate fresh ids for
 * modules generate from instances, enabling them to assume different values in evaluation.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformDefinition } from './IRTransformer'
import { IdGenerator } from '../idGenerator'
import { SourceMap } from '../parsing/quintParserFrontend'
import { AnalysisOutput } from '../quintAnalyzer'
import { QuintDef, QuintEx, QuintLambda } from './quintIr'
import { QuintType } from './quintTypes'

/**
 * Given a QuintDef, generates fresh IDs for all its components using the
 * provided IdGenerator. Returns a new QuintDef with the updated IDs. Also extends
 * the provided source map and analysis output, such that they contain the respective
 * entries under both their old and new IDs.
 *
 * @param def - The QuintDef to update with fresh IDs.
 * @param idGenerator - The IdGenerator to use for generating fresh IDs.
 * @param sourceMap - A source map to be updated with sources for the new ids
 *   (should contain entries for the existing ids)
 * @param analysisOutput - An analysis output to be updated with analysis for the new ids
 *   (should contain entries for the existing ids)
 * @returns A new QuintDef with fresh IDs.
 */
export function generateFreshIds(
  def: QuintDef,
  idGenerator: IdGenerator,
  sourceMap: SourceMap,
  analysisOutput: AnalysisOutput
): QuintDef {
  const transformer = new IdRefresher(idGenerator, sourceMap, analysisOutput)
  return transformDefinition(transformer, def)
}

class IdRefresher implements IRTransformer {
  private idGenerator: IdGenerator
  private sourceMap: SourceMap
  private analysisOutput: AnalysisOutput

  constructor(idGenerator: IdGenerator, sourceMap: SourceMap, analysisOutput: AnalysisOutput) {
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
