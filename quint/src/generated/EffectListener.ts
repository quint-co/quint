// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `EffectParser`.
 */
export interface EffectListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `concreteComponents`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterConcreteComponents?: (ctx: ConcreteComponentsContext) => void;
	/**
	 * Exit a parse tree produced by the `concreteComponents`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitConcreteComponents?: (ctx: ConcreteComponentsContext) => void;

	/**
	 * Enter a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterPure?: (ctx: PureContext) => void;
	/**
	 * Exit a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitPure?: (ctx: PureContext) => void;

	/**
	 * Enter a parse tree produced by the `readComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	enterReadComponent?: (ctx: ReadComponentContext) => void;
	/**
	 * Exit a parse tree produced by the `readComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	exitReadComponent?: (ctx: ReadComponentContext) => void;

	/**
	 * Enter a parse tree produced by the `updateComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	enterUpdateComponent?: (ctx: UpdateComponentContext) => void;
	/**
	 * Exit a parse tree produced by the `updateComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	exitUpdateComponent?: (ctx: UpdateComponentContext) => void;

	/**
	 * Enter a parse tree produced by the `temporalComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	enterTemporalComponent?: (ctx: TemporalComponentContext) => void;
	/**
	 * Exit a parse tree produced by the `temporalComponent`
	 * labeled alternative in `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	exitTemporalComponent?: (ctx: TemporalComponentContext) => void;

	/**
	 * Enter a parse tree produced by the `concreteEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterConcreteEffect?: (ctx: ConcreteEffectContext) => void;
	/**
	 * Exit a parse tree produced by the `concreteEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitConcreteEffect?: (ctx: ConcreteEffectContext) => void;

	/**
	 * Enter a parse tree produced by the `arrowEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterArrowEffect?: (ctx: ArrowEffectContext) => void;
	/**
	 * Exit a parse tree produced by the `arrowEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitArrowEffect?: (ctx: ArrowEffectContext) => void;

	/**
	 * Enter a parse tree produced by the `variableEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterVariableEffect?: (ctx: VariableEffectContext) => void;
	/**
	 * Exit a parse tree produced by the `variableEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitVariableEffect?: (ctx: VariableEffectContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterEffect?: (ctx: EffectContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitEffect?: (ctx: EffectContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.read`.
	 * @param ctx the parse tree
	 */
	enterRead?: (ctx: ReadContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.read`.
	 * @param ctx the parse tree
	 */
	exitRead?: (ctx: ReadContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.update`.
	 * @param ctx the parse tree
	 */
	enterUpdate?: (ctx: UpdateContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.update`.
	 * @param ctx the parse tree
	 */
	exitUpdate?: (ctx: UpdateContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.temporal`.
	 * @param ctx the parse tree
	 */
	enterTemporal?: (ctx: TemporalContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.temporal`.
	 * @param ctx the parse tree
	 */
	exitTemporal?: (ctx: TemporalContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterConcrete?: (ctx: ConcreteContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitConcrete?: (ctx: ConcreteContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	enterComponent?: (ctx: ComponentContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.component`.
	 * @param ctx the parse tree
	 */
	exitComponent?: (ctx: ComponentContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.entity`.
	 * @param ctx the parse tree
	 */
	enterEntity?: (ctx: EntityContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.entity`.
	 * @param ctx the parse tree
	 */
	exitEntity?: (ctx: EntityContext) => void;

	/**
	 * Enter a parse tree produced by `EffectParser.stateVarRef`.
	 * @param ctx the parse tree
	 */
	enterStateVarRef?: (ctx: StateVarRefContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.stateVarRef`.
	 * @param ctx the parse tree
	 */
	exitStateVarRef?: (ctx: StateVarRefContext) => void;
}

