/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Scope manipulation for Quint. Build and use scope trees to obtain
 * which scopes an IR node is under.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from './IRVisitor'
import { ValueDefinition } from './lookupTable'
import { QuintDef, QuintEx, QuintModule } from './quintIr'

/**
 * A tree structure where nodes are IR ids
 */
export interface ScopeTree {
  /* Tree node, an IR id */
  value: bigint;
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
 * @returns a list of ids, including the given id, for scopes this id belongs to,
 *          ordered from the node itself to the module root
 */
export function scopesForId(treeNode: ScopeTree, id: bigint): bigint[] {
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
 * Navigates a Quint module constructing a scope tree from found ids.
 *
 * @param quintModule the Quint module to build scope tree from
 *
 * @returns a scope tree for this module's ids scope relation
 */
export function treeFromModule(quintModule: QuintModule): ScopeTree {
  const visitor = new ScopingVisitor()
  walkModule(visitor, quintModule)
  return visitor.currentNode!
}

export function filterScope(valueDefinitions: ValueDefinition[], scopes: bigint[]): ValueDefinition[] {
  return valueDefinitions.filter(definition => {
    // A definition should be considered in a scope if it's either unscoped or its scope is included
    // in some scope containing the name expression's scope
    return !definition.scope || scopes.includes(definition.scope)
  })
}

/**
 * Descend the AST creating empty nodes (with no children) for each component,
 * and when ascending, add each node to it's parent's children list. A node
 * stack is kept in order to find a node's parent.
 * */
class ScopingVisitor implements IRVisitor {
  nodeStack: ScopeTree[] = []
  currentNode?: ScopeTree

  enterDef(def: QuintDef): void {
    this.enterNode(def.id)
  }

  exitDef(_: QuintDef): void {
    this.exitNode()
  }

  enterExpr(expr: QuintEx): void {
    this.enterNode(expr.id)
  }

  exitExpr(_: QuintEx): void {
    this.exitNode()
  }

  enterModule(module: QuintModule): void {
    this.enterNode(module.id)
  }

  exitModule(_: QuintModule): void {
    this.exitNode()
  }

  private enterNode(id: bigint): void {
    this.nodeStack.push({ value: id, children: [] })
  }

  private exitNode(): void {
    this.currentNode = this.nodeStack.pop()!
    if (this.nodeStack.length > 0) {
      this.nodeStack[this.nodeStack.length - 1].children.push(this.currentNode)
    }
  }
}
