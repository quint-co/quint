// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ConcreteComponentsContext } from "./EffectParser";
import { PureContext } from "./EffectParser";
import { ReadComponentContext } from "./EffectParser";
import { UpdateComponentContext } from "./EffectParser";
import { TemporalComponentContext } from "./EffectParser";
import { ConcreteEffectContext } from "./EffectParser";
import { ArrowEffectContext } from "./EffectParser";
import { VariableEffectContext } from "./EffectParser";
import { EffectContext } from "./EffectParser";
import { ReadContext } from "./EffectParser";
import { UpdateContext } from "./EffectParser";
import { TemporalContext } from "./EffectParser";
import { ConcreteContext } from "./EffectParser";
import { ComponentContext } from "./EffectParser";
import { EntityContext } from "./EffectParser";
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
	 * Visit a parse tree produced by the `concreteComponents`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcreteComponents?: (ctx: ConcreteComponentsContext) => Result;

	/**
	 * Visit a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPure?: (ctx: PureContext) => Result;

	/**
	 * Visit a parse tree produced by the `readComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReadComponent?: (ctx: ReadComponentContext) => Result;

	/**
	 * Visit a parse tree produced by the `updateComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUpdateComponent?: (ctx: UpdateComponentContext) => Result;

	/**
	 * Visit a parse tree produced by the `temporalComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemporalComponent?: (ctx: TemporalComponentContext) => Result;

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
	 * Visit a parse tree produced by the `variableEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariableEffect?: (ctx: VariableEffectContext) => Result;

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
	 * Visit a parse tree produced by `EffectParser.component`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComponent?: (ctx: ComponentContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.entity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEntity?: (ctx: EntityContext) => Result;

	/**
	 * Visit a parse tree produced by `EffectParser.stateVarRef`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStateVarRef?: (ctx: StateVarRefContext) => Result;
}

