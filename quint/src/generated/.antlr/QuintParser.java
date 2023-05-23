// Generated from /home/gabriela/projects/quint/quint/src/generated/Quint.g4 by ANTLR 4.9.2
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class QuintParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.9.2", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, T__2=3, T__3=4, T__4=5, T__5=6, T__6=7, T__7=8, T__8=9, 
		T__9=10, T__10=11, T__11=12, T__12=13, T__13=14, T__14=15, T__15=16, T__16=17, 
		T__17=18, T__18=19, T__19=20, T__20=21, T__21=22, T__22=23, T__23=24, 
		T__24=25, T__25=26, T__26=27, T__27=28, T__28=29, T__29=30, T__30=31, 
		T__31=32, T__32=33, T__33=34, T__34=35, T__35=36, T__36=37, T__37=38, 
		STRING=39, BOOL=40, INT=41, AND=42, OR=43, IFF=44, IMPLIES=45, SET=46, 
		LIST=47, MAP=48, MATCH=49, PLUS=50, MINUS=51, MUL=52, DIV=53, MOD=54, 
		GT=55, LT=56, GE=57, LE=58, NE=59, EQ=60, ASGN=61, LPAREN=62, RPAREN=63, 
		IDENTIFIER=64, SIMPLE_IDENTIFIER=65, DOCCOMMENT=66, LINE_COMMENT=67, COMMENT=68, 
		WS=69;
	public static final int
		RULE_modules = 0, RULE_module = 1, RULE_documentedUnit = 2, RULE_unit = 3, 
		RULE_operDef = 4, RULE_nondetOperDef = 5, RULE_qualifier = 6, RULE_importMod = 7, 
		RULE_exportMod = 8, RULE_instanceMod = 9, RULE_moduleName = 10, RULE_name = 11, 
		RULE_qualifiedName = 12, RULE_fromSource = 13, RULE_type = 14, RULE_typeUnionRecOne = 15, 
		RULE_row = 16, RULE_expr = 17, RULE_unitOrExpr = 18, RULE_lambda = 19, 
		RULE_identOrHole = 20, RULE_parameter = 21, RULE_identOrStar = 22, RULE_argList = 23, 
		RULE_recElem = 24, RULE_normalCallName = 25, RULE_nameAfterDot = 26, RULE_operator = 27, 
		RULE_literal = 28;
	private static String[] makeRuleNames() {
		return new String[] {
			"modules", "module", "documentedUnit", "unit", "operDef", "nondetOperDef", 
			"qualifier", "importMod", "exportMod", "instanceMod", "moduleName", "name", 
			"qualifiedName", "fromSource", "type", "typeUnionRecOne", "row", "expr", 
			"unitOrExpr", "lambda", "identOrHole", "parameter", "identOrStar", "argList", 
			"recElem", "normalCallName", "nameAfterDot", "operator", "literal"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
			"'type'", "','", "';'", "'nondet'", "'val'", "'def'", "'pure'", "'action'", 
			"'run'", "'temporal'", "'import'", "'.'", "'from'", "'as'", "'export'", 
			"'->'", "'=>'", "'['", "']'", "'int'", "'str'", "'bool'", "'|'", "'^'", 
			"'''", "'all'", "'any'", "'if'", "'else'", "'_'", "'...'", null, null, 
			null, "'and'", "'or'", "'iff'", "'implies'", "'Set'", "'List'", "'Map'", 
			"'match'", "'+'", "'-'", "'*'", "'/'", "'%'", "'>'", "'<'", "'>='", "'<='", 
			"'!='", "'=='", "'='", "'('", "')'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, null, null, null, null, null, null, null, null, null, null, null, 
			null, null, null, null, null, null, null, null, null, null, null, null, 
			null, null, null, null, null, null, null, null, null, null, null, null, 
			null, null, null, "STRING", "BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", 
			"SET", "LIST", "MAP", "MATCH", "PLUS", "MINUS", "MUL", "DIV", "MOD", 
			"GT", "LT", "GE", "LE", "NE", "EQ", "ASGN", "LPAREN", "RPAREN", "IDENTIFIER", 
			"SIMPLE_IDENTIFIER", "DOCCOMMENT", "LINE_COMMENT", "COMMENT", "WS"
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
	public String getGrammarFileName() { return "Quint.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public QuintParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	public static class ModulesContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(QuintParser.EOF, 0); }
		public List<ModuleContext> module() {
			return getRuleContexts(ModuleContext.class);
		}
		public ModuleContext module(int i) {
			return getRuleContext(ModuleContext.class,i);
		}
		public ModulesContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_modules; }
	}

	public final ModulesContext modules() throws RecognitionException {
		ModulesContext _localctx = new ModulesContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_modules);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(59); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(58);
				module();
				}
				}
				setState(61); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( _la==T__0 || _la==DOCCOMMENT );
			setState(63);
			match(EOF);
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

	public static class ModuleContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public List<TerminalNode> DOCCOMMENT() { return getTokens(QuintParser.DOCCOMMENT); }
		public TerminalNode DOCCOMMENT(int i) {
			return getToken(QuintParser.DOCCOMMENT, i);
		}
		public List<DocumentedUnitContext> documentedUnit() {
			return getRuleContexts(DocumentedUnitContext.class);
		}
		public DocumentedUnitContext documentedUnit(int i) {
			return getRuleContext(DocumentedUnitContext.class,i);
		}
		public ModuleContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_module; }
	}

	public final ModuleContext module() throws RecognitionException {
		ModuleContext _localctx = new ModuleContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_module);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(68);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==DOCCOMMENT) {
				{
				{
				setState(65);
				match(DOCCOMMENT);
				}
				}
				setState(70);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(71);
			match(T__0);
			setState(72);
			match(IDENTIFIER);
			setState(73);
			match(T__1);
			setState(77);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (((((_la - 4)) & ~0x3f) == 0 && ((1L << (_la - 4)) & ((1L << (T__3 - 4)) | (1L << (T__5 - 4)) | (1L << (T__6 - 4)) | (1L << (T__7 - 4)) | (1L << (T__11 - 4)) | (1L << (T__12 - 4)) | (1L << (T__13 - 4)) | (1L << (T__14 - 4)) | (1L << (T__15 - 4)) | (1L << (T__16 - 4)) | (1L << (T__17 - 4)) | (1L << (T__21 - 4)) | (1L << (DOCCOMMENT - 4)))) != 0)) {
				{
				{
				setState(74);
				documentedUnit();
				}
				}
				setState(79);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(80);
			match(T__2);
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

	public static class DocumentedUnitContext extends ParserRuleContext {
		public UnitContext unit() {
			return getRuleContext(UnitContext.class,0);
		}
		public List<TerminalNode> DOCCOMMENT() { return getTokens(QuintParser.DOCCOMMENT); }
		public TerminalNode DOCCOMMENT(int i) {
			return getToken(QuintParser.DOCCOMMENT, i);
		}
		public DocumentedUnitContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_documentedUnit; }
	}

	public final DocumentedUnitContext documentedUnit() throws RecognitionException {
		DocumentedUnitContext _localctx = new DocumentedUnitContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_documentedUnit);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(85);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==DOCCOMMENT) {
				{
				{
				setState(82);
				match(DOCCOMMENT);
				}
				}
				setState(87);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			setState(88);
			unit();
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

	public static class UnitContext extends ParserRuleContext {
		public UnitContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_unit; }
	 
		public UnitContext() { }
		public void copyFrom(UnitContext ctx) {
			super.copyFrom(ctx);
		}
	}
	public static class ImportDefContext extends UnitContext {
		public ImportModContext importMod() {
			return getRuleContext(ImportModContext.class,0);
		}
		public ImportDefContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class InstanceContext extends UnitContext {
		public InstanceModContext instanceMod() {
			return getRuleContext(InstanceModContext.class,0);
		}
		public InstanceContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class ConstContext extends UnitContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public ConstContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class VarContext extends UnitContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public VarContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class OperContext extends UnitContext {
		public OperDefContext operDef() {
			return getRuleContext(OperDefContext.class,0);
		}
		public OperContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class AssumeContext extends UnitContext {
		public IdentOrHoleContext identOrHole() {
			return getRuleContext(IdentOrHoleContext.class,0);
		}
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public AssumeContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class TypedefContext extends UnitContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public TypedefContext(UnitContext ctx) { copyFrom(ctx); }
	}
	public static class ExportDefContext extends UnitContext {
		public ExportModContext exportMod() {
			return getRuleContext(ExportModContext.class,0);
		}
		public ExportDefContext(UnitContext ctx) { copyFrom(ctx); }
	}

	public final UnitContext unit() throws RecognitionException {
		UnitContext _localctx = new UnitContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_unit);
		try {
			setState(113);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(90);
				match(T__3);
				setState(91);
				match(IDENTIFIER);
				setState(92);
				match(T__4);
				setState(93);
				type(0);
				}
				break;
			case 2:
				_localctx = new VarContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(94);
				match(T__5);
				setState(95);
				match(IDENTIFIER);
				setState(96);
				match(T__4);
				setState(97);
				type(0);
				}
				break;
			case 3:
				_localctx = new AssumeContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(98);
				match(T__6);
				setState(99);
				identOrHole();
				setState(100);
				match(ASGN);
				setState(101);
				expr(0);
				}
				break;
			case 4:
				_localctx = new InstanceContext(_localctx);
				enterOuterAlt(_localctx, 4);
				{
				setState(103);
				instanceMod();
				}
				break;
			case 5:
				_localctx = new OperContext(_localctx);
				enterOuterAlt(_localctx, 5);
				{
				setState(104);
				operDef();
				}
				break;
			case 6:
				_localctx = new TypedefContext(_localctx);
				enterOuterAlt(_localctx, 6);
				{
				setState(105);
				match(T__7);
				setState(106);
				match(IDENTIFIER);
				}
				break;
			case 7:
				_localctx = new TypedefContext(_localctx);
				enterOuterAlt(_localctx, 7);
				{
				setState(107);
				match(T__7);
				setState(108);
				match(IDENTIFIER);
				setState(109);
				match(ASGN);
				setState(110);
				type(0);
				}
				break;
			case 8:
				_localctx = new ImportDefContext(_localctx);
				enterOuterAlt(_localctx, 8);
				{
				setState(111);
				importMod();
				}
				break;
			case 9:
				_localctx = new ExportDefContext(_localctx);
				enterOuterAlt(_localctx, 9);
				{
				setState(112);
				exportMod();
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

	public static class OperDefContext extends ParserRuleContext {
		public QualifierContext qualifier() {
			return getRuleContext(QualifierContext.class,0);
		}
		public NormalCallNameContext normalCallName() {
			return getRuleContext(NormalCallNameContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public List<ParameterContext> parameter() {
			return getRuleContexts(ParameterContext.class);
		}
		public ParameterContext parameter(int i) {
			return getRuleContext(ParameterContext.class,i);
		}
		public OperDefContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_operDef; }
	}

	public final OperDefContext operDef() throws RecognitionException {
		OperDefContext _localctx = new OperDefContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_operDef);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(115);
			qualifier();
			setState(116);
			normalCallName();
			setState(153);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,9,_ctx) ) {
			case 1:
				{
				setState(117);
				match(LPAREN);
				setState(126);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__36 || _la==IDENTIFIER) {
					{
					setState(118);
					parameter();
					setState(123);
					_errHandler.sync(this);
					_la = _input.LA(1);
					while (_la==T__8) {
						{
						{
						setState(119);
						match(T__8);
						setState(120);
						parameter();
						}
						}
						setState(125);
						_errHandler.sync(this);
						_la = _input.LA(1);
					}
					}
				}

				setState(128);
				match(RPAREN);
				setState(131);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__4) {
					{
					setState(129);
					match(T__4);
					setState(130);
					type(0);
					}
				}

				}
				break;
			case 2:
				{
				setState(133);
				match(T__4);
				setState(134);
				type(0);
				}
				break;
			case 3:
				{
				setState(135);
				match(LPAREN);
				{
				setState(136);
				parameter();
				setState(137);
				match(T__4);
				setState(138);
				type(0);
				setState(146);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==T__8) {
					{
					{
					setState(139);
					match(T__8);
					setState(140);
					parameter();
					setState(141);
					match(T__4);
					setState(142);
					type(0);
					}
					}
					setState(148);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
				setState(149);
				match(RPAREN);
				setState(150);
				match(T__4);
				setState(151);
				type(0);
				}
				break;
			}
			setState(157);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==ASGN) {
				{
				setState(155);
				match(ASGN);
				setState(156);
				expr(0);
				}
			}

			setState(160);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==T__9) {
				{
				setState(159);
				match(T__9);
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

	public static class NondetOperDefContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public NondetOperDefContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_nondetOperDef; }
	}

	public final NondetOperDefContext nondetOperDef() throws RecognitionException {
		NondetOperDefContext _localctx = new NondetOperDefContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_nondetOperDef);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(162);
			match(T__10);
			setState(163);
			match(IDENTIFIER);
			setState(166);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==T__4) {
				{
				setState(164);
				match(T__4);
				setState(165);
				type(0);
				}
			}

			setState(168);
			match(ASGN);
			setState(169);
			expr(0);
			setState(171);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==T__9) {
				{
				setState(170);
				match(T__9);
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

	public static class QualifierContext extends ParserRuleContext {
		public QualifierContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_qualifier; }
	}

	public final QualifierContext qualifier() throws RecognitionException {
		QualifierContext _localctx = new QualifierContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_qualifier);
		try {
			setState(182);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,14,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(173);
				match(T__11);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(174);
				match(T__12);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(175);
				match(T__13);
				setState(176);
				match(T__11);
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(177);
				match(T__13);
				setState(178);
				match(T__12);
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(179);
				match(T__14);
				}
				break;
			case 6:
				enterOuterAlt(_localctx, 6);
				{
				setState(180);
				match(T__15);
				}
				break;
			case 7:
				enterOuterAlt(_localctx, 7);
				{
				setState(181);
				match(T__16);
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

	public static class ImportModContext extends ParserRuleContext {
		public List<NameContext> name() {
			return getRuleContexts(NameContext.class);
		}
		public NameContext name(int i) {
			return getRuleContext(NameContext.class,i);
		}
		public IdentOrStarContext identOrStar() {
			return getRuleContext(IdentOrStarContext.class,0);
		}
		public FromSourceContext fromSource() {
			return getRuleContext(FromSourceContext.class,0);
		}
		public ImportModContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_importMod; }
	}

	public final ImportModContext importMod() throws RecognitionException {
		ImportModContext _localctx = new ImportModContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_importMod);
		int _la;
		try {
			setState(202);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,18,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(184);
				match(T__17);
				setState(185);
				name();
				setState(186);
				match(T__18);
				setState(187);
				identOrStar();
				setState(190);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__19) {
					{
					setState(188);
					match(T__19);
					setState(189);
					fromSource();
					}
				}

				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(192);
				match(T__17);
				setState(193);
				name();
				setState(196);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__20) {
					{
					setState(194);
					match(T__20);
					setState(195);
					name();
					}
				}

				setState(200);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__19) {
					{
					setState(198);
					match(T__19);
					setState(199);
					fromSource();
					}
				}

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

	public static class ExportModContext extends ParserRuleContext {
		public List<NameContext> name() {
			return getRuleContexts(NameContext.class);
		}
		public NameContext name(int i) {
			return getRuleContext(NameContext.class,i);
		}
		public IdentOrStarContext identOrStar() {
			return getRuleContext(IdentOrStarContext.class,0);
		}
		public ExportModContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_exportMod; }
	}

	public final ExportModContext exportMod() throws RecognitionException {
		ExportModContext _localctx = new ExportModContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_exportMod);
		int _la;
		try {
			setState(215);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,20,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(204);
				match(T__21);
				setState(205);
				name();
				setState(206);
				match(T__18);
				setState(207);
				identOrStar();
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(209);
				match(T__21);
				setState(210);
				name();
				setState(213);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__20) {
					{
					setState(211);
					match(T__20);
					setState(212);
					name();
					}
				}

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

	public static class InstanceModContext extends ParserRuleContext {
		public ModuleNameContext moduleName() {
			return getRuleContext(ModuleNameContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public TerminalNode MUL() { return getToken(QuintParser.MUL, 0); }
		public List<NameContext> name() {
			return getRuleContexts(NameContext.class);
		}
		public NameContext name(int i) {
			return getRuleContext(NameContext.class,i);
		}
		public List<TerminalNode> ASGN() { return getTokens(QuintParser.ASGN); }
		public TerminalNode ASGN(int i) {
			return getToken(QuintParser.ASGN, i);
		}
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public FromSourceContext fromSource() {
			return getRuleContext(FromSourceContext.class,0);
		}
		public QualifiedNameContext qualifiedName() {
			return getRuleContext(QualifiedNameContext.class,0);
		}
		public InstanceModContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_instanceMod; }
	}

	public final InstanceModContext instanceMod() throws RecognitionException {
		InstanceModContext _localctx = new InstanceModContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_instanceMod);
		int _la;
		try {
			setState(263);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,25,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(217);
				match(T__17);
				setState(218);
				moduleName();
				setState(219);
				match(LPAREN);
				{
				setState(220);
				name();
				setState(221);
				match(ASGN);
				setState(222);
				expr(0);
				setState(230);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==T__8) {
					{
					{
					setState(223);
					match(T__8);
					setState(224);
					name();
					setState(225);
					match(ASGN);
					setState(226);
					expr(0);
					}
					}
					setState(232);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
				setState(233);
				match(RPAREN);
				setState(234);
				match(T__18);
				setState(235);
				match(MUL);
				setState(238);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__19) {
					{
					setState(236);
					match(T__19);
					setState(237);
					fromSource();
					}
				}

				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(240);
				match(T__17);
				setState(241);
				moduleName();
				setState(242);
				match(LPAREN);
				{
				setState(243);
				name();
				setState(244);
				match(ASGN);
				setState(245);
				expr(0);
				setState(253);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==T__8) {
					{
					{
					setState(246);
					match(T__8);
					setState(247);
					name();
					setState(248);
					match(ASGN);
					setState(249);
					expr(0);
					}
					}
					setState(255);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				}
				setState(256);
				match(RPAREN);
				setState(257);
				match(T__20);
				setState(258);
				qualifiedName();
				setState(261);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__19) {
					{
					setState(259);
					match(T__19);
					setState(260);
					fromSource();
					}
				}

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

	public static class ModuleNameContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public ModuleNameContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_moduleName; }
	}

	public final ModuleNameContext moduleName() throws RecognitionException {
		ModuleNameContext _localctx = new ModuleNameContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_moduleName);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(265);
			match(IDENTIFIER);
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

	public static class NameContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public NameContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_name; }
	}

	public final NameContext name() throws RecognitionException {
		NameContext _localctx = new NameContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_name);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(267);
			match(IDENTIFIER);
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

	public static class QualifiedNameContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public QualifiedNameContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_qualifiedName; }
	}

	public final QualifiedNameContext qualifiedName() throws RecognitionException {
		QualifiedNameContext _localctx = new QualifiedNameContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_qualifiedName);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(269);
			match(IDENTIFIER);
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

	public static class FromSourceContext extends ParserRuleContext {
		public TerminalNode STRING() { return getToken(QuintParser.STRING, 0); }
		public FromSourceContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_fromSource; }
	}

	public final FromSourceContext fromSource() throws RecognitionException {
		FromSourceContext _localctx = new FromSourceContext(_ctx, getState());
		enterRule(_localctx, 26, RULE_fromSource);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(271);
			match(STRING);
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

	public static class TypeContext extends ParserRuleContext {
		public TypeContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_type; }
	 
		public TypeContext() { }
		public void copyFrom(TypeContext ctx) {
			super.copyFrom(ctx);
		}
	}
	public static class TypeRecContext extends TypeContext {
		public RowContext row() {
			return getRuleContext(RowContext.class,0);
		}
		public TypeRecContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeStrContext extends TypeContext {
		public TypeStrContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeIntContext extends TypeContext {
		public TypeIntContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeFunContext extends TypeContext {
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public TypeFunContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeListContext extends TypeContext {
		public TerminalNode LIST() { return getToken(QuintParser.LIST, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public TypeListContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeTupleContext extends TypeContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public TypeTupleContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeOperContext extends TypeContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public TypeOperContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeConstOrVarContext extends TypeContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TypeConstOrVarContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeParenContext extends TypeContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public TypeParenContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeBoolContext extends TypeContext {
		public TypeBoolContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeUnionRecContext extends TypeContext {
		public List<TypeUnionRecOneContext> typeUnionRecOne() {
			return getRuleContexts(TypeUnionRecOneContext.class);
		}
		public TypeUnionRecOneContext typeUnionRecOne(int i) {
			return getRuleContext(TypeUnionRecOneContext.class,i);
		}
		public TypeUnionRecContext(TypeContext ctx) { copyFrom(ctx); }
	}
	public static class TypeSetContext extends TypeContext {
		public TerminalNode SET() { return getToken(QuintParser.SET, 0); }
		public TypeContext type() {
			return getRuleContext(TypeContext.class,0);
		}
		public TypeSetContext(TypeContext ctx) { copyFrom(ctx); }
	}

	public final TypeContext type() throws RecognitionException {
		return type(0);
	}

	private TypeContext type(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		TypeContext _localctx = new TypeContext(_ctx, _parentState);
		TypeContext _prevctx = _localctx;
		int _startState = 28;
		enterRecursionRule(_localctx, 28, RULE_type, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(334);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,32,_ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(274);
				match(LPAREN);
				setState(283);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (((((_la - 2)) & ~0x3f) == 0 && ((1L << (_la - 2)) & ((1L << (T__1 - 2)) | (1L << (T__26 - 2)) | (1L << (T__27 - 2)) | (1L << (T__28 - 2)) | (1L << (T__29 - 2)) | (1L << (SET - 2)) | (1L << (LIST - 2)) | (1L << (LPAREN - 2)) | (1L << (IDENTIFIER - 2)))) != 0)) {
					{
					setState(275);
					type(0);
					setState(280);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,26,_ctx);
					while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
						if ( _alt==1 ) {
							{
							{
							setState(276);
							match(T__8);
							setState(277);
							type(0);
							}
							} 
						}
						setState(282);
						_errHandler.sync(this);
						_alt = getInterpreter().adaptivePredict(_input,26,_ctx);
					}
					}
				}

				setState(286);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(285);
					match(T__8);
					}
				}

				setState(288);
				match(RPAREN);
				setState(289);
				match(T__23);
				setState(290);
				type(11);
				}
				break;
			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(291);
				match(SET);
				setState(292);
				match(T__24);
				setState(293);
				type(0);
				setState(294);
				match(T__25);
				}
				break;
			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(296);
				match(LIST);
				setState(297);
				match(T__24);
				setState(298);
				type(0);
				setState(299);
				match(T__25);
				}
				break;
			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(301);
				match(LPAREN);
				setState(302);
				type(0);
				setState(303);
				match(T__8);
				setState(304);
				type(0);
				setState(309);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,29,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(305);
						match(T__8);
						setState(306);
						type(0);
						}
						} 
					}
					setState(311);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,29,_ctx);
				}
				setState(313);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(312);
					match(T__8);
					}
				}

				setState(315);
				match(RPAREN);
				}
				break;
			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(317);
				match(T__1);
				setState(318);
				row();
				setState(319);
				match(T__2);
				}
				break;
			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(322); 
				_errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						setState(321);
						typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					setState(324); 
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,31,_ctx);
				} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
				}
				break;
			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(326);
				match(T__26);
				}
				break;
			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(327);
				match(T__27);
				}
				break;
			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(328);
				match(T__28);
				}
				break;
			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(329);
				match(IDENTIFIER);
				}
				break;
			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(330);
				match(LPAREN);
				setState(331);
				type(0);
				setState(332);
				match(RPAREN);
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(344);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,34,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(342);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,33,_ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_type);
						setState(336);
						if (!(precpred(_ctx, 13))) throw new FailedPredicateException(this, "precpred(_ctx, 13)");
						setState(337);
						match(T__22);
						setState(338);
						type(13);
						}
						break;
					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_type);
						setState(339);
						if (!(precpred(_ctx, 12))) throw new FailedPredicateException(this, "precpred(_ctx, 12)");
						setState(340);
						match(T__23);
						setState(341);
						type(12);
						}
						break;
					}
					} 
				}
				setState(346);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,34,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public static class TypeUnionRecOneContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode STRING() { return getToken(QuintParser.STRING, 0); }
		public RowContext row() {
			return getRuleContext(RowContext.class,0);
		}
		public TypeUnionRecOneContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_typeUnionRecOne; }
	}

	public final TypeUnionRecOneContext typeUnionRecOne() throws RecognitionException {
		TypeUnionRecOneContext _localctx = new TypeUnionRecOneContext(_ctx, getState());
		enterRule(_localctx, 30, RULE_typeUnionRecOne);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(347);
			match(T__29);
			setState(348);
			match(T__1);
			setState(349);
			match(IDENTIFIER);
			setState(350);
			match(T__4);
			setState(351);
			match(STRING);
			setState(354);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,35,_ctx) ) {
			case 1:
				{
				setState(352);
				match(T__8);
				setState(353);
				row();
				}
				break;
			}
			setState(357);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==T__8) {
				{
				setState(356);
				match(T__8);
				}
			}

			setState(359);
			match(T__2);
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

	public static class RowContext extends ParserRuleContext {
		public List<TerminalNode> IDENTIFIER() { return getTokens(QuintParser.IDENTIFIER); }
		public TerminalNode IDENTIFIER(int i) {
			return getToken(QuintParser.IDENTIFIER, i);
		}
		public List<TypeContext> type() {
			return getRuleContexts(TypeContext.class);
		}
		public TypeContext type(int i) {
			return getRuleContext(TypeContext.class,i);
		}
		public RowContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_row; }
	}

	public final RowContext row() throws RecognitionException {
		RowContext _localctx = new RowContext(_ctx, getState());
		enterRule(_localctx, 32, RULE_row);
		int _la;
		try {
			int _alt;
			setState(385);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,40,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(369);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,37,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(362);
						match(IDENTIFIER);
						setState(363);
						match(T__4);
						setState(364);
						type(0);
						setState(365);
						match(T__8);
						}
						} 
					}
					setState(371);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,37,_ctx);
				}
				setState(381);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==IDENTIFIER) {
					{
					{
					setState(372);
					match(IDENTIFIER);
					setState(373);
					match(T__4);
					setState(374);
					type(0);
					}
					setState(379);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,38,_ctx) ) {
					case 1:
						{
						setState(376);
						match(T__8);
						}
						break;
					case 2:
						{
						setState(377);
						match(T__29);
						{
						setState(378);
						match(IDENTIFIER);
						}
						}
						break;
					}
					}
				}

				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(383);
				match(T__29);
				{
				setState(384);
				match(IDENTIFIER);
				}
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

	public static class ExprContext extends ParserRuleContext {
		public ExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_expr; }
	 
		public ExprContext() { }
		public void copyFrom(ExprContext ctx) {
			super.copyFrom(ctx);
		}
	}
	public static class LetInContext extends ExprContext {
		public OperDefContext operDef() {
			return getRuleContext(OperDefContext.class,0);
		}
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public LetInContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class UminusContext extends ExprContext {
		public TerminalNode MINUS() { return getToken(QuintParser.MINUS, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public UminusContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class OperAppContext extends ExprContext {
		public NormalCallNameContext normalCallName() {
			return getRuleContext(NormalCallNameContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public ArgListContext argList() {
			return getRuleContext(ArgListContext.class,0);
		}
		public OperAppContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ActionAnyContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public ActionAnyContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ErrorEqContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public ErrorEqContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class BracesContext extends ExprContext {
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public BracesContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class LambdaConsContext extends ExprContext {
		public LambdaContext lambda() {
			return getRuleContext(LambdaContext.class,0);
		}
		public LambdaConsContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class TupleContext extends ExprContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public TupleContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ParenContext extends ExprContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public ParenContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class MultDivContext extends ExprContext {
		public Token op;
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode MUL() { return getToken(QuintParser.MUL, 0); }
		public TerminalNode DIV() { return getToken(QuintParser.DIV, 0); }
		public TerminalNode MOD() { return getToken(QuintParser.MOD, 0); }
		public MultDivContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class AndContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode AND() { return getToken(QuintParser.AND, 0); }
		public AndContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class RecordContext extends ExprContext {
		public List<RecElemContext> recElem() {
			return getRuleContexts(RecElemContext.class);
		}
		public RecElemContext recElem(int i) {
			return getRuleContext(RecElemContext.class,i);
		}
		public RecordContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class PowContext extends ExprContext {
		public Token op;
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public PowContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ActionAllContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public ActionAllContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class DotCallContext extends ExprContext {
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public NameAfterDotContext nameAfterDot() {
			return getRuleContext(NameAfterDotContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public ArgListContext argList() {
			return getRuleContext(ArgListContext.class,0);
		}
		public DotCallContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class IfElseContext extends ExprContext {
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public IfElseContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class NondetContext extends ExprContext {
		public NondetOperDefContext nondetOperDef() {
			return getRuleContext(NondetOperDefContext.class,0);
		}
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public NondetContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class PlusMinusContext extends ExprContext {
		public Token op;
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode PLUS() { return getToken(QuintParser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(QuintParser.MINUS, 0); }
		public PlusMinusContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class OrContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode OR() { return getToken(QuintParser.OR, 0); }
		public OrContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class IffContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode IFF() { return getToken(QuintParser.IFF, 0); }
		public IffContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class MatchContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode MATCH() { return getToken(QuintParser.MATCH, 0); }
		public List<TerminalNode> STRING() { return getTokens(QuintParser.STRING); }
		public TerminalNode STRING(int i) {
			return getToken(QuintParser.STRING, i);
		}
		public List<ParameterContext> parameter() {
			return getRuleContexts(ParameterContext.class);
		}
		public ParameterContext parameter(int i) {
			return getRuleContext(ParameterContext.class,i);
		}
		public MatchContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class OrExprContext extends ExprContext {
		public TerminalNode OR() { return getToken(QuintParser.OR, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public OrExprContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ListContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public ListContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class PairContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public PairContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class AsgnContext extends ExprContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode ASGN() { return getToken(QuintParser.ASGN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public AsgnContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class LiteralOrIdContext extends ExprContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode INT() { return getToken(QuintParser.INT, 0); }
		public TerminalNode BOOL() { return getToken(QuintParser.BOOL, 0); }
		public TerminalNode STRING() { return getToken(QuintParser.STRING, 0); }
		public LiteralOrIdContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ListAppContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public ListAppContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class RelationsContext extends ExprContext {
		public Token op;
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode GT() { return getToken(QuintParser.GT, 0); }
		public TerminalNode LT() { return getToken(QuintParser.LT, 0); }
		public TerminalNode GE() { return getToken(QuintParser.GE, 0); }
		public TerminalNode LE() { return getToken(QuintParser.LE, 0); }
		public TerminalNode NE() { return getToken(QuintParser.NE, 0); }
		public TerminalNode EQ() { return getToken(QuintParser.EQ, 0); }
		public RelationsContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class ImpliesContext extends ExprContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public TerminalNode IMPLIES() { return getToken(QuintParser.IMPLIES, 0); }
		public ImpliesContext(ExprContext ctx) { copyFrom(ctx); }
	}
	public static class AndExprContext extends ExprContext {
		public TerminalNode AND() { return getToken(QuintParser.AND, 0); }
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public AndExprContext(ExprContext ctx) { copyFrom(ctx); }
	}

	public final ExprContext expr() throws RecognitionException {
		return expr(0);
	}

	private ExprContext expr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		ExprContext _localctx = new ExprContext(_ctx, _parentState);
		ExprContext _prevctx = _localctx;
		int _startState = 34;
		enterRecursionRule(_localctx, 34, RULE_expr, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(530);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,57,_ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(388);
				lambda();
				}
				break;
			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(389);
				normalCallName();
				setState(390);
				match(LPAREN);
				setState(392);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (((((_la - 2)) & ~0x3f) == 0 && ((1L << (_la - 2)) & ((1L << (T__1 - 2)) | (1L << (T__10 - 2)) | (1L << (T__11 - 2)) | (1L << (T__12 - 2)) | (1L << (T__13 - 2)) | (1L << (T__14 - 2)) | (1L << (T__15 - 2)) | (1L << (T__16 - 2)) | (1L << (T__24 - 2)) | (1L << (T__32 - 2)) | (1L << (T__33 - 2)) | (1L << (T__34 - 2)) | (1L << (T__36 - 2)) | (1L << (STRING - 2)) | (1L << (BOOL - 2)) | (1L << (INT - 2)) | (1L << (AND - 2)) | (1L << (OR - 2)) | (1L << (IFF - 2)) | (1L << (IMPLIES - 2)) | (1L << (SET - 2)) | (1L << (LIST - 2)) | (1L << (MAP - 2)) | (1L << (MINUS - 2)) | (1L << (LPAREN - 2)) | (1L << (IDENTIFIER - 2)))) != 0)) {
					{
					setState(391);
					argList();
					}
				}

				setState(394);
				match(RPAREN);
				}
				break;
			case 3:
				{
				_localctx = new UminusContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(396);
				match(MINUS);
				setState(397);
				expr(25);
				}
				break;
			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(398);
				match(IDENTIFIER);
				setState(399);
				match(T__31);
				setState(400);
				match(ASGN);
				setState(401);
				expr(21);
				}
				break;
			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(402);
				match(AND);
				setState(403);
				match(T__1);
				setState(404);
				expr(0);
				setState(409);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,42,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(405);
						match(T__8);
						setState(406);
						expr(0);
						}
						} 
					}
					setState(411);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,42,_ctx);
				}
				setState(413);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(412);
					match(T__8);
					}
				}

				setState(415);
				match(T__2);
				}
				break;
			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(417);
				match(OR);
				setState(418);
				match(T__1);
				setState(419);
				expr(0);
				setState(424);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,44,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(420);
						match(T__8);
						setState(421);
						expr(0);
						}
						} 
					}
					setState(426);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,44,_ctx);
				}
				setState(428);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(427);
					match(T__8);
					}
				}

				setState(430);
				match(T__2);
				}
				break;
			case 7:
				{
				_localctx = new ActionAllContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(432);
				match(T__32);
				setState(433);
				match(T__1);
				setState(434);
				expr(0);
				setState(439);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,46,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(435);
						match(T__8);
						setState(436);
						expr(0);
						}
						} 
					}
					setState(441);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,46,_ctx);
				}
				setState(443);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(442);
					match(T__8);
					}
				}

				setState(445);
				match(T__2);
				}
				break;
			case 8:
				{
				_localctx = new ActionAnyContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(447);
				match(T__33);
				setState(448);
				match(T__1);
				setState(449);
				expr(0);
				setState(454);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,48,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(450);
						match(T__8);
						setState(451);
						expr(0);
						}
						} 
					}
					setState(456);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,48,_ctx);
				}
				setState(458);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(457);
					match(T__8);
					}
				}

				setState(460);
				match(T__2);
				}
				break;
			case 9:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(462);
				_la = _input.LA(1);
				if ( !(((((_la - 39)) & ~0x3f) == 0 && ((1L << (_la - 39)) & ((1L << (STRING - 39)) | (1L << (BOOL - 39)) | (1L << (INT - 39)) | (1L << (IDENTIFIER - 39)))) != 0)) ) {
				_errHandler.recoverInline(this);
				}
				else {
					if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
					_errHandler.reportMatch(this);
					consume();
				}
				}
				break;
			case 10:
				{
				_localctx = new TupleContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(463);
				match(LPAREN);
				setState(464);
				expr(0);
				setState(465);
				match(T__8);
				setState(466);
				expr(0);
				setState(471);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,50,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(467);
						match(T__8);
						setState(468);
						expr(0);
						}
						} 
					}
					setState(473);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,50,_ctx);
				}
				setState(475);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(474);
					match(T__8);
					}
				}

				setState(477);
				match(RPAREN);
				}
				break;
			case 11:
				{
				_localctx = new RecordContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(479);
				match(T__1);
				setState(480);
				recElem();
				setState(485);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,52,_ctx);
				while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
					if ( _alt==1 ) {
						{
						{
						setState(481);
						match(T__8);
						setState(482);
						recElem();
						}
						} 
					}
					setState(487);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,52,_ctx);
				}
				setState(489);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(488);
					match(T__8);
					}
				}

				setState(491);
				match(T__2);
				}
				break;
			case 12:
				{
				_localctx = new ListContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(493);
				match(T__24);
				setState(502);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (((((_la - 2)) & ~0x3f) == 0 && ((1L << (_la - 2)) & ((1L << (T__1 - 2)) | (1L << (T__10 - 2)) | (1L << (T__11 - 2)) | (1L << (T__12 - 2)) | (1L << (T__13 - 2)) | (1L << (T__14 - 2)) | (1L << (T__15 - 2)) | (1L << (T__16 - 2)) | (1L << (T__24 - 2)) | (1L << (T__32 - 2)) | (1L << (T__33 - 2)) | (1L << (T__34 - 2)) | (1L << (T__36 - 2)) | (1L << (STRING - 2)) | (1L << (BOOL - 2)) | (1L << (INT - 2)) | (1L << (AND - 2)) | (1L << (OR - 2)) | (1L << (IFF - 2)) | (1L << (IMPLIES - 2)) | (1L << (SET - 2)) | (1L << (LIST - 2)) | (1L << (MAP - 2)) | (1L << (MINUS - 2)) | (1L << (LPAREN - 2)) | (1L << (IDENTIFIER - 2)))) != 0)) {
					{
					setState(494);
					expr(0);
					setState(499);
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,54,_ctx);
					while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
						if ( _alt==1 ) {
							{
							{
							setState(495);
							match(T__8);
							setState(496);
							expr(0);
							}
							} 
						}
						setState(501);
						_errHandler.sync(this);
						_alt = getInterpreter().adaptivePredict(_input,54,_ctx);
					}
					}
				}

				setState(505);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==T__8) {
					{
					setState(504);
					match(T__8);
					}
				}

				setState(507);
				match(T__25);
				}
				break;
			case 13:
				{
				_localctx = new IfElseContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(508);
				match(T__34);
				setState(509);
				match(LPAREN);
				setState(510);
				expr(0);
				setState(511);
				match(RPAREN);
				setState(512);
				expr(0);
				setState(513);
				match(T__35);
				setState(514);
				expr(5);
				}
				break;
			case 14:
				{
				_localctx = new LetInContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(516);
				operDef();
				setState(517);
				expr(4);
				}
				break;
			case 15:
				{
				_localctx = new NondetContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(519);
				nondetOperDef();
				setState(520);
				expr(3);
				}
				break;
			case 16:
				{
				_localctx = new ParenContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(522);
				match(LPAREN);
				setState(523);
				expr(0);
				setState(524);
				match(RPAREN);
				}
				break;
			case 17:
				{
				_localctx = new BracesContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(526);
				match(T__1);
				setState(527);
				expr(0);
				setState(528);
				match(T__2);
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(594);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,62,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(592);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,61,_ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(532);
						if (!(precpred(_ctx, 26))) throw new FailedPredicateException(this, "precpred(_ctx, 26)");
						setState(533);
						((PowContext)_localctx).op = match(T__30);
						setState(534);
						expr(26);
						}
						break;
					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(535);
						if (!(precpred(_ctx, 24))) throw new FailedPredicateException(this, "precpred(_ctx, 24)");
						setState(536);
						((MultDivContext)_localctx).op = _input.LT(1);
						_la = _input.LA(1);
						if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << MUL) | (1L << DIV) | (1L << MOD))) != 0)) ) {
							((MultDivContext)_localctx).op = (Token)_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(537);
						expr(25);
						}
						break;
					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(538);
						if (!(precpred(_ctx, 23))) throw new FailedPredicateException(this, "precpred(_ctx, 23)");
						setState(539);
						((PlusMinusContext)_localctx).op = _input.LT(1);
						_la = _input.LA(1);
						if ( !(_la==PLUS || _la==MINUS) ) {
							((PlusMinusContext)_localctx).op = (Token)_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(540);
						expr(24);
						}
						break;
					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(541);
						if (!(precpred(_ctx, 22))) throw new FailedPredicateException(this, "precpred(_ctx, 22)");
						setState(542);
						((RelationsContext)_localctx).op = _input.LT(1);
						_la = _input.LA(1);
						if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << GT) | (1L << LT) | (1L << GE) | (1L << LE) | (1L << NE) | (1L << EQ))) != 0)) ) {
							((RelationsContext)_localctx).op = (Token)_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(543);
						expr(23);
						}
						break;
					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(544);
						if (!(precpred(_ctx, 20))) throw new FailedPredicateException(this, "precpred(_ctx, 20)");
						setState(545);
						match(ASGN);
						setState(546);
						expr(21);

						                            const m = "QNT006: unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;
					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(549);
						if (!(precpred(_ctx, 18))) throw new FailedPredicateException(this, "precpred(_ctx, 18)");
						setState(550);
						match(AND);
						setState(551);
						expr(19);
						}
						break;
					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(552);
						if (!(precpred(_ctx, 16))) throw new FailedPredicateException(this, "precpred(_ctx, 16)");
						setState(553);
						match(OR);
						setState(554);
						expr(17);
						}
						break;
					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(555);
						if (!(precpred(_ctx, 15))) throw new FailedPredicateException(this, "precpred(_ctx, 15)");
						setState(556);
						match(IFF);
						setState(557);
						expr(16);
						}
						break;
					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(558);
						if (!(precpred(_ctx, 14))) throw new FailedPredicateException(this, "precpred(_ctx, 14)");
						setState(559);
						match(IMPLIES);
						setState(560);
						expr(15);
						}
						break;
					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(561);
						if (!(precpred(_ctx, 8))) throw new FailedPredicateException(this, "precpred(_ctx, 8)");
						setState(562);
						match(T__22);
						setState(563);
						expr(9);
						}
						break;
					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(564);
						if (!(precpred(_ctx, 30))) throw new FailedPredicateException(this, "precpred(_ctx, 30)");
						setState(565);
						match(T__18);
						setState(566);
						nameAfterDot();
						setState(572);
						_errHandler.sync(this);
						switch ( getInterpreter().adaptivePredict(_input,59,_ctx) ) {
						case 1:
							{
							setState(567);
							match(LPAREN);
							setState(569);
							_errHandler.sync(this);
							_la = _input.LA(1);
							if (((((_la - 2)) & ~0x3f) == 0 && ((1L << (_la - 2)) & ((1L << (T__1 - 2)) | (1L << (T__10 - 2)) | (1L << (T__11 - 2)) | (1L << (T__12 - 2)) | (1L << (T__13 - 2)) | (1L << (T__14 - 2)) | (1L << (T__15 - 2)) | (1L << (T__16 - 2)) | (1L << (T__24 - 2)) | (1L << (T__32 - 2)) | (1L << (T__33 - 2)) | (1L << (T__34 - 2)) | (1L << (T__36 - 2)) | (1L << (STRING - 2)) | (1L << (BOOL - 2)) | (1L << (INT - 2)) | (1L << (AND - 2)) | (1L << (OR - 2)) | (1L << (IFF - 2)) | (1L << (IMPLIES - 2)) | (1L << (SET - 2)) | (1L << (LIST - 2)) | (1L << (MAP - 2)) | (1L << (MINUS - 2)) | (1L << (LPAREN - 2)) | (1L << (IDENTIFIER - 2)))) != 0)) {
								{
								setState(568);
								argList();
								}
							}

							setState(571);
							match(RPAREN);
							}
							break;
						}
						}
						break;
					case 12:
						{
						_localctx = new ListAppContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(574);
						if (!(precpred(_ctx, 27))) throw new FailedPredicateException(this, "precpred(_ctx, 27)");
						setState(575);
						match(T__24);
						setState(576);
						expr(0);
						setState(577);
						match(T__25);
						}
						break;
					case 13:
						{
						_localctx = new MatchContext(new ExprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_expr);
						setState(579);
						if (!(precpred(_ctx, 13))) throw new FailedPredicateException(this, "precpred(_ctx, 13)");
						setState(580);
						match(MATCH);
						setState(588); 
						_errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								setState(581);
								match(T__29);
								setState(582);
								match(STRING);
								setState(583);
								match(T__4);
								setState(584);
								parameter();
								setState(585);
								match(T__23);
								setState(586);
								expr(0);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							setState(590); 
							_errHandler.sync(this);
							_alt = getInterpreter().adaptivePredict(_input,60,_ctx);
						} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
						}
						break;
					}
					} 
				}
				setState(596);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,62,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public static class UnitOrExprContext extends ParserRuleContext {
		public UnitContext unit() {
			return getRuleContext(UnitContext.class,0);
		}
		public TerminalNode EOF() { return getToken(QuintParser.EOF, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode DOCCOMMENT() { return getToken(QuintParser.DOCCOMMENT, 0); }
		public UnitOrExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_unitOrExpr; }
	}

	public final UnitOrExprContext unitOrExpr() throws RecognitionException {
		UnitOrExprContext _localctx = new UnitOrExprContext(_ctx, getState());
		enterRule(_localctx, 36, RULE_unitOrExpr);
		try {
			setState(606);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,63,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(597);
				unit();
				setState(598);
				match(EOF);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(600);
				expr(0);
				setState(601);
				match(EOF);
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(603);
				match(DOCCOMMENT);
				setState(604);
				match(EOF);
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(605);
				match(EOF);
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

	public static class LambdaContext extends ParserRuleContext {
		public List<ParameterContext> parameter() {
			return getRuleContexts(ParameterContext.class);
		}
		public ParameterContext parameter(int i) {
			return getRuleContext(ParameterContext.class,i);
		}
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode LPAREN() { return getToken(QuintParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(QuintParser.RPAREN, 0); }
		public LambdaContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_lambda; }
	}

	public final LambdaContext lambda() throws RecognitionException {
		LambdaContext _localctx = new LambdaContext(_ctx, getState());
		enterRule(_localctx, 38, RULE_lambda);
		int _la;
		try {
			setState(625);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case T__36:
			case IDENTIFIER:
				enterOuterAlt(_localctx, 1);
				{
				setState(608);
				parameter();
				setState(609);
				match(T__23);
				setState(610);
				expr(0);
				}
				break;
			case LPAREN:
				enterOuterAlt(_localctx, 2);
				{
				setState(612);
				match(LPAREN);
				setState(613);
				parameter();
				setState(618);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==T__8) {
					{
					{
					setState(614);
					match(T__8);
					setState(615);
					parameter();
					}
					}
					setState(620);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				setState(621);
				match(RPAREN);
				setState(622);
				match(T__23);
				setState(623);
				expr(0);
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

	public static class IdentOrHoleContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public IdentOrHoleContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_identOrHole; }
	}

	public final IdentOrHoleContext identOrHole() throws RecognitionException {
		IdentOrHoleContext _localctx = new IdentOrHoleContext(_ctx, getState());
		enterRule(_localctx, 40, RULE_identOrHole);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(627);
			_la = _input.LA(1);
			if ( !(_la==T__36 || _la==IDENTIFIER) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
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

	public static class ParameterContext extends ParserRuleContext {
		public IdentOrHoleContext identOrHole() {
			return getRuleContext(IdentOrHoleContext.class,0);
		}
		public ParameterContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_parameter; }
	}

	public final ParameterContext parameter() throws RecognitionException {
		ParameterContext _localctx = new ParameterContext(_ctx, getState());
		enterRule(_localctx, 42, RULE_parameter);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(629);
			identOrHole();
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

	public static class IdentOrStarContext extends ParserRuleContext {
		public TerminalNode MUL() { return getToken(QuintParser.MUL, 0); }
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public IdentOrStarContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_identOrStar; }
	}

	public final IdentOrStarContext identOrStar() throws RecognitionException {
		IdentOrStarContext _localctx = new IdentOrStarContext(_ctx, getState());
		enterRule(_localctx, 44, RULE_identOrStar);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(631);
			_la = _input.LA(1);
			if ( !(_la==MUL || _la==IDENTIFIER) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
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

	public static class ArgListContext extends ParserRuleContext {
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public ArgListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_argList; }
	}

	public final ArgListContext argList() throws RecognitionException {
		ArgListContext _localctx = new ArgListContext(_ctx, getState());
		enterRule(_localctx, 46, RULE_argList);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(633);
			expr(0);
			setState(638);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==T__8) {
				{
				{
				setState(634);
				match(T__8);
				setState(635);
				expr(0);
				}
				}
				setState(640);
				_errHandler.sync(this);
				_la = _input.LA(1);
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

	public static class RecElemContext extends ParserRuleContext {
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public RecElemContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_recElem; }
	}

	public final RecElemContext recElem() throws RecognitionException {
		RecElemContext _localctx = new RecElemContext(_ctx, getState());
		enterRule(_localctx, 48, RULE_recElem);
		try {
			setState(646);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case IDENTIFIER:
				enterOuterAlt(_localctx, 1);
				{
				setState(641);
				match(IDENTIFIER);
				setState(642);
				match(T__4);
				setState(643);
				expr(0);
				}
				break;
			case T__37:
				enterOuterAlt(_localctx, 2);
				{
				setState(644);
				match(T__37);
				setState(645);
				expr(0);
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

	public static class NormalCallNameContext extends ParserRuleContext {
		public Token op;
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode AND() { return getToken(QuintParser.AND, 0); }
		public TerminalNode OR() { return getToken(QuintParser.OR, 0); }
		public TerminalNode IFF() { return getToken(QuintParser.IFF, 0); }
		public TerminalNode IMPLIES() { return getToken(QuintParser.IMPLIES, 0); }
		public TerminalNode SET() { return getToken(QuintParser.SET, 0); }
		public TerminalNode LIST() { return getToken(QuintParser.LIST, 0); }
		public TerminalNode MAP() { return getToken(QuintParser.MAP, 0); }
		public NormalCallNameContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_normalCallName; }
	}

	public final NormalCallNameContext normalCallName() throws RecognitionException {
		NormalCallNameContext _localctx = new NormalCallNameContext(_ctx, getState());
		enterRule(_localctx, 50, RULE_normalCallName);
		int _la;
		try {
			setState(650);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case IDENTIFIER:
				enterOuterAlt(_localctx, 1);
				{
				setState(648);
				match(IDENTIFIER);
				}
				break;
			case AND:
			case OR:
			case IFF:
			case IMPLIES:
			case SET:
			case LIST:
			case MAP:
				enterOuterAlt(_localctx, 2);
				{
				setState(649);
				((NormalCallNameContext)_localctx).op = _input.LT(1);
				_la = _input.LA(1);
				if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << AND) | (1L << OR) | (1L << IFF) | (1L << IMPLIES) | (1L << SET) | (1L << LIST) | (1L << MAP))) != 0)) ) {
					((NormalCallNameContext)_localctx).op = (Token)_errHandler.recoverInline(this);
				}
				else {
					if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
					_errHandler.reportMatch(this);
					consume();
				}
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

	public static class NameAfterDotContext extends ParserRuleContext {
		public Token op;
		public TerminalNode IDENTIFIER() { return getToken(QuintParser.IDENTIFIER, 0); }
		public TerminalNode AND() { return getToken(QuintParser.AND, 0); }
		public TerminalNode OR() { return getToken(QuintParser.OR, 0); }
		public TerminalNode IFF() { return getToken(QuintParser.IFF, 0); }
		public TerminalNode IMPLIES() { return getToken(QuintParser.IMPLIES, 0); }
		public NameAfterDotContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_nameAfterDot; }
	}

	public final NameAfterDotContext nameAfterDot() throws RecognitionException {
		NameAfterDotContext _localctx = new NameAfterDotContext(_ctx, getState());
		enterRule(_localctx, 52, RULE_nameAfterDot);
		int _la;
		try {
			setState(654);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case IDENTIFIER:
				enterOuterAlt(_localctx, 1);
				{
				setState(652);
				match(IDENTIFIER);
				}
				break;
			case AND:
			case OR:
			case IFF:
			case IMPLIES:
				enterOuterAlt(_localctx, 2);
				{
				setState(653);
				((NameAfterDotContext)_localctx).op = _input.LT(1);
				_la = _input.LA(1);
				if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << AND) | (1L << OR) | (1L << IFF) | (1L << IMPLIES))) != 0)) ) {
					((NameAfterDotContext)_localctx).op = (Token)_errHandler.recoverInline(this);
				}
				else {
					if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
					_errHandler.reportMatch(this);
					consume();
				}
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

	public static class OperatorContext extends ParserRuleContext {
		public TerminalNode AND() { return getToken(QuintParser.AND, 0); }
		public TerminalNode OR() { return getToken(QuintParser.OR, 0); }
		public TerminalNode IFF() { return getToken(QuintParser.IFF, 0); }
		public TerminalNode IMPLIES() { return getToken(QuintParser.IMPLIES, 0); }
		public TerminalNode GT() { return getToken(QuintParser.GT, 0); }
		public TerminalNode LT() { return getToken(QuintParser.LT, 0); }
		public TerminalNode GE() { return getToken(QuintParser.GE, 0); }
		public TerminalNode LE() { return getToken(QuintParser.LE, 0); }
		public TerminalNode NE() { return getToken(QuintParser.NE, 0); }
		public TerminalNode EQ() { return getToken(QuintParser.EQ, 0); }
		public TerminalNode MUL() { return getToken(QuintParser.MUL, 0); }
		public TerminalNode DIV() { return getToken(QuintParser.DIV, 0); }
		public TerminalNode MOD() { return getToken(QuintParser.MOD, 0); }
		public TerminalNode PLUS() { return getToken(QuintParser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(QuintParser.MINUS, 0); }
		public OperatorContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_operator; }
	}

	public final OperatorContext operator() throws RecognitionException {
		OperatorContext _localctx = new OperatorContext(_ctx, getState());
		enterRule(_localctx, 54, RULE_operator);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(656);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << T__30) | (1L << AND) | (1L << OR) | (1L << IFF) | (1L << IMPLIES) | (1L << PLUS) | (1L << MINUS) | (1L << MUL) | (1L << DIV) | (1L << MOD) | (1L << GT) | (1L << LT) | (1L << GE) | (1L << LE) | (1L << NE) | (1L << EQ))) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
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

	public static class LiteralContext extends ParserRuleContext {
		public TerminalNode STRING() { return getToken(QuintParser.STRING, 0); }
		public TerminalNode BOOL() { return getToken(QuintParser.BOOL, 0); }
		public TerminalNode INT() { return getToken(QuintParser.INT, 0); }
		public LiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literal; }
	}

	public final LiteralContext literal() throws RecognitionException {
		LiteralContext _localctx = new LiteralContext(_ctx, getState());
		enterRule(_localctx, 56, RULE_literal);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(658);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << STRING) | (1L << BOOL) | (1L << INT))) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
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

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 14:
			return type_sempred((TypeContext)_localctx, predIndex);
		case 17:
			return expr_sempred((ExprContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean type_sempred(TypeContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 13);
		case 1:
			return precpred(_ctx, 12);
		}
		return true;
	}
	private boolean expr_sempred(ExprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 2:
			return precpred(_ctx, 26);
		case 3:
			return precpred(_ctx, 24);
		case 4:
			return precpred(_ctx, 23);
		case 5:
			return precpred(_ctx, 22);
		case 6:
			return precpred(_ctx, 20);
		case 7:
			return precpred(_ctx, 18);
		case 8:
			return precpred(_ctx, 16);
		case 9:
			return precpred(_ctx, 15);
		case 10:
			return precpred(_ctx, 14);
		case 11:
			return precpred(_ctx, 8);
		case 12:
			return precpred(_ctx, 30);
		case 13:
			return precpred(_ctx, 27);
		case 14:
			return precpred(_ctx, 13);
		}
		return true;
	}

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\3G\u0297\4\2\t\2\4"+
		"\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t\n\4\13\t"+
		"\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20\t\20\4\21\t\21\4\22\t\22"+
		"\4\23\t\23\4\24\t\24\4\25\t\25\4\26\t\26\4\27\t\27\4\30\t\30\4\31\t\31"+
		"\4\32\t\32\4\33\t\33\4\34\t\34\4\35\t\35\4\36\t\36\3\2\6\2>\n\2\r\2\16"+
		"\2?\3\2\3\2\3\3\7\3E\n\3\f\3\16\3H\13\3\3\3\3\3\3\3\3\3\7\3N\n\3\f\3\16"+
		"\3Q\13\3\3\3\3\3\3\4\7\4V\n\4\f\4\16\4Y\13\4\3\4\3\4\3\5\3\5\3\5\3\5\3"+
		"\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5"+
		"\3\5\5\5t\n\5\3\6\3\6\3\6\3\6\3\6\3\6\7\6|\n\6\f\6\16\6\177\13\6\5\6\u0081"+
		"\n\6\3\6\3\6\3\6\5\6\u0086\n\6\3\6\3\6\3\6\3\6\3\6\3\6\3\6\3\6\3\6\3\6"+
		"\3\6\7\6\u0093\n\6\f\6\16\6\u0096\13\6\3\6\3\6\3\6\3\6\5\6\u009c\n\6\3"+
		"\6\3\6\5\6\u00a0\n\6\3\6\5\6\u00a3\n\6\3\7\3\7\3\7\3\7\5\7\u00a9\n\7\3"+
		"\7\3\7\3\7\5\7\u00ae\n\7\3\b\3\b\3\b\3\b\3\b\3\b\3\b\3\b\3\b\5\b\u00b9"+
		"\n\b\3\t\3\t\3\t\3\t\3\t\3\t\5\t\u00c1\n\t\3\t\3\t\3\t\3\t\5\t\u00c7\n"+
		"\t\3\t\3\t\5\t\u00cb\n\t\5\t\u00cd\n\t\3\n\3\n\3\n\3\n\3\n\3\n\3\n\3\n"+
		"\3\n\5\n\u00d8\n\n\5\n\u00da\n\n\3\13\3\13\3\13\3\13\3\13\3\13\3\13\3"+
		"\13\3\13\3\13\3\13\7\13\u00e7\n\13\f\13\16\13\u00ea\13\13\3\13\3\13\3"+
		"\13\3\13\3\13\5\13\u00f1\n\13\3\13\3\13\3\13\3\13\3\13\3\13\3\13\3\13"+
		"\3\13\3\13\3\13\7\13\u00fe\n\13\f\13\16\13\u0101\13\13\3\13\3\13\3\13"+
		"\3\13\3\13\5\13\u0108\n\13\5\13\u010a\n\13\3\f\3\f\3\r\3\r\3\16\3\16\3"+
		"\17\3\17\3\20\3\20\3\20\3\20\3\20\7\20\u0119\n\20\f\20\16\20\u011c\13"+
		"\20\5\20\u011e\n\20\3\20\5\20\u0121\n\20\3\20\3\20\3\20\3\20\3\20\3\20"+
		"\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\3\20\7\20"+
		"\u0136\n\20\f\20\16\20\u0139\13\20\3\20\5\20\u013c\n\20\3\20\3\20\3\20"+
		"\3\20\3\20\3\20\3\20\6\20\u0145\n\20\r\20\16\20\u0146\3\20\3\20\3\20\3"+
		"\20\3\20\3\20\3\20\3\20\5\20\u0151\n\20\3\20\3\20\3\20\3\20\3\20\3\20"+
		"\7\20\u0159\n\20\f\20\16\20\u015c\13\20\3\21\3\21\3\21\3\21\3\21\3\21"+
		"\3\21\5\21\u0165\n\21\3\21\5\21\u0168\n\21\3\21\3\21\3\22\3\22\3\22\3"+
		"\22\3\22\3\22\7\22\u0172\n\22\f\22\16\22\u0175\13\22\3\22\3\22\3\22\3"+
		"\22\3\22\3\22\3\22\5\22\u017e\n\22\5\22\u0180\n\22\3\22\3\22\5\22\u0184"+
		"\n\22\3\23\3\23\3\23\3\23\3\23\5\23\u018b\n\23\3\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\7\23\u019a\n\23\f\23\16\23\u019d"+
		"\13\23\3\23\5\23\u01a0\n\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\7\23\u01a9"+
		"\n\23\f\23\16\23\u01ac\13\23\3\23\5\23\u01af\n\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\7\23\u01b8\n\23\f\23\16\23\u01bb\13\23\3\23\5\23\u01be"+
		"\n\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\7\23\u01c7\n\23\f\23\16\23\u01ca"+
		"\13\23\3\23\5\23\u01cd\n\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3"+
		"\23\7\23\u01d8\n\23\f\23\16\23\u01db\13\23\3\23\5\23\u01de\n\23\3\23\3"+
		"\23\3\23\3\23\3\23\3\23\7\23\u01e6\n\23\f\23\16\23\u01e9\13\23\3\23\5"+
		"\23\u01ec\n\23\3\23\3\23\3\23\3\23\3\23\3\23\7\23\u01f4\n\23\f\23\16\23"+
		"\u01f7\13\23\5\23\u01f9\n\23\3\23\5\23\u01fc\n\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\3\23\3\23\5\23\u0215\n\23\3\23\3\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23"+
		"\3\23\3\23\3\23\5\23\u023c\n\23\3\23\5\23\u023f\n\23\3\23\3\23\3\23\3"+
		"\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\3\23\6\23\u024f\n\23"+
		"\r\23\16\23\u0250\7\23\u0253\n\23\f\23\16\23\u0256\13\23\3\24\3\24\3\24"+
		"\3\24\3\24\3\24\3\24\3\24\3\24\5\24\u0261\n\24\3\25\3\25\3\25\3\25\3\25"+
		"\3\25\3\25\3\25\7\25\u026b\n\25\f\25\16\25\u026e\13\25\3\25\3\25\3\25"+
		"\3\25\5\25\u0274\n\25\3\26\3\26\3\27\3\27\3\30\3\30\3\31\3\31\3\31\7\31"+
		"\u027f\n\31\f\31\16\31\u0282\13\31\3\32\3\32\3\32\3\32\3\32\5\32\u0289"+
		"\n\32\3\33\3\33\5\33\u028d\n\33\3\34\3\34\5\34\u0291\n\34\3\35\3\35\3"+
		"\36\3\36\3\36\2\4\36$\37\2\4\6\b\n\f\16\20\22\24\26\30\32\34\36 \"$&("+
		"*,.\60\62\64\668:\2\f\4\2)+BB\3\2\668\3\2\64\65\3\29>\4\2\'\'BB\4\2\66"+
		"\66BB\3\2,\62\3\2,/\5\2!!,/\64>\3\2)+\2\u02f4\2=\3\2\2\2\4F\3\2\2\2\6"+
		"W\3\2\2\2\bs\3\2\2\2\nu\3\2\2\2\f\u00a4\3\2\2\2\16\u00b8\3\2\2\2\20\u00cc"+
		"\3\2\2\2\22\u00d9\3\2\2\2\24\u0109\3\2\2\2\26\u010b\3\2\2\2\30\u010d\3"+
		"\2\2\2\32\u010f\3\2\2\2\34\u0111\3\2\2\2\36\u0150\3\2\2\2 \u015d\3\2\2"+
		"\2\"\u0183\3\2\2\2$\u0214\3\2\2\2&\u0260\3\2\2\2(\u0273\3\2\2\2*\u0275"+
		"\3\2\2\2,\u0277\3\2\2\2.\u0279\3\2\2\2\60\u027b\3\2\2\2\62\u0288\3\2\2"+
		"\2\64\u028c\3\2\2\2\66\u0290\3\2\2\28\u0292\3\2\2\2:\u0294\3\2\2\2<>\5"+
		"\4\3\2=<\3\2\2\2>?\3\2\2\2?=\3\2\2\2?@\3\2\2\2@A\3\2\2\2AB\7\2\2\3B\3"+
		"\3\2\2\2CE\7D\2\2DC\3\2\2\2EH\3\2\2\2FD\3\2\2\2FG\3\2\2\2GI\3\2\2\2HF"+
		"\3\2\2\2IJ\7\3\2\2JK\7B\2\2KO\7\4\2\2LN\5\6\4\2ML\3\2\2\2NQ\3\2\2\2OM"+
		"\3\2\2\2OP\3\2\2\2PR\3\2\2\2QO\3\2\2\2RS\7\5\2\2S\5\3\2\2\2TV\7D\2\2U"+
		"T\3\2\2\2VY\3\2\2\2WU\3\2\2\2WX\3\2\2\2XZ\3\2\2\2YW\3\2\2\2Z[\5\b\5\2"+
		"[\7\3\2\2\2\\]\7\6\2\2]^\7B\2\2^_\7\7\2\2_t\5\36\20\2`a\7\b\2\2ab\7B\2"+
		"\2bc\7\7\2\2ct\5\36\20\2de\7\t\2\2ef\5*\26\2fg\7?\2\2gh\5$\23\2ht\3\2"+
		"\2\2it\5\24\13\2jt\5\n\6\2kl\7\n\2\2lt\7B\2\2mn\7\n\2\2no\7B\2\2op\7?"+
		"\2\2pt\5\36\20\2qt\5\20\t\2rt\5\22\n\2s\\\3\2\2\2s`\3\2\2\2sd\3\2\2\2"+
		"si\3\2\2\2sj\3\2\2\2sk\3\2\2\2sm\3\2\2\2sq\3\2\2\2sr\3\2\2\2t\t\3\2\2"+
		"\2uv\5\16\b\2v\u009b\5\64\33\2w\u0080\7@\2\2x}\5,\27\2yz\7\13\2\2z|\5"+
		",\27\2{y\3\2\2\2|\177\3\2\2\2}{\3\2\2\2}~\3\2\2\2~\u0081\3\2\2\2\177}"+
		"\3\2\2\2\u0080x\3\2\2\2\u0080\u0081\3\2\2\2\u0081\u0082\3\2\2\2\u0082"+
		"\u0085\7A\2\2\u0083\u0084\7\7\2\2\u0084\u0086\5\36\20\2\u0085\u0083\3"+
		"\2\2\2\u0085\u0086\3\2\2\2\u0086\u009c\3\2\2\2\u0087\u0088\7\7\2\2\u0088"+
		"\u009c\5\36\20\2\u0089\u008a\7@\2\2\u008a\u008b\5,\27\2\u008b\u008c\7"+
		"\7\2\2\u008c\u0094\5\36\20\2\u008d\u008e\7\13\2\2\u008e\u008f\5,\27\2"+
		"\u008f\u0090\7\7\2\2\u0090\u0091\5\36\20\2\u0091\u0093\3\2\2\2\u0092\u008d"+
		"\3\2\2\2\u0093\u0096\3\2\2\2\u0094\u0092\3\2\2\2\u0094\u0095\3\2\2\2\u0095"+
		"\u0097\3\2\2\2\u0096\u0094\3\2\2\2\u0097\u0098\7A\2\2\u0098\u0099\7\7"+
		"\2\2\u0099\u009a\5\36\20\2\u009a\u009c\3\2\2\2\u009bw\3\2\2\2\u009b\u0087"+
		"\3\2\2\2\u009b\u0089\3\2\2\2\u009b\u009c\3\2\2\2\u009c\u009f\3\2\2\2\u009d"+
		"\u009e\7?\2\2\u009e\u00a0\5$\23\2\u009f\u009d\3\2\2\2\u009f\u00a0\3\2"+
		"\2\2\u00a0\u00a2\3\2\2\2\u00a1\u00a3\7\f\2\2\u00a2\u00a1\3\2\2\2\u00a2"+
		"\u00a3\3\2\2\2\u00a3\13\3\2\2\2\u00a4\u00a5\7\r\2\2\u00a5\u00a8\7B\2\2"+
		"\u00a6\u00a7\7\7\2\2\u00a7\u00a9\5\36\20\2\u00a8\u00a6\3\2\2\2\u00a8\u00a9"+
		"\3\2\2\2\u00a9\u00aa\3\2\2\2\u00aa\u00ab\7?\2\2\u00ab\u00ad\5$\23\2\u00ac"+
		"\u00ae\7\f\2\2\u00ad\u00ac\3\2\2\2\u00ad\u00ae\3\2\2\2\u00ae\r\3\2\2\2"+
		"\u00af\u00b9\7\16\2\2\u00b0\u00b9\7\17\2\2\u00b1\u00b2\7\20\2\2\u00b2"+
		"\u00b9\7\16\2\2\u00b3\u00b4\7\20\2\2\u00b4\u00b9\7\17\2\2\u00b5\u00b9"+
		"\7\21\2\2\u00b6\u00b9\7\22\2\2\u00b7\u00b9\7\23\2\2\u00b8\u00af\3\2\2"+
		"\2\u00b8\u00b0\3\2\2\2\u00b8\u00b1\3\2\2\2\u00b8\u00b3\3\2\2\2\u00b8\u00b5"+
		"\3\2\2\2\u00b8\u00b6\3\2\2\2\u00b8\u00b7\3\2\2\2\u00b9\17\3\2\2\2\u00ba"+
		"\u00bb\7\24\2\2\u00bb\u00bc\5\30\r\2\u00bc\u00bd\7\25\2\2\u00bd\u00c0"+
		"\5.\30\2\u00be\u00bf\7\26\2\2\u00bf\u00c1\5\34\17\2\u00c0\u00be\3\2\2"+
		"\2\u00c0\u00c1\3\2\2\2\u00c1\u00cd\3\2\2\2\u00c2\u00c3\7\24\2\2\u00c3"+
		"\u00c6\5\30\r\2\u00c4\u00c5\7\27\2\2\u00c5\u00c7\5\30\r\2\u00c6\u00c4"+
		"\3\2\2\2\u00c6\u00c7\3\2\2\2\u00c7\u00ca\3\2\2\2\u00c8\u00c9\7\26\2\2"+
		"\u00c9\u00cb\5\34\17\2\u00ca\u00c8\3\2\2\2\u00ca\u00cb\3\2\2\2\u00cb\u00cd"+
		"\3\2\2\2\u00cc\u00ba\3\2\2\2\u00cc\u00c2\3\2\2\2\u00cd\21\3\2\2\2\u00ce"+
		"\u00cf\7\30\2\2\u00cf\u00d0\5\30\r\2\u00d0\u00d1\7\25\2\2\u00d1\u00d2"+
		"\5.\30\2\u00d2\u00da\3\2\2\2\u00d3\u00d4\7\30\2\2\u00d4\u00d7\5\30\r\2"+
		"\u00d5\u00d6\7\27\2\2\u00d6\u00d8\5\30\r\2\u00d7\u00d5\3\2\2\2\u00d7\u00d8"+
		"\3\2\2\2\u00d8\u00da\3\2\2\2\u00d9\u00ce\3\2\2\2\u00d9\u00d3\3\2\2\2\u00da"+
		"\23\3\2\2\2\u00db\u00dc\7\24\2\2\u00dc\u00dd\5\26\f\2\u00dd\u00de\7@\2"+
		"\2\u00de\u00df\5\30\r\2\u00df\u00e0\7?\2\2\u00e0\u00e8\5$\23\2\u00e1\u00e2"+
		"\7\13\2\2\u00e2\u00e3\5\30\r\2\u00e3\u00e4\7?\2\2\u00e4\u00e5\5$\23\2"+
		"\u00e5\u00e7\3\2\2\2\u00e6\u00e1\3\2\2\2\u00e7\u00ea\3\2\2\2\u00e8\u00e6"+
		"\3\2\2\2\u00e8\u00e9\3\2\2\2\u00e9\u00eb\3\2\2\2\u00ea\u00e8\3\2\2\2\u00eb"+
		"\u00ec\7A\2\2\u00ec\u00ed\7\25\2\2\u00ed\u00f0\7\66\2\2\u00ee\u00ef\7"+
		"\26\2\2\u00ef\u00f1\5\34\17\2\u00f0\u00ee\3\2\2\2\u00f0\u00f1\3\2\2\2"+
		"\u00f1\u010a\3\2\2\2\u00f2\u00f3\7\24\2\2\u00f3\u00f4\5\26\f\2\u00f4\u00f5"+
		"\7@\2\2\u00f5\u00f6\5\30\r\2\u00f6\u00f7\7?\2\2\u00f7\u00ff\5$\23\2\u00f8"+
		"\u00f9\7\13\2\2\u00f9\u00fa\5\30\r\2\u00fa\u00fb\7?\2\2\u00fb\u00fc\5"+
		"$\23\2\u00fc\u00fe\3\2\2\2\u00fd\u00f8\3\2\2\2\u00fe\u0101\3\2\2\2\u00ff"+
		"\u00fd\3\2\2\2\u00ff\u0100\3\2\2\2\u0100\u0102\3\2\2\2\u0101\u00ff\3\2"+
		"\2\2\u0102\u0103\7A\2\2\u0103\u0104\7\27\2\2\u0104\u0107\5\32\16\2\u0105"+
		"\u0106\7\26\2\2\u0106\u0108\5\34\17\2\u0107\u0105\3\2\2\2\u0107\u0108"+
		"\3\2\2\2\u0108\u010a\3\2\2\2\u0109\u00db\3\2\2\2\u0109\u00f2\3\2\2\2\u010a"+
		"\25\3\2\2\2\u010b\u010c\7B\2\2\u010c\27\3\2\2\2\u010d\u010e\7B\2\2\u010e"+
		"\31\3\2\2\2\u010f\u0110\7B\2\2\u0110\33\3\2\2\2\u0111\u0112\7)\2\2\u0112"+
		"\35\3\2\2\2\u0113\u0114\b\20\1\2\u0114\u011d\7@\2\2\u0115\u011a\5\36\20"+
		"\2\u0116\u0117\7\13\2\2\u0117\u0119\5\36\20\2\u0118\u0116\3\2\2\2\u0119"+
		"\u011c\3\2\2\2\u011a\u0118\3\2\2\2\u011a\u011b\3\2\2\2\u011b\u011e\3\2"+
		"\2\2\u011c\u011a\3\2\2\2\u011d\u0115\3\2\2\2\u011d\u011e\3\2\2\2\u011e"+
		"\u0120\3\2\2\2\u011f\u0121\7\13\2\2\u0120\u011f\3\2\2\2\u0120\u0121\3"+
		"\2\2\2\u0121\u0122\3\2\2\2\u0122\u0123\7A\2\2\u0123\u0124\7\32\2\2\u0124"+
		"\u0151\5\36\20\r\u0125\u0126\7\60\2\2\u0126\u0127\7\33\2\2\u0127\u0128"+
		"\5\36\20\2\u0128\u0129\7\34\2\2\u0129\u0151\3\2\2\2\u012a\u012b\7\61\2"+
		"\2\u012b\u012c\7\33\2\2\u012c\u012d\5\36\20\2\u012d\u012e\7\34\2\2\u012e"+
		"\u0151\3\2\2\2\u012f\u0130\7@\2\2\u0130\u0131\5\36\20\2\u0131\u0132\7"+
		"\13\2\2\u0132\u0137\5\36\20\2\u0133\u0134\7\13\2\2\u0134\u0136\5\36\20"+
		"\2\u0135\u0133\3\2\2\2\u0136\u0139\3\2\2\2\u0137\u0135\3\2\2\2\u0137\u0138"+
		"\3\2\2\2\u0138\u013b\3\2\2\2\u0139\u0137\3\2\2\2\u013a\u013c\7\13\2\2"+
		"\u013b\u013a\3\2\2\2\u013b\u013c\3\2\2\2\u013c\u013d\3\2\2\2\u013d\u013e"+
		"\7A\2\2\u013e\u0151\3\2\2\2\u013f\u0140\7\4\2\2\u0140\u0141\5\"\22\2\u0141"+
		"\u0142\7\5\2\2\u0142\u0151\3\2\2\2\u0143\u0145\5 \21\2\u0144\u0143\3\2"+
		"\2\2\u0145\u0146\3\2\2\2\u0146\u0144\3\2\2\2\u0146\u0147\3\2\2\2\u0147"+
		"\u0151\3\2\2\2\u0148\u0151\7\35\2\2\u0149\u0151\7\36\2\2\u014a\u0151\7"+
		"\37\2\2\u014b\u0151\7B\2\2\u014c\u014d\7@\2\2\u014d\u014e\5\36\20\2\u014e"+
		"\u014f\7A\2\2\u014f\u0151\3\2\2\2\u0150\u0113\3\2\2\2\u0150\u0125\3\2"+
		"\2\2\u0150\u012a\3\2\2\2\u0150\u012f\3\2\2\2\u0150\u013f\3\2\2\2\u0150"+
		"\u0144\3\2\2\2\u0150\u0148\3\2\2\2\u0150\u0149\3\2\2\2\u0150\u014a\3\2"+
		"\2\2\u0150\u014b\3\2\2\2\u0150\u014c\3\2\2\2\u0151\u015a\3\2\2\2\u0152"+
		"\u0153\f\17\2\2\u0153\u0154\7\31\2\2\u0154\u0159\5\36\20\17\u0155\u0156"+
		"\f\16\2\2\u0156\u0157\7\32\2\2\u0157\u0159\5\36\20\16\u0158\u0152\3\2"+
		"\2\2\u0158\u0155\3\2\2\2\u0159\u015c\3\2\2\2\u015a\u0158\3\2\2\2\u015a"+
		"\u015b\3\2\2\2\u015b\37\3\2\2\2\u015c\u015a\3\2\2\2\u015d\u015e\7 \2\2"+
		"\u015e\u015f\7\4\2\2\u015f\u0160\7B\2\2\u0160\u0161\7\7\2\2\u0161\u0164"+
		"\7)\2\2\u0162\u0163\7\13\2\2\u0163\u0165\5\"\22\2\u0164\u0162\3\2\2\2"+
		"\u0164\u0165\3\2\2\2\u0165\u0167\3\2\2\2\u0166\u0168\7\13\2\2\u0167\u0166"+
		"\3\2\2\2\u0167\u0168\3\2\2\2\u0168\u0169\3\2\2\2\u0169\u016a\7\5\2\2\u016a"+
		"!\3\2\2\2\u016b\u0184\3\2\2\2\u016c\u016d\7B\2\2\u016d\u016e\7\7\2\2\u016e"+
		"\u016f\5\36\20\2\u016f\u0170\7\13\2\2\u0170\u0172\3\2\2\2\u0171\u016c"+
		"\3\2\2\2\u0172\u0175\3\2\2\2\u0173\u0171\3\2\2\2\u0173\u0174\3\2\2\2\u0174"+
		"\u017f\3\2\2\2\u0175\u0173\3\2\2\2\u0176\u0177\7B\2\2\u0177\u0178\7\7"+
		"\2\2\u0178\u0179\5\36\20\2\u0179\u017d\3\2\2\2\u017a\u017e\7\13\2\2\u017b"+
		"\u017c\7 \2\2\u017c\u017e\7B\2\2\u017d\u017a\3\2\2\2\u017d\u017b\3\2\2"+
		"\2\u017d\u017e\3\2\2\2\u017e\u0180\3\2\2\2\u017f\u0176\3\2\2\2\u017f\u0180"+
		"\3\2\2\2\u0180\u0184\3\2\2\2\u0181\u0182\7 \2\2\u0182\u0184\7B\2\2\u0183"+
		"\u016b\3\2\2\2\u0183\u0173\3\2\2\2\u0183\u0181\3\2\2\2\u0184#\3\2\2\2"+
		"\u0185\u0186\b\23\1\2\u0186\u0215\5(\25\2\u0187\u0188\5\64\33\2\u0188"+
		"\u018a\7@\2\2\u0189\u018b\5\60\31\2\u018a\u0189\3\2\2\2\u018a\u018b\3"+
		"\2\2\2\u018b\u018c\3\2\2\2\u018c\u018d\7A\2\2\u018d\u0215\3\2\2\2\u018e"+
		"\u018f\7\65\2\2\u018f\u0215\5$\23\33\u0190\u0191\7B\2\2\u0191\u0192\7"+
		"\"\2\2\u0192\u0193\7?\2\2\u0193\u0215\5$\23\27\u0194\u0195\7,\2\2\u0195"+
		"\u0196\7\4\2\2\u0196\u019b\5$\23\2\u0197\u0198\7\13\2\2\u0198\u019a\5"+
		"$\23\2\u0199\u0197\3\2\2\2\u019a\u019d\3\2\2\2\u019b\u0199\3\2\2\2\u019b"+
		"\u019c\3\2\2\2\u019c\u019f\3\2\2\2\u019d\u019b\3\2\2\2\u019e\u01a0\7\13"+
		"\2\2\u019f\u019e\3\2\2\2\u019f\u01a0\3\2\2\2\u01a0\u01a1\3\2\2\2\u01a1"+
		"\u01a2\7\5\2\2\u01a2\u0215\3\2\2\2\u01a3\u01a4\7-\2\2\u01a4\u01a5\7\4"+
		"\2\2\u01a5\u01aa\5$\23\2\u01a6\u01a7\7\13\2\2\u01a7\u01a9\5$\23\2\u01a8"+
		"\u01a6\3\2\2\2\u01a9\u01ac\3\2\2\2\u01aa\u01a8\3\2\2\2\u01aa\u01ab\3\2"+
		"\2\2\u01ab\u01ae\3\2\2\2\u01ac\u01aa\3\2\2\2\u01ad\u01af\7\13\2\2\u01ae"+
		"\u01ad\3\2\2\2\u01ae\u01af\3\2\2\2\u01af\u01b0\3\2\2\2\u01b0\u01b1\7\5"+
		"\2\2\u01b1\u0215\3\2\2\2\u01b2\u01b3\7#\2\2\u01b3\u01b4\7\4\2\2\u01b4"+
		"\u01b9\5$\23\2\u01b5\u01b6\7\13\2\2\u01b6\u01b8\5$\23\2\u01b7\u01b5\3"+
		"\2\2\2\u01b8\u01bb\3\2\2\2\u01b9\u01b7\3\2\2\2\u01b9\u01ba\3\2\2\2\u01ba"+
		"\u01bd\3\2\2\2\u01bb\u01b9\3\2\2\2\u01bc\u01be\7\13\2\2\u01bd\u01bc\3"+
		"\2\2\2\u01bd\u01be\3\2\2\2\u01be\u01bf\3\2\2\2\u01bf\u01c0\7\5\2\2\u01c0"+
		"\u0215\3\2\2\2\u01c1\u01c2\7$\2\2\u01c2\u01c3\7\4\2\2\u01c3\u01c8\5$\23"+
		"\2\u01c4\u01c5\7\13\2\2\u01c5\u01c7\5$\23\2\u01c6\u01c4\3\2\2\2\u01c7"+
		"\u01ca\3\2\2\2\u01c8\u01c6\3\2\2\2\u01c8\u01c9\3\2\2\2\u01c9\u01cc\3\2"+
		"\2\2\u01ca\u01c8\3\2\2\2\u01cb\u01cd\7\13\2\2\u01cc\u01cb\3\2\2\2\u01cc"+
		"\u01cd\3\2\2\2\u01cd\u01ce\3\2\2\2\u01ce\u01cf\7\5\2\2\u01cf\u0215\3\2"+
		"\2\2\u01d0\u0215\t\2\2\2\u01d1\u01d2\7@\2\2\u01d2\u01d3\5$\23\2\u01d3"+
		"\u01d4\7\13\2\2\u01d4\u01d9\5$\23\2\u01d5\u01d6\7\13\2\2\u01d6\u01d8\5"+
		"$\23\2\u01d7\u01d5\3\2\2\2\u01d8\u01db\3\2\2\2\u01d9\u01d7\3\2\2\2\u01d9"+
		"\u01da\3\2\2\2\u01da\u01dd\3\2\2\2\u01db\u01d9\3\2\2\2\u01dc\u01de\7\13"+
		"\2\2\u01dd\u01dc\3\2\2\2\u01dd\u01de\3\2\2\2\u01de\u01df\3\2\2\2\u01df"+
		"\u01e0\7A\2\2\u01e0\u0215\3\2\2\2\u01e1\u01e2\7\4\2\2\u01e2\u01e7\5\62"+
		"\32\2\u01e3\u01e4\7\13\2\2\u01e4\u01e6\5\62\32\2\u01e5\u01e3\3\2\2\2\u01e6"+
		"\u01e9\3\2\2\2\u01e7\u01e5\3\2\2\2\u01e7\u01e8\3\2\2\2\u01e8\u01eb\3\2"+
		"\2\2\u01e9\u01e7\3\2\2\2\u01ea\u01ec\7\13\2\2\u01eb\u01ea\3\2\2\2\u01eb"+
		"\u01ec\3\2\2\2\u01ec\u01ed\3\2\2\2\u01ed\u01ee\7\5\2\2\u01ee\u0215\3\2"+
		"\2\2\u01ef\u01f8\7\33\2\2\u01f0\u01f5\5$\23\2\u01f1\u01f2\7\13\2\2\u01f2"+
		"\u01f4\5$\23\2\u01f3\u01f1\3\2\2\2\u01f4\u01f7\3\2\2\2\u01f5\u01f3\3\2"+
		"\2\2\u01f5\u01f6\3\2\2\2\u01f6\u01f9\3\2\2\2\u01f7\u01f5\3\2\2\2\u01f8"+
		"\u01f0\3\2\2\2\u01f8\u01f9\3\2\2\2\u01f9\u01fb\3\2\2\2\u01fa\u01fc\7\13"+
		"\2\2\u01fb\u01fa\3\2\2\2\u01fb\u01fc\3\2\2\2\u01fc\u01fd\3\2\2\2\u01fd"+
		"\u0215\7\34\2\2\u01fe\u01ff\7%\2\2\u01ff\u0200\7@\2\2\u0200\u0201\5$\23"+
		"\2\u0201\u0202\7A\2\2\u0202\u0203\5$\23\2\u0203\u0204\7&\2\2\u0204\u0205"+
		"\5$\23\7\u0205\u0215\3\2\2\2\u0206\u0207\5\n\6\2\u0207\u0208\5$\23\6\u0208"+
		"\u0215\3\2\2\2\u0209\u020a\5\f\7\2\u020a\u020b\5$\23\5\u020b\u0215\3\2"+
		"\2\2\u020c\u020d\7@\2\2\u020d\u020e\5$\23\2\u020e\u020f\7A\2\2\u020f\u0215"+
		"\3\2\2\2\u0210\u0211\7\4\2\2\u0211\u0212\5$\23\2\u0212\u0213\7\5\2\2\u0213"+
		"\u0215\3\2\2\2\u0214\u0185\3\2\2\2\u0214\u0187\3\2\2\2\u0214\u018e\3\2"+
		"\2\2\u0214\u0190\3\2\2\2\u0214\u0194\3\2\2\2\u0214\u01a3\3\2\2\2\u0214"+
		"\u01b2\3\2\2\2\u0214\u01c1\3\2\2\2\u0214\u01d0\3\2\2\2\u0214\u01d1\3\2"+
		"\2\2\u0214\u01e1\3\2\2\2\u0214\u01ef\3\2\2\2\u0214\u01fe\3\2\2\2\u0214"+
		"\u0206\3\2\2\2\u0214\u0209\3\2\2\2\u0214\u020c\3\2\2\2\u0214\u0210\3\2"+
		"\2\2\u0215\u0254\3\2\2\2\u0216\u0217\f\34\2\2\u0217\u0218\7!\2\2\u0218"+
		"\u0253\5$\23\34\u0219\u021a\f\32\2\2\u021a\u021b\t\3\2\2\u021b\u0253\5"+
		"$\23\33\u021c\u021d\f\31\2\2\u021d\u021e\t\4\2\2\u021e\u0253\5$\23\32"+
		"\u021f\u0220\f\30\2\2\u0220\u0221\t\5\2\2\u0221\u0253\5$\23\31\u0222\u0223"+
		"\f\26\2\2\u0223\u0224\7?\2\2\u0224\u0225\5$\23\27\u0225\u0226\b\23\1\2"+
		"\u0226\u0253\3\2\2\2\u0227\u0228\f\24\2\2\u0228\u0229\7,\2\2\u0229\u0253"+
		"\5$\23\25\u022a\u022b\f\22\2\2\u022b\u022c\7-\2\2\u022c\u0253\5$\23\23"+
		"\u022d\u022e\f\21\2\2\u022e\u022f\7.\2\2\u022f\u0253\5$\23\22\u0230\u0231"+
		"\f\20\2\2\u0231\u0232\7/\2\2\u0232\u0253\5$\23\21\u0233\u0234\f\n\2\2"+
		"\u0234\u0235\7\31\2\2\u0235\u0253\5$\23\13\u0236\u0237\f \2\2\u0237\u0238"+
		"\7\25\2\2\u0238\u023e\5\66\34\2\u0239\u023b\7@\2\2\u023a\u023c\5\60\31"+
		"\2\u023b\u023a\3\2\2\2\u023b\u023c\3\2\2\2\u023c\u023d\3\2\2\2\u023d\u023f"+
		"\7A\2\2\u023e\u0239\3\2\2\2\u023e\u023f\3\2\2\2\u023f\u0253\3\2\2\2\u0240"+
		"\u0241\f\35\2\2\u0241\u0242\7\33\2\2\u0242\u0243\5$\23\2\u0243\u0244\7"+
		"\34\2\2\u0244\u0253\3\2\2\2\u0245\u0246\f\17\2\2\u0246\u024e\7\63\2\2"+
		"\u0247\u0248\7 \2\2\u0248\u0249\7)\2\2\u0249\u024a\7\7\2\2\u024a\u024b"+
		"\5,\27\2\u024b\u024c\7\32\2\2\u024c\u024d\5$\23\2\u024d\u024f\3\2\2\2"+
		"\u024e\u0247\3\2\2\2\u024f\u0250\3\2\2\2\u0250\u024e\3\2\2\2\u0250\u0251"+
		"\3\2\2\2\u0251\u0253\3\2\2\2\u0252\u0216\3\2\2\2\u0252\u0219\3\2\2\2\u0252"+
		"\u021c\3\2\2\2\u0252\u021f\3\2\2\2\u0252\u0222\3\2\2\2\u0252\u0227\3\2"+
		"\2\2\u0252\u022a\3\2\2\2\u0252\u022d\3\2\2\2\u0252\u0230\3\2\2\2\u0252"+
		"\u0233\3\2\2\2\u0252\u0236\3\2\2\2\u0252\u0240\3\2\2\2\u0252\u0245\3\2"+
		"\2\2\u0253\u0256\3\2\2\2\u0254\u0252\3\2\2\2\u0254\u0255\3\2\2\2\u0255"+
		"%\3\2\2\2\u0256\u0254\3\2\2\2\u0257\u0258\5\b\5\2\u0258\u0259\7\2\2\3"+
		"\u0259\u0261\3\2\2\2\u025a\u025b\5$\23\2\u025b\u025c\7\2\2\3\u025c\u0261"+
		"\3\2\2\2\u025d\u025e\7D\2\2\u025e\u0261\7\2\2\3\u025f\u0261\7\2\2\3\u0260"+
		"\u0257\3\2\2\2\u0260\u025a\3\2\2\2\u0260\u025d\3\2\2\2\u0260\u025f\3\2"+
		"\2\2\u0261\'\3\2\2\2\u0262\u0263\5,\27\2\u0263\u0264\7\32\2\2\u0264\u0265"+
		"\5$\23\2\u0265\u0274\3\2\2\2\u0266\u0267\7@\2\2\u0267\u026c\5,\27\2\u0268"+
		"\u0269\7\13\2\2\u0269\u026b\5,\27\2\u026a\u0268\3\2\2\2\u026b\u026e\3"+
		"\2\2\2\u026c\u026a\3\2\2\2\u026c\u026d\3\2\2\2\u026d\u026f\3\2\2\2\u026e"+
		"\u026c\3\2\2\2\u026f\u0270\7A\2\2\u0270\u0271\7\32\2\2\u0271\u0272\5$"+
		"\23\2\u0272\u0274\3\2\2\2\u0273\u0262\3\2\2\2\u0273\u0266\3\2\2\2\u0274"+
		")\3\2\2\2\u0275\u0276\t\6\2\2\u0276+\3\2\2\2\u0277\u0278\5*\26\2\u0278"+
		"-\3\2\2\2\u0279\u027a\t\7\2\2\u027a/\3\2\2\2\u027b\u0280\5$\23\2\u027c"+
		"\u027d\7\13\2\2\u027d\u027f\5$\23\2\u027e\u027c\3\2\2\2\u027f\u0282\3"+
		"\2\2\2\u0280\u027e\3\2\2\2\u0280\u0281\3\2\2\2\u0281\61\3\2\2\2\u0282"+
		"\u0280\3\2\2\2\u0283\u0284\7B\2\2\u0284\u0285\7\7\2\2\u0285\u0289\5$\23"+
		"\2\u0286\u0287\7(\2\2\u0287\u0289\5$\23\2\u0288\u0283\3\2\2\2\u0288\u0286"+
		"\3\2\2\2\u0289\63\3\2\2\2\u028a\u028d\7B\2\2\u028b\u028d\t\b\2\2\u028c"+
		"\u028a\3\2\2\2\u028c\u028b\3\2\2\2\u028d\65\3\2\2\2\u028e\u0291\7B\2\2"+
		"\u028f\u0291\t\t\2\2\u0290\u028e\3\2\2\2\u0290\u028f\3\2\2\2\u0291\67"+
		"\3\2\2\2\u0292\u0293\t\n\2\2\u02939\3\2\2\2\u0294\u0295\t\13\2\2\u0295"+
		";\3\2\2\2H?FOWs}\u0080\u0085\u0094\u009b\u009f\u00a2\u00a8\u00ad\u00b8"+
		"\u00c0\u00c6\u00ca\u00cc\u00d7\u00d9\u00e8\u00f0\u00ff\u0107\u0109\u011a"+
		"\u011d\u0120\u0137\u013b\u0146\u0150\u0158\u015a\u0164\u0167\u0173\u017d"+
		"\u017f\u0183\u018a\u019b\u019f\u01aa\u01ae\u01b9\u01bd\u01c8\u01cc\u01d9"+
		"\u01dd\u01e7\u01eb\u01f5\u01f8\u01fb\u0214\u023b\u023e\u0250\u0252\u0254"+
		"\u0260\u026c\u0273\u0280\u0288\u028c\u0290";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}