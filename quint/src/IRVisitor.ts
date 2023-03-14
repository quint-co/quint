/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern implementation for Quint IR components. Use this to navigate the IR instead
 * of implementing a recursion over it yourself.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import * as ir from './quintIr'
import * as t from './quintTypes'

/**
 * Interface to be implemented by visitor classes.
 * Optionally defines functions for each IR component.
 */
export interface IRVisitor {
  enterModule?: (_module: ir.QuintModule) => void
  exitModule?: (_module: ir.QuintModule) => void

  /** General components */
  enterExpr?: (_expr: ir.QuintEx) => void
  exitExpr?: (_expr: ir.QuintEx) => void
  enterDef?: (_def: ir.QuintDef) => void
  exitDef?: (_def: ir.QuintDef) => void
  enterType?: (_type: t.QuintType) => void
  exitType?: (_type: t.QuintType) => void

  /** Definitions */
  enterOpDef?: (_def: ir.QuintOpDef) => void
  exitOpDef?: (_def: ir.QuintOpDef) => void
  enterConst?: (_def: ir.QuintConst) => void
  exitConst?: (_def: ir.QuintConst) => void
  enterVar?: (_def: ir.QuintVar) => void
  exitVar?: (_def: ir.QuintVar) => void
  enterAssume?: (_def: ir.QuintAssume) => void
  exitAssume?: (_def: ir.QuintAssume) => void
  enterTypeDef?: (_def: ir.QuintTypeDef) => void
  exitTypeDef?: (_def: ir.QuintTypeDef) => void
  enterImport?: (_def: ir.QuintImport) => void
  exitImport?: (_def: ir.QuintImport) => void
  enterInstance?: (_def: ir.QuintInstance) => void
  exitInstance?: (_def: ir.QuintInstance) => void

  /** Expressions */
  enterName?: (_expr: ir.QuintName) => void
  exitName?: (_expr: ir.QuintName) => void
  enterLiteral?: (_expr: ir.QuintBool | ir.QuintInt | ir.QuintStr) => void
  exitLiteral?: (_expr: ir.QuintBool | ir.QuintInt | ir.QuintStr) => void
  enterApp?: (_expr: ir.QuintApp) => void
  exitApp?: (_expr: ir.QuintApp) => void
  enterLambda?: (_expr: ir.QuintLambda) => void
  exitLambda?: (_expr: ir.QuintLambda) => void
  enterLet?: (_expr: ir.QuintLet) => void
  exitLet?: (_expr: ir.QuintLet) => void

  /** Types */
  enterLiteralType?: (_type: t.QuintBoolType | t.QuintIntType | t.QuintStrType) => void
  exitLiteralType?: (_type: t.QuintBoolType | t.QuintIntType | t.QuintStrType) => void
  enterConstType?: (_type: t.QuintConstType) => void
  exitConstType?: (_type: t.QuintConstType) => void
  enterVarType?: (_type: t.QuintVarType) => void
  exitVarType?: (_type: t.QuintVarType) => void
  enterSetType?: (_type: t.QuintSetType) => void
  exitSetType?: (_type: t.QuintSetType) => void
  enterSeqType?: (_type: t.QuintSeqType) => void
  exitSeqType?: (_type: t.QuintSeqType) => void
  enterFunType?: (_type: t.QuintFunType) => void
  exitFunType?: (_type: t.QuintFunType) => void
  enterOperType?: (_type: t.QuintOperType) => void
  exitOperType?: (_type: t.QuintOperType) => void
  enterTupleType?: (_type: t.QuintTupleType) => void
  exitTupleType?: (_type: t.QuintTupleType) => void
  enterRecordType?: (_type: t.QuintRecordType) => void
  exitRecordType?: (_type: t.QuintRecordType) => void
  enterUnionType?: (_type: t.QuintUnionType) => void
  exitUnionType?: (_type: t.QuintUnionType) => void

  /** Row types */
  enterRow?: (_row: t.Row) => void
  exitRow?: (_row: t.Row) => void
  enterConcreteRow?: (_row: t.ConcreteRow) => void
  exitConcreteRow?: (_row: t.ConcreteRow) => void
  enterVarRow?: (_row: t.VarRow) => void
  exitVarRow?: (_row: t.VarRow) => void
  enterEmptyRow?: (_row: t.EmptyRow) => void
  exitEmptyRow?: (_row: t.EmptyRow) => void
}

