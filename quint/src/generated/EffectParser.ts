// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


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

import { EffectListener } from "./EffectListener";
import { EffectVisitor } from "./EffectVisitor";


export class EffectParser extends Parser {
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
	public static readonly IDENTIFIER = 13;
	public static readonly WS = 14;
	public static readonly RULE_effect = 0;
	public static readonly RULE_read = 1;
	public static readonly RULE_update = 2;
	public static readonly RULE_temporal = 3;
	public static readonly RULE_concrete = 4;
	public static readonly RULE_component = 5;
	public static readonly RULE_entity = 6;
	public static readonly RULE_stateVarRef = 7;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"effect", "read", "update", "temporal", "concrete", "component", "entity", 
		"stateVarRef",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "','", "')'", "'=>'", "'Read'", "'['", "']'", "'Update'", 
		"'Temporal'", "'&'", "'Pure'", "'''",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, "IDENTIFIER", 
		"WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(EffectParser._LITERAL_NAMES, EffectParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return EffectParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Effect.g4"; }

	// @Override
	public get ruleNames(): string[] { return EffectParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return EffectParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(EffectParser._ATN, this);
	}
	// @RuleVersion(0)
	public effect(): EffectContext {
		let _localctx: EffectContext = new EffectContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, EffectParser.RULE_effect);
		let _la: number;
		try {
			this.state = 32;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case EffectParser.T__4:
			case EffectParser.T__7:
			case EffectParser.T__8:
			case EffectParser.T__10:
				_localctx = new ConcreteEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 16;
				this.concrete();
				}
				break;
			case EffectParser.T__0:
				_localctx = new ArrowEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 17;
				this.match(EffectParser.T__0);
				this.state = 26;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << EffectParser.T__0) | (1 << EffectParser.T__4) | (1 << EffectParser.T__7) | (1 << EffectParser.T__8) | (1 << EffectParser.T__10) | (1 << EffectParser.IDENTIFIER))) !== 0)) {
					{
					this.state = 18;
					this.effect();
					this.state = 23;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === EffectParser.T__1) {
						{
						{
						this.state = 19;
						this.match(EffectParser.T__1);
						this.state = 20;
						this.effect();
						}
						}
						this.state = 25;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 28;
				this.match(EffectParser.T__2);
				this.state = 29;
				this.match(EffectParser.T__3);
				this.state = 30;
				this.effect();
				}
				break;
			case EffectParser.IDENTIFIER:
				_localctx = new VariableEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 31;
				this.match(EffectParser.IDENTIFIER);
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
	public read(): ReadContext {
		let _localctx: ReadContext = new ReadContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, EffectParser.RULE_read);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 34;
			this.match(EffectParser.T__4);
			this.state = 35;
			this.match(EffectParser.T__5);
			this.state = 36;
			this.entity();
			this.state = 37;
			this.match(EffectParser.T__6);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
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
	public update(): UpdateContext {
		let _localctx: UpdateContext = new UpdateContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, EffectParser.RULE_update);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 39;
			this.match(EffectParser.T__7);
			this.state = 40;
			this.match(EffectParser.T__5);
			this.state = 41;
			this.entity();
			this.state = 42;
			this.match(EffectParser.T__6);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
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
	public temporal(): TemporalContext {
		let _localctx: TemporalContext = new TemporalContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, EffectParser.RULE_temporal);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 44;
			this.match(EffectParser.T__8);
			this.state = 45;
			this.match(EffectParser.T__5);
			this.state = 46;
			this.entity();
			this.state = 47;
			this.match(EffectParser.T__6);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
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
	public concrete(): ConcreteContext {
		let _localctx: ConcreteContext = new ConcreteContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, EffectParser.RULE_concrete);
		let _la: number;
		try {
			this.state = 58;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case EffectParser.T__4:
			case EffectParser.T__7:
			case EffectParser.T__8:
				_localctx = new ConcreteComponentsContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 49;
				this.component();
				this.state = 54;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === EffectParser.T__9) {
					{
					{
					this.state = 50;
					this.match(EffectParser.T__9);
					this.state = 51;
					this.component();
					}
					}
					this.state = 56;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			case EffectParser.T__10:
				_localctx = new PureContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 57;
				this.match(EffectParser.T__10);
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
	public component(): ComponentContext {
		let _localctx: ComponentContext = new ComponentContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, EffectParser.RULE_component);
		try {
			this.state = 63;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case EffectParser.T__4:
				_localctx = new ReadComponentContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 60;
				this.read();
				}
				break;
			case EffectParser.T__7:
				_localctx = new UpdateComponentContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 61;
				this.update();
				}
				break;
			case EffectParser.T__8:
				_localctx = new TemporalComponentContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 62;
				this.temporal();
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
	public entity(): EntityContext {
		let _localctx: EntityContext = new EntityContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, EffectParser.RULE_entity);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === EffectParser.T__11 || _la === EffectParser.IDENTIFIER) {
				{
				this.state = 67;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case EffectParser.T__11:
					{
					this.state = 65;
					this.stateVarRef();
					}
					break;
				case EffectParser.IDENTIFIER:
					{
					this.state = 66;
					this.match(EffectParser.IDENTIFIER);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 76;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === EffectParser.T__1) {
					{
					{
					this.state = 69;
					this.match(EffectParser.T__1);
					this.state = 72;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case EffectParser.T__11:
						{
						this.state = 70;
						this.stateVarRef();
						}
						break;
					case EffectParser.IDENTIFIER:
						{
						this.state = 71;
						this.match(EffectParser.IDENTIFIER);
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
					this.state = 78;
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
	public stateVarRef(): StateVarRefContext {
		let _localctx: StateVarRefContext = new StateVarRefContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, EffectParser.RULE_stateVarRef);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 81;
			this.match(EffectParser.T__11);
			this.state = 82;
			this.match(EffectParser.IDENTIFIER);
			this.state = 83;
			this.match(EffectParser.T__11);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x10X\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x07" +
		"\x02\x18\n\x02\f\x02\x0E\x02\x1B\v\x02\x05\x02\x1D\n\x02\x03\x02\x03\x02" +
		"\x03\x02\x03\x02\x05\x02#\n\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x06\x03\x06\x03\x06\x07\x067\n\x06\f\x06\x0E\x06:\v\x06\x03" +
		"\x06\x05\x06=\n\x06\x03\x07\x03\x07\x03\x07\x05\x07B\n\x07\x03\b\x03\b" +
		"\x05\bF\n\b\x03\b\x03\b\x03\b\x05\bK\n\b\x07\bM\n\b\f\b\x0E\bP\v\b\x05" +
		"\bR\n\b\x03\t\x03\t\x03\t\x03\t\x03\t\x02\x02\x02\n\x02\x02\x04\x02\x06" +
		"\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x02\x02\x02[\x02\"\x03\x02\x02" +
		"\x02\x04$\x03\x02\x02\x02\x06)\x03\x02\x02\x02\b.\x03\x02\x02\x02\n<\x03" +
		"\x02\x02\x02\fA\x03\x02\x02\x02\x0EQ\x03\x02\x02\x02\x10S\x03\x02\x02" +
		"\x02\x12#\x05\n\x06\x02\x13\x1C\x07\x03\x02\x02\x14\x19\x05\x02\x02\x02" +
		"\x15\x16\x07\x04\x02\x02\x16\x18\x05\x02\x02\x02\x17\x15\x03\x02\x02\x02" +
		"\x18\x1B\x03\x02\x02\x02\x19\x17\x03\x02\x02\x02\x19\x1A\x03\x02\x02\x02" +
		"\x1A\x1D\x03\x02\x02\x02\x1B\x19\x03\x02\x02\x02\x1C\x14\x03\x02\x02\x02" +
		"\x1C\x1D\x03\x02\x02\x02\x1D\x1E\x03\x02\x02\x02\x1E\x1F\x07\x05\x02\x02" +
		"\x1F \x07\x06\x02\x02 #\x05\x02\x02\x02!#\x07\x0F\x02\x02\"\x12\x03\x02" +
		"\x02\x02\"\x13\x03\x02\x02\x02\"!\x03\x02\x02\x02#\x03\x03\x02\x02\x02" +
		"$%\x07\x07\x02\x02%&\x07\b\x02\x02&\'\x05\x0E\b\x02\'(\x07\t\x02\x02(" +
		"\x05\x03\x02\x02\x02)*\x07\n\x02\x02*+\x07\b\x02\x02+,\x05\x0E\b\x02," +
		"-\x07\t\x02\x02-\x07\x03\x02\x02\x02./\x07\v\x02\x02/0\x07\b\x02\x020" +
		"1\x05\x0E\b\x0212\x07\t\x02\x022\t\x03\x02\x02\x0238\x05\f\x07\x0245\x07" +
		"\f\x02\x0257\x05\f\x07\x0264\x03\x02\x02\x027:\x03\x02\x02\x0286\x03\x02" +
		"\x02\x0289\x03\x02\x02\x029=\x03\x02\x02\x02:8\x03\x02\x02\x02;=\x07\r" +
		"\x02\x02<3\x03\x02\x02\x02<;\x03\x02\x02\x02=\v\x03\x02\x02\x02>B\x05" +
		"\x04\x03\x02?B\x05\x06\x04\x02@B\x05\b\x05\x02A>\x03\x02\x02\x02A?\x03" +
		"\x02\x02\x02A@\x03\x02\x02\x02B\r\x03\x02\x02\x02CF\x05\x10\t\x02DF\x07" +
		"\x0F\x02\x02EC\x03\x02\x02\x02ED\x03\x02\x02\x02FN\x03\x02\x02\x02GJ\x07" +
		"\x04\x02\x02HK\x05\x10\t\x02IK\x07\x0F\x02\x02JH\x03\x02\x02\x02JI\x03" +
		"\x02\x02\x02KM\x03\x02\x02\x02LG\x03\x02\x02\x02MP\x03\x02\x02\x02NL\x03" +
		"\x02\x02\x02NO\x03\x02\x02\x02OR\x03\x02\x02\x02PN\x03\x02\x02\x02QE\x03" +
		"\x02\x02\x02QR\x03\x02\x02\x02R\x0F\x03\x02\x02\x02ST\x07\x0E\x02\x02" +
		"TU\x07\x0F\x02\x02UV\x07\x0E\x02\x02V\x11\x03\x02\x02\x02\f\x19\x1C\"" +
		"8<AEJNQ";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!EffectParser.__ATN) {
			EffectParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(EffectParser._serializedATN));
		}

		return EffectParser.__ATN;
	}

}

export class EffectContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_effect; }
	public copyFrom(ctx: EffectContext): void {
		super.copyFrom(ctx);
	}
}
export class ConcreteEffectContext extends EffectContext {
	public concrete(): ConcreteContext {
		return this.getRuleContext(0, ConcreteContext);
	}
	constructor(ctx: EffectContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterConcreteEffect) {
			listener.enterConcreteEffect(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitConcreteEffect) {
			listener.exitConcreteEffect(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitConcreteEffect) {
			return visitor.visitConcreteEffect(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ArrowEffectContext extends EffectContext {
	public effect(): EffectContext[];
	public effect(i: number): EffectContext;
	public effect(i?: number): EffectContext | EffectContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EffectContext);
		} else {
			return this.getRuleContext(i, EffectContext);
		}
	}
	constructor(ctx: EffectContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterArrowEffect) {
			listener.enterArrowEffect(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitArrowEffect) {
			listener.exitArrowEffect(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitArrowEffect) {
			return visitor.visitArrowEffect(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class VariableEffectContext extends EffectContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(EffectParser.IDENTIFIER, 0); }
	constructor(ctx: EffectContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterVariableEffect) {
			listener.enterVariableEffect(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitVariableEffect) {
			listener.exitVariableEffect(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitVariableEffect) {
			return visitor.visitVariableEffect(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReadContext extends ParserRuleContext {
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_read; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterRead) {
			listener.enterRead(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitRead) {
			listener.exitRead(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitRead) {
			return visitor.visitRead(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UpdateContext extends ParserRuleContext {
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_update; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterUpdate) {
			listener.enterUpdate(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitUpdate) {
			listener.exitUpdate(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitUpdate) {
			return visitor.visitUpdate(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemporalContext extends ParserRuleContext {
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_temporal; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterTemporal) {
			listener.enterTemporal(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitTemporal) {
			listener.exitTemporal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitTemporal) {
			return visitor.visitTemporal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConcreteContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_concrete; }
	public copyFrom(ctx: ConcreteContext): void {
		super.copyFrom(ctx);
	}
}
export class ConcreteComponentsContext extends ConcreteContext {
	public component(): ComponentContext[];
	public component(i: number): ComponentContext;
	public component(i?: number): ComponentContext | ComponentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ComponentContext);
		} else {
			return this.getRuleContext(i, ComponentContext);
		}
	}
	constructor(ctx: ConcreteContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterConcreteComponents) {
			listener.enterConcreteComponents(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitConcreteComponents) {
			listener.exitConcreteComponents(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitConcreteComponents) {
			return visitor.visitConcreteComponents(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PureContext extends ConcreteContext {
	constructor(ctx: ConcreteContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterPure) {
			listener.enterPure(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitPure) {
			listener.exitPure(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitPure) {
			return visitor.visitPure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ComponentContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_component; }
	public copyFrom(ctx: ComponentContext): void {
		super.copyFrom(ctx);
	}
}
export class ReadComponentContext extends ComponentContext {
	public read(): ReadContext {
		return this.getRuleContext(0, ReadContext);
	}
	constructor(ctx: ComponentContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterReadComponent) {
			listener.enterReadComponent(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitReadComponent) {
			listener.exitReadComponent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitReadComponent) {
			return visitor.visitReadComponent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UpdateComponentContext extends ComponentContext {
	public update(): UpdateContext {
		return this.getRuleContext(0, UpdateContext);
	}
	constructor(ctx: ComponentContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterUpdateComponent) {
			listener.enterUpdateComponent(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitUpdateComponent) {
			listener.exitUpdateComponent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitUpdateComponent) {
			return visitor.visitUpdateComponent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TemporalComponentContext extends ComponentContext {
	public temporal(): TemporalContext {
		return this.getRuleContext(0, TemporalContext);
	}
	constructor(ctx: ComponentContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterTemporalComponent) {
			listener.enterTemporalComponent(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitTemporalComponent) {
			listener.exitTemporalComponent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitTemporalComponent) {
			return visitor.visitTemporalComponent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EntityContext extends ParserRuleContext {
	public stateVarRef(): StateVarRefContext[];
	public stateVarRef(i: number): StateVarRefContext;
	public stateVarRef(i?: number): StateVarRefContext | StateVarRefContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StateVarRefContext);
		} else {
			return this.getRuleContext(i, StateVarRefContext);
		}
	}
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(EffectParser.IDENTIFIER);
		} else {
			return this.getToken(EffectParser.IDENTIFIER, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_entity; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterEntity) {
			listener.enterEntity(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitEntity) {
			listener.exitEntity(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitEntity) {
			return visitor.visitEntity(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StateVarRefContext extends ParserRuleContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(EffectParser.IDENTIFIER, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_stateVarRef; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterStateVarRef) {
			listener.enterStateVarRef(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitStateVarRef) {
			listener.exitStateVarRef(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitStateVarRef) {
			return visitor.visitStateVarRef(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


