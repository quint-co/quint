import { TntModule, TntDef, TntEx } from './tntIr'

export interface ScopeTree {
  value: BigInt;
  children?: ScopeTree[];
}

export function scopesForId (treeNode: ScopeTree, id: BigInt): BigInt[] {
  if (treeNode.value === id) {
    return [treeNode.value]
  }

  if (!treeNode.children) {
    return []
  }

  return treeNode.children.flatMap(child => {
    const childScopes = scopesForId(child, id)
    if (childScopes.length > 0) {
      return childScopes.concat(treeNode.value)
    }

    return []
  })
}

export function treeFromModule (tntModule: TntModule): ScopeTree {
  return { value: tntModule.id, children: tntModule.defs.map(treeFromDef) }
}

function treeFromDef (def: TntDef): ScopeTree {
  let children: ScopeTree[]
  switch (def.kind) {
    case 'const':
    case 'var':
    case 'typedef':
    case 'assume':
    case 'import':
      children = []
      break
    case 'instance':
      children = def.overrides.map(e => treeFromExpr(e[1]))
      break
    case 'module':
      children = [treeFromModule(def.module)]
      break
    case 'def':
      children = [treeFromExpr(def.expr)]
      break
  }

  return children.length > 0 ? { value: def.id, children: children } : { value: def.id }
}

function treeFromExpr (expr: TntEx): ScopeTree {
  let children: ScopeTree[]
  switch (expr.kind) {
    case 'name':
    case 'bool':
    case 'int':
    case 'str':
      children = []
      break
    case 'app':
      children = expr.args.map(treeFromExpr)
      break
    case 'lambda':
      children = [treeFromExpr(expr.expr)]
      break
    case 'let':
      children = [treeFromDef(expr.opdef), treeFromExpr(expr.expr)]
      break
  }

  return children.length > 0 ? { value: expr.id, children: children } : { value: expr.id }
}
