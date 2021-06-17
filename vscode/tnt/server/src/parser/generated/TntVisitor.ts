// Generated from ./src/parser/generated/Tnt.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { PatternListContext } from "./TntParser";
import { PatternAtomContext } from "./TntParser";
import { TypeFunContext } from "./TntParser";
import { TypeOperContext } from "./TntParser";
import { TypeSetContext } from "./TntParser";
import { TypeSeqContext } from "./TntParser";
import { TypeTupleContext } from "./TntParser";
import { TypeRecContext } from "./TntParser";
import { TypeUnionRecContext } from "./TntParser";
import { TypeIntContext } from "./TntParser";
import { TypeStrContext } from "./TntParser";
import { TypeBoolContext } from "./TntParser";
import { TypeConstOrVarContext } from "./TntParser";
import { TypeParenContext } from "./TntParser";
import { Untyped2SigContext } from "./TntParser";
import { Untyped2LowerContext } from "./TntParser";
import { Untyped2ParenContext } from "./TntParser";
import { ConstContext } from "./TntParser";
import { VarContext } from "./TntParser";
import { AssumeContext } from "./TntParser";
import { ValContext } from "./TntParser";
import { OperContext } from "./TntParser";
import { PredContext } from "./TntParser";
import { ActionContext } from "./TntParser";
import { TemporalContext } from "./TntParser";
import { ModuleNestedContext } from "./TntParser";
import { InstanceContext } from "./TntParser";
import { TypeDefContext } from "./TntParser";
import { ErrorCaseContext } from "./TntParser";
import { DotCallContext } from "./TntParser";
import { OperAppContext } from "./TntParser";
import { FunAppContext } from "./TntParser";
import { UminusContext } from "./TntParser";
import { PowContext } from "./TntParser";
import { MultDivContext } from "./TntParser";
import { PlusMinusContext } from "./TntParser";
import { IfElseContext } from "./TntParser";
import { CaseBlockContext } from "./TntParser";
import { InfixCallContext } from "./TntParser";
import { RelationsContext } from "./TntParser";
import { AndContext } from "./TntParser";
import { OrContext } from "./TntParser";
import { IffContext } from "./TntParser";
import { ImpliesContext } from "./TntParser";
import { AndBlockContext } from "./TntParser";
import { OrBlockContext } from "./TntParser";
import { LiteralOrIdContext } from "./TntParser";
import { TupleContext } from "./TntParser";
import { SetContext } from "./TntParser";
import { RecordContext } from "./TntParser";
import { RecordSetContext } from "./TntParser";
import { SequenceContext } from "./TntParser";
import { LetInContext } from "./TntParser";
import { ParenContext } from "./TntParser";
import { LambdaOrBracesContext } from "./TntParser";
import { Untyped1Context } from "./TntParser";
import { Untyped1LowerContext } from "./TntParser";
import { ModuleContext } from "./TntParser";
import { UnitContext } from "./TntParser";
import { ValDefContext } from "./TntParser";
import { OperDefContext } from "./TntParser";
import { InstanceDefContext } from "./TntParser";
import { ParamsContext } from "./TntParser";
import { TypeContext } from "./TntParser";
import { TypeUnionRecOneContext } from "./TntParser";
import { Untyped012Context } from "./TntParser";
import { Untyped01Context } from "./TntParser";
import { Untyped0Context } from "./TntParser";
import { ExprContext } from "./TntParser";
import { LambdaContext } from "./TntParser";
import { PatternContext } from "./TntParser";
import { Arg_listContext } from "./TntParser";
import { Name_after_dotContext } from "./TntParser";
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
	 * Visit a parse tree produced by the `patternList`
	 * labeled alternative in `TntParser.pattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPatternList?: (ctx: PatternListContext) => Result;

	/**
	 * Visit a parse tree produced by the `patternAtom`
	 * labeled alternative in `TntParser.pattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPatternAtom?: (ctx: PatternAtomContext) => Result;

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
	 * Visit a parse tree produced by the `untyped2Sig`
	 * labeled alternative in `TntParser.untyped012`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped2Sig?: (ctx: Untyped2SigContext) => Result;

	/**
	 * Visit a parse tree produced by the `untyped2Lower`
	 * labeled alternative in `TntParser.untyped012`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped2Lower?: (ctx: Untyped2LowerContext) => Result;

	/**
	 * Visit a parse tree produced by the `untyped2Paren`
	 * labeled alternative in `TntParser.untyped012`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped2Paren?: (ctx: Untyped2ParenContext) => Result;

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
	 * Visit a parse tree produced by the `pred`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPred?: (ctx: PredContext) => Result;

	/**
	 * Visit a parse tree produced by the `action`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAction?: (ctx: ActionContext) => Result;

	/**
	 * Visit a parse tree produced by the `temporal`
	 * labeled alternative in `TntParser.unit`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemporal?: (ctx: TemporalContext) => Result;

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
	 * Visit a parse tree produced by the `set`
	 * labeled alternative in `TntParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSet?: (ctx: SetContext) => Result;

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
	 * Visit a parse tree produced by the `untyped1`
	 * labeled alternative in `TntParser.untyped01`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped1?: (ctx: Untyped1Context) => Result;

	/**
	 * Visit a parse tree produced by the `untyped1Lower`
	 * labeled alternative in `TntParser.untyped01`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped1Lower?: (ctx: Untyped1LowerContext) => Result;

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
	 * Visit a parse tree produced by `TntParser.untyped012`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped012?: (ctx: Untyped012Context) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.untyped01`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped01?: (ctx: Untyped01Context) => Result;

	/**
	 * Visit a parse tree produced by `TntParser.untyped0`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUntyped0?: (ctx: Untyped0Context) => Result;

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
	 * Visit a parse tree produced by `TntParser.pattern`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPattern?: (ctx: PatternContext) => Result;

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

