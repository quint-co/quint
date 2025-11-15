/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern-like implementation for Quint IR components. Use this to
 * transform the IR instead of implementing a recursion over it yourself.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import * as ir from './quintIr'
import * as t from './quintTypes'
import { unreachable } from '../util'
import { LookupDefinition } from '../names/base'
import cloneDeep from 'lodash.clonedeep'

export class IRTransformer {
  enterModule?: (module: ir.QuintModule) => ir.QuintModule
  exitModule?: (module: ir.QuintModule) => ir.QuintModule

  /** General components */
  enterExpr?: (expr: ir.QuintEx) => ir.QuintEx
  exitExpr?: (expr: ir.QuintEx) => ir.QuintEx
  enterDef?: (def: ir.QuintDef) => ir.QuintDef
  exitDef?: (def: ir.QuintDef) => ir.QuintDef
  enterDecl?: (decl: ir.QuintDeclaration) => ir.QuintDeclaration
  exitDecl?: (decl: ir.QuintDeclaration) => ir.QuintDeclaration
  enterType?: (type: t.QuintType) => t.QuintType
  exitType?: (type: t.QuintType) => t.QuintType

  /** Definitions */
  enterOpDef?: (def: ir.QuintOpDef) => ir.QuintOpDef
  exitOpDef?: (def: ir.QuintOpDef) => ir.QuintOpDef
  enterConst?: (def: ir.QuintConst) => ir.QuintConst
  exitConst?: (def: ir.QuintConst) => ir.QuintConst
  enterVar?: (def: ir.QuintVar) => ir.QuintVar
  exitVar?: (def: ir.QuintVar) => ir.QuintVar
  enterAssume?: (def: ir.QuintAssume) => ir.QuintAssume
  exitAssume?: (def: ir.QuintAssume) => ir.QuintAssume
  enterTypeDef?: (def: ir.QuintTypeDef) => ir.QuintTypeDef
  exitTypeDef?: (def: ir.QuintTypeDef) => ir.QuintTypeDef
  enterImport?: (def: ir.QuintImport) => ir.QuintImport
  exitImport?: (def: ir.QuintImport) => ir.QuintImport
  enterExport?: (def: ir.QuintExport) => ir.QuintExport
  exitExport?: (def: ir.QuintExport) => ir.QuintExport
  enterInstance?: (def: ir.QuintInstance) => ir.QuintInstance
  exitInstance?: (def: ir.QuintInstance) => ir.QuintInstance

  /** Expressions */
  enterName?: (expr: ir.QuintName) => ir.QuintName
  exitName?: (expr: ir.QuintName) => ir.QuintName
  enterLiteral?: (expr: ir.QuintBool | ir.QuintInt | ir.QuintStr) => ir.QuintBool | ir.QuintInt | ir.QuintStr
  exitLiteral?: (expr: ir.QuintBool | ir.QuintInt | ir.QuintStr) => ir.QuintBool | ir.QuintInt | ir.QuintStr
  enterApp?: (expr: ir.QuintApp) => ir.QuintApp
  exitApp?: (expr: ir.QuintApp) => ir.QuintApp
  enterLambda?: (expr: ir.QuintLambda) => ir.QuintLambda
  exitLambda?: (expr: ir.QuintLambda) => ir.QuintLambda
  enterLet?: (expr: ir.QuintLet) => ir.QuintLet
  exitLet?: (expr: ir.QuintLet) => ir.QuintLet

  /** Types */
  enterLiteralType?: (
    type: t.QuintBoolType | t.QuintIntType | t.QuintStrType
  ) => t.QuintBoolType | t.QuintIntType | t.QuintStrType
  exitLiteralType?: (
    type: t.QuintBoolType | t.QuintIntType | t.QuintStrType
  ) => t.QuintBoolType | t.QuintIntType | t.QuintStrType
  enterConstType?: (type: t.QuintConstType) => t.QuintConstType
  exitConstType?: (type: t.QuintConstType) => t.QuintConstType
  enterVarType?: (type: t.QuintVarType) => t.QuintVarType
  exitVarType?: (type: t.QuintVarType) => t.QuintVarType
  enterSetType?: (type: t.QuintSetType) => t.QuintSetType
  exitSetType?: (type: t.QuintSetType) => t.QuintSetType
  enterSeqType?: (type: t.QuintSeqType) => t.QuintSeqType
  exitSeqType?: (type: t.QuintSeqType) => t.QuintSeqType
  enterFunType?: (type: t.QuintFunType) => t.QuintFunType
  exitFunType?: (type: t.QuintFunType) => t.QuintFunType
  enterOperType?: (type: t.QuintOperType) => t.QuintOperType
  exitOperType?: (type: t.QuintOperType) => t.QuintOperType
  enterTupleType?: (type: t.QuintTupleType) => t.QuintTupleType
  exitTupleType?: (type: t.QuintTupleType) => t.QuintTupleType
  enterRecordType?: (type: t.QuintRecordType) => t.QuintRecordType
  exitRecordType?: (type: t.QuintRecordType) => t.QuintRecordType
  enterSumType?: (type: t.QuintSumType) => t.QuintSumType
  exitSumType?: (type: t.QuintSumType) => t.QuintSumType
  enterAppType?: (type: t.QuintAppType) => t.QuintAppType
  exitAppType?: (type: t.QuintAppType) => t.QuintAppType

