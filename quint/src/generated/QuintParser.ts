// Generated from ./src/generated/Quint.g4 by ANTLR 4.9.0-SNAPSHOT


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

import { QuintListener } from "./QuintListener";
import { QuintVisitor } from "./QuintVisitor";


export class QuintParser extends Parser {
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
	public static readonly STRING = 35;
	public static readonly BOOL = 36;
	public static readonly INT = 37;
	public static readonly AND = 38;
	public static readonly OR = 39;
	public static readonly IFF = 40;
	public static readonly IMPLIES = 41;
	public static readonly SET = 42;
	public static readonly LIST = 43;
	public static readonly MAP = 44;
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
	public static readonly DOCCOMMENT = 62;
	public static readonly LINE_COMMENT = 63;
	public static readonly COMMENT = 64;
	public static readonly WS = 65;
	public static readonly RULE_modules = 0;
	public static readonly RULE_module = 1;
	public static readonly RULE_docLines = 2;
	public static readonly RULE_unit = 3;
	public static readonly RULE_operDef = 4;
	public static readonly RULE_qualifier = 5;
	public static readonly RULE_instanceMod = 6;
	public static readonly RULE_type = 7;
	public static readonly RULE_typeUnionRecOne = 8;
	public static readonly RULE_row = 9;
	public static readonly RULE_expr = 10;
	public static readonly RULE_unitOrExpr = 11;
	public static readonly RULE_lambda = 12;
	public static readonly RULE_identOrHole = 13;
	public static readonly RULE_parameter = 14;
	public static readonly RULE_identOrStar = 15;
	public static readonly RULE_path = 16;
	public static readonly RULE_argList = 17;
	public static readonly RULE_normalCallName = 18;
	public static readonly RULE_nameAfterDot = 19;
	public static readonly RULE_operator = 20;
	public static readonly RULE_literal = 21;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "docLines", "unit", "operDef", "qualifier", "instanceMod", 
		"type", "typeUnionRecOne", "row", "expr", "unitOrExpr", "lambda", "identOrHole", 
		"parameter", "identOrStar", "path", "argList", "normalCallName", "nameAfterDot", 
		"operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'type'", "'import'", "'.'", "','", "';'", "'val'", "'def'", "'pure'", 
		"'action'", "'run'", "'temporal'", "'->'", "'=>'", "'['", "']'", "'int'", 
		"'str'", "'bool'", "'|'", "'^'", "'''", "'all'", "'any'", "'if'", "'else'", 
		"'nondet'", "'_'", undefined, undefined, undefined, "'and'", "'or'", "'iff'", 
		"'implies'", "'Set'", "'List'", "'Map'", "'match'", "'+'", "'-'", "'*'", 
		"'/'", "'%'", "'>'", "'<'", "'>='", "'<='", "'!='", "'=='", "'='", "'('", 
		"')'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		"STRING", "BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", "SET", "LIST", 
		"MAP", "MATCH", "PLUS", "MINUS", "MUL", "DIV", "MOD", "GT", "LT", "GE", 
		"LE", "NE", "EQ", "ASGN", "LPAREN", "RPAREN", "IDENTIFIER", "SIMPLE_IDENTIFIER", 
		"DOCCOMMENT", "LINE_COMMENT", "COMMENT", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(QuintParser._LITERAL_NAMES, QuintParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return QuintParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Quint.g4"; }

	// @Override
	public get ruleNames(): string[] { return QuintParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return QuintParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(QuintParser._ATN, this);
	}
	// @RuleVersion(0)
	public modules(): ModulesContext {
		let _localctx: ModulesContext = new ModulesContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, QuintParser.RULE_modules);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 45;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 44;
				this.module();
				}
				}
				this.state = 47;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0);
			this.state = 49;
			this.match(QuintParser.EOF);
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
	public module(): ModuleContext {
		let _localctx: ModuleContext = new ModuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, QuintParser.RULE_module);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 51;
			this.match(QuintParser.T__0);
			this.state = 52;
			this.match(QuintParser.IDENTIFIER);
			this.state = 53;
			this.match(QuintParser.T__1);
			this.state = 59;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__0) | (1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__7) | (1 << QuintParser.T__8) | (1 << QuintParser.T__12) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17))) !== 0) || _la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 54;
				this.docLines();
				this.state = 55;
				this.unit();
				}
				}
				this.state = 61;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 62;
			this.match(QuintParser.T__2);
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
	public docLines(): DocLinesContext {
		let _localctx: DocLinesContext = new DocLinesContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, QuintParser.RULE_docLines);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 64;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 69;
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
	public unit(): UnitContext {
		let _localctx: UnitContext = new UnitContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, QuintParser.RULE_unit);
		try {
			this.state = 96;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 70;
				this.match(QuintParser.T__3);
				this.state = 71;
				this.match(QuintParser.IDENTIFIER);
				this.state = 72;
				this.match(QuintParser.T__4);
				this.state = 73;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 74;
				this.match(QuintParser.T__5);
				this.state = 75;
				this.match(QuintParser.IDENTIFIER);
				this.state = 76;
				this.match(QuintParser.T__4);
				this.state = 77;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 78;
				this.match(QuintParser.T__6);
				this.state = 79;
				this.identOrHole();
				this.state = 80;
				this.match(QuintParser.ASGN);
				this.state = 81;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 83;
				this.operDef();
				}
				break;

			case 5:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 84;
				this.instanceMod();
				}
				break;

			case 6:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 85;
				this.match(QuintParser.T__7);
				this.state = 86;
				this.match(QuintParser.IDENTIFIER);
				}
				break;

			case 7:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 87;
				this.match(QuintParser.T__7);
				this.state = 88;
				this.match(QuintParser.IDENTIFIER);
				this.state = 89;
				this.match(QuintParser.ASGN);
				this.state = 90;
				this.type(0);
				}
				break;

			case 8:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 91;
				this.match(QuintParser.T__8);
				this.state = 92;
				this.path();
				this.state = 93;
				this.match(QuintParser.T__9);
				this.state = 94;
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
		this.enterRule(_localctx, 8, QuintParser.RULE_operDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 98;
			this.qualifier();
			this.state = 99;
			this.normalCallName();
			this.state = 136;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				{
				this.state = 100;
				this.match(QuintParser.LPAREN);
				this.state = 109;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__33 || _la === QuintParser.IDENTIFIER) {
					{
					this.state = 101;
					this.parameter();
					this.state = 106;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === QuintParser.T__10) {
						{
						{
						this.state = 102;
						this.match(QuintParser.T__10);
						this.state = 103;
						this.parameter();
						}
						}
						this.state = 108;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 111;
				this.match(QuintParser.RPAREN);
				this.state = 114;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 112;
					this.match(QuintParser.T__4);
					this.state = 113;
					this.type(0);
					}
				}

				}
				break;

			case 2:
				{
				this.state = 116;
				this.match(QuintParser.T__4);
				this.state = 117;
				this.type(0);
				}
				break;

			case 3:
				{
				this.state = 118;
				this.match(QuintParser.LPAREN);
				{
				this.state = 119;
				this.parameter();
				this.state = 120;
				this.match(QuintParser.T__4);
				this.state = 121;
				this.type(0);
				this.state = 129;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__10) {
					{
					{
					this.state = 122;
					this.match(QuintParser.T__10);
					this.state = 123;
					this.parameter();
					this.state = 124;
					this.match(QuintParser.T__4);
					this.state = 125;
					this.type(0);
					}
					}
					this.state = 131;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 132;
				this.match(QuintParser.RPAREN);
				this.state = 133;
				this.match(QuintParser.T__4);
				this.state = 134;
				this.type(0);
				}
				break;
			}
			this.state = 140;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.ASGN) {
				{
				this.state = 138;
				this.match(QuintParser.ASGN);
				this.state = 139;
				this.expr(0);
				}
			}

			this.state = 143;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__11) {
				{
				this.state = 142;
				this.match(QuintParser.T__11);
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
		this.enterRule(_localctx, 10, QuintParser.RULE_qualifier);
		try {
			this.state = 154;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 11, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 145;
				this.match(QuintParser.T__12);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 146;
				this.match(QuintParser.T__13);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 147;
				this.match(QuintParser.T__14);
				this.state = 148;
				this.match(QuintParser.T__12);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 149;
				this.match(QuintParser.T__14);
				this.state = 150;
				this.match(QuintParser.T__13);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 151;
				this.match(QuintParser.T__15);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 152;
				this.match(QuintParser.T__16);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 153;
				this.match(QuintParser.T__17);
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
	public instanceMod(): InstanceModContext {
		let _localctx: InstanceModContext = new InstanceModContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, QuintParser.RULE_instanceMod);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 156;
			this.match(QuintParser.T__0);
			this.state = 157;
			this.match(QuintParser.IDENTIFIER);
			this.state = 158;
			this.match(QuintParser.ASGN);
			this.state = 159;
			this.match(QuintParser.IDENTIFIER);
			this.state = 160;
			this.match(QuintParser.LPAREN);
			this.state = 178;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.MUL:
				{
				this.state = 161;
				this.match(QuintParser.MUL);
				}
				break;
			case QuintParser.IDENTIFIER:
				{
				this.state = 162;
				this.match(QuintParser.IDENTIFIER);
				this.state = 163;
				this.match(QuintParser.ASGN);
				this.state = 164;
				this.expr(0);
				this.state = 171;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 12, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 165;
						this.match(QuintParser.T__10);
						this.state = 166;
						this.match(QuintParser.IDENTIFIER);
						this.state = 167;
						this.match(QuintParser.ASGN);
						this.state = 168;
						this.expr(0);
						}
						}
					}
					this.state = 173;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 12, this._ctx);
				}
				this.state = 176;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 174;
					this.match(QuintParser.T__10);
					this.state = 175;
					this.match(QuintParser.MUL);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 180;
			this.match(QuintParser.RPAREN);
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
		let _startState: number = 14;
		this.enterRecursionRule(_localctx, 14, QuintParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 243;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 183;
				this.match(QuintParser.LPAREN);
				this.state = 192;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__22) | (1 << QuintParser.T__23) | (1 << QuintParser.T__24) | (1 << QuintParser.T__25))) !== 0) || ((((_la - 42)) & ~0x1F) === 0 && ((1 << (_la - 42)) & ((1 << (QuintParser.SET - 42)) | (1 << (QuintParser.LIST - 42)) | (1 << (QuintParser.LPAREN - 42)) | (1 << (QuintParser.IDENTIFIER - 42)))) !== 0)) {
					{
					this.state = 184;
					this.type(0);
					this.state = 189;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 185;
							this.match(QuintParser.T__10);
							this.state = 186;
							this.type(0);
							}
							}
						}
						this.state = 191;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 15, this._ctx);
					}
					}
				}

				this.state = 195;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 194;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 197;
				this.match(QuintParser.RPAREN);
				this.state = 198;
				this.match(QuintParser.T__19);
				this.state = 199;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 200;
				this.match(QuintParser.SET);
				this.state = 201;
				this.match(QuintParser.T__20);
				this.state = 202;
				this.type(0);
				this.state = 203;
				this.match(QuintParser.T__21);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 205;
				this.match(QuintParser.LIST);
				this.state = 206;
				this.match(QuintParser.T__20);
				this.state = 207;
				this.type(0);
				this.state = 208;
				this.match(QuintParser.T__21);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 210;
				this.match(QuintParser.LPAREN);
				this.state = 211;
				this.type(0);
				this.state = 212;
				this.match(QuintParser.T__10);
				this.state = 213;
				this.type(0);
				this.state = 218;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 214;
						this.match(QuintParser.T__10);
						this.state = 215;
						this.type(0);
						}
						}
					}
					this.state = 220;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 18, this._ctx);
				}
				this.state = 222;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 221;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 224;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 226;
				this.match(QuintParser.T__1);
				this.state = 227;
				this.row();
				this.state = 228;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 231;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 230;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 233;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 20, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 235;
				this.match(QuintParser.T__22);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 236;
				this.match(QuintParser.T__23);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 237;
				this.match(QuintParser.T__24);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 238;
				this.match(QuintParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 239;
				this.match(QuintParser.LPAREN);
				this.state = 240;
				this.type(0);
				this.state = 241;
				this.match(QuintParser.RPAREN);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 253;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 23, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 251;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 22, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 245;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 246;
						this.match(QuintParser.T__18);
						this.state = 247;
						this.type(13);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 248;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 249;
						this.match(QuintParser.T__19);
						this.state = 250;
						this.type(12);
						}
						break;
					}
					}
				}
				this.state = 255;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 23, this._ctx);
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
		this.enterRule(_localctx, 16, QuintParser.RULE_typeUnionRecOne);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 256;
			this.match(QuintParser.T__25);
			this.state = 257;
			this.match(QuintParser.T__1);
			this.state = 258;
			this.match(QuintParser.IDENTIFIER);
			this.state = 259;
			this.match(QuintParser.T__4);
			this.state = 260;
			this.match(QuintParser.STRING);
			this.state = 263;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				{
				this.state = 261;
				this.match(QuintParser.T__10);
				this.state = 262;
				this.row();
				}
				break;
			}
			this.state = 266;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__10) {
				{
				this.state = 265;
				this.match(QuintParser.T__10);
				}
			}

			this.state = 268;
			this.match(QuintParser.T__2);
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
	public row(): RowContext {
		let _localctx: RowContext = new RowContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, QuintParser.RULE_row);
		let _la: number;
		try {
			let _alt: number;
			this.state = 294;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 278;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 26, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 271;
						this.match(QuintParser.IDENTIFIER);
						this.state = 272;
						this.match(QuintParser.T__4);
						this.state = 273;
						this.type(0);
						this.state = 274;
						this.match(QuintParser.T__10);
						}
						}
					}
					this.state = 280;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 26, this._ctx);
				}
				this.state = 290;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.IDENTIFIER) {
					{
					{
					this.state = 281;
					this.match(QuintParser.IDENTIFIER);
					this.state = 282;
					this.match(QuintParser.T__4);
					this.state = 283;
					this.type(0);
					}
					this.state = 288;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 27, this._ctx) ) {
					case 1:
						{
						this.state = 285;
						this.match(QuintParser.T__10);
						}
						break;

					case 2:
						{
						this.state = 286;
						this.match(QuintParser.T__25);
						{
						this.state = 287;
						this.match(QuintParser.IDENTIFIER);
						}
						}
						break;
					}
					}
				}

				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 292;
				this.match(QuintParser.T__25);
				{
				this.state = 293;
				this.match(QuintParser.IDENTIFIER);
				}
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
		let _startState: number = 20;
		this.enterRecursionRule(_localctx, 20, QuintParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 453;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 48, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 297;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 298;
				this.normalCallName();
				this.state = 299;
				this.match(QuintParser.LPAREN);
				this.state = 301;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__12) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__20) | (1 << QuintParser.T__28) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.IDENTIFIER - 33)))) !== 0)) {
					{
					this.state = 300;
					this.argList();
					}
				}

				this.state = 303;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 305;
				this.match(QuintParser.MINUS);
				this.state = 306;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 307;
				this.match(QuintParser.IDENTIFIER);
				this.state = 308;
				this.match(QuintParser.T__27);
				this.state = 309;
				this.match(QuintParser.ASGN);
				this.state = 310;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 311;
				this.match(QuintParser.AND);
				this.state = 312;
				this.match(QuintParser.T__1);
				this.state = 313;
				this.expr(0);
				this.state = 318;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 31, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 314;
						this.match(QuintParser.T__10);
						this.state = 315;
						this.expr(0);
						}
						}
					}
					this.state = 320;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 31, this._ctx);
				}
				this.state = 322;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 321;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 324;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 326;
				this.match(QuintParser.OR);
				this.state = 327;
				this.match(QuintParser.T__1);
				this.state = 328;
				this.expr(0);
				this.state = 333;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 329;
						this.match(QuintParser.T__10);
						this.state = 330;
						this.expr(0);
						}
						}
					}
					this.state = 335;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				}
				this.state = 337;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 336;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 339;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 341;
				this.match(QuintParser.T__28);
				this.state = 342;
				this.match(QuintParser.T__1);
				this.state = 343;
				this.expr(0);
				this.state = 348;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 344;
						this.match(QuintParser.T__10);
						this.state = 345;
						this.expr(0);
						}
						}
					}
					this.state = 350;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
				}
				this.state = 352;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 351;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 354;
				this.match(QuintParser.T__2);
				}
				break;

			case 8:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 356;
				this.match(QuintParser.T__29);
				this.state = 357;
				this.match(QuintParser.T__1);
				this.state = 358;
				this.expr(0);
				this.state = 363;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 37, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 359;
						this.match(QuintParser.T__10);
						this.state = 360;
						this.expr(0);
						}
						}
					}
					this.state = 365;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 37, this._ctx);
				}
				this.state = 367;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 366;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 369;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 371;
				_la = this._input.LA(1);
				if (!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (QuintParser.STRING - 35)) | (1 << (QuintParser.BOOL - 35)) | (1 << (QuintParser.INT - 35)) | (1 << (QuintParser.IDENTIFIER - 35)))) !== 0))) {
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

			case 10:
				{
				_localctx = new TupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 372;
				this.match(QuintParser.LPAREN);
				this.state = 373;
				this.expr(0);
				this.state = 374;
				this.match(QuintParser.T__10);
				this.state = 375;
				this.expr(0);
				this.state = 380;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 39, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 376;
						this.match(QuintParser.T__10);
						this.state = 377;
						this.expr(0);
						}
						}
					}
					this.state = 382;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 39, this._ctx);
				}
				this.state = 384;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 383;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 386;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 11:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 388;
				this.match(QuintParser.T__1);
				this.state = 389;
				this.match(QuintParser.IDENTIFIER);
				this.state = 390;
				this.match(QuintParser.T__4);
				this.state = 391;
				this.expr(0);
				this.state = 398;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 392;
						this.match(QuintParser.T__10);
						this.state = 393;
						this.match(QuintParser.IDENTIFIER);
						this.state = 394;
						this.match(QuintParser.T__4);
						this.state = 395;
						this.expr(0);
						}
						}
					}
					this.state = 400;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
				}
				this.state = 402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 401;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 404;
				this.match(QuintParser.T__2);
				}
				break;

			case 12:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 406;
				this.match(QuintParser.T__20);
				this.state = 415;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__12) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__20) | (1 << QuintParser.T__28) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.IDENTIFIER - 33)))) !== 0)) {
					{
					this.state = 407;
					this.expr(0);
					this.state = 412;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 408;
							this.match(QuintParser.T__10);
							this.state = 409;
							this.expr(0);
							}
							}
						}
						this.state = 414;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
					}
					}
				}

				this.state = 418;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 417;
					this.match(QuintParser.T__10);
					}
				}

				this.state = 420;
				this.match(QuintParser.T__21);
				}
				break;

			case 13:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 421;
				this.match(QuintParser.T__30);
				this.state = 422;
				this.match(QuintParser.LPAREN);
				this.state = 423;
				this.expr(0);
				this.state = 424;
				this.match(QuintParser.RPAREN);
				this.state = 425;
				this.expr(0);
				this.state = 426;
				this.match(QuintParser.T__31);
				this.state = 427;
				this.expr(5);
				}
				break;

			case 14:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 429;
				this.operDef();
				this.state = 430;
				this.expr(4);
				}
				break;

			case 15:
				{
				_localctx = new NondetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 432;
				this.match(QuintParser.T__32);
				this.state = 433;
				this.match(QuintParser.IDENTIFIER);
				this.state = 436;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 434;
					this.match(QuintParser.T__4);
					this.state = 435;
					this.type(0);
					}
				}

				this.state = 438;
				this.match(QuintParser.ASGN);
				this.state = 439;
				this.expr(0);
				this.state = 441;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 440;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 443;
				this.expr(3);
				}
				break;

			case 16:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 445;
				this.match(QuintParser.LPAREN);
				this.state = 446;
				this.expr(0);
				this.state = 447;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 17:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 449;
				this.match(QuintParser.T__1);
				this.state = 450;
				this.expr(0);
				this.state = 451;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 517;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 515;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 52, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 455;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 456;
						(_localctx as PowContext)._op = this.match(QuintParser.T__26);
						this.state = 457;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 458;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 459;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & ((1 << (QuintParser.MUL - 48)) | (1 << (QuintParser.DIV - 48)) | (1 << (QuintParser.MOD - 48)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 460;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 461;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 462;
						(_localctx as PlusMinusContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === QuintParser.PLUS || _la === QuintParser.MINUS)) {
							(_localctx as PlusMinusContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 463;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 464;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 465;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & ((1 << (QuintParser.GT - 51)) | (1 << (QuintParser.LT - 51)) | (1 << (QuintParser.GE - 51)) | (1 << (QuintParser.LE - 51)) | (1 << (QuintParser.NE - 51)) | (1 << (QuintParser.EQ - 51)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 466;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 467;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 468;
						this.match(QuintParser.ASGN);
						this.state = 469;
						this.expr(21);

						                            const m = "QNT006: unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 472;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 473;
						this.match(QuintParser.AND);
						this.state = 474;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 475;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 476;
						this.match(QuintParser.OR);
						this.state = 477;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 478;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 479;
						this.match(QuintParser.IFF);
						this.state = 480;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 481;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 482;
						this.match(QuintParser.IMPLIES);
						this.state = 483;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 484;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 485;
						this.match(QuintParser.T__18);
						this.state = 486;
						this.expr(9);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 487;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 488;
						this.match(QuintParser.T__9);
						this.state = 489;
						this.nameAfterDot();
						this.state = 495;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 50, this._ctx) ) {
						case 1:
							{
							this.state = 490;
							this.match(QuintParser.LPAREN);
							this.state = 492;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__12) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__20) | (1 << QuintParser.T__28) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.IDENTIFIER - 33)))) !== 0)) {
								{
								this.state = 491;
								this.argList();
								}
							}

							this.state = 494;
							this.match(QuintParser.RPAREN);
							}
							break;
						}
						}
						break;

					case 12:
						{
						_localctx = new ListAppContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 497;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 498;
						this.match(QuintParser.T__20);
						this.state = 499;
						this.expr(0);
						this.state = 500;
						this.match(QuintParser.T__21);
						}
						break;

					case 13:
						{
						_localctx = new MatchContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 502;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 503;
						this.match(QuintParser.MATCH);
						this.state = 511;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 504;
								this.match(QuintParser.T__25);
								this.state = 505;
								this.match(QuintParser.STRING);
								this.state = 506;
								this.match(QuintParser.T__4);
								this.state = 507;
								this.parameter();
								this.state = 508;
								this.match(QuintParser.T__19);
								this.state = 509;
								this.expr(0);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 513;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 51, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;
					}
					}
				}
				this.state = 519;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
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
		this.enterRule(_localctx, 22, QuintParser.RULE_unitOrExpr);
		try {
			this.state = 522;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 54, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 520;
				this.unit();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 521;
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
		this.enterRule(_localctx, 24, QuintParser.RULE_lambda);
		let _la: number;
		try {
			this.state = 541;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__33:
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 524;
				this.parameter();
				this.state = 525;
				this.match(QuintParser.T__19);
				this.state = 526;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 528;
				this.match(QuintParser.LPAREN);
				this.state = 529;
				this.parameter();
				this.state = 534;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__10) {
					{
					{
					this.state = 530;
					this.match(QuintParser.T__10);
					this.state = 531;
					this.parameter();
					}
					}
					this.state = 536;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 537;
				this.match(QuintParser.RPAREN);
				this.state = 538;
				this.match(QuintParser.T__19);
				this.state = 539;
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
		this.enterRule(_localctx, 26, QuintParser.RULE_identOrHole);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 543;
			_la = this._input.LA(1);
			if (!(_la === QuintParser.T__33 || _la === QuintParser.IDENTIFIER)) {
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
	public parameter(): ParameterContext {
		let _localctx: ParameterContext = new ParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, QuintParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 545;
			this.identOrHole();
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
		this.enterRule(_localctx, 30, QuintParser.RULE_identOrStar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 547;
			_la = this._input.LA(1);
			if (!(_la === QuintParser.MUL || _la === QuintParser.IDENTIFIER)) {
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
		this.enterRule(_localctx, 32, QuintParser.RULE_path);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 549;
			this.match(QuintParser.IDENTIFIER);
			this.state = 554;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 550;
					this.match(QuintParser.T__9);
					this.state = 551;
					this.match(QuintParser.IDENTIFIER);
					}
					}
				}
				this.state = 556;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
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
		this.enterRule(_localctx, 34, QuintParser.RULE_argList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 557;
			this.expr(0);
			this.state = 562;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__10) {
				{
				{
				this.state = 558;
				this.match(QuintParser.T__10);
				this.state = 559;
				this.expr(0);
				}
				}
				this.state = 564;
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
		this.enterRule(_localctx, 36, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 567;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 565;
				this.match(QuintParser.IDENTIFIER);
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.MAP:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 566;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (QuintParser.AND - 38)) | (1 << (QuintParser.OR - 38)) | (1 << (QuintParser.IFF - 38)) | (1 << (QuintParser.IMPLIES - 38)) | (1 << (QuintParser.SET - 38)) | (1 << (QuintParser.LIST - 38)) | (1 << (QuintParser.MAP - 38)))) !== 0))) {
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
		this.enterRule(_localctx, 38, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 571;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 569;
				this.match(QuintParser.IDENTIFIER);
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 570;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (QuintParser.AND - 38)) | (1 << (QuintParser.OR - 38)) | (1 << (QuintParser.IFF - 38)) | (1 << (QuintParser.IMPLIES - 38)))) !== 0))) {
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
		this.enterRule(_localctx, 40, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 573;
			_la = this._input.LA(1);
			if (!(((((_la - 27)) & ~0x1F) === 0 && ((1 << (_la - 27)) & ((1 << (QuintParser.T__26 - 27)) | (1 << (QuintParser.AND - 27)) | (1 << (QuintParser.OR - 27)) | (1 << (QuintParser.IFF - 27)) | (1 << (QuintParser.IMPLIES - 27)) | (1 << (QuintParser.PLUS - 27)) | (1 << (QuintParser.MINUS - 27)) | (1 << (QuintParser.MUL - 27)) | (1 << (QuintParser.DIV - 27)) | (1 << (QuintParser.MOD - 27)) | (1 << (QuintParser.GT - 27)) | (1 << (QuintParser.LT - 27)) | (1 << (QuintParser.GE - 27)) | (1 << (QuintParser.LE - 27)) | (1 << (QuintParser.NE - 27)) | (1 << (QuintParser.EQ - 27)))) !== 0))) {
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
		this.enterRule(_localctx, 42, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 575;
			_la = this._input.LA(1);
			if (!(((((_la - 35)) & ~0x1F) === 0 && ((1 << (_la - 35)) & ((1 << (QuintParser.STRING - 35)) | (1 << (QuintParser.BOOL - 35)) | (1 << (QuintParser.INT - 35)))) !== 0))) {
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
		case 7:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 10:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private type_sempred(_localctx: TypeContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 13);

		case 1:
			return this.precpred(this._ctx, 12);
		}
		return true;
	}
	private expr_sempred(_localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return this.precpred(this._ctx, 26);

		case 3:
			return this.precpred(this._ctx, 24);

		case 4:
			return this.precpred(this._ctx, 23);

		case 5:
			return this.precpred(this._ctx, 22);

		case 6:
			return this.precpred(this._ctx, 20);

		case 7:
			return this.precpred(this._ctx, 18);

		case 8:
			return this.precpred(this._ctx, 16);

		case 9:
			return this.precpred(this._ctx, 15);

		case 10:
			return this.precpred(this._ctx, 14);

		case 11:
			return this.precpred(this._ctx, 8);

		case 12:
			return this.precpred(this._ctx, 30);

		case 13:
			return this.precpred(this._ctx, 27);

		case 14:
			return this.precpred(this._ctx, 13);
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03C\u0244\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x03" +
		"\x02\x06\x020\n\x02\r\x02\x0E\x021\x03\x02\x03\x02\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x07\x03<\n\x03\f\x03\x0E\x03?\v\x03\x03\x03" +
		"\x03\x03\x03\x04\x07\x04D\n\x04\f\x04\x0E\x04G\v\x04\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05c\n\x05\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06k\n\x06\f\x06\x0E\x06n\v\x06" +
		"\x05\x06p\n\x06\x03\x06\x03\x06\x03\x06\x05\x06u\n\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x07\x06\x82\n\x06\f\x06\x0E\x06\x85\v\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x05\x06\x8B\n\x06\x03\x06\x03\x06\x05\x06\x8F\n\x06\x03\x06\x05\x06" +
		"\x92\n\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x05\x07\x9D\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xAC\n\b\f\b\x0E\b\xAF\v\b" +
		"\x03\b\x03\b\x05\b\xB3\n\b\x05\b\xB5\n\b\x03\b\x03\b\x03\t\x03\t\x03\t" +
		"\x03\t\x03\t\x07\t\xBE\n\t\f\t\x0E\t\xC1\v\t\x05\t\xC3\n\t\x03\t\x05\t" +
		"\xC6\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\xDB\n\t\f\t\x0E" +
		"\t\xDE\v\t\x03\t\x05\t\xE1\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x06\t\xEA\n\t\r\t\x0E\t\xEB\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\t\x05\t\xF6\n\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x07\t\xFE\n" +
		"\t\f\t\x0E\t\u0101\v\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n" +
		"\u010A\n\n\x03\n\x05\n\u010D\n\n\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03" +
		"\v\x03\v\x07\v\u0117\n\v\f\v\x0E\v\u011A\v\v\x03\v\x03\v\x03\v\x03\v\x03" +
		"\v\x03\v\x03\v\x05\v\u0123\n\v\x05\v\u0125\n\v\x03\v\x03\v\x05\v\u0129" +
		"\n\v\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u0130\n\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u013F\n" +
		"\f\f\f\x0E\f\u0142\v\f\x03\f\x05\f\u0145\n\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x07\f\u014E\n\f\f\f\x0E\f\u0151\v\f\x03\f\x05\f\u0154\n" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u015D\n\f\f\f\x0E\f" +
		"\u0160\v\f\x03\f\x05\f\u0163\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x07\f\u016C\n\f\f\f\x0E\f\u016F\v\f\x03\f\x05\f\u0172\n\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u017D\n\f\f\f\x0E\f" +
		"\u0180\v\f\x03\f\x05\f\u0183\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x07\f\u018F\n\f\f\f\x0E\f\u0192\v\f\x03\f\x05\f\u0195" +
		"\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u019D\n\f\f\f\x0E\f\u01A0" +
		"\v\f\x05\f\u01A2\n\f\x03\f\x05\f\u01A5\n\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05" +
		"\f\u01B7\n\f\x03\f\x03\f\x03\f\x05\f\u01BC\n\f\x03\f\x03\f\x03\f\x03\f" +
		"\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u01C8\n\f\x03\f\x03\f\x03\f" +
		"\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u01EF" +
		"\n\f\x03\f\x05\f\u01F2\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x06\f\u0202\n\f\r\f\x0E\f\u0203" +
		"\x07\f\u0206\n\f\f\f\x0E\f\u0209\v\f\x03\r\x03\r\x05\r\u020D\n\r\x03\x0E" +
		"\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u0217" +
		"\n\x0E\f\x0E\x0E\x0E\u021A\v\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E" +
		"\u0220\n\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03" +
		"\x12\x03\x12\x07\x12\u022B\n\x12\f\x12\x0E\x12\u022E\v\x12\x03\x13\x03" +
		"\x13\x03\x13\x07\x13\u0233\n\x13\f\x13\x0E\x13\u0236\v\x13\x03\x14\x03" +
		"\x14\x05\x14\u023A\n\x14\x03\x15\x03\x15\x05\x15\u023E\n\x15\x03\x16\x03" +
		"\x16\x03\x17\x03\x17\x03\x17\x02\x02\x04\x10\x16\x18\x02\x02\x04\x02\x06" +
		"\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02" +
		"\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02\x02\f\x04" +
		"\x02%\'>>\x03\x0224\x03\x0201\x03\x025:\x04\x02$$>>\x04\x0222>>\x03\x02" +
		"(.\x03\x02(+\x05\x02\x1D\x1D(+0:\x03\x02%\'\x02\u029C\x02/\x03\x02\x02" +
		"\x02\x045\x03\x02\x02\x02\x06E\x03\x02\x02\x02\bb\x03\x02\x02\x02\nd\x03" +
		"\x02\x02\x02\f\x9C\x03\x02\x02\x02\x0E\x9E\x03\x02\x02\x02\x10\xF5\x03" +
		"\x02\x02\x02\x12\u0102\x03\x02\x02\x02\x14\u0128\x03\x02\x02\x02\x16\u01C7" +
		"\x03\x02\x02\x02\x18\u020C\x03\x02\x02\x02\x1A\u021F\x03\x02\x02\x02\x1C" +
		"\u0221\x03\x02\x02\x02\x1E\u0223\x03\x02\x02\x02 \u0225\x03\x02\x02\x02" +
		"\"\u0227\x03\x02\x02\x02$\u022F\x03\x02\x02\x02&\u0239\x03\x02\x02\x02" +
		"(\u023D\x03\x02\x02\x02*\u023F\x03\x02\x02\x02,\u0241\x03\x02\x02\x02" +
		".0\x05\x04\x03\x02/.\x03\x02\x02\x0201\x03\x02\x02\x021/\x03\x02\x02\x02" +
		"12\x03\x02\x02\x0223\x03\x02\x02\x0234\x07\x02\x02\x034\x03\x03\x02\x02" +
		"\x0256\x07\x03\x02\x0267\x07>\x02\x027=\x07\x04\x02\x0289\x05\x06\x04" +
		"\x029:\x05\b\x05\x02:<\x03\x02\x02\x02;8\x03\x02\x02\x02<?\x03\x02\x02" +
		"\x02=;\x03\x02\x02\x02=>\x03\x02\x02\x02>@\x03\x02\x02\x02?=\x03\x02\x02" +
		"\x02@A\x07\x05\x02\x02A\x05\x03\x02\x02\x02BD\x07@\x02\x02CB\x03\x02\x02" +
		"\x02DG\x03\x02\x02\x02EC\x03\x02\x02\x02EF\x03\x02\x02\x02F\x07\x03\x02" +
		"\x02\x02GE\x03\x02\x02\x02HI\x07\x06\x02\x02IJ\x07>\x02\x02JK\x07\x07" +
		"\x02\x02Kc\x05\x10\t\x02LM\x07\b\x02\x02MN\x07>\x02\x02NO\x07\x07\x02" +
		"\x02Oc\x05\x10\t\x02PQ\x07\t\x02\x02QR\x05\x1C\x0F\x02RS\x07;\x02\x02" +
		"ST\x05\x16\f\x02Tc\x03\x02\x02\x02Uc\x05\n\x06\x02Vc\x05\x0E\b\x02WX\x07" +
		"\n\x02\x02Xc\x07>\x02\x02YZ\x07\n\x02\x02Z[\x07>\x02\x02[\\\x07;\x02\x02" +
		"\\c\x05\x10\t\x02]^\x07\v\x02\x02^_\x05\"\x12\x02_`\x07\f\x02\x02`a\x05" +
		" \x11\x02ac\x03\x02\x02\x02bH\x03\x02\x02\x02bL\x03\x02\x02\x02bP\x03" +
		"\x02\x02\x02bU\x03\x02\x02\x02bV\x03\x02\x02\x02bW\x03\x02\x02\x02bY\x03" +
		"\x02\x02\x02b]\x03\x02\x02\x02c\t\x03\x02\x02\x02de\x05\f\x07\x02e\x8A" +
		"\x05&\x14\x02fo\x07<\x02\x02gl\x05\x1E\x10\x02hi\x07\r\x02\x02ik\x05\x1E" +
		"\x10\x02jh\x03\x02\x02\x02kn\x03\x02\x02\x02lj\x03\x02\x02\x02lm\x03\x02" +
		"\x02\x02mp\x03\x02\x02\x02nl\x03\x02\x02\x02og\x03\x02\x02\x02op\x03\x02" +
		"\x02\x02pq\x03\x02\x02\x02qt\x07=\x02\x02rs\x07\x07\x02\x02su\x05\x10" +
		"\t\x02tr\x03\x02\x02\x02tu\x03\x02\x02\x02u\x8B\x03\x02\x02\x02vw\x07" +
		"\x07\x02\x02w\x8B\x05\x10\t\x02xy\x07<\x02\x02yz\x05\x1E\x10\x02z{\x07" +
		"\x07\x02\x02{\x83\x05\x10\t\x02|}\x07\r\x02\x02}~\x05\x1E\x10\x02~\x7F" +
		"\x07\x07\x02\x02\x7F\x80\x05\x10\t\x02\x80\x82\x03\x02\x02\x02\x81|\x03" +
		"\x02\x02\x02\x82\x85\x03\x02\x02\x02\x83\x81\x03\x02\x02\x02\x83\x84\x03" +
		"\x02\x02\x02\x84\x86\x03\x02\x02\x02\x85\x83\x03\x02\x02\x02\x86\x87\x07" +
		"=\x02\x02\x87\x88\x07\x07\x02\x02\x88\x89\x05\x10\t\x02\x89\x8B\x03\x02" +
		"\x02\x02\x8Af\x03\x02\x02\x02\x8Av\x03\x02\x02\x02\x8Ax\x03\x02\x02\x02" +
		"\x8A\x8B\x03\x02\x02\x02\x8B\x8E\x03\x02\x02\x02\x8C\x8D\x07;\x02\x02" +
		"\x8D\x8F\x05\x16\f\x02\x8E\x8C\x03\x02\x02\x02\x8E\x8F\x03\x02\x02\x02" +
		"\x8F\x91\x03\x02\x02\x02\x90\x92\x07\x0E\x02\x02\x91\x90\x03\x02\x02\x02" +
		"\x91\x92\x03\x02\x02\x02\x92\v\x03\x02\x02\x02\x93\x9D\x07\x0F\x02\x02" +
		"\x94\x9D\x07\x10\x02\x02\x95\x96\x07\x11\x02\x02\x96\x9D\x07\x0F\x02\x02" +
		"\x97\x98\x07\x11\x02\x02\x98\x9D\x07\x10\x02\x02\x99\x9D\x07\x12\x02\x02" +
		"\x9A\x9D\x07\x13\x02\x02\x9B\x9D\x07\x14\x02\x02\x9C\x93\x03\x02\x02\x02" +
		"\x9C\x94\x03\x02\x02\x02\x9C\x95\x03\x02\x02\x02\x9C\x97\x03\x02\x02\x02" +
		"\x9C\x99\x03\x02\x02\x02\x9C\x9A\x03\x02\x02\x02\x9C\x9B\x03\x02\x02\x02" +
		"\x9D\r\x03\x02\x02\x02\x9E\x9F\x07\x03\x02\x02\x9F\xA0\x07>\x02\x02\xA0" +
		"\xA1\x07;\x02\x02\xA1\xA2\x07>\x02\x02\xA2\xB4\x07<\x02\x02\xA3\xB5\x07" +
		"2\x02\x02\xA4\xA5\x07>\x02\x02\xA5\xA6\x07;\x02\x02\xA6\xAD\x05\x16\f" +
		"\x02\xA7\xA8\x07\r\x02\x02\xA8\xA9\x07>\x02\x02\xA9\xAA\x07;\x02\x02\xAA" +
		"\xAC\x05\x16\f\x02\xAB\xA7\x03\x02\x02\x02\xAC\xAF\x03\x02\x02\x02\xAD" +
		"\xAB\x03\x02\x02\x02\xAD\xAE\x03\x02\x02\x02\xAE\xB2\x03\x02\x02\x02\xAF" +
		"\xAD\x03\x02\x02\x02\xB0\xB1\x07\r\x02\x02\xB1\xB3\x072\x02\x02\xB2\xB0" +
		"\x03\x02\x02\x02\xB2\xB3\x03\x02\x02\x02\xB3\xB5\x03\x02\x02\x02\xB4\xA3" +
		"\x03\x02\x02\x02\xB4\xA4\x03\x02\x02\x02\xB5\xB6\x03\x02\x02\x02\xB6\xB7" +
		"\x07=\x02\x02\xB7\x0F\x03\x02\x02\x02\xB8\xB9\b\t\x01\x02\xB9\xC2\x07" +
		"<\x02\x02\xBA\xBF\x05\x10\t\x02\xBB\xBC\x07\r\x02\x02\xBC\xBE\x05\x10" +
		"\t\x02\xBD\xBB\x03\x02\x02\x02\xBE\xC1\x03\x02\x02\x02\xBF\xBD\x03\x02" +
		"\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC3\x03\x02\x02\x02\xC1\xBF\x03\x02" +
		"\x02\x02\xC2\xBA\x03\x02\x02\x02\xC2\xC3\x03\x02\x02\x02\xC3\xC5\x03\x02" +
		"\x02\x02\xC4\xC6\x07\r\x02\x02\xC5\xC4\x03\x02\x02\x02\xC5\xC6\x03\x02" +
		"\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\xC8\x07=\x02\x02\xC8\xC9\x07\x16" +
		"\x02\x02\xC9\xF6\x05\x10\t\r\xCA\xCB\x07,\x02\x02\xCB\xCC\x07\x17\x02" +
		"\x02\xCC\xCD\x05\x10\t\x02\xCD\xCE\x07\x18\x02\x02\xCE\xF6\x03\x02\x02" +
		"\x02\xCF\xD0\x07-\x02\x02\xD0\xD1\x07\x17\x02\x02\xD1\xD2\x05\x10\t\x02" +
		"\xD2\xD3\x07\x18\x02\x02\xD3\xF6\x03\x02\x02\x02\xD4\xD5\x07<\x02\x02" +
		"\xD5\xD6\x05\x10\t\x02\xD6\xD7\x07\r\x02\x02\xD7\xDC\x05\x10\t\x02\xD8" +
		"\xD9\x07\r\x02\x02\xD9\xDB\x05\x10\t\x02\xDA\xD8\x03\x02\x02\x02\xDB\xDE" +
		"\x03\x02\x02\x02\xDC\xDA\x03\x02\x02\x02\xDC\xDD\x03\x02\x02\x02\xDD\xE0" +
		"\x03\x02\x02\x02\xDE\xDC\x03\x02\x02\x02\xDF\xE1\x07\r\x02\x02\xE0\xDF" +
		"\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE2\x03\x02\x02\x02\xE2\xE3" +
		"\x07=\x02\x02\xE3\xF6\x03\x02\x02\x02\xE4\xE5\x07\x04\x02\x02\xE5\xE6" +
		"\x05\x14\v\x02\xE6\xE7\x07\x05\x02\x02\xE7\xF6\x03\x02\x02\x02\xE8\xEA" +
		"\x05\x12\n\x02\xE9\xE8\x03\x02\x02\x02\xEA\xEB\x03\x02\x02\x02\xEB\xE9" +
		"\x03\x02\x02\x02\xEB\xEC\x03\x02\x02\x02\xEC\xF6\x03\x02\x02\x02\xED\xF6" +
		"\x07\x19\x02\x02\xEE\xF6\x07\x1A\x02\x02\xEF\xF6\x07\x1B\x02\x02\xF0\xF6" +
		"\x07>\x02\x02\xF1\xF2\x07<\x02\x02\xF2\xF3\x05\x10\t\x02\xF3\xF4\x07=" +
		"\x02\x02\xF4\xF6\x03\x02\x02\x02\xF5\xB8\x03\x02\x02\x02\xF5\xCA\x03\x02" +
		"\x02\x02\xF5\xCF\x03\x02\x02\x02\xF5\xD4\x03\x02\x02\x02\xF5\xE4\x03\x02" +
		"\x02\x02\xF5\xE9\x03\x02\x02\x02\xF5\xED\x03\x02\x02\x02\xF5\xEE\x03\x02" +
		"\x02\x02\xF5\xEF\x03\x02\x02\x02\xF5\xF0\x03\x02\x02\x02\xF5\xF1\x03\x02" +
		"\x02\x02\xF6\xFF\x03\x02\x02\x02\xF7\xF8\f\x0F\x02\x02\xF8\xF9\x07\x15" +
		"\x02\x02\xF9\xFE\x05\x10\t\x0F\xFA\xFB\f\x0E\x02\x02\xFB\xFC\x07\x16\x02" +
		"\x02\xFC\xFE\x05\x10\t\x0E\xFD\xF7\x03\x02\x02\x02\xFD\xFA\x03\x02\x02" +
		"\x02\xFE\u0101\x03\x02\x02\x02\xFF\xFD\x03\x02\x02\x02\xFF\u0100\x03\x02" +
		"\x02\x02\u0100\x11\x03\x02\x02\x02\u0101\xFF\x03\x02\x02\x02\u0102\u0103" +
		"\x07\x1C\x02\x02\u0103\u0104\x07\x04\x02\x02\u0104\u0105\x07>\x02\x02" +
		"\u0105\u0106\x07\x07\x02\x02\u0106\u0109\x07%\x02\x02\u0107\u0108\x07" +
		"\r\x02\x02\u0108\u010A\x05\x14\v\x02\u0109\u0107\x03\x02\x02\x02\u0109" +
		"\u010A\x03\x02\x02\x02\u010A\u010C\x03\x02\x02\x02\u010B\u010D\x07\r\x02" +
		"\x02\u010C\u010B\x03\x02\x02\x02\u010C\u010D\x03\x02\x02\x02\u010D\u010E" +
		"\x03\x02\x02\x02\u010E\u010F\x07\x05\x02\x02\u010F\x13\x03\x02\x02\x02" +
		"\u0110\u0129\x03\x02\x02\x02\u0111\u0112\x07>\x02\x02\u0112\u0113\x07" +
		"\x07\x02\x02\u0113\u0114\x05\x10\t\x02\u0114\u0115\x07\r\x02\x02\u0115" +
		"\u0117\x03\x02\x02\x02\u0116\u0111\x03\x02\x02\x02\u0117\u011A\x03\x02" +
		"\x02\x02\u0118\u0116\x03\x02\x02\x02\u0118\u0119\x03\x02\x02\x02\u0119" +
		"\u0124\x03\x02\x02\x02\u011A\u0118\x03\x02\x02\x02\u011B\u011C\x07>\x02" +
		"\x02\u011C\u011D\x07\x07\x02\x02\u011D\u011E\x05\x10\t\x02\u011E\u0122" +
		"\x03\x02\x02\x02\u011F\u0123\x07\r\x02\x02\u0120\u0121\x07\x1C\x02\x02" +
		"\u0121\u0123\x07>\x02\x02\u0122\u011F\x03\x02\x02\x02\u0122\u0120\x03" +
		"\x02\x02\x02\u0122\u0123\x03\x02\x02\x02\u0123\u0125\x03\x02\x02\x02\u0124" +
		"\u011B\x03\x02\x02\x02\u0124\u0125\x03\x02\x02\x02\u0125\u0129\x03\x02" +
		"\x02\x02\u0126\u0127\x07\x1C\x02\x02\u0127\u0129\x07>\x02\x02\u0128\u0110" +
		"\x03\x02\x02\x02\u0128\u0118\x03\x02\x02\x02\u0128\u0126\x03\x02\x02\x02" +
		"\u0129\x15\x03\x02\x02\x02\u012A\u012B\b\f\x01\x02\u012B\u01C8\x05\x1A" +
		"\x0E\x02\u012C\u012D\x05&\x14\x02\u012D\u012F\x07<\x02\x02\u012E\u0130" +
		"\x05$\x13\x02\u012F\u012E\x03\x02\x02\x02\u012F\u0130\x03\x02\x02\x02" +
		"\u0130\u0131\x03\x02\x02\x02\u0131\u0132\x07=\x02\x02\u0132\u01C8\x03" +
		"\x02\x02\x02\u0133\u0134\x071\x02\x02\u0134\u01C8\x05\x16\f\x1B\u0135" +
		"\u0136\x07>\x02\x02\u0136\u0137\x07\x1E\x02\x02\u0137\u0138\x07;\x02\x02" +
		"\u0138\u01C8\x05\x16\f\x17\u0139\u013A\x07(\x02\x02\u013A\u013B\x07\x04" +
		"\x02\x02\u013B\u0140\x05\x16\f\x02\u013C\u013D\x07\r\x02\x02\u013D\u013F" +
		"\x05\x16\f\x02\u013E\u013C\x03\x02\x02\x02\u013F\u0142\x03\x02\x02\x02" +
		"\u0140\u013E\x03\x02\x02\x02\u0140\u0141\x03\x02\x02\x02\u0141\u0144\x03" +
		"\x02\x02\x02\u0142\u0140\x03\x02\x02\x02\u0143\u0145\x07\r\x02\x02\u0144" +
		"\u0143\x03\x02\x02\x02\u0144\u0145\x03\x02\x02\x02\u0145\u0146\x03\x02" +
		"\x02\x02\u0146\u0147\x07\x05\x02\x02\u0147\u01C8\x03\x02\x02\x02\u0148" +
		"\u0149\x07)\x02\x02\u0149\u014A\x07\x04\x02\x02\u014A\u014F\x05\x16\f" +
		"\x02\u014B\u014C\x07\r\x02\x02\u014C\u014E\x05\x16\f\x02\u014D\u014B\x03" +
		"\x02\x02\x02\u014E\u0151\x03\x02\x02\x02\u014F\u014D\x03\x02\x02\x02\u014F" +
		"\u0150\x03\x02\x02\x02\u0150\u0153\x03\x02\x02\x02\u0151\u014F\x03\x02" +
		"\x02\x02\u0152\u0154\x07\r\x02\x02\u0153\u0152\x03\x02\x02\x02\u0153\u0154" +
		"\x03\x02\x02\x02\u0154\u0155\x03\x02\x02\x02\u0155\u0156\x07\x05\x02\x02" +
		"\u0156\u01C8\x03\x02\x02\x02\u0157\u0158\x07\x1F\x02\x02\u0158\u0159\x07" +
		"\x04\x02\x02\u0159\u015E\x05\x16\f\x02\u015A\u015B\x07\r\x02\x02\u015B" +
		"\u015D\x05\x16\f\x02\u015C\u015A\x03\x02\x02\x02\u015D\u0160\x03\x02\x02" +
		"\x02\u015E\u015C\x03\x02\x02\x02\u015E\u015F\x03\x02\x02\x02\u015F\u0162" +
		"\x03\x02\x02\x02\u0160\u015E\x03\x02\x02\x02\u0161\u0163\x07\r\x02\x02" +
		"\u0162\u0161\x03\x02\x02\x02\u0162\u0163\x03\x02\x02\x02\u0163\u0164\x03" +
		"\x02\x02\x02\u0164\u0165\x07\x05\x02\x02\u0165\u01C8\x03\x02\x02\x02\u0166" +
		"\u0167\x07 \x02\x02\u0167\u0168\x07\x04\x02\x02\u0168\u016D\x05\x16\f" +
		"\x02\u0169\u016A\x07\r\x02\x02\u016A\u016C\x05\x16\f\x02\u016B\u0169\x03" +
		"\x02\x02\x02\u016C\u016F\x03\x02\x02\x02\u016D\u016B\x03\x02\x02\x02\u016D" +
		"\u016E\x03\x02\x02\x02\u016E\u0171\x03\x02\x02\x02\u016F\u016D\x03\x02" +
		"\x02\x02\u0170\u0172\x07\r\x02\x02\u0171\u0170\x03\x02\x02\x02\u0171\u0172" +
		"\x03\x02\x02\x02\u0172\u0173\x03\x02\x02\x02\u0173\u0174\x07\x05\x02\x02" +
		"\u0174\u01C8\x03\x02\x02\x02\u0175\u01C8\t\x02\x02\x02\u0176\u0177\x07" +
		"<\x02\x02\u0177\u0178\x05\x16\f\x02\u0178\u0179\x07\r\x02\x02\u0179\u017E" +
		"\x05\x16\f\x02\u017A\u017B\x07\r\x02\x02\u017B\u017D\x05\x16\f\x02\u017C" +
		"\u017A\x03\x02\x02\x02\u017D\u0180\x03\x02\x02\x02\u017E\u017C\x03\x02" +
		"\x02\x02\u017E\u017F\x03\x02\x02\x02\u017F\u0182\x03\x02\x02\x02\u0180" +
		"\u017E\x03\x02\x02\x02\u0181\u0183\x07\r\x02\x02\u0182\u0181\x03\x02\x02" +
		"\x02\u0182\u0183\x03\x02\x02\x02\u0183\u0184\x03\x02\x02\x02\u0184\u0185" +
		"\x07=\x02\x02\u0185\u01C8\x03\x02\x02\x02\u0186\u0187\x07\x04\x02\x02" +
		"\u0187\u0188\x07>\x02\x02\u0188\u0189\x07\x07\x02\x02\u0189\u0190\x05" +
		"\x16\f\x02\u018A\u018B\x07\r\x02\x02\u018B\u018C\x07>\x02\x02\u018C\u018D" +
		"\x07\x07\x02\x02\u018D\u018F\x05\x16\f\x02\u018E\u018A\x03\x02\x02\x02" +
		"\u018F\u0192\x03\x02\x02\x02\u0190\u018E\x03\x02\x02\x02\u0190\u0191\x03" +
		"\x02\x02\x02\u0191\u0194\x03\x02\x02\x02\u0192\u0190\x03\x02\x02\x02\u0193" +
		"\u0195\x07\r\x02\x02\u0194\u0193\x03\x02\x02\x02\u0194\u0195\x03\x02\x02" +
		"\x02\u0195\u0196\x03\x02\x02\x02\u0196\u0197\x07\x05\x02\x02\u0197\u01C8" +
		"\x03\x02\x02\x02\u0198\u01A1\x07\x17\x02\x02\u0199\u019E\x05\x16\f\x02" +
		"\u019A\u019B\x07\r\x02\x02\u019B\u019D\x05\x16\f\x02\u019C\u019A\x03\x02" +
		"\x02\x02\u019D\u01A0\x03\x02\x02\x02\u019E\u019C\x03\x02\x02\x02\u019E" +
		"\u019F\x03\x02\x02\x02\u019F\u01A2\x03\x02\x02\x02\u01A0\u019E\x03\x02" +
		"\x02\x02\u01A1\u0199\x03\x02\x02\x02\u01A1\u01A2\x03\x02\x02\x02\u01A2" +
		"\u01A4\x03\x02\x02\x02\u01A3\u01A5\x07\r\x02\x02\u01A4\u01A3\x03\x02\x02" +
		"\x02\u01A4\u01A5\x03\x02\x02\x02\u01A5\u01A6\x03\x02\x02\x02\u01A6\u01C8" +
		"\x07\x18\x02\x02\u01A7\u01A8\x07!\x02\x02\u01A8\u01A9\x07<\x02\x02\u01A9" +
		"\u01AA\x05\x16\f\x02\u01AA\u01AB\x07=\x02\x02\u01AB\u01AC\x05\x16\f\x02" +
		"\u01AC\u01AD\x07\"\x02\x02\u01AD\u01AE\x05\x16\f\x07\u01AE\u01C8\x03\x02" +
		"\x02\x02\u01AF\u01B0\x05\n\x06\x02\u01B0\u01B1\x05\x16\f\x06\u01B1\u01C8" +
		"\x03\x02\x02\x02\u01B2\u01B3\x07#\x02\x02\u01B3\u01B6\x07>\x02\x02\u01B4" +
		"\u01B5\x07\x07\x02\x02\u01B5\u01B7\x05\x10\t\x02\u01B6\u01B4\x03\x02\x02" +
		"\x02\u01B6\u01B7\x03\x02\x02\x02\u01B7\u01B8\x03\x02\x02\x02\u01B8\u01B9" +
		"\x07;\x02\x02\u01B9\u01BB\x05\x16\f\x02\u01BA\u01BC\x07\x0E\x02\x02\u01BB" +
		"\u01BA\x03\x02\x02\x02\u01BB\u01BC\x03\x02\x02\x02\u01BC\u01BD\x03\x02" +
		"\x02\x02\u01BD\u01BE\x05\x16\f\x05\u01BE\u01C8\x03\x02\x02\x02\u01BF\u01C0" +
		"\x07<\x02\x02\u01C0\u01C1\x05\x16\f\x02\u01C1\u01C2\x07=\x02\x02\u01C2" +
		"\u01C8\x03\x02\x02\x02\u01C3\u01C4\x07\x04\x02\x02\u01C4\u01C5\x05\x16" +
		"\f\x02\u01C5\u01C6\x07\x05\x02\x02\u01C6\u01C8\x03\x02\x02\x02\u01C7\u012A" +
		"\x03\x02\x02\x02\u01C7\u012C\x03\x02\x02\x02\u01C7\u0133\x03\x02\x02\x02" +
		"\u01C7\u0135\x03\x02\x02\x02\u01C7\u0139\x03\x02\x02\x02\u01C7\u0148\x03" +
		"\x02\x02\x02\u01C7\u0157\x03\x02\x02\x02\u01C7\u0166\x03\x02\x02\x02\u01C7" +
		"\u0175\x03\x02\x02\x02\u01C7\u0176\x03\x02\x02\x02\u01C7\u0186\x03\x02" +
		"\x02\x02\u01C7\u0198\x03\x02\x02\x02\u01C7\u01A7\x03\x02\x02\x02\u01C7" +
		"\u01AF\x03\x02\x02\x02\u01C7\u01B2\x03\x02\x02\x02\u01C7\u01BF\x03\x02" +
		"\x02\x02\u01C7\u01C3\x03\x02\x02\x02\u01C8\u0207\x03\x02\x02\x02\u01C9" +
		"\u01CA\f\x1C\x02\x02\u01CA\u01CB\x07\x1D\x02\x02\u01CB\u0206\x05\x16\f" +
		"\x1C\u01CC\u01CD\f\x1A\x02\x02\u01CD\u01CE\t\x03\x02\x02\u01CE\u0206\x05" +
		"\x16\f\x1B\u01CF\u01D0\f\x19\x02\x02\u01D0\u01D1\t\x04\x02\x02\u01D1\u0206" +
		"\x05\x16\f\x1A\u01D2\u01D3\f\x18\x02\x02\u01D3\u01D4\t\x05\x02\x02\u01D4" +
		"\u0206\x05\x16\f\x19\u01D5\u01D6\f\x16\x02\x02\u01D6\u01D7\x07;\x02\x02" +
		"\u01D7\u01D8\x05\x16\f\x17\u01D8\u01D9\b\f\x01\x02\u01D9\u0206\x03\x02" +
		"\x02\x02\u01DA\u01DB\f\x14\x02\x02\u01DB\u01DC\x07(\x02\x02\u01DC\u0206" +
		"\x05\x16\f\x15\u01DD\u01DE\f\x12\x02\x02\u01DE\u01DF\x07)\x02\x02\u01DF" +
		"\u0206\x05\x16\f\x13\u01E0\u01E1\f\x11\x02\x02\u01E1\u01E2\x07*\x02\x02" +
		"\u01E2\u0206\x05\x16\f\x12\u01E3\u01E4\f\x10\x02\x02\u01E4\u01E5\x07+" +
		"\x02\x02\u01E5\u0206\x05\x16\f\x11\u01E6\u01E7\f\n\x02\x02\u01E7\u01E8" +
		"\x07\x15\x02\x02\u01E8\u0206\x05\x16\f\v\u01E9\u01EA\f \x02\x02\u01EA" +
		"\u01EB\x07\f\x02\x02\u01EB\u01F1\x05(\x15\x02\u01EC\u01EE\x07<\x02\x02" +
		"\u01ED\u01EF\x05$\x13\x02\u01EE\u01ED\x03\x02\x02\x02\u01EE\u01EF\x03" +
		"\x02\x02\x02\u01EF\u01F0\x03\x02\x02\x02\u01F0\u01F2\x07=\x02\x02\u01F1" +
		"\u01EC\x03\x02\x02\x02\u01F1\u01F2\x03\x02\x02\x02\u01F2\u0206\x03\x02" +
		"\x02\x02\u01F3\u01F4\f\x1D\x02\x02\u01F4\u01F5\x07\x17\x02\x02\u01F5\u01F6" +
		"\x05\x16\f\x02\u01F6\u01F7\x07\x18\x02\x02\u01F7\u0206\x03\x02\x02\x02" +
		"\u01F8\u01F9\f\x0F\x02\x02\u01F9\u0201\x07/\x02\x02\u01FA\u01FB\x07\x1C" +
		"\x02\x02\u01FB\u01FC\x07%\x02\x02\u01FC\u01FD\x07\x07\x02\x02\u01FD\u01FE" +
		"\x05\x1E\x10\x02\u01FE\u01FF\x07\x16\x02\x02\u01FF\u0200\x05\x16\f\x02" +
		"\u0200\u0202\x03\x02\x02\x02\u0201\u01FA\x03\x02\x02\x02\u0202\u0203\x03" +
		"\x02\x02\x02\u0203\u0201\x03\x02\x02\x02\u0203\u0204\x03\x02\x02\x02\u0204" +
		"\u0206\x03\x02\x02\x02\u0205\u01C9\x03\x02\x02\x02\u0205\u01CC\x03\x02" +
		"\x02\x02\u0205\u01CF\x03\x02\x02\x02\u0205\u01D2\x03\x02\x02\x02\u0205" +
		"\u01D5\x03\x02\x02\x02\u0205\u01DA\x03\x02\x02\x02\u0205\u01DD\x03\x02" +
		"\x02\x02\u0205\u01E0\x03\x02\x02\x02\u0205\u01E3\x03\x02\x02\x02\u0205" +
		"\u01E6\x03\x02\x02\x02\u0205\u01E9\x03\x02\x02\x02\u0205\u01F3\x03\x02" +
		"\x02\x02\u0205\u01F8\x03\x02\x02\x02\u0206\u0209\x03\x02\x02\x02\u0207" +
		"\u0205\x03\x02\x02\x02\u0207\u0208\x03\x02\x02\x02\u0208\x17\x03\x02\x02" +
		"\x02\u0209\u0207\x03\x02\x02\x02\u020A\u020D\x05\b\x05\x02\u020B\u020D" +
		"\x05\x16\f\x02\u020C\u020A\x03\x02\x02\x02\u020C\u020B\x03\x02\x02\x02" +
		"\u020D\x19\x03\x02\x02\x02\u020E\u020F\x05\x1E";
	private static readonly _serializedATNSegment1: string =
		"\x10\x02\u020F\u0210\x07\x16\x02\x02\u0210\u0211\x05\x16\f\x02\u0211\u0220" +
		"\x03\x02\x02\x02\u0212\u0213\x07<\x02\x02\u0213\u0218\x05\x1E\x10\x02" +
		"\u0214\u0215\x07\r\x02\x02\u0215\u0217\x05\x1E\x10\x02\u0216\u0214\x03" +
		"\x02\x02\x02\u0217\u021A\x03\x02\x02\x02\u0218\u0216\x03\x02\x02\x02\u0218" +
		"\u0219\x03\x02\x02\x02\u0219\u021B\x03\x02\x02\x02\u021A\u0218\x03\x02" +
		"\x02\x02\u021B\u021C\x07=\x02\x02\u021C\u021D\x07\x16\x02\x02\u021D\u021E" +
		"\x05\x16\f\x02\u021E\u0220\x03\x02\x02\x02\u021F\u020E\x03\x02\x02\x02" +
		"\u021F\u0212\x03\x02\x02\x02\u0220\x1B\x03\x02\x02\x02\u0221\u0222\t\x06" +
		"\x02\x02\u0222\x1D\x03\x02\x02\x02\u0223\u0224\x05\x1C\x0F\x02\u0224\x1F" +
		"\x03\x02\x02\x02\u0225\u0226\t\x07\x02\x02\u0226!\x03\x02\x02\x02\u0227" +
		"\u022C\x07>\x02\x02\u0228\u0229\x07\f\x02\x02\u0229\u022B\x07>\x02\x02" +
		"\u022A\u0228\x03\x02\x02\x02\u022B\u022E\x03\x02\x02\x02\u022C\u022A\x03" +
		"\x02\x02\x02\u022C\u022D\x03\x02\x02\x02\u022D#\x03\x02\x02\x02\u022E" +
		"\u022C\x03\x02\x02\x02\u022F\u0234\x05\x16\f\x02\u0230\u0231\x07\r\x02" +
		"\x02\u0231\u0233\x05\x16\f\x02\u0232\u0230\x03\x02\x02\x02\u0233\u0236" +
		"\x03\x02\x02\x02\u0234\u0232\x03\x02\x02\x02\u0234\u0235\x03\x02\x02\x02" +
		"\u0235%\x03\x02\x02\x02\u0236\u0234\x03\x02\x02\x02\u0237\u023A\x07>\x02" +
		"\x02\u0238\u023A\t\b\x02\x02\u0239\u0237\x03\x02\x02\x02\u0239\u0238\x03" +
		"\x02\x02\x02\u023A\'\x03\x02\x02\x02\u023B\u023E\x07>\x02\x02\u023C\u023E" +
		"\t\t\x02\x02\u023D\u023B\x03\x02\x02\x02\u023D\u023C\x03\x02\x02\x02\u023E" +
		")\x03\x02\x02\x02\u023F\u0240\t\n\x02\x02\u0240+\x03\x02\x02\x02\u0241" +
		"\u0242\t\v\x02\x02\u0242-\x03\x02\x02\x02?1=Eblot\x83\x8A\x8E\x91\x9C" +
		"\xAD\xB2\xB4\xBF\xC2\xC5\xDC\xE0\xEB\xF5\xFD\xFF\u0109\u010C\u0118\u0122" +
		"\u0124\u0128\u012F\u0140\u0144\u014F\u0153\u015E\u0162\u016D\u0171\u017E" +
		"\u0182\u0190\u0194\u019E\u01A1\u01A4\u01B6\u01BB\u01C7\u01EE\u01F1\u0203" +
		"\u0205\u0207\u020C\u0218\u021F\u022C\u0234\u0239\u023D";
	public static readonly _serializedATN: string = Utils.join(
		[
			QuintParser._serializedATNSegment0,
			QuintParser._serializedATNSegment1,
		],
		"",
	);
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!QuintParser.__ATN) {
			QuintParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(QuintParser._serializedATN));
		}

		return QuintParser.__ATN;
	}

}

