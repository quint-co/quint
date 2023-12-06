import { parsePhase1fromText } from '../../src/parsing/quintParserFrontend'
import { IdGenerator, newIdGenerator } from '../../src/idGenerator'
import { QuintDeclaration, QuintDef, QuintEx, QuintModule, isDef } from '../../src/ir/quintIr'
import JSONbig from 'json-bigint'
import { QuintType } from '../../src/ir/quintTypes'
import { quintErrorToString } from '../../src'

export function buildModuleWithExpressions(expressions: string[]): QuintModule {
  return buildModule([], expressions)
}

export function buildModuleWithDecls(decls: string[], name?: string, idGenerator?: IdGenerator): QuintModule {
  const quintModule: string = `module ${name ?? 'wrapper'} { ${decls.join('\n')} }`

  const result = parsePhase1fromText(idGenerator ?? newIdGenerator(), quintModule, 'mocked_path')

  if (result.errors.length > 0) {
    throw new Error(`Couldn't parse mocked expression. ${result.errors.map(quintErrorToString)}`)
  }

  return result.modules[0]
}

export function buildModule(
  defs: string[],
  expressions: string[],
  name?: string,
  idGenerator?: IdGenerator
): QuintModule {
  const defsFromExprs = expressions.map((expr, index) => `def d${index} = ${expr}`)
  return buildModuleWithDecls(defs.concat(defsFromExprs), name, idGenerator)
}

export function buildDecl(decl: string): QuintDeclaration {
  const quintModule = buildModuleWithDecls([decl])
  return quintModule.declarations[0]
}

export function buildDef(def: string): QuintDef {
  const quintModule = buildModuleWithDecls([def])
  const decl = quintModule.declarations[0]
  if (!isDef(decl)) {
    throw new Error(`Error trying to build def from declaration that is not a def: ${JSONbig.stringify(decl)}`)
  }
  return decl
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
