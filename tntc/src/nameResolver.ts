import { TntModule, TntEx } from './tntIr'
import { NameDefinition } from './definitionsCollector'

export interface NameError {
  name: string;
  definitionName: string;
  expression: TntEx;
  trace: TntEx[];
}

export type NameResolutionResult =
  | { kind: 'ok' }
  | { kind: 'error', errors: NameError[] }

export function resolveNames (tntModule: TntModule, definitions: NameDefinition[]): NameResolutionResult {
  const results: NameResolutionResult[] = tntModule.defs.map(def => {
    return def.kind === 'def' ? checkNamesInExpr(definitions, def.name, def.expr, [def.expr.id]) : { kind: 'ok' }
  })

  // Aggregate errors
  const errors = results.reduce((errors: NameError[], result: NameResolutionResult) => {
    return result.kind === 'error' ? errors.concat(result.errors) : errors
  }, [])

  return errors.length > 0 ? { kind: 'error', errors: errors } : { kind: 'ok' }
}

function checkNamesInExpr (nameDefinitions: NameDefinition[], defName: string, expr: TntEx, scopes: BigInt[]): NameResolutionResult {
  switch (expr.kind) {
    case 'name': {
      const nameDefinitionsForScope = filterScope(nameDefinitions, scopes)

      if (nameDefinitionsForScope.some(name => name.identifier === expr.name)) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: [{ name: expr.name, definitionName: defName, expression: expr, trace: [] }] }
      }
    }

    case 'app': {
      const errors = expr.args.flatMap(arg => {
        const result = checkNamesInExpr(nameDefinitions, defName, arg, scopes.concat(arg.id))

        if (result.kind === 'error') {
          return result.errors.map(error => ({
            name: error.name,
            definitionName: defName,
            expression: error.expression,
            trace: error.trace.length === 0 ? error.trace.concat([arg, expr]) : error.trace.concat([expr]),
          }))
        }

        return []
      })

      return errors.length === 0 ? { kind: 'ok' } : { kind: 'error', errors: errors }
    }

    case 'lambda': return checkNamesInExpr(nameDefinitions, defName, expr.expr, scopes.concat(expr.expr.id))

    default:
      return { kind: 'ok' }
  }
}

function filterScope (nameDefinitions: NameDefinition[], scopes: BigInt[]): NameDefinition[] {
  return nameDefinitions.filter(definition => {
    return !definition.scope || scopes.includes(definition.scope)
  })
}
