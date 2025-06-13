// Generated from ./src/generated/Quint.g4 by ANTLR 4.9.0-SNAPSHOT



// Used for forming errors
import { quintErrorToString } from '../quintError'



import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

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
import { WrongTypeAppContext } from "./QuintParser";
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
import { WrongTypeContext } from "./QuintParser";
import { PermissiveTypeContext } from "./QuintParser";
import { TypeVarContext } from "./QuintParser";
import { RowContext } from "./QuintParser";
import { RowLabelContext } from "./QuintParser";
import { TypeArgsContext } from "./QuintParser";
import { TypeApplicationContext } from "./QuintParser";
import { WrongTypeApplicationContext } from "./QuintParser";
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
import { KeywordAsIDContext } from "./QuintParser";
import { ReservedContext } from "./QuintParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `QuintParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface QuintVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `typeFun`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeFun?: (ctx: TypeFunContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeOper`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeOper?: (ctx: TypeOperContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeSet`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeSet?: (ctx: TypeSetContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeList`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeList?: (ctx: TypeListContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeUnit`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeUnit?: (ctx: TypeUnitContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeTuple`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeTuple?: (ctx: TypeTupleContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeRec`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeRec?: (ctx: TypeRecContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeInt`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeInt?: (ctx: TypeIntContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeStr`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeStr?: (ctx: TypeStrContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeBool`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeBool?: (ctx: TypeBoolContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeVarCase`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeVarCase?: (ctx: TypeVarCaseContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeConst`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeConst?: (ctx: TypeConstContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeParen`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeParen?: (ctx: TypeParenContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeApp`
	 * labeled alternative in `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeApp?: (ctx: TypeAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeAbstractDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeAbstractDef?: (ctx: TypeAbstractDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeAliasDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeAliasDef?: (ctx: TypeAliasDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeSumDef`
	 * labeled alternative in `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeSumDef?: (ctx: TypeSumDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `dotCall`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDotCall?: (ctx: DotCallContext) => Result;

	/**
	 * Visit a parse tree produced by the `lambdaCons`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaCons?: (ctx: LambdaConsContext) => Result;

	/**
	 * Visit a parse tree produced by the `operApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperApp?: (ctx: OperAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `listApp`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListApp?: (ctx: ListAppContext) => Result;

	/**
	 * Visit a parse tree produced by the `pow`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPow?: (ctx: PowContext) => Result;

	/**
	 * Visit a parse tree produced by the `uminus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUminus?: (ctx: UminusContext) => Result;

	/**
	 * Visit a parse tree produced by the `multDiv`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultDiv?: (ctx: MultDivContext) => Result;

	/**
	 * Visit a parse tree produced by the `plusMinus`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPlusMinus?: (ctx: PlusMinusContext) => Result;

	/**
	 * Visit a parse tree produced by the `relations`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRelations?: (ctx: RelationsContext) => Result;

	/**
	 * Visit a parse tree produced by the `asgn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAsgn?: (ctx: AsgnContext) => Result;

	/**
	 * Visit a parse tree produced by the `errorEq`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorEq?: (ctx: ErrorEqContext) => Result;

	/**
	 * Visit a parse tree produced by the `andExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAndExpr?: (ctx: AndExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `and`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnd?: (ctx: AndContext) => Result;

	/**
	 * Visit a parse tree produced by the `orExpr`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOrExpr?: (ctx: OrExprContext) => Result;

	/**
	 * Visit a parse tree produced by the `or`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOr?: (ctx: OrContext) => Result;

	/**
	 * Visit a parse tree produced by the `iff`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIff?: (ctx: IffContext) => Result;

	/**
	 * Visit a parse tree produced by the `implies`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImplies?: (ctx: ImpliesContext) => Result;

	/**
	 * Visit a parse tree produced by the `match`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatch?: (ctx: MatchContext) => Result;

	/**
	 * Visit a parse tree produced by the `actionAll`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitActionAll?: (ctx: ActionAllContext) => Result;

	/**
	 * Visit a parse tree produced by the `actionAny`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitActionAny?: (ctx: ActionAnyContext) => Result;

	/**
	 * Visit a parse tree produced by the `literalOrId`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteralOrId?: (ctx: LiteralOrIdContext) => Result;

	/**
	 * Visit a parse tree produced by the `tuple`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple?: (ctx: TupleContext) => Result;

	/**
	 * Visit a parse tree produced by the `unit`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnit?: (ctx: UnitContext) => Result;

	/**
	 * Visit a parse tree produced by the `pair`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPair?: (ctx: PairContext) => Result;

	/**
	 * Visit a parse tree produced by the `record`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRecord?: (ctx: RecordContext) => Result;

	/**
	 * Visit a parse tree produced by the `list`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitList?: (ctx: ListContext) => Result;

	/**
	 * Visit a parse tree produced by the `ifElse`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfElse?: (ctx: IfElseContext) => Result;

	/**
	 * Visit a parse tree produced by the `letIn`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLetIn?: (ctx: LetInContext) => Result;

	/**
	 * Visit a parse tree produced by the `paren`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParen?: (ctx: ParenContext) => Result;

	/**
	 * Visit a parse tree produced by the `braces`
	 * labeled alternative in `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBraces?: (ctx: BracesContext) => Result;

	/**
	 * Visit a parse tree produced by the `annotatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotatedOperDef?: (ctx: AnnotatedOperDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `deprecatedOperDef`
	 * labeled alternative in `QuintParser.operDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeprecatedOperDef?: (ctx: DeprecatedOperDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `const`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConst?: (ctx: ConstContext) => Result;

	/**
	 * Visit a parse tree produced by the `var`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVar?: (ctx: VarContext) => Result;

	/**
	 * Visit a parse tree produced by the `assume`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssume?: (ctx: AssumeContext) => Result;

	/**
	 * Visit a parse tree produced by the `instance`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstance?: (ctx: InstanceContext) => Result;

	/**
	 * Visit a parse tree produced by the `oper`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOper?: (ctx: OperContext) => Result;

	/**
	 * Visit a parse tree produced by the `typeDefs`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDefs?: (ctx: TypeDefsContext) => Result;

	/**
	 * Visit a parse tree produced by the `importDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImportDef?: (ctx: ImportDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `exportDef`
	 * labeled alternative in `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExportDef?: (ctx: ExportDefContext) => Result;

	/**
	 * Visit a parse tree produced by the `wrongTypeApp`
	 * labeled alternative in `QuintParser.wrongType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWrongTypeApp?: (ctx: WrongTypeAppContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.modules`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModules?: (ctx: ModulesContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.module`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModule?: (ctx: ModuleContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.documentedDeclaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDocumentedDeclaration?: (ctx: DocumentedDeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration?: (ctx: DeclarationContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.operDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperDef?: (ctx: OperDefContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeDef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDef?: (ctx: TypeDefContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeDefHead`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeDefHead?: (ctx: TypeDefHeadContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.sumTypeDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSumTypeDefinition?: (ctx: SumTypeDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeSumVariant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeSumVariant?: (ctx: TypeSumVariantContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.qualifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifier?: (ctx: QualifierContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.importMod`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImportMod?: (ctx: ImportModContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.exportMod`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExportMod?: (ctx: ExportModContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.instanceMod`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInstanceMod?: (ctx: InstanceModContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.moduleName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModuleName?: (ctx: ModuleNameContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.name`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName?: (ctx: NameContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.qualifiedName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualifiedName?: (ctx: QualifiedNameContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.fromSource`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFromSource?: (ctx: FromSourceContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.type`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType?: (ctx: TypeContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.wrongType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWrongType?: (ctx: WrongTypeContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.permissiveType`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPermissiveType?: (ctx: PermissiveTypeContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeVar`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeVar?: (ctx: TypeVarContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.row`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRow?: (ctx: RowContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.rowLabel`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRowLabel?: (ctx: RowLabelContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeArgs`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeArgs?: (ctx: TypeArgsContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.typeApplication`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTypeApplication?: (ctx: TypeApplicationContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.wrongTypeApplication`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWrongTypeApplication?: (ctx: WrongTypeApplicationContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpr?: (ctx: ExprContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.matchSumExpr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatchSumExpr?: (ctx: MatchSumExprContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.matchSumCase`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatchSumCase?: (ctx: MatchSumCaseContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.matchSumVariant`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMatchSumVariant?: (ctx: MatchSumVariantContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.declarationOrExpr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclarationOrExpr?: (ctx: DeclarationOrExprContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.lambda`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambda?: (ctx: LambdaContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.lambdaUnsugared`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaUnsugared?: (ctx: LambdaUnsugaredContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.lambdaTupleSugar`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLambdaTupleSugar?: (ctx: LambdaTupleSugarContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.identOrHole`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentOrHole?: (ctx: IdentOrHoleContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.parameter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameter?: (ctx: ParameterContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.annotatedParameter`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAnnotatedParameter?: (ctx: AnnotatedParameterContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.identOrStar`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentOrStar?: (ctx: IdentOrStarContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.argList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgList?: (ctx: ArgListContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.recElem`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRecElem?: (ctx: RecElemContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.normalCallName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalCallName?: (ctx: NormalCallNameContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.nameAfterDot`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNameAfterDot?: (ctx: NameAfterDotContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.operator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperator?: (ctx: OperatorContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.qualId`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQualId?: (ctx: QualIdContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.simpleId`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimpleId?: (ctx: SimpleIdContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.identifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIdentifier?: (ctx: IdentifierContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.keywordAsID`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitKeywordAsID?: (ctx: KeywordAsIDContext) => Result;

	/**
	 * Visit a parse tree produced by `QuintParser.reserved`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReserved?: (ctx: ReservedContext) => Result;
}

