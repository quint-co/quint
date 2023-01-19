// Generated from ./src/generated/Quint.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { TypeFunContext } from "./QuintParser";
import { TypeOperContext } from "./QuintParser";
import { TypeSetContext } from "./QuintParser";
import { TypeListContext } from "./QuintParser";
import { TypeTupleContext } from "./QuintParser";
import { TypeRecContext } from "./QuintParser";
import { TypeUnionRecContext } from "./QuintParser";
import { TypeIntContext } from "./QuintParser";
import { TypeStrContext } from "./QuintParser";
import { TypeBoolContext } from "./QuintParser";
import { TypeConstOrVarContext } from "./QuintParser";
import { TypeParenContext } from "./QuintParser";
import { ConstContext } from "./QuintParser";
import { VarContext } from "./QuintParser";
import { AssumeContext } from "./QuintParser";
import { OperContext } from "./QuintParser";
import { ModuleNestedContext } from "./QuintParser";
import { InstanceContext } from "./QuintParser";
import { TypedefContext } from "./QuintParser";
import { ImportDefContext } from "./QuintParser";
import { DotCallContext } from "./QuintParser";
import { LambdaConsContext } from "./QuintParser";
import { OperAppContext } from "./QuintParser";
import { ListAppContext } from "./QuintParser";
import { PowContext } from "./QuintParser";
import { UminusContext } from "./QuintParser";
import { MultDivContext } from "./QuintParser";
import { PlusMinusContext } from "./QuintParser";
import { RelationsContext } from "./QuintParser";
import { AsgnContext } from "./QuintParser";
import { ErrorEqContext } from "./QuintParser";
import { AndExprContext } from "./QuintParser";
import { AndContext } from "./QuintParser";
import { OrExprContext } from "./QuintParser";
import { OrContext } from "./QuintParser";
import { IffContext } from "./QuintParser";
import { ImpliesContext } from "./QuintParser";
import { MatchContext } from "./QuintParser";
import { ActionAllContext } from "./QuintParser";
import { ActionAnyContext } from "./QuintParser";
import { LiteralOrIdContext } from "./QuintParser";
import { TupleContext } from "./QuintParser";
import { PairContext } from "./QuintParser";
import { RecordContext } from "./QuintParser";
import { ListContext } from "./QuintParser";
import { IfElseContext } from "./QuintParser";
import { LetInContext } from "./QuintParser";
import { NondetContext } from "./QuintParser";
import { ParenContext } from "./QuintParser";
import { BracesContext } from "./QuintParser";
import { ModuleContext } from "./QuintParser";
import { DocLinesContext } from "./QuintParser";
import { UnitContext } from "./QuintParser";
import { OperDefContext } from "./QuintParser";
import { QualifierContext } from "./QuintParser";
import { InstanceModContext } from "./QuintParser";
import { TypeContext } from "./QuintParser";
import { TypeUnionRecOneContext } from "./QuintParser";
import { RowContext } from "./QuintParser";
import { ExprContext } from "./QuintParser";
import { UnitOrExprContext } from "./QuintParser";
import { LambdaContext } from "./QuintParser";
import { IdentOrHoleContext } from "./QuintParser";
import { IdentOrStarContext } from "./QuintParser";
import { PathContext } from "./QuintParser";
import { ArgListContext } from "./QuintParser";
import { NormalCallNameContext } from "./QuintParser";
import { NameAfterDotContext } from "./QuintParser";
import { OperatorContext } from "./QuintParser";
import { LiteralContext } from "./QuintParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `QuintParser`.
 */
