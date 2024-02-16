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
	public static readonly RULE_nondetOperDef = 9;
	public static readonly RULE_qualifier = 10;
	public static readonly RULE_importMod = 11;
	public static readonly RULE_exportMod = 12;
	public static readonly RULE_instanceMod = 13;
	public static readonly RULE_moduleName = 14;
	public static readonly RULE_name = 15;
	public static readonly RULE_qualifiedName = 16;
	public static readonly RULE_fromSource = 17;
	public static readonly RULE_type = 18;
	public static readonly RULE_typeVar = 19;
	public static readonly RULE_row = 20;
	public static readonly RULE_rowLabel = 21;
	public static readonly RULE_expr = 22;
	public static readonly RULE_matchSumExpr = 23;
	public static readonly RULE_matchSumCase = 24;
	public static readonly RULE_matchSumVariant = 25;
	public static readonly RULE_declarationOrExpr = 26;
	public static readonly RULE_lambda = 27;
	public static readonly RULE_lambdaUnsugared = 28;
	public static readonly RULE_lambdaTupleSugar = 29;
	public static readonly RULE_identOrHole = 30;
	public static readonly RULE_parameter = 31;
	public static readonly RULE_annotatedParameter = 32;
	public static readonly RULE_identOrStar = 33;
	public static readonly RULE_argList = 34;
	public static readonly RULE_recElem = 35;
	public static readonly RULE_normalCallName = 36;
	public static readonly RULE_nameAfterDot = 37;
	public static readonly RULE_operator = 38;
	public static readonly RULE_literal = 39;
	public static readonly RULE_qualId = 40;
	public static readonly RULE_simpleId = 41;
	public static readonly RULE_identifier = 42;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"modules", "module", "documentedDeclaration", "declaration", "operDef", 
		"typeDef", "typeDefHead", "sumTypeDefinition", "typeSumVariant", "nondetOperDef", 
		"qualifier", "importMod", "exportMod", "instanceMod", "moduleName", "name", 
		"qualifiedName", "fromSource", "type", "typeVar", "row", "rowLabel", "expr", 
		"matchSumExpr", "matchSumCase", "matchSumVariant", "declarationOrExpr", 
		"lambda", "lambdaUnsugared", "lambdaTupleSugar", "identOrHole", "parameter", 
		"annotatedParameter", "identOrStar", "argList", "recElem", "normalCallName", 
		"nameAfterDot", "operator", "literal", "qualId", "simpleId", "identifier",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'module'", "'{'", "'}'", "'const'", "':'", "'var'", "'assume'", 
		"','", "';'", "'type'", "'['", "']'", "'|'", "'nondet'", "'val'", "'def'", 
		"'pure'", "'action'", "'run'", "'temporal'", "'import'", "'.'", "'from'", 
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
			this.state = 87;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 86;
				this.module();
				}
				}
				this.state = 89;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__0 || _la === QuintParser.DOCCOMMENT);
			this.state = 91;
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
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 93;
				this.match(QuintParser.DOCCOMMENT);
				}
				}
				this.state = 98;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 99;
			this.match(QuintParser.T__0);
			this.state = 100;
			this.qualId();
			this.state = 101;
			this.match(QuintParser.T__1);
			this.state = 105;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__3) | (1 << QuintParser.T__5) | (1 << QuintParser.T__6) | (1 << QuintParser.T__9) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19) | (1 << QuintParser.T__20) | (1 << QuintParser.T__24))) !== 0) || _la === QuintParser.DOCCOMMENT) {
				{
				{
				this.state = 102;
				this.documentedDeclaration();
				}
				}
				this.state = 107;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 108;
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
			this.state = 138;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				_localctx = new ConstContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 118;
				this.match(QuintParser.T__3);
				this.state = 119;
				this.qualId();
				this.state = 120;
				this.match(QuintParser.T__4);
				this.state = 121;
				this.type(0);
				}
				break;

			case 2:
				_localctx = new VarContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 123;
				this.match(QuintParser.T__5);
				this.state = 124;
				this.qualId();
				this.state = 125;
				this.match(QuintParser.T__4);
				this.state = 126;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new AssumeContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 128;
				this.match(QuintParser.T__6);
				{
				this.state = 129;
				(_localctx as AssumeContext)._assumeName = this.identOrHole();
				}
				this.state = 130;
				this.match(QuintParser.ASGN);
				this.state = 131;
				this.expr(0);
				}
				break;

			case 4:
				_localctx = new InstanceContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 133;
				this.instanceMod();
				}
				break;

			case 5:
				_localctx = new OperContext(_localctx);
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 134;
				this.operDef();
				}
				break;

			case 6:
				_localctx = new TypeDefsContext(_localctx);
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 135;
				this.typeDef();
				}
				break;

			case 7:
				_localctx = new ImportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 136;
				this.importMod();
				}
				break;

			case 8:
				_localctx = new ExportDefContext(_localctx);
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 137;
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
			this.state = 188;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 14, this._ctx) ) {
			case 1:
				_localctx = new AnnotatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 140;
				this.qualifier();
				this.state = 141;
				this.normalCallName();
				this.state = 142;
				this.match(QuintParser.LPAREN);
				{
				this.state = 143;
				(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
				(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
				this.state = 148;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 144;
					this.match(QuintParser.T__7);
					this.state = 145;
					(_localctx as AnnotatedOperDefContext)._annotatedParameter = this.annotatedParameter();
					(_localctx as AnnotatedOperDefContext)._annotOperParam.push((_localctx as AnnotatedOperDefContext)._annotatedParameter);
					}
					}
					this.state = 150;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 151;
				this.match(QuintParser.RPAREN);
				this.state = 152;
				this.match(QuintParser.T__4);
				this.state = 153;
				this.type(0);
				this.state = 156;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 154;
					this.match(QuintParser.ASGN);
					this.state = 155;
					this.expr(0);
					}
				}

				this.state = 159;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 158;
					this.match(QuintParser.T__8);
					}
				}

				}
				break;

			case 2:
				_localctx = new DeprecatedOperDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 161;
				this.qualifier();
				this.state = 162;
				this.normalCallName();
				this.state = 175;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
				case 1:
					{
					this.state = 163;
					this.match(QuintParser.LPAREN);
					this.state = 172;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (((((_la - 37)) & ~0x1F) === 0 && ((1 << (_la - 37)) & ((1 << (QuintParser.T__36 - 37)) | (1 << (QuintParser.LOW_ID - 37)) | (1 << (QuintParser.CAP_ID - 37)))) !== 0)) {
						{
						this.state = 164;
						(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
						(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
						this.state = 169;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === QuintParser.T__7) {
							{
							{
							this.state = 165;
							this.match(QuintParser.T__7);
							this.state = 166;
							(_localctx as DeprecatedOperDefContext)._parameter = this.parameter();
							(_localctx as DeprecatedOperDefContext)._operParam.push((_localctx as DeprecatedOperDefContext)._parameter);
							}
							}
							this.state = 171;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						}
					}

					this.state = 174;
					this.match(QuintParser.RPAREN);
					}
					break;
				}
				this.state = 179;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__4) {
					{
					this.state = 177;
					this.match(QuintParser.T__4);
					this.state = 178;
					(_localctx as DeprecatedOperDefContext)._annotatedRetType = this.type(0);
					}
				}

				this.state = 183;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.ASGN) {
					{
					this.state = 181;
					this.match(QuintParser.ASGN);
					this.state = 182;
					this.expr(0);
					}
				}

				this.state = 186;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__8) {
					{
					this.state = 185;
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
			this.state = 202;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 15, this._ctx) ) {
			case 1:
				_localctx = new TypeAbstractDefContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 190;
				this.match(QuintParser.T__9);
				this.state = 191;
				this.qualId();
				}
				break;

			case 2:
				_localctx = new TypeAliasDefContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 192;
				this.match(QuintParser.T__9);
				this.state = 193;
				this.typeDefHead();
				this.state = 194;
				this.match(QuintParser.ASGN);
				this.state = 195;
				this.type(0);
				}
				break;

			case 3:
				_localctx = new TypeSumDefContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 197;
				this.match(QuintParser.T__9);
				this.state = 198;
				this.typeDefHead();
				this.state = 199;
				this.match(QuintParser.ASGN);
				this.state = 200;
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
			this.state = 204;
			_localctx._typeName = this.qualId();
			this.state = 216;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__10) {
				{
				this.state = 205;
				this.match(QuintParser.T__10);
				this.state = 206;
				_localctx._typeVar = this.typeVar();
				_localctx._typeVars.push(_localctx._typeVar);
				this.state = 211;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 207;
					this.match(QuintParser.T__7);
					this.state = 208;
					_localctx._typeVar = this.typeVar();
					_localctx._typeVars.push(_localctx._typeVar);
					}
					}
					this.state = 213;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 214;
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
			this.state = 219;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 218;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 221;
			this.typeSumVariant();
			this.state = 226;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 222;
				this.match(QuintParser.T__12);
				this.state = 223;
				this.typeSumVariant();
				}
				}
				this.state = 228;
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
			this.state = 229;
			_localctx._sumLabel = this.simpleId("variant label");
			this.state = 234;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 230;
				this.match(QuintParser.LPAREN);
				this.state = 231;
				this.type(0);
				this.state = 232;
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
	public nondetOperDef(): NondetOperDefContext {
		let _localctx: NondetOperDefContext = new NondetOperDefContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, QuintParser.RULE_nondetOperDef);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 236;
			this.match(QuintParser.T__13);
			this.state = 237;
			this.qualId();
			this.state = 240;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__4) {
				{
				this.state = 238;
				this.match(QuintParser.T__4);
				this.state = 239;
				this.type(0);
				}
			}

			this.state = 242;
			this.match(QuintParser.ASGN);
			this.state = 243;
			this.expr(0);
			this.state = 245;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__8) {
				{
				this.state = 244;
				this.match(QuintParser.T__8);
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
		this.enterRule(_localctx, 20, QuintParser.RULE_qualifier);
		try {
			this.state = 256;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 247;
				this.match(QuintParser.T__14);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 248;
				this.match(QuintParser.T__15);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 249;
				this.match(QuintParser.T__16);
				this.state = 250;
				this.match(QuintParser.T__14);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 251;
				this.match(QuintParser.T__16);
				this.state = 252;
				this.match(QuintParser.T__15);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 253;
				this.match(QuintParser.T__17);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 254;
				this.match(QuintParser.T__18);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 255;
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
		this.enterRule(_localctx, 22, QuintParser.RULE_importMod);
		let _la: number;
		try {
			this.state = 276;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 258;
				this.match(QuintParser.T__20);
				this.state = 259;
				this.name();
				this.state = 260;
				this.match(QuintParser.T__21);
				this.state = 261;
				this.identOrStar();
				this.state = 264;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 262;
					this.match(QuintParser.T__22);
					this.state = 263;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 266;
				this.match(QuintParser.T__20);
				this.state = 267;
				this.name();
				this.state = 270;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__23) {
					{
					this.state = 268;
					this.match(QuintParser.T__23);
					this.state = 269;
					this.name();
					}
				}

				this.state = 274;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 272;
					this.match(QuintParser.T__22);
					this.state = 273;
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
		this.enterRule(_localctx, 24, QuintParser.RULE_exportMod);
		let _la: number;
		try {
			this.state = 289;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 278;
				this.match(QuintParser.T__24);
				this.state = 279;
				this.name();
				this.state = 280;
				this.match(QuintParser.T__21);
				this.state = 281;
				this.identOrStar();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 283;
				this.match(QuintParser.T__24);
				this.state = 284;
				this.name();
				this.state = 287;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__23) {
					{
					this.state = 285;
					this.match(QuintParser.T__23);
					this.state = 286;
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
		this.enterRule(_localctx, 26, QuintParser.RULE_instanceMod);
		let _la: number;
		try {
			this.state = 337;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 291;
				this.match(QuintParser.T__20);
				this.state = 292;
				this.moduleName();
				this.state = 293;
				this.match(QuintParser.LPAREN);
				{
				this.state = 294;
				this.name();
				this.state = 295;
				this.match(QuintParser.ASGN);
				this.state = 296;
				this.expr(0);
				this.state = 304;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 297;
					this.match(QuintParser.T__7);
					this.state = 298;
					this.name();
					this.state = 299;
					this.match(QuintParser.ASGN);
					this.state = 300;
					this.expr(0);
					}
					}
					this.state = 306;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 307;
				this.match(QuintParser.RPAREN);
				this.state = 308;
				this.match(QuintParser.T__21);
				this.state = 309;
				this.match(QuintParser.MUL);
				this.state = 312;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 310;
					this.match(QuintParser.T__22);
					this.state = 311;
					this.fromSource();
					}
				}

				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 314;
				this.match(QuintParser.T__20);
				this.state = 315;
				this.moduleName();
				this.state = 316;
				this.match(QuintParser.LPAREN);
				{
				this.state = 317;
				this.name();
				this.state = 318;
				this.match(QuintParser.ASGN);
				this.state = 319;
				this.expr(0);
				this.state = 327;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 320;
					this.match(QuintParser.T__7);
					this.state = 321;
					this.name();
					this.state = 322;
					this.match(QuintParser.ASGN);
					this.state = 323;
					this.expr(0);
					}
					}
					this.state = 329;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				this.state = 330;
				this.match(QuintParser.RPAREN);
				this.state = 331;
				this.match(QuintParser.T__23);
				this.state = 332;
				this.qualifiedName();
				this.state = 335;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__22) {
					{
					this.state = 333;
					this.match(QuintParser.T__22);
					this.state = 334;
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
		this.enterRule(_localctx, 28, QuintParser.RULE_moduleName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 339;
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
		this.enterRule(_localctx, 30, QuintParser.RULE_name);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 341;
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
		this.enterRule(_localctx, 32, QuintParser.RULE_qualifiedName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 343;
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
		this.enterRule(_localctx, 34, QuintParser.RULE_fromSource);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 345;
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
		let _startState: number = 36;
		this.enterRecursionRule(_localctx, 36, QuintParser.RULE_type, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 405;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				{
				_localctx = new TypeOperContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 348;
				this.match(QuintParser.LPAREN);
				this.state = 357;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__27) | (1 << QuintParser.T__28) | (1 << QuintParser.T__29))) !== 0) || ((((_la - 61)) & ~0x1F) === 0 && ((1 << (_la - 61)) & ((1 << (QuintParser.LPAREN - 61)) | (1 << (QuintParser.SET - 61)) | (1 << (QuintParser.LIST - 61)) | (1 << (QuintParser.LOW_ID - 61)) | (1 << (QuintParser.CAP_ID - 61)))) !== 0)) {
					{
					this.state = 349;
					this.type(0);
					this.state = 354;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 350;
							this.match(QuintParser.T__7);
							this.state = 351;
							this.type(0);
							}
							}
						}
						this.state = 356;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 35, this._ctx);
					}
					}
				}

				this.state = 360;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 359;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 362;
				this.match(QuintParser.RPAREN);
				this.state = 363;
				this.match(QuintParser.T__26);
				this.state = 364;
				this.type(12);
				}
				break;

			case 2:
				{
				_localctx = new TypeSetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 365;
				this.match(QuintParser.SET);
				this.state = 366;
				this.match(QuintParser.T__10);
				this.state = 367;
				this.type(0);
				this.state = 368;
				this.match(QuintParser.T__11);
				}
				break;

			case 3:
				{
				_localctx = new TypeListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 370;
				this.match(QuintParser.LIST);
				this.state = 371;
				this.match(QuintParser.T__10);
				this.state = 372;
				this.type(0);
				this.state = 373;
				this.match(QuintParser.T__11);
				}
				break;

			case 4:
				{
				_localctx = new TypeTupleContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 375;
				this.match(QuintParser.LPAREN);
				this.state = 376;
				this.type(0);
				this.state = 377;
				this.match(QuintParser.T__7);
				this.state = 378;
				this.type(0);
				this.state = 383;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 379;
						this.match(QuintParser.T__7);
						this.state = 380;
						this.type(0);
						}
						}
					}
					this.state = 385;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 38, this._ctx);
				}
				this.state = 387;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 386;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 389;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 5:
				{
				_localctx = new TypeRecContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 391;
				this.match(QuintParser.T__1);
				this.state = 393;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__12 || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 392;
					this.row();
					}
				}

				this.state = 395;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new TypeIntContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 396;
				this.match(QuintParser.T__27);
				}
				break;

			case 7:
				{
				_localctx = new TypeStrContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 397;
				this.match(QuintParser.T__28);
				}
				break;

			case 8:
				{
				_localctx = new TypeBoolContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 398;
				this.match(QuintParser.T__29);
				}
				break;

			case 9:
				{
				_localctx = new TypeVarCaseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 399;
				this.typeVar();
				}
				break;

			case 10:
				{
				_localctx = new TypeConstContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 400;
				this.qualId();
				}
				break;

			case 11:
				{
				_localctx = new TypeParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 401;
				this.match(QuintParser.LPAREN);
				this.state = 402;
				this.type(0);
				this.state = 403;
				this.match(QuintParser.RPAREN);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 427;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 44, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 425;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 43, this._ctx) ) {
					case 1:
						{
						_localctx = new TypeFunContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 407;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 408;
						this.match(QuintParser.T__25);
						this.state = 409;
						this.type(14);
						}
						break;

					case 2:
						{
						_localctx = new TypeOperContext(new TypeContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 410;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 411;
						this.match(QuintParser.T__26);
						this.state = 412;
						this.type(13);
						}
						break;

					case 3:
						{
						_localctx = new TypeAppContext(new TypeContext(_parentctx, _parentState));
						(_localctx as TypeAppContext)._typeCtor = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_type);
						this.state = 413;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						{
						this.state = 414;
						this.match(QuintParser.T__10);
						this.state = 415;
						(_localctx as TypeAppContext)._type = this.type(0);
						(_localctx as TypeAppContext)._typeArg.push((_localctx as TypeAppContext)._type);
						this.state = 420;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						while (_la === QuintParser.T__7) {
							{
							{
							this.state = 416;
							this.match(QuintParser.T__7);
							this.state = 417;
							(_localctx as TypeAppContext)._type = this.type(0);
							(_localctx as TypeAppContext)._typeArg.push((_localctx as TypeAppContext)._type);
							}
							}
							this.state = 422;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
						}
						this.state = 423;
						this.match(QuintParser.T__11);
						}
						}
						break;
					}
					}
				}
				this.state = 429;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 44, this._ctx);
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
		this.enterRule(_localctx, 38, QuintParser.RULE_typeVar);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 430;
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
		this.enterRule(_localctx, 40, QuintParser.RULE_row);
		try {
			let _alt: number;
			this.state = 453;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				{
				this.state = 432;
				this.rowLabel();
				this.state = 433;
				this.match(QuintParser.T__4);
				this.state = 434;
				this.type(0);
				}
				this.state = 443;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 45, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 436;
						this.match(QuintParser.T__7);
						this.state = 437;
						this.rowLabel();
						this.state = 438;
						this.match(QuintParser.T__4);
						this.state = 439;
						this.type(0);
						}
						}
					}
					this.state = 445;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 45, this._ctx);
				}
				this.state = 449;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.T__7:
					{
					this.state = 446;
					this.match(QuintParser.T__7);
					}
					break;
				case QuintParser.T__12:
					{
					this.state = 447;
					this.match(QuintParser.T__12);
					{
					this.state = 448;
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
				this.state = 451;
				this.match(QuintParser.T__12);
				{
				this.state = 452;
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
		this.enterRule(_localctx, 42, QuintParser.RULE_rowLabel);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 455;
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
		let _startState: number = 44;
		this.enterRecursionRule(_localctx, 44, QuintParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 607;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 65, this._ctx) ) {
			case 1:
				{
				_localctx = new LambdaConsContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 458;
				this.lambda();
				}
				break;

			case 2:
				{
				_localctx = new OperAppContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 459;
				this.normalCallName();
				this.state = 460;
				this.match(QuintParser.LPAREN);
				this.state = 462;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 461;
					this.argList();
					}
				}

				this.state = 464;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 3:
				{
				_localctx = new UminusContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 466;
				this.match(QuintParser.MINUS);
				this.state = 467;
				this.expr(25);
				}
				break;

			case 4:
				{
				_localctx = new AsgnContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 468;
				this.qualId();
				this.state = 469;
				this.match(QuintParser.T__31);
				this.state = 470;
				this.match(QuintParser.ASGN);
				this.state = 471;
				this.expr(21);
				}
				break;

			case 5:
				{
				_localctx = new AndExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 473;
				this.match(QuintParser.AND);
				this.state = 474;
				this.match(QuintParser.T__1);
				this.state = 475;
				this.expr(0);
				this.state = 480;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 49, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 476;
						this.match(QuintParser.T__7);
						this.state = 477;
						this.expr(0);
						}
						}
					}
					this.state = 482;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 49, this._ctx);
				}
				this.state = 484;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 483;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 486;
				this.match(QuintParser.T__2);
				}
				break;

			case 6:
				{
				_localctx = new OrExprContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 488;
				this.match(QuintParser.OR);
				this.state = 489;
				this.match(QuintParser.T__1);
				this.state = 490;
				this.expr(0);
				this.state = 495;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 51, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 491;
						this.match(QuintParser.T__7);
						this.state = 492;
						this.expr(0);
						}
						}
					}
					this.state = 497;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 51, this._ctx);
				}
				this.state = 499;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 498;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 501;
				this.match(QuintParser.T__2);
				}
				break;

			case 7:
				{
				_localctx = new MatchContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 503;
				this.matchSumExpr();
				}
				break;

			case 8:
				{
				_localctx = new ActionAllContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 504;
				this.match(QuintParser.T__32);
				this.state = 505;
				this.match(QuintParser.T__1);
				this.state = 506;
				this.expr(0);
				this.state = 511;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 507;
						this.match(QuintParser.T__7);
						this.state = 508;
						this.expr(0);
						}
						}
					}
					this.state = 513;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 53, this._ctx);
				}
				this.state = 515;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 514;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 517;
				this.match(QuintParser.T__2);
				}
				break;

			case 9:
				{
				_localctx = new ActionAnyContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 519;
				this.match(QuintParser.T__33);
				this.state = 520;
				this.match(QuintParser.T__1);
				this.state = 521;
				this.expr(0);
				this.state = 526;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 522;
						this.match(QuintParser.T__7);
						this.state = 523;
						this.expr(0);
						}
						}
					}
					this.state = 528;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 55, this._ctx);
				}
				this.state = 530;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 529;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 532;
				this.match(QuintParser.T__2);
				}
				break;

			case 10:
				{
				_localctx = new LiteralOrIdContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 538;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 534;
					this.qualId();
					}
					break;
				case QuintParser.INT:
					{
					this.state = 535;
					this.match(QuintParser.INT);
					}
					break;
				case QuintParser.BOOL:
					{
					this.state = 536;
					this.match(QuintParser.BOOL);
					}
					break;
				case QuintParser.STRING:
					{
					this.state = 537;
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
				this.state = 540;
				this.match(QuintParser.LPAREN);
				this.state = 541;
				this.expr(0);
				this.state = 542;
				this.match(QuintParser.T__7);
				this.state = 543;
				this.expr(0);
				this.state = 548;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 544;
						this.match(QuintParser.T__7);
						this.state = 545;
						this.expr(0);
						}
						}
					}
					this.state = 550;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 58, this._ctx);
				}
				this.state = 552;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 551;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 554;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 12:
				{
				_localctx = new RecordContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 556;
				this.match(QuintParser.T__1);
				this.state = 557;
				this.recElem();
				this.state = 562;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 60, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 558;
						this.match(QuintParser.T__7);
						this.state = 559;
						this.recElem();
						}
						}
					}
					this.state = 564;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 60, this._ctx);
				}
				this.state = 566;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 565;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 568;
				this.match(QuintParser.T__2);
				}
				break;

			case 13:
				{
				_localctx = new ListContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 570;
				this.match(QuintParser.T__10);
				this.state = 579;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
					{
					this.state = 571;
					this.expr(0);
					this.state = 576;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 572;
							this.match(QuintParser.T__7);
							this.state = 573;
							this.expr(0);
							}
							}
						}
						this.state = 578;
						this._errHandler.sync(this);
						_alt = this.interpreter.adaptivePredict(this._input, 62, this._ctx);
					}
					}
				}

				this.state = 582;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === QuintParser.T__7) {
					{
					this.state = 581;
					this.match(QuintParser.T__7);
					}
				}

				this.state = 584;
				this.match(QuintParser.T__11);
				}
				break;

			case 14:
				{
				_localctx = new IfElseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 585;
				this.match(QuintParser.T__34);
				this.state = 586;
				this.match(QuintParser.LPAREN);
				this.state = 587;
				this.expr(0);
				this.state = 588;
				this.match(QuintParser.RPAREN);
				this.state = 589;
				this.expr(0);
				this.state = 590;
				this.match(QuintParser.T__35);
				this.state = 591;
				this.expr(5);
				}
				break;

			case 15:
				{
				_localctx = new LetInContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 593;
				this.operDef();
				this.state = 594;
				this.expr(4);
				}
				break;

			case 16:
				{
				_localctx = new NondetContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 596;
				this.nondetOperDef();
				this.state = 597;
				this.expr(3);
				}
				break;

			case 17:
				{
				_localctx = new ParenContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 599;
				this.match(QuintParser.LPAREN);
				this.state = 600;
				this.expr(0);
				this.state = 601;
				this.match(QuintParser.RPAREN);
				}
				break;

			case 18:
				{
				_localctx = new BracesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 603;
				this.match(QuintParser.T__1);
				this.state = 604;
				this.expr(0);
				this.state = 605;
				this.match(QuintParser.T__2);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 658;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 69, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 656;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 68, this._ctx) ) {
					case 1:
						{
						_localctx = new PowContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 609;
						if (!(this.precpred(this._ctx, 26))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 26)");
						}
						this.state = 610;
						(_localctx as PowContext)._op = this.match(QuintParser.T__30);
						this.state = 611;
						this.expr(26);
						}
						break;

					case 2:
						{
						_localctx = new MultDivContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 612;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 613;
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
						this.state = 614;
						this.expr(25);
						}
						break;

					case 3:
						{
						_localctx = new PlusMinusContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 615;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 616;
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
						this.state = 617;
						this.expr(24);
						}
						break;

					case 4:
						{
						_localctx = new RelationsContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 618;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 619;
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
						this.state = 620;
						this.expr(23);
						}
						break;

					case 5:
						{
						_localctx = new ErrorEqContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 621;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 622;
						this.match(QuintParser.ASGN);
						this.state = 623;
						this.expr(21);

						                            const m = "[QNT006] unexpected '=', did you mean '=='?"
						                            this.notifyErrorListeners(m)
						                          
						}
						break;

					case 6:
						{
						_localctx = new AndContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 626;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 627;
						this.match(QuintParser.AND);
						this.state = 628;
						this.expr(19);
						}
						break;

					case 7:
						{
						_localctx = new OrContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 629;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 630;
						this.match(QuintParser.OR);
						this.state = 631;
						this.expr(17);
						}
						break;

					case 8:
						{
						_localctx = new IffContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 632;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 633;
						this.match(QuintParser.IFF);
						this.state = 634;
						this.expr(16);
						}
						break;

					case 9:
						{
						_localctx = new ImpliesContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 635;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 636;
						this.match(QuintParser.IMPLIES);
						this.state = 637;
						this.expr(15);
						}
						break;

					case 10:
						{
						_localctx = new PairContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 638;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 639;
						this.match(QuintParser.T__25);
						this.state = 640;
						this.expr(9);
						}
						break;

					case 11:
						{
						_localctx = new DotCallContext(new ExprContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, QuintParser.RULE_expr);
						this.state = 641;
						if (!(this.precpred(this._ctx, 30))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 30)");
						}
						this.state = 642;
						this.match(QuintParser.T__21);
						this.state = 643;
						this.nameAfterDot();
						this.state = 649;
						this._errHandler.sync(this);
						switch ( this.interpreter.adaptivePredict(this._input, 67, this._ctx) ) {
						case 1:
							{
							this.state = 644;
							this.match(QuintParser.LPAREN);
							this.state = 646;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << QuintParser.T__1) | (1 << QuintParser.T__10) | (1 << QuintParser.T__13) | (1 << QuintParser.T__14) | (1 << QuintParser.T__15) | (1 << QuintParser.T__16) | (1 << QuintParser.T__17) | (1 << QuintParser.T__18) | (1 << QuintParser.T__19))) !== 0) || ((((_la - 33)) & ~0x1F) === 0 && ((1 << (_la - 33)) & ((1 << (QuintParser.T__32 - 33)) | (1 << (QuintParser.T__33 - 33)) | (1 << (QuintParser.T__34 - 33)) | (1 << (QuintParser.T__36 - 33)) | (1 << (QuintParser.STRING - 33)) | (1 << (QuintParser.BOOL - 33)) | (1 << (QuintParser.INT - 33)) | (1 << (QuintParser.AND - 33)) | (1 << (QuintParser.OR - 33)) | (1 << (QuintParser.IFF - 33)) | (1 << (QuintParser.IMPLIES - 33)) | (1 << (QuintParser.MAP - 33)) | (1 << (QuintParser.MATCH - 33)) | (1 << (QuintParser.MINUS - 33)) | (1 << (QuintParser.LPAREN - 33)) | (1 << (QuintParser.SET - 33)) | (1 << (QuintParser.LIST - 33)))) !== 0) || _la === QuintParser.LOW_ID || _la === QuintParser.CAP_ID) {
								{
								this.state = 645;
								this.argList();
								}
							}

							this.state = 648;
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
						this.state = 651;
						if (!(this.precpred(this._ctx, 27))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 27)");
						}
						this.state = 652;
						this.match(QuintParser.T__10);
						this.state = 653;
						this.expr(0);
						this.state = 654;
						this.match(QuintParser.T__11);
						}
						break;
					}
					}
				}
				this.state = 660;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 69, this._ctx);
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
		this.enterRule(_localctx, 46, QuintParser.RULE_matchSumExpr);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 661;
			this.match(QuintParser.MATCH);
			this.state = 662;
			this.expr(0);
			this.state = 663;
			this.match(QuintParser.T__1);
			this.state = 665;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.T__12) {
				{
				this.state = 664;
				this.match(QuintParser.T__12);
				}
			}

			this.state = 667;
			_localctx._matchSumCase = this.matchSumCase();
			_localctx._matchCase.push(_localctx._matchSumCase);
			this.state = 672;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__12) {
				{
				{
				this.state = 668;
				this.match(QuintParser.T__12);
				this.state = 669;
				_localctx._matchSumCase = this.matchSumCase();
				_localctx._matchCase.push(_localctx._matchSumCase);
				}
				}
				this.state = 674;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 675;
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
		this.enterRule(_localctx, 48, QuintParser.RULE_matchSumCase);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 679;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				{
				this.state = 677;
				_localctx._variantMatch = this.matchSumVariant();
				}
				break;
			case QuintParser.T__36:
				{
				this.state = 678;
				_localctx._wildCardMatch = this.match(QuintParser.T__36);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 681;
			this.match(QuintParser.T__26);
			this.state = 682;
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
		this.enterRule(_localctx, 50, QuintParser.RULE_matchSumVariant);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 684;
			_localctx._variantLabel = this.simpleId("variant label");
			}
			this.state = 691;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === QuintParser.LPAREN) {
				{
				this.state = 685;
				this.match(QuintParser.LPAREN);
				this.state = 688;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case QuintParser.LOW_ID:
				case QuintParser.CAP_ID:
					{
					this.state = 686;
					_localctx._variantParam = this.simpleId("match case parameter");
					}
					break;
				case QuintParser.T__36:
					{
					this.state = 687;
					this.match(QuintParser.T__36);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 690;
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
		this.enterRule(_localctx, 52, QuintParser.RULE_declarationOrExpr);
		try {
			this.state = 702;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 75, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 693;
				this.declaration();
				this.state = 694;
				this.match(QuintParser.EOF);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 696;
				this.expr(0);
				this.state = 697;
				this.match(QuintParser.EOF);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 699;
				this.match(QuintParser.DOCCOMMENT);
				this.state = 700;
				this.match(QuintParser.EOF);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 701;
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
		this.enterRule(_localctx, 54, QuintParser.RULE_lambda);
		try {
			this.state = 706;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 76, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 704;
				this.lambdaUnsugared();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 705;
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
		this.enterRule(_localctx, 56, QuintParser.RULE_lambdaUnsugared);
		let _la: number;
		try {
			this.state = 725;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__36:
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 708;
				this.parameter();
				this.state = 709;
				this.match(QuintParser.T__26);
				this.state = 710;
				this.expr(0);
				}
				break;
			case QuintParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 712;
				this.match(QuintParser.LPAREN);
				this.state = 713;
				this.parameter();
				this.state = 718;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === QuintParser.T__7) {
					{
					{
					this.state = 714;
					this.match(QuintParser.T__7);
					this.state = 715;
					this.parameter();
					}
					}
					this.state = 720;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 721;
				this.match(QuintParser.RPAREN);
				this.state = 722;
				this.match(QuintParser.T__26);
				this.state = 723;
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
		this.enterRule(_localctx, 58, QuintParser.RULE_lambdaTupleSugar);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 727;
			this.match(QuintParser.LPAREN);
			this.state = 728;
			this.match(QuintParser.LPAREN);
			this.state = 729;
			this.parameter();
			this.state = 732;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 730;
				this.match(QuintParser.T__7);
				this.state = 731;
				this.parameter();
				}
				}
				this.state = 734;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la === QuintParser.T__7);
			this.state = 736;
			this.match(QuintParser.RPAREN);
			this.state = 737;
			this.match(QuintParser.RPAREN);
			this.state = 738;
			this.match(QuintParser.T__26);
			this.state = 739;
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
		this.enterRule(_localctx, 60, QuintParser.RULE_identOrHole);
		try {
			this.state = 743;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.T__36:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 741;
				this.match(QuintParser.T__36);
				}
				break;
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 742;
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
		this.enterRule(_localctx, 62, QuintParser.RULE_parameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 745;
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
		this.enterRule(_localctx, 64, QuintParser.RULE_annotatedParameter);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 747;
			_localctx._paramName = this.identOrHole();
			this.state = 748;
			this.match(QuintParser.T__4);
			this.state = 749;
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
		this.enterRule(_localctx, 66, QuintParser.RULE_identOrStar);
		try {
			this.state = 753;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.MUL:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 751;
				this.match(QuintParser.MUL);
				}
				break;
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 752;
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
		this.enterRule(_localctx, 68, QuintParser.RULE_argList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 755;
			this.expr(0);
			this.state = 760;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === QuintParser.T__7) {
				{
				{
				this.state = 756;
				this.match(QuintParser.T__7);
				this.state = 757;
				this.expr(0);
				}
				}
				this.state = 762;
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
	public recElem(): RecElemContext {
		let _localctx: RecElemContext = new RecElemContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, QuintParser.RULE_recElem);
		try {
			this.state = 769;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 763;
				this.simpleId("record");
				this.state = 764;
				this.match(QuintParser.T__4);
				this.state = 765;
				this.expr(0);
				}
				break;
			case QuintParser.T__37:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 767;
				this.match(QuintParser.T__37);
				this.state = 768;
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
		this.enterRule(_localctx, 72, QuintParser.RULE_normalCallName);
		let _la: number;
		try {
			this.state = 773;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 771;
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
				this.state = 772;
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
		this.enterRule(_localctx, 74, QuintParser.RULE_nameAfterDot);
		let _la: number;
		try {
			this.state = 777;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case QuintParser.LOW_ID:
			case QuintParser.CAP_ID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 775;
				this.qualId();
				}
				break;
			case QuintParser.AND:
			case QuintParser.OR:
			case QuintParser.IFF:
			case QuintParser.IMPLIES:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 776;
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
		this.enterRule(_localctx, 76, QuintParser.RULE_operator);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 779;
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
		this.enterRule(_localctx, 78, QuintParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 781;
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
		this.enterRule(_localctx, 80, QuintParser.RULE_qualId);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 783;
			this.identifier();
			this.state = 788;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 86, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 784;
					this.match(QuintParser.T__38);
					this.state = 785;
					this.identifier();
					}
					}
				}
				this.state = 790;
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
	public simpleId(context: string): SimpleIdContext {
		let _localctx: SimpleIdContext = new SimpleIdContext(this._ctx, this.state, context);
		this.enterRule(_localctx, 82, QuintParser.RULE_simpleId);
		try {
			this.state = 795;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 87, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 791;
				this.identifier();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 792;
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
		this.enterRule(_localctx, 84, QuintParser.RULE_identifier);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 797;
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
		case 18:
			return this.type_sempred(_localctx as TypeContext, predIndex);

		case 22:
			return this.expr_sempred(_localctx as ExprContext, predIndex);
		}
		return true;
	}
	private type_sempred(_localctx: TypeContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 14);

		case 1:
			return this.precpred(this._ctx, 13);

		case 2:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}
	private expr_sempred(_localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.precpred(this._ctx, 26);

		case 4:
			return this.precpred(this._ctx, 24);

		case 5:
			return this.precpred(this._ctx, 23);

		case 6:
			return this.precpred(this._ctx, 22);

		case 7:
			return this.precpred(this._ctx, 20);

		case 8:
			return this.precpred(this._ctx, 18);

		case 9:
			return this.precpred(this._ctx, 16);

		case 10:
			return this.precpred(this._ctx, 15);

		case 11:
			return this.precpred(this._ctx, 14);

		case 12:
			return this.precpred(this._ctx, 8);

		case 13:
			return this.precpred(this._ctx, 30);

		case 14:
			return this.precpred(this._ctx, 27);
		}
		return true;
	}

	private static readonly _serializedATNSegments: number = 2;
	private static readonly _serializedATNSegment0: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03H\u0322\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x03\x02\x06\x02Z\n\x02\r\x02\x0E\x02[\x03\x02\x03\x02\x03\x03" +
		"\x07\x03a\n\x03\f\x03\x0E\x03d\v\x03\x03\x03\x03\x03\x03\x03\x03\x03\x07" +
		"\x03j\n\x03\f\x03\x0E\x03m\v\x03\x03\x03\x03\x03\x03\x04\x07\x04r\n\x04" +
		"\f\x04\x0E\x04u\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05\x8D\n" +
		"\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06\x95\n\x06" +
		"\f\x06\x0E\x06\x98\v\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x05\x06" +
		"\x9F\n\x06\x03\x06\x05\x06\xA2\n\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x03\x06\x07\x06\xAA\n\x06\f\x06\x0E\x06\xAD\v\x06\x05\x06\xAF\n\x06" +
		"\x03\x06\x05\x06\xB2\n\x06\x03\x06\x03\x06\x05\x06\xB6\n\x06\x03\x06\x03" +
		"\x06\x05\x06\xBA\n\x06\x03\x06\x05\x06\xBD\n\x06\x05\x06\xBF\n\x06\x03" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x05\x07\xCD\n\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x07" +
		"\b\xD4\n\b\f\b\x0E\b\xD7\v\b\x03\b\x03\b\x05\b\xDB\n\b\x03\t\x05\t\xDE" +
		"\n\t\x03\t\x03\t\x03\t\x07\t\xE3\n\t\f\t\x0E\t\xE6\v\t\x03\n\x03\n\x03" +
		"\n\x03\n\x03\n\x05\n\xED\n\n\x03\v\x03\v\x03\v\x03\v\x05\v\xF3\n\v\x03" +
		"\v\x03\v\x03\v\x05\v\xF8\n\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f" +
		"\x03\f\x03\f\x05\f\u0103\n\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x05\r" +
		"\u010B\n\r\x03\r\x03\r\x03\r\x03\r\x05\r\u0111\n\r\x03\r\x03\r\x05\r\u0115" +
		"\n\r\x05\r\u0117\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
		"\x0E\x03\x0E\x03\x0E\x05\x0E\u0122\n\x0E\x05\x0E\u0124\n\x0E\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x07\x0F\u0131\n\x0F\f\x0F\x0E\x0F\u0134\v\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x03\x0F\x03\x0F\x05\x0F\u013B\n\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x07\x0F\u0148" +
		"\n\x0F\f\x0F\x0E\x0F\u014B\v\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F\x03\x0F" +
		"\x05\x0F\u0152\n\x0F\x05\x0F\u0154\n\x0F\x03\x10\x03\x10\x03\x11\x03\x11" +
		"\x03\x12\x03\x12\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x07\x14\u0163\n\x14\f\x14\x0E\x14\u0166\v\x14\x05\x14\u0168\n\x14\x03" +
		"\x14\x05\x14\u016B\n\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x03\x14\x03\x14\x03\x14\x03\x14\x07\x14\u0180\n\x14\f\x14\x0E\x14\u0183" +
		"\v\x14\x03\x14\x05\x14\u0186\n\x14\x03\x14\x03\x14\x03\x14\x03\x14\x05" +
		"\x14\u018C\n\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x03\x14\x03\x14\x03\x14\x05\x14\u0198\n\x14\x03\x14\x03\x14\x03\x14\x03" +
		"\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x07\x14\u01A5" +
		"\n\x14\f\x14\x0E\x14\u01A8\v\x14\x03\x14\x03\x14\x07\x14\u01AC\n\x14\f" +
		"\x14\x0E\x14\u01AF\v\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16" +
		"\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x07\x16\u01BC\n\x16\f\x16\x0E" +
		"\x16\u01BF\v\x16\x03\x16\x03\x16\x03\x16\x05\x16\u01C4\n\x16\x03\x16\x03" +
		"\x16\x05\x16\u01C8\n\x16\x03\x17\x03\x17\x03\x18\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x05\x18\u01D1\n\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07" +
		"\x18\u01E1\n\x18\f\x18\x0E\x18\u01E4\v\x18\x03\x18\x05\x18\u01E7\n\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07\x18\u01F0" +
		"\n\x18\f\x18\x0E\x18\u01F3\v\x18\x03\x18\x05\x18\u01F6\n\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07\x18\u0200\n\x18" +
		"\f\x18\x0E\x18\u0203\v\x18\x03\x18\x05\x18\u0206\n\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07\x18\u020F\n\x18\f\x18\x0E" +
		"\x18\u0212\v\x18\x03\x18\x05\x18\u0215\n\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x05\x18\u021D\n\x18\x03\x18\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x07\x18\u0225\n\x18\f\x18\x0E\x18\u0228\v\x18\x03\x18" +
		"\x05\x18\u022B\n\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07" +
		"\x18\u0233\n\x18\f\x18\x0E\x18\u0236\v\x18\x03\x18\x05\x18\u0239\n\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07\x18\u0241\n\x18\f" +
		"\x18\x0E\x18\u0244\v\x18\x05\x18\u0246\n\x18\x03\x18\x05\x18\u0249\n\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18" +
		"\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x05\x18\u0262\n\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x05" +
		"\x18\u0289\n\x18\x03\x18\x05\x18\u028C\n\x18\x03\x18\x03\x18\x03\x18\x03" +
		"\x18\x03\x18\x07\x18\u0293\n\x18\f\x18\x0E\x18\u0296\v\x18\x03\x19\x03" +
		"\x19\x03\x19\x03\x19\x05\x19\u029C\n\x19\x03\x19\x03\x19\x03\x19\x07\x19" +
		"\u02A1\n\x19\f\x19\x0E\x19\u02A4\v\x19\x03\x19\x03\x19\x03\x1A\x03\x1A" +
		"\x05\x1A\u02AA\n\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03" +
		"\x1B\x05\x1B\u02B3\n\x1B\x03\x1B\x05\x1B\u02B6\n\x1B\x03\x1C\x03\x1C\x03" +
		"\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x05\x1C\u02C1\n\x1C" +
		"\x03\x1D\x03\x1D\x05\x1D\u02C5\n\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03" +
		"\x1E\x03\x1E\x03\x1E\x03\x1E\x07\x1E\u02CF\n\x1E\f\x1E\x0E\x1E\u02D2\v" +
		"\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x05\x1E\u02D8\n\x1E\x03\x1F\x03\x1F" +
		"\x03\x1F\x03\x1F\x03\x1F\x06\x1F\u02DF\n\x1F\r\x1F\x0E\x1F\u02E0\x03\x1F" +
		"\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03 \x03 \x05 \u02EA\n \x03!\x03!\x03" +
		"\"\x03\"\x03\"\x03\"\x03#\x03#\x05#\u02F4\n#\x03$\x03$\x03$\x07$\u02F9" +
		"\n$\f$\x0E$\u02FC\v$\x03%\x03%\x03%\x03%\x03%\x03%\x05%\u0304\n%\x03&" +
		"\x03&\x05&\u0308\n&\x03\'\x03\'\x05\'\u030C\n\'\x03(\x03(\x03)\x03)\x03" +
		"*\x03*\x03*\x07*\u0315\n*\f*\x0E*\u0318\v*\x03+\x03+\x03+\x03+\x05+\u031E" +
		"\n+\x03,\x03,\x03,\x02\x02\x04&.-\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02" +
		"\x1E\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x02" +
		"8\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02" +
		"T\x02V\x02\x02\n\x03\x0257\x03\x0234\x03\x028=\x04\x02-1AB\x03\x02-0\x05" +
		"\x02!!-03=\x03\x02*,\x03\x02CD\x02\u0383\x02Y\x03\x02\x02\x02\x04b\x03" +
		"\x02\x02\x02\x06s\x03\x02\x02\x02\b\x8C\x03\x02\x02\x02\n\xBE\x03\x02" +
		"\x02\x02\f\xCC\x03\x02\x02\x02\x0E\xCE\x03\x02\x02\x02\x10\xDD\x03\x02" +
		"\x02\x02\x12\xE7\x03\x02\x02\x02\x14\xEE\x03\x02\x02\x02\x16\u0102\x03" +
		"\x02\x02\x02\x18\u0116\x03\x02\x02\x02\x1A\u0123\x03\x02\x02\x02\x1C\u0153" +
		"\x03\x02\x02\x02\x1E\u0155\x03\x02\x02\x02 \u0157\x03\x02\x02\x02\"\u0159" +
		"\x03\x02\x02\x02$\u015B\x03\x02\x02\x02&\u0197\x03\x02\x02\x02(\u01B0" +
		"\x03\x02\x02\x02*\u01C7\x03\x02\x02\x02,\u01C9\x03\x02\x02\x02.\u0261" +
		"\x03\x02\x02\x020\u0297\x03\x02\x02\x022\u02A9\x03\x02\x02\x024\u02AE" +
		"\x03\x02\x02\x026\u02C0\x03\x02\x02\x028\u02C4\x03\x02\x02\x02:\u02D7" +
		"\x03\x02\x02\x02<\u02D9\x03\x02\x02\x02>\u02E9\x03\x02\x02\x02@\u02EB" +
		"\x03\x02\x02\x02B\u02ED\x03\x02\x02\x02D\u02F3\x03\x02\x02\x02F\u02F5" +
		"\x03\x02\x02\x02H\u0303\x03\x02\x02\x02J\u0307\x03\x02\x02\x02L\u030B" +
		"\x03\x02\x02\x02N\u030D\x03\x02\x02\x02P\u030F\x03\x02\x02\x02R\u0311" +
		"\x03\x02\x02\x02T\u031D\x03\x02\x02\x02V\u031F\x03\x02\x02\x02XZ\x05\x04" +
		"\x03\x02YX\x03\x02\x02\x02Z[\x03\x02\x02\x02[Y\x03\x02\x02\x02[\\\x03" +
		"\x02\x02\x02\\]\x03\x02\x02\x02]^\x07\x02\x02\x03^\x03\x03\x02\x02\x02" +
		"_a\x07E\x02\x02`_\x03\x02\x02\x02ad\x03\x02\x02\x02b`\x03\x02\x02\x02" +
		"bc\x03\x02\x02\x02ce\x03\x02\x02\x02db\x03\x02\x02\x02ef\x07\x03\x02\x02" +
		"fg\x05R*\x02gk\x07\x04\x02\x02hj\x05\x06\x04\x02ih\x03\x02\x02\x02jm\x03" +
		"\x02\x02\x02ki\x03\x02\x02\x02kl\x03\x02\x02\x02ln\x03\x02\x02\x02mk\x03" +
		"\x02\x02\x02no\x07\x05\x02\x02o\x05\x03\x02\x02\x02pr\x07E\x02\x02qp\x03" +
		"\x02\x02\x02ru\x03\x02\x02\x02sq\x03\x02\x02\x02st\x03\x02\x02\x02tv\x03" +
		"\x02\x02\x02us\x03\x02\x02\x02vw\x05\b\x05\x02w\x07\x03\x02\x02\x02xy" +
		"\x07\x06\x02\x02yz\x05R*\x02z{\x07\x07\x02\x02{|\x05&\x14\x02|\x8D\x03" +
		"\x02\x02\x02}~\x07\b\x02\x02~\x7F\x05R*\x02\x7F\x80\x07\x07\x02\x02\x80" +
		"\x81\x05&\x14\x02\x81\x8D\x03\x02\x02\x02\x82\x83\x07\t\x02\x02\x83\x84" +
		"\x05> \x02\x84\x85\x07>\x02\x02\x85\x86\x05.\x18\x02\x86\x8D\x03\x02\x02" +
		"\x02\x87\x8D\x05\x1C\x0F\x02\x88\x8D\x05\n\x06\x02\x89\x8D\x05\f\x07\x02" +
		"\x8A\x8D\x05\x18\r\x02\x8B\x8D\x05\x1A\x0E\x02\x8Cx\x03\x02\x02\x02\x8C" +
		"}\x03\x02\x02\x02\x8C\x82\x03\x02\x02\x02\x8C\x87\x03\x02\x02\x02\x8C" +
		"\x88\x03\x02\x02\x02\x8C\x89\x03\x02\x02\x02\x8C\x8A\x03\x02\x02\x02\x8C" +
		"\x8B\x03\x02\x02\x02\x8D\t\x03\x02\x02\x02\x8E\x8F\x05\x16\f\x02\x8F\x90" +
		"\x05J&\x02\x90\x91\x07?\x02\x02\x91\x96\x05B\"\x02\x92\x93\x07\n\x02\x02" +
		"\x93\x95\x05B\"\x02\x94\x92\x03\x02\x02\x02\x95\x98\x03\x02\x02\x02\x96" +
		"\x94\x03\x02\x02\x02\x96\x97\x03\x02\x02\x02\x97\x99\x03\x02\x02\x02\x98" +
		"\x96\x03\x02\x02\x02\x99\x9A\x07@\x02\x02\x9A\x9B\x07\x07\x02\x02\x9B" +
		"\x9E\x05&\x14\x02\x9C\x9D\x07>\x02\x02\x9D\x9F\x05.\x18\x02\x9E\x9C\x03" +
		"\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F\xA1\x03\x02\x02\x02\xA0\xA2\x07" +
		"\v\x02\x02\xA1\xA0\x03\x02\x02\x02\xA1\xA2\x03\x02\x02\x02\xA2\xBF\x03" +
		"\x02\x02\x02\xA3\xA4\x05\x16\f\x02\xA4\xB1\x05J&\x02\xA5\xAE\x07?\x02" +
		"\x02\xA6\xAB\x05@!\x02\xA7\xA8\x07\n\x02\x02\xA8\xAA\x05@!\x02\xA9\xA7" +
		"\x03\x02\x02\x02\xAA\xAD\x03\x02\x02\x02\xAB\xA9\x03\x02\x02\x02\xAB\xAC" +
		"\x03\x02\x02\x02\xAC\xAF\x03\x02\x02\x02\xAD\xAB\x03\x02\x02\x02\xAE\xA6" +
		"\x03\x02\x02\x02\xAE\xAF\x03\x02\x02\x02\xAF\xB0\x03\x02\x02\x02\xB0\xB2" +
		"\x07@\x02\x02\xB1\xA5\x03\x02\x02\x02\xB1\xB2\x03\x02\x02\x02\xB2\xB5" +
		"\x03\x02\x02\x02\xB3\xB4\x07\x07\x02\x02\xB4\xB6\x05&\x14\x02\xB5\xB3" +
		"\x03\x02\x02\x02\xB5\xB6\x03\x02\x02\x02\xB6\xB9\x03\x02\x02\x02\xB7\xB8" +
		"\x07>\x02\x02\xB8\xBA\x05.\x18\x02\xB9\xB7\x03\x02\x02\x02\xB9\xBA\x03" +
		"\x02\x02\x02\xBA\xBC\x03\x02\x02\x02\xBB\xBD\x07\v\x02\x02\xBC\xBB\x03" +
		"\x02\x02\x02\xBC\xBD\x03\x02\x02\x02\xBD\xBF\x03\x02\x02\x02\xBE\x8E\x03" +
		"\x02\x02\x02\xBE\xA3\x03\x02\x02\x02\xBF\v\x03\x02\x02\x02\xC0\xC1\x07" +
		"\f\x02\x02\xC1\xCD\x05R*\x02\xC2\xC3\x07\f\x02\x02\xC3\xC4\x05\x0E\b\x02" +
		"\xC4\xC5\x07>\x02\x02\xC5\xC6\x05&\x14\x02\xC6\xCD\x03\x02\x02\x02\xC7" +
		"\xC8\x07\f\x02\x02\xC8\xC9\x05\x0E\b\x02\xC9\xCA\x07>\x02\x02\xCA\xCB" +
		"\x05\x10\t\x02\xCB\xCD\x03\x02\x02\x02\xCC\xC0\x03\x02\x02\x02\xCC\xC2" +
		"\x03\x02\x02\x02\xCC\xC7\x03\x02\x02\x02\xCD\r\x03\x02\x02\x02\xCE\xDA" +
		"\x05R*\x02\xCF\xD0\x07\r\x02\x02\xD0\xD5\x05(\x15\x02\xD1\xD2\x07\n\x02" +
		"\x02\xD2\xD4\x05(\x15\x02\xD3\xD1\x03\x02\x02\x02\xD4\xD7\x03\x02\x02" +
		"\x02\xD5\xD3\x03\x02\x02\x02\xD5\xD6\x03\x02\x02\x02\xD6\xD8\x03\x02\x02" +
		"\x02\xD7\xD5\x03\x02\x02\x02\xD8\xD9\x07\x0E\x02\x02\xD9\xDB\x03\x02\x02" +
		"\x02\xDA\xCF\x03\x02\x02\x02\xDA\xDB\x03\x02\x02\x02\xDB\x0F\x03\x02\x02" +
		"\x02\xDC\xDE\x07\x0F\x02\x02\xDD\xDC\x03\x02\x02\x02\xDD\xDE\x03\x02\x02" +
		"\x02\xDE\xDF\x03\x02\x02\x02\xDF\xE4\x05\x12\n\x02\xE0\xE1\x07\x0F\x02" +
		"\x02\xE1\xE3\x05\x12\n\x02\xE2\xE0\x03\x02\x02\x02\xE3\xE6\x03\x02\x02" +
		"\x02\xE4\xE2\x03\x02\x02\x02\xE4\xE5\x03\x02\x02\x02\xE5\x11\x03\x02\x02" +
		"\x02\xE6\xE4\x03\x02\x02\x02\xE7\xEC\x05T+\x02\xE8\xE9\x07?\x02\x02\xE9" +
		"\xEA\x05&\x14\x02\xEA\xEB\x07@\x02\x02\xEB\xED\x03\x02\x02\x02\xEC\xE8" +
		"\x03\x02\x02\x02\xEC\xED\x03\x02\x02\x02\xED\x13\x03\x02\x02\x02\xEE\xEF" +
		"\x07\x10\x02\x02\xEF\xF2\x05R*\x02\xF0\xF1\x07\x07\x02\x02\xF1\xF3\x05" +
		"&\x14\x02\xF2\xF0\x03\x02\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3\xF4\x03" +
		"\x02\x02\x02\xF4\xF5\x07>\x02\x02\xF5\xF7\x05.\x18\x02\xF6\xF8\x07\v\x02" +
		"\x02\xF7\xF6\x03\x02\x02\x02\xF7\xF8\x03\x02\x02\x02\xF8\x15\x03\x02\x02" +
		"\x02\xF9\u0103\x07\x11\x02\x02\xFA\u0103\x07\x12\x02\x02\xFB\xFC\x07\x13" +
		"\x02\x02\xFC\u0103\x07\x11\x02\x02\xFD\xFE\x07\x13\x02\x02\xFE\u0103\x07" +
		"\x12\x02\x02\xFF\u0103\x07\x14\x02\x02\u0100\u0103\x07\x15\x02\x02\u0101" +
		"\u0103\x07\x16\x02\x02\u0102\xF9\x03\x02\x02\x02\u0102\xFA\x03\x02\x02" +
		"\x02\u0102\xFB\x03\x02\x02\x02\u0102\xFD\x03\x02\x02\x02\u0102\xFF\x03" +
		"\x02\x02\x02\u0102\u0100\x03\x02\x02\x02\u0102\u0101\x03\x02\x02\x02\u0103" +
		"\x17\x03\x02\x02\x02\u0104\u0105\x07\x17\x02\x02\u0105\u0106\x05 \x11" +
		"\x02\u0106\u0107\x07\x18\x02\x02\u0107\u010A\x05D#\x02\u0108\u0109\x07" +
		"\x19\x02\x02\u0109\u010B\x05$\x13\x02\u010A\u0108\x03\x02\x02\x02\u010A" +
		"\u010B\x03\x02\x02\x02\u010B\u0117\x03\x02\x02\x02\u010C\u010D\x07\x17" +
		"\x02\x02\u010D\u0110\x05 \x11\x02\u010E\u010F\x07\x1A\x02\x02\u010F\u0111" +
		"\x05 \x11\x02\u0110\u010E\x03\x02\x02\x02\u0110\u0111\x03\x02\x02\x02" +
		"\u0111\u0114\x03\x02\x02\x02\u0112\u0113\x07\x19\x02\x02\u0113\u0115\x05" +
		"$\x13\x02\u0114\u0112\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115" +
		"\u0117\x03\x02\x02\x02\u0116\u0104\x03\x02\x02\x02\u0116\u010C\x03\x02" +
		"\x02\x02\u0117\x19\x03\x02\x02\x02\u0118\u0119\x07\x1B\x02\x02\u0119\u011A" +
		"\x05 \x11\x02\u011A\u011B\x07\x18\x02\x02\u011B\u011C\x05D#\x02\u011C" +
		"\u0124\x03\x02\x02\x02\u011D\u011E\x07\x1B\x02\x02\u011E\u0121\x05 \x11" +
		"\x02\u011F\u0120\x07\x1A\x02\x02\u0120\u0122\x05 \x11\x02\u0121\u011F" +
		"\x03\x02\x02\x02\u0121\u0122\x03\x02\x02\x02\u0122\u0124\x03\x02\x02\x02" +
		"\u0123\u0118\x03\x02\x02\x02\u0123\u011D\x03\x02\x02\x02\u0124\x1B\x03" +
		"\x02\x02\x02\u0125\u0126\x07\x17\x02\x02\u0126\u0127\x05\x1E\x10\x02\u0127" +
		"\u0128\x07?\x02\x02\u0128\u0129\x05 \x11\x02\u0129\u012A\x07>\x02\x02" +
		"\u012A\u0132\x05.\x18\x02\u012B\u012C\x07\n\x02\x02\u012C\u012D\x05 \x11" +
		"\x02\u012D\u012E\x07>\x02\x02\u012E\u012F\x05.\x18\x02\u012F\u0131\x03" +
		"\x02\x02\x02\u0130\u012B\x03\x02\x02\x02\u0131\u0134\x03\x02\x02\x02\u0132" +
		"\u0130\x03\x02\x02\x02\u0132\u0133\x03\x02\x02\x02\u0133\u0135\x03\x02" +
		"\x02\x02\u0134\u0132\x03\x02\x02\x02\u0135\u0136\x07@\x02\x02\u0136\u0137" +
		"\x07\x18\x02\x02\u0137\u013A\x075\x02\x02\u0138\u0139\x07\x19\x02\x02" +
		"\u0139\u013B\x05$\x13\x02\u013A\u0138\x03\x02\x02\x02\u013A\u013B\x03" +
		"\x02\x02\x02\u013B\u0154\x03\x02\x02\x02\u013C\u013D\x07\x17\x02\x02\u013D" +
		"\u013E\x05\x1E\x10\x02\u013E\u013F\x07?\x02\x02\u013F\u0140\x05 \x11\x02" +
		"\u0140\u0141\x07>\x02\x02\u0141\u0149\x05.\x18\x02\u0142\u0143\x07\n\x02" +
		"\x02\u0143\u0144\x05 \x11\x02\u0144\u0145\x07>\x02\x02\u0145\u0146\x05" +
		".\x18\x02\u0146\u0148\x03\x02\x02\x02\u0147\u0142\x03\x02\x02\x02\u0148" +
		"\u014B\x03\x02\x02\x02\u0149\u0147\x03\x02\x02\x02\u0149\u014A\x03\x02" +
		"\x02\x02\u014A\u014C\x03\x02\x02\x02\u014B\u0149\x03\x02\x02\x02\u014C" +
		"\u014D\x07@\x02\x02\u014D\u014E\x07\x1A\x02\x02\u014E\u0151\x05\"\x12" +
		"\x02\u014F\u0150\x07\x19\x02\x02\u0150\u0152\x05$\x13\x02\u0151\u014F" +
		"\x03\x02\x02\x02\u0151\u0152\x03\x02\x02\x02\u0152\u0154\x03\x02\x02\x02" +
		"\u0153\u0125\x03\x02\x02\x02\u0153\u013C\x03\x02\x02\x02\u0154\x1D\x03" +
		"\x02\x02\x02\u0155\u0156\x05R*\x02\u0156\x1F\x03\x02\x02\x02\u0157\u0158" +
		"\x05R*\x02\u0158!\x03\x02\x02\x02\u0159\u015A\x05R*\x02\u015A#\x03\x02" +
		"\x02\x02\u015B\u015C\x07*\x02\x02\u015C%\x03\x02\x02\x02\u015D\u015E\b" +
		"\x14\x01\x02\u015E\u0167\x07?\x02\x02\u015F\u0164\x05&\x14\x02\u0160\u0161" +
		"\x07\n\x02\x02\u0161\u0163\x05&\x14\x02\u0162\u0160\x03\x02\x02\x02\u0163" +
		"\u0166\x03\x02\x02\x02\u0164\u0162\x03\x02\x02\x02\u0164\u0165\x03\x02" +
		"\x02\x02\u0165\u0168\x03\x02\x02\x02\u0166\u0164\x03\x02\x02\x02\u0167" +
		"\u015F\x03\x02\x02\x02\u0167\u0168\x03\x02\x02\x02\u0168\u016A\x03\x02" +
		"\x02\x02\u0169\u016B\x07\n\x02\x02\u016A\u0169\x03\x02\x02\x02\u016A\u016B" +
		"\x03\x02\x02\x02\u016B\u016C\x03\x02\x02\x02\u016C\u016D\x07@\x02\x02" +
		"\u016D\u016E\x07\x1D\x02\x02\u016E\u0198\x05&\x14\x0E\u016F\u0170\x07" +
		"A\x02\x02\u0170\u0171\x07\r\x02\x02\u0171\u0172\x05&\x14\x02\u0172\u0173" +
		"\x07\x0E\x02\x02\u0173\u0198\x03\x02\x02\x02\u0174\u0175\x07B\x02\x02" +
		"\u0175\u0176\x07\r\x02\x02\u0176\u0177\x05&\x14\x02\u0177\u0178\x07\x0E" +
		"\x02\x02\u0178\u0198\x03\x02\x02\x02\u0179\u017A\x07?\x02\x02\u017A\u017B" +
		"\x05&\x14\x02\u017B\u017C\x07\n\x02\x02\u017C\u0181\x05&\x14\x02\u017D" +
		"\u017E\x07\n\x02\x02\u017E\u0180\x05&\x14\x02\u017F\u017D\x03\x02\x02" +
		"\x02\u0180\u0183\x03\x02\x02\x02\u0181\u017F\x03\x02\x02\x02\u0181\u0182" +
		"\x03\x02\x02\x02\u0182\u0185\x03\x02\x02\x02\u0183\u0181\x03\x02\x02\x02" +
		"\u0184\u0186\x07\n\x02\x02\u0185\u0184\x03\x02\x02\x02\u0185\u0186\x03" +
		"\x02\x02\x02\u0186\u0187\x03\x02\x02\x02\u0187\u0188\x07@\x02\x02\u0188" +
		"\u0198\x03\x02\x02\x02\u0189\u018B\x07\x04\x02\x02\u018A\u018C\x05*\x16" +
		"\x02\u018B\u018A\x03\x02\x02\x02\u018B\u018C\x03\x02\x02\x02\u018C\u018D" +
		"\x03\x02\x02\x02\u018D\u0198\x07\x05\x02\x02\u018E\u0198\x07\x1E\x02\x02" +
		"\u018F\u0198\x07\x1F\x02\x02\u0190\u0198\x07 \x02\x02\u0191\u0198\x05" +
		"(\x15\x02\u0192\u0198\x05R*\x02\u0193\u0194\x07?\x02\x02\u0194\u0195\x05" +
		"&\x14\x02\u0195\u0196\x07@\x02\x02\u0196\u0198\x03\x02\x02\x02\u0197\u015D" +
		"\x03\x02\x02\x02\u0197\u016F\x03\x02\x02\x02\u0197\u0174\x03\x02\x02\x02" +
		"\u0197\u0179\x03\x02\x02\x02\u0197\u0189\x03\x02\x02\x02\u0197\u018E\x03" +
		"\x02\x02\x02\u0197\u018F\x03\x02\x02\x02\u0197\u0190\x03\x02\x02\x02\u0197" +
		"\u0191\x03\x02\x02\x02\u0197\u0192\x03\x02\x02\x02\u0197\u0193\x03\x02" +
		"\x02\x02\u0198\u01AD\x03\x02\x02\x02\u0199\u019A\f\x10\x02\x02\u019A\u019B" +
		"\x07\x1C\x02\x02\u019B\u01AC\x05&\x14\x10\u019C\u019D\f\x0F\x02\x02\u019D" +
		"\u019E\x07\x1D\x02\x02\u019E\u01AC\x05&\x14\x0F\u019F\u01A0\f\x03\x02" +
		"\x02\u01A0\u01A1\x07\r\x02\x02\u01A1\u01A6\x05&\x14\x02\u01A2\u01A3\x07" +
		"\n\x02\x02\u01A3\u01A5\x05&\x14\x02\u01A4\u01A2\x03\x02\x02\x02\u01A5" +
		"\u01A8\x03\x02\x02\x02\u01A6\u01A4\x03\x02\x02\x02\u01A6\u01A7\x03\x02" +
		"\x02\x02\u01A7\u01A9\x03\x02\x02\x02\u01A8\u01A6\x03\x02\x02\x02\u01A9" +
		"\u01AA\x07\x0E\x02\x02\u01AA\u01AC\x03\x02\x02\x02\u01AB\u0199\x03\x02" +
		"\x02\x02\u01AB\u019C\x03\x02\x02\x02\u01AB\u019F\x03\x02\x02\x02\u01AC" +
		"\u01AF\x03\x02\x02\x02\u01AD\u01AB\x03\x02\x02\x02\u01AD\u01AE\x03\x02" +
		"\x02\x02\u01AE\'\x03\x02\x02\x02\u01AF\u01AD\x03\x02\x02\x02\u01B0\u01B1" +
		"\x07C\x02\x02\u01B1)\x03\x02\x02\x02\u01B2\u01B3\x05,\x17\x02\u01B3\u01B4" +
		"\x07\x07\x02\x02\u01B4\u01B5\x05&\x14\x02\u01B5\u01BD\x03\x02\x02\x02" +
		"\u01B6\u01B7\x07\n\x02\x02\u01B7\u01B8\x05,\x17\x02\u01B8\u01B9\x07\x07" +
		"\x02\x02\u01B9\u01BA\x05&\x14\x02\u01BA\u01BC\x03\x02\x02\x02\u01BB\u01B6" +
		"\x03\x02\x02\x02\u01BC\u01BF\x03\x02\x02\x02\u01BD\u01BB\x03\x02\x02\x02" +
		"\u01BD\u01BE\x03\x02\x02\x02\u01BE\u01C3\x03\x02\x02\x02\u01BF\u01BD\x03" +
		"\x02\x02\x02\u01C0\u01C4\x07\n\x02\x02\u01C1\u01C2\x07\x0F\x02\x02\u01C2" +
		"\u01C4\x05V,\x02\u01C3\u01C0\x03\x02\x02\x02\u01C3\u01C1\x03\x02\x02\x02" +
		"\u01C3\u01C4\x03\x02\x02\x02\u01C4\u01C8\x03\x02\x02\x02\u01C5\u01C6\x07" +
		"\x0F\x02\x02\u01C6\u01C8\x05V,\x02\u01C7\u01B2\x03\x02\x02\x02\u01C7\u01C5" +
		"\x03\x02\x02\x02\u01C8+\x03\x02\x02\x02\u01C9\u01CA\x05T+\x02\u01CA-\x03" +
		"\x02\x02\x02\u01CB\u01CC\b\x18\x01\x02\u01CC\u0262\x058\x1D\x02\u01CD" +
		"\u01CE\x05J&\x02\u01CE\u01D0\x07?\x02\x02\u01CF\u01D1\x05F$\x02\u01D0" +
		"\u01CF\x03\x02\x02\x02\u01D0\u01D1\x03\x02\x02\x02\u01D1\u01D2\x03\x02" +
		"\x02\x02\u01D2\u01D3\x07@\x02\x02\u01D3\u0262\x03\x02\x02\x02\u01D4\u01D5" +
		"\x074\x02\x02\u01D5\u0262\x05.\x18\x1B\u01D6\u01D7\x05R*\x02\u01D7\u01D8" +
		"\x07\"\x02\x02\u01D8\u01D9\x07>\x02\x02\u01D9\u01DA\x05.\x18\x17\u01DA" +
		"\u0262\x03\x02\x02\x02\u01DB\u01DC\x07-\x02\x02\u01DC\u01DD\x07\x04\x02" +
		"\x02\u01DD\u01E2\x05.\x18\x02\u01DE\u01DF\x07\n\x02\x02\u01DF\u01E1\x05" +
		".\x18\x02\u01E0\u01DE\x03\x02\x02\x02\u01E1\u01E4\x03\x02\x02\x02\u01E2" +
		"\u01E0\x03\x02\x02\x02\u01E2\u01E3\x03\x02\x02\x02\u01E3\u01E6\x03\x02" +
		"\x02\x02\u01E4\u01E2\x03\x02\x02\x02\u01E5\u01E7\x07\n\x02\x02\u01E6\u01E5" +
		"\x03\x02\x02\x02\u01E6\u01E7\x03\x02\x02\x02\u01E7\u01E8\x03\x02\x02\x02" +
		"\u01E8\u01E9\x07\x05\x02\x02\u01E9\u0262\x03\x02\x02\x02\u01EA\u01EB\x07" +
		".\x02\x02\u01EB\u01EC\x07\x04\x02\x02\u01EC\u01F1\x05.\x18\x02\u01ED\u01EE" +
		"\x07\n\x02\x02\u01EE\u01F0";
	private static readonly _serializedATNSegment1: string =
		"\x05.\x18\x02\u01EF\u01ED\x03\x02\x02\x02\u01F0\u01F3\x03\x02\x02\x02" +
		"\u01F1\u01EF\x03\x02\x02\x02\u01F1\u01F2\x03\x02\x02\x02\u01F2\u01F5\x03" +
		"\x02\x02\x02\u01F3\u01F1\x03\x02\x02\x02\u01F4\u01F6\x07\n\x02\x02\u01F5" +
		"\u01F4\x03\x02\x02\x02\u01F5\u01F6\x03\x02\x02\x02\u01F6\u01F7\x03\x02" +
		"\x02\x02\u01F7\u01F8\x07\x05\x02\x02\u01F8\u0262\x03\x02\x02\x02\u01F9" +
		"\u0262\x050\x19\x02\u01FA\u01FB\x07#\x02\x02\u01FB\u01FC\x07\x04\x02\x02" +
		"\u01FC\u0201\x05.\x18\x02\u01FD\u01FE\x07\n\x02\x02\u01FE\u0200\x05.\x18" +
		"\x02\u01FF\u01FD\x03\x02\x02\x02\u0200\u0203\x03\x02\x02\x02\u0201\u01FF" +
		"\x03\x02\x02\x02\u0201\u0202\x03\x02\x02\x02\u0202\u0205\x03\x02\x02\x02" +
		"\u0203\u0201\x03\x02\x02\x02\u0204\u0206\x07\n\x02\x02\u0205\u0204\x03" +
		"\x02\x02\x02\u0205\u0206\x03\x02\x02\x02\u0206\u0207\x03\x02\x02\x02\u0207" +
		"\u0208\x07\x05\x02\x02\u0208\u0262\x03\x02\x02\x02\u0209\u020A\x07$\x02" +
		"\x02\u020A\u020B\x07\x04\x02\x02\u020B\u0210\x05.\x18\x02\u020C\u020D" +
		"\x07\n\x02\x02\u020D\u020F\x05.\x18\x02\u020E\u020C\x03\x02\x02\x02\u020F" +
		"\u0212\x03\x02\x02\x02\u0210\u020E\x03\x02\x02\x02\u0210\u0211\x03\x02" +
		"\x02\x02\u0211\u0214\x03\x02\x02\x02\u0212\u0210\x03\x02\x02\x02\u0213" +
		"\u0215\x07\n\x02\x02\u0214\u0213\x03\x02\x02\x02\u0214\u0215\x03\x02\x02" +
		"\x02\u0215\u0216\x03\x02\x02\x02\u0216\u0217\x07\x05\x02\x02\u0217\u0262" +
		"\x03\x02\x02\x02\u0218\u021D\x05R*\x02\u0219\u021D\x07,\x02\x02\u021A" +
		"\u021D\x07+\x02\x02\u021B\u021D\x07*\x02\x02\u021C\u0218\x03\x02\x02\x02" +
		"\u021C\u0219\x03\x02\x02\x02\u021C\u021A\x03\x02\x02\x02\u021C\u021B\x03" +
		"\x02\x02\x02\u021D\u0262\x03\x02\x02\x02\u021E\u021F\x07?\x02\x02\u021F" +
		"\u0220\x05.\x18\x02\u0220\u0221\x07\n\x02\x02\u0221\u0226\x05.\x18\x02" +
		"\u0222\u0223\x07\n\x02\x02\u0223\u0225\x05.\x18\x02\u0224\u0222\x03\x02" +
		"\x02\x02\u0225\u0228\x03\x02\x02\x02\u0226\u0224\x03\x02\x02\x02\u0226" +
		"\u0227\x03\x02\x02\x02\u0227\u022A\x03\x02\x02\x02\u0228\u0226\x03\x02" +
		"\x02\x02\u0229\u022B\x07\n\x02\x02\u022A\u0229\x03\x02\x02\x02\u022A\u022B" +
		"\x03\x02\x02\x02\u022B\u022C\x03\x02\x02\x02\u022C\u022D\x07@\x02\x02" +
		"\u022D\u0262\x03\x02\x02\x02\u022E\u022F\x07\x04\x02\x02\u022F\u0234\x05" +
		"H%\x02\u0230\u0231\x07\n\x02\x02\u0231\u0233\x05H%\x02\u0232\u0230\x03" +
		"\x02\x02\x02\u0233\u0236\x03\x02\x02\x02\u0234\u0232\x03\x02\x02\x02\u0234" +
		"\u0235\x03\x02\x02\x02\u0235\u0238\x03\x02\x02\x02\u0236\u0234\x03\x02" +
		"\x02\x02\u0237\u0239\x07\n\x02\x02\u0238\u0237\x03\x02\x02\x02\u0238\u0239" +
		"\x03\x02\x02\x02\u0239\u023A\x03\x02\x02\x02\u023A\u023B\x07\x05\x02\x02" +
		"\u023B\u0262\x03\x02\x02\x02\u023C\u0245\x07\r\x02\x02\u023D\u0242\x05" +
		".\x18\x02\u023E\u023F\x07\n\x02\x02\u023F\u0241\x05.\x18\x02\u0240\u023E" +
		"\x03\x02\x02\x02\u0241\u0244\x03\x02\x02\x02\u0242\u0240\x03\x02\x02\x02" +
		"\u0242\u0243\x03\x02\x02\x02\u0243\u0246\x03\x02\x02\x02\u0244\u0242\x03" +
		"\x02\x02\x02\u0245\u023D\x03\x02\x02\x02\u0245\u0246\x03\x02\x02\x02\u0246" +
		"\u0248\x03\x02\x02\x02\u0247\u0249\x07\n\x02\x02\u0248\u0247\x03\x02\x02" +
		"\x02\u0248\u0249\x03\x02\x02\x02\u0249\u024A\x03\x02\x02\x02\u024A\u0262" +
		"\x07\x0E\x02\x02\u024B\u024C\x07%\x02\x02\u024C\u024D\x07?\x02\x02\u024D" +
		"\u024E\x05.\x18\x02\u024E\u024F\x07@\x02\x02\u024F\u0250\x05.\x18\x02" +
		"\u0250\u0251\x07&\x02\x02\u0251\u0252\x05.\x18\x07\u0252\u0262\x03\x02" +
		"\x02\x02\u0253\u0254\x05\n\x06\x02\u0254\u0255\x05.\x18\x06\u0255\u0262" +
		"\x03\x02\x02\x02\u0256\u0257\x05\x14\v\x02\u0257\u0258\x05.\x18\x05\u0258" +
		"\u0262\x03\x02\x02\x02\u0259\u025A\x07?\x02\x02\u025A\u025B\x05.\x18\x02" +
		"\u025B\u025C\x07@\x02\x02\u025C\u0262\x03\x02\x02\x02\u025D\u025E\x07" +
		"\x04\x02\x02\u025E\u025F\x05.\x18\x02\u025F\u0260\x07\x05\x02\x02\u0260" +
		"\u0262\x03\x02\x02\x02\u0261\u01CB\x03\x02\x02\x02\u0261\u01CD\x03\x02" +
		"\x02\x02\u0261\u01D4\x03\x02\x02\x02\u0261\u01D6\x03\x02\x02\x02\u0261" +
		"\u01DB\x03\x02\x02\x02\u0261\u01EA\x03\x02\x02\x02\u0261\u01F9\x03\x02" +
		"\x02\x02\u0261\u01FA\x03\x02\x02\x02\u0261\u0209\x03\x02\x02\x02\u0261" +
		"\u021C\x03\x02\x02\x02\u0261\u021E\x03\x02\x02\x02\u0261\u022E\x03\x02" +
		"\x02\x02\u0261\u023C\x03\x02\x02\x02\u0261\u024B\x03\x02\x02\x02\u0261" +
		"\u0253\x03\x02\x02\x02\u0261\u0256\x03\x02\x02\x02\u0261\u0259\x03\x02" +
		"\x02\x02\u0261\u025D\x03\x02\x02\x02\u0262\u0294\x03\x02\x02\x02\u0263" +
		"\u0264\f\x1C\x02\x02\u0264\u0265\x07!\x02\x02\u0265\u0293\x05.\x18\x1C" +
		"\u0266\u0267\f\x1A\x02\x02\u0267\u0268\t\x02\x02\x02\u0268\u0293\x05." +
		"\x18\x1B\u0269\u026A\f\x19\x02\x02\u026A\u026B\t\x03\x02\x02\u026B\u0293" +
		"\x05.\x18\x1A\u026C\u026D\f\x18\x02\x02\u026D\u026E\t\x04\x02\x02\u026E" +
		"\u0293\x05.\x18\x19\u026F\u0270\f\x16\x02\x02\u0270\u0271\x07>\x02\x02" +
		"\u0271\u0272\x05.\x18\x17\u0272\u0273\b\x18\x01\x02\u0273\u0293\x03\x02" +
		"\x02\x02\u0274\u0275\f\x14\x02\x02\u0275\u0276\x07-\x02\x02\u0276\u0293" +
		"\x05.\x18\x15\u0277\u0278\f\x12\x02\x02\u0278\u0279\x07.\x02\x02\u0279" +
		"\u0293\x05.\x18\x13\u027A\u027B\f\x11\x02\x02\u027B\u027C\x07/\x02\x02" +
		"\u027C\u0293\x05.\x18\x12\u027D\u027E\f\x10\x02\x02\u027E\u027F\x070\x02" +
		"\x02\u027F\u0293\x05.\x18\x11\u0280\u0281\f\n\x02\x02\u0281\u0282\x07" +
		"\x1C\x02\x02\u0282\u0293\x05.\x18\v\u0283\u0284\f \x02\x02\u0284\u0285" +
		"\x07\x18\x02\x02\u0285\u028B\x05L\'\x02\u0286\u0288\x07?\x02\x02\u0287" +
		"\u0289\x05F$\x02\u0288\u0287\x03\x02\x02\x02\u0288\u0289\x03\x02\x02\x02" +
		"\u0289\u028A\x03\x02\x02\x02\u028A\u028C\x07@\x02\x02\u028B\u0286\x03" +
		"\x02\x02\x02\u028B\u028C\x03\x02\x02\x02\u028C\u0293\x03\x02\x02\x02\u028D" +
		"\u028E\f\x1D\x02\x02\u028E\u028F\x07\r\x02\x02\u028F\u0290\x05.\x18\x02" +
		"\u0290\u0291\x07\x0E\x02\x02\u0291\u0293\x03\x02\x02\x02\u0292\u0263\x03" +
		"\x02\x02\x02\u0292\u0266\x03\x02\x02\x02\u0292\u0269\x03\x02\x02\x02\u0292" +
		"\u026C\x03\x02\x02\x02\u0292\u026F\x03\x02\x02\x02\u0292\u0274\x03\x02" +
		"\x02\x02\u0292\u0277\x03\x02\x02\x02\u0292\u027A\x03\x02\x02\x02\u0292" +
		"\u027D\x03\x02\x02\x02\u0292\u0280\x03\x02\x02\x02\u0292\u0283\x03\x02" +
		"\x02\x02\u0292\u028D\x03\x02\x02\x02\u0293\u0296\x03\x02\x02\x02\u0294" +
		"\u0292\x03\x02\x02\x02\u0294\u0295\x03\x02\x02\x02\u0295/\x03\x02\x02" +
		"\x02\u0296\u0294\x03\x02\x02\x02\u0297\u0298\x072\x02\x02\u0298\u0299" +
		"\x05.\x18\x02\u0299\u029B\x07\x04\x02\x02\u029A\u029C\x07\x0F\x02\x02" +
		"\u029B\u029A\x03\x02\x02\x02\u029B\u029C\x03\x02\x02\x02\u029C\u029D\x03" +
		"\x02\x02\x02\u029D\u02A2\x052\x1A\x02\u029E\u029F\x07\x0F\x02\x02\u029F" +
		"\u02A1\x052\x1A\x02\u02A0\u029E\x03\x02\x02\x02\u02A1\u02A4\x03\x02\x02" +
		"\x02\u02A2\u02A0\x03\x02\x02\x02\u02A2\u02A3\x03\x02\x02\x02\u02A3\u02A5" +
		"\x03\x02\x02\x02\u02A4\u02A2\x03\x02\x02\x02\u02A5\u02A6\x07\x05\x02\x02" +
		"\u02A61\x03\x02\x02\x02\u02A7\u02AA\x054\x1B\x02\u02A8\u02AA\x07\'\x02" +
		"\x02\u02A9\u02A7\x03\x02\x02\x02\u02A9\u02A8\x03\x02\x02\x02\u02AA\u02AB" +
		"\x03\x02\x02\x02\u02AB\u02AC\x07\x1D\x02\x02\u02AC\u02AD\x05.\x18\x02" +
		"\u02AD3\x03\x02\x02\x02\u02AE\u02B5\x05T+\x02\u02AF\u02B2\x07?\x02\x02" +
		"\u02B0\u02B3\x05T+\x02\u02B1\u02B3\x07\'\x02\x02\u02B2\u02B0\x03\x02\x02" +
		"\x02\u02B2\u02B1\x03\x02\x02\x02\u02B3\u02B4\x03\x02\x02\x02\u02B4\u02B6" +
		"\x07@\x02\x02\u02B5\u02AF\x03\x02\x02\x02\u02B5\u02B6\x03\x02\x02\x02" +
		"\u02B65\x03\x02\x02\x02\u02B7\u02B8\x05\b\x05\x02\u02B8\u02B9\x07\x02" +
		"\x02\x03\u02B9\u02C1\x03\x02\x02\x02\u02BA\u02BB\x05.\x18\x02\u02BB\u02BC" +
		"\x07\x02\x02\x03\u02BC\u02C1\x03\x02\x02\x02\u02BD\u02BE\x07E\x02\x02" +
		"\u02BE\u02C1\x07\x02\x02\x03\u02BF\u02C1\x07\x02\x02\x03\u02C0\u02B7\x03" +
		"\x02\x02\x02\u02C0\u02BA\x03\x02\x02\x02\u02C0\u02BD\x03\x02\x02\x02\u02C0" +
		"\u02BF\x03\x02\x02\x02\u02C17\x03\x02\x02\x02\u02C2\u02C5\x05:\x1E\x02" +
		"\u02C3\u02C5\x05<\x1F\x02\u02C4\u02C2\x03\x02\x02\x02\u02C4\u02C3\x03" +
		"\x02\x02\x02\u02C59\x03\x02\x02\x02\u02C6\u02C7\x05@!\x02\u02C7\u02C8" +
		"\x07\x1D\x02\x02\u02C8\u02C9\x05.\x18\x02\u02C9\u02D8\x03\x02\x02\x02" +
		"\u02CA\u02CB\x07?\x02\x02\u02CB\u02D0\x05@!\x02\u02CC\u02CD\x07\n\x02" +
		"\x02\u02CD\u02CF\x05@!\x02\u02CE\u02CC\x03\x02\x02\x02\u02CF\u02D2\x03" +
		"\x02\x02\x02\u02D0\u02CE\x03\x02\x02\x02\u02D0\u02D1\x03\x02\x02\x02\u02D1" +
		"\u02D3\x03\x02\x02\x02\u02D2\u02D0\x03\x02\x02\x02\u02D3\u02D4\x07@\x02" +
		"\x02\u02D4\u02D5\x07\x1D\x02\x02\u02D5\u02D6\x05.\x18\x02\u02D6\u02D8" +
		"\x03\x02\x02\x02\u02D7\u02C6\x03\x02\x02\x02\u02D7\u02CA\x03\x02\x02\x02" +
		"\u02D8;\x03\x02\x02\x02\u02D9\u02DA\x07?\x02\x02\u02DA\u02DB\x07?\x02" +
		"\x02\u02DB\u02DE\x05@!\x02\u02DC\u02DD\x07\n\x02\x02\u02DD\u02DF\x05@" +
		"!\x02\u02DE\u02DC\x03\x02\x02\x02\u02DF\u02E0\x03\x02\x02\x02\u02E0\u02DE" +
		"\x03\x02\x02\x02\u02E0\u02E1\x03\x02\x02\x02\u02E1\u02E2\x03\x02\x02\x02" +
		"\u02E2\u02E3\x07@\x02\x02\u02E3\u02E4\x07@\x02\x02\u02E4\u02E5\x07\x1D" +
		"\x02\x02\u02E5\u02E6\x05.\x18\x02\u02E6=\x03\x02\x02\x02\u02E7\u02EA\x07" +
		"\'\x02\x02\u02E8\u02EA\x05R*\x02\u02E9\u02E7\x03\x02\x02\x02\u02E9\u02E8" +
		"\x03\x02\x02\x02\u02EA?\x03\x02\x02\x02\u02EB\u02EC\x05> \x02\u02ECA\x03" +
		"\x02\x02\x02\u02ED\u02EE\x05> \x02\u02EE\u02EF\x07\x07\x02\x02\u02EF\u02F0" +
		"\x05&\x14\x02\u02F0C\x03\x02\x02\x02\u02F1\u02F4\x075\x02\x02\u02F2\u02F4" +
		"\x05R*\x02\u02F3\u02F1\x03\x02\x02\x02\u02F3\u02F2\x03\x02\x02\x02\u02F4" +
		"E\x03\x02\x02\x02\u02F5\u02FA\x05.\x18\x02\u02F6\u02F7\x07\n\x02\x02\u02F7" +
		"\u02F9\x05.\x18\x02\u02F8\u02F6\x03\x02\x02\x02\u02F9\u02FC\x03\x02\x02" +
		"\x02\u02FA\u02F8\x03\x02\x02\x02\u02FA\u02FB\x03\x02\x02\x02\u02FBG\x03" +
		"\x02\x02\x02\u02FC\u02FA\x03\x02\x02\x02\u02FD\u02FE\x05T+\x02\u02FE\u02FF" +
		"\x07\x07\x02\x02\u02FF\u0300\x05.\x18\x02\u0300\u0304\x03\x02\x02\x02" +
		"\u0301\u0302\x07(\x02\x02\u0302\u0304\x05.\x18\x02\u0303\u02FD\x03\x02" +
		"\x02\x02\u0303\u0301\x03\x02\x02\x02\u0304I\x03\x02\x02\x02\u0305\u0308" +
		"\x05R*\x02\u0306\u0308\t\x05\x02\x02\u0307\u0305\x03\x02\x02\x02\u0307" +
		"\u0306\x03\x02\x02\x02\u0308K\x03\x02\x02\x02\u0309\u030C\x05R*\x02\u030A" +
		"\u030C\t\x06\x02\x02\u030B\u0309\x03\x02\x02\x02\u030B\u030A\x03\x02\x02" +
		"\x02\u030CM\x03\x02\x02\x02\u030D\u030E\t\x07\x02\x02\u030EO\x03\x02\x02" +
		"\x02\u030F\u0310\t\b\x02\x02\u0310Q\x03\x02\x02\x02\u0311\u0316\x05V," +
		"\x02\u0312\u0313\x07)\x02\x02\u0313\u0315\x05V,\x02\u0314\u0312\x03\x02" +
		"\x02\x02\u0315\u0318\x03\x02\x02\x02\u0316\u0314\x03\x02\x02\x02\u0316" +
		"\u0317\x03\x02\x02\x02\u0317S\x03\x02\x02\x02\u0318\u0316\x03\x02\x02" +
		"\x02\u0319\u031E\x05V,\x02\u031A\u031B\x05R*\x02\u031B\u031C\b+\x01\x02" +
		"\u031C\u031E\x03\x02\x02\x02\u031D\u0319\x03\x02\x02\x02\u031D\u031A\x03" +
		"\x02\x02\x02\u031EU\x03\x02\x02\x02\u031F\u0320\t\t\x02\x02\u0320W\x03" +
		"\x02\x02\x02Z[bks\x8C\x96\x9E\xA1\xAB\xAE\xB1\xB5\xB9\xBC\xBE\xCC\xD5" +
		"\xDA\xDD\xE4\xEC\xF2\xF7\u0102\u010A\u0110\u0114\u0116\u0121\u0123\u0132" +
		"\u013A\u0149\u0151\u0153\u0164\u0167\u016A\u0181\u0185\u018B\u0197\u01A6" +
		"\u01AB\u01AD\u01BD\u01C3\u01C7\u01D0\u01E2\u01E6\u01F1\u01F5\u0201\u0205" +
		"\u0210\u0214\u021C\u0226\u022A\u0234\u0238\u0242\u0245\u0248\u0261\u0288" +
		"\u028B\u0292\u0294\u029B\u02A2\u02A9\u02B2\u02B5\u02C0\u02C4\u02D0\u02D7" +
		"\u02E0\u02E9\u02F3\u02FA\u0303\u0307\u030B\u0316\u031D";
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
	public _typeVar!: TypeVarContext;
	public _typeVars: TypeVarContext[] = [];
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public typeVar(): TypeVarContext[];
	public typeVar(i: number): TypeVarContext;
	public typeVar(i?: number): TypeVarContext | TypeVarContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeVarContext);
		} else {
			return this.getRuleContext(i, TypeVarContext);
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


export class NondetOperDefContext extends ParserRuleContext {
	public qualId(): QualIdContext {
		return this.getRuleContext(0, QualIdContext);
	}
	public ASGN(): TerminalNode { return this.getToken(QuintParser.ASGN, 0); }
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
	public get ruleIndex(): number { return QuintParser.RULE_nondetOperDef; }
	// @Override
	public enterRule(listener: QuintListener): void {
		if (listener.enterNondetOperDef) {
			listener.enterNondetOperDef(this);
		}
	}
	// @Override
	public exitRule(listener: QuintListener): void {
		if (listener.exitNondetOperDef) {
			listener.exitNondetOperDef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: QuintVisitor<Result>): Result {
		if (visitor.visitNondetOperDef) {
			return visitor.visitNondetOperDef(this);
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
	public _typeCtor!: TypeContext;
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
export class NondetContext extends ExprContext {
	public nondetOperDef(): NondetOperDefContext {
		return this.getRuleContext(0, NondetOperDefContext);
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


