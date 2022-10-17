// Generated from ./src/generated/Tnt.g4 by ANTLR 4.9.0-SNAPSHOT


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
	public static readonly STRING = 33;
	public static readonly BOOL = 34;
	public static readonly INT = 35;
	public static readonly AND = 36;
	public static readonly OR = 37;
	public static readonly IFF = 38;
	public static readonly IMPLIES = 39;
	public static readonly SUBSETEQ = 40;
	public static readonly IN = 41;
	public static readonly NOTIN = 42;
	public static readonly SET = 43;
	public static readonly LIST = 44;
	public static readonly MATCH = 45;
	public static readonly PLUS = 46;
	public static readonly MINUS = 47;
	public static readonly MUL = 48;
	public static readonly DIV = 49;
	public static readonly MOD = 50;
	public static readonly GT = 51;
	public static readonly LT = 52;
	public static readonly GE = 53;
	public static readonly LE = 54;
	public static readonly NE = 55;
	public static readonly EQ = 56;
	public static readonly ASGN = 57;
	public static readonly LPAREN = 58;
	public static readonly RPAREN = 59;
	public static readonly IDENTIFIER = 60;
	public static readonly SIMPLE_IDENTIFIER = 61;
	public static readonly LINE_COMMENT = 62;
	public static readonly COMMENT = 63;
	public static readonly WS = 64;
	public static readonly RULE_module = 0;
	public static readonly RULE_unit = 1;
	public static readonly RULE_operDef = 2;
	public static readonly RULE_qualifier = 3;
	public static readonly RULE_params = 4;
	public static readonly RULE_instanceMod = 5;
	public static readonly RULE_type = 6;
	public static readonly RULE_typeUnionRecOne = 7;
	public static readonly RULE_expr = 8;
	public static readonly RULE_unitOrExpr = 9;
	public static readonly RULE_lambda = 10;
	public static readonly RULE_identOrHole = 11;
	public static readonly RULE_identOrStar = 12;
	public static readonly RULE_path = 13;
	public static readonly RULE_lambdaOrExpr = 14;
	public static readonly RULE_argList = 15;
	public static readonly RULE_normalCallName = 16;
	public static readonly RULE_nameAfterDot = 17;
	public static readonly RULE_operator = 18;
	public static readonly RULE_literal = 19;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"module", "unit", "operDef", "qualifier", "params", "instanceMod", "type", 
		"typeUnionRecOne", "expr", "unitOrExpr", "lambda", "identOrHole", "identOrStar", 
		"path", "lambdaOrExpr", "argList", "normalCallName", "nameAfterDot", "operator", 
		"literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'='", "'type'", "'import'", "'.'", "';'", "'val'", "'def'", "'pure'", 
		"'action'", "'temporal'", "','", "'->'", "'=>'", "'int'", "'str'", "'bool'", 
		"'|'", "'['", "']'", "'^'", "'all'", "'any'", "'if'", "'else'", "'_'", 
		undefined, undefined, undefined, "'and'", "'or'", "'iff'", "'implies'", 
		"'subseteq'", "'in'", "'notin'", "'set'", "'list'", "'match'", "'+'", 
		"'-'", "'*'", "'/'", "'%'", "'>'", "'<'", "'>='", "'<='", "'!='", "'=='", 
		"'<-'", "'('", "')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "STRING", "BOOL", 
		"INT", "AND", "OR", "IFF", "IMPLIES", "SUBSETEQ", "IN", "NOTIN", "SET", 
		"LIST", "MATCH", "PLUS", "MINUS", "MUL", "DIV", "MOD", "GT", "LT", "GE", 
		"LE", "NE", "EQ", "ASGN", "LPAREN", "RPAREN", "IDENTIFIER", "SIMPLE_IDENTIFIER", 
		"LINE_COMMENT", "COMMENT", "WS",
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
			this.state = 40;
			this.match(TntParser.T__0);
			this.state = 41;
			this.match(TntParser.IDENTIFIER);
			this.state = 42;
			this.match(TntParser.T__1);
			this.state = 46;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__3) | (1 << TntParser.T__5) | (1 << TntParser.T__6) | (1 << TntParser.T__8) | (1 << TntParser.T__9) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__16))) !== 0)) {
				{
				{
				this.state = 43;
				this.unit();
				}
				}
				this.state = 48;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 49;
			this.match(TntParser.T__2);
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
		try {
			this.state = 78;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 51;
				this.match(TntParser.T__3);
				this.state = 52;
				this.match(TntParser.IDENTIFIER);
				this.state = 53;
				this.match(TntParser.T__4);
				this.state = 54;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 55;
				this.match(TntParser.T__5);
				this.state = 56;
				this.match(TntParser.IDENTIFIER);
				this.state = 57;
				this.match(TntParser.T__4);
				this.state = 58;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 59;
				this.match(TntParser.T__6);
				this.state = 60;
				this.identOrHole();
				this.state = 61;
				this.match(TntParser.T__7);
				this.state = 62;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 64;
				this.operDef();
				}
				break;

			case 5:
				_localctx = new ModuleNestedContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 65;
				this.module();
				}
				break;

			case 6:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 66;
				this.instanceMod();
				}
				break;

			case 7:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 67;
				this.match(TntParser.T__8);
				this.state = 68;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 8:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 69;
				this.match(TntParser.T__8);
				this.state = 70;
				this.match(TntParser.IDENTIFIER);
				this.state = 71;
				this.match(TntParser.T__7);
				this.state = 72;
				this.type(0);
				}
				break;

			case 9:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 73;
				this.match(TntParser.T__9);
				this.state = 74;
				this.path();
				this.state = 75;
				this.match(TntParser.T__10);
				this.state = 76;
				this.identOrStar();
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
	public operDef(): OperDefContext {
		let _localctx: OperDefContext = new OperDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, TntParser.RULE_operDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 80;
			this.qualifier();
			this.state = 81;
			this.match(TntParser.IDENTIFIER);
			this.state = 83;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.LPAREN) {
				{
				this.state = 82;
				this.params();
				}
			}

			this.state = 87;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__4) {
				{
				this.state = 85;
				this.match(TntParser.T__4);
				this.state = 86;
				this.type(0);
				}
			}

			this.state = 89;
			this.match(TntParser.T__7);
			this.state = 90;
			this.expr(0);
			this.state = 92;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__11) {
				{
				this.state = 91;
				this.match(TntParser.T__11);
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
	public qualifier(): QualifierContext {
		let _localctx: QualifierContext = new QualifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, TntParser.RULE_qualifier);
		try {
			this.state = 102;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 94;
				this.match(TntParser.T__12);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 95;
				this.match(TntParser.T__13);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 96;
				this.match(TntParser.T__14);
				this.state = 97;
				this.match(TntParser.T__12);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 98;
				this.match(TntParser.T__14);
				this.state = 99;
				this.match(TntParser.T__13);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 100;
				this.match(TntParser.T__15);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 101;
				this.match(TntParser.T__16);
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
	public params(): ParamsContext {
		let _localctx: ParamsContext = new ParamsContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, TntParser.RULE_params);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 104;
			this.match(TntParser.LPAREN);
			this.state = 113;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.IDENTIFIER) {
				{
				this.state = 105;
				this.match(TntParser.IDENTIFIER);
				this.state = 110;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 106;
					this.match(TntParser.T__17);
					this.state = 107;
					this.match(TntParser.IDENTIFIER);
					}
					}
					this.state = 112;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 115;
			this.match(TntParser.RPAREN);
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
	public instanceMod(): InstanceModContext {
		let _localctx: InstanceModContext = new InstanceModContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, TntParser.RULE_instanceMod);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 117;
			this.match(TntParser.T__0);
			this.state = 118;
			this.match(TntParser.IDENTIFIER);
			this.state = 119;
			this.match(TntParser.T__7);
			this.state = 120;
			this.match(TntParser.IDENTIFIER);
			this.state = 121;
			this.match(TntParser.LPAREN);
			this.state = 139;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.MUL:
				{
				this.state = 122;
				this.match(TntParser.MUL);
				}
				break;
			case TntParser.IDENTIFIER:
				{
				this.state = 123;
				this.match(TntParser.IDENTIFIER);
				this.state = 124;
				this.match(TntParser.T__7);
				this.state = 125;
				this.expr(0);
				this.state = 132;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 8, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 126;
						this.match(TntParser.T__17);
						this.state = 127;
						this.match(TntParser.IDENTIFIER);
						this.state = 128;
						this.match(TntParser.T__7);
						this.state = 129;
						this.expr(0);
						}
						}
					}
					this.state = 134;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 8, this._ctx);
				}
				this.state = 137;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 135;
					this.match(TntParser.T__17);
					this.state = 136;
					this.match(TntParser.MUL);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 141;
			this.match(TntParser.RPAREN);
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
			this.state = 209;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 144;
				this.match(TntParser.LPAREN);
				this.state = 153;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__20) | (1 << TntParser.T__21) | (1 << TntParser.T__22) | (1 << TntParser.T__23))) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (TntParser.SET - 43)) | (1 << (TntParser.LIST - 43)) | (1 << (TntParser.LPAREN - 43)) | (1 << (TntParser.IDENTIFIER - 43)))) !== 0)) {
					{
					this.state = 145;
					this.type(0);
					this.state = 150;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__17) {
						{
						{
						this.state = 146;
						this.match(TntParser.T__17);
						this.state = 147;
						this.type(0);
						}
						}
						this.state = 152;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 155;
				this.match(TntParser.RPAREN);
				this.state = 156;
				this.match(TntParser.T__19);
				this.state = 157;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 158;
				this.match(TntParser.SET);
				this.state = 159;
				this.match(TntParser.LPAREN);
				this.state = 160;
				this.type(0);
				this.state = 161;
				this.match(TntParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 163;
				this.match(TntParser.LIST);
				this.state = 164;
				this.match(TntParser.LPAREN);
				this.state = 165;
				this.type(0);
				this.state = 166;
				this.match(TntParser.RPAREN);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 168;
				this.match(TntParser.LPAREN);
				this.state = 169;
				this.type(0);
				this.state = 170;
				this.match(TntParser.T__17);
				this.state = 171;
				this.type(0);
				this.state = 176;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 172;
					this.match(TntParser.T__17);
					this.state = 173;
					this.type(0);
					}
					}
					this.state = 178;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 179;
				this.match(TntParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 181;
				this.match(TntParser.T__1);
				this.state = 182;
				this.match(TntParser.IDENTIFIER);
				this.state = 183;
				this.match(TntParser.T__4);
				this.state = 184;
				this.type(0);
				this.state = 191;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 185;
					this.match(TntParser.T__17);
					this.state = 186;
					this.match(TntParser.IDENTIFIER);
					this.state = 187;
					this.match(TntParser.T__4);
					this.state = 188;
					this.type(0);
					}
					}
					this.state = 193;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 194;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 197;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 196;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 199;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 201;
				this.match(TntParser.T__20);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 202;
				this.match(TntParser.T__21);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 203;
				this.match(TntParser.T__22);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 204;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 205;
				this.match(TntParser.LPAREN);
				this.state = 206;
				this.type(0);
				this.state = 207;
				this.match(TntParser.RPAREN);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 216;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
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
					this.state = 211;
					if (!(this.precpred(this._ctx, 12))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
					}
					this.state = 212;
					this.match(TntParser.T__18);
					this.state = 213;
					this.type(12);
					}
					}
				}
				this.state = 218;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 17, this._ctx);
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
			this.state = 219;
			this.match(TntParser.T__23);
			this.state = 220;
			this.match(TntParser.T__1);
			this.state = 221;
			this.match(TntParser.IDENTIFIER);
			this.state = 222;
			this.match(TntParser.T__4);
			this.state = 223;
			this.match(TntParser.STRING);
			this.state = 230;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__17) {
				{
				{
				this.state = 224;
				this.match(TntParser.T__17);
				this.state = 225;
				this.match(TntParser.IDENTIFIER);
				this.state = 226;
				this.match(TntParser.T__4);
				this.state = 227;
				this.type(0);
				}
				}
				this.state = 232;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 233;
			this.match(TntParser.T__2);
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
		let _startState: number = 16;
		this.enterRecursionRule(_localctx, 16, TntParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 374;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 35, this._ctx) ) {
			case 1:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 236;
				this.normalCallName();
				this.state = 237;
				this.match(TntParser.LPAREN);
				this.state = 239;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__16) | (1 << TntParser.T__24) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__29))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.SET - 32)) | (1 << (TntParser.LIST - 32)) | (1 << (TntParser.MINUS - 32)) | (1 << (TntParser.LPAREN - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
					{
					this.state = 238;
					this.argList();
					}
				}

				this.state = 241;
				this.match(TntParser.RPAREN);
				}
				break;

			case 2:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 243;
				this.match(TntParser.MINUS);
				this.state = 244;
				this.expr(23);
				}
				break;

			case 3:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 245;
				this.match(TntParser.AND);
				this.state = 246;
				this.match(TntParser.T__1);
				this.state = 247;
				this.expr(0);
				this.state = 252;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 248;
						this.match(TntParser.T__17);
						this.state = 249;
						this.expr(0);
						}
						}
					}
					this.state = 254;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
				}
				this.state = 256;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 255;
					this.match(TntParser.T__17);
					}
				}

				this.state = 258;
				this.match(TntParser.T__2);
				}
				break;

			case 4:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 260;
				this.match(TntParser.OR);
				this.state = 261;
				this.match(TntParser.T__1);
				this.state = 262;
				this.expr(0);
				this.state = 267;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 22, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 263;
						this.match(TntParser.T__17);
						this.state = 264;
						this.expr(0);
						}
						}
					}
					this.state = 269;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 22, this._ctx);
				}
				this.state = 271;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 270;
					this.match(TntParser.T__17);
					}
				}

				this.state = 273;
				this.match(TntParser.T__2);
				}
				break;

			case 5:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 275;
				this.match(TntParser.T__27);
				this.state = 276;
				this.match(TntParser.T__1);
				this.state = 277;
				this.expr(0);
				this.state = 282;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 278;
						this.match(TntParser.T__17);
						this.state = 279;
						this.expr(0);
						}
						}
					}
					this.state = 284;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
				}
				this.state = 286;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 285;
					this.match(TntParser.T__17);
					}
				}

				this.state = 288;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 290;
				this.match(TntParser.T__28);
				this.state = 291;
				this.match(TntParser.T__1);
				this.state = 292;
				this.expr(0);
				this.state = 297;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 26, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 293;
						this.match(TntParser.T__17);
						this.state = 294;
						this.expr(0);
						}
						}
					}
					this.state = 299;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 26, this._ctx);
				}
				this.state = 301;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 300;
					this.match(TntParser.T__17);
					}
				}

				this.state = 303;
				this.match(TntParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 305;
				_la = this._input.LA(1);
				if (!(((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.IDENTIFIER - 33)))) !== 0))) {
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
				this.state = 306;
				this.match(TntParser.LPAREN);
				this.state = 307;
				this.expr(0);
				this.state = 308;
				this.match(TntParser.T__17);
				this.state = 309;
				this.expr(0);
				this.state = 314;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 310;
						this.match(TntParser.T__17);
						this.state = 311;
						this.expr(0);
						}
						}
					}
					this.state = 316;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 28, this._ctx);
				}
				this.state = 318;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 317;
					this.match(TntParser.T__17);
					}
				}

				this.state = 320;
				this.match(TntParser.RPAREN);
				}
				break;

			case 9:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 322;
				this.match(TntParser.T__1);
				this.state = 323;
				this.match(TntParser.IDENTIFIER);
				this.state = 324;
				this.match(TntParser.T__4);
				this.state = 325;
				this.expr(0);
				this.state = 332;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 326;
						this.match(TntParser.T__17);
						this.state = 327;
						this.match(TntParser.IDENTIFIER);
						this.state = 328;
						this.match(TntParser.T__4);
						this.state = 329;
						this.expr(0);
						}
						}
					}
					this.state = 334;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
				}
				this.state = 336;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 335;
					this.match(TntParser.T__17);
					}
				}

				this.state = 338;
				this.match(TntParser.T__2);
				}
				break;

			case 10:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 340;
				this.match(TntParser.T__24);
				this.state = 349;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__16) | (1 << TntParser.T__24) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__29))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.SET - 33)) | (1 << (TntParser.LIST - 33)) | (1 << (TntParser.MINUS - 33)) | (1 << (TntParser.LPAREN - 33)) | (1 << (TntParser.IDENTIFIER - 33)))) !== 0)) {
					{
					this.state = 341;
					this.expr(0);
					this.state = 346;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 342;
							this.match(TntParser.T__17);
							this.state = 343;
							this.expr(0);
							}
							}
						}
						this.state = 348;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
					}
					}
				}

				this.state = 352;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 351;
					this.match(TntParser.T__17);
					}
				}

				this.state = 354;
				this.match(TntParser.T__25);
				}
				break;

			case 11:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 355;
				this.match(TntParser.T__29);
				this.state = 356;
				this.match(TntParser.LPAREN);
				this.state = 357;
				this.expr(0);
				this.state = 358;
				this.match(TntParser.RPAREN);
				this.state = 359;
				this.expr(0);
				this.state = 360;
				this.match(TntParser.T__30);
				this.state = 361;
				this.expr(4);
				}
				break;

			case 12:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 363;
				this.operDef();
				this.state = 364;
				this.expr(3);
				}
				break;

			case 13:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 366;
				this.match(TntParser.LPAREN);
				this.state = 367;
				this.expr(0);
				this.state = 368;
				this.match(TntParser.RPAREN);
				}
				break;

			case 14:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 370;
				this.match(TntParser.T__1);
				this.state = 371;
				this.expr(0);
				this.state = 372;
				this.match(TntParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 435;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 433;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 39, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 376;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 377;
						(_localctx as PowContext)._op = this.match(TntParser.T__26);
						this.state = 378;
						this.expr(22);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 379;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 380;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & ((1 << (TntParser.MUL - 48)) | (1 << (TntParser.DIV - 48)) | (1 << (TntParser.MOD - 48)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 381;
						this.expr(22);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 382;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 383;
						(_localctx as PlusMinusContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === TntParser.PLUS || _la === TntParser.MINUS)) {
							(_localctx as PlusMinusContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 384;
						this.expr(21);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 385;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 386;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & ((1 << (TntParser.IN - 41)) | (1 << (TntParser.NOTIN - 41)) | (1 << (TntParser.GT - 41)) | (1 << (TntParser.LT - 41)) | (1 << (TntParser.GE - 41)) | (1 << (TntParser.LE - 41)) | (1 << (TntParser.NE - 41)) | (1 << (TntParser.EQ - 41)) | (1 << (TntParser.ASGN - 41)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 387;
						this.expr(20);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 388;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 389;
						this.match(TntParser.T__7);
						this.state = 390;
						this.expr(19);

						                            this.notifyErrorListeners("TNT006: unexpected '=', did you mean '=='?")
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 393;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 394;
						this.match(TntParser.AND);
						this.state = 395;
						this.expr(18);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 396;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 397;
						this.match(TntParser.OR);
						this.state = 398;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 399;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 400;
						this.match(TntParser.IFF);
						this.state = 401;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 402;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 403;
						this.match(TntParser.IMPLIES);
						this.state = 404;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 405;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 406;
						this.match(TntParser.T__10);
						this.state = 407;
						this.nameAfterDot();
						this.state = 413;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 37, this._ctx) ) {
						case 1:
							{
							this.state = 408;
							this.match(TntParser.LPAREN);
							this.state = 410;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__16) | (1 << TntParser.T__24) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__29))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.SET - 32)) | (1 << (TntParser.LIST - 32)) | (1 << (TntParser.MINUS - 32)) | (1 << (TntParser.LPAREN - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
								{
								this.state = 409;
								this.argList();
								}
							}

							this.state = 412;
							this.match(TntParser.RPAREN);
							}
							break;
						}
						}
						break;

					case 11:
						{
						_localctx = new FunAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 415;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 416;
						this.match(TntParser.T__24);
						this.state = 417;
						this.expr(0);
						this.state = 418;
						this.match(TntParser.T__25);
						}
						break;

					case 12:
						{
						_localctx = new MatchContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 420;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 421;
						this.match(TntParser.MATCH);
						this.state = 429;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 422;
								this.match(TntParser.T__23);
								this.state = 423;
								this.match(TntParser.STRING);
								this.state = 424;
								this.match(TntParser.T__4);
								this.state = 425;
								this.identOrHole();
								this.state = 426;
								this.match(TntParser.T__19);
								this.state = 427;
								this.expr(0);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 431;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;
					}
					}
				}
				this.state = 437;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
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
	public unitOrExpr(): UnitOrExprContext {
		let _localctx: UnitOrExprContext = new UnitOrExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, TntParser.RULE_unitOrExpr);
		try {
			this.state = 440;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 438;
				this.unit();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 439;
				this.expr(0);
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
	public lambda(): LambdaContext {
		let _localctx: LambdaContext = new LambdaContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, TntParser.RULE_lambda);
		let _la: number;
		try {
			this.state = 479;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__31:
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 442;
				this.identOrHole();
				this.state = 447;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 443;
					this.match(TntParser.T__17);
					this.state = 444;
					this.identOrHole();
					}
					}
					this.state = 449;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 450;
				this.match(TntParser.T__19);
				this.state = 451;
				this.expr(0);
				}
				break;
			case TntParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 453;
				this.match(TntParser.LPAREN);
				this.state = 454;
				this.identOrHole();
				this.state = 459;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 455;
					this.match(TntParser.T__17);
					this.state = 456;
					this.identOrHole();
					}
					}
					this.state = 461;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 462;
				this.match(TntParser.T__19);
				this.state = 463;
				this.expr(0);
				this.state = 464;
				this.match(TntParser.RPAREN);
				}
				break;
			case TntParser.T__1:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 466;
				this.match(TntParser.T__1);
				this.state = 467;
				this.identOrHole();
				this.state = 472;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 468;
					this.match(TntParser.T__17);
					this.state = 469;
					this.identOrHole();
					}
					}
					this.state = 474;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 475;
				this.match(TntParser.T__19);
				this.state = 476;
				this.expr(0);
				this.state = 477;
				this.match(TntParser.T__2);
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
	public identOrHole(): IdentOrHoleContext {
		let _localctx: IdentOrHoleContext = new IdentOrHoleContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, TntParser.RULE_identOrHole);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 481;
			_la = this._input.LA(1);
			if (!(_la === TntParser.T__31 || _la === TntParser.IDENTIFIER)) {
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
	public identOrStar(): IdentOrStarContext {
		let _localctx: IdentOrStarContext = new IdentOrStarContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, TntParser.RULE_identOrStar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 483;
			_la = this._input.LA(1);
			if (!(_la === TntParser.MUL || _la === TntParser.IDENTIFIER)) {
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
	public path(): PathContext {
		let _localctx: PathContext = new PathContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, TntParser.RULE_path);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 485;
			this.match(TntParser.IDENTIFIER);
			this.state = 490;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 486;
					this.match(TntParser.T__10);
					this.state = 487;
					this.match(TntParser.IDENTIFIER);
					}
					}
				}
				this.state = 492;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
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
	public lambdaOrExpr(): LambdaOrExprContext {
		let _localctx: LambdaOrExprContext = new LambdaOrExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, TntParser.RULE_lambdaOrExpr);
		try {
			this.state = 495;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 47, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 493;
				this.lambda();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 494;
				this.expr(0);
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
	public argList(): ArgListContext {
		let _localctx: ArgListContext = new ArgListContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, TntParser.RULE_argList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 497;
			this.lambdaOrExpr();
			this.state = 502;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__17) {
				{
				{
				this.state = 498;
				this.match(TntParser.T__17);
				this.state = 499;
				this.lambdaOrExpr();
				}
				}
				this.state = 504;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
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
	public normalCallName(): NormalCallNameContext {
		let _localctx: NormalCallNameContext = new NormalCallNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, TntParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 507;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 505;
				this.match(TntParser.IDENTIFIER);
				}
				break;
			case TntParser.AND:
			case TntParser.OR:
			case TntParser.IFF:
			case TntParser.IMPLIES:
			case TntParser.SUBSETEQ:
			case TntParser.IN:
			case TntParser.NOTIN:
			case TntParser.SET:
			case TntParser.LIST:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 506;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.AND - 36)) | (1 << (TntParser.OR - 36)) | (1 << (TntParser.IFF - 36)) | (1 << (TntParser.IMPLIES - 36)) | (1 << (TntParser.SUBSETEQ - 36)) | (1 << (TntParser.IN - 36)) | (1 << (TntParser.NOTIN - 36)) | (1 << (TntParser.SET - 36)) | (1 << (TntParser.LIST - 36)))) !== 0))) {
					_localctx._op = this._errHandler.recoverInline(this);
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
	public nameAfterDot(): NameAfterDotContext {
		let _localctx: NameAfterDotContext = new NameAfterDotContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, TntParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 511;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 509;
				this.match(TntParser.IDENTIFIER);
				}
				break;
			case TntParser.AND:
			case TntParser.OR:
			case TntParser.IFF:
			case TntParser.IMPLIES:
			case TntParser.SUBSETEQ:
			case TntParser.IN:
			case TntParser.NOTIN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 510;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.AND - 36)) | (1 << (TntParser.OR - 36)) | (1 << (TntParser.IFF - 36)) | (1 << (TntParser.IMPLIES - 36)) | (1 << (TntParser.SUBSETEQ - 36)) | (1 << (TntParser.IN - 36)) | (1 << (TntParser.NOTIN - 36)))) !== 0))) {
					_localctx._op = this._errHandler.recoverInline(this);
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
	public operator(): OperatorContext {
		let _localctx: OperatorContext = new OperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, TntParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 513;
			_la = this._input.LA(1);
			if (!(((((_la - 27)) & ~0x1F) === 0 && ((1 << (_la - 27)) & ((1 << (TntParser.T__26 - 27)) | (1 << (TntParser.AND - 27)) | (1 << (TntParser.OR - 27)) | (1 << (TntParser.IFF - 27)) | (1 << (TntParser.IMPLIES - 27)) | (1 << (TntParser.SUBSETEQ - 27)) | (1 << (TntParser.IN - 27)) | (1 << (TntParser.NOTIN - 27)) | (1 << (TntParser.PLUS - 27)) | (1 << (TntParser.MINUS - 27)) | (1 << (TntParser.MUL - 27)) | (1 << (TntParser.DIV - 27)) | (1 << (TntParser.MOD - 27)) | (1 << (TntParser.GT - 27)) | (1 << (TntParser.LT - 27)) | (1 << (TntParser.GE - 27)) | (1 << (TntParser.LE - 27)) | (1 << (TntParser.NE - 27)) | (1 << (TntParser.EQ - 27)) | (1 << (TntParser.ASGN - 27)))) !== 0))) {
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
		this.enterRule(_localctx, 38, TntParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 515;
			_la = this._input.LA(1);
			if (!(((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)))) !== 0))) {
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

		case 8:
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
			return this.precpred(this._ctx, 19);

		case 5:
			return this.precpred(this._ctx, 18);

		case 6:
			return this.precpred(this._ctx, 17);

		case 7:
			return this.precpred(this._ctx, 16);

		case 8:
			return this.precpred(this._ctx, 15);

		case 9:
			return this.precpred(this._ctx, 14);

		case 10:
			return this.precpred(this._ctx, 26);

		case 11:
			return this.precpred(this._ctx, 24);

		case 12:
			return this.precpred(this._ctx, 13);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03B\u0208\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x03\x02\x03\x02\x03\x02\x03\x02" +
		"\x07\x02/\n\x02\f\x02\x0E\x022\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03Q\n\x03\x03" +
		"\x04\x03\x04\x03\x04\x05\x04V\n\x04\x03\x04\x03\x04\x05\x04Z\n\x04\x03" +
		"\x04\x03\x04\x03\x04\x05\x04_\n\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x05\x05i\n\x05\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x07\x06o\n\x06\f\x06\x0E\x06r\v\x06\x05\x06t\n\x06\x03\x06\x03\x06" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07\x85\n\x07\f\x07\x0E\x07\x88\v" +
		"\x07\x03\x07\x03\x07\x05\x07\x8C\n\x07\x05\x07\x8E\n\x07\x03\x07\x03\x07" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\x97\n\b\f\b\x0E\b\x9A\v\b\x05\b\x9C" +
		"\n\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xB1\n\b\f\b\x0E" +
		"\b\xB4\v\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x07\b\xC0\n\b\f\b\x0E\b\xC3\v\b\x03\b\x03\b\x03\b\x06\b\xC8\n\b\r\b\x0E" +
		"\b\xC9\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05\b\xD4\n\b\x03" +
		"\b\x03\b\x03\b\x07\b\xD9\n\b\f\b\x0E\b\xDC\v\b\x03\t\x03\t\x03\t\x03\t" +
		"\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\xE7\n\t\f\t\x0E\t\xEA\v\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x05\n\xF2\n\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x07\n\xFD\n\n\f\n\x0E\n\u0100\v\n\x03\n\x05\n" +
		"\u0103\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u010C\n\n\f" +
		"\n\x0E\n\u010F\v\n\x03\n\x05\n\u0112\n\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x07\n\u011B\n\n\f\n\x0E\n\u011E\v\n\x03\n\x05\n\u0121\n\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u012A\n\n\f\n\x0E\n\u012D" +
		"\v\n\x03\n\x05\n\u0130\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x07\n\u013B\n\n\f\n\x0E\n\u013E\v\n\x03\n\x05\n\u0141\n\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u014D\n" +
		"\n\f\n\x0E\n\u0150\v\n\x03\n\x05\n\u0153\n\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x07\n\u015B\n\n\f\n\x0E\n\u015E\v\n\x05\n\u0160\n\n\x03\n\x05" +
		"\n\u0163\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u0179" +
		"\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05" +
		"\n\u019D\n\n\x03\n\x05\n\u01A0\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x06\n\u01B0\n\n\r\n\x0E" +
		"\n\u01B1\x07\n\u01B4\n\n\f\n\x0E\n\u01B7\v\n\x03\v\x03\v\x05\v\u01BB\n" +
		"\v\x03\f\x03\f\x03\f\x07\f\u01C0\n\f\f\f\x0E\f\u01C3\v\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x07\f\u01CC\n\f\f\f\x0E\f\u01CF\v\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u01D9\n\f\f\f\x0E\f\u01DC" +
		"\v\f\x03\f\x03\f\x03\f\x03\f\x05\f\u01E2\n\f\x03\r\x03\r\x03\x0E\x03\x0E" +
		"\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u01EB\n\x0F\f\x0F\x0E\x0F\u01EE\v\x0F" +
		"\x03\x10\x03\x10\x05\x10\u01F2\n\x10\x03\x11\x03\x11\x03\x11\x07\x11\u01F7" +
		"\n\x11\f\x11\x0E\x11\u01FA\v\x11\x03\x12\x03\x12\x05\x12\u01FE\n\x12\x03" +
		"\x13\x03\x13\x05\x13\u0202\n\x13\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15" +
		"\x02\x02\x04\x0E\x12\x16\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E" +
		"\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 " +
		"\x02\"\x02$\x02&\x02(\x02\x02\f\x04\x02#%>>\x03\x0224\x03\x0201\x04\x02" +
		"+,5;\x04\x02\"\">>\x04\x0222>>\x03\x02&.\x03\x02&,\x05\x02\x1D\x1D&,0" +
		";\x03\x02#%\x02\u0251\x02*\x03\x02\x02\x02\x04P\x03\x02\x02\x02\x06R\x03" +
		"\x02\x02\x02\bh\x03\x02\x02\x02\nj\x03\x02\x02\x02\fw\x03\x02\x02\x02" +
		"\x0E\xD3\x03\x02\x02\x02\x10\xDD\x03\x02\x02\x02\x12\u0178\x03\x02\x02" +
		"\x02\x14\u01BA\x03\x02\x02\x02\x16\u01E1\x03\x02\x02\x02\x18\u01E3\x03" +
		"\x02\x02\x02\x1A\u01E5\x03\x02\x02\x02\x1C\u01E7\x03\x02\x02\x02\x1E\u01F1" +
		"\x03\x02\x02\x02 \u01F3\x03\x02\x02\x02\"\u01FD\x03\x02\x02\x02$\u0201" +
		"\x03\x02\x02\x02&\u0203\x03\x02\x02\x02(\u0205\x03\x02\x02\x02*+\x07\x03" +
		"\x02\x02+,\x07>\x02\x02,0\x07\x04\x02\x02-/\x05\x04\x03\x02.-\x03\x02" +
		"\x02\x02/2\x03\x02\x02\x020.\x03\x02\x02\x0201\x03\x02\x02\x0213\x03\x02" +
		"\x02\x0220\x03\x02\x02\x0234\x07\x05\x02\x024\x03\x03\x02\x02\x0256\x07" +
		"\x06\x02\x0267\x07>\x02\x0278\x07\x07\x02\x028Q\x05\x0E\b\x029:\x07\b" +
		"\x02\x02:;\x07>\x02\x02;<\x07\x07\x02\x02<Q\x05\x0E\b\x02=>\x07\t\x02" +
		"\x02>?\x05\x18\r\x02?@\x07\n\x02\x02@A\x05\x12\n\x02AQ\x03\x02\x02\x02" +
		"BQ\x05\x06\x04\x02CQ\x05\x02\x02\x02DQ\x05\f\x07\x02EF\x07\v\x02\x02F" +
		"Q\x07>\x02\x02GH\x07\v\x02\x02HI\x07>\x02\x02IJ\x07\n\x02\x02JQ\x05\x0E" +
		"\b\x02KL\x07\f\x02\x02LM\x05\x1C\x0F\x02MN\x07\r\x02\x02NO\x05\x1A\x0E" +
		"\x02OQ\x03\x02\x02\x02P5\x03\x02\x02\x02P9\x03\x02\x02\x02P=\x03\x02\x02" +
		"\x02PB\x03\x02\x02\x02PC\x03\x02\x02\x02PD\x03\x02\x02\x02PE\x03\x02\x02" +
		"\x02PG\x03\x02\x02\x02PK\x03\x02\x02\x02Q\x05\x03\x02\x02\x02RS\x05\b" +
		"\x05\x02SU\x07>\x02\x02TV\x05\n\x06\x02UT\x03\x02\x02\x02UV\x03\x02\x02" +
		"\x02VY\x03\x02\x02\x02WX\x07\x07\x02\x02XZ\x05\x0E\b\x02YW\x03\x02\x02" +
		"\x02YZ\x03\x02\x02\x02Z[\x03\x02\x02\x02[\\\x07\n\x02\x02\\^\x05\x12\n" +
		"\x02]_\x07\x0E\x02\x02^]\x03\x02\x02\x02^_\x03\x02\x02\x02_\x07\x03\x02" +
		"\x02\x02`i\x07\x0F\x02\x02ai\x07\x10\x02\x02bc\x07\x11\x02\x02ci\x07\x0F" +
		"\x02\x02de\x07\x11\x02\x02ei\x07\x10\x02\x02fi\x07\x12\x02\x02gi\x07\x13" +
		"\x02\x02h`\x03\x02\x02\x02ha\x03\x02\x02\x02hb\x03\x02\x02\x02hd\x03\x02" +
		"\x02\x02hf\x03\x02\x02\x02hg\x03\x02\x02\x02i\t\x03\x02\x02\x02js\x07" +
		"<\x02\x02kp\x07>\x02\x02lm\x07\x14\x02\x02mo\x07>\x02\x02nl\x03\x02\x02" +
		"\x02or\x03\x02\x02\x02pn\x03\x02\x02\x02pq\x03\x02\x02\x02qt\x03\x02\x02" +
		"\x02rp\x03\x02\x02\x02sk\x03\x02\x02\x02st\x03\x02\x02\x02tu\x03\x02\x02" +
		"\x02uv\x07=\x02\x02v\v\x03\x02\x02\x02wx\x07\x03\x02\x02xy\x07>\x02\x02" +
		"yz\x07\n\x02\x02z{\x07>\x02\x02{\x8D\x07<\x02\x02|\x8E\x072\x02\x02}~" +
		"\x07>\x02\x02~\x7F\x07\n\x02\x02\x7F\x86\x05\x12\n\x02\x80\x81\x07\x14" +
		"\x02\x02\x81\x82\x07>\x02\x02\x82\x83\x07\n\x02\x02\x83\x85\x05\x12\n" +
		"\x02\x84\x80\x03\x02\x02\x02\x85\x88\x03\x02\x02\x02\x86\x84\x03\x02\x02" +
		"\x02\x86\x87\x03\x02\x02\x02\x87\x8B\x03\x02\x02\x02\x88\x86\x03\x02\x02" +
		"\x02\x89\x8A\x07\x14\x02\x02\x8A\x8C\x072\x02\x02\x8B\x89\x03\x02\x02" +
		"\x02\x8B\x8C\x03\x02\x02\x02\x8C\x8E\x03\x02\x02\x02\x8D|\x03\x02\x02" +
		"\x02\x8D}\x03\x02\x02\x02\x8E\x8F\x03\x02\x02\x02\x8F\x90\x07=\x02\x02" +
		"\x90\r\x03\x02\x02\x02\x91\x92\b\b\x01\x02\x92\x9B\x07<\x02\x02\x93\x98" +
		"\x05\x0E\b\x02\x94\x95\x07\x14\x02\x02\x95\x97\x05\x0E\b\x02\x96\x94\x03" +
		"\x02\x02\x02\x97\x9A\x03\x02\x02\x02\x98\x96\x03\x02\x02\x02\x98\x99\x03" +
		"\x02\x02\x02\x99\x9C\x03\x02\x02\x02\x9A\x98\x03\x02\x02\x02\x9B\x93\x03" +
		"\x02\x02\x02\x9B\x9C\x03\x02\x02\x02\x9C\x9D\x03\x02\x02\x02\x9D\x9E\x07" +
		"=\x02\x02\x9E\x9F\x07\x16\x02\x02\x9F\xD4\x05\x0E\b\r\xA0\xA1\x07-\x02" +
		"\x02\xA1\xA2\x07<\x02\x02\xA2\xA3\x05\x0E\b\x02\xA3\xA4\x07=\x02\x02\xA4" +
		"\xD4\x03\x02\x02\x02\xA5\xA6\x07.\x02\x02\xA6\xA7\x07<\x02\x02\xA7\xA8" +
		"\x05\x0E\b\x02\xA8\xA9\x07=\x02\x02\xA9\xD4\x03\x02\x02\x02\xAA\xAB\x07" +
		"<\x02\x02\xAB\xAC\x05\x0E\b\x02\xAC\xAD\x07\x14\x02\x02\xAD\xB2\x05\x0E" +
		"\b\x02\xAE\xAF\x07\x14\x02\x02\xAF\xB1\x05\x0E\b\x02\xB0\xAE\x03\x02\x02" +
		"\x02\xB1\xB4\x03\x02\x02\x02\xB2\xB0\x03\x02\x02\x02\xB2\xB3\x03\x02\x02" +
		"\x02\xB3\xB5\x03\x02\x02\x02\xB4\xB2\x03\x02\x02\x02\xB5\xB6\x07=\x02" +
		"\x02\xB6\xD4\x03\x02\x02\x02\xB7\xB8\x07\x04\x02\x02\xB8\xB9\x07>\x02" +
		"\x02\xB9\xBA\x07\x07\x02\x02\xBA\xC1\x05\x0E\b\x02\xBB\xBC\x07\x14\x02" +
		"\x02\xBC\xBD\x07>\x02\x02\xBD\xBE\x07\x07\x02\x02\xBE\xC0\x05\x0E\b\x02" +
		"\xBF\xBB\x03\x02\x02\x02\xC0\xC3\x03\x02\x02\x02\xC1\xBF\x03\x02\x02\x02" +
		"\xC1\xC2\x03\x02\x02\x02\xC2\xC4\x03\x02\x02\x02\xC3\xC1\x03\x02\x02\x02" +
		"\xC4\xC5\x07\x05\x02\x02\xC5\xD4\x03\x02\x02\x02\xC6\xC8\x05\x10\t\x02" +
		"\xC7\xC6\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02\xC9\xC7\x03\x02\x02\x02" +
		"\xC9\xCA\x03\x02\x02\x02\xCA\xD4\x03\x02\x02\x02\xCB\xD4\x07\x17\x02\x02" +
		"\xCC\xD4\x07\x18\x02\x02\xCD\xD4\x07\x19\x02\x02\xCE\xD4\x07>\x02\x02" +
		"\xCF\xD0\x07<\x02\x02\xD0\xD1\x05\x0E\b\x02\xD1\xD2\x07=\x02\x02\xD2\xD4" +
		"\x03\x02\x02\x02\xD3\x91\x03\x02\x02\x02\xD3\xA0\x03\x02\x02\x02\xD3\xA5" +
		"\x03\x02\x02\x02\xD3\xAA\x03\x02\x02\x02\xD3\xB7\x03\x02\x02\x02\xD3\xC7" +
		"\x03\x02\x02\x02\xD3\xCB\x03\x02\x02\x02\xD3\xCC\x03\x02\x02\x02\xD3\xCD" +
		"\x03\x02\x02\x02\xD3\xCE\x03\x02\x02\x02\xD3\xCF\x03\x02\x02\x02\xD4\xDA" +
		"\x03\x02\x02\x02\xD5\xD6\f\x0E\x02\x02\xD6\xD7\x07\x15\x02\x02\xD7\xD9" +
		"\x05\x0E\b\x0E\xD8\xD5\x03\x02\x02\x02\xD9\xDC\x03\x02\x02\x02\xDA\xD8" +
		"\x03\x02\x02\x02\xDA\xDB\x03\x02\x02\x02\xDB\x0F\x03\x02\x02\x02\xDC\xDA" +
		"\x03\x02\x02\x02\xDD\xDE\x07\x1A\x02\x02\xDE\xDF\x07\x04\x02\x02\xDF\xE0" +
		"\x07>\x02\x02\xE0\xE1\x07\x07\x02\x02\xE1\xE8\x07#\x02\x02\xE2\xE3\x07" +
		"\x14\x02\x02\xE3\xE4\x07>\x02\x02\xE4\xE5\x07\x07\x02\x02\xE5\xE7\x05" +
		"\x0E\b\x02\xE6\xE2\x03\x02\x02\x02\xE7\xEA\x03\x02\x02\x02\xE8\xE6\x03" +
		"\x02\x02\x02\xE8\xE9\x03\x02\x02\x02\xE9\xEB\x03\x02\x02\x02\xEA\xE8\x03" +
		"\x02\x02\x02\xEB\xEC\x07\x05\x02\x02\xEC\x11\x03\x02\x02\x02\xED\xEE\b" +
		"\n\x01\x02\xEE\xEF\x05\"\x12\x02\xEF\xF1\x07<\x02\x02\xF0\xF2\x05 \x11" +
		"\x02\xF1\xF0\x03\x02\x02\x02\xF1\xF2\x03\x02\x02\x02\xF2\xF3\x03\x02\x02" +
		"\x02\xF3\xF4\x07=\x02\x02\xF4\u0179\x03\x02\x02\x02\xF5\xF6\x071\x02\x02" +
		"\xF6\u0179\x05\x12\n\x19\xF7\xF8\x07&\x02\x02\xF8\xF9\x07\x04\x02\x02" +
		"\xF9\xFE\x05\x12\n\x02\xFA\xFB\x07\x14\x02\x02\xFB\xFD\x05\x12\n\x02\xFC" +
		"\xFA\x03\x02\x02\x02\xFD\u0100\x03\x02\x02\x02\xFE\xFC\x03\x02\x02\x02" +
		"\xFE\xFF\x03\x02\x02\x02\xFF\u0102\x03\x02\x02\x02\u0100\xFE\x03\x02\x02" +
		"\x02\u0101\u0103\x07\x14\x02\x02\u0102\u0101\x03\x02\x02\x02\u0102\u0103" +
		"\x03\x02\x02\x02\u0103\u0104\x03\x02\x02\x02\u0104\u0105\x07\x05\x02\x02" +
		"\u0105\u0179\x03\x02\x02\x02\u0106\u0107\x07\'\x02\x02\u0107\u0108\x07" +
		"\x04\x02\x02\u0108\u010D\x05\x12\n\x02\u0109\u010A\x07\x14\x02\x02\u010A" +
		"\u010C\x05\x12\n\x02\u010B\u0109\x03\x02\x02\x02\u010C\u010F\x03\x02\x02" +
		"\x02\u010D\u010B\x03\x02\x02\x02\u010D\u010E\x03\x02\x02\x02\u010E\u0111" +
		"\x03\x02\x02\x02\u010F\u010D\x03\x02\x02\x02\u0110\u0112\x07\x14\x02\x02" +
		"\u0111\u0110\x03\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112\u0113\x03" +
		"\x02\x02\x02\u0113\u0114\x07\x05\x02\x02\u0114\u0179\x03\x02\x02\x02\u0115" +
		"\u0116\x07\x1E\x02\x02\u0116\u0117\x07\x04\x02\x02\u0117\u011C\x05\x12" +
		"\n\x02\u0118\u0119\x07\x14\x02\x02\u0119\u011B\x05\x12\n\x02\u011A\u0118" +
		"\x03\x02\x02\x02\u011B\u011E\x03\x02\x02\x02\u011C\u011A\x03\x02\x02\x02" +
		"\u011C\u011D\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02\u011E\u011C\x03" +
		"\x02\x02\x02\u011F\u0121\x07\x14\x02\x02\u0120\u011F\x03\x02\x02\x02\u0120" +
		"\u0121\x03\x02\x02\x02\u0121\u0122\x03\x02\x02\x02\u0122\u0123\x07\x05" +
		"\x02\x02\u0123\u0179\x03\x02\x02\x02\u0124\u0125\x07\x1F\x02\x02\u0125" +
		"\u0126\x07\x04\x02\x02\u0126\u012B\x05\x12\n\x02\u0127\u0128\x07\x14\x02" +
		"\x02\u0128\u012A\x05\x12\n\x02\u0129\u0127\x03\x02\x02\x02\u012A\u012D" +
		"\x03\x02\x02\x02\u012B\u0129\x03\x02\x02\x02\u012B\u012C\x03\x02\x02\x02" +
		"\u012C\u012F\x03\x02\x02\x02\u012D\u012B\x03\x02\x02\x02\u012E\u0130\x07" +
		"\x14\x02\x02\u012F\u012E\x03\x02\x02\x02\u012F\u0130\x03\x02\x02\x02\u0130" +
		"\u0131\x03\x02\x02\x02\u0131\u0132\x07\x05\x02\x02\u0132\u0179\x03\x02" +
		"\x02\x02\u0133\u0179\t\x02\x02\x02\u0134\u0135\x07<\x02\x02\u0135\u0136" +
		"\x05\x12\n\x02\u0136\u0137\x07\x14\x02\x02\u0137\u013C\x05\x12\n\x02\u0138" +
		"\u0139\x07\x14\x02\x02\u0139\u013B\x05\x12\n\x02\u013A\u0138\x03\x02\x02" +
		"\x02\u013B\u013E\x03\x02\x02\x02\u013C\u013A\x03\x02\x02\x02\u013C\u013D" +
		"\x03\x02\x02\x02\u013D\u0140\x03\x02\x02\x02\u013E\u013C\x03\x02\x02\x02" +
		"\u013F\u0141\x07\x14\x02\x02\u0140\u013F\x03\x02\x02\x02\u0140\u0141\x03" +
		"\x02\x02\x02\u0141\u0142\x03\x02\x02\x02\u0142\u0143\x07=\x02\x02\u0143" +
		"\u0179\x03\x02\x02\x02\u0144\u0145\x07\x04\x02\x02\u0145\u0146\x07>\x02" +
		"\x02\u0146\u0147\x07\x07\x02\x02\u0147\u014E\x05\x12\n\x02\u0148\u0149" +
		"\x07\x14\x02\x02\u0149\u014A\x07>\x02\x02\u014A\u014B\x07\x07\x02\x02" +
		"\u014B\u014D\x05\x12\n\x02\u014C\u0148\x03\x02\x02\x02\u014D\u0150\x03" +
		"\x02\x02\x02\u014E\u014C\x03\x02\x02\x02\u014E\u014F\x03\x02\x02\x02\u014F" +
		"\u0152\x03\x02\x02\x02\u0150\u014E\x03\x02\x02\x02\u0151\u0153\x07\x14" +
		"\x02\x02\u0152\u0151\x03\x02\x02\x02\u0152\u0153\x03\x02\x02\x02\u0153" +
		"\u0154\x03\x02\x02\x02\u0154\u0155\x07\x05\x02\x02\u0155\u0179\x03\x02" +
		"\x02\x02\u0156\u015F\x07\x1B\x02\x02\u0157\u015C\x05\x12\n\x02\u0158\u0159" +
		"\x07\x14\x02\x02\u0159\u015B\x05\x12\n\x02\u015A\u0158\x03\x02\x02\x02" +
		"\u015B\u015E\x03\x02\x02\x02\u015C\u015A\x03\x02\x02\x02\u015C\u015D\x03" +
		"\x02\x02\x02\u015D\u0160\x03\x02\x02\x02\u015E\u015C\x03\x02\x02\x02\u015F" +
		"\u0157\x03\x02\x02\x02\u015F\u0160\x03\x02\x02\x02\u0160\u0162\x03\x02" +
		"\x02\x02\u0161\u0163\x07\x14\x02\x02\u0162\u0161\x03\x02\x02\x02\u0162" +
		"\u0163\x03\x02\x02\x02\u0163\u0164\x03\x02\x02\x02\u0164\u0179\x07\x1C" +
		"\x02\x02\u0165\u0166\x07 \x02\x02\u0166\u0167\x07<\x02\x02\u0167\u0168" +
		"\x05\x12\n\x02\u0168\u0169\x07=\x02\x02\u0169\u016A\x05\x12\n\x02\u016A" +
		"\u016B\x07!\x02\x02\u016B\u016C\x05\x12\n\x06\u016C\u0179\x03\x02\x02" +
		"\x02\u016D\u016E\x05\x06\x04\x02\u016E\u016F\x05\x12\n\x05\u016F\u0179" +
		"\x03\x02\x02\x02\u0170\u0171\x07<\x02\x02\u0171\u0172\x05\x12\n\x02\u0172" +
		"\u0173\x07=\x02\x02\u0173\u0179\x03\x02\x02\x02\u0174\u0175\x07\x04\x02" +
		"\x02\u0175\u0176\x05\x12\n\x02\u0176\u0177\x07\x05\x02\x02\u0177\u0179" +
		"\x03\x02\x02\x02\u0178\xED\x03\x02\x02\x02\u0178\xF5\x03\x02\x02\x02\u0178" +
		"\xF7\x03\x02\x02\x02\u0178\u0106\x03\x02\x02\x02\u0178\u0115\x03\x02\x02" +
		"\x02\u0178\u0124\x03\x02\x02\x02\u0178\u0133\x03\x02\x02\x02\u0178\u0134" +
		"\x03\x02\x02\x02\u0178\u0144\x03\x02\x02\x02\u0178\u0156\x03\x02\x02\x02" +
		"\u0178\u0165\x03\x02\x02\x02\u0178\u016D\x03\x02\x02\x02\u0178\u0170\x03" +
		"\x02\x02\x02\u0178\u0174\x03\x02\x02\x02\u0179\u01B5\x03\x02\x02\x02\u017A" +
		"\u017B\f\x18\x02\x02\u017B\u017C\x07\x1D\x02\x02\u017C\u01B4\x05\x12\n" +
		"\x18\u017D\u017E\f\x17\x02\x02\u017E\u017F\t\x03\x02\x02\u017F\u01B4\x05" +
		"\x12\n\x18\u0180\u0181\f\x16\x02\x02\u0181\u0182\t\x04\x02\x02\u0182\u01B4" +
		"\x05\x12\n\x17\u0183\u0184\f\x15\x02\x02\u0184\u0185\t\x05\x02\x02\u0185" +
		"\u01B4\x05\x12\n\x16\u0186\u0187\f\x14\x02\x02\u0187\u0188\x07\n\x02\x02" +
		"\u0188\u0189\x05\x12\n\x15\u0189\u018A\b\n\x01\x02\u018A\u01B4\x03\x02" +
		"\x02\x02\u018B\u018C\f\x13\x02\x02\u018C\u018D\x07&\x02\x02\u018D\u01B4" +
		"\x05\x12\n\x14\u018E\u018F\f\x12\x02\x02\u018F\u0190\x07\'\x02\x02\u0190" +
		"\u01B4\x05\x12\n\x13\u0191\u0192\f\x11\x02\x02\u0192\u0193\x07(\x02\x02" +
		"\u0193\u01B4\x05\x12\n\x12\u0194\u0195\f\x10\x02\x02\u0195\u0196\x07)" +
		"\x02\x02\u0196\u01B4\x05\x12\n\x11\u0197\u0198\f\x1C\x02\x02\u0198\u0199" +
		"\x07\r\x02\x02\u0199\u019F\x05$\x13\x02\u019A\u019C\x07<\x02\x02\u019B" +
		"\u019D\x05 \x11\x02\u019C\u019B\x03\x02\x02\x02\u019C\u019D\x03\x02\x02" +
		"\x02\u019D\u019E\x03\x02\x02\x02\u019E\u01A0\x07=\x02\x02\u019F\u019A" +
		"\x03\x02\x02\x02\u019F\u01A0\x03\x02\x02\x02\u01A0\u01B4\x03\x02\x02\x02" +
		"\u01A1\u01A2\f\x1A\x02\x02\u01A2\u01A3\x07\x1B\x02\x02\u01A3\u01A4\x05" +
		"\x12\n\x02\u01A4\u01A5\x07\x1C\x02\x02\u01A5\u01B4\x03\x02\x02\x02\u01A6" +
		"\u01A7\f\x0F\x02\x02\u01A7\u01AF\x07/\x02\x02\u01A8\u01A9\x07\x1A\x02" +
		"\x02\u01A9\u01AA\x07#\x02\x02\u01AA\u01AB\x07\x07\x02\x02\u01AB\u01AC" +
		"\x05\x18\r\x02\u01AC\u01AD\x07\x16\x02\x02\u01AD\u01AE\x05\x12\n\x02\u01AE" +
		"\u01B0\x03\x02\x02\x02\u01AF\u01A8\x03\x02\x02\x02\u01B0\u01B1\x03\x02" +
		"\x02\x02\u01B1\u01AF\x03\x02\x02\x02\u01B1\u01B2\x03\x02\x02\x02\u01B2" +
		"\u01B4\x03\x02\x02\x02\u01B3\u017A\x03\x02\x02\x02\u01B3\u017D\x03\x02" +
		"\x02\x02\u01B3\u0180\x03\x02\x02\x02\u01B3\u0183\x03\x02\x02\x02\u01B3" +
		"\u0186\x03\x02\x02\x02\u01B3\u018B\x03\x02\x02\x02\u01B3\u018E\x03\x02" +
		"\x02\x02\u01B3\u0191\x03\x02\x02\x02\u01B3\u0194\x03\x02\x02\x02\u01B3" +
		"\u0197\x03\x02\x02\x02\u01B3\u01A1\x03\x02\x02\x02\u01B3\u01A6\x03\x02" +
		"\x02\x02\u01B4\u01B7\x03\x02\x02\x02\u01B5\u01B3\x03\x02\x02\x02\u01B5" +
		"\u01B6\x03\x02\x02\x02\u01B6\x13\x03\x02\x02\x02\u01B7\u01B5\x03\x02\x02" +
		"\x02\u01B8\u01BB\x05\x04\x03\x02\u01B9\u01BB\x05\x12\n\x02\u01BA\u01B8" +
		"\x03\x02\x02\x02\u01BA\u01B9\x03\x02\x02\x02\u01BB\x15\x03\x02\x02\x02" +
		"\u01BC\u01C1\x05\x18\r\x02\u01BD\u01BE\x07\x14\x02\x02\u01BE\u01C0\x05" +
		"\x18\r\x02\u01BF\u01BD\x03\x02\x02\x02\u01C0\u01C3\x03\x02\x02\x02\u01C1" +
		"\u01BF\x03\x02\x02\x02\u01C1\u01C2\x03\x02\x02\x02\u01C2\u01C4\x03\x02" +
		"\x02\x02\u01C3\u01C1\x03\x02\x02\x02\u01C4\u01C5\x07\x16\x02\x02\u01C5" +
		"\u01C6\x05\x12\n\x02\u01C6\u01E2\x03\x02\x02\x02\u01C7\u01C8\x07<\x02" +
		"\x02\u01C8\u01CD\x05\x18\r\x02\u01C9\u01CA\x07\x14\x02\x02\u01CA\u01CC" +
		"\x05\x18\r\x02\u01CB\u01C9\x03\x02\x02\x02\u01CC\u01CF\x03\x02\x02\x02" +
		"\u01CD\u01CB\x03\x02\x02\x02\u01CD\u01CE\x03\x02\x02\x02\u01CE\u01D0\x03" +
		"\x02\x02\x02\u01CF\u01CD\x03\x02\x02\x02\u01D0\u01D1\x07\x16\x02\x02\u01D1" +
		"\u01D2\x05\x12\n\x02\u01D2\u01D3\x07=\x02\x02\u01D3\u01E2\x03\x02\x02" +
		"\x02\u01D4\u01D5\x07\x04\x02\x02\u01D5\u01DA\x05\x18\r\x02\u01D6\u01D7" +
		"\x07\x14\x02\x02\u01D7\u01D9\x05\x18\r\x02\u01D8\u01D6\x03\x02\x02\x02" +
		"\u01D9\u01DC\x03\x02\x02\x02\u01DA\u01D8\x03\x02\x02\x02\u01DA\u01DB\x03" +
		"\x02\x02\x02\u01DB\u01DD\x03\x02\x02\x02\u01DC\u01DA\x03\x02\x02\x02\u01DD" +
		"\u01DE\x07\x16\x02\x02\u01DE\u01DF\x05\x12\n\x02\u01DF\u01E0\x07\x05\x02" +
		"\x02\u01E0\u01E2\x03\x02\x02\x02\u01E1\u01BC\x03\x02\x02\x02\u01E1\u01C7" +
		"\x03\x02\x02\x02\u01E1\u01D4\x03\x02\x02\x02\u01E2\x17\x03\x02\x02\x02" +
		"\u01E3\u01E4\t\x06\x02\x02\u01E4\x19\x03\x02\x02\x02\u01E5\u01E6\t\x07" +
		"\x02\x02\u01E6\x1B\x03\x02\x02\x02\u01E7\u01EC\x07>\x02\x02\u01E8\u01E9" +
		"\x07\r\x02\x02\u01E9\u01EB\x07>\x02\x02\u01EA\u01E8\x03\x02\x02\x02\u01EB" +
		"\u01EE\x03\x02\x02\x02\u01EC\u01EA\x03\x02\x02\x02\u01EC\u01ED\x03\x02" +
		"\x02\x02\u01ED\x1D\x03\x02\x02\x02\u01EE\u01EC\x03\x02\x02\x02\u01EF\u01F2" +
		"\x05\x16\f\x02\u01F0\u01F2\x05\x12\n\x02\u01F1\u01EF\x03\x02\x02\x02\u01F1" +
		"\u01F0\x03\x02\x02\x02\u01F2\x1F\x03\x02\x02\x02\u01F3\u01F8\x05\x1E\x10" +
		"\x02\u01F4\u01F5\x07\x14\x02\x02\u01F5\u01F7\x05\x1E\x10\x02\u01F6\u01F4" +
		"\x03\x02\x02\x02\u01F7\u01FA\x03\x02\x02\x02\u01F8\u01F6\x03\x02\x02\x02" +
		"\u01F8\u01F9\x03\x02\x02\x02\u01F9!\x03\x02\x02\x02\u01FA\u01F8\x03\x02" +
		"\x02\x02\u01FB\u01FE\x07>\x02\x02\u01FC\u01FE\t\b\x02\x02\u01FD\u01FB" +
		"\x03\x02\x02\x02\u01FD\u01FC\x03\x02\x02\x02\u01FE#\x03\x02\x02\x02\u01FF" +
		"\u0202\x07>\x02\x02\u0200\u0202\t\t\x02\x02\u0201\u01FF\x03\x02\x02\x02" +
		"\u0201\u0200\x03\x02\x02\x02\u0202%\x03\x02\x02\x02\u0203\u0204\t\n\x02" +
		"\x02\u0204\'\x03\x02\x02\x02\u0205\u0206\t\v\x02\x02\u0206)\x03\x02\x02" +
		"\x0250PUY^hps\x86\x8B\x8D\x98\x9B\xB2\xC1\xC9\xD3\xDA\xE8\xF1\xFE\u0102" +
		"\u010D\u0111\u011C\u0120\u012B\u012F\u013C\u0140\u014E\u0152\u015C\u015F" +
		"\u0162\u0178\u019C\u019F\u01B1\u01B3\u01B5\u01BA\u01C1\u01CD\u01DA\u01E1" +
		"\u01EC\u01F1\u01F8\u01FD\u0201";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TntParser.__ATN) {
			TntParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TntParser._serializedATN));
		}

		return TntParser.__ATN;
	}

}