export interface QuintListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `typeFun`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeFun?: (ctx: TypeFunContext) => void;
	/**
	 * Exit a parse tree produced by the `typeFun`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeFun?: (ctx: TypeFunContext) => void;

	/**
	 * Enter a parse tree produced by the `typeOper`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeOper?: (ctx: TypeOperContext) => void;
	/**
	 * Exit a parse tree produced by the `typeOper`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeOper?: (ctx: TypeOperContext) => void;

	/**
	 * Enter a parse tree produced by the `typeSet`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeSet?: (ctx: TypeSetContext) => void;
	/**
	 * Exit a parse tree produced by the `typeSet`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeSet?: (ctx: TypeSetContext) => void;

	/**
	 * Enter a parse tree produced by the `typeList`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeList?: (ctx: TypeListContext) => void;
	/**
	 * Exit a parse tree produced by the `typeList`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeList?: (ctx: TypeListContext) => void;

	/**
	 * Enter a parse tree produced by the `typeTuple`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeTuple?: (ctx: TypeTupleContext) => void;
	/**
	 * Exit a parse tree produced by the `typeTuple`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeTuple?: (ctx: TypeTupleContext) => void;

	/**
	 * Enter a parse tree produced by the `typeRec`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeRec?: (ctx: TypeRecContext) => void;
	/**
	 * Exit a parse tree produced by the `typeRec`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeRec?: (ctx: TypeRecContext) => void;

	/**
	 * Enter a parse tree produced by the `typeUnionRec`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeUnionRec?: (ctx: TypeUnionRecContext) => void;
	/**
	 * Exit a parse tree produced by the `typeUnionRec`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeUnionRec?: (ctx: TypeUnionRecContext) => void;

	/**
	 * Enter a parse tree produced by the `typeInt`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeInt?: (ctx: TypeIntContext) => void;
	/**
	 * Exit a parse tree produced by the `typeInt`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeInt?: (ctx: TypeIntContext) => void;

	/**
	 * Enter a parse tree produced by the `typeStr`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeStr?: (ctx: TypeStrContext) => void;
	/**
	 * Exit a parse tree produced by the `typeStr`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeStr?: (ctx: TypeStrContext) => void;

	/**
	 * Enter a parse tree produced by the `typeBool`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeBool?: (ctx: TypeBoolContext) => void;
	/**
	 * Exit a parse tree produced by the `typeBool`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeBool?: (ctx: TypeBoolContext) => void;

	/**
	 * Enter a parse tree produced by the `typeConstOrVar`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeConstOrVar?: (ctx: TypeConstOrVarContext) => void;
	/**
	 * Exit a parse tree produced by the `typeConstOrVar`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeConstOrVar?: (ctx: TypeConstOrVarContext) => void;

	/**
	 * Enter a parse tree produced by the `typeParen`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeParen?: (ctx: TypeParenContext) => void;
	/**
	 * Exit a parse tree produced by the `typeParen`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeParen?: (ctx: TypeParenContext) => void;

	/**
	 * Enter a parse tree produced by the `const`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterConst?: (ctx: ConstContext) => void;
	/**
	 * Exit a parse tree produced by the `const`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitConst?: (ctx: ConstContext) => void;

	/**
	 * Enter a parse tree produced by the `var`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterVar?: (ctx: VarContext) => void;
	/**
	 * Exit a parse tree produced by the `var`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitVar?: (ctx: VarContext) => void;

	/**
	 * Enter a parse tree produced by the `assume`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterAssume?: (ctx: AssumeContext) => void;
	/**
	 * Exit a parse tree produced by the `assume`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitAssume?: (ctx: AssumeContext) => void;

	/**
	 * Enter a parse tree produced by the `oper`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterOper?: (ctx: OperContext) => void;
	/**
	 * Exit a parse tree produced by the `oper`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitOper?: (ctx: OperContext) => void;

	/**
	 * Enter a parse tree produced by the `moduleNested`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterModuleNested?: (ctx: ModuleNestedContext) => void;
	/**
	 * Exit a parse tree produced by the `moduleNested`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitModuleNested?: (ctx: ModuleNestedContext) => void;

	/**
	 * Enter a parse tree produced by the `instance`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterInstance?: (ctx: InstanceContext) => void;
	/**
	 * Exit a parse tree produced by the `instance`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitInstance?: (ctx: InstanceContext) => void;

	/**
	 * Enter a parse tree produced by the `typedef`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterTypedef?: (ctx: TypedefContext) => void;
	/**
	 * Exit a parse tree produced by the `typedef`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitTypedef?: (ctx: TypedefContext) => void;

	/**
	 * Enter a parse tree produced by the `importDef`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterImportDef?: (ctx: ImportDefContext) => void;
	/**
	 * Exit a parse tree produced by the `importDef`
	 * labeled alternative in `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitImportDef?: (ctx: ImportDefContext) => void;

	/**
	 * Enter a parse tree produced by the `dotCall`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterDotCall?: (ctx: DotCallContext) => void;
	/**
	 * Exit a parse tree produced by the `dotCall`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitDotCall?: (ctx: DotCallContext) => void;

	/**
	 * Enter a parse tree produced by the `lambdaCons`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterLambdaCons?: (ctx: LambdaConsContext) => void;
	/**
	 * Exit a parse tree produced by the `lambdaCons`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitLambdaCons?: (ctx: LambdaConsContext) => void;

	/**
	 * Enter a parse tree produced by the `operApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterOperApp?: (ctx: OperAppContext) => void;
	/**
	 * Exit a parse tree produced by the `operApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitOperApp?: (ctx: OperAppContext) => void;

	/**
	 * Enter a parse tree produced by the `listApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterListApp?: (ctx: ListAppContext) => void;
	/**
	 * Exit a parse tree produced by the `listApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitListApp?: (ctx: ListAppContext) => void;

	/**
	 * Enter a parse tree produced by the `pow`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterPow?: (ctx: PowContext) => void;
	/**
	 * Exit a parse tree produced by the `pow`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitPow?: (ctx: PowContext) => void;

	/**
	 * Enter a parse tree produced by the `uminus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterUminus?: (ctx: UminusContext) => void;
	/**
	 * Exit a parse tree produced by the `uminus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitUminus?: (ctx: UminusContext) => void;

	/**
	 * Enter a parse tree produced by the `multDiv`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterMultDiv?: (ctx: MultDivContext) => void;
	/**
	 * Exit a parse tree produced by the `multDiv`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitMultDiv?: (ctx: MultDivContext) => void;

	/**
	 * Enter a parse tree produced by the `plusMinus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterPlusMinus?: (ctx: PlusMinusContext) => void;
	/**
	 * Exit a parse tree produced by the `plusMinus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitPlusMinus?: (ctx: PlusMinusContext) => void;

	/**
	 * Enter a parse tree produced by the `relations`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterRelations?: (ctx: RelationsContext) => void;
	/**
	 * Exit a parse tree produced by the `relations`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitRelations?: (ctx: RelationsContext) => void;

	/**
	 * Enter a parse tree produced by the `asgn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterAsgn?: (ctx: AsgnContext) => void;
	/**
	 * Exit a parse tree produced by the `asgn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitAsgn?: (ctx: AsgnContext) => void;

	/**
	 * Enter a parse tree produced by the `errorEq`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterErrorEq?: (ctx: ErrorEqContext) => void;
	/**
	 * Exit a parse tree produced by the `errorEq`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitErrorEq?: (ctx: ErrorEqContext) => void;

	/**
	 * Enter a parse tree produced by the `andExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterAndExpr?: (ctx: AndExprContext) => void;
	/**
	 * Exit a parse tree produced by the `andExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitAndExpr?: (ctx: AndExprContext) => void;

	/**
	 * Enter a parse tree produced by the `and`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterAnd?: (ctx: AndContext) => void;
	/**
	 * Exit a parse tree produced by the `and`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitAnd?: (ctx: AndContext) => void;

	/**
	 * Enter a parse tree produced by the `orExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterOrExpr?: (ctx: OrExprContext) => void;
	/**
	 * Exit a parse tree produced by the `orExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitOrExpr?: (ctx: OrExprContext) => void;

	/**
	 * Enter a parse tree produced by the `or`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterOr?: (ctx: OrContext) => void;
	/**
	 * Exit a parse tree produced by the `or`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitOr?: (ctx: OrContext) => void;

	/**
	 * Enter a parse tree produced by the `iff`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterIff?: (ctx: IffContext) => void;
	/**
	 * Exit a parse tree produced by the `iff`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitIff?: (ctx: IffContext) => void;

	/**
	 * Enter a parse tree produced by the `implies`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterImplies?: (ctx: ImpliesContext) => void;
	/**
	 * Exit a parse tree produced by the `implies`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitImplies?: (ctx: ImpliesContext) => void;

	/**
	 * Enter a parse tree produced by the `match`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterMatch?: (ctx: MatchContext) => void;
	/**
	 * Exit a parse tree produced by the `match`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitMatch?: (ctx: MatchContext) => void;

	/**
	 * Enter a parse tree produced by the `actionAll`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterActionAll?: (ctx: ActionAllContext) => void;
	/**
	 * Exit a parse tree produced by the `actionAll`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitActionAll?: (ctx: ActionAllContext) => void;

	/**
	 * Enter a parse tree produced by the `actionAny`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterActionAny?: (ctx: ActionAnyContext) => void;
	/**
	 * Exit a parse tree produced by the `actionAny`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitActionAny?: (ctx: ActionAnyContext) => void;

	/**
	 * Enter a parse tree produced by the `literalOrId`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterLiteralOrId?: (ctx: LiteralOrIdContext) => void;
	/**
	 * Exit a parse tree produced by the `literalOrId`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitLiteralOrId?: (ctx: LiteralOrIdContext) => void;

	/**
	 * Enter a parse tree produced by the `tuple`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterTuple?: (ctx: TupleContext) => void;
	/**
	 * Exit a parse tree produced by the `tuple`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitTuple?: (ctx: TupleContext) => void;

	/**
	 * Enter a parse tree produced by the `pair`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterPair?: (ctx: PairContext) => void;
	/**
	 * Exit a parse tree produced by the `pair`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitPair?: (ctx: PairContext) => void;

	/**
	 * Enter a parse tree produced by the `record`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterRecord?: (ctx: RecordContext) => void;
	/**
	 * Exit a parse tree produced by the `record`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitRecord?: (ctx: RecordContext) => void;

	/**
	 * Enter a parse tree produced by the `list`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterList?: (ctx: ListContext) => void;
	/**
	 * Exit a parse tree produced by the `list`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitList?: (ctx: ListContext) => void;

	/**
	 * Enter a parse tree produced by the `ifElse`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterIfElse?: (ctx: IfElseContext) => void;
	/**
	 * Exit a parse tree produced by the `ifElse`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitIfElse?: (ctx: IfElseContext) => void;

	/**
	 * Enter a parse tree produced by the `letIn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterLetIn?: (ctx: LetInContext) => void;
	/**
	 * Exit a parse tree produced by the `letIn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitLetIn?: (ctx: LetInContext) => void;

	/**
	 * Enter a parse tree produced by the `nondet`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterNondet?: (ctx: NondetContext) => void;
	/**
	 * Exit a parse tree produced by the `nondet`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitNondet?: (ctx: NondetContext) => void;

	/**
	 * Enter a parse tree produced by the `paren`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterParen?: (ctx: ParenContext) => void;
	/**
	 * Exit a parse tree produced by the `paren`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitParen?: (ctx: ParenContext) => void;

	/**
	 * Enter a parse tree produced by the `braces`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterBraces?: (ctx: BracesContext) => void;
	/**
	 * Exit a parse tree produced by the `braces`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitBraces?: (ctx: BracesContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.module`.
	 * @param ctx the parse tree
	 */
	enterModule?: (ctx: ModuleContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.module`.
	 * @param ctx the parse tree
	 */
	exitModule?: (ctx: ModuleContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.docLines`.
	 * @param ctx the parse tree
	 */
	enterDocLines?: (ctx: DocLinesContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.docLines`.
	 * @param ctx the parse tree
	 */
	exitDocLines?: (ctx: DocLinesContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	enterUnit?: (ctx: UnitContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.unit`.
	 * @param ctx the parse tree
	 */
	exitUnit?: (ctx: UnitContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	enterOperDef?: (ctx: OperDefContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	exitOperDef?: (ctx: OperDefContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.qualifier`.
	 * @param ctx the parse tree
	 */
	enterQualifier?: (ctx: QualifierContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.qualifier`.
	 * @param ctx the parse tree
	 */
	exitQualifier?: (ctx: QualifierContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.instanceMod`.
	 * @param ctx the parse tree
	 */
	enterInstanceMod?: (ctx: InstanceModContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.instanceMod`.
	 * @param ctx the parse tree
	 */
	exitInstanceMod?: (ctx: InstanceModContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterType?: (ctx: TypeContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitType?: (ctx: TypeContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.typeUnionRecOne`.
	 * @param ctx the parse tree
	 */
	enterTypeUnionRecOne?: (ctx: TypeUnionRecOneContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.typeUnionRecOne`.
	 * @param ctx the parse tree
	 */
	exitTypeUnionRecOne?: (ctx: TypeUnionRecOneContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.row`.
	 * @param ctx the parse tree
	 */
	enterRow?: (ctx: RowContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.row`.
	 * @param ctx the parse tree
	 */
	exitRow?: (ctx: RowContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.unitOrExpr`.
	 * @param ctx the parse tree
	 */
	enterUnitOrExpr?: (ctx: UnitOrExprContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.unitOrExpr`.
	 * @param ctx the parse tree
	 */
	exitUnitOrExpr?: (ctx: UnitOrExprContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.lambda`.
	 * @param ctx the parse tree
	 */
	enterLambda?: (ctx: LambdaContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.lambda`.
	 * @param ctx the parse tree
	 */
	exitLambda?: (ctx: LambdaContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.identOrHole`.
	 * @param ctx the parse tree
	 */
	enterIdentOrHole?: (ctx: IdentOrHoleContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.identOrHole`.
	 * @param ctx the parse tree
	 */
	exitIdentOrHole?: (ctx: IdentOrHoleContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.identOrStar`.
	 * @param ctx the parse tree
	 */
	enterIdentOrStar?: (ctx: IdentOrStarContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.identOrStar`.
	 * @param ctx the parse tree
	 */
	exitIdentOrStar?: (ctx: IdentOrStarContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.path`.
	 * @param ctx the parse tree
	 */
	enterPath?: (ctx: PathContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.path`.
	 * @param ctx the parse tree
	 */
	exitPath?: (ctx: PathContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.argList`.
	 * @param ctx the parse tree
	 */
	enterArgList?: (ctx: ArgListContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.argList`.
	 * @param ctx the parse tree
	 */
	exitArgList?: (ctx: ArgListContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.normalCallName`.
	 * @param ctx the parse tree
	 */
	enterNormalCallName?: (ctx: NormalCallNameContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.normalCallName`.
	 * @param ctx the parse tree
	 */
	exitNormalCallName?: (ctx: NormalCallNameContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.nameAfterDot`.
	 * @param ctx the parse tree
	 */
	enterNameAfterDot?: (ctx: NameAfterDotContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.nameAfterDot`.
	 * @param ctx the parse tree
	 */
	exitNameAfterDot?: (ctx: NameAfterDotContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.operator`.
	 * @param ctx the parse tree
	 */
	enterOperator?: (ctx: OperatorContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.operator`.
	 * @param ctx the parse tree
	 */
	exitOperator?: (ctx: OperatorContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.literal`.
	 * @param ctx the parse tree
	 */
	enterLiteral?: (ctx: LiteralContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.literal`.
	 * @param ctx the parse tree
	 */
	exitLiteral?: (ctx: LiteralContext) => void;
}

