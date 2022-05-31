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
	public static readonly RULE_effect = 0;
	public static readonly RULE_concrete = 1;
	public static readonly RULE_vars = 2;
	public static readonly RULE_stateVarRef = 3;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"effect", "concrete", "vars", "stateVarRef",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "', '", "')'", "' => '", "'Read'", "'['", "']'", "'Update'", 
		"'] & Update'", "'Pure'", "'''",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, "IDENTIFIER",
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
			this.state = 24;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case EffectParser.T__4:
			case EffectParser.T__7:
			case EffectParser.T__9:
				_localctx = new ConcreteEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 8;
				this.concrete();
				}
				break;
			case EffectParser.T__0:
				_localctx = new ArrowEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 9;
				this.match(EffectParser.T__0);
				this.state = 18;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << EffectParser.T__0) | (1 << EffectParser.T__4) | (1 << EffectParser.T__7) | (1 << EffectParser.T__9) | (1 << EffectParser.IDENTIFIER))) !== 0)) {
					{
					this.state = 10;
					this.effect();
					this.state = 15;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === EffectParser.T__1) {
						{
						{
						this.state = 11;
						this.match(EffectParser.T__1);
						this.state = 12;
						this.effect();
						}
						}
						this.state = 17;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 20;
				this.match(EffectParser.T__2);
				this.state = 21;
				this.match(EffectParser.T__3);
				this.state = 22;
				this.effect();
				}
				break;
			case EffectParser.IDENTIFIER:
				_localctx = new QuantifiedEffectContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 23;
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
	public concrete(): ConcreteContext {
		let _localctx: ConcreteContext = new ConcreteContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, EffectParser.RULE_concrete);
		try {
			this.state = 45;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				_localctx = new ReadOnlyContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 26;
				this.match(EffectParser.T__4);
				this.state = 27;
				this.match(EffectParser.T__5);
				this.state = 28;
				this.vars();
				this.state = 29;
				this.match(EffectParser.T__6);
				}
				break;

			case 2:
				_localctx = new UpdateOnlyContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 31;
				this.match(EffectParser.T__7);
				this.state = 32;
				this.match(EffectParser.T__5);
				this.state = 33;
				this.vars();
				this.state = 34;
				this.match(EffectParser.T__6);
				}
				break;

			case 3:
				_localctx = new ReadAndUpdateContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 36;
				this.match(EffectParser.T__4);
				this.state = 37;
				this.match(EffectParser.T__5);
				this.state = 38;
				this.vars();
				this.state = 39;
				this.match(EffectParser.T__8);
				this.state = 40;
				this.match(EffectParser.T__5);
				this.state = 41;
				this.vars();
				this.state = 42;
				this.match(EffectParser.T__6);
				}
				break;

			case 4:
				_localctx = new PureContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 44;
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
		this.enterRule(_localctx, 4, EffectParser.RULE_vars);
		let _la: number;
		try {
			this.state = 67;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				_localctx = new ConcreteVariablesContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 55;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === EffectParser.T__10) {
					{
					this.state = 47;
					this.stateVarRef();
					this.state = 52;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === EffectParser.T__1) {
						{
						{
						this.state = 48;
						this.match(EffectParser.T__1);
						this.state = 49;
						this.stateVarRef();
						}
						}
						this.state = 54;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				}
				break;

			case 2:
				_localctx = new QuantifiedVariablesContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 65;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === EffectParser.IDENTIFIER) {
					{
					this.state = 57;
					this.match(EffectParser.IDENTIFIER);
					this.state = 62;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === EffectParser.T__1) {
						{
						{
						this.state = 58;
						this.match(EffectParser.T__1);
						this.state = 59;
						this.match(EffectParser.IDENTIFIER);
						}
						}
						this.state = 64;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
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
	public stateVarRef(): StateVarRefContext {
		let _localctx: StateVarRefContext = new StateVarRefContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, EffectParser.RULE_stateVarRef);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 69;
			this.match(EffectParser.T__10);
			this.state = 70;
			this.match(EffectParser.IDENTIFIER);
			this.state = 71;
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x0EL\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x03\x02\x03\x02\x03\x02" +
		"\x03\x02\x03\x02\x07\x02\x10\n\x02\f\x02\x0E\x02\x13\v\x02\x05\x02\x15" +
		"\n\x02\x03\x02\x03\x02\x03\x02\x03\x02\x05\x02\x1B\n\x02\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03" +
		"0\n\x03\x03\x04\x03\x04\x03\x04\x07\x045\n\x04\f\x04\x0E\x048\v\x04\x05" +
		"\x04:\n\x04\x03\x04\x03\x04\x03\x04\x07\x04?\n\x04\f\x04\x0E\x04B\v\x04" +
		"\x05\x04D\n\x04\x05\x04F\n\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05" +
		"\x02\x02\x02\x06\x02\x02\x04\x02\x06\x02\b\x02\x02\x02\x02S\x02\x1A\x03" +
		"\x02\x02\x02\x04/\x03\x02\x02\x02\x06E\x03\x02\x02\x02\bG\x03\x02\x02" +
		"\x02\n\x1B\x05\x04\x03\x02\v\x14\x07\x03\x02\x02\f\x11\x05\x02\x02\x02" +
		"\r\x0E\x07\x04\x02\x02\x0E\x10\x05\x02\x02\x02\x0F\r\x03\x02\x02\x02\x10" +
		"\x13\x03\x02\x02\x02\x11\x0F\x03\x02\x02\x02\x11\x12\x03\x02\x02\x02\x12" +
		"\x15\x03\x02\x02\x02\x13\x11\x03\x02\x02\x02\x14\f\x03\x02\x02\x02\x14" +
		"\x15\x03\x02\x02\x02\x15\x16\x03\x02\x02\x02\x16\x17\x07\x05\x02\x02\x17" +
		"\x18\x07\x06\x02\x02\x18\x1B\x05\x02\x02\x02\x19\x1B\x07\x0E\x02\x02\x1A" +
		"\n\x03\x02\x02\x02\x1A\v\x03\x02\x02\x02\x1A\x19\x03\x02\x02\x02\x1B\x03" +
		"\x03\x02\x02\x02\x1C\x1D\x07\x07\x02\x02\x1D\x1E\x07\b\x02\x02\x1E\x1F" +
		"\x05\x06\x04\x02\x1F \x07\t\x02\x02 0\x03\x02\x02\x02!\"\x07\n\x02\x02" +
		"\"#\x07\b\x02\x02#$\x05\x06\x04\x02$%\x07\t\x02\x02%0\x03\x02\x02\x02" +
		"&\'\x07\x07\x02\x02\'(\x07\b\x02\x02()\x05\x06\x04\x02)*\x07\v\x02\x02" +
		"*+\x07\b\x02\x02+,\x05\x06\x04\x02,-\x07\t\x02\x02-0\x03\x02\x02\x02." +
		"0\x07\f\x02\x02/\x1C\x03\x02\x02\x02/!\x03\x02\x02\x02/&\x03\x02\x02\x02" +
		"/.\x03\x02\x02\x020\x05\x03\x02\x02\x0216\x05\b\x05\x0223\x07\x04\x02" +
		"\x0235\x05\b\x05\x0242\x03\x02\x02\x0258\x03\x02\x02\x0264\x03\x02\x02" +
		"\x0267\x03\x02\x02\x027:\x03\x02\x02\x0286\x03\x02\x02\x0291\x03\x02\x02" +
		"\x029:\x03\x02\x02\x02:F\x03\x02\x02\x02;@\x07\x0E\x02\x02<=\x07\x04\x02" +
		"\x02=?\x07\x0E\x02\x02><\x03\x02\x02\x02?B\x03\x02\x02\x02@>\x03\x02\x02" +
		"\x02@A\x03\x02\x02\x02AD\x03\x02\x02\x02B@\x03\x02\x02\x02C;\x03\x02\x02" +
		"\x02CD\x03\x02\x02\x02DF\x03\x02\x02\x02E9\x03\x02\x02\x02EC\x03\x02\x02" +
		"\x02F\x07\x03\x02\x02\x02GH\x07\r\x02\x02HI\x07\x0E\x02\x02IJ\x07\r\x02" +
		"\x02J\t\x03\x02\x02\x02\v\x11\x14\x1A/69@CE";
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
	public vars(): VarsContext {
		return this.getRuleContext(0, VarsContext);
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
	public vars(): VarsContext {
		return this.getRuleContext(0, VarsContext);
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
	public vars(): VarsContext[];
	public vars(i: number): VarsContext;
	public vars(i?: number): VarsContext | VarsContext[] {
		if (i === undefined) {
			return this.getRuleContexts(VarsContext);
		} else {
			return this.getRuleContext(i, VarsContext);
		}
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
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return EffectParser.RULE_vars; }
	public copyFrom(ctx: VarsContext): void {
		super.copyFrom(ctx);
	}
}
export class ConcreteVariablesContext extends VarsContext {
	public stateVarRef(): StateVarRefContext[];
	public stateVarRef(i: number): StateVarRefContext;
	public stateVarRef(i?: number): StateVarRefContext | StateVarRefContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StateVarRefContext);
		} else {
			return this.getRuleContext(i, StateVarRefContext);
		}
	}
	constructor(ctx: VarsContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterConcreteVariables) {
			listener.enterConcreteVariables(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitConcreteVariables) {
			listener.exitConcreteVariables(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitConcreteVariables) {
			return visitor.visitConcreteVariables(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class QuantifiedVariablesContext extends VarsContext {
	public IDENTIFIER(): TerminalNode[];
	public IDENTIFIER(i: number): TerminalNode;
	public IDENTIFIER(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(EffectParser.IDENTIFIER);
		} else {
			return this.getToken(EffectParser.IDENTIFIER, i);
		}
	}
	constructor(ctx: VarsContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: EffectListener): void {
		if (listener.enterQuantifiedVariables) {
			listener.enterQuantifiedVariables(this);
		}
	}
	// @Override
	public exitRule(listener: EffectListener): void {
		if (listener.exitQuantifiedVariables) {
			listener.exitQuantifiedVariables(this);
		}
	}
	// @Override
	public accept<Result>(visitor: EffectVisitor<Result>): Result {
		if (visitor.visitQuantifiedVariables) {
			return visitor.visitQuantifiedVariables(this);
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


