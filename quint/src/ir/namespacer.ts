/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Recursive addition of namespaces into all names in IR components. To be used in flattening
 * to manipulate names of copied definitions.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformDefinition } from './IRTransformer'
import { QuintApp, QuintDef, QuintLambda, QuintName } from './quintIr'
import { QuintConstType } from './quintTypes'

/**
 * Adds a namespace to a QuintDef and the names inside it, preserving a set of names.
 *
 * @param def - The QuintDef to add the namespace to.
 * @param namespace - The namespace to add.
 * @param namesToPreserve - A set of names that should not receive the namespace (e.g. builtin names).
 * @returns A new QuintDef with the namespace added to its name and all names inside it.
 */
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
    // FIXME: The current flattener expects `namesToPreserve` to be ignored for def names.
    // In the new flattener, we will need to consider it here as well.
    // Also, considering it here makes the interface consistent.
    // Uncomment the following line when the new flattener is in place:
    // if (!this.namesToPreserve.has(def.name)) {
    return { ...def, name: namespacedName(this.namespace, def.name) }
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
  if (name === '_') {
    return name
  }
  // FIXME(#1111): We shouldn't need to verify `startsWith` if we find a good way to manage namespaces
  return namespace && !name.startsWith(`${namespace}::`) ? `${namespace}::${name}` : name
}
