/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * This module is a wrapper for Quint's static analysis.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { LookupTable } from './names/base'
import { OpQualifier, QuintDeclaration, QuintModule } from './ir/quintIr'
import { TypeScheme } from './types/base'
import { TypeInferrer } from './types/inferrer'
import { EffectScheme } from './effects/base'
import { EffectInferrer } from './effects/inferrer'
import { ModeChecker } from './effects/modeChecker'
import { QuintError } from './quintError'
import { errorTreeToString } from './errorTree'
import { MultipleUpdatesChecker } from './effects/MultipleUpdatesChecker'
import { TypeApplicationResolver } from './types/typeApplicationResolution'
import { NondetChecker } from './effects/NondetChecker'

/* Products from static analysis */
export type AnalysisOutput = {
  types: Map<bigint, TypeScheme>
  effects: Map<bigint, EffectScheme>
  modes: Map<bigint, OpQualifier>
}

/* A tuple with a list of errors and the analysis output */
export type AnalysisResult = [QuintError[], AnalysisOutput]

/**
 * Analyzes multiple Quint modules and returns the analysis result.
 *
 * NOTE: This is modifies the `lookupTable` and the `quintModules`!
 * See XXX for the mutation sites.
 *
 * @param lookupTable - The lookup tables for the modules.
 * @param quintModules - The Quint modules to be analyzed.
 * @returns A tuple with a list of errors and the analysis output.
 */
export function analyzeModules(lookupTable: LookupTable, quintModules: QuintModule[]): AnalysisResult {
  const analyzer = new QuintAnalyzer(lookupTable)
  // XXX: the modules are mutated here.
  quintModules.forEach(m => (m.declarations = analyzer.analyzeDeclarations(m.declarations)))
  return analyzer.getResult()
}

/**
 * Analyzes declarations incrementally and returns the analysis result.
 *
 * NOTE: This is modifies the `lookupTable`!
 * See XXX for the mutation sites.
 *
 * @param analysisOutput - The previous analysis output to be used as a starting point.
 * @param lookupTable - The lookup tables for the modules.
 * @param declarations - The Quint declarations to be analyzed.
 * @returns A tuple with a list of errors and the analysis output.
 */
export function analyzeInc(
  analysisOutput: AnalysisOutput,
  lookupTable: LookupTable,
  declarations: QuintDeclaration[]
): AnalysisResult {
  const analyzer = new QuintAnalyzer(lookupTable, analysisOutput)
  analyzer.analyzeDeclarations(declarations)
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
  private typeApplicationResolver: TypeApplicationResolver
  private effectInferrer: EffectInferrer
  private typeInferrer: TypeInferrer
  private modeChecker: ModeChecker
  private multipleUpdatesChecker: MultipleUpdatesChecker
  private nondetChecker: NondetChecker

  private errors: QuintError[] = []
  private output: AnalysisOutput = { types: new Map(), effects: new Map(), modes: new Map() }

  constructor(lookupTable: LookupTable, previousOutput?: AnalysisOutput) {
    // XXX: the lookUp table is mutated when TypeApplicationResolver is instantiated
    this.typeApplicationResolver = new TypeApplicationResolver(lookupTable)
    this.typeInferrer = new TypeInferrer(lookupTable, previousOutput?.types)
    /// FIXES: https://github.com/informalsystems/quint/issues/428
    this.effectInferrer = new EffectInferrer(lookupTable, new Map([...(previousOutput?.effects.entries() ?? [])]))
    this.multipleUpdatesChecker = new MultipleUpdatesChecker()
    this.modeChecker = new ModeChecker(previousOutput?.modes)
    this.nondetChecker = new NondetChecker(lookupTable)
  }

  analyzeDeclarations(decls: QuintDeclaration[]): QuintDeclaration[] {
    const [typAppErrMap, resolvedDecls] = this.typeApplicationResolver.resolveTypeApplications(decls)

    // XXX: the lookUp table is mutated during type inference
    const [typeErrMap, types] = this.typeInferrer.inferTypes(resolvedDecls)
    const [effectErrMap, effects] = this.effectInferrer.inferEffects(resolvedDecls)
    const updatesErrMap = this.multipleUpdatesChecker.checkEffects([...effects.values()])
    const nondetErrors = this.nondetChecker.checkNondets(types, resolvedDecls)
    const [modeErrMap, modes] = this.modeChecker.checkModes(resolvedDecls, effects)

    const errorTrees = [...typeErrMap, ...effectErrMap, ...typAppErrMap]

    // TODO: Type and effect checking should return QuintErrors instead of error trees
    this.errors.push(
      ...errorTrees.map(([id, err]): QuintError => {
        return { code: 'QNT000', message: errorTreeToString(err), reference: id, data: { trace: err } }
      })
    )

    this.errors.push(...modeErrMap.values(), ...updatesErrMap.values(), ...nondetErrors)

    // We assume that ids are unique across modules, and map merging can be done
    // without collision checks
    this.output = {
      types: new Map([...this.output.types, ...types]),
      effects: new Map([...this.output.effects, ...effects]),
      modes: new Map([...this.output.modes, ...modes]),
    }

    return resolvedDecls
  }

  getResult(): AnalysisResult {
    return [this.errors, this.output]
  }
}
