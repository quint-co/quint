// Generated from /Users/mahtab/grammar 2/quint/quint/src/generated/Effect.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class EffectParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, T__2=3, T__3=4, T__4=5, T__5=6, T__6=7, T__7=8, T__8=9, 
		T__9=10, T__10=11, T__11=12, IDENTIFIER=13, WS=14;
	public static final int
		RULE_effect = 0, RULE_read = 1, RULE_update = 2, RULE_temporal = 3, RULE_concrete = 4, 
		RULE_entity = 5, RULE_stateVarRef = 6;
	private static String[] makeRuleNames() {
		return new String[] {
			"effect", "read", "update", "temporal", "concrete", "entity", "stateVarRef"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'('", "','", "')'", "'=>'", "'Read'", "'['", "']'", "'Update'", 
			"'Temporal'", "'&'", "'Pure'", "'''"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, null, null, null, null, null, null, null, null, null, null, null, 
			null, "IDENTIFIER", "WS"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "Effect.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public EffectParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class EffectContext extends ParserRuleContext {
		public EffectContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_effect; }
	 
		public EffectContext() { }
		public void copyFrom(EffectContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class VariableEffectContext extends EffectContext {
		public TerminalNode IDENTIFIER() { return getToken(EffectParser.IDENTIFIER, 0); }
		public VariableEffectContext(EffectContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterVariableEffect(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitVariableEffect(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ArrowEffectContext extends EffectContext {
		public List<EffectContext> effect() {
			return getRuleContexts(EffectContext.class);
		}
		public EffectContext effect(int i) {
			return getRuleContext(EffectContext.class,i);
		}
		public ArrowEffectContext(EffectContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterArrowEffect(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitArrowEffect(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ConcreteEffectContext extends EffectContext {
		public ConcreteContext concrete() {
			return getRuleContext(ConcreteContext.class,0);
		}
		public ConcreteEffectContext(EffectContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterConcreteEffect(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitConcreteEffect(this);
		}
	}

	public final EffectContext effect() throws RecognitionException {
		EffectContext _localctx = new EffectContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_effect);
		int _la;
		try {
			setState(30);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case T__4:
			case T__7:
			case T__8:
			case T__10:
				_localctx = new ConcreteEffectContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(14);
				concrete();
				}
				break;
			case T__0:
				_localctx = new ArrowEffectContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(15);
				match(T__0);
				setState(24);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 11042L) != 0)) {
					{
					setState(16);
					effect();
					setState(21);
					_errHandler.sync(this);
					_la = _input.LA(1);
					while (_la==T__1) {
						{
						{
						setState(17);
						match(T__1);
						setState(18);
						effect();
						}
						}
						setState(23);
						_errHandler.sync(this);
						_la = _input.LA(1);
					}
					}
				}

				setState(26);
				match(T__2);
				setState(27);
				match(T__3);
				setState(28);
				effect();
				}
				break;
			case IDENTIFIER:
				_localctx = new VariableEffectContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(29);
				match(IDENTIFIER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ReadContext extends ParserRuleContext {
		public EntityContext entity() {
			return getRuleContext(EntityContext.class,0);
		}
		public ReadContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_read; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterRead(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitRead(this);
		}
	}

	public final ReadContext read() throws RecognitionException {
		ReadContext _localctx = new ReadContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_read);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(32);
			match(T__4);
			setState(33);
			match(T__5);
			setState(34);
			entity();
			setState(35);
			match(T__6);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class UpdateContext extends ParserRuleContext {
		public EntityContext entity() {
			return getRuleContext(EntityContext.class,0);
		}
		public UpdateContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_update; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterUpdate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitUpdate(this);
		}
	}

	public final UpdateContext update() throws RecognitionException {
		UpdateContext _localctx = new UpdateContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_update);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(37);
			match(T__7);
			setState(38);
			match(T__5);
			setState(39);
			entity();
			setState(40);
			match(T__6);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class TemporalContext extends ParserRuleContext {
		public EntityContext entity() {
			return getRuleContext(EntityContext.class,0);
		}
		public TemporalContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_temporal; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterTemporal(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitTemporal(this);
		}
	}

	public final TemporalContext temporal() throws RecognitionException {
		TemporalContext _localctx = new TemporalContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_temporal);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(42);
			match(T__8);
			setState(43);
			match(T__5);
			setState(44);
			entity();
			setState(45);
			match(T__6);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ConcreteContext extends ParserRuleContext {
		public ConcreteContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_concrete; }
	 
		public ConcreteContext() { }
		public void copyFrom(ConcreteContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ReadAndTemporalContext extends ConcreteContext {
		public ReadContext read() {
			return getRuleContext(ReadContext.class,0);
		}
		public TemporalContext temporal() {
			return getRuleContext(TemporalContext.class,0);
		}
		public UpdateContext update() {
			return getRuleContext(UpdateContext.class,0);
		}
		public ReadAndTemporalContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterReadAndTemporal(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitReadAndTemporal(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ReadAndUpdateContext extends ConcreteContext {
		public ReadContext read() {
			return getRuleContext(ReadContext.class,0);
		}
		public UpdateContext update() {
			return getRuleContext(UpdateContext.class,0);
		}
		public ReadAndUpdateContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterReadAndUpdate(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitReadAndUpdate(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ReadOnlyContext extends ConcreteContext {
		public ReadContext read() {
			return getRuleContext(ReadContext.class,0);
		}
		public ReadOnlyContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterReadOnly(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitReadOnly(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class TemporalOnlyContext extends ConcreteContext {
		public TemporalContext temporal() {
			return getRuleContext(TemporalContext.class,0);
		}
		public TemporalOnlyContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterTemporalOnly(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitTemporalOnly(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class PureContext extends ConcreteContext {
		public PureContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterPure(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitPure(this);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class UpdateOnlyContext extends ConcreteContext {
		public UpdateContext update() {
			return getRuleContext(UpdateContext.class,0);
		}
		public UpdateOnlyContext(ConcreteContext ctx) { copyFrom(ctx); }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterUpdateOnly(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitUpdateOnly(this);
		}
	}

	public final ConcreteContext concrete() throws RecognitionException {
		ConcreteContext _localctx = new ConcreteContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_concrete);
		try {
			setState(71);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,5,_ctx) ) {
			case 1:
				_localctx = new ReadOnlyContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(47);
				read();
				}
				break;
			case 2:
				_localctx = new UpdateOnlyContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(48);
				update();
				}
				break;
			case 3:
				_localctx = new TemporalOnlyContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(49);
				temporal();
				}
				break;
			case 4:
				_localctx = new ReadAndUpdateContext(_localctx);
				enterOuterAlt(_localctx, 4);
				{
				setState(58);
				_errHandler.sync(this);
				switch (_input.LA(1)) {
				case T__4:
					{
					setState(50);
					read();
					setState(51);
					match(T__9);
					setState(52);
					update();
					}
					break;
				case T__7:
					{
					setState(54);
					update();
					setState(55);
					match(T__9);
					setState(56);
					read();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;
			case 5:
				_localctx = new ReadAndTemporalContext(_localctx);
				enterOuterAlt(_localctx, 5);
				{
				setState(68);
				_errHandler.sync(this);
				switch (_input.LA(1)) {
				case T__4:
					{
					setState(60);
					read();
					setState(61);
					match(T__9);
					setState(62);
					temporal();
					}
					break;
				case T__7:
					{
					setState(64);
					update();
					setState(65);
					match(T__9);
					setState(66);
					temporal();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;
			case 6:
				_localctx = new PureContext(_localctx);
				enterOuterAlt(_localctx, 6);
				{
				setState(70);
				match(T__10);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class EntityContext extends ParserRuleContext {
		public List<StateVarRefContext> stateVarRef() {
			return getRuleContexts(StateVarRefContext.class);
		}
		public StateVarRefContext stateVarRef(int i) {
			return getRuleContext(StateVarRefContext.class,i);
		}
		public List<TerminalNode> IDENTIFIER() { return getTokens(EffectParser.IDENTIFIER); }
		public TerminalNode IDENTIFIER(int i) {
			return getToken(EffectParser.IDENTIFIER, i);
		}
		public EntityContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_entity; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterEntity(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitEntity(this);
		}
	}

	public final EntityContext entity() throws RecognitionException {
		EntityContext _localctx = new EntityContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_entity);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(87);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==T__11 || _la==IDENTIFIER) {
				{
				setState(75);
				_errHandler.sync(this);
				switch (_input.LA(1)) {
				case T__11:
					{
					setState(73);
					stateVarRef();
					}
					break;
				case IDENTIFIER:
					{
					setState(74);
					match(IDENTIFIER);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				setState(84);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==T__1) {
					{
					{
					setState(77);
					match(T__1);
					setState(80);
					_errHandler.sync(this);
					switch (_input.LA(1)) {
					case T__11:
						{
						setState(78);
						stateVarRef();
						}
						break;
					case IDENTIFIER:
						{
						setState(79);
						match(IDENTIFIER);
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
					setState(86);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class StateVarRefContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(EffectParser.IDENTIFIER, 0); }
		public StateVarRefContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_stateVarRef; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).enterStateVarRef(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EffectListener ) ((EffectListener)listener).exitStateVarRef(this);
		}
	}

	public final StateVarRefContext stateVarRef() throws RecognitionException {
		StateVarRefContext _localctx = new StateVarRefContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_stateVarRef);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(89);
			match(T__11);
			setState(90);
			match(IDENTIFIER);
			setState(91);
			match(T__11);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static final String _serializedATN =
		"\u0004\u0001\u000e^\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0001\u0000\u0001\u0000\u0001"+
		"\u0000\u0001\u0000\u0001\u0000\u0005\u0000\u0014\b\u0000\n\u0000\f\u0000"+
		"\u0017\t\u0000\u0003\u0000\u0019\b\u0000\u0001\u0000\u0001\u0000\u0001"+
		"\u0000\u0001\u0000\u0003\u0000\u001f\b\u0000\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001"+
		"\u0003\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001"+
		"\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0003"+
		"\u0004;\b\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0001"+
		"\u0004\u0001\u0004\u0001\u0004\u0001\u0004\u0003\u0004E\b\u0004\u0001"+
		"\u0004\u0003\u0004H\b\u0004\u0001\u0005\u0001\u0005\u0003\u0005L\b\u0005"+
		"\u0001\u0005\u0001\u0005\u0001\u0005\u0003\u0005Q\b\u0005\u0005\u0005"+
		"S\b\u0005\n\u0005\f\u0005V\t\u0005\u0003\u0005X\b\u0005\u0001\u0006\u0001"+
		"\u0006\u0001\u0006\u0001\u0006\u0001\u0006\u0000\u0000\u0007\u0000\u0002"+
		"\u0004\u0006\b\n\f\u0000\u0000e\u0000\u001e\u0001\u0000\u0000\u0000\u0002"+
		" \u0001\u0000\u0000\u0000\u0004%\u0001\u0000\u0000\u0000\u0006*\u0001"+
		"\u0000\u0000\u0000\bG\u0001\u0000\u0000\u0000\nW\u0001\u0000\u0000\u0000"+
		"\fY\u0001\u0000\u0000\u0000\u000e\u001f\u0003\b\u0004\u0000\u000f\u0018"+
		"\u0005\u0001\u0000\u0000\u0010\u0015\u0003\u0000\u0000\u0000\u0011\u0012"+
		"\u0005\u0002\u0000\u0000\u0012\u0014\u0003\u0000\u0000\u0000\u0013\u0011"+
		"\u0001\u0000\u0000\u0000\u0014\u0017\u0001\u0000\u0000\u0000\u0015\u0013"+
		"\u0001\u0000\u0000\u0000\u0015\u0016\u0001\u0000\u0000\u0000\u0016\u0019"+
		"\u0001\u0000\u0000\u0000\u0017\u0015\u0001\u0000\u0000\u0000\u0018\u0010"+
		"\u0001\u0000\u0000\u0000\u0018\u0019\u0001\u0000\u0000\u0000\u0019\u001a"+
		"\u0001\u0000\u0000\u0000\u001a\u001b\u0005\u0003\u0000\u0000\u001b\u001c"+
		"\u0005\u0004\u0000\u0000\u001c\u001f\u0003\u0000\u0000\u0000\u001d\u001f"+
		"\u0005\r\u0000\u0000\u001e\u000e\u0001\u0000\u0000\u0000\u001e\u000f\u0001"+
		"\u0000\u0000\u0000\u001e\u001d\u0001\u0000\u0000\u0000\u001f\u0001\u0001"+
		"\u0000\u0000\u0000 !\u0005\u0005\u0000\u0000!\"\u0005\u0006\u0000\u0000"+
		"\"#\u0003\n\u0005\u0000#$\u0005\u0007\u0000\u0000$\u0003\u0001\u0000\u0000"+
		"\u0000%&\u0005\b\u0000\u0000&\'\u0005\u0006\u0000\u0000\'(\u0003\n\u0005"+
		"\u0000()\u0005\u0007\u0000\u0000)\u0005\u0001\u0000\u0000\u0000*+\u0005"+
		"\t\u0000\u0000+,\u0005\u0006\u0000\u0000,-\u0003\n\u0005\u0000-.\u0005"+
		"\u0007\u0000\u0000.\u0007\u0001\u0000\u0000\u0000/H\u0003\u0002\u0001"+
		"\u00000H\u0003\u0004\u0002\u00001H\u0003\u0006\u0003\u000023\u0003\u0002"+
		"\u0001\u000034\u0005\n\u0000\u000045\u0003\u0004\u0002\u00005;\u0001\u0000"+
		"\u0000\u000067\u0003\u0004\u0002\u000078\u0005\n\u0000\u000089\u0003\u0002"+
		"\u0001\u00009;\u0001\u0000\u0000\u0000:2\u0001\u0000\u0000\u0000:6\u0001"+
		"\u0000\u0000\u0000;H\u0001\u0000\u0000\u0000<=\u0003\u0002\u0001\u0000"+
		"=>\u0005\n\u0000\u0000>?\u0003\u0006\u0003\u0000?E\u0001\u0000\u0000\u0000"+
		"@A\u0003\u0004\u0002\u0000AB\u0005\n\u0000\u0000BC\u0003\u0006\u0003\u0000"+
		"CE\u0001\u0000\u0000\u0000D<\u0001\u0000\u0000\u0000D@\u0001\u0000\u0000"+
		"\u0000EH\u0001\u0000\u0000\u0000FH\u0005\u000b\u0000\u0000G/\u0001\u0000"+
		"\u0000\u0000G0\u0001\u0000\u0000\u0000G1\u0001\u0000\u0000\u0000G:\u0001"+
		"\u0000\u0000\u0000GD\u0001\u0000\u0000\u0000GF\u0001\u0000\u0000\u0000"+
		"H\t\u0001\u0000\u0000\u0000IL\u0003\f\u0006\u0000JL\u0005\r\u0000\u0000"+
		"KI\u0001\u0000\u0000\u0000KJ\u0001\u0000\u0000\u0000LT\u0001\u0000\u0000"+
		"\u0000MP\u0005\u0002\u0000\u0000NQ\u0003\f\u0006\u0000OQ\u0005\r\u0000"+
		"\u0000PN\u0001\u0000\u0000\u0000PO\u0001\u0000\u0000\u0000QS\u0001\u0000"+
		"\u0000\u0000RM\u0001\u0000\u0000\u0000SV\u0001\u0000\u0000\u0000TR\u0001"+
		"\u0000\u0000\u0000TU\u0001\u0000\u0000\u0000UX\u0001\u0000\u0000\u0000"+
		"VT\u0001\u0000\u0000\u0000WK\u0001\u0000\u0000\u0000WX\u0001\u0000\u0000"+
		"\u0000X\u000b\u0001\u0000\u0000\u0000YZ\u0005\f\u0000\u0000Z[\u0005\r"+
		"\u0000\u0000[\\\u0005\f\u0000\u0000\\\r\u0001\u0000\u0000\u0000\n\u0015"+
		"\u0018\u001e:DGKPTW";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}