/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Finding expressions in a list of modules
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor, walkModule } from './IRVisitor'
import { QuintDef, QuintEx, QuintLambda, QuintLambdaParameter, QuintModule } from './quintIr'
import { QuintType } from './quintTypes'

/**
 * Finds a quint expression with a given id in a list of modules
 *
 * @param modules the modules in which to search for the expression
 * @param id the id to be searched for
 *
 * @returns a quint expression with the given id, or undefined if no expression is found
 */
export function findExpressionWithId(modules: QuintModule[], id: bigint): QuintEx | undefined {
  const visitor = new IRExpressionFinder(id)
  modules.forEach(module => walkModule(visitor, module))
  return visitor.expression
}

/**
 * Finds a quint type with a given id in a list of modules
 *
 * @param modules the modules in which to search for the type
 * @param id the id to be searched for
 *
 * @returns a quint type with the given id, or undefined if no type is found
 */
export function findTypeWithId(modules: QuintModule[], id: bigint): QuintType | undefined {
  const visitor = new IRTypeFinder(id)
  modules.forEach(module => walkModule(visitor, module))
  return visitor.type
}

/**
 * Finds a quint definition with a given id in a list of modules
 *
 * @param modules the modules in which to search for the definition
 * @param id the id to be searched for
 *
 * @returns a quint definition with the given id, or undefined if no expression is found
 */
export function findDefinitionWithId(modules: QuintModule[], id: bigint): QuintDef | undefined {
  const visitor = new IRDefinitionFinder(id)
  modules.forEach(module => walkModule(visitor, module))
  return visitor.def
}

/**
 * Find a quint parameter with a given id in a list of modules
 *
 * @param modules the modules in which to search for the parameter
 * @param id the id to be searched for
 *
 * @returns a quint lambda parameter with the given id, or undefined if no parameter is found
 */
export function findParameterWithId(modules: QuintModule[], id: bigint): QuintLambdaParameter | undefined {
  const visitor = new IRParameterFinder(id)
  modules.forEach(module => walkModule(visitor, module))
  return visitor.param
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

class IRDefinitionFinder implements IRVisitor {
  id: bigint
  def?: QuintDef

  constructor(id: bigint) {
    this.id = id
  }

  exitDef(def: QuintDef) {
    if (def.id === this.id) {
      this.def = def
    }
  }
}

class IRParameterFinder implements IRVisitor {
  id: bigint
  param?: QuintLambdaParameter

  constructor(id: bigint) {
    this.id = id
  }

  exitLambda(lambda: QuintLambda) {
    lambda.params.forEach(param => {
      if (param.id == this.id) {
        this.param = param
      }
    })
  }
}
