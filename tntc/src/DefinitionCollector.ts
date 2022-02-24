import { TntModule, TntDef, TntEx } from './tntIr'

export interface NameDefinition {
  kind: string
  identifier: string
  scope?: bigint
}

export class DefinitionCollector {
  tntModule: TntModule

  constructor (tntModule: TntModule) {
    this.tntModule = tntModule
  }

  collect (): NameDefinition[] {
    return this.collectFromDefs(this.tntModule.defs)
  }

  private collectFromDefs (defs: TntDef[]): NameDefinition[] {
    return defs.reduce((nameDefs: NameDefinition[], def) => {
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
            nameDefs.push(...this.collectFromExpr(def.expr))
          }
          break
        default:
          // typedefs and assumes
      }
      return nameDefs
    }, [])
  }

  private collectFromExpr (expr: TntEx): NameDefinition[] {
    switch (expr.kind) {
      case 'lambda':
        return expr.params.map(p => { return { kind: 'def', identifier: p, scope: expr.id } as NameDefinition }).concat(this.collectFromExpr(expr.expr))
      case 'app':
        return expr.args.flatMap(arg => { return this.collectFromExpr(arg) })
      case 'let':
        return [{ kind: expr.opdef.qualifier, identifier: expr.opdef.name, scope: expr.id } as NameDefinition]
          .concat(this.collectFromExpr(expr.opdef.expr))
          .concat(this.collectFromExpr(expr.expr))
      default:
        return []
    }
  }
}
