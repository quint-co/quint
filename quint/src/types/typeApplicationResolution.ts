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

import { ErrorTree, buildErrorLeaf } from '../errorTree'
import { FreshVarGenerator } from '../FreshVarGenerator'

import { definitionToString, typeToString } from '../ir/IRprinting'
import { IRTransformer, transformDeclaration, transformLookupDefinition, transformType } from '../ir/IRTransformer'
import { QuintDeclaration, QuintTypeAlias } from '../ir/quintIr'
import { QuintAppType, QuintType, QuintVarType, Row } from '../ir/quintTypes'
import { LookupTable } from '../names/base'
import { zip } from '../util'
import { substitutionsToString } from './printing'
import { Substitutions, applySubstitution } from './substitutions'
import assert from 'assert'

/** Resolves all type applications in an IR object */
export class TypeApplicationResolver implements IRTransformer {
  // Errors found during type application resolution
  private errors: Map<bigint, ErrorTree> = new Map<bigint, ErrorTree>()
  // Fresh variable generator, shared with the TypeInferrer
  private freshVarGenerator: FreshVarGenerator
  // Lookup table from the parser
  private table: LookupTable

  constructor(table: LookupTable) {
    this.table = table
    this.freshVarGenerator = new FreshVarGenerator()

    this.table.forEach((def, id) => {
      const resolvedLookupDef = transformLookupDefinition(this, def)
      this.table.set(id, resolvedLookupDef)
    })
  }

  resolveTypeApplications(decls: QuintDeclaration[]): [Map<bigint, ErrorTree>, QuintDeclaration[]] {
    const resolvedDecls = decls.map(decl => transformDeclaration(this, decl))
    const errors = this.errors
    return [errors, resolvedDecls]
  }

  exitType(t: QuintType): QuintType {
    return this.resolveTypeApplicationsForType(t)
  }

  // Transforms `t` by resolving all the type applications in all its sub-terms
  //
  // E.g., given
  //
  //   type Foo[a, b] = (a, b)
  //   type Bar[x, y] = {i: x, j: y}
  //
  //
  // resolveTypeApplicationsForType(Foo[a, {f: Bar[int, str]}]) = (a, {f: {i: int, j: str}})
  private resolveTypeApplicationsForType(t: QuintType): QuintType {
    const f: (_: QuintType) => QuintType = x => (x.kind !== 'app' ? x : this.resolveTypeApp(x))
    return mapType(f, t)
  }

  private resolveTypeApp(t: QuintAppType): QuintType {
    // Ensured by parsing
    assert(t.id, `invalid IR node: type application ${typeToString(t)} has no id`)
    // Ensured by parsing
    assert(
      t.ctor.id,
      `invalid IR node: type constructor ${t.ctor.name} in type application ${typeToString(t)} id ${t.id} has no id`
    )

    const typeDef = this.table.get(t.ctor.id)
    // Ensured by name resolution
    assert(typeDef, `invalid IR reference: type constructor ${t.ctor.name} with id ${t.ctor.id} has no type definition`)
    // Ensured by the grammar and by name resolution
    assert(
      typeDef.kind === 'typedef' && typeDef.type,
      `invalid kind looked up for constructor of type application with id ${t.ctor.id} `
    )

    const { params, type } = this.freshTypeFromDef(typeDef as QuintTypeAlias)

    // NOTE: Early exit on error
    // Check for arity mismatch in type application
    if (params.length !== t.args.length) {
      const ctorMsg = typeToString(t.ctor)
      const typeArgsMsg = t.args.map(typeToString).join(', ')
      const manyOrFew = params.length > t.args.length ? 'few' : 'many'
      const err = buildErrorLeaf(
        `applying type constructor ${ctorMsg} to arguments ${typeArgsMsg}`,
        `too ${manyOrFew} arguments supplied: ${ctorMsg} only accepts ${params.length} parameters`
      )
      this.errors.set(t.id, err)
      return t
    }

    // Substitute the type `args` for each corresponding fresh variable
    const subs: Substitutions = zip(params, t.args).flatMap(([param, arg]) => {
      let resolvedArg = arg
      while (resolvedArg.kind == 'const') {
        const aliasValue = this.table.get(resolvedArg.id!)
        if (aliasValue && aliasValue.kind === 'typedef' && aliasValue.type) {
          resolvedArg = aliasValue.type
        } else {
          break
        }
      }

      const s: Substitutions = [{
        kind: 'type',
        name: param.name,
        value: resolvedArg,
      }]

      if (resolvedArg.kind == 'rec' || resolvedArg.kind == 'tup') {
        s.push({
          kind: 'row',
          name: param.name,
          value: resolvedArg.fields,
        })
      }
      if (resolvedArg.kind == 'var' ) {
        s.push({
          kind: 'row',
          name: param.name,
          value: { kind: 'var', name: resolvedArg.name },
        })

      }
      return s
    })
    return applySubstitution(this.table, subs, type)
  }

  // Given a type definition, extract the type it is defined by (with all type
  // parameters replaced with fresh variables) and a list of params giving the
  // fresh type variables in the order corresponding to the params they
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

  enterVarType(t: QuintVarType): QuintVarType {
    return { ...t, name: this.mapper(t.name) }
  }

  enterRow(r: Row): Row {
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