/**
 * Navigates a Quint module with a visitor, invoking the correspondent function for each
 * found IR component.
 *
 * @param visitor: the IRVisitor instance with the functions to be invoked
 * @param quintModule: the Quint module to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the IRVisitor instance.
 */
export function walkModule(visitor: IRVisitor, quintModule: ir.QuintModule): void {
  if (visitor.enterModule) {
    visitor.enterModule(quintModule)
  }

  quintModule.defs.forEach((def) => walkDefinition(visitor, def))

  if (visitor.exitModule) {
    visitor.exitModule(quintModule)
  }
}

/**
 * Navigates a Quint type with a visitor, invoking the correspondent function for each
 * inner type.
 *
 * @param visitor: the IRVisitor instance with the functions to be invoked
 * @param type: the Quint type to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the IRVisitor instance.
 */
export function walkType(visitor: IRVisitor, type: t.QuintType): void {
  if (visitor.enterType) {
    visitor.enterType(type)
  }

  switch (type.kind) {
    case 'bool':
    case 'int':
    case 'str':
      if (visitor.enterLiteralType) {
        visitor.enterLiteralType(type)
      }
      if (visitor.exitLiteralType) {
        visitor.exitLiteralType(type)
      }
      break
    case 'const':
      if (visitor.enterConstType) {
        visitor.enterConstType(type)
      }
      if (visitor.exitConstType) {
        visitor.exitConstType(type)
      }
      break
    case 'var':
      if (visitor.enterVarType) {
        visitor.enterVarType(type)
      }
      if (visitor.exitVarType) {
        visitor.exitVarType(type)
      }
      break
    case 'set':
      if (visitor.enterSetType) {
        visitor.enterSetType(type)
      }

      walkType(visitor, type.elem)

      if (visitor.exitSetType) {
        visitor.exitSetType(type)
      }
      break
    case 'list':
      if (visitor.enterSeqType) {
        visitor.enterSeqType(type)
      }

      walkType(visitor, type.elem)

      if (visitor.exitSeqType) {
        visitor.exitSeqType(type)
      }
      break
    case 'fun':
      if (visitor.enterFunType) {
        visitor.enterFunType(type)
      }
      // Functions, walk both argument and result
      walkType(visitor, type.arg)
      walkType(visitor, type.res)

      if (visitor.exitFunType) {
        visitor.exitFunType(type)
      }
      break

    case 'oper':
      if (visitor.enterOperType) {
        visitor.enterOperType(type)
      }
      // Operators, walk all arguments and result
      type.args.forEach(arg => walkType(visitor, arg))
      walkType(visitor, type.res)

      if (visitor.exitOperType) {
        visitor.exitOperType(type)
      }
      break

    case 'tup':
      if (visitor.enterTupleType) {
        visitor.enterTupleType(type)
      }
      // Tuples, walk all elements
      walkRow(visitor, type.fields)

      if (visitor.exitTupleType) {
        visitor.exitTupleType(type)
      }
      break

    case 'rec':
      if (visitor.enterRecordType) {
        visitor.enterRecordType(type)
      }
      // Records, walk all fields
      walkRow(visitor, type.fields)

      if (visitor.exitRecordType) {
        visitor.exitRecordType(type)
      }
      break

    case 'union':
      if (visitor.enterUnionType) {
        visitor.enterUnionType(type)
      }
      // Variants, walk all fields for all records
      type.records.forEach(record => {
        walkRow(visitor, record.fields)
      })

      if (visitor.exitUnionType) {
        visitor.exitUnionType(type)
      }
      break
  }

  if (visitor.exitType) {
    visitor.exitType(type)
  }
}

