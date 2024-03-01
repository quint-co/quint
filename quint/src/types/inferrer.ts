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
import { TypeApplicationResolver } from './typeApplicationResolution'
import { transformDeclaration, transformLookupDefinition } from '../ir/IRTransformer'

export type TypeInferenceResult = [Map<bigint, ErrorTree>, Map<bigint, TypeScheme>]

export class TypeInferrer extends ConstraintGeneratorVisitor {
  private resolver: TypeApplicationResolver
  constructor(table: LookupTable, types?: Map<bigint, TypeScheme>) {
    super(solveConstraint, table, types)
    this.resolver = new TypeApplicationResolver(this.table, this.freshVarGenerator)
  }

  /**
   * Infers a type for each expression in a list of QuintDeclarations
   *
   * @param declarations: the list of QuintDeclarations to infer types for
   *
   * @returns a map from expression ids to their type schemes and a map from expression
   *          ids to the corresponding error for any problematic expressions.
   */
  inferTypes(declarations: QuintDeclaration[]): TypeInferenceResult {
    this.table.forEach((def, id) => {
      // Don't resolve type definitions, since those should keep their original type variable names
      // They are our source of truth for all resolutions
      if (def.kind !== 'typedef') {
        this.table.set(id, transformLookupDefinition(this.resolver, def))
      }
    })
    declarations.forEach(decl => {
      const declWithTypeApplicationsResolved = transformDeclaration(this.resolver, decl)
      walkDeclaration(this, declWithTypeApplicationsResolved)
    })
    const simplifiedTypes = new Map([...this.types.entries()].map(([id, t]) => [id, simplify(t)]))
    return [this.errors, simplifiedTypes]
  }
}
