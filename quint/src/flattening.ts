import { LookupTable } from "./lookupTable";
import { QuintDef, QuintEx, QuintModule, QuintOpDef } from "./quintIr";

export function flatten(module: QuintModule, table: LookupTable, modules: Map<string, QuintModule>): QuintModule {
  const newDefs = module.defs.reduce((acc, def) => {
    if (def.kind === 'instance') {
      const protoModule = modules.get(def.protoName)!

      def.overrides.forEach(([param, expr]) => {
        const constDef = table.get(param.id)!
        const name = `${def.name}::${param.name}`
        acc.push({
          kind: 'def',
          name,
          qualifier: 'pureval',
          expr,
          typeAnnotation: constDef.typeAnnotation,
          id: param.id,
        })
      })

      protoModule.defs.forEach(protoDef => {
        if (!acc.some(d => d.name === `${def.name}::${protoDef.name}`)) {
          // Push a namespaced def if it was not previously defined by an override
          acc.push(addNamespaceToDef(def.name, protoDef))
        }
      })
    } else {
      acc.push(def)
    }

    return acc
  }, [] as QuintDef[])

  return { ...module, defs: newDefs }
}

function addNamespaceToDef(name: string, def: QuintDef): QuintDef {
  if (def.kind === 'def') {
    return addNamespaceToOpDef(name, def)
  }

  return { ...def, name: `${name}::${def.name}` }
}

function addNamespaceToOpDef(name: string, opdef: QuintOpDef): QuintOpDef {
  return {
    ...opdef,
    name: `${name}::${opdef.name}`,
    expr: addNamespaceToExpr(name, opdef.expr),
  }
}

function addNamespaceToExpr(name: string, expr: QuintEx): QuintEx {
  switch (expr.kind) {
    case 'name':
      return { ...expr, name: `${name}::${expr.name}` }
    case 'bool':
    case 'int':
    case 'str':
      return expr
    case 'app': {
      return {
        ...expr,
        opcode: `${name}::${expr.opcode}`,
        args: expr.args.map(arg => addNamespaceToExpr(name, arg)),
      }
    }
    case 'lambda':
      return {
        ...expr,
        expr: addNamespaceToExpr(name, expr.expr),
      }

    case 'let':
      return {
        ...expr,
        opdef: addNamespaceToOpDef(name, expr.opdef),
        expr: addNamespaceToExpr(name, expr.expr),
      }
  }
}
