// Generated from /Users/mahtab/grammar 2/quint/quint/src/generated/Effect.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link EffectParser}.
 */
public interface EffectListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the {@code concreteEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void enterConcreteEffect(EffectParser.ConcreteEffectContext ctx);
	/**
	 * Exit a parse tree produced by the {@code concreteEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void exitConcreteEffect(EffectParser.ConcreteEffectContext ctx);
	/**
	 * Enter a parse tree produced by the {@code arrowEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void enterArrowEffect(EffectParser.ArrowEffectContext ctx);
	/**
	 * Exit a parse tree produced by the {@code arrowEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void exitArrowEffect(EffectParser.ArrowEffectContext ctx);
	/**
	 * Enter a parse tree produced by the {@code variableEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void enterVariableEffect(EffectParser.VariableEffectContext ctx);
	/**
	 * Exit a parse tree produced by the {@code variableEffect}
	 * labeled alternative in {@link EffectParser#effect}.
	 * @param ctx the parse tree
	 */
	void exitVariableEffect(EffectParser.VariableEffectContext ctx);
	/**
	 * Enter a parse tree produced by {@link EffectParser#read}.
	 * @param ctx the parse tree
	 */
	void enterRead(EffectParser.ReadContext ctx);
	/**
	 * Exit a parse tree produced by {@link EffectParser#read}.
	 * @param ctx the parse tree
	 */
	void exitRead(EffectParser.ReadContext ctx);
	/**
	 * Enter a parse tree produced by {@link EffectParser#update}.
	 * @param ctx the parse tree
	 */
	void enterUpdate(EffectParser.UpdateContext ctx);
	/**
	 * Exit a parse tree produced by {@link EffectParser#update}.
	 * @param ctx the parse tree
	 */
	void exitUpdate(EffectParser.UpdateContext ctx);
	/**
	 * Enter a parse tree produced by {@link EffectParser#temporal}.
	 * @param ctx the parse tree
	 */
	void enterTemporal(EffectParser.TemporalContext ctx);
	/**
	 * Exit a parse tree produced by {@link EffectParser#temporal}.
	 * @param ctx the parse tree
	 */
	void exitTemporal(EffectParser.TemporalContext ctx);
	/**
	 * Enter a parse tree produced by the {@code readOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterReadOnly(EffectParser.ReadOnlyContext ctx);
	/**
	 * Exit a parse tree produced by the {@code readOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitReadOnly(EffectParser.ReadOnlyContext ctx);
	/**
	 * Enter a parse tree produced by the {@code updateOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterUpdateOnly(EffectParser.UpdateOnlyContext ctx);
	/**
	 * Exit a parse tree produced by the {@code updateOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitUpdateOnly(EffectParser.UpdateOnlyContext ctx);
	/**
	 * Enter a parse tree produced by the {@code temporalOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterTemporalOnly(EffectParser.TemporalOnlyContext ctx);
	/**
	 * Exit a parse tree produced by the {@code temporalOnly}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitTemporalOnly(EffectParser.TemporalOnlyContext ctx);
	/**
	 * Enter a parse tree produced by the {@code readAndUpdate}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterReadAndUpdate(EffectParser.ReadAndUpdateContext ctx);
	/**
	 * Exit a parse tree produced by the {@code readAndUpdate}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitReadAndUpdate(EffectParser.ReadAndUpdateContext ctx);
	/**
	 * Enter a parse tree produced by the {@code readAndTemporal}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterReadAndTemporal(EffectParser.ReadAndTemporalContext ctx);
	/**
	 * Exit a parse tree produced by the {@code readAndTemporal}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitReadAndTemporal(EffectParser.ReadAndTemporalContext ctx);
	/**
	 * Enter a parse tree produced by the {@code pure}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void enterPure(EffectParser.PureContext ctx);
	/**
	 * Exit a parse tree produced by the {@code pure}
	 * labeled alternative in {@link EffectParser#concrete}.
	 * @param ctx the parse tree
	 */
	void exitPure(EffectParser.PureContext ctx);
	/**
	 * Enter a parse tree produced by {@link EffectParser#entity}.
	 * @param ctx the parse tree
	 */
	void enterEntity(EffectParser.EntityContext ctx);
	/**
	 * Exit a parse tree produced by {@link EffectParser#entity}.
	 * @param ctx the parse tree
	 */
	void exitEntity(EffectParser.EntityContext ctx);
	/**
	 * Enter a parse tree produced by {@link EffectParser#stateVarRef}.
	 * @param ctx the parse tree
	 */
	void enterStateVarRef(EffectParser.StateVarRefContext ctx);
	/**
	 * Exit a parse tree produced by {@link EffectParser#stateVarRef}.
	 * @param ctx the parse tree
	 */
	void exitStateVarRef(EffectParser.StateVarRefContext ctx);
}