/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * This module is a wrapper for Quint's static analysis.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { LookupTable } from './lookupTable'
import { OpQualifier, QuintDef, QuintModule } from './quintIr'
import { TypeScheme } from './types/base'
import { TypeInferrer } from './types/inferrer'
import { EffectScheme } from './effects/base'
import { EffectInferrer } from './effects/inferrer'
import { ModeChecker } from './effects/modeChecker'
import { QuintError } from './quintError'
import { errorTreeToString } from './errorTree'
import { MultipleUpdatesChecker } from './effects/MultipleUpdatesChecker'

/* Products from static analysis */
export type AnalysisOutput = {
  types: Map<bigint, TypeScheme>
  effects: Map<bigint, EffectScheme>
  modes: Map<bigint, OpQualifier>
}

/* A tuple with a list of errors and the analysis output */
export type AnalysisResult = [[bigint, QuintError][], AnalysisOutput]

/**
 * Analyzes multiple Quint modules and returns the analysis result.
 *
 * @param lookupTable - The lookup tables for the modules.
 * @param quintModules - The Quint modules to be analyzed.
 * @returns A tuple with a list of errors and the analysis output.
 */
export function analyzeModules(lookupTable: LookupTable, quintModules: QuintModule[]): AnalysisResult {
  const analyzer = new QuintAnalyzer(lookupTable)
  quintModules.map(m => analyzer.analyze(m))
  return analyzer.getResult()
}

/**
 * Analyzes a single Quint definition incrementally and returns the analysis result.
 *
 * @param analysisOutput - The previous analysis output to be used as a starting point.
 * @param lookupTable - The lookup tables for the modules.
 * @param def - The Quint definition to be analyzed.
 * @returns A tuple with a list of errors and the analysis output.
 */
export function analyzeInc(analysisOutput: AnalysisOutput, lookupTable: LookupTable, def: QuintDef): AnalysisResult {
  const analyzer = new QuintAnalyzer(lookupTable, analysisOutput)
  analyzer.analyzeDef(def)
  return analyzer.getResult()
}

/**
 * Statically analyzes a Quint specification.
 *
 * This class is stateful and accumulates analyzed data for multiple modules.
 * Use it by calling the analyze method for each module and then calling the
 * getResult method to get the analysis result.
 *
 * @param lookupTable - The lookup tables for the modules.
 * @param previousOutput - The previous analysis output to be used as a starting point.
 */
class QuintAnalyzer {
  private effectInferrer: EffectInferrer
  private typeInferrer: TypeInferrer
  private modeChecker: ModeChecker
  private multipleUpdatesChecker: MultipleUpdatesChecker

  private errors: [bigint, QuintError][] = []
  private output: AnalysisOutput = { types: new Map(), effects: new Map(), modes: new Map() }

  constructor(lookupTable: LookupTable, previousOutput?: AnalysisOutput) {
    this.typeInferrer = new TypeInferrer(lookupTable, previousOutput?.types)
    this.effectInferrer = new EffectInferrer(lookupTable, previousOutput?.effects)
    this.multipleUpdatesChecker = new MultipleUpdatesChecker()
    this.modeChecker = new ModeChecker(previousOutput?.modes)
  }

  analyze(module: QuintModule): void {
    const [typeErrMap, types] = this.typeInferrer.inferTypes(module.defs)
    const [effectErrMap, effects] = this.effectInferrer.inferEffects(module.defs)
    const updatesErrMap = this.multipleUpdatesChecker.checkEffects([...effects.values()])
    const [modeErrMap, modes] = this.modeChecker.checkModes(module.defs, effects)

    const errorTrees = [...typeErrMap, ...effectErrMap]

    // TODO: Type and effect checking should return QuintErrors instead of error trees
    this.errors.push(
      ...errorTrees.map(([id, err]): [bigint, QuintError] => {
        return [id, { code: 'QNT000', message: errorTreeToString(err), data: { trace: err } }]
      })
    )

    this.errors.push(...modeErrMap.entries(), ...updatesErrMap.entries())

    // We assume that ids are unique across modules, and map merging can be done
    // without collision checks
    this.output = {
      types: new Map([...this.output.types, ...types]),
      effects: new Map([...this.output.effects, ...effects]),
      modes: new Map([...this.output.modes, ...modes]),
    }
  }

  analyzeDef(def: QuintDef): void {
    const [typeErrMap, types] = this.typeInferrer.inferTypes([def])
    const [effectErrMap, effects] = this.effectInferrer.inferEffects([def])
    const updatesErrMap = this.multipleUpdatesChecker.checkEffects([...effects.values()])
    const [modeErrMap, modes] = this.modeChecker.checkModes([def], effects)

    const errorTrees = [...typeErrMap, ...effectErrMap]

    // TODO: Type and effec checking should return QuintErrors instead of error trees
    this.errors.push(
      ...errorTrees.map(([id, err]): [bigint, QuintError] => {
        return [id, { code: 'QNT000', message: errorTreeToString(err), data: { trace: err } }]
      })
    )

    this.errors.push(...modeErrMap.entries(), ...updatesErrMap.entries())

    // We assume that ids are unique across modules, and map merging can be done
    // without collision checks
    this.output = {
      types: new Map([...this.output.types, ...types]),
      effects: new Map([...this.output.effects, ...effects]),
      modes: new Map([...this.output.modes, ...modes]),
    }
  }

  getResult(): AnalysisResult {
    return [this.errors, this.output]
  }
}
