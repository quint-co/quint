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
import { walkDeclaration } from '../ir/IRVisitor'
import { LookupTable } from '../names/base'
import { QuintDeclaration } from '../ir/quintIr'
import { TypeScheme } from './base'
import { ConstraintGeneratorVisitor } from './constraintGenerator'
import { solveConstraint } from './constraintSolver'
import { simplify } from './simplification'

export type TypeInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, TypeScheme>]

export class TypeInferrer extends ConstraintGeneratorVisitor {
  constructor(table: LookupTable, types?: Map<bigint, TypeScheme>) {
    super(solveConstraint, table, types)
  }

  /**
   * Infers an type for each expression in a list of QuintDeclarations
   *
   * @param declarations: the list of QuintDeclarations to infer types for
   *
   * @returns a map from expression ids to their types and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferTypes(declarations: QuintDeclaration[]): TypeInferenceResult {
    declarations.forEach(decl => {
      walkDeclaration(this, decl)
    })
    const simplifiedTypes = new Map([...this.types.entries()].map(([id, t]) => [id, simplify(t)]))
    return [this.errors, simplifiedTypes]
  }
}