  /** Row types */
  enterRow?: (row: t.Row) => t.Row
  exitRow?: (row: t.Row) => t.Row
  enterConcreteRow?: (row: t.ConcreteRow) => t.ConcreteRow
  exitConcreteRow?: (row: t.ConcreteRow) => t.ConcreteRow
  enterVarRow?: (row: t.VarRow) => t.VarRow
  exitVarRow?: (row: t.VarRow) => t.VarRow
  enterEmptyRow?: (row: t.EmptyRow) => t.EmptyRow
  exitEmptyRow?: (row: t.EmptyRow) => t.EmptyRow
}

/**
 * Navigates a Quint module with a transformer, invoking the correspondent function for each
 * found IR component.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param quintModule: the Quint module to be navigated
 *
 * @returns the transformed Quint module
 */
export function transformModule(transformer: IRTransformer, quintModule: ir.QuintModule): ir.QuintModule {
  let newModule = cloneDeep(quintModule)

  if (transformer.enterModule) {
    newModule = transformer.enterModule(newModule)
  }

  newModule.declarations = newModule.declarations.map(decl => transformDeclaration(transformer, decl))

  if (transformer.exitModule) {
    newModule = transformer.exitModule(newModule)
  }

  return newModule
}

/**
 * Navigates a Quint type with a transformer, invoking the correspondent function for each
 * inner type.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param type: the Quint type to be navigated
 *
 * @returns the transformed Quint type
 */
export function transformType(transformer: IRTransformer, type: t.QuintType): t.QuintType {
  let newType = cloneDeep(type)
  if (transformer.enterType) {
    newType = transformer.enterType(newType)
  }

  switch (newType.kind) {
    case 'bool':
    case 'int':
    case 'str':
      if (transformer.enterLiteralType) {
        newType = transformer.enterLiteralType(newType)
      }
      if (transformer.exitLiteralType) {
        newType = transformer.exitLiteralType(newType)
      }
      break
    case 'const':
      if (transformer.enterConstType) {
        newType = transformer.enterConstType(newType)
      }
      if (transformer.exitConstType) {
        newType = transformer.exitConstType(newType)
      }
      break
    case 'var':
      if (transformer.enterVarType) {
        newType = transformer.enterVarType(newType)
      }
      if (transformer.exitVarType) {
        newType = transformer.exitVarType(newType)
      }
      break
    case 'set':
      if (transformer.enterSetType) {
        newType = transformer.enterSetType(newType)
      }

      newType.elem = transformType(transformer, newType.elem)

      if (transformer.exitSetType) {
        newType = transformer.exitSetType(newType)
      }
      break
    case 'list':
      if (transformer.enterSeqType) {
        newType = transformer.enterSeqType(newType)
      }

      newType.elem = transformType(transformer, newType.elem)

      if (transformer.exitSeqType) {
        newType = transformer.exitSeqType(newType)
      }
      break
    case 'fun':
      if (transformer.enterFunType) {
        newType = transformer.enterFunType(newType)
      }
      // Functions, transform both argument and result
      newType.arg = transformType(transformer, newType.arg)
      newType.res = transformType(transformer, newType.res)

      if (transformer.exitFunType) {
        newType = transformer.exitFunType(newType)
      }
      break

    case 'oper':
      if (transformer.enterOperType) {
        transformer.enterOperType(newType)
      }
      // Operators, transform all arguments and result
      newType.args = newType.args.map(arg => transformType(transformer, arg))
      newType.res = transformType(transformer, newType.res)

      if (transformer.exitOperType) {
        newType = transformer.exitOperType(newType)
      }
      break

    case 'tup':
      if (transformer.enterTupleType) {
        newType = transformer.enterTupleType(newType)
      }
      // Tuples, transform all elements
      newType.fields = transformRow(transformer, newType.fields)

      if (transformer.exitTupleType) {
        newType = transformer.exitTupleType(newType)
      }
      break

    case 'rec':
      if (transformer.enterRecordType) {
        newType = transformer.enterRecordType(newType)
      }
      // Records, transform all fields
      newType.fields = transformRow(transformer, newType.fields)

      if (transformer.exitRecordType) {
        newType = transformer.exitRecordType(newType)
      }
      break

    case 'sum':
      {
        if (transformer.enterSumType) {
          newType = transformer.enterSumType(newType)
        }
        // Sum types, transform all types
        const newFields = transformRow(transformer, newType.fields)
        if (newFields.kind !== 'row') {
          throw new Error('Impossible: sum type fields transformed into non-row')
        }
        newType.fields = newFields

        if (transformer.exitSumType) {
          newType = transformer.exitSumType(newType)
        }
      }
      break

    case 'app':
      {
        if (transformer.enterAppType) {
          newType = transformer.enterAppType(newType)
        }

        newType.args = newType.args.map(v => transformType(transformer, v))

        if (transformer.exitAppType) {
          newType = transformer.exitAppType(newType)
        }
      }
      break

    default:
      unreachable(newType)
  }

  if (transformer.exitType) {
    newType = transformer.exitType(newType)
  }

  return newType
}

