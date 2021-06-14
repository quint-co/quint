import * as p from './generated/TntParser';
import { TntListener } from './generated/TntListener';
import { TntDef, TntModule } from './tntIr';
import { TntType, TntTypeTag, TntUntyped } from './tntTypes';
import { assert } from 'console';
import { ErrorMessage } from './tntParserFrontend';

/**
 * An ANTLR4 listener that constructs TntIr objects out of the abstract
 * syntax tree.
 *
 * @author Igor Konnov
 */
export class ToIrListener implements TntListener {
    /**
     * The module that is constructed in the end
     */
    rootModule?: TntModule = undefined;
    /**
     * If errors occur in the listener, this array contains explanations.
     */
    errors: ErrorMessage[] = [];
    // the stack of definitions
    private definitionStack: TntDef[] = [];
    // the stack of types
    private typeStack: TntType[] = [];
    // the stack of untyped signatures
    private untypedStack: TntUntyped[] = [];
    // an internal counter to assign unique numbers
    private lastId: bigint = 1n;

    // translate: module...end
    exitModule(ctx: p.ModuleContext) {
        const module: TntModule = {
            id: this.nextId(),
            name: ctx.IDENTIFIER()[0].text,
            extends: ctx.IDENTIFIER().slice(1).map((node) => node.text),
            defs: this.definitionStack
        };
        this.definitionStack = []; // reset the definitions
        this.rootModule = module;
    }

    // translate: const x: type, const x: _
    exitConst(ctx: p.ConstContext) {
        let typeTag = this.popTypeTag(ctx.type() != undefined);

        const constDef: TntDef = {
            kind: "const", name: ctx.IDENTIFIER().text,
            typeTag: typeTag, id: this.nextId()
        };
        this.definitionStack.push(constDef);
    }

    // translate: var x: type, var: x: _
    exitVar(ctx: p.VarContext) {
        let typeTag = this.popTypeTag(ctx.type() != undefined);

        const varDef: TntDef = {
            kind: "var", name: ctx.IDENTIFIER().text,
            typeTag: typeTag, id: this.nextId()
        };
        this.definitionStack.push(varDef);
    }

    // translating type via typeStack
    exitTypeInt(ctx: p.TypeIntContext) {
        this.typeStack.push({ kind: "int" });
    }

    exitTypeBool(ctx: p.TypeBoolContext) {
        this.typeStack.push({ kind: "bool" });
    }

    exitTypeStr(ctx: p.TypeStrContext) {
        this.typeStack.push({ kind: "str" });
    }

    exitTypeConstOrVar(ctx: p.TypeConstOrVarContext) {
        const name = ctx.IDENTIFIER().text;
        if (name.length == 1 && name.match("[a-z]")) {
            // a type variable from: a, b, ... z
            this.typeStack.push({ kind: "var", name: name });
        } else {
            // a type constant, e.g., declared via typedef
            this.typeStack.push({ kind: "const", name: name });
        }
    }

    exitTypeSet(ctx: p.TypeSetContext) {
        const last = this.typeStack.pop();
        if (last != undefined) {
            this.typeStack.push({ kind: "set", elem: last });
        } // the other cases are excluded by the parser
    }

    exitTypeSeq(ctx: p.TypeSetContext) {
        const top = this.typeStack.pop();
        if (top != undefined) {
            this.typeStack.push({ kind: "seq", elem: top });
        } // the other cases are excluded by the parser
    }

    exitTypeFun(ctx: p.TypeFunContext) {
        const res = this.typeStack.pop();
        const arg = this.typeStack.pop();
        if (arg != undefined && res != undefined) {
            this.typeStack.push({ kind: "fun", arg: arg, res: res });
        }
    }

    exitTypeTuple(ctx: p.TypeTupleContext) {
        // the type stack contains the types of the elements
        const elemTypes: TntType[] = this.popTypes(ctx.type().length);
        this.typeStack.push({ kind: "tuple", elems: elemTypes });
    }

    exitTypeRec(ctx: p.TypeRecContext) {
        // The type stack contains the types of the fields.
        // We have to match them with the field names.
        const names = ctx.IDENTIFIER().map((n) => n.text);
        const elemTypes: TntType[] = this.popTypes(ctx.type().length);
        // since TS does not have zip, a loop is the easiest solution
        let pairs = [];
        for (var i = 0; i < names.length; i++) {
            pairs.push({ fieldName: names[i], fieldType: elemTypes[i] });
        }
        this.typeStack.push({ kind: "record", fields: pairs });
    }

