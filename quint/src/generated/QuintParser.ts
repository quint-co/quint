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
	public static readonly RULE_identOrStar = 35;
	public static readonly RULE_argList = 36;
	public static readonly RULE_recElem = 37;
	public static readonly RULE_normalCallName = 38;
	public static readonly RULE_nameAfterDot = 39;
	public static readonly RULE_operator = 40;
	public static readonly RULE_literal = 41;
	public static readonly RULE_qualId = 42;
	public static readonly RULE_simpleId = 43;
	public static readonly RULE_identifier = 44;
	public static readonly RULE_keywordAsID = 45;
	public static readonly RULE_reserved = 46;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "documentedDeclaration", "declaration", "operDef", 
		"typeDef", "typeDefHead", "sumTypeDefinition", "typeSumVariant", "qualifier", 
		"importMod", "exportMod", "instanceMod", "moduleName", "name", "qualifiedName", 
		"fromSource", "type", "typeVar", "row", "rowLabel", "typeArgs", "typeApplication", 
		"wrongTypeApplication", "expr", "matchSumExpr", "matchSumCase", "matchSumVariant", 
		"declarationOrExpr", "lambda", "lambdaUnsugared", "lambdaTupleSugar", 
		"identOrHole", "parameter", "annotatedParameter", "identOrStar", "argList", 
		"recElem", "normalCallName", "nameAfterDot", "operator", "literal", "qualId", 
		"simpleId", "identifier", "keywordAsID", "reserved",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"','", "';'", "'type'", "'['", "']'", "'|'", "'val'", "'def'", "'pure'", 
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
			this.state = 95;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.HASHBANG_LINE) {
				{
				this.state = 94;
				this.match(QuintParser.HASHBANG_LINE);
				}
			}

			this.state = 98;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 97;
				this.module();
				}
				}
				this.state = 100;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0 || _la === QuintParser.DOCCOMMENT);
			this.state = 102;
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
			this.state = 107;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 104;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 109;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 110;
			this.match(QuintParser.T__0);
			this.state = 111;
			this.qualId();
			this.state = 112;
			this.match(QuintParser.T__1);
			this.state = 116;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__9) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 60)) & ~0x1F) === 0 && ((1 << (_la - 60)) & ((1 << (QuintParser.IMPORT - 60)) | (1 << (QuintParser.EXPORT - 60)) | (1 << (QuintParser.DOCCOMMENT - 60)))) !== 0)) {
				{
				{
				this.state = 113;
				this.documentedDeclaration();
				}
				}
				this.state = 118;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 119;
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
			this.state = 124;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 121;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 126;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 127;
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
			this.state = 149;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 129;
				this.match(QuintParser.T__3);
				this.state = 130;
				this.qualId();
				this.state = 131;
				this.match(QuintParser.T__4);
				this.state = 132;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 134;
				this.match(QuintParser.T__5);
				this.state = 135;
				this.qualId();
				this.state = 136;
				this.match(QuintParser.T__4);
				this.state = 137;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 139;
				this.match(QuintParser.T__6);
				{
				this.state = 140;
				(_localctx as AssumeContext)._assumeName = this.identOrHole();
				}
				this.state = 141;
				this.match(QuintParser.ASGN);
				this.state = 142;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 144;
				this.instanceMod();
				}
				break;

			case 5:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 145;
				this.operDef();
				}
				break;

			case 6:
				_localctx = new TypeDefsContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 146;
				this.typeDef();
				}
				break;

			case 7:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 147;
				this.importMod();
				}
				break;

			case 8:
				_localctx = new ExportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 148;
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
			this.state = 205;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				_localctx = new AnnotatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 151;
				this.qualifier();
				this.state = 152;
				this.normalCallName();
				this.state = 153;
				this.match(QuintParser.LPAREN);
				{
				this.state = 154;
				(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
				(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
				this.state = 159;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 155;
						this.match(QuintParser.T__7);
						this.state = 156;
						(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
						(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
						}
						}
					}
					this.state = 161;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 6, this._ctx);
				}
				}
				this.state = 163;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 162;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 165;
				this.match(QuintParser.RPAREN);
				this.state = 166;
				this.match(QuintParser.T__4);
				this.state = 167;
				this.type(0);
				this.state = 170;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 168;
					this.match(QuintParser.ASGN);
					this.state = 169;
					this.expr(0);
					}
				}

				this.state = 173;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 172;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 2:
				_localctx = new DeprecatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 175;
				this.qualifier();
				this.state = 176;
				this.normalCallName();
				this.state = 192;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 13, this._ctx) ) {
				case 1:
					{
					this.state = 177;
					this.match(QuintParser.LPAREN);
					this.state = 189;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)) | (1 << (QuintParser.IMPORT - 33)) | (1 << (QuintParser.EXPORT - 33)) | (1 << (QuintParser.FROM - 33)) | (1 << (QuintParser.AS - 33)) | (1 << (QuintParser.LOW_ID - 33)))) !== 0) || _la === QuintParser.CAP_ID) {
						{
						this.state = 178;
						(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
						(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
						this.state = 183;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 10, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								{
								{
								this.state = 179;
								this.match(QuintParser.T__7);
								this.state = 180;
								(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
								(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
								}
								}
							}
							this.state = 185;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 10, this._ctx);
						}
						this.state = 187;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === QuintParser.T__7) {
							{
							this.state = 186;
							this.match(QuintParser.T__7);
							}
						}

						}
					}

					this.state = 191;
					this.match(QuintParser.RPAREN);
					}
					break;
				}
				this.state = 196;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 194;
					this.match(QuintParser.T__4);
					this.state = 195;
					(_localctx as DeprecatedOperDefContext)._annotatedRetType = this.type(0);
					}
				}

				this.state = 200;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 198;
					this.match(QuintParser.ASGN);
					this.state = 199;
					this.expr(0);
					}
				}

				this.state = 203;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 202;
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
			this.state = 219;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 18, this._ctx) ) {
			case 1:
				_localctx = new TypeAbstractDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 207;
				this.match(QuintParser.T__9);
				this.state = 208;
				this.qualId();
				}
				break;

			case 2:
				_localctx = new TypeSumDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 209;
				this.match(QuintParser.T__9);
				this.state = 210;
				this.typeDefHead();
				this.state = 211;
				this.match(QuintParser.ASGN);
				this.state = 212;
				this.sumTypeDefinition();
				}
				break;

			case 3:
				_localctx = new TypeAliasDefContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 214;
				this.match(QuintParser.T__9);
				this.state = 215;
				this.typeDefHead();
				this.state = 216;
				this.match(QuintParser.ASGN);
				this.state = 217;
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
			this.state = 221;
			_localctx._typeName = this.qualId();
			this.state = 232;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__10) {
				{
				this.state = 222;
				this.match(QuintParser.T__10);
				this.state = 223;
				_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
				_localctx._typeVars.push(_localctx._LOW_ID);
				this.state = 228;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 224;
					this.match(QuintParser.T__7);
					this.state = 225;
					_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
					_localctx._typeVars.push(_localctx._LOW_ID);
					}
					}
					this.state = 230;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 231;
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
	public sumTypeDefinition(): SumTypeDefinitionContext {
		let _localctx: SumTypeDefinitionContext = new SumTypeDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, QuintParser.RULE_sumTypeDefinition);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 235;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 234;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 237;
			this.typeSumVariant();
			this.state = 242;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 238;
				this.match(QuintParser.T__12);
				this.state = 239;
				this.typeSumVariant();
				}
				}
				this.state = 244;
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
			this.state = 245;
			_localctx._sumLabel = this.simpleId("variant label");
			this.state = 250;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 246;
				this.match(QuintParser.LPAREN);
				this.state = 247;
				this.type(0);
				this.state = 248;
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
			this.state = 262;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 252;
				this.match(QuintParser.T__13);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 253;
				this.match(QuintParser.T__14);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 254;
				this.match(QuintParser.T__15);
				this.state = 255;
				this.match(QuintParser.T__13);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 256;
				this.match(QuintParser.T__15);
				this.state = 257;
				this.match(QuintParser.T__14);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 258;
				this.match(QuintParser.T__16);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 259;
				this.match(QuintParser.T__17);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 260;
				this.match(QuintParser.T__18);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 261;
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
			this.state = 282;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 28, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 264;
				this.match(QuintParser.IMPORT);
				this.state = 265;
				this.name();
				this.state = 266;
				this.match(QuintParser.T__20);
				this.state = 267;
				this.identOrStar();
				this.state = 270;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 268;
					this.match(QuintParser.FROM);
					this.state = 269;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 272;
				this.match(QuintParser.IMPORT);
				this.state = 273;
				this.name();
				this.state = 276;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.AS) {
					{
					this.state = 274;
					this.match(QuintParser.AS);
					this.state = 275;
					this.name();
					}
				}

				this.state = 280;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 278;
					this.match(QuintParser.FROM);
					this.state = 279;
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
			this.state = 295;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 284;
				this.match(QuintParser.EXPORT);
				this.state = 285;
				this.name();
				this.state = 286;
				this.match(QuintParser.T__20);
				this.state = 287;
				this.identOrStar();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 289;
				this.match(QuintParser.EXPORT);
				this.state = 290;
				this.name();
				this.state = 293;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.AS) {
					{
					this.state = 291;
					this.match(QuintParser.AS);
					this.state = 292;
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
			this.state = 349;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 37, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 297;
				this.match(QuintParser.IMPORT);
				this.state = 298;
				this.moduleName();
				this.state = 299;
				this.match(QuintParser.LPAREN);
				{
				this.state = 300;
				this.name();
				this.state = 301;
				this.match(QuintParser.ASGN);
				this.state = 302;
				this.expr(0);
				this.state = 310;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 31, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 303;
						this.match(QuintParser.T__7);
						this.state = 304;
						this.name();
						this.state = 305;
						this.match(QuintParser.ASGN);
						this.state = 306;
						this.expr(0);
						}
						}
					}
					this.state = 312;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 31, this._ctx);
				}
				}
				this.state = 314;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 313;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 316;
				this.match(QuintParser.RPAREN);
				this.state = 317;
				this.match(QuintParser.T__20);
				this.state = 318;
				this.match(QuintParser.MUL);
				this.state = 321;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 319;
					this.match(QuintParser.FROM);
					this.state = 320;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 323;
				this.match(QuintParser.IMPORT);
				this.state = 324;
				this.moduleName();
				this.state = 325;
				this.match(QuintParser.LPAREN);
				{
				this.state = 326;
				this.name();
				this.state = 327;
				this.match(QuintParser.ASGN);
				this.state = 328;
				this.expr(0);
				this.state = 336;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 34, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 329;
						this.match(QuintParser.T__7);
						this.state = 330;
						this.name();
						this.state = 331;
						this.match(QuintParser.ASGN);
						this.state = 332;
						this.expr(0);
						}
						}
					}
					this.state = 338;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 34, this._ctx);
				}
				}
				this.state = 340;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 339;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 342;
				this.match(QuintParser.RPAREN);
				this.state = 343;
				this.match(QuintParser.AS);
				this.state = 344;
				this.qualifiedName();
				this.state = 347;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.FROM) {
					{
					this.state = 345;
					this.match(QuintParser.FROM);
					this.state = 346;
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
			this.state = 351;
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
			this.state = 353;
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
			this.state = 355;
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
			this.state = 357;
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
			this.state = 421;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 360;
				this.match(QuintParser.LPAREN);
				this.state = 369;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__23) | (1 << QuintParser.T__24) | (1 << QuintParser.T__25))) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.MATCH - 39)) | (1 << (QuintParser.LPAREN - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)) | (1 << (QuintParser.IMPORT - 39)) | (1 << (QuintParser.EXPORT - 39)) | (1 << (QuintParser.FROM - 39)) | (1 << (QuintParser.AS - 39)) | (1 << (QuintParser.LOW_ID - 39)) | (1 << (QuintParser.CAP_ID - 39)))) !== 0)) {
					{
					this.state = 361;
					this.type(0);
					this.state = 366;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 362;
							this.match(QuintParser.T__7);
							this.state = 363;
							this.type(0);
							}
							}
						}
						this.state = 368;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
					}
					}
				}

				this.state = 372;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 371;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 374;
				this.match(QuintParser.RPAREN);
				this.state = 375;
				this.match(QuintParser.T__22);
				this.state = 376;
				this.type(14);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 377;
				this.match(QuintParser.SET);
				this.state = 378;
				this.match(QuintParser.T__10);
				this.state = 379;
				this.type(0);
				this.state = 380;
				this.match(QuintParser.T__11);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 382;
				this.match(QuintParser.LIST);
				this.state = 383;
				this.match(QuintParser.T__10);
				this.state = 384;
				this.type(0);
				this.state = 385;
				this.match(QuintParser.T__11);
				}
				break;

			case 4:
				{
				_localctx = new TypeUnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 387;
				this.match(QuintParser.LPAREN);
				this.state = 388;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 389;
				this.match(QuintParser.LPAREN);
				this.state = 390;
				this.type(0);
				this.state = 391;
				this.match(QuintParser.T__7);
				this.state = 392;
				this.type(0);
				this.state = 397;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 393;
						this.match(QuintParser.T__7);
						this.state = 394;
						this.type(0);
						}
						}
					}
					this.state = 399;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 41, this._ctx);
				}
				this.state = 401;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 400;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 403;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 6:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 405;
				this.match(QuintParser.T__1);
				this.state = 407;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__12 || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & ((1 << (QuintParser.AND - 39)) | (1 << (QuintParser.OR - 39)) | (1 << (QuintParser.IFF - 39)) | (1 << (QuintParser.IMPLIES - 39)) | (1 << (QuintParser.MATCH - 39)) | (1 << (QuintParser.SET - 39)) | (1 << (QuintParser.LIST - 39)) | (1 << (QuintParser.IMPORT - 39)) | (1 << (QuintParser.EXPORT - 39)) | (1 << (QuintParser.FROM - 39)) | (1 << (QuintParser.AS - 39)) | (1 << (QuintParser.LOW_ID - 39)) | (1 << (QuintParser.CAP_ID - 39)))) !== 0)) {
					{
					this.state = 406;
					this.row();
					}
				}

				this.state = 409;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 410;
				this.match(QuintParser.T__23);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 411;
				this.match(QuintParser.T__24);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 412;
				this.match(QuintParser.T__25);
				}
				break;

			case 10:
				{
				_localctx = new TypeVarCaseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 413;
				this.typeVar();
				}
				break;

			case 11:
				{
				_localctx = new TypeConstContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 414;
				this.qualId();
				}
				break;

			case 12:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 415;
				this.match(QuintParser.LPAREN);
				this.state = 416;
				this.type(0);
				this.state = 417;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new TypeAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 419;
				this.typeApplication();
				}
				break;

			case 14:
				{
				_localctx = new WrongTypeAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 420;
				this.wrongTypeApplication();
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 431;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 429;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 423;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 424;
						this.match(QuintParser.T__21);
						this.state = 425;
						this.type(16);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 426;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 427;
						this.match(QuintParser.T__22);
						this.state = 428;
						this.type(15);
						}
						break;
					}
					}
				}
				this.state = 433;
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
			this.state = 434;
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
			this.state = 457;
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
				this.state = 436;
				this.rowLabel();
				this.state = 437;
				this.match(QuintParser.T__4);
				this.state = 438;
				this.type(0);
				}
				this.state = 447;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 47, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 440;
						this.match(QuintParser.T__7);
						this.state = 441;
						this.rowLabel();
						this.state = 442;
						this.match(QuintParser.T__4);
						this.state = 443;
						this.type(0);
						}
						}
					}
					this.state = 449;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 47, this._ctx);
				}
				this.state = 453;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.T__7:
					{
					this.state = 450;
					this.match(QuintParser.T__7);
					}
					break;
				case QuintParser.T__12:
					{
					this.state = 451;
					this.match(QuintParser.T__12);
					{
					this.state = 452;
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
			case QuintParser.T__12:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 455;
				this.match(QuintParser.T__12);
				{
				this.state = 456;
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
			this.state = 459;
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
			this.state = 461;
			_localctx._type = this.type(0);
			_localctx._typeArg.push(_localctx._type);
			this.state = 466;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__7) {
				{
				{
				this.state = 462;
				this.match(QuintParser.T__7);
				this.state = 463;
				_localctx._type = this.type(0);
				_localctx._typeArg.push(_localctx._type);
				}
				}
				this.state = 468;
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
			this.state = 469;
			_localctx._typeCtor = this.qualId();
			this.state = 470;
			this.match(QuintParser.T__10);
			this.state = 471;
			this.typeArgs();
			this.state = 472;
			this.match(QuintParser.T__11);
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
			this.state = 474;
			_localctx._typeCtor = _localctx._qualId = this.qualId();
			this.state = 475;
			this.match(QuintParser.LPAREN);
			this.state = 476;
			_localctx._typeArgs = this.typeArgs();
			this.state = 477;
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
			this.state = 632;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 69, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 481;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 482;
				this.normalCallName();
				this.state = 483;
				this.match(QuintParser.LPAREN);
				this.state = 485;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__13 - 2)) | (1 << (QuintParser.T__14 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
					{
					this.state = 484;
					this.argList();
					}
				}

				this.state = 488;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 487;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 490;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 492;
				this.match(QuintParser.MINUS);
				this.state = 493;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 494;
				this.qualId();
				this.state = 495;
				this.match(QuintParser.T__27);
				this.state = 496;
				this.match(QuintParser.ASGN);
				this.state = 497;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 499;
				this.match(QuintParser.AND);
				this.state = 500;
				this.match(QuintParser.T__1);
				this.state = 501;
				this.expr(0);
				this.state = 506;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 502;
						this.match(QuintParser.T__7);
						this.state = 503;
						this.expr(0);
						}
						}
					}
					this.state = 508;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
				}
				this.state = 510;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 509;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 512;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 514;
				this.match(QuintParser.OR);
				this.state = 515;
				this.match(QuintParser.T__1);
				this.state = 516;
				this.expr(0);
				this.state = 521;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 517;
						this.match(QuintParser.T__7);
						this.state = 518;
						this.expr(0);
						}
						}
					}
					this.state = 523;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				}
				this.state = 525;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 524;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 527;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new MatchContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 529;
				this.matchSumExpr();
				}
				break;

			case 8:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 530;
				this.match(QuintParser.T__28);
				this.state = 531;
				this.match(QuintParser.T__1);
				this.state = 532;
				this.expr(0);
				this.state = 537;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 533;
						this.match(QuintParser.T__7);
						this.state = 534;
						this.expr(0);
						}
						}
					}
					this.state = 539;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 57, this._ctx);
				}
				this.state = 541;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 540;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 543;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 545;
				this.match(QuintParser.T__29);
				this.state = 546;
				this.match(QuintParser.T__1);
				this.state = 547;
				this.expr(0);
				this.state = 552;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 59, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 548;
						this.match(QuintParser.T__7);
						this.state = 549;
						this.expr(0);
						}
						}
					}
					this.state = 554;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 59, this._ctx);
				}
				this.state = 556;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 555;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 558;
				this.match(QuintParser.T__2);
				}
				break;

			case 10:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 564;
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
					this.state = 560;
					this.qualId();
					}
					break;
				case QuintParser.INT:
					{
					this.state = 561;
					this.match(QuintParser.INT);
					}
					break;
				case QuintParser.BOOL:
					{
					this.state = 562;
					this.match(QuintParser.BOOL);
					}
					break;
				case QuintParser.STRING:
					{
					this.state = 563;
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
				this.state = 566;
				this.match(QuintParser.LPAREN);
				this.state = 567;
				this.expr(0);
				this.state = 568;
				this.match(QuintParser.T__7);
				this.state = 569;
				this.expr(0);
				this.state = 574;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 570;
						this.match(QuintParser.T__7);
						this.state = 571;
						this.expr(0);
						}
						}
					}
					this.state = 576;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
				}
				this.state = 578;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 577;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 580;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 12:
				{
				_localctx = new UnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 582;
				this.match(QuintParser.LPAREN);
				this.state = 583;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 584;
				this.match(QuintParser.T__1);
				this.state = 585;
				this.recElem();
				this.state = 590;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 64, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 586;
						this.match(QuintParser.T__7);
						this.state = 587;
						this.recElem();
						}
						}
					}
					this.state = 592;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 64, this._ctx);
				}
				this.state = 594;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 593;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 596;
				this.match(QuintParser.T__2);
				}
				break;

			case 14:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 598;
				this.match(QuintParser.T__10);
				this.state = 607;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__13 - 2)) | (1 << (QuintParser.T__14 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
					{
					this.state = 599;
					this.expr(0);
					this.state = 604;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 66, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 600;
							this.match(QuintParser.T__7);
							this.state = 601;
							this.expr(0);
							}
							}
						}
						this.state = 606;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 66, this._ctx);
					}
					}
				}

				this.state = 610;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 609;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 612;
				this.match(QuintParser.T__11);
				}
				break;

			case 15:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 613;
				this.match(QuintParser.T__30);
				this.state = 614;
				this.match(QuintParser.LPAREN);
				this.state = 615;
				this.expr(0);
				this.state = 616;
				this.match(QuintParser.RPAREN);
				this.state = 617;
				this.expr(0);
				this.state = 618;
				this.match(QuintParser.T__31);
				this.state = 619;
				this.expr(4);
				}
				break;

			case 16:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 621;
				this.operDef();
				this.state = 622;
				this.expr(3);
				}
				break;

			case 17:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 624;
				this.match(QuintParser.LPAREN);
				this.state = 625;
				this.expr(0);
				this.state = 626;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 18:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 628;
				this.match(QuintParser.T__1);
				this.state = 629;
				this.expr(0);
				this.state = 630;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 683;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 73, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 681;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 72, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 634;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 635;
						(_localctx as PowContext)._op = this.match(QuintParser.T__26);
						this.state = 636;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 637;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 638;
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
						this.state = 639;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 640;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 641;
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
						this.state = 642;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 643;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 644;
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
						this.state = 645;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 646;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 647;
						this.match(QuintParser.ASGN);
						this.state = 648;
						this.expr(21);

						                            const m = "[QNT006] unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 651;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 652;
						this.match(QuintParser.AND);
						this.state = 653;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 654;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 655;
						this.match(QuintParser.OR);
						this.state = 656;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 657;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 658;
						this.match(QuintParser.IFF);
						this.state = 659;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 660;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 661;
						this.match(QuintParser.IMPLIES);
						this.state = 662;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 663;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 664;
						this.match(QuintParser.T__21);
						this.state = 665;
						this.expr(8);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 666;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 667;
						this.match(QuintParser.T__20);
						this.state = 668;
						this.nameAfterDot();
						this.state = 674;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 71, this._ctx) ) {
						case 1:
							{
							this.state = 669;
							this.match(QuintParser.LPAREN);
							this.state = 671;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (((((_la - 2)) & ~0x1F) === 0 && ((1 << (_la - 2)) & ((1 << (QuintParser.T__1 - 2)) | (1 << (QuintParser.T__10 - 2)) | (1 << (QuintParser.T__13 - 2)) | (1 << (QuintParser.T__14 - 2)) | (1 << (QuintParser.T__15 - 2)) | (1 << (QuintParser.T__16 - 2)) | (1 << (QuintParser.T__17 - 2)) | (1 << (QuintParser.T__18 - 2)) | (1 << (QuintParser.T__19 - 2)) | (1 << (QuintParser.T__28 - 2)) | (1 << (QuintParser.T__29 - 2)) | (1 << (QuintParser.T__30 - 2)) | (1 << (QuintParser.T__32 - 2)))) !== 0) || ((((_la - 36)) & ~0x1F) === 0 && ((1 << (_la - 36)) & ((1 << (QuintParser.STRING - 36)) | (1 << (QuintParser.BOOL - 36)) | (1 << (QuintParser.INT - 36)) | (1 << (QuintParser.AND - 36)) | (1 << (QuintParser.OR - 36)) | (1 << (QuintParser.IFF - 36)) | (1 << (QuintParser.IMPLIES - 36)) | (1 << (QuintParser.MATCH - 36)) | (1 << (QuintParser.MINUS - 36)) | (1 << (QuintParser.LPAREN - 36)) | (1 << (QuintParser.SET - 36)) | (1 << (QuintParser.LIST - 36)) | (1 << (QuintParser.IMPORT - 36)) | (1 << (QuintParser.EXPORT - 36)) | (1 << (QuintParser.FROM - 36)) | (1 << (QuintParser.AS - 36)) | (1 << (QuintParser.LOW_ID - 36)) | (1 << (QuintParser.CAP_ID - 36)))) !== 0)) {
								{
								this.state = 670;
								this.argList();
								}
							}

							this.state = 673;
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
						this.state = 676;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 677;
						this.match(QuintParser.T__10);
						this.state = 678;
						this.expr(0);
						this.state = 679;
						this.match(QuintParser.T__11);
						}
						break;
					}
					}
				}
				this.state = 685;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 73, this._ctx);
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
			this.state = 686;
			this.match(QuintParser.MATCH);
			this.state = 687;
			this.expr(0);
			this.state = 688;
			this.match(QuintParser.T__1);
			this.state = 690;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 689;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 692;
			_localctx._matchSumCase = this.matchSumCase();
			_localctx._matchCase.push(_localctx._matchSumCase);
			this.state = 697;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 693;
				this.match(QuintParser.T__12);
				this.state = 694;
				_localctx._matchSumCase = this.matchSumCase();
				_localctx._matchCase.push(_localctx._matchSumCase);
				}
				}
				this.state = 699;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 700;
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
			this.state = 704;
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
				this.state = 702;
				_localctx._variantMatch = this.matchSumVariant();
				}
				break;
			case QuintParser.T__32:
				{
				this.state = 703;
				_localctx._wildCardMatch = this.match(QuintParser.T__32);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 706;
			this.match(QuintParser.T__22);
			this.state = 707;
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
			this.state = 709;
			_localctx._variantLabel = this.simpleId("variant label");
			}
			this.state = 716;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 710;
				this.match(QuintParser.LPAREN);
				this.state = 713;
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
					this.state = 711;
					_localctx._variantParam = this.simpleId("match case parameter");
					}
					break;
				case QuintParser.T__32:
					{
					this.state = 712;
					this.match(QuintParser.T__32);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 715;
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
			this.state = 727;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 79, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 718;
				this.declaration();
				this.state = 719;
				this.match(QuintParser.EOF);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 721;
				this.expr(0);
				this.state = 722;
				this.match(QuintParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 724;
				this.match(QuintParser.DOCCOMMENT);
				this.state = 725;
				this.match(QuintParser.EOF);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 726;
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
			this.state = 731;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 80, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 729;
				this.lambdaUnsugared();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 730;
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
			this.state = 750;
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
				this.state = 733;
				this.parameter();
				this.state = 734;
				this.match(QuintParser.T__22);
				this.state = 735;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 737;
				this.match(QuintParser.LPAREN);
				this.state = 738;
				this.parameter();
				this.state = 743;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 739;
					this.match(QuintParser.T__7);
					this.state = 740;
					this.parameter();
					}
					}
					this.state = 745;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 746;
				this.match(QuintParser.RPAREN);
				this.state = 747;
				this.match(QuintParser.T__22);
				this.state = 748;
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
			this.state = 752;
			this.match(QuintParser.LPAREN);
			this.state = 753;
			this.match(QuintParser.LPAREN);
			this.state = 754;
			this.parameter();
			this.state = 757;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 755;
				this.match(QuintParser.T__7);
				this.state = 756;
				this.parameter();
				}
				}
				this.state = 759;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__7);
			this.state = 761;
			this.match(QuintParser.RPAREN);
			this.state = 762;
			this.match(QuintParser.RPAREN);
			this.state = 763;
			this.match(QuintParser.T__22);
			this.state = 764;
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
			this.state = 768;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__32:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 766;
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
				this.state = 767;
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
			this.state = 770;
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
			this.state = 772;
			_localctx._paramName = this.identOrHole();
			this.state = 773;
			this.match(QuintParser.T__4);
			this.state = 774;
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
	public identOrStar(): IdentOrStarContext {
		let _localctx: IdentOrStarContext = new IdentOrStarContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, QuintParser.RULE_identOrStar);
		try {
			this.state = 778;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.MUL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 776;
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
				this.state = 777;
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
		this.enterRule(_localctx, 72, QuintParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 780;
			this.expr(0);
			this.state = 785;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 86, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 781;
					this.match(QuintParser.T__7);
					this.state = 782;
					this.expr(0);
					}
					}
				}
				this.state = 787;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 86, this._ctx);
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
		this.enterRule(_localctx, 74, QuintParser.RULE_recElem);
		try {
			this.state = 794;
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
				this.state = 788;
				this.simpleId("record");
				this.state = 789;
				this.match(QuintParser.T__4);
				this.state = 790;
				this.expr(0);
				}
				break;
			case QuintParser.T__33:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 792;
				this.match(QuintParser.T__33);
				this.state = 793;
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
		this.enterRule(_localctx, 76, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 798;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 88, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 796;
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
				this.state = 797;
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
		this.enterRule(_localctx, 78, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 802;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 89, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 800;
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
				this.state = 801;
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
		this.enterRule(_localctx, 80, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 804;
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
		this.enterRule(_localctx, 82, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 806;
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
		this.enterRule(_localctx, 84, QuintParser.RULE_qualId);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 808;
			this.identifier();
			this.state = 813;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 90, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 809;
					this.match(QuintParser.T__34);
					this.state = 810;
					this.identifier();
					}
					}
				}
				this.state = 815;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 90, this._ctx);
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
		this.enterRule(_localctx, 86, QuintParser.RULE_simpleId);
		try {
			this.state = 820;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 91, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 816;
				this.identifier();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 817;
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
		this.enterRule(_localctx, 88, QuintParser.RULE_identifier);
		try {
			this.state = 828;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 822;
				this.match(QuintParser.LOW_ID);
				}
				break;
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 823;
				this.match(QuintParser.CAP_ID);
				}
				break;
			case QuintParser.SET:
			case QuintParser.LIST:
			case QuintParser.FROM:
			case QuintParser.AS:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 824;
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
				this.state = 825;
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
		this.enterRule(_localctx, 90, QuintParser.RULE_keywordAsID);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 830;
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
		this.enterRule(_localctx, 92, QuintParser.RULE_reserved);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 832;
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03H\u0345\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x03\x02\x05\x02b\n\x02\x03\x02" +
		"\x06\x02e\n\x02\r\x02\x0E\x02f\x03\x02\x03\x02\x03\x03\x07\x03l\n\x03" +
		"\f\x03\x0E\x03o\v\x03\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03u\n\x03\f" +
		"\x03\x0E\x03x\v\x03\x03\x03\x03\x03\x03\x04\x07\x04}\n\x04\f\x04\x0E\x04" +
		"\x80\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05\x98\n\x05\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06\xA0\n\x06\f\x06\x0E\x06" +
		"\xA3\v\x06\x03\x06\x05\x06\xA6\n\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x05\x06\xAD\n\x06\x03\x06\x05\x06\xB0\n\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x03\x06\x07\x06\xB8\n\x06\f\x06\x0E\x06\xBB\v\x06\x03" +
		"\x06\x05\x06\xBE\n\x06\x05\x06\xC0\n\x06\x03\x06\x05\x06\xC3\n\x06\x03" +
		"\x06\x03\x06\x05\x06\xC7\n\x06\x03\x06\x03\x06\x05\x06\xCB\n\x06\x03\x06" +
		"\x05\x06\xCE\n\x06\x05\x06\xD0\n\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07\xDE" +
		"\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xE5\n\b\f\b\x0E\b\xE8\v\b\x03" +
		"\b\x05\b\xEB\n\b\x03\t\x05\t\xEE\n\t\x03\t\x03\t\x03\t\x07\t\xF3\n\t\f" +
		"\t\x0E\t\xF6\v\t\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\xFD\n\n\x03\v\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v\u0109\n\v\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u0111\n\f\x03\f\x03\f\x03\f\x03" +
		"\f\x05\f\u0117\n\f\x03\f\x03\f\x05\f\u011B\n\f\x05\f\u011D\n\f\x03\r\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0128\n\r\x05\r\u012A" +
		"\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x07\x0E\u0137\n\x0E\f\x0E\x0E\x0E\u013A\v\x0E\x03" +
		"\x0E\x05\x0E\u013D\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x05\x0E" +
		"\u0144\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u0151\n\x0E\f\x0E\x0E\x0E\u0154\v" +
		"\x0E\x03\x0E\x05\x0E\u0157\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x05\x0E\u015E\n\x0E\x05\x0E\u0160\n\x0E\x03\x0F\x03\x0F\x03\x10\x03\x10" +
		"\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x07\x13\u016F\n\x13\f\x13\x0E\x13\u0172\v\x13\x05\x13\u0174\n\x13\x03" +
		"\x13\x05\x13\u0177\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13\u018E\n\x13\f" +
		"\x13\x0E\x13\u0191\v\x13\x03\x13\x05\x13\u0194\n\x13\x03\x13\x03\x13\x03" +
		"\x13\x03\x13\x05\x13\u019A\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\u01A8" +
		"\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13\u01B0\n" +
		"\x13\f\x13\x0E\x13\u01B3\v\x13\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15" +
		"\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x07\x15\u01C0\n\x15\f" +
		"\x15\x0E\x15\u01C3\v\x15\x03\x15\x03\x15\x03\x15\x05\x15\u01C8\n\x15\x03" +
		"\x15\x03\x15\x05\x15\u01CC\n\x15\x03\x16\x03\x16\x03\x17\x03\x17\x03\x17" +
		"\x07\x17\u01D3\n\x17\f\x17\x0E\x17\u01D6\v\x17\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u01E8\n\x1A\x03\x1A\x05\x1A\u01EB" +
		"\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u01FB\n\x1A\f" +
		"\x1A\x0E\x1A\u01FE\v\x1A\x03\x1A\x05\x1A\u0201\n\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u020A\n\x1A\f\x1A\x0E\x1A" +
		"\u020D\v\x1A\x03\x1A\x05\x1A\u0210\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u021A\n\x1A\f\x1A\x0E\x1A\u021D" +
		"\v\x1A\x03\x1A\x05\x1A\u0220\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x07\x1A\u0229\n\x1A\f\x1A\x0E\x1A\u022C\v\x1A\x03" +
		"\x1A\x05\x1A\u022F\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x05\x1A\u0237\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07" +
		"\x1A\u023F\n\x1A\f\x1A\x0E\x1A\u0242\v\x1A\x03\x1A\x05\x1A\u0245\n\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A" +
		"\u024F\n\x1A\f\x1A\x0E\x1A\u0252\v\x1A\x03\x1A\x05\x1A\u0255\n\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u025D\n\x1A\f\x1A" +
		"\x0E\x1A\u0260\v\x1A\x05\x1A\u0262\n\x1A\x03\x1A\x05\x1A\u0265\n\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03" +
		"\x1A\x03\x1A\x05\x1A\u027B\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u02A2\n\x1A\x03\x1A\x05" +
		"\x1A\u02A5\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x07\x1A\u02AC" +
		"\n\x1A\f\x1A\x0E\x1A\u02AF\v\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x05\x1B" +
		"\u02B5\n\x1B\x03\x1B\x03\x1B\x03\x1B\x07\x1B\u02BA\n\x1B\f\x1B\x0E\x1B" +
		"\u02BD\v\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x05\x1C\u02C3\n\x1C\x03\x1C" +
		"\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x05\x1D\u02CC\n\x1D\x03" +
		"\x1D\x05\x1D\u02CF\n\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E" +
		"\x03\x1E\x03\x1E\x03\x1E\x05\x1E\u02DA\n\x1E\x03\x1F\x03\x1F\x05\x1F\u02DE" +
		"\n\x1F\x03 \x03 \x03 \x03 \x03 \x03 \x03 \x03 \x07 \u02E8\n \f \x0E \u02EB" +
		"\v \x03 \x03 \x03 \x03 \x05 \u02F1\n \x03!\x03!\x03!\x03!\x03!\x06!\u02F8" +
		"\n!\r!\x0E!\u02F9\x03!\x03!\x03!\x03!\x03!\x03\"\x03\"\x05\"\u0303\n\"" +
		"\x03#\x03#\x03$\x03$\x03$\x03$\x03%\x03%\x05%\u030D\n%\x03&\x03&\x03&" +
		"\x07&\u0312\n&\f&\x0E&\u0315\v&\x03\'\x03\'\x03\'\x03\'\x03\'\x03\'\x05" +
		"\'\u031D\n\'\x03(\x03(\x05(\u0321\n(\x03)\x03)\x05)\u0325\n)\x03*\x03" +
		"*\x03+\x03+\x03,\x03,\x03,\x07,\u032E\n,\f,\x0E,\u0331\v,\x03-\x03-\x03" +
		"-\x03-\x05-\u0337\n-\x03.\x03.\x03.\x03.\x03.\x03.\x05.\u033F\n.\x03/" +
		"\x03/\x030\x030\x030\x02\x02\x04$21\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02" +
		"\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x02" +
		"8\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02" +
		"T\x02V\x02X\x02Z\x02\\\x02^\x02\x02\v\x03\x0202\x03\x02./\x03\x0238\x04" +
		"\x02),<=\x03\x02),\x05\x02\x1D\x1D),.8\x03\x02&(\x04\x02<=@A\x04\x02)" +
		"->?\x02\u03AC\x02a\x03\x02\x02\x02\x04m\x03\x02\x02\x02\x06~\x03\x02\x02" +
		"\x02\b\x97\x03\x02\x02\x02\n\xCF\x03\x02\x02\x02\f\xDD\x03\x02\x02\x02" +
		"\x0E\xDF\x03\x02\x02\x02\x10\xED\x03\x02\x02\x02\x12\xF7\x03\x02\x02\x02" +
		"\x14\u0108\x03\x02\x02\x02\x16\u011C\x03\x02\x02\x02\x18\u0129\x03\x02" +
		"\x02\x02\x1A\u015F\x03\x02\x02\x02\x1C\u0161\x03\x02\x02\x02\x1E\u0163" +
		"\x03\x02\x02\x02 \u0165\x03\x02\x02\x02\"\u0167\x03\x02\x02\x02$\u01A7" +
		"\x03\x02\x02\x02&\u01B4\x03\x02\x02\x02(\u01CB\x03\x02\x02\x02*\u01CD" +
		"\x03\x02\x02\x02,\u01CF\x03\x02\x02\x02.\u01D7\x03\x02\x02\x020\u01DC" +
		"\x03\x02\x02\x022\u027A\x03\x02\x02\x024\u02B0\x03\x02\x02\x026\u02C2" +
		"\x03\x02\x02\x028\u02C7\x03\x02\x02\x02:\u02D9\x03\x02\x02\x02<\u02DD" +
		"\x03\x02\x02\x02>\u02F0\x03\x02\x02\x02@\u02F2\x03\x02\x02\x02B\u0302" +
		"\x03\x02\x02\x02D\u0304\x03\x02\x02\x02F\u0306\x03\x02\x02\x02H\u030C" +
		"\x03\x02\x02\x02J\u030E\x03\x02\x02\x02L\u031C\x03\x02\x02\x02N\u0320" +
		"\x03\x02\x02\x02P\u0324\x03\x02\x02\x02R\u0326\x03\x02\x02\x02T\u0328" +
		"\x03\x02\x02\x02V\u032A\x03\x02\x02\x02X\u0336\x03\x02\x02\x02Z\u033E" +
		"\x03\x02\x02\x02\\\u0340\x03\x02\x02\x02^\u0342\x03\x02\x02\x02`b\x07" +
		"D\x02\x02a`\x03\x02\x02\x02ab\x03\x02\x02\x02bd\x03\x02\x02\x02ce\x05" +
		"\x04\x03\x02dc\x03\x02\x02\x02ef\x03\x02\x02\x02fd\x03\x02\x02\x02fg\x03" +
		"\x02\x02\x02gh\x03\x02\x02\x02hi\x07\x02\x02\x03i\x03\x03\x02\x02\x02" +
		"jl\x07E\x02\x02kj\x03\x02\x02\x02lo\x03\x02\x02\x02mk\x03\x02\x02\x02" +
		"mn\x03\x02\x02\x02np\x03\x02\x02\x02om\x03\x02\x02\x02pq\x07\x03\x02\x02" +
		"qr\x05V,\x02rv\x07\x04\x02\x02su\x05\x06\x04\x02ts\x03\x02\x02\x02ux\x03" +
		"\x02\x02\x02vt\x03\x02\x02\x02vw\x03\x02\x02\x02wy\x03\x02\x02\x02xv\x03" +
		"\x02\x02\x02yz\x07\x05\x02\x02z\x05\x03\x02\x02\x02{}\x07E\x02\x02|{\x03" +
		"\x02\x02\x02}\x80\x03\x02\x02\x02~|\x03\x02\x02\x02~\x7F\x03\x02\x02\x02" +
		"\x7F\x81\x03\x02\x02\x02\x80~\x03\x02\x02\x02\x81\x82\x05\b\x05\x02\x82" +
		"\x07\x03\x02\x02\x02\x83\x84\x07\x06\x02\x02\x84\x85\x05V,\x02\x85\x86" +
		"\x07\x07\x02\x02\x86\x87\x05$\x13\x02\x87\x98\x03\x02\x02\x02\x88\x89" +
		"\x07\b\x02\x02\x89\x8A\x05V,\x02\x8A\x8B\x07\x07\x02\x02\x8B\x8C\x05$" +
		"\x13\x02\x8C\x98\x03\x02\x02\x02\x8D\x8E\x07\t\x02\x02\x8E\x8F\x05B\"" +
		"\x02\x8F\x90\x079\x02\x02\x90\x91\x052\x1A\x02\x91\x98\x03\x02\x02\x02" +
		"\x92\x98\x05\x1A\x0E\x02\x93\x98\x05\n\x06\x02\x94\x98\x05\f\x07\x02\x95" +
		"\x98\x05\x16\f\x02\x96\x98\x05\x18\r\x02\x97\x83\x03\x02\x02\x02\x97\x88" +
		"\x03\x02\x02\x02\x97\x8D\x03\x02\x02\x02\x97\x92\x03\x02\x02\x02\x97\x93" +
		"\x03\x02\x02\x02\x97\x94\x03\x02\x02\x02\x97\x95\x03\x02\x02\x02\x97\x96" +
		"\x03\x02\x02\x02\x98\t\x03\x02\x02\x02\x99\x9A\x05\x14\v\x02\x9A\x9B\x05" +
		"N(\x02\x9B\x9C\x07:\x02\x02\x9C\xA1\x05F$\x02\x9D\x9E\x07\n\x02\x02\x9E" +
		"\xA0\x05F$\x02\x9F\x9D\x03\x02\x02\x02\xA0\xA3\x03\x02\x02\x02\xA1\x9F" +
		"\x03\x02\x02\x02\xA1\xA2\x03\x02\x02\x02\xA2\xA5\x03\x02\x02\x02\xA3\xA1" +
		"\x03\x02\x02\x02\xA4\xA6\x07\n\x02\x02\xA5\xA4\x03\x02\x02\x02\xA5\xA6" +
		"\x03\x02\x02\x02\xA6\xA7\x03\x02\x02\x02\xA7\xA8\x07;\x02\x02\xA8\xA9" +
		"\x07\x07\x02\x02\xA9\xAC\x05$\x13\x02\xAA\xAB\x079\x02\x02\xAB\xAD\x05" +
		"2\x1A\x02\xAC\xAA\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02\xAD\xAF\x03" +
		"\x02\x02\x02\xAE\xB0\x07\v\x02\x02\xAF\xAE\x03\x02\x02\x02\xAF\xB0\x03" +
		"\x02\x02\x02\xB0\xD0\x03\x02\x02\x02\xB1\xB2\x05\x14\v\x02\xB2\xC2\x05" +
		"N(\x02\xB3\xBF\x07:\x02\x02\xB4\xB9\x05D#\x02\xB5\xB6\x07\n\x02\x02\xB6" +
		"\xB8\x05D#\x02\xB7\xB5\x03\x02\x02\x02\xB8\xBB\x03\x02\x02\x02\xB9\xB7" +
		"\x03\x02\x02\x02\xB9\xBA\x03\x02\x02\x02\xBA\xBD\x03\x02\x02\x02\xBB\xB9" +
		"\x03\x02\x02\x02\xBC\xBE\x07\n\x02\x02\xBD\xBC\x03\x02\x02\x02\xBD\xBE" +
		"\x03\x02\x02\x02\xBE\xC0\x03\x02\x02\x02\xBF\xB4\x03\x02\x02\x02\xBF\xC0" +
		"\x03\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\xC3\x07;\x02\x02\xC2\xB3" +
		"\x03\x02\x02\x02\xC2\xC3\x03\x02\x02\x02\xC3\xC6\x03\x02\x02\x02\xC4\xC5" +
		"\x07\x07\x02\x02\xC5\xC7\x05$\x13\x02\xC6\xC4\x03\x02\x02\x02\xC6\xC7" +
		"\x03\x02\x02\x02\xC7\xCA\x03\x02\x02\x02\xC8\xC9\x079\x02\x02\xC9\xCB" +
		"\x052\x1A\x02\xCA\xC8\x03\x02\x02\x02\xCA\xCB\x03\x02\x02\x02\xCB\xCD" +
		"\x03\x02\x02\x02\xCC\xCE\x07\v\x02\x02\xCD\xCC\x03\x02\x02\x02\xCD\xCE" +
		"\x03\x02\x02\x02\xCE\xD0\x03\x02\x02\x02\xCF\x99\x03\x02\x02\x02\xCF\xB1" +
		"\x03\x02\x02\x02\xD0\v\x03\x02\x02\x02\xD1\xD2\x07\f\x02\x02\xD2\xDE\x05" +
		"V,\x02\xD3\xD4\x07\f\x02\x02\xD4\xD5\x05\x0E\b\x02\xD5\xD6\x079\x02\x02" +
		"\xD6\xD7\x05\x10\t\x02\xD7\xDE\x03\x02\x02\x02\xD8\xD9\x07\f\x02\x02\xD9" +
		"\xDA\x05\x0E\b\x02\xDA\xDB\x079\x02\x02\xDB\xDC\x05$\x13\x02\xDC\xDE\x03" +
		"\x02\x02\x02\xDD\xD1\x03\x02\x02\x02\xDD\xD3\x03\x02\x02\x02\xDD\xD8\x03" +
		"\x02\x02\x02\xDE\r\x03\x02\x02\x02\xDF\xEA\x05V,\x02\xE0\xE1\x07\r\x02" +
		"\x02\xE1\xE6\x07B\x02\x02\xE2\xE3\x07\n\x02\x02\xE3\xE5\x07B\x02\x02\xE4" +
		"\xE2\x03\x02\x02\x02\xE5\xE8\x03\x02\x02\x02\xE6\xE4\x03\x02\x02\x02\xE6" +
		"\xE7\x03\x02\x02\x02\xE7\xE9\x03\x02\x02\x02\xE8\xE6\x03\x02\x02\x02\xE9" +
		"\xEB\x07\x0E\x02\x02\xEA\xE0\x03\x02\x02\x02\xEA\xEB\x03\x02\x02\x02\xEB" +
		"\x0F\x03\x02\x02\x02\xEC\xEE\x07\x0F\x02\x02\xED\xEC\x03\x02\x02\x02\xED" +
		"\xEE\x03\x02\x02\x02\xEE\xEF\x03\x02\x02\x02\xEF\xF4\x05\x12\n\x02\xF0" +
		"\xF1\x07\x0F\x02\x02\xF1\xF3\x05\x12\n\x02\xF2\xF0\x03\x02\x02\x02\xF3" +
		"\xF6\x03\x02\x02\x02\xF4\xF2\x03\x02\x02\x02\xF4\xF5\x03\x02\x02\x02\xF5" +
		"\x11\x03\x02\x02\x02\xF6\xF4\x03\x02\x02\x02\xF7\xFC\x05X-\x02\xF8\xF9" +
		"\x07:\x02\x02\xF9\xFA\x05$\x13\x02\xFA\xFB\x07;\x02\x02\xFB\xFD\x03\x02" +
		"\x02\x02\xFC\xF8\x03\x02\x02\x02\xFC\xFD\x03\x02\x02\x02\xFD\x13\x03\x02" +
		"\x02\x02\xFE\u0109\x07\x10\x02\x02\xFF\u0109\x07\x11\x02\x02\u0100\u0101" +
		"\x07\x12\x02\x02\u0101\u0109\x07\x10\x02\x02\u0102\u0103\x07\x12\x02\x02" +
		"\u0103\u0109\x07\x11\x02\x02\u0104\u0109\x07\x13\x02\x02\u0105\u0109\x07" +
		"\x14\x02\x02\u0106\u0109\x07\x15\x02\x02\u0107\u0109\x07\x16\x02\x02\u0108" +
		"\xFE\x03\x02\x02\x02\u0108\xFF\x03\x02\x02\x02\u0108\u0100\x03\x02\x02" +
		"\x02\u0108\u0102\x03\x02\x02\x02\u0108\u0104\x03\x02\x02\x02\u0108\u0105" +
		"\x03\x02\x02\x02\u0108\u0106\x03\x02\x02\x02\u0108\u0107\x03\x02\x02\x02" +
		"\u0109\x15\x03\x02\x02\x02\u010A\u010B\x07>\x02\x02\u010B\u010C\x05\x1E" +
		"\x10\x02\u010C\u010D\x07\x17\x02\x02\u010D\u0110\x05H%\x02\u010E\u010F" +
		"\x07@\x02\x02\u010F\u0111\x05\"\x12\x02\u0110\u010E\x03\x02\x02\x02\u0110" +
		"\u0111\x03\x02\x02\x02\u0111\u011D\x03\x02\x02\x02\u0112\u0113\x07>\x02" +
		"\x02\u0113\u0116\x05\x1E\x10\x02\u0114\u0115\x07A\x02\x02\u0115\u0117" +
		"\x05\x1E\x10\x02\u0116\u0114\x03\x02\x02\x02\u0116\u0117\x03\x02\x02\x02" +
		"\u0117\u011A\x03\x02\x02\x02\u0118\u0119\x07@\x02\x02\u0119\u011B\x05" +
		"\"\x12\x02\u011A\u0118\x03\x02\x02\x02\u011A\u011B\x03\x02\x02\x02\u011B" +
		"\u011D\x03\x02\x02\x02\u011C\u010A\x03\x02\x02\x02\u011C\u0112\x03\x02" +
		"\x02\x02\u011D\x17\x03\x02\x02\x02\u011E\u011F\x07?\x02\x02\u011F\u0120" +
		"\x05\x1E\x10\x02\u0120\u0121\x07\x17\x02\x02\u0121\u0122\x05H%\x02\u0122" +
		"\u012A\x03\x02\x02\x02\u0123\u0124\x07?\x02\x02\u0124\u0127\x05\x1E\x10" +
		"\x02\u0125\u0126\x07A\x02\x02\u0126\u0128\x05\x1E\x10\x02\u0127\u0125" +
		"\x03\x02\x02\x02\u0127\u0128\x03\x02\x02\x02\u0128\u012A\x03\x02\x02\x02" +
		"\u0129\u011E\x03\x02\x02\x02\u0129\u0123\x03\x02\x02\x02\u012A\x19\x03" +
		"\x02\x02\x02\u012B\u012C\x07>\x02\x02\u012C\u012D\x05\x1C\x0F\x02\u012D" +
		"\u012E\x07:\x02\x02\u012E\u012F\x05\x1E\x10\x02\u012F\u0130\x079\x02\x02" +
		"\u0130\u0138\x052\x1A\x02\u0131\u0132\x07\n\x02\x02\u0132\u0133\x05\x1E" +
		"\x10\x02\u0133\u0134\x079\x02\x02\u0134\u0135\x052\x1A\x02\u0135\u0137" +
		"\x03\x02\x02\x02\u0136\u0131\x03\x02\x02\x02\u0137\u013A\x03\x02\x02\x02" +
		"\u0138\u0136\x03\x02\x02\x02\u0138\u0139\x03\x02\x02\x02\u0139\u013C\x03" +
		"\x02\x02\x02\u013A\u0138\x03\x02\x02\x02\u013B\u013D\x07\n\x02\x02\u013C" +
		"\u013B\x03\x02\x02\x02\u013C\u013D\x03\x02\x02\x02\u013D\u013E\x03\x02" +
		"\x02\x02\u013E\u013F\x07;\x02\x02\u013F\u0140\x07\x17\x02\x02\u0140\u0143" +
		"\x070\x02\x02\u0141\u0142\x07@\x02\x02\u0142\u0144\x05\"\x12\x02\u0143" +
		"\u0141\x03\x02\x02\x02\u0143\u0144\x03\x02\x02\x02\u0144\u0160\x03\x02" +
		"\x02\x02\u0145\u0146\x07>\x02\x02\u0146\u0147\x05\x1C\x0F\x02\u0147\u0148" +
		"\x07:\x02\x02\u0148\u0149\x05\x1E\x10\x02\u0149\u014A\x079\x02\x02\u014A" +
		"\u0152\x052\x1A\x02\u014B\u014C\x07\n\x02\x02\u014C\u014D\x05\x1E\x10" +
		"\x02\u014D\u014E\x079\x02\x02\u014E\u014F\x052\x1A\x02\u014F\u0151\x03" +
		"\x02\x02\x02\u0150\u014B\x03\x02\x02\x02\u0151\u0154\x03\x02\x02\x02\u0152" +
		"\u0150\x03\x02\x02\x02\u0152\u0153\x03\x02\x02\x02\u0153\u0156\x03\x02" +
		"\x02\x02\u0154\u0152\x03\x02\x02\x02\u0155\u0157\x07\n\x02\x02\u0156\u0155" +
		"\x03\x02\x02\x02\u0156\u0157\x03\x02\x02\x02\u0157\u0158\x03\x02\x02\x02" +
		"\u0158\u0159\x07;\x02\x02\u0159\u015A\x07A\x02\x02\u015A\u015D\x05 \x11" +
		"\x02\u015B\u015C\x07@\x02\x02\u015C\u015E\x05\"\x12\x02\u015D\u015B\x03" +
		"\x02\x02\x02\u015D\u015E\x03\x02\x02\x02\u015E\u0160\x03\x02\x02\x02\u015F" +
		"\u012B\x03\x02\x02\x02\u015F\u0145\x03\x02\x02\x02\u0160\x1B\x03\x02\x02" +
		"\x02\u0161\u0162\x05V,\x02\u0162\x1D\x03\x02\x02\x02\u0163\u0164\x05V" +
		",\x02\u0164\x1F\x03\x02\x02\x02\u0165\u0166\x05V,\x02\u0166!\x03\x02\x02" +
		"\x02\u0167\u0168\x07&\x02\x02\u0168#\x03\x02\x02\x02\u0169\u016A\b\x13" +
		"\x01\x02\u016A\u0173\x07:\x02\x02\u016B\u0170\x05$\x13\x02\u016C\u016D" +
		"\x07\n\x02\x02\u016D\u016F\x05$\x13\x02\u016E\u016C\x03\x02\x02\x02\u016F" +
		"\u0172\x03\x02\x02\x02\u0170\u016E\x03\x02\x02\x02\u0170\u0171\x03\x02" +
		"\x02\x02\u0171\u0174\x03\x02\x02\x02\u0172\u0170\x03\x02\x02\x02\u0173" +
		"\u016B\x03\x02\x02\x02\u0173\u0174\x03\x02\x02\x02\u0174\u0176\x03\x02" +
		"\x02\x02\u0175\u0177\x07\n\x02\x02\u0176\u0175\x03\x02\x02\x02\u0176\u0177" +
		"\x03\x02\x02\x02\u0177\u0178\x03\x02\x02\x02\u0178\u0179\x07;\x02\x02" +
		"\u0179\u017A\x07\x19\x02\x02\u017A\u01A8\x05$\x13\x10\u017B\u017C\x07" +
		"<\x02\x02\u017C\u017D\x07\r\x02\x02\u017D\u017E\x05$\x13\x02\u017E\u017F" +
		"\x07\x0E\x02\x02\u017F\u01A8\x03\x02\x02\x02\u0180\u0181\x07=\x02\x02" +
		"\u0181\u0182\x07\r\x02\x02\u0182\u0183\x05$\x13\x02\u0183\u0184\x07\x0E" +
		"\x02\x02\u0184\u01A8\x03\x02\x02\x02\u0185\u0186\x07:\x02\x02\u0186\u01A8" +
		"\x07;\x02\x02\u0187\u0188\x07:\x02\x02\u0188\u0189\x05$\x13\x02\u0189" +
		"\u018A\x07\n\x02\x02\u018A\u018F\x05$\x13\x02\u018B\u018C\x07\n\x02\x02" +
		"\u018C\u018E\x05$\x13\x02\u018D\u018B\x03\x02\x02\x02\u018E\u0191\x03" +
		"\x02\x02\x02\u018F\u018D\x03\x02\x02\x02\u018F\u0190\x03\x02\x02\x02\u0190" +
		"\u0193\x03\x02\x02\x02\u0191\u018F\x03\x02\x02\x02\u0192\u0194\x07\n\x02" +
		"\x02\u0193\u0192\x03\x02\x02\x02\u0193\u0194\x03\x02\x02\x02\u0194\u0195" +
		"\x03\x02\x02\x02\u0195\u0196\x07;\x02\x02\u0196\u01A8\x03\x02\x02\x02" +
		"\u0197\u0199\x07\x04\x02\x02\u0198\u019A\x05(\x15\x02\u0199\u0198\x03" +
		"\x02\x02\x02\u0199\u019A\x03\x02\x02\x02\u019A\u019B\x03\x02\x02\x02\u019B" +
		"\u01A8\x07\x05\x02\x02\u019C\u01A8\x07\x1A\x02\x02\u019D\u01A8\x07\x1B" +
		"\x02\x02\u019E\u01A8\x07\x1C\x02\x02\u019F\u01A8\x05&\x14\x02\u01A0\u01A8" +
		"\x05V,\x02\u01A1\u01A2\x07:\x02\x02\u01A2\u01A3\x05$\x13\x02\u01A3\u01A4" +
		"\x07;\x02\x02\u01A4\u01A8\x03\x02\x02\x02\u01A5\u01A8\x05.\x18\x02\u01A6" +
		"\u01A8\x050\x19\x02\u01A7\u0169\x03\x02\x02\x02\u01A7\u017B\x03\x02\x02" +
		"\x02\u01A7\u0180\x03\x02\x02\x02\u01A7\u0185\x03\x02\x02\x02\u01A7\u0187" +
		"\x03\x02\x02\x02\u01A7\u0197\x03\x02\x02\x02\u01A7\u019C\x03\x02\x02\x02" +
		"\u01A7\u019D\x03\x02\x02\x02\u01A7\u019E\x03\x02\x02\x02\u01A7\u019F\x03" +
		"\x02\x02\x02\u01A7\u01A0\x03\x02\x02\x02\u01A7\u01A1\x03\x02\x02\x02\u01A7" +
		"\u01A5\x03\x02\x02\x02\u01A7\u01A6\x03\x02\x02\x02\u01A8\u01B1\x03\x02" +
		"\x02\x02\u01A9\u01AA\f\x12\x02\x02\u01AA\u01AB\x07\x18\x02\x02\u01AB\u01B0" +
		"\x05$\x13\x12\u01AC\u01AD\f\x11\x02\x02\u01AD\u01AE\x07\x19\x02\x02\u01AE" +
		"\u01B0\x05$\x13\x11\u01AF\u01A9\x03\x02\x02\x02\u01AF\u01AC\x03\x02\x02" +
		"\x02\u01B0\u01B3\x03\x02\x02\x02\u01B1\u01AF\x03\x02\x02\x02\u01B1\u01B2" +
		"\x03\x02\x02\x02\u01B2%\x03\x02\x02\x02\u01B3\u01B1\x03\x02\x02\x02\u01B4" +
		"\u01B5\x07B\x02\x02\u01B5\'\x03\x02\x02\x02\u01B6\u01B7\x05*\x16\x02\u01B7" +
		"\u01B8\x07\x07\x02\x02\u01B8\u01B9\x05$\x13\x02\u01B9\u01C1\x03\x02\x02" +
		"\x02\u01BA\u01BB\x07\n\x02\x02\u01BB\u01BC\x05*\x16\x02\u01BC\u01BD\x07" +
		"\x07\x02\x02\u01BD\u01BE\x05$\x13\x02\u01BE\u01C0\x03\x02\x02\x02\u01BF" +
		"\u01BA\x03\x02\x02\x02\u01C0\u01C3\x03\x02\x02\x02\u01C1\u01BF\x03\x02" +
		"\x02\x02\u01C1\u01C2\x03\x02\x02\x02\u01C2\u01C7\x03\x02\x02\x02\u01C3" +
		"\u01C1\x03\x02\x02\x02\u01C4\u01C8\x07\n\x02\x02\u01C5\u01C6\x07\x0F\x02" +
		"\x02\u01C6\u01C8\x05Z.\x02\u01C7\u01C4\x03\x02\x02\x02\u01C7\u01C5\x03" +
		"\x02\x02\x02\u01C7\u01C8\x03\x02\x02\x02\u01C8\u01CC\x03\x02\x02\x02\u01C9" +
		"\u01CA\x07\x0F\x02\x02\u01CA\u01CC\x05Z.\x02\u01CB\u01B6\x03\x02\x02\x02" +
		"\u01CB\u01C9\x03\x02\x02\x02\u01CC)\x03\x02\x02\x02\u01CD\u01CE\x05X-" +
		"\x02\u01CE+\x03\x02\x02\x02\u01CF\u01D4\x05$\x13\x02\u01D0\u01D1\x07\n" +
		"\x02\x02\u01D1\u01D3\x05$\x13\x02\u01D2\u01D0\x03\x02\x02\x02\u01D3\u01D6" +
		"\x03\x02\x02\x02\u01D4\u01D2\x03\x02\x02\x02\u01D4\u01D5\x03\x02\x02\x02" +
		"\u01D5-\x03\x02\x02\x02\u01D6\u01D4\x03\x02\x02\x02\u01D7\u01D8\x05V," +
		"\x02\u01D8\u01D9\x07\r\x02\x02\u01D9\u01DA\x05,\x17\x02\u01DA\u01DB\x07" +
		"\x0E\x02\x02\u01DB/\x03\x02\x02\x02\u01DC\u01DD\x05V,\x02\u01DD\u01DE" +
		"\x07:\x02\x02\u01DE\u01DF\x05,\x17\x02\u01DF\u01E0\x07;\x02\x02\u01E0";
	private static readonly _serializedATNSegment1: string =
		"\u01E1\b\x19\x01\x02\u01E11\x03\x02\x02\x02\u01E2\u01E3\b\x1A\x01\x02" +
		"\u01E3\u027B\x05<\x1F\x02\u01E4\u01E5\x05N(\x02\u01E5\u01E7\x07:\x02\x02" +
		"\u01E6\u01E8\x05J&\x02\u01E7\u01E6\x03\x02\x02\x02\u01E7\u01E8\x03\x02" +
		"\x02\x02\u01E8\u01EA\x03\x02\x02\x02\u01E9\u01EB\x07\n\x02\x02\u01EA\u01E9" +
		"\x03\x02\x02\x02\u01EA\u01EB\x03\x02\x02\x02\u01EB\u01EC\x03\x02\x02\x02" +
		"\u01EC\u01ED\x07;\x02\x02\u01ED\u027B\x03\x02\x02\x02\u01EE\u01EF\x07" +
		"/\x02\x02\u01EF\u027B\x052\x1A\x1B\u01F0\u01F1\x05V,\x02\u01F1\u01F2\x07" +
		"\x1E\x02\x02\u01F2\u01F3\x079\x02\x02\u01F3\u01F4\x052\x1A\x17\u01F4\u027B" +
		"\x03\x02\x02\x02\u01F5\u01F6\x07)\x02\x02\u01F6\u01F7\x07\x04\x02\x02" +
		"\u01F7\u01FC\x052\x1A\x02\u01F8\u01F9\x07\n\x02\x02\u01F9\u01FB\x052\x1A" +
		"\x02\u01FA\u01F8\x03\x02\x02\x02\u01FB\u01FE\x03\x02\x02\x02\u01FC\u01FA" +
		"\x03\x02\x02\x02\u01FC\u01FD\x03\x02\x02\x02\u01FD\u0200\x03\x02\x02\x02" +
		"\u01FE\u01FC\x03\x02\x02\x02\u01FF\u0201\x07\n\x02\x02\u0200\u01FF\x03" +
		"\x02\x02\x02\u0200\u0201\x03\x02\x02\x02\u0201\u0202\x03\x02\x02\x02\u0202" +
		"\u0203\x07\x05\x02\x02\u0203\u027B\x03\x02\x02\x02\u0204\u0205\x07*\x02" +
		"\x02\u0205\u0206\x07\x04\x02\x02\u0206\u020B\x052\x1A\x02\u0207\u0208" +
		"\x07\n\x02\x02\u0208\u020A\x052\x1A\x02\u0209\u0207\x03\x02\x02\x02\u020A" +
		"\u020D\x03\x02\x02\x02\u020B\u0209\x03\x02\x02\x02\u020B\u020C\x03\x02" +
		"\x02\x02\u020C\u020F\x03\x02\x02\x02\u020D\u020B\x03\x02\x02\x02\u020E" +
		"\u0210\x07\n\x02\x02\u020F\u020E\x03\x02\x02\x02\u020F\u0210\x03\x02\x02" +
		"\x02\u0210\u0211\x03\x02\x02\x02\u0211\u0212\x07\x05\x02\x02\u0212\u027B" +
		"\x03\x02\x02\x02\u0213\u027B\x054\x1B\x02\u0214\u0215\x07\x1F\x02\x02" +
		"\u0215\u0216\x07\x04\x02\x02\u0216\u021B\x052\x1A\x02\u0217\u0218\x07" +
		"\n\x02\x02\u0218\u021A\x052\x1A\x02\u0219\u0217\x03\x02\x02\x02\u021A" +
		"\u021D\x03\x02\x02\x02\u021B\u0219\x03\x02\x02\x02\u021B\u021C\x03\x02" +
		"\x02\x02\u021C\u021F\x03\x02\x02\x02\u021D\u021B\x03\x02\x02\x02\u021E" +
		"\u0220\x07\n\x02\x02\u021F\u021E\x03\x02\x02\x02\u021F\u0220\x03\x02\x02" +
		"\x02\u0220\u0221\x03\x02\x02\x02\u0221\u0222\x07\x05\x02\x02\u0222\u027B" +
		"\x03\x02\x02\x02\u0223\u0224\x07 \x02\x02\u0224\u0225\x07\x04\x02\x02" +
		"\u0225\u022A\x052\x1A\x02\u0226\u0227\x07\n\x02\x02\u0227\u0229\x052\x1A" +
		"\x02\u0228\u0226\x03\x02\x02\x02\u0229\u022C\x03\x02\x02\x02\u022A\u0228" +
		"\x03\x02\x02\x02\u022A\u022B\x03\x02\x02\x02\u022B\u022E\x03\x02\x02\x02" +
		"\u022C\u022A\x03\x02\x02\x02\u022D\u022F\x07\n\x02\x02\u022E\u022D\x03" +
		"\x02\x02\x02\u022E\u022F\x03\x02\x02\x02\u022F\u0230\x03\x02\x02\x02\u0230" +
		"\u0231\x07\x05\x02\x02\u0231\u027B\x03\x02\x02\x02\u0232\u0237\x05V,\x02" +
		"\u0233\u0237\x07(\x02\x02\u0234\u0237\x07\'\x02\x02\u0235\u0237\x07&\x02" +
		"\x02\u0236\u0232\x03\x02\x02\x02\u0236\u0233\x03\x02\x02\x02\u0236\u0234" +
		"\x03\x02\x02\x02\u0236\u0235\x03\x02\x02\x02\u0237\u027B\x03\x02\x02\x02" +
		"\u0238\u0239\x07:\x02\x02\u0239\u023A\x052\x1A\x02\u023A\u023B\x07\n\x02" +
		"\x02\u023B\u0240\x052\x1A\x02\u023C\u023D\x07\n\x02\x02\u023D\u023F\x05" +
		"2\x1A\x02\u023E\u023C\x03\x02\x02\x02\u023F\u0242\x03\x02\x02\x02\u0240" +
		"\u023E\x03\x02\x02\x02\u0240\u0241\x03\x02\x02\x02\u0241\u0244\x03\x02" +
		"\x02\x02\u0242\u0240\x03\x02\x02\x02\u0243\u0245\x07\n\x02\x02\u0244\u0243" +
		"\x03\x02\x02\x02\u0244\u0245\x03\x02\x02\x02\u0245\u0246\x03\x02\x02\x02" +
		"\u0246\u0247\x07;\x02\x02\u0247\u027B\x03\x02\x02\x02\u0248\u0249\x07" +
		":\x02\x02\u0249\u027B\x07;\x02\x02\u024A\u024B\x07\x04\x02\x02\u024B\u0250" +
		"\x05L\'\x02\u024C\u024D\x07\n\x02\x02\u024D\u024F\x05L\'\x02\u024E\u024C" +
		"\x03\x02\x02\x02\u024F\u0252\x03\x02\x02\x02\u0250\u024E\x03\x02\x02\x02" +
		"\u0250\u0251\x03\x02\x02\x02\u0251\u0254\x03\x02\x02\x02\u0252\u0250\x03" +
		"\x02\x02\x02\u0253\u0255\x07\n\x02\x02\u0254\u0253\x03\x02\x02\x02\u0254" +
		"\u0255\x03\x02\x02\x02\u0255\u0256\x03\x02\x02\x02\u0256\u0257\x07\x05" +
		"\x02\x02\u0257\u027B\x03\x02\x02\x02\u0258\u0261\x07\r\x02\x02\u0259\u025E" +
		"\x052\x1A\x02\u025A\u025B\x07\n\x02\x02\u025B\u025D\x052\x1A\x02\u025C" +
		"\u025A\x03\x02\x02\x02\u025D\u0260\x03\x02\x02\x02\u025E\u025C\x03\x02" +
		"\x02\x02\u025E\u025F\x03\x02\x02\x02\u025F\u0262\x03\x02\x02\x02\u0260" +
		"\u025E\x03\x02\x02\x02\u0261\u0259\x03\x02\x02\x02\u0261\u0262\x03\x02" +
		"\x02\x02\u0262\u0264\x03\x02\x02\x02\u0263\u0265\x07\n\x02\x02\u0264\u0263" +
		"\x03\x02\x02\x02\u0264\u0265\x03\x02\x02\x02\u0265\u0266\x03\x02\x02\x02" +
		"\u0266\u027B\x07\x0E\x02\x02\u0267\u0268\x07!\x02\x02\u0268\u0269\x07" +
		":\x02\x02\u0269\u026A\x052\x1A\x02\u026A\u026B\x07;\x02\x02\u026B\u026C" +
		"\x052\x1A\x02\u026C\u026D\x07\"\x02\x02\u026D\u026E\x052\x1A\x06\u026E" +
		"\u027B\x03\x02\x02\x02\u026F\u0270\x05\n\x06\x02\u0270\u0271\x052\x1A" +
		"\x05\u0271\u027B\x03\x02\x02\x02\u0272\u0273\x07:\x02\x02\u0273\u0274" +
		"\x052\x1A\x02\u0274\u0275\x07;\x02\x02\u0275\u027B\x03\x02\x02\x02\u0276" +
		"\u0277\x07\x04\x02\x02\u0277\u0278\x052\x1A\x02\u0278\u0279\x07\x05\x02" +
		"\x02\u0279\u027B\x03\x02\x02\x02\u027A\u01E2\x03\x02\x02\x02\u027A\u01E4" +
		"\x03\x02\x02\x02\u027A\u01EE\x03\x02\x02\x02\u027A\u01F0\x03\x02\x02\x02" +
		"\u027A\u01F5\x03\x02\x02\x02\u027A\u0204\x03\x02\x02\x02\u027A\u0213\x03" +
		"\x02\x02\x02\u027A\u0214\x03\x02\x02\x02\u027A\u0223\x03\x02\x02\x02\u027A" +
		"\u0236\x03\x02\x02\x02\u027A\u0238\x03\x02\x02\x02\u027A\u0248\x03\x02" +
		"\x02\x02\u027A\u024A\x03\x02\x02\x02\u027A\u0258\x03\x02\x02\x02\u027A" +
		"\u0267\x03\x02\x02\x02\u027A\u026F\x03\x02\x02\x02\u027A\u0272\x03\x02" +
		"\x02\x02\u027A\u0276\x03\x02\x02\x02\u027B\u02AD\x03\x02\x02\x02\u027C" +
		"\u027D\f\x1C\x02\x02\u027D\u027E\x07\x1D\x02\x02\u027E\u02AC\x052\x1A" +
		"\x1C\u027F\u0280\f\x1A\x02\x02\u0280\u0281\t\x02\x02\x02\u0281\u02AC\x05" +
		"2\x1A\x1B\u0282\u0283\f\x19\x02\x02\u0283\u0284\t\x03\x02\x02\u0284\u02AC" +
		"\x052\x1A\x1A\u0285\u0286\f\x18\x02\x02\u0286\u0287\t\x04\x02\x02\u0287" +
		"\u02AC\x052\x1A\x19\u0288\u0289\f\x16\x02\x02\u0289\u028A\x079\x02\x02" +
		"\u028A\u028B\x052\x1A\x17\u028B\u028C\b\x1A\x01\x02\u028C\u02AC\x03\x02" +
		"\x02\x02\u028D\u028E\f\x14\x02\x02\u028E\u028F\x07)\x02\x02\u028F\u02AC" +
		"\x052\x1A\x15\u0290\u0291\f\x12\x02\x02\u0291\u0292\x07*\x02\x02\u0292" +
		"\u02AC\x052\x1A\x13\u0293\u0294\f\x11\x02\x02\u0294\u0295\x07+\x02\x02" +
		"\u0295\u02AC\x052\x1A\x12\u0296\u0297\f\x10\x02\x02\u0297\u0298\x07,\x02" +
		"\x02\u0298\u02AC\x052\x1A\x11\u0299\u029A\f\t\x02\x02\u029A\u029B\x07" +
		"\x18\x02\x02\u029B\u02AC\x052\x1A\n\u029C\u029D\f \x02\x02\u029D\u029E" +
		"\x07\x17\x02\x02\u029E\u02A4\x05P)\x02\u029F\u02A1\x07:\x02\x02\u02A0" +
		"\u02A2\x05J&\x02\u02A1\u02A0\x03\x02\x02\x02\u02A1\u02A2\x03\x02\x02\x02" +
		"\u02A2\u02A3\x03\x02\x02\x02\u02A3\u02A5\x07;\x02\x02\u02A4\u029F\x03" +
		"\x02\x02\x02\u02A4\u02A5\x03\x02\x02\x02\u02A5\u02AC\x03\x02\x02\x02\u02A6" +
		"\u02A7\f\x1D\x02\x02\u02A7\u02A8\x07\r\x02\x02\u02A8\u02A9\x052\x1A\x02" +
		"\u02A9\u02AA\x07\x0E\x02\x02\u02AA\u02AC\x03\x02\x02\x02\u02AB\u027C\x03" +
		"\x02\x02\x02\u02AB\u027F\x03\x02\x02\x02\u02AB\u0282\x03\x02\x02\x02\u02AB" +
		"\u0285\x03\x02\x02\x02\u02AB\u0288\x03\x02\x02\x02\u02AB\u028D\x03\x02" +
		"\x02\x02\u02AB\u0290\x03\x02\x02\x02\u02AB\u0293\x03\x02\x02\x02\u02AB" +
		"\u0296\x03\x02\x02\x02\u02AB\u0299\x03\x02\x02\x02\u02AB\u029C\x03\x02" +
		"\x02\x02\u02AB\u02A6\x03\x02\x02\x02\u02AC\u02AF\x03\x02\x02\x02\u02AD" +
		"\u02AB\x03\x02\x02\x02\u02AD\u02AE\x03\x02\x02\x02\u02AE3\x03\x02\x02" +
		"\x02\u02AF\u02AD\x03\x02\x02\x02\u02B0\u02B1\x07-\x02\x02\u02B1\u02B2" +
		"\x052\x1A\x02\u02B2\u02B4\x07\x04\x02\x02\u02B3\u02B5\x07\x0F\x02\x02" +
		"\u02B4\u02B3\x03\x02\x02\x02\u02B4\u02B5\x03\x02\x02\x02\u02B5\u02B6\x03" +
		"\x02\x02\x02\u02B6\u02BB\x056\x1C\x02\u02B7\u02B8\x07\x0F\x02\x02\u02B8" +
		"\u02BA\x056\x1C\x02\u02B9\u02B7\x03\x02\x02\x02\u02BA\u02BD\x03\x02\x02" +
		"\x02\u02BB\u02B9\x03\x02\x02\x02\u02BB\u02BC\x03\x02\x02\x02\u02BC\u02BE" +
		"\x03\x02\x02\x02\u02BD\u02BB\x03\x02\x02\x02\u02BE\u02BF\x07\x05\x02\x02" +
		"\u02BF5\x03\x02\x02\x02\u02C0\u02C3\x058\x1D\x02\u02C1\u02C3\x07#\x02" +
		"\x02\u02C2\u02C0\x03\x02\x02\x02\u02C2\u02C1\x03\x02\x02\x02\u02C3\u02C4" +
		"\x03\x02\x02\x02\u02C4\u02C5\x07\x19\x02\x02\u02C5\u02C6\x052\x1A\x02" +
		"\u02C67\x03\x02\x02\x02\u02C7\u02CE\x05X-\x02\u02C8\u02CB\x07:\x02\x02" +
		"\u02C9\u02CC\x05X-\x02\u02CA\u02CC\x07#\x02\x02\u02CB\u02C9\x03\x02\x02" +
		"\x02\u02CB\u02CA\x03\x02\x02\x02\u02CC\u02CD\x03\x02\x02\x02\u02CD\u02CF" +
		"\x07;\x02\x02\u02CE\u02C8\x03\x02\x02\x02\u02CE\u02CF\x03\x02\x02\x02" +
		"\u02CF9\x03\x02\x02\x02\u02D0\u02D1\x05\b\x05\x02\u02D1\u02D2\x07\x02" +
		"\x02\x03\u02D2\u02DA\x03\x02\x02\x02\u02D3\u02D4\x052\x1A\x02\u02D4\u02D5" +
		"\x07\x02\x02\x03\u02D5\u02DA\x03\x02\x02\x02\u02D6\u02D7\x07E\x02\x02" +
		"\u02D7\u02DA\x07\x02\x02\x03\u02D8\u02DA\x07\x02\x02\x03\u02D9\u02D0\x03" +
		"\x02\x02\x02\u02D9\u02D3\x03\x02\x02\x02\u02D9\u02D6\x03\x02\x02\x02\u02D9" +
		"\u02D8\x03\x02\x02\x02\u02DA;\x03\x02\x02\x02\u02DB\u02DE\x05> \x02\u02DC" +
		"\u02DE\x05@!\x02\u02DD\u02DB\x03\x02\x02\x02\u02DD\u02DC\x03\x02\x02\x02" +
		"\u02DE=\x03\x02\x02\x02\u02DF\u02E0\x05D#\x02\u02E0\u02E1\x07\x19\x02" +
		"\x02\u02E1\u02E2\x052\x1A\x02\u02E2\u02F1\x03\x02\x02\x02\u02E3\u02E4" +
		"\x07:\x02\x02\u02E4\u02E9\x05D#\x02\u02E5\u02E6\x07\n\x02\x02\u02E6\u02E8" +
		"\x05D#\x02\u02E7\u02E5\x03\x02\x02\x02\u02E8\u02EB\x03\x02\x02\x02\u02E9" +
		"\u02E7\x03\x02\x02\x02\u02E9\u02EA\x03\x02\x02\x02\u02EA\u02EC\x03\x02" +
		"\x02\x02\u02EB\u02E9\x03\x02\x02\x02\u02EC\u02ED\x07;\x02\x02\u02ED\u02EE" +
		"\x07\x19\x02\x02\u02EE\u02EF\x052\x1A\x02\u02EF\u02F1\x03\x02\x02\x02" +
		"\u02F0\u02DF\x03\x02\x02\x02\u02F0\u02E3\x03\x02\x02\x02\u02F1?\x03\x02" +
		"\x02\x02\u02F2\u02F3\x07:\x02\x02\u02F3\u02F4\x07:\x02\x02\u02F4\u02F7" +
		"\x05D#\x02\u02F5\u02F6\x07\n\x02\x02\u02F6\u02F8\x05D#\x02\u02F7\u02F5" +
		"\x03\x02\x02\x02\u02F8\u02F9\x03\x02\x02\x02\u02F9\u02F7\x03\x02\x02\x02" +
		"\u02F9\u02FA\x03\x02\x02\x02\u02FA\u02FB\x03\x02\x02\x02\u02FB\u02FC\x07" +
		";\x02\x02\u02FC\u02FD\x07;\x02\x02\u02FD\u02FE\x07\x19\x02\x02\u02FE\u02FF" +
		"\x052\x1A\x02\u02FFA\x03\x02\x02\x02\u0300\u0303\x07#\x02\x02\u0301\u0303" +
		"\x05V,\x02\u0302\u0300\x03\x02\x02\x02\u0302\u0301\x03\x02\x02\x02\u0303" +
		"C\x03\x02\x02\x02\u0304\u0305\x05B\"\x02\u0305E\x03\x02\x02\x02\u0306" +
		"\u0307\x05B\"\x02\u0307\u0308\x07\x07\x02\x02\u0308\u0309\x05$\x13\x02" +
		"\u0309G\x03\x02\x02\x02\u030A\u030D\x070\x02\x02\u030B\u030D\x05V,\x02" +
		"\u030C\u030A\x03\x02\x02\x02\u030C\u030B\x03\x02\x02\x02\u030DI\x03\x02" +
		"\x02\x02\u030E\u0313\x052\x1A\x02\u030F\u0310\x07\n\x02\x02\u0310\u0312" +
		"\x052\x1A\x02\u0311\u030F\x03\x02\x02\x02\u0312\u0315\x03\x02\x02\x02" +
		"\u0313\u0311\x03\x02\x02\x02\u0313\u0314\x03\x02\x02\x02\u0314K\x03\x02" +
		"\x02\x02\u0315\u0313\x03\x02\x02\x02\u0316\u0317\x05X-\x02\u0317\u0318" +
		"\x07\x07\x02\x02\u0318\u0319\x052\x1A\x02\u0319\u031D\x03\x02\x02\x02" +
		"\u031A\u031B\x07$\x02\x02\u031B\u031D\x052\x1A\x02\u031C\u0316\x03\x02" +
		"\x02\x02\u031C\u031A\x03\x02\x02\x02\u031DM\x03\x02\x02\x02\u031E\u0321" +
		"\t\x05\x02\x02\u031F\u0321\x05V,\x02\u0320\u031E\x03\x02\x02\x02\u0320" +
		"\u031F\x03\x02\x02\x02\u0321O\x03\x02\x02\x02\u0322\u0325\t\x06\x02\x02" +
		"\u0323\u0325\x05V,\x02\u0324\u0322\x03\x02\x02\x02\u0324\u0323\x03\x02" +
		"\x02\x02\u0325Q\x03\x02\x02\x02\u0326\u0327\t\x07\x02\x02\u0327S\x03\x02" +
		"\x02\x02\u0328\u0329\t\b\x02\x02\u0329U\x03\x02\x02\x02\u032A\u032F\x05" +
		"Z.\x02\u032B\u032C\x07%\x02\x02\u032C\u032E\x05Z.\x02\u032D\u032B\x03" +
		"\x02\x02\x02\u032E\u0331\x03\x02\x02\x02\u032F\u032D\x03\x02\x02\x02\u032F" +
		"\u0330\x03\x02\x02\x02\u0330W\x03\x02\x02\x02\u0331\u032F\x03\x02\x02" +
		"\x02\u0332\u0337\x05Z.\x02\u0333\u0334\x05V,\x02\u0334\u0335\b-\x01\x02" +
		"\u0335\u0337\x03\x02\x02\x02\u0336\u0332\x03\x02\x02\x02\u0336\u0333\x03" +
		"\x02\x02\x02\u0337Y\x03\x02\x02\x02\u0338\u033F\x07B\x02\x02\u0339\u033F" +
		"\x07C\x02\x02\u033A\u033F\x05\\/\x02\u033B\u033C\x05^0\x02\u033C\u033D" +
		"\b.\x01\x02\u033D\u033F\x03\x02\x02\x02\u033E\u0338\x03\x02\x02\x02\u033E" +
		"\u0339\x03\x02\x02\x02\u033E\u033A\x03\x02\x02\x02\u033E\u033B\x03\x02" +
		"\x02\x02\u033F[\x03\x02\x02\x02\u0340\u0341\t\t\x02\x02\u0341]\x03\x02" +
		"\x02\x02\u0342\u0343\t\n\x02\x02\u0343_\x03\x02\x02\x02_afmv~\x97\xA1" +
		"\xA5\xAC\xAF\xB9\xBD\xBF\xC2\xC6\xCA\xCD\xCF\xDD\xE6\xEA\xED\xF4\xFC\u0108" +
		"\u0110\u0116\u011A\u011C\u0127\u0129\u0138\u013C\u0143\u0152\u0156\u015D" +
		"\u015F\u0170\u0173\u0176\u018F\u0193\u0199\u01A7\u01AF\u01B1\u01C1\u01C7" +
		"\u01CB\u01D4\u01E7\u01EA\u01FC\u0200\u020B\u020F\u021B\u021F\u022A\u022E" +
		"\u0236\u0240\u0244\u0250\u0254\u025E\u0261\u0264\u027A\u02A1\u02A4\u02AB" +
		"\u02AD\u02B4\u02BB\u02C2\u02CB\u02CE\u02D9\u02DD\u02E9\u02F0\u02F9\u0302" +
		"\u030C\u0313\u031C\u0320\u0324\u032F\u0336\u033E";
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


