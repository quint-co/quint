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
	public static readonly PLUS = 45;
	public static readonly MINUS = 46;
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
	public static readonly RULE_instanceMod = 4;
	public static readonly RULE_type = 5;
	public static readonly RULE_typeUnionRecOne = 6;
	public static readonly RULE_expr = 7;
	public static readonly RULE_lambda = 8;
	public static readonly RULE_identOrHole = 9;
	public static readonly RULE_identOrStar = 10;
	public static readonly RULE_path = 11;
	public static readonly RULE_lambdaOrExpr = 12;
	public static readonly RULE_argList = 13;
	public static readonly RULE_normalCallName = 14;
	public static readonly RULE_nameAfterDot = 15;
	public static readonly RULE_operator = 16;
	public static readonly RULE_literal = 17;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"module", "unit", "operDef", "params", "instanceMod", "type", "typeUnionRecOne", 
		"expr", "lambda", "identOrHole", "identOrStar", "path", "lambdaOrExpr", 
		"argList", "normalCallName", "nameAfterDot", "operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'='", "'type'", "'import'", "'.'", "'val'", "'def'", "'pred'", "'action'", 
		"'temporal'", "'('", "','", "')'", "'->'", "'=>'", "'int'", "'str'", "'bool'", 
		"'|'", "'['", "']'", "'^'", "'if'", "'else'", "'&'", "'_'", undefined, 
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
		"SEQ", "PLUS", "MINUS", "MUL", "DIV", "MOD", "GT", "LT", "GE", "LE", "NE", 
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
			this.state = 36;
			this.match(TntParser.T__0);
			this.state = 37;
			this.match(TntParser.IDENTIFIER);
			this.state = 38;
			this.match(TntParser.T__1);
			this.state = 42;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__1) | (1 << TntParser.T__3) | (1 << TntParser.T__5) | (1 << TntParser.T__6) | (1 << TntParser.T__8) | (1 << TntParser.T__9) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15) | (1 << TntParser.T__16) | (1 << TntParser.T__24) | (1 << TntParser.T__25) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (TntParser.STRING - 33)) | (1 << (TntParser.BOOL - 33)) | (1 << (TntParser.INT - 33)) | (1 << (TntParser.AND - 33)) | (1 << (TntParser.OR - 33)) | (1 << (TntParser.IFF - 33)) | (1 << (TntParser.IMPLIES - 33)) | (1 << (TntParser.SUBSETEQ - 33)) | (1 << (TntParser.IN - 33)) | (1 << (TntParser.NOTIN - 33)) | (1 << (TntParser.PLUS - 33)) | (1 << (TntParser.MINUS - 33)) | (1 << (TntParser.MUL - 33)) | (1 << (TntParser.DIV - 33)) | (1 << (TntParser.MOD - 33)) | (1 << (TntParser.GT - 33)) | (1 << (TntParser.LT - 33)) | (1 << (TntParser.GE - 33)) | (1 << (TntParser.LE - 33)) | (1 << (TntParser.NE - 33)) | (1 << (TntParser.EQ - 33)) | (1 << (TntParser.ASGN - 33)) | (1 << (TntParser.IDENTIFIER - 33)))) !== 0)) {
				{
				{
				this.state = 39;
				this.unit();
				}
				}
				this.state = 44;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 45;
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
			this.state = 82;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 47;
				this.match(TntParser.T__3);
				this.state = 48;
				this.match(TntParser.IDENTIFIER);
				this.state = 49;
				this.match(TntParser.T__4);
				this.state = 50;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 51;
				this.match(TntParser.T__5);
				this.state = 52;
				this.match(TntParser.IDENTIFIER);
				this.state = 53;
				this.match(TntParser.T__4);
				this.state = 54;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 55;
				this.match(TntParser.T__6);
				this.state = 56;
				this.identOrHole();
				this.state = 57;
				this.match(TntParser.T__7);
				this.state = 58;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 60;
				this.operDef();
				}
				break;

			case 5:
				_localctx = new ModuleNestedContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 61;
				this.module();
				}
				break;

			case 6:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 62;
				this.instanceMod();
				}
				break;

			case 7:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 63;
				this.match(TntParser.T__8);
				this.state = 64;
				this.match(TntParser.IDENTIFIER);
				this.state = 65;
				this.match(TntParser.T__7);
				this.state = 66;
				this.type(0);
				}
				break;

			case 8:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 67;
				this.match(TntParser.T__9);
				this.state = 68;
				this.path();
				this.state = 69;
				this.match(TntParser.T__10);
				this.state = 70;
				this.identOrStar();
				}
				break;

			case 9:
				_localctx = new ErrorCaseContext(_localctx);
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 75;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.IDENTIFIER:
					{
					this.state = 72;
					this.match(TntParser.IDENTIFIER);
					}
					break;
				case TntParser.T__1:
				case TntParser.T__16:
				case TntParser.T__24:
				case TntParser.T__25:
				case TntParser.T__27:
				case TntParser.T__28:
				case TntParser.T__30:
				case TntParser.AND:
				case TntParser.OR:
				case TntParser.IFF:
				case TntParser.IMPLIES:
				case TntParser.SUBSETEQ:
				case TntParser.IN:
				case TntParser.NOTIN:
				case TntParser.PLUS:
				case TntParser.MINUS:
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
					this.state = 73;
					this.operator();
					}
					break;
				case TntParser.STRING:
				case TntParser.BOOL:
				case TntParser.INT:
					{
					this.state = 74;
					this.literal();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}

				         this.notifyErrorListeners("TNT001: expected 'const', 'var', 'def', 'type', etc.");
				          
				}
				break;

			case 10:
				_localctx = new ErrorNoTypeContext(_localctx);
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 78;
				_la = this._input.LA(1);
				if (!(_la === TntParser.T__3 || _la === TntParser.T__5)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 79;
				this.match(TntParser.IDENTIFIER);
				this.state = 80;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__3) | (1 << TntParser.T__5) | (1 << TntParser.T__6) | (1 << TntParser.T__8) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}

				            this.notifyErrorListeners("TNT002: missing ': type' after 'var' or 'const'");
				               
				          
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
			this.state = 84;
			_localctx._qualifier = this._input.LT(1);
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__15))) !== 0))) {
				_localctx._qualifier = this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 85;
			this.match(TntParser.IDENTIFIER);
			this.state = 87;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__16) {
				{
				this.state = 86;
				this.params();
				}
			}

			this.state = 91;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__4) {
				{
				this.state = 89;
				this.match(TntParser.T__4);
				this.state = 90;
				this.type(0);
				}
			}

			this.state = 93;
			this.match(TntParser.T__7);
			this.state = 94;
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
			this.state = 96;
			this.match(TntParser.T__16);
			this.state = 105;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.IDENTIFIER) {
				{
				this.state = 97;
				this.match(TntParser.IDENTIFIER);
				this.state = 102;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 98;
					this.match(TntParser.T__17);
					this.state = 99;
					this.match(TntParser.IDENTIFIER);
					}
					}
					this.state = 104;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 107;
			this.match(TntParser.T__18);
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
		this.enterRule(_localctx, 8, TntParser.RULE_instanceMod);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 109;
			this.match(TntParser.T__0);
			this.state = 110;
			this.match(TntParser.IDENTIFIER);
			this.state = 111;
			this.match(TntParser.T__7);
			this.state = 112;
			this.match(TntParser.IDENTIFIER);
			this.state = 113;
			this.match(TntParser.T__16);
			this.state = 131;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.MUL:
				{
				this.state = 114;
				this.match(TntParser.MUL);
				}
				break;
			case TntParser.IDENTIFIER:
				{
				this.state = 115;
				this.match(TntParser.IDENTIFIER);
				this.state = 116;
				this.match(TntParser.T__7);
				this.state = 117;
				this.expr(0);
				this.state = 124;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 118;
						this.match(TntParser.T__17);
						this.state = 119;
						this.match(TntParser.IDENTIFIER);
						this.state = 120;
						this.match(TntParser.T__7);
						this.state = 121;
						this.expr(0);
						}
						}
					}
					this.state = 126;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
				}
				this.state = 129;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__17) {
					{
					this.state = 127;
					this.match(TntParser.T__17);
					this.state = 128;
					this.match(TntParser.MUL);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 133;
			this.match(TntParser.T__18);
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
		let _startState: number = 10;
		this.enterRecursionRule(_localctx, 10, TntParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 201;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 136;
				this.match(TntParser.T__16);
				this.state = 145;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__16) | (1 << TntParser.T__21) | (1 << TntParser.T__22) | (1 << TntParser.T__23) | (1 << TntParser.T__24))) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (TntParser.SET - 43)) | (1 << (TntParser.SEQ - 43)) | (1 << (TntParser.IDENTIFIER - 43)))) !== 0)) {
					{
					this.state = 137;
					this.type(0);
					this.state = 142;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__17) {
						{
						{
						this.state = 138;
						this.match(TntParser.T__17);
						this.state = 139;
						this.type(0);
						}
						}
						this.state = 144;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 147;
				this.match(TntParser.T__18);
				this.state = 148;
				this.match(TntParser.T__20);
				this.state = 149;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 150;
				this.match(TntParser.SET);
				this.state = 151;
				this.match(TntParser.T__16);
				this.state = 152;
				this.type(0);
				this.state = 153;
				this.match(TntParser.T__18);
				}
				break;

			case 3:
				{
				_localctx = new TypeSeqContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 155;
				this.match(TntParser.SEQ);
				this.state = 156;
				this.match(TntParser.T__16);
				this.state = 157;
				this.type(0);
				this.state = 158;
				this.match(TntParser.T__18);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 160;
				this.match(TntParser.T__16);
				this.state = 161;
				this.type(0);
				this.state = 162;
				this.match(TntParser.T__17);
				this.state = 163;
				this.type(0);
				this.state = 168;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 164;
					this.match(TntParser.T__17);
					this.state = 165;
					this.type(0);
					}
					}
					this.state = 170;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 171;
				this.match(TntParser.T__18);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 173;
				this.match(TntParser.T__1);
				this.state = 174;
				this.match(TntParser.IDENTIFIER);
				this.state = 175;
				this.match(TntParser.T__4);
				this.state = 176;
				this.type(0);
				this.state = 183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 177;
					this.match(TntParser.T__17);
					this.state = 178;
					this.match(TntParser.IDENTIFIER);
					this.state = 179;
					this.match(TntParser.T__4);
					this.state = 180;
					this.type(0);
					}
					}
					this.state = 185;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 186;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 189;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 188;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 191;
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
				this.state = 193;
				this.match(TntParser.T__21);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 194;
				this.match(TntParser.T__22);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 195;
				this.match(TntParser.T__23);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 196;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 197;
				this.match(TntParser.T__16);
				this.state = 198;
				this.type(0);
				this.state = 199;
				this.match(TntParser.T__18);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 208;
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
					this.state = 203;
					if (!(this.precpred(this._ctx, 12))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
					}
					this.state = 204;
					this.match(TntParser.T__19);
					this.state = 205;
					this.type(13);
					}
					}
				}
				this.state = 210;
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
		this.enterRule(_localctx, 12, TntParser.RULE_typeUnionRecOne);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 211;
			this.match(TntParser.T__24);
			this.state = 212;
			this.match(TntParser.T__1);
			this.state = 213;
			this.match(TntParser.IDENTIFIER);
			this.state = 214;
			this.match(TntParser.T__4);
			this.state = 215;
			this.match(TntParser.STRING);
			this.state = 222;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__17) {
				{
				{
				this.state = 216;
				this.match(TntParser.T__17);
				this.state = 217;
				this.match(TntParser.IDENTIFIER);
				this.state = 218;
				this.match(TntParser.T__4);
				this.state = 219;
				this.type(0);
				}
				}
				this.state = 224;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 225;
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
		let _startState: number = 14;
		this.enterRecursionRule(_localctx, 14, TntParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 377;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 32, this._ctx) ) {
			case 1:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 228;
				this.normalCallName();
				this.state = 229;
				this.match(TntParser.T__16);
				this.state = 231;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 18, this._ctx) ) {
				case 1:
					{
					this.state = 230;
					this.argList();
					}
					break;
				}
				this.state = 233;
				this.match(TntParser.T__18);
				}
				break;

			case 2:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 235;
				this.match(TntParser.MINUS);
				this.state = 236;
				this.expr(24);
				}
				break;

			case 3:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 237;
				this.match(TntParser.T__28);
				this.state = 238;
				this.match(TntParser.T__16);
				this.state = 239;
				this.expr(0);
				this.state = 240;
				this.match(TntParser.T__18);
				this.state = 241;
				this.expr(0);
				this.state = 242;
				this.match(TntParser.T__29);
				this.state = 243;
				this.expr(20);
				}
				break;

			case 4:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 245;
				this.match(TntParser.T__16);
				this.state = 247;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
				case 1:
					{
					this.state = 246;
					this.match(TntParser.T__30);
					}
					break;
				}
				this.state = 249;
				this.expr(0);
				this.state = 250;
				this.match(TntParser.T__30);
				this.state = 251;
				this.expr(0);
				this.state = 256;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__30) {
					{
					{
					this.state = 252;
					this.match(TntParser.T__30);
					this.state = 253;
					this.expr(0);
					}
					}
					this.state = 258;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 259;
				this.match(TntParser.T__18);
				}
				break;

			case 5:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 261;
				this.match(TntParser.T__16);
				this.state = 263;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 21, this._ctx) ) {
				case 1:
					{
					this.state = 262;
					this.match(TntParser.T__24);
					}
					break;
				}
				this.state = 265;
				this.expr(0);
				this.state = 266;
				this.match(TntParser.T__24);
				this.state = 267;
				this.expr(0);
				this.state = 272;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__24) {
					{
					{
					this.state = 268;
					this.match(TntParser.T__24);
					this.state = 269;
					this.expr(0);
					}
					}
					this.state = 274;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 275;
				this.match(TntParser.T__18);
				}
				break;

			case 6:
				{
				_localctx = new AndActionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 277;
				this.match(TntParser.T__1);
				this.state = 279;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
				case 1:
					{
					this.state = 278;
					this.match(TntParser.T__30);
					}
					break;
				}
				this.state = 281;
				this.expr(0);
				this.state = 282;
				this.match(TntParser.T__30);
				this.state = 283;
				this.expr(0);
				this.state = 288;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__30) {
					{
					{
					this.state = 284;
					this.match(TntParser.T__30);
					this.state = 285;
					this.expr(0);
					}
					}
					this.state = 290;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 291;
				this.match(TntParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new OrActionContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 293;
				this.match(TntParser.T__1);
				this.state = 295;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 25, this._ctx) ) {
				case 1:
					{
					this.state = 294;
					this.match(TntParser.T__24);
					}
					break;
				}
				this.state = 297;
				this.expr(0);
				this.state = 298;
				this.match(TntParser.T__24);
				this.state = 299;
				this.expr(0);
				this.state = 304;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__24) {
					{
					{
					this.state = 300;
					this.match(TntParser.T__24);
					this.state = 301;
					this.expr(0);
					}
					}
					this.state = 306;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 307;
				this.match(TntParser.T__2);
				}
				break;

			case 8:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 309;
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
				this.state = 310;
				this.match(TntParser.T__16);
				this.state = 311;
				this.expr(0);
				this.state = 312;
				this.match(TntParser.T__17);
				this.state = 313;
				this.expr(0);
				this.state = 318;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 314;
					this.match(TntParser.T__17);
					this.state = 315;
					this.expr(0);
					}
					}
					this.state = 320;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 321;
				this.match(TntParser.T__18);
				}
				break;

			case 10:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 323;
				this.match(TntParser.T__1);
				this.state = 324;
				this.match(TntParser.IDENTIFIER);
				this.state = 325;
				this.match(TntParser.T__4);
				this.state = 326;
				this.expr(0);
				this.state = 333;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 327;
					this.match(TntParser.T__17);
					this.state = 328;
					this.match(TntParser.IDENTIFIER);
					this.state = 329;
					this.match(TntParser.T__4);
					this.state = 330;
					this.expr(0);
					}
					}
					this.state = 335;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 336;
				this.match(TntParser.T__2);
				}
				break;

			case 11:
				{
				_localctx = new SequenceContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				{
				this.state = 338;
				this.match(TntParser.T__25);
				this.state = 347;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
				case 1:
					{
					this.state = 339;
					this.expr(0);
					this.state = 344;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__17) {
						{
						{
						this.state = 340;
						this.match(TntParser.T__17);
						this.state = 341;
						this.expr(0);
						}
						}
						this.state = 346;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
					break;
				}
				this.state = 349;
				this.match(TntParser.T__26);
				}
				}
				break;

			case 12:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 350;
				this.operDef();
				this.state = 351;
				this.expr(5);
				}
				break;

			case 13:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 353;
				this.match(TntParser.T__16);
				this.state = 354;
				this.expr(0);
				this.state = 355;
				this.match(TntParser.T__18);
				}
				break;

			case 14:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 357;
				this.match(TntParser.T__1);
				this.state = 358;
				this.expr(0);
				this.state = 359;
				this.match(TntParser.T__2);
				}
				break;

			case 15:
				{
				_localctx = new ErrorNoExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 374;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 31, this._ctx) ) {
				case 1:
					{
					this.state = 361;
					this.operator();
					}
					break;

				case 2:
					{
					this.state = 362;
					this.match(TntParser.T__4);
					}
					break;

				case 3:
					{
					this.state = 363;
					this.match(TntParser.T__2);
					}
					break;

				case 4:
					{
					this.state = 364;
					this.match(TntParser.T__26);
					}
					break;

				case 5:
					{
					this.state = 365;
					this.match(TntParser.T__18);
					}
					break;

				case 6:
					{
					this.state = 366;
					this.match(TntParser.T__10);
					}
					break;

				case 7:
					{
					this.state = 367;
					this.match(TntParser.T__7);
					}
					break;

				case 8:
					{
					this.state = 368;
					this.match(TntParser.T__30);
					}
					break;

				case 9:
					{
					this.state = 369;
					this.match(TntParser.T__24);
					}
					break;

				case 10:
					{
					this.state = 370;
					this.match(TntParser.SET);
					}
					break;

				case 11:
					{
					this.state = 371;
					this.match(TntParser.SEQ);
					}
					break;

				case 12:
					{
					this.state = 372;
					this.match(TntParser.T__17);
					}
					break;

				case 13:
					{
					this.state = 373;
					this.match(TntParser.T__19);
					}
					break;
				}

				            this.notifyErrorListeners("TNT003: expected an expression");
				          
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 427;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 425;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 35, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 379;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 380;
						(_localctx as PowContext)._op = this.match(TntParser.T__27);
						this.state = 381;
						this.expr(23);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 382;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 383;
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
						this.state = 384;
						this.expr(23);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 385;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 386;
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
						this.state = 387;
						this.expr(22);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 388;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 389;
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
						this.state = 390;
						this.expr(19);
						}
						break;

					case 5:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 391;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 392;
						this.match(TntParser.AND);
						this.state = 393;
						this.expr(18);
						}
						break;

					case 6:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 394;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 395;
						this.match(TntParser.OR);
						this.state = 396;
						this.expr(17);
						}
						break;

					case 7:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 397;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 398;
						this.match(TntParser.IFF);
						this.state = 399;
						this.expr(16);
						}
						break;

					case 8:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 400;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 401;
						this.match(TntParser.IMPLIES);
						this.state = 402;
						this.expr(15);
						}
						break;

					case 9:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 403;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 404;
						this.match(TntParser.T__10);
						this.state = 405;
						this.nameAfterDot();
						this.state = 406;
						this.match(TntParser.T__16);
						this.state = 408;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 33, this._ctx) ) {
						case 1:
							{
							this.state = 407;
							this.argList();
							}
							break;
						}
						this.state = 410;
						this.match(TntParser.T__18);
						}
						break;

					case 10:
						{
						_localctx = new FunAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 412;
						if (!(this.precpred(this._ctx, 25))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 25)");
						}
						this.state = 413;
						this.match(TntParser.T__25);
						this.state = 414;
						this.expr(0);
						this.state = 415;
						this.match(TntParser.T__26);
						}
						break;

					case 11:
						{
						_localctx = new InfixCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 417;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 418;
						this.match(TntParser.IDENTIFIER);
						this.state = 420;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
						case 1:
							{
							this.state = 419;
							this.argList();
							}
							break;
						}
						}
						break;

					case 12:
						{
						_localctx = new ErrorSymbolContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 422;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 423;
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__2) | (1 << TntParser.T__4) | (1 << TntParser.T__18) | (1 << TntParser.T__19) | (1 << TntParser.T__24) | (1 << TntParser.T__26) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || _la === TntParser.SET || _la === TntParser.SEQ)) {
						this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}

						                      this.notifyErrorListeners("TNT004: unexpected symbol after expression");
						                    
						}
						break;
					}
					}
				}
				this.state = 429;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
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
		this.enterRule(_localctx, 16, TntParser.RULE_lambda);
		let _la: number;
		try {
			this.state = 467;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__31:
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 430;
				this.identOrHole();
				this.state = 435;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 431;
					this.match(TntParser.T__17);
					this.state = 432;
					this.identOrHole();
					}
					}
					this.state = 437;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 438;
				this.match(TntParser.T__19);
				this.state = 439;
				this.expr(0);
				}
				break;
			case TntParser.T__16:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 441;
				this.match(TntParser.T__16);
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
				this.state = 452;
				this.match(TntParser.T__18);
				}
				break;
			case TntParser.T__1:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 454;
				this.match(TntParser.T__1);
				this.state = 455;
				this.identOrHole();
				this.state = 460;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 456;
					this.match(TntParser.T__17);
					this.state = 457;
					this.identOrHole();
					}
					}
					this.state = 462;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 463;
				this.match(TntParser.T__19);
				this.state = 464;
				this.expr(0);
				this.state = 465;
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
		this.enterRule(_localctx, 18, TntParser.RULE_identOrHole);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 469;
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
		this.enterRule(_localctx, 20, TntParser.RULE_identOrStar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 471;
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
		this.enterRule(_localctx, 22, TntParser.RULE_path);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 473;
			this.match(TntParser.IDENTIFIER);
			this.state = 478;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 474;
					this.match(TntParser.T__10);
					this.state = 475;
					this.match(TntParser.IDENTIFIER);
					}
					}
				}
				this.state = 480;
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
	public lambdaOrExpr(): LambdaOrExprContext {
		let _localctx: LambdaOrExprContext = new LambdaOrExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, TntParser.RULE_lambdaOrExpr);
		try {
			this.state = 483;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 481;
				this.lambda();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 482;
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
		this.enterRule(_localctx, 26, TntParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 485;
			this.lambdaOrExpr();
			this.state = 490;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 486;
					this.match(TntParser.T__17);
					this.state = 487;
					this.lambdaOrExpr();
					}
					}
				}
				this.state = 492;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
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
		this.enterRule(_localctx, 28, TntParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 495;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 493;
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
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 494;
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
		this.enterRule(_localctx, 30, TntParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 499;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 497;
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
				this.state = 498;
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
		this.enterRule(_localctx, 32, TntParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 501;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__16) | (1 << TntParser.T__24) | (1 << TntParser.T__25) | (1 << TntParser.T__27) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.AND - 36)) | (1 << (TntParser.OR - 36)) | (1 << (TntParser.IFF - 36)) | (1 << (TntParser.IMPLIES - 36)) | (1 << (TntParser.SUBSETEQ - 36)) | (1 << (TntParser.IN - 36)) | (1 << (TntParser.NOTIN - 36)) | (1 << (TntParser.PLUS - 36)) | (1 << (TntParser.MINUS - 36)) | (1 << (TntParser.MUL - 36)) | (1 << (TntParser.DIV - 36)) | (1 << (TntParser.MOD - 36)) | (1 << (TntParser.GT - 36)) | (1 << (TntParser.LT - 36)) | (1 << (TntParser.GE - 36)) | (1 << (TntParser.LE - 36)) | (1 << (TntParser.NE - 36)) | (1 << (TntParser.EQ - 36)) | (1 << (TntParser.ASGN - 36)))) !== 0))) {
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
			this.state = 503;
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
		case 5:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 7:
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
			return this.precpred(this._ctx, 23);

		case 2:
			return this.precpred(this._ctx, 22);

		case 3:
			return this.precpred(this._ctx, 21);

		case 4:
			return this.precpred(this._ctx, 18);

		case 5:
			return this.precpred(this._ctx, 17);

		case 6:
			return this.precpred(this._ctx, 16);

		case 7:
			return this.precpred(this._ctx, 15);

		case 8:
			return this.precpred(this._ctx, 14);

		case 9:
			return this.precpred(this._ctx, 27);

		case 10:
			return this.precpred(this._ctx, 25);

		case 11:
			return this.precpred(this._ctx, 19);

		case 12:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03>\u01FC\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x03\x02\x03\x02\x03\x02\x03\x02\x07\x02+\n\x02\f\x02\x0E\x02" +
		".\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03N\n\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x05\x03U\n\x03\x03\x04\x03\x04\x03\x04\x05\x04Z\n\x04" +
		"\x03\x04\x03\x04\x05\x04^\n\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x07\x05g\n\x05\f\x05\x0E\x05j\v\x05\x05\x05l\n\x05\x03" +
		"\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06}\n\x06\f\x06\x0E" +
		"\x06\x80\v\x06\x03\x06\x03\x06\x05\x06\x84\n\x06\x05\x06\x86\n\x06\x03" +
		"\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07\x8F\n\x07" +
		"\f\x07\x0E\x07\x92\v\x07\x05\x07\x94\n\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07\xA9\n\x07" +
		"\f\x07\x0E\x07\xAC\v\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x07\x07\xB8\n\x07\f\x07\x0E\x07\xBB\v" +
		"\x07\x03\x07\x03\x07\x03\x07\x06\x07\xC0\n\x07\r\x07\x0E\x07\xC1\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07\xCC\n" +
		"\x07\x03\x07\x03\x07\x03\x07\x07\x07\xD1\n\x07\f\x07\x0E\x07\xD4\v\x07" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xDF\n\b\f" +
		"\b\x0E\b\xE2\v\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x05\t\xEA\n\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x05\t\xFA\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\u0101\n\t\f" +
		"\t\x0E\t\u0104\v\t\x03\t\x03\t\x03\t\x03\t\x05\t\u010A\n\t\x03\t\x03\t" +
		"\x03\t\x03\t\x03\t\x07\t\u0111\n\t\f\t\x0E\t\u0114\v\t\x03\t\x03\t\x03" +
		"\t\x03\t\x05\t\u011A\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\u0121\n\t" +
		"\f\t\x0E\t\u0124\v\t\x03\t\x03\t\x03\t\x03\t\x05\t\u012A\n\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x07\t\u0131\n\t\f\t\x0E\t\u0134\v\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\u013F\n\t\f\t\x0E\t\u0142" +
		"\v\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t" +
		"\u014E\n\t\f\t\x0E\t\u0151\v\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07" +
		"\t\u0159\n\t\f\t\x0E\t\u015C\v\t\x05\t\u015E\n\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x05\t\u0179\n" +
		"\t\x03\t\x05\t\u017C\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x05\t\u019B\n" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x05\t\u01A7" +
		"\n\t\x03\t\x03\t\x03\t\x07\t\u01AC\n\t\f\t\x0E\t\u01AF\v\t\x03\n\x03\n" +
		"\x03\n\x07\n\u01B4\n\n\f\n\x0E\n\u01B7\v\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x07\n\u01C0\n\n\f\n\x0E\n\u01C3\v\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x07\n\u01CD\n\n\f\n\x0E\n\u01D0\v\n\x03\n\x03" +
		"\n\x03\n\x03\n\x05\n\u01D6\n\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03" +
		"\r\x07\r\u01DF\n\r\f\r\x0E\r\u01E2\v\r\x03\x0E\x03\x0E\x05\x0E\u01E6\n" +
		"\x0E\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u01EB\n\x0F\f\x0F\x0E\x0F\u01EE\v" +
		"\x0F\x03\x10\x03\x10\x05\x10\u01F2\n\x10\x03\x11\x03\x11\x05\x11\u01F6" +
		"\n\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x02\x02\x04\f\x10\x14\x02" +
		"\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02" +
		"\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02\x02\x10\x04\x02" +
		"\x06\x06\b\b\x07\x02\x03\x03\x06\x06\b\t\v\v\x0E\x12\x03\x02\x0E\x12\x04" +
		"\x02#%;;\x03\x0213\x03\x02/0\x04\x02*,4:\n\x02\x05\x05\x07\x07\x15\x16" +
		"\x1B\x1B\x1D\x1D\x1F\x1F!!-.\x04\x02\"\";;\x04\x0211;;\x03\x02&.\x03\x02" +
		"&,\t\x02\x04\x04\x13\x13\x1B\x1C\x1E\x1F!!&,/:\x03\x02#%\x02\u024C\x02" +
		"&\x03\x02\x02\x02\x04T\x03\x02\x02\x02\x06V\x03\x02\x02\x02\bb\x03\x02" +
		"\x02\x02\no\x03\x02\x02\x02\f\xCB\x03\x02\x02\x02\x0E\xD5\x03\x02\x02" +
		"\x02\x10\u017B\x03\x02\x02\x02\x12\u01D5\x03\x02\x02\x02\x14\u01D7\x03" +
		"\x02\x02\x02\x16\u01D9\x03\x02\x02\x02\x18\u01DB\x03\x02\x02\x02\x1A\u01E5" +
		"\x03\x02\x02\x02\x1C\u01E7\x03\x02\x02\x02\x1E\u01F1\x03\x02\x02\x02 " +
		"\u01F5\x03\x02\x02\x02\"\u01F7\x03\x02\x02\x02$\u01F9\x03\x02\x02\x02" +
		"&\'\x07\x03\x02\x02\'(\x07;\x02\x02(,\x07\x04\x02\x02)+\x05\x04\x03\x02" +
		"*)\x03\x02\x02\x02+.\x03\x02\x02\x02,*\x03\x02\x02\x02,-\x03\x02\x02\x02" +
		"-/\x03\x02\x02\x02.,\x03\x02\x02\x02/0\x07\x05\x02\x020\x03\x03\x02\x02" +
		"\x0212\x07\x06\x02\x0223\x07;\x02\x0234\x07\x07\x02\x024U\x05\f\x07\x02" +
		"56\x07\b\x02\x0267\x07;\x02\x0278\x07\x07\x02\x028U\x05\f\x07\x029:\x07" +
		"\t\x02\x02:;\x05\x14\v\x02;<\x07\n\x02\x02<=\x05\x10\t\x02=U\x03\x02\x02" +
		"\x02>U\x05\x06\x04\x02?U\x05\x02\x02\x02@U\x05\n\x06\x02AB\x07\v\x02\x02" +
		"BC\x07;\x02\x02CD\x07\n\x02\x02DU\x05\f\x07\x02EF\x07\f\x02\x02FG\x05" +
		"\x18\r\x02GH\x07\r\x02\x02HI\x05\x16\f\x02IU\x03\x02\x02\x02JN\x07;\x02" +
		"\x02KN\x05\"\x12\x02LN\x05$\x13\x02MJ\x03\x02\x02\x02MK\x03\x02\x02\x02" +
		"ML\x03\x02\x02\x02NO\x03\x02\x02\x02OU\b\x03\x01\x02PQ\t\x02\x02\x02Q" +
		"R\x07;\x02\x02RS\t\x03\x02\x02SU\b\x03\x01\x02T1\x03\x02\x02\x02T5\x03" +
		"\x02\x02\x02T9\x03\x02\x02\x02T>\x03\x02\x02\x02T?\x03\x02\x02\x02T@\x03" +
		"\x02\x02\x02TA\x03\x02\x02\x02TE\x03\x02\x02\x02TM\x03\x02\x02\x02TP\x03" +
		"\x02\x02\x02U\x05\x03\x02\x02\x02VW\t\x04\x02\x02WY\x07;\x02\x02XZ\x05" +
		"\b\x05\x02YX\x03\x02\x02\x02YZ\x03\x02\x02\x02Z]\x03\x02\x02\x02[\\\x07" +
		"\x07\x02\x02\\^\x05\f\x07\x02][\x03\x02\x02\x02]^\x03\x02\x02\x02^_\x03" +
		"\x02\x02\x02_`\x07\n\x02\x02`a\x05\x10\t\x02a\x07\x03\x02\x02\x02bk\x07" +
		"\x13\x02\x02ch\x07;\x02\x02de\x07\x14\x02\x02eg\x07;\x02\x02fd\x03\x02" +
		"\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02\x02hi\x03\x02\x02\x02il\x03\x02" +
		"\x02\x02jh\x03\x02\x02\x02kc\x03\x02\x02\x02kl\x03\x02\x02\x02lm\x03\x02" +
		"\x02\x02mn\x07\x15\x02\x02n\t\x03\x02\x02\x02op\x07\x03\x02\x02pq\x07" +
		";\x02\x02qr\x07\n\x02\x02rs\x07;\x02\x02s\x85\x07\x13\x02\x02t\x86\x07" +
		"1\x02\x02uv\x07;\x02\x02vw\x07\n\x02\x02w~\x05\x10\t\x02xy\x07\x14\x02" +
		"\x02yz\x07;\x02\x02z{\x07\n\x02\x02{}\x05\x10\t\x02|x\x03\x02\x02\x02" +
		"}\x80\x03\x02\x02\x02~|\x03\x02\x02\x02~\x7F\x03\x02\x02\x02\x7F\x83\x03" +
		"\x02\x02\x02\x80~\x03\x02\x02\x02\x81\x82\x07\x14\x02\x02\x82\x84\x07" +
		"1\x02\x02\x83\x81\x03\x02\x02\x02\x83\x84\x03\x02\x02\x02\x84\x86\x03" +
		"\x02\x02\x02\x85t\x03\x02\x02\x02\x85u\x03\x02\x02\x02\x86\x87\x03\x02" +
		"\x02\x02\x87\x88\x07\x15\x02\x02\x88\v\x03\x02\x02\x02\x89\x8A\b\x07\x01" +
		"\x02\x8A\x93\x07\x13\x02\x02\x8B\x90\x05\f\x07\x02\x8C\x8D\x07\x14\x02" +
		"\x02\x8D\x8F\x05\f\x07\x02\x8E\x8C\x03\x02\x02\x02\x8F\x92\x03\x02\x02" +
		"\x02\x90\x8E\x03\x02\x02\x02\x90\x91\x03\x02\x02\x02\x91\x94\x03\x02\x02" +
		"\x02\x92\x90\x03\x02\x02\x02\x93\x8B\x03\x02\x02\x02\x93\x94\x03\x02\x02" +
		"\x02\x94\x95\x03\x02\x02\x02\x95\x96\x07\x15\x02\x02\x96\x97\x07\x17\x02" +
		"\x02\x97\xCC\x05\f\x07\r\x98\x99\x07-\x02\x02\x99\x9A\x07\x13\x02\x02" +
		"\x9A\x9B\x05\f\x07\x02\x9B\x9C\x07\x15\x02\x02\x9C\xCC\x03\x02\x02\x02" +
		"\x9D\x9E\x07.\x02\x02\x9E\x9F\x07\x13\x02\x02\x9F\xA0\x05\f\x07\x02\xA0" +
		"\xA1\x07\x15\x02\x02\xA1\xCC\x03\x02\x02\x02\xA2\xA3\x07\x13\x02\x02\xA3" +
		"\xA4\x05\f\x07\x02\xA4\xA5\x07\x14\x02\x02\xA5\xAA\x05\f\x07\x02\xA6\xA7" +
		"\x07\x14\x02\x02\xA7\xA9\x05\f\x07\x02\xA8\xA6\x03\x02\x02\x02\xA9\xAC" +
		"\x03\x02\x02\x02\xAA\xA8\x03\x02\x02\x02\xAA\xAB\x03\x02\x02\x02\xAB\xAD" +
		"\x03\x02\x02\x02\xAC\xAA\x03\x02\x02\x02\xAD\xAE\x07\x15\x02\x02\xAE\xCC" +
		"\x03\x02\x02\x02\xAF\xB0\x07\x04\x02\x02\xB0\xB1\x07;\x02\x02\xB1\xB2" +
		"\x07\x07\x02\x02\xB2\xB9\x05\f\x07\x02\xB3\xB4\x07\x14\x02\x02\xB4\xB5" +
		"\x07;\x02\x02\xB5\xB6\x07\x07\x02\x02\xB6\xB8\x05\f\x07\x02\xB7\xB3\x03" +
		"\x02\x02\x02\xB8\xBB\x03\x02\x02\x02\xB9\xB7\x03\x02\x02\x02\xB9\xBA\x03" +
		"\x02\x02\x02\xBA\xBC\x03\x02\x02\x02\xBB\xB9\x03\x02\x02\x02\xBC\xBD\x07" +
		"\x05\x02\x02\xBD\xCC\x03\x02\x02\x02\xBE\xC0\x05\x0E\b\x02\xBF\xBE\x03" +
		"\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\xBF\x03\x02\x02\x02\xC1\xC2\x03" +
		"\x02\x02\x02\xC2\xCC\x03\x02\x02\x02\xC3\xCC\x07\x18\x02\x02\xC4\xCC\x07" +
		"\x19\x02\x02\xC5\xCC\x07\x1A\x02\x02\xC6\xCC\x07;\x02\x02\xC7\xC8\x07" +
		"\x13\x02\x02\xC8\xC9\x05\f\x07\x02\xC9\xCA\x07\x15\x02\x02\xCA\xCC\x03" +
		"\x02\x02\x02\xCB\x89\x03\x02\x02\x02\xCB\x98\x03\x02\x02\x02\xCB\x9D\x03" +
		"\x02\x02\x02\xCB\xA2\x03\x02\x02\x02\xCB\xAF\x03\x02\x02\x02\xCB\xBF\x03" +
		"\x02\x02\x02\xCB\xC3\x03\x02\x02\x02\xCB\xC4\x03\x02\x02\x02\xCB\xC5\x03" +
		"\x02\x02\x02\xCB\xC6\x03\x02\x02\x02\xCB\xC7\x03\x02\x02\x02\xCC\xD2\x03" +
		"\x02\x02\x02\xCD\xCE\f\x0E\x02\x02\xCE\xCF\x07\x16\x02\x02\xCF\xD1\x05" +
		"\f\x07\x0F\xD0\xCD\x03\x02\x02\x02\xD1\xD4\x03\x02\x02\x02\xD2\xD0\x03" +
		"\x02\x02\x02\xD2\xD3\x03\x02\x02\x02\xD3\r\x03\x02\x02\x02\xD4\xD2\x03" +
		"\x02\x02\x02\xD5\xD6\x07\x1B\x02\x02\xD6\xD7\x07\x04\x02\x02\xD7\xD8\x07" +
		";\x02\x02\xD8\xD9\x07\x07\x02\x02\xD9\xE0\x07#\x02\x02\xDA\xDB\x07\x14" +
		"\x02\x02\xDB\xDC\x07;\x02\x02\xDC\xDD\x07\x07\x02\x02\xDD\xDF\x05\f\x07" +
		"\x02\xDE\xDA\x03\x02\x02\x02\xDF\xE2\x03\x02\x02\x02\xE0\xDE\x03\x02\x02" +
		"\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE3\x03\x02\x02\x02\xE2\xE0\x03\x02\x02" +
		"\x02\xE3\xE4\x07\x05\x02\x02\xE4\x0F\x03\x02\x02\x02\xE5\xE6\b\t\x01\x02" +
		"\xE6\xE7\x05\x1E\x10\x02\xE7\xE9\x07\x13\x02\x02\xE8\xEA\x05\x1C\x0F\x02" +
		"\xE9\xE8\x03\x02\x02\x02\xE9\xEA\x03\x02\x02\x02\xEA\xEB\x03\x02\x02\x02" +
		"\xEB\xEC\x07\x15\x02\x02\xEC\u017C\x03\x02\x02\x02\xED\xEE\x070\x02\x02" +
		"\xEE\u017C\x05\x10\t\x1A\xEF\xF0\x07\x1F\x02\x02\xF0\xF1\x07\x13\x02\x02" +
		"\xF1\xF2\x05\x10\t\x02\xF2\xF3\x07\x15\x02\x02\xF3\xF4\x05\x10\t\x02\xF4" +
		"\xF5\x07 \x02\x02\xF5\xF6\x05\x10\t\x16\xF6\u017C\x03\x02\x02\x02\xF7" +
		"\xF9\x07\x13\x02\x02\xF8\xFA\x07!\x02\x02\xF9\xF8\x03\x02\x02\x02\xF9" +
		"\xFA\x03\x02\x02\x02\xFA\xFB\x03\x02\x02\x02\xFB\xFC\x05\x10\t\x02\xFC" +
		"\xFD\x07!\x02\x02\xFD\u0102\x05\x10\t\x02\xFE\xFF\x07!\x02\x02\xFF\u0101" +
		"\x05\x10\t\x02\u0100\xFE\x03\x02\x02\x02\u0101\u0104\x03\x02\x02\x02\u0102" +
		"\u0100\x03\x02\x02\x02\u0102\u0103\x03\x02\x02\x02\u0103\u0105\x03\x02" +
		"\x02\x02\u0104\u0102\x03\x02\x02\x02\u0105\u0106\x07\x15\x02\x02\u0106" +
		"\u017C\x03\x02\x02\x02\u0107\u0109\x07\x13\x02\x02\u0108\u010A\x07\x1B" +
		"\x02\x02\u0109\u0108\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A" +
		"\u010B\x03\x02\x02\x02\u010B\u010C\x05\x10\t\x02\u010C\u010D\x07\x1B\x02" +
		"\x02\u010D\u0112\x05\x10\t\x02\u010E\u010F\x07\x1B\x02\x02\u010F\u0111" +
		"\x05\x10\t\x02\u0110\u010E\x03\x02\x02\x02\u0111\u0114\x03\x02\x02\x02" +
		"\u0112\u0110\x03\x02\x02\x02\u0112\u0113\x03\x02\x02\x02\u0113\u0115\x03" +
		"\x02\x02\x02\u0114\u0112\x03\x02\x02\x02\u0115\u0116\x07\x15\x02\x02\u0116" +
		"\u017C\x03\x02\x02\x02\u0117\u0119\x07\x04\x02\x02\u0118\u011A\x07!\x02" +
		"\x02\u0119\u0118\x03\x02\x02\x02\u0119\u011A\x03\x02\x02\x02\u011A\u011B" +
		"\x03\x02\x02\x02\u011B\u011C\x05\x10\t\x02\u011C\u011D\x07!\x02\x02\u011D" +
		"\u0122\x05\x10\t\x02\u011E\u011F\x07!\x02\x02\u011F\u0121\x05\x10\t\x02" +
		"\u0120\u011E\x03\x02\x02\x02\u0121\u0124\x03\x02\x02\x02\u0122\u0120\x03" +
		"\x02\x02\x02\u0122\u0123\x03\x02\x02\x02\u0123\u0125\x03\x02\x02\x02\u0124" +
		"\u0122\x03\x02\x02\x02\u0125\u0126\x07\x05\x02\x02\u0126\u017C\x03\x02" +
		"\x02\x02\u0127\u0129\x07\x04\x02\x02\u0128\u012A\x07\x1B\x02\x02\u0129" +
		"\u0128\x03\x02\x02\x02\u0129\u012A\x03\x02\x02\x02\u012A\u012B\x03\x02" +
		"\x02\x02\u012B\u012C\x05\x10\t\x02\u012C\u012D\x07\x1B\x02\x02\u012D\u0132" +
		"\x05\x10\t\x02\u012E\u012F\x07\x1B\x02\x02\u012F\u0131\x05\x10\t\x02\u0130" +
		"\u012E\x03\x02\x02\x02\u0131\u0134\x03\x02\x02\x02\u0132\u0130\x03\x02" +
		"\x02\x02\u0132\u0133\x03\x02\x02\x02\u0133\u0135\x03\x02\x02\x02\u0134" +
		"\u0132\x03\x02\x02\x02\u0135\u0136\x07\x05\x02\x02\u0136\u017C\x03\x02" +
		"\x02\x02\u0137\u017C\t\x05\x02\x02\u0138\u0139\x07\x13\x02\x02\u0139\u013A" +
		"\x05\x10\t\x02\u013A\u013B\x07\x14\x02\x02\u013B\u0140\x05\x10\t\x02\u013C" +
		"\u013D\x07\x14\x02\x02\u013D\u013F\x05\x10\t\x02\u013E\u013C\x03\x02\x02" +
		"\x02\u013F\u0142\x03\x02\x02\x02\u0140\u013E\x03\x02\x02\x02\u0140\u0141" +
		"\x03\x02\x02\x02\u0141\u0143\x03\x02\x02\x02\u0142\u0140\x03\x02\x02\x02" +
		"\u0143\u0144\x07\x15\x02\x02\u0144\u017C\x03\x02\x02\x02\u0145\u0146\x07" +
		"\x04\x02\x02\u0146\u0147\x07;\x02\x02\u0147\u0148\x07\x07\x02\x02\u0148" +
		"\u014F\x05\x10\t\x02\u0149\u014A\x07\x14\x02\x02\u014A\u014B\x07;\x02" +
		"\x02\u014B\u014C\x07\x07\x02\x02\u014C\u014E\x05\x10\t\x02\u014D\u0149" +
		"\x03\x02\x02\x02\u014E\u0151\x03\x02\x02\x02\u014F\u014D\x03\x02\x02\x02" +
		"\u014F\u0150\x03\x02\x02\x02\u0150\u0152\x03\x02\x02\x02\u0151\u014F\x03" +
		"\x02\x02\x02\u0152\u0153\x07\x05\x02\x02\u0153\u017C\x03\x02\x02\x02\u0154" +
		"\u015D\x07\x1C\x02\x02\u0155\u015A\x05\x10\t\x02\u0156\u0157\x07\x14\x02" +
		"\x02\u0157\u0159\x05\x10\t\x02\u0158\u0156\x03\x02\x02\x02\u0159\u015C" +
		"\x03\x02\x02\x02\u015A\u0158\x03\x02\x02\x02\u015A\u015B\x03\x02\x02\x02" +
		"\u015B\u015E\x03\x02\x02\x02\u015C\u015A\x03\x02\x02\x02\u015D\u0155\x03" +
		"\x02\x02\x02\u015D\u015E\x03\x02\x02\x02\u015E\u015F\x03\x02\x02\x02\u015F" +
		"\u017C\x07\x1D\x02\x02\u0160\u0161\x05\x06\x04\x02\u0161\u0162\x05\x10" +
		"\t\x07\u0162\u017C\x03\x02\x02\x02\u0163\u0164\x07\x13\x02\x02\u0164\u0165" +
		"\x05\x10\t\x02\u0165\u0166\x07\x15\x02\x02\u0166\u017C\x03\x02\x02\x02" +
		"\u0167\u0168\x07\x04\x02\x02\u0168\u0169\x05\x10\t\x02\u0169\u016A\x07" +
		"\x05\x02\x02\u016A\u017C\x03\x02\x02\x02\u016B\u0179\x05\"\x12\x02\u016C" +
		"\u0179\x07\x07\x02\x02\u016D\u0179\x07\x05\x02\x02\u016E\u0179\x07\x1D" +
		"\x02\x02\u016F\u0179\x07\x15\x02\x02\u0170\u0179\x07\r\x02\x02\u0171\u0179" +
		"\x07\n\x02\x02\u0172\u0179\x07!\x02\x02\u0173\u0179\x07\x1B\x02\x02\u0174" +
		"\u0179\x07-\x02\x02\u0175\u0179\x07.\x02\x02\u0176\u0179\x07\x14\x02\x02" +
		"\u0177\u0179\x07\x16\x02\x02\u0178\u016B\x03\x02\x02\x02\u0178\u016C\x03" +
		"\x02\x02\x02\u0178\u016D\x03\x02\x02\x02\u0178\u016E\x03\x02\x02\x02\u0178" +
		"\u016F\x03\x02\x02\x02\u0178\u0170\x03\x02\x02\x02\u0178\u0171\x03\x02" +
		"\x02\x02\u0178\u0172\x03\x02\x02\x02\u0178\u0173\x03\x02\x02\x02\u0178" +
		"\u0174\x03\x02\x02\x02\u0178\u0175\x03\x02\x02\x02\u0178\u0176\x03\x02" +
		"\x02\x02\u0178\u0177\x03\x02\x02\x02\u0179\u017A\x03\x02\x02\x02\u017A" +
		"\u017C\b\t\x01\x02\u017B\xE5\x03\x02\x02\x02\u017B\xED\x03\x02\x02\x02" +
		"\u017B\xEF\x03\x02\x02\x02\u017B\xF7\x03\x02\x02\x02\u017B\u0107\x03\x02" +
		"\x02\x02\u017B\u0117\x03\x02\x02\x02\u017B\u0127\x03\x02\x02\x02\u017B" +
		"\u0137\x03\x02\x02\x02\u017B\u0138\x03\x02\x02\x02\u017B\u0145\x03\x02" +
		"\x02\x02\u017B\u0154\x03\x02\x02\x02\u017B\u0160\x03\x02\x02\x02\u017B" +
		"\u0163\x03\x02\x02\x02\u017B\u0167\x03\x02\x02\x02\u017B\u0178\x03\x02" +
		"\x02\x02\u017C\u01AD\x03\x02\x02\x02\u017D\u017E\f\x19\x02\x02\u017E\u017F" +
		"\x07\x1E\x02\x02\u017F\u01AC\x05\x10\t\x19\u0180\u0181\f\x18\x02\x02\u0181" +
		"\u0182\t\x06\x02\x02\u0182\u01AC\x05\x10\t\x19\u0183\u0184\f\x17\x02\x02" +
		"\u0184\u0185\t\x07\x02\x02\u0185\u01AC\x05\x10\t\x18\u0186\u0187\f\x14" +
		"\x02\x02\u0187\u0188\t\b\x02\x02\u0188\u01AC\x05\x10\t\x15\u0189\u018A" +
		"\f\x13\x02\x02\u018A\u018B\x07&\x02\x02\u018B\u01AC\x05\x10\t\x14\u018C" +
		"\u018D\f\x12\x02\x02\u018D\u018E\x07\'\x02\x02\u018E\u01AC\x05\x10\t\x13" +
		"\u018F\u0190\f\x11\x02\x02\u0190\u0191\x07(\x02\x02\u0191\u01AC\x05\x10" +
		"\t\x12\u0192\u0193\f\x10\x02\x02\u0193\u0194\x07)\x02\x02\u0194\u01AC" +
		"\x05\x10\t\x11\u0195\u0196\f\x1D\x02\x02\u0196\u0197\x07\r\x02\x02\u0197" +
		"\u0198\x05 \x11\x02\u0198\u019A\x07\x13\x02\x02\u0199\u019B\x05\x1C\x0F" +
		"\x02\u019A\u0199\x03\x02\x02\x02\u019A\u019B\x03\x02\x02\x02\u019B\u019C" +
		"\x03\x02\x02\x02\u019C\u019D\x07\x15\x02\x02\u019D\u01AC\x03\x02\x02\x02" +
		"\u019E\u019F\f\x1B\x02\x02\u019F\u01A0\x07\x1C\x02\x02\u01A0\u01A1\x05" +
		"\x10\t\x02\u01A1\u01A2\x07\x1D\x02\x02\u01A2\u01AC\x03\x02\x02\x02\u01A3" +
		"\u01A4\f\x15\x02\x02\u01A4\u01A6\x07;\x02\x02\u01A5\u01A7\x05\x1C\x0F" +
		"\x02\u01A6\u01A5\x03\x02\x02\x02\u01A6\u01A7\x03\x02\x02\x02\u01A7\u01AC" +
		"\x03\x02\x02\x02\u01A8\u01A9\f\x03\x02\x02\u01A9\u01AA\t\t\x02\x02\u01AA" +
		"\u01AC\b\t\x01\x02\u01AB\u017D\x03\x02\x02\x02\u01AB\u0180\x03\x02\x02" +
		"\x02\u01AB\u0183\x03\x02\x02\x02\u01AB\u0186\x03\x02\x02\x02\u01AB\u0189" +
		"\x03\x02\x02\x02\u01AB\u018C\x03\x02\x02\x02\u01AB\u018F\x03\x02\x02\x02" +
		"\u01AB\u0192\x03\x02\x02\x02\u01AB\u0195\x03\x02\x02\x02\u01AB\u019E\x03" +
		"\x02\x02\x02\u01AB\u01A3\x03\x02\x02\x02\u01AB\u01A8\x03\x02\x02\x02\u01AC" +
		"\u01AF\x03\x02\x02\x02\u01AD\u01AB\x03\x02\x02\x02\u01AD\u01AE\x03\x02" +
		"\x02\x02\u01AE\x11\x03\x02\x02\x02\u01AF\u01AD\x03\x02\x02\x02\u01B0\u01B5" +
		"\x05\x14\v\x02\u01B1\u01B2\x07\x14\x02\x02\u01B2\u01B4\x05\x14\v\x02\u01B3" +
		"\u01B1\x03\x02\x02\x02\u01B4\u01B7\x03\x02\x02\x02\u01B5\u01B3\x03\x02" +
		"\x02\x02\u01B5\u01B6\x03\x02\x02\x02\u01B6\u01B8\x03\x02\x02\x02\u01B7" +
		"\u01B5\x03\x02\x02\x02\u01B8\u01B9\x07\x16\x02\x02\u01B9\u01BA\x05\x10" +
		"\t\x02\u01BA\u01D6\x03\x02\x02\x02\u01BB\u01BC\x07\x13\x02\x02\u01BC\u01C1" +
		"\x05\x14\v\x02\u01BD\u01BE\x07\x14\x02\x02\u01BE\u01C0\x05\x14\v\x02\u01BF" +
		"\u01BD\x03\x02\x02\x02\u01C0\u01C3\x03\x02\x02\x02\u01C1\u01BF\x03\x02" +
		"\x02\x02\u01C1\u01C2\x03\x02\x02\x02\u01C2\u01C4\x03\x02\x02\x02\u01C3" +
		"\u01C1\x03\x02\x02\x02\u01C4\u01C5\x07\x16\x02\x02\u01C5\u01C6\x05\x10" +
		"\t\x02\u01C6\u01C7\x07\x15\x02\x02\u01C7\u01D6\x03\x02\x02\x02\u01C8\u01C9" +
		"\x07\x04\x02\x02\u01C9\u01CE\x05\x14\v\x02\u01CA\u01CB\x07\x14\x02\x02" +
		"\u01CB\u01CD\x05\x14\v\x02\u01CC\u01CA\x03\x02\x02\x02\u01CD\u01D0\x03" +
		"\x02\x02\x02\u01CE\u01CC\x03\x02\x02\x02\u01CE\u01CF\x03\x02\x02\x02\u01CF" +
		"\u01D1\x03\x02\x02\x02\u01D0\u01CE\x03\x02\x02\x02\u01D1\u01D2\x07\x16" +
		"\x02\x02\u01D2\u01D3\x05\x10\t\x02\u01D3\u01D4\x07\x05\x02\x02\u01D4\u01D6" +
		"\x03\x02\x02\x02\u01D5\u01B0\x03\x02\x02\x02\u01D5\u01BB\x03\x02\x02\x02" +
		"\u01D5\u01C8\x03\x02\x02\x02\u01D6\x13\x03\x02\x02\x02\u01D7\u01D8\t\n" +
		"\x02\x02\u01D8\x15\x03\x02\x02\x02\u01D9\u01DA\t\v\x02\x02\u01DA\x17\x03" +
		"\x02\x02\x02\u01DB\u01E0\x07;\x02\x02\u01DC\u01DD\x07\r\x02\x02\u01DD" +
		"\u01DF\x07;\x02\x02\u01DE\u01DC\x03\x02\x02\x02\u01DF\u01E2\x03\x02\x02" +
		"\x02\u01E0\u01DE\x03\x02\x02\x02\u01E0\u01E1\x03\x02\x02\x02\u01E1\x19" +
		"\x03\x02\x02\x02\u01E2\u01E0\x03\x02\x02\x02\u01E3\u01E6\x05\x12\n\x02" +
		"\u01E4\u01E6\x05\x10\t\x02\u01E5\u01E3\x03\x02\x02\x02\u01E5\u01E4\x03" +
		"\x02\x02\x02\u01E6\x1B\x03\x02\x02\x02\u01E7\u01EC\x05\x1A\x0E\x02\u01E8" +
		"\u01E9\x07\x14\x02\x02\u01E9\u01EB\x05\x1A\x0E\x02\u01EA\u01E8\x03\x02" +
		"\x02\x02\u01EB\u01EE\x03\x02\x02\x02\u01EC\u01EA\x03\x02\x02\x02\u01EC" +
		"\u01ED\x03\x02\x02\x02\u01ED\x1D\x03\x02\x02\x02\u01EE\u01EC\x03\x02\x02" +
		"\x02\u01EF\u01F2\x07;\x02\x02\u01F0\u01F2\t\f\x02\x02\u01F1\u01EF\x03" +
		"\x02\x02\x02\u01F1\u01F0\x03\x02\x02\x02\u01F2\x1F\x03\x02\x02\x02\u01F3" +
		"\u01F6\x07;\x02\x02\u01F4\u01F6\t\r\x02\x02\u01F5\u01F3\x03\x02\x02\x02" +
		"\u01F5\u01F4\x03\x02\x02\x02\u01F6!\x03\x02\x02\x02\u01F7\u01F8\t\x0E" +
		"\x02\x02\u01F8#\x03\x02\x02\x02\u01F9\u01FA\t\x0F\x02\x02\u01FA%\x03\x02" +
		"\x02\x020,MTY]hk~\x83\x85\x90\x93\xAA\xB9\xC1\xCB\xD2\xE0\xE9\xF9\u0102" +
		"\u0109\u0112\u0119\u0122\u0129\u0132\u0140\u014F\u015A\u015D\u0178\u017B" +
		"\u019A\u01A6\u01AB\u01AD\u01B5\u01C1\u01CE\u01D5\u01E0\u01E5\u01EC\u01F1" +
		"\u01F5";
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
export class ErrorNoTypeContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterErrorNoType) {
			listener.enterErrorNoType(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitErrorNoType) {
			listener.exitErrorNoType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitErrorNoType) {
			return visitor.visitErrorNoType(this);
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
export class ErrorNoExprContext extends ExprContext {
	public operator(): OperatorContext | undefined {
		return this.tryGetRuleContext(0, OperatorContext);
	}
	public SET(): TerminalNode | undefined { return this.tryGetToken(TntParser.SET, 0); }
	public SEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SEQ, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterErrorNoExpr) {
			listener.enterErrorNoExpr(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitErrorNoExpr) {
			listener.exitErrorNoExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitErrorNoExpr) {
			return visitor.visitErrorNoExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ErrorSymbolContext extends ExprContext {
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public SET(): TerminalNode | undefined { return this.tryGetToken(TntParser.SET, 0); }
	public SEQ(): TerminalNode | undefined { return this.tryGetToken(TntParser.SEQ, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterErrorSymbol) {
			listener.enterErrorSymbol(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitErrorSymbol) {
			listener.exitErrorSymbol(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitErrorSymbol) {
			return visitor.visitErrorSymbol(this);
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


