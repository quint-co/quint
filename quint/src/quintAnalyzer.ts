import { Either, left, right } from "@sweet-monads/either"
import { ErrorTree } from "./errorTree"
import { LookupTableByModule } from "./lookupTable"
import { OpQualifier, QuintModule } from "./quintIr"
import { TypeScheme } from "./types/base"
import { TypeInferenceResult, inferTypes } from "./types/inferrer"
import { Effect } from "./effects/base"
import { EffectInferenceResult, inferEffects } from "./effects/inferrer"
import { ModeCheckingResult, checkModes } from "./effects/modeChecker"

export type AnalyzisOutput = {
  types: Map<bigint, TypeScheme>,
  effects: Map<bigint, Effect>,
  modes: Map<bigint, OpQualifier>,
}

export type AnalysisResult = Either<[bigint, ErrorTree][], AnalyzisOutput>

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

  const errMap = [...typeErrMap, ...effectErrMap, ...modeErrMap]

  if (errMap.length === 0) {
    return right({ types, effects, modes })
  } else {
    return left(errMap)
  }
}

function mergeResults<T>(
  a: [Map<bigint, ErrorTree>, Map<bigint, T>], b: [Map<bigint, ErrorTree>, Map<bigint, T>]
): [Map<bigint, ErrorTree>, Map<bigint, T>] {
  return [new Map([...a[0], ...b[0]]), new Map([...a[1], ...b[1]])]
}

export function toPromise<L, R>(result: Either<L, R>): Promise<R> {
  if (result.isRight()) {
    return Promise.resolve(result.value)
  } else {
    return Promise.reject(result.value)
  }
}
