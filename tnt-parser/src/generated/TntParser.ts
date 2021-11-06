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
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly STRING = 36;
	public static readonly BOOL = 37;
	public static readonly INT = 38;
	public static readonly AND = 39;
	public static readonly OR = 40;
	public static readonly IFF = 41;
	public static readonly IMPLIES = 42;
	public static readonly SUBSETEQ = 43;
	public static readonly IN = 44;
	public static readonly NOTIN = 45;
	public static readonly SET = 46;
	public static readonly ADD = 47;
	public static readonly SUB = 48;
	public static readonly MUL = 49;
	public static readonly DIV = 50;
	public static readonly MOD = 51;
	public static readonly GT = 52;
	public static readonly LT = 53;
	public static readonly GE = 54;
	public static readonly LE = 55;
	public static readonly NE = 56;
	public static readonly EQEQ = 57;
	public static readonly EQ = 58;
	public static readonly ASGN = 59;
	public static readonly REC = 60;
	public static readonly IDENTIFIER = 61;
	public static readonly LINE_COMMENT = 62;
	public static readonly COMMENT = 63;
	public static readonly WS = 64;
	public static readonly RULE_module = 0;
	public static readonly RULE_unit = 1;
	public static readonly RULE_valDef = 2;
	public static readonly RULE_operDef = 3;
	public static readonly RULE_instanceDef = 4;
	public static readonly RULE_params = 5;
	public static readonly RULE_type = 6;
	public static readonly RULE_typeUnionRecOne = 7;
	public static readonly RULE_expr = 8;
	public static readonly RULE_lambda = 9;
	public static readonly RULE_identOrHole = 10;
	public static readonly RULE_argList = 11;
	public static readonly RULE_normalCallName = 12;
	public static readonly RULE_nameAfterDot = 13;
	public static readonly RULE_operator = 14;
	public static readonly RULE_literal = 15;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"module", "unit", "valDef", "operDef", "instanceDef", "params", "type", 
		"typeUnionRecOne", "expr", "lambda", "identOrHole", "argList", "normalCallName", 
		"nameAfterDot", "operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'_'", "'pred'", "'action'", "'temporal'", "'type'", "'val'", "'def'", 
		"'instance'", "'with'", "'<-'", "','", "'('", "')'", "'->'", "'=>'", "'seq'", 
		"'int'", "'str'", "'bool'", "'|'", "'.'", "'['", "']'", "'^'", "'if'", 
		"'else'", "'&'", "'case'", undefined, undefined, undefined, "'and'", "'or'", 
		"'iff'", "'implies'", "'subseteq'", "'in'", "'notin'", "'set'", "'+'", 
		"'-'", "'*'", "'/'", "'%'", "'>'", "'<'", "'>='", "'<='", "'!='", "'=='", 
		"'='", "':='", "'rec'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, "STRING", "BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", "SUBSETEQ", 
		"IN", "NOTIN", "SET", "ADD", "SUB", "MUL", "DIV", "MOD", "GT", "LT", "GE", 
		"LE", "NE", "EQEQ", "EQ", "ASGN", "REC", "IDENTIFIER", "LINE_COMMENT", 
		"COMMENT", "WS",
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
			this.state = 32;
			this.match(TntParser.T__0);
			this.state = 33;
			this.match(TntParser.IDENTIFIER);
			this.state = 34;
			this.match(TntParser.T__1);
			this.state = 38;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__0) | (1 << TntParser.T__1) | (1 << TntParser.T__3) | (1 << TntParser.T__5) | (1 << TntParser.T__6) | (1 << TntParser.T__8) | (1 << TntParser.T__9) | (1 << TntParser.T__10) | (1 << TntParser.T__11) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__14) | (1 << TntParser.T__18) | (1 << TntParser.T__26) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.T__33 - 32)) | (1 << (TntParser.T__34 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.ADD - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.MUL - 32)) | (1 << (TntParser.DIV - 32)) | (1 << (TntParser.MOD - 32)) | (1 << (TntParser.GT - 32)) | (1 << (TntParser.LT - 32)) | (1 << (TntParser.GE - 32)) | (1 << (TntParser.LE - 32)) | (1 << (TntParser.NE - 32)) | (1 << (TntParser.EQEQ - 32)) | (1 << (TntParser.EQ - 32)) | (1 << (TntParser.ASGN - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
				{
				{
				this.state = 35;
				this.unit();
				}
				}
				this.state = 40;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 41;
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
			this.state = 80;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__3:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 43;
				this.match(TntParser.T__3);
				this.state = 44;
				this.match(TntParser.IDENTIFIER);
				this.state = 45;
				this.match(TntParser.T__4);
				this.state = 46;
				this.type(0);
				}
				break;
			case TntParser.T__5:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 47;
				this.match(TntParser.T__5);
				this.state = 48;
				this.match(TntParser.IDENTIFIER);
				this.state = 49;
				this.match(TntParser.T__4);
				this.state = 50;
				this.type(0);
				}
				break;
			case TntParser.T__6:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 51;
				this.match(TntParser.T__6);
				this.state = 52;
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
				this.state = 53;
				this.match(TntParser.EQ);
				this.state = 54;
				this.expr(0);
				}
				break;
			case TntParser.T__12:
				_localctx = new ValContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 55;
				this.valDef();
				}
				break;
			case TntParser.T__13:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 56;
				this.operDef();
				}
				break;
			case TntParser.T__8:
			case TntParser.T__9:
			case TntParser.T__10:
				_localctx = new PatContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 57;
				_la = this._input.LA(1);
				if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__8) | (1 << TntParser.T__9) | (1 << TntParser.T__10))) !== 0))) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				this.state = 58;
				this.match(TntParser.IDENTIFIER);
				this.state = 60;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__18) {
					{
					this.state = 59;
					this.params();
					}
				}

				this.state = 64;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__4) {
					{
					this.state = 62;
					this.match(TntParser.T__4);
					this.state = 63;
					this.type(0);
					}
				}

				this.state = 66;
				this.match(TntParser.EQ);
				this.state = 67;
				this.expr(0);
				}
				break;
			case TntParser.T__0:
				_localctx = new ModuleNestedContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 68;
				this.module();
				}
				break;
			case TntParser.T__14:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 69;
				this.instanceDef();
				}
				break;
			case TntParser.T__11:
				_localctx = new TypeDefContext(_localctx);
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 70;
				this.match(TntParser.T__11);
				this.state = 71;
				this.match(TntParser.IDENTIFIER);
				this.state = 72;
				this.match(TntParser.EQ);
				this.state = 73;
				this.type(0);
				}
				break;
			case TntParser.T__1:
			case TntParser.T__18:
			case TntParser.T__26:
			case TntParser.T__28:
			case TntParser.T__30:
			case TntParser.T__31:
			case TntParser.T__33:
			case TntParser.T__34:
			case TntParser.STRING:
			case TntParser.BOOL:
			case TntParser.INT:
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
			case TntParser.IDENTIFIER:
				_localctx = new ErrorCaseContext(_localctx);
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 77;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.IDENTIFIER:
					{
					this.state = 74;
					this.match(TntParser.IDENTIFIER);
					}
					break;
				case TntParser.T__1:
				case TntParser.T__18:
				case TntParser.T__26:
				case TntParser.T__28:
				case TntParser.T__30:
				case TntParser.T__31:
				case TntParser.T__33:
				case TntParser.T__34:
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
					this.state = 75;
					this.operator();
					}
					break;
				case TntParser.STRING:
				case TntParser.BOOL:
				case TntParser.INT:
					{
					this.state = 76;
					this.literal();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}

				         this.notifyErrorListeners("TNT001: expected a const, var, def, typedef, etc.");
				                
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
	public valDef(): ValDefContext {
		let _localctx: ValDefContext = new ValDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, TntParser.RULE_valDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 82;
			this.match(TntParser.T__12);
			this.state = 83;
			this.match(TntParser.IDENTIFIER);
			this.state = 86;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__4) {
				{
				this.state = 84;
				this.match(TntParser.T__4);
				this.state = 85;
				this.type(0);
				}
			}

			this.state = 88;
			this.match(TntParser.EQ);
			this.state = 89;
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
			this.state = 91;
			this.match(TntParser.T__13);
			this.state = 92;
			this.match(TntParser.IDENTIFIER);
			this.state = 93;
			this.params();
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__4) {
				{
				this.state = 94;
				this.match(TntParser.T__4);
				this.state = 95;
				this.type(0);
				}
			}

			this.state = 98;
			this.match(TntParser.EQ);
			this.state = 99;
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
			this.state = 101;
			this.match(TntParser.T__14);
			this.state = 102;
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
			this.state = 103;
			this.match(TntParser.EQ);
			this.state = 104;
			this.match(TntParser.IDENTIFIER);
			this.state = 118;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.T__15) {
				{
				this.state = 105;
				this.match(TntParser.T__15);
				this.state = 106;
				this.match(TntParser.IDENTIFIER);
				this.state = 107;
				this.match(TntParser.T__16);
				this.state = 108;
				this.expr(0);
				this.state = 115;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 109;
					this.match(TntParser.T__17);
					this.state = 110;
					this.match(TntParser.IDENTIFIER);
					this.state = 111;
					this.match(TntParser.T__16);
					this.state = 112;
					this.expr(0);
					}
					}
					this.state = 117;
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
			this.state = 120;
			this.match(TntParser.T__18);
			this.state = 129;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TntParser.IDENTIFIER) {
				{
				this.state = 121;
				this.match(TntParser.IDENTIFIER);
				this.state = 126;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 122;
					this.match(TntParser.T__17);
					this.state = 123;
					this.match(TntParser.IDENTIFIER);
					}
					}
					this.state = 128;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 131;
			this.match(TntParser.T__19);
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
			this.state = 199;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 134;
				this.match(TntParser.T__18);
				this.state = 143;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__18) | (1 << TntParser.T__22) | (1 << TntParser.T__23) | (1 << TntParser.T__24) | (1 << TntParser.T__25) | (1 << TntParser.T__26))) !== 0) || _la === TntParser.SET || _la === TntParser.IDENTIFIER) {
					{
					this.state = 135;
					this.type(0);
					this.state = 140;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === TntParser.T__17) {
						{
						{
						this.state = 136;
						this.match(TntParser.T__17);
						this.state = 137;
						this.type(0);
						}
						}
						this.state = 142;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 145;
				this.match(TntParser.T__19);
				this.state = 146;
				this.match(TntParser.T__21);
				this.state = 147;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 148;
				this.match(TntParser.SET);
				this.state = 149;
				this.match(TntParser.T__18);
				this.state = 150;
				this.type(0);
				this.state = 151;
				this.match(TntParser.T__19);
				}
				break;

			case 3:
				{
				_localctx = new TypeSeqContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 153;
				this.match(TntParser.T__22);
				this.state = 154;
				this.match(TntParser.T__18);
				this.state = 155;
				this.type(0);
				this.state = 156;
				this.match(TntParser.T__19);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 158;
				this.match(TntParser.T__18);
				this.state = 159;
				this.type(0);
				this.state = 160;
				this.match(TntParser.T__17);
				this.state = 161;
				this.type(0);
				this.state = 166;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 162;
					this.match(TntParser.T__17);
					this.state = 163;
					this.type(0);
					}
					}
					this.state = 168;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 169;
				this.match(TntParser.T__19);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 171;
				this.match(TntParser.T__1);
				this.state = 172;
				this.match(TntParser.IDENTIFIER);
				this.state = 173;
				this.match(TntParser.T__4);
				this.state = 174;
				this.type(0);
				this.state = 181;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 175;
					this.match(TntParser.T__17);
					this.state = 176;
					this.match(TntParser.IDENTIFIER);
					this.state = 177;
					this.match(TntParser.T__4);
					this.state = 178;
					this.type(0);
					}
					}
					this.state = 183;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 184;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 187;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 186;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 189;
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
				this.state = 191;
				this.match(TntParser.T__23);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 192;
				this.match(TntParser.T__24);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 193;
				this.match(TntParser.T__25);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 194;
				this.match(TntParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 195;
				this.match(TntParser.T__18);
				this.state = 196;
				this.type(0);
				this.state = 197;
				this.match(TntParser.T__19);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 206;
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
					this.state = 201;
					if (!(this.precpred(this._ctx, 12))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
					}
					this.state = 202;
					this.match(TntParser.T__20);
					this.state = 203;
					this.type(13);
					}
					}
				}
				this.state = 208;
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
			this.state = 209;
			this.match(TntParser.T__26);
			this.state = 210;
			this.match(TntParser.T__1);
			this.state = 211;
			this.match(TntParser.IDENTIFIER);
			this.state = 212;
			this.match(TntParser.T__4);
			this.state = 213;
			this.match(TntParser.STRING);
			this.state = 220;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TntParser.T__17) {
				{
				{
				this.state = 214;
				this.match(TntParser.T__17);
				this.state = 215;
				this.match(TntParser.IDENTIFIER);
				this.state = 216;
				this.match(TntParser.T__4);
				this.state = 217;
				this.type(0);
				}
				}
				this.state = 222;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 223;
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
			this.state = 365;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
			case 1:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 226;
				this.normalCallName();
				this.state = 227;
				this.match(TntParser.T__18);
				this.state = 229;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__18) | (1 << TntParser.T__22) | (1 << TntParser.T__28))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.SET - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
					{
					this.state = 228;
					this.argList();
					}
				}

				this.state = 231;
				this.match(TntParser.T__19);
				}
				break;

			case 2:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 233;
				this.match(TntParser.SUB);
				this.state = 234;
				this.expr(21);
				}
				break;

			case 3:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 235;
				this.match(TntParser.T__31);
				this.state = 236;
				this.match(TntParser.T__18);
				this.state = 237;
				this.expr(0);
				this.state = 238;
				this.match(TntParser.T__19);
				this.state = 239;
				this.expr(0);
				this.state = 240;
				this.match(TntParser.T__32);
				this.state = 241;
				this.expr(17);
				}
				break;

			case 4:
				{
				_localctx = new AndBlockContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 243;
				this.match(TntParser.T__1);
				this.state = 245;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__33) {
					{
					this.state = 244;
					this.match(TntParser.T__33);
					}
				}

				this.state = 247;
				this.expr(0);
				this.state = 248;
				this.match(TntParser.T__33);
				this.state = 249;
				this.expr(0);
				this.state = 254;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__33) {
					{
					{
					this.state = 250;
					this.match(TntParser.T__33);
					this.state = 251;
					this.expr(0);
					}
					}
					this.state = 256;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 257;
				this.match(TntParser.T__2);
				}
				break;

			case 5:
				{
				_localctx = new OrBlockContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 259;
				this.match(TntParser.T__1);
				this.state = 261;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === TntParser.T__26) {
					{
					this.state = 260;
					this.match(TntParser.T__26);
					}
				}

				this.state = 263;
				this.expr(0);
				this.state = 264;
				this.match(TntParser.T__26);
				this.state = 265;
				this.expr(0);
				this.state = 270;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__26) {
					{
					{
					this.state = 266;
					this.match(TntParser.T__26);
					this.state = 267;
					this.expr(0);
					}
					}
					this.state = 272;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 273;
				this.match(TntParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 275;
				_la = this._input.LA(1);
				if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.STRING - 36)) | (1 << (TntParser.BOOL - 36)) | (1 << (TntParser.INT - 36)) | (1 << (TntParser.IDENTIFIER - 36)))) !== 0))) {
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

			case 7:
				{
				_localctx = new TupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 276;
				this.match(TntParser.T__18);
				this.state = 277;
				this.expr(0);
				this.state = 278;
				this.match(TntParser.T__17);
				this.state = 279;
				this.expr(0);
				this.state = 284;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 280;
					this.match(TntParser.T__17);
					this.state = 281;
					this.expr(0);
					}
					}
					this.state = 286;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 287;
				this.match(TntParser.T__19);
				}
				break;

			case 8:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 289;
				this.match(TntParser.T__1);
				this.state = 290;
				this.match(TntParser.IDENTIFIER);
				this.state = 291;
				this.match(TntParser.T__4);
				this.state = 292;
				this.expr(0);
				this.state = 299;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 293;
					this.match(TntParser.T__17);
					this.state = 294;
					this.match(TntParser.IDENTIFIER);
					this.state = 295;
					this.match(TntParser.T__4);
					this.state = 296;
					this.expr(0);
					}
					}
					this.state = 301;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 302;
				this.match(TntParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new RecordSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 304;
				this.match(TntParser.T__28);
				this.state = 305;
				this.match(TntParser.IDENTIFIER);
				this.state = 306;
				this.match(TntParser.IN);
				this.state = 307;
				this.expr(0);
				this.state = 314;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 308;
					this.match(TntParser.T__17);
					this.state = 309;
					this.match(TntParser.IDENTIFIER);
					this.state = 310;
					this.match(TntParser.IN);
					this.state = 311;
					this.expr(0);
					}
					}
					this.state = 316;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 317;
				this.match(TntParser.T__29);
				}
				break;

			case 10:
				{
				_localctx = new SequenceContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 344;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.T__28:
					{
					this.state = 319;
					this.match(TntParser.T__28);
					this.state = 328;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__18) | (1 << TntParser.T__22) | (1 << TntParser.T__28))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.SET - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
						{
						this.state = 320;
						this.expr(0);
						this.state = 325;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__17) {
							{
							{
							this.state = 321;
							this.match(TntParser.T__17);
							this.state = 322;
							this.expr(0);
							}
							}
							this.state = 327;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 330;
					this.match(TntParser.T__29);
					}
					break;
				case TntParser.T__22:
					{
					this.state = 331;
					this.match(TntParser.T__22);
					this.state = 332;
					this.match(TntParser.T__18);
					this.state = 341;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__12) | (1 << TntParser.T__13) | (1 << TntParser.T__18) | (1 << TntParser.T__22) | (1 << TntParser.T__28))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.STRING - 32)) | (1 << (TntParser.BOOL - 32)) | (1 << (TntParser.INT - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.SET - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.IDENTIFIER - 32)))) !== 0)) {
						{
						this.state = 333;
						this.expr(0);
						this.state = 338;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === TntParser.T__17) {
							{
							{
							this.state = 334;
							this.match(TntParser.T__17);
							this.state = 335;
							this.expr(0);
							}
							}
							this.state = 340;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 343;
					this.match(TntParser.T__19);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 11:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 352;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case TntParser.T__12:
					{
					this.state = 346;
					this.valDef();
					this.state = 347;
					this.expr(0);
					}
					break;
				case TntParser.T__13:
					{
					this.state = 349;
					this.operDef();
					this.state = 350;
					this.expr(0);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 12:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 354;
				this.match(TntParser.T__18);
				this.state = 355;
				this.expr(0);
				this.state = 356;
				this.match(TntParser.T__19);
				}
				break;

			case 13:
				{
				_localctx = new LambdaOrBracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 358;
				this.match(TntParser.T__1);
				this.state = 361;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 33, this._ctx) ) {
				case 1:
					{
					this.state = 359;
					this.lambda();
					}
					break;

				case 2:
					{
					this.state = 360;
					this.expr(0);
					}
					break;
				}
				this.state = 363;
				this.match(TntParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 415;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 39, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 413;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 38, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 367;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 368;
						(_localctx as PowContext)._op = this.match(TntParser.T__30);
						this.state = 369;
						this.expr(20);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 370;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 371;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & ((1 << (TntParser.MUL - 49)) | (1 << (TntParser.DIV - 49)) | (1 << (TntParser.MOD - 49)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 372;
						this.expr(20);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 373;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 374;
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
						this.state = 375;
						this.expr(19);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 376;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 377;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (TntParser.SUBSETEQ - 43)) | (1 << (TntParser.IN - 43)) | (1 << (TntParser.NOTIN - 43)) | (1 << (TntParser.GT - 43)) | (1 << (TntParser.LT - 43)) | (1 << (TntParser.GE - 43)) | (1 << (TntParser.LE - 43)) | (1 << (TntParser.NE - 43)) | (1 << (TntParser.EQEQ - 43)) | (1 << (TntParser.EQ - 43)) | (1 << (TntParser.ASGN - 43)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 378;
						this.expr(16);
						}
						break;

					case 5:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 379;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 380;
						this.match(TntParser.AND);
						this.state = 381;
						this.expr(15);
						}
						break;

					case 6:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 382;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 383;
						this.match(TntParser.OR);
						this.state = 384;
						this.expr(14);
						}
						break;

					case 7:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 385;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 386;
						this.match(TntParser.IFF);
						this.state = 387;
						this.expr(13);
						}
						break;

					case 8:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 388;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 389;
						this.match(TntParser.IMPLIES);
						this.state = 390;
						this.expr(12);
						}
						break;

					case 9:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 391;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 392;
						this.match(TntParser.T__27);
						this.state = 393;
						this.nameAfterDot();
						this.state = 401;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 36, this._ctx) ) {
						case 1:
							{
							this.state = 394;
							this.match(TntParser.T__18);
							this.state = 397;
							this._errHandler.sync(this);
							switch ( this.interpreter.adaptivePredict(this._input, 35, this._ctx) ) {
							case 1:
								{
								this.state = 395;
								this.lambda();
								}
								break;

							case 2:
								{
								this.state = 396;
								this.argList();
								}
								break;
							}
							this.state = 399;
							this.match(TntParser.T__19);
							}
							break;
						}
						}
						break;

					case 10:
						{
						_localctx = new FunAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 403;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 404;
						this.match(TntParser.T__28);
						this.state = 405;
						this.expr(0);
						this.state = 406;
						this.match(TntParser.T__29);
						}
						break;

					case 11:
						{
						_localctx = new InfixCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, TntParser.RULE_expr);
						this.state = 408;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 409;
						this.match(TntParser.IDENTIFIER);
						this.state = 411;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 37, this._ctx) ) {
						case 1:
							{
							this.state = 410;
							this.argList();
							}
							break;
						}
						}
						break;
					}
					}
				}
				this.state = 417;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 39, this._ctx);
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
			this.state = 435;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.T__7:
			case TntParser.IDENTIFIER:
				_localctx = new LambdaOneContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 418;
				this.identOrHole();
				this.state = 419;
				this.match(TntParser.T__20);
				this.state = 420;
				this.expr(0);
				}
				break;
			case TntParser.T__18:
				_localctx = new LambdaManyContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 422;
				this.match(TntParser.T__18);
				this.state = 423;
				this.identOrHole();
				this.state = 428;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === TntParser.T__17) {
					{
					{
					this.state = 424;
					this.match(TntParser.T__17);
					this.state = 425;
					this.identOrHole();
					}
					}
					this.state = 430;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 431;
				this.match(TntParser.T__19);
				this.state = 432;
				this.match(TntParser.T__20);
				this.state = 433;
				this.expr(0);
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
			this.state = 437;
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
	public argList(): ArgListContext {
		let _localctx: ArgListContext = new ArgListContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, TntParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 439;
			this.expr(0);
			this.state = 444;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 42, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 440;
					this.match(TntParser.T__17);
					this.state = 441;
					this.expr(0);
					}
					}
				}
				this.state = 446;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 42, this._ctx);
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
		this.enterRule(_localctx, 24, TntParser.RULE_normalCallName);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 449;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				{
				this.state = 447;
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
				{
				this.state = 448;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (TntParser.AND - 39)) | (1 << (TntParser.OR - 39)) | (1 << (TntParser.IFF - 39)) | (1 << (TntParser.IMPLIES - 39)) | (1 << (TntParser.SUBSETEQ - 39)) | (1 << (TntParser.IN - 39)) | (1 << (TntParser.NOTIN - 39)) | (1 << (TntParser.SET - 39)))) !== 0))) {
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
		this.enterRule(_localctx, 26, TntParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 453;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TntParser.IDENTIFIER:
				{
				this.state = 451;
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
				this.state = 452;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (TntParser.AND - 39)) | (1 << (TntParser.OR - 39)) | (1 << (TntParser.IFF - 39)) | (1 << (TntParser.IMPLIES - 39)) | (1 << (TntParser.SUBSETEQ - 39)) | (1 << (TntParser.IN - 39)) | (1 << (TntParser.NOTIN - 39)))) !== 0))) {
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
		this.enterRule(_localctx, 28, TntParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 455;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << TntParser.T__1) | (1 << TntParser.T__18) | (1 << TntParser.T__26) | (1 << TntParser.T__28) | (1 << TntParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (TntParser.T__31 - 32)) | (1 << (TntParser.T__33 - 32)) | (1 << (TntParser.T__34 - 32)) | (1 << (TntParser.AND - 32)) | (1 << (TntParser.OR - 32)) | (1 << (TntParser.IFF - 32)) | (1 << (TntParser.IMPLIES - 32)) | (1 << (TntParser.SUBSETEQ - 32)) | (1 << (TntParser.IN - 32)) | (1 << (TntParser.NOTIN - 32)) | (1 << (TntParser.ADD - 32)) | (1 << (TntParser.SUB - 32)) | (1 << (TntParser.MUL - 32)) | (1 << (TntParser.DIV - 32)) | (1 << (TntParser.MOD - 32)) | (1 << (TntParser.GT - 32)) | (1 << (TntParser.LT - 32)) | (1 << (TntParser.GE - 32)) | (1 << (TntParser.LE - 32)) | (1 << (TntParser.NE - 32)) | (1 << (TntParser.EQEQ - 32)) | (1 << (TntParser.EQ - 32)) | (1 << (TntParser.ASGN - 32)))) !== 0))) {
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
		this.enterRule(_localctx, 30, TntParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 457;
			_la = this._input.LA(1);
			if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (TntParser.STRING - 36)) | (1 << (TntParser.BOOL - 36)) | (1 << (TntParser.INT - 36)))) !== 0))) {
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
			return this.precpred(this._ctx, 20);

		case 2:
			return this.precpred(this._ctx, 19);

		case 3:
			return this.precpred(this._ctx, 18);

		case 4:
			return this.precpred(this._ctx, 15);

		case 5:
			return this.precpred(this._ctx, 14);

		case 6:
			return this.precpred(this._ctx, 13);

		case 7:
			return this.precpred(this._ctx, 12);

		case 8:
			return this.precpred(this._ctx, 11);

		case 9:
			return this.precpred(this._ctx, 24);

		case 10:
			return this.precpred(this._ctx, 22);

		case 11:
			return this.precpred(this._ctx, 16);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03B\u01CE\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x03\x02\x03\x02\x03" +
		"\x02\x03\x02\x07\x02\'\n\x02\f\x02\x0E\x02*\v\x02\x03\x02\x03\x02\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03?" +
		"\n\x03\x03\x03\x03\x03\x05\x03C\n\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03P\n\x03" +
		"\x03\x03\x05\x03S\n\x03\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04Y\n\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05" +
		"c\n\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06t\n\x06" +
		"\f\x06\x0E\x06w\v\x06\x05\x06y\n\x06\x03\x07\x03\x07\x03\x07\x03\x07\x07" +
		"\x07\x7F\n\x07\f\x07\x0E\x07\x82\v\x07\x05\x07\x84\n\x07\x03\x07\x03\x07" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\x8D\n\b\f\b\x0E\b\x90\v\b\x05\b\x92" +
		"\n\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xA7\n\b\f\b\x0E" +
		"\b\xAA\v\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b" +
		"\x07\b\xB6\n\b\f\b\x0E\b\xB9\v\b\x03\b\x03\b\x03\b\x06\b\xBE\n\b\r\b\x0E" +
		"\b\xBF\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x05\b\xCA\n\b\x03" +
		"\b\x03\b\x03\b\x07\b\xCF\n\b\f\b\x0E\b\xD2\v\b\x03\t\x03\t\x03\t\x03\t" +
		"\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\xDD\n\t\f\t\x0E\t\xE0\v\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x03\n\x05\n\xE8\n\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\xF8\n\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x07\n\xFF\n\n\f\n\x0E\n\u0102\v\n\x03\n\x03" +
		"\n\x03\n\x03\n\x05\n\u0108\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u010F" +
		"\n\n\f\n\x0E\n\u0112\v\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x07\n\u011D\n\n\f\n\x0E\n\u0120\v\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u012C\n\n\f\n\x0E\n\u012F\v\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u013B\n" +
		"\n\f\n\x0E\n\u013E\v\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\u0146" +
		"\n\n\f\n\x0E\n\u0149\v\n\x05\n\u014B\n\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x07\n\u0153\n\n\f\n\x0E\n\u0156\v\n\x05\n\u0158\n\n\x03\n\x05\n" +
		"\u015B\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u0163\n\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u016C\n\n\x03\n\x03\n\x05\n\u0170" +
		"\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u0190\n\n\x03\n\x03" +
		"\n\x05\n\u0194\n\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05" +
		"\n\u019E\n\n\x07\n\u01A0\n\n\f\n\x0E\n\u01A3\v\n\x03\v\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x07\v\u01AD\n\v\f\v\x0E\v\u01B0\v\v\x03\v\x03" +
		"\v\x03\v\x03\v\x05\v\u01B6\n\v\x03\f\x03\f\x03\r\x03\r\x03\r\x07\r\u01BD" +
		"\n\r\f\r\x0E\r\u01C0\v\r\x03\x0E\x03\x0E\x05\x0E\u01C4\n\x0E\x03\x0F\x03" +
		"\x0F\x05\x0F\u01C8\n\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x03\x11\x02\x02" +
		"\x04\x0E\x12\x12\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10" +
		"\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\x02" +
		"\f\x04\x02\n\n??\x03\x02\v\r\x04\x02&(??\x03\x0235\x03\x0212\x04\x02-" +
		"/6=\x03\x02)0\x03\x02)/\n\x02\x04\x04\x15\x15\x1D\x1D\x1F\x1F!\"$%)/1" +
		"=\x03\x02&(\x02\u0210\x02\"\x03\x02\x02\x02\x04R\x03\x02\x02\x02\x06T" +
		"\x03\x02\x02\x02\b]\x03\x02\x02\x02\ng\x03\x02\x02\x02\fz\x03\x02\x02" +
		"\x02\x0E\xC9\x03\x02\x02\x02\x10\xD3\x03\x02\x02\x02\x12\u016F\x03\x02" +
		"\x02\x02\x14\u01B5\x03\x02\x02\x02\x16\u01B7\x03\x02\x02\x02\x18\u01B9" +
		"\x03\x02\x02\x02\x1A\u01C3\x03\x02\x02\x02\x1C\u01C7\x03\x02\x02\x02\x1E" +
		"\u01C9\x03\x02\x02\x02 \u01CB\x03\x02\x02\x02\"#\x07\x03\x02\x02#$\x07" +
		"?\x02\x02$(\x07\x04\x02\x02%\'\x05\x04\x03\x02&%\x03\x02\x02\x02\'*\x03" +
		"\x02\x02\x02(&\x03\x02\x02\x02()\x03\x02\x02\x02)+\x03\x02\x02\x02*(\x03" +
		"\x02\x02\x02+,\x07\x05\x02\x02,\x03\x03\x02\x02\x02-.\x07\x06\x02\x02" +
		"./\x07?\x02\x02/0\x07\x07\x02\x020S\x05\x0E\b\x0212\x07\b\x02\x0223\x07" +
		"?\x02\x0234\x07\x07\x02\x024S\x05\x0E\b\x0256\x07\t\x02\x0267\t\x02\x02" +
		"\x0278\x07<\x02\x028S\x05\x12\n\x029S\x05\x06\x04\x02:S\x05\b\x05\x02" +
		";<\t\x03\x02\x02<>\x07?\x02\x02=?\x05\f\x07\x02>=\x03\x02\x02\x02>?\x03" +
		"\x02\x02\x02?B\x03\x02\x02\x02@A\x07\x07\x02\x02AC\x05\x0E\b\x02B@\x03" +
		"\x02\x02\x02BC\x03\x02\x02\x02CD\x03\x02\x02\x02DE\x07<\x02\x02ES\x05" +
		"\x12\n\x02FS\x05\x02\x02\x02GS\x05\n\x06\x02HI\x07\x0E\x02\x02IJ\x07?" +
		"\x02\x02JK\x07<\x02\x02KS\x05\x0E\b\x02LP\x07?\x02\x02MP\x05\x1E\x10\x02" +
		"NP\x05 \x11\x02OL\x03\x02\x02\x02OM\x03\x02\x02\x02ON\x03\x02\x02\x02" +
		"PQ\x03\x02\x02\x02QS\b\x03\x01\x02R-\x03\x02\x02\x02R1\x03\x02\x02\x02" +
		"R5\x03\x02\x02\x02R9\x03\x02\x02\x02R:\x03\x02\x02\x02R;\x03\x02\x02\x02" +
		"RF\x03\x02\x02\x02RG\x03\x02\x02\x02RH\x03\x02\x02\x02RO\x03\x02\x02\x02" +
		"S\x05\x03\x02\x02\x02TU\x07\x0F\x02\x02UX\x07?\x02\x02VW\x07\x07\x02\x02" +
		"WY\x05\x0E\b\x02XV\x03\x02\x02\x02XY\x03\x02\x02\x02YZ\x03\x02\x02\x02" +
		"Z[\x07<\x02\x02[\\\x05\x12\n\x02\\\x07\x03\x02\x02\x02]^\x07\x10\x02\x02" +
		"^_\x07?\x02\x02_b\x05\f\x07\x02`a\x07\x07\x02\x02ac\x05\x0E\b\x02b`\x03" +
		"\x02\x02\x02bc\x03\x02\x02\x02cd\x03\x02\x02\x02de\x07<\x02\x02ef\x05" +
		"\x12\n\x02f\t\x03\x02\x02\x02gh\x07\x11\x02\x02hi\t\x02\x02\x02ij\x07" +
		"<\x02\x02jx\x07?\x02\x02kl\x07\x12\x02\x02lm\x07?\x02\x02mn\x07\x13\x02" +
		"\x02nu\x05\x12\n\x02op\x07\x14\x02\x02pq\x07?\x02\x02qr\x07\x13\x02\x02" +
		"rt\x05\x12\n\x02so\x03\x02\x02\x02tw\x03\x02\x02\x02us\x03\x02\x02\x02" +
		"uv\x03\x02\x02\x02vy\x03\x02\x02\x02wu\x03\x02\x02\x02xk\x03\x02\x02\x02" +
		"xy\x03\x02\x02\x02y\v\x03\x02\x02\x02z\x83\x07\x15\x02\x02{\x80\x07?\x02" +
		"\x02|}\x07\x14\x02\x02}\x7F\x07?\x02\x02~|\x03\x02\x02\x02\x7F\x82\x03" +
		"\x02\x02\x02\x80~\x03\x02\x02\x02\x80\x81\x03\x02\x02\x02\x81\x84\x03" +
		"\x02\x02\x02\x82\x80\x03\x02\x02\x02\x83{\x03\x02\x02\x02\x83\x84\x03" +
		"\x02\x02\x02\x84\x85\x03\x02\x02\x02\x85\x86\x07\x16\x02\x02\x86\r\x03" +
		"\x02\x02\x02\x87\x88\b\b\x01\x02\x88\x91\x07\x15\x02\x02\x89\x8E\x05\x0E" +
		"\b\x02\x8A\x8B\x07\x14\x02\x02\x8B\x8D\x05\x0E\b\x02\x8C\x8A\x03\x02\x02" +
		"\x02\x8D\x90\x03\x02\x02\x02\x8E\x8C\x03\x02\x02\x02\x8E\x8F\x03\x02\x02" +
		"\x02\x8F\x92\x03\x02\x02\x02\x90\x8E\x03\x02\x02\x02\x91\x89\x03\x02\x02" +
		"\x02\x91\x92\x03\x02\x02\x02\x92\x93\x03\x02\x02\x02\x93\x94\x07\x16\x02" +
		"\x02\x94\x95\x07\x18\x02\x02\x95\xCA\x05\x0E\b\r\x96\x97\x070\x02\x02" +
		"\x97\x98\x07\x15\x02\x02\x98\x99\x05\x0E\b\x02\x99\x9A\x07\x16\x02\x02" +
		"\x9A\xCA\x03\x02\x02\x02\x9B\x9C\x07\x19\x02\x02\x9C\x9D\x07\x15\x02\x02" +
		"\x9D\x9E\x05\x0E\b\x02\x9E\x9F\x07\x16\x02\x02\x9F\xCA\x03\x02\x02\x02" +
		"\xA0\xA1\x07\x15\x02\x02\xA1\xA2\x05\x0E\b\x02\xA2\xA3\x07\x14\x02\x02" +
		"\xA3\xA8\x05\x0E\b\x02\xA4\xA5\x07\x14\x02\x02\xA5\xA7\x05\x0E\b\x02\xA6" +
		"\xA4\x03\x02\x02\x02\xA7\xAA\x03\x02\x02\x02\xA8\xA6\x03\x02\x02\x02\xA8" +
		"\xA9\x03\x02\x02\x02\xA9\xAB\x03\x02\x02\x02\xAA\xA8\x03\x02\x02\x02\xAB" +
		"\xAC\x07\x16\x02\x02\xAC\xCA\x03\x02\x02\x02\xAD\xAE\x07\x04\x02\x02\xAE" +
		"\xAF\x07?\x02\x02\xAF\xB0\x07\x07\x02\x02\xB0\xB7\x05\x0E\b\x02\xB1\xB2" +
		"\x07\x14\x02\x02\xB2\xB3\x07?\x02\x02\xB3\xB4\x07\x07\x02\x02\xB4\xB6" +
		"\x05\x0E\b\x02\xB5\xB1\x03\x02\x02\x02\xB6\xB9\x03\x02\x02\x02\xB7\xB5" +
		"\x03\x02\x02\x02\xB7\xB8\x03\x02\x02\x02\xB8\xBA\x03\x02\x02\x02\xB9\xB7" +
		"\x03\x02\x02\x02\xBA\xBB\x07\x05\x02\x02\xBB\xCA\x03\x02\x02\x02\xBC\xBE" +
		"\x05\x10\t\x02\xBD\xBC\x03\x02\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xBD" +
		"\x03\x02\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xCA\x03\x02\x02\x02\xC1\xCA" +
		"\x07\x1A\x02\x02\xC2\xCA\x07\x1B\x02\x02\xC3\xCA\x07\x1C\x02\x02\xC4\xCA" +
		"\x07?\x02\x02\xC5\xC6\x07\x15\x02\x02\xC6\xC7\x05\x0E\b\x02\xC7\xC8\x07" +
		"\x16\x02\x02\xC8\xCA\x03\x02\x02\x02\xC9\x87\x03\x02\x02\x02\xC9\x96\x03" +
		"\x02\x02\x02\xC9\x9B\x03\x02\x02\x02\xC9\xA0\x03\x02\x02\x02\xC9\xAD\x03" +
		"\x02\x02\x02\xC9\xBD\x03\x02\x02\x02\xC9\xC1\x03\x02\x02\x02\xC9\xC2\x03" +
		"\x02\x02\x02\xC9\xC3\x03\x02\x02\x02\xC9\xC4\x03\x02\x02\x02\xC9\xC5\x03" +
		"\x02\x02\x02\xCA\xD0\x03\x02\x02\x02\xCB\xCC\f\x0E\x02\x02\xCC\xCD\x07" +
		"\x17\x02\x02\xCD\xCF\x05\x0E\b\x0F\xCE\xCB\x03\x02\x02\x02\xCF\xD2\x03" +
		"\x02\x02\x02\xD0\xCE\x03\x02\x02\x02\xD0\xD1\x03\x02\x02\x02\xD1\x0F\x03" +
		"\x02\x02\x02\xD2\xD0\x03\x02\x02\x02\xD3\xD4\x07\x1D\x02\x02\xD4\xD5\x07" +
		"\x04\x02\x02\xD5\xD6\x07?\x02\x02\xD6\xD7\x07\x07\x02\x02\xD7\xDE\x07" +
		"&\x02\x02\xD8\xD9\x07\x14\x02\x02\xD9\xDA\x07?\x02\x02\xDA\xDB\x07\x07" +
		"\x02\x02\xDB\xDD\x05\x0E\b\x02\xDC\xD8\x03\x02\x02\x02\xDD\xE0\x03\x02" +
		"\x02\x02\xDE\xDC\x03\x02\x02\x02\xDE\xDF\x03\x02\x02\x02\xDF\xE1\x03\x02" +
		"\x02\x02\xE0\xDE\x03\x02\x02\x02\xE1\xE2\x07\x05\x02\x02\xE2\x11\x03\x02" +
		"\x02\x02\xE3\xE4\b\n\x01\x02\xE4\xE5\x05\x1A\x0E\x02\xE5\xE7\x07\x15\x02" +
		"\x02\xE6\xE8\x05\x18\r\x02\xE7\xE6\x03\x02\x02\x02\xE7\xE8\x03\x02\x02" +
		"\x02\xE8\xE9\x03\x02\x02\x02\xE9\xEA\x07\x16\x02\x02\xEA\u0170\x03\x02" +
		"\x02\x02\xEB\xEC\x072\x02\x02\xEC\u0170\x05\x12\n\x17\xED\xEE\x07\"\x02" +
		"\x02\xEE\xEF\x07\x15\x02\x02\xEF\xF0\x05\x12\n\x02\xF0\xF1\x07\x16\x02" +
		"\x02\xF1\xF2\x05\x12\n\x02\xF2\xF3\x07#\x02\x02\xF3\xF4\x05\x12\n\x13" +
		"\xF4\u0170\x03\x02\x02\x02\xF5\xF7\x07\x04\x02\x02\xF6\xF8\x07$\x02\x02" +
		"\xF7\xF6\x03\x02\x02\x02\xF7\xF8\x03\x02\x02\x02\xF8\xF9\x03\x02\x02\x02" +
		"\xF9\xFA\x05\x12\n\x02\xFA\xFB\x07$\x02\x02\xFB\u0100\x05\x12\n\x02\xFC" +
		"\xFD\x07$\x02\x02\xFD\xFF\x05\x12\n\x02\xFE\xFC\x03\x02\x02\x02\xFF\u0102" +
		"\x03\x02\x02\x02\u0100\xFE\x03\x02\x02\x02\u0100\u0101\x03\x02\x02\x02" +
		"\u0101\u0103\x03\x02\x02\x02\u0102\u0100\x03\x02\x02\x02\u0103\u0104\x07" +
		"\x05\x02\x02\u0104\u0170\x03\x02\x02\x02\u0105\u0107\x07\x04\x02\x02\u0106" +
		"\u0108\x07\x1D\x02\x02\u0107\u0106\x03\x02\x02\x02\u0107\u0108\x03\x02" +
		"\x02\x02\u0108\u0109\x03\x02\x02\x02\u0109\u010A\x05\x12\n\x02\u010A\u010B" +
		"\x07\x1D\x02\x02\u010B\u0110\x05\x12\n\x02\u010C\u010D\x07\x1D\x02\x02" +
		"\u010D\u010F\x05\x12\n\x02\u010E\u010C\x03\x02\x02\x02\u010F\u0112\x03" +
		"\x02\x02\x02\u0110\u010E\x03\x02\x02\x02\u0110\u0111\x03\x02\x02\x02\u0111" +
		"\u0113\x03\x02\x02\x02\u0112\u0110\x03\x02\x02\x02\u0113\u0114\x07\x05" +
		"\x02\x02\u0114\u0170\x03\x02\x02\x02\u0115\u0170\t\x04\x02\x02\u0116\u0117" +
		"\x07\x15\x02\x02\u0117\u0118\x05\x12\n\x02\u0118\u0119\x07\x14\x02\x02" +
		"\u0119\u011E\x05\x12\n\x02\u011A\u011B\x07\x14\x02\x02\u011B\u011D\x05" +
		"\x12\n\x02\u011C\u011A\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02\u011E" +
		"\u011C\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\u0121\x03\x02" +
		"\x02\x02\u0120\u011E\x03\x02\x02\x02\u0121\u0122\x07\x16\x02\x02\u0122" +
		"\u0170\x03\x02\x02\x02\u0123\u0124\x07\x04\x02\x02\u0124\u0125\x07?\x02" +
		"\x02\u0125\u0126\x07\x07\x02\x02\u0126\u012D\x05\x12\n\x02\u0127\u0128" +
		"\x07\x14\x02\x02\u0128\u0129\x07?\x02\x02\u0129\u012A\x07\x07\x02\x02" +
		"\u012A\u012C\x05\x12\n\x02\u012B\u0127\x03\x02\x02\x02\u012C\u012F\x03" +
		"\x02\x02\x02\u012D\u012B\x03\x02\x02\x02\u012D\u012E\x03\x02\x02\x02\u012E" +
		"\u0130\x03\x02\x02\x02\u012F\u012D\x03\x02\x02\x02\u0130\u0131\x07\x05" +
		"\x02\x02\u0131\u0170\x03\x02\x02\x02\u0132\u0133\x07\x1F\x02\x02\u0133" +
		"\u0134\x07?\x02\x02\u0134\u0135\x07.\x02\x02\u0135\u013C\x05\x12\n\x02" +
		"\u0136\u0137\x07\x14\x02\x02\u0137\u0138\x07?\x02\x02\u0138\u0139\x07" +
		".\x02\x02\u0139\u013B\x05\x12\n\x02\u013A\u0136\x03\x02\x02\x02\u013B" +
		"\u013E\x03\x02\x02\x02\u013C\u013A\x03\x02\x02\x02\u013C\u013D\x03\x02" +
		"\x02\x02\u013D\u013F\x03\x02\x02\x02\u013E\u013C\x03\x02\x02\x02\u013F" +
		"\u0140\x07 \x02\x02\u0140\u0170\x03\x02\x02\x02\u0141\u014A\x07\x1F\x02" +
		"\x02\u0142\u0147\x05\x12\n\x02\u0143\u0144\x07\x14\x02\x02\u0144\u0146" +
		"\x05\x12\n\x02\u0145\u0143\x03\x02\x02\x02\u0146\u0149\x03\x02\x02\x02" +
		"\u0147\u0145\x03\x02\x02\x02\u0147\u0148\x03\x02\x02\x02\u0148\u014B\x03" +
		"\x02\x02\x02\u0149\u0147\x03\x02\x02\x02\u014A\u0142\x03\x02\x02\x02\u014A" +
		"\u014B\x03\x02\x02\x02\u014B\u014C\x03\x02\x02\x02\u014C\u015B\x07 \x02" +
		"\x02\u014D\u014E\x07\x19\x02\x02\u014E\u0157\x07\x15\x02\x02\u014F\u0154" +
		"\x05\x12\n\x02\u0150\u0151\x07\x14\x02\x02\u0151\u0153\x05\x12\n\x02\u0152" +
		"\u0150\x03\x02\x02\x02\u0153\u0156\x03\x02\x02\x02\u0154\u0152\x03\x02" +
		"\x02\x02\u0154\u0155\x03\x02\x02\x02\u0155\u0158\x03\x02\x02\x02\u0156" +
		"\u0154\x03\x02\x02\x02\u0157\u014F\x03\x02\x02\x02\u0157\u0158\x03\x02" +
		"\x02\x02\u0158\u0159\x03\x02\x02\x02\u0159\u015B\x07\x16\x02\x02\u015A" +
		"\u0141\x03\x02\x02\x02\u015A\u014D\x03\x02\x02\x02\u015B\u0170\x03\x02" +
		"\x02\x02\u015C\u015D\x05\x06\x04\x02\u015D\u015E\x05\x12\n\x02\u015E\u0163" +
		"\x03\x02\x02\x02\u015F\u0160\x05\b\x05\x02\u0160\u0161\x05\x12\n\x02\u0161" +
		"\u0163\x03\x02\x02\x02\u0162\u015C\x03\x02\x02\x02\u0162\u015F\x03\x02" +
		"\x02\x02\u0163\u0170\x03\x02\x02\x02\u0164\u0165\x07\x15\x02\x02\u0165" +
		"\u0166\x05\x12\n\x02\u0166\u0167\x07\x16\x02\x02\u0167\u0170\x03\x02\x02" +
		"\x02\u0168\u016B\x07\x04\x02\x02\u0169\u016C\x05\x14\v\x02\u016A\u016C" +
		"\x05\x12\n\x02\u016B\u0169\x03\x02\x02\x02\u016B\u016A\x03\x02\x02\x02" +
		"\u016C\u016D\x03\x02\x02\x02\u016D\u016E\x07\x05\x02\x02\u016E\u0170\x03" +
		"\x02\x02\x02\u016F\xE3\x03\x02\x02\x02\u016F\xEB\x03\x02\x02\x02\u016F" +
		"\xED\x03\x02\x02\x02\u016F\xF5\x03\x02\x02\x02\u016F\u0105\x03\x02\x02" +
		"\x02\u016F\u0115\x03\x02\x02\x02\u016F\u0116\x03\x02\x02\x02\u016F\u0123" +
		"\x03\x02\x02\x02\u016F\u0132\x03\x02\x02\x02\u016F\u015A\x03\x02\x02\x02" +
		"\u016F\u0162\x03\x02\x02\x02\u016F\u0164\x03\x02\x02\x02\u016F\u0168\x03" +
		"\x02\x02\x02\u0170\u01A1\x03\x02\x02\x02\u0171\u0172\f\x16\x02\x02\u0172" +
		"\u0173\x07!\x02\x02\u0173\u01A0\x05\x12\n\x16\u0174\u0175\f\x15\x02\x02" +
		"\u0175\u0176\t\x05\x02\x02\u0176\u01A0\x05\x12\n\x16\u0177\u0178\f\x14" +
		"\x02\x02\u0178\u0179\t\x06\x02\x02\u0179\u01A0\x05\x12\n\x15\u017A\u017B" +
		"\f\x11\x02\x02\u017B\u017C\t\x07\x02\x02\u017C\u01A0\x05\x12\n\x12\u017D" +
		"\u017E\f\x10\x02\x02\u017E\u017F\x07)\x02\x02\u017F\u01A0\x05\x12\n\x11" +
		"\u0180\u0181\f\x0F\x02\x02\u0181\u0182\x07*\x02\x02\u0182\u01A0\x05\x12" +
		"\n\x10\u0183\u0184\f\x0E\x02\x02\u0184\u0185\x07+\x02\x02\u0185\u01A0" +
		"\x05\x12\n\x0F\u0186\u0187\f\r\x02\x02\u0187\u0188\x07,\x02\x02\u0188" +
		"\u01A0\x05\x12\n\x0E\u0189\u018A\f\x1A\x02\x02\u018A\u018B\x07\x1E\x02" +
		"\x02\u018B\u0193\x05\x1C\x0F\x02\u018C\u018F\x07\x15\x02\x02\u018D\u0190" +
		"\x05\x14\v\x02\u018E\u0190\x05\x18\r\x02\u018F\u018D\x03\x02\x02\x02\u018F" +
		"\u018E\x03\x02\x02\x02\u0190\u0191\x03\x02\x02\x02\u0191\u0192\x07\x16" +
		"\x02\x02\u0192\u0194\x03\x02\x02\x02\u0193\u018C\x03\x02\x02\x02\u0193" +
		"\u0194\x03\x02\x02\x02\u0194\u01A0\x03\x02\x02\x02\u0195\u0196\f\x18\x02" +
		"\x02\u0196\u0197\x07\x1F\x02\x02\u0197\u0198\x05\x12\n\x02\u0198\u0199" +
		"\x07 \x02\x02\u0199\u01A0\x03\x02\x02\x02\u019A\u019B\f\x12\x02\x02\u019B" +
		"\u019D\x07?\x02\x02\u019C\u019E\x05\x18\r\x02\u019D\u019C\x03\x02\x02" +
		"\x02\u019D\u019E\x03\x02\x02\x02\u019E\u01A0\x03\x02\x02\x02\u019F\u0171" +
		"\x03\x02\x02\x02\u019F\u0174\x03\x02\x02\x02\u019F\u0177\x03\x02\x02\x02" +
		"\u019F\u017A\x03\x02\x02\x02\u019F\u017D\x03\x02\x02\x02\u019F\u0180\x03" +
		"\x02\x02\x02\u019F\u0183\x03\x02\x02\x02\u019F\u0186\x03\x02\x02\x02\u019F" +
		"\u0189\x03\x02\x02\x02\u019F\u0195\x03\x02\x02\x02\u019F\u019A\x03\x02" +
		"\x02\x02\u01A0\u01A3\x03\x02\x02\x02\u01A1\u019F\x03\x02\x02\x02\u01A1" +
		"\u01A2\x03\x02\x02\x02\u01A2\x13\x03\x02\x02\x02\u01A3\u01A1\x03\x02\x02" +
		"\x02\u01A4\u01A5\x05\x16\f\x02\u01A5\u01A6\x07\x17\x02\x02\u01A6\u01A7" +
		"\x05\x12\n\x02\u01A7\u01B6\x03\x02\x02\x02\u01A8\u01A9\x07\x15\x02\x02" +
		"\u01A9\u01AE\x05\x16\f\x02\u01AA\u01AB\x07\x14\x02\x02\u01AB\u01AD\x05" +
		"\x16\f\x02\u01AC\u01AA\x03\x02\x02\x02\u01AD\u01B0\x03\x02\x02\x02\u01AE" +
		"\u01AC\x03\x02\x02\x02\u01AE\u01AF\x03\x02\x02\x02\u01AF\u01B1\x03\x02" +
		"\x02\x02\u01B0\u01AE\x03\x02\x02\x02\u01B1\u01B2\x07\x16\x02\x02\u01B2" +
		"\u01B3\x07\x17\x02\x02\u01B3\u01B4\x05\x12\n\x02\u01B4\u01B6\x03\x02\x02" +
		"\x02\u01B5\u01A4\x03\x02\x02\x02\u01B5\u01A8\x03\x02\x02\x02\u01B6\x15" +
		"\x03\x02\x02\x02\u01B7\u01B8\t\x02\x02\x02\u01B8\x17\x03\x02\x02\x02\u01B9" +
		"\u01BE\x05\x12\n\x02\u01BA\u01BB\x07\x14\x02\x02\u01BB\u01BD\x05\x12\n" +
		"\x02\u01BC\u01BA\x03\x02\x02\x02\u01BD\u01C0\x03\x02\x02\x02\u01BE\u01BC" +
		"\x03\x02\x02\x02\u01BE\u01BF\x03\x02\x02\x02\u01BF\x19\x03\x02\x02\x02" +
		"\u01C0\u01BE\x03\x02\x02\x02\u01C1\u01C4\x07?\x02\x02\u01C2\u01C4\t\b" +
		"\x02\x02\u01C3\u01C1\x03\x02\x02\x02\u01C3\u01C2\x03\x02\x02\x02\u01C4" +
		"\x1B\x03\x02\x02\x02\u01C5\u01C8\x07?\x02\x02\u01C6\u01C8\t\t\x02\x02" +
		"\u01C7\u01C5\x03\x02\x02\x02\u01C7\u01C6\x03\x02\x02\x02\u01C8\x1D\x03" +
		"\x02\x02\x02\u01C9\u01CA\t\n\x02\x02\u01CA\x1F\x03\x02\x02\x02\u01CB\u01CC" +
		"\t\v\x02\x02\u01CC!\x03\x02\x02\x02/(>BORXbux\x80\x83\x8E\x91\xA8\xB7" +
		"\xBF\xC9\xD0\xDE\xE7\xF7\u0100\u0107\u0110\u011E\u012D\u013C\u0147\u014A" +
		"\u0154\u0157\u015A\u0162\u016B\u016F\u018F\u0193\u019D\u019F\u01A1\u01AE" +
		"\u01B5\u01BE\u01C3\u01C7";
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
export class PatContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(TntParser.IDENTIFIER, 0); }
	public EQ(): TerminalNode { return this.getToken(TntParser.EQ, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public params(): ParamsContext | undefined {
		return this.tryGetRuleContext(0, ParamsContext);
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
		if (listener.enterPat) {
			listener.enterPat(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitPat) {
			listener.exitPat(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitPat) {
			return visitor.visitPat(this);
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
	public lambda(): LambdaContext | undefined {
		return this.tryGetRuleContext(0, LambdaContext);
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
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TntParser.RULE_lambda; }
	public copyFrom(ctx: LambdaContext): void {
		super.copyFrom(ctx);
	}
}
export class LambdaOneContext extends LambdaContext {
	public identOrHole(): IdentOrHoleContext {
		return this.getRuleContext(0, IdentOrHoleContext);
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: LambdaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLambdaOne) {
			listener.enterLambdaOne(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLambdaOne) {
			listener.exitLambdaOne(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLambdaOne) {
			return visitor.visitLambdaOne(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LambdaManyContext extends LambdaContext {
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
	constructor(ctx: LambdaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: TntListener): void {
		if (listener.enterLambdaMany) {
			listener.enterLambdaMany(this);
		}
	}
	// @Override
	public exitRule(listener: TntListener): void {
		if (listener.exitLambdaMany) {
			listener.exitLambdaMany(this);
		}
	}
	// @Override
	public accept<Result>(visitor: TntVisitor<Result>): Result {
		if (visitor.visitLambdaMany) {
			return visitor.visitLambdaMany(this);
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


export class ArgListContext extends ParserRuleContext {
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


