import { TntModule, TntDef, TntEx } from './tntIr'

export interface NameDefinition {
  kind: string;
  identifier: string;
  // scope
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
        case 'def':
          // TODO: differentiate letins from module operators
        case 'var':
          nameDefs.push({
            kind: def.kind,
            identifier: def.name,
          })
          break
        default:
          // typedefs and assumes
      }
      return nameDefs
    }, [])
  }

  private collectFromExpr (expr: TntEx): NameDefinition[] {
    // TODO: Recursively find lambdas
    // switch (expr.kind) {
    //     case: ''
    // }
    return []
  }
}
