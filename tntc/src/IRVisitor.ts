import { TntEx, TntDef, TntModule, TntConst, TntName, TntApp, TntOpDef, TntModuleDef, TntInstance, TntImport, TntTypeDef, TntAssume, TntVar, TntInt, TntBool, TntLet, TntLambda, TntStr } from './tntIr'
import { TntType, TntVarType, TntConstType, TntBoolType, TntIntType, TntStrType, TntSetType, TntSeqType, TntFunType, TntOperType, TntTupleType, TntRecordType, TntUnionType } from './tntTypes'

export interface IRVisitor {
  /** General components */
  visitExpr?: (expr: TntEx) => void
  visitDef?: (def: TntDef) => void
  visitType?: (type: TntType) => void

  /** Definitions */
  visitOpDef?: (def: TntOpDef) => void
  visitConst?: (def: TntConst) => void
  visitVar?: (def: TntVar) => void
  visitAssume?: (def: TntAssume) => void
  visitTypeDef?: (def: TntTypeDef) => void
  visitImport?: (def: TntImport) => void
  visitInstance?: (def: TntInstance) => void
  visitModuleDef?: (def: TntModuleDef) => void

  /** Expressions */
  visitName?: (expr: TntName) => void
  visitBool?: (expr: TntBool) => void
  visitInt?: (expr: TntInt) => void
  visitStr?: (expr: TntStr) => void
  visitApp?: (expr: TntApp) => void
  visitLambda?: (expr: TntLambda) => void
  visitLet?: (expr: TntLet) => void

  /** Types */
  visitBoolType?: (type: TntBoolType) => void
  visitIntType?: (type: TntIntType) => void
  visitStrType?: (type: TntStrType) => void
  visitConstType?: (type: TntConstType) => void
  visitVarType?: (type: TntVarType) => void
  visitSetType?: (type: TntSetType) => void
  visitSeqType?: (type: TntSeqType) => void
  visitFunType?: (type: TntFunType) => void
  visitOperType?: (type: TntOperType) => void
  visitTupleType?: (type: TntTupleType) => void
  visitRecordType?: (type: TntRecordType) => void
  visitUnionType?: (type: TntUnionType) => void
}

export function walkModule (visitor: IRVisitor, tntModule: TntModule): void {
  tntModule.defs.forEach(def => walkDefinition(visitor, def))
}

function walkDefinition (visitor: IRVisitor, def: TntDef) {
  if (visitor.visitDef) {
    visitor.visitDef(def)
  }

  switch (def.kind) {
    case 'const':
      if (visitor.visitConst) {
        visitor.visitConst(def)
      }
      if (def.type) {
        walkType(visitor, def.type)
      }
      break
    case 'var':
      if (visitor.visitVar) {
        visitor.visitVar(def)
      }
      if (def.type) {
        walkType(visitor, def.type)
      }
      break
    case 'def':
      if (visitor.visitOpDef) {
        visitor.visitOpDef(def)
      }
      if (def.type) {
        walkType(visitor, def.type)
      }
      walkExpression(visitor, def.expr)
      break
    case 'typedef':
      if (visitor.visitTypeDef) {
        visitor.visitTypeDef(def)
      }
      if (def.type) {
        walkType(visitor, def.type)
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

function walkExpression (visitor: IRVisitor, expr: TntEx) {
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

function walkType (visitor: IRVisitor, type: TntType) {
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
      // Functions, check both argument and result
      walkType(visitor, type.arg)
      walkType(visitor, type.res)
      break

    case 'oper':
      if (visitor.visitOperType) {
        visitor.visitOperType(type)
      }
      // Operators, check all arguments and result
      type.args.forEach(arg => walkType(visitor, arg))
      walkType(visitor, type.res)
      break

    case 'tuple':
      if (visitor.visitTupleType) {
        visitor.visitTupleType(type)
      }
      // Tuples, check all elements
      type.elems.forEach(elem => walkType(visitor, elem))
      break

    case 'record':
      if (visitor.visitRecordType) {
        visitor.visitRecordType(type)
      }
      // Records, check all fields
      type.fields.forEach(field => walkType(visitor, field.fieldType))
      break

    case 'union':
      if (visitor.visitUnionType) {
        visitor.visitUnionType(type)
      }
      // Variants, check all fields for all records
      type.records.forEach(record => {
        record.fields.forEach(field => walkType(visitor, field.fieldType))
      })
      break
  }
}
