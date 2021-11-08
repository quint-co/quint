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
	public static readonly SEQ = 44;
	public static readonly ADD = 45;
	public static readonly SUB = 46;
	public static readonly MUL = 47;
	public static readonly DIV = 48;
	public static readonly MOD = 49;
	public static readonly GT = 50;
	public static readonly LT = 51;
	public static readonly GE = 52;
	public static readonly LE = 53;
	public static readonly NE = 54;
	public static readonly EQ = 55;
	public static readonly ASGN = 56;
	public static readonly IDENTIFIER = 57;
	public static readonly LINE_COMMENT = 58;
	public static readonly COMMENT = 59;
	public static readonly WS = 60;
	public static readonly RULE_module = 0;
	public static readonly RULE_unit = 1;
	public static readonly RULE_operDef = 2;
	public static readonly RULE_params = 3;
	public static readonly RULE_instanceParams = 4;
	public static readonly RULE_instanceMod = 5;
	public static readonly RULE_type = 6;
	public static readonly RULE_typeUnionRecOne = 7;
	public static readonly RULE_expr = 8;
	public static readonly RULE_lambda = 9;
	public static readonly RULE_identOrHole = 10;
	public static readonly RULE_lambdaOrExpr = 11;
	public static readonly RULE_argList = 12;
	public static readonly RULE_normalCallName = 13;
	public static readonly RULE_nameAfterDot = 14;
	public static readonly RULE_operator = 15;
	public static readonly RULE_literal = 16;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"module", "unit", "operDef", "params", "instanceParams", "instanceMod", 
		"type", "typeUnionRecOne", "expr", "lambda", "identOrHole", "lambdaOrExpr", 
		"argList", "normalCallName", "nameAfterDot", "operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'_'", "'='", "'type'", "'val'", "'def'", "'pred'", "'action'", "'temporal'", 
		"'('", "','", "')'", "'->'", "'=>'", "'int'", "'str'", "'bool'", "'|'", 
		"'.'", "'['", "']'", "'^'", "'if'", "'else'", "'&'", "'case'", undefined, 
		undefined, undefined, "'and'", "'or'", "'iff'", "'implies'", "'subseteq'", 
		"'in'", "'notin'", "'set'", "'seq'", "'+'", "'-'", "'*'", "'/'", "'%'", 
		"'>'", "'<'", "'>='", "'<='", "'!='", "'=='", "'<-'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "STRING", "BOOL", 
		"INT", "AND", "OR", "IFF", "IMPLIES", "SUBSETEQ", "IN", "NOTIN", "SET", 
		"SEQ", "ADD", "SUB", "MUL", "DIV", "MOD", "GT", "LT", "GE", "LE", "NE", 
		"EQ", "ASGN", "IDENTIFIER", "LINE_COMMENT", "COMMENT", "WS",
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
			this.state = 34;
			this.match(TntParser.T__0);
			this.state = 35;
			this.match(TntParser.IDENTIFIER);
			this.state = 36;
			this.match(TntParser.T__1);
			this.state = 40;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__1) | (1 << TntParser.T__3) | (1 << TntParser.T__5) | (1 << TntParser.T__6) | (1 << TntParser.T__9) | (1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__23) | (1 << TntParser.T__25) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.ADD - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.MUL - 32)) | (1 << (TntParser.DIV - 32)) | (1 << (TntParser.MOD - 32)) | (1 << (TntParser.GT - 32)) | (1 << (TntParser.LT - 32)) | (1 << (TntParser.GE - 32)) | (1 << (TntParser.LE - 32)) | (1 << (TntParser.NE - 32)) | (1 << (TntParser.EQ - 32)) | (1 << (TntParser.ASGN - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
				{
				{
				this.state = 37;
				this.unit();
				}
				}
				this.state = 42;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 43;
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
		let _la: number;
		try {
			this.state = 70;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 45;
				this.match(TntParser.T__3);
				this.state = 46;
				this.match(TntParser.IDENTIFIER);
				this.state = 47;
				this.match(TntParser.T__4);
				this.state = 48;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 49;
				this.match(TntParser.T__5);
				this.state = 50;
				this.match(TntParser.IDENTIFIER);
				this.state = 51;
				this.match(TntParser.T__4);
				this.state = 52;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 53;
				this.match(TntParser.T__6);
				this.state = 54;
				_la = this._input.LA(1);
				if (!(_la === TntParser.T__7 || _la === TntParser.IDENTIFIER)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 55;
				this.match(TntParser.T__8);
				this.state = 56;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 57;
				this.operDef();
				}
				break;

			case 5:
				_localctx = new ModuleNestedContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 58;
				this.module();
				}
				break;

			case 6:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 59;
				this.instanceMod();
				}
				break;

			case 7:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 60;
				this.match(TntParser.T__9);
				this.state = 61;
				this.match(TntParser.IDENTIFIER);
				this.state = 62;
				this.match(TntParser.T__8);
				this.state = 63;
				this.type(0);
				}
				break;

			case 8:
				_localctx = new ErrorCaseContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 67;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.IDENTIFIER:
					{
					this.state = 64;
					this.match(TntParser.IDENTIFIER);
					}
					break;
				case TntParser.T__1:
				case TntParser.T__15:
				case TntParser.T__23:
				case TntParser.T__25:
				case TntParser.T__27:
				case TntParser.T__28:
				case TntParser.T__30:
				case TntParser.T__31:
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
				case TntParser.EQ:
				case TntParser.ASGN:
					{
					this.state = 65;
					this.operator();
					}
					break;
				case TntParser.STRING:
				case TntParser.BOOL:
				case TntParser.INT:
					{
					this.state = 66;
					this.literal();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}

				         this.notifyErrorListeners("TNT001: expected 'const', 'var', 'def', 'type', etc.");
				                
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
			this.state = 72;
			_localctx._qualifier = this._input.LT(1);
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14))) !== 0))) {
				_localctx._qualifier = this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 73;
			this.match(TntParser.IDENTIFIER);
			this.state = 75;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__15) {
				{
				this.state = 74;
				this.params();
				}
			}

			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__4) {
				{
				this.state = 77;
				this.match(TntParser.T__4);
				this.state = 78;
				this.type(0);
				}
			}

			this.state = 81;
			this.match(TntParser.T__8);
			this.state = 82;
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
	public params(): ParamsContext {
		let _localctx: ParamsContext = new ParamsContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, TntParser.RULE_params);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 84;
			this.match(TntParser.T__15);
			this.state = 93;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.IDENTIFIER) {
				{
				this.state = 85;
				this.match(TntParser.IDENTIFIER);
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 86;
					this.match(TntParser.T__16);
					this.state = 87;
					this.match(TntParser.IDENTIFIER);
					}
					}
					this.state = 92;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 95;
			this.match(TntParser.T__17);
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
	public instanceParams(): InstanceParamsContext {
		let _localctx: InstanceParamsContext = new InstanceParamsContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, TntParser.RULE_instanceParams);
		let _la: number;
		try {
			let _alt: number;
			this.state = 114;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.MUL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 97;
				this.match(TntParser.MUL);
				}
				break;
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 98;
				this.match(TntParser.IDENTIFIER);
				this.state = 99;
				this.match(TntParser.T__8);
				this.state = 100;
				this.expr(0);
				this.state = 107;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 101;
						this.match(TntParser.T__16);
						this.state = 102;
						this.match(TntParser.IDENTIFIER);
						this.state = 103;
						this.match(TntParser.T__8);
						this.state = 104;
						this.expr(0);
						}
						}
					}
					this.state = 109;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
				}
				this.state = 112;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__16) {
					{
					this.state = 110;
					this.match(TntParser.T__16);
					this.state = 111;
					this.match(TntParser.MUL);
					}
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
	public instanceMod(): InstanceModContext {
		let _localctx: InstanceModContext = new InstanceModContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, TntParser.RULE_instanceMod);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 116;
			this.match(TntParser.T__0);
			this.state = 117;
			this.match(TntParser.IDENTIFIER);
			this.state = 118;
			this.match(TntParser.T__8);
			this.state = 119;
			this.match(TntParser.IDENTIFIER);
			this.state = 120;
			this.match(TntParser.T__15);
			this.state = 121;
			this.instanceParams();
			this.state = 122;
			this.match(TntParser.T__17);
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
			this.state = 190;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 125;
				this.match(TntParser.T__15);
				this.state = 134;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__15) | (1 << TntParser.T__20) | (1 << TntParser.T__21) | (1 << TntParser.T__22) | (1 << TntParser.T__23))) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (TntParser.SET - 43)) | (1 << (TntParser.SEQ - 43)) | (1 << (TntParser.IDENTIFIER - 43)))) !== 0)) {
					{
					this.state = 126;
					this.type(0);
					this.state = 131;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__16) {
						{
						{
						this.state = 127;
						this.match(TntParser.T__16);
						this.state = 128;
						this.type(0);
						}
						}
						this.state = 133;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 136;
				this.match(TntParser.T__17);
				this.state = 137;
				this.match(TntParser.T__19);
				this.state = 138;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 139;
				this.match(TntParser.SET);
				this.state = 140;
				this.match(TntParser.T__15);
				this.state = 141;
				this.type(0);
				this.state = 142;
				this.match(TntParser.T__17);
				}
				break;

			case 3:
				{
				_localctx = new TypeSeqContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 144;
				this.match(TntParser.SEQ);
				this.state = 145;
				this.match(TntParser.T__15);
				this.state = 146;
				this.type(0);
				this.state = 147;
				this.match(TntParser.T__17);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 149;
				this.match(TntParser.T__15);
				this.state = 150;
				this.type(0);
				this.state = 151;
				this.match(TntParser.T__16);
				this.state = 152;
				this.type(0);
				this.state = 157;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 153;
					this.match(TntParser.T__16);
					this.state = 154;
					this.type(0);
					}
					}
					this.state = 159;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 160;
				this.match(TntParser.T__17);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 162;
				this.match(TntParser.T__1);
				this.state = 163;
				this.match(TntParser.IDENTIFIER);
				this.state = 164;
				this.match(TntParser.T__4);
				this.state = 165;
				this.type(0);
				this.state = 172;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 166;
					this.match(TntParser.T__16);
					this.state = 167;
					this.match(TntParser.IDENTIFIER);
					this.state = 168;
					this.match(TntParser.T__4);
					this.state = 169;
					this.type(0);
					}
					}
					this.state = 174;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 175;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 178;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 177;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 180;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 14, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 182;
				this.match(TntParser.T__20);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 183;
				this.match(TntParser.T__21);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 184;
				this.match(TntParser.T__22);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 185;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 186;
				this.match(TntParser.T__15);
				this.state = 187;
				this.type(0);
				this.state = 188;
				this.match(TntParser.T__17);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 197;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 16, this._ctx);
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
					this.state = 192;
					if (!(this.precpred(this._ctx, 12))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
					}
					this.state = 193;
					this.match(TntParser.T__18);
					this.state = 194;
					this.type(13);
					}
					}
				}
				this.state = 199;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 16, this._ctx);
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
			this.state = 200;
			this.match(TntParser.T__23);
			this.state = 201;
			this.match(TntParser.T__1);
			this.state = 202;
			this.match(TntParser.IDENTIFIER);
			this.state = 203;
			this.match(TntParser.T__4);
			this.state = 204;
			this.match(TntParser.STRING);
			this.state = 211;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__16) {
				{
				{
				this.state = 205;
				this.match(TntParser.T__16);
				this.state = 206;
				this.match(TntParser.IDENTIFIER);
				this.state = 207;
				this.match(TntParser.T__4);
				this.state = 208;
				this.type(0);
				}
				}
				this.state = 213;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 214;
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
			this.state = 350;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 31, this._ctx) ) {
			case 1:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 217;
				this.normalCallName();
				this.state = 218;
				this.match(TntParser.T__15);
				this.state = 220;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__7) | (1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__25) | (1 << TntParser.T__28))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.SET - 33)) | (1 << (TntParser.SEQ - 33)) | (1 << (TntParser.SUB - 33)) | (1 << (TntParser.IDENTIFIER - 33)))) !== 0)) {
					{
					this.state = 219;
					this.argList();
					}
				}

				this.state = 222;
				this.match(TntParser.T__17);
				}
				break;

			case 2:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 224;
				this.match(TntParser.SUB);
				this.state = 225;
				this.expr(22);
				}
				break;

			case 3:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 226;
				this.match(TntParser.T__28);
				this.state = 227;
				this.match(TntParser.T__15);
				this.state = 228;
				this.expr(0);
				this.state = 229;
				this.match(TntParser.T__17);
				this.state = 230;
				this.expr(0);
				this.state = 231;
				this.match(TntParser.T__29);
				this.state = 232;
				this.expr(18);
				}
				break;

			case 4:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 234;
				this.match(TntParser.T__15);
				this.state = 236;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__30) {
					{
					this.state = 235;
					this.match(TntParser.T__30);
					}
				}

				this.state = 238;
				this.expr(0);
				this.state = 239;
				this.match(TntParser.T__30);
				this.state = 240;
				this.expr(0);
				this.state = 245;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__30) {
					{
					{
					this.state = 241;
					this.match(TntParser.T__30);
					this.state = 242;
					this.expr(0);
					}
					}
					this.state = 247;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 248;
				this.match(TntParser.T__17);
				}
				break;

			case 5:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 250;
				this.match(TntParser.T__15);
				this.state = 252;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__23) {
					{
					this.state = 251;
					this.match(TntParser.T__23);
					}
				}

				this.state = 254;
				this.expr(0);
				this.state = 255;
				this.match(TntParser.T__23);
				this.state = 256;
				this.expr(0);
				this.state = 261;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__23) {
					{
					{
					this.state = 257;
					this.match(TntParser.T__23);
					this.state = 258;
					this.expr(0);
					}
					}
					this.state = 263;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 264;
				this.match(TntParser.T__17);
				}
				break;

			case 6:
				{
				_localctx = new AndActionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 266;
				this.match(TntParser.T__1);
				this.state = 268;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__30) {
					{
					this.state = 267;
					this.match(TntParser.T__30);
					}
				}

				this.state = 270;
				this.expr(0);
				this.state = 271;
				this.match(TntParser.T__30);
				this.state = 272;
				this.expr(0);
				this.state = 277;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__30) {
					{
					{
					this.state = 273;
					this.match(TntParser.T__30);
					this.state = 274;
					this.expr(0);
					}
					}
					this.state = 279;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 280;
				this.match(TntParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new OrActionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 282;
				this.match(TntParser.T__1);
				this.state = 284;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__23) {
					{
					this.state = 283;
					this.match(TntParser.T__23);
					}
				}

				this.state = 286;
				this.expr(0);
				this.state = 287;
				this.match(TntParser.T__23);
				this.state = 288;
				this.expr(0);
				this.state = 293;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__23) {
					{
					{
					this.state = 289;
					this.match(TntParser.T__23);
					this.state = 290;
					this.expr(0);
					}
					}
					this.state = 295;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 296;
				this.match(TntParser.T__2);
				}
				break;

			case 8:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 298;
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

			case 9:
				{
				_localctx = new TupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 299;
				this.match(TntParser.T__15);
				this.state = 300;
				this.expr(0);
				this.state = 301;
				this.match(TntParser.T__16);
				this.state = 302;
				this.expr(0);
				this.state = 307;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 303;
					this.match(TntParser.T__16);
					this.state = 304;
					this.expr(0);
					}
					}
					this.state = 309;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 310;
				this.match(TntParser.T__17);
				}
				break;

			case 10:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 312;
				this.match(TntParser.T__1);
				this.state = 313;
				this.match(TntParser.IDENTIFIER);
				this.state = 314;
				this.match(TntParser.T__4);
				this.state = 315;
				this.expr(0);
				this.state = 322;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 316;
					this.match(TntParser.T__16);
					this.state = 317;
					this.match(TntParser.IDENTIFIER);
					this.state = 318;
					this.match(TntParser.T__4);
					this.state = 319;
					this.expr(0);
					}
					}
					this.state = 324;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 325;
				this.match(TntParser.T__2);
				}
				break;

			case 11:
				{
				_localctx = new SequenceContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				{
				this.state = 327;
				this.match(TntParser.T__25);
				this.state = 336;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__25) | (1 << TntParser.T__28))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.SET - 33)) | (1 << (TntParser.SEQ - 33)) | (1 << (TntParser.SUB - 33)) | (1 << (TntParser.IDENTIFIER - 33)))) !== 0)) {
					{
					this.state = 328;
					this.expr(0);
					this.state = 333;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__16) {
						{
						{
						this.state = 329;
						this.match(TntParser.T__16);
						this.state = 330;
						this.expr(0);
						}
						}
						this.state = 335;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 338;
				this.match(TntParser.T__26);
				}
				}
				break;

			case 12:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 339;
				this.operDef();
				this.state = 340;
				this.expr(3);
				}
				break;

			case 13:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 342;
				this.match(TntParser.T__15);
				this.state = 343;
				this.expr(0);
				this.state = 344;
				this.match(TntParser.T__17);
				}
				break;

			case 14:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 346;
				this.match(TntParser.T__1);
				this.state = 347;
				this.expr(0);
				this.state = 348;
				this.match(TntParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 397;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 395;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 352;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 353;
						(_localctx as PowContext)._op = this.match(TntParser.T__27);
						this.state = 354;
						this.expr(21);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 355;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 356;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & ((1 << (TntParser.MUL - 47)) | (1 << (TntParser.DIV - 47)) | (1 << (TntParser.MOD - 47)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 357;
						this.expr(21);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 358;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 359;
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
						this.state = 360;
						this.expr(20);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 361;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 362;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (TntParser.SUBSETEQ - 40)) | (1 << (TntParser.IN - 40)) | (1 << (TntParser.NOTIN - 40)) | (1 << (TntParser.GT - 40)) | (1 << (TntParser.LT - 40)) | (1 << (TntParser.GE - 40)) | (1 << (TntParser.LE - 40)) | (1 << (TntParser.NE - 40)) | (1 << (TntParser.EQ - 40)) | (1 << (TntParser.ASGN - 40)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 363;
						this.expr(17);
						}
						break;

					case 5:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 364;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 365;
						this.match(TntParser.AND);
						this.state = 366;
						this.expr(16);
						}
						break;

					case 6:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 367;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 368;
						this.match(TntParser.OR);
						this.state = 369;
						this.expr(15);
						}
						break;

					case 7:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 370;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 371;
						this.match(TntParser.IFF);
						this.state = 372;
						this.expr(14);
						}
						break;

					case 8:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 373;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 374;
						this.match(TntParser.IMPLIES);
						this.state = 375;
						this.expr(13);
						}
						break;

					case 9:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 376;
						if (!(this.precpred(this._ctx, 25))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 25)");
						}
						this.state = 377;
						this.match(TntParser.T__24);
						this.state = 378;
						this.nameAfterDot();
						this.state = 383;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 32, this._ctx) ) {
						case 1:
							{
							this.state = 379;
							this.match(TntParser.T__15);
							this.state = 380;
							this.argList();
							this.state = 381;
							this.match(TntParser.T__17);
							}
							break;
						}
						}
						break;

					case 10:
						{
						_localctx = new FunAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 385;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 386;
						this.match(TntParser.T__25);
						this.state = 387;
						this.expr(0);
						this.state = 388;
						this.match(TntParser.T__26);
						}
						break;

					case 11:
						{
						_localctx = new InfixCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 390;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 391;
						this.match(TntParser.IDENTIFIER);
						this.state = 393;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 33, this._ctx) ) {
						case 1:
							{
							this.state = 392;
							this.argList();
							}
							break;
						}
						}
						break;
					}
					}
				}
				this.state = 399;
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
	public lambda(): LambdaContext {
		let _localctx: LambdaContext = new LambdaContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, TntParser.RULE_lambda);
		let _la: number;
		try {
			this.state = 437;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__7:
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 400;
				this.identOrHole();
				this.state = 405;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 401;
					this.match(TntParser.T__16);
					this.state = 402;
					this.identOrHole();
					}
					}
					this.state = 407;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 408;
				this.match(TntParser.T__18);
				this.state = 409;
				this.expr(0);
				}
				break;
			case TntParser.T__15:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 411;
				this.match(TntParser.T__15);
				this.state = 412;
				this.identOrHole();
				this.state = 417;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 413;
					this.match(TntParser.T__16);
					this.state = 414;
					this.identOrHole();
					}
					}
					this.state = 419;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 420;
				this.match(TntParser.T__18);
				this.state = 421;
				this.expr(0);
				this.state = 422;
				this.match(TntParser.T__17);
				}
				break;
			case TntParser.T__1:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 424;
				this.match(TntParser.T__1);
				this.state = 425;
				this.identOrHole();
				this.state = 430;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__16) {
					{
					{
					this.state = 426;
					this.match(TntParser.T__16);
					this.state = 427;
					this.identOrHole();
					}
					}
					this.state = 432;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 433;
				this.match(TntParser.T__18);
				this.state = 434;
				this.expr(0);
				this.state = 435;
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
		this.enterRule(_localctx, 20, TntParser.RULE_identOrHole);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 439;
			_la = this._input.LA(1);
			if (!(_la === TntParser.T__7 || _la === TntParser.IDENTIFIER)) {
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
	public lambdaOrExpr(): LambdaOrExprContext {
		let _localctx: LambdaOrExprContext = new LambdaOrExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, TntParser.RULE_lambdaOrExpr);
		try {
			this.state = 443;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 441;
				this.lambda();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 442;
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
		this.enterRule(_localctx, 24, TntParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 445;
			this.lambdaOrExpr();
			}
			this.state = 450;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 446;
					this.match(TntParser.T__16);
					{
					this.state = 447;
					this.lambdaOrExpr();
					}
					}
					}
				}
				this.state = 452;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
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
		this.enterRule(_localctx, 26, TntParser.RULE_normalCallName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 455;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				{
				this.state = 453;
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
			case TntParser.SEQ:
				{
				this.state = 454;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.AND - 36)) | (1 << (TntParser.OR - 36)) | (1 << (TntParser.IFF - 36)) | (1 << (TntParser.IMPLIES - 36)) | (1 << (TntParser.SUBSETEQ - 36)) | (1 << (TntParser.IN - 36)) | (1 << (TntParser.NOTIN - 36)) | (1 << (TntParser.SET - 36)) | (1 << (TntParser.SEQ - 36)))) !== 0))) {
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
		this.enterRule(_localctx, 28, TntParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 459;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				{
				this.state = 457;
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
				{
				this.state = 458;
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
		this.enterRule(_localctx, 30, TntParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 461;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__15) | (1 << TntParser.T__23) | (1 << TntParser.T__25) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.ADD - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.MUL - 32)) | (1 << (TntParser.DIV - 32)) | (1 << (TntParser.MOD - 32)) | (1 << (TntParser.GT - 32)) | (1 << (TntParser.LT - 32)) | (1 << (TntParser.GE - 32)) | (1 << (TntParser.LE - 32)) | (1 << (TntParser.NE - 32)) | (1 << (TntParser.EQ - 32)) | (1 << (TntParser.ASGN - 32)))) !== 0))) {
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
		this.enterRule(_localctx, 32, TntParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 463;
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
			return this.precpred(this._ctx, 21);

		case 2:
			return this.precpred(this._ctx, 20);

		case 3:
			return this.precpred(this._ctx, 19);

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
			return this.precpred(this._ctx, 25);

		case 10:
			return this.precpred(this._ctx, 23);

		case 11:
			return this.precpred(this._ctx, 17);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03>\u01D4\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x03" +
		"\x02\x03\x02\x03\x02\x03\x02\x07\x02)\n\x02\f\x02\x0E\x02,\v\x02\x03\x02" +
		"\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03F\n\x03\x03\x03\x05\x03" +
		"I\n\x03\x03\x04\x03\x04\x03\x04\x05\x04N\n\x04\x03\x04\x03\x04\x05\x04" +
		"R\n\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x07\x05" +
		"[\n\x05\f\x05\x0E\x05^\v\x05\x05\x05`\n\x05\x03\x05\x03\x05\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06l\n\x06\f" +
		"\x06\x0E\x06o\v\x06\x03\x06\x03\x06\x05\x06s\n\x06\x05\x06u\n\x06\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\b\x03" +
		"\b\x03\b\x03\b\x03\b\x07\b\x84\n\b\f\b\x0E\b\x87\v\b\x05\b\x89\n\b\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\x9E\n\b\f\b\x0E\b\xA1\v\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xAD" +
		"\n\b\f\b\x0E\b\xB0\v\b\x03\b\x03\b\x03\b\x06\b\xB5\n\b\r\b\x0E\b\xB6\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05\b\xC1\n\b\x03\b\x03\b" +
		"\x03\b\x07\b\xC6\n\b\f\b\x0E\b\xC9\v\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x07\t\xD4\n\t\f\t\x0E\t\xD7\v\t\x03\t\x03\t\x03\n" +
		"\x03\n\x03\n\x03\n\x05\n\xDF\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\xEF\n\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x07\n\xF6\n\n\f\n\x0E\n\xF9\v\n\x03\n\x03\n\x03\n\x03" +
		"\n\x05\n\xFF\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u0106\n\n\f\n\x0E" +
		"\n\u0109\v\n\x03\n\x03\n\x03\n\x03\n\x05\n\u010F\n\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x07\n\u0116\n\n\f\n\x0E\n\u0119\v\n\x03\n\x03\n\x03\n\x03" +
		"\n\x05\n\u011F\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u0126\n\n\f\n\x0E" +
		"\n\u0129\v\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07" +
		"\n\u0134\n\n\f\n\x0E\n\u0137\v\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x07\n\u0143\n\n\f\n\x0E\n\u0146\v\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x07\n\u014E\n\n\f\n\x0E\n\u0151\v\n\x05\n\u0153\n" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x05\n\u0161\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u0182" +
		"\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u018C\n\n\x07" +
		"\n\u018E\n\n\f\n\x0E\n\u0191\v\n\x03\v\x03\v\x03\v\x07\v\u0196\n\v\f\v" +
		"\x0E\v\u0199\v\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x07\v\u01A2" +
		"\n\v\f\v\x0E\v\u01A5\v\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03" +
		"\v\x07\v\u01AF\n\v\f\v\x0E\v\u01B2\v\v\x03\v\x03\v\x03\v\x03\v\x05\v\u01B8" +
		"\n\v\x03\f\x03\f\x03\r\x03\r\x05\r\u01BE\n\r\x03\x0E\x03\x0E\x03\x0E\x07" +
		"\x0E\u01C3\n\x0E\f\x0E\x0E\x0E\u01C6\v\x0E\x03\x0F\x03\x0F\x05\x0F\u01CA" +
		"\n\x0F\x03\x10\x03\x10\x05\x10\u01CE\n\x10\x03\x11\x03\x11\x03\x12\x03" +
		"\x12\x03\x12\x02\x02\x04\x0E\x12\x13\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02" +
		"\x1E\x02 \x02\"\x02\x02\f\x04\x02\n\n;;\x03\x02\r\x11\x04\x02#%;;\x03" +
		"\x0213\x03\x02/0\x04\x02*,4:\x03\x02&.\x03\x02&,\n\x02\x04\x04\x12\x12" +
		"\x1A\x1A\x1C\x1C\x1E\x1F!\"&,/:\x03\x02#%\x02\u0214\x02$\x03\x02\x02\x02" +
		"\x04H\x03\x02\x02\x02\x06J\x03\x02\x02\x02\bV\x03\x02\x02\x02\nt\x03\x02" +
		"\x02\x02\fv\x03\x02\x02\x02\x0E\xC0\x03\x02\x02\x02\x10\xCA\x03\x02\x02" +
		"\x02\x12\u0160\x03\x02\x02\x02\x14\u01B7\x03\x02\x02\x02\x16\u01B9\x03" +
		"\x02\x02\x02\x18\u01BD\x03\x02\x02\x02\x1A\u01BF\x03\x02\x02\x02\x1C\u01C9" +
		"\x03\x02\x02\x02\x1E\u01CD\x03\x02\x02\x02 \u01CF\x03\x02\x02\x02\"\u01D1" +
		"\x03\x02\x02\x02$%\x07\x03\x02\x02%&\x07;\x02\x02&*\x07\x04\x02\x02\'" +
		")\x05\x04\x03\x02(\'\x03\x02\x02\x02),\x03\x02\x02\x02*(\x03\x02\x02\x02" +
		"*+\x03\x02\x02\x02+-\x03\x02\x02\x02,*\x03\x02\x02\x02-.\x07\x05\x02\x02" +
		".\x03\x03\x02\x02\x02/0\x07\x06\x02\x0201\x07;\x02\x0212\x07\x07\x02\x02" +
		"2I\x05\x0E\b\x0234\x07\b\x02\x0245\x07;\x02\x0256\x07\x07\x02\x026I\x05" +
		"\x0E\b\x0278\x07\t\x02\x0289\t\x02\x02\x029:\x07\v\x02\x02:I\x05\x12\n" +
		"\x02;I\x05\x06\x04\x02<I\x05\x02\x02\x02=I\x05\f\x07\x02>?\x07\f\x02\x02" +
		"?@\x07;\x02\x02@A\x07\v\x02\x02AI\x05\x0E\b\x02BF\x07;\x02\x02CF\x05 " +
		"\x11\x02DF\x05\"\x12\x02EB\x03\x02\x02\x02EC\x03\x02\x02\x02ED\x03\x02" +
		"\x02\x02FG\x03\x02\x02\x02GI\b\x03\x01\x02H/\x03\x02\x02\x02H3\x03\x02" +
		"\x02\x02H7\x03\x02\x02\x02H;\x03\x02\x02\x02H<\x03\x02\x02\x02H=\x03\x02" +
		"\x02\x02H>\x03\x02\x02\x02HE\x03\x02\x02\x02I\x05\x03\x02\x02\x02JK\t" +
		"\x03\x02\x02KM\x07;\x02\x02LN\x05\b\x05\x02ML\x03\x02\x02\x02MN\x03\x02" +
		"\x02\x02NQ\x03\x02\x02\x02OP\x07\x07\x02\x02PR\x05\x0E\b\x02QO\x03\x02" +
		"\x02\x02QR\x03\x02\x02\x02RS\x03\x02\x02\x02ST\x07\v\x02\x02TU\x05\x12" +
		"\n\x02U\x07\x03\x02\x02\x02V_\x07\x12\x02\x02W\\\x07;\x02\x02XY\x07\x13" +
		"\x02\x02Y[\x07;\x02\x02ZX\x03\x02\x02\x02[^\x03\x02\x02\x02\\Z\x03\x02" +
		"\x02\x02\\]\x03\x02\x02\x02]`\x03\x02\x02\x02^\\\x03\x02\x02\x02_W\x03" +
		"\x02\x02\x02_`\x03\x02\x02\x02`a\x03\x02\x02\x02ab\x07\x14\x02\x02b\t" +
		"\x03\x02\x02\x02cu\x071\x02\x02de\x07;\x02\x02ef\x07\v\x02\x02fm\x05\x12" +
		"\n\x02gh\x07\x13\x02\x02hi\x07;\x02\x02ij\x07\v\x02\x02jl\x05\x12\n\x02" +
		"kg\x03\x02\x02\x02lo\x03\x02\x02\x02mk\x03\x02\x02\x02mn\x03\x02\x02\x02" +
		"nr\x03\x02\x02\x02om\x03\x02\x02\x02pq\x07\x13\x02\x02qs\x071\x02\x02" +
		"rp\x03\x02\x02\x02rs\x03\x02\x02\x02su\x03\x02\x02\x02tc\x03\x02\x02\x02" +
		"td\x03\x02\x02\x02u\v\x03\x02\x02\x02vw\x07\x03\x02\x02wx\x07;\x02\x02" +
		"xy\x07\v\x02\x02yz\x07;\x02\x02z{\x07\x12\x02\x02{|\x05\n\x06\x02|}\x07" +
		"\x14\x02\x02}\r\x03\x02\x02\x02~\x7F\b\b\x01\x02\x7F\x88\x07\x12\x02\x02" +
		"\x80\x85\x05\x0E\b\x02\x81\x82\x07\x13\x02\x02\x82\x84\x05\x0E\b\x02\x83" +
		"\x81\x03\x02\x02\x02\x84\x87\x03\x02\x02\x02\x85\x83\x03\x02\x02\x02\x85" +
		"\x86\x03\x02\x02\x02\x86\x89\x03\x02\x02\x02\x87\x85\x03\x02\x02\x02\x88" +
		"\x80\x03\x02\x02\x02\x88\x89\x03\x02\x02\x02\x89\x8A\x03\x02\x02\x02\x8A" +
		"\x8B\x07\x14\x02\x02\x8B\x8C\x07\x16\x02\x02\x8C\xC1\x05\x0E\b\r\x8D\x8E" +
		"\x07-\x02\x02\x8E\x8F\x07\x12\x02\x02\x8F\x90\x05\x0E\b\x02\x90\x91\x07" +
		"\x14\x02\x02\x91\xC1\x03\x02\x02\x02\x92\x93\x07.\x02\x02\x93\x94\x07" +
		"\x12\x02\x02\x94\x95\x05\x0E\b\x02\x95\x96\x07\x14\x02\x02\x96\xC1\x03" +
		"\x02\x02\x02\x97\x98\x07\x12\x02\x02\x98\x99\x05\x0E\b\x02\x99\x9A\x07" +
		"\x13\x02\x02\x9A\x9F\x05\x0E\b\x02\x9B\x9C\x07\x13\x02\x02\x9C\x9E\x05" +
		"\x0E\b\x02\x9D\x9B\x03\x02\x02\x02\x9E\xA1\x03\x02\x02\x02\x9F\x9D\x03" +
		"\x02\x02\x02\x9F\xA0\x03\x02\x02\x02\xA0\xA2\x03\x02\x02\x02\xA1\x9F\x03" +
		"\x02\x02\x02\xA2\xA3\x07\x14\x02\x02\xA3\xC1\x03\x02\x02\x02\xA4\xA5\x07" +
		"\x04\x02\x02\xA5\xA6\x07;\x02\x02\xA6\xA7\x07\x07\x02\x02\xA7\xAE\x05" +
		"\x0E\b\x02\xA8\xA9\x07\x13\x02\x02\xA9\xAA\x07;\x02\x02\xAA\xAB\x07\x07" +
		"\x02\x02\xAB\xAD\x05\x0E\b\x02\xAC\xA8\x03\x02\x02\x02\xAD\xB0\x03\x02" +
		"\x02\x02\xAE\xAC\x03\x02\x02\x02\xAE\xAF\x03\x02\x02\x02\xAF\xB1\x03\x02" +
		"\x02\x02\xB0\xAE\x03\x02\x02\x02\xB1\xB2\x07\x05\x02\x02\xB2\xC1\x03\x02" +
		"\x02\x02\xB3\xB5\x05\x10\t\x02\xB4\xB3\x03\x02\x02\x02\xB5\xB6\x03\x02" +
		"\x02\x02\xB6\xB4\x03\x02\x02\x02\xB6\xB7\x03\x02\x02\x02\xB7\xC1\x03\x02" +
		"\x02\x02\xB8\xC1\x07\x17\x02\x02\xB9\xC1\x07\x18\x02\x02\xBA\xC1\x07\x19" +
		"\x02\x02\xBB\xC1\x07;\x02\x02\xBC\xBD\x07\x12\x02\x02\xBD\xBE\x05\x0E" +
		"\b\x02\xBE\xBF\x07\x14\x02\x02\xBF\xC1\x03\x02\x02\x02\xC0~\x03\x02\x02" +
		"\x02\xC0\x8D\x03\x02\x02\x02\xC0\x92\x03\x02\x02\x02\xC0\x97\x03\x02\x02" +
		"\x02\xC0\xA4\x03\x02\x02\x02\xC0\xB4\x03\x02\x02\x02\xC0\xB8\x03\x02\x02" +
		"\x02\xC0\xB9\x03\x02\x02\x02\xC0\xBA\x03\x02\x02\x02\xC0\xBB\x03\x02\x02" +
		"\x02\xC0\xBC\x03\x02\x02\x02\xC1\xC7\x03\x02\x02\x02\xC2\xC3\f\x0E\x02" +
		"\x02\xC3\xC4\x07\x15\x02\x02\xC4\xC6\x05\x0E\b\x0F\xC5\xC2\x03\x02\x02" +
		"\x02\xC6\xC9\x03\x02\x02\x02\xC7\xC5\x03\x02\x02\x02\xC7\xC8\x03\x02\x02" +
		"\x02\xC8\x0F\x03\x02\x02\x02\xC9\xC7\x03\x02\x02\x02\xCA\xCB\x07\x1A\x02" +
		"\x02\xCB\xCC\x07\x04\x02\x02\xCC\xCD\x07;\x02\x02\xCD\xCE\x07\x07\x02" +
		"\x02\xCE\xD5\x07#\x02\x02\xCF\xD0\x07\x13\x02\x02\xD0\xD1\x07;\x02\x02" +
		"\xD1\xD2\x07\x07\x02\x02\xD2\xD4\x05\x0E\b\x02\xD3\xCF\x03\x02\x02\x02" +
		"\xD4\xD7\x03\x02\x02\x02\xD5\xD3\x03\x02\x02\x02\xD5\xD6\x03\x02\x02\x02" +
		"\xD6\xD8\x03\x02\x02\x02\xD7\xD5\x03\x02\x02\x02\xD8\xD9\x07\x05\x02\x02" +
		"\xD9\x11\x03\x02\x02\x02\xDA\xDB\b\n\x01\x02\xDB\xDC\x05\x1C\x0F\x02\xDC" +
		"\xDE\x07\x12\x02\x02\xDD\xDF\x05\x1A\x0E\x02\xDE\xDD\x03\x02\x02\x02\xDE" +
		"\xDF\x03\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1\x07\x14\x02\x02\xE1" +
		"\u0161\x03\x02\x02\x02\xE2\xE3\x070\x02\x02\xE3\u0161\x05\x12\n\x18\xE4" +
		"\xE5\x07\x1F\x02\x02\xE5\xE6\x07\x12\x02\x02\xE6\xE7\x05\x12\n\x02\xE7" +
		"\xE8\x07\x14\x02\x02\xE8\xE9\x05\x12\n\x02\xE9\xEA\x07 \x02\x02\xEA\xEB" +
		"\x05\x12\n\x14\xEB\u0161\x03\x02\x02\x02\xEC\xEE\x07\x12\x02\x02\xED\xEF" +
		"\x07!\x02\x02\xEE\xED\x03\x02\x02\x02\xEE\xEF\x03\x02\x02\x02\xEF\xF0" +
		"\x03\x02\x02\x02\xF0\xF1\x05\x12\n\x02\xF1\xF2\x07!\x02\x02\xF2\xF7\x05" +
		"\x12\n\x02\xF3\xF4\x07!\x02\x02\xF4\xF6\x05\x12\n\x02\xF5\xF3\x03\x02" +
		"\x02\x02\xF6\xF9\x03\x02\x02\x02\xF7\xF5\x03\x02\x02\x02\xF7\xF8\x03\x02" +
		"\x02\x02\xF8\xFA\x03\x02\x02\x02\xF9\xF7\x03\x02\x02\x02\xFA\xFB\x07\x14" +
		"\x02\x02\xFB\u0161\x03\x02\x02\x02\xFC\xFE\x07\x12\x02\x02\xFD\xFF\x07" +
		"\x1A\x02\x02\xFE\xFD\x03\x02\x02\x02\xFE\xFF\x03\x02\x02\x02\xFF\u0100" +
		"\x03\x02\x02\x02\u0100\u0101\x05\x12\n\x02\u0101\u0102\x07\x1A\x02\x02" +
		"\u0102\u0107\x05\x12\n\x02\u0103\u0104\x07\x1A\x02\x02\u0104\u0106\x05" +
		"\x12\n\x02\u0105\u0103\x03\x02\x02\x02\u0106\u0109\x03\x02\x02\x02\u0107" +
		"\u0105\x03\x02\x02\x02\u0107\u0108\x03\x02\x02\x02\u0108\u010A\x03\x02" +
		"\x02\x02\u0109\u0107\x03\x02\x02\x02\u010A\u010B\x07\x14\x02\x02\u010B" +
		"\u0161\x03\x02\x02\x02\u010C\u010E\x07\x04\x02\x02\u010D\u010F\x07!\x02" +
		"\x02\u010E\u010D\x03\x02\x02\x02\u010E\u010F\x03\x02\x02\x02\u010F\u0110" +
		"\x03\x02\x02\x02\u0110\u0111\x05\x12\n\x02\u0111\u0112\x07!\x02\x02\u0112" +
		"\u0117\x05\x12\n\x02\u0113\u0114\x07!\x02\x02\u0114\u0116\x05\x12\n\x02" +
		"\u0115\u0113\x03\x02\x02\x02\u0116\u0119\x03\x02\x02\x02\u0117\u0115\x03" +
		"\x02\x02\x02\u0117\u0118\x03\x02\x02\x02\u0118\u011A\x03\x02\x02\x02\u0119" +
		"\u0117\x03\x02\x02\x02\u011A\u011B\x07\x05\x02\x02\u011B\u0161\x03\x02" +
		"\x02\x02\u011C\u011E\x07\x04\x02\x02\u011D\u011F\x07\x1A\x02\x02\u011E" +
		"\u011D\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\u0120\x03\x02" +
		"\x02\x02\u0120\u0121\x05\x12\n\x02\u0121\u0122\x07\x1A\x02\x02\u0122\u0127" +
		"\x05\x12\n\x02\u0123\u0124\x07\x1A\x02\x02\u0124\u0126\x05\x12\n\x02\u0125" +
		"\u0123\x03\x02\x02\x02\u0126\u0129\x03\x02\x02\x02\u0127\u0125\x03\x02" +
		"\x02\x02\u0127\u0128\x03\x02\x02\x02\u0128\u012A\x03\x02\x02\x02\u0129" +
		"\u0127\x03\x02\x02\x02\u012A\u012B\x07\x05\x02\x02\u012B\u0161\x03\x02" +
		"\x02\x02\u012C\u0161\t\x04\x02\x02\u012D\u012E\x07\x12\x02\x02\u012E\u012F" +
		"\x05\x12\n\x02\u012F\u0130\x07\x13\x02\x02\u0130\u0135\x05\x12\n\x02\u0131" +
		"\u0132\x07\x13\x02\x02\u0132\u0134\x05\x12\n\x02\u0133\u0131\x03\x02\x02" +
		"\x02\u0134\u0137\x03\x02\x02\x02\u0135\u0133\x03\x02\x02\x02\u0135\u0136" +
		"\x03\x02\x02\x02\u0136\u0138\x03\x02\x02\x02\u0137\u0135\x03\x02\x02\x02" +
		"\u0138\u0139\x07\x14\x02\x02\u0139\u0161\x03\x02\x02\x02\u013A\u013B\x07" +
		"\x04\x02\x02\u013B\u013C\x07;\x02\x02\u013C\u013D\x07\x07\x02\x02\u013D" +
		"\u0144\x05\x12\n\x02\u013E\u013F\x07\x13\x02\x02\u013F\u0140\x07;\x02" +
		"\x02\u0140\u0141\x07\x07\x02\x02\u0141\u0143\x05\x12\n\x02\u0142\u013E" +
		"\x03\x02\x02\x02\u0143\u0146\x03\x02\x02\x02\u0144\u0142\x03\x02\x02\x02" +
		"\u0144\u0145\x03\x02\x02\x02\u0145\u0147\x03\x02\x02\x02\u0146\u0144\x03" +
		"\x02\x02\x02\u0147\u0148\x07\x05\x02\x02\u0148\u0161\x03\x02\x02\x02\u0149" +
		"\u0152\x07\x1C\x02\x02\u014A\u014F\x05\x12\n\x02\u014B\u014C\x07\x13\x02" +
		"\x02\u014C\u014E\x05\x12\n\x02\u014D\u014B\x03\x02\x02\x02\u014E\u0151" +
		"\x03\x02\x02\x02\u014F\u014D\x03\x02\x02\x02\u014F\u0150\x03\x02\x02\x02" +
		"\u0150\u0153\x03\x02\x02\x02\u0151\u014F\x03\x02\x02\x02\u0152\u014A\x03" +
		"\x02\x02\x02\u0152\u0153\x03\x02\x02\x02\u0153\u0154\x03\x02\x02\x02\u0154" +
		"\u0161\x07\x1D\x02\x02\u0155\u0156\x05\x06\x04\x02\u0156\u0157\x05\x12" +
		"\n\x05\u0157\u0161\x03\x02\x02\x02\u0158\u0159\x07\x12\x02\x02\u0159\u015A" +
		"\x05\x12\n\x02\u015A\u015B\x07\x14\x02\x02\u015B\u0161\x03\x02\x02\x02" +
		"\u015C\u015D\x07\x04\x02\x02\u015D\u015E\x05\x12\n\x02\u015E\u015F\x07" +
		"\x05\x02\x02\u015F\u0161\x03\x02\x02\x02\u0160\xDA\x03\x02\x02\x02\u0160" +
		"\xE2\x03\x02\x02\x02\u0160\xE4\x03\x02\x02\x02\u0160\xEC\x03\x02\x02\x02" +
		"\u0160\xFC\x03\x02\x02\x02\u0160\u010C\x03\x02\x02\x02\u0160\u011C\x03" +
		"\x02\x02\x02\u0160\u012C\x03\x02\x02\x02\u0160\u012D\x03\x02\x02\x02\u0160" +
		"\u013A\x03\x02\x02\x02\u0160\u0149\x03\x02\x02\x02\u0160\u0155\x03\x02" +
		"\x02\x02\u0160\u0158\x03\x02\x02\x02\u0160\u015C\x03\x02\x02\x02\u0161" +
		"\u018F\x03\x02\x02\x02\u0162\u0163\f\x17\x02\x02\u0163\u0164\x07\x1E\x02" +
		"\x02\u0164\u018E\x05\x12\n\x17\u0165\u0166\f\x16\x02\x02\u0166\u0167\t" +
		"\x05\x02\x02\u0167\u018E\x05\x12\n\x17\u0168\u0169\f\x15\x02\x02\u0169" +
		"\u016A\t\x06\x02\x02\u016A\u018E\x05\x12\n\x16\u016B\u016C\f\x12\x02\x02" +
		"\u016C\u016D\t\x07\x02\x02\u016D\u018E\x05\x12\n\x13\u016E\u016F\f\x11" +
		"\x02\x02\u016F\u0170\x07&\x02\x02\u0170\u018E\x05\x12\n\x12\u0171\u0172" +
		"\f\x10\x02\x02\u0172\u0173\x07\'\x02\x02\u0173\u018E\x05\x12\n\x11\u0174" +
		"\u0175\f\x0F\x02\x02\u0175\u0176\x07(\x02\x02\u0176\u018E\x05\x12\n\x10" +
		"\u0177\u0178\f\x0E\x02\x02\u0178\u0179\x07)\x02\x02\u0179\u018E\x05\x12" +
		"\n\x0F\u017A\u017B\f\x1B\x02\x02\u017B\u017C\x07\x1B\x02\x02\u017C\u0181" +
		"\x05\x1E\x10\x02\u017D\u017E\x07\x12\x02\x02\u017E\u017F\x05\x1A\x0E\x02" +
		"\u017F\u0180\x07\x14\x02\x02\u0180\u0182\x03\x02\x02\x02\u0181\u017D\x03" +
		"\x02\x02\x02\u0181\u0182\x03\x02\x02\x02\u0182\u018E\x03\x02\x02\x02\u0183" +
		"\u0184\f\x19\x02\x02\u0184\u0185\x07\x1C\x02\x02\u0185\u0186\x05\x12\n" +
		"\x02\u0186\u0187\x07\x1D\x02\x02\u0187\u018E\x03\x02\x02\x02\u0188\u0189" +
		"\f\x13\x02\x02\u0189\u018B\x07;\x02\x02\u018A\u018C\x05\x1A\x0E\x02\u018B" +
		"\u018A\x03\x02\x02\x02\u018B\u018C\x03\x02\x02\x02\u018C\u018E\x03\x02" +
		"\x02\x02\u018D\u0162\x03\x02\x02\x02\u018D\u0165\x03\x02\x02\x02\u018D" +
		"\u0168\x03\x02\x02\x02\u018D\u016B\x03\x02\x02\x02\u018D\u016E\x03\x02" +
		"\x02\x02\u018D\u0171\x03\x02\x02\x02\u018D\u0174\x03\x02\x02\x02\u018D" +
		"\u0177\x03\x02\x02\x02\u018D\u017A\x03\x02\x02\x02\u018D\u0183\x03\x02" +
		"\x02\x02\u018D\u0188\x03\x02\x02\x02\u018E\u0191\x03\x02\x02\x02\u018F" +
		"\u018D\x03\x02\x02\x02\u018F\u0190\x03\x02\x02\x02\u0190\x13\x03\x02\x02" +
		"\x02\u0191\u018F\x03\x02\x02\x02\u0192\u0197\x05\x16\f\x02\u0193\u0194" +
		"\x07\x13\x02\x02\u0194\u0196\x05\x16\f\x02\u0195\u0193\x03\x02\x02\x02" +
		"\u0196\u0199\x03\x02\x02\x02\u0197\u0195\x03\x02\x02\x02\u0197\u0198\x03" +
		"\x02\x02\x02\u0198\u019A\x03\x02\x02\x02\u0199\u0197\x03\x02\x02\x02\u019A" +
		"\u019B\x07\x15\x02\x02\u019B\u019C\x05\x12\n\x02\u019C\u01B8\x03\x02\x02" +
		"\x02\u019D\u019E\x07\x12\x02\x02\u019E\u01A3\x05\x16\f\x02\u019F\u01A0" +
		"\x07\x13\x02\x02\u01A0\u01A2\x05\x16\f\x02\u01A1\u019F\x03\x02\x02\x02" +
		"\u01A2\u01A5\x03\x02\x02\x02\u01A3\u01A1\x03\x02\x02\x02\u01A3\u01A4\x03" +
		"\x02\x02\x02\u01A4\u01A6\x03\x02\x02\x02\u01A5\u01A3\x03\x02\x02\x02\u01A6" +
		"\u01A7\x07\x15\x02\x02\u01A7\u01A8\x05\x12\n\x02\u01A8\u01A9\x07\x14\x02" +
		"\x02\u01A9\u01B8\x03\x02\x02\x02\u01AA\u01AB\x07\x04\x02\x02\u01AB\u01B0" +
		"\x05\x16\f\x02\u01AC\u01AD\x07\x13\x02\x02\u01AD\u01AF\x05\x16\f\x02\u01AE" +
		"\u01AC\x03\x02\x02\x02\u01AF\u01B2\x03\x02\x02\x02\u01B0\u01AE\x03\x02" +
		"\x02\x02\u01B0\u01B1\x03\x02\x02\x02\u01B1\u01B3\x03\x02\x02\x02\u01B2" +
		"\u01B0\x03\x02\x02\x02\u01B3\u01B4\x07\x15\x02\x02\u01B4\u01B5\x05\x12" +
		"\n\x02\u01B5\u01B6\x07\x05\x02\x02\u01B6\u01B8\x03\x02\x02\x02\u01B7\u0192" +
		"\x03\x02\x02\x02\u01B7\u019D\x03\x02\x02\x02\u01B7\u01AA\x03\x02\x02\x02" +
		"\u01B8\x15\x03\x02\x02\x02\u01B9\u01BA\t\x02\x02\x02\u01BA\x17\x03\x02" +
		"\x02\x02\u01BB\u01BE\x05\x14\v\x02\u01BC\u01BE\x05\x12\n\x02\u01BD\u01BB" +
		"\x03\x02\x02\x02\u01BD\u01BC\x03\x02\x02\x02\u01BE\x19\x03\x02\x02\x02" +
		"\u01BF\u01C4\x05\x18\r\x02\u01C0\u01C1\x07\x13\x02\x02\u01C1\u01C3\x05" +
		"\x18\r\x02\u01C2\u01C0\x03\x02\x02\x02\u01C3\u01C6\x03\x02\x02\x02\u01C4" +
		"\u01C2\x03\x02\x02\x02\u01C4\u01C5\x03\x02\x02\x02\u01C5\x1B\x03\x02\x02" +
		"\x02\u01C6\u01C4\x03\x02\x02\x02\u01C7\u01CA\x07;\x02\x02\u01C8\u01CA" +
		"\t\b\x02\x02\u01C9\u01C7\x03\x02\x02\x02\u01C9\u01C8\x03\x02\x02\x02\u01CA" +
		"\x1D\x03\x02\x02\x02\u01CB\u01CE\x07;\x02\x02\u01CC\u01CE\t\t\x02\x02" +
		"\u01CD\u01CB\x03\x02\x02\x02\u01CD\u01CC\x03\x02\x02\x02\u01CE\x1F\x03" +
		"\x02\x02\x02\u01CF\u01D0\t\n\x02\x02\u01D0!\x03\x02\x02\x02\u01D1\u01D2" +
		"\t\v\x02\x02\u01D2#\x03\x02\x02\x02.*EHMQ\\_mrt\x85\x88\x9F\xAE\xB6\xC0" +
		"\xC7\xD5\xDE\xEE\xF7\xFE\u0107\u010E\u0117\u011E\u0127\u0135\u0144\u014F" +
		"\u0152\u0160\u0181\u018B\u018D\u018F\u0197\u01A3\u01B0\u01B7\u01BD\u01C4" +
		"\u01C9\u01CD";
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
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
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


export class OperDefContext extends ParserRuleContext {
	public _qualifier!: Token;
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


export class InstanceParamsContext extends ParserRuleContext {
	public MUL(): TerminalNode | undefined { return this.tryGetToken(TntParser.MUL, 0); }
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
	public get ruleIndex(): number { return TntParser.RULE_instanceParams; }
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterInstanceParams) {
			listener.enterInstanceParams(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitInstanceParams) {
			listener.exitInstanceParams(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitInstanceParams) {
			return visitor.visitInstanceParams(this);
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
	public instanceParams(): InstanceParamsContext {
		return this.getRuleContext(0, InstanceParamsContext);
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
	public SEQ(): TerminalNode { return this.getToken(TntParser.SEQ, 0); }
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
export class InfixCallContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public argList(): ArgListContext | undefined {
		return this.tryGetRuleContext(0, ArgListContext);
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
export class AndExprContext extends ExprContext {
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
export class AndActionContext extends ExprContext {
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
		if (listener.enterAndAction) {
			listener.enterAndAction(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitAndAction) {
			listener.exitAndAction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitAndAction) {
			return visitor.visitAndAction(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrActionContext extends ExprContext {
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
		if (listener.enterOrAction) {
			listener.enterOrAction(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitOrAction) {
			listener.exitOrAction(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitOrAction) {
			return visitor.visitOrAction(this);
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
	public SEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SEQ, 0); }
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


