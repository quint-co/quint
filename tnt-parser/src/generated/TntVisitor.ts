// Generated from ./src/generated/Tnt.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor'

import { TypeFunContext, TypeOperContext, TypeSetContext, TypeSeqContext, TypeTupleContext, TypeRecContext, TypeUnionRecContext, TypeIntContext, TypeStrContext, TypeBoolContext, TypeConstOrVarContext, TypeParenContext, ConstContext, VarContext, AssumeContext, ValContext, OperContext, PatContext, ModuleNestedContext, InstanceContext, TypeDefContext, ErrorCaseContext, LambdaOneContext, LambdaManyContext, DotCallContext, OperAppContext, FunAppContext, UminusContext, PowContext, MultDivContext, PlusMinusContext, IfElseContext, CaseBlockContext, InfixCallContext, RelationsContext, AndContext, OrContext, IffContext, ImpliesContext, AndBlockContext, OrBlockContext, LiteralOrIdContext, TupleContext, RecordContext, RecordSetContext, SequenceContext, LetInContext, ParenContext, LambdaOrBracesContext, ModuleContext, UnitContext, ValDefContext, OperDefContext, InstanceDefContext, ParamsContext, TypeContext, TypeUnionRecOneContext, ExprContext, LambdaContext, IdentOrHoleContext, Arg_listContext, Name_after_dotContext, OperatorContext, LiteralContext } from './TntParser'

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
	 * Visit a parse tree produced by the `typeSeq`
	 * labeled alternative in `TntParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeSeq?: (ctx: TypeSeqContext) => Result;

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
	 * Visit a parse tree produced by the `val`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVal?: (ctx: ValContext) => Result;

	/**
	 * Visit a parse tree produced by the `oper`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOper?: (ctx: OperContext) => Result;

	/**
	 * Visit a parse tree produced by the `pat`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPat?: (ctx: PatContext) => Result;

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
	 * Visit a parse tree produced by the `typeDef`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDef?: (ctx: TypeDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `errorCase`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorCase?: (ctx: ErrorCaseContext) => Result;

	/**
	 * Visit a parse tree produced by the `lambdaOne`
	 * labeled alternative in `TntParser.lambda`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaOne?: (ctx: LambdaOneContext) => Result;

	/**
	 * Visit a parse tree produced by the `lambdaMany`
	 * labeled alternative in `TntParser.lambda`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaMany?: (ctx: LambdaManyContext) => Result;

	/**
	 * Visit a parse tree produced by the `dotCall`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDotCall?: (ctx: DotCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `operApp`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperApp?: (ctx: OperAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `funApp`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunApp?: (ctx: FunAppContext) => Result;

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
	 * Visit a parse tree produced by the `ifElse`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfElse?: (ctx: IfElseContext) => Result;

	/**
	 * Visit a parse tree produced by the `caseBlock`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCaseBlock?: (ctx: CaseBlockContext) => Result;

	/**
	 * Visit a parse tree produced by the `infixCall`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInfixCall?: (ctx: InfixCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `relations`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRelations?: (ctx: RelationsContext) => Result;

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
	 * Visit a parse tree produced by the `andBlock`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAndBlock?: (ctx: AndBlockContext) => Result;

	/**
	 * Visit a parse tree produced by the `orBlock`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOrBlock?: (ctx: OrBlockContext) => Result;

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
	 * Visit a parse tree produced by the `record`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRecord?: (ctx: RecordContext) => Result;

	/**
	 * Visit a parse tree produced by the `recordSet`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRecordSet?: (ctx: RecordSetContext) => Result;

	/**
	 * Visit a parse tree produced by the `sequence`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSequence?: (ctx: SequenceContext) => Result;

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
	 * Visit a parse tree produced by the `lambdaOrBraces`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaOrBraces?: (ctx: LambdaOrBracesContext) => Result;

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
	 * Visit a parse tree produced by `TntParser.valDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValDef?: (ctx: ValDefContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.operDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperDef?: (ctx: OperDefContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.instanceDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstanceDef?: (ctx: InstanceDefContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.params`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParams?: (ctx: ParamsContext) => Result;

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
	 * Visit a parse tree produced by `TntParser.arg_list`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArg_list?: (ctx: Arg_listContext) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.name_after_dot`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName_after_dot?: (ctx: Name_after_dotContext) => Result;

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