export class ModuleContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
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
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
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
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
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
	public identOrHole(): IdentOrHoleContext {
		return this.getRuleContext(0, IdentOrHoleContext);
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
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
export class OperContext extends UnitContext {
	public operDef(): OperDefContext {
		return this.getRuleContext(0, OperDefContext);
	}
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
	public instanceMod(): InstanceModContext {
		return this.getRuleContext(0, InstanceModContext);
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
export class TypedefContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypedef) {
			listener.enterTypedef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypedef) {
			listener.exitTypedef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypedef) {
			return visitor.visitTypedef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ImportDefContext extends UnitContext {
	public path(): PathContext {
		return this.getRuleContext(0, PathContext);
	}
	public identOrStar(): IdentOrStarContext {
		return this.getRuleContext(0, IdentOrStarContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterImportDef) {
			listener.enterImportDef(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitImportDef) {
			listener.exitImportDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitImportDef) {
			return visitor.visitImportDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperDefContext extends ParserRuleContext {
	public qualifier(): QualifierContext {
		return this.getRuleContext(0, QualifierContext);
	}
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public params(): ParamsContext | undefined {
		return this.tryGetRuleContext(0, ParamsContext);
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


export class QualifierContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_qualifier; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterQualifier) {
			listener.enterQualifier(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitQualifier) {
			listener.exitQualifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitQualifier) {
			return visitor.visitQualifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamsContext extends ParserRuleContext {
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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


export class InstanceModContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.IDENTIFIER);
		} else {
			return this.getToken(TntParser.IDENTIFIER, i);
		}
	}
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
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
	public get ruleIndex(): number { return TntParser.RULE_instanceMod; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterInstanceMod) {
			listener.enterInstanceMod(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitInstanceMod) {
			listener.exitInstanceMod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitInstanceMod) {
			return visitor.visitInstanceMod(this);
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
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
	public SET(): TerminalNode { return this.getToken(TntParser.SET, 0); }
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
export class TypeListContext extends TypeContext {
	public LIST(): TerminalNode { return this.getToken(TntParser.LIST, 0); }
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterTypeList) {
			listener.enterTypeList(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitTypeList) {
			listener.exitTypeList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitTypeList) {
			return visitor.visitTypeList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeTupleContext extends TypeContext {
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
	public nameAfterDot(): NameAfterDotContext {
		return this.getRuleContext(0, NameAfterDotContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(TntParser.RPAREN, 0); }
	public argList(): ArgListContext | undefined {
		return this.tryGetRuleContext(0, ArgListContext);
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
	public normalCallName(): NormalCallNameContext {
		return this.getRuleContext(0, NormalCallNameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
	public argList(): ArgListContext | undefined {
		return this.tryGetRuleContext(0, ArgListContext);
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
	public MINUS(): TerminalNode { return this.getToken(TntParser.MINUS, 0); }
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
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(TntParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(TntParser.MINUS, 0); }
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
	public EQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQ, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(TntParser.ASGN, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
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
export class ErrorEqContext extends ExprContext {
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
		if (listener.enterErrorEq) {
			listener.enterErrorEq(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitErrorEq) {
			listener.exitErrorEq(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitErrorEq) {
			return visitor.visitErrorEq(this);
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
export class MatchContext extends ExprContext {
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public MATCH(): TerminalNode { return this.getToken(TntParser.MATCH, 0); }
	public STRING(): TerminalNode[];
	public STRING(i: number): TerminalNode;
	public STRING(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(TntParser.STRING);
		} else {
			return this.getToken(TntParser.STRING, i);
		}
	}
	public identOrHole(): IdentOrHoleContext[];
	public identOrHole(i: number): IdentOrHoleContext;
	public identOrHole(i?: number): IdentOrHoleContext | IdentOrHoleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentOrHoleContext);
		} else {
			return this.getRuleContext(i, IdentOrHoleContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterMatch) {
			listener.enterMatch(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitMatch) {
			listener.exitMatch(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitMatch) {
			return visitor.visitMatch(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AndExprContext extends ExprContext {
	public AND(): TerminalNode { return this.getToken(TntParser.AND, 0); }
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
		if (listener.enterAndExpr) {
			listener.enterAndExpr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAndExpr) {
			listener.exitAndExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAndExpr) {
			return visitor.visitAndExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrExprContext extends ExprContext {
	public OR(): TerminalNode { return this.getToken(TntParser.OR, 0); }
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
		if (listener.enterOrExpr) {
			listener.enterOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOrExpr) {
			listener.exitOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOrExpr) {
			return visitor.visitOrExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ActionAllContext extends ExprContext {
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
		if (listener.enterActionAll) {
			listener.enterActionAll(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitActionAll) {
			listener.exitActionAll(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitActionAll) {
			return visitor.visitActionAll(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ActionAnyContext extends ExprContext {
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
		if (listener.enterActionAny) {
			listener.enterActionAny(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitActionAny) {
			listener.exitActionAny(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitActionAny) {
			return visitor.visitActionAny(this);
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
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
export class ListContext extends ExprContext {
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
		if (listener.enterList) {
			listener.enterList(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitList) {
			listener.exitList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitList) {
			return visitor.visitList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfElseContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
export class LetInContext extends ExprContext {
	public operDef(): OperDefContext {
		return this.getRuleContext(0, OperDefContext);
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
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
	public LPAREN(): TerminalNode { return this.getToken(TntParser.LPAREN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(TntParser.RPAREN, 0); }
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
export class BracesContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterBraces) {
			listener.enterBraces(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitBraces) {
			listener.exitBraces(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitBraces) {
			return visitor.visitBraces(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnitOrExprContext extends ParserRuleContext {
	public unit(): UnitContext | undefined {
		return this.tryGetRuleContext(0, UnitContext);
	}
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_unitOrExpr; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterUnitOrExpr) {
			listener.enterUnitOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitUnitOrExpr) {
			listener.exitUnitOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitUnitOrExpr) {
			return visitor.visitUnitOrExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaContext extends ParserRuleContext {
	public identOrHole(): IdentOrHoleContext[];
	public identOrHole(i: number): IdentOrHoleContext;
	public identOrHole(i?: number): IdentOrHoleContext | IdentOrHoleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentOrHoleContext);
		} else {
			return this.getRuleContext(i, IdentOrHoleContext);
		}
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(TntParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(TntParser.RPAREN, 0); }
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


export class IdentOrHoleContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_identOrHole; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterIdentOrHole) {
			listener.enterIdentOrHole(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitIdentOrHole) {
			listener.exitIdentOrHole(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitIdentOrHole) {
			return visitor.visitIdentOrHole(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentOrStarContext extends ParserRuleContext {
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_identOrStar; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterIdentOrStar) {
			listener.enterIdentOrStar(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitIdentOrStar) {
			listener.exitIdentOrStar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitIdentOrStar) {
			return visitor.visitIdentOrStar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PathContext extends ParserRuleContext {
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
	public get ruleIndex(): number { return TntParser.RULE_path; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterPath) {
			listener.enterPath(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPath) {
			listener.exitPath(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPath) {
			return visitor.visitPath(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaOrExprContext extends ParserRuleContext {
	public lambda(): LambdaContext | undefined {
		return this.tryGetRuleContext(0, LambdaContext);
	}
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_lambdaOrExpr; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLambdaOrExpr) {
			listener.enterLambdaOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLambdaOrExpr) {
			listener.exitLambdaOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLambdaOrExpr) {
			return visitor.visitLambdaOrExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArgListContext extends ParserRuleContext {
	public lambdaOrExpr(): LambdaOrExprContext[];
	public lambdaOrExpr(i: number): LambdaOrExprContext;
	public lambdaOrExpr(i?: number): LambdaOrExprContext | LambdaOrExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(LambdaOrExprContext);
		} else {
			return this.getRuleContext(i, LambdaOrExprContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_argList; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterArgList) {
			listener.enterArgList(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitArgList) {
			listener.exitArgList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitArgList) {
			return visitor.visitArgList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalCallNameContext extends ParserRuleContext {
	public _op!: Token;
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(TntParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(TntParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(TntParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(TntParser.IMPLIES, 0); }
	public SET(): TerminalNode | undefined { return this.tryGetToken(TntParser.SET, 0); }
	public LIST(): TerminalNode | undefined { return this.tryGetToken(TntParser.LIST, 0); }
	public SUBSETEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUBSETEQ, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_normalCallName; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterNormalCallName) {
			listener.enterNormalCallName(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitNormalCallName) {
			listener.exitNormalCallName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitNormalCallName) {
			return visitor.visitNormalCallName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameAfterDotContext extends ParserRuleContext {
	public _op!: Token;
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(TntParser.IDENTIFIER, 0); }
	public IN(): TerminalNode | undefined { return this.tryGetToken(TntParser.IN, 0); }
	public NOTIN(): TerminalNode | undefined { return this.tryGetToken(TntParser.NOTIN, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(TntParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(TntParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(TntParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(TntParser.IMPLIES, 0); }
	public SUBSETEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SUBSETEQ, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_nameAfterDot; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterNameAfterDot) {
			listener.enterNameAfterDot(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitNameAfterDot) {
			listener.exitNameAfterDot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitNameAfterDot) {
			return visitor.visitNameAfterDot(this);
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
	public EQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.EQ, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(TntParser.ASGN, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(TntParser.DIV, 0); }
	public MOD(): TerminalNode | undefined { return this.tryGetToken(TntParser.MOD, 0); }
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(TntParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(TntParser.MINUS, 0); }
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


