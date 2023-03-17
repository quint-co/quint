import { builtinDocs } from "./builtin";
import { IdGenerator, newIdGenerator } from "./idGenerator";
import { LookupTable } from "./lookupTable";
import { QuintDef, QuintEx, QuintModule, QuintOpDef } from "./quintIr";

export function flatten(module: QuintModule, table: LookupTable, modules: Map<string, QuintModule>): QuintModule {
  const lastId = [...modules.values()].map(m => m.id).sort((a, b) => Number(a - b))[-1]
  const idGenerator = newIdGenerator(lastId)

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
          id: idGenerator.nextId(),
        })
      })

      protoModule.defs.forEach(protoDef => {
        if (!acc.some(d => d.name === `${def.name}::${protoDef.name}`)) {
          // Push a namespaced def if it was not previously defined by an override
          acc.push(addNamespaceToDef(def.name, protoDef, idGenerator, table))
        }
      })
    } else {
      acc.push(def)
    }

    return acc
  }, [] as QuintDef[])

  return { ...module, defs: newDefs }
}

function addNamespaceToDef(name: string, def: QuintDef, idGenerator: IdGenerator, table: LookupTable): QuintDef {
  if (def.kind === 'def') {
    return addNamespaceToOpDef(name, def, idGenerator, table)
  }

  return { ...def, name: `${name}::${def.name}`, id: idGenerator.nextId() }
}

function addNamespaceToOpDef(name: string, opdef: QuintOpDef, idGenerator: IdGenerator, table: LookupTable): QuintOpDef {
  return {
    ...opdef,
    name: `${name}::${opdef.name}`,
    expr: addNamespaceToExpr(name, opdef.expr, idGenerator, table),
    id: idGenerator.nextId(),
  }
}

function addNamespaceToExpr(name: string, expr: QuintEx, idGenerator: IdGenerator, table: LookupTable): QuintEx {
  const id = idGenerator.nextId()
  switch (expr.kind) {
    case 'name':
      if (shouldAddNamespace(table, expr.name, expr.id)) {
        return { ...expr, name: `${name}::${expr.name}`, id }
      }

      return { ...expr, id }
    case 'bool':
    case 'int':
    case 'str':
      return { ...expr, id }
    case 'app': {
      if (shouldAddNamespace(table, expr.opcode, expr.id)) {
        return {
          ...expr,
          opcode: `${name}::${expr.opcode}`,
          args: expr.args.map(arg => addNamespaceToExpr(name, arg, idGenerator, table)),
          id,
        }
      }

      return {
        ...expr,
        args: expr.args.map(arg => addNamespaceToExpr(name, arg, idGenerator, table)),
        id,
      }
    }
    case 'lambda':
      return {
        ...expr,
        expr: addNamespaceToExpr(name, expr.expr, idGenerator, table),
        id,
      }

    case 'let':
      return {
        ...expr,
        opdef: addNamespaceToOpDef(name, expr.opdef, idGenerator, table),
        expr: addNamespaceToExpr(name, expr.expr, idGenerator, table),
        id,
      }
  }
}

function shouldAddNamespace(table: LookupTable, name: string, id: bigint): boolean {
  // FIXME: We shouldn't load builtins everytime, but typescript breaks if this is static
  const builtinNames = [...builtinDocs(newIdGenerator()).unwrap().keys()]

  if (builtinNames.includes(name)) {
    return false
  }

  const def = table.get(id)!
  if (def.kind === 'param') {
    return false
  }

  return true
}
