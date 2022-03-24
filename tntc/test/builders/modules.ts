import { parsePhase1 } from '../../src/tntParserFrontend'
import { TntModule } from '../../src/tntIr'
import JSONbig from 'json-bigint'

export function buildModuleWithExpressions (expressions: string[]): TntModule {
  const defs = expressions.map((expr, index) => `def d${index} = ${expr}`)
  return buildModuleWithDefs(defs)
}

export function buildModuleWithDefs (defs: string[]): TntModule {
  const tntModule: string = `module wrapper { ${defs.join('\n')} }`

  const result = parsePhase1(tntModule, 'mocked_path')

  if (result.kind === 'ok') {
    return result.module
  }

  throw new Error(`Couldn't parse mocked expression. Result - ${JSONbig.stringify(result)}`)
}
