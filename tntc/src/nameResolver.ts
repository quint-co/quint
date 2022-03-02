import { TntModule, TntEx } from './tntIr'
import { NameDefinition } from './definitionsCollector'

export interface NameError {
  name: string;
  expression: TntEx;
  trace: TntEx[];
}

export type NameResolutionResult =
  | { kind: 'ok' }
  | { kind: 'error', errors: NameError[] }

export function resolveNames (tntModule: TntModule, definitions: NameDefinition[]): NameResolutionResult {
  const results: NameResolutionResult[] = tntModule.defs.map(def => {
    // TODO: include definition name in result for error reporting
    return def.kind === 'def' ? checkNamesInExpr(definitions, def.expr, [def.expr.id]) : { kind: 'ok' }
  })

  if (results.some(result => result.kind === 'error')) {
    // Aggregate errors
    const errors = results.reduce((errors: NameError[], result: NameResolutionResult) => {
      return result.kind === 'error' ? errors.concat(result.errors) : errors
    }, [])

    return { kind: 'error', errors: errors }
  }

  return { kind: 'ok' }
}

function checkNamesInExpr (nameDefinitions: NameDefinition[], expr: TntEx, scopes: BigInt[]): NameResolutionResult {
  switch (expr.kind) {
    case 'name': {
      const nameDefinitionsForScope = filterScope(nameDefinitions, scopes)

      if (nameDefinitionsForScope.some(name => name.identifier === expr.name)) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: [{ name: expr.name, expression: expr, trace: [] }] }
      }
    }

    case 'app': {
      const errors = expr.args.flatMap(arg => {
        const result = checkNamesInExpr(nameDefinitions, arg, scopes.concat(arg.id))

        if (result.kind === 'error') {
          return result.errors.map(error => ({
            name: error.name,
            expression: error.expression,
            trace: error.trace.length === 0 ? error.trace.concat([arg, expr]) : error.trace.concat([expr]),
          }))
        }

        return []
      })

      return errors.length === 0 ? { kind: 'ok' } : { kind: 'error', errors: errors }
    }

    case 'lambda': return checkNamesInExpr(nameDefinitions, expr.expr, scopes.concat(expr.expr.id))

    default:
      return { kind: 'ok' }
  }
}

function filterScope (nameDefinitions: NameDefinition[], scopes: BigInt[]): NameDefinition[] {
  return nameDefinitions.filter(definition => {
    return !definition.scope || scopes.includes(definition.scope)
  })
}
