// Generated from ./src/generated/Quint.g4 by ANTLR 4.9.0-SNAPSHOT



// Used for forming errors
import { quintErrorToString } from '../quintError'



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
	public static readonly MATCH = 43;
	public static readonly PLUS = 44;
	public static readonly MINUS = 45;
	public static readonly MUL = 46;
	public static readonly DIV = 47;
	public static readonly MOD = 48;
	public static readonly GT = 49;
	public static readonly LT = 50;
	public static readonly GE = 51;
	public static readonly LE = 52;
	public static readonly NE = 53;
	public static readonly EQ = 54;
	public static readonly ASGN = 55;
	public static readonly LPAREN = 56;
	public static readonly RPAREN = 57;
	public static readonly SET = 58;
	public static readonly LIST = 59;
	public static readonly IMPORT = 60;
	public static readonly EXPORT = 61;
	public static readonly FROM = 62;
	public static readonly AS = 63;
	public static readonly LOW_ID = 64;
	public static readonly CAP_ID = 65;
	public static readonly HASHBANG_LINE = 66;
	public static readonly DOCCOMMENT = 67;
	public static readonly LINE_COMMENT = 68;
	public static readonly COMMENT = 69;
	public static readonly WS = 70;
	public static readonly RULE_modules = 0;
	public static readonly RULE_module = 1;
	public static readonly RULE_documentedDeclaration = 2;
	public static readonly RULE_declaration = 3;
	public static readonly RULE_operDef = 4;
	public static readonly RULE_typeDef = 5;
	public static readonly RULE_typeDefHead = 6;
	public static readonly RULE_sumTypeDefinition = 7;
	public static readonly RULE_typeSumVariant = 8;
	public static readonly RULE_qualifier = 9;
	public static readonly RULE_importMod = 10;
	public static readonly RULE_exportMod = 11;
	public static readonly RULE_instanceMod = 12;
	public static readonly RULE_moduleName = 13;
	public static readonly RULE_name = 14;
	public static readonly RULE_qualifiedName = 15;
	public static readonly RULE_fromSource = 16;
	public static readonly RULE_type = 17;
	public static readonly RULE_typeVar = 18;
	public static readonly RULE_row = 19;
	public static readonly RULE_rowLabel = 20;
	public static readonly RULE_typeArgs = 21;
	public static readonly RULE_typeApplication = 22;
	public static readonly RULE_wrongTypeApplication = 23;
	public static readonly RULE_expr = 24;
	public static readonly RULE_matchSumExpr = 25;
	public static readonly RULE_matchSumCase = 26;
	public static readonly RULE_matchSumVariant = 27;
	public static readonly RULE_declarationOrExpr = 28;
	public static readonly RULE_lambda = 29;
	public static readonly RULE_lambdaUnsugared = 30;
	public static readonly RULE_lambdaTupleSugar = 31;
	public static readonly RULE_identOrHole = 32;
	public static readonly RULE_parameter = 33;
	public static readonly RULE_annotatedParameter = 34;
	public static readonly RULE_destructuringPattern = 35;
	public static readonly RULE_tuplePattern = 36;
	public static readonly RULE_recordPattern = 37;
	public static readonly RULE_identOrStar = 38;
	public static readonly RULE_argList = 39;
	public static readonly RULE_recElem = 40;
	public static readonly RULE_normalCallName = 41;
	public static readonly RULE_nameAfterDot = 42;
	public static readonly RULE_operator = 43;
	public static readonly RULE_literal = 44;
	public static readonly RULE_qualId = 45;
	public static readonly RULE_simpleId = 46;
	public static readonly RULE_identifier = 47;
	public static readonly RULE_keywordAsID = 48;
	public static readonly RULE_reserved = 49;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "documentedDeclaration", "declaration", "operDef", 
		"typeDef", "typeDefHead", "sumTypeDefinition", "typeSumVariant", "qualifier", 
		"importMod", "exportMod", "instanceMod", "moduleName", "name", "qualifiedName", 
		"fromSource", "type", "typeVar", "row", "rowLabel", "typeArgs", "typeApplication", 
		"wrongTypeApplication", "expr", "matchSumExpr", "matchSumCase", "matchSumVariant", 
		"declarationOrExpr", "lambda", "lambdaUnsugared", "lambdaTupleSugar", 
		"identOrHole", "parameter", "annotatedParameter", "destructuringPattern", 
		"tuplePattern", "recordPattern", "identOrStar", "argList", "recElem", 
		"normalCallName", "nameAfterDot", "operator", "literal", "qualId", "simpleId", 
		"identifier", "keywordAsID", "reserved",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"','", "';'", "'val'", "'pure'", "'type'", "'['", "']'", "'|'", "'def'", 
		"'action'", "'run'", "'temporal'", "'nondet'", "'.'", "'->'", "'=>'", 
		"'int'", "'str'", "'bool'", "'^'", "'''", "'all'", "'any'", "'if'", "'else'", 
		"'_'", "'...'", "'::'", undefined, undefined, undefined, "'and'", "'or'", 
		"'iff'", "'implies'", "'match'", "'+'", "'-'", "'*'", "'/'", "'%'", "'>'", 
		"'<'", "'>='", "'<='", "'!='", "'=='", "'='", "'('", "')'", "'Set'", "'List'", 
		"'import'", "'export'", "'from'", "'as'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, "STRING", "BOOL", "INT", "AND", "OR", "IFF", "IMPLIES", "MATCH", 
		"PLUS", "MINUS", "MUL", "DIV", "MOD", "GT", "LT", "GE", "LE", "NE", "EQ", 
		"ASGN", "LPAREN", "RPAREN", "SET", "LIST", "IMPORT", "EXPORT", "FROM", 
		"AS", "LOW_ID", "CAP_ID", "HASHBANG_LINE", "DOCCOMMENT", "LINE_COMMENT", 
		"COMMENT", "WS",
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
			this.state = 101;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.HASHBANG_LINE) {
				{
				this.state = 100;
				this.match(QuintParser.HASHBANG_LINE);
				}
			}

			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 103;
				this.module();
				}
				}
				this.state = 106;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0 || _la === QuintParser.DOCCOMMENT);
			this.state = 108;
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
			this.state = 113;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 110;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 115;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 116;
			this.match(QuintParser.T__0);
			this.state = 117;
			this.qualId();
			this.state = 118;
			this.match(QuintParser.T__1);
			this.state = 122;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__9) | (1 << QuintParser.T__10) | (1 << QuintParser.T__11) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 60)) & ~0x1F) === 0 && ((1 << (_la - 60)) & ((1 << (QuintParser.IMPORT - 60)) | (1 << (QuintParser.EXPORT - 60)) | (1 << (QuintParser.DOCCOMMENT - 60)))) !== 0)) {
				{
				{
				this.state = 119;
				this.documentedDeclaration();
				}
				}
				this.state = 124;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 125;
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
	public documentedDeclaration(): DocumentedDeclarationContext {
		let _localctx: DocumentedDeclarationContext = new DocumentedDeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, QuintParser.RULE_documentedDeclaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 130;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 127;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 132;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 133;
			this.declaration();
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
	public declaration(): DeclarationContext {
		let _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, QuintParser.RULE_declaration);
		try {
			this.state = 155;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 135;
				this.match(QuintParser.T__3);
				this.state = 136;
				this.qualId();
				this.state = 137;
				this.match(QuintParser.T__4);
				this.state = 138;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 140;
				this.match(QuintParser.T__5);
				this.state = 141;
				this.qualId();
				this.state = 142;
				this.match(QuintParser.T__4);
				this.state = 143;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 145;
				this.match(QuintParser.T__6);
				{
				this.state = 146;
				(_localctx as AssumeContext)._assumeName = this.identOrHole();
				}
				this.state = 147;
				this.match(QuintParser.ASGN);
				this.state = 148;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 150;
				this.instanceMod();
				}
				break;

			case 5:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 151;
				this.operDef();
				}
				break;

			case 6:
				_localctx = new TypeDefsContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 152;
				this.typeDef();
				}
				break;

			case 7:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 153;
				this.importMod();
				}
				break;

			case 8:
				_localctx = new ExportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 154;
				this.exportMod();
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
			let _alt: number;
			this.state = 226;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 19, this._ctx) ) {
			case 1:
				_localctx = new AnnotatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 157;
				this.qualifier();
				this.state = 158;
				this.normalCallName();
				this.state = 159;
				this.match(QuintParser.LPAREN);
				{
				this.state = 160;
				(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
				(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
				this.state = 165;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 161;
						this.match(QuintParser.T__7);
						this.state = 162;
						(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
						(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
						}
						}
					}
					this.state = 167;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
				}
				}
				this.state = 169;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 168;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 171;
				this.match(QuintParser.RPAREN);
				this.state = 172;
				this.match(QuintParser.T__4);
				this.state = 173;
				this.type(0);
				this.state = 176;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 174;
					this.match(QuintParser.ASGN);
					this.state = 175;
					this.expr(0);
					}
				}

				this.state = 179;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 178;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 2:
				_localctx = new DeprecatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 181;
				this.qualifier();
				this.state = 182;
				this.normalCallName();
				this.state = 198;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
				case 1:
					{
					this.state = 183;
					this.match(QuintParser.LPAREN);
					this.state = 195;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)) | (1 << (QuintParser.IMPORT - 33)) | (1 << (QuintParser.EXPORT - 33)) | (1 << (QuintParser.FROM - 33)) | (1 << (QuintParser.AS - 33)) | (1 << (QuintParser.LOW_ID - 33)))) !== 0) || _la === QuintParser.CAP_ID) {
						{
						this.state = 184;
						(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
						(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
						this.state = 189;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 10, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								{
								{
								this.state = 185;
								this.match(QuintParser.T__7);
								this.state = 186;
								(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
								(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
								}
								}
							}
							this.state = 191;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 10, this._ctx);
						}
						this.state = 193;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === QuintParser.T__7) {
							{
							this.state = 192;
							this.match(QuintParser.T__7);
							}
						}

						}
					}

					this.state = 197;
					this.match(QuintParser.RPAREN);
					}
					break;
				}
				this.state = 202;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 200;
					this.match(QuintParser.T__4);
					this.state = 201;
					(_localctx as DeprecatedOperDefContext)._annotatedRetType = this.type(0);
					}
				}

				this.state = 206;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 204;
					this.match(QuintParser.ASGN);
					this.state = 205;
					this.expr(0);
					}
				}

				this.state = 209;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 208;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 3:
				_localctx = new ValDestructuringContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 211;
				this.match(QuintParser.T__9);
				this.state = 212;
				this.destructuringPattern();
				this.state = 213;
				this.match(QuintParser.ASGN);
				this.state = 214;
				this.expr(0);
				this.state = 216;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 215;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 4:
				_localctx = new PureValDestructuringContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 218;
				this.match(QuintParser.T__10);
				this.state = 219;
				this.match(QuintParser.T__9);
				this.state = 220;
				this.destructuringPattern();
				this.state = 221;
				this.match(QuintParser.ASGN);
				this.state = 222;
				this.expr(0);
				this.state = 224;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 223;
					this.match(QuintParser.T__8);
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
	public typeDef(): TypeDefContext {
		let _localctx: TypeDefContext = new TypeDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, QuintParser.RULE_typeDef);
		try {
			this.state = 240;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 20, this._ctx) ) {
			case 1:
				_localctx = new TypeAbstractDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 228;
				this.match(QuintParser.T__11);
				this.state = 229;
				this.qualId();
				}
				break;

			case 2:
				_localctx = new TypeSumDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 230;
				this.match(QuintParser.T__11);
				this.state = 231;
				this.typeDefHead();
				this.state = 232;
				this.match(QuintParser.ASGN);
				this.state = 233;
				this.sumTypeDefinition();
				}
				break;

			case 3:
				_localctx = new TypeAliasDefContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 235;
				this.match(QuintParser.T__11);
				this.state = 236;
				this.typeDefHead();
				this.state = 237;
				this.match(QuintParser.ASGN);
				this.state = 238;
				this.type(0);
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
	public typeDefHead(): TypeDefHeadContext {
		let _localctx: TypeDefHeadContext = new TypeDefHeadContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, QuintParser.RULE_typeDefHead);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 242;
			_localctx._typeName = this.qualId();
			this.state = 253;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 243;
				this.match(QuintParser.T__12);
				this.state = 244;
				_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
				_localctx._typeVars.push(_localctx._LOW_ID);
				this.state = 249;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 245;
					this.match(QuintParser.T__7);
					this.state = 246;
					_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
					_localctx._typeVars.push(_localctx._LOW_ID);
					}
					}
					this.state = 251;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 252;
				this.match(QuintParser.T__13);
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
	public sumTypeDefinition(): SumTypeDefinitionContext {
		let _localctx: SumTypeDefinitionContext = new SumTypeDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, QuintParser.RULE_sumTypeDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 256;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__14) {
				{
				this.state = 255;
				_localctx._separator = this.match(QuintParser.T__14);
				}
			}

			this.state = 258;
			this.typeSumVariant();
			this.state = 263;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__14) {
				{
				{
				this.state = 259;
				this.match(QuintParser.T__14);
				this.state = 260;
				this.typeSumVariant();
				}
				}
				this.state = 265;
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
	public typeSumVariant(): TypeSumVariantContext {
		let _localctx: TypeSumVariantContext = new TypeSumVariantContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, QuintParser.RULE_typeSumVariant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 266;
			_localctx._sumLabel = this.simpleId("variant label");
			this.state = 271;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 267;
				this.match(QuintParser.LPAREN);
				this.state = 268;
				this.type(0);
				this.state = 269;
				this.match(QuintParser.RPAREN);
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
		this.enterRule(_localctx, 18, QuintParser.RULE_qualifier);
		try {
			this.state = 283;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 26, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 273;
				this.match(QuintParser.T__9);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 274;
				this.match(QuintParser.T__15);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 275;
				this.match(QuintParser.T__10);
				this.state = 276;
				this.match(QuintParser.T__9);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 277;
				this.match(QuintParser.T__10);
				this.state = 278;
				this.match(QuintParser.T__15);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 279;
				this.match(QuintParser.T__16);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 280;
				this.match(QuintParser.T__17);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 281;
				this.match(QuintParser.T__18);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 282;
				this.match(QuintParser.T__19);
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
	public importMod(): ImportModContext {
		let _localctx: ImportModContext = new ImportModContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, QuintParser.RULE_importMod);
		let _la: number;
		try {
			this.state = 303;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 285;
				this.match(QuintParser.IMPORT);
				this.state = 286;
				this.name();
				this.state = 287;
				this.match(QuintParser.T__20);
				this.state = 288;
				this.identOrStar();
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 289;
					this.match(QuintParser.FROM);
					this.state = 290;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 293;
				this.match(QuintParser.IMPORT);
				this.state = 294;
				this.name();
				this.state = 297;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.AS) {
					{
					this.state = 295;
					this.match(QuintParser.AS);
					this.state = 296;
					this.name();
					}
				}

				this.state = 301;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 299;
					this.match(QuintParser.FROM);
					this.state = 300;
					this.fromSource();
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
	public exportMod(): ExportModContext {
		let _localctx: ExportModContext = new ExportModContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, QuintParser.RULE_exportMod);
		let _la: number;
		try {
			this.state = 316;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 32, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 305;
				this.match(QuintParser.EXPORT);
				this.state = 306;
				this.name();
				this.state = 307;
				this.match(QuintParser.T__20);
				this.state = 308;
				this.identOrStar();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 310;
				this.match(QuintParser.EXPORT);
				this.state = 311;
				this.name();
				this.state = 314;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.AS) {
					{
					this.state = 312;
					this.match(QuintParser.AS);
					this.state = 313;
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
	public instanceMod(): InstanceModContext {
		let _localctx: InstanceModContext = new InstanceModContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, QuintParser.RULE_instanceMod);
		let _la: number;
		try {
			let _alt: number;
			this.state = 370;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 39, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 318;
				this.match(QuintParser.IMPORT);
				this.state = 319;
				this.moduleName();
				this.state = 320;
				this.match(QuintParser.LPAREN);
				{
				this.state = 321;
				this.name();
				this.state = 322;
				this.match(QuintParser.ASGN);
				this.state = 323;
				this.expr(0);
				this.state = 331;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 324;
						this.match(QuintParser.T__7);
						this.state = 325;
						this.name();
						this.state = 326;
						this.match(QuintParser.ASGN);
						this.state = 327;
						this.expr(0);
						}
						}
					}
					this.state = 333;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				}
				}
				this.state = 335;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 334;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 337;
				this.match(QuintParser.RPAREN);
				this.state = 338;
				this.match(QuintParser.T__20);
				this.state = 339;
				this.match(QuintParser.MUL);
				this.state = 342;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 340;
					this.match(QuintParser.FROM);
					this.state = 341;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 344;
				this.match(QuintParser.IMPORT);
				this.state = 345;
				this.moduleName();
				this.state = 346;
				this.match(QuintParser.LPAREN);
				{
				this.state = 347;
				this.name();
				this.state = 348;
				this.match(QuintParser.ASGN);
				this.state = 349;
				this.expr(0);
				this.state = 357;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 350;
						this.match(QuintParser.T__7);
						this.state = 351;
						this.name();
						this.state = 352;
						this.match(QuintParser.ASGN);
						this.state = 353;
						this.expr(0);
						}
						}
					}
					this.state = 359;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 36, this._ctx);
				}
				}
				this.state = 361;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 360;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 363;
				this.match(QuintParser.RPAREN);
				this.state = 364;
				this.match(QuintParser.AS);
				this.state = 365;
				this.qualifiedName();
				this.state = 368;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 366;
					this.match(QuintParser.FROM);
					this.state = 367;
					this.fromSource();
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
	public moduleName(): ModuleNameContext {
		let _localctx: ModuleNameContext = new ModuleNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, QuintParser.RULE_moduleName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 372;
			this.qualId();
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
		this.enterRule(_localctx, 28, QuintParser.RULE_name);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 374;
			this.qualId();
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
		this.enterRule(_localctx, 30, QuintParser.RULE_qualifiedName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 376;
			this.qualId();
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
	public fromSource(): FromSourceContext {
		let _localctx: FromSourceContext = new FromSourceContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, QuintParser.RULE_fromSource);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 378;
			this.match(QuintParser.STRING);
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
		let _startState: number = 34;
		this.enterRecursionRule(_localctx, 34, QuintParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 442;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 46, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 381;
				this.match(QuintParser.LPAREN);
				this.state = 390;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__23) | (1 << QuintParser.T__24) | (1 << QuintParser.T__25))) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.MATCH - 39)) | (1 << (QuintParser.LPAREN - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)) | (1 << (QuintParser.IMPORT - 39)) | (1 << (QuintParser.EXPORT - 39)) | (1 << (QuintParser.FROM - 39)) | (1 << (QuintParser.AS - 39)) | (1 << (QuintParser.LOW_ID - 39)) | (1 << (QuintParser.CAP_ID - 39)))) !== 0)) {
					{
					this.state = 382;
					this.type(0);
					this.state = 387;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 383;
							this.match(QuintParser.T__7);
							this.state = 384;
							this.type(0);
							}
							}
						}
						this.state = 389;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
					}
					}
				}

				this.state = 393;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 392;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 395;
				this.match(QuintParser.RPAREN);
				this.state = 396;
				this.match(QuintParser.T__22);
				this.state = 397;
				this.type(14);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 398;
				this.match(QuintParser.SET);
				this.state = 399;
				this.match(QuintParser.T__12);
				this.state = 400;
				this.type(0);
				this.state = 401;
				this.match(QuintParser.T__13);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 403;
				this.match(QuintParser.LIST);
				this.state = 404;
				this.match(QuintParser.T__12);
				this.state = 405;
				this.type(0);
				this.state = 406;
				this.match(QuintParser.T__13);
				}
				break;

			case 4:
				{
				_localctx = new TypeUnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 408;
				this.match(QuintParser.LPAREN);
				this.state = 409;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 410;
				this.match(QuintParser.LPAREN);
				this.state = 411;
				this.type(0);
				this.state = 412;
				this.match(QuintParser.T__7);
				this.state = 413;
				this.type(0);
				this.state = 418;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 414;
						this.match(QuintParser.T__7);
						this.state = 415;
						this.type(0);
						}
						}
					}
					this.state = 420;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 43, this._ctx);
				}
				this.state = 422;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 421;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 424;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 6:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 426;
				this.match(QuintParser.T__1);
				this.state = 428;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__14 || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.MATCH - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)) | (1 << (QuintParser.IMPORT - 39)) | (1 << (QuintParser.EXPORT - 39)) | (1 << (QuintParser.FROM - 39)) | (1 << (QuintParser.AS - 39)) | (1 << (QuintParser.LOW_ID - 39)) | (1 << (QuintParser.CAP_ID - 39)))) !== 0)) {
					{
					this.state = 427;
					this.row();
					}
				}

				this.state = 430;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 431;
				this.match(QuintParser.T__23);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 432;
				this.match(QuintParser.T__24);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 433;
				this.match(QuintParser.T__25);
				}
				break;

			case 10:
				{
				_localctx = new TypeVarCaseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 434;
				this.typeVar();
				}
				break;

			case 11:
				{
				_localctx = new TypeConstContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 435;
				this.qualId();
				}
				break;

			case 12:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 436;
				this.match(QuintParser.LPAREN);
				this.state = 437;
				this.type(0);
				this.state = 438;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new TypeAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 440;
				this.typeApplication();
				}
				break;

			case 14:
				{
				_localctx = new WrongTypeAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 441;
				this.wrongTypeApplication();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 452;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 48, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 450;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 47, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 444;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 445;
						this.match(QuintParser.T__21);
						this.state = 446;
						this.type(16);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 447;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 448;
						this.match(QuintParser.T__22);
						this.state = 449;
						this.type(15);
						}
						break;
					}
					}
				}
				this.state = 454;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 48, this._ctx);
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
	public typeVar(): TypeVarContext {
		let _localctx: TypeVarContext = new TypeVarContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, QuintParser.RULE_typeVar);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 455;
			this.match(QuintParser.LOW_ID);
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
		this.enterRule(_localctx, 38, QuintParser.RULE_row);
		try {
			let _alt: number;
			this.state = 478;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				{
				this.state = 457;
				this.rowLabel();
				this.state = 458;
				this.match(QuintParser.T__4);
				this.state = 459;
				this.type(0);
				}
				this.state = 468;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 49, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 461;
						this.match(QuintParser.T__7);
						this.state = 462;
						this.rowLabel();
						this.state = 463;
						this.match(QuintParser.T__4);
						this.state = 464;
						this.type(0);
						}
						}
					}
					this.state = 470;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 49, this._ctx);
				}
				this.state = 474;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.T__7:
					{
					this.state = 471;
					this.match(QuintParser.T__7);
					}
					break;
				case QuintParser.T__14:
					{
					this.state = 472;
					this.match(QuintParser.T__14);
					{
					this.state = 473;
					_localctx._rowVar = this.identifier();
					}
					}
					break;
				case QuintParser.T__2:
					break;
				default:
					break;
				}
				}
				break;
			case QuintParser.T__14:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 476;
				this.match(QuintParser.T__14);
				{
				this.state = 477;
				_localctx._rowVar = this.identifier();
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
	public rowLabel(): RowLabelContext {
		let _localctx: RowLabelContext = new RowLabelContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, QuintParser.RULE_rowLabel);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 480;
			this.simpleId("record");
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
	public typeArgs(): TypeArgsContext {
		let _localctx: TypeArgsContext = new TypeArgsContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, QuintParser.RULE_typeArgs);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 482;
			_localctx._type = this.type(0);
			_localctx._typeArg.push(_localctx._type);
			this.state = 487;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__7) {
				{
				{
				this.state = 483;
				this.match(QuintParser.T__7);
				this.state = 484;
				_localctx._type = this.type(0);
				_localctx._typeArg.push(_localctx._type);
				}
				}
				this.state = 489;
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
	public typeApplication(): TypeApplicationContext {
		let _localctx: TypeApplicationContext = new TypeApplicationContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, QuintParser.RULE_typeApplication);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 490;
			_localctx._typeCtor = this.qualId();
			this.state = 491;
			this.match(QuintParser.T__12);
			this.state = 492;
			this.typeArgs();
			this.state = 493;
			this.match(QuintParser.T__13);
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
	public wrongTypeApplication(): WrongTypeApplicationContext {
		let _localctx: WrongTypeApplicationContext = new WrongTypeApplicationContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, QuintParser.RULE_wrongTypeApplication);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 495;
			_localctx._typeCtor = _localctx._qualId = this.qualId();
			this.state = 496;
			this.match(QuintParser.LPAREN);
			this.state = 497;
			_localctx._typeArgs = this.typeArgs();
			this.state = 498;
			this.match(QuintParser.RPAREN);

			        const err = quintErrorToString(
			          { code: 'QNT009',
			            message: "Use square brackets instead of parenthesis for type application: "
			                  + (_localctx._qualId != null ? this._input.getTextFromRange(_localctx._qualId._start, _localctx._qualId._stop) : undefined) + "[" + (_localctx._typeArgs != null ? this._input.getTextFromRange(_localctx._typeArgs._start, _localctx._typeArgs._stop) : undefined)?.replace(/,/g, ', ') + "]"
			          },
			        )
			        this.notifyErrorListeners(err)
			      
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
		let _startState: number = 48;
		this.enterRecursionRule(_localctx, 48, QuintParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 653;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 71, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 502;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 503;
				this.normalCallName();
				this.state = 504;
				this.match(QuintParser.LPAREN);
				this.state = 506;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__9 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__12 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
					{
					this.state = 505;
					this.argList();
					}
				}

				this.state = 509;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 508;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 511;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 513;
				this.match(QuintParser.MINUS);
				this.state = 514;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 515;
				this.qualId();
				this.state = 516;
				this.match(QuintParser.T__27);
				this.state = 517;
				this.match(QuintParser.ASGN);
				this.state = 518;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 520;
				this.match(QuintParser.AND);
				this.state = 521;
				this.match(QuintParser.T__1);
				this.state = 522;
				this.expr(0);
				this.state = 527;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 523;
						this.match(QuintParser.T__7);
						this.state = 524;
						this.expr(0);
						}
						}
					}
					this.state = 529;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				}
				this.state = 531;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 530;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 533;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 535;
				this.match(QuintParser.OR);
				this.state = 536;
				this.match(QuintParser.T__1);
				this.state = 537;
				this.expr(0);
				this.state = 542;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 538;
						this.match(QuintParser.T__7);
						this.state = 539;
						this.expr(0);
						}
						}
					}
					this.state = 544;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
				}
				this.state = 546;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 545;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 548;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new MatchContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 550;
				this.matchSumExpr();
				}
				break;

			case 8:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 551;
				this.match(QuintParser.T__28);
				this.state = 552;
				this.match(QuintParser.T__1);
				this.state = 553;
				this.expr(0);
				this.state = 558;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 59, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 554;
						this.match(QuintParser.T__7);
						this.state = 555;
						this.expr(0);
						}
						}
					}
					this.state = 560;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 59, this._ctx);
				}
				this.state = 562;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 561;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 564;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 566;
				this.match(QuintParser.T__29);
				this.state = 567;
				this.match(QuintParser.T__1);
				this.state = 568;
				this.expr(0);
				this.state = 573;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 61, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 569;
						this.match(QuintParser.T__7);
						this.state = 570;
						this.expr(0);
						}
						}
					}
					this.state = 575;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 61, this._ctx);
				}
				this.state = 577;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 576;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 579;
				this.match(QuintParser.T__2);
				}
				break;

			case 10:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 585;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.AND:
				case QuintParser.OR:
				case QuintParser.IFF:
				case QuintParser.IMPLIES:
				case QuintParser.MATCH:
				case QuintParser.SET:
				case QuintParser.LIST:
				case QuintParser.IMPORT:
				case QuintParser.EXPORT:
				case QuintParser.FROM:
				case QuintParser.AS:
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 581;
					this.qualId();
					}
					break;
				case QuintParser.INT:
					{
					this.state = 582;
					this.match(QuintParser.INT);
					}
					break;
				case QuintParser.BOOL:
					{
					this.state = 583;
					this.match(QuintParser.BOOL);
					}
					break;
				case QuintParser.STRING:
					{
					this.state = 584;
					this.match(QuintParser.STRING);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 11:
				{
				_localctx = new TupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 587;
				this.match(QuintParser.LPAREN);
				this.state = 588;
				this.expr(0);
				this.state = 589;
				this.match(QuintParser.T__7);
				this.state = 590;
				this.expr(0);
				this.state = 595;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 64, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 591;
						this.match(QuintParser.T__7);
						this.state = 592;
						this.expr(0);
						}
						}
					}
					this.state = 597;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 64, this._ctx);
				}
				this.state = 599;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 598;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 601;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 12:
				{
				_localctx = new UnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 603;
				this.match(QuintParser.LPAREN);
				this.state = 604;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 605;
				this.match(QuintParser.T__1);
				this.state = 606;
				this.recElem();
				this.state = 611;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 66, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 607;
						this.match(QuintParser.T__7);
						this.state = 608;
						this.recElem();
						}
						}
					}
					this.state = 613;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 66, this._ctx);
				}
				this.state = 615;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 614;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 617;
				this.match(QuintParser.T__2);
				}
				break;

			case 14:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 619;
				this.match(QuintParser.T__12);
				this.state = 628;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__9 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__12 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
					{
					this.state = 620;
					this.expr(0);
					this.state = 625;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 68, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 621;
							this.match(QuintParser.T__7);
							this.state = 622;
							this.expr(0);
							}
							}
						}
						this.state = 627;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 68, this._ctx);
					}
					}
				}

				this.state = 631;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 630;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 633;
				this.match(QuintParser.T__13);
				}
				break;

			case 15:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 634;
				this.match(QuintParser.T__30);
				this.state = 635;
				this.match(QuintParser.LPAREN);
				this.state = 636;
				this.expr(0);
				this.state = 637;
				this.match(QuintParser.RPAREN);
				this.state = 638;
				this.expr(0);
				this.state = 639;
				this.match(QuintParser.T__31);
				this.state = 640;
				this.expr(4);
				}
				break;

			case 16:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 642;
				this.operDef();
				this.state = 643;
				this.expr(3);
				}
				break;

			case 17:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 645;
				this.match(QuintParser.LPAREN);
				this.state = 646;
				this.expr(0);
				this.state = 647;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 18:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 649;
				this.match(QuintParser.T__1);
				this.state = 650;
				this.expr(0);
				this.state = 651;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 704;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 75, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 702;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 74, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 655;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 656;
						(_localctx as PowContext)._op = this.match(QuintParser.T__26);
						this.state = 657;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 658;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 659;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 46)) & ~0x1F) === 0 && ((1 << (_la - 46)) & ((1 << (QuintParser.MUL - 46)) | (1 << (QuintParser.DIV - 46)) | (1 << (QuintParser.MOD - 46)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 660;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 661;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 662;
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
						this.state = 663;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 664;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 665;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & ((1 << (QuintParser.GT - 49)) | (1 << (QuintParser.LT - 49)) | (1 << (QuintParser.GE - 49)) | (1 << (QuintParser.LE - 49)) | (1 << (QuintParser.NE - 49)) | (1 << (QuintParser.EQ - 49)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 666;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 667;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 668;
						this.match(QuintParser.ASGN);
						this.state = 669;
						this.expr(21);

						                            const m = "[QNT006] unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 672;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 673;
						this.match(QuintParser.AND);
						this.state = 674;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 675;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 676;
						this.match(QuintParser.OR);
						this.state = 677;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 678;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 679;
						this.match(QuintParser.IFF);
						this.state = 680;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 681;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 682;
						this.match(QuintParser.IMPLIES);
						this.state = 683;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 684;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 685;
						this.match(QuintParser.T__21);
						this.state = 686;
						this.expr(8);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 687;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 688;
						this.match(QuintParser.T__20);
						this.state = 689;
						this.nameAfterDot();
						this.state = 695;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 73, this._ctx) ) {
						case 1:
							{
							this.state = 690;
							this.match(QuintParser.LPAREN);
							this.state = 692;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__9 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__12 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
								{
								this.state = 691;
								this.argList();
								}
							}

							this.state = 694;
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
						this.state = 697;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 698;
						this.match(QuintParser.T__12);
						this.state = 699;
						this.expr(0);
						this.state = 700;
						this.match(QuintParser.T__13);
						}
						break;
					}
					}
				}
				this.state = 706;
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
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public matchSumExpr(): MatchSumExprContext {
		let _localctx: MatchSumExprContext = new MatchSumExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, QuintParser.RULE_matchSumExpr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 707;
			this.match(QuintParser.MATCH);
			this.state = 708;
			this.expr(0);
			this.state = 709;
			this.match(QuintParser.T__1);
			this.state = 711;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__14) {
				{
				this.state = 710;
				this.match(QuintParser.T__14);
				}
			}

			this.state = 713;
			_localctx._matchSumCase = this.matchSumCase();
			_localctx._matchCase.push(_localctx._matchSumCase);
			this.state = 718;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__14) {
				{
				{
				this.state = 714;
				this.match(QuintParser.T__14);
				this.state = 715;
				_localctx._matchSumCase = this.matchSumCase();
				_localctx._matchCase.push(_localctx._matchSumCase);
				}
				}
				this.state = 720;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 721;
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
	public matchSumCase(): MatchSumCaseContext {
		let _localctx: MatchSumCaseContext = new MatchSumCaseContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, QuintParser.RULE_matchSumCase);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 725;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				{
				this.state = 723;
				_localctx._variantMatch = this.matchSumVariant();
				}
				break;
			case QuintParser.T__32:
				{
				this.state = 724;
				_localctx._wildCardMatch = this.match(QuintParser.T__32);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 727;
			this.match(QuintParser.T__22);
			this.state = 728;
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
	public matchSumVariant(): MatchSumVariantContext {
		let _localctx: MatchSumVariantContext = new MatchSumVariantContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, QuintParser.RULE_matchSumVariant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 730;
			_localctx._variantLabel = this.simpleId("variant label");
			}
			this.state = 737;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 731;
				this.match(QuintParser.LPAREN);
				this.state = 734;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.AND:
				case QuintParser.OR:
				case QuintParser.IFF:
				case QuintParser.IMPLIES:
				case QuintParser.MATCH:
				case QuintParser.SET:
				case QuintParser.LIST:
				case QuintParser.IMPORT:
				case QuintParser.EXPORT:
				case QuintParser.FROM:
				case QuintParser.AS:
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 732;
					_localctx._variantParam = this.simpleId("match case parameter");
					}
					break;
				case QuintParser.T__32:
					{
					this.state = 733;
					this.match(QuintParser.T__32);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 736;
				this.match(QuintParser.RPAREN);
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
	public declarationOrExpr(): DeclarationOrExprContext {
		let _localctx: DeclarationOrExprContext = new DeclarationOrExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, QuintParser.RULE_declarationOrExpr);
		try {
			this.state = 748;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 81, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 739;
				this.declaration();
				this.state = 740;
				this.match(QuintParser.EOF);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 742;
				this.expr(0);
				this.state = 743;
				this.match(QuintParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 745;
				this.match(QuintParser.DOCCOMMENT);
				this.state = 746;
				this.match(QuintParser.EOF);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 747;
				this.match(QuintParser.EOF);
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
		this.enterRule(_localctx, 58, QuintParser.RULE_lambda);
		try {
			this.state = 752;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 82, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 750;
				this.lambdaUnsugared();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 751;
				this.lambdaTupleSugar();
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
	public lambdaUnsugared(): LambdaUnsugaredContext {
		let _localctx: LambdaUnsugaredContext = new LambdaUnsugaredContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, QuintParser.RULE_lambdaUnsugared);
		let _la: number;
		try {
			this.state = 771;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__32:
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 754;
				this.parameter();
				this.state = 755;
				this.match(QuintParser.T__22);
				this.state = 756;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 758;
				this.match(QuintParser.LPAREN);
				this.state = 759;
				this.parameter();
				this.state = 764;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 760;
					this.match(QuintParser.T__7);
					this.state = 761;
					this.parameter();
					}
					}
					this.state = 766;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 767;
				this.match(QuintParser.RPAREN);
				this.state = 768;
				this.match(QuintParser.T__22);
				this.state = 769;
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
	public lambdaTupleSugar(): LambdaTupleSugarContext {
		let _localctx: LambdaTupleSugarContext = new LambdaTupleSugarContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, QuintParser.RULE_lambdaTupleSugar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 773;
			this.match(QuintParser.LPAREN);
			this.state = 774;
			this.match(QuintParser.LPAREN);
			this.state = 775;
			this.parameter();
			this.state = 778;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 776;
				this.match(QuintParser.T__7);
				this.state = 777;
				this.parameter();
				}
				}
				this.state = 780;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__7);
			this.state = 782;
			this.match(QuintParser.RPAREN);
			this.state = 783;
			this.match(QuintParser.RPAREN);
			this.state = 784;
			this.match(QuintParser.T__22);
			this.state = 785;
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
	public identOrHole(): IdentOrHoleContext {
		let _localctx: IdentOrHoleContext = new IdentOrHoleContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, QuintParser.RULE_identOrHole);
		try {
			this.state = 789;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__32:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 787;
				this.match(QuintParser.T__32);
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 788;
				this.qualId();
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
	public parameter(): ParameterContext {
		let _localctx: ParameterContext = new ParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, QuintParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 791;
			_localctx._paramName = this.identOrHole();
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
	public annotatedParameter(): AnnotatedParameterContext {
		let _localctx: AnnotatedParameterContext = new AnnotatedParameterContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, QuintParser.RULE_annotatedParameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 793;
			_localctx._paramName = this.identOrHole();
			this.state = 794;
			this.match(QuintParser.T__4);
			this.state = 795;
			this.type(0);
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
	public destructuringPattern(): DestructuringPatternContext {
		let _localctx: DestructuringPatternContext = new DestructuringPatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, QuintParser.RULE_destructuringPattern);
		try {
			this.state = 799;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 797;
				this.tuplePattern();
				}
				break;
			case QuintParser.T__1:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 798;
				this.recordPattern();
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
	public tuplePattern(): TuplePatternContext {
		let _localctx: TuplePatternContext = new TuplePatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, QuintParser.RULE_tuplePattern);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 801;
			this.match(QuintParser.LPAREN);
			this.state = 802;
			this.identOrHole();
			this.state = 805;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 803;
				this.match(QuintParser.T__7);
				this.state = 804;
				this.identOrHole();
				}
				}
				this.state = 807;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__7);
			this.state = 809;
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
	// @RuleVersion(0)
	public recordPattern(): RecordPatternContext {
		let _localctx: RecordPatternContext = new RecordPatternContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, QuintParser.RULE_recordPattern);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 811;
			this.match(QuintParser.T__1);
			this.state = 812;
			this.simpleId("record field");
			this.state = 817;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__7) {
				{
				{
				this.state = 813;
				this.match(QuintParser.T__7);
				this.state = 814;
				this.simpleId("record field");
				}
				}
				this.state = 819;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 820;
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
	public identOrStar(): IdentOrStarContext {
		let _localctx: IdentOrStarContext = new IdentOrStarContext(this._ctx, this.state);
		this.enterRule(_localctx, 76, QuintParser.RULE_identOrStar);
		try {
			this.state = 824;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.MUL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 822;
				this.match(QuintParser.MUL);
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 823;
				this.qualId();
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
	public argList(): ArgListContext {
		let _localctx: ArgListContext = new ArgListContext(this._ctx, this.state);
		this.enterRule(_localctx, 78, QuintParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 826;
			this.expr(0);
			this.state = 831;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 91, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 827;
					this.match(QuintParser.T__7);
					this.state = 828;
					this.expr(0);
					}
					}
				}
				this.state = 833;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 91, this._ctx);
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
	public recElem(): RecElemContext {
		let _localctx: RecElemContext = new RecElemContext(this._ctx, this.state);
		this.enterRule(_localctx, 80, QuintParser.RULE_recElem);
		try {
			this.state = 840;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
			case QuintParser.FROM:
			case QuintParser.AS:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 834;
				this.simpleId("record");
				this.state = 835;
				this.match(QuintParser.T__4);
				this.state = 836;
				this.expr(0);
				}
				break;
			case QuintParser.T__33:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 838;
				this.match(QuintParser.T__33);
				this.state = 839;
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
	public normalCallName(): NormalCallNameContext {
		let _localctx: NormalCallNameContext = new NormalCallNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 82, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 844;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 93, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 842;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)))) !== 0))) {
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

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 843;
				this.qualId();
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
	public nameAfterDot(): NameAfterDotContext {
		let _localctx: NameAfterDotContext = new NameAfterDotContext(this._ctx, this.state);
		this.enterRule(_localctx, 84, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 848;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 94, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 846;
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

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 847;
				this.qualId();
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
	public operator(): OperatorContext {
		let _localctx: OperatorContext = new OperatorContext(this._ctx, this.state);
		this.enterRule(_localctx, 86, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 850;
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
		this.enterRule(_localctx, 88, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 852;
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
	// @RuleVersion(0)
	public qualId(): QualIdContext {
		let _localctx: QualIdContext = new QualIdContext(this._ctx, this.state);
		this.enterRule(_localctx, 90, QuintParser.RULE_qualId);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 854;
			this.identifier();
			this.state = 859;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 95, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 855;
					this.match(QuintParser.T__34);
					this.state = 856;
					this.identifier();
					}
					}
				}
				this.state = 861;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 95, this._ctx);
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
	public simpleId(context: string): SimpleIdContext {
		let _localctx: SimpleIdContext = new SimpleIdContext(this._ctx, this.state, context);
		this.enterRule(_localctx, 92, QuintParser.RULE_simpleId);
		try {
			this.state = 866;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 96, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 862;
				this.identifier();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 863;
				_localctx._qualId = this.qualId();

				        const err = quintErrorToString(
				          { code: 'QNT008',
				            message: "Identifiers in a " + _localctx.context + " cannot be qualified with '::'. Found " + (_localctx._qualId != null ? this._input.getTextFromRange(_localctx._qualId._start, _localctx._qualId._stop) : undefined) + "."
				          },
				        )
				        this.notifyErrorListeners(err)
				      
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
	public identifier(): IdentifierContext {
		let _localctx: IdentifierContext = new IdentifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 94, QuintParser.RULE_identifier);
		try {
			this.state = 874;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 868;
				this.match(QuintParser.LOW_ID);
				}
				break;
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 869;
				this.match(QuintParser.CAP_ID);
				}
				break;
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.FROM:
			case QuintParser.AS:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 870;
				this.keywordAsID();
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MATCH:
			case QuintParser.IMPORT:
			case QuintParser.EXPORT:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 871;
				_localctx._reserved = this.reserved();

				               const err = quintErrorToString(
				                 { code: 'QNT008',
				                   message: "Reserved keyword '" + (_localctx._reserved != null ? this._input.getTextFromRange(_localctx._reserved._start, _localctx._reserved._stop) : undefined) + "' cannot be used as an identifier."
				                 },
				               )
				               this.notifyErrorListeners(err)
				             
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
	public keywordAsID(): KeywordAsIDContext {
		let _localctx: KeywordAsIDContext = new KeywordAsIDContext(this._ctx, this.state);
		this.enterRule(_localctx, 96, QuintParser.RULE_keywordAsID);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 876;
			_la = this._input.LA(1);
			if (!(((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & ((1 << (QuintParser.SET - 58)) | (1 << (QuintParser.LIST - 58)) | (1 << (QuintParser.FROM - 58)) | (1 << (QuintParser.AS - 58)))) !== 0))) {
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
	public reserved(): ReservedContext {
		let _localctx: ReservedContext = new ReservedContext(this._ctx, this.state);
		this.enterRule(_localctx, 98, QuintParser.RULE_reserved);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 878;
			_la = this._input.LA(1);
			if (!(((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.MATCH - 39)) | (1 << (QuintParser.IMPORT - 39)) | (1 << (QuintParser.EXPORT - 39)))) !== 0))) {
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
		case 17:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 24:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private type_sempred(_localctx: TypeContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 16);

		case 1:
			return this.precpred(this._ctx, 15);
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
			return this.precpred(this._ctx, 7);

		case 12:
			return this.precpred(this._ctx, 30);

		case 13:
			return this.precpred(this._ctx, 27);
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03H\u0373\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x03\x02" +
		"\x05\x02h\n\x02\x03\x02\x06\x02k\n\x02\r\x02\x0E\x02l\x03\x02\x03\x02" +
		"\x03\x03\x07\x03r\n\x03\f\x03\x0E\x03u\v\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x07\x03{\n\x03\f\x03\x0E\x03~\v\x03\x03\x03\x03\x03\x03\x04\x07\x04" +
		"\x83\n\x04\f\x04\x0E\x04\x86\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05" +
		"\x05\x9E\n\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06" +
		"\xA6\n\x06\f\x06\x0E\x06\xA9\v\x06\x03\x06\x05\x06\xAC\n\x06\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x05\x06\xB3\n\x06\x03\x06\x05\x06\xB6\n\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06\xBE\n\x06\f\x06" +
		"\x0E\x06\xC1\v\x06\x03\x06\x05\x06\xC4\n\x06\x05\x06\xC6\n\x06\x03\x06" +
		"\x05\x06\xC9\n\x06\x03\x06\x03\x06\x05\x06\xCD\n\x06\x03\x06\x03\x06\x05" +
		"\x06\xD1\n\x06\x03\x06\x05\x06\xD4\n\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x05\x06\xDB\n\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x05\x06\xE3\n\x06\x05\x06\xE5\n\x06\x03\x07\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07" +
		"\xF3\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xFA\n\b\f\b\x0E\b\xFD\v" +
		"\b\x03\b\x05\b\u0100\n\b\x03\t\x05\t\u0103\n\t\x03\t\x03\t\x03\t\x07\t" +
		"\u0108\n\t\f\t\x0E\t\u010B\v\t\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\u0112" +
		"\n\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v" +
		"\u011E\n\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u0126\n\f\x03\f\x03" +
		"\f\x03\f\x03\f\x05\f\u012C\n\f\x03\f\x03\f\x05\f\u0130\n\f\x05\f\u0132" +
		"\n\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u013D" +
		"\n\r\x05\r\u013F\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u014C\n\x0E\f\x0E\x0E\x0E" +
		"\u014F\v\x0E\x03\x0E\x05\x0E\u0152\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x05\x0E\u0159\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u0166\n\x0E\f\x0E" +
		"\x0E\x0E\u0169\v\x0E\x03\x0E\x05\x0E\u016C\n\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x03\x0E\x05\x0E\u0173\n\x0E\x05\x0E\u0175\n\x0E\x03\x0F\x03\x0F" +
		"\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x07\x13\u0184\n\x13\f\x13\x0E\x13\u0187\v\x13\x05\x13" +
		"\u0189\n\x13\x03\x13\x05\x13\u018C\n\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13" +
		"\u01A3\n\x13\f\x13\x0E\x13\u01A6\v\x13\x03\x13\x05\x13\u01A9\n\x13\x03" +
		"\x13\x03\x13\x03\x13\x03\x13\x05\x13\u01AF\n\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x05\x13\u01BD\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07" +
		"\x13\u01C5\n\x13\f\x13\x0E\x13\u01C8\v\x13\x03\x14\x03\x14\x03\x15\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x07\x15\u01D5" +
		"\n\x15\f\x15\x0E\x15\u01D8\v\x15\x03\x15\x03\x15\x03\x15\x05\x15\u01DD" +
		"\n\x15\x03\x15\x03\x15\x05\x15\u01E1\n\x15\x03\x16\x03\x16\x03\x17\x03" +
		"\x17\x03\x17\x07\x17\u01E8\n\x17\f\x17\x0E\x17\u01EB\v\x17\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03" +
		"\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u01FD\n\x1A\x03\x1A" +
		"\x05\x1A\u0200\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u0210" +
		"\n\x1A\f\x1A\x0E\x1A\u0213\v\x1A\x03\x1A\x05\x1A\u0216\n\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u021F\n\x1A\f\x1A" +
		"\x0E\x1A\u0222\v\x1A\x03\x1A\x05\x1A\u0225\n\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u022F\n\x1A\f\x1A\x0E" +
		"\x1A\u0232\v\x1A\x03\x1A\x05\x1A\u0235\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u023E\n\x1A\f\x1A\x0E\x1A\u0241\v" +
		"\x1A\x03\x1A\x05\x1A\u0244\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x05\x1A\u024C\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x07\x1A\u0254\n\x1A\f\x1A\x0E\x1A\u0257\v\x1A\x03\x1A\x05\x1A\u025A" +
		"\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x07\x1A\u0264\n\x1A\f\x1A\x0E\x1A\u0267\v\x1A\x03\x1A\x05\x1A\u026A\n" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u0272\n\x1A" +
		"\f\x1A\x0E\x1A\u0275\v\x1A\x05\x1A\u0277\n\x1A\x03\x1A\x05\x1A\u027A\n" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x05\x1A\u0290\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u02B7\n\x1A\x03" +
		"\x1A\x05\x1A\u02BA\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A" +
		"\u02C1\n\x1A\f\x1A\x0E\x1A\u02C4\v\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B" +
		"\x05\x1B\u02CA\n\x1B\x03\x1B\x03\x1B\x03\x1B\x07\x1B\u02CF\n\x1B\f\x1B" +
		"\x0E\x1B\u02D2\v\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x05\x1C\u02D8\n\x1C" +
		"\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x05\x1D\u02E1" +
		"\n\x1D\x03\x1D\x05\x1D\u02E4\n\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03" +
		"\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x05\x1E\u02EF\n\x1E\x03\x1F\x03\x1F" +
		"\x05\x1F\u02F3\n\x1F\x03 \x03 \x03 \x03 \x03 \x03 \x03 \x03 \x07 \u02FD" +
		"\n \f \x0E \u0300\v \x03 \x03 \x03 \x03 \x05 \u0306\n \x03!\x03!\x03!" +
		"\x03!\x03!\x06!\u030D\n!\r!\x0E!\u030E\x03!\x03!\x03!\x03!\x03!\x03\"" +
		"\x03\"\x05\"\u0318\n\"\x03#\x03#\x03$\x03$\x03$\x03$\x03%\x03%\x05%\u0322" +
		"\n%\x03&\x03&\x03&\x03&\x06&\u0328\n&\r&\x0E&\u0329\x03&\x03&\x03\'\x03" +
		"\'\x03\'\x03\'\x07\'\u0332\n\'\f\'\x0E\'\u0335\v\'\x03\'\x03\'\x03(\x03" +
		"(\x05(\u033B\n(\x03)\x03)\x03)\x07)\u0340\n)\f)\x0E)\u0343\v)\x03*\x03" +
		"*\x03*\x03*\x03*\x03*\x05*\u034B\n*\x03+\x03+\x05+\u034F\n+\x03,\x03," +
		"\x05,\u0353\n,\x03-\x03-\x03.\x03.\x03/\x03/\x03/\x07/\u035C\n/\f/\x0E" +
		"/\u035F\v/\x030\x030\x030\x030\x050\u0365\n0\x031\x031\x031\x031\x031" +
		"\x031\x051\u036D\n1\x032\x032\x033\x033\x033\x02\x02\x04$24\x02\x02\x04" +
		"\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02" +
		"\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02." +
		"\x020\x022\x024\x026\x028\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02" +
		"J\x02L\x02N\x02P\x02R\x02T\x02V\x02X\x02Z\x02\\\x02^\x02`\x02b\x02d\x02" +
		"\x02\v\x03\x0202\x03\x02./\x03\x0238\x04\x02),<=\x03\x02),\x05\x02\x1D" +
		"\x1D),.8\x03\x02&(\x04\x02<=@A\x04\x02)->?\x02\u03DE\x02g\x03\x02\x02" +
		"\x02\x04s\x03\x02\x02\x02\x06\x84\x03\x02\x02\x02\b\x9D\x03\x02\x02\x02" +
		"\n\xE4\x03\x02\x02\x02\f\xF2\x03\x02\x02\x02\x0E\xF4\x03\x02\x02\x02\x10" +
		"\u0102\x03\x02\x02\x02\x12\u010C\x03\x02\x02\x02\x14\u011D\x03\x02\x02" +
		"\x02\x16\u0131\x03\x02\x02\x02\x18\u013E\x03\x02\x02\x02\x1A\u0174\x03" +
		"\x02\x02\x02\x1C\u0176\x03\x02\x02\x02\x1E\u0178\x03\x02\x02\x02 \u017A" +
		"\x03\x02\x02\x02\"\u017C\x03\x02\x02\x02$\u01BC\x03\x02\x02\x02&\u01C9" +
		"\x03\x02\x02\x02(\u01E0\x03\x02\x02\x02*\u01E2\x03\x02\x02\x02,\u01E4" +
		"\x03\x02\x02\x02.\u01EC\x03\x02\x02\x020\u01F1\x03\x02\x02\x022\u028F" +
		"\x03\x02\x02\x024\u02C5\x03\x02\x02\x026\u02D7\x03\x02\x02\x028\u02DC" +
		"\x03\x02\x02\x02:\u02EE\x03\x02\x02\x02<\u02F2\x03\x02\x02\x02>\u0305" +
		"\x03\x02\x02\x02@\u0307\x03\x02\x02\x02B\u0317\x03\x02\x02\x02D\u0319" +
		"\x03\x02\x02\x02F\u031B\x03\x02\x02\x02H\u0321\x03\x02\x02\x02J\u0323" +
		"\x03\x02\x02\x02L\u032D\x03\x02\x02\x02N\u033A\x03\x02\x02\x02P\u033C" +
		"\x03\x02\x02\x02R\u034A\x03\x02\x02\x02T\u034E\x03\x02\x02\x02V\u0352" +
		"\x03\x02\x02\x02X\u0354\x03\x02\x02\x02Z\u0356\x03\x02\x02\x02\\\u0358" +
		"\x03\x02\x02\x02^\u0364\x03\x02\x02\x02`\u036C\x03\x02\x02\x02b\u036E" +
		"\x03\x02\x02\x02d\u0370\x03\x02\x02\x02fh\x07D\x02\x02gf\x03\x02\x02\x02" +
		"gh\x03\x02\x02\x02hj\x03\x02\x02\x02ik\x05\x04\x03\x02ji\x03\x02\x02\x02" +
		"kl\x03\x02\x02\x02lj\x03\x02\x02\x02lm\x03\x02\x02\x02mn\x03\x02\x02\x02" +
		"no\x07\x02\x02\x03o\x03\x03\x02\x02\x02pr\x07E\x02\x02qp\x03\x02\x02\x02" +
		"ru\x03\x02\x02\x02sq\x03\x02\x02\x02st\x03\x02\x02\x02tv\x03\x02\x02\x02" +
		"us\x03\x02\x02\x02vw\x07\x03\x02\x02wx\x05\\/\x02x|\x07\x04\x02\x02y{" +
		"\x05\x06\x04\x02zy\x03\x02\x02\x02{~\x03\x02\x02\x02|z\x03\x02\x02\x02" +
		"|}\x03\x02\x02\x02}\x7F\x03\x02\x02\x02~|\x03\x02\x02\x02\x7F\x80\x07" +
		"\x05\x02\x02\x80\x05\x03\x02\x02\x02\x81\x83\x07E\x02\x02\x82\x81\x03" +
		"\x02\x02\x02\x83\x86\x03\x02\x02\x02\x84\x82\x03\x02\x02\x02\x84\x85\x03" +
		"\x02\x02\x02\x85\x87\x03\x02\x02\x02\x86\x84\x03\x02\x02\x02\x87\x88\x05" +
		"\b\x05\x02\x88\x07\x03\x02\x02\x02\x89\x8A\x07\x06\x02\x02\x8A\x8B\x05" +
		"\\/\x02\x8B\x8C\x07\x07\x02\x02\x8C\x8D\x05$\x13\x02\x8D\x9E\x03\x02\x02" +
		"\x02\x8E\x8F\x07\b\x02\x02\x8F\x90\x05\\/\x02\x90\x91\x07\x07\x02\x02" +
		"\x91\x92\x05$\x13\x02\x92\x9E\x03\x02\x02\x02\x93\x94\x07\t\x02\x02\x94" +
		"\x95\x05B\"\x02\x95\x96\x079\x02\x02\x96\x97\x052\x1A\x02\x97\x9E\x03" +
		"\x02\x02\x02\x98\x9E\x05\x1A\x0E\x02\x99\x9E\x05\n\x06\x02\x9A\x9E\x05" +
		"\f\x07\x02\x9B\x9E\x05\x16\f\x02\x9C\x9E\x05\x18\r\x02\x9D\x89\x03\x02" +
		"\x02\x02\x9D\x8E\x03\x02\x02\x02\x9D\x93\x03\x02\x02\x02\x9D\x98\x03\x02" +
		"\x02\x02\x9D\x99\x03\x02\x02\x02\x9D\x9A\x03\x02\x02\x02\x9D\x9B\x03\x02" +
		"\x02\x02\x9D\x9C\x03\x02\x02\x02\x9E\t\x03\x02\x02\x02\x9F\xA0\x05\x14" +
		"\v\x02\xA0\xA1\x05T+\x02\xA1\xA2\x07:\x02\x02\xA2\xA7\x05F$\x02\xA3\xA4" +
		"\x07\n\x02\x02\xA4\xA6\x05F$\x02\xA5\xA3\x03\x02\x02\x02\xA6\xA9\x03\x02" +
		"\x02\x02\xA7\xA5\x03\x02\x02\x02\xA7\xA8\x03\x02\x02\x02\xA8\xAB\x03\x02" +
		"\x02\x02\xA9\xA7\x03\x02\x02\x02\xAA\xAC\x07\n\x02\x02\xAB\xAA\x03\x02" +
		"\x02\x02\xAB\xAC\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02\xAD\xAE\x07;" +
		"\x02\x02\xAE\xAF\x07\x07\x02\x02\xAF\xB2\x05$\x13\x02\xB0\xB1\x079\x02" +
		"\x02\xB1\xB3\x052\x1A\x02\xB2\xB0\x03\x02\x02\x02\xB2\xB3\x03\x02\x02" +
		"\x02\xB3\xB5\x03\x02\x02\x02\xB4\xB6\x07\v\x02\x02\xB5\xB4\x03\x02\x02" +
		"\x02\xB5\xB6\x03\x02\x02\x02\xB6\xE5\x03\x02\x02\x02\xB7\xB8\x05\x14\v" +
		"\x02\xB8\xC8\x05T+\x02\xB9\xC5\x07:\x02\x02\xBA\xBF\x05D#\x02\xBB\xBC" +
		"\x07\n\x02\x02\xBC\xBE\x05D#\x02\xBD\xBB\x03\x02\x02\x02\xBE\xC1\x03\x02" +
		"\x02\x02\xBF\xBD\x03\x02\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC3\x03\x02" +
		"\x02\x02\xC1\xBF\x03\x02\x02\x02\xC2\xC4\x07\n\x02\x02\xC3\xC2\x03\x02" +
		"\x02\x02\xC3\xC4\x03\x02\x02\x02\xC4\xC6\x03\x02\x02\x02\xC5\xBA\x03\x02" +
		"\x02\x02\xC5\xC6\x03\x02\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\xC9\x07;" +
		"\x02\x02\xC8\xB9\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02\xC9\xCC\x03\x02" +
		"\x02\x02\xCA\xCB\x07\x07\x02\x02\xCB\xCD\x05$\x13\x02\xCC\xCA\x03\x02" +
		"\x02\x02\xCC\xCD\x03\x02\x02\x02\xCD\xD0\x03\x02\x02\x02\xCE\xCF\x079" +
		"\x02\x02\xCF\xD1\x052\x1A\x02\xD0\xCE\x03\x02\x02\x02\xD0\xD1\x03\x02" +
		"\x02\x02\xD1\xD3\x03\x02\x02\x02\xD2\xD4\x07\v\x02\x02\xD3\xD2\x03\x02" +
		"\x02\x02\xD3\xD4\x03\x02\x02\x02\xD4\xE5\x03\x02\x02\x02\xD5\xD6\x07\f" +
		"\x02\x02\xD6\xD7\x05H%\x02\xD7\xD8\x079\x02\x02\xD8\xDA\x052\x1A\x02\xD9" +
		"\xDB\x07\v\x02\x02\xDA\xD9\x03\x02\x02\x02\xDA\xDB\x03\x02\x02\x02\xDB" +
		"\xE5\x03\x02\x02\x02\xDC\xDD\x07\r\x02\x02\xDD\xDE\x07\f\x02\x02\xDE\xDF" +
		"\x05H%\x02\xDF\xE0\x079\x02\x02\xE0\xE2\x052\x1A\x02\xE1\xE3\x07\v\x02" +
		"\x02\xE2\xE1\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3\xE5\x03\x02\x02" +
		"\x02\xE4\x9F\x03\x02\x02\x02\xE4\xB7\x03\x02\x02\x02\xE4\xD5\x03\x02\x02" +
		"\x02\xE4\xDC\x03\x02\x02\x02\xE5\v\x03\x02\x02\x02\xE6\xE7\x07\x0E\x02" +
		"\x02\xE7\xF3\x05\\/\x02\xE8\xE9\x07\x0E\x02\x02\xE9\xEA\x05\x0E\b\x02" +
		"\xEA\xEB\x079\x02\x02\xEB\xEC\x05\x10\t\x02\xEC\xF3\x03\x02\x02\x02\xED" +
		"\xEE\x07\x0E\x02\x02\xEE\xEF\x05\x0E\b\x02\xEF\xF0\x079\x02\x02\xF0\xF1" +
		"\x05$\x13\x02\xF1\xF3\x03\x02\x02\x02\xF2\xE6\x03\x02\x02\x02\xF2\xE8" +
		"\x03\x02\x02\x02\xF2\xED\x03\x02\x02\x02\xF3\r\x03\x02\x02\x02\xF4\xFF" +
		"\x05\\/\x02\xF5\xF6\x07\x0F\x02\x02\xF6\xFB\x07B\x02\x02\xF7\xF8\x07\n" +
		"\x02\x02\xF8\xFA\x07B\x02\x02\xF9\xF7\x03\x02\x02\x02\xFA\xFD\x03\x02" +
		"\x02\x02\xFB\xF9\x03\x02\x02\x02\xFB\xFC\x03\x02\x02\x02\xFC\xFE\x03\x02" +
		"\x02\x02\xFD\xFB\x03\x02\x02\x02\xFE\u0100\x07\x10\x02\x02\xFF\xF5\x03" +
		"\x02\x02\x02\xFF\u0100\x03\x02\x02\x02\u0100\x0F\x03\x02\x02\x02\u0101" +
		"\u0103\x07\x11\x02\x02\u0102\u0101\x03\x02\x02\x02\u0102\u0103\x03\x02" +
		"\x02\x02\u0103\u0104\x03\x02\x02\x02\u0104\u0109\x05\x12\n\x02\u0105\u0106" +
		"\x07\x11\x02\x02\u0106\u0108\x05\x12\n\x02\u0107\u0105\x03\x02\x02\x02" +
		"\u0108\u010B\x03\x02\x02\x02\u0109\u0107\x03\x02\x02\x02\u0109\u010A\x03" +
		"\x02\x02\x02\u010A\x11\x03\x02\x02\x02\u010B\u0109\x03\x02\x02\x02\u010C" +
		"\u0111\x05^0\x02\u010D\u010E\x07:\x02\x02\u010E\u010F\x05$\x13\x02\u010F" +
		"\u0110\x07;\x02\x02\u0110\u0112\x03\x02\x02\x02\u0111\u010D\x03\x02\x02" +
		"\x02\u0111\u0112\x03\x02\x02\x02\u0112\x13\x03\x02\x02\x02\u0113\u011E" +
		"\x07\f\x02\x02\u0114\u011E\x07\x12\x02\x02\u0115\u0116\x07\r\x02\x02\u0116" +
		"\u011E\x07\f\x02\x02\u0117\u0118\x07\r\x02\x02\u0118\u011E\x07\x12\x02" +
		"\x02\u0119\u011E\x07\x13\x02\x02\u011A\u011E\x07\x14\x02\x02\u011B\u011E" +
		"\x07\x15\x02\x02\u011C\u011E\x07\x16\x02\x02\u011D\u0113\x03\x02\x02\x02" +
		"\u011D\u0114\x03\x02\x02\x02\u011D\u0115\x03\x02\x02\x02\u011D\u0117\x03" +
		"\x02\x02\x02\u011D\u0119\x03\x02\x02\x02\u011D\u011A\x03\x02\x02\x02\u011D" +
		"\u011B\x03\x02\x02\x02\u011D\u011C\x03\x02\x02\x02\u011E\x15\x03\x02\x02" +
		"\x02\u011F\u0120\x07>\x02\x02\u0120\u0121\x05\x1E\x10\x02\u0121\u0122" +
		"\x07\x17\x02\x02\u0122\u0125\x05N(\x02\u0123\u0124\x07@\x02\x02\u0124" +
		"\u0126\x05\"\x12\x02\u0125\u0123\x03\x02\x02\x02\u0125\u0126\x03\x02\x02" +
		"\x02\u0126\u0132\x03\x02\x02\x02\u0127\u0128\x07>\x02\x02\u0128\u012B" +
		"\x05\x1E\x10\x02\u0129\u012A\x07A\x02\x02\u012A\u012C\x05\x1E\x10\x02" +
		"\u012B\u0129\x03\x02\x02\x02\u012B\u012C\x03\x02\x02\x02\u012C\u012F\x03" +
		"\x02\x02\x02\u012D\u012E\x07@\x02\x02\u012E\u0130\x05\"\x12\x02\u012F" +
		"\u012D\x03\x02\x02\x02\u012F\u0130\x03\x02\x02\x02\u0130\u0132\x03\x02" +
		"\x02\x02\u0131\u011F\x03\x02\x02\x02\u0131\u0127\x03\x02\x02\x02\u0132" +
		"\x17\x03\x02\x02\x02\u0133\u0134\x07?\x02\x02\u0134\u0135\x05\x1E\x10" +
		"\x02\u0135\u0136\x07\x17\x02\x02\u0136\u0137\x05N(\x02\u0137\u013F\x03" +
		"\x02\x02\x02\u0138\u0139\x07?\x02\x02\u0139\u013C\x05\x1E\x10\x02\u013A" +
		"\u013B\x07A\x02\x02\u013B\u013D\x05\x1E\x10\x02\u013C\u013A\x03\x02\x02" +
		"\x02\u013C\u013D\x03\x02\x02\x02\u013D\u013F\x03\x02\x02\x02\u013E\u0133" +
		"\x03\x02\x02\x02\u013E\u0138\x03\x02\x02\x02\u013F\x19\x03\x02\x02\x02" +
		"\u0140\u0141\x07>\x02\x02\u0141\u0142\x05\x1C\x0F\x02\u0142\u0143\x07" +
		":\x02\x02\u0143\u0144\x05\x1E\x10\x02\u0144\u0145\x079\x02\x02\u0145\u014D" +
		"\x052\x1A\x02\u0146\u0147\x07\n\x02\x02\u0147\u0148\x05\x1E\x10\x02\u0148" +
		"\u0149\x079\x02\x02\u0149\u014A\x052\x1A\x02\u014A\u014C\x03\x02\x02\x02" +
		"\u014B\u0146\x03\x02\x02\x02\u014C\u014F\x03\x02\x02\x02\u014D\u014B\x03" +
		"\x02\x02\x02\u014D\u014E\x03\x02\x02\x02\u014E\u0151\x03\x02\x02\x02\u014F" +
		"\u014D\x03\x02\x02\x02\u0150\u0152\x07\n\x02\x02\u0151\u0150\x03\x02\x02" +
		"\x02\u0151\u0152\x03\x02\x02\x02\u0152\u0153\x03\x02\x02\x02\u0153\u0154" +
		"\x07;\x02\x02\u0154\u0155\x07\x17\x02\x02\u0155\u0158\x070\x02\x02\u0156" +
		"\u0157\x07@\x02\x02\u0157\u0159\x05\"\x12\x02\u0158\u0156\x03\x02\x02" +
		"\x02\u0158\u0159\x03\x02\x02\x02\u0159\u0175\x03\x02\x02\x02\u015A\u015B" +
		"\x07>\x02\x02\u015B\u015C\x05\x1C\x0F\x02\u015C\u015D\x07:\x02\x02\u015D" +
		"\u015E\x05\x1E\x10\x02\u015E\u015F\x079\x02\x02\u015F\u0167\x052\x1A\x02" +
		"\u0160\u0161\x07\n\x02\x02\u0161\u0162\x05\x1E\x10\x02\u0162\u0163\x07" +
		"9\x02\x02\u0163\u0164\x052\x1A\x02\u0164\u0166\x03\x02\x02\x02\u0165\u0160" +
		"\x03\x02\x02\x02\u0166\u0169\x03\x02\x02\x02\u0167\u0165\x03\x02\x02\x02" +
		"\u0167\u0168\x03\x02\x02\x02\u0168\u016B\x03\x02\x02\x02\u0169\u0167\x03" +
		"\x02\x02\x02\u016A\u016C\x07\n\x02\x02\u016B\u016A\x03\x02\x02\x02\u016B" +
		"\u016C\x03\x02\x02\x02\u016C\u016D\x03\x02\x02\x02\u016D\u016E\x07;\x02" +
		"\x02\u016E\u016F\x07A\x02\x02\u016F\u0172\x05 \x11\x02\u0170\u0171\x07" +
		"@\x02\x02\u0171\u0173\x05\"\x12\x02\u0172\u0170\x03\x02\x02\x02\u0172" +
		"\u0173\x03\x02\x02\x02\u0173\u0175\x03\x02\x02\x02\u0174\u0140\x03\x02" +
		"\x02\x02\u0174\u015A\x03\x02\x02\x02\u0175\x1B\x03\x02\x02\x02\u0176\u0177" +
		"\x05\\/\x02\u0177\x1D\x03\x02\x02\x02\u0178\u0179\x05\\/\x02\u0179\x1F" +
		"\x03\x02\x02\x02\u017A\u017B\x05\\/\x02\u017B!\x03\x02\x02\x02\u017C\u017D" +
		"\x07&\x02\x02\u017D#\x03\x02\x02\x02\u017E\u017F\b\x13\x01\x02\u017F\u0188" +
		"\x07:\x02\x02\u0180\u0185\x05$\x13\x02\u0181\u0182\x07\n\x02\x02\u0182" +
		"\u0184\x05$\x13\x02\u0183\u0181\x03\x02\x02\x02\u0184\u0187\x03\x02\x02" +
		"\x02\u0185\u0183\x03\x02\x02\x02\u0185\u0186\x03\x02\x02\x02\u0186\u0189" +
		"\x03\x02\x02\x02\u0187\u0185\x03\x02\x02\x02\u0188\u0180\x03\x02\x02\x02" +
		"\u0188\u0189\x03\x02\x02\x02\u0189\u018B\x03\x02\x02\x02\u018A\u018C\x07" +
		"\n\x02\x02\u018B\u018A\x03\x02\x02\x02\u018B\u018C\x03\x02\x02\x02\u018C" +
		"\u018D\x03\x02\x02\x02\u018D\u018E\x07;\x02\x02\u018E\u018F\x07\x19\x02" +
		"\x02\u018F\u01BD\x05$\x13\x10\u0190\u0191\x07<\x02\x02\u0191\u0192\x07" +
		"\x0F\x02\x02\u0192\u0193\x05$\x13\x02\u0193\u0194\x07\x10\x02\x02\u0194" +
		"\u01BD\x03\x02\x02\x02\u0195\u0196\x07=\x02\x02\u0196\u0197\x07\x0F\x02" +
		"\x02\u0197\u0198\x05$\x13\x02\u0198\u0199\x07\x10\x02\x02\u0199\u01BD" +
		"\x03\x02\x02\x02\u019A\u019B\x07:\x02\x02\u019B\u01BD\x07;\x02\x02\u019C" +
		"\u019D\x07:\x02\x02\u019D\u019E\x05$\x13\x02\u019E\u019F\x07\n\x02\x02" +
		"\u019F\u01A4\x05$\x13\x02\u01A0\u01A1\x07\n\x02\x02\u01A1\u01A3\x05$\x13" +
		"\x02\u01A2\u01A0\x03\x02\x02\x02\u01A3\u01A6\x03\x02\x02\x02\u01A4\u01A2" +
		"\x03\x02\x02\x02\u01A4\u01A5\x03\x02\x02\x02\u01A5\u01A8\x03\x02\x02\x02" +
		"\u01A6\u01A4\x03\x02\x02\x02\u01A7\u01A9\x07\n\x02\x02\u01A8\u01A7\x03" +
		"\x02\x02\x02\u01A8\u01A9\x03\x02\x02\x02\u01A9\u01AA\x03\x02\x02\x02\u01AA" +
		"\u01AB\x07;\x02\x02\u01AB\u01BD\x03\x02\x02\x02\u01AC\u01AE\x07\x04\x02" +
		"\x02\u01AD\u01AF\x05(\x15\x02\u01AE\u01AD\x03\x02\x02\x02\u01AE\u01AF" +
		"\x03\x02\x02\x02\u01AF\u01B0\x03\x02\x02\x02\u01B0\u01BD\x07\x05\x02\x02" +
		"\u01B1\u01BD\x07\x1A\x02\x02\u01B2\u01BD\x07\x1B\x02\x02\u01B3\u01BD\x07" +
		"\x1C\x02\x02\u01B4\u01BD\x05&\x14\x02\u01B5\u01BD\x05\\/\x02\u01B6\u01B7" +
		"\x07:\x02\x02\u01B7\u01B8\x05$\x13\x02\u01B8\u01B9\x07;\x02\x02\u01B9" +
		"\u01BD\x03\x02\x02\x02\u01BA\u01BD\x05.\x18\x02\u01BB\u01BD\x050\x19\x02" +
		"\u01BC\u017E\x03\x02\x02\x02\u01BC\u0190\x03\x02\x02\x02\u01BC\u0195\x03" +
		"\x02\x02\x02\u01BC\u019A\x03\x02\x02\x02\u01BC\u019C\x03\x02\x02\x02\u01BC" +
		"\u01AC\x03\x02\x02\x02\u01BC\u01B1\x03\x02\x02\x02\u01BC\u01B2\x03\x02" +
		"\x02\x02\u01BC\u01B3\x03\x02\x02\x02\u01BC\u01B4\x03\x02\x02\x02\u01BC" +
		"\u01B5\x03\x02\x02\x02\u01BC\u01B6\x03\x02\x02\x02\u01BC\u01BA\x03\x02" +
		"\x02\x02\u01BC\u01BB\x03\x02\x02\x02\u01BD\u01C6\x03\x02\x02\x02\u01BE" +
		"\u01BF\f\x12\x02\x02\u01BF\u01C0\x07\x18\x02\x02\u01C0\u01C5\x05$\x13" +
		"\x12\u01C1\u01C2\f\x11\x02\x02\u01C2\u01C3\x07\x19\x02\x02\u01C3\u01C5" +
		"\x05$\x13\x11\u01C4\u01BE\x03\x02\x02\x02\u01C4\u01C1\x03\x02\x02\x02" +
		"\u01C5\u01C8\x03\x02\x02\x02\u01C6\u01C4\x03\x02\x02\x02\u01C6\u01C7\x03" +
		"\x02\x02\x02\u01C7%\x03\x02\x02\x02\u01C8\u01C6\x03\x02\x02\x02\u01C9" +
		"\u01CA\x07B\x02\x02\u01CA\'\x03\x02\x02\x02\u01CB\u01CC\x05*\x16\x02\u01CC" +
		"\u01CD\x07\x07\x02\x02\u01CD\u01CE\x05$\x13\x02\u01CE\u01D6\x03\x02\x02" +
		"\x02\u01CF\u01D0\x07\n\x02\x02\u01D0\u01D1\x05*\x16\x02\u01D1\u01D2\x07" +
		"\x07\x02\x02\u01D2\u01D3\x05$";
	private static readonly _serializedATNSegment1: string =
		"\x13\x02\u01D3\u01D5\x03\x02\x02\x02\u01D4\u01CF\x03\x02\x02\x02\u01D5" +
		"\u01D8\x03\x02\x02\x02\u01D6\u01D4\x03\x02\x02\x02\u01D6\u01D7\x03\x02" +
		"\x02\x02\u01D7\u01DC\x03\x02\x02\x02\u01D8\u01D6\x03\x02\x02\x02\u01D9" +
		"\u01DD\x07\n\x02\x02\u01DA\u01DB\x07\x11\x02\x02\u01DB\u01DD\x05`1\x02" +
		"\u01DC\u01D9\x03\x02\x02\x02\u01DC\u01DA\x03\x02\x02\x02\u01DC\u01DD\x03" +
		"\x02\x02\x02\u01DD\u01E1\x03\x02\x02\x02\u01DE\u01DF\x07\x11\x02\x02\u01DF" +
		"\u01E1\x05`1\x02\u01E0\u01CB\x03\x02\x02\x02\u01E0\u01DE\x03\x02\x02\x02" +
		"\u01E1)\x03\x02\x02\x02\u01E2\u01E3\x05^0\x02\u01E3+\x03\x02\x02\x02\u01E4" +
		"\u01E9\x05$\x13\x02\u01E5\u01E6\x07\n\x02\x02\u01E6\u01E8\x05$\x13\x02" +
		"\u01E7\u01E5\x03\x02\x02\x02\u01E8\u01EB\x03\x02\x02\x02\u01E9\u01E7\x03" +
		"\x02\x02\x02\u01E9\u01EA\x03\x02\x02\x02\u01EA-\x03\x02\x02\x02\u01EB" +
		"\u01E9\x03\x02\x02\x02\u01EC\u01ED\x05\\/\x02\u01ED\u01EE\x07\x0F\x02" +
		"\x02\u01EE\u01EF\x05,\x17\x02\u01EF\u01F0\x07\x10\x02\x02\u01F0/\x03\x02" +
		"\x02\x02\u01F1\u01F2\x05\\/\x02\u01F2\u01F3\x07:\x02\x02\u01F3\u01F4\x05" +
		",\x17\x02\u01F4\u01F5\x07;\x02\x02\u01F5\u01F6\b\x19\x01\x02\u01F61\x03" +
		"\x02\x02\x02\u01F7\u01F8\b\x1A\x01\x02\u01F8\u0290\x05<\x1F\x02\u01F9" +
		"\u01FA\x05T+\x02\u01FA\u01FC\x07:\x02\x02\u01FB\u01FD\x05P)\x02\u01FC" +
		"\u01FB\x03\x02\x02\x02\u01FC\u01FD\x03\x02\x02\x02\u01FD\u01FF\x03\x02" +
		"\x02\x02\u01FE\u0200\x07\n\x02\x02\u01FF\u01FE\x03\x02\x02\x02\u01FF\u0200" +
		"\x03\x02\x02\x02\u0200\u0201\x03\x02\x02\x02\u0201\u0202\x07;\x02\x02" +
		"\u0202\u0290\x03\x02\x02\x02\u0203\u0204\x07/\x02\x02\u0204\u0290\x05" +
		"2\x1A\x1B\u0205\u0206\x05\\/\x02\u0206\u0207\x07\x1E\x02\x02\u0207\u0208" +
		"\x079\x02\x02\u0208\u0209\x052\x1A\x17\u0209\u0290\x03\x02\x02\x02\u020A" +
		"\u020B\x07)\x02\x02\u020B\u020C\x07\x04\x02\x02\u020C\u0211\x052\x1A\x02" +
		"\u020D\u020E\x07\n\x02\x02\u020E\u0210\x052\x1A\x02\u020F\u020D\x03\x02" +
		"\x02\x02\u0210\u0213\x03\x02\x02\x02\u0211\u020F\x03\x02\x02\x02\u0211" +
		"\u0212\x03\x02\x02\x02\u0212\u0215\x03\x02\x02\x02\u0213\u0211\x03\x02" +
		"\x02\x02\u0214\u0216\x07\n\x02\x02\u0215\u0214\x03\x02\x02\x02\u0215\u0216" +
		"\x03\x02\x02\x02\u0216\u0217\x03\x02\x02\x02\u0217\u0218\x07\x05\x02\x02" +
		"\u0218\u0290\x03\x02\x02\x02\u0219\u021A\x07*\x02\x02\u021A\u021B\x07" +
		"\x04\x02\x02\u021B\u0220\x052\x1A\x02\u021C\u021D\x07\n\x02\x02\u021D" +
		"\u021F\x052\x1A\x02\u021E\u021C\x03\x02\x02\x02\u021F\u0222\x03\x02\x02" +
		"\x02\u0220\u021E\x03\x02\x02\x02\u0220\u0221\x03\x02\x02\x02\u0221\u0224" +
		"\x03\x02\x02\x02\u0222\u0220\x03\x02\x02\x02\u0223\u0225\x07\n\x02\x02" +
		"\u0224\u0223\x03\x02\x02\x02\u0224\u0225\x03\x02\x02\x02\u0225\u0226\x03" +
		"\x02\x02\x02\u0226\u0227\x07\x05\x02\x02\u0227\u0290\x03\x02\x02\x02\u0228" +
		"\u0290\x054\x1B\x02\u0229\u022A\x07\x1F\x02\x02\u022A\u022B\x07\x04\x02" +
		"\x02\u022B\u0230\x052\x1A\x02\u022C\u022D\x07\n\x02\x02\u022D\u022F\x05" +
		"2\x1A\x02\u022E\u022C\x03\x02\x02\x02\u022F\u0232\x03\x02\x02\x02\u0230" +
		"\u022E\x03\x02\x02\x02\u0230\u0231\x03\x02\x02\x02\u0231\u0234\x03\x02" +
		"\x02\x02\u0232\u0230\x03\x02\x02\x02\u0233\u0235\x07\n\x02\x02\u0234\u0233" +
		"\x03\x02\x02\x02\u0234\u0235\x03\x02\x02\x02\u0235\u0236\x03\x02\x02\x02" +
		"\u0236\u0237\x07\x05\x02\x02\u0237\u0290\x03\x02\x02\x02\u0238\u0239\x07" +
		" \x02\x02\u0239\u023A\x07\x04\x02\x02\u023A\u023F\x052\x1A\x02\u023B\u023C" +
		"\x07\n\x02\x02\u023C\u023E\x052\x1A\x02\u023D\u023B\x03\x02\x02\x02\u023E" +
		"\u0241\x03\x02\x02\x02\u023F\u023D\x03\x02\x02\x02\u023F\u0240\x03\x02" +
		"\x02\x02\u0240\u0243\x03\x02\x02\x02\u0241\u023F\x03\x02\x02\x02\u0242" +
		"\u0244\x07\n\x02\x02\u0243\u0242\x03\x02\x02\x02\u0243\u0244\x03\x02\x02" +
		"\x02\u0244\u0245\x03\x02\x02\x02\u0245\u0246\x07\x05\x02\x02\u0246\u0290" +
		"\x03\x02\x02\x02\u0247\u024C\x05\\/\x02\u0248\u024C\x07(\x02\x02\u0249" +
		"\u024C\x07\'\x02\x02\u024A\u024C\x07&\x02\x02\u024B\u0247\x03\x02\x02" +
		"\x02\u024B\u0248\x03\x02\x02\x02\u024B\u0249\x03\x02\x02\x02\u024B\u024A" +
		"\x03\x02\x02\x02\u024C\u0290\x03\x02\x02\x02\u024D\u024E\x07:\x02\x02" +
		"\u024E\u024F\x052\x1A\x02\u024F\u0250\x07\n\x02\x02\u0250\u0255\x052\x1A" +
		"\x02\u0251\u0252\x07\n\x02\x02\u0252\u0254\x052\x1A\x02\u0253\u0251\x03" +
		"\x02\x02\x02\u0254\u0257\x03\x02\x02\x02\u0255\u0253\x03\x02\x02\x02\u0255" +
		"\u0256\x03\x02\x02\x02\u0256\u0259\x03\x02\x02\x02\u0257\u0255\x03\x02" +
		"\x02\x02\u0258\u025A\x07\n\x02\x02\u0259\u0258\x03\x02\x02\x02\u0259\u025A" +
		"\x03\x02\x02\x02\u025A\u025B\x03\x02\x02\x02\u025B\u025C\x07;\x02\x02" +
		"\u025C\u0290\x03\x02\x02\x02\u025D\u025E\x07:\x02\x02\u025E\u0290\x07" +
		";\x02\x02\u025F\u0260\x07\x04\x02\x02\u0260\u0265\x05R*\x02\u0261\u0262" +
		"\x07\n\x02\x02\u0262\u0264\x05R*\x02\u0263\u0261\x03\x02\x02\x02\u0264" +
		"\u0267\x03\x02\x02\x02\u0265\u0263\x03\x02\x02\x02\u0265\u0266\x03\x02" +
		"\x02\x02\u0266\u0269\x03\x02\x02\x02\u0267\u0265\x03\x02\x02\x02\u0268" +
		"\u026A\x07\n\x02\x02\u0269\u0268\x03\x02\x02\x02\u0269\u026A\x03\x02\x02" +
		"\x02\u026A\u026B\x03\x02\x02\x02\u026B\u026C\x07\x05\x02\x02\u026C\u0290" +
		"\x03\x02\x02\x02\u026D\u0276\x07\x0F\x02\x02\u026E\u0273\x052\x1A\x02" +
		"\u026F\u0270\x07\n\x02\x02\u0270\u0272\x052\x1A\x02\u0271\u026F\x03\x02" +
		"\x02\x02\u0272\u0275\x03\x02\x02\x02\u0273\u0271\x03\x02\x02\x02\u0273" +
		"\u0274\x03\x02\x02\x02\u0274\u0277\x03\x02\x02\x02\u0275\u0273\x03\x02" +
		"\x02\x02\u0276\u026E\x03\x02\x02\x02\u0276\u0277\x03\x02\x02\x02\u0277" +
		"\u0279\x03\x02\x02\x02\u0278\u027A\x07\n\x02\x02\u0279\u0278\x03\x02\x02" +
		"\x02\u0279\u027A\x03\x02\x02\x02\u027A\u027B\x03\x02\x02\x02\u027B\u0290" +
		"\x07\x10\x02\x02\u027C\u027D\x07!\x02\x02\u027D\u027E\x07:\x02\x02\u027E" +
		"\u027F\x052\x1A\x02\u027F\u0280\x07;\x02\x02\u0280\u0281\x052\x1A\x02" +
		"\u0281\u0282\x07\"\x02\x02\u0282\u0283\x052\x1A\x06\u0283\u0290\x03\x02" +
		"\x02\x02\u0284\u0285\x05\n\x06\x02\u0285\u0286\x052\x1A\x05\u0286\u0290" +
		"\x03\x02\x02\x02\u0287\u0288\x07:\x02\x02\u0288\u0289\x052\x1A\x02\u0289" +
		"\u028A\x07;\x02\x02\u028A\u0290\x03\x02\x02\x02\u028B\u028C\x07\x04\x02" +
		"\x02\u028C\u028D\x052\x1A\x02\u028D\u028E\x07\x05\x02\x02\u028E\u0290" +
		"\x03\x02\x02\x02\u028F\u01F7\x03\x02\x02\x02\u028F\u01F9\x03\x02\x02\x02" +
		"\u028F\u0203\x03\x02\x02\x02\u028F\u0205\x03\x02\x02\x02\u028F\u020A\x03" +
		"\x02\x02\x02\u028F\u0219\x03\x02\x02\x02\u028F\u0228\x03\x02\x02\x02\u028F" +
		"\u0229\x03\x02\x02\x02\u028F\u0238\x03\x02\x02\x02\u028F\u024B\x03\x02" +
		"\x02\x02\u028F\u024D\x03\x02\x02\x02\u028F\u025D\x03\x02\x02\x02\u028F" +
		"\u025F\x03\x02\x02\x02\u028F\u026D\x03\x02\x02\x02\u028F\u027C\x03\x02" +
		"\x02\x02\u028F\u0284\x03\x02\x02\x02\u028F\u0287\x03\x02\x02\x02\u028F" +
		"\u028B\x03\x02\x02\x02\u0290\u02C2\x03\x02\x02\x02\u0291\u0292\f\x1C\x02" +
		"\x02\u0292\u0293\x07\x1D\x02\x02\u0293\u02C1\x052\x1A\x1C\u0294\u0295" +
		"\f\x1A\x02\x02\u0295\u0296\t\x02\x02\x02\u0296\u02C1\x052\x1A\x1B\u0297" +
		"\u0298\f\x19\x02\x02\u0298\u0299\t\x03\x02\x02\u0299\u02C1\x052\x1A\x1A" +
		"\u029A\u029B\f\x18\x02\x02\u029B\u029C\t\x04\x02\x02\u029C\u02C1\x052" +
		"\x1A\x19\u029D\u029E\f\x16\x02\x02\u029E\u029F\x079\x02\x02\u029F\u02A0" +
		"\x052\x1A\x17\u02A0\u02A1\b\x1A\x01\x02\u02A1\u02C1\x03\x02\x02\x02\u02A2" +
		"\u02A3\f\x14\x02\x02\u02A3\u02A4\x07)\x02\x02\u02A4\u02C1\x052\x1A\x15" +
		"\u02A5\u02A6\f\x12\x02\x02\u02A6\u02A7\x07*\x02\x02\u02A7\u02C1\x052\x1A" +
		"\x13\u02A8\u02A9\f\x11\x02\x02\u02A9\u02AA\x07+\x02\x02\u02AA\u02C1\x05" +
		"2\x1A\x12\u02AB\u02AC\f\x10\x02\x02\u02AC\u02AD\x07,\x02\x02\u02AD\u02C1" +
		"\x052\x1A\x11\u02AE\u02AF\f\t\x02\x02\u02AF\u02B0\x07\x18\x02\x02\u02B0" +
		"\u02C1\x052\x1A\n\u02B1\u02B2\f \x02\x02\u02B2\u02B3\x07\x17\x02\x02\u02B3" +
		"\u02B9\x05V,\x02\u02B4\u02B6\x07:\x02\x02\u02B5\u02B7\x05P)\x02\u02B6" +
		"\u02B5\x03\x02\x02\x02\u02B6\u02B7\x03\x02\x02\x02\u02B7\u02B8\x03\x02" +
		"\x02\x02\u02B8\u02BA\x07;\x02\x02\u02B9\u02B4\x03\x02\x02\x02\u02B9\u02BA" +
		"\x03\x02\x02\x02\u02BA\u02C1\x03\x02\x02\x02\u02BB\u02BC\f\x1D\x02\x02" +
		"\u02BC\u02BD\x07\x0F\x02\x02\u02BD\u02BE\x052\x1A\x02\u02BE\u02BF\x07" +
		"\x10\x02\x02\u02BF\u02C1\x03\x02\x02\x02\u02C0\u0291\x03\x02\x02\x02\u02C0" +
		"\u0294\x03\x02\x02\x02\u02C0\u0297\x03\x02\x02\x02\u02C0\u029A\x03\x02" +
		"\x02\x02\u02C0\u029D\x03\x02\x02\x02\u02C0\u02A2\x03\x02\x02\x02\u02C0" +
		"\u02A5\x03\x02\x02\x02\u02C0\u02A8\x03\x02\x02\x02\u02C0\u02AB\x03\x02" +
		"\x02\x02\u02C0\u02AE\x03\x02\x02\x02\u02C0\u02B1\x03\x02\x02\x02\u02C0" +
		"\u02BB\x03\x02\x02\x02\u02C1\u02C4\x03\x02\x02\x02\u02C2\u02C0\x03\x02" +
		"\x02\x02\u02C2\u02C3\x03\x02\x02\x02\u02C33\x03\x02\x02\x02\u02C4\u02C2" +
		"\x03\x02\x02\x02\u02C5\u02C6\x07-\x02\x02\u02C6\u02C7\x052\x1A\x02\u02C7" +
		"\u02C9\x07\x04\x02\x02\u02C8\u02CA\x07\x11\x02\x02\u02C9\u02C8\x03\x02" +
		"\x02\x02\u02C9\u02CA\x03\x02\x02\x02\u02CA\u02CB\x03\x02\x02\x02\u02CB" +
		"\u02D0\x056\x1C\x02\u02CC\u02CD\x07\x11\x02\x02\u02CD\u02CF\x056\x1C\x02" +
		"\u02CE\u02CC\x03\x02\x02\x02\u02CF\u02D2\x03\x02\x02\x02\u02D0\u02CE\x03" +
		"\x02\x02\x02\u02D0\u02D1\x03\x02\x02\x02\u02D1\u02D3\x03\x02\x02\x02\u02D2" +
		"\u02D0\x03\x02\x02\x02\u02D3\u02D4\x07\x05\x02\x02\u02D45\x03\x02\x02" +
		"\x02\u02D5\u02D8\x058\x1D\x02\u02D6\u02D8\x07#\x02\x02\u02D7\u02D5\x03" +
		"\x02\x02\x02\u02D7\u02D6\x03\x02\x02\x02\u02D8\u02D9\x03\x02\x02\x02\u02D9" +
		"\u02DA\x07\x19\x02\x02\u02DA\u02DB\x052\x1A\x02\u02DB7\x03\x02\x02\x02" +
		"\u02DC\u02E3\x05^0\x02\u02DD\u02E0\x07:\x02\x02\u02DE\u02E1\x05^0\x02" +
		"\u02DF\u02E1\x07#\x02\x02\u02E0\u02DE\x03\x02\x02\x02\u02E0\u02DF\x03" +
		"\x02\x02\x02\u02E1\u02E2\x03\x02\x02\x02\u02E2\u02E4\x07;\x02\x02\u02E3" +
		"\u02DD\x03\x02\x02\x02\u02E3\u02E4\x03\x02\x02\x02\u02E49\x03\x02\x02" +
		"\x02\u02E5\u02E6\x05\b\x05\x02\u02E6\u02E7\x07\x02\x02\x03\u02E7\u02EF" +
		"\x03\x02\x02\x02\u02E8\u02E9\x052\x1A\x02\u02E9\u02EA\x07\x02\x02\x03" +
		"\u02EA\u02EF\x03\x02\x02\x02\u02EB\u02EC\x07E\x02\x02\u02EC\u02EF\x07" +
		"\x02\x02\x03\u02ED\u02EF\x07\x02\x02\x03\u02EE\u02E5\x03\x02\x02\x02\u02EE" +
		"\u02E8\x03\x02\x02\x02\u02EE\u02EB\x03\x02\x02\x02\u02EE\u02ED\x03\x02" +
		"\x02\x02\u02EF;\x03\x02\x02\x02\u02F0\u02F3\x05> \x02\u02F1\u02F3\x05" +
		"@!\x02\u02F2\u02F0\x03\x02\x02\x02\u02F2\u02F1\x03\x02\x02\x02\u02F3=" +
		"\x03\x02\x02\x02\u02F4\u02F5\x05D#\x02\u02F5\u02F6\x07\x19\x02\x02\u02F6" +
		"\u02F7\x052\x1A\x02\u02F7\u0306\x03\x02\x02\x02\u02F8\u02F9\x07:\x02\x02" +
		"\u02F9\u02FE\x05D#\x02\u02FA\u02FB\x07\n\x02\x02\u02FB\u02FD\x05D#\x02" +
		"\u02FC\u02FA\x03\x02\x02\x02\u02FD\u0300\x03\x02\x02\x02\u02FE\u02FC\x03" +
		"\x02\x02\x02\u02FE\u02FF\x03\x02\x02\x02\u02FF\u0301\x03\x02\x02\x02\u0300" +
		"\u02FE\x03\x02\x02\x02\u0301\u0302\x07;\x02\x02\u0302\u0303\x07\x19\x02" +
		"\x02\u0303\u0304\x052\x1A\x02\u0304\u0306\x03\x02\x02\x02\u0305\u02F4" +
		"\x03\x02\x02\x02\u0305\u02F8\x03\x02\x02\x02\u0306?\x03\x02\x02\x02\u0307" +
		"\u0308\x07:\x02\x02\u0308\u0309\x07:\x02\x02\u0309\u030C\x05D#\x02\u030A" +
		"\u030B\x07\n\x02\x02\u030B\u030D\x05D#\x02\u030C\u030A\x03\x02\x02\x02" +
		"\u030D\u030E\x03\x02\x02\x02\u030E\u030C\x03\x02\x02\x02\u030E\u030F\x03" +
		"\x02\x02\x02\u030F\u0310\x03\x02\x02\x02\u0310\u0311\x07;\x02\x02\u0311" +
		"\u0312\x07;\x02\x02\u0312\u0313\x07\x19\x02\x02\u0313\u0314\x052\x1A\x02" +
		"\u0314A\x03\x02\x02\x02\u0315\u0318\x07#\x02\x02\u0316\u0318\x05\\/\x02" +
		"\u0317\u0315\x03\x02\x02\x02\u0317\u0316\x03\x02\x02\x02\u0318C\x03\x02" +
		"\x02\x02\u0319\u031A\x05B\"\x02\u031AE\x03\x02\x02\x02\u031B\u031C\x05" +
		"B\"\x02\u031C\u031D\x07\x07\x02\x02\u031D\u031E\x05$\x13\x02\u031EG\x03" +
		"\x02\x02\x02\u031F\u0322\x05J&\x02\u0320\u0322\x05L\'\x02\u0321\u031F" +
		"\x03\x02\x02\x02\u0321\u0320\x03\x02\x02\x02\u0322I\x03\x02\x02\x02\u0323" +
		"\u0324\x07:\x02\x02\u0324\u0327\x05B\"\x02\u0325\u0326\x07\n\x02\x02\u0326" +
		"\u0328\x05B\"\x02\u0327\u0325\x03\x02\x02\x02\u0328\u0329\x03\x02\x02" +
		"\x02\u0329\u0327\x03\x02\x02\x02\u0329\u032A\x03\x02\x02\x02\u032A\u032B" +
		"\x03\x02\x02\x02\u032B\u032C\x07;\x02\x02\u032CK\x03\x02\x02\x02\u032D" +
		"\u032E\x07\x04\x02\x02\u032E\u0333\x05^0\x02\u032F\u0330\x07\n\x02\x02" +
		"\u0330\u0332\x05^0\x02\u0331\u032F\x03\x02\x02\x02\u0332\u0335\x03\x02" +
		"\x02\x02\u0333\u0331\x03\x02\x02\x02\u0333\u0334\x03\x02\x02\x02\u0334" +
		"\u0336\x03\x02\x02\x02\u0335\u0333\x03\x02\x02\x02\u0336\u0337\x07\x05" +
		"\x02\x02\u0337M\x03\x02\x02\x02\u0338\u033B\x070\x02\x02\u0339\u033B\x05" +
		"\\/\x02\u033A\u0338\x03\x02\x02\x02\u033A\u0339\x03\x02\x02\x02\u033B" +
		"O\x03\x02\x02\x02\u033C\u0341\x052\x1A\x02\u033D\u033E\x07\n\x02\x02\u033E" +
		"\u0340\x052\x1A\x02\u033F\u033D\x03\x02\x02\x02\u0340\u0343\x03\x02\x02" +
		"\x02\u0341\u033F\x03\x02\x02\x02\u0341\u0342\x03\x02\x02\x02\u0342Q\x03" +
		"\x02\x02\x02\u0343\u0341\x03\x02\x02\x02\u0344\u0345\x05^0\x02\u0345\u0346" +
		"\x07\x07\x02\x02\u0346\u0347\x052\x1A\x02\u0347\u034B\x03\x02\x02\x02" +
		"\u0348\u0349\x07$\x02\x02\u0349\u034B\x052\x1A\x02\u034A\u0344\x03\x02" +
		"\x02\x02\u034A\u0348\x03\x02\x02\x02\u034BS\x03\x02\x02\x02\u034C\u034F" +
		"\t\x05\x02\x02\u034D\u034F\x05\\/\x02\u034E\u034C\x03\x02\x02\x02\u034E" +
		"\u034D\x03\x02\x02\x02\u034FU\x03\x02\x02\x02\u0350\u0353\t\x06\x02\x02" +
		"\u0351\u0353\x05\\/\x02\u0352\u0350\x03\x02\x02\x02\u0352\u0351\x03\x02" +
		"\x02\x02\u0353W\x03\x02\x02\x02\u0354\u0355\t\x07\x02\x02\u0355Y\x03\x02" +
		"\x02\x02\u0356\u0357\t\b\x02\x02\u0357[\x03\x02\x02\x02\u0358\u035D\x05" +
		"`1\x02\u0359\u035A\x07%\x02\x02\u035A\u035C\x05`1\x02\u035B\u0359\x03" +
		"\x02\x02\x02\u035C\u035F\x03\x02\x02\x02\u035D\u035B\x03\x02\x02\x02\u035D" +
		"\u035E\x03\x02\x02\x02\u035E]\x03\x02\x02\x02\u035F\u035D\x03\x02\x02" +
		"\x02\u0360\u0365\x05`1\x02\u0361\u0362\x05\\/\x02\u0362\u0363\b0\x01\x02" +
		"\u0363\u0365\x03\x02\x02\x02\u0364\u0360\x03\x02\x02\x02\u0364\u0361\x03" +
		"\x02\x02\x02\u0365_\x03\x02\x02\x02\u0366\u036D\x07B\x02\x02\u0367\u036D" +
		"\x07C\x02\x02\u0368\u036D\x05b2\x02\u0369\u036A\x05d3\x02\u036A\u036B" +
		"\b1\x01\x02\u036B\u036D\x03\x02\x02\x02\u036C\u0366\x03\x02\x02\x02\u036C" +
		"\u0367\x03\x02\x02\x02\u036C\u0368\x03\x02\x02\x02\u036C\u0369\x03\x02" +
		"\x02\x02\u036Da\x03\x02\x02\x02\u036E\u036F\t\t\x02\x02\u036Fc\x03\x02" +
		"\x02\x02\u0370\u0371\t\n\x02\x02\u0371e\x03\x02\x02\x02dgls|\x84\x9D\xA7" +
		"\xAB\xB2\xB5\xBF\xC3\xC5\xC8\xCC\xD0\xD3\xDA\xE2\xE4\xF2\xFB\xFF\u0102" +
		"\u0109\u0111\u011D\u0125\u012B\u012F\u0131\u013C\u013E\u014D\u0151\u0158" +
		"\u0167\u016B\u0172\u0174\u0185\u0188\u018B\u01A4\u01A8\u01AE\u01BC\u01C4" +
		"\u01C6\u01D6\u01DC\u01E0\u01E9\u01FC\u01FF\u0211\u0215\u0220\u0224\u0230" +
		"\u0234\u023F\u0243\u024B\u0255\u0259\u0265\u0269\u0273\u0276\u0279\u028F" +
		"\u02B6\u02B9\u02C0\u02C2\u02C9\u02D0\u02D7\u02E0\u02E3\u02EE\u02F2\u02FE" +
		"\u0305\u030E\u0317\u0321\u0329\u0333\u033A\u0341\u034A\u034E\u0352\u035D" +
		"\u0364\u036C";
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
	public HASHBANG_LINE(): TerminalNode | undefined { return this.tryGetToken(QuintParser.HASHBANG_LINE, 0); }
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
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public DOCCOMMENT(): TerminalNode[];
	public DOCCOMMENT(i: number): TerminalNode;
	public DOCCOMMENT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.DOCCOMMENT);
		} else {
			return this.getToken(QuintParser.DOCCOMMENT, i);
		}
	}
	public documentedDeclaration(): DocumentedDeclarationContext[];
	public documentedDeclaration(i: number): DocumentedDeclarationContext;
	public documentedDeclaration(i?: number): DocumentedDeclarationContext | DocumentedDeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DocumentedDeclarationContext);
		} else {
			return this.getRuleContext(i, DocumentedDeclarationContext);
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


export class DocumentedDeclarationContext extends ParserRuleContext {
	public declaration(): DeclarationContext {
		return this.getRuleContext(0, DeclarationContext);
	}
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
	public get ruleIndex(): number { return QuintParser.RULE_documentedDeclaration; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDocumentedDeclaration) {
			listener.enterDocumentedDeclaration(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDocumentedDeclaration) {
			listener.exitDocumentedDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDocumentedDeclaration) {
			return visitor.visitDocumentedDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_declaration; }
	public copyFrom(ctx: DeclarationContext): void {
		super.copyFrom(ctx);
	}
}
export class ConstContext extends DeclarationContext {
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class VarContext extends DeclarationContext {
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class AssumeContext extends DeclarationContext {
	public _assumeName!: IdentOrHoleContext;
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public identOrHole(): IdentOrHoleContext | undefined {
		return this.tryGetRuleContext(0, IdentOrHoleContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class InstanceContext extends DeclarationContext {
	public instanceMod(): InstanceModContext {
		return this.getRuleContext(0, InstanceModContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class OperContext extends DeclarationContext {
	public operDef(): OperDefContext {
		return this.getRuleContext(0, OperDefContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class TypeDefsContext extends DeclarationContext {
	public typeDef(): TypeDefContext {
		return this.getRuleContext(0, TypeDefContext);
	}
	constructor(ctx: DeclarationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeDefs) {
			listener.enterTypeDefs(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeDefs) {
			listener.exitTypeDefs(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeDefs) {
			return visitor.visitTypeDefs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ImportDefContext extends DeclarationContext {
	public importMod(): ImportModContext {
		return this.getRuleContext(0, ImportModContext);
	}
	constructor(ctx: DeclarationContext) {
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
export class ExportDefContext extends DeclarationContext {
	public exportMod(): ExportModContext {
		return this.getRuleContext(0, ExportModContext);
	}
	constructor(ctx: DeclarationContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterExportDef) {
			listener.enterExportDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitExportDef) {
			listener.exitExportDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitExportDef) {
			return visitor.visitExportDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperDefContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_operDef; }
	public copyFrom(ctx: OperDefContext): void {
		super.copyFrom(ctx);
	}
}
export class AnnotatedOperDefContext extends OperDefContext {
	public _annotatedParameter!: AnnotatedParameterContext;
	public _annotOperParam: AnnotatedParameterContext[] = [];
	public qualifier(): QualifierContext {
		return this.getRuleContext(0, QualifierContext);
	}
	public normalCallName(): NormalCallNameContext {
		return this.getRuleContext(0, NormalCallNameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public annotatedParameter(): AnnotatedParameterContext[];
	public annotatedParameter(i: number): AnnotatedParameterContext;
	public annotatedParameter(i?: number): AnnotatedParameterContext | AnnotatedParameterContext[] {
		if (i === undefined) {
			return this.getRuleContexts(AnnotatedParameterContext);
		} else {
			return this.getRuleContext(i, AnnotatedParameterContext);
		}
	}
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	constructor(ctx: OperDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterAnnotatedOperDef) {
			listener.enterAnnotatedOperDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAnnotatedOperDef) {
			listener.exitAnnotatedOperDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitAnnotatedOperDef) {
			return visitor.visitAnnotatedOperDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DeprecatedOperDefContext extends OperDefContext {
	public _parameter!: ParameterContext;
	public _operParam: ParameterContext[] = [];
	public _annotatedRetType!: TypeContext;
	public qualifier(): QualifierContext {
		return this.getRuleContext(0, QualifierContext);
	}
	public normalCallName(): NormalCallNameContext {
		return this.getRuleContext(0, NormalCallNameContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	public ASGN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
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
	constructor(ctx: OperDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDeprecatedOperDef) {
			listener.enterDeprecatedOperDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDeprecatedOperDef) {
			listener.exitDeprecatedOperDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDeprecatedOperDef) {
			return visitor.visitDeprecatedOperDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValDestructuringContext extends OperDefContext {
	public destructuringPattern(): DestructuringPatternContext {
		return this.getRuleContext(0, DestructuringPatternContext);
	}
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: OperDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterValDestructuring) {
			listener.enterValDestructuring(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitValDestructuring) {
			listener.exitValDestructuring(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitValDestructuring) {
			return visitor.visitValDestructuring(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PureValDestructuringContext extends OperDefContext {
	public destructuringPattern(): DestructuringPatternContext {
		return this.getRuleContext(0, DestructuringPatternContext);
	}
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(ctx: OperDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterPureValDestructuring) {
			listener.enterPureValDestructuring(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitPureValDestructuring) {
			listener.exitPureValDestructuring(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitPureValDestructuring) {
			return visitor.visitPureValDestructuring(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeDefContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeDef; }
	public copyFrom(ctx: TypeDefContext): void {
		super.copyFrom(ctx);
	}
}
export class TypeAbstractDefContext extends TypeDefContext {
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	constructor(ctx: TypeDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeAbstractDef) {
			listener.enterTypeAbstractDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeAbstractDef) {
			listener.exitTypeAbstractDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeAbstractDef) {
			return visitor.visitTypeAbstractDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeSumDefContext extends TypeDefContext {
	public typeDefHead(): TypeDefHeadContext {
		return this.getRuleContext(0, TypeDefHeadContext);
	}
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public sumTypeDefinition(): SumTypeDefinitionContext {
		return this.getRuleContext(0, SumTypeDefinitionContext);
	}
	constructor(ctx: TypeDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeSumDef) {
			listener.enterTypeSumDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeSumDef) {
			listener.exitTypeSumDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeSumDef) {
			return visitor.visitTypeSumDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeAliasDefContext extends TypeDefContext {
	public typeDefHead(): TypeDefHeadContext {
		return this.getRuleContext(0, TypeDefHeadContext);
	}
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	constructor(ctx: TypeDefContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeAliasDef) {
			listener.enterTypeAliasDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeAliasDef) {
			listener.exitTypeAliasDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeAliasDef) {
			return visitor.visitTypeAliasDef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeDefHeadContext extends ParserRuleContext {
	public _typeName!: QualIdContext;
	public _LOW_ID!: Token;
	public _typeVars: Token[] = [];
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public LOW_ID(): TerminalNode[];
	public LOW_ID(i: number): TerminalNode;
	public LOW_ID(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.LOW_ID);
		} else {
			return this.getToken(QuintParser.LOW_ID, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeDefHead; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeDefHead) {
			listener.enterTypeDefHead(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeDefHead) {
			listener.exitTypeDefHead(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeDefHead) {
			return visitor.visitTypeDefHead(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SumTypeDefinitionContext extends ParserRuleContext {
	public _separator!: Token;
	public typeSumVariant(): TypeSumVariantContext[];
	public typeSumVariant(i: number): TypeSumVariantContext;
	public typeSumVariant(i?: number): TypeSumVariantContext | TypeSumVariantContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeSumVariantContext);
		} else {
			return this.getRuleContext(i, TypeSumVariantContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_sumTypeDefinition; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterSumTypeDefinition) {
			listener.enterSumTypeDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitSumTypeDefinition) {
			listener.exitSumTypeDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitSumTypeDefinition) {
			return visitor.visitSumTypeDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeSumVariantContext extends ParserRuleContext {
	public _sumLabel!: SimpleIdContext;
	public simpleId(): SimpleIdContext {
		return this.getRuleContext(0, SimpleIdContext);
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public type(): TypeContext | undefined {
		return this.tryGetRuleContext(0, TypeContext);
	}
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeSumVariant; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeSumVariant) {
			listener.enterTypeSumVariant(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeSumVariant) {
			listener.exitTypeSumVariant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeSumVariant) {
			return visitor.visitTypeSumVariant(this);
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


export class ImportModContext extends ParserRuleContext {
	public IMPORT(): TerminalNode { return this.getToken(QuintParser.IMPORT, 0); }
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public identOrStar(): IdentOrStarContext | undefined {
		return this.tryGetRuleContext(0, IdentOrStarContext);
	}
	public FROM(): TerminalNode | undefined { return this.tryGetToken(QuintParser.FROM, 0); }
	public fromSource(): FromSourceContext | undefined {
		return this.tryGetRuleContext(0, FromSourceContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_importMod; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterImportMod) {
			listener.enterImportMod(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitImportMod) {
			listener.exitImportMod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitImportMod) {
			return visitor.visitImportMod(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExportModContext extends ParserRuleContext {
	public EXPORT(): TerminalNode { return this.getToken(QuintParser.EXPORT, 0); }
	public name(): NameContext[];
	public name(i: number): NameContext;
	public name(i?: number): NameContext | NameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(NameContext);
		} else {
			return this.getRuleContext(i, NameContext);
		}
	}
	public identOrStar(): IdentOrStarContext | undefined {
		return this.tryGetRuleContext(0, IdentOrStarContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AS, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_exportMod; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterExportMod) {
			listener.enterExportMod(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitExportMod) {
			listener.exitExportMod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitExportMod) {
			return visitor.visitExportMod(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InstanceModContext extends ParserRuleContext {
	public IMPORT(): TerminalNode { return this.getToken(QuintParser.IMPORT, 0); }
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
	public FROM(): TerminalNode | undefined { return this.tryGetToken(QuintParser.FROM, 0); }
	public fromSource(): FromSourceContext | undefined {
		return this.tryGetRuleContext(0, FromSourceContext);
	}
	public AS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AS, 0); }
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
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
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
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
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
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
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


export class FromSourceContext extends ParserRuleContext {
	public STRING(): TerminalNode { return this.getToken(QuintParser.STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_fromSource; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterFromSource) {
			listener.enterFromSource(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitFromSource) {
			listener.exitFromSource(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitFromSource) {
			return visitor.visitFromSource(this);
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
export class TypeUnitContext extends TypeContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeUnit) {
			listener.enterTypeUnit(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeUnit) {
			listener.exitTypeUnit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeUnit) {
			return visitor.visitTypeUnit(this);
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
	public row(): RowContext | undefined {
		return this.tryGetRuleContext(0, RowContext);
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
export class TypeVarCaseContext extends TypeContext {
	public typeVar(): TypeVarContext {
		return this.getRuleContext(0, TypeVarContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeVarCase) {
			listener.enterTypeVarCase(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeVarCase) {
			listener.exitTypeVarCase(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeVarCase) {
			return visitor.visitTypeVarCase(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeConstContext extends TypeContext {
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeConst) {
			listener.enterTypeConst(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeConst) {
			listener.exitTypeConst(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeConst) {
			return visitor.visitTypeConst(this);
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
export class TypeAppContext extends TypeContext {
	public typeApplication(): TypeApplicationContext {
		return this.getRuleContext(0, TypeApplicationContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeApp) {
			listener.enterTypeApp(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeApp) {
			listener.exitTypeApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeApp) {
			return visitor.visitTypeApp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class WrongTypeAppContext extends TypeContext {
	public wrongTypeApplication(): WrongTypeApplicationContext {
		return this.getRuleContext(0, WrongTypeApplicationContext);
	}
	constructor(ctx: TypeContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterWrongTypeApp) {
			listener.enterWrongTypeApp(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitWrongTypeApp) {
			listener.exitWrongTypeApp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitWrongTypeApp) {
			return visitor.visitWrongTypeApp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeVarContext extends ParserRuleContext {
	public LOW_ID(): TerminalNode { return this.getToken(QuintParser.LOW_ID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeVar; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeVar) {
			listener.enterTypeVar(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeVar) {
			listener.exitTypeVar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeVar) {
			return visitor.visitTypeVar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RowContext extends ParserRuleContext {
	public _rowVar!: IdentifierContext;
	public rowLabel(): RowLabelContext[];
	public rowLabel(i: number): RowLabelContext;
	public rowLabel(i?: number): RowLabelContext | RowLabelContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RowLabelContext);
		} else {
			return this.getRuleContext(i, RowLabelContext);
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
	public identifier(): IdentifierContext | undefined {
		return this.tryGetRuleContext(0, IdentifierContext);
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


export class RowLabelContext extends ParserRuleContext {
	public simpleId(): SimpleIdContext {
		return this.getRuleContext(0, SimpleIdContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_rowLabel; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterRowLabel) {
			listener.enterRowLabel(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRowLabel) {
			listener.exitRowLabel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitRowLabel) {
			return visitor.visitRowLabel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeArgsContext extends ParserRuleContext {
	public _type!: TypeContext;
	public _typeArg: TypeContext[] = [];
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
	public get ruleIndex(): number { return QuintParser.RULE_typeArgs; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeArgs) {
			listener.enterTypeArgs(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeArgs) {
			listener.exitTypeArgs(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeArgs) {
			return visitor.visitTypeArgs(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeApplicationContext extends ParserRuleContext {
	public _typeCtor!: QualIdContext;
	public typeArgs(): TypeArgsContext {
		return this.getRuleContext(0, TypeArgsContext);
	}
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_typeApplication; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTypeApplication) {
			listener.enterTypeApplication(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTypeApplication) {
			listener.exitTypeApplication(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTypeApplication) {
			return visitor.visitTypeApplication(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class WrongTypeApplicationContext extends ParserRuleContext {
	public _typeCtor!: QualIdContext;
	public _qualId!: QualIdContext;
	public _typeArgs!: TypeArgsContext;
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public typeArgs(): TypeArgsContext {
		return this.getRuleContext(0, TypeArgsContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_wrongTypeApplication; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterWrongTypeApplication) {
			listener.enterWrongTypeApplication(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitWrongTypeApplication) {
			listener.exitWrongTypeApplication(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitWrongTypeApplication) {
			return visitor.visitWrongTypeApplication(this);
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
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
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
	public matchSumExpr(): MatchSumExprContext {
		return this.getRuleContext(0, MatchSumExprContext);
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
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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
export class UnitContext extends ExprContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(ctx: ExprContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterUnit) {
			listener.enterUnit(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitUnit) {
			listener.exitUnit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitUnit) {
			return visitor.visitUnit(this);
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
	public recElem(): RecElemContext[];
	public recElem(i: number): RecElemContext;
	public recElem(i?: number): RecElemContext | RecElemContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RecElemContext);
		} else {
			return this.getRuleContext(i, RecElemContext);
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


export class MatchSumExprContext extends ParserRuleContext {
	public _matchSumCase!: MatchSumCaseContext;
	public _matchCase: MatchSumCaseContext[] = [];
	public MATCH(): TerminalNode { return this.getToken(QuintParser.MATCH, 0); }
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public matchSumCase(): MatchSumCaseContext[];
	public matchSumCase(i: number): MatchSumCaseContext;
	public matchSumCase(i?: number): MatchSumCaseContext | MatchSumCaseContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MatchSumCaseContext);
		} else {
			return this.getRuleContext(i, MatchSumCaseContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_matchSumExpr; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterMatchSumExpr) {
			listener.enterMatchSumExpr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitMatchSumExpr) {
			listener.exitMatchSumExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitMatchSumExpr) {
			return visitor.visitMatchSumExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MatchSumCaseContext extends ParserRuleContext {
	public _variantMatch!: MatchSumVariantContext;
	public _wildCardMatch!: Token;
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	public matchSumVariant(): MatchSumVariantContext | undefined {
		return this.tryGetRuleContext(0, MatchSumVariantContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_matchSumCase; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterMatchSumCase) {
			listener.enterMatchSumCase(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitMatchSumCase) {
			listener.exitMatchSumCase(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitMatchSumCase) {
			return visitor.visitMatchSumCase(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MatchSumVariantContext extends ParserRuleContext {
	public _variantLabel!: SimpleIdContext;
	public _variantParam!: SimpleIdContext;
	public simpleId(): SimpleIdContext[];
	public simpleId(i: number): SimpleIdContext;
	public simpleId(i?: number): SimpleIdContext | SimpleIdContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SimpleIdContext);
		} else {
			return this.getRuleContext(i, SimpleIdContext);
		}
	}
	public LPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LPAREN, 0); }
	public RPAREN(): TerminalNode | undefined { return this.tryGetToken(QuintParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_matchSumVariant; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterMatchSumVariant) {
			listener.enterMatchSumVariant(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitMatchSumVariant) {
			listener.exitMatchSumVariant(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitMatchSumVariant) {
			return visitor.visitMatchSumVariant(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationOrExprContext extends ParserRuleContext {
	public declaration(): DeclarationContext | undefined {
		return this.tryGetRuleContext(0, DeclarationContext);
	}
	public EOF(): TerminalNode { return this.getToken(QuintParser.EOF, 0); }
	public expr(): ExprContext | undefined {
		return this.tryGetRuleContext(0, ExprContext);
	}
	public DOCCOMMENT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.DOCCOMMENT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_declarationOrExpr; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDeclarationOrExpr) {
			listener.enterDeclarationOrExpr(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDeclarationOrExpr) {
			listener.exitDeclarationOrExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDeclarationOrExpr) {
			return visitor.visitDeclarationOrExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaContext extends ParserRuleContext {
	public lambdaUnsugared(): LambdaUnsugaredContext | undefined {
		return this.tryGetRuleContext(0, LambdaUnsugaredContext);
	}
	public lambdaTupleSugar(): LambdaTupleSugarContext | undefined {
		return this.tryGetRuleContext(0, LambdaTupleSugarContext);
	}
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


export class LambdaUnsugaredContext extends ParserRuleContext {
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
	public get ruleIndex(): number { return QuintParser.RULE_lambdaUnsugared; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLambdaUnsugared) {
			listener.enterLambdaUnsugared(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLambdaUnsugared) {
			listener.exitLambdaUnsugared(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLambdaUnsugared) {
			return visitor.visitLambdaUnsugared(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LambdaTupleSugarContext extends ParserRuleContext {
	public LPAREN(): TerminalNode[];
	public LPAREN(i: number): TerminalNode;
	public LPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.LPAREN);
		} else {
			return this.getToken(QuintParser.LPAREN, i);
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
	public RPAREN(): TerminalNode[];
	public RPAREN(i: number): TerminalNode;
	public RPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(QuintParser.RPAREN);
		} else {
			return this.getToken(QuintParser.RPAREN, i);
		}
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_lambdaTupleSugar; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterLambdaTupleSugar) {
			listener.enterLambdaTupleSugar(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitLambdaTupleSugar) {
			listener.exitLambdaTupleSugar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitLambdaTupleSugar) {
			return visitor.visitLambdaTupleSugar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentOrHoleContext extends ParserRuleContext {
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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
	public _paramName!: IdentOrHoleContext;
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


export class AnnotatedParameterContext extends ParserRuleContext {
	public _paramName!: IdentOrHoleContext;
	public type(): TypeContext {
		return this.getRuleContext(0, TypeContext);
	}
	public identOrHole(): IdentOrHoleContext {
		return this.getRuleContext(0, IdentOrHoleContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_annotatedParameter; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterAnnotatedParameter) {
			listener.enterAnnotatedParameter(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitAnnotatedParameter) {
			listener.exitAnnotatedParameter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitAnnotatedParameter) {
			return visitor.visitAnnotatedParameter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DestructuringPatternContext extends ParserRuleContext {
	public tuplePattern(): TuplePatternContext | undefined {
		return this.tryGetRuleContext(0, TuplePatternContext);
	}
	public recordPattern(): RecordPatternContext | undefined {
		return this.tryGetRuleContext(0, RecordPatternContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_destructuringPattern; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterDestructuringPattern) {
			listener.enterDestructuringPattern(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitDestructuringPattern) {
			listener.exitDestructuringPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitDestructuringPattern) {
			return visitor.visitDestructuringPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TuplePatternContext extends ParserRuleContext {
	public LPAREN(): TerminalNode { return this.getToken(QuintParser.LPAREN, 0); }
	public identOrHole(): IdentOrHoleContext[];
	public identOrHole(i: number): IdentOrHoleContext;
	public identOrHole(i?: number): IdentOrHoleContext | IdentOrHoleContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentOrHoleContext);
		} else {
			return this.getRuleContext(i, IdentOrHoleContext);
		}
	}
	public RPAREN(): TerminalNode { return this.getToken(QuintParser.RPAREN, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_tuplePattern; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterTuplePattern) {
			listener.enterTuplePattern(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitTuplePattern) {
			listener.exitTuplePattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitTuplePattern) {
			return visitor.visitTuplePattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RecordPatternContext extends ParserRuleContext {
	public simpleId(): SimpleIdContext[];
	public simpleId(i: number): SimpleIdContext;
	public simpleId(i?: number): SimpleIdContext | SimpleIdContext[] {
		if (i === undefined) {
			return this.getRuleContexts(SimpleIdContext);
		} else {
			return this.getRuleContext(i, SimpleIdContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_recordPattern; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterRecordPattern) {
			listener.enterRecordPattern(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRecordPattern) {
			listener.exitRecordPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitRecordPattern) {
			return visitor.visitRecordPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentOrStarContext extends ParserRuleContext {
	public MUL(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MUL, 0); }
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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


export class RecElemContext extends ParserRuleContext {
	public simpleId(): SimpleIdContext | undefined {
		return this.tryGetRuleContext(0, SimpleIdContext);
	}
	public expr(): ExprContext {
		return this.getRuleContext(0, ExprContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_recElem; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterRecElem) {
			listener.enterRecElem(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitRecElem) {
			listener.exitRecElem(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitRecElem) {
			return visitor.visitRecElem(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NormalCallNameContext extends ParserRuleContext {
	public _op!: Token;
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	public SET(): TerminalNode | undefined { return this.tryGetToken(QuintParser.SET, 0); }
	public LIST(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LIST, 0); }
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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


export class QualIdContext extends ParserRuleContext {
	public identifier(): IdentifierContext[];
	public identifier(i: number): IdentifierContext;
	public identifier(i?: number): IdentifierContext | IdentifierContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentifierContext);
		} else {
			return this.getRuleContext(i, IdentifierContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_qualId; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterQualId) {
			listener.enterQualId(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitQualId) {
			listener.exitQualId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitQualId) {
			return visitor.visitQualId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SimpleIdContext extends ParserRuleContext {
	public context: string;
	public _qualId!: QualIdContext;
	public identifier(): IdentifierContext | undefined {
		return this.tryGetRuleContext(0, IdentifierContext);
	}
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number, context: string) {
		super(parent, invokingState);
		this.context = context;
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_simpleId; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterSimpleId) {
			listener.enterSimpleId(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitSimpleId) {
			listener.exitSimpleId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitSimpleId) {
			return visitor.visitSimpleId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	public _reserved!: ReservedContext;
	public LOW_ID(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LOW_ID, 0); }
	public CAP_ID(): TerminalNode | undefined { return this.tryGetToken(QuintParser.CAP_ID, 0); }
	public keywordAsID(): KeywordAsIDContext | undefined {
		return this.tryGetRuleContext(0, KeywordAsIDContext);
	}
	public reserved(): ReservedContext | undefined {
		return this.tryGetRuleContext(0, ReservedContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_identifier; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterIdentifier) {
			listener.enterIdentifier(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitIdentifier) {
			listener.exitIdentifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeywordAsIDContext extends ParserRuleContext {
	public FROM(): TerminalNode | undefined { return this.tryGetToken(QuintParser.FROM, 0); }
	public AS(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AS, 0); }
	public SET(): TerminalNode | undefined { return this.tryGetToken(QuintParser.SET, 0); }
	public LIST(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LIST, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_keywordAsID; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterKeywordAsID) {
			listener.enterKeywordAsID(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitKeywordAsID) {
			listener.exitKeywordAsID(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitKeywordAsID) {
			return visitor.visitKeywordAsID(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReservedContext extends ParserRuleContext {
	public AND(): TerminalNode | undefined { return this.tryGetToken(QuintParser.AND, 0); }
	public OR(): TerminalNode | undefined { return this.tryGetToken(QuintParser.OR, 0); }
	public IFF(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IFF, 0); }
	public IMPLIES(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPLIES, 0); }
	public MATCH(): TerminalNode | undefined { return this.tryGetToken(QuintParser.MATCH, 0); }
	public IMPORT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.IMPORT, 0); }
	public EXPORT(): TerminalNode | undefined { return this.tryGetToken(QuintParser.EXPORT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return QuintParser.RULE_reserved; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterReserved) {
			listener.enterReserved(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitReserved) {
			listener.exitReserved(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitReserved) {
			return visitor.visitReserved(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


