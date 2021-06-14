/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { CharStreams, CommonTokenStream } from 'antlr4ts';

import { TntLexer } from './generated/TntLexer';
import * as p from './generated/TntParser';
import { TntListener } from './generated/TntListener';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

import './tntIr';
import { TntDef, TntModule } from './tntIr';
import { TntType, TntTypeTag, TntUntyped } from './tntTypes';
import { assert } from 'console';

export interface ErrorMessage {
    explanation: string;
    start: { line: number; col: number; }
    end:   { line: number; col: number; }
}

export type ParseResult =
    | { kind: "ok", module: TntModule }
    | { kind: "error", messages: ErrorMessage[] }

/**
 * Phase 1 of the TNT parser. Read a string in the TNT syntax and produce the IR.
 * Note that the IR may be ill-typed and some names may be unresolved.
 * The main goal of this pass is to translate a sequence of characters into IR.
 */
export function parsePhase1(text: string): ParseResult {
    // Create the lexer and parser
    let inputStream = CharStreams.fromString(text);
    let lexer = new TntLexer(inputStream);
    let tokenStream = new CommonTokenStream(lexer);
    let parser = new p.TntParser(tokenStream);
    let errorMessages = new Array<ErrorMessage>();
    // remove ConsoleErrorListener that outputs to console
    parser.removeErrorListeners();
    // add our listener that collects errors
    parser.addErrorListener({
        syntaxError: ((recognizer, offendingSymbol, line, charPositionInLine, msg, e) => {
                let len = (offendingSymbol)
                    ? (1 + offendingSymbol.stopIndex - offendingSymbol.startIndex)
                    : 1;
                const start = { line: line - 1, col: charPositionInLine }
                const end = { line: line - 1, col: charPositionInLine + len }
                errorMessages.push({ explanation: msg, start, end })
            })
    });
    // run the parser
    let tree = parser.module();
    if (errorMessages.length > 0) {
        // report the errors
        return { kind: "error", messages: errorMessages }
    } else {
        // walk through the AST and construct the IR
        const listener = new ToIrListener();
        ParseTreeWalker.DEFAULT.walk(listener as TntListener, tree)

        if (listener.errors.length > 0) {
            return { kind: "error", messages: listener.errors }
        } else if (listener.rootModule != undefined) {
            return { kind: "ok", module: listener.rootModule }
        } else {
            // this case should not be possible, but we handle it just in case
            const start = { line: tree.start.line, col: tree.start.charPositionInLine }
            const end = tree.stop
              ? { line: tree.stop.line, col: tree.stop.charPositionInLine }
              : start
            const msg = { start: start, end: end, explanation: "undefined root module" }
            return { kind: "error", messages: [msg] }
        }
    }
}

/**
 * An ANTLR4 listener that constructs TntIr objects out of the abstract
 * syntax tree.
 * 
 * @author Igor Konnov
 */
class ToIrListener implements TntListener {
    /**
     * The module that is constructed in the end 
     */
    rootModule?: TntModule = undefined
    /**
     * If errors occur in the listener, this array contains explanations.
     */
    errors: ErrorMessage[] = []
    // the stack of definitions
    private definitionStack: TntDef[] = []
    // the stack of types
    private typeStack: TntType[] = []
    // the stack of untyped signatures
    private untypedStack: TntUntyped[] = []
    // an internal counter to assign unique numbers
    private lastId: bigint = 1n

    exitModule(ctx: p.ModuleContext) {
        const module: TntModule = {
            id: this.nextId(),
            name: ctx.IDENTIFIER()[0].text,
            extends: ctx.IDENTIFIER().slice(1).map( (node) => node.text ),
            defs: this.definitionStack
        }
        this.definitionStack = []   // reset the definitions
        this.rootModule = module
    }

    exitConst(ctx: p.ConstContext) {
        let typeTag: TntTypeTag = { kind: "untyped", paramArities: [] }

        if (ctx.type()) {
            // the user has specified a type
            const tp = this.typeStack.pop()
            if (tp) {
                typeTag = tp
            }
        } else {
            // the user has specified an untyped signature
            const untyped = this.untypedStack.pop()
            if (untyped) {
                typeTag = untyped
            }
        }

        const constDef: TntDef = {
            kind: "const", name: ctx.IDENTIFIER().text,
            typeTag: typeTag, id: this.nextId()
        }
        this.definitionStack.push(constDef)
}

    // translating type via typeStack
    exitTypeInt(ctx: p.TypeIntContext) {
        this.typeStack.push({ kind: "int" })
    }

    exitTypeBool(ctx: p.TypeBoolContext) {
        this.typeStack.push({ kind: "bool" })
    }

    exitTypeStr(ctx: p.TypeStrContext) {
        this.typeStack.push({ kind: "str" })
    }

    exitTypeConstOrVar(ctx: p.TypeConstOrVarContext) {
        const name = ctx.IDENTIFIER().text
        if (name.length == 1 && name.match("[a-z]") ) {
            // a type variable from: a, b, ... z
            this.typeStack.push({ kind: "var", name: name })
        } else {
            // a type constant, e.g., declared via typedef
            this.typeStack.push({ kind: "const", name: name })
        }
    }

    exitTypeSet(ctx: p.TypeSetContext) {
        const last = this.typeStack.pop()
        if (last != undefined) {
            this.typeStack.push({ kind: "set", elem: last })
        } // the other cases are excluded by the parser
    }

