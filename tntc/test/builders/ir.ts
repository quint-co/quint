import { parsePhase1 } from '../../src/tntParserFrontend'
import { TntDef, TntEx, TntModule } from '../../src/tntIr'
import JSONbig from 'json-bigint'
import { TntType } from '../../src/tntTypes'

export function buildModuleWithExpressions(expressions: string[]): TntModule {
  const defs = expressions.map((expr, index) => `def d${index} = ${expr}`)
  return buildModuleWithDefs(defs)
}

export function buildModuleWithDefs(defs: string[]): TntModule {
  const tntModule: string = `module wrapper { ${defs.join('\n')} }`

  const result = parsePhase1(tntModule, 'mocked_path')

  if (result.isRight()) {
    return result.value.module
  }

  throw new Error(`Couldn't parse mocked expression. Result - ${JSONbig.stringify(result)}`)
}

export function buildDef(def: string): TntDef {
  const tntModule = buildModuleWithDefs([def])
  return tntModule.defs[0]
}

export function buildExpression(expression: string): TntEx {
  const def = buildDef(`def d = ${expression}`)
  switch (def.kind) {
    case 'def':
      return def.expr
    default:
      throw new Error(`Error trying to build expression  - ${JSONbig.stringify(def)}`)
  }
}

export function buildType(type: string): TntType {
  const def = buildDef(`var a: ${type}`)
  if (def.kind === 'var' && def.typeAnnotation) {
    return def.typeAnnotation
  } else {
    throw new Error(`Error trying to build expression  - ${JSONbig.stringify(def)}`)
  }
}
