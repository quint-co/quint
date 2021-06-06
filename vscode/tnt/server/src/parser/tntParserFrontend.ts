/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { CharStreams, CommonTokenStream, ANTLRErrorListener, Recognizer, RecognitionException } from 'antlr4ts';

import { TntLexer } from './generated/TntLexer';
import { TntParser } from './generated/TntParser';

export interface ParseOk {
    kind: "ok"
}

export interface ErrorMessage {
    explanation: string;
    lineNo: number;
    charNo: number;
    length: number;
}

export interface ParseErrors {
    kind: "error";
    messages: ErrorMessage[]
}

export type ParseResult = ParseOk | ParseErrors

// The main entry point for the TNT parser
export function parseModule(text: string): ParseResult {
    // Create the lexer and parser
    let inputStream = CharStreams.fromString(text);
    let lexer = new TntLexer(inputStream);
    let tokenStream = new CommonTokenStream(lexer);
    let parser = new TntParser(tokenStream);
    let errorMessages = new Array<ErrorMessage>();
    parser.removeErrorListeners(); // remove ConsoleErrorListener
    parser.addErrorListener({
        syntaxError: ((recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
                let len = (offendingSymbol)
                    ? (1 + offendingSymbol.stopIndex - offendingSymbol.startIndex)
                    : 1;
                errorMessages.push({explanation: msg, lineNo: line - 1, charNo: charPositionInLine, length: len})
            })
    });
    let tree = parser.module();
    if (errorMessages.length > 0) {
        return { kind: "error", messages: errorMessages }
    } else {
        return { kind: "ok" }
    }
}
