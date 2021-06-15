// Generated from ./src/parser/generated/Tnt.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { TntListener } from "./TntListener";
import { TntVisitor } from "./TntVisitor";


export class TntParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly T__39 = 40;
	public static readonly STRING = 41;
	public static readonly BOOL = 42;
	public static readonly INT = 43;
	public static readonly AND = 44;
	public static readonly OR = 45;
	public static readonly IFF = 46;
	public static readonly IMPLIES = 47;
	public static readonly SUBSETEQ = 48;
	public static readonly IN = 49;
	public static readonly NOTIN = 50;
	public static readonly PRIVATE = 51;
	public static readonly ADD = 52;
	public static readonly SUB = 53;
	public static readonly MUL = 54;
	public static readonly DIV = 55;
	public static readonly MOD = 56;
	public static readonly GT = 57;
	public static readonly LT = 58;
	public static readonly GE = 59;
	public static readonly LE = 60;
	public static readonly NE = 61;
	public static readonly EQEQ = 62;
	public static readonly EQ = 63;
	public static readonly ASGN = 64;
	public static readonly IDENTIFIER = 65;
	public static readonly LINE_COMMENT = 66;
	public static readonly COMMENT = 67;
	public static readonly WS = 68;
	public static readonly RULE_module = 0;
	public static readonly RULE_unit = 1;
	public static readonly RULE_valDef = 2;
	public static readonly RULE_operDef = 3;
	public static readonly RULE_instanceDef = 4;
	public static readonly RULE_params = 5;
	public static readonly RULE_type = 6;
	public static readonly RULE_typeUnionRecOne = 7;
	public static readonly RULE_untyped012 = 8;
	public static readonly RULE_untyped01 = 9;
	public static readonly RULE_untyped0 = 10;
	public static readonly RULE_expr = 11;
	public static readonly RULE_lambda = 12;
	public static readonly RULE_pattern = 13;
	public static readonly RULE_arg_list = 14;
	public static readonly RULE_name_after_dot = 15;
	public static readonly RULE_operator = 16;
	public static readonly RULE_literal = 17;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"module", "unit", "valDef", "operDef", "instanceDef", "params", "type", 
		"typeUnionRecOne", "untyped012", "untyped01", "untyped0", "expr", "lambda", 
		"pattern", "arg_list", "name_after_dot", "operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'extends'", "','", "'end'", "'const'", "':'", 
		"'var'", "'assume'", "'_'", "'pred'", "'action'", "'temporal'", "'typedef'", 
		"'val'", "'def'", "'rec'", "'instance'", "'with'", "'<-'", "'('", "')'", 
		"'->'", "'=>'", "'set'", "'seq'", "'{'", "'}'", "'int'", "'str'", "'bool'", 
		"'|'", "'.'", "'['", "']'", "'^'", "'if'", "'else'", "'case'", "'&'", 
		"'''", undefined, undefined, undefined, "'and'", "'or'", "'iff'", "'implies'", 
		"'subseteq'", "'in'", "'notin'", "'private'", "'+'", "'-'", "'*'", "'/'", 
		"'%'", "'>'", "'<'", "'>='", "'<='", "'!='", "'=='", "'='", "':='",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, "STRING", 
		"BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", "SUBSETEQ", "IN", "NOTIN", 
		"PRIVATE", "ADD", "SUB", "MUL", "DIV", "MOD", "GT", "LT", "GE", "LE", 
		"NE", "EQEQ", "EQ", "ASGN", "IDENTIFIER", "LINE_COMMENT", "COMMENT", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(TntParser._LITERAL_NAMES, TntParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return TntParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Tnt.g4"; }

	// @Override
	public get ruleNames(): string[] { return TntParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return TntParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(TntParser._ATN, this);
	}
	// @RuleVersion(0)
	public module(): ModuleContext {
		let _localctx: ModuleContext = new ModuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, TntParser.RULE_module);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 36;
			this.match(TntParser.T__0);
			this.state = 37;
			this.match(TntParser.IDENTIFIER);
			this.state = 42;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__1) {
				{
				this.state = 38;
				this.match(TntParser.T__1);
				this.state = 39;
				this.match(TntParser.IDENTIFIER);
				{
				this.state = 40;
				this.match(TntParser.T__2);
				this.state = 41;
				this.match(TntParser.IDENTIFIER);
				}
				}
			}

			this.state = 47;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__4) | (1 << TntParser.T__6) | (1 << TntParser.T__7) | (1 << TntParser.T__9) | (1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__16) | (1 << TntParser.T__19) | (1 << TntParser.T__25) | (1 << TntParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.T__32 - 33)) | (1 << (TntParser.T__34 - 33)) | (1 << (TntParser.T__35 - 33)) | (1 << (TntParser.T__37 - 33)) | (1 << (TntParser.T__38 - 33)) | (1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.PRIVATE - 33)) | (1 << (TntParser.ADD - 33)) | (1 << (TntParser.SUB - 33)) | (1 << (TntParser.MUL - 33)) | (1 << (TntParser.DIV - 33)) | (1 << (TntParser.MOD - 33)) | (1 << (TntParser.GT - 33)) | (1 << (TntParser.LT - 33)) | (1 << (TntParser.GE - 33)) | (1 << (TntParser.LE - 33)) | (1 << (TntParser.NE - 33)) | (1 << (TntParser.EQEQ - 33)) | (1 << (TntParser.EQ - 33)) | (1 << (TntParser.ASGN - 33)))) !== 0) || _la === TntParser.IDENTIFIER) {
				{
				{
				this.state = 44;
				this.unit();
				}
				}
				this.state = 49;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 50;
			this.match(TntParser.T__3);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unit(): UnitContext {
		let _localctx: UnitContext = new UnitContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, TntParser.RULE_unit);
		let _la: number;
		try {
			this.state = 141;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 52;
				this.match(TntParser.T__4);
				this.state = 53;
				this.match(TntParser.IDENTIFIER);
				this.state = 54;
				this.match(TntParser.T__5);
				this.state = 57;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
				case 1:
					{
					this.state = 55;
					this.untyped01();
					}
					break;

				case 2:
					{
					this.state = 56;
					this.type(0);
					}
					break;
				}
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 59;
				this.match(TntParser.T__6);
				this.state = 60;
				this.match(TntParser.IDENTIFIER);
				this.state = 61;
				this.match(TntParser.T__5);
				this.state = 64;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
				case 1:
					{
					this.state = 62;
					this.untyped0();
					}
					break;

				case 2:
					{
					this.state = 63;
					this.type(0);
					}
					break;
				}
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 66;
				this.match(TntParser.T__7);
				this.state = 67;
				_la = this._input.LA(1);
				if (!(_la === TntParser.T__8 || _la === TntParser.IDENTIFIER)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 68;
				this.match(TntParser.EQ);
				this.state = 69;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new ValContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 71;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.PRIVATE) {
					{
					this.state = 70;
					this.match(TntParser.PRIVATE);
					}
				}

				this.state = 73;
				this.valDef();
				}
				break;

			case 5:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 75;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.PRIVATE) {
					{
					this.state = 74;
					this.match(TntParser.PRIVATE);
					}
				}

				this.state = 77;
				this.operDef();
				}
				break;

			case 6:
				_localctx = new PredContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 79;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.PRIVATE) {
					{
					this.state = 78;
					this.match(TntParser.PRIVATE);
					}
				}

				this.state = 81;
				this.match(TntParser.T__9);
				this.state = 82;
				this.match(TntParser.IDENTIFIER);
				this.state = 84;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__19) {
					{
					this.state = 83;
					this.params();
					}
				}

				this.state = 91;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__5) {
					{
					this.state = 86;
					this.match(TntParser.T__5);
					this.state = 89;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
					case 1:
						{
						this.state = 87;
						this.untyped012();
						}
						break;

					case 2:
						{
						this.state = 88;
						this.type(0);
						}
						break;
					}
					}
				}

				this.state = 93;
				this.match(TntParser.EQ);
				this.state = 94;
				this.expr(0);
				}
				break;

			case 7:
				_localctx = new ActionContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 96;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.PRIVATE) {
					{
					this.state = 95;
					this.match(TntParser.PRIVATE);
					}
				}

				this.state = 98;
				this.match(TntParser.T__10);
				this.state = 99;
				this.match(TntParser.IDENTIFIER);
				this.state = 101;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__19) {
					{
					this.state = 100;
					this.params();
					}
				}

				this.state = 108;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__5) {
					{
					this.state = 103;
					this.match(TntParser.T__5);
					this.state = 106;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
					case 1:
						{
						this.state = 104;
						this.untyped012();
						}
						break;

					case 2:
						{
						this.state = 105;
						this.type(0);
						}
						break;
					}
					}
				}

				this.state = 110;
				this.match(TntParser.EQ);
				this.state = 111;
				this.expr(0);
				}
				break;

			case 8:
				_localctx = new TemporalContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 113;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.PRIVATE) {
					{
					this.state = 112;
					this.match(TntParser.PRIVATE);
					}
				}

				this.state = 115;
				this.match(TntParser.T__11);
				this.state = 116;
				this.match(TntParser.IDENTIFIER);
				this.state = 118;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__19) {
					{
					this.state = 117;
					this.params();
					}
				}

				this.state = 125;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__5) {
					{
					this.state = 120;
					this.match(TntParser.T__5);
					this.state = 123;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
					case 1:
						{
						this.state = 121;
						this.untyped012();
						}
						break;

					case 2:
						{
						this.state = 122;
						this.type(0);
						}
						break;
					}
					}
				}

				this.state = 127;
				this.match(TntParser.EQ);
				this.state = 128;
				this.expr(0);
				}
				break;

			case 9:
				_localctx = new ModuleNestedContext(_localctx);
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 129;
				this.module();
				}
				break;

			case 10:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 130;
				this.instanceDef();
				}
				break;

			case 11:
				_localctx = new TypeDefContext(_localctx);
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 131;
				this.match(TntParser.T__12);
				this.state = 132;
				this.match(TntParser.IDENTIFIER);
				this.state = 133;
				this.match(TntParser.EQ);
				this.state = 134;
				this.type(0);
				}
				break;

			case 12:
				_localctx = new ErrorCaseContext(_localctx);
				this.enterOuterAlt(_localctx, 12);
				{
				this.state = 138;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.IDENTIFIER:
					{
					this.state = 135;
					this.match(TntParser.IDENTIFIER);
					}
					break;
				case TntParser.T__19:
				case TntParser.T__25:
				case TntParser.T__30:
				case TntParser.T__32:
				case TntParser.T__34:
				case TntParser.T__35:
				case TntParser.T__37:
				case TntParser.T__38:
				case TntParser.AND:
				case TntParser.OR:
				case TntParser.IFF:
				case TntParser.IMPLIES:
				case TntParser.SUBSETEQ:
				case TntParser.IN:
				case TntParser.NOTIN:
				case TntParser.ADD:
				case TntParser.SUB:
				case TntParser.MUL:
				case TntParser.DIV:
				case TntParser.MOD:
				case TntParser.GT:
				case TntParser.LT:
				case TntParser.GE:
				case TntParser.LE:
				case TntParser.NE:
				case TntParser.EQEQ:
				case TntParser.EQ:
				case TntParser.ASGN:
					{
					this.state = 136;
					this.operator();
					}
					break;
				case TntParser.STRING:
				case TntParser.BOOL:
				case TntParser.INT:
					{
					this.state = 137;
					this.literal();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}

				         this.notifyErrorListeners("TNT001: expected a const, var, def, typedef, etc.");
				                
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public valDef(): ValDefContext {
		let _localctx: ValDefContext = new ValDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, TntParser.RULE_valDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 143;
			this.match(TntParser.T__13);
			this.state = 144;
			this.match(TntParser.IDENTIFIER);
			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__5) {
				{
				this.state = 145;
				this.match(TntParser.T__5);
				this.state = 148;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 20, this._ctx) ) {
				case 1:
					{
					this.state = 146;
					this.untyped0();
					}
					break;

				case 2:
					{
					this.state = 147;
					this.type(0);
					}
					break;
				}
				}
			}

			this.state = 152;
			this.match(TntParser.EQ);
			this.state = 153;
			this.expr(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public operDef(): OperDefContext {
		let _localctx: OperDefContext = new OperDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, TntParser.RULE_operDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 155;
			this.match(TntParser.T__14);
			this.state = 157;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__15) {
				{
				this.state = 156;
				this.match(TntParser.T__15);
				}
			}

			this.state = 159;
			this.match(TntParser.IDENTIFIER);
			this.state = 160;
			this.params();
			this.state = 166;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__5) {
				{
				this.state = 161;
				this.match(TntParser.T__5);
				this.state = 164;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
				case 1:
					{
					this.state = 162;
					this.untyped012();
					}
					break;

				case 2:
					{
					this.state = 163;
					this.type(0);
					}
					break;
				}
				}
			}

			this.state = 168;
			this.match(TntParser.EQ);
			this.state = 169;
			this.expr(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public instanceDef(): InstanceDefContext {
		let _localctx: InstanceDefContext = new InstanceDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, TntParser.RULE_instanceDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 171;
			this.match(TntParser.T__16);
			this.state = 172;
			_la = this._input.LA(1);
			if (!(_la === TntParser.T__8 || _la === TntParser.IDENTIFIER)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 173;
			this.match(TntParser.EQ);
			this.state = 174;
			this.match(TntParser.IDENTIFIER);
			this.state = 188;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__17) {
				{
				this.state = 175;
				this.match(TntParser.T__17);
				this.state = 176;
				this.match(TntParser.IDENTIFIER);
				this.state = 177;
				this.match(TntParser.T__18);
				this.state = 178;
				this.expr(0);
				this.state = 185;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 179;
					this.match(TntParser.T__2);
					this.state = 180;
					this.match(TntParser.IDENTIFIER);
					this.state = 181;
					this.match(TntParser.T__18);
					this.state = 182;
					this.expr(0);
					}
					}
					this.state = 187;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public params(): ParamsContext {
		let _localctx: ParamsContext = new ParamsContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, TntParser.RULE_params);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 190;
			this.match(TntParser.T__19);
			this.state = 199;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.IDENTIFIER) {
				{
				this.state = 191;
				this.match(TntParser.IDENTIFIER);
				this.state = 196;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 192;
					this.match(TntParser.T__2);
					this.state = 193;
					this.match(TntParser.IDENTIFIER);
					}
					}
					this.state = 198;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 201;
			this.match(TntParser.T__20);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public type(): TypeContext;
	public type(_p: number): TypeContext;
	// @RuleVersion(0)
	public type(_p?: number): TypeContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: TypeContext = new TypeContext(this._ctx, _parentState);
		let _prevctx: TypeContext = _localctx;
		let _startState: number = 12;
		this.enterRecursionRule(_localctx, 12, TntParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 269;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 204;
				this.match(TntParser.T__19);
				this.state = 213;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__19) | (1 << TntParser.T__23) | (1 << TntParser.T__24) | (1 << TntParser.T__25) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__29) | (1 << TntParser.T__30))) !== 0) || _la === TntParser.IDENTIFIER) {
					{
					this.state = 205;
					this.type(0);
					this.state = 210;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__2) {
						{
						{
						this.state = 206;
						this.match(TntParser.T__2);
						this.state = 207;
						this.type(0);
						}
						}
						this.state = 212;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 215;
				this.match(TntParser.T__20);
				this.state = 216;
				this.match(TntParser.T__22);
				this.state = 217;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 218;
				this.match(TntParser.T__23);
				this.state = 219;
				this.match(TntParser.T__19);
				this.state = 220;
				this.type(0);
				this.state = 221;
				this.match(TntParser.T__20);
				}
				break;

			case 3:
				{
				_localctx = new TypeSeqContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 223;
				this.match(TntParser.T__24);
				this.state = 224;
				this.match(TntParser.T__19);
				this.state = 225;
				this.type(0);
				this.state = 226;
				this.match(TntParser.T__20);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 228;
				this.match(TntParser.T__19);
				this.state = 229;
				this.type(0);
				this.state = 230;
				this.match(TntParser.T__2);
				this.state = 231;
				this.type(0);
				this.state = 236;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 232;
					this.match(TntParser.T__2);
					this.state = 233;
					this.type(0);
					}
					}
					this.state = 238;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 239;
				this.match(TntParser.T__20);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 241;
				this.match(TntParser.T__25);
				this.state = 242;
				this.match(TntParser.IDENTIFIER);
				this.state = 243;
				this.match(TntParser.T__5);
				this.state = 244;
				this.type(0);
				this.state = 251;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 245;
					this.match(TntParser.T__2);
					this.state = 246;
					this.match(TntParser.IDENTIFIER);
					this.state = 247;
					this.match(TntParser.T__5);
					this.state = 248;
					this.type(0);
					}
					}
					this.state = 253;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 254;
				this.match(TntParser.T__26);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 257;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 256;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 259;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 261;
				this.match(TntParser.T__27);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 262;
				this.match(TntParser.T__28);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 263;
				this.match(TntParser.T__29);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 264;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 265;
				this.match(TntParser.T__19);
				this.state = 266;
				this.type(0);
				this.state = 267;
				this.match(TntParser.T__20);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 276;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					{
					_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
					this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_type);
					this.state = 271;
					if (!(this.precpred(this._ctx, 12))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
					}
					this.state = 272;
					this.match(TntParser.T__21);
					this.state = 273;
					this.type(13);
					}
					}
				}
				this.state = 278;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public typeUnionRecOne(): TypeUnionRecOneContext {
		let _localctx: TypeUnionRecOneContext = new TypeUnionRecOneContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, TntParser.RULE_typeUnionRecOne);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 279;
			this.match(TntParser.T__30);
			this.state = 280;
			this.match(TntParser.T__25);
			this.state = 281;
			this.match(TntParser.IDENTIFIER);
			this.state = 282;
			this.match(TntParser.T__5);
			this.state = 283;
			this.match(TntParser.STRING);
			this.state = 290;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__2) {
				{
				{
				this.state = 284;
				this.match(TntParser.T__2);
				this.state = 285;
				this.match(TntParser.IDENTIFIER);
				this.state = 286;
				this.match(TntParser.T__5);
				this.state = 287;
				this.type(0);
				}
				}
				this.state = 292;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 293;
			this.match(TntParser.T__26);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public untyped012(): Untyped012Context {
		let _localctx: Untyped012Context = new Untyped012Context(this._ctx, this.state);
		this.enterRule(_localctx, 16, TntParser.RULE_untyped012);
		let _la: number;
		try {
			this.state = 314;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 39, this._ctx) ) {
			case 1:
				_localctx = new Untyped2SigContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 295;
				this.match(TntParser.T__19);
				this.state = 304;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__8 || _la === TntParser.T__19) {
					{
					this.state = 296;
					this.untyped01();
					this.state = 301;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__2) {
						{
						{
						this.state = 297;
						this.match(TntParser.T__2);
						this.state = 298;
						this.untyped01();
						}
						}
						this.state = 303;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 306;
				this.match(TntParser.T__20);
				this.state = 307;
				this.match(TntParser.T__22);
				this.state = 308;
				this.match(TntParser.T__8);
				}
				break;

			case 2:
				_localctx = new Untyped2LowerContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 309;
				this.untyped01();
				}
				break;

			case 3:
				_localctx = new Untyped2ParenContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 310;
				this.match(TntParser.T__19);
				this.state = 311;
				this.untyped012();
				this.state = 312;
				this.match(TntParser.T__20);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public untyped01(): Untyped01Context {
		let _localctx: Untyped01Context = new Untyped01Context(this._ctx, this.state);
		this.enterRule(_localctx, 18, TntParser.RULE_untyped01);
		let _la: number;
		try {
			this.state = 331;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				_localctx = new Untyped1Context(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 316;
				this.match(TntParser.T__19);
				this.state = 325;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__8) {
					{
					this.state = 317;
					this.match(TntParser.T__8);
					this.state = 322;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__2) {
						{
						{
						this.state = 318;
						this.match(TntParser.T__2);
						this.state = 319;
						this.match(TntParser.T__8);
						}
						}
						this.state = 324;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 327;
				this.match(TntParser.T__20);
				this.state = 328;
				this.match(TntParser.T__22);
				this.state = 329;
				this.match(TntParser.T__8);
				}
				break;

			case 2:
				_localctx = new Untyped1LowerContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 330;
				this.untyped0();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public untyped0(): Untyped0Context {
		let _localctx: Untyped0Context = new Untyped0Context(this._ctx, this.state);
		this.enterRule(_localctx, 20, TntParser.RULE_untyped0);
		try {
			this.state = 339;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 43, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 333;
				this.match(TntParser.T__8);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 334;
				this.match(TntParser.T__19);
				this.state = 335;
				this.match(TntParser.T__8);

				                this.notifyErrorListeners("TNT002: expected '_', found an operator signature.");
				                
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 337;
				this.match(TntParser.T__19);

				                this.notifyErrorListeners("TNT003: expected '_', found '('.");
				                
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expr(): ExprContext;
	public expr(_p: number): ExprContext;
	// @RuleVersion(0)
	public expr(_p?: number): ExprContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExprContext = new ExprContext(this._ctx, _parentState);
		let _prevctx: ExprContext = _localctx;
		let _startState: number = 22;
		this.enterRecursionRule(_localctx, 22, TntParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 533;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 67, this._ctx) ) {
			case 1:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 342;
				this.match(TntParser.IDENTIFIER);
				this.state = 343;
				this.match(TntParser.T__19);
				this.state = 345;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & ((1 << (TntParser.T__13 - 14)) | (1 << (TntParser.T__14 - 14)) | (1 << (TntParser.T__19 - 14)) | (1 << (TntParser.T__23 - 14)) | (1 << (TntParser.T__24 - 14)) | (1 << (TntParser.T__25 - 14)) | (1 << (TntParser.T__32 - 14)) | (1 << (TntParser.T__35 - 14)) | (1 << (TntParser.T__37 - 14)) | (1 << (TntParser.T__39 - 14)) | (1 << (TntParser.STRING - 14)) | (1 << (TntParser.BOOL - 14)) | (1 << (TntParser.INT - 14)))) !== 0) || _la === TntParser.SUB || _la === TntParser.IDENTIFIER) {
					{
					this.state = 344;
					this.arg_list();
					}
				}

				this.state = 347;
				this.match(TntParser.T__20);
				}
				break;

			case 2:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 348;
				this.match(TntParser.SUB);
				this.state = 349;
				this.expr(23);
				}
				break;

			case 3:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 350;
				this.match(TntParser.T__35);
				this.state = 351;
				this.match(TntParser.T__19);
				this.state = 352;
				this.expr(0);
				this.state = 353;
				this.match(TntParser.T__20);
				this.state = 354;
				this.expr(0);
				this.state = 355;
				this.match(TntParser.T__36);
				this.state = 356;
				this.expr(19);
				}
				break;

			case 4:
				{
				_localctx = new CaseBlockContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 358;
				this.match(TntParser.T__37);
				this.state = 359;
				this.match(TntParser.T__25);
				this.state = 361;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__30) {
					{
					this.state = 360;
					this.match(TntParser.T__30);
					}
				}

				this.state = 363;
				this.expr(0);
				this.state = 364;
				this.match(TntParser.T__21);
				this.state = 365;
				this.expr(0);
				this.state = 373;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 366;
						this.match(TntParser.T__30);
						this.state = 367;
						this.expr(0);
						this.state = 368;
						this.match(TntParser.T__21);
						this.state = 369;
						this.expr(0);
						}
						}
					}
					this.state = 375;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
				}
				this.state = 380;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__30) {
					{
					this.state = 376;
					this.match(TntParser.T__30);
					this.state = 377;
					this.match(TntParser.T__8);
					this.state = 378;
					this.match(TntParser.T__21);
					this.state = 379;
					this.expr(0);
					}
				}

				this.state = 382;
				this.match(TntParser.T__26);
				}
				break;

			case 5:
				{
				_localctx = new AndBlockContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 384;
				this.match(TntParser.T__25);
				this.state = 386;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__38) {
					{
					this.state = 385;
					this.match(TntParser.T__38);
					}
				}

				this.state = 388;
				this.expr(0);
				this.state = 389;
				this.match(TntParser.T__38);
				this.state = 390;
				this.expr(0);
				this.state = 395;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__38) {
					{
					{
					this.state = 391;
					this.match(TntParser.T__38);
					this.state = 392;
					this.expr(0);
					}
					}
					this.state = 397;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 398;
				this.match(TntParser.T__26);
				}
				break;

			case 6:
				{
				_localctx = new OrBlockContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 400;
				this.match(TntParser.T__25);
				this.state = 402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__30) {
					{
					this.state = 401;
					this.match(TntParser.T__30);
					}
				}

				this.state = 404;
				this.expr(0);
				this.state = 405;
				this.match(TntParser.T__30);
				this.state = 406;
				this.expr(0);
				this.state = 411;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__30) {
					{
					{
					this.state = 407;
					this.match(TntParser.T__30);
					this.state = 408;
					this.expr(0);
					}
					}
					this.state = 413;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 414;
				this.match(TntParser.T__26);
				}
				break;

			case 7:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 416;
				_la = this._input.LA(1);
				if (!(((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & ((1 << (TntParser.STRING - 41)) | (1 << (TntParser.BOOL - 41)) | (1 << (TntParser.INT - 41)) | (1 << (TntParser.IDENTIFIER - 41)))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				break;

			case 8:
				{
				_localctx = new TupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 417;
				this.match(TntParser.T__19);
				this.state = 418;
				this.expr(0);
				this.state = 419;
				this.match(TntParser.T__2);
				this.state = 420;
				this.expr(0);
				this.state = 425;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 421;
					this.match(TntParser.T__2);
					this.state = 422;
					this.expr(0);
					}
					}
					this.state = 427;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 428;
				this.match(TntParser.T__20);
				}
				break;

			case 9:
				{
				_localctx = new SetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 455;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.T__39:
					{
					this.state = 430;
					this.match(TntParser.T__39);
					this.state = 439;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & ((1 << (TntParser.T__13 - 14)) | (1 << (TntParser.T__14 - 14)) | (1 << (TntParser.T__19 - 14)) | (1 << (TntParser.T__23 - 14)) | (1 << (TntParser.T__24 - 14)) | (1 << (TntParser.T__25 - 14)) | (1 << (TntParser.T__32 - 14)) | (1 << (TntParser.T__35 - 14)) | (1 << (TntParser.T__37 - 14)) | (1 << (TntParser.T__39 - 14)) | (1 << (TntParser.STRING - 14)) | (1 << (TntParser.BOOL - 14)) | (1 << (TntParser.INT - 14)))) !== 0) || _la === TntParser.SUB || _la === TntParser.IDENTIFIER) {
						{
						this.state = 431;
						this.expr(0);
						this.state = 436;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__2) {
							{
							{
							this.state = 432;
							this.match(TntParser.T__2);
							this.state = 433;
							this.expr(0);
							}
							}
							this.state = 438;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 441;
					this.match(TntParser.T__26);
					}
					break;
				case TntParser.T__23:
					{
					this.state = 442;
					this.match(TntParser.T__23);
					this.state = 443;
					this.match(TntParser.T__19);
					this.state = 452;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & ((1 << (TntParser.T__13 - 14)) | (1 << (TntParser.T__14 - 14)) | (1 << (TntParser.T__19 - 14)) | (1 << (TntParser.T__23 - 14)) | (1 << (TntParser.T__24 - 14)) | (1 << (TntParser.T__25 - 14)) | (1 << (TntParser.T__32 - 14)) | (1 << (TntParser.T__35 - 14)) | (1 << (TntParser.T__37 - 14)) | (1 << (TntParser.T__39 - 14)) | (1 << (TntParser.STRING - 14)) | (1 << (TntParser.BOOL - 14)) | (1 << (TntParser.INT - 14)))) !== 0) || _la === TntParser.SUB || _la === TntParser.IDENTIFIER) {
						{
						this.state = 444;
						this.expr(0);
						this.state = 449;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__2) {
							{
							{
							this.state = 445;
							this.match(TntParser.T__2);
							this.state = 446;
							this.expr(0);
							}
							}
							this.state = 451;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 454;
					this.match(TntParser.T__20);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 10:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 457;
				this.match(TntParser.T__25);
				this.state = 458;
				this.match(TntParser.IDENTIFIER);
				this.state = 459;
				this.match(TntParser.T__5);
				this.state = 460;
				this.expr(0);
				this.state = 467;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 461;
					this.match(TntParser.T__2);
					this.state = 462;
					this.match(TntParser.IDENTIFIER);
					this.state = 463;
					this.match(TntParser.T__5);
					this.state = 464;
					this.expr(0);
					}
					}
					this.state = 469;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 470;
				this.match(TntParser.T__26);
				}
				break;

			case 11:
				{
				_localctx = new RecordSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 472;
				this.match(TntParser.T__32);
				this.state = 473;
				this.match(TntParser.IDENTIFIER);
				this.state = 474;
				this.match(TntParser.IN);
				this.state = 475;
				this.expr(0);
				this.state = 482;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 476;
					this.match(TntParser.T__2);
					this.state = 477;
					this.match(TntParser.IDENTIFIER);
					this.state = 478;
					this.match(TntParser.IN);
					this.state = 479;
					this.expr(0);
					}
					}
					this.state = 484;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 485;
				this.match(TntParser.T__33);
				}
				break;

			case 12:
				{
				_localctx = new SequenceContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 512;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.T__32:
					{
					this.state = 487;
					this.match(TntParser.T__32);
					this.state = 496;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & ((1 << (TntParser.T__13 - 14)) | (1 << (TntParser.T__14 - 14)) | (1 << (TntParser.T__19 - 14)) | (1 << (TntParser.T__23 - 14)) | (1 << (TntParser.T__24 - 14)) | (1 << (TntParser.T__25 - 14)) | (1 << (TntParser.T__32 - 14)) | (1 << (TntParser.T__35 - 14)) | (1 << (TntParser.T__37 - 14)) | (1 << (TntParser.T__39 - 14)) | (1 << (TntParser.STRING - 14)) | (1 << (TntParser.BOOL - 14)) | (1 << (TntParser.INT - 14)))) !== 0) || _la === TntParser.SUB || _la === TntParser.IDENTIFIER) {
						{
						this.state = 488;
						this.expr(0);
						this.state = 493;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__2) {
							{
							{
							this.state = 489;
							this.match(TntParser.T__2);
							this.state = 490;
							this.expr(0);
							}
							}
							this.state = 495;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 498;
					this.match(TntParser.T__33);
					}
					break;
				case TntParser.T__24:
					{
					this.state = 499;
					this.match(TntParser.T__24);
					this.state = 500;
					this.match(TntParser.T__19);
					this.state = 509;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & ((1 << (TntParser.T__13 - 14)) | (1 << (TntParser.T__14 - 14)) | (1 << (TntParser.T__19 - 14)) | (1 << (TntParser.T__23 - 14)) | (1 << (TntParser.T__24 - 14)) | (1 << (TntParser.T__25 - 14)) | (1 << (TntParser.T__32 - 14)) | (1 << (TntParser.T__35 - 14)) | (1 << (TntParser.T__37 - 14)) | (1 << (TntParser.T__39 - 14)) | (1 << (TntParser.STRING - 14)) | (1 << (TntParser.BOOL - 14)) | (1 << (TntParser.INT - 14)))) !== 0) || _la === TntParser.SUB || _la === TntParser.IDENTIFIER) {
						{
						this.state = 501;
						this.expr(0);
						this.state = 506;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__2) {
							{
							{
							this.state = 502;
							this.match(TntParser.T__2);
							this.state = 503;
							this.expr(0);
							}
							}
							this.state = 508;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 511;
					this.match(TntParser.T__20);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 13:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 520;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.T__13:
					{
					this.state = 514;
					this.valDef();
					this.state = 515;
					this.expr(0);
					}
					break;
				case TntParser.T__14:
					{
					this.state = 517;
					this.operDef();
					this.state = 518;
					this.expr(0);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 14:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 522;
				this.match(TntParser.T__19);
				this.state = 523;
				this.expr(0);
				this.state = 524;
				this.match(TntParser.T__20);
				}
				break;

			case 15:
				{
				_localctx = new LambdaOrBracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 526;
				this.match(TntParser.T__25);
				this.state = 529;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 66, this._ctx) ) {
				case 1:
					{
					this.state = 527;
					this.lambda();
					}
					break;

				case 2:
					{
					this.state = 528;
					this.expr(0);
					}
					break;
				}
				this.state = 531;
				this.match(TntParser.T__26);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 583;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 72, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 581;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 71, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 535;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 536;
						(_localctx as PowContext)._op = this.match(TntParser.T__34);
						this.state = 537;
						this.expr(22);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 538;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 539;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & ((1 << (TntParser.MUL - 54)) | (1 << (TntParser.DIV - 54)) | (1 << (TntParser.MOD - 54)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 540;
						this.expr(22);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 541;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 542;
						(_localctx as PlusMinusContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === TntParser.ADD || _la === TntParser.SUB)) {
							(_localctx as PlusMinusContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 543;
						this.expr(21);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 544;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 545;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & ((1 << (TntParser.SUBSETEQ - 48)) | (1 << (TntParser.IN - 48)) | (1 << (TntParser.NOTIN - 48)) | (1 << (TntParser.GT - 48)) | (1 << (TntParser.LT - 48)) | (1 << (TntParser.GE - 48)) | (1 << (TntParser.LE - 48)) | (1 << (TntParser.NE - 48)) | (1 << (TntParser.EQEQ - 48)) | (1 << (TntParser.EQ - 48)) | (1 << (TntParser.ASGN - 48)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 546;
						this.expr(17);
						}
						break;

					case 5:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 547;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 548;
						this.match(TntParser.AND);
						this.state = 549;
						this.expr(16);
						}
						break;

					case 6:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 550;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 551;
						this.match(TntParser.OR);
						this.state = 552;
						this.expr(15);
						}
						break;

					case 7:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 553;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 554;
						this.match(TntParser.IFF);
						this.state = 555;
						this.expr(14);
						}
						break;

					case 8:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 556;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 557;
						this.match(TntParser.IMPLIES);
						this.state = 558;
						this.expr(13);
						}
						break;

					case 9:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 559;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 560;
						this.match(TntParser.T__31);
						this.state = 561;
						this.name_after_dot();
						this.state = 569;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 69, this._ctx) ) {
						case 1:
							{
							this.state = 562;
							this.match(TntParser.T__19);
							this.state = 565;
							this._errHandler.sync(this);
							switch ( this.interpreter.adaptivePredict(this._input, 68, this._ctx) ) {
							case 1:
								{
								this.state = 563;
								this.lambda();
								}
								break;

							case 2:
								{
								this.state = 564;
								this.arg_list();
								}
								break;
							}
							this.state = 567;
							this.match(TntParser.T__20);
							}
							break;
						}
						}
						break;

					case 10:
						{
						_localctx = new FunAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 571;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 572;
						this.match(TntParser.T__32);
						this.state = 573;
						this.expr(0);
						this.state = 574;
						this.match(TntParser.T__33);
						}
						break;

					case 11:
						{
						_localctx = new InfixCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 576;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 577;
						this.match(TntParser.IDENTIFIER);
						this.state = 579;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 70, this._ctx) ) {
						case 1:
							{
							this.state = 578;
							this.arg_list();
							}
							break;
						}
						}
						break;
					}
					}
				}
				this.state = 585;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 72, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public lambda(): LambdaContext {
		let _localctx: LambdaContext = new LambdaContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, TntParser.RULE_lambda);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 586;
			this.pattern();
			this.state = 587;
			this.match(TntParser.T__21);
			this.state = 588;
			this.expr(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pattern(): PatternContext {
		let _localctx: PatternContext = new PatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, TntParser.RULE_pattern);
		let _la: number;
		try {
			this.state = 602;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__19:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 590;
				this.match(TntParser.T__19);
				this.state = 591;
				this.pattern();
				this.state = 596;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__2) {
					{
					{
					this.state = 592;
					this.match(TntParser.T__2);
					this.state = 593;
					this.pattern();
					}
					}
					this.state = 598;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 599;
				this.match(TntParser.T__20);
				}
				break;
			case TntParser.T__8:
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 601;
				_la = this._input.LA(1);
				if (!(_la === TntParser.T__8 || _la === TntParser.IDENTIFIER)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arg_list(): Arg_listContext {
		let _localctx: Arg_listContext = new Arg_listContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, TntParser.RULE_arg_list);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 604;
			this.expr(0);
			this.state = 609;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 75, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 605;
					this.match(TntParser.T__2);
					this.state = 606;
					this.expr(0);
					}
					}
				}
				this.state = 611;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 75, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public name_after_dot(): Name_after_dotContext {
		let _localctx: Name_after_dotContext = new Name_after_dotContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, TntParser.RULE_name_after_dot);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 612;
			_la = this._input.LA(1);
			if (!(((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & ((1 << (TntParser.AND - 44)) | (1 << (TntParser.OR - 44)) | (1 << (TntParser.IFF - 44)) | (1 << (TntParser.IMPLIES - 44)) | (1 << (TntParser.IN - 44)) | (1 << (TntParser.NOTIN - 44)) | (1 << (TntParser.IDENTIFIER - 44)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public operator(): OperatorContext {
		let _localctx: OperatorContext = new OperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, TntParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 614;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__19) | (1 << TntParser.T__25) | (1 << TntParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.T__32 - 33)) | (1 << (TntParser.T__34 - 33)) | (1 << (TntParser.T__35 - 33)) | (1 << (TntParser.T__37 - 33)) | (1 << (TntParser.T__38 - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.ADD - 33)) | (1 << (TntParser.SUB - 33)) | (1 << (TntParser.MUL - 33)) | (1 << (TntParser.DIV - 33)) | (1 << (TntParser.MOD - 33)) | (1 << (TntParser.GT - 33)) | (1 << (TntParser.LT - 33)) | (1 << (TntParser.GE - 33)) | (1 << (TntParser.LE - 33)) | (1 << (TntParser.NE - 33)) | (1 << (TntParser.EQEQ - 33)) | (1 << (TntParser.EQ - 33)) | (1 << (TntParser.ASGN - 33)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, TntParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 616;
			_la = this._input.LA(1);
			if (!(((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & ((1 << (TntParser.STRING - 41)) | (1 << (TntParser.BOOL - 41)) | (1 << (TntParser.INT - 41)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 6:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 11:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private type_sempred(_localctx: TypeContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 12);
		}
		return true;
	}
	private expr_sempred(_localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.precpred(this._ctx, 22);

		case 2:
			return this.precpred(this._ctx, 21);

		case 3:
			return this.precpred(this._ctx, 20);

		case 4:
			return this.precpred(this._ctx, 16);

		case 5:
			return this.precpred(this._ctx, 15);

		case 6:
			return this.precpred(this._ctx, 14);

		case 7:
			return this.precpred(this._ctx, 13);

		case 8:
			return this.precpred(this._ctx, 12);

		case 9:
			return this.precpred(this._ctx, 26);

		case 10:
			return this.precpred(this._ctx, 24);

		case 11:
			return this.precpred(this._ctx, 17);
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03F\u026D\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x05\x02-\n" +
		"\x02\x03\x02\x07\x020\n\x02\f\x02\x0E\x023\v\x02\x03\x02\x03\x02\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03<\n\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x05\x03C\n\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x05\x03J\n\x03\x03\x03\x03\x03\x05\x03N\n\x03\x03\x03\x03\x03\x05\x03" +
		"R\n\x03\x03\x03\x03\x03\x03\x03\x05\x03W\n\x03\x03\x03\x03\x03\x03\x03" +
		"\x05\x03\\\n\x03\x05\x03^\n\x03\x03\x03\x03\x03\x03\x03\x05\x03c\n\x03" +
		"\x03\x03\x03\x03\x03\x03\x05\x03h\n\x03\x03\x03\x03\x03\x03\x03\x05\x03" +
		"m\n\x03\x05\x03o\n\x03\x03\x03\x03\x03\x03\x03\x05\x03t\n\x03\x03\x03" +
		"\x03\x03\x03\x03\x05\x03y\n\x03\x03\x03\x03\x03\x03\x03\x05\x03~\n\x03" +
		"\x05\x03\x80\n\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03\x8D\n\x03\x03\x03\x05\x03" +
		"\x90\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04\x97\n\x04\x05" +
		"\x04\x99\n\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x05\x05\xA0\n\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05\xA7\n\x05\x05\x05\xA9" +
		"\n\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06\xBA\n" +
		"\x06\f\x06\x0E\x06\xBD\v\x06\x05\x06\xBF\n\x06\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x07\x07\xC5\n\x07\f\x07\x0E\x07\xC8\v\x07\x05\x07\xCA\n\x07\x03" +
		"\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xD3\n\b\f\b\x0E\b\xD6" +
		"\v\b\x05\b\xD8\n\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xED" +
		"\n\b\f\b\x0E\b\xF0\v\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x03\b\x03\b\x07\b\xFC\n\b\f\b\x0E\b\xFF\v\b\x03\b\x03\b\x03\b\x06\b\u0104" +
		"\n\b\r\b\x0E\b\u0105\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05" +
		"\b\u0110\n\b\x03\b\x03\b\x03\b\x07\b\u0115\n\b\f\b\x0E\b\u0118\v\b\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\u0123\n\t\f\t" +
		"\x0E\t\u0126\v\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x07\n\u012E\n\n\f" +
		"\n\x0E\n\u0131\v\n\x05\n\u0133\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x05\n\u013D\n\n\x03\v\x03\v\x03\v\x03\v\x07\v\u0143\n\v\f" +
		"\v\x0E\v\u0146\v\v\x05\v\u0148\n\v\x03\v\x03\v\x03\v\x03\v\x05\v\u014E" +
		"\n\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u0156\n\f\x03\r\x03\r\x03" +
		"\r\x03\r\x05\r\u015C\n\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u016C\n\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\u0176\n\r\f\r\x0E\r\u0179\v\r\x03" +
		"\r\x03\r\x03\r\x03\r\x05\r\u017F\n\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0185" +
		"\n\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\u018C\n\r\f\r\x0E\r\u018F\v\r" +
		"\x03\r\x03\r\x03\r\x03\r\x05\r\u0195\n\r\x03\r\x03\r\x03\r\x03\r\x03\r" +
		"\x07\r\u019C\n\r\f\r\x0E\r\u019F\v\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x07\r\u01AA\n\r\f\r\x0E\r\u01AD\v\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x07\r\u01B5\n\r\f\r\x0E\r\u01B8\v\r\x05\r\u01BA\n" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\u01C2\n\r\f\r\x0E\r\u01C5" +
		"\v\r\x05\r\u01C7\n\r\x03\r\x05\r\u01CA\n\r\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x07\r\u01D4\n\r\f\r\x0E\r\u01D7\v\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\u01E3\n\r\f\r\x0E\r" +
		"\u01E6\v\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\u01EE\n\r\f\r\x0E" +
		"\r\u01F1\v\r\x05\r\u01F3\n\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r" +
		"\u01FB\n\r\f\r\x0E\r\u01FE\v\r\x05\r\u0200\n\r\x03\r\x05\r\u0203\n\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u020B\n\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x05\r\u0214\n\r\x03\r\x03\r\x05\r\u0218\n\r\x03\r" +
		"\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0238\n\r\x03\r\x03\r\x05\r\u023C" +
		"\n\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0246\n\r\x07" +
		"\r\u0248\n\r\f\r\x0E\r\u024B\v\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u0255\n\x0F\f\x0F\x0E\x0F\u0258\v\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x05\x0F\u025D\n\x0F\x03\x10\x03\x10\x03\x10\x07" +
		"\x10\u0262\n\x10\f\x10\x0E\x10\u0265\v\x10\x03\x11\x03\x11\x03\x12\x03" +
		"\x12\x03\x13\x03\x13\x03\x13\x02\x02\x04\x0E\x18\x14\x02\x02\x04\x02\x06" +
		"\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02" +
		"\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02\x02\n\x04\x02\v\vCC\x04\x02+" +
		"-CC\x03\x028:\x03\x0267\x04\x0224;B\x05\x02.134CC\n\x02\x16\x16\x1C\x1C" +
		"!!##%&().46B\x03\x02+-\x02\u02D2\x02&\x03\x02\x02\x02\x04\x8F\x03\x02" +
		"\x02\x02\x06\x91\x03\x02\x02\x02\b\x9D\x03\x02\x02\x02\n\xAD\x03\x02\x02" +
		"\x02\f\xC0\x03\x02\x02\x02\x0E\u010F\x03\x02\x02\x02\x10\u0119\x03\x02" +
		"\x02\x02\x12\u013C\x03\x02\x02\x02\x14\u014D\x03\x02\x02\x02\x16\u0155" +
		"\x03\x02\x02\x02\x18\u0217\x03\x02\x02\x02\x1A\u024C\x03\x02\x02\x02\x1C" +
		"\u025C\x03\x02\x02\x02\x1E\u025E\x03\x02\x02\x02 \u0266\x03\x02\x02\x02" +
		"\"\u0268\x03\x02\x02\x02$\u026A\x03\x02\x02\x02&\'\x07\x03\x02\x02\'," +
		"\x07C\x02\x02()\x07\x04\x02\x02)*\x07C\x02\x02*+\x07\x05\x02\x02+-\x07" +
		"C\x02\x02,(\x03\x02\x02\x02,-\x03\x02\x02\x02-1\x03\x02\x02\x02.0\x05" +
		"\x04\x03\x02/.\x03\x02\x02\x0203\x03\x02\x02\x021/\x03\x02\x02\x0212\x03" +
		"\x02\x02\x0224\x03\x02\x02\x0231\x03\x02\x02\x0245\x07\x06\x02\x025\x03" +
		"\x03\x02\x02\x0267\x07\x07\x02\x0278\x07C\x02\x028;\x07\b\x02\x029<\x05" +
		"\x14\v\x02:<\x05\x0E\b\x02;9\x03\x02\x02\x02;:\x03\x02\x02\x02<\x90\x03" +
		"\x02\x02\x02=>\x07\t\x02\x02>?\x07C\x02\x02?B\x07\b\x02\x02@C\x05\x16" +
		"\f\x02AC\x05\x0E\b\x02B@\x03\x02\x02\x02BA\x03\x02\x02\x02C\x90\x03\x02" +
		"\x02\x02DE\x07\n\x02\x02EF\t\x02\x02\x02FG\x07A\x02\x02G\x90\x05\x18\r" +
		"\x02HJ\x075\x02\x02IH\x03\x02\x02\x02IJ\x03\x02\x02\x02JK\x03\x02\x02" +
		"\x02K\x90\x05\x06\x04\x02LN\x075\x02\x02ML\x03\x02\x02\x02MN\x03\x02\x02" +
		"\x02NO\x03\x02\x02\x02O\x90\x05\b\x05\x02PR\x075\x02\x02QP\x03\x02\x02" +
		"\x02QR\x03\x02\x02\x02RS\x03\x02\x02\x02ST\x07\f\x02\x02TV\x07C\x02\x02" +
		"UW\x05\f\x07\x02VU\x03\x02\x02\x02VW\x03\x02\x02\x02W]\x03\x02\x02\x02" +
		"X[\x07\b\x02\x02Y\\\x05\x12\n\x02Z\\\x05\x0E\b\x02[Y\x03\x02\x02\x02[" +
		"Z\x03\x02\x02\x02\\^\x03\x02\x02\x02]X\x03\x02\x02\x02]^\x03\x02\x02\x02" +
		"^_\x03\x02\x02\x02_`\x07A\x02\x02`\x90\x05\x18\r\x02ac\x075\x02\x02ba" +
		"\x03\x02\x02\x02bc\x03\x02\x02\x02cd\x03\x02\x02\x02de\x07\r\x02\x02e" +
		"g\x07C\x02\x02fh\x05\f\x07\x02gf\x03\x02\x02\x02gh\x03\x02\x02\x02hn\x03" +
		"\x02\x02\x02il\x07\b\x02\x02jm\x05\x12\n\x02km\x05\x0E\b\x02lj\x03\x02" +
		"\x02\x02lk\x03\x02\x02\x02mo\x03\x02\x02\x02ni\x03\x02\x02\x02no\x03\x02" +
		"\x02\x02op\x03\x02\x02\x02pq\x07A\x02\x02q\x90\x05\x18\r\x02rt\x075\x02" +
		"\x02sr\x03\x02\x02\x02st\x03\x02\x02\x02tu\x03\x02\x02\x02uv\x07\x0E\x02" +
		"\x02vx\x07C\x02\x02wy\x05\f\x07\x02xw\x03\x02\x02\x02xy\x03\x02\x02\x02" +
		"y\x7F\x03\x02\x02\x02z}\x07\b\x02\x02{~\x05\x12\n\x02|~\x05\x0E\b\x02" +
		"}{\x03\x02\x02\x02}|\x03\x02\x02\x02~\x80\x03\x02\x02\x02\x7Fz\x03\x02" +
		"\x02\x02\x7F\x80\x03\x02\x02\x02\x80\x81\x03\x02\x02\x02\x81\x82\x07A" +
		"\x02\x02\x82\x90\x05\x18\r\x02\x83\x90\x05\x02\x02\x02\x84\x90\x05\n\x06" +
		"\x02\x85\x86\x07\x0F\x02\x02\x86\x87\x07C\x02\x02\x87\x88\x07A\x02\x02" +
		"\x88\x90\x05\x0E\b\x02\x89\x8D\x07C\x02\x02\x8A\x8D\x05\"\x12\x02\x8B" +
		"\x8D\x05$\x13\x02\x8C\x89\x03\x02\x02\x02\x8C\x8A\x03\x02\x02\x02\x8C" +
		"\x8B\x03\x02\x02\x02\x8D\x8E\x03\x02\x02\x02\x8E\x90\b\x03\x01\x02\x8F" +
		"6\x03\x02\x02\x02\x8F=\x03\x02\x02\x02\x8FD\x03\x02\x02\x02\x8FI\x03\x02" +
		"\x02\x02\x8FM\x03\x02\x02\x02\x8FQ\x03\x02\x02\x02\x8Fb\x03\x02\x02\x02" +
		"\x8Fs\x03\x02\x02\x02\x8F\x83\x03\x02\x02\x02\x8F\x84\x03\x02\x02\x02" +
		"\x8F\x85\x03\x02\x02\x02\x8F\x8C\x03\x02\x02\x02\x90\x05\x03\x02\x02\x02" +
		"\x91\x92\x07\x10\x02\x02\x92\x98\x07C\x02\x02\x93\x96\x07\b\x02\x02\x94" +
		"\x97\x05\x16\f\x02\x95\x97\x05\x0E\b\x02\x96\x94\x03\x02\x02\x02\x96\x95" +
		"\x03\x02\x02\x02\x97\x99\x03\x02\x02\x02\x98\x93\x03\x02\x02\x02\x98\x99" +
		"\x03\x02\x02\x02\x99\x9A\x03\x02\x02\x02\x9A\x9B\x07A\x02\x02\x9B\x9C" +
		"\x05\x18\r\x02\x9C\x07\x03\x02\x02\x02\x9D\x9F\x07\x11\x02\x02\x9E\xA0" +
		"\x07\x12\x02\x02\x9F\x9E\x03\x02\x02\x02\x9F\xA0\x03\x02\x02\x02\xA0\xA1" +
		"\x03\x02\x02\x02\xA1\xA2\x07C\x02\x02\xA2\xA8\x05\f\x07\x02\xA3\xA6\x07" +
		"\b\x02\x02\xA4\xA7\x05\x12\n\x02\xA5\xA7\x05\x0E\b\x02\xA6\xA4\x03\x02" +
		"\x02\x02\xA6\xA5\x03\x02\x02\x02\xA7\xA9\x03\x02\x02\x02\xA8\xA3\x03\x02" +
		"\x02\x02\xA8\xA9\x03\x02\x02\x02\xA9\xAA\x03\x02\x02\x02\xAA\xAB\x07A" +
		"\x02\x02\xAB\xAC\x05\x18\r\x02\xAC\t\x03\x02\x02\x02\xAD\xAE\x07\x13\x02" +
		"\x02\xAE\xAF\t\x02\x02\x02\xAF\xB0\x07A\x02\x02\xB0\xBE\x07C\x02\x02\xB1" +
		"\xB2\x07\x14\x02\x02\xB2\xB3\x07C\x02\x02\xB3\xB4\x07\x15\x02\x02\xB4" +
		"\xBB\x05\x18\r\x02\xB5\xB6\x07\x05\x02\x02\xB6\xB7\x07C\x02\x02\xB7\xB8" +
		"\x07\x15\x02\x02\xB8\xBA\x05\x18\r\x02\xB9\xB5\x03\x02\x02\x02\xBA\xBD" +
		"\x03\x02\x02\x02\xBB\xB9\x03\x02\x02\x02\xBB\xBC\x03\x02\x02\x02\xBC\xBF" +
		"\x03\x02\x02\x02\xBD\xBB\x03\x02\x02\x02\xBE\xB1\x03\x02\x02\x02\xBE\xBF" +
		"\x03\x02\x02\x02\xBF\v\x03\x02\x02\x02\xC0\xC9\x07\x16\x02\x02\xC1\xC6" +
		"\x07C\x02\x02\xC2\xC3\x07\x05\x02\x02\xC3\xC5\x07C\x02\x02\xC4\xC2\x03" +
		"\x02\x02\x02\xC5\xC8\x03\x02\x02\x02\xC6\xC4\x03\x02\x02\x02\xC6\xC7\x03" +
		"\x02\x02\x02\xC7\xCA\x03\x02\x02\x02\xC8\xC6\x03\x02\x02\x02\xC9\xC1\x03" +
		"\x02\x02\x02\xC9\xCA\x03\x02\x02\x02\xCA\xCB\x03\x02\x02\x02\xCB\xCC\x07" +
		"\x17\x02\x02\xCC\r\x03\x02\x02\x02\xCD\xCE\b\b\x01\x02\xCE\xD7\x07\x16" +
		"\x02\x02\xCF\xD4\x05\x0E\b\x02\xD0\xD1\x07\x05\x02\x02\xD1\xD3\x05\x0E" +
		"\b\x02\xD2\xD0\x03\x02\x02\x02\xD3\xD6\x03\x02\x02\x02\xD4\xD2\x03\x02" +
		"\x02\x02\xD4\xD5\x03\x02\x02\x02\xD5\xD8\x03\x02\x02\x02\xD6\xD4\x03\x02" +
		"\x02\x02\xD7\xCF\x03\x02\x02\x02\xD7\xD8\x03\x02\x02\x02\xD8\xD9\x03\x02" +
		"\x02\x02\xD9\xDA\x07\x17\x02\x02\xDA\xDB\x07\x19\x02\x02\xDB\u0110\x05" +
		"\x0E\b\r\xDC\xDD\x07\x1A\x02\x02\xDD\xDE\x07\x16\x02\x02\xDE\xDF\x05\x0E" +
		"\b\x02\xDF\xE0\x07\x17\x02\x02\xE0\u0110\x03\x02\x02\x02\xE1\xE2\x07\x1B" +
		"\x02\x02\xE2\xE3\x07\x16\x02\x02\xE3\xE4\x05\x0E\b\x02\xE4\xE5\x07\x17" +
		"\x02\x02\xE5\u0110\x03\x02\x02\x02\xE6\xE7\x07\x16\x02\x02\xE7\xE8\x05" +
		"\x0E\b\x02\xE8\xE9\x07\x05\x02\x02\xE9\xEE\x05\x0E\b\x02\xEA\xEB\x07\x05" +
		"\x02\x02\xEB\xED\x05\x0E\b\x02\xEC\xEA\x03\x02\x02\x02\xED\xF0\x03\x02" +
		"\x02\x02\xEE\xEC\x03\x02\x02\x02\xEE\xEF\x03\x02\x02\x02\xEF\xF1\x03\x02" +
		"\x02\x02\xF0\xEE\x03\x02\x02\x02\xF1\xF2\x07\x17\x02\x02\xF2\u0110\x03" +
		"\x02\x02\x02\xF3\xF4\x07\x1C\x02\x02\xF4\xF5\x07C\x02\x02\xF5\xF6\x07" +
		"\b\x02\x02\xF6\xFD\x05\x0E\b\x02\xF7\xF8\x07\x05\x02\x02\xF8\xF9\x07C" +
		"\x02\x02\xF9\xFA\x07\b\x02\x02\xFA\xFC\x05\x0E\b\x02\xFB\xF7\x03\x02\x02" +
		"\x02\xFC\xFF\x03\x02\x02\x02\xFD\xFB\x03\x02\x02\x02\xFD\xFE\x03\x02\x02" +
		"\x02\xFE\u0100\x03\x02\x02\x02\xFF\xFD\x03\x02\x02\x02\u0100\u0101\x07" +
		"\x1D\x02\x02\u0101\u0110\x03\x02\x02\x02\u0102\u0104\x05\x10\t\x02\u0103" +
		"\u0102\x03\x02\x02\x02\u0104\u0105\x03\x02\x02\x02\u0105\u0103\x03\x02" +
		"\x02\x02\u0105\u0106\x03\x02\x02\x02\u0106\u0110\x03\x02\x02\x02\u0107" +
		"\u0110\x07\x1E\x02\x02\u0108\u0110\x07\x1F\x02\x02\u0109\u0110\x07 \x02" +
		"\x02\u010A\u0110\x07C\x02\x02\u010B\u010C\x07\x16\x02\x02\u010C\u010D" +
		"\x05\x0E\b\x02\u010D\u010E\x07\x17\x02\x02\u010E\u0110\x03\x02\x02\x02" +
		"\u010F\xCD\x03\x02\x02\x02\u010F\xDC\x03\x02\x02\x02\u010F\xE1\x03\x02" +
		"\x02\x02\u010F\xE6\x03\x02\x02\x02\u010F\xF3\x03\x02\x02\x02\u010F\u0103" +
		"\x03\x02\x02\x02\u010F\u0107\x03\x02\x02\x02\u010F\u0108\x03\x02\x02\x02" +
		"\u010F\u0109\x03\x02\x02\x02\u010F\u010A\x03\x02\x02\x02\u010F\u010B\x03" +
		"\x02\x02\x02\u0110\u0116\x03\x02\x02\x02\u0111\u0112\f\x0E\x02\x02\u0112" +
		"\u0113\x07\x18\x02\x02\u0113\u0115\x05\x0E\b\x0F\u0114\u0111\x03\x02\x02" +
		"\x02\u0115\u0118\x03\x02\x02\x02\u0116\u0114\x03\x02\x02\x02\u0116\u0117" +
		"\x03\x02\x02\x02\u0117\x0F\x03\x02\x02\x02\u0118\u0116\x03\x02\x02\x02" +
		"\u0119\u011A\x07!\x02\x02\u011A\u011B\x07\x1C\x02\x02\u011B\u011C\x07" +
		"C\x02\x02\u011C\u011D\x07\b\x02\x02\u011D\u0124\x07+\x02\x02\u011E\u011F" +
		"\x07\x05\x02\x02\u011F\u0120\x07C\x02\x02\u0120\u0121\x07\b\x02\x02\u0121" +
		"\u0123\x05\x0E\b\x02\u0122\u011E\x03\x02\x02\x02\u0123\u0126\x03\x02\x02" +
		"\x02\u0124\u0122\x03\x02\x02\x02\u0124\u0125\x03\x02\x02\x02\u0125\u0127" +
		"\x03\x02\x02\x02\u0126\u0124\x03\x02\x02\x02\u0127\u0128\x07\x1D\x02\x02" +
		"\u0128\x11\x03\x02\x02\x02\u0129\u0132\x07\x16\x02\x02\u012A\u012F\x05" +
		"\x14\v\x02\u012B\u012C\x07\x05\x02\x02\u012C\u012E\x05\x14\v\x02\u012D" +
		"\u012B\x03\x02\x02\x02\u012E\u0131\x03\x02\x02\x02\u012F\u012D\x03\x02" +
		"\x02\x02\u012F\u0130\x03\x02\x02\x02\u0130\u0133\x03\x02\x02\x02\u0131" +
		"\u012F\x03\x02\x02\x02\u0132\u012A\x03\x02\x02\x02\u0132\u0133\x03\x02" +
		"\x02\x02\u0133\u0134\x03\x02\x02\x02\u0134\u0135\x07\x17\x02\x02\u0135" +
		"\u0136\x07\x19\x02\x02\u0136\u013D\x07\v\x02\x02\u0137\u013D\x05\x14\v" +
		"\x02\u0138\u0139\x07\x16\x02\x02\u0139\u013A\x05\x12\n\x02\u013A\u013B" +
		"\x07\x17\x02\x02\u013B\u013D\x03\x02\x02\x02\u013C\u0129\x03\x02\x02\x02" +
		"\u013C\u0137\x03\x02\x02\x02\u013C\u0138\x03\x02\x02\x02\u013D\x13\x03" +
		"\x02\x02\x02\u013E\u0147\x07\x16\x02\x02\u013F\u0144\x07\v\x02\x02\u0140" +
		"\u0141\x07\x05\x02\x02\u0141\u0143\x07\v\x02\x02\u0142\u0140\x03\x02\x02" +
		"\x02\u0143\u0146\x03\x02\x02\x02\u0144\u0142\x03\x02\x02\x02\u0144\u0145" +
		"\x03\x02\x02\x02\u0145\u0148\x03\x02\x02\x02\u0146\u0144\x03\x02\x02\x02" +
		"\u0147\u013F\x03\x02\x02\x02\u0147\u0148\x03\x02\x02\x02\u0148\u0149\x03" +
		"\x02\x02\x02\u0149\u014A\x07\x17\x02\x02\u014A\u014B\x07\x19\x02\x02\u014B" +
		"\u014E\x07\v\x02\x02\u014C\u014E\x05\x16\f\x02\u014D\u013E\x03\x02\x02" +
		"\x02\u014D\u014C\x03\x02\x02\x02\u014E\x15\x03\x02\x02\x02\u014F\u0156" +
		"\x07\v\x02\x02\u0150\u0151\x07\x16\x02\x02\u0151\u0152\x07\v\x02\x02\u0152" +
		"\u0156\b\f\x01\x02\u0153\u0154\x07\x16\x02\x02\u0154\u0156\b\f\x01\x02" +
		"\u0155\u014F\x03\x02\x02\x02\u0155\u0150\x03\x02\x02\x02\u0155\u0153\x03" +
		"\x02\x02\x02\u0156\x17\x03\x02\x02\x02\u0157\u0158\b\r\x01\x02\u0158\u0159" +
		"\x07C\x02\x02\u0159\u015B\x07\x16\x02\x02\u015A\u015C\x05\x1E\x10\x02" +
		"\u015B\u015A\x03\x02\x02\x02\u015B\u015C\x03\x02\x02\x02\u015C\u015D\x03" +
		"\x02\x02\x02\u015D\u0218\x07\x17\x02\x02\u015E\u015F\x077\x02\x02\u015F" +
		"\u0218\x05\x18\r\x19\u0160\u0161\x07&\x02\x02\u0161\u0162\x07\x16\x02" +
		"\x02\u0162\u0163\x05\x18\r\x02\u0163\u0164\x07\x17\x02\x02\u0164\u0165" +
		"\x05\x18\r\x02\u0165\u0166\x07\'\x02\x02\u0166\u0167\x05\x18\r\x15\u0167" +
		"\u0218\x03\x02\x02\x02\u0168\u0169\x07(\x02\x02\u0169\u016B\x07\x1C\x02" +
		"\x02\u016A\u016C\x07!\x02\x02\u016B\u016A\x03\x02\x02\x02\u016B\u016C" +
		"\x03\x02\x02\x02\u016C\u016D\x03\x02\x02\x02\u016D\u016E\x05\x18\r\x02" +
		"\u016E\u016F\x07\x18\x02\x02\u016F\u0177\x05\x18\r\x02\u0170\u0171\x07" +
		"!\x02\x02\u0171\u0172\x05\x18\r\x02\u0172\u0173\x07\x18\x02\x02\u0173" +
		"\u0174\x05\x18\r\x02\u0174\u0176\x03\x02\x02\x02\u0175\u0170\x03\x02\x02" +
		"\x02\u0176\u0179\x03\x02\x02\x02\u0177\u0175\x03\x02\x02\x02\u0177\u0178" +
		"\x03\x02\x02\x02\u0178\u017E\x03\x02\x02\x02\u0179\u0177\x03\x02\x02\x02" +
		"\u017A\u017B\x07!\x02\x02\u017B\u017C\x07\v\x02\x02\u017C\u017D\x07\x18" +
		"\x02\x02\u017D\u017F\x05\x18\r\x02\u017E\u017A\x03\x02\x02\x02\u017E\u017F" +
		"\x03\x02\x02\x02\u017F\u0180\x03\x02\x02\x02\u0180\u0181\x07\x1D\x02\x02" +
		"\u0181\u0218\x03\x02\x02\x02\u0182\u0184\x07\x1C\x02\x02\u0183\u0185\x07" +
		")\x02\x02\u0184\u0183\x03\x02\x02\x02\u0184\u0185\x03\x02\x02\x02\u0185" +
		"\u0186\x03\x02\x02\x02\u0186\u0187\x05\x18\r\x02\u0187\u0188\x07)\x02" +
		"\x02\u0188\u018D\x05\x18\r\x02\u0189\u018A\x07)\x02\x02\u018A\u018C\x05" +
		"\x18\r\x02\u018B\u0189\x03\x02\x02\x02\u018C\u018F\x03\x02\x02\x02\u018D" +
		"\u018B\x03\x02\x02\x02\u018D\u018E\x03\x02\x02\x02\u018E\u0190\x03\x02" +
		"\x02\x02\u018F\u018D\x03\x02\x02\x02\u0190\u0191\x07\x1D\x02\x02\u0191" +
		"\u0218\x03\x02\x02\x02\u0192\u0194\x07\x1C\x02\x02\u0193\u0195\x07!\x02" +
		"\x02\u0194\u0193\x03\x02\x02\x02\u0194\u0195\x03\x02\x02\x02\u0195\u0196" +
		"\x03\x02\x02\x02\u0196\u0197\x05\x18\r\x02\u0197\u0198\x07!\x02\x02\u0198" +
		"\u019D\x05\x18\r\x02\u0199\u019A\x07!\x02\x02\u019A\u019C\x05\x18\r\x02" +
		"\u019B\u0199\x03\x02\x02\x02\u019C\u019F\x03\x02\x02\x02\u019D\u019B\x03" +
		"\x02\x02\x02\u019D\u019E\x03\x02\x02\x02\u019E\u01A0\x03\x02\x02\x02\u019F" +
		"\u019D\x03\x02\x02\x02\u01A0\u01A1\x07\x1D\x02\x02\u01A1\u0218\x03\x02" +
		"\x02\x02\u01A2\u0218\t\x03\x02\x02\u01A3\u01A4\x07\x16\x02\x02\u01A4\u01A5" +
		"\x05\x18\r\x02\u01A5\u01A6\x07\x05\x02\x02\u01A6\u01AB\x05\x18\r\x02\u01A7" +
		"\u01A8\x07\x05\x02\x02\u01A8\u01AA\x05\x18\r\x02\u01A9\u01A7\x03\x02\x02" +
		"\x02\u01AA\u01AD\x03\x02\x02\x02\u01AB\u01A9\x03\x02\x02\x02\u01AB\u01AC" +
		"\x03\x02\x02\x02\u01AC\u01AE\x03\x02\x02\x02\u01AD\u01AB\x03\x02\x02\x02" +
		"\u01AE\u01AF\x07\x17\x02\x02\u01AF\u0218\x03\x02\x02\x02\u01B0\u01B9\x07" +
		"*\x02\x02\u01B1\u01B6\x05\x18\r\x02\u01B2\u01B3\x07\x05\x02\x02\u01B3" +
		"\u01B5\x05\x18\r\x02\u01B4\u01B2\x03\x02\x02\x02\u01B5\u01B8\x03\x02\x02" +
		"\x02\u01B6\u01B4\x03\x02\x02\x02\u01B6\u01B7\x03\x02\x02\x02\u01B7\u01BA" +
		"\x03\x02\x02\x02\u01B8\u01B6\x03\x02\x02\x02\u01B9\u01B1\x03\x02\x02\x02" +
		"\u01B9\u01BA\x03\x02\x02\x02\u01BA\u01BB\x03\x02\x02\x02\u01BB\u01CA\x07" +
		"\x1D\x02\x02\u01BC\u01BD\x07\x1A\x02\x02\u01BD\u01C6\x07\x16\x02\x02\u01BE" +
		"\u01C3\x05\x18\r\x02\u01BF\u01C0\x07\x05\x02\x02\u01C0\u01C2\x05\x18\r" +
		"\x02\u01C1\u01BF\x03\x02\x02\x02\u01C2\u01C5\x03\x02\x02\x02\u01C3\u01C1" +
		"\x03\x02\x02\x02\u01C3\u01C4\x03\x02\x02\x02\u01C4\u01C7\x03\x02\x02\x02" +
		"\u01C5\u01C3\x03\x02\x02\x02\u01C6\u01BE\x03\x02\x02\x02\u01C6\u01C7\x03" +
		"\x02\x02\x02\u01C7\u01C8\x03\x02\x02\x02\u01C8\u01CA\x07\x17\x02\x02\u01C9" +
		"\u01B0\x03\x02\x02\x02\u01C9\u01BC\x03\x02\x02\x02\u01CA\u0218\x03\x02" +
		"\x02\x02\u01CB\u01CC\x07\x1C\x02\x02\u01CC\u01CD\x07C\x02\x02\u01CD\u01CE" +
		"\x07\b\x02\x02\u01CE\u01D5\x05\x18\r\x02\u01CF\u01D0\x07\x05\x02\x02\u01D0" +
		"\u01D1\x07C\x02\x02\u01D1\u01D2\x07\b\x02\x02\u01D2\u01D4\x05\x18\r\x02" +
		"\u01D3\u01CF\x03\x02\x02\x02\u01D4\u01D7\x03\x02\x02\x02\u01D5\u01D3\x03" +
		"\x02\x02\x02\u01D5\u01D6\x03\x02\x02\x02\u01D6\u01D8\x03\x02\x02\x02\u01D7" +
		"\u01D5\x03\x02\x02\x02\u01D8\u01D9\x07\x1D\x02\x02\u01D9\u0218\x03\x02" +
		"\x02\x02\u01DA\u01DB\x07#\x02\x02\u01DB\u01DC\x07C\x02\x02\u01DC\u01DD" +
		"\x073\x02\x02\u01DD\u01E4\x05\x18\r\x02\u01DE\u01DF\x07\x05\x02\x02\u01DF" +
		"\u01E0\x07C\x02\x02\u01E0\u01E1\x073\x02\x02\u01E1\u01E3\x05\x18\r\x02" +
		"\u01E2\u01DE\x03\x02\x02\x02\u01E3\u01E6\x03\x02\x02\x02\u01E4\u01E2\x03" +
		"\x02\x02\x02\u01E4\u01E5\x03\x02\x02\x02\u01E5\u01E7\x03\x02\x02\x02\u01E6" +
		"\u01E4\x03\x02\x02\x02\u01E7\u01E8\x07$\x02\x02\u01E8\u0218\x03\x02\x02" +
		"\x02\u01E9\u01F2\x07#\x02\x02\u01EA\u01EF\x05\x18\r\x02\u01EB\u01EC\x07" +
		"\x05\x02\x02\u01EC\u01EE\x05\x18\r\x02\u01ED\u01EB\x03\x02\x02\x02\u01EE" +
		"\u01F1\x03\x02\x02\x02\u01EF\u01ED\x03\x02\x02\x02\u01EF\u01F0\x03\x02" +
		"\x02\x02\u01F0\u01F3\x03\x02\x02\x02\u01F1\u01EF\x03\x02\x02\x02\u01F2" +
		"\u01EA\x03\x02\x02\x02\u01F2\u01F3\x03\x02\x02\x02\u01F3\u01F4\x03\x02" +
		"\x02\x02\u01F4\u0203\x07$\x02\x02\u01F5\u01F6\x07\x1B\x02\x02\u01F6\u01FF" +
		"\x07\x16\x02\x02\u01F7\u01FC\x05\x18\r\x02\u01F8\u01F9\x07\x05\x02\x02" +
		"\u01F9\u01FB\x05\x18\r\x02\u01FA\u01F8\x03\x02\x02\x02\u01FB\u01FE\x03" +
		"\x02\x02\x02\u01FC\u01FA\x03\x02\x02\x02\u01FC\u01FD\x03\x02\x02\x02\u01FD" +
		"\u0200\x03\x02\x02\x02\u01FE\u01FC\x03\x02\x02\x02\u01FF\u01F7\x03\x02" +
		"\x02\x02\u01FF\u0200\x03\x02\x02\x02\u0200\u0201\x03\x02\x02\x02\u0201" +
		"\u0203\x07\x17\x02\x02\u0202\u01E9\x03\x02\x02\x02\u0202\u01F5\x03\x02" +
		"\x02\x02\u0203\u0218\x03\x02\x02\x02\u0204\u0205\x05\x06\x04\x02\u0205" +
		"\u0206\x05\x18\r\x02\u0206\u020B\x03\x02\x02\x02\u0207\u0208\x05\b\x05" +
		"\x02\u0208\u0209\x05\x18\r\x02\u0209\u020B\x03\x02\x02\x02\u020A\u0204" +
		"\x03\x02\x02\x02\u020A\u0207\x03\x02\x02\x02\u020B\u0218\x03";
	private static readonly _serializedATNSegment1: string =
		"\x02\x02\x02\u020C\u020D\x07\x16\x02\x02\u020D\u020E\x05\x18\r\x02\u020E" +
		"\u020F\x07\x17\x02\x02\u020F\u0218\x03\x02\x02\x02\u0210\u0213\x07\x1C" +
		"\x02\x02\u0211\u0214\x05\x1A\x0E\x02\u0212\u0214\x05\x18\r\x02\u0213\u0211" +
		"\x03\x02\x02\x02\u0213\u0212\x03\x02\x02\x02\u0214\u0215\x03\x02\x02\x02" +
		"\u0215\u0216\x07\x1D\x02\x02\u0216\u0218\x03\x02\x02\x02\u0217\u0157\x03" +
		"\x02\x02\x02\u0217\u015E\x03\x02\x02\x02\u0217\u0160\x03\x02\x02\x02\u0217" +
		"\u0168\x03\x02\x02\x02\u0217\u0182\x03\x02\x02\x02\u0217\u0192\x03\x02" +
		"\x02\x02\u0217\u01A2\x03\x02\x02\x02\u0217\u01A3\x03\x02\x02\x02\u0217" +
		"\u01C9\x03\x02\x02\x02\u0217\u01CB\x03\x02\x02\x02\u0217\u01DA\x03\x02" +
		"\x02\x02\u0217\u0202\x03\x02\x02\x02\u0217\u020A\x03\x02\x02\x02\u0217" +
		"\u020C\x03\x02\x02\x02\u0217\u0210\x03\x02\x02\x02\u0218\u0249\x03\x02" +
		"\x02\x02\u0219\u021A\f\x18\x02\x02\u021A\u021B\x07%\x02\x02\u021B\u0248" +
		"\x05\x18\r\x18\u021C\u021D\f\x17\x02\x02\u021D\u021E\t\x04\x02\x02\u021E" +
		"\u0248\x05\x18\r\x18\u021F\u0220\f\x16\x02\x02\u0220\u0221\t\x05\x02\x02" +
		"\u0221\u0248\x05\x18\r\x17\u0222\u0223\f\x12\x02\x02\u0223\u0224\t\x06" +
		"\x02\x02\u0224\u0248\x05\x18\r\x13\u0225\u0226\f\x11\x02\x02\u0226\u0227" +
		"\x07.\x02\x02\u0227\u0248\x05\x18\r\x12\u0228\u0229\f\x10\x02\x02\u0229" +
		"\u022A\x07/\x02\x02\u022A\u0248\x05\x18\r\x11\u022B\u022C\f\x0F\x02\x02" +
		"\u022C\u022D\x070\x02\x02\u022D\u0248\x05\x18\r\x10\u022E\u022F\f\x0E" +
		"\x02\x02\u022F\u0230\x071\x02\x02\u0230\u0248\x05\x18\r\x0F\u0231\u0232" +
		"\f\x1C\x02\x02\u0232\u0233\x07\"\x02\x02\u0233\u023B\x05 \x11\x02\u0234" +
		"\u0237\x07\x16\x02\x02\u0235\u0238\x05\x1A\x0E\x02\u0236\u0238\x05\x1E" +
		"\x10\x02\u0237\u0235\x03\x02\x02\x02\u0237\u0236\x03\x02\x02\x02\u0238" +
		"\u0239\x03\x02\x02\x02\u0239\u023A\x07\x17\x02\x02\u023A\u023C\x03\x02" +
		"\x02\x02\u023B\u0234\x03\x02\x02\x02\u023B\u023C\x03\x02\x02\x02\u023C" +
		"\u0248\x03\x02\x02\x02\u023D\u023E\f\x1A\x02\x02\u023E\u023F\x07#\x02" +
		"\x02\u023F\u0240\x05\x18\r\x02\u0240\u0241\x07$\x02\x02\u0241\u0248\x03" +
		"\x02\x02\x02\u0242\u0243\f\x13\x02\x02\u0243\u0245\x07C\x02\x02\u0244" +
		"\u0246\x05\x1E\x10\x02\u0245\u0244\x03\x02\x02\x02\u0245\u0246\x03\x02" +
		"\x02\x02\u0246\u0248\x03\x02\x02\x02\u0247\u0219\x03\x02\x02\x02\u0247" +
		"\u021C\x03\x02\x02\x02\u0247\u021F\x03\x02\x02\x02\u0247\u0222\x03\x02" +
		"\x02\x02\u0247\u0225\x03\x02\x02\x02\u0247\u0228\x03\x02\x02\x02\u0247" +
		"\u022B\x03\x02\x02\x02\u0247\u022E\x03\x02\x02\x02\u0247\u0231\x03\x02" +
		"\x02\x02\u0247\u023D\x03\x02\x02\x02\u0247\u0242\x03\x02\x02\x02\u0248" +
		"\u024B\x03\x02\x02\x02\u0249\u0247\x03\x02\x02\x02\u0249\u024A\x03\x02" +
		"\x02\x02\u024A\x19\x03\x02\x02\x02\u024B\u0249\x03\x02\x02\x02\u024C\u024D" +
		"\x05\x1C\x0F\x02\u024D\u024E\x07\x18\x02\x02\u024E\u024F\x05\x18\r\x02" +
		"\u024F\x1B\x03\x02\x02\x02\u0250\u0251\x07\x16\x02\x02\u0251\u0256\x05" +
		"\x1C\x0F\x02\u0252\u0253\x07\x05\x02\x02\u0253\u0255\x05\x1C\x0F\x02\u0254" +
		"\u0252\x03\x02\x02\x02\u0255\u0258\x03\x02\x02\x02\u0256\u0254\x03\x02" +
		"\x02\x02\u0256\u0257\x03\x02\x02\x02\u0257\u0259\x03\x02\x02\x02\u0258" +
		"\u0256\x03\x02\x02\x02\u0259\u025A\x07\x17\x02\x02\u025A\u025D\x03\x02" +
		"\x02\x02\u025B\u025D\t\x02\x02\x02\u025C\u0250\x03\x02\x02\x02\u025C\u025B" +
		"\x03\x02\x02\x02\u025D\x1D\x03\x02\x02\x02\u025E\u0263\x05\x18\r\x02\u025F" +
		"\u0260\x07\x05\x02\x02\u0260\u0262\x05\x18\r\x02\u0261\u025F\x03\x02\x02" +
		"\x02\u0262\u0265\x03\x02\x02\x02\u0263\u0261\x03\x02\x02\x02\u0263\u0264" +
		"\x03\x02\x02\x02\u0264\x1F\x03\x02\x02\x02\u0265\u0263\x03\x02\x02\x02" +
		"\u0266\u0267\t\x07\x02\x02\u0267!\x03\x02\x02\x02\u0268\u0269\t\b\x02" +
		"\x02\u0269#\x03\x02\x02\x02\u026A\u026B\t\t\x02\x02\u026B%\x03\x02\x02" +
		"\x02N,1;BIMQV[]bglnsx}\x7F\x8C\x8F\x96\x98\x9F\xA6\xA8\xBB\xBE\xC6\xC9" +
		"\xD4\xD7\xEE\xFD\u0105\u010F\u0116\u0124\u012F\u0132\u013C\u0144\u0147" +
		"\u014D\u0155\u015B\u016B\u0177\u017E\u0184\u018D\u0194\u019D\u01AB\u01B6" +
		"\u01B9\u01C3\u01C6\u01C9\u01D5\u01E4\u01EF\u01F2\u01FC\u01FF\u0202\u020A" +
		"\u0213\u0217\u0237\u023B\u0245\u0247\u0249\u0256\u025C\u0263";
	public static readonly _serializedATN: string = Utils.join(
		[
			TntParser._serializedATNSegment0,
			TntParser._serializedATNSegment1,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TntParser.__ATN) {
			TntParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TntParser._serializedATN));
		}

		return TntParser.__ATN;
	}

}

export class ModuleContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public unit(): UnitContext[];
	public unit(i: number): UnitContext;
	public unit(i?: number): UnitContext | UnitContext[] {
		if (i === undefined) {
			return this.getRuleContexts(UnitContext);
		} else {
			return this.getRuleContext(i, UnitContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_module; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterModule) {
			listener.enterModule(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitModule) {
			listener.exitModule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitModule) {
			return visitor.visitModule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnitContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_unit; }
	public copyFrom(ctx: UnitContext): void {
		super.copyFrom(ctx);
	}
}
export class ConstContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public untyped01(): Untyped01Context | undefined {
		return this.tryGetRuleContext(0, Untyped01Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterConst) {
			listener.enterConst(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitConst) {
			listener.exitConst(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitConst) {
			return visitor.visitConst(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class VarContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public untyped0(): Untyped0Context | undefined {
		return this.tryGetRuleContext(0, Untyped0Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterVar) {
			listener.enterVar(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitVar) {
			listener.exitVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitVar) {
			return visitor.visitVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AssumeContext extends UnitContext {
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterAssume) {
			listener.enterAssume(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAssume) {
			listener.exitAssume(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAssume) {
			return visitor.visitAssume(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValContext extends UnitContext {
	public valDef(): ValDefContext {
		return this.getRuleContext(0, ValDefContext);
	}
	public PRIVATE(): TerminalNode | undefined { return this.tryGetToken(TntParser.PRIVATE, 0); }
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterVal) {
			listener.enterVal(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitVal) {
			listener.exitVal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitVal) {
			return visitor.visitVal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperContext extends UnitContext {
	public operDef(): OperDefContext {
		return this.getRuleContext(0, OperDefContext);
	}
	public PRIVATE(): TerminalNode | undefined { return this.tryGetToken(TntParser.PRIVATE, 0); }
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOper) {
			listener.enterOper(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOper) {
			listener.exitOper(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOper) {
			return visitor.visitOper(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PredContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public PRIVATE(): TerminalNode | undefined { return this.tryGetToken(TntParser.PRIVATE, 0); }
	public params(): ParamsContext | undefined {
		return this.tryGetRuleContext(0, ParamsContext);
	}
	public untyped012(): Untyped012Context | undefined {
		return this.tryGetRuleContext(0, Untyped012Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterPred) {
			listener.enterPred(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPred) {
			listener.exitPred(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPred) {
			return visitor.visitPred(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ActionContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public PRIVATE(): TerminalNode | undefined { return this.tryGetToken(TntParser.PRIVATE, 0); }
	public params(): ParamsContext | undefined {
		return this.tryGetRuleContext(0, ParamsContext);
	}
	public untyped012(): Untyped012Context | undefined {
		return this.tryGetRuleContext(0, Untyped012Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterAction) {
			listener.enterAction(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAction) {
			listener.exitAction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAction) {
			return visitor.visitAction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TemporalContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public PRIVATE(): TerminalNode | undefined { return this.tryGetToken(TntParser.PRIVATE, 0); }
	public params(): ParamsContext | undefined {
		return this.tryGetRuleContext(0, ParamsContext);
	}
	public untyped012(): Untyped012Context | undefined {
		return this.tryGetRuleContext(0, Untyped012Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTemporal) {
			listener.enterTemporal(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTemporal) {
			listener.exitTemporal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTemporal) {
			return visitor.visitTemporal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ModuleNestedContext extends UnitContext {
	public module(): ModuleContext {
		return this.getRuleContext(0, ModuleContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterModuleNested) {
			listener.enterModuleNested(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitModuleNested) {
			listener.exitModuleNested(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitModuleNested) {
			return visitor.visitModuleNested(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InstanceContext extends UnitContext {
	public instanceDef(): InstanceDefContext {
		return this.getRuleContext(0, InstanceDefContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterInstance) {
			listener.enterInstance(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitInstance) {
			listener.exitInstance(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitInstance) {
			return visitor.visitInstance(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeDefContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeDef) {
			listener.enterTypeDef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeDef) {
			listener.exitTypeDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeDef) {
			return visitor.visitTypeDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ErrorCaseContext extends UnitContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	public operator(): OperatorContext | undefined {
		return this.tryGetRuleContext(0, OperatorContext);
	}
	public literal(): LiteralContext | undefined {
		return this.tryGetRuleContext(0, LiteralContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterErrorCase) {
			listener.enterErrorCase(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitErrorCase) {
			listener.exitErrorCase(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitErrorCase) {
			return visitor.visitErrorCase(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValDefContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public untyped0(): Untyped0Context | undefined {
		return this.tryGetRuleContext(0, Untyped0Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_valDef; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterValDef) {
			listener.enterValDef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitValDef) {
			listener.exitValDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitValDef) {
			return visitor.visitValDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperDefContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public params(): ParamsContext {
		return this.getRuleContext(0, ParamsContext);
	}
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public untyped012(): Untyped012Context | undefined {
		return this.tryGetRuleContext(0, Untyped012Context);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_operDef; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOperDef) {
			listener.enterOperDef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOperDef) {
			listener.exitOperDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOperDef) {
			return visitor.visitOperDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InstanceDefContext extends ParserRuleContext {
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_instanceDef; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterInstanceDef) {
			listener.enterInstanceDef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitInstanceDef) {
			listener.exitInstanceDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitInstanceDef) {
			return visitor.visitInstanceDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamsContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_params; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterParams) {
			listener.enterParams(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitParams) {
			listener.exitParams(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitParams) {
			return visitor.visitParams(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_type; }
	public copyFrom(ctx: TypeContext): void {
		super.copyFrom(ctx);
	}
}
export class TypeFunContext extends TypeContext {
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeFun) {
			listener.enterTypeFun(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeFun) {
			listener.exitTypeFun(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeFun) {
			return visitor.visitTypeFun(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeOperContext extends TypeContext {
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeOper) {
			listener.enterTypeOper(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeOper) {
			listener.exitTypeOper(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeOper) {
			return visitor.visitTypeOper(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeSetContext extends TypeContext {
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeSet) {
			listener.enterTypeSet(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeSet) {
			listener.exitTypeSet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeSet) {
			return visitor.visitTypeSet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeSeqContext extends TypeContext {
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeSeq) {
			listener.enterTypeSeq(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeSeq) {
			listener.exitTypeSeq(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeSeq) {
			return visitor.visitTypeSeq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeTupleContext extends TypeContext {
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeTuple) {
			listener.enterTypeTuple(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeTuple) {
			listener.exitTypeTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeTuple) {
			return visitor.visitTypeTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeRecContext extends TypeContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeRec) {
			listener.enterTypeRec(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeRec) {
			listener.exitTypeRec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeRec) {
			return visitor.visitTypeRec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeUnionRecContext extends TypeContext {
	public typeUnionRecOne(): TypeUnionRecOneContext[];
	public typeUnionRecOne(i: number): TypeUnionRecOneContext;
	public typeUnionRecOne(i?: number): TypeUnionRecOneContext | TypeUnionRecOneContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeUnionRecOneContext);
		} else {
			return this.getRuleContext(i, TypeUnionRecOneContext);
		}
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeUnionRec) {
			listener.enterTypeUnionRec(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeUnionRec) {
			listener.exitTypeUnionRec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeUnionRec) {
			return visitor.visitTypeUnionRec(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeIntContext extends TypeContext {
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeInt) {
			listener.enterTypeInt(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeInt) {
			listener.exitTypeInt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeInt) {
			return visitor.visitTypeInt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeStrContext extends TypeContext {
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeStr) {
			listener.enterTypeStr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeStr) {
			listener.exitTypeStr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeStr) {
			return visitor.visitTypeStr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeBoolContext extends TypeContext {
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeBool) {
			listener.enterTypeBool(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeBool) {
			listener.exitTypeBool(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeBool) {
			return visitor.visitTypeBool(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeConstOrVarContext extends TypeContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeConstOrVar) {
			listener.enterTypeConstOrVar(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeConstOrVar) {
			listener.exitTypeConstOrVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeConstOrVar) {
			return visitor.visitTypeConstOrVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeParenContext extends TypeContext {
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeParen) {
			listener.enterTypeParen(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeParen) {
			listener.exitTypeParen(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeParen) {
			return visitor.visitTypeParen(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeUnionRecOneContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public STRING(): TerminalNode { return this.getToken(TntParser.STRING, 0); }
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_typeUnionRecOne; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeUnionRecOne) {
			listener.enterTypeUnionRecOne(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeUnionRecOne) {
			listener.exitTypeUnionRecOne(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeUnionRecOne) {
			return visitor.visitTypeUnionRecOne(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Untyped012Context extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_untyped012; }
	public copyFrom(ctx: Untyped012Context): void {
		super.copyFrom(ctx);
	}
}
export class Untyped2SigContext extends Untyped012Context {
	public untyped01(): Untyped01Context[];
	public untyped01(i: number): Untyped01Context;
	public untyped01(i?: number): Untyped01Context | Untyped01Context[] {
		if (i === undefined) {
			return this.getRuleContexts(Untyped01Context);
		} else {
			return this.getRuleContext(i, Untyped01Context);
		}
	}
	constructor(ctx: Untyped012Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped2Sig) {
			listener.enterUntyped2Sig(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped2Sig) {
			listener.exitUntyped2Sig(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped2Sig) {
			return visitor.visitUntyped2Sig(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Untyped2LowerContext extends Untyped012Context {
	public untyped01(): Untyped01Context {
		return this.getRuleContext(0, Untyped01Context);
	}
	constructor(ctx: Untyped012Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped2Lower) {
			listener.enterUntyped2Lower(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped2Lower) {
			listener.exitUntyped2Lower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped2Lower) {
			return visitor.visitUntyped2Lower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Untyped2ParenContext extends Untyped012Context {
	public untyped012(): Untyped012Context {
		return this.getRuleContext(0, Untyped012Context);
	}
	constructor(ctx: Untyped012Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped2Paren) {
			listener.enterUntyped2Paren(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped2Paren) {
			listener.exitUntyped2Paren(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped2Paren) {
			return visitor.visitUntyped2Paren(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Untyped01Context extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_untyped01; }
	public copyFrom(ctx: Untyped01Context): void {
		super.copyFrom(ctx);
	}
}
export class Untyped1Context extends Untyped01Context {
	constructor(ctx: Untyped01Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped1) {
			listener.enterUntyped1(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped1) {
			listener.exitUntyped1(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped1) {
			return visitor.visitUntyped1(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Untyped1LowerContext extends Untyped01Context {
	public untyped0(): Untyped0Context {
		return this.getRuleContext(0, Untyped0Context);
	}
	constructor(ctx: Untyped01Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped1Lower) {
			listener.enterUntyped1Lower(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped1Lower) {
			listener.exitUntyped1Lower(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped1Lower) {
			return visitor.visitUntyped1Lower(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Untyped0Context extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_untyped0; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUntyped0) {
			listener.enterUntyped0(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUntyped0) {
			listener.exitUntyped0(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUntyped0) {
			return visitor.visitUntyped0(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_expr; }
	public copyFrom(ctx: ExprContext): void {
		super.copyFrom(ctx);
	}
}
export class DotCallContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public name_after_dot(): Name_after_dotContext {
		return this.getRuleContext(0, Name_after_dotContext);
	}
	public lambda(): LambdaContext | undefined {
		return this.tryGetRuleContext(0, LambdaContext);
	}
	public arg_list(): Arg_listContext | undefined {
		return this.tryGetRuleContext(0, Arg_listContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterDotCall) {
			listener.enterDotCall(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitDotCall) {
			listener.exitDotCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitDotCall) {
			return visitor.visitDotCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperAppContext extends ExprContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public arg_list(): Arg_listContext | undefined {
		return this.tryGetRuleContext(0, Arg_listContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOperApp) {
			listener.enterOperApp(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOperApp) {
			listener.exitOperApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOperApp) {
			return visitor.visitOperApp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FunAppContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterFunApp) {
			listener.enterFunApp(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitFunApp) {
			listener.exitFunApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitFunApp) {
			return visitor.visitFunApp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UminusContext extends ExprContext {
	public SUB(): TerminalNode { return this.getToken(TntParser.SUB, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUminus) {
			listener.enterUminus(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUminus) {
			listener.exitUminus(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUminus) {
			return visitor.visitUminus(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PowContext extends ExprContext {
	public _op!: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterPow) {
			listener.enterPow(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPow) {
			listener.exitPow(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPow) {
			return visitor.visitPow(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MultDivContext extends ExprContext {
	public _op!: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(TntParser.DIV, 0); }
	public MOD(): TerminalNode | undefined { return this.tryGetToken(TntParser.MOD, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterMultDiv) {
			listener.enterMultDiv(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitMultDiv) {
			listener.exitMultDiv(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitMultDiv) {
			return visitor.visitMultDiv(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PlusMinusContext extends ExprContext {
	public _op!: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public ADD(): TerminalNode | undefined { return this.tryGetToken(TntParser.ADD, 0); }
	public SUB(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUB, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterPlusMinus) {
			listener.enterPlusMinus(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPlusMinus) {
			listener.exitPlusMinus(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPlusMinus) {
			return visitor.visitPlusMinus(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfElseContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterIfElse) {
			listener.enterIfElse(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitIfElse) {
			listener.exitIfElse(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitIfElse) {
			return visitor.visitIfElse(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CaseBlockContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterCaseBlock) {
			listener.enterCaseBlock(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitCaseBlock) {
			listener.exitCaseBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitCaseBlock) {
			return visitor.visitCaseBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class InfixCallContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public arg_list(): Arg_listContext | undefined {
		return this.tryGetRuleContext(0, Arg_listContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterInfixCall) {
			listener.enterInfixCall(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitInfixCall) {
			listener.exitInfixCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitInfixCall) {
			return visitor.visitInfixCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class RelationsContext extends ExprContext {
	public _op!: Token;
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public GT(): TerminalNode | undefined { return this.tryGetToken(TntParser.GT, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(TntParser.LT, 0); }
	public GE(): TerminalNode | undefined { return this.tryGetToken(TntParser.GE, 0); }
	public LE(): TerminalNode | undefined { return this.tryGetToken(TntParser.LE, 0); }
	public NE(): TerminalNode | undefined { return this.tryGetToken(TntParser.NE, 0); }
	public EQEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQEQ, 0); }
	public EQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQ, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(TntParser.ASGN, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
	public SUBSETEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUBSETEQ, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterRelations) {
			listener.enterRelations(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitRelations) {
			listener.exitRelations(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitRelations) {
			return visitor.visitRelations(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AndContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public AND(): TerminalNode { return this.getToken(TntParser.AND, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterAnd) {
			listener.enterAnd(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAnd) {
			listener.exitAnd(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAnd) {
			return visitor.visitAnd(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public OR(): TerminalNode { return this.getToken(TntParser.OR, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOr) {
			listener.enterOr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOr) {
			listener.exitOr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOr) {
			return visitor.visitOr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IffContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public IFF(): TerminalNode { return this.getToken(TntParser.IFF, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterIff) {
			listener.enterIff(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitIff) {
			listener.exitIff(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitIff) {
			return visitor.visitIff(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ImpliesContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public IMPLIES(): TerminalNode { return this.getToken(TntParser.IMPLIES, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterImplies) {
			listener.enterImplies(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitImplies) {
			listener.exitImplies(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitImplies) {
			return visitor.visitImplies(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AndBlockContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterAndBlock) {
			listener.enterAndBlock(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAndBlock) {
			listener.exitAndBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAndBlock) {
			return visitor.visitAndBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrBlockContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOrBlock) {
			listener.enterOrBlock(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOrBlock) {
			listener.exitOrBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOrBlock) {
			return visitor.visitOrBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LiteralOrIdContext extends ExprContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	public INT(): TerminalNode | undefined { return this.tryGetToken(TntParser.INT, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(TntParser.BOOL, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(TntParser.STRING, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLiteralOrId) {
			listener.enterLiteralOrId(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLiteralOrId) {
			listener.exitLiteralOrId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLiteralOrId) {
			return visitor.visitLiteralOrId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTuple) {
			listener.enterTuple(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTuple) {
			listener.exitTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTuple) {
			return visitor.visitTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SetContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterSet) {
			listener.enterSet(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitSet) {
			listener.exitSet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitSet) {
			return visitor.visitSet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class RecordContext extends ExprContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterRecord) {
			listener.enterRecord(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitRecord) {
			listener.exitRecord(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitRecord) {
			return visitor.visitRecord(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class RecordSetContext extends ExprContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public IN(): TerminalNode[];
	public IN(i: number): TerminalNode;
	public IN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IN);
		} else {
			return this.getToken(TntParser.IN, i);
		}
	}
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterRecordSet) {
			listener.enterRecordSet(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitRecordSet) {
			listener.exitRecordSet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitRecordSet) {
			return visitor.visitRecordSet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SequenceContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterSequence) {
			listener.enterSequence(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitSequence) {
			listener.exitSequence(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitSequence) {
			return visitor.visitSequence(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LetInContext extends ExprContext {
	public valDef(): ValDefContext | undefined {
		return this.tryGetRuleContext(0, ValDefContext);
	}
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	public operDef(): OperDefContext | undefined {
		return this.tryGetRuleContext(0, OperDefContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLetIn) {
			listener.enterLetIn(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLetIn) {
			listener.exitLetIn(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLetIn) {
			return visitor.visitLetIn(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterParen) {
			listener.enterParen(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitParen) {
			listener.exitParen(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitParen) {
			return visitor.visitParen(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LambdaOrBracesContext extends ExprContext {
	public lambda(): LambdaContext | undefined {
		return this.tryGetRuleContext(0, LambdaContext);
	}
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLambdaOrBraces) {
			listener.enterLambdaOrBraces(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLambdaOrBraces) {
			listener.exitLambdaOrBraces(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLambdaOrBraces) {
			return visitor.visitLambdaOrBraces(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaContext extends ParserRuleContext {
	public pattern(): PatternContext {
		return this.getRuleContext(0, PatternContext);
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_lambda; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLambda) {
			listener.enterLambda(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLambda) {
			listener.exitLambda(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLambda) {
			return visitor.visitLambda(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PatternContext extends ParserRuleContext {
	public pattern(): PatternContext[];
	public pattern(i: number): PatternContext;
	public pattern(i?: number): PatternContext | PatternContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PatternContext);
		} else {
			return this.getRuleContext(i, PatternContext);
		}
	}
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_pattern; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterPattern) {
			listener.enterPattern(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPattern) {
			listener.exitPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPattern) {
			return visitor.visitPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Arg_listContext extends ParserRuleContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_arg_list; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterArg_list) {
			listener.enterArg_list(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitArg_list) {
			listener.exitArg_list(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitArg_list) {
			return visitor.visitArg_list(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Name_after_dotContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(TntParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(TntParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(TntParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(TntParser.IMPLIES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_name_after_dot; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterName_after_dot) {
			listener.enterName_after_dot(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitName_after_dot) {
			listener.exitName_after_dot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitName_after_dot) {
			return visitor.visitName_after_dot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperatorContext extends ParserRuleContext {
	public AND(): TerminalNode | undefined { return this.tryGetToken(TntParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(TntParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(TntParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(TntParser.IMPLIES, 0); }
	public SUBSETEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUBSETEQ, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
	public GT(): TerminalNode | undefined { return this.tryGetToken(TntParser.GT, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(TntParser.LT, 0); }
	public GE(): TerminalNode | undefined { return this.tryGetToken(TntParser.GE, 0); }
	public LE(): TerminalNode | undefined { return this.tryGetToken(TntParser.LE, 0); }
	public NE(): TerminalNode | undefined { return this.tryGetToken(TntParser.NE, 0); }
	public EQEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQEQ, 0); }
	public EQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQ, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(TntParser.ASGN, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(TntParser.DIV, 0); }
	public MOD(): TerminalNode | undefined { return this.tryGetToken(TntParser.MOD, 0); }
	public ADD(): TerminalNode | undefined { return this.tryGetToken(TntParser.ADD, 0); }
	public SUB(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUB, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_operator; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterOperator) {
			listener.enterOperator(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOperator) {
			listener.exitOperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOperator) {
			return visitor.visitOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	public STRING(): TerminalNode | undefined { return this.tryGetToken(TntParser.STRING, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(TntParser.BOOL, 0); }
	public INT(): TerminalNode | undefined { return this.tryGetToken(TntParser.INT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_literal; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLiteral) {
			listener.enterLiteral(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLiteral) {
			listener.exitLiteral(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLiteral) {
			return visitor.visitLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


