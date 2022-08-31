// Generated from ./src/generated/Effect.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class EffectLexer extends Lexer {
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

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "T__7", "T__8", 
		"T__9", "T__10", "T__11", "IDENTIFIER", "WS",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "', '", "')'", "'=>'", "'Read'", "'['", "']'", "'Update'", 
		"'&'", "'Pure'", "'Temporal'", "'''",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, undefined, undefined, "IDENTIFIER", 
		"WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(EffectLexer._LITERAL_NAMES, EffectLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return EffectLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(EffectLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "Effect.g4"; }

	// @Override
	public get ruleNames(): string[] { return EffectLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return EffectLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return EffectLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return EffectLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x10a\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03" +
		"\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
		"\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x03" +
		"\f\x03\f\x03\f\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x07\x0EN\n\x0E" +
		"\f\x0E\x0E\x0EQ\v\x0E\x03\x0E\x03\x0E\x06\x0EU\n\x0E\r\x0E\x0E\x0EV\x05" +
		"\x0EY\n\x0E\x03\x0F\x06\x0F\\\n\x0F\r\x0F\x0E\x0F]\x03\x0F\x03\x0F\x02" +
		"\x02\x02\x10\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r" +
		"\x02\b\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B" +
		"\x02\x0F\x1D\x02\x10\x03\x02\x06\x04\x02C\\c|\x06\x022;C\\aac|\x03\x02" +
		"aa\x05\x02\v\f\x0F\x0F\"\"\x02d\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02" +
		"\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02" +
		"\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02" +
		"\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02\x02\x02\x02\x17\x03\x02\x02" +
		"\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02\x02\x02\x02\x1D\x03\x02\x02" +
		"\x02\x03\x1F\x03\x02\x02\x02\x05!\x03\x02\x02\x02\x07$\x03\x02\x02\x02" +
		"\t&\x03\x02\x02\x02\v)\x03\x02\x02\x02\r.\x03\x02\x02\x02\x0F0\x03\x02" +
		"\x02\x02\x112\x03\x02\x02\x02\x139\x03\x02\x02\x02\x15;\x03\x02\x02\x02" +
		"\x17@\x03\x02\x02\x02\x19I\x03\x02\x02\x02\x1BX\x03\x02\x02\x02\x1D[\x03" +
		"\x02\x02\x02\x1F \x07*\x02\x02 \x04\x03\x02\x02\x02!\"\x07.\x02\x02\"" +
		"#\x07\"\x02\x02#\x06\x03\x02\x02\x02$%\x07+\x02\x02%\b\x03\x02\x02\x02" +
		"&\'\x07?\x02\x02\'(\x07@\x02\x02(\n\x03\x02\x02\x02)*\x07T\x02\x02*+\x07" +
		"g\x02\x02+,\x07c\x02\x02,-\x07f\x02\x02-\f\x03\x02\x02\x02./\x07]\x02" +
		"\x02/\x0E\x03\x02\x02\x0201\x07_\x02\x021\x10\x03\x02\x02\x0223\x07W\x02" +
		"\x0234\x07r\x02\x0245\x07f\x02\x0256\x07c\x02\x0267\x07v\x02\x0278\x07" +
		"g\x02\x028\x12\x03\x02\x02\x029:\x07(\x02\x02:\x14\x03\x02\x02\x02;<\x07" +
		"R\x02\x02<=\x07w\x02\x02=>\x07t\x02\x02>?\x07g\x02\x02?\x16\x03\x02\x02" +
		"\x02@A\x07V\x02\x02AB\x07g\x02\x02BC\x07o\x02\x02CD\x07r\x02\x02DE\x07" +
		"q\x02\x02EF\x07t\x02\x02FG\x07c\x02\x02GH\x07n\x02\x02H\x18\x03\x02\x02" +
		"\x02IJ\x07)\x02\x02J\x1A\x03\x02\x02\x02KO\t\x02\x02\x02LN\t\x03\x02\x02" +
		"ML\x03\x02\x02\x02NQ\x03\x02\x02\x02OM\x03\x02\x02\x02OP\x03\x02\x02\x02" +
		"PY\x03\x02\x02\x02QO\x03\x02\x02\x02RT\t\x04\x02\x02SU\t\x03\x02\x02T" +
		"S\x03\x02\x02\x02UV\x03\x02\x02\x02VT\x03\x02\x02\x02VW\x03\x02\x02\x02" +
		"WY\x03\x02\x02\x02XK\x03\x02\x02\x02XR\x03\x02\x02\x02Y\x1C\x03\x02\x02" +
		"\x02Z\\\t\x05\x02\x02[Z\x03\x02\x02\x02\\]\x03\x02\x02\x02][\x03\x02\x02" +
		"\x02]^\x03\x02\x02\x02^_\x03\x02\x02\x02_`\b\x0F\x02\x02`\x1E\x03\x02" +
		"\x02\x02\x07\x02OVX]\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!EffectLexer.__ATN) {
			EffectLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(EffectLexer._serializedATN));
		}

		return EffectLexer.__ATN;
	}

}