    exitTypeUnionRec(ctx: p.TypeUnionRecContext) {
        // combine a disjoint union out of singletons
        const size = ctx.typeUnionRecOne().length;
        assert(size > 0);
        const singletonUnions: TntType[] = this.popTypes(size);
        if (singletonUnions[0].kind == "union") {
            const tag = singletonUnions[0].tag;
            let records = singletonUnions[0].records;
            for (var i = 1; i < size; i++) {
                const one = singletonUnions[i];
                if (one.kind == "union") {
                    if (one.tag == tag) {
                        records = records.concat(one.records);
                    } else {
                        const msg = `TNT011: Records in disjoint union have different tag fields: ${tag} and ${one.tag}`;
                        const start = { line: ctx.start.line, col: ctx.start.charPositionInLine };
                        const end = ctx.stop
                            ? { line: ctx.stop.line, col: ctx.stop.charPositionInLine }
                            : start;
                        this.errors.push({ explanation: msg, start: start, end: end });
                    }
                } else {
                    assert(false);
                }
            }
            this.typeStack.push({ kind: "union", tag: tag, records: records });
        } else {
            assert(false);
        }
    }

    exitTypeUnionRecOne(ctx: p.TypeUnionRecOneContext) {
        // One option of a disjoint union.
        // The type stack contains the types of the fields.
        // We have to match them with the field names.
        const names = ctx.IDENTIFIER().map((n) => n.text);
        // the first name is the tag name (according to the grammar)
        const tagName = names[0];
        const tagVal = ctx.STRING().toString().slice(1, -1);
        // the other names are field names
        const elemTypes: TntType[] = this.popTypes(ctx.type().length);
        // since TS does not have zip, a loop is the easiest solution
        let pairs = [];
        for (var i = 1; i < names.length; i++) {
            pairs.push({ fieldName: names[i], fieldType: elemTypes[i - 1] });
        }
        // construct a singleton disjoint union, which should be assembled above
        const singleton: TntTypeTag = {
            kind: "union", tag: tagName,
            records: [{ tagValue: tagVal, fields: pairs }]
        };

        this.typeStack.push(singleton);
    }

    exitTypeOper(ctx: p.TypeOperContext) {
        const resType = this.typeStack.pop();
        const nargs = ctx.type().length - 1;
        const argTypes: TntType[] = this.popTypes(nargs);
        if (resType != undefined && argTypes.length == nargs) {
            this.typeStack.push({ kind: "oper", args: argTypes, res: resType });
        }
    }

    // translate untyped signatures
    exitUntyped0(ctx: p.Untyped0Context) {
        // just an '_'
        this.untypedStack.push({ kind: "untyped", paramArities: [] });
    }

    exitUntyped1(ctx: p.Untyped1Context) {
        // an untyped signature like (_, _) => _
        // count the number of underscores; the last one going to the result
        const nunderscores = ctx.children?.filter((value) => value.text == "_").length;
        if (nunderscores) {
            let allZeroes = new Array(nunderscores - 1).fill(0);
            this.untypedStack.push({ kind: "untyped", paramArities: allZeroes });
        } else {
            assert(false);
        }
    }

    exitUntyped2Sig(ctx: p.Untyped2SigContext) {
        // A higher-order untyped signature like (_, (_, _) => _) => _.
        // Since the signatures of the arguments are either values or level 0 signatures,
        // we only have to count the number of their arguments.
        const arities = this.popUntyped(ctx.untyped01().length).map((u) => u.paramArities.length);
        this.untypedStack.push({ kind: "untyped", paramArities: arities });
    }

    // pop n elements out of typeStack
    private popTypes(n: number): TntType[] {
        const types: TntType[] = this.typeStack.slice(-n);
        this.typeStack = this.typeStack.slice(0, -n);
        return types;
    }

    // pop n elements out of untypedStack
    private popUntyped(n: number): TntUntyped[] {
        const untyped: TntUntyped[] = this.untypedStack.slice(-n);
        this.untypedStack = this.untypedStack.slice(0, -n);
        return untyped;
    }

    // pop a type or an untyped signature, depending on the flag
    private popTypeTag(isTyped: boolean): TntTypeTag {
        if (isTyped) {
            // the user has specified a type
            const tp = this.typeStack.pop();
            if (tp) {
                return tp;
            } else {
                assert(false);
            }
        } else {
            // the user has specified an untyped signature
            const untyped = this.untypedStack.pop();
            if (untyped) {
                return untyped;
            } else {
                assert(false);
            }
        }

        // this code is unreachable but tsc is not smart enough to see that
        return { kind: "untyped", paramArities: [] };
    }

    // produce the next number in a sequence
    private nextId(): bigint {
        const id = this.lastId;
        this.lastId += 1n;
        return id;
    }
}
