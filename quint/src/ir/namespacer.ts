import { IRTransformer, transformDefinition } from './IRTransformer'
import { QuintApp, QuintDef, QuintLambda, QuintName, isFlat } from './quintIr'
import { QuintConstType } from './quintTypes'

export function addNamespaceToDefinition(def: QuintDef, namespace: string, namesToPreserve: Set<string>): QuintDef {
  const updater = new Namespacer(namespace, namesToPreserve)
  return transformDefinition(updater, def)
}

class Namespacer implements IRTransformer {
  private namespace: string
  private namesToPreserve: Set<string>

  constructor(namespace: string, namesToPreserve: Set<string>) {
    this.namespace = namespace
    this.namesToPreserve = namesToPreserve
  }

  exitDef(def: QuintDef): QuintDef {
    if (isFlat(def) && !this.namesToPreserve.has(def.name)) {
      return { ...def, name: namespacedName(this.namespace, def.name) }
    }

    return def
  }

  exitLambda(expr: QuintLambda): QuintLambda {
    return {
      ...expr,
      params: expr.params.map(p => ({ ...p, name: namespacedName(this.namespace, p.name) })),
    }
  }

  exitName(expr: QuintName): QuintName {
    if (!this.namesToPreserve.has(expr.name)) {
      return { ...expr, name: namespacedName(this.namespace, expr.name) }
    }

    return expr
  }

  exitApp(expr: QuintApp): QuintApp {
    if (!this.namesToPreserve.has(expr.opcode)) {
      return { ...expr, opcode: namespacedName(this.namespace, expr.opcode) }
    }

    return expr
  }

  exitConstType(type: QuintConstType): QuintConstType {
    if (!this.namesToPreserve.has(type.name)) {
      return { ...type, name: namespacedName(this.namespace, type.name) }
    }

    return type
  }
}

function namespacedName(namespace: string | undefined, name: string): string {
  return namespace ? `${namespace}::${name}` : name
}
