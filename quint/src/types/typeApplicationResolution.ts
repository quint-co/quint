/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Resolution of type application
 *
 * @author Shon Feder
 *
 * @module
 */

import { fail } from 'assert'
import { FreshVarGenerator } from '../FreshVarGenerator'
import { IRTransformer, transformType } from '../ir/IRTransformer'
import { QuintTypeAlias } from '../ir/quintIr'
import { QuintAppType, QuintType, QuintVarType, Row } from '../ir/quintTypes'
import { LookupTable } from '../names/base'
import { zip } from '../util'
import { Substitutions, applySubstitution } from './substitutions'

export class TypeApplicationResolver implements IRTransformer {
  // Fresh variable generator, shared with the TypeInferrer
  private freshVarGenerator: FreshVarGenerator
  // Lookup table from the parser
  private table: LookupTable

  constructor(table: LookupTable, freshVarGenerator: FreshVarGenerator) {
    this.table = table
    this.freshVarGenerator = freshVarGenerator
  }

  exitType(t: QuintType): QuintType {
    return this.resolveTypeApplications(t)
  }

  // Transforms `t` by resolving all the type applications in all its sub-terms
  //
  // E.g., given
  //
  //   type Foo[a, b] = (a, b)
  //   type Bar[x, y] = {i: x, j: y}
  //
  //
  // resolveTypeAllications(Foo[a, {f: Bar[int, str]}]) = (a, {f: {i: int, j: str}})
  resolveTypeApplications(t: QuintType): QuintType {
    const f: (_: QuintType) => QuintType = x => (x.kind !== 'app' ? x : this.resolveTypeApp(x))
    return mapType(f, t)
  }

  private resolveTypeApp(t: QuintAppType): QuintType {
    const typeDef = this.table.get(t.ctor.id!)! // TODO
    if (typeDef.kind !== 'typedef' || !typeDef.type) {
      fail(`invalid kind looked up for constructor of type application with id ${t.ctor.id} `)
    }
    const { params, type } = this.freshTypeFromDef(typeDef as QuintTypeAlias)
    const subs: Substitutions = zip(params, t.args).map(([param, arg]) => ({
      kind: 'type',
      name: param.name,
      value: arg,
    }))
    const newType = applySubstitution(this.table, subs, type)
    return newType
  }

  // Given a type definition, extract the type it is defined by (with all type
  // parameters replaced with fresh variables) and a list of params giving the
  // fresh type variables in   the order corresponding to the params they
  // replaced in the type declaration.
  //
  // E.g., the type definition
  //
  //   type Result[ok, err] = Ok(ok) | Err(err)
  //
  // Will produce the result
  //
  //   { params: [fresh_ok, fresh_err],
  //     type: (Ok(fresh_ok) | Err(fresh_err))
  //   }
  private freshTypeFromDef(typeDef: QuintTypeAlias): { params: QuintVarType[]; type: QuintType } {
    if (!typeDef.params || typeDef.params.length === 0) {
      return { params: [], type: typeDef.type }
    }

    // Coordinates parameter names with their corresponding fresh variables
    const varsMap: Map<string, string> = new Map(
      typeDef.params.map(param => [param, this.freshVarGenerator.freshVar(param)])
    )

    // Parsing guarantees that every variable in a type def is in the params
    const type = mapTypeVarNames(n => varsMap.get(n) ?? n, typeDef.type)
    const freshParamNames = [...varsMap.values()]
    const params: QuintVarType[] = freshParamNames.map(name => ({ kind: 'var', name }))

    return { type, params }
  }
}

// Map type variable names according to `f`
function mapTypeVarNames(f: (_: string) => string, t: QuintType): QuintType {
  const transformer = new TypeVariableNameMapper(f)
  return transformType(transformer, t)
}

class TypeVariableNameMapper implements IRTransformer {
  private mapper: (_: string) => string

  constructor(f: (_: string) => string) {
    this.mapper = f
  }

  exitVarType(t: QuintVarType): QuintVarType {
    return { ...t, name: this.mapper(t.name) }
  }

  exitRow(r: Row): Row {
    return r.kind === 'var' ? { ...r, name: this.mapper(r.name) } : r
  }
}

// Transform `t`, and all its subterms, by `f`
function mapType(f: (_: QuintType) => QuintType, t: QuintType): QuintType {
  const transformer = new TypeMapper(f)
  return transformType(transformer, t)
}

class TypeMapper implements IRTransformer {
  private mapper: (_: QuintType) => QuintType

  constructor(f: (_: QuintType) => QuintType) {
    this.mapper = f
  }

  exitType(t: QuintType): QuintType {
    return this.mapper(t)
  }
}
