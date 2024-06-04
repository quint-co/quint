// Generated from ./src/generated/Quint.g4 by ANTLR 4.9.0-SNAPSHOT



// Used for forming errors
import { quintErrorToString } from '../quintError'



import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { TypeFunContext } from "./QuintParser";
import { TypeOperContext } from "./QuintParser";
import { TypeSetContext } from "./QuintParser";
import { TypeListContext } from "./QuintParser";
import { TypeUnitContext } from "./QuintParser";
import { TypeTupleContext } from "./QuintParser";
import { TypeRecContext } from "./QuintParser";
import { TypeIntContext } from "./QuintParser";
import { TypeStrContext } from "./QuintParser";
import { TypeBoolContext } from "./QuintParser";
import { TypeVarCaseContext } from "./QuintParser";
import { TypeConstContext } from "./QuintParser";
import { TypeParenContext } from "./QuintParser";
import { TypeAppContext } from "./QuintParser";
import { TypeAbstractDefContext } from "./QuintParser";
import { TypeAliasDefContext } from "./QuintParser";
import { TypeSumDefContext } from "./QuintParser";
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
import { UnitContext } from "./QuintParser";
import { PairContext } from "./QuintParser";
import { RecordContext } from "./QuintParser";
import { ListContext } from "./QuintParser";
import { IfElseContext } from "./QuintParser";
import { LetInContext } from "./QuintParser";
import { ParenContext } from "./QuintParser";
import { BracesContext } from "./QuintParser";
import { AnnotatedOperDefContext } from "./QuintParser";
import { DeprecatedOperDefContext } from "./QuintParser";
import { ConstContext } from "./QuintParser";
import { VarContext } from "./QuintParser";
import { AssumeContext } from "./QuintParser";
import { InstanceContext } from "./QuintParser";
import { OperContext } from "./QuintParser";
import { TypeDefsContext } from "./QuintParser";
import { ImportDefContext } from "./QuintParser";
import { ExportDefContext } from "./QuintParser";
import { ModulesContext } from "./QuintParser";
import { ModuleContext } from "./QuintParser";
import { DocumentedDeclarationContext } from "./QuintParser";
import { DeclarationContext } from "./QuintParser";
import { OperDefContext } from "./QuintParser";
import { TypeDefContext } from "./QuintParser";
import { TypeDefHeadContext } from "./QuintParser";
import { SumTypeDefinitionContext } from "./QuintParser";
import { TypeSumVariantContext } from "./QuintParser";
import { QualifierContext } from "./QuintParser";
import { ImportModContext } from "./QuintParser";
import { ExportModContext } from "./QuintParser";
import { InstanceModContext } from "./QuintParser";
import { ModuleNameContext } from "./QuintParser";
import { NameContext } from "./QuintParser";
import { QualifiedNameContext } from "./QuintParser";
import { FromSourceContext } from "./QuintParser";
import { TypeContext } from "./QuintParser";
import { TypeVarContext } from "./QuintParser";
import { RowContext } from "./QuintParser";
import { RowLabelContext } from "./QuintParser";
import { ExprContext } from "./QuintParser";
import { MatchSumExprContext } from "./QuintParser";
import { MatchSumCaseContext } from "./QuintParser";
import { MatchSumVariantContext } from "./QuintParser";
import { DeclarationOrExprContext } from "./QuintParser";
import { LambdaContext } from "./QuintParser";
import { LambdaUnsugaredContext } from "./QuintParser";
import { LambdaTupleSugarContext } from "./QuintParser";
import { IdentOrHoleContext } from "./QuintParser";
import { ParameterContext } from "./QuintParser";
import { AnnotatedParameterContext } from "./QuintParser";
import { IdentOrStarContext } from "./QuintParser";
import { ArgListContext } from "./QuintParser";
import { RecElemContext } from "./QuintParser";
import { NormalCallNameContext } from "./QuintParser";
import { NameAfterDotContext } from "./QuintParser";
import { OperatorContext } from "./QuintParser";
import { LiteralContext } from "./QuintParser";
import { QualIdContext } from "./QuintParser";
import { SimpleIdContext } from "./QuintParser";
import { IdentifierContext } from "./QuintParser";


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
	 * Enter a parse tree produced by the `typeUnit`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeUnit?: (ctx: TypeUnitContext) => void;
	/**
	 * Exit a parse tree produced by the `typeUnit`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeUnit?: (ctx: TypeUnitContext) => void;

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
	 * Enter a parse tree produced by the `typeVarCase`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeVarCase?: (ctx: TypeVarCaseContext) => void;
	/**
	 * Exit a parse tree produced by the `typeVarCase`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeVarCase?: (ctx: TypeVarCaseContext) => void;

	/**
	 * Enter a parse tree produced by the `typeConst`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeConst?: (ctx: TypeConstContext) => void;
	/**
	 * Exit a parse tree produced by the `typeConst`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeConst?: (ctx: TypeConstContext) => void;

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
	 * Enter a parse tree produced by the `typeApp`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	enterTypeApp?: (ctx: TypeAppContext) => void;
	/**
	 * Exit a parse tree produced by the `typeApp`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 */
	exitTypeApp?: (ctx: TypeAppContext) => void;

	/**
	 * Enter a parse tree produced by the `typeAbstractDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	enterTypeAbstractDef?: (ctx: TypeAbstractDefContext) => void;
	/**
	 * Exit a parse tree produced by the `typeAbstractDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	exitTypeAbstractDef?: (ctx: TypeAbstractDefContext) => void;

	/**
	 * Enter a parse tree produced by the `typeAliasDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	enterTypeAliasDef?: (ctx: TypeAliasDefContext) => void;
	/**
	 * Exit a parse tree produced by the `typeAliasDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	exitTypeAliasDef?: (ctx: TypeAliasDefContext) => void;

	/**
	 * Enter a parse tree produced by the `typeSumDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	enterTypeSumDef?: (ctx: TypeSumDefContext) => void;
	/**
	 * Exit a parse tree produced by the `typeSumDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	exitTypeSumDef?: (ctx: TypeSumDefContext) => void;

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
	 * Enter a parse tree produced by the `unit`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	enterUnit?: (ctx: UnitContext) => void;
	/**
	 * Exit a parse tree produced by the `unit`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 */
	exitUnit?: (ctx: UnitContext) => void;

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
	 * Enter a parse tree produced by the `annotatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	enterAnnotatedOperDef?: (ctx: AnnotatedOperDefContext) => void;
	/**
	 * Exit a parse tree produced by the `annotatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	exitAnnotatedOperDef?: (ctx: AnnotatedOperDefContext) => void;

	/**
	 * Enter a parse tree produced by the `deprecatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	enterDeprecatedOperDef?: (ctx: DeprecatedOperDefContext) => void;
	/**
	 * Exit a parse tree produced by the `deprecatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 */
	exitDeprecatedOperDef?: (ctx: DeprecatedOperDefContext) => void;

	/**
	 * Enter a parse tree produced by the `const`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterConst?: (ctx: ConstContext) => void;
	/**
	 * Exit a parse tree produced by the `const`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitConst?: (ctx: ConstContext) => void;

	/**
	 * Enter a parse tree produced by the `var`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterVar?: (ctx: VarContext) => void;
	/**
	 * Exit a parse tree produced by the `var`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitVar?: (ctx: VarContext) => void;

	/**
	 * Enter a parse tree produced by the `assume`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterAssume?: (ctx: AssumeContext) => void;
	/**
	 * Exit a parse tree produced by the `assume`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitAssume?: (ctx: AssumeContext) => void;

	/**
	 * Enter a parse tree produced by the `instance`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterInstance?: (ctx: InstanceContext) => void;
	/**
	 * Exit a parse tree produced by the `instance`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitInstance?: (ctx: InstanceContext) => void;

	/**
	 * Enter a parse tree produced by the `oper`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterOper?: (ctx: OperContext) => void;
	/**
	 * Exit a parse tree produced by the `oper`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitOper?: (ctx: OperContext) => void;

	/**
	 * Enter a parse tree produced by the `typeDefs`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterTypeDefs?: (ctx: TypeDefsContext) => void;
	/**
	 * Exit a parse tree produced by the `typeDefs`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitTypeDefs?: (ctx: TypeDefsContext) => void;

	/**
	 * Enter a parse tree produced by the `importDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterImportDef?: (ctx: ImportDefContext) => void;
	/**
	 * Exit a parse tree produced by the `importDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitImportDef?: (ctx: ImportDefContext) => void;

	/**
	 * Enter a parse tree produced by the `exportDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterExportDef?: (ctx: ExportDefContext) => void;
	/**
	 * Exit a parse tree produced by the `exportDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitExportDef?: (ctx: ExportDefContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.modules`.
	 * @param ctx the parse tree
	 */
	enterModules?: (ctx: ModulesContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.modules`.
	 * @param ctx the parse tree
	 */
	exitModules?: (ctx: ModulesContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.documentedDeclaration`.
	 * @param ctx the parse tree
	 */
	enterDocumentedDeclaration?: (ctx: DocumentedDeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.documentedDeclaration`.
	 * @param ctx the parse tree
	 */
	exitDocumentedDeclaration?: (ctx: DocumentedDeclarationContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterDeclaration?: (ctx: DeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitDeclaration?: (ctx: DeclarationContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	enterTypeDef?: (ctx: TypeDefContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 */
	exitTypeDef?: (ctx: TypeDefContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.typeDefHead`.
	 * @param ctx the parse tree
	 */
	enterTypeDefHead?: (ctx: TypeDefHeadContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.typeDefHead`.
	 * @param ctx the parse tree
	 */
	exitTypeDefHead?: (ctx: TypeDefHeadContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.sumTypeDefinition`.
	 * @param ctx the parse tree
	 */
	enterSumTypeDefinition?: (ctx: SumTypeDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.sumTypeDefinition`.
	 * @param ctx the parse tree
	 */
	exitSumTypeDefinition?: (ctx: SumTypeDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.typeSumVariant`.
	 * @param ctx the parse tree
	 */
	enterTypeSumVariant?: (ctx: TypeSumVariantContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.typeSumVariant`.
	 * @param ctx the parse tree
	 */
	exitTypeSumVariant?: (ctx: TypeSumVariantContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.importMod`.
	 * @param ctx the parse tree
	 */
	enterImportMod?: (ctx: ImportModContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.importMod`.
	 * @param ctx the parse tree
	 */
	exitImportMod?: (ctx: ImportModContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.exportMod`.
	 * @param ctx the parse tree
	 */
	enterExportMod?: (ctx: ExportModContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.exportMod`.
	 * @param ctx the parse tree
	 */
	exitExportMod?: (ctx: ExportModContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.moduleName`.
	 * @param ctx the parse tree
	 */
	enterModuleName?: (ctx: ModuleNameContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.moduleName`.
	 * @param ctx the parse tree
	 */
	exitModuleName?: (ctx: ModuleNameContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.name`.
	 * @param ctx the parse tree
	 */
	enterName?: (ctx: NameContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.name`.
	 * @param ctx the parse tree
	 */
	exitName?: (ctx: NameContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.qualifiedName`.
	 * @param ctx the parse tree
	 */
	enterQualifiedName?: (ctx: QualifiedNameContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.qualifiedName`.
	 * @param ctx the parse tree
	 */
	exitQualifiedName?: (ctx: QualifiedNameContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.fromSource`.
	 * @param ctx the parse tree
	 */
	enterFromSource?: (ctx: FromSourceContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.fromSource`.
	 * @param ctx the parse tree
	 */
	exitFromSource?: (ctx: FromSourceContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.typeVar`.
	 * @param ctx the parse tree
	 */
	enterTypeVar?: (ctx: TypeVarContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.typeVar`.
	 * @param ctx the parse tree
	 */
	exitTypeVar?: (ctx: TypeVarContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.rowLabel`.
	 * @param ctx the parse tree
	 */
	enterRowLabel?: (ctx: RowLabelContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.rowLabel`.
	 * @param ctx the parse tree
	 */
	exitRowLabel?: (ctx: RowLabelContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.matchSumExpr`.
	 * @param ctx the parse tree
	 */
	enterMatchSumExpr?: (ctx: MatchSumExprContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.matchSumExpr`.
	 * @param ctx the parse tree
	 */
	exitMatchSumExpr?: (ctx: MatchSumExprContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.matchSumCase`.
	 * @param ctx the parse tree
	 */
	enterMatchSumCase?: (ctx: MatchSumCaseContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.matchSumCase`.
	 * @param ctx the parse tree
	 */
	exitMatchSumCase?: (ctx: MatchSumCaseContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.matchSumVariant`.
	 * @param ctx the parse tree
	 */
	enterMatchSumVariant?: (ctx: MatchSumVariantContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.matchSumVariant`.
	 * @param ctx the parse tree
	 */
	exitMatchSumVariant?: (ctx: MatchSumVariantContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.declarationOrExpr`.
	 * @param ctx the parse tree
	 */
	enterDeclarationOrExpr?: (ctx: DeclarationOrExprContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.declarationOrExpr`.
	 * @param ctx the parse tree
	 */
	exitDeclarationOrExpr?: (ctx: DeclarationOrExprContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.lambdaUnsugared`.
	 * @param ctx the parse tree
	 */
	enterLambdaUnsugared?: (ctx: LambdaUnsugaredContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.lambdaUnsugared`.
	 * @param ctx the parse tree
	 */
	exitLambdaUnsugared?: (ctx: LambdaUnsugaredContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.lambdaTupleSugar`.
	 * @param ctx the parse tree
	 */
	enterLambdaTupleSugar?: (ctx: LambdaTupleSugarContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.lambdaTupleSugar`.
	 * @param ctx the parse tree
	 */
	exitLambdaTupleSugar?: (ctx: LambdaTupleSugarContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.parameter`.
	 * @param ctx the parse tree
	 */
	enterParameter?: (ctx: ParameterContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.parameter`.
	 * @param ctx the parse tree
	 */
	exitParameter?: (ctx: ParameterContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.annotatedParameter`.
	 * @param ctx the parse tree
	 */
	enterAnnotatedParameter?: (ctx: AnnotatedParameterContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.annotatedParameter`.
	 * @param ctx the parse tree
	 */
	exitAnnotatedParameter?: (ctx: AnnotatedParameterContext) => void;

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
	 * Enter a parse tree produced by `QuintParser.recElem`.
	 * @param ctx the parse tree
	 */
	enterRecElem?: (ctx: RecElemContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.recElem`.
	 * @param ctx the parse tree
	 */
	exitRecElem?: (ctx: RecElemContext) => void;

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

	/**
	 * Enter a parse tree produced by `QuintParser.qualId`.
	 * @param ctx the parse tree
	 */
	enterQualId?: (ctx: QualIdContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.qualId`.
	 * @param ctx the parse tree
	 */
	exitQualId?: (ctx: QualIdContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.simpleId`.
	 * @param ctx the parse tree
	 */
	enterSimpleId?: (ctx: SimpleIdContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.simpleId`.
	 * @param ctx the parse tree
	 */
	exitSimpleId?: (ctx: SimpleIdContext) => void;

	/**
	 * Enter a parse tree produced by `QuintParser.identifier`.
	 * @param ctx the parse tree
	 */
	enterIdentifier?: (ctx: IdentifierContext) => void;
	/**
	 * Exit a parse tree produced by `QuintParser.identifier`.
	 * @param ctx the parse tree
	 */
	exitIdentifier?: (ctx: IdentifierContext) => void;
}

