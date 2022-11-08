// Generated from ./src/generated/Tnt.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { TypeFunContext } from "./TntParser";
import { TypeOperContext } from "./TntParser";
import { TypeSetContext } from "./TntParser";
import { TypeListContext } from "./TntParser";
import { TypeTupleContext } from "./TntParser";
import { TypeRecContext } from "./TntParser";
import { TypeUnionRecContext } from "./TntParser";
import { TypeIntContext } from "./TntParser";
import { TypeStrContext } from "./TntParser";
import { TypeBoolContext } from "./TntParser";
import { TypeConstOrVarContext } from "./TntParser";
import { TypeParenContext } from "./TntParser";
import { ConstContext } from "./TntParser";
import { VarContext } from "./TntParser";
import { AssumeContext } from "./TntParser";
import { OperContext } from "./TntParser";
import { ModuleNestedContext } from "./TntParser";
import { InstanceContext } from "./TntParser";
import { TypedefContext } from "./TntParser";
import { ImportDefContext } from "./TntParser";
import { DotCallContext } from "./TntParser";
import { LambdaConsContext } from "./TntParser";
import { OperAppContext } from "./TntParser";
import { ListAppContext } from "./TntParser";
import { UminusContext } from "./TntParser";
import { PowContext } from "./TntParser";
import { MultDivContext } from "./TntParser";
import { PlusMinusContext } from "./TntParser";
import { RelationsContext } from "./TntParser";
import { ErrorEqContext } from "./TntParser";
import { AndContext } from "./TntParser";
import { OrContext } from "./TntParser";
import { IffContext } from "./TntParser";
import { ImpliesContext } from "./TntParser";
import { MatchContext } from "./TntParser";
import { AndExprContext } from "./TntParser";
import { OrExprContext } from "./TntParser";
import { ActionAllContext } from "./TntParser";
import { ActionAnyContext } from "./TntParser";
import { LiteralOrIdContext } from "./TntParser";
import { TupleContext } from "./TntParser";
import { PairContext } from "./TntParser";
import { RecordContext } from "./TntParser";
import { ListContext } from "./TntParser";
import { IfElseContext } from "./TntParser";
import { LetInContext } from "./TntParser";
import { ParenContext } from "./TntParser";
import { BracesContext } from "./TntParser";
import { ModuleContext } from "./TntParser";
import { UnitContext } from "./TntParser";
import { OperDefContext } from "./TntParser";
import { QualifierContext } from "./TntParser";
import { ParamsContext } from "./TntParser";
import { InstanceModContext } from "./TntParser";
import { TypeContext } from "./TntParser";
import { TypeUnionRecOneContext } from "./TntParser";
import { ExprContext } from "./TntParser";
import { UnitOrExprContext } from "./TntParser";
import { LambdaContext } from "./TntParser";
import { IdentOrHoleContext } from "./TntParser";
import { IdentOrStarContext } from "./TntParser";
import { PathContext } from "./TntParser";
import { ArgListContext } from "./TntParser";
import { NormalCallNameContext } from "./TntParser";
import { NameAfterDotContext } from "./TntParser";
import { OperatorContext } from "./TntParser";
import { LiteralContext } from "./TntParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TntParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface TntVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `typeFun`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeFun?: (ctx: TypeFunContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeOper`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeOper?: (ctx: TypeOperContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeSet`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeSet?: (ctx: TypeSetContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeList`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeList?: (ctx: TypeListContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeTuple`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeTuple?: (ctx: TypeTupleContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeRec`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeRec?: (ctx: TypeRecContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeUnionRec`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeUnionRec?: (ctx: TypeUnionRecContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeInt`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeInt?: (ctx: TypeIntContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeStr`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeStr?: (ctx: TypeStrContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeBool`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeBool?: (ctx: TypeBoolContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeConstOrVar`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeConstOrVar?: (ctx: TypeConstOrVarContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeParen`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeParen?: (ctx: TypeParenContext) => Result;

	/**
	 * Visit a parse tree produced by the `const`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConst?: (ctx: ConstContext) => Result;

	/**
	 * Visit a parse tree produced by the `var`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVar?: (ctx: VarContext) => Result;

	/**
	 * Visit a parse tree produced by the `assume`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssume?: (ctx: AssumeContext) => Result;

	/**
	 * Visit a parse tree produced by the `oper`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOper?: (ctx: OperContext) => Result;

	/**
	 * Visit a parse tree produced by the `moduleNested`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModuleNested?: (ctx: ModuleNestedContext) => Result;

	/**
	 * Visit a parse tree produced by the `instance`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstance?: (ctx: InstanceContext) => Result;

	/**
	 * Visit a parse tree produced by the `typedef`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypedef?: (ctx: TypedefContext) => Result;

	/**
	 * Visit a parse tree produced by the `importDef`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImportDef?: (ctx: ImportDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `dotCall`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDotCall?: (ctx: DotCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `lambdaCons`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaCons?: (ctx: LambdaConsContext) => Result;

	/**
	 * Visit a parse tree produced by the `operApp`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperApp?: (ctx: OperAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `listApp`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListApp?: (ctx: ListAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `uminus`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUminus?: (ctx: UminusContext) => Result;

	/**
	 * Visit a parse tree produced by the `pow`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPow?: (ctx: PowContext) => Result;

	/**
	 * Visit a parse tree produced by the `multDiv`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultDiv?: (ctx: MultDivContext) => Result;

	/**
	 * Visit a parse tree produced by the `plusMinus`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPlusMinus?: (ctx: PlusMinusContext) => Result;

	/**
	 * Visit a parse tree produced by the `relations`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRelations?: (ctx: RelationsContext) => Result;

	/**
	 * Visit a parse tree produced by the `errorEq`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorEq?: (ctx: ErrorEqContext) => Result;

	/**
	 * Visit a parse tree produced by the `and`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnd?: (ctx: AndContext) => Result;

	/**
	 * Visit a parse tree produced by the `or`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOr?: (ctx: OrContext) => Result;

	/**
	 * Visit a parse tree produced by the `iff`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIff?: (ctx: IffContext) => Result;

	/**
	 * Visit a parse tree produced by the `implies`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImplies?: (ctx: ImpliesContext) => Result;

	/**
	 * Visit a parse tree produced by the `match`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatch?: (ctx: MatchContext) => Result;

	/**
	 * Visit a parse tree produced by the `andExpr`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAndExpr?: (ctx: AndExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `orExpr`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOrExpr?: (ctx: OrExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `actionAll`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitActionAll?: (ctx: ActionAllContext) => Result;

	/**
	 * Visit a parse tree produced by the `actionAny`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitActionAny?: (ctx: ActionAnyContext) => Result;

	/**
	 * Visit a parse tree produced by the `literalOrId`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralOrId?: (ctx: LiteralOrIdContext) => Result;

	/**
	 * Visit a parse tree produced by the `tuple`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple?: (ctx: TupleContext) => Result;

	/**
	 * Visit a parse tree produced by the `pair`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPair?: (ctx: PairContext) => Result;

	/**
	 * Visit a parse tree produced by the `record`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRecord?: (ctx: RecordContext) => Result;

	/**
	 * Visit a parse tree produced by the `list`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitList?: (ctx: ListContext) => Result;

	/**
	 * Visit a parse tree produced by the `ifElse`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfElse?: (ctx: IfElseContext) => Result;

	/**
	 * Visit a parse tree produced by the `letIn`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetIn?: (ctx: LetInContext) => Result;

	/**
	 * Visit a parse tree produced by the `paren`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParen?: (ctx: ParenContext) => Result;

	/**
	 * Visit a parse tree produced by the `braces`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBraces?: (ctx: BracesContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.module`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModule?: (ctx: ModuleContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnit?: (ctx: UnitContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.operDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperDef?: (ctx: OperDefContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.qualifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifier?: (ctx: QualifierContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.params`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParams?: (ctx: ParamsContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.instanceMod`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstanceMod?: (ctx: InstanceModContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType?: (ctx: TypeContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.typeUnionRecOne`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeUnionRecOne?: (ctx: TypeUnionRecOneContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpr?: (ctx: ExprContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.unitOrExpr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnitOrExpr?: (ctx: UnitOrExprContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.lambda`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambda?: (ctx: LambdaContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.identOrHole`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentOrHole?: (ctx: IdentOrHoleContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.identOrStar`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentOrStar?: (ctx: IdentOrStarContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.path`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPath?: (ctx: PathContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.argList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgList?: (ctx: ArgListContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.normalCallName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalCallName?: (ctx: NormalCallNameContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.nameAfterDot`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNameAfterDot?: (ctx: NameAfterDotContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.operator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperator?: (ctx: OperatorContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;
}

