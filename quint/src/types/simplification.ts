/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Simplification for quint types
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRTransformer, transformRow, transformType } from '../ir/IRTransformer'
import { Row } from '../ir/quintTypes'
import { TypeScheme } from './base'

/**
 * Simplifies a type scheme by flattening all type rows.
 *
 * A row like `{ a: int | { b: bool | r } }` becomes
 * `{ a: int, b: bool | r }`.
 *
 * @param typeScheme - The type scheme to be simplified
 *
 * @returns The simplified type scheme
 */
export function simplify(typeScheme: TypeScheme): TypeScheme {
  const simplifier = new RowSimplifier()
  return { ...typeScheme, type: transformType(simplifier, typeScheme.type) }
}

/**
 * Simplifies a row type.
 *
 * A row like `{ a: int | { b: bool | r } }` becomes
 * `{ a: int, b: bool | r }`.
 *
 * @param row - The row to be simplified
 *
 * @returns The simplified row
 */
export function simplifyRow(row: Row): Row {
  const simplifier = new RowSimplifier()
  return transformRow(simplifier, row)
}

class RowSimplifier implements IRTransformer {
  exitRow(row: Row): Row {
    if (row.kind !== 'row') {
      return row
    }

    if (row.fields.length === 0) {
      return row.other
    }

    if (row.other.kind !== 'row') {
      return row
    }

    return { ...row, fields: row.fields.concat(row.other.fields), other: row.other.other }
  }
}
