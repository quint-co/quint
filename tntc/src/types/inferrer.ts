/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Inference for types. Uses constraint generation and solving to infer types
 * for each expression inside a module
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { ErrorTree } from '../errorTree'
import { walkModule } from '../IRVisitor'
import { TntModule } from '../tntIr'
import { TntType } from '../tntTypes'
import { ConstraintGeneratorVisitor } from './constraintGenerator'
import { solveConstraint } from './constraintSolver'

/**
 * Infers an type for each expression in a TNT module
 *
 * @param tntModule: the TNT module to infer types for
 *
 * @returns a map from expression ids to their types when inferrence succeeds.
 *          Otherwise, a map from expression ids to the corresponding error for
 *          the problematic expressions.
 */
export function inferTypes (tntModule: TntModule): Either<Map<bigint, ErrorTree>, Map<bigint, TntType>> {
  const visitor = new ConstraintGeneratorVisitor(solveConstraint)
  walkModule(visitor, tntModule)
  if (visitor.errors.size !== 0) { return left(visitor.errors) }
  // Since all top level expressions are operator definitions, and all
  // constraints are solved at those, there's no need to solve anything else
  return right(visitor.types)
}