    exitTypeSeq(ctx: p.TypeSetContext) {
        const top = this.typeStack.pop()
        if (top != undefined) {
            this.typeStack.push({ kind: "seq", elem: top })
        } // the other cases are excluded by the parser
    }

    exitTypeFun(ctx: p.TypeFunContext) {
        const res = this.typeStack.pop()
        const arg = this.typeStack.pop()
        if (arg != undefined && res != undefined) {
            this.typeStack.push({ kind: "fun", arg: arg, res: res })
        }
    }

    exitTypeTuple(ctx: p.TypeTupleContext) {
        // the type stack contains the types of the elements
        const elemTypes: TntType[] = this.popTypes(ctx.type().length)
        this.typeStack.push({ kind: "tuple", elems: elemTypes })
    }

    exitTypeRec(ctx: p.TypeRecContext) {
        // The type stack contains the types of the fields.
        // We have to match them with the field names.
        const names = ctx.IDENTIFIER().map((n) => n.text)
        const elemTypes: TntType[] = this.popTypes(ctx.type().length)
        // since TS does not have zip, a loop is the easiest solution
        let pairs = []
        for (var i = 0; i < names.length; i++) {
            pairs.push( { fieldName: names[i], fieldType: elemTypes[i] })
        }
        this.typeStack.push({ kind: "record", fields: pairs })
    }

    exitTypeUnionRec(ctx: p.TypeUnionRecContext) {
        // combine a disjoint union out of singletons
        const size = ctx.typeUnionRecOne().length
        assert(size > 0)
        const singletonUnions: TntType[] = this.popTypes(size)
        if (singletonUnions[0].kind == "union") {
            const tag = singletonUnions[0].tag
            let records = singletonUnions[0].records
            for (var i = 1; i < size; i++) {
                const one = singletonUnions[i]
                if (one.kind == "union") {
                    if (one.tag == tag) {
                        records = records.concat(one.records)
                    } else {
                        const msg =
                        `TNT011: Records in disjoint union have different tag fields: ${tag} and ${one.tag}`
                        const start = { line: ctx.start.line, col: ctx.start.charPositionInLine }
                        const end = ctx.stop
                            ? { line: ctx.stop.line, col: ctx.stop.charPositionInLine }
                            : start
                        this.errors.push({ explanation: msg, start: start, end: end })
                    }
                } else {
                    assert(false)
                }
            }
            this.typeStack.push({ kind: "union", tag: tag, records: records })
        } else {
            assert(false)
        }
    }

    exitTypeUnionRecOne(ctx: p.TypeUnionRecOneContext) {
        // One option of a disjoint union.
        // The type stack contains the types of the fields.
        // We have to match them with the field names.
        const names = ctx.IDENTIFIER().map((n) => n.text)
        // the first name is the tag name (according to the grammar)
        const tagName = names[0]
        const tagVal = ctx.STRING().toString().slice(1, -1)
        // the other names are field names
        const elemTypes: TntType[] = this.popTypes(ctx.type().length)
        // since TS does not have zip, a loop is the easiest solution
        let pairs = []
        for (var i = 1; i < names.length; i++) {
            pairs.push({ fieldName: names[i], fieldType: elemTypes[i - 1] })
        }
        // construct a singleton disjoint union, which should be assembled above
        const singleton: TntTypeTag = {
            kind: "union", tag: tagName,
		    records: [{ tagValue: tagVal, fields: pairs }]
	    }

        this.typeStack.push(singleton)
    }

    exitTypeOper(ctx: p.TypeOperContext) {
        const resType = this.typeStack.pop()
        const nargs = ctx.type().length - 1
        const argTypes: TntType[] = this.popTypes(nargs)
        if (resType != undefined && argTypes.length == nargs) {
            this.typeStack.push({ kind: "oper", args: argTypes, res: resType })
        }
    }

    // translate untyped signatures
    exitUntyped0(ctx: p.Untyped0Context) {
        // just an '_'
        this.untypedStack.push({ kind: "untyped", paramArities: [] })
    }

    exitUntyped1(ctx: p.Untyped1Context) {
        // an untyped signature like (_, _) => _
        // count the number of underscores; the last one going to the result
        const nunderscores = ctx.children?.filter((value) => value.text == "_").length
        if (nunderscores) {
            let allZeroes = new Array(nunderscores - 1).fill(0)
            this.untypedStack.push({ kind: "untyped", paramArities: allZeroes })
        } else {
            assert(false)
        }
    }

    exitUntyped2Sig(ctx: p.Untyped2SigContext) {
        // A higher-order untyped signature like (_, (_, _) => _) => _.
        // Since the signatures of the arguments are either values or level 0 signatures,
        // we only have to count the number of their arguments.
        const arities = this.popUntyped(ctx.untyped01().length).map((u) => u.paramArities.length)
        this.untypedStack.push({ kind: "untyped", paramArities: arities })
    }

    // pop n elements out of typeStack
    private popTypes(n: number): TntType[] {
        const types: TntType[] = this.typeStack.slice(-n)
        this.typeStack = this.typeStack.slice(0, -n)
        return types
    }

    // pop n elements out of untypedStack
    private popUntyped(n: number): TntUntyped[] {
        const untyped: TntUntyped[] = this.untypedStack.slice(-n)
        this.untypedStack = this.untypedStack.slice(0, -n)
        return untyped
    }

    // produce the next number in a sequence
    private nextId(): bigint {
        const id = this.lastId
        this.lastId += 1n
        return id
    }
}