/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
import { difference } from 'lodash'

export type TypeInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, TypeScheme>]

export class TypeInferrer extends ConstraintGeneratorVisitor {
  constructor(table: LookupTable, types?: Map<bigint, TypeScheme>, enforceConstVarMonomorphism: boolean = false) {
    super(solveConstraint, table, types, enforceConstVarMonomorphism)
  }

  /**
   * Infers a type for each expression in a list of QuintDeclarations. If there
   * are missing types in the type map, there will be at least one error.
   *
   * @param declarations: the list of QuintDeclarations to infer types for
   *
   * @returns a map from expression ids to their type schemes and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferTypes(declarations: QuintDeclaration[]): TypeInferenceResult {
    const typeIdsBefore = Array.from(this.types.keys())

    // Resolve all type applications used in expressions in the lookup table
    declarations.forEach(decl => {
      walkDeclaration(this, decl)
    })

    const typeIdsAfter = Array.from(this.types.keys())
    const newTypeIds = difference(typeIdsAfter, typeIdsBefore)
    // Simplify all new types
    newTypeIds.forEach(id => {
      this.types.set(id, simplify(this.types.get(id)!))
    })

    return [this.errors, this.types]
  }
}
