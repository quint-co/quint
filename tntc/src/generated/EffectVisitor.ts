// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ReadOnlyContext } from "./EffectParser";
import { UpdateOnlyContext } from "./EffectParser";
import { TemporalOnlyContext } from "./EffectParser";
import { ReadAndUpdateContext } from "./EffectParser";
import { ReadAndTemporalContext } from "./EffectParser";
import { PureContext } from "./EffectParser";
import { ConcreteEffectContext } from "./EffectParser";
import { ArrowEffectContext } from "./EffectParser";
import { QuantifiedEffectContext } from "./EffectParser";
import { EffectContext } from "./EffectParser";
import { ReadContext } from "./EffectParser";
import { UpdateContext } from "./EffectParser";
import { TemporalContext } from "./EffectParser";
import { ConcreteContext } from "./EffectParser";
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
	 * Visit a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadOnly?: (ctx: ReadOnlyContext) => Result;

	/**
	 * Visit a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUpdateOnly?: (ctx: UpdateOnlyContext) => Result;

	/**
	 * Visit a parse tree produced by the `temporalOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemporalOnly?: (ctx: TemporalOnlyContext) => Result;

	/**
	 * Visit a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadAndUpdate?: (ctx: ReadAndUpdateContext) => Result;

	/**
	 * Visit a parse tree produced by the `readAndTemporal`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadAndTemporal?: (ctx: ReadAndTemporalContext) => Result;

	/**
	 * Visit a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPure?: (ctx: PureContext) => Result;

	/**
	 * Visit a parse tree produced by the `concreteEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcreteEffect?: (ctx: ConcreteEffectContext) => Result;

	/**
	 * Visit a parse tree produced by the `arrowEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrowEffect?: (ctx: ArrowEffectContext) => Result;

	/**
	 * Visit a parse tree produced by the `quantifiedEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuantifiedEffect?: (ctx: QuantifiedEffectContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEffect?: (ctx: EffectContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.read`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRead?: (ctx: ReadContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.update`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUpdate?: (ctx: UpdateContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.temporal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemporal?: (ctx: TemporalContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcrete?: (ctx: ConcreteContext) => Result;

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

