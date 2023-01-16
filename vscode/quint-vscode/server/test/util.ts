import { Loc, LookupTableByModule, parsePhase1, parsePhase2, QuintModule } from "@informalsystems/quint"

export function parseOrThrow(moduleText: string): [QuintModule, Map<bigint, Loc>, LookupTableByModule] {
  const result1 = parsePhase1(moduleText, 'mocked_path')
  const result2 = result1.chain(parsePhase2)

  if (result1.isLeft() || result2.isLeft()) {
    throw new Error('Failed to parse mocked module')
  }

  return [result1.value.module, result1.value.sourceMap, result2.value.table]
}