/**
 * Transforms a Quint LookupDefinition with a transformer
 *
 * This is just a thin wrapper to deal with the fact that LookupDefinitions are a slightly awkward union.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param lud: the Quint LookupDefinition to be transformed
 *
 * @returns the transformed LookupDefinition
 */
export function transformLookupDefinition(transformer: IRTransformer, lud: LookupDefinition): LookupDefinition {
  switch (lud.kind) {
    case 'const':
    case 'def':
    case 'var':
    case 'assume':
    case 'typedef':
      return transformDefinition(transformer, lud)

    case 'param':
      return lud.typeAnnotation ? { ...lud, typeAnnotation: transformType(transformer, lud.typeAnnotation) } : lud
  }
}

/**
 * Transforms a Quint declaration with a transformer, invoking the corresponding function for each
 * inner component.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param decl: the Quint declaration to be transformed
 *
 * @returns the transformed Quint definition
 */
export function transformDeclaration(transformer: IRTransformer, decl: ir.QuintDeclaration): ir.QuintDeclaration {
  let newDecl = cloneDeep(decl)
  if (transformer.enterDecl) {
    newDecl = transformer.enterDecl(newDecl)
  }

  switch (newDecl.kind) {
    case 'instance':
      if (transformer.enterInstance) {
        newDecl = transformer.enterInstance(newDecl)
      }
      newDecl.overrides = newDecl.overrides.map(([i, e]) => [i, transformExpression(transformer, e)])
      if (transformer.exitInstance) {
        newDecl = transformer.exitInstance(newDecl)
      }
      break
    case 'import':
      if (transformer.enterImport) {
        newDecl = transformer.enterImport(newDecl)
      }
      if (transformer.exitImport) {
        newDecl = transformer.exitImport(newDecl)
      }
      break
    case 'export':
      if (transformer.enterExport) {
        newDecl = transformer.enterExport(newDecl)
      }
      if (transformer.exitExport) {
        newDecl = transformer.exitExport(newDecl)
      }
      break
    case 'const':
    case 'var':
    case 'def':
    case 'typedef':
    case 'assume':
      newDecl = transformDefinition(transformer, newDecl)
      break
    default:
      unreachable(newDecl)
  }
  if (transformer.exitDecl) {
    newDecl = transformer.exitDecl(newDecl)
  }

  return newDecl
}

/**
 * Transforms a Quint definition with a transformer, invoking the correspondent function for each
 * inner component.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param def: the Quint definition to be transformed
 *
 * @returns the transformed Quint definition
 */
export function transformDefinition(transformer: IRTransformer, def: ir.QuintDef): ir.QuintDef {
  let newDef = cloneDeep(def)
  if (transformer.enterDef) {
    newDef = transformer.enterDef(newDef)
  }
  if (ir.isAnnotatedDef(newDef)) {
    newDef.typeAnnotation = transformType(transformer, newDef.typeAnnotation)
  } else if (ir.isTypeAlias(newDef)) {
    newDef.type = transformType(transformer, newDef.type)
  }

  switch (newDef.kind) {
    case 'const':
      if (transformer.enterConst) {
        newDef = transformer.enterConst(newDef)
      }
      if (transformer.exitConst) {
        newDef = transformer.exitConst(newDef)
      }
      break
    case 'var':
      if (transformer.enterVar) {
        newDef = transformer.enterVar(newDef)
      }
      if (transformer.exitVar) {
        newDef = transformer.exitVar(newDef)
      }
      break
    case 'def':
      if (transformer.enterOpDef) {
        newDef = transformer.enterOpDef(newDef)
      }
      newDef.expr = transformExpression(transformer, newDef.expr)

      if (transformer.exitOpDef) {
        newDef = transformer.exitOpDef(newDef)
      }
      break
    case 'typedef':
      if (transformer.enterTypeDef) {
        newDef = transformer.enterTypeDef(newDef)
      }
      if (transformer.exitTypeDef) {
        newDef = transformer.exitTypeDef(newDef)
      }
      break
    case 'assume':
      if (transformer.enterAssume) {
        newDef = transformer.enterAssume(newDef)
      }
      newDef.assumption = transformExpression(transformer, newDef.assumption)

      if (transformer.exitAssume) {
        newDef = transformer.exitAssume(newDef)
      }
      break
    default:
      unreachable(newDef)
  }
  if (transformer.exitDef) {
    newDef = transformer.exitDef(newDef)
  }

  return newDef
}

