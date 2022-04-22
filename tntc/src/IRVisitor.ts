/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visitor pattern implementation for TNT IR components. Use this to navigate the IR instead
 * of implementing a recursion over it yourself.
 *
 * @author Gabriela Mafra
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
  visitExpr?: (expr: ir.TntEx) => void
  visitDef?: (def: ir.TntDef) => void
  visitType?: (type: t.TntType) => void

  /** Definitions */
  visitOpDef?: (def: ir.TntOpDef) => void
  visitConst?: (def: ir.TntConst) => void
  visitVar?: (def: ir.TntVar) => void
  visitAssume?: (def: ir.TntAssume) => void
  visitTypeDef?: (def: ir.TntTypeDef) => void
  visitImport?: (def: ir.TntImport) => void
  visitInstance?: (def: ir.TntInstance) => void
  visitModuleDef?: (def: ir.TntModuleDef) => void

  /** Expressions */
  visitName?: (expr: ir.TntName) => void
  visitBool?: (expr: ir.TntBool) => void
  visitInt?: (expr: ir.TntInt) => void
  visitStr?: (expr: ir.TntStr) => void
  visitApp?: (expr: ir.TntApp) => void
  visitLambda?: (expr: ir.TntLambda) => void
  visitLet?: (expr: ir.TntLet) => void

  /** Types */
  visitBoolType?: (type: t.TntBoolType) => void
  visitIntType?: (type: t.TntIntType) => void
  visitStrType?: (type: t.TntStrType) => void
  visitConstType?: (type: t.TntConstType) => void
  visitVarType?: (type: t.TntVarType) => void
  visitSetType?: (type: t.TntSetType) => void
  visitSeqType?: (type: t.TntSeqType) => void
  visitFunType?: (type: t.TntFunType) => void
  visitOperType?: (type: t.TntOperType) => void
  visitTupleType?: (type: t.TntTupleType) => void
  visitRecordType?: (type: t.TntRecordType) => void
  visitUnionType?: (type: t.TntUnionType) => void
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
  tntModule.defs.forEach(def => walkDefinition(visitor, def))
}

function walkDefinition (visitor: IRVisitor, def: ir.TntDef) {
  if (visitor.visitDef) {
    visitor.visitDef(def)
  }
  if (def.type) {
    walkType(visitor, def.type)
  }

  switch (def.kind) {
    case 'const':
      if (visitor.visitConst) {
        visitor.visitConst(def)
      }
      break
    case 'var':
      if (visitor.visitVar) {
        visitor.visitVar(def)
      }
      break
    case 'def':
      if (visitor.visitOpDef) {
        visitor.visitOpDef(def)
      }
      walkExpression(visitor, def.expr)
      break
    case 'typedef':
      if (visitor.visitTypeDef) {
        visitor.visitTypeDef(def)
      }
      break
    case 'instance':
      if (visitor.visitInstance) {
        visitor.visitInstance(def)
      }
      def.overrides.forEach(e => walkExpression(visitor, e[1]))
      break
    case 'module':
      if (visitor.visitModuleDef) {
        visitor.visitModuleDef(def)
      }
      walkModule(visitor, def.module)
      break
    case 'import':
      if (visitor.visitImport) {
        visitor.visitImport(def)
      }
      break
    case 'assume':
      if (visitor.visitAssume) {
        visitor.visitAssume(def)
      }
      walkExpression(visitor, def.assumption)
      break
  }
}

function walkExpression (visitor: IRVisitor, expr: ir.TntEx) {
  if (visitor.visitExpr) {
    visitor.visitExpr(expr)
  }

  switch (expr.kind) {
    case 'name':
      if (visitor.visitName) {
        visitor.visitName(expr)
      }
      break
    case 'bool':
      if (visitor.visitBool) {
        visitor.visitBool(expr)
      }
      break
    case 'int':
      if (visitor.visitInt) {
        visitor.visitInt(expr)
      }
      break
    case 'str':
      if (visitor.visitStr) {
        visitor.visitStr(expr)
      }
      break
    case 'app': {
      if (visitor.visitApp) {
        visitor.visitApp(expr)
      }

      expr.args.forEach(arg => walkExpression(visitor, arg))
      break
    }
    case 'lambda':
      if (visitor.visitLambda) {
        visitor.visitLambda(expr)
      }

      walkExpression(visitor, expr.expr)
      break
    case 'let':
      if (visitor.visitLet) {
        visitor.visitLet(expr)
      }

      walkDefinition(visitor, expr.opdef)
      walkExpression(visitor, expr.expr)
      break
  }
}

function walkType (visitor: IRVisitor, type: t.TntType) {
  if (visitor.visitType) {
    visitor.visitType(type)
  }

  switch (type.kind) {
    case 'bool':
      if (visitor.visitBoolType) {
        visitor.visitBoolType(type)
      }
      break
    case 'int':
      if (visitor.visitIntType) {
        visitor.visitIntType(type)
      }
      break
    case 'str':
      if (visitor.visitStrType) {
        visitor.visitStrType(type)
      }
      break
    case 'const':
      if (visitor.visitConstType) {
        visitor.visitConstType(type)
      }
      break
    case 'var':
      if (visitor.visitVarType) {
        visitor.visitVarType(type)
      }
      break
    case 'set':
      if (visitor.visitSetType) {
        visitor.visitSetType(type)
      }
      walkType(visitor, type.elem)
      break
    case 'seq':
      if (visitor.visitSeqType) {
        visitor.visitSeqType(type)
      }
      walkType(visitor, type.elem)
      break
    case 'fun':
      if (visitor.visitFunType) {
        visitor.visitFunType(type)
      }
      // Functions, walk both argument and result
      walkType(visitor, type.arg)
      walkType(visitor, type.res)
      break

    case 'oper':
      if (visitor.visitOperType) {
        visitor.visitOperType(type)
      }
      // Operators, walk all arguments and result
      type.args.forEach(arg => walkType(visitor, arg))
      walkType(visitor, type.res)
      break

    case 'tuple':
      if (visitor.visitTupleType) {
        visitor.visitTupleType(type)
      }
      // Tuples, walk all elements
      type.elems.forEach(elem => walkType(visitor, elem))
      break

    case 'record':
      if (visitor.visitRecordType) {
        visitor.visitRecordType(type)
      }
      // Records, walk all fields
      type.fields.forEach(field => walkType(visitor, field.fieldType))
      break

    case 'union':
      if (visitor.visitUnionType) {
        visitor.visitUnionType(type)
      }
      // Variants, walk all fields for all records
      type.records.forEach(record => {
        record.fields.forEach(field => walkType(visitor, field.fieldType))
      })
      break
  }
}
