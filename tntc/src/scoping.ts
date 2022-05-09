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

import { IRVisitor, walkModule } from './IRVisitor'
import { TntModule, TntDef, TntEx, TntModuleDef } from './tntIr'

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
  const visitor = new ScopingVisitor()
  walkModule(visitor, tntModule)
  return visitor.currentNode!
}

/**
 * Descend the AST creating empty nodes (with no children) for each component,
 * and when ascending, add each node to it's parent's children list. A node
 * stack is kept in order to find a node's parent.
 * */
class ScopingVisitor implements IRVisitor {
  nodeStack: ScopeTree[] = []
  currentNode?: ScopeTree

  enterDef (def: TntDef): void {
    this.enterNode(def.id)
  }

  exitDef (_: TntDef): void {
    this.exitNode()
  }

  enterExpr (expr: TntEx): void {
    this.enterNode(expr.id)
  }

  exitExpr (_: TntEx): void {
    this.exitNode()
  }

  enterModuleDef (def: TntModuleDef): void {
    this.enterNode(def.module.id)
  }

  exitModuleDef (_: TntModuleDef): void {
    this.exitNode()
  }

  private enterNode (id: BigInt): void {
    this.nodeStack.push({ value: id, children: [] })
  }

  private exitNode (): void {
    this.currentNode = this.nodeStack.pop()!
    if (this.nodeStack.length > 0) {
      this.nodeStack[this.nodeStack.length - 1].children.push(this.currentNode)
    }
  }
}
