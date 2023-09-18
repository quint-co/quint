/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Simplification for quint types
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformType } from '../ir/IRTransformer'
import { ConcreteRow } from '../ir/quintTypes'
import { TypeScheme } from './base'

/**
 * Simplifies a type scheme by flattening all type rows.
 *
 * A row like `{ a: int | { b: bool | r } }` becomes
 * `{ a: int, b: bool | r }`.
 *
 * @param typeScheme - The type scheme to me simplified
 *
 * @returns The simplified type scheme
 */
export function simplify(typeScheme: TypeScheme): TypeScheme {
  const simplifier = new RowSimplifier()
  return { ...typeScheme, type: transformType(simplifier, typeScheme.type) }
}

class RowSimplifier implements IRTransformer {
  exitConcreteRow(row: ConcreteRow): ConcreteRow {
    if (row.other.kind !== 'row') {
      return row
    }

    return { ...row, fields: row.fields.concat(row.other.fields), other: row.other.other }
  }
}