export class ModulesContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(QuintParser.EOF, 0); }
	public module(): ModuleContext[];
	public module(i: number): ModuleContext;
	public module(i?: number): ModuleContext | ModuleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ModuleContext);
		} else {
			return this.getRuleContext(i, ModuleContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_modules; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterModules) {
			listener.enterModules(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitModules) {
			listener.exitModules(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitModules) {
			return visitor.visitModules(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ModuleContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public docLines(): DocLinesContext[];
	public docLines(i: number): DocLinesContext;
	public docLines(i?: number): DocLinesContext | DocLinesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DocLinesContext);
		} else {
			return this.getRuleContext(i, DocLinesContext);
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
	public get ruleIndex(): number { return QuintParser.RULE_module; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterModule) {
			listener.enterModule(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitModule) {
			listener.exitModule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitModule) {
			return visitor.visitModule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DocLinesContext extends ParserRuleContext {
	public DOCCOMMENT(): TerminalNode[];
	public DOCCOMMENT(i: number): TerminalNode;
	public DOCCOMMENT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.DOCCOMMENT);
		} else {
			return this.getToken(QuintParser.DOCCOMMENT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_docLines; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDocLines) {
			listener.enterDocLines(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDocLines) {
			listener.exitDocLines(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDocLines) {
			return visitor.visitDocLines(this);
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
	public get ruleIndex(): number { return QuintParser.RULE_unit; }
	public copyFrom(ctx: UnitContext): void {
		super.copyFrom(ctx);
	}
}
export class ConstContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterConst) {
			listener.enterConst(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitConst) {
			listener.exitConst(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitConst) {
			return visitor.visitConst(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class VarContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterVar) {
			listener.enterVar(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitVar) {
			listener.exitVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterAssume) {
			listener.enterAssume(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAssume) {
			listener.exitAssume(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterOper) {
			listener.enterOper(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOper) {
			listener.exitOper(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitOper) {
			return visitor.visitOper(this);
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterInstance) {
			listener.enterInstance(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitInstance) {
			listener.exitInstance(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitInstance) {
			return visitor.visitInstance(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypedefContext extends UnitContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.ASGN, 0); }
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: UnitContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypedef) {
			listener.enterTypedef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypedef) {
			listener.exitTypedef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterImportDef) {
			listener.enterImportDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitImportDef) {
			listener.exitImportDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public normalCallName(): NormalCallNameContext {
		return this.getRuleContext(0, NormalCallNameContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	public parameter(): ParameterContext[];
	public parameter(i: number): ParameterContext;
	public parameter(i?: number): ParameterContext | ParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParameterContext);
		} else {
			return this.getRuleContext(i, ParameterContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_operDef; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterOperDef) {
			listener.enterOperDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOperDef) {
			listener.exitOperDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public get ruleIndex(): number { return QuintParser.RULE_qualifier; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterQualifier) {
			listener.enterQualifier(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitQualifier) {
			listener.exitQualifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitQualifier) {
			return visitor.visitQualifier(this);
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
			return this.getTokens(QuintParser.IDENTIFIER);
		} else {
			return this.getToken(QuintParser.IDENTIFIER, i);
		}
	}
	public ASGN(): TerminalNode[];
	public ASGN(i: number): TerminalNode;
	public ASGN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.ASGN);
		} else {
			return this.getToken(QuintParser.ASGN, i);
		}
	}
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
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
	public get ruleIndex(): number { return QuintParser.RULE_instanceMod; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterInstanceMod) {
			listener.enterInstanceMod(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitInstanceMod) {
			listener.exitInstanceMod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public get ruleIndex(): number { return QuintParser.RULE_type; }
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeFun) {
			listener.enterTypeFun(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeFun) {
			listener.exitTypeFun(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeOper) {
			listener.enterTypeOper(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeOper) {
			listener.exitTypeOper(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeOper) {
			return visitor.visitTypeOper(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeSetContext extends TypeContext {
	public SET(): TerminalNode { return this.getToken(QuintParser.SET, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeSet) {
			listener.enterTypeSet(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeSet) {
			listener.exitTypeSet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeSet) {
			return visitor.visitTypeSet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeListContext extends TypeContext {
	public LIST(): TerminalNode { return this.getToken(QuintParser.LIST, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeList) {
			listener.enterTypeList(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeList) {
			listener.exitTypeList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeList) {
			return visitor.visitTypeList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeTupleContext extends TypeContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeTuple) {
			listener.enterTypeTuple(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeTuple) {
			listener.exitTypeTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeTuple) {
			return visitor.visitTypeTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeRecContext extends TypeContext {
	public row(): RowContext {
		return this.getRuleContext(0, RowContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeRec) {
			listener.enterTypeRec(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeRec) {
			listener.exitTypeRec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeUnionRec) {
			listener.enterTypeUnionRec(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeUnionRec) {
			listener.exitTypeUnionRec(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeInt) {
			listener.enterTypeInt(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeInt) {
			listener.exitTypeInt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeStr) {
			listener.enterTypeStr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeStr) {
			listener.exitTypeStr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeBool) {
			listener.enterTypeBool(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeBool) {
			listener.exitTypeBool(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeBool) {
			return visitor.visitTypeBool(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeConstOrVarContext extends TypeContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeConstOrVar) {
			listener.enterTypeConstOrVar(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeConstOrVar) {
			listener.exitTypeConstOrVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeConstOrVar) {
			return visitor.visitTypeConstOrVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeParenContext extends TypeContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeParen) {
			listener.enterTypeParen(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeParen) {
			listener.exitTypeParen(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeParen) {
			return visitor.visitTypeParen(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeUnionRecOneContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public STRING(): TerminalNode { return this.getToken(QuintParser.STRING, 0); }
	public row(): RowContext | undefined {
		return this.tryGetRuleContext(0, RowContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeUnionRecOne; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeUnionRecOne) {
			listener.enterTypeUnionRecOne(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeUnionRecOne) {
			listener.exitTypeUnionRecOne(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeUnionRecOne) {
			return visitor.visitTypeUnionRecOne(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RowContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.IDENTIFIER);
		} else {
			return this.getToken(QuintParser.IDENTIFIER, i);
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
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_row; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterRow) {
			listener.enterRow(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRow) {
			listener.exitRow(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitRow) {
			return visitor.visitRow(this);
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
	public get ruleIndex(): number { return QuintParser.RULE_expr; }
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
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	public argList(): ArgListContext | undefined {
		return this.tryGetRuleContext(0, ArgListContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDotCall) {
			listener.enterDotCall(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDotCall) {
			listener.exitDotCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDotCall) {
			return visitor.visitDotCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LambdaConsContext extends ExprContext {
	public lambda(): LambdaContext {
		return this.getRuleContext(0, LambdaContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLambdaCons) {
			listener.enterLambdaCons(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLambdaCons) {
			listener.exitLambdaCons(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLambdaCons) {
			return visitor.visitLambdaCons(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperAppContext extends ExprContext {
	public normalCallName(): NormalCallNameContext {
		return this.getRuleContext(0, NormalCallNameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	public argList(): ArgListContext | undefined {
		return this.tryGetRuleContext(0, ArgListContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterOperApp) {
			listener.enterOperApp(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOperApp) {
			listener.exitOperApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitOperApp) {
			return visitor.visitOperApp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ListAppContext extends ExprContext {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterListApp) {
			listener.enterListApp(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitListApp) {
			listener.exitListApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitListApp) {
			return visitor.visitListApp(this);
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterPow) {
			listener.enterPow(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitPow) {
			listener.exitPow(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitPow) {
			return visitor.visitPow(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UminusContext extends ExprContext {
	public MINUS(): TerminalNode { return this.getToken(QuintParser.MINUS, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterUminus) {
			listener.enterUminus(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitUminus) {
			listener.exitUminus(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitUminus) {
			return visitor.visitUminus(this);
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
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(QuintParser.DIV, 0); }
	public MOD(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MOD, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterMultDiv) {
			listener.enterMultDiv(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitMultDiv) {
			listener.exitMultDiv(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MINUS, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterPlusMinus) {
			listener.enterPlusMinus(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitPlusMinus) {
			listener.exitPlusMinus(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public GT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.GT, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LT, 0); }
	public GE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.GE, 0); }
	public LE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LE, 0); }
	public NE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.NE, 0); }
	public EQ(): TerminalNode | undefined { return this.tryGetToken(QuintParser.EQ, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterRelations) {
			listener.enterRelations(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRelations) {
			listener.exitRelations(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitRelations) {
			return visitor.visitRelations(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AsgnContext extends ExprContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterAsgn) {
			listener.enterAsgn(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAsgn) {
			listener.exitAsgn(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitAsgn) {
			return visitor.visitAsgn(this);
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
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterErrorEq) {
			listener.enterErrorEq(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitErrorEq) {
			listener.exitErrorEq(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitErrorEq) {
			return visitor.visitErrorEq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AndExprContext extends ExprContext {
	public AND(): TerminalNode { return this.getToken(QuintParser.AND, 0); }
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterAndExpr) {
			listener.enterAndExpr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAndExpr) {
			listener.exitAndExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitAndExpr) {
			return visitor.visitAndExpr(this);
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
	public AND(): TerminalNode { return this.getToken(QuintParser.AND, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterAnd) {
			listener.enterAnd(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAnd) {
			listener.exitAnd(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitAnd) {
			return visitor.visitAnd(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OrExprContext extends ExprContext {
	public OR(): TerminalNode { return this.getToken(QuintParser.OR, 0); }
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterOrExpr) {
			listener.enterOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOrExpr) {
			listener.exitOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitOrExpr) {
			return visitor.visitOrExpr(this);
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
	public OR(): TerminalNode { return this.getToken(QuintParser.OR, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterOr) {
			listener.enterOr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOr) {
			listener.exitOr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public IFF(): TerminalNode { return this.getToken(QuintParser.IFF, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterIff) {
			listener.enterIff(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitIff) {
			listener.exitIff(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public IMPLIES(): TerminalNode { return this.getToken(QuintParser.IMPLIES, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterImplies) {
			listener.enterImplies(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitImplies) {
			listener.exitImplies(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public MATCH(): TerminalNode { return this.getToken(QuintParser.MATCH, 0); }
	public STRING(): TerminalNode[];
	public STRING(i: number): TerminalNode;
	public STRING(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.STRING);
		} else {
			return this.getToken(QuintParser.STRING, i);
		}
	}
	public parameter(): ParameterContext[];
	public parameter(i: number): ParameterContext;
	public parameter(i?: number): ParameterContext | ParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParameterContext);
		} else {
			return this.getRuleContext(i, ParameterContext);
		}
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterMatch) {
			listener.enterMatch(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitMatch) {
			listener.exitMatch(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitMatch) {
			return visitor.visitMatch(this);
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterActionAll) {
			listener.enterActionAll(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitActionAll) {
			listener.exitActionAll(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterActionAny) {
			listener.enterActionAny(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitActionAny) {
			listener.exitActionAny(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitActionAny) {
			return visitor.visitActionAny(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LiteralOrIdContext extends ExprContext {
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IDENTIFIER, 0); }
	public INT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.INT, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.BOOL, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(QuintParser.STRING, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLiteralOrId) {
			listener.enterLiteralOrId(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLiteralOrId) {
			listener.exitLiteralOrId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLiteralOrId) {
			return visitor.visitLiteralOrId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTuple) {
			listener.enterTuple(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTuple) {
			listener.exitTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTuple) {
			return visitor.visitTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PairContext extends ExprContext {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterPair) {
			listener.enterPair(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitPair) {
			listener.exitPair(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitPair) {
			return visitor.visitPair(this);
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
			return this.getTokens(QuintParser.IDENTIFIER);
		} else {
			return this.getToken(QuintParser.IDENTIFIER, i);
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterRecord) {
			listener.enterRecord(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRecord) {
			listener.exitRecord(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterList) {
			listener.enterList(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitList) {
			listener.exitList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitList) {
			return visitor.visitList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfElseContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterIfElse) {
			listener.enterIfElse(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitIfElse) {
			listener.exitIfElse(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterLetIn) {
			listener.enterLetIn(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLetIn) {
			listener.exitLetIn(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLetIn) {
			return visitor.visitLetIn(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NondetContext extends ExprContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterNondet) {
			listener.enterNondet(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitNondet) {
			listener.exitNondet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitNondet) {
			return visitor.visitNondet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterParen) {
			listener.enterParen(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitParen) {
			listener.exitParen(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public enterRule(listener: QuintListener): void {
		if (listener.enterBraces) {
			listener.enterBraces(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitBraces) {
			listener.exitBraces(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
	public get ruleIndex(): number { return QuintParser.RULE_unitOrExpr; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterUnitOrExpr) {
			listener.enterUnitOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitUnitOrExpr) {
			listener.exitUnitOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitUnitOrExpr) {
			return visitor.visitUnitOrExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaContext extends ParserRuleContext {
	public parameter(): ParameterContext[];
	public parameter(i: number): ParameterContext;
	public parameter(i?: number): ParameterContext | ParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParameterContext);
		} else {
			return this.getRuleContext(i, ParameterContext);
		}
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_lambda; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLambda) {
			listener.enterLambda(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLambda) {
			listener.exitLambda(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLambda) {
			return visitor.visitLambda(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentOrHoleContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_identOrHole; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterIdentOrHole) {
			listener.enterIdentOrHole(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitIdentOrHole) {
			listener.exitIdentOrHole(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitIdentOrHole) {
			return visitor.visitIdentOrHole(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterContext extends ParserRuleContext {
	public identOrHole(): IdentOrHoleContext {
		return this.getRuleContext(0, IdentOrHoleContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_parameter; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterParameter) {
			listener.enterParameter(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitParameter) {
			listener.exitParameter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitParameter) {
			return visitor.visitParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentOrStarContext extends ParserRuleContext {
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_identOrStar; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterIdentOrStar) {
			listener.enterIdentOrStar(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitIdentOrStar) {
			listener.exitIdentOrStar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
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
			return this.getTokens(QuintParser.IDENTIFIER);
		} else {
			return this.getToken(QuintParser.IDENTIFIER, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_path; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterPath) {
			listener.enterPath(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitPath) {
			listener.exitPath(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitPath) {
			return visitor.visitPath(this);
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
	public get ruleIndex(): number { return QuintParser.RULE_argList; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterArgList) {
			listener.enterArgList(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitArgList) {
			listener.exitArgList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitArgList) {
			return visitor.visitArgList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalCallNameContext extends ParserRuleContext {
	public _op!: Token;
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IDENTIFIER, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	public SET(): TerminalNode | undefined { return this.tryGetToken(QuintParser.SET, 0); }
	public LIST(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LIST, 0); }
	public MAP(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MAP, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_normalCallName; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterNormalCallName) {
			listener.enterNormalCallName(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitNormalCallName) {
			listener.exitNormalCallName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitNormalCallName) {
			return visitor.visitNormalCallName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameAfterDotContext extends ParserRuleContext {
	public _op!: Token;
	public IDENTIFIER(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IDENTIFIER, 0); }
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_nameAfterDot; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterNameAfterDot) {
			listener.enterNameAfterDot(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitNameAfterDot) {
			listener.exitNameAfterDot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitNameAfterDot) {
			return visitor.visitNameAfterDot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperatorContext extends ParserRuleContext {
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	public GT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.GT, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LT, 0); }
	public GE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.GE, 0); }
	public LE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LE, 0); }
	public NE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.NE, 0); }
	public EQ(): TerminalNode | undefined { return this.tryGetToken(QuintParser.EQ, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(QuintParser.DIV, 0); }
	public MOD(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MOD, 0); }
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MINUS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_operator; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterOperator) {
			listener.enterOperator(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitOperator) {
			listener.exitOperator(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitOperator) {
			return visitor.visitOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	public STRING(): TerminalNode | undefined { return this.tryGetToken(QuintParser.STRING, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.BOOL, 0); }
	public INT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.INT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_literal; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLiteral) {
			listener.enterLiteral(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLiteral) {
			listener.exitLiteral(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLiteral) {
			return visitor.visitLiteral(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


