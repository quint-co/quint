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

import { LookupTableByModule } from "./lookupTable"
import { OpQualifier, QuintModule } from "./quintIr"
import { TypeScheme } from "./types/base"
import { TypeInferrer } from "./types/inferrer"
import { Effect } from "./effects/base"
import { EffectInferrer } from "./effects/inferrer"
import { ModeChecker } from "./effects/modeChecker"
import { QuintError } from "./quintError"
import { errorTreeToString } from "./errorTree"
import { MultipleUpdatesChecker } from "./effects/MultipleUpdatesChecker"

/* Products from static analysis */
export type AnalyzisOutput = {
  types: Map<bigint, TypeScheme>,
  effects: Map<bigint, Effect>,
  modes: Map<bigint, OpQualifier>,
}

/* A tuple with a list of errors and the analysis output */
export type AnalysisResult = [[bigint, QuintError][], AnalyzisOutput]

/**
 * Statically analyzes a Quint specification.
 *
 * This class is stateful and accumulates analyzed data for multiple modules.
 * Use it by calling the analyze method for each module and then calling the
 * getResult method to get the analysis result.
 *
 * @param lookupTable - The lookup tables for the modules.
 */
export class QuintAnalyzer {
  private effectInferrer: EffectInferrer
  private typeInferrer: TypeInferrer
  private modeChecker: ModeChecker
  private multipleUpdatesChecker: MultipleUpdatesChecker

  private errors: [bigint, QuintError][] = []
  private output: AnalyzisOutput = { types: new Map(), effects: new Map(), modes: new Map() }

  constructor(lookupTable: LookupTableByModule) {
    this.typeInferrer = new TypeInferrer(lookupTable)
    this.effectInferrer = new EffectInferrer(lookupTable)
    this.multipleUpdatesChecker = new MultipleUpdatesChecker()
    this.modeChecker = new ModeChecker()
  }

  analyze(module: QuintModule): void {
    const [typeErrMap, types] = this.typeInferrer.inferTypes(module)
    const [effectErrMap, effects] = this.effectInferrer.inferEffects(module)
    const updatesErrMap = this.multipleUpdatesChecker.checkEffects([...effects.values()])
    const [modeErrMap, modes] = this.modeChecker.checkModes(module, effects)

    const errorTrees = [...typeErrMap, ...effectErrMap]

    // TODO: Type and effec checking should return QuintErrors instead of error trees
    this.errors.push(...errorTrees.map(([id, err]): [bigint, QuintError] => {
      return [id, { code: 'QNT000', message: errorTreeToString(err), data: { trace: err } }]
    }))

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
