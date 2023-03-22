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
	public static readonly T__34 = 35;
	public static readonly STRING = 36;
	public static readonly BOOL = 37;
	public static readonly INT = 38;
	public static readonly AND = 39;
	public static readonly OR = 40;
	public static readonly IFF = 41;
	public static readonly IMPLIES = 42;
	public static readonly SET = 43;
	public static readonly LIST = 44;
	public static readonly MAP = 45;
	public static readonly MATCH = 46;
	public static readonly PLUS = 47;
	public static readonly MINUS = 48;
	public static readonly MUL = 49;
	public static readonly DIV = 50;
	public static readonly MOD = 51;
	public static readonly GT = 52;
	public static readonly LT = 53;
	public static readonly GE = 54;
	public static readonly LE = 55;
	public static readonly NE = 56;
	public static readonly EQ = 57;
	public static readonly ASGN = 58;
	public static readonly LPAREN = 59;
	public static readonly RPAREN = 60;
	public static readonly IDENTIFIER = 61;
	public static readonly SIMPLE_IDENTIFIER = 62;
	public static readonly DOCCOMMENT = 63;
	public static readonly LINE_COMMENT = 64;
	public static readonly COMMENT = 65;
	public static readonly WS = 66;
	public static readonly RULE_modules = 0;
	public static readonly RULE_module = 1;
	public static readonly RULE_docLines = 2;
	public static readonly RULE_unit = 3;
	public static readonly RULE_operDef = 4;
	public static readonly RULE_qualifier = 5;
	public static readonly RULE_instanceMod = 6;
	public static readonly RULE_moduleName = 7;
	public static readonly RULE_name = 8;
	public static readonly RULE_qualifiedName = 9;
	public static readonly RULE_type = 10;
	public static readonly RULE_typeUnionRecOne = 11;
	public static readonly RULE_row = 12;
	public static readonly RULE_expr = 13;
	public static readonly RULE_unitOrExpr = 14;
	public static readonly RULE_lambda = 15;
	public static readonly RULE_identOrHole = 16;
	public static readonly RULE_parameter = 17;
	public static readonly RULE_identOrStar = 18;
	public static readonly RULE_path = 19;
	public static readonly RULE_argList = 20;
	public static readonly RULE_normalCallName = 21;
	public static readonly RULE_nameAfterDot = 22;
	public static readonly RULE_operator = 23;
	public static readonly RULE_literal = 24;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "docLines", "unit", "operDef", "qualifier", "instanceMod", 
		"moduleName", "name", "qualifiedName", "type", "typeUnionRecOne", "row", 
		"expr", "unitOrExpr", "lambda", "identOrHole", "parameter", "identOrStar", 
		"path", "argList", "normalCallName", "nameAfterDot", "operator", "literal",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"'type'", "'import'", "'.'", "'as'", "','", "';'", "'val'", "'def'", "'pure'", 
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
		undefined, "STRING", "BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", "SET", 
		"LIST", "MAP", "MATCH", "PLUS", "MINUS", "MUL", "DIV", "MOD", "GT", "LT", 
		"GE", "LE", "NE", "EQ", "ASGN", "LPAREN", "RPAREN", "IDENTIFIER", "SIMPLE_IDENTIFIER", 
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
			this.state = 51;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 50;
				this.module();
				}
				}
				this.state = 53;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0);
			this.state = 55;
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
			this.state = 57;
			this.match(QuintParser.T__0);
			this.state = 58;
			this.match(QuintParser.IDENTIFIER);
			this.state = 59;
			this.match(QuintParser.T__1);
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__7) | (1 << QuintParser.T__8) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18))) !== 0) || _la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 60;
				this.docLines();
				this.state = 61;
				this.unit();
				}
				}
				this.state = 67;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 68;
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
			this.state = 73;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 70;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 75;
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
		let _la: number;
		try {
			this.state = 105;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 76;
				this.match(QuintParser.T__3);
				this.state = 77;
				this.match(QuintParser.IDENTIFIER);
				this.state = 78;
				this.match(QuintParser.T__4);
				this.state = 79;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 80;
				this.match(QuintParser.T__5);
				this.state = 81;
				this.match(QuintParser.IDENTIFIER);
				this.state = 82;
				this.match(QuintParser.T__4);
				this.state = 83;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 84;
				this.match(QuintParser.T__6);
				this.state = 85;
				this.identOrHole();
				this.state = 86;
				this.match(QuintParser.ASGN);
				this.state = 87;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 89;
				this.operDef();
				}
				break;

			case 5:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 90;
				this.instanceMod();
				}
				break;

			case 6:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 91;
				this.match(QuintParser.T__7);
				this.state = 92;
				this.match(QuintParser.IDENTIFIER);
				}
				break;

			case 7:
				_localctx = new TypedefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 93;
				this.match(QuintParser.T__7);
				this.state = 94;
				this.match(QuintParser.IDENTIFIER);
				this.state = 95;
				this.match(QuintParser.ASGN);
				this.state = 96;
				this.type(0);
				}
				break;

			case 8:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 97;
				this.match(QuintParser.T__8);
				this.state = 98;
				this.path();
				this.state = 99;
				this.match(QuintParser.T__9);
				this.state = 100;
				this.identOrStar();
				this.state = 103;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__10) {
					{
					this.state = 101;
					this.match(QuintParser.T__10);
					this.state = 102;
					this.name();
					}
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
	// @RuleVersion(0)
	public operDef(): OperDefContext {
		let _localctx: OperDefContext = new OperDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, QuintParser.RULE_operDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 107;
			this.qualifier();
			this.state = 108;
			this.normalCallName();
			this.state = 145;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				{
				this.state = 109;
				this.match(QuintParser.LPAREN);
				this.state = 118;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__34 || _la === QuintParser.IDENTIFIER) {
					{
					this.state = 110;
					this.parameter();
					this.state = 115;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === QuintParser.T__11) {
						{
						{
						this.state = 111;
						this.match(QuintParser.T__11);
						this.state = 112;
						this.parameter();
						}
						}
						this.state = 117;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 120;
				this.match(QuintParser.RPAREN);
				this.state = 123;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 121;
					this.match(QuintParser.T__4);
					this.state = 122;
					this.type(0);
					}
				}

				}
				break;

			case 2:
				{
				this.state = 125;
				this.match(QuintParser.T__4);
				this.state = 126;
				this.type(0);
				}
				break;

			case 3:
				{
				this.state = 127;
				this.match(QuintParser.LPAREN);
				{
				this.state = 128;
				this.parameter();
				this.state = 129;
				this.match(QuintParser.T__4);
				this.state = 130;
				this.type(0);
				this.state = 138;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__11) {
					{
					{
					this.state = 131;
					this.match(QuintParser.T__11);
					this.state = 132;
					this.parameter();
					this.state = 133;
					this.match(QuintParser.T__4);
					this.state = 134;
					this.type(0);
					}
					}
					this.state = 140;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 141;
				this.match(QuintParser.RPAREN);
				this.state = 142;
				this.match(QuintParser.T__4);
				this.state = 143;
				this.type(0);
				}
				break;
			}
			this.state = 149;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.ASGN) {
				{
				this.state = 147;
				this.match(QuintParser.ASGN);
				this.state = 148;
				this.expr(0);
				}
			}

			this.state = 152;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 151;
				this.match(QuintParser.T__12);
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
			this.state = 163;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 154;
				this.match(QuintParser.T__13);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 155;
				this.match(QuintParser.T__14);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 156;
				this.match(QuintParser.T__15);
				this.state = 157;
				this.match(QuintParser.T__13);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 158;
				this.match(QuintParser.T__15);
				this.state = 159;
				this.match(QuintParser.T__14);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 160;
				this.match(QuintParser.T__16);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 161;
				this.match(QuintParser.T__17);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 162;
				this.match(QuintParser.T__18);
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
			this.state = 205;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 165;
				this.match(QuintParser.T__8);
				this.state = 166;
				this.moduleName();
				this.state = 167;
				this.match(QuintParser.LPAREN);
				{
				this.state = 168;
				this.name();
				this.state = 169;
				this.match(QuintParser.ASGN);
				this.state = 170;
				this.expr(0);
				this.state = 178;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__11) {
					{
					{
					this.state = 171;
					this.match(QuintParser.T__11);
					this.state = 172;
					this.name();
					this.state = 173;
					this.match(QuintParser.ASGN);
					this.state = 174;
					this.expr(0);
					}
					}
					this.state = 180;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 181;
				this.match(QuintParser.RPAREN);
				this.state = 182;
				this.match(QuintParser.T__9);
				this.state = 183;
				this.match(QuintParser.MUL);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 185;
				this.match(QuintParser.T__8);
				this.state = 186;
				this.moduleName();
				this.state = 187;
				this.match(QuintParser.LPAREN);
				{
				this.state = 188;
				this.name();
				this.state = 189;
				this.match(QuintParser.ASGN);
				this.state = 190;
				this.expr(0);
				this.state = 198;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__11) {
					{
					{
					this.state = 191;
					this.match(QuintParser.T__11);
					this.state = 192;
					this.name();
					this.state = 193;
					this.match(QuintParser.ASGN);
					this.state = 194;
					this.expr(0);
					}
					}
					this.state = 200;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 201;
				this.match(QuintParser.RPAREN);
				this.state = 202;
				this.match(QuintParser.T__10);
				this.state = 203;
				this.qualifiedName();
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
	public moduleName(): ModuleNameContext {
		let _localctx: ModuleNameContext = new ModuleNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, QuintParser.RULE_moduleName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 207;
			this.match(QuintParser.IDENTIFIER);
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
	public name(): NameContext {
		let _localctx: NameContext = new NameContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, QuintParser.RULE_name);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 209;
			this.match(QuintParser.IDENTIFIER);
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
	public qualifiedName(): QualifiedNameContext {
		let _localctx: QualifiedNameContext = new QualifiedNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, QuintParser.RULE_qualifiedName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 211;
			this.match(QuintParser.IDENTIFIER);
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
		let _startState: number = 20;
		this.enterRecursionRule(_localctx, 20, QuintParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 274;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 214;
				this.match(QuintParser.LPAREN);
				this.state = 223;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__23) | (1 << QuintParser.T__24) | (1 << QuintParser.T__25) | (1 << QuintParser.T__26))) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (QuintParser.SET - 43)) | (1 << (QuintParser.LIST - 43)) | (1 << (QuintParser.LPAREN - 43)) | (1 << (QuintParser.IDENTIFIER - 43)))) !== 0)) {
					{
					this.state = 215;
					this.type(0);
					this.state = 220;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 16, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 216;
							this.match(QuintParser.T__11);
							this.state = 217;
							this.type(0);
							}
							}
						}
						this.state = 222;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 16, this._ctx);
					}
					}
				}

				this.state = 226;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 225;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 228;
				this.match(QuintParser.RPAREN);
				this.state = 229;
				this.match(QuintParser.T__20);
				this.state = 230;
				this.type(11);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 231;
				this.match(QuintParser.SET);
				this.state = 232;
				this.match(QuintParser.T__21);
				this.state = 233;
				this.type(0);
				this.state = 234;
				this.match(QuintParser.T__22);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 236;
				this.match(QuintParser.LIST);
				this.state = 237;
				this.match(QuintParser.T__21);
				this.state = 238;
				this.type(0);
				this.state = 239;
				this.match(QuintParser.T__22);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 241;
				this.match(QuintParser.LPAREN);
				this.state = 242;
				this.type(0);
				this.state = 243;
				this.match(QuintParser.T__11);
				this.state = 244;
				this.type(0);
				this.state = 249;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 19, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 245;
						this.match(QuintParser.T__11);
						this.state = 246;
						this.type(0);
						}
						}
					}
					this.state = 251;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 19, this._ctx);
				}
				this.state = 253;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 252;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 255;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 257;
				this.match(QuintParser.T__1);
				this.state = 258;
				this.row();
				this.state = 259;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeUnionRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 262;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 261;
						this.typeUnionRecOne();
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 264;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 21, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 266;
				this.match(QuintParser.T__23);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 267;
				this.match(QuintParser.T__24);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 268;
				this.match(QuintParser.T__25);
				}
				break;

			case 10:
				{
				_localctx = new TypeConstOrVarContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 269;
				this.match(QuintParser.IDENTIFIER);
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 270;
				this.match(QuintParser.LPAREN);
				this.state = 271;
				this.type(0);
				this.state = 272;
				this.match(QuintParser.RPAREN);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 284;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 282;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 276;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 277;
						this.match(QuintParser.T__19);
						this.state = 278;
						this.type(13);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 279;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 280;
						this.match(QuintParser.T__20);
						this.state = 281;
						this.type(12);
						}
						break;
					}
					}
				}
				this.state = 286;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 24, this._ctx);
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
		this.enterRule(_localctx, 22, QuintParser.RULE_typeUnionRecOne);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 287;
			this.match(QuintParser.T__26);
			this.state = 288;
			this.match(QuintParser.T__1);
			this.state = 289;
			this.match(QuintParser.IDENTIFIER);
			this.state = 290;
			this.match(QuintParser.T__4);
			this.state = 291;
			this.match(QuintParser.STRING);
			this.state = 294;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 25, this._ctx) ) {
			case 1:
				{
				this.state = 292;
				this.match(QuintParser.T__11);
				this.state = 293;
				this.row();
				}
				break;
			}
			this.state = 297;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__11) {
				{
				this.state = 296;
				this.match(QuintParser.T__11);
				}
			}

			this.state = 299;
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
		this.enterRule(_localctx, 24, QuintParser.RULE_row);
		let _la: number;
		try {
			let _alt: number;
			this.state = 325;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 309;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 27, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 302;
						this.match(QuintParser.IDENTIFIER);
						this.state = 303;
						this.match(QuintParser.T__4);
						this.state = 304;
						this.type(0);
						this.state = 305;
						this.match(QuintParser.T__11);
						}
						}
					}
					this.state = 311;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 27, this._ctx);
				}
				this.state = 321;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.IDENTIFIER) {
					{
					{
					this.state = 312;
					this.match(QuintParser.IDENTIFIER);
					this.state = 313;
					this.match(QuintParser.T__4);
					this.state = 314;
					this.type(0);
					}
					this.state = 319;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 28, this._ctx) ) {
					case 1:
						{
						this.state = 316;
						this.match(QuintParser.T__11);
						}
						break;

					case 2:
						{
						this.state = 317;
						this.match(QuintParser.T__26);
						{
						this.state = 318;
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
				this.state = 323;
				this.match(QuintParser.T__26);
				{
				this.state = 324;
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
		let _startState: number = 26;
		this.enterRecursionRule(_localctx, 26, QuintParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 484;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 328;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 329;
				this.normalCallName();
				this.state = 330;
				this.match(QuintParser.LPAREN);
				this.state = 332;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__21) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (QuintParser.T__31 - 32)) | (1 << (QuintParser.T__33 - 32)) | (1 << (QuintParser.T__34 - 32)) | (1 << (QuintParser.STRING - 32)) | (1 << (QuintParser.BOOL - 32)) | (1 << (QuintParser.INT - 32)) | (1 << (QuintParser.AND - 32)) | (1 << (QuintParser.OR - 32)) | (1 << (QuintParser.IFF - 32)) | (1 << (QuintParser.IMPLIES - 32)) | (1 << (QuintParser.SET - 32)) | (1 << (QuintParser.LIST - 32)) | (1 << (QuintParser.MAP - 32)) | (1 << (QuintParser.MINUS - 32)) | (1 << (QuintParser.LPAREN - 32)) | (1 << (QuintParser.IDENTIFIER - 32)))) !== 0)) {
					{
					this.state = 331;
					this.argList();
					}
				}

				this.state = 334;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 336;
				this.match(QuintParser.MINUS);
				this.state = 337;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 338;
				this.match(QuintParser.IDENTIFIER);
				this.state = 339;
				this.match(QuintParser.T__28);
				this.state = 340;
				this.match(QuintParser.ASGN);
				this.state = 341;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 342;
				this.match(QuintParser.AND);
				this.state = 343;
				this.match(QuintParser.T__1);
				this.state = 344;
				this.expr(0);
				this.state = 349;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 345;
						this.match(QuintParser.T__11);
						this.state = 346;
						this.expr(0);
						}
						}
					}
					this.state = 351;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
				}
				this.state = 353;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 352;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 355;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 357;
				this.match(QuintParser.OR);
				this.state = 358;
				this.match(QuintParser.T__1);
				this.state = 359;
				this.expr(0);
				this.state = 364;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 34, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 360;
						this.match(QuintParser.T__11);
						this.state = 361;
						this.expr(0);
						}
						}
					}
					this.state = 366;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 34, this._ctx);
				}
				this.state = 368;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 367;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 370;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 372;
				this.match(QuintParser.T__29);
				this.state = 373;
				this.match(QuintParser.T__1);
				this.state = 374;
				this.expr(0);
				this.state = 379;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 375;
						this.match(QuintParser.T__11);
						this.state = 376;
						this.expr(0);
						}
						}
					}
					this.state = 381;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
				}
				this.state = 383;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 382;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 385;
				this.match(QuintParser.T__2);
				}
				break;

			case 8:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 387;
				this.match(QuintParser.T__30);
				this.state = 388;
				this.match(QuintParser.T__1);
				this.state = 389;
				this.expr(0);
				this.state = 394;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 390;
						this.match(QuintParser.T__11);
						this.state = 391;
						this.expr(0);
						}
						}
					}
					this.state = 396;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
				}
				this.state = 398;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 397;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 400;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 402;
				_la = this._input.LA(1);
				if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.IDENTIFIER - 36)))) !== 0))) {
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
				this.state = 403;
				this.match(QuintParser.LPAREN);
				this.state = 404;
				this.expr(0);
				this.state = 405;
				this.match(QuintParser.T__11);
				this.state = 406;
				this.expr(0);
				this.state = 411;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 407;
						this.match(QuintParser.T__11);
						this.state = 408;
						this.expr(0);
						}
						}
					}
					this.state = 413;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
				}
				this.state = 415;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 414;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 417;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 11:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 419;
				this.match(QuintParser.T__1);
				this.state = 420;
				this.match(QuintParser.IDENTIFIER);
				this.state = 421;
				this.match(QuintParser.T__4);
				this.state = 422;
				this.expr(0);
				this.state = 429;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 42, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 423;
						this.match(QuintParser.T__11);
						this.state = 424;
						this.match(QuintParser.IDENTIFIER);
						this.state = 425;
						this.match(QuintParser.T__4);
						this.state = 426;
						this.expr(0);
						}
						}
					}
					this.state = 431;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 42, this._ctx);
				}
				this.state = 433;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 432;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 435;
				this.match(QuintParser.T__2);
				}
				break;

			case 12:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 437;
				this.match(QuintParser.T__21);
				this.state = 446;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__21) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (QuintParser.T__31 - 32)) | (1 << (QuintParser.T__33 - 32)) | (1 << (QuintParser.T__34 - 32)) | (1 << (QuintParser.STRING - 32)) | (1 << (QuintParser.BOOL - 32)) | (1 << (QuintParser.INT - 32)) | (1 << (QuintParser.AND - 32)) | (1 << (QuintParser.OR - 32)) | (1 << (QuintParser.IFF - 32)) | (1 << (QuintParser.IMPLIES - 32)) | (1 << (QuintParser.SET - 32)) | (1 << (QuintParser.LIST - 32)) | (1 << (QuintParser.MAP - 32)) | (1 << (QuintParser.MINUS - 32)) | (1 << (QuintParser.LPAREN - 32)) | (1 << (QuintParser.IDENTIFIER - 32)))) !== 0)) {
					{
					this.state = 438;
					this.expr(0);
					this.state = 443;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 44, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 439;
							this.match(QuintParser.T__11);
							this.state = 440;
							this.expr(0);
							}
							}
						}
						this.state = 445;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 44, this._ctx);
					}
					}
				}

				this.state = 449;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__11) {
					{
					this.state = 448;
					this.match(QuintParser.T__11);
					}
				}

				this.state = 451;
				this.match(QuintParser.T__22);
				}
				break;

			case 13:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 452;
				this.match(QuintParser.T__31);
				this.state = 453;
				this.match(QuintParser.LPAREN);
				this.state = 454;
				this.expr(0);
				this.state = 455;
				this.match(QuintParser.RPAREN);
				this.state = 456;
				this.expr(0);
				this.state = 457;
				this.match(QuintParser.T__32);
				this.state = 458;
				this.expr(5);
				}
				break;

			case 14:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 460;
				this.operDef();
				this.state = 461;
				this.expr(4);
				}
				break;

			case 15:
				{
				_localctx = new NondetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 463;
				this.match(QuintParser.T__33);
				this.state = 464;
				this.match(QuintParser.IDENTIFIER);
				this.state = 467;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 465;
					this.match(QuintParser.T__4);
					this.state = 466;
					this.type(0);
					}
				}

				this.state = 469;
				this.match(QuintParser.ASGN);
				this.state = 470;
				this.expr(0);
				this.state = 472;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__12) {
					{
					this.state = 471;
					this.match(QuintParser.T__12);
					}
				}

				this.state = 474;
				this.expr(3);
				}
				break;

			case 16:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 476;
				this.match(QuintParser.LPAREN);
				this.state = 477;
				this.expr(0);
				this.state = 478;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 17:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 480;
				this.match(QuintParser.T__1);
				this.state = 481;
				this.expr(0);
				this.state = 482;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 548;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 54, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 546;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 53, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 486;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 487;
						(_localctx as PowContext)._op = this.match(QuintParser.T__27);
						this.state = 488;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 489;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 490;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & ((1 << (QuintParser.MUL - 49)) | (1 << (QuintParser.DIV - 49)) | (1 << (QuintParser.MOD - 49)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 491;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 492;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 493;
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
						this.state = 494;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 495;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 496;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 52)) & ~0x1F) === 0 && ((1 << (_la - 52)) & ((1 << (QuintParser.GT - 52)) | (1 << (QuintParser.LT - 52)) | (1 << (QuintParser.GE - 52)) | (1 << (QuintParser.LE - 52)) | (1 << (QuintParser.NE - 52)) | (1 << (QuintParser.EQ - 52)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 497;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 498;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 499;
						this.match(QuintParser.ASGN);
						this.state = 500;
						this.expr(21);

						                            const m = "QNT006: unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 503;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 504;
						this.match(QuintParser.AND);
						this.state = 505;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 506;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 507;
						this.match(QuintParser.OR);
						this.state = 508;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 509;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 510;
						this.match(QuintParser.IFF);
						this.state = 511;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 512;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 513;
						this.match(QuintParser.IMPLIES);
						this.state = 514;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 515;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 516;
						this.match(QuintParser.T__19);
						this.state = 517;
						this.expr(9);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 518;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 519;
						this.match(QuintParser.T__9);
						this.state = 520;
						this.nameAfterDot();
						this.state = 526;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 51, this._ctx) ) {
						case 1:
							{
							this.state = 521;
							this.match(QuintParser.LPAREN);
							this.state = 523;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__21) | (1 << QuintParser.T__29) | (1 << QuintParser.T__30))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (QuintParser.T__31 - 32)) | (1 << (QuintParser.T__33 - 32)) | (1 << (QuintParser.T__34 - 32)) | (1 << (QuintParser.STRING - 32)) | (1 << (QuintParser.BOOL - 32)) | (1 << (QuintParser.INT - 32)) | (1 << (QuintParser.AND - 32)) | (1 << (QuintParser.OR - 32)) | (1 << (QuintParser.IFF - 32)) | (1 << (QuintParser.IMPLIES - 32)) | (1 << (QuintParser.SET - 32)) | (1 << (QuintParser.LIST - 32)) | (1 << (QuintParser.MAP - 32)) | (1 << (QuintParser.MINUS - 32)) | (1 << (QuintParser.LPAREN - 32)) | (1 << (QuintParser.IDENTIFIER - 32)))) !== 0)) {
								{
								this.state = 522;
								this.argList();
								}
							}

							this.state = 525;
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
						this.state = 528;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 529;
						this.match(QuintParser.T__21);
						this.state = 530;
						this.expr(0);
						this.state = 531;
						this.match(QuintParser.T__22);
						}
						break;

					case 13:
						{
						_localctx = new MatchContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 533;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 534;
						this.match(QuintParser.MATCH);
						this.state = 542;
						this._errHandler.sync(this);
						_alt = 1;
						do {
							switch (_alt) {
							case 1:
								{
								{
								this.state = 535;
								this.match(QuintParser.T__26);
								this.state = 536;
								this.match(QuintParser.STRING);
								this.state = 537;
								this.match(QuintParser.T__4);
								this.state = 538;
								this.parameter();
								this.state = 539;
								this.match(QuintParser.T__20);
								this.state = 540;
								this.expr(0);
								}
								}
								break;
							default:
								throw new NoViableAltException(this);
							}
							this.state = 544;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
						} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
						}
						break;
					}
					}
				}
				this.state = 550;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 54, this._ctx);
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
		this.enterRule(_localctx, 28, QuintParser.RULE_unitOrExpr);
		try {
			this.state = 553;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 55, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 551;
				this.unit();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 552;
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
		this.enterRule(_localctx, 30, QuintParser.RULE_lambda);
		let _la: number;
		try {
			this.state = 572;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__34:
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 555;
				this.parameter();
				this.state = 556;
				this.match(QuintParser.T__20);
				this.state = 557;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 559;
				this.match(QuintParser.LPAREN);
				this.state = 560;
				this.parameter();
				this.state = 565;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__11) {
					{
					{
					this.state = 561;
					this.match(QuintParser.T__11);
					this.state = 562;
					this.parameter();
					}
					}
					this.state = 567;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 568;
				this.match(QuintParser.RPAREN);
				this.state = 569;
				this.match(QuintParser.T__20);
				this.state = 570;
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
		this.enterRule(_localctx, 32, QuintParser.RULE_identOrHole);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 574;
			_la = this._input.LA(1);
			if (!(_la === QuintParser.T__34 || _la === QuintParser.IDENTIFIER)) {
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
		this.enterRule(_localctx, 34, QuintParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 576;
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
		this.enterRule(_localctx, 36, QuintParser.RULE_identOrStar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 578;
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
		this.enterRule(_localctx, 38, QuintParser.RULE_path);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 580;
			this.match(QuintParser.IDENTIFIER);
			this.state = 585;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 581;
					this.match(QuintParser.T__9);
					this.state = 582;
					this.match(QuintParser.IDENTIFIER);
					}
					}
				}
				this.state = 587;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
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
		this.enterRule(_localctx, 40, QuintParser.RULE_argList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 588;
			this.expr(0);
			this.state = 593;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__11) {
				{
				{
				this.state = 589;
				this.match(QuintParser.T__11);
				this.state = 590;
				this.expr(0);
				}
				}
				this.state = 595;
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
		this.enterRule(_localctx, 42, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 598;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 596;
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
				this.state = 597;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)) | (1 << (QuintParser.MAP - 39)))) !== 0))) {
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
		this.enterRule(_localctx, 44, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 602;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.IDENTIFIER:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 600;
				this.match(QuintParser.IDENTIFIER);
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 601;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)))) !== 0))) {
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
		this.enterRule(_localctx, 46, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 604;
			_la = this._input.LA(1);
			if (!(((((_la - 28)) & ~0x1F) === 0 && ((1 << (_la - 28)) & ((1 << (QuintParser.T__27 - 28)) | (1 << (QuintParser.AND - 28)) | (1 << (QuintParser.OR - 28)) | (1 << (QuintParser.IFF - 28)) | (1 << (QuintParser.IMPLIES - 28)) | (1 << (QuintParser.PLUS - 28)) | (1 << (QuintParser.MINUS - 28)) | (1 << (QuintParser.MUL - 28)) | (1 << (QuintParser.DIV - 28)) | (1 << (QuintParser.MOD - 28)) | (1 << (QuintParser.GT - 28)) | (1 << (QuintParser.LT - 28)) | (1 << (QuintParser.GE - 28)) | (1 << (QuintParser.LE - 28)) | (1 << (QuintParser.NE - 28)) | (1 << (QuintParser.EQ - 28)))) !== 0))) {
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
		this.enterRule(_localctx, 48, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 606;
			_la = this._input.LA(1);
			if (!(((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)))) !== 0))) {
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
		case 10:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 13:
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03D\u0263\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x03\x02\x06\x026\n\x02\r\x02\x0E" +
		"\x027\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x07\x03B\n\x03\f\x03\x0E\x03E\v\x03\x03\x03\x03\x03\x03\x04\x07\x04J" +
		"\n\x04\f\x04\x0E\x04M\v\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x05\x05j\n\x05\x05\x05l\n\x05\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06t\n\x06\f\x06\x0E\x06w\v\x06" +
		"\x05\x06y\n\x06\x03\x06\x03\x06\x03\x06\x05\x06~\n\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x07\x06\x8B\n\x06\f\x06\x0E\x06\x8E\v\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x05\x06\x94\n\x06\x03\x06\x03\x06\x05\x06\x98\n\x06\x03\x06\x05\x06" +
		"\x9B\n\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x05\x07\xA6\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x03\b\x03\b\x03\b\x07\b\xB3\n\b\f\b\x0E\b\xB6\v\b\x03\b\x03\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03" +
		"\b\x03\b\x07\b\xC7\n\b\f\b\x0E\b\xCA\v\b\x03\b\x03\b\x03\b\x03\b\x05\b" +
		"\xD0\n\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x07\f\xDD\n\f\f\f\x0E\f\xE0\v\f\x05\f\xE2\n\f\x03\f\x05\f\xE5\n\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\xFA\n\f\f\f\x0E\f\xFD\v\f" +
		"\x03\f\x05\f\u0100\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x06\f" +
		"\u0109\n\f\r\f\x0E\f\u010A\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x05\f\u0115\n\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x07\f\u011D\n\f" +
		"\f\f\x0E\f\u0120\v\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0129" +
		"\n\r\x03\r\x05\r\u012C\n\r\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x07\x0E\u0136\n\x0E\f\x0E\x0E\x0E\u0139\v\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E\u0142\n\x0E\x05" +
		"\x0E\u0144\n\x0E\x03\x0E\x03\x0E\x05\x0E\u0148\n\x0E\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x05\x0F\u014F\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x07\x0F\u015E\n\x0F\f\x0F\x0E\x0F\u0161\v\x0F\x03\x0F\x05\x0F\u0164\n" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u016D" +
		"\n\x0F\f\x0F\x0E\x0F\u0170\v\x0F\x03\x0F\x05\x0F\u0173\n\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u017C\n\x0F\f\x0F" +
		"\x0E\x0F\u017F\v\x0F\x03\x0F\x05\x0F\u0182\n\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u018B\n\x0F\f\x0F\x0E\x0F\u018E" +
		"\v\x0F\x03\x0F\x05\x0F\u0191\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u019C\n\x0F\f\x0F\x0E\x0F" +
		"\u019F\v\x0F\x03\x0F\x05\x0F\u01A2\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u01AE\n\x0F\f" +
		"\x0F\x0E\x0F\u01B1\v\x0F\x03\x0F\x05\x0F\u01B4\n\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u01BC\n\x0F\f\x0F\x0E\x0F\u01BF\v" +
		"\x0F\x05\x0F\u01C1\n\x0F\x03\x0F\x05\x0F\u01C4\n\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x05\x0F\u01D6\n\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x05\x0F\u01DB\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x05\x0F\u01E7\n\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x05\x0F" +
		"\u020E\n\x0F\x03\x0F\x05\x0F\u0211\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x06\x0F\u0221\n\x0F\r\x0F\x0E\x0F\u0222\x07\x0F\u0225\n\x0F\f" +
		"\x0F\x0E\x0F\u0228\v\x0F\x03\x10\x03\x10\x05\x10\u022C\n\x10\x03\x11\x03" +
		"\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x07\x11\u0236\n\x11" +
		"\f\x11\x0E\x11\u0239\v\x11\x03\x11\x03\x11\x03\x11\x03\x11\x05\x11\u023F" +
		"\n\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x14\x03\x14\x03\x15\x03\x15" +
		"\x03\x15\x07\x15\u024A\n\x15\f\x15\x0E\x15\u024D\v\x15\x03\x16\x03\x16" +
		"\x03\x16\x07\x16\u0252\n\x16\f\x16\x0E\x16\u0255\v\x16\x03\x17\x03\x17" +
		"\x05\x17\u0259\n\x17\x03\x18\x03\x18\x05\x18\u025D\n\x18\x03\x19\x03\x19" +
		"\x03\x1A\x03\x1A\x03\x1A\x02\x02\x04\x16\x1C\x1B\x02\x02\x04\x02\x06\x02" +
		"\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A" +
		"\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x02" +
		"\x02\f\x04\x02&(??\x03\x0235\x03\x0212\x03\x026;\x04\x02%%??\x04\x023" +
		"3??\x03\x02)/\x03\x02),\x05\x02\x1E\x1E),1;\x03\x02&(\x02\u02B9\x025\x03" +
		"\x02\x02\x02\x04;\x03\x02\x02\x02\x06K\x03\x02\x02\x02\bk\x03\x02\x02" +
		"\x02\nm\x03\x02\x02\x02\f\xA5\x03\x02\x02\x02\x0E\xCF\x03\x02\x02\x02" +
		"\x10\xD1\x03\x02\x02\x02\x12\xD3\x03\x02\x02\x02\x14\xD5\x03\x02\x02\x02" +
		"\x16\u0114\x03\x02\x02\x02\x18\u0121\x03\x02\x02\x02\x1A\u0147\x03\x02" +
		"\x02\x02\x1C\u01E6\x03\x02\x02\x02\x1E\u022B\x03\x02\x02\x02 \u023E\x03" +
		"\x02\x02\x02\"\u0240\x03\x02\x02\x02$\u0242\x03\x02\x02\x02&\u0244\x03" +
		"\x02\x02\x02(\u0246\x03\x02\x02\x02*\u024E\x03\x02\x02\x02,\u0258\x03" +
		"\x02\x02\x02.\u025C\x03\x02\x02\x020\u025E\x03\x02\x02\x022\u0260\x03" +
		"\x02\x02\x0246\x05\x04\x03\x0254\x03\x02\x02\x0267\x03\x02\x02\x0275\x03" +
		"\x02\x02\x0278\x03\x02\x02\x0289\x03\x02\x02\x029:\x07\x02\x02\x03:\x03" +
		"\x03\x02\x02\x02;<\x07\x03\x02\x02<=\x07?\x02\x02=C\x07\x04\x02\x02>?" +
		"\x05\x06\x04\x02?@\x05\b\x05\x02@B\x03\x02\x02\x02A>\x03\x02\x02\x02B" +
		"E\x03\x02\x02\x02CA\x03\x02\x02\x02CD\x03\x02\x02\x02DF\x03\x02\x02\x02" +
		"EC\x03\x02\x02\x02FG\x07\x05\x02\x02G\x05\x03\x02\x02\x02HJ\x07A\x02\x02" +
		"IH\x03\x02\x02\x02JM\x03\x02\x02\x02KI\x03\x02\x02\x02KL\x03\x02\x02\x02" +
		"L\x07\x03\x02\x02\x02MK\x03\x02\x02\x02NO\x07\x06\x02\x02OP\x07?\x02\x02" +
		"PQ\x07\x07\x02\x02Ql\x05\x16\f\x02RS\x07\b\x02\x02ST\x07?\x02\x02TU\x07" +
		"\x07\x02\x02Ul\x05\x16\f\x02VW\x07\t\x02\x02WX\x05\"\x12\x02XY\x07<\x02" +
		"\x02YZ\x05\x1C\x0F\x02Zl\x03\x02\x02\x02[l\x05\n\x06\x02\\l\x05\x0E\b" +
		"\x02]^\x07\n\x02\x02^l\x07?\x02\x02_`\x07\n\x02\x02`a\x07?\x02\x02ab\x07" +
		"<\x02\x02bl\x05\x16\f\x02cd\x07\v\x02\x02de\x05(\x15\x02ef\x07\f\x02\x02" +
		"fi\x05&\x14\x02gh\x07\r\x02\x02hj\x05\x12\n\x02ig\x03\x02\x02\x02ij\x03" +
		"\x02\x02\x02jl\x03\x02\x02\x02kN\x03\x02\x02\x02kR\x03\x02\x02\x02kV\x03" +
		"\x02\x02\x02k[\x03\x02\x02\x02k\\\x03\x02\x02\x02k]\x03\x02\x02\x02k_" +
		"\x03\x02\x02\x02kc\x03\x02\x02\x02l\t\x03\x02\x02\x02mn\x05\f\x07\x02" +
		"n\x93\x05,\x17\x02ox\x07=\x02\x02pu\x05$\x13\x02qr\x07\x0E\x02\x02rt\x05" +
		"$\x13\x02sq\x03\x02\x02\x02tw\x03\x02\x02\x02us\x03\x02\x02\x02uv\x03" +
		"\x02\x02\x02vy\x03\x02\x02\x02wu\x03\x02\x02\x02xp\x03\x02\x02\x02xy\x03" +
		"\x02\x02\x02yz\x03\x02\x02\x02z}\x07>\x02\x02{|\x07\x07\x02\x02|~\x05" +
		"\x16\f\x02}{\x03\x02\x02\x02}~\x03\x02\x02\x02~\x94\x03\x02\x02\x02\x7F" +
		"\x80\x07\x07\x02\x02\x80\x94\x05\x16\f\x02\x81\x82\x07=\x02\x02\x82\x83" +
		"\x05$\x13\x02\x83\x84\x07\x07\x02\x02\x84\x8C\x05\x16\f\x02\x85\x86\x07" +
		"\x0E\x02\x02\x86\x87\x05$\x13\x02\x87\x88\x07\x07\x02\x02\x88\x89\x05" +
		"\x16\f\x02\x89\x8B\x03\x02\x02\x02\x8A\x85\x03\x02\x02\x02\x8B\x8E\x03" +
		"\x02\x02\x02\x8C\x8A\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02\x8D\x8F\x03" +
		"\x02\x02\x02\x8E\x8C\x03\x02\x02\x02\x8F\x90\x07>\x02\x02\x90\x91\x07" +
		"\x07\x02\x02\x91\x92\x05\x16\f\x02\x92\x94\x03\x02\x02\x02\x93o\x03\x02" +
		"\x02\x02\x93\x7F\x03\x02\x02\x02\x93\x81\x03\x02\x02\x02\x93\x94\x03\x02" +
		"\x02\x02\x94\x97\x03\x02\x02\x02\x95\x96\x07<\x02\x02\x96\x98\x05\x1C" +
		"\x0F\x02\x97\x95\x03\x02\x02\x02\x97\x98\x03\x02\x02\x02\x98\x9A\x03\x02" +
		"\x02\x02\x99\x9B\x07\x0F\x02\x02\x9A\x99\x03\x02\x02\x02\x9A\x9B\x03\x02" +
		"\x02\x02\x9B\v\x03\x02\x02\x02\x9C\xA6\x07\x10\x02\x02\x9D\xA6\x07\x11" +
		"\x02\x02\x9E\x9F\x07\x12\x02\x02\x9F\xA6\x07\x10\x02\x02\xA0\xA1\x07\x12" +
		"\x02\x02\xA1\xA6\x07\x11\x02\x02\xA2\xA6\x07\x13\x02\x02\xA3\xA6\x07\x14" +
		"\x02\x02\xA4\xA6\x07\x15\x02\x02\xA5\x9C\x03\x02\x02\x02\xA5\x9D\x03\x02" +
		"\x02\x02\xA5\x9E\x03\x02\x02\x02\xA5\xA0\x03\x02\x02\x02\xA5\xA2\x03\x02" +
		"\x02\x02\xA5\xA3\x03\x02\x02\x02\xA5\xA4\x03\x02\x02\x02\xA6\r\x03\x02" +
		"\x02\x02\xA7\xA8\x07\v\x02\x02\xA8\xA9\x05\x10\t\x02\xA9\xAA\x07=\x02" +
		"\x02\xAA\xAB\x05\x12\n\x02\xAB\xAC\x07<\x02\x02\xAC\xB4\x05\x1C\x0F\x02" +
		"\xAD\xAE\x07\x0E\x02\x02\xAE\xAF\x05\x12\n\x02\xAF\xB0\x07<\x02\x02\xB0" +
		"\xB1\x05\x1C\x0F\x02\xB1\xB3\x03\x02\x02\x02\xB2\xAD\x03\x02\x02\x02\xB3" +
		"\xB6\x03\x02\x02\x02\xB4\xB2\x03\x02\x02\x02\xB4\xB5\x03\x02\x02\x02\xB5" +
		"\xB7\x03\x02\x02\x02\xB6\xB4\x03\x02\x02\x02\xB7\xB8\x07>\x02\x02\xB8" +
		"\xB9\x07\f\x02\x02\xB9\xBA\x073\x02\x02\xBA\xD0\x03\x02\x02\x02\xBB\xBC" +
		"\x07\v\x02\x02\xBC\xBD\x05\x10\t\x02\xBD\xBE\x07=\x02\x02\xBE\xBF\x05" +
		"\x12\n\x02\xBF\xC0\x07<\x02\x02\xC0\xC8\x05\x1C\x0F\x02\xC1\xC2\x07\x0E" +
		"\x02\x02\xC2\xC3\x05\x12\n\x02\xC3\xC4\x07<\x02\x02\xC4\xC5\x05\x1C\x0F" +
		"\x02\xC5\xC7\x03\x02\x02\x02\xC6\xC1\x03\x02\x02\x02\xC7\xCA\x03\x02\x02" +
		"\x02\xC8\xC6\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02\xC9\xCB\x03\x02\x02" +
		"\x02\xCA\xC8\x03\x02\x02\x02\xCB\xCC\x07>\x02\x02\xCC\xCD\x07\r\x02\x02" +
		"\xCD\xCE\x05\x14\v\x02\xCE\xD0\x03\x02\x02\x02\xCF\xA7\x03\x02\x02\x02" +
		"\xCF\xBB\x03\x02\x02\x02\xD0\x0F\x03\x02\x02\x02\xD1\xD2\x07?\x02\x02" +
		"\xD2\x11\x03\x02\x02\x02\xD3\xD4\x07?\x02\x02\xD4\x13\x03\x02\x02\x02" +
		"\xD5\xD6\x07?\x02\x02\xD6\x15\x03\x02\x02\x02\xD7\xD8\b\f\x01\x02\xD8" +
		"\xE1\x07=\x02\x02\xD9\xDE\x05\x16\f\x02\xDA\xDB\x07\x0E\x02\x02\xDB\xDD" +
		"\x05\x16\f\x02\xDC\xDA\x03\x02\x02\x02\xDD\xE0\x03\x02\x02\x02\xDE\xDC" +
		"\x03\x02\x02\x02\xDE\xDF\x03\x02\x02\x02\xDF\xE2\x03\x02\x02\x02\xE0\xDE" +
		"\x03\x02\x02\x02\xE1\xD9\x03\x02\x02\x02\xE1\xE2\x03\x02\x02\x02\xE2\xE4" +
		"\x03\x02\x02\x02\xE3\xE5\x07\x0E\x02\x02\xE4\xE3\x03\x02\x02\x02\xE4\xE5" +
		"\x03\x02\x02\x02\xE5\xE6\x03\x02\x02\x02\xE6\xE7\x07>\x02\x02\xE7\xE8" +
		"\x07\x17\x02\x02\xE8\u0115\x05\x16\f\r\xE9\xEA\x07-\x02\x02\xEA\xEB\x07" +
		"\x18\x02\x02\xEB\xEC\x05\x16\f\x02\xEC\xED\x07\x19\x02\x02\xED\u0115\x03" +
		"\x02\x02\x02\xEE\xEF\x07.\x02\x02\xEF\xF0\x07\x18\x02\x02\xF0\xF1\x05" +
		"\x16\f\x02\xF1\xF2\x07\x19\x02\x02\xF2\u0115\x03\x02\x02\x02\xF3\xF4\x07" +
		"=\x02\x02\xF4\xF5\x05\x16\f\x02\xF5\xF6\x07\x0E\x02\x02\xF6\xFB\x05\x16" +
		"\f\x02\xF7\xF8\x07\x0E\x02\x02\xF8\xFA\x05\x16\f\x02\xF9\xF7\x03\x02\x02" +
		"\x02\xFA\xFD\x03\x02\x02\x02\xFB\xF9\x03\x02\x02\x02\xFB\xFC\x03\x02\x02" +
		"\x02\xFC\xFF\x03\x02\x02\x02\xFD\xFB\x03\x02\x02\x02\xFE\u0100\x07\x0E" +
		"\x02\x02\xFF\xFE\x03\x02\x02\x02\xFF\u0100\x03\x02\x02\x02\u0100\u0101" +
		"\x03\x02\x02\x02\u0101\u0102\x07>\x02\x02\u0102\u0115\x03\x02\x02\x02" +
		"\u0103\u0104\x07\x04\x02\x02\u0104\u0105\x05\x1A\x0E\x02\u0105\u0106\x07" +
		"\x05\x02\x02\u0106\u0115\x03\x02\x02\x02\u0107\u0109\x05\x18\r\x02\u0108" +
		"\u0107\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A\u0108\x03\x02" +
		"\x02\x02\u010A\u010B\x03\x02\x02\x02\u010B\u0115\x03\x02\x02\x02\u010C" +
		"\u0115\x07\x1A\x02\x02\u010D\u0115\x07\x1B\x02\x02\u010E\u0115\x07\x1C" +
		"\x02\x02\u010F\u0115\x07?\x02\x02\u0110\u0111\x07=\x02\x02\u0111\u0112" +
		"\x05\x16\f\x02\u0112\u0113\x07>\x02\x02\u0113\u0115\x03\x02\x02\x02\u0114" +
		"\xD7\x03\x02\x02\x02\u0114\xE9\x03\x02\x02\x02\u0114\xEE\x03\x02\x02\x02" +
		"\u0114\xF3\x03\x02\x02\x02\u0114\u0103\x03\x02\x02\x02\u0114\u0108\x03" +
		"\x02\x02\x02\u0114\u010C\x03\x02\x02\x02\u0114\u010D\x03\x02\x02\x02\u0114" +
		"\u010E\x03\x02\x02\x02\u0114\u010F\x03\x02\x02\x02\u0114\u0110\x03\x02" +
		"\x02\x02\u0115\u011E\x03\x02\x02\x02\u0116\u0117\f\x0F\x02\x02\u0117\u0118" +
		"\x07\x16\x02\x02\u0118\u011D\x05\x16\f\x0F\u0119\u011A\f\x0E\x02\x02\u011A" +
		"\u011B\x07\x17\x02\x02\u011B\u011D\x05\x16\f\x0E\u011C\u0116\x03\x02\x02" +
		"\x02\u011C\u0119\x03\x02\x02\x02\u011D\u0120\x03\x02\x02\x02\u011E\u011C" +
		"\x03\x02\x02\x02\u011E\u011F\x03\x02\x02\x02\u011F\x17\x03\x02\x02\x02" +
		"\u0120\u011E\x03\x02\x02\x02\u0121\u0122\x07\x1D\x02\x02\u0122\u0123\x07" +
		"\x04\x02\x02\u0123\u0124\x07?\x02\x02\u0124\u0125\x07\x07\x02\x02\u0125" +
		"\u0128\x07&\x02\x02\u0126\u0127\x07\x0E\x02\x02\u0127\u0129\x05\x1A\x0E" +
		"\x02\u0128\u0126\x03\x02\x02\x02\u0128\u0129\x03\x02\x02\x02\u0129\u012B" +
		"\x03\x02\x02\x02\u012A\u012C\x07\x0E\x02\x02\u012B\u012A\x03\x02\x02\x02" +
		"\u012B\u012C\x03\x02\x02\x02\u012C\u012D\x03\x02\x02\x02\u012D\u012E\x07" +
		"\x05\x02\x02\u012E\x19\x03\x02\x02\x02\u012F\u0148\x03\x02\x02\x02\u0130" +
		"\u0131\x07?\x02\x02\u0131\u0132\x07\x07\x02\x02\u0132\u0133\x05\x16\f" +
		"\x02\u0133\u0134\x07\x0E\x02\x02\u0134\u0136\x03\x02\x02\x02\u0135\u0130" +
		"\x03\x02\x02\x02\u0136\u0139\x03\x02\x02\x02\u0137\u0135\x03\x02\x02\x02" +
		"\u0137\u0138\x03\x02\x02\x02\u0138\u0143\x03\x02\x02\x02\u0139\u0137\x03" +
		"\x02\x02\x02\u013A\u013B\x07?\x02\x02\u013B\u013C\x07\x07\x02\x02\u013C" +
		"\u013D\x05\x16\f\x02\u013D\u0141\x03\x02\x02\x02\u013E\u0142\x07\x0E\x02" +
		"\x02\u013F\u0140\x07\x1D\x02\x02\u0140\u0142\x07?\x02\x02\u0141\u013E" +
		"\x03\x02\x02\x02\u0141\u013F\x03\x02\x02\x02\u0141\u0142\x03\x02\x02\x02" +
		"\u0142\u0144\x03\x02\x02\x02\u0143\u013A\x03\x02\x02\x02\u0143\u0144\x03" +
		"\x02\x02\x02\u0144\u0148\x03\x02\x02\x02\u0145\u0146\x07\x1D\x02\x02\u0146" +
		"\u0148\x07?\x02\x02\u0147\u012F\x03\x02\x02\x02\u0147\u0137\x03\x02\x02" +
		"\x02\u0147\u0145\x03\x02\x02\x02\u0148\x1B\x03\x02\x02\x02\u0149\u014A" +
		"\b\x0F\x01\x02\u014A\u01E7\x05 \x11\x02\u014B\u014C\x05,\x17\x02\u014C" +
		"\u014E\x07=\x02\x02\u014D\u014F\x05*\x16\x02\u014E\u014D\x03\x02\x02\x02" +
		"\u014E\u014F\x03\x02\x02\x02\u014F\u0150\x03\x02\x02\x02\u0150\u0151\x07" +
		">\x02\x02\u0151\u01E7\x03\x02\x02\x02\u0152\u0153\x072\x02\x02\u0153\u01E7" +
		"\x05\x1C\x0F\x1B\u0154\u0155\x07?\x02\x02\u0155\u0156\x07\x1F\x02\x02" +
		"\u0156\u0157\x07<\x02\x02\u0157\u01E7\x05\x1C\x0F\x17\u0158\u0159\x07" +
		")\x02\x02\u0159\u015A\x07\x04\x02\x02\u015A\u015F\x05\x1C\x0F\x02\u015B" +
		"\u015C\x07\x0E\x02\x02\u015C\u015E\x05\x1C\x0F\x02\u015D\u015B\x03\x02" +
		"\x02\x02\u015E\u0161\x03\x02\x02\x02\u015F\u015D\x03\x02\x02\x02\u015F" +
		"\u0160\x03\x02\x02\x02\u0160\u0163\x03\x02\x02\x02\u0161\u015F\x03\x02" +
		"\x02\x02\u0162\u0164\x07\x0E\x02\x02\u0163\u0162\x03\x02\x02\x02\u0163" +
		"\u0164\x03\x02\x02\x02\u0164\u0165\x03\x02\x02\x02\u0165\u0166\x07\x05" +
		"\x02\x02\u0166\u01E7\x03\x02\x02\x02\u0167\u0168\x07*\x02\x02\u0168\u0169" +
		"\x07\x04\x02\x02\u0169\u016E\x05\x1C\x0F\x02\u016A\u016B\x07\x0E\x02\x02" +
		"\u016B\u016D\x05\x1C\x0F\x02\u016C\u016A\x03\x02\x02\x02\u016D\u0170\x03" +
		"\x02\x02\x02\u016E\u016C\x03\x02\x02\x02\u016E\u016F\x03\x02\x02\x02\u016F" +
		"\u0172\x03\x02\x02\x02\u0170\u016E\x03\x02\x02\x02\u0171\u0173\x07\x0E" +
		"\x02\x02\u0172\u0171\x03\x02\x02\x02\u0172\u0173\x03\x02\x02\x02\u0173" +
		"\u0174\x03\x02\x02\x02\u0174\u0175\x07\x05\x02\x02\u0175\u01E7\x03\x02" +
		"\x02\x02\u0176\u0177\x07 \x02\x02\u0177\u0178\x07\x04\x02\x02\u0178\u017D" +
		"\x05\x1C\x0F\x02\u0179\u017A\x07\x0E\x02\x02\u017A\u017C\x05\x1C\x0F\x02" +
		"\u017B\u0179\x03\x02\x02\x02\u017C\u017F\x03\x02\x02\x02\u017D\u017B\x03" +
		"\x02\x02\x02\u017D\u017E\x03\x02\x02\x02\u017E\u0181\x03\x02\x02\x02\u017F" +
		"\u017D\x03\x02\x02\x02\u0180\u0182\x07\x0E\x02\x02\u0181\u0180\x03\x02" +
		"\x02\x02\u0181\u0182\x03\x02\x02\x02\u0182\u0183\x03\x02\x02\x02\u0183" +
		"\u0184\x07\x05\x02\x02\u0184\u01E7\x03\x02\x02\x02\u0185\u0186\x07!\x02" +
		"\x02\u0186\u0187\x07\x04\x02\x02\u0187\u018C\x05\x1C\x0F\x02\u0188\u0189" +
		"\x07\x0E\x02\x02\u0189\u018B\x05\x1C\x0F\x02\u018A\u0188\x03\x02\x02\x02" +
		"\u018B\u018E\x03\x02\x02\x02\u018C\u018A\x03\x02\x02\x02\u018C\u018D\x03" +
		"\x02\x02\x02\u018D\u0190\x03\x02\x02\x02\u018E\u018C\x03\x02\x02\x02\u018F" +
		"\u0191\x07\x0E\x02\x02\u0190\u018F\x03\x02\x02\x02\u0190\u0191\x03\x02" +
		"\x02\x02\u0191\u0192\x03\x02\x02\x02\u0192\u0193\x07\x05\x02\x02\u0193" +
		"\u01E7\x03\x02\x02\x02\u0194\u01E7\t\x02\x02\x02\u0195\u0196\x07=\x02" +
		"\x02\u0196\u0197\x05\x1C\x0F\x02\u0197\u0198\x07\x0E\x02\x02\u0198\u019D" +
		"\x05\x1C\x0F\x02\u0199\u019A\x07\x0E\x02\x02\u019A\u019C\x05\x1C\x0F\x02" +
		"\u019B\u0199\x03\x02\x02\x02\u019C\u019F\x03\x02\x02\x02\u019D\u019B\x03" +
		"\x02\x02\x02\u019D\u019E\x03\x02\x02\x02\u019E\u01A1\x03\x02\x02\x02\u019F" +
		"\u019D\x03\x02\x02\x02\u01A0\u01A2\x07\x0E\x02\x02\u01A1\u01A0\x03\x02" +
		"\x02\x02\u01A1\u01A2\x03\x02\x02\x02\u01A2\u01A3\x03\x02\x02\x02\u01A3" +
		"\u01A4\x07>\x02\x02\u01A4\u01E7\x03\x02\x02\x02\u01A5\u01A6\x07\x04\x02" +
		"\x02\u01A6\u01A7\x07?\x02\x02\u01A7\u01A8\x07\x07\x02\x02\u01A8\u01AF" +
		"\x05\x1C\x0F\x02\u01A9\u01AA\x07\x0E\x02\x02\u01AA\u01AB\x07?\x02\x02" +
		"\u01AB\u01AC\x07\x07\x02\x02\u01AC\u01AE\x05\x1C\x0F\x02\u01AD\u01A9\x03" +
		"\x02\x02\x02\u01AE\u01B1\x03\x02\x02\x02\u01AF\u01AD\x03\x02\x02\x02\u01AF" +
		"\u01B0\x03\x02\x02\x02\u01B0\u01B3\x03\x02\x02\x02\u01B1\u01AF\x03\x02" +
		"\x02\x02\u01B2\u01B4\x07\x0E\x02\x02\u01B3\u01B2\x03\x02\x02\x02\u01B3" +
		"\u01B4\x03\x02\x02\x02\u01B4\u01B5\x03\x02\x02\x02\u01B5\u01B6\x07\x05" +
		"\x02\x02\u01B6\u01E7\x03\x02\x02\x02\u01B7\u01C0\x07\x18\x02\x02\u01B8" +
		"\u01BD\x05\x1C\x0F\x02\u01B9\u01BA\x07\x0E\x02\x02\u01BA\u01BC\x05\x1C" +
		"\x0F\x02\u01BB\u01B9\x03\x02\x02\x02\u01BC\u01BF\x03\x02\x02\x02\u01BD" +
		"\u01BB\x03\x02\x02\x02\u01BD\u01BE\x03\x02\x02\x02\u01BE\u01C1\x03\x02" +
		"\x02\x02\u01BF\u01BD\x03\x02\x02\x02\u01C0\u01B8\x03\x02\x02\x02\u01C0" +
		"\u01C1\x03\x02\x02\x02\u01C1\u01C3\x03\x02\x02\x02\u01C2\u01C4\x07\x0E" +
		"\x02\x02\u01C3\u01C2\x03\x02\x02\x02\u01C3\u01C4\x03\x02\x02\x02\u01C4" +
		"\u01C5\x03\x02\x02\x02\u01C5\u01E7\x07\x19\x02\x02\u01C6\u01C7\x07\"\x02" +
		"\x02\u01C7\u01C8\x07=\x02\x02\u01C8\u01C9\x05\x1C\x0F\x02\u01C9\u01CA" +
		"\x07>\x02\x02\u01CA\u01CB\x05\x1C\x0F\x02\u01CB\u01CC\x07#\x02\x02\u01CC" +
		"\u01CD\x05\x1C\x0F\x07\u01CD\u01E7\x03\x02\x02\x02\u01CE\u01CF\x05\n\x06" +
		"\x02\u01CF\u01D0\x05\x1C\x0F\x06\u01D0\u01E7\x03\x02\x02\x02\u01D1\u01D2" +
		"\x07$\x02\x02\u01D2\u01D5\x07?\x02\x02\u01D3\u01D4\x07\x07\x02\x02\u01D4" +
		"\u01D6\x05\x16\f\x02\u01D5\u01D3\x03\x02\x02\x02\u01D5\u01D6\x03\x02\x02" +
		"\x02\u01D6\u01D7\x03\x02\x02\x02\u01D7\u01D8\x07<\x02\x02\u01D8\u01DA" +
		"\x05\x1C\x0F\x02\u01D9\u01DB\x07\x0F\x02\x02\u01DA\u01D9\x03\x02\x02\x02" +
		"\u01DA\u01DB\x03\x02\x02\x02\u01DB\u01DC\x03\x02\x02\x02\u01DC\u01DD\x05" +
		"\x1C\x0F\x05\u01DD\u01E7\x03\x02\x02\x02\u01DE\u01DF\x07=\x02\x02\u01DF" +
		"\u01E0\x05\x1C\x0F\x02\u01E0\u01E1\x07>\x02\x02\u01E1\u01E7\x03\x02\x02" +
		"\x02\u01E2\u01E3\x07\x04\x02\x02\u01E3\u01E4\x05\x1C\x0F\x02\u01E4\u01E5" +
		"\x07\x05\x02\x02\u01E5\u01E7\x03\x02\x02\x02\u01E6\u0149\x03\x02\x02\x02" +
		"\u01E6\u014B\x03\x02\x02\x02\u01E6\u0152\x03\x02\x02\x02\u01E6\u0154\x03" +
		"\x02\x02\x02\u01E6\u0158\x03\x02\x02\x02\u01E6\u0167\x03\x02\x02\x02\u01E6" +
		"\u0176\x03\x02\x02\x02\u01E6\u0185\x03\x02\x02\x02\u01E6\u0194\x03\x02" +
		"\x02\x02\u01E6\u0195\x03\x02\x02\x02\u01E6\u01A5\x03\x02\x02\x02\u01E6" +
		"\u01B7\x03\x02\x02\x02\u01E6\u01C6\x03\x02\x02\x02\u01E6\u01CE\x03\x02" +
		"\x02\x02\u01E6\u01D1\x03\x02\x02\x02\u01E6\u01DE\x03\x02\x02\x02\u01E6" +
		"\u01E2\x03\x02\x02\x02\u01E7\u0226\x03\x02\x02\x02\u01E8\u01E9\f\x1C\x02" +
		"\x02\u01E9\u01EA\x07\x1E\x02\x02\u01EA\u0225\x05\x1C\x0F\x1C\u01EB\u01EC" +
		"\f\x1A\x02\x02\u01EC\u01ED\t\x03\x02\x02\u01ED\u0225\x05\x1C\x0F\x1B\u01EE" +
		"\u01EF\f\x19\x02\x02\u01EF\u01F0\t\x04\x02\x02\u01F0\u0225\x05\x1C\x0F" +
		"\x1A\u01F1\u01F2\f\x18\x02\x02\u01F2\u01F3\t\x05\x02\x02\u01F3\u0225\x05" +
		"\x1C\x0F\x19\u01F4\u01F5\f\x16\x02\x02\u01F5\u01F6\x07<\x02\x02\u01F6" +
		"\u01F7\x05\x1C\x0F\x17\u01F7\u01F8\b\x0F\x01\x02\u01F8\u0225\x03\x02\x02" +
		"\x02\u01F9\u01FA\f\x14\x02\x02\u01FA\u01FB\x07)\x02\x02\u01FB\u0225\x05" +
		"\x1C\x0F\x15\u01FC\u01FD\f\x12\x02\x02\u01FD\u01FE\x07*\x02\x02\u01FE" +
		"\u0225\x05\x1C\x0F\x13\u01FF\u0200\f\x11\x02\x02\u0200\u0201\x07+\x02" +
		"\x02\u0201\u0225\x05\x1C\x0F\x12\u0202\u0203\f\x10\x02\x02\u0203\u0204" +
		"\x07,\x02\x02\u0204\u0225\x05\x1C\x0F\x11\u0205\u0206\f\n\x02\x02\u0206" +
		"\u0207\x07\x16\x02\x02\u0207\u0225\x05\x1C\x0F\v\u0208\u0209\f \x02\x02" +
		"\u0209\u020A\x07\f\x02\x02\u020A\u0210\x05.\x18\x02\u020B\u020D\x07=\x02" +
		"\x02\u020C\u020E\x05*\x16\x02\u020D\u020C\x03\x02\x02\x02\u020D\u020E" +
		"\x03\x02\x02\x02\u020E\u020F\x03\x02\x02\x02\u020F\u0211\x07>\x02\x02" +
		"\u0210\u020B\x03\x02\x02\x02\u0210\u0211\x03\x02\x02\x02\u0211\u0225\x03" +
		"\x02\x02\x02\u0212\u0213\f\x1D\x02\x02\u0213\u0214\x07\x18\x02\x02";
	private static readonly _serializedATNSegment1: string =
		"\u0214\u0215\x05\x1C\x0F\x02\u0215\u0216\x07\x19\x02\x02\u0216\u0225\x03" +
		"\x02\x02\x02\u0217\u0218\f\x0F\x02\x02\u0218\u0220\x070\x02\x02\u0219" +
		"\u021A\x07\x1D\x02\x02\u021A\u021B\x07&\x02\x02\u021B\u021C\x07\x07\x02" +
		"\x02\u021C\u021D\x05$\x13\x02\u021D\u021E\x07\x17\x02\x02\u021E\u021F" +
		"\x05\x1C\x0F\x02\u021F\u0221\x03\x02\x02\x02\u0220\u0219\x03\x02\x02\x02" +
		"\u0221\u0222\x03\x02\x02\x02\u0222\u0220\x03\x02\x02\x02\u0222\u0223\x03" +
		"\x02\x02\x02\u0223\u0225\x03\x02\x02\x02\u0224\u01E8\x03\x02\x02\x02\u0224" +
		"\u01EB\x03\x02\x02\x02\u0224\u01EE\x03\x02\x02\x02\u0224\u01F1\x03\x02" +
		"\x02\x02\u0224\u01F4\x03\x02\x02\x02\u0224\u01F9\x03\x02\x02\x02\u0224" +
		"\u01FC\x03\x02\x02\x02\u0224\u01FF\x03\x02\x02\x02\u0224\u0202\x03\x02" +
		"\x02\x02\u0224\u0205\x03\x02\x02\x02\u0224\u0208\x03\x02\x02\x02\u0224" +
		"\u0212\x03\x02\x02\x02\u0224\u0217\x03\x02\x02\x02\u0225\u0228\x03\x02" +
		"\x02\x02\u0226\u0224\x03\x02\x02\x02\u0226\u0227\x03\x02\x02\x02\u0227" +
		"\x1D\x03\x02\x02\x02\u0228\u0226\x03\x02\x02\x02\u0229\u022C\x05\b\x05" +
		"\x02\u022A\u022C\x05\x1C\x0F\x02\u022B\u0229\x03\x02\x02\x02\u022B\u022A" +
		"\x03\x02\x02\x02\u022C\x1F\x03\x02\x02\x02\u022D\u022E\x05$\x13\x02\u022E" +
		"\u022F\x07\x17\x02\x02\u022F\u0230\x05\x1C\x0F\x02\u0230\u023F\x03\x02" +
		"\x02\x02\u0231\u0232\x07=\x02\x02\u0232\u0237\x05$\x13\x02\u0233\u0234" +
		"\x07\x0E\x02\x02\u0234\u0236\x05$\x13\x02\u0235\u0233\x03\x02\x02\x02" +
		"\u0236\u0239\x03\x02\x02\x02\u0237\u0235\x03\x02\x02\x02\u0237\u0238\x03" +
		"\x02\x02\x02\u0238\u023A\x03\x02\x02\x02\u0239\u0237\x03\x02\x02\x02\u023A" +
		"\u023B\x07>\x02\x02\u023B\u023C\x07\x17\x02\x02\u023C\u023D\x05\x1C\x0F" +
		"\x02\u023D\u023F\x03\x02\x02\x02\u023E\u022D\x03\x02\x02\x02\u023E\u0231" +
		"\x03\x02\x02\x02\u023F!\x03\x02\x02\x02\u0240\u0241\t\x06\x02\x02\u0241" +
		"#\x03\x02\x02\x02\u0242\u0243\x05\"\x12\x02\u0243%\x03\x02\x02\x02\u0244" +
		"\u0245\t\x07\x02\x02\u0245\'\x03\x02\x02\x02\u0246\u024B\x07?\x02\x02" +
		"\u0247\u0248\x07\f\x02\x02\u0248\u024A\x07?\x02\x02\u0249\u0247\x03\x02" +
		"\x02\x02\u024A\u024D\x03\x02\x02\x02\u024B\u0249\x03\x02\x02\x02\u024B" +
		"\u024C\x03\x02\x02\x02\u024C)\x03\x02\x02\x02\u024D\u024B\x03\x02\x02" +
		"\x02\u024E\u0253\x05\x1C\x0F\x02\u024F\u0250\x07\x0E\x02\x02\u0250\u0252" +
		"\x05\x1C\x0F\x02\u0251\u024F\x03\x02\x02\x02\u0252\u0255\x03\x02\x02\x02" +
		"\u0253\u0251\x03\x02\x02\x02\u0253\u0254\x03\x02\x02\x02\u0254+\x03\x02" +
		"\x02\x02\u0255\u0253\x03\x02\x02\x02\u0256\u0259\x07?\x02\x02\u0257\u0259" +
		"\t\b\x02\x02\u0258\u0256\x03\x02\x02\x02\u0258\u0257\x03\x02\x02\x02\u0259" +
		"-\x03\x02\x02\x02\u025A\u025D\x07?\x02\x02\u025B\u025D\t\t\x02\x02\u025C" +
		"\u025A\x03\x02\x02\x02\u025C\u025B\x03\x02\x02\x02\u025D/\x03\x02\x02" +
		"\x02\u025E\u025F\t\n\x02\x02\u025F1\x03\x02\x02\x02\u0260\u0261\t\v\x02" +
		"\x02\u02613\x03\x02\x02\x02@7CKikux}\x8C\x93\x97\x9A\xA5\xB4\xC8\xCF\xDE" +
		"\xE1\xE4\xFB\xFF\u010A\u0114\u011C\u011E\u0128\u012B\u0137\u0141\u0143" +
		"\u0147\u014E\u015F\u0163\u016E\u0172\u017D\u0181\u018C\u0190\u019D\u01A1" +
		"\u01AF\u01B3\u01BD\u01C0\u01C3\u01D5\u01DA\u01E6\u020D\u0210\u0222\u0224" +
		"\u0226\u022B\u0237\u023E\u024B\u0253\u0258\u025C";
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
	public name(): NameContext | undefined {
		return this.tryGetRuleContext(0, NameContext);
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
	public moduleName(): ModuleNameContext {
		return this.getRuleContext(0, ModuleNameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
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
	public expr(): ExprContext[];
	public expr(i: number): ExprContext;
	public expr(i?: number): ExprContext | ExprContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExprContext);
		} else {
			return this.getRuleContext(i, ExprContext);
		}
	}
	public qualifiedName(): QualifiedNameContext | undefined {
		return this.tryGetRuleContext(0, QualifiedNameContext);
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


export class ModuleNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_moduleName; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterModuleName) {
			listener.enterModuleName(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitModuleName) {
			listener.exitModuleName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitModuleName) {
			return visitor.visitModuleName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_name; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterName) {
			listener.enterName(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitName) {
			listener.exitName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitName) {
			return visitor.visitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class QualifiedNameContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(QuintParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_qualifiedName; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterQualifiedName) {
			listener.enterQualifiedName(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitQualifiedName) {
			listener.exitQualifiedName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitQualifiedName) {
			return visitor.visitQualifiedName(this);
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


