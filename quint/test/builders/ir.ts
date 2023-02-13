import { parsePhase1 } from '../../src/quintParserFrontend'
import { QuintDef, QuintEx, QuintModule } from '../../src/quintIr'
import JSONbig from 'json-bigint'
import { QuintType } from '../../src/quintTypes'

export function buildModuleWithExpressions(expressions: string[]): QuintModule {
  const defs = expressions.map((expr, index) => `def d${index} = ${expr}`)
  return buildModuleWithDefs(defs)
}

export function buildModuleWithDefs(defs: string[], name?: string): QuintModule {
  const quintModule: string = `module ${name ?? 'wrapper'} { ${defs.join('\n')} }`

  const result = parsePhase1(quintModule, 'mocked_path')

  if (result.isRight()) {
    return result.value.modules[0]
  }

  throw new Error(`Couldn't parse mocked expression. Result - ${JSONbig.stringify(result)}`)
}

export function buildDef(def: string): QuintDef {
  const quintModule = buildModuleWithDefs([def])
  return quintModule.defs[0]
}

export function buildExpression(expression: string): QuintEx {
  const def = buildDef(`def d = ${expression}`)
  switch (def.kind) {
    case 'def':
      return def.expr
    default:
      throw new Error(`Error trying to build expression  - ${JSONbig.stringify(def)}`)
  }
}

export function buildType(type: string): QuintType {
  const def = buildDef(`var a: ${type}`)
  if (def.kind === 'var' && def.typeAnnotation) {
    return def.typeAnnotation
  } else {
    throw new Error(`Error trying to build expression  - ${JSONbig.stringify(def)}`)
  }
}
