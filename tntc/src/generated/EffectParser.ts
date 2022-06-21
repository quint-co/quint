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
	public static readonly IDENTIFIER = 12;
	public static readonly WS = 13;
	public static readonly RULE_effect = 0;
	public static readonly RULE_read = 1;
	public static readonly RULE_update = 2;
	public static readonly RULE_concrete = 3;
	public static readonly RULE_vars = 4;
	public static readonly RULE_stateVarRef = 5;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"effect", "read", "update", "concrete", "vars", "stateVarRef",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "', '", "')'", "'=>'", "'Read'", "'['", "']'", "'Update'", 
		"'&'", "'Pure'", "'''",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "IDENTIFIER", "WS",
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
			this.state = 28;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case EffectParser.T__4:
			case EffectParser.T__7:
			case EffectParser.T__9:
				_localctx = new ConcreteEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 12;
				this.concrete();
				}
				break;
			case EffectParser.T__0:
				_localctx = new ArrowEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 13;
				this.match(EffectParser.T__0);
				this.state = 22;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << EffectParser.T__0) | (1 << EffectParser.T__4) | (1 << EffectParser.T__7) | (1 << EffectParser.T__9) | (1 << EffectParser.IDENTIFIER))) !== 0)) {
					{
					this.state = 14;
					this.effect();
					this.state = 19;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === EffectParser.T__1) {
						{
						{
						this.state = 15;
						this.match(EffectParser.T__1);
						this.state = 16;
						this.effect();
						}
						}
						this.state = 21;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 24;
				this.match(EffectParser.T__2);
				this.state = 25;
				this.match(EffectParser.T__3);
				this.state = 26;
				this.effect();
				}
				break;
			case EffectParser.IDENTIFIER:
				_localctx = new QuantifiedEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 27;
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
			this.state = 30;
			this.match(EffectParser.T__4);
			this.state = 31;
			this.match(EffectParser.T__5);
			this.state = 32;
			this.vars();
			this.state = 33;
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
			this.state = 35;
			this.match(EffectParser.T__7);
			this.state = 36;
			this.match(EffectParser.T__5);
			this.state = 37;
			this.vars();
			this.state = 38;
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
		this.enterRule(_localctx, 6, EffectParser.RULE_concrete);
		try {
			this.state = 53;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				_localctx = new ReadOnlyContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 40;
				this.read();
				}
				break;

			case 2:
				_localctx = new UpdateOnlyContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 41;
				this.update();
				}
				break;

			case 3:
				_localctx = new ReadAndUpdateContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 50;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case EffectParser.T__4:
					{
					this.state = 42;
					this.read();
					this.state = 43;
					this.match(EffectParser.T__8);
					this.state = 44;
					this.update();
					}
					break;
				case EffectParser.T__7:
					{
					this.state = 46;
					this.update();
					this.state = 47;
					this.match(EffectParser.T__8);
					this.state = 48;
					this.read();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				break;

			case 4:
				_localctx = new PureContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 52;
				this.match(EffectParser.T__9);
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
	public vars(): VarsContext {
		let _localctx: VarsContext = new VarsContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, EffectParser.RULE_vars);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 69;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === EffectParser.T__10 || _la === EffectParser.IDENTIFIER) {
				{
				this.state = 57;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case EffectParser.T__10:
					{
					this.state = 55;
					this.stateVarRef();
					}
					break;
				case EffectParser.IDENTIFIER:
					{
					this.state = 56;
					this.match(EffectParser.IDENTIFIER);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 66;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === EffectParser.T__1) {
					{
					{
					this.state = 59;
					this.match(EffectParser.T__1);
					this.state = 62;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case EffectParser.T__10:
						{
						this.state = 60;
						this.stateVarRef();
						}
						break;
					case EffectParser.IDENTIFIER:
						{
						this.state = 61;
						this.match(EffectParser.IDENTIFIER);
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
					this.state = 68;
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
		this.enterRule(_localctx, 10, EffectParser.RULE_stateVarRef);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 71;
			this.match(EffectParser.T__10);
			this.state = 72;
			this.match(EffectParser.IDENTIFIER);
			this.state = 73;
			this.match(EffectParser.T__10);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x0FN\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x07\x02\x14\n\x02\f\x02" +
		"\x0E\x02\x17\v\x02\x05\x02\x19\n\x02\x03\x02\x03\x02\x03\x02\x03\x02\x05" +
		"\x02\x1F\n\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x05\x055\n\x05\x03\x05\x05\x058\n\x05" +
		"\x03\x06\x03\x06\x05\x06<\n\x06\x03\x06\x03\x06\x03\x06\x05\x06A\n\x06" +
		"\x07\x06C\n\x06\f\x06\x0E\x06F\v\x06\x05\x06H\n\x06\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x02\x02\x02\b\x02\x02\x04\x02\x06\x02\b\x02\n\x02" +
		"\f\x02\x02\x02\x02S\x02\x1E\x03\x02\x02\x02\x04 \x03\x02\x02\x02\x06%" +
		"\x03\x02\x02\x02\b7\x03\x02\x02\x02\nG\x03\x02\x02\x02\fI\x03\x02\x02" +
		"\x02\x0E\x1F\x05\b\x05\x02\x0F\x18\x07\x03\x02\x02\x10\x15\x05\x02\x02" +
		"\x02\x11\x12\x07\x04\x02\x02\x12\x14\x05\x02\x02\x02\x13\x11\x03\x02\x02" +
		"\x02\x14\x17\x03\x02\x02\x02\x15\x13\x03\x02\x02\x02\x15\x16\x03\x02\x02" +
		"\x02\x16\x19\x03\x02\x02\x02\x17\x15\x03\x02\x02\x02\x18\x10\x03\x02\x02" +
		"\x02\x18\x19\x03\x02\x02\x02\x19\x1A\x03\x02\x02\x02\x1A\x1B\x07\x05\x02" +
		"\x02\x1B\x1C\x07\x06\x02\x02\x1C\x1F\x05\x02\x02\x02\x1D\x1F\x07\x0E\x02" +
		"\x02\x1E\x0E\x03\x02\x02\x02\x1E\x0F\x03\x02\x02\x02\x1E\x1D\x03\x02\x02" +
		"\x02\x1F\x03\x03\x02\x02\x02 !\x07\x07\x02\x02!\"\x07\b\x02\x02\"#\x05" +
		"\n\x06\x02#$\x07\t\x02\x02$\x05\x03\x02\x02\x02%&\x07\n\x02\x02&\'\x07" +
		"\b\x02\x02\'(\x05\n\x06\x02()\x07\t\x02\x02)\x07\x03\x02\x02\x02*8\x05" +
		"\x04\x03\x02+8\x05\x06\x04\x02,-\x05\x04\x03\x02-.\x07\v\x02\x02./\x05" +
		"\x06\x04\x02/5\x03\x02\x02\x0201\x05\x06\x04\x0212\x07\v\x02\x0223\x05" +
		"\x04\x03\x0235\x03\x02\x02\x024,\x03\x02\x02\x0240\x03\x02\x02\x0258\x03" +
		"\x02\x02\x0268\x07\f\x02\x027*\x03\x02\x02\x027+\x03\x02\x02\x0274\x03" +
		"\x02\x02\x0276\x03\x02\x02\x028\t\x03\x02\x02\x029<\x05\f\x07\x02:<\x07" +
		"\x0E\x02\x02;9\x03\x02\x02\x02;:\x03\x02\x02\x02<D\x03\x02\x02\x02=@\x07" +
		"\x04\x02\x02>A\x05\f\x07\x02?A\x07\x0E\x02\x02@>\x03\x02\x02\x02@?\x03" +
		"\x02\x02\x02AC\x03\x02\x02\x02B=\x03\x02\x02\x02CF\x03\x02\x02\x02DB\x03" +
		"\x02\x02\x02DE\x03\x02\x02\x02EH\x03\x02\x02\x02FD\x03\x02\x02\x02G;\x03" +
		"\x02\x02\x02GH\x03\x02\x02\x02H\v\x03\x02\x02\x02IJ\x07\r\x02\x02JK\x07" +
		"\x0E\x02\x02KL\x07\r\x02\x02L\r\x03\x02\x02\x02\v\x15\x18\x1E47;@DG";
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
export class QuantifiedEffectContext extends EffectContext {
	public IDENTIFIER(): TerminalNode { return this.getToken(EffectParser.IDENTIFIER, 0); }
	constructor(ctx: EffectContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterQuantifiedEffect) {
			listener.enterQuantifiedEffect(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitQuantifiedEffect) {
			listener.exitQuantifiedEffect(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitQuantifiedEffect) {
			return visitor.visitQuantifiedEffect(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReadContext extends ParserRuleContext {
	public vars(): VarsContext {
		return this.getRuleContext(0, VarsContext);
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
	public vars(): VarsContext {
		return this.getRuleContext(0, VarsContext);
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
export class ReadOnlyContext extends ConcreteContext {
	public read(): ReadContext {
		return this.getRuleContext(0, ReadContext);
	}
	constructor(ctx: ConcreteContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterReadOnly) {
			listener.enterReadOnly(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitReadOnly) {
			listener.exitReadOnly(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitReadOnly) {
			return visitor.visitReadOnly(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class UpdateOnlyContext extends ConcreteContext {
	public update(): UpdateContext {
		return this.getRuleContext(0, UpdateContext);
	}
	constructor(ctx: ConcreteContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterUpdateOnly) {
			listener.enterUpdateOnly(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitUpdateOnly) {
			listener.exitUpdateOnly(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitUpdateOnly) {
			return visitor.visitUpdateOnly(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReadAndUpdateContext extends ConcreteContext {
	public read(): ReadContext | undefined {
		return this.tryGetRuleContext(0, ReadContext);
	}
	public update(): UpdateContext | undefined {
		return this.tryGetRuleContext(0, UpdateContext);
	}
	constructor(ctx: ConcreteContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterReadAndUpdate) {
			listener.enterReadAndUpdate(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitReadAndUpdate) {
			listener.exitReadAndUpdate(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitReadAndUpdate) {
			return visitor.visitReadAndUpdate(this);
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


export class VarsContext extends ParserRuleContext {
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
	public get ruleIndex(): number { return EffectParser.RULE_vars; }
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterVars) {
			listener.enterVars(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitVars) {
			listener.exitVars(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitVars) {
			return visitor.visitVars(this);
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


