/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Finding expressions in a module
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from "./IRVisitor";
import { QuintEx, QuintModule } from "./quintIr";
import { QuintType } from "./quintTypes";

/**
 * Finds a quint expression with a given id in a module
 *
 * @param module the module in which to search for the expression
 * @param id the id to be searched for
 *
 * @returns a quint expression with the given id, or undefined if no expression is found
 */
export function findExpressionWithId(module: QuintModule, id: bigint): QuintEx | undefined {
  const visitor = new IRExpressionFinder(id)
  walkModule(visitor, module)
  return visitor.expression
}

/**
 * Finds a quint type with a given id in a module
 *
 * @param module the module in which to search for the type
 * @param id the id to be searched for
 *
 * @returns a quint type with the given id, or undefined if no type is found
 */
export function findTypeWithId(module: QuintModule, id: bigint): QuintType | undefined {
  const visitor = new IRTypeFinder(id)
  walkModule(visitor, module)
  return visitor.type
}

class IRExpressionFinder implements IRVisitor {
  id: bigint
  expression?: QuintEx

  constructor(id: bigint) {
    this.id = id
  }

  exitExpr(expr: QuintEx) {
    if (expr.id === this.id) {
      this.expression = expr
    }
  }
}

class IRTypeFinder implements IRVisitor {
  id: bigint
  type?: QuintType

  constructor(id: bigint) {
    this.id = id
  }

  exitType(type: QuintType) {
    if (type.id === this.id) {
      this.type = type
    }
  }
}
