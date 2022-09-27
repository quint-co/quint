/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern implementation for TNT IR components. Use this to navigate the IR instead
 * of implementing a recursion over it yourself.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import * as ir from './tntIr'
import * as t from './tntTypes'

/**
 * Interface to be implemented by visitor classes.
 * Optionally defines functions for each IR component.
 */
export interface IRVisitor {
  /** General components */
  enterExpr?: (expr: ir.TntEx) => void
  exitExpr?: (expr: ir.TntEx) => void
  enterDef?: (def: ir.TntDef) => void
  exitDef?: (def: ir.TntDef) => void
  enterType?: (type: t.TntType) => void
  exitType?: (type: t.TntType) => void

  /** Definitions */
  enterOpDef?: (def: ir.TntOpDef) => void
  exitOpDef?: (def: ir.TntOpDef) => void
  enterConst?: (def: ir.TntConst) => void
  exitConst?: (def: ir.TntConst) => void
  enterVar?: (def: ir.TntVar) => void
  exitVar?: (def: ir.TntVar) => void
  enterAssume?: (def: ir.TntAssume) => void
  exitAssume?: (def: ir.TntAssume) => void
  enterTypeDef?: (def: ir.TntTypeDef) => void
  exitTypeDef?: (def: ir.TntTypeDef) => void
  enterImport?: (def: ir.TntImport) => void
  exitImport?: (def: ir.TntImport) => void
  enterInstance?: (def: ir.TntInstance) => void
  exitInstance?: (def: ir.TntInstance) => void
  enterModuleDef?: (def: ir.TntModuleDef) => void
  exitModuleDef?: (def: ir.TntModuleDef) => void

  /** Expressions */
  enterName?: (expr: ir.TntName) => void
  exitName?: (expr: ir.TntName) => void
  enterLiteral?: (expr: ir.TntBool | ir.TntInt | ir.TntStr) => void
  exitLiteral?: (expr: ir.TntBool | ir.TntInt | ir.TntStr) => void
  enterApp?: (expr: ir.TntApp) => void
  exitApp?: (expr: ir.TntApp) => void
  enterLambda?: (expr: ir.TntLambda) => void
  exitLambda?: (expr: ir.TntLambda) => void
  enterLet?: (expr: ir.TntLet) => void
  exitLet?: (expr: ir.TntLet) => void

  /** Types */
  enterLiteralType?: (type: t.TntBoolType | t.TntIntType | t.TntStrType) => void
  exitLiteralType?: (type: t.TntBoolType | t.TntIntType | t.TntStrType) => void
  enterConstType?: (type: t.TntConstType) => void
  exitConstType?: (type: t.TntConstType) => void
  enterVarType?: (type: t.TntVarType) => void
  exitVarType?: (type: t.TntVarType) => void
  enterSetType?: (type: t.TntSetType) => void
  exitSetType?: (type: t.TntSetType) => void
  enterSeqType?: (type: t.TntSeqType) => void
  exitSeqType?: (type: t.TntSeqType) => void
  enterFunType?: (type: t.TntFunType) => void
  exitFunType?: (type: t.TntFunType) => void
  enterOperType?: (type: t.TntOperType) => void
  exitOperType?: (type: t.TntOperType) => void
  enterTupleType?: (type: t.TntTupleType) => void
  exitTupleType?: (type: t.TntTupleType) => void
  enterRecordType?: (type: t.TntRecordType) => void
  exitRecordType?: (type: t.TntRecordType) => void
  enterUnionType?: (type: t.TntUnionType) => void
  exitUnionType?: (type: t.TntUnionType) => void
}

/**
 * Navigates a TNT module with a visitor, invoking the correspondent function for each
 * found IR component.
 *
 * @param visitor: the IRVisitor instance with the functions to be invoked
 * @param tntModule: the TNT module to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the IRVisitor instance.
 */
export function walkModule (visitor: IRVisitor, tntModule: ir.TntModule): void {
  const moduleDef: ir.TntModuleDef = {
    kind: 'module', id: 0n, module: tntModule,
  }
  if (visitor.enterModuleDef) {
    visitor.enterModuleDef(moduleDef)
  }
  tntModule.defs.forEach(def => walkDefinition(visitor, def))
  if (visitor.exitModuleDef) {
    visitor.exitModuleDef(moduleDef)
  }
}

/**
 * Navigates a TNT type with a visitor, invoking the correspondent function for each
 * inner type.
 *
 * @param visitor: the IRVisitor instance with the functions to be invoked
 * @param type: the TNT type to be navigated
 *
 * @returns nothing, any collected information has to be a state inside the IRVisitor instance.
 */
export function walkType (visitor: IRVisitor, type: t.TntType): void {
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
    case 'seq':
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

    case 'tuple':
      if (visitor.enterTupleType) {
        visitor.enterTupleType(type)
      }
      // Tuples, walk all elements
      type.elems.forEach(elem => walkType(visitor, elem))

      if (visitor.exitTupleType) {
        visitor.exitTupleType(type)
      }
      break

    case 'record':
      if (visitor.enterRecordType) {
        visitor.enterRecordType(type)
      }
      // Records, walk all fields
      type.fields.forEach(field => walkType(visitor, field.fieldType))

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
        record.fields.forEach(field => walkType(visitor, field.fieldType))
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

function walkDefinition (visitor: IRVisitor, def: ir.TntDef): void {
  if (visitor.enterDef) {
    visitor.enterDef(def)
  }
  if (def.type) {
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
      def.overrides.forEach(e => walkExpression(visitor, e[1]))
      if (visitor.exitInstance) {
        visitor.exitInstance(def)
      }
      break
    case 'module':
      if (visitor.enterModuleDef) {
        visitor.enterModuleDef(def)
      }
      def.module.defs.forEach(def => walkDefinition(visitor, def))

      if (visitor.exitModuleDef) {
        visitor.exitModuleDef(def)
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

function walkExpression (visitor: IRVisitor, expr: ir.TntEx): void {
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
