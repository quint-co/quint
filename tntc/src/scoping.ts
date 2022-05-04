/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Scope manipulation for TNT. Build and use scope trees to obtain
 * which scopes an IR node is under.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { TntModule, TntDef, TntEx } from './tntIr'

/**
 * A tree structure where nodes are IR ids
 */
export interface ScopeTree {
  /* Tree node, an IR id */
  value: BigInt;
  /* Tree children of the node */
  children: ScopeTree[];
}

/**
 * Recursively search for a node in the scope tree and return a list with
 * all of its parents until the root of the tree
 *
 * @param treeNode the tree to search from
 * @param id the id to be searched
 *
 * @returns a list of ids, including the given id, for scopes this id belongs to, ordered from the node itself to the module root
 */
export function scopesForId (treeNode: ScopeTree, id: BigInt): BigInt[] {
  if (treeNode.value === id) {
    return [treeNode.value]
  }

  return treeNode.children.flatMap(child => {
    const childScopes = scopesForId(child, id)
    // if it's under some of the node's children scope, then it is under the node's scope
    if (childScopes.length > 0) {
      return childScopes.concat(treeNode.value)
    }

    return []
  })
}

/**
 * Navigates a TNT module constructing a scope tree from found ids.
 *
 * @param tntModule the TNT module to build scope tree from
 *
 * @returns a scope tree for this module's ids scope relation
 */
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

  return { value: def.id, children: children }
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

  return { value: expr.id, children: children }
}
