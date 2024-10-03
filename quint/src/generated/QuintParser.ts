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
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly STRING = 40;
	public static readonly BOOL = 41;
	public static readonly INT = 42;
	public static readonly AND = 43;
	public static readonly OR = 44;
	public static readonly IFF = 45;
	public static readonly IMPLIES = 46;
	public static readonly MAP = 47;
	public static readonly MATCH = 48;
	public static readonly PLUS = 49;
	public static readonly MINUS = 50;
	public static readonly MUL = 51;
	public static readonly DIV = 52;
	public static readonly MOD = 53;
	public static readonly GT = 54;
	public static readonly LT = 55;
	public static readonly GE = 56;
	public static readonly LE = 57;
	public static readonly NE = 58;
	public static readonly EQ = 59;
	public static readonly ASGN = 60;
	public static readonly LPAREN = 61;
	public static readonly RPAREN = 62;
	public static readonly SET = 63;
	public static readonly LIST = 64;
	public static readonly LOW_ID = 65;
	public static readonly CAP_ID = 66;
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
	public static readonly RULE_expr = 21;
	public static readonly RULE_matchSumExpr = 22;
	public static readonly RULE_matchSumCase = 23;
	public static readonly RULE_matchSumVariant = 24;
	public static readonly RULE_declarationOrExpr = 25;
	public static readonly RULE_lambda = 26;
	public static readonly RULE_lambdaUnsugared = 27;
	public static readonly RULE_lambdaTupleSugar = 28;
	public static readonly RULE_identOrHole = 29;
	public static readonly RULE_parameter = 30;
	public static readonly RULE_annotatedParameter = 31;
	public static readonly RULE_identOrStar = 32;
	public static readonly RULE_argList = 33;
	public static readonly RULE_recElem = 34;
	public static readonly RULE_normalCallName = 35;
	public static readonly RULE_nameAfterDot = 36;
	public static readonly RULE_operator = 37;
	public static readonly RULE_literal = 38;
	public static readonly RULE_qualId = 39;
	public static readonly RULE_simpleId = 40;
	public static readonly RULE_identifier = 41;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "documentedDeclaration", "declaration", "operDef", 
		"typeDef", "typeDefHead", "sumTypeDefinition", "typeSumVariant", "qualifier", 
		"importMod", "exportMod", "instanceMod", "moduleName", "name", "qualifiedName", 
		"fromSource", "type", "typeVar", "row", "rowLabel", "expr", "matchSumExpr", 
		"matchSumCase", "matchSumVariant", "declarationOrExpr", "lambda", "lambdaUnsugared", 
		"lambdaTupleSugar", "identOrHole", "parameter", "annotatedParameter", 
		"identOrStar", "argList", "recElem", "normalCallName", "nameAfterDot", 
		"operator", "literal", "qualId", "simpleId", "identifier",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"','", "';'", "'type'", "'['", "']'", "'|'", "'val'", "'def'", "'pure'", 
		"'action'", "'run'", "'temporal'", "'nondet'", "'import'", "'.'", "'from'", 
		"'as'", "'export'", "'->'", "'=>'", "'int'", "'str'", "'bool'", "'^'", 
		"'''", "'all'", "'any'", "'if'", "'else'", "'_'", "'...'", "'::'", undefined, 
		undefined, undefined, "'and'", "'or'", "'iff'", "'implies'", "'Map'", 
		"'match'", "'+'", "'-'", "'*'", "'/'", "'%'", "'>'", "'<'", "'>='", "'<='", 
		"'!='", "'=='", "'='", "'('", "')'", "'Set'", "'List'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "STRING", "BOOL", 
		"INT", "AND", "OR", "IFF", "IMPLIES", "MAP", "MATCH", "PLUS", "MINUS", 
		"MUL", "DIV", "MOD", "GT", "LT", "GE", "LE", "NE", "EQ", "ASGN", "LPAREN", 
		"RPAREN", "SET", "LIST", "LOW_ID", "CAP_ID", "DOCCOMMENT", "LINE_COMMENT", 
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
			this.state = 85;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 84;
				this.module();
				}
				}
				this.state = 87;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0 || _la === QuintParser.DOCCOMMENT);
			this.state = 89;
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
			this.state = 94;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 91;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 96;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 97;
			this.match(QuintParser.T__0);
			this.state = 98;
			this.qualId();
			this.state = 99;
			this.match(QuintParser.T__1);
			this.state = 103;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__9) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19) | (1 << QuintParser.T__20) | (1 << QuintParser.T__24))) !== 0) || _la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 100;
				this.documentedDeclaration();
				}
				}
				this.state = 105;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 106;
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
			this.state = 111;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 108;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 113;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 114;
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
			this.state = 136;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 116;
				this.match(QuintParser.T__3);
				this.state = 117;
				this.qualId();
				this.state = 118;
				this.match(QuintParser.T__4);
				this.state = 119;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 121;
				this.match(QuintParser.T__5);
				this.state = 122;
				this.qualId();
				this.state = 123;
				this.match(QuintParser.T__4);
				this.state = 124;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 126;
				this.match(QuintParser.T__6);
				{
				this.state = 127;
				(_localctx as AssumeContext)._assumeName = this.identOrHole();
				}
				this.state = 128;
				this.match(QuintParser.ASGN);
				this.state = 129;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 131;
				this.instanceMod();
				}
				break;

			case 5:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 132;
				this.operDef();
				}
				break;

			case 6:
				_localctx = new TypeDefsContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 133;
				this.typeDef();
				}
				break;

			case 7:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 134;
				this.importMod();
				}
				break;

			case 8:
				_localctx = new ExportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 135;
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
			this.state = 192;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 16, this._ctx) ) {
			case 1:
				_localctx = new AnnotatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 138;
				this.qualifier();
				this.state = 139;
				this.normalCallName();
				this.state = 140;
				this.match(QuintParser.LPAREN);
				{
				this.state = 141;
				(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
				(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
				this.state = 146;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 142;
						this.match(QuintParser.T__7);
						this.state = 143;
						(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
						(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
						}
						}
					}
					this.state = 148;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 5, this._ctx);
				}
				}
				this.state = 150;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 149;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 152;
				this.match(QuintParser.RPAREN);
				this.state = 153;
				this.match(QuintParser.T__4);
				this.state = 154;
				this.type(0);
				this.state = 157;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 155;
					this.match(QuintParser.ASGN);
					this.state = 156;
					this.expr(0);
					}
				}

				this.state = 160;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 159;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 2:
				_localctx = new DeprecatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 162;
				this.qualifier();
				this.state = 163;
				this.normalCallName();
				this.state = 179;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 12, this._ctx) ) {
				case 1:
					{
					this.state = 164;
					this.match(QuintParser.LPAREN);
					this.state = 176;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & ((1 << (QuintParser.T__36 - 37)) | (1 << (QuintParser.LOW_ID - 37)) | (1 << (QuintParser.CAP_ID - 37)))) !== 0)) {
						{
						this.state = 165;
						(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
						(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
						this.state = 170;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
						while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
							if (_alt === 1) {
								{
								{
								this.state = 166;
								this.match(QuintParser.T__7);
								this.state = 167;
								(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
								(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
								}
								}
							}
							this.state = 172;
							this._errHandler.sync(this);
							_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
						}
						this.state = 174;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la === QuintParser.T__7) {
							{
							this.state = 173;
							this.match(QuintParser.T__7);
							}
						}

						}
					}

					this.state = 178;
					this.match(QuintParser.RPAREN);
					}
					break;
				}
				this.state = 183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 181;
					this.match(QuintParser.T__4);
					this.state = 182;
					(_localctx as DeprecatedOperDefContext)._annotatedRetType = this.type(0);
					}
				}

				this.state = 187;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 185;
					this.match(QuintParser.ASGN);
					this.state = 186;
					this.expr(0);
					}
				}

				this.state = 190;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 189;
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
			this.state = 206;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				_localctx = new TypeAbstractDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 194;
				this.match(QuintParser.T__9);
				this.state = 195;
				this.qualId();
				}
				break;

			case 2:
				_localctx = new TypeAliasDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 196;
				this.match(QuintParser.T__9);
				this.state = 197;
				this.typeDefHead();
				this.state = 198;
				this.match(QuintParser.ASGN);
				this.state = 199;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new TypeSumDefContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 201;
				this.match(QuintParser.T__9);
				this.state = 202;
				this.typeDefHead();
				this.state = 203;
				this.match(QuintParser.ASGN);
				this.state = 204;
				this.sumTypeDefinition();
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
			this.state = 208;
			_localctx._typeName = this.qualId();
			this.state = 219;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__10) {
				{
				this.state = 209;
				this.match(QuintParser.T__10);
				this.state = 210;
				_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
				_localctx._typeVars.push(_localctx._LOW_ID);
				this.state = 215;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 211;
					this.match(QuintParser.T__7);
					this.state = 212;
					_localctx._LOW_ID = this.match(QuintParser.LOW_ID);
					_localctx._typeVars.push(_localctx._LOW_ID);
					}
					}
					this.state = 217;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 218;
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
			this.state = 222;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 221;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 224;
			this.typeSumVariant();
			this.state = 229;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 225;
				this.match(QuintParser.T__12);
				this.state = 226;
				this.typeSumVariant();
				}
				}
				this.state = 231;
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
			this.state = 232;
			_localctx._sumLabel = this.simpleId("variant label");
			this.state = 237;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 233;
				this.match(QuintParser.LPAREN);
				this.state = 234;
				this.type(0);
				this.state = 235;
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
			this.state = 249;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 239;
				this.match(QuintParser.T__13);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 240;
				this.match(QuintParser.T__14);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 241;
				this.match(QuintParser.T__15);
				this.state = 242;
				this.match(QuintParser.T__13);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 243;
				this.match(QuintParser.T__15);
				this.state = 244;
				this.match(QuintParser.T__14);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 245;
				this.match(QuintParser.T__16);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 246;
				this.match(QuintParser.T__17);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 247;
				this.match(QuintParser.T__18);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 248;
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
			this.state = 269;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 251;
				this.match(QuintParser.T__20);
				this.state = 252;
				this.name();
				this.state = 253;
				this.match(QuintParser.T__21);
				this.state = 254;
				this.identOrStar();
				this.state = 257;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 255;
					this.match(QuintParser.T__22);
					this.state = 256;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 259;
				this.match(QuintParser.T__20);
				this.state = 260;
				this.name();
				this.state = 263;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__23) {
					{
					this.state = 261;
					this.match(QuintParser.T__23);
					this.state = 262;
					this.name();
					}
				}

				this.state = 267;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 265;
					this.match(QuintParser.T__22);
					this.state = 266;
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
			this.state = 282;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 271;
				this.match(QuintParser.T__24);
				this.state = 272;
				this.name();
				this.state = 273;
				this.match(QuintParser.T__21);
				this.state = 274;
				this.identOrStar();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 276;
				this.match(QuintParser.T__24);
				this.state = 277;
				this.name();
				this.state = 280;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__23) {
					{
					this.state = 278;
					this.match(QuintParser.T__23);
					this.state = 279;
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
			this.state = 336;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 36, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 284;
				this.match(QuintParser.T__20);
				this.state = 285;
				this.moduleName();
				this.state = 286;
				this.match(QuintParser.LPAREN);
				{
				this.state = 287;
				this.name();
				this.state = 288;
				this.match(QuintParser.ASGN);
				this.state = 289;
				this.expr(0);
				this.state = 297;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 290;
						this.match(QuintParser.T__7);
						this.state = 291;
						this.name();
						this.state = 292;
						this.match(QuintParser.ASGN);
						this.state = 293;
						this.expr(0);
						}
						}
					}
					this.state = 299;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 30, this._ctx);
				}
				}
				this.state = 301;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 300;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 303;
				this.match(QuintParser.RPAREN);
				this.state = 304;
				this.match(QuintParser.T__21);
				this.state = 305;
				this.match(QuintParser.MUL);
				this.state = 308;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 306;
					this.match(QuintParser.T__22);
					this.state = 307;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 310;
				this.match(QuintParser.T__20);
				this.state = 311;
				this.moduleName();
				this.state = 312;
				this.match(QuintParser.LPAREN);
				{
				this.state = 313;
				this.name();
				this.state = 314;
				this.match(QuintParser.ASGN);
				this.state = 315;
				this.expr(0);
				this.state = 323;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 316;
						this.match(QuintParser.T__7);
						this.state = 317;
						this.name();
						this.state = 318;
						this.match(QuintParser.ASGN);
						this.state = 319;
						this.expr(0);
						}
						}
					}
					this.state = 325;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 33, this._ctx);
				}
				}
				this.state = 327;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 326;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 329;
				this.match(QuintParser.RPAREN);
				this.state = 330;
				this.match(QuintParser.T__23);
				this.state = 331;
				this.qualifiedName();
				this.state = 334;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 332;
					this.match(QuintParser.T__22);
					this.state = 333;
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
			this.state = 338;
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
			this.state = 340;
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
			this.state = 342;
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
			this.state = 344;
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
			this.state = 418;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 347;
				this.match(QuintParser.LPAREN);
				this.state = 356;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__27) | (1 << QuintParser.T__28) | (1 << QuintParser.T__29))) !== 0) || ((((_la - 61)) & ~0x1F) === 0 && ((1 << (_la - 61)) & ((1 << (QuintParser.LPAREN - 61)) | (1 << (QuintParser.SET - 61)) | (1 << (QuintParser.LIST - 61)) | (1 << (QuintParser.LOW_ID - 61)) | (1 << (QuintParser.CAP_ID - 61)))) !== 0)) {
					{
					this.state = 348;
					this.type(0);
					this.state = 353;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 37, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 349;
							this.match(QuintParser.T__7);
							this.state = 350;
							this.type(0);
							}
							}
						}
						this.state = 355;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 37, this._ctx);
					}
					}
				}

				this.state = 359;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 358;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 361;
				this.match(QuintParser.RPAREN);
				this.state = 362;
				this.match(QuintParser.T__26);
				this.state = 363;
				this.type(13);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 364;
				this.match(QuintParser.SET);
				this.state = 365;
				this.match(QuintParser.T__10);
				this.state = 366;
				this.type(0);
				this.state = 367;
				this.match(QuintParser.T__11);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 369;
				this.match(QuintParser.LIST);
				this.state = 370;
				this.match(QuintParser.T__10);
				this.state = 371;
				this.type(0);
				this.state = 372;
				this.match(QuintParser.T__11);
				}
				break;

			case 4:
				{
				_localctx = new TypeUnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 374;
				this.match(QuintParser.LPAREN);
				this.state = 375;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 376;
				this.match(QuintParser.LPAREN);
				this.state = 377;
				this.type(0);
				this.state = 378;
				this.match(QuintParser.T__7);
				this.state = 379;
				this.type(0);
				this.state = 384;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 380;
						this.match(QuintParser.T__7);
						this.state = 381;
						this.type(0);
						}
						}
					}
					this.state = 386;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 40, this._ctx);
				}
				this.state = 388;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 387;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 390;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 6:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 392;
				this.match(QuintParser.T__1);
				this.state = 394;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__12 || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 393;
					this.row();
					}
				}

				this.state = 396;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 397;
				this.match(QuintParser.T__27);
				}
				break;

			case 8:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 398;
				this.match(QuintParser.T__28);
				}
				break;

			case 9:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 399;
				this.match(QuintParser.T__29);
				}
				break;

			case 10:
				{
				_localctx = new TypeVarCaseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 400;
				this.typeVar();
				}
				break;

			case 11:
				{
				_localctx = new TypeConstContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 401;
				this.qualId();
				}
				break;

			case 12:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 402;
				this.match(QuintParser.LPAREN);
				this.state = 403;
				this.type(0);
				this.state = 404;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new TypeAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 406;
				(_localctx as TypeAppContext)._typeCtor = this.qualId();
				{
				this.state = 407;
				this.match(QuintParser.T__10);
				this.state = 408;
				(_localctx as TypeAppContext)._type = this.type(0);
				(_localctx as TypeAppContext)._typeArg.push((_localctx as TypeAppContext)._type);
				this.state = 413;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 409;
					this.match(QuintParser.T__7);
					this.state = 410;
					(_localctx as TypeAppContext)._type = this.type(0);
					(_localctx as TypeAppContext)._typeArg.push((_localctx as TypeAppContext)._type);
					}
					}
					this.state = 415;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 416;
				this.match(QuintParser.T__11);
				}
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 428;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 46, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 426;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 420;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 421;
						this.match(QuintParser.T__25);
						this.state = 422;
						this.type(15);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 423;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 424;
						this.match(QuintParser.T__26);
						this.state = 425;
						this.type(14);
						}
						break;
					}
					}
				}
				this.state = 430;
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
			this.state = 431;
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
			this.state = 454;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				{
				this.state = 433;
				this.rowLabel();
				this.state = 434;
				this.match(QuintParser.T__4);
				this.state = 435;
				this.type(0);
				}
				this.state = 444;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 47, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 437;
						this.match(QuintParser.T__7);
						this.state = 438;
						this.rowLabel();
						this.state = 439;
						this.match(QuintParser.T__4);
						this.state = 440;
						this.type(0);
						}
						}
					}
					this.state = 446;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 47, this._ctx);
				}
				this.state = 450;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.T__7:
					{
					this.state = 447;
					this.match(QuintParser.T__7);
					}
					break;
				case QuintParser.T__12:
					{
					this.state = 448;
					this.match(QuintParser.T__12);
					{
					this.state = 449;
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
				this.state = 452;
				this.match(QuintParser.T__12);
				{
				this.state = 453;
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
			this.state = 456;
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
		let _startState: number = 42;
		this.enterRecursionRule(_localctx, 42, QuintParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 610;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 68, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 459;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 460;
				this.normalCallName();
				this.state = 461;
				this.match(QuintParser.LPAREN);
				this.state = 463;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 462;
					this.argList();
					}
				}

				this.state = 466;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 465;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 468;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 470;
				this.match(QuintParser.MINUS);
				this.state = 471;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 472;
				this.qualId();
				this.state = 473;
				this.match(QuintParser.T__31);
				this.state = 474;
				this.match(QuintParser.ASGN);
				this.state = 475;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 477;
				this.match(QuintParser.AND);
				this.state = 478;
				this.match(QuintParser.T__1);
				this.state = 479;
				this.expr(0);
				this.state = 484;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 480;
						this.match(QuintParser.T__7);
						this.state = 481;
						this.expr(0);
						}
						}
					}
					this.state = 486;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
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
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 492;
				this.match(QuintParser.OR);
				this.state = 493;
				this.match(QuintParser.T__1);
				this.state = 494;
				this.expr(0);
				this.state = 499;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 54, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 495;
						this.match(QuintParser.T__7);
						this.state = 496;
						this.expr(0);
						}
						}
					}
					this.state = 501;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 54, this._ctx);
				}
				this.state = 503;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 502;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 505;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new MatchContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 507;
				this.matchSumExpr();
				}
				break;

			case 8:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 508;
				this.match(QuintParser.T__32);
				this.state = 509;
				this.match(QuintParser.T__1);
				this.state = 510;
				this.expr(0);
				this.state = 515;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 56, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 511;
						this.match(QuintParser.T__7);
						this.state = 512;
						this.expr(0);
						}
						}
					}
					this.state = 517;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 56, this._ctx);
				}
				this.state = 519;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 518;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 521;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 523;
				this.match(QuintParser.T__33);
				this.state = 524;
				this.match(QuintParser.T__1);
				this.state = 525;
				this.expr(0);
				this.state = 530;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 526;
						this.match(QuintParser.T__7);
						this.state = 527;
						this.expr(0);
						}
						}
					}
					this.state = 532;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
				}
				this.state = 534;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 533;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 536;
				this.match(QuintParser.T__2);
				}
				break;

			case 10:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 542;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 538;
					this.qualId();
					}
					break;
				case QuintParser.INT:
					{
					this.state = 539;
					this.match(QuintParser.INT);
					}
					break;
				case QuintParser.BOOL:
					{
					this.state = 540;
					this.match(QuintParser.BOOL);
					}
					break;
				case QuintParser.STRING:
					{
					this.state = 541;
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
				this.state = 544;
				this.match(QuintParser.LPAREN);
				this.state = 545;
				this.expr(0);
				this.state = 546;
				this.match(QuintParser.T__7);
				this.state = 547;
				this.expr(0);
				this.state = 552;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 61, this._ctx);
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
					_alt = this.interpreter.adaptivePredict(this._input, 61, this._ctx);
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
				this.match(QuintParser.RPAREN);
				}
				break;

			case 12:
				{
				_localctx = new UnitContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 560;
				this.match(QuintParser.LPAREN);
				this.state = 561;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 13:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 562;
				this.match(QuintParser.T__1);
				this.state = 563;
				this.recElem();
				this.state = 568;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 63, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 564;
						this.match(QuintParser.T__7);
						this.state = 565;
						this.recElem();
						}
						}
					}
					this.state = 570;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 63, this._ctx);
				}
				this.state = 572;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 571;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 574;
				this.match(QuintParser.T__2);
				}
				break;

			case 14:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 576;
				this.match(QuintParser.T__10);
				this.state = 585;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 577;
					this.expr(0);
					this.state = 582;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 65, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 578;
							this.match(QuintParser.T__7);
							this.state = 579;
							this.expr(0);
							}
							}
						}
						this.state = 584;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 65, this._ctx);
					}
					}
				}

				this.state = 588;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 587;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 590;
				this.match(QuintParser.T__11);
				}
				break;

			case 15:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 591;
				this.match(QuintParser.T__34);
				this.state = 592;
				this.match(QuintParser.LPAREN);
				this.state = 593;
				this.expr(0);
				this.state = 594;
				this.match(QuintParser.RPAREN);
				this.state = 595;
				this.expr(0);
				this.state = 596;
				this.match(QuintParser.T__35);
				this.state = 597;
				this.expr(4);
				}
				break;

			case 16:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 599;
				this.operDef();
				this.state = 600;
				this.expr(3);
				}
				break;

			case 17:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 602;
				this.match(QuintParser.LPAREN);
				this.state = 603;
				this.expr(0);
				this.state = 604;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 18:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 606;
				this.match(QuintParser.T__1);
				this.state = 607;
				this.expr(0);
				this.state = 608;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 661;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 72, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 659;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 71, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 612;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 613;
						(_localctx as PowContext)._op = this.match(QuintParser.T__30);
						this.state = 614;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 615;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 616;
						(_localctx as MultDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 51)) & ~0x1F) === 0 && ((1 << (_la - 51)) & ((1 << (QuintParser.MUL - 51)) | (1 << (QuintParser.DIV - 51)) | (1 << (QuintParser.MOD - 51)))) !== 0))) {
							(_localctx as MultDivContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 617;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 618;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 619;
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
						this.state = 620;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 621;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 622;
						(_localctx as RelationsContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & ((1 << (QuintParser.GT - 54)) | (1 << (QuintParser.LT - 54)) | (1 << (QuintParser.GE - 54)) | (1 << (QuintParser.LE - 54)) | (1 << (QuintParser.NE - 54)) | (1 << (QuintParser.EQ - 54)))) !== 0))) {
							(_localctx as RelationsContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 623;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 624;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 625;
						this.match(QuintParser.ASGN);
						this.state = 626;
						this.expr(21);

						                            const m = "[QNT006] unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 629;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 630;
						this.match(QuintParser.AND);
						this.state = 631;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 632;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 633;
						this.match(QuintParser.OR);
						this.state = 634;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 635;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 636;
						this.match(QuintParser.IFF);
						this.state = 637;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 638;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 639;
						this.match(QuintParser.IMPLIES);
						this.state = 640;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 641;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 642;
						this.match(QuintParser.T__25);
						this.state = 643;
						this.expr(8);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 644;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 645;
						this.match(QuintParser.T__21);
						this.state = 646;
						this.nameAfterDot();
						this.state = 652;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 70, this._ctx) ) {
						case 1:
							{
							this.state = 647;
							this.match(QuintParser.LPAREN);
							this.state = 649;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
								{
								this.state = 648;
								this.argList();
								}
							}

							this.state = 651;
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
						this.state = 654;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 655;
						this.match(QuintParser.T__10);
						this.state = 656;
						this.expr(0);
						this.state = 657;
						this.match(QuintParser.T__11);
						}
						break;
					}
					}
				}
				this.state = 663;
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
	public matchSumExpr(): MatchSumExprContext {
		let _localctx: MatchSumExprContext = new MatchSumExprContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, QuintParser.RULE_matchSumExpr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 664;
			this.match(QuintParser.MATCH);
			this.state = 665;
			this.expr(0);
			this.state = 666;
			this.match(QuintParser.T__1);
			this.state = 668;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 667;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 670;
			_localctx._matchSumCase = this.matchSumCase();
			_localctx._matchCase.push(_localctx._matchSumCase);
			this.state = 675;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 671;
				this.match(QuintParser.T__12);
				this.state = 672;
				_localctx._matchSumCase = this.matchSumCase();
				_localctx._matchCase.push(_localctx._matchSumCase);
				}
				}
				this.state = 677;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 678;
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
		this.enterRule(_localctx, 46, QuintParser.RULE_matchSumCase);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 682;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				{
				this.state = 680;
				_localctx._variantMatch = this.matchSumVariant();
				}
				break;
			case QuintParser.T__36:
				{
				this.state = 681;
				_localctx._wildCardMatch = this.match(QuintParser.T__36);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 684;
			this.match(QuintParser.T__26);
			this.state = 685;
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
		this.enterRule(_localctx, 48, QuintParser.RULE_matchSumVariant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 687;
			_localctx._variantLabel = this.simpleId("variant label");
			}
			this.state = 694;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 688;
				this.match(QuintParser.LPAREN);
				this.state = 691;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 689;
					_localctx._variantParam = this.simpleId("match case parameter");
					}
					break;
				case QuintParser.T__36:
					{
					this.state = 690;
					this.match(QuintParser.T__36);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 693;
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
		this.enterRule(_localctx, 50, QuintParser.RULE_declarationOrExpr);
		try {
			this.state = 705;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 78, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 696;
				this.declaration();
				this.state = 697;
				this.match(QuintParser.EOF);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 699;
				this.expr(0);
				this.state = 700;
				this.match(QuintParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 702;
				this.match(QuintParser.DOCCOMMENT);
				this.state = 703;
				this.match(QuintParser.EOF);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 704;
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
		this.enterRule(_localctx, 52, QuintParser.RULE_lambda);
		try {
			this.state = 709;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 79, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 707;
				this.lambdaUnsugared();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 708;
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
		this.enterRule(_localctx, 54, QuintParser.RULE_lambdaUnsugared);
		let _la: number;
		try {
			this.state = 728;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__36:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 711;
				this.parameter();
				this.state = 712;
				this.match(QuintParser.T__26);
				this.state = 713;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 715;
				this.match(QuintParser.LPAREN);
				this.state = 716;
				this.parameter();
				this.state = 721;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 717;
					this.match(QuintParser.T__7);
					this.state = 718;
					this.parameter();
					}
					}
					this.state = 723;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 724;
				this.match(QuintParser.RPAREN);
				this.state = 725;
				this.match(QuintParser.T__26);
				this.state = 726;
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
		this.enterRule(_localctx, 56, QuintParser.RULE_lambdaTupleSugar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 730;
			this.match(QuintParser.LPAREN);
			this.state = 731;
			this.match(QuintParser.LPAREN);
			this.state = 732;
			this.parameter();
			this.state = 735;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 733;
				this.match(QuintParser.T__7);
				this.state = 734;
				this.parameter();
				}
				}
				this.state = 737;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__7);
			this.state = 739;
			this.match(QuintParser.RPAREN);
			this.state = 740;
			this.match(QuintParser.RPAREN);
			this.state = 741;
			this.match(QuintParser.T__26);
			this.state = 742;
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
		this.enterRule(_localctx, 58, QuintParser.RULE_identOrHole);
		try {
			this.state = 746;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__36:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 744;
				this.match(QuintParser.T__36);
				}
				break;
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 745;
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
		this.enterRule(_localctx, 60, QuintParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 748;
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
		this.enterRule(_localctx, 62, QuintParser.RULE_annotatedParameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 750;
			_localctx._paramName = this.identOrHole();
			this.state = 751;
			this.match(QuintParser.T__4);
			this.state = 752;
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
		this.enterRule(_localctx, 64, QuintParser.RULE_identOrStar);
		try {
			this.state = 756;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.MUL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 754;
				this.match(QuintParser.MUL);
				}
				break;
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 755;
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
		this.enterRule(_localctx, 66, QuintParser.RULE_argList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 758;
			this.expr(0);
			this.state = 763;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 85, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 759;
					this.match(QuintParser.T__7);
					this.state = 760;
					this.expr(0);
					}
					}
				}
				this.state = 765;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 85, this._ctx);
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
		this.enterRule(_localctx, 68, QuintParser.RULE_recElem);
		try {
			this.state = 772;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 766;
				this.simpleId("record");
				this.state = 767;
				this.match(QuintParser.T__4);
				this.state = 768;
				this.expr(0);
				}
				break;
			case QuintParser.T__37:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 770;
				this.match(QuintParser.T__37);
				this.state = 771;
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
		this.enterRule(_localctx, 70, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 776;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 774;
				this.qualId();
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
			case QuintParser.MAP:
			case QuintParser.SET:
			case QuintParser.LIST:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 775;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (QuintParser.AND - 43)) | (1 << (QuintParser.OR - 43)) | (1 << (QuintParser.IFF - 43)) | (1 << (QuintParser.IMPLIES - 43)) | (1 << (QuintParser.MAP - 43)) | (1 << (QuintParser.SET - 43)) | (1 << (QuintParser.LIST - 43)))) !== 0))) {
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
		this.enterRule(_localctx, 72, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 780;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 778;
				this.qualId();
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 779;
				_localctx._op = this._input.LT(1);
				_la = this._input.LA(1);
				if (!(((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & ((1 << (QuintParser.AND - 43)) | (1 << (QuintParser.OR - 43)) | (1 << (QuintParser.IFF - 43)) | (1 << (QuintParser.IMPLIES - 43)))) !== 0))) {
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
		this.enterRule(_localctx, 74, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 782;
			_la = this._input.LA(1);
			if (!(((((_la - 31)) & ~0x1F) === 0 && ((1 << (_la - 31)) & ((1 << (QuintParser.T__30 - 31)) | (1 << (QuintParser.AND - 31)) | (1 << (QuintParser.OR - 31)) | (1 << (QuintParser.IFF - 31)) | (1 << (QuintParser.IMPLIES - 31)) | (1 << (QuintParser.PLUS - 31)) | (1 << (QuintParser.MINUS - 31)) | (1 << (QuintParser.MUL - 31)) | (1 << (QuintParser.DIV - 31)) | (1 << (QuintParser.MOD - 31)) | (1 << (QuintParser.GT - 31)) | (1 << (QuintParser.LT - 31)) | (1 << (QuintParser.GE - 31)) | (1 << (QuintParser.LE - 31)) | (1 << (QuintParser.NE - 31)) | (1 << (QuintParser.EQ - 31)))) !== 0))) {
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
		this.enterRule(_localctx, 76, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 784;
			_la = this._input.LA(1);
			if (!(((((_la - 40)) & ~0x1F) === 0 && ((1 << (_la - 40)) & ((1 << (QuintParser.STRING - 40)) | (1 << (QuintParser.BOOL - 40)) | (1 << (QuintParser.INT - 40)))) !== 0))) {
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
		this.enterRule(_localctx, 78, QuintParser.RULE_qualId);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 786;
			this.identifier();
			this.state = 791;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 89, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 787;
					this.match(QuintParser.T__38);
					this.state = 788;
					this.identifier();
					}
					}
				}
				this.state = 793;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 89, this._ctx);
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
		this.enterRule(_localctx, 80, QuintParser.RULE_simpleId);
		try {
			this.state = 798;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 90, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 794;
				this.identifier();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 795;
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
		this.enterRule(_localctx, 82, QuintParser.RULE_identifier);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 800;
			_la = this._input.LA(1);
			if (!(_la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID)) {
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

		case 21:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private type_sempred(_localctx: TypeContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 15);

		case 1:
			return this.precpred(this._ctx, 14);
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03H\u0325\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x03\x02\x06\x02X\n\x02\r\x02\x0E\x02Y\x03\x02\x03\x02\x03\x03\x07\x03" +
		"_\n\x03\f\x03\x0E\x03b\v\x03\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03h" +
		"\n\x03\f\x03\x0E\x03k\v\x03\x03\x03\x03\x03\x03\x04\x07\x04p\n\x04\f\x04" +
		"\x0E\x04s\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05\x8B\n\x05\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06\x93\n\x06\f\x06\x0E" +
		"\x06\x96\v\x06\x03\x06\x05\x06\x99\n\x06\x03\x06\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x05\x06\xA0\n\x06\x03\x06\x05\x06\xA3\n\x06\x03\x06\x03\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x07\x06\xAB\n\x06\f\x06\x0E\x06\xAE\v\x06" +
		"\x03\x06\x05\x06\xB1\n\x06\x05\x06\xB3\n\x06\x03\x06\x05\x06\xB6\n\x06" +
		"\x03\x06\x03\x06\x05\x06\xBA\n\x06\x03\x06\x03\x06\x05\x06\xBE\n\x06\x03" +
		"\x06\x05\x06\xC1\n\x06\x05\x06\xC3\n\x06\x03\x07\x03\x07\x03\x07\x03\x07" +
		"\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x05\x07" +
		"\xD1\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07\b\xD8\n\b\f\b\x0E\b\xDB\v" +
		"\b\x03\b\x05\b\xDE\n\b\x03\t\x05\t\xE1\n\t\x03\t\x03\t\x03\t\x07\t\xE6" +
		"\n\t\f\t\x0E\t\xE9\v\t\x03\n\x03\n\x03\n\x03\n\x03\n\x05\n\xF0\n\n\x03" +
		"\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x05\v\xFC\n\v" +
		"\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x05\f\u0104\n\f\x03\f\x03\f\x03\f" +
		"\x03\f\x05\f\u010A\n\f\x03\f\x03\f\x05\f\u010E\n\f\x05\f\u0110\n\f\x03" +
		"\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r\u011B\n\r\x05" +
		"\r\u011D\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u012A\n\x0E\f\x0E\x0E\x0E\u012D\v" +
		"\x0E\x03\x0E\x05\x0E\u0130\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x05\x0E\u0137\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07\x0E\u0144\n\x0E\f\x0E\x0E\x0E" +
		"\u0147\v\x0E\x03\x0E\x05\x0E\u014A\n\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x05\x0E\u0151\n\x0E\x05\x0E\u0153\n\x0E\x03\x0F\x03\x0F\x03\x10" +
		"\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x07\x13\u0162\n\x13\f\x13\x0E\x13\u0165\v\x13\x05\x13\u0167\n" +
		"\x13\x03\x13\x05\x13\u016A\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13\u0181" +
		"\n\x13\f\x13\x0E\x13\u0184\v\x13\x03\x13\x05\x13\u0187\n\x13\x03\x13\x03" +
		"\x13\x03\x13\x03\x13\x05\x13\u018D\n\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13" +
		"\x03\x13\x03\x13\x07\x13\u019E\n\x13\f\x13\x0E\x13\u01A1\v\x13\x03\x13" +
		"\x03\x13\x05\x13\u01A5\n\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03" +
		"\x13\x07\x13\u01AD\n\x13\f\x13\x0E\x13\u01B0\v\x13\x03\x14\x03\x14\x03" +
		"\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x07" +
		"\x15\u01BD\n\x15\f\x15\x0E\x15\u01C0\v\x15\x03\x15\x03\x15\x03\x15\x05" +
		"\x15\u01C5\n\x15\x03\x15\x03\x15\x05\x15\u01C9\n\x15\x03\x16\x03\x16\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x05\x17\u01D2\n\x17\x03\x17\x05\x17" +
		"\u01D5\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u01E5\n\x17" +
		"\f\x17\x0E\x17\u01E8\v\x17\x03\x17\x05\x17\u01EB\n\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u01F4\n\x17\f\x17\x0E" +
		"\x17\u01F7\v\x17\x03\x17\x05\x17\u01FA\n\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u0204\n\x17\f\x17\x0E\x17" +
		"\u0207\v\x17\x03\x17\x05\x17\u020A\n\x17\x03\x17\x03\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x17\x03\x17\x07\x17\u0213\n\x17\f\x17\x0E\x17\u0216\v\x17" +
		"\x03\x17\x05\x17\u0219\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x05\x17\u0221\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17" +
		"\x07\x17\u0229\n\x17\f\x17\x0E\x17\u022C\v\x17\x03\x17\x05\x17\u022F\n" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07" +
		"\x17\u0239\n\x17\f\x17\x0E\x17\u023C\v\x17\x03\x17\x05\x17\u023F\n\x17" +
		"\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u0247\n\x17\f" +
		"\x17\x0E\x17\u024A\v\x17\x05\x17\u024C\n\x17\x03\x17\x05\x17\u024F\n\x17" +
		"\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17" +
		"\x03\x17\x03\x17\x05\x17\u0265\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03" +
		"\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x05\x17\u028C\n\x17\x03\x17" +
		"\x05\x17\u028F\n\x17\x03\x17\x03\x17\x03\x17\x03\x17\x03\x17\x07\x17\u0296" +
		"\n\x17\f\x17\x0E\x17\u0299\v\x17\x03\x18\x03\x18\x03\x18\x03\x18\x05\x18" +
		"\u029F\n\x18\x03\x18\x03\x18\x03\x18\x07\x18\u02A4\n\x18\f\x18\x0E\x18" +
		"\u02A7\v\x18\x03\x18\x03\x18\x03\x19\x03\x19\x05\x19\u02AD\n\x19\x03\x19" +
		"\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x05\x1A\u02B6\n\x1A\x03" +
		"\x1A\x05\x1A\u02B9\n\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B" +
		"\x03\x1B\x03\x1B\x03\x1B\x05\x1B\u02C4\n\x1B\x03\x1C\x03\x1C\x05\x1C\u02C8" +
		"\n\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D" +
		"\x07\x1D\u02D2\n\x1D\f\x1D\x0E\x1D\u02D5\v\x1D\x03\x1D\x03\x1D\x03\x1D" +
		"\x03\x1D\x05\x1D\u02DB\n\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x06" +
		"\x1E\u02E2\n\x1E\r\x1E\x0E\x1E\u02E3\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03" +
		"\x1E\x03\x1F\x03\x1F\x05\x1F\u02ED\n\x1F\x03 \x03 \x03!\x03!\x03!\x03" +
		"!\x03\"\x03\"\x05\"\u02F7\n\"\x03#\x03#\x03#\x07#\u02FC\n#\f#\x0E#\u02FF" +
		"\v#\x03$\x03$\x03$\x03$\x03$\x03$\x05$\u0307\n$\x03%\x03%\x05%\u030B\n" +
		"%\x03&\x03&\x05&\u030F\n&\x03\'\x03\'\x03(\x03(\x03)\x03)\x03)\x07)\u0318" +
		"\n)\f)\x0E)\u031B\v)\x03*\x03*\x03*\x03*\x05*\u0321\n*\x03+\x03+\x03+" +
		"\x02\x02\x04$,,\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10" +
		"\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02\"\x02" +
		"$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02:\x02<\x02>\x02" +
		"@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02T\x02\x02\n\x03\x02" +
		"57\x03\x0234\x03\x028=\x04\x02-1AB\x03\x02-0\x05\x02!!-03=\x03\x02*,\x03" +
		"\x02CD\x02\u038C\x02W\x03\x02\x02\x02\x04`\x03\x02\x02\x02\x06q\x03\x02" +
		"\x02\x02\b\x8A\x03\x02\x02\x02\n\xC2\x03\x02\x02\x02\f\xD0\x03\x02\x02" +
		"\x02\x0E\xD2\x03\x02\x02\x02\x10\xE0\x03\x02\x02\x02\x12\xEA\x03\x02\x02" +
		"\x02\x14\xFB\x03\x02\x02\x02\x16\u010F\x03\x02\x02\x02\x18\u011C\x03\x02" +
		"\x02\x02\x1A\u0152\x03\x02\x02\x02\x1C\u0154\x03\x02\x02\x02\x1E\u0156" +
		"\x03\x02\x02\x02 \u0158\x03\x02\x02\x02\"\u015A\x03\x02\x02\x02$\u01A4" +
		"\x03\x02\x02\x02&\u01B1\x03\x02\x02\x02(\u01C8\x03\x02\x02\x02*\u01CA" +
		"\x03\x02\x02\x02,\u0264\x03\x02\x02\x02.\u029A\x03\x02\x02\x020\u02AC" +
		"\x03\x02\x02\x022\u02B1\x03\x02\x02\x024\u02C3\x03\x02\x02\x026\u02C7" +
		"\x03\x02\x02\x028\u02DA\x03\x02\x02\x02:\u02DC\x03\x02\x02\x02<\u02EC" +
		"\x03\x02\x02\x02>\u02EE\x03\x02\x02\x02@\u02F0\x03\x02\x02\x02B\u02F6" +
		"\x03\x02\x02\x02D\u02F8\x03\x02\x02\x02F\u0306\x03\x02\x02\x02H\u030A" +
		"\x03\x02\x02\x02J\u030E\x03\x02\x02\x02L\u0310\x03\x02\x02\x02N\u0312" +
		"\x03\x02\x02\x02P\u0314\x03\x02\x02\x02R\u0320\x03\x02\x02\x02T\u0322" +
		"\x03\x02\x02\x02VX\x05\x04\x03\x02WV\x03\x02\x02\x02XY\x03\x02\x02\x02" +
		"YW\x03\x02\x02\x02YZ\x03\x02\x02\x02Z[\x03\x02\x02\x02[\\\x07\x02\x02" +
		"\x03\\\x03\x03\x02\x02\x02]_\x07E\x02\x02^]\x03\x02\x02\x02_b\x03\x02" +
		"\x02\x02`^\x03\x02\x02\x02`a\x03\x02\x02\x02ac\x03\x02\x02\x02b`\x03\x02" +
		"\x02\x02cd\x07\x03\x02\x02de\x05P)\x02ei\x07\x04\x02\x02fh\x05\x06\x04" +
		"\x02gf\x03\x02\x02\x02hk\x03\x02\x02\x02ig\x03\x02\x02\x02ij\x03\x02\x02" +
		"\x02jl\x03\x02\x02\x02ki\x03\x02\x02\x02lm\x07\x05\x02\x02m\x05\x03\x02" +
		"\x02\x02np\x07E\x02\x02on\x03\x02\x02\x02ps\x03\x02\x02\x02qo\x03\x02" +
		"\x02\x02qr\x03\x02\x02\x02rt\x03\x02\x02\x02sq\x03\x02\x02\x02tu\x05\b" +
		"\x05\x02u\x07\x03\x02\x02\x02vw\x07\x06\x02\x02wx\x05P)\x02xy\x07\x07" +
		"\x02\x02yz\x05$\x13\x02z\x8B\x03\x02\x02\x02{|\x07\b\x02\x02|}\x05P)\x02" +
		"}~\x07\x07\x02\x02~\x7F\x05$\x13\x02\x7F\x8B\x03\x02\x02\x02\x80\x81\x07" +
		"\t\x02\x02\x81\x82\x05<\x1F\x02\x82\x83\x07>\x02\x02\x83\x84\x05,\x17" +
		"\x02\x84\x8B\x03\x02\x02\x02\x85\x8B\x05\x1A\x0E\x02\x86\x8B\x05\n\x06" +
		"\x02\x87\x8B\x05\f\x07\x02\x88\x8B\x05\x16\f\x02\x89\x8B\x05\x18\r\x02" +
		"\x8Av\x03\x02\x02\x02\x8A{\x03\x02\x02\x02\x8A\x80\x03\x02\x02\x02\x8A" +
		"\x85\x03\x02\x02\x02\x8A\x86\x03\x02\x02\x02\x8A\x87\x03\x02\x02\x02\x8A" +
		"\x88\x03\x02\x02\x02\x8A\x89\x03\x02\x02\x02\x8B\t\x03\x02\x02\x02\x8C" +
		"\x8D\x05\x14\v\x02\x8D\x8E\x05H%\x02\x8E\x8F\x07?\x02\x02\x8F\x94\x05" +
		"@!\x02\x90\x91\x07\n\x02\x02\x91\x93\x05@!\x02\x92\x90\x03\x02\x02\x02" +
		"\x93\x96\x03\x02\x02\x02\x94\x92\x03\x02\x02\x02\x94\x95\x03\x02\x02\x02" +
		"\x95\x98\x03\x02\x02\x02\x96\x94\x03\x02\x02\x02\x97\x99\x07\n\x02\x02" +
		"\x98\x97\x03\x02\x02\x02\x98\x99\x03\x02\x02\x02\x99\x9A\x03\x02\x02\x02" +
		"\x9A\x9B\x07@\x02\x02\x9B\x9C\x07\x07\x02\x02\x9C\x9F\x05$\x13\x02\x9D" +
		"\x9E\x07>\x02\x02\x9E\xA0\x05,\x17\x02\x9F\x9D\x03\x02\x02\x02\x9F\xA0" +
		"\x03\x02\x02\x02\xA0\xA2\x03\x02\x02\x02\xA1\xA3\x07\v\x02\x02\xA2\xA1" +
		"\x03\x02\x02\x02\xA2\xA3\x03\x02\x02\x02\xA3\xC3\x03\x02\x02\x02\xA4\xA5" +
		"\x05\x14\v\x02\xA5\xB5\x05H%\x02\xA6\xB2\x07?\x02\x02\xA7\xAC\x05> \x02" +
		"\xA8\xA9\x07\n\x02\x02\xA9\xAB\x05> \x02\xAA\xA8\x03\x02\x02\x02\xAB\xAE" +
		"\x03\x02\x02\x02\xAC\xAA\x03\x02\x02\x02\xAC\xAD\x03\x02\x02\x02\xAD\xB0" +
		"\x03\x02\x02\x02\xAE\xAC\x03\x02\x02\x02\xAF\xB1\x07\n\x02\x02\xB0\xAF" +
		"\x03\x02\x02\x02\xB0\xB1\x03\x02\x02\x02\xB1\xB3\x03\x02\x02\x02\xB2\xA7" +
		"\x03\x02\x02\x02\xB2\xB3\x03\x02\x02\x02\xB3\xB4\x03\x02\x02\x02\xB4\xB6" +
		"\x07@\x02\x02\xB5\xA6\x03\x02\x02\x02\xB5\xB6\x03\x02\x02\x02\xB6\xB9" +
		"\x03\x02\x02\x02\xB7\xB8\x07\x07\x02\x02\xB8\xBA\x05$\x13\x02\xB9\xB7" +
		"\x03\x02\x02\x02\xB9\xBA\x03\x02\x02\x02\xBA\xBD\x03\x02\x02\x02\xBB\xBC" +
		"\x07>\x02\x02\xBC\xBE\x05,\x17\x02\xBD\xBB\x03\x02\x02\x02\xBD\xBE\x03" +
		"\x02\x02\x02\xBE\xC0\x03\x02\x02\x02\xBF\xC1\x07\v\x02\x02\xC0\xBF\x03" +
		"\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\xC3\x03\x02\x02\x02\xC2\x8C\x03" +
		"\x02\x02\x02\xC2\xA4\x03\x02\x02\x02\xC3\v\x03\x02\x02\x02\xC4\xC5\x07" +
		"\f\x02\x02\xC5\xD1\x05P)\x02\xC6\xC7\x07\f\x02\x02\xC7\xC8\x05\x0E\b\x02" +
		"\xC8\xC9\x07>\x02\x02\xC9\xCA\x05$\x13\x02\xCA\xD1\x03\x02\x02\x02\xCB" +
		"\xCC\x07\f\x02\x02\xCC\xCD\x05\x0E\b\x02\xCD\xCE\x07>\x02\x02\xCE\xCF" +
		"\x05\x10\t\x02\xCF\xD1\x03\x02\x02\x02\xD0\xC4\x03\x02\x02\x02\xD0\xC6" +
		"\x03\x02\x02\x02\xD0\xCB\x03\x02\x02\x02\xD1\r\x03\x02\x02\x02\xD2\xDD" +
		"\x05P)\x02\xD3\xD4\x07\r\x02\x02\xD4\xD9\x07C\x02\x02\xD5\xD6\x07\n\x02" +
		"\x02\xD6\xD8\x07C\x02\x02\xD7\xD5\x03\x02\x02\x02\xD8\xDB\x03\x02\x02" +
		"\x02\xD9\xD7\x03\x02\x02\x02\xD9\xDA\x03\x02\x02\x02\xDA\xDC\x03\x02\x02" +
		"\x02\xDB\xD9\x03\x02\x02\x02\xDC\xDE\x07\x0E\x02\x02\xDD\xD3\x03\x02\x02" +
		"\x02\xDD\xDE\x03\x02\x02\x02\xDE\x0F\x03\x02\x02\x02\xDF\xE1\x07\x0F\x02" +
		"\x02\xE0\xDF\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE2\x03\x02\x02" +
		"\x02\xE2\xE7\x05\x12\n\x02\xE3\xE4\x07\x0F\x02\x02\xE4\xE6\x05\x12\n\x02" +
		"\xE5\xE3\x03\x02\x02\x02\xE6\xE9\x03\x02\x02\x02\xE7\xE5\x03\x02\x02\x02" +
		"\xE7\xE8\x03\x02\x02\x02\xE8\x11\x03\x02\x02\x02\xE9\xE7\x03\x02\x02\x02" +
		"\xEA\xEF\x05R*\x02\xEB\xEC\x07?\x02\x02\xEC\xED\x05$\x13\x02\xED\xEE\x07" +
		"@\x02\x02\xEE\xF0\x03\x02\x02\x02\xEF\xEB\x03\x02\x02\x02\xEF\xF0\x03" +
		"\x02\x02\x02\xF0\x13\x03\x02\x02\x02\xF1\xFC\x07\x10\x02\x02\xF2\xFC\x07" +
		"\x11\x02\x02\xF3\xF4\x07\x12\x02\x02\xF4\xFC\x07\x10\x02\x02\xF5\xF6\x07" +
		"\x12\x02\x02\xF6\xFC\x07\x11\x02\x02\xF7\xFC\x07\x13\x02\x02\xF8\xFC\x07" +
		"\x14\x02\x02\xF9\xFC\x07\x15\x02\x02\xFA\xFC\x07\x16\x02\x02\xFB\xF1\x03" +
		"\x02\x02\x02\xFB\xF2\x03\x02\x02\x02\xFB\xF3\x03\x02\x02\x02\xFB\xF5\x03" +
		"\x02\x02\x02\xFB\xF7\x03\x02\x02\x02\xFB\xF8\x03\x02\x02\x02\xFB\xF9\x03" +
		"\x02\x02\x02\xFB\xFA\x03\x02\x02\x02\xFC\x15\x03\x02\x02\x02\xFD\xFE\x07" +
		"\x17\x02\x02\xFE\xFF\x05\x1E\x10\x02\xFF\u0100\x07\x18\x02\x02\u0100\u0103" +
		"\x05B\"\x02\u0101\u0102\x07\x19\x02\x02\u0102\u0104\x05\"\x12\x02\u0103" +
		"\u0101\x03\x02\x02\x02\u0103\u0104\x03\x02\x02\x02\u0104\u0110\x03\x02" +
		"\x02\x02\u0105\u0106\x07\x17\x02\x02\u0106\u0109\x05\x1E\x10\x02\u0107" +
		"\u0108\x07\x1A\x02\x02\u0108\u010A\x05\x1E\x10\x02\u0109\u0107\x03\x02" +
		"\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A\u010D\x03\x02\x02\x02\u010B" +
		"\u010C\x07\x19\x02\x02\u010C\u010E\x05\"\x12\x02\u010D\u010B\x03\x02\x02" +
		"\x02\u010D\u010E\x03\x02\x02\x02\u010E\u0110\x03\x02\x02\x02\u010F\xFD" +
		"\x03\x02\x02\x02\u010F\u0105\x03\x02\x02\x02\u0110\x17\x03\x02\x02\x02" +
		"\u0111\u0112\x07\x1B\x02\x02\u0112\u0113\x05\x1E\x10\x02\u0113\u0114\x07" +
		"\x18\x02\x02\u0114\u0115\x05B\"\x02\u0115\u011D\x03\x02\x02\x02\u0116" +
		"\u0117\x07\x1B\x02\x02\u0117\u011A\x05\x1E\x10\x02\u0118\u0119\x07\x1A" +
		"\x02\x02\u0119\u011B\x05\x1E\x10\x02\u011A\u0118\x03\x02\x02\x02\u011A" +
		"\u011B\x03\x02\x02\x02\u011B\u011D\x03\x02\x02\x02\u011C\u0111\x03\x02" +
		"\x02\x02\u011C\u0116\x03\x02\x02\x02\u011D\x19\x03\x02\x02\x02\u011E\u011F" +
		"\x07\x17\x02\x02\u011F\u0120\x05\x1C\x0F\x02\u0120\u0121\x07?\x02\x02" +
		"\u0121\u0122\x05\x1E\x10\x02\u0122\u0123\x07>\x02\x02\u0123\u012B\x05" +
		",\x17\x02\u0124\u0125\x07\n\x02\x02\u0125\u0126\x05\x1E\x10\x02\u0126" +
		"\u0127\x07>\x02\x02\u0127\u0128\x05,\x17\x02\u0128\u012A\x03\x02\x02\x02" +
		"\u0129\u0124\x03\x02\x02\x02\u012A\u012D\x03\x02\x02\x02\u012B\u0129\x03" +
		"\x02\x02\x02\u012B\u012C\x03\x02\x02\x02\u012C\u012F\x03\x02\x02\x02\u012D" +
		"\u012B\x03\x02\x02\x02\u012E\u0130\x07\n\x02\x02\u012F\u012E\x03\x02\x02" +
		"\x02\u012F\u0130\x03\x02\x02\x02\u0130\u0131\x03\x02\x02\x02\u0131\u0132" +
		"\x07@\x02\x02\u0132\u0133\x07\x18\x02\x02\u0133\u0136\x075\x02\x02\u0134" +
		"\u0135\x07\x19\x02\x02\u0135\u0137\x05\"\x12\x02\u0136\u0134\x03\x02\x02" +
		"\x02\u0136\u0137\x03\x02\x02\x02\u0137\u0153\x03\x02\x02\x02\u0138\u0139" +
		"\x07\x17\x02\x02\u0139\u013A\x05\x1C\x0F\x02\u013A\u013B\x07?\x02\x02" +
		"\u013B\u013C\x05\x1E\x10\x02\u013C\u013D\x07>\x02\x02\u013D\u0145\x05" +
		",\x17\x02\u013E\u013F\x07\n\x02\x02\u013F\u0140\x05\x1E\x10\x02\u0140" +
		"\u0141\x07>\x02\x02\u0141\u0142\x05,\x17\x02\u0142\u0144\x03\x02\x02\x02" +
		"\u0143\u013E\x03\x02\x02\x02\u0144\u0147\x03\x02\x02\x02\u0145\u0143\x03" +
		"\x02\x02\x02\u0145\u0146\x03\x02\x02\x02\u0146\u0149\x03\x02\x02\x02\u0147" +
		"\u0145\x03\x02\x02\x02\u0148\u014A\x07\n\x02\x02\u0149\u0148\x03\x02\x02" +
		"\x02\u0149\u014A\x03\x02\x02\x02\u014A\u014B\x03\x02\x02\x02\u014B\u014C" +
		"\x07@\x02\x02\u014C\u014D\x07\x1A\x02\x02\u014D\u0150\x05 \x11\x02\u014E" +
		"\u014F\x07\x19\x02\x02\u014F\u0151\x05\"\x12\x02\u0150\u014E\x03\x02\x02" +
		"\x02\u0150\u0151\x03\x02\x02\x02\u0151\u0153\x03\x02\x02\x02\u0152\u011E" +
		"\x03\x02\x02\x02\u0152\u0138\x03\x02\x02\x02\u0153\x1B\x03\x02\x02\x02" +
		"\u0154\u0155\x05P)\x02\u0155\x1D\x03\x02\x02\x02\u0156\u0157\x05P)\x02" +
		"\u0157\x1F\x03\x02\x02\x02\u0158\u0159\x05P)\x02\u0159!\x03\x02\x02\x02" +
		"\u015A\u015B\x07*\x02\x02\u015B#\x03\x02\x02\x02\u015C\u015D\b\x13\x01" +
		"\x02\u015D\u0166\x07?\x02\x02\u015E\u0163\x05$\x13\x02\u015F\u0160\x07" +
		"\n\x02\x02\u0160\u0162\x05$\x13\x02\u0161\u015F\x03\x02\x02\x02\u0162" +
		"\u0165\x03\x02\x02\x02\u0163\u0161\x03\x02\x02\x02\u0163\u0164\x03\x02" +
		"\x02\x02\u0164\u0167\x03\x02\x02\x02\u0165\u0163\x03\x02\x02\x02\u0166" +
		"\u015E\x03\x02\x02\x02\u0166\u0167\x03\x02\x02\x02\u0167\u0169\x03\x02" +
		"\x02\x02\u0168\u016A\x07\n\x02\x02\u0169\u0168\x03\x02\x02\x02\u0169\u016A" +
		"\x03\x02\x02\x02\u016A\u016B\x03\x02\x02\x02\u016B\u016C\x07@\x02\x02" +
		"\u016C\u016D\x07\x1D\x02\x02\u016D\u01A5\x05$\x13\x0F\u016E\u016F\x07" +
		"A\x02\x02\u016F\u0170\x07\r\x02\x02\u0170\u0171\x05$\x13\x02\u0171\u0172" +
		"\x07\x0E\x02\x02\u0172\u01A5\x03\x02\x02\x02\u0173\u0174\x07B\x02\x02" +
		"\u0174\u0175\x07\r\x02\x02\u0175\u0176\x05$\x13\x02\u0176\u0177\x07\x0E" +
		"\x02\x02\u0177\u01A5\x03\x02\x02\x02\u0178\u0179\x07?\x02\x02\u0179\u01A5" +
		"\x07@\x02\x02\u017A\u017B\x07?\x02\x02\u017B\u017C\x05$\x13\x02\u017C" +
		"\u017D\x07\n\x02\x02\u017D\u0182\x05$\x13\x02\u017E\u017F\x07\n\x02\x02" +
		"\u017F\u0181\x05$\x13\x02\u0180\u017E\x03\x02\x02\x02\u0181\u0184\x03" +
		"\x02\x02\x02\u0182\u0180\x03\x02\x02\x02\u0182\u0183\x03\x02\x02\x02\u0183" +
		"\u0186\x03\x02\x02\x02\u0184\u0182\x03\x02\x02\x02\u0185\u0187\x07\n\x02" +
		"\x02\u0186\u0185\x03\x02\x02\x02\u0186\u0187\x03\x02\x02\x02\u0187\u0188" +
		"\x03\x02\x02\x02\u0188\u0189\x07@\x02\x02\u0189\u01A5\x03\x02\x02\x02" +
		"\u018A\u018C\x07\x04\x02\x02\u018B\u018D\x05(\x15\x02\u018C\u018B\x03" +
		"\x02\x02\x02\u018C\u018D\x03\x02\x02\x02\u018D\u018E\x03\x02\x02\x02\u018E" +
		"\u01A5\x07\x05\x02\x02\u018F\u01A5\x07\x1E\x02\x02\u0190\u01A5\x07\x1F" +
		"\x02\x02\u0191\u01A5\x07 \x02\x02\u0192\u01A5\x05&\x14\x02\u0193\u01A5" +
		"\x05P)\x02\u0194\u0195\x07?\x02\x02\u0195\u0196\x05$\x13\x02\u0196\u0197" +
		"\x07@\x02\x02\u0197\u01A5\x03\x02\x02\x02\u0198\u0199\x05P)\x02\u0199" +
		"\u019A\x07\r\x02\x02\u019A\u019F\x05$\x13\x02\u019B\u019C\x07\n\x02\x02" +
		"\u019C\u019E\x05$\x13\x02\u019D\u019B\x03\x02\x02\x02\u019E\u01A1\x03" +
		"\x02\x02\x02\u019F\u019D\x03\x02\x02\x02\u019F\u01A0\x03\x02\x02\x02\u01A0" +
		"\u01A2\x03\x02\x02\x02\u01A1\u019F\x03\x02\x02\x02\u01A2\u01A3\x07\x0E" +
		"\x02\x02\u01A3\u01A5\x03\x02\x02\x02\u01A4\u015C\x03\x02\x02\x02\u01A4" +
		"\u016E\x03\x02\x02\x02\u01A4\u0173\x03\x02\x02\x02\u01A4\u0178\x03\x02" +
		"\x02\x02\u01A4\u017A\x03\x02\x02\x02\u01A4\u018A\x03\x02\x02\x02\u01A4" +
		"\u018F\x03\x02\x02\x02\u01A4\u0190\x03\x02\x02\x02\u01A4\u0191\x03\x02" +
		"\x02\x02\u01A4\u0192\x03\x02\x02\x02\u01A4\u0193\x03\x02\x02\x02\u01A4" +
		"\u0194\x03\x02\x02\x02\u01A4\u0198\x03\x02\x02\x02\u01A5\u01AE\x03\x02" +
		"\x02\x02\u01A6\u01A7\f\x11\x02\x02\u01A7\u01A8\x07\x1C\x02\x02\u01A8\u01AD" +
		"\x05$\x13\x11\u01A9\u01AA\f\x10\x02\x02\u01AA\u01AB\x07\x1D\x02\x02\u01AB" +
		"\u01AD\x05$\x13\x10\u01AC\u01A6\x03\x02\x02\x02\u01AC\u01A9\x03\x02\x02" +
		"\x02\u01AD\u01B0\x03\x02\x02\x02\u01AE\u01AC\x03\x02\x02\x02\u01AE\u01AF" +
		"\x03\x02\x02\x02\u01AF%\x03\x02\x02\x02\u01B0\u01AE\x03\x02\x02\x02\u01B1" +
		"\u01B2\x07C\x02\x02\u01B2\'\x03\x02\x02\x02\u01B3\u01B4\x05*\x16\x02\u01B4" +
		"\u01B5\x07\x07\x02\x02\u01B5\u01B6\x05$\x13\x02\u01B6\u01BE\x03\x02\x02" +
		"\x02\u01B7\u01B8\x07\n\x02\x02\u01B8\u01B9\x05*\x16\x02\u01B9\u01BA\x07" +
		"\x07\x02\x02\u01BA\u01BB\x05$\x13\x02\u01BB\u01BD\x03\x02\x02\x02\u01BC" +
		"\u01B7\x03\x02\x02\x02\u01BD\u01C0\x03\x02\x02\x02\u01BE\u01BC\x03\x02" +
		"\x02\x02\u01BE\u01BF\x03\x02\x02\x02\u01BF\u01C4\x03\x02\x02\x02\u01C0" +
		"\u01BE\x03\x02\x02\x02\u01C1\u01C5\x07\n\x02\x02\u01C2\u01C3\x07\x0F\x02" +
		"\x02\u01C3\u01C5\x05T+\x02\u01C4\u01C1\x03\x02\x02\x02\u01C4\u01C2\x03" +
		"\x02\x02\x02\u01C4\u01C5\x03\x02\x02\x02\u01C5\u01C9\x03\x02\x02\x02\u01C6" +
		"\u01C7\x07\x0F\x02\x02\u01C7\u01C9\x05T+\x02\u01C8\u01B3\x03\x02\x02\x02" +
		"\u01C8\u01C6\x03\x02\x02\x02\u01C9)\x03\x02\x02\x02\u01CA\u01CB\x05R*" +
		"\x02\u01CB+\x03\x02\x02\x02\u01CC\u01CD\b\x17\x01\x02\u01CD\u0265\x05" +
		"6\x1C\x02\u01CE\u01CF\x05H%\x02\u01CF\u01D1\x07?\x02\x02\u01D0\u01D2\x05" +
		"D#\x02\u01D1\u01D0\x03\x02\x02\x02\u01D1\u01D2\x03\x02\x02\x02\u01D2\u01D4" +
		"\x03\x02\x02\x02\u01D3\u01D5\x07\n\x02\x02\u01D4\u01D3\x03\x02\x02\x02" +
		"\u01D4\u01D5\x03\x02\x02\x02\u01D5\u01D6\x03\x02\x02\x02\u01D6\u01D7\x07" +
		"@\x02\x02\u01D7\u0265\x03\x02\x02\x02\u01D8\u01D9\x074\x02\x02\u01D9\u0265" +
		"\x05,\x17\x1B\u01DA\u01DB\x05P)\x02\u01DB\u01DC\x07\"\x02\x02\u01DC\u01DD" +
		"\x07>\x02\x02\u01DD\u01DE\x05,\x17\x17\u01DE\u0265\x03\x02\x02\x02\u01DF" +
		"\u01E0\x07-\x02\x02\u01E0\u01E1\x07\x04\x02\x02\u01E1\u01E6\x05,\x17\x02" +
		"\u01E2\u01E3\x07\n\x02\x02\u01E3\u01E5\x05,\x17\x02\u01E4\u01E2\x03\x02" +
		"\x02\x02\u01E5\u01E8\x03\x02\x02\x02\u01E6\u01E4\x03\x02\x02\x02\u01E6" +
		"\u01E7\x03\x02\x02\x02\u01E7\u01EA\x03\x02\x02\x02\u01E8";
	private static readonly _serializedATNSegment1: string =
		"\u01E6\x03\x02\x02\x02\u01E9\u01EB\x07\n\x02\x02\u01EA\u01E9\x03\x02\x02" +
		"\x02\u01EA\u01EB\x03\x02\x02\x02\u01EB\u01EC\x03\x02\x02\x02\u01EC\u01ED" +
		"\x07\x05\x02\x02\u01ED\u0265\x03\x02\x02\x02\u01EE\u01EF\x07.\x02\x02" +
		"\u01EF\u01F0\x07\x04\x02\x02\u01F0\u01F5\x05,\x17\x02\u01F1\u01F2\x07" +
		"\n\x02\x02\u01F2\u01F4\x05,\x17\x02\u01F3\u01F1\x03\x02\x02\x02\u01F4" +
		"\u01F7\x03\x02\x02\x02\u01F5\u01F3\x03\x02\x02\x02\u01F5\u01F6\x03\x02" +
		"\x02\x02\u01F6\u01F9\x03\x02\x02\x02\u01F7\u01F5\x03\x02\x02\x02\u01F8" +
		"\u01FA\x07\n\x02\x02\u01F9\u01F8\x03\x02\x02\x02\u01F9\u01FA\x03\x02\x02" +
		"\x02\u01FA\u01FB\x03\x02\x02\x02\u01FB\u01FC\x07\x05\x02\x02\u01FC\u0265" +
		"\x03\x02\x02\x02\u01FD\u0265\x05.\x18\x02\u01FE\u01FF\x07#\x02\x02\u01FF" +
		"\u0200\x07\x04\x02\x02\u0200\u0205\x05,\x17\x02\u0201\u0202\x07\n\x02" +
		"\x02\u0202\u0204\x05,\x17\x02\u0203\u0201\x03\x02\x02\x02\u0204\u0207" +
		"\x03\x02\x02\x02\u0205\u0203\x03\x02\x02\x02\u0205\u0206\x03\x02\x02\x02" +
		"\u0206\u0209\x03\x02\x02\x02\u0207\u0205\x03\x02\x02\x02\u0208\u020A\x07" +
		"\n\x02\x02\u0209\u0208\x03\x02\x02\x02\u0209\u020A\x03\x02\x02\x02\u020A" +
		"\u020B\x03\x02\x02\x02\u020B\u020C\x07\x05\x02\x02\u020C\u0265\x03\x02" +
		"\x02\x02\u020D\u020E\x07$\x02\x02\u020E\u020F\x07\x04\x02\x02\u020F\u0214" +
		"\x05,\x17\x02\u0210\u0211\x07\n\x02\x02\u0211\u0213\x05,\x17\x02\u0212" +
		"\u0210\x03\x02\x02\x02\u0213\u0216\x03\x02\x02\x02\u0214\u0212\x03\x02" +
		"\x02\x02\u0214\u0215\x03\x02\x02\x02\u0215\u0218\x03\x02\x02\x02\u0216" +
		"\u0214\x03\x02\x02\x02\u0217\u0219\x07\n\x02\x02\u0218\u0217\x03\x02\x02" +
		"\x02\u0218\u0219\x03\x02\x02\x02\u0219\u021A\x03\x02\x02\x02\u021A\u021B" +
		"\x07\x05\x02\x02\u021B\u0265\x03\x02\x02\x02\u021C\u0221\x05P)\x02\u021D" +
		"\u0221\x07,\x02\x02\u021E\u0221\x07+\x02\x02\u021F\u0221\x07*\x02\x02" +
		"\u0220\u021C\x03\x02\x02\x02\u0220\u021D\x03\x02\x02\x02\u0220\u021E\x03" +
		"\x02\x02\x02\u0220\u021F\x03\x02\x02\x02\u0221\u0265\x03\x02\x02\x02\u0222" +
		"\u0223\x07?\x02\x02\u0223\u0224\x05,\x17\x02\u0224\u0225\x07\n\x02\x02" +
		"\u0225\u022A\x05,\x17\x02\u0226\u0227\x07\n\x02\x02\u0227\u0229\x05,\x17" +
		"\x02\u0228\u0226\x03\x02\x02\x02\u0229\u022C\x03\x02\x02\x02\u022A\u0228" +
		"\x03\x02\x02\x02\u022A\u022B\x03\x02\x02\x02\u022B\u022E\x03\x02\x02\x02" +
		"\u022C\u022A\x03\x02\x02\x02\u022D\u022F\x07\n\x02\x02\u022E\u022D\x03" +
		"\x02\x02\x02\u022E\u022F\x03\x02\x02\x02\u022F\u0230\x03\x02\x02\x02\u0230" +
		"\u0231\x07@\x02\x02\u0231\u0265\x03\x02\x02\x02\u0232\u0233\x07?\x02\x02" +
		"\u0233\u0265\x07@\x02\x02\u0234\u0235\x07\x04\x02\x02\u0235\u023A\x05" +
		"F$\x02\u0236\u0237\x07\n\x02\x02\u0237\u0239\x05F$\x02\u0238\u0236\x03" +
		"\x02\x02\x02\u0239\u023C\x03\x02\x02\x02\u023A\u0238\x03\x02\x02\x02\u023A" +
		"\u023B\x03\x02\x02\x02\u023B\u023E\x03\x02\x02\x02\u023C\u023A\x03\x02" +
		"\x02\x02\u023D\u023F\x07\n\x02\x02\u023E\u023D\x03\x02\x02\x02\u023E\u023F" +
		"\x03\x02\x02\x02\u023F\u0240\x03\x02\x02\x02\u0240\u0241\x07\x05\x02\x02" +
		"\u0241\u0265\x03\x02\x02\x02\u0242\u024B\x07\r\x02\x02\u0243\u0248\x05" +
		",\x17\x02\u0244\u0245\x07\n\x02\x02\u0245\u0247\x05,\x17\x02\u0246\u0244" +
		"\x03\x02\x02\x02\u0247\u024A\x03\x02\x02\x02\u0248\u0246\x03\x02\x02\x02" +
		"\u0248\u0249\x03\x02\x02\x02\u0249\u024C\x03\x02\x02\x02\u024A\u0248\x03" +
		"\x02\x02\x02\u024B\u0243\x03\x02\x02\x02\u024B\u024C\x03\x02\x02\x02\u024C" +
		"\u024E\x03\x02\x02\x02\u024D\u024F\x07\n\x02\x02\u024E\u024D\x03\x02\x02" +
		"\x02\u024E\u024F\x03\x02\x02\x02\u024F\u0250\x03\x02\x02\x02\u0250\u0265" +
		"\x07\x0E\x02\x02\u0251\u0252\x07%\x02\x02\u0252\u0253\x07?\x02\x02\u0253" +
		"\u0254\x05,\x17\x02\u0254\u0255\x07@\x02\x02\u0255\u0256\x05,\x17\x02" +
		"\u0256\u0257\x07&\x02\x02\u0257\u0258\x05,\x17\x06\u0258\u0265\x03\x02" +
		"\x02\x02\u0259\u025A\x05\n\x06\x02\u025A\u025B\x05,\x17\x05\u025B\u0265" +
		"\x03\x02\x02\x02\u025C\u025D\x07?\x02\x02\u025D\u025E\x05,\x17\x02\u025E" +
		"\u025F\x07@\x02\x02\u025F\u0265\x03\x02\x02\x02\u0260\u0261\x07\x04\x02" +
		"\x02\u0261\u0262\x05,\x17\x02\u0262\u0263\x07\x05\x02\x02\u0263\u0265" +
		"\x03\x02\x02\x02\u0264\u01CC\x03\x02\x02\x02\u0264\u01CE\x03\x02\x02\x02" +
		"\u0264\u01D8\x03\x02\x02\x02\u0264\u01DA\x03\x02\x02\x02\u0264\u01DF\x03" +
		"\x02\x02\x02\u0264\u01EE\x03\x02\x02\x02\u0264\u01FD\x03\x02\x02\x02\u0264" +
		"\u01FE\x03\x02\x02\x02\u0264\u020D\x03\x02\x02\x02\u0264\u0220\x03\x02" +
		"\x02\x02\u0264\u0222\x03\x02\x02\x02\u0264\u0232\x03\x02\x02\x02\u0264" +
		"\u0234\x03\x02\x02\x02\u0264\u0242\x03\x02\x02\x02\u0264\u0251\x03\x02" +
		"\x02\x02\u0264\u0259\x03\x02\x02\x02\u0264\u025C\x03\x02\x02\x02\u0264" +
		"\u0260\x03\x02\x02\x02\u0265\u0297\x03\x02\x02\x02\u0266\u0267\f\x1C\x02" +
		"\x02\u0267\u0268\x07!\x02\x02\u0268\u0296\x05,\x17\x1C\u0269\u026A\f\x1A" +
		"\x02\x02\u026A\u026B\t\x02\x02\x02\u026B\u0296\x05,\x17\x1B\u026C\u026D" +
		"\f\x19\x02\x02\u026D\u026E\t\x03\x02\x02\u026E\u0296\x05,\x17\x1A\u026F" +
		"\u0270\f\x18\x02\x02\u0270\u0271\t\x04\x02\x02\u0271\u0296\x05,\x17\x19" +
		"\u0272\u0273\f\x16\x02\x02\u0273\u0274\x07>\x02\x02\u0274\u0275\x05,\x17" +
		"\x17\u0275\u0276\b\x17\x01\x02\u0276\u0296\x03\x02\x02\x02\u0277\u0278" +
		"\f\x14\x02\x02\u0278\u0279\x07-\x02\x02\u0279\u0296\x05,\x17\x15\u027A" +
		"\u027B\f\x12\x02\x02\u027B\u027C\x07.\x02\x02\u027C\u0296\x05,\x17\x13" +
		"\u027D\u027E\f\x11\x02\x02\u027E\u027F\x07/\x02\x02\u027F\u0296\x05,\x17" +
		"\x12\u0280\u0281\f\x10\x02\x02\u0281\u0282\x070\x02\x02\u0282\u0296\x05" +
		",\x17\x11\u0283\u0284\f\t\x02\x02\u0284\u0285\x07\x1C\x02\x02\u0285\u0296" +
		"\x05,\x17\n\u0286\u0287\f \x02\x02\u0287\u0288\x07\x18\x02\x02\u0288\u028E" +
		"\x05J&\x02\u0289\u028B\x07?\x02\x02\u028A\u028C\x05D#\x02\u028B\u028A" +
		"\x03\x02\x02\x02\u028B\u028C\x03\x02\x02\x02\u028C\u028D\x03\x02\x02\x02" +
		"\u028D\u028F\x07@\x02\x02\u028E\u0289\x03\x02\x02\x02\u028E\u028F\x03" +
		"\x02\x02\x02\u028F\u0296\x03\x02\x02\x02\u0290\u0291\f\x1D\x02\x02\u0291" +
		"\u0292\x07\r\x02\x02\u0292\u0293\x05,\x17\x02\u0293\u0294\x07\x0E\x02" +
		"\x02\u0294\u0296\x03\x02\x02\x02\u0295\u0266\x03\x02\x02\x02\u0295\u0269" +
		"\x03\x02\x02\x02\u0295\u026C\x03\x02\x02\x02\u0295\u026F\x03\x02\x02\x02" +
		"\u0295\u0272\x03\x02\x02\x02\u0295\u0277\x03\x02\x02\x02\u0295\u027A\x03" +
		"\x02\x02\x02\u0295\u027D\x03\x02\x02\x02\u0295\u0280\x03\x02\x02\x02\u0295" +
		"\u0283\x03\x02\x02\x02\u0295\u0286\x03\x02\x02\x02\u0295\u0290\x03\x02" +
		"\x02\x02\u0296\u0299\x03\x02\x02\x02\u0297\u0295\x03\x02\x02\x02\u0297" +
		"\u0298\x03\x02\x02\x02\u0298-\x03\x02\x02\x02\u0299\u0297\x03\x02\x02" +
		"\x02\u029A\u029B\x072\x02\x02\u029B\u029C\x05,\x17\x02\u029C\u029E\x07" +
		"\x04\x02\x02\u029D\u029F\x07\x0F\x02\x02\u029E\u029D\x03\x02\x02\x02\u029E" +
		"\u029F\x03\x02\x02\x02\u029F\u02A0\x03\x02\x02\x02\u02A0\u02A5\x050\x19" +
		"\x02\u02A1\u02A2\x07\x0F\x02\x02\u02A2\u02A4\x050\x19\x02\u02A3\u02A1" +
		"\x03\x02\x02\x02\u02A4\u02A7\x03\x02\x02\x02\u02A5\u02A3\x03\x02\x02\x02" +
		"\u02A5\u02A6\x03\x02\x02\x02\u02A6\u02A8\x03\x02\x02\x02\u02A7\u02A5\x03" +
		"\x02\x02\x02\u02A8\u02A9\x07\x05\x02\x02\u02A9/\x03\x02\x02\x02\u02AA" +
		"\u02AD\x052\x1A\x02\u02AB\u02AD\x07\'\x02\x02\u02AC\u02AA\x03\x02\x02" +
		"\x02\u02AC\u02AB\x03\x02\x02\x02\u02AD\u02AE\x03\x02\x02\x02\u02AE\u02AF" +
		"\x07\x1D\x02\x02\u02AF\u02B0\x05,\x17\x02\u02B01\x03\x02\x02\x02\u02B1" +
		"\u02B8\x05R*\x02\u02B2\u02B5\x07?\x02\x02\u02B3\u02B6\x05R*\x02\u02B4" +
		"\u02B6\x07\'\x02\x02\u02B5\u02B3\x03\x02\x02\x02\u02B5\u02B4\x03\x02\x02" +
		"\x02\u02B6\u02B7\x03\x02\x02\x02\u02B7\u02B9\x07@\x02\x02\u02B8\u02B2" +
		"\x03\x02\x02\x02\u02B8\u02B9\x03\x02\x02\x02\u02B93\x03\x02\x02\x02\u02BA" +
		"\u02BB\x05\b\x05\x02\u02BB\u02BC\x07\x02\x02\x03\u02BC\u02C4\x03\x02\x02" +
		"\x02\u02BD\u02BE\x05,\x17\x02\u02BE\u02BF\x07\x02\x02\x03\u02BF\u02C4" +
		"\x03\x02\x02\x02\u02C0\u02C1\x07E\x02\x02\u02C1\u02C4\x07\x02\x02\x03" +
		"\u02C2\u02C4\x07\x02\x02\x03\u02C3\u02BA\x03\x02\x02\x02\u02C3\u02BD\x03" +
		"\x02\x02\x02\u02C3\u02C0\x03\x02\x02\x02\u02C3\u02C2\x03\x02\x02\x02\u02C4" +
		"5\x03\x02\x02\x02\u02C5\u02C8\x058\x1D\x02\u02C6\u02C8\x05:\x1E\x02\u02C7" +
		"\u02C5\x03\x02\x02\x02\u02C7\u02C6\x03\x02\x02\x02\u02C87\x03\x02\x02" +
		"\x02\u02C9\u02CA\x05> \x02\u02CA\u02CB\x07\x1D\x02\x02\u02CB\u02CC\x05" +
		",\x17\x02\u02CC\u02DB\x03\x02\x02\x02\u02CD\u02CE\x07?\x02\x02\u02CE\u02D3" +
		"\x05> \x02\u02CF\u02D0\x07\n\x02\x02\u02D0\u02D2\x05> \x02\u02D1\u02CF" +
		"\x03\x02\x02\x02\u02D2\u02D5\x03\x02\x02\x02\u02D3\u02D1\x03\x02\x02\x02" +
		"\u02D3\u02D4\x03\x02\x02\x02\u02D4\u02D6\x03\x02\x02\x02\u02D5\u02D3\x03" +
		"\x02\x02\x02\u02D6\u02D7\x07@\x02\x02\u02D7\u02D8\x07\x1D\x02\x02\u02D8" +
		"\u02D9\x05,\x17\x02\u02D9\u02DB\x03\x02\x02\x02\u02DA\u02C9\x03\x02\x02" +
		"\x02\u02DA\u02CD\x03\x02\x02\x02\u02DB9\x03\x02\x02\x02\u02DC\u02DD\x07" +
		"?\x02\x02\u02DD\u02DE\x07?\x02\x02\u02DE\u02E1\x05> \x02\u02DF\u02E0\x07" +
		"\n\x02\x02\u02E0\u02E2\x05> \x02\u02E1\u02DF\x03\x02\x02\x02\u02E2\u02E3" +
		"\x03\x02\x02\x02\u02E3\u02E1\x03\x02\x02\x02\u02E3\u02E4\x03\x02\x02\x02" +
		"\u02E4\u02E5\x03\x02\x02\x02\u02E5\u02E6\x07@\x02\x02\u02E6\u02E7\x07" +
		"@\x02\x02\u02E7\u02E8\x07\x1D\x02\x02\u02E8\u02E9\x05,\x17\x02\u02E9;" +
		"\x03\x02\x02\x02\u02EA\u02ED\x07\'\x02\x02\u02EB\u02ED\x05P)\x02\u02EC" +
		"\u02EA\x03\x02\x02\x02\u02EC\u02EB\x03\x02\x02\x02\u02ED=\x03\x02\x02" +
		"\x02\u02EE\u02EF\x05<\x1F\x02\u02EF?\x03\x02\x02\x02\u02F0\u02F1\x05<" +
		"\x1F\x02\u02F1\u02F2\x07\x07\x02\x02\u02F2\u02F3\x05$\x13\x02\u02F3A\x03" +
		"\x02\x02\x02\u02F4\u02F7\x075\x02\x02\u02F5\u02F7\x05P)\x02\u02F6\u02F4" +
		"\x03\x02\x02\x02\u02F6\u02F5\x03\x02\x02\x02\u02F7C\x03\x02\x02\x02\u02F8" +
		"\u02FD\x05,\x17\x02\u02F9\u02FA\x07\n\x02\x02\u02FA\u02FC\x05,\x17\x02" +
		"\u02FB\u02F9\x03\x02\x02\x02\u02FC\u02FF\x03\x02\x02\x02\u02FD\u02FB\x03" +
		"\x02\x02\x02\u02FD\u02FE\x03\x02\x02\x02\u02FEE\x03\x02\x02\x02\u02FF" +
		"\u02FD\x03\x02\x02\x02\u0300\u0301\x05R*\x02\u0301\u0302\x07\x07\x02\x02" +
		"\u0302\u0303\x05,\x17\x02\u0303\u0307\x03\x02\x02\x02\u0304\u0305\x07" +
		"(\x02\x02\u0305\u0307\x05,\x17\x02\u0306\u0300\x03\x02\x02\x02\u0306\u0304" +
		"\x03\x02\x02\x02\u0307G\x03\x02\x02\x02\u0308\u030B\x05P)\x02\u0309\u030B" +
		"\t\x05\x02\x02\u030A\u0308\x03\x02\x02\x02\u030A\u0309\x03\x02\x02\x02" +
		"\u030BI\x03\x02\x02\x02\u030C\u030F\x05P)\x02\u030D\u030F\t\x06\x02\x02" +
		"\u030E\u030C\x03\x02\x02\x02\u030E\u030D\x03\x02\x02\x02\u030FK\x03\x02" +
		"\x02\x02\u0310\u0311\t\x07\x02\x02\u0311M\x03\x02\x02\x02\u0312\u0313" +
		"\t\b\x02\x02\u0313O\x03\x02\x02\x02\u0314\u0319\x05T+\x02\u0315\u0316" +
		"\x07)\x02\x02\u0316\u0318\x05T+\x02\u0317\u0315\x03\x02\x02\x02\u0318" +
		"\u031B\x03\x02\x02\x02\u0319\u0317\x03\x02\x02\x02\u0319\u031A\x03\x02" +
		"\x02\x02\u031AQ\x03\x02\x02\x02\u031B\u0319\x03\x02\x02\x02\u031C\u0321" +
		"\x05T+\x02\u031D\u031E\x05P)\x02\u031E\u031F\b*\x01\x02\u031F\u0321\x03" +
		"\x02\x02\x02\u0320\u031C\x03\x02\x02\x02\u0320\u031D\x03\x02\x02\x02\u0321" +
		"S\x03\x02\x02\x02\u0322\u0323\t\t\x02\x02\u0323U\x03\x02\x02\x02]Y`iq" +
		"\x8A\x94\x98\x9F\xA2\xAC\xB0\xB2\xB5\xB9\xBD\xC0\xC2\xD0\xD9\xDD\xE0\xE7" +
		"\xEF\xFB\u0103\u0109\u010D\u010F\u011A\u011C\u012B\u012F\u0136\u0145\u0149" +
		"\u0150\u0152\u0163\u0166\u0169\u0182\u0186\u018C\u019F\u01A4\u01AC\u01AE" +
		"\u01BE\u01C4\u01C8\u01D1\u01D4\u01E6\u01EA\u01F5\u01F9\u0205\u0209\u0214" +
		"\u0218\u0220\u022A\u022E\u023A\u023E\u0248\u024B\u024E\u0264\u028B\u028E" +
		"\u0295\u0297\u029E\u02A5\u02AC\u02B5\u02B8\u02C3\u02C7\u02D3\u02DA\u02E3" +
		"\u02EC\u02F6\u02FD\u0306\u030A\u030E\u0319\u0320";
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
	public fromSource(): FromSourceContext | undefined {
		return this.tryGetRuleContext(0, FromSourceContext);
	}
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
	public fromSource(): FromSourceContext | undefined {
		return this.tryGetRuleContext(0, FromSourceContext);
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
	public _typeCtor!: QualIdContext;
	public _type!: TypeContext;
	public _typeArg: TypeContext[] = [];
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
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
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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
	public qualId(): QualIdContext | undefined {
		return this.tryGetRuleContext(0, QualIdContext);
	}
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
	public LOW_ID(): TerminalNode | undefined { return this.tryGetToken(QuintParser.LOW_ID, 0); }
	public CAP_ID(): TerminalNode | undefined { return this.tryGetToken(QuintParser.CAP_ID, 0); }
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


