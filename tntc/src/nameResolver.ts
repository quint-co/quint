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
    switch (def.kind) {
      // TODO: include definition name in result for error reporting
      case 'def': return checkNamesInExpr(definitions, def.expr)
      default: return { kind: 'ok' }
    }
  })

  if (results.every(result => result.kind === 'ok')) {
    return { kind: 'ok' }
  } else {
    // Aggregate errors
    const errors = results.reduce((errors: NameError[], result: NameResolutionResult) => {
      if (result.kind === 'error') {
        return errors.concat(result.errors)
      } else {
        return errors
      }
    }, [])

    return { kind: 'error', errors: errors }
  }
}

function checkNamesInExpr (nameDefinitions: NameDefinition[], expr: TntEx): NameResolutionResult {
  switch (expr.kind) {
    case 'name':
      if (nameDefinitions.some(name => name.identifier === expr.name)) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: [{ name: expr.name, expression: expr, trace: [] }] }
      }
    case 'app': {
      const unresolvedExpressions = expr.args.flatMap(arg => {
        const result = checkNamesInExpr(nameDefinitions, arg)
        if (result.kind === 'error') {
          return result.errors.map(error => {
            return {
              name: error.name,
              expression: error.expression,
              trace: error.trace.length === 0 ? error.trace.concat([arg, expr]) : error.trace.concat([expr]),
            }
          })
        } else {
          return []
        }
      })

      if (unresolvedExpressions.length === 0) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: unresolvedExpressions }
      }
    }
    default: return { kind: 'ok' }
  }
}
