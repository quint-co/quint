/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Infer types, effects and modes for quint modules, reporting the result and
 * possible errors in LSP-friendly format.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import {
  Effect,
  Loc,
  LookupTableByModule,
  OpQualifier,
  QuintModule,
  TypeScheme,
  analyze,
  effectToString,
  toPromise,
  typeSchemeToString
} from "@informalsystems/quint"
import { diagnosticsFromErrors } from "./reporting"

interface InferredEffects {
  effects: Map<Loc, string>
  originalEffects: Map<bigint, Effect>
}

interface InferredTypes {
  types: Map<Loc, string>
  originalTypes: Map<bigint, TypeScheme>
}

interface InferredModes {
  modes: Map<bigint, OpQualifier>
}

/* Interface with inferred types, effects and modes */
export type InferredData = InferredEffects & InferredTypes & InferredModes

/**
 * Check types, effects and modes for a module.
 *
 * @param modules: the Quint modules to infer information for
 * @param sourceMap: a map from expression ids to their locations
 * @param table: the lookup table for the module and any used modules
 *
 * @returns a promise with the inferred data or a list of diagnostics
 */
export function checkTypesAndEffects(
  modules: QuintModule[], sourceMap: Map<bigint, Loc>, table: LookupTableByModule
): Promise<InferredData> {
  const result = analyze(table, modules)
    .map(({ effects, types, modes }): InferredData => {
      return {
        types: new Map([...types.entries()].map(([id, type]) => [sourceMap.get(id)!, typeSchemeToString(type)])),
        originalTypes: types,
        effects: new Map([...effects.entries()].map(([id, effect]) => [sourceMap.get(id)!, effectToString(effect)])),
        originalEffects: effects,
        modes: modes,
      }
    })
    .mapLeft(errors => diagnosticsFromErrors(errors, sourceMap))

  return toPromise(result)
}