/**
 * Transforms a Quint expression with a transformer, invoking the correspondent function for each
 * inner component.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param expr: the Quint expression to be transformed
 *
 * @returns the transformed Quint expression
 */
function transformExpression(transformer: IRTransformer, expr: ir.QuintEx): ir.QuintEx {
  let newExpr = cloneDeep(expr)
  if (transformer.enterExpr) {
    newExpr = transformer.enterExpr(newExpr)
  }

  switch (newExpr.kind) {
    case 'name':
      if (transformer.enterName) {
        newExpr = transformer.enterName(newExpr)
      }
      if (transformer.exitName) {
        newExpr = transformer.exitName(newExpr)
      }
      break
    case 'bool':
    case 'int':
    case 'str':
      if (transformer.enterLiteral) {
        newExpr = transformer.enterLiteral(newExpr)
      }
      if (transformer.exitLiteral) {
        newExpr = transformer.exitLiteral(newExpr)
      }
      break
    case 'app': {
      if (transformer.enterApp) {
        newExpr = transformer.enterApp(newExpr)
      }
      newExpr.args = newExpr.args.map(arg => transformExpression(transformer, arg))

      if (transformer.exitApp) {
        newExpr = transformer.exitApp(newExpr)
      }
      break
    }
    case 'lambda':
      if (transformer.enterLambda) {
        newExpr = transformer.enterLambda(newExpr)
      }

      newExpr.params = newExpr.params.map(p =>
        p.typeAnnotation ? { ...p, typeAnnotation: transformType(transformer, p.typeAnnotation) } : p
      )
      newExpr.expr = transformExpression(transformer, newExpr.expr)

      if (transformer.exitLambda) {
        newExpr = transformer.exitLambda(newExpr)
      }
      break
    case 'let':
      {
        if (transformer.enterLet) {
          newExpr = transformer.enterLet(newExpr)
        }

        const opdef = transformDefinition(transformer, newExpr.opdef)
        if (opdef.kind !== 'def') {
          // This should only happen if we write a bad transformer. Should never
          // be a user facing issue.
          throw new Error('Let operator definition transformed into non-operator definition')
        }

        newExpr.opdef = opdef
        newExpr.expr = transformExpression(transformer, newExpr.expr)

        if (transformer.exitLet) {
          newExpr = transformer.exitLet(newExpr)
        }
      }
      break

    default:
      unreachable(newExpr)
  }

  if (transformer.exitExpr) {
    newExpr = transformer.exitExpr(newExpr)
  }

  return newExpr
}

/**
 * Transforms a Quint row with a transformer, invoking the correspondent function for each
 * inner component.
 *
 * @param transformer: the IRTransformer instance with the functions to be invoked
 * @param row: the Quint row to be transformed
 *
 * @returns the transformed Quint row
 */
export function transformRow(transformer: IRTransformer, row: t.Row): t.Row {
  let newRow = cloneDeep(row)
  if (transformer.enterRow) {
    newRow = transformer.enterRow(newRow)
  }
  switch (newRow.kind) {
    case 'row':
      if (transformer.enterConcreteRow) {
        newRow = transformer.enterConcreteRow(newRow)
      }

      newRow.fields = newRow.fields.map(field => ({ ...field, fieldType: transformType(transformer, field.fieldType) }))
      newRow.other = transformRow(transformer, newRow.other)

      if (transformer.exitConcreteRow) {
        newRow = transformer.exitConcreteRow(newRow)
      }
      break
    case 'var':
      if (transformer.enterVarRow) {
        newRow = transformer.enterVarRow(newRow)
      }
      if (transformer.exitVarRow) {
        newRow = transformer.exitVarRow(newRow)
      }
      break
    case 'empty':
      if (transformer.enterEmptyRow) {
        newRow = transformer.enterEmptyRow(newRow)
      }
      if (transformer.exitEmptyRow) {
        newRow = transformer.exitEmptyRow(newRow)
      }
  }
  if (transformer.exitRow) {
    newRow = transformer.exitRow(newRow)
  }

  return newRow
}
