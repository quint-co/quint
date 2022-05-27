// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `EffectParser`.
 */
export interface EffectListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `concrete`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterConcrete?: (ctx: ConcreteContext) => void;
	/**
	 * Exit a parse tree produced by the `concrete`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitConcrete?: (ctx: ConcreteContext) => void;

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
	 * Enter a parse tree produced by the `varEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	enterVarEffect?: (ctx: VarEffectContext) => void;
	/**
	 * Exit a parse tree produced by the `varEffect`
	 * labeled alternative in `EffectParser.effect`.
	 * @param ctx the parse tree
	 */
	exitVarEffect?: (ctx: VarEffectContext) => void;

	/**
	 * Enter a parse tree produced by the `concreteVars`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	enterConcreteVars?: (ctx: ConcreteVarsContext) => void;
	/**
	 * Exit a parse tree produced by the `concreteVars`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	exitConcreteVars?: (ctx: ConcreteVarsContext) => void;

	/**
	 * Enter a parse tree produced by the `quantification`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	enterQuantification?: (ctx: QuantificationContext) => void;
	/**
	 * Exit a parse tree produced by the `quantification`
	 * labeled alternative in `EffectParser.vars`.
	 * @param ctx the parse tree
	 */
	exitQuantification?: (ctx: QuantificationContext) => void;

	/**
	 * Enter a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	enterReadOnly?: (ctx: ReadOnlyContext) => void;
	/**
	 * Exit a parse tree produced by the `readOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	exitReadOnly?: (ctx: ReadOnlyContext) => void;

	/**
	 * Enter a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	enterUpdateOnly?: (ctx: UpdateOnlyContext) => void;
	/**
	 * Exit a parse tree produced by the `updateOnly`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	exitUpdateOnly?: (ctx: UpdateOnlyContext) => void;

	/**
	 * Enter a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	enterReadAndUpdate?: (ctx: ReadAndUpdateContext) => void;
	/**
	 * Exit a parse tree produced by the `readAndUpdate`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	exitReadAndUpdate?: (ctx: ReadAndUpdateContext) => void;

	/**
	 * Enter a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	enterPure?: (ctx: PureContext) => void;
	/**
	 * Exit a parse tree produced by the `pure`
	 * labeled alternative in `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	exitPure?: (ctx: PureContext) => void;

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
	 * Enter a parse tree produced by `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	enterConcreteEffect?: (ctx: ConcreteEffectContext) => void;
	/**
	 * Exit a parse tree produced by `EffectParser.concreteEffect`.
	 * @param ctx the parse tree
	 */
	exitConcreteEffect?: (ctx: ConcreteEffectContext) => void;

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

