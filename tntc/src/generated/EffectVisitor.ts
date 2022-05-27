// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ConcreteContext } from "./EffectParser";
import { ArrowEffectContext } from "./EffectParser";
import { VarEffectContext } from "./EffectParser";
import { ConcreteVarsContext } from "./EffectParser";
import { QuantificationContext } from "./EffectParser";
import { ReadOnlyContext } from "./EffectParser";
import { UpdateOnlyContext } from "./EffectParser";
import { ReadAndUpdateContext } from "./EffectParser";
import { PureContext } from "./EffectParser";
import { EffectContext } from "./EffectParser";
import { ConcreteEffectContext } from "./EffectParser";
import { VarsContext } from "./EffectParser";
import { StateVarRefContext } from "./EffectParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `EffectParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface EffectVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `concrete`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcrete?: (ctx: ConcreteContext) => Result;

	/**
	 * Visit a parse tree produced by the `arrowEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrowEffect?: (ctx: ArrowEffectContext) => Result;

	/**
	 * Visit a parse tree produced by the `varEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVarEffect?: (ctx: VarEffectContext) => Result;

	/**
	 * Visit a parse tree produced by the `concreteVars`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcreteVars?: (ctx: ConcreteVarsContext) => Result;

	/**
	 * Visit a parse tree produced by the `quantification`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuantification?: (ctx: QuantificationContext) => Result;

	/**
	 * Visit a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadOnly?: (ctx: ReadOnlyContext) => Result;

	/**
	 * Visit a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUpdateOnly?: (ctx: UpdateOnlyContext) => Result;

	/**
	 * Visit a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadAndUpdate?: (ctx: ReadAndUpdateContext) => Result;

	/**
	 * Visit a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPure?: (ctx: PureContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEffect?: (ctx: EffectContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcreteEffect?: (ctx: ConcreteEffectContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.vars`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVars?: (ctx: VarsContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.stateVarRef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStateVarRef?: (ctx: StateVarRefContext) => Result;
}

