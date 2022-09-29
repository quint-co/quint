// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `EffectParser`.
 */
export interface EffectListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterReadOnly?: (ctx: ReadOnlyContext) => void;
	/**
	 * Exit a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitReadOnly?: (ctx: ReadOnlyContext) => void;

	/**
	 * Enter a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterUpdateOnly?: (ctx: UpdateOnlyContext) => void;
	/**
	 * Exit a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitUpdateOnly?: (ctx: UpdateOnlyContext) => void;

	/**
	 * Enter a parse tree produced by the `temporalOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterTemporalOnly?: (ctx: TemporalOnlyContext) => void;
	/**
	 * Exit a parse tree produced by the `temporalOnly`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitTemporalOnly?: (ctx: TemporalOnlyContext) => void;

	/**
	 * Enter a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterReadAndUpdate?: (ctx: ReadAndUpdateContext) => void;
	/**
	 * Exit a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitReadAndUpdate?: (ctx: ReadAndUpdateContext) => void;

	/**
	 * Enter a parse tree produced by the `readAndTemporal`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	enterReadAndTemporal?: (ctx: ReadAndTemporalContext) => void;
	/**
	 * Exit a parse tree produced by the `readAndTemporal`
	 * labeled alternative in `EffectParser.concrete`.
	 * @param ctx the parse tree
	 */
	exitReadAndTemporal?: (ctx: ReadAndTemporalContext) => void;

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
	 * Enter a parse tree produced by the `quantifiedEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterQuantifiedEffect?: (ctx: QuantifiedEffectContext) => void;
	/**
	 * Exit a parse tree produced by the `quantifiedEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitQuantifiedEffect?: (ctx: QuantifiedEffectContext) => void;

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
	 * Enter a parse tree produced by `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	enterVars?: (ctx: VarsContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	exitVars?: (ctx: VarsContext) => void;

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

