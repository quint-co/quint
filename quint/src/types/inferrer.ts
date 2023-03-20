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

import { ErrorTree } from '../errorTree'
import { walkModule } from '../IRVisitor'
import { LookupTable } from '../lookupTable'
import { QuintModule } from '../quintIr'
import { TypeScheme } from './base'
import { ConstraintGeneratorVisitor } from './constraintGenerator'
import { solveConstraint } from './constraintSolver'

export type TypeInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, TypeScheme>]

export class TypeInferrer extends ConstraintGeneratorVisitor {
  constructor(table: LookupTable) {
    super(solveConstraint, table)
  }

  /**
   * Infers an type for each expression in a Quint module
   *
   * @param quintModule: the Quint module to infer types for
   *
   * @returns a map from expression ids to their types and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferTypes(quintModule: QuintModule): TypeInferenceResult {
    walkModule(this, quintModule)
    return [this.errors, this.types]
  }
}