export function walkDefinition(visitor: IRVisitor, def: ir.QuintDef): void {
  if (visitor.enterDef) {
    visitor.enterDef(def)
  }
  if (ir.isAnnotatedDef(def)) {
    walkType(visitor, def.typeAnnotation)
  } else if (ir.isTypeAlias(def)) {
    walkType(visitor, def.type)
  }

  switch (def.kind) {
    case 'const':
      if (visitor.enterConst) {
        visitor.enterConst(def)
      }
      if (visitor.exitConst) {
        visitor.exitConst(def)
      }
      break
    case 'var':
      if (visitor.enterVar) {
        visitor.enterVar(def)
      }
      if (visitor.exitVar) {
        visitor.exitVar(def)
      }
      break
    case 'def':
      if (visitor.enterOpDef) {
        visitor.enterOpDef(def)
      }
      walkExpression(visitor, def.expr)

      if (visitor.exitOpDef) {
        visitor.exitOpDef(def)
      }
      break
    case 'typedef':
      if (visitor.enterTypeDef) {
        visitor.enterTypeDef(def)
      }
      if (visitor.exitTypeDef) {
        visitor.exitTypeDef(def)
      }
      break
    case 'instance':
      if (visitor.enterInstance) {
        visitor.enterInstance(def)
      }
      def.overrides.forEach(([_, e]) => walkExpression(visitor, e))
      if (visitor.exitInstance) {
        visitor.exitInstance(def)
      }
      break
    case 'import':
      if (visitor.enterImport) {
        visitor.enterImport(def)
      }
      if (visitor.exitImport) {
        visitor.exitImport(def)
      }
      break
    case 'assume':
      if (visitor.enterAssume) {
        visitor.enterAssume(def)
      }
      walkExpression(visitor, def.assumption)

      if (visitor.exitAssume) {
        visitor.exitAssume(def)
      }
      break
  }
  if (visitor.exitDef) {
    visitor.exitDef(def)
  }
}

function walkExpression(visitor: IRVisitor, expr: ir.QuintEx): void {
  if (visitor.enterExpr) {
    visitor.enterExpr(expr)
  }

  switch (expr.kind) {
    case 'name':
      if (visitor.enterName) {
        visitor.enterName(expr)
      }
      if (visitor.exitName) {
        visitor.exitName(expr)
      }
      break
    case 'bool':
    case 'int':
    case 'str':
      if (visitor.enterLiteral) {
        visitor.enterLiteral(expr)
      }
      if (visitor.exitLiteral) {
        visitor.exitLiteral(expr)
      }
      break
    case 'app': {
      if (visitor.enterApp) {
        visitor.enterApp(expr)
      }
      expr.args.forEach(arg => walkExpression(visitor, arg))

      if (visitor.exitApp) {
        visitor.exitApp(expr)
      }
      break
    }
    case 'lambda':
      if (visitor.enterLambda) {
        visitor.enterLambda(expr)
      }

      walkExpression(visitor, expr.expr)

      if (visitor.exitLambda) {
        visitor.exitLambda(expr)
      }
      break
    case 'let':
      if (visitor.enterLet) {
        visitor.enterLet(expr)
      }

      walkDefinition(visitor, expr.opdef)
      walkExpression(visitor, expr.expr)

      if (visitor.exitLet) {
        visitor.exitLet(expr)
      }
      break
  }

  if (visitor.exitExpr) {
    visitor.exitExpr(expr)
  }
}

function walkRow(visitor: IRVisitor, r: t.Row) {
  if (visitor.enterRow) {
    visitor.enterRow(r)
  }
  switch (r.kind) {
    case 'row':
      if (visitor.enterConcreteRow) {
        visitor.enterConcreteRow(r)
      }

      r.fields.forEach(field => walkType(visitor, field.fieldType))
      walkRow(visitor, r.other)

      if (visitor.exitConcreteRow) {
        visitor.exitConcreteRow(r)
      }
      break
    case 'var':
      if (visitor.enterVarRow) {
        visitor.enterVarRow(r)
      }
      if (visitor.exitVarRow) {
        visitor.exitVarRow(r)
      }
      break
    case 'empty':
      if (visitor.enterEmptyRow) {
        visitor.enterEmptyRow(r)
      }
      if (visitor.exitEmptyRow) {
        visitor.exitEmptyRow(r)
      }
  }
  if (visitor.exitRow) {
    visitor.exitRow(r)
  }
}
