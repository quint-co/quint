import { parsePhase1 } from '../../src/tntParserFrontend'
import { TntEx } from '../../src/tntIr'
import JSONbig from 'json-bigint'

export function parseExpression (exprString: string): TntEx {
  const tntModule: string = `module wrapper {
def w = ${exprString}
}`

  const result = parsePhase1(tntModule, 'mocked_path')

  if (result.kind === 'ok' && result.module.defs[0] && result.module.defs[0].kind === 'def' && result.module.defs[0].expr) {
    return result.module.defs[0].expr
  }

  throw new Error(`Couldn't parse mocked expression. Result - ${JSONbig.stringify(result)}`)
}
