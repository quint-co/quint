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

import { ErrorTree } from "./errorTree"
import { LookupTableByModule } from "./lookupTable"
import { OpQualifier, QuintModule } from "./quintIr"
import { TypeScheme } from "./types/base"
import { TypeInferenceResult, inferTypes } from "./types/inferrer"
import { Effect } from "./effects/base"
import { EffectInferenceResult, inferEffects } from "./effects/inferrer"
import { ModeCheckingResult, checkModes } from "./effects/modeChecker"

/* Products from static analysis */
export type AnalyzisOutput = {
  types: Map<bigint, TypeScheme>,
  effects: Map<bigint, Effect>,
  modes: Map<bigint, OpQualifier>,
}

/* A list of errors and the analysis output */
export type AnalysisResult = [[bigint, ErrorTree][], AnalyzisOutput]

/**
 * Statically analyzes a Quint specification.
 *
 * @param definitionsTable - The lookup tables for the modules.
 * @param modules - The modules of the specification.
 * @returns A list of errors and the analysis output.
 */
export function analyze(definitionsTable: LookupTableByModule, modules: QuintModule[]): AnalysisResult {
  const [typeErrMap, types] = modules.reduce((result: TypeInferenceResult, module) => {
    const resultForModule = inferTypes(definitionsTable, module, result)
    return mergeResults(result, resultForModule)
  }, [new Map<bigint, ErrorTree>(), new Map<bigint, TypeScheme>()])

  const [effectErrMap, effects] = modules.reduce((result: EffectInferenceResult, module) => {
    const resultForModule = inferEffects(definitionsTable, module, result)
    return mergeResults(result, resultForModule)
  }, [new Map<bigint, ErrorTree>(), new Map<bigint, Effect>()])

  const [modeErrMap, modes] = modules.reduce((result: ModeCheckingResult, module) => {
    const resultForModule = checkModes(module, effects, result)
    return mergeResults(result, resultForModule)
  }, [new Map<bigint, ErrorTree>(), new Map<bigint, OpQualifier>()])

  const errors = [...typeErrMap, ...effectErrMap, ...modeErrMap]

  return [errors, { types, effects, modes }]
}

function mergeResults<T>(
  a: [Map<bigint, ErrorTree>, Map<bigint, T>], b: [Map<bigint, ErrorTree>, Map<bigint, T>]
): [Map<bigint, ErrorTree>, Map<bigint, T>] {
  return [new Map([...a[0], ...b[0]]), new Map([...a[1], ...b[1]])]
}
