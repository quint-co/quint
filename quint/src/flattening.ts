import { builtinDocs } from "./builtin";
import { IdGenerator, newIdGenerator } from "./idGenerator";
import { LookupTable } from "./lookupTable";
import { QuintDef, QuintEx, QuintModule, QuintOpDef } from "./quintIr";

export function flatten(module: QuintModule, table: LookupTable, modules: Map<string, QuintModule>): QuintModule {
  const lastId = [...modules.values()].map(m => m.id).sort((a, b) => Number(a - b))[-1]
  const idGenerator = newIdGenerator(lastId)
  const builtinNames = new Set(builtinDocs(newIdGenerator()).unwrap().keys())

  const context = { idGenerator, table, builtinNames }

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
          acc.push(addNamespaceToDef(context, def.name, protoDef))
        }
      })
    } else {
      acc.push(def)
    }

    return acc
  }, [] as QuintDef[])

  return { ...module, defs: newDefs }
}

interface FlatteningContext {
  idGenerator: IdGenerator,
  table: LookupTable,
  builtinNames: Set<string>,
}

function addNamespaceToDef(ctx: FlatteningContext, name: string, def: QuintDef): QuintDef {
  if (def.kind === 'def') {
    return addNamespaceToOpDef(ctx, name, def)
  }

  return { ...def, name: `${name}::${def.name}`, id: ctx.idGenerator.nextId() }
}

function addNamespaceToOpDef(ctx: FlatteningContext, name: string, opdef: QuintOpDef): QuintOpDef {
  return {
    ...opdef,
    name: `${name}::${opdef.name}`,
    expr: addNamespaceToExpr(ctx, name, opdef.expr),
    id: ctx.idGenerator.nextId(),
  }
}

function addNamespaceToExpr(ctx: FlatteningContext, name: string, expr: QuintEx): QuintEx {
  const id = ctx.idGenerator.nextId()
  switch (expr.kind) {
    case 'name':
      if (shouldAddNamespace(ctx, expr.name, expr.id)) {
        return { ...expr, name: `${name}::${expr.name}`, id }
      }

      return { ...expr, id }
    case 'bool':
    case 'int':
    case 'str':
      return { ...expr, id }
    case 'app': {
      if (shouldAddNamespace(ctx, expr.opcode, expr.id)) {
        return {
          ...expr,
          opcode: `${name}::${expr.opcode}`,
          args: expr.args.map(arg => addNamespaceToExpr(ctx, name, arg)),
          id,
        }
      }

      return {
        ...expr,
        args: expr.args.map(arg => addNamespaceToExpr(ctx, name, arg)),
        id,
      }
    }
    case 'lambda':
      return {
        ...expr,
        expr: addNamespaceToExpr(ctx, name, expr.expr),
        id,
      }

    case 'let':
      return {
        ...expr,
        opdef: addNamespaceToOpDef(ctx, name, expr.opdef),
        expr: addNamespaceToExpr(ctx, name, expr.expr),
        id,
      }
  }
}

function shouldAddNamespace(ctx: FlatteningContext, name: string, id: bigint): boolean {
  if (ctx.builtinNames.has(name)) {
    return false
  }

  const def = ctx.table.get(id)!
  if (def.kind === 'param') {
    return false
  }

  return true
}
