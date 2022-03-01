import { TntModule, TntEx } from './tntIr'

export interface NameDefinition {
  kind: string
  identifier: string
  scope?: bigint
}

const defaultDefinitions: NameDefinition[] = [
  { kind: 'def', identifier: 'not' },
  { kind: 'def', identifier: 'and' },
  { kind: 'def', identifier: 'or' },
  { kind: 'def', identifier: 'iff' },
  { kind: 'def', identifier: 'implies' },
  { kind: 'def', identifier: 'exists' },
  { kind: 'def', identifier: 'guess' },
  { kind: 'def', identifier: 'forall' },
  { kind: 'def', identifier: 'in' },
  { kind: 'def', identifier: 'notin' },
  { kind: 'def', identifier: 'union' },
  { kind: 'def', identifier: 'contains' },
  { kind: 'def', identifier: 'fold' },
  { kind: 'def', identifier: 'intersect' },
  { kind: 'def', identifier: 'exclude' },
  { kind: 'def', identifier: 'subseteq' },
  { kind: 'def', identifier: 'map' },
  { kind: 'def', identifier: 'applyTo' },
  { kind: 'def', identifier: 'filter' },
  { kind: 'def', identifier: 'powerset' },
  { kind: 'def', identifier: 'flatten' },
  { kind: 'def', identifier: 'seqs' },
  { kind: 'def', identifier: 'choose_some' },
  { kind: 'def', identifier: 'isFinite' },
  { kind: 'def', identifier: 'cardinality' },
  { kind: 'def', identifier: 'get' },
  { kind: 'def', identifier: 'put' },
  { kind: 'def', identifier: 'keys' },
  { kind: 'def', identifier: 'mapOf' },
  { kind: 'def', identifier: 'setOfMaps' },
  { kind: 'def', identifier: 'update' },
  { kind: 'def', identifier: 'updateAs' },
  { kind: 'def', identifier: 'fields' },
  { kind: 'def', identifier: 'with' },
  { kind: 'def', identifier: 'tuples' },
  { kind: 'def', identifier: 'append' },
  { kind: 'def', identifier: 'concat' },
  { kind: 'def', identifier: 'head' },
  { kind: 'def', identifier: 'tail' },
  { kind: 'def', identifier: 'length' },
  { kind: 'def', identifier: 'nth' },
  { kind: 'def', identifier: 'indices' },
  { kind: 'def', identifier: 'replaceAt' },
  { kind: 'def', identifier: 'slice' },
  { kind: 'def', identifier: 'select' },
  { kind: 'def', identifier: 'foldl' },
  { kind: 'def', identifier: 'foldr' },
  { kind: 'def', identifier: 'to' },
  { kind: 'def', identifier: 'always' },
  { kind: 'def', identifier: 'eventually' },
  { kind: 'def', identifier: 'next' },
  { kind: 'def', identifier: 'stutter' },
  { kind: 'def', identifier: 'nostutter' },
  { kind: 'def', identifier: 'enabled' },
  { kind: 'def', identifier: 'weakFair' },
  { kind: 'def', identifier: 'strongFair' },
  { kind: 'def', identifier: 'guarantees' },
  { kind: 'def', identifier: 'exists_const' },
  { kind: 'def', identifier: 'forall_const' },
  { kind: 'def', identifier: 'choose_const' },
  { kind: 'def', identifier: 'Bool' },
  { kind: 'def', identifier: 'Int' },
  { kind: 'def', identifier: 'Nat' },
]

export function collectDefinitions (tntModule: TntModule): NameDefinition[] {
  return defaultDefinitions.concat(
    tntModule.defs.reduce((nameDefs: NameDefinition[], def) => {
      switch (def.kind) {
        case 'const':
        case 'var':
          nameDefs.push({
            kind: def.kind,
            identifier: def.name,
          })
          break
        case 'def':
          nameDefs.push({
            kind: def.kind,
            identifier: def.name,
          })
          if (def.expr) {
            nameDefs.push(...collectFromExpr(def.expr))
          }
          break
        case 'instance':
          nameDefs.push({
            kind: 'namespace',
            identifier: def.name,
          })
          break
        case 'module':
          nameDefs.push({
            kind: 'namespace',
            identifier: def.module.name,
          })
          break
        default:
        // typedefs and assumes, ignore for now
      }
      return nameDefs
    }, []))
}

function collectFromExpr (expr: TntEx): NameDefinition[] {
  switch (expr.kind) {
    case 'lambda':
      return expr.params.map(p => { return { kind: 'def', identifier: p, scope: expr.id } as NameDefinition }).concat(collectFromExpr(expr.expr))
    case 'app':
      return expr.args.flatMap(arg => { return collectFromExpr(arg) })
    case 'let':
      return [{ kind: expr.opdef.qualifier, identifier: expr.opdef.name, scope: expr.id } as NameDefinition]
        .concat(collectFromExpr(expr.opdef.expr))
        .concat(collectFromExpr(expr.expr))
    default:
      return []
  }
}
