import { parsePhase1fromText } from '../../src/parsing/quintParserFrontend'
import { IdGenerator, newIdGenerator } from '../../src/idGenerator'
import { QuintDef, QuintEx, QuintModule } from '../../src/ir/quintIr'
import JSONbig from 'json-bigint'
import { QuintType } from '../../src/ir/quintTypes'

export function buildModuleWithExpressions(expressions: string[]): QuintModule {
  return buildModule([], expressions)
}

export function buildModuleWithDefs(defs: string[], name?: string, idGenerator?: IdGenerator): QuintModule {
  const quintModule: string = `module ${name ?? 'wrapper'} { ${defs.join('\n')} }`

  const result = parsePhase1fromText(idGenerator ?? newIdGenerator(), quintModule, 'mocked_path')

  if (result.isRight()) {
    return result.value.modules[0]
  }

  throw new Error(`Couldn't parse mocked expression. Result - ${JSONbig.stringify(result)}`)
}

export function buildModule(
  defs: string[],
  expressions: string[],
  name?: string,
  idGenerator?: IdGenerator
): QuintModule {
  const defsFromExprs = expressions.map((expr, index) => `def d${index} = ${expr}`)
  return buildModuleWithDefs(defs.concat(defsFromExprs), name, idGenerator)
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
