import * as p from './generated/TntParser';
import { TntListener } from './generated/TntListener';
import { OpQualifier, TntDef, TntModule, TntEx, TntOpDef } from './tntIr';
import { TntType, TntTypeTag, TntUntyped } from './tntTypes';
import { assert } from 'console';
import { ErrorMessage } from './tntParserFrontend';

/**
 * An ANTLR4 listener that constructs TntIr objects out of the abstract
 * syntax tree. This listener does the minimal work to translate the AST
 * into IR. All semantic checks and type checking must be done at later
 * phases, as the IR may be constructed by other means.
 *
 * @author Igor Konnov
 */
export class ToIrListener implements TntListener {
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
    // the stack of expressions
    private exprStack: TntEx[] = []
    // an internal counter to assign unique numbers
    private lastId: bigint = 1n

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

    /****************** translate operator definititons **********************/

    // translate a top-level or inner: val foo: type = ...
    exitValDef(ctx: p.ValDefContext) {
        const name = ctx.IDENTIFIER().text
        let typeTag: TntTypeTag | undefined = this.typeStack.pop()
        if (typeTag == undefined) {
            // the value may be tagged with '_'
            typeTag = this.untypedStack.pop()
        }
        const body = this.exprStack.pop()
        if (body) {
            let def: TntOpDef = {
                id: this.nextId(), kind: "def", name: name, params: [],
                qualifier: OpQualifier.Val, isPrivate: true, body: body
            }
            if (typeTag) {
                def.typeTag = typeTag
            }
            this.definitionStack.push(def)
        } else {
            assert(false, "undefined body in exitValDef")
        }
    }

    // translate a top-level val
    exitVal(ctx: p.ValContext) {
        const valDef = this.definitionStack[this.definitionStack.length - 1]
        if (valDef && valDef.kind == "def") {
            valDef.isPrivate = !(ctx.PRIVATE() == undefined)
        } else {
            assert(false, "undefined valDef in exitVal")
        }
    }

    /********************* translate expressions **************************/
    exitLiteralOrId(ctx: p.LiteralOrIdContext) {
        const ident = ctx.IDENTIFIER()
        if (ident) {            // we have met an identifier
            this.exprStack.push({ id: this.nextId(),
                kind: "name", name: ident.text })
        }
        const intNode = ctx.INT()
        if (intNode) {          // we have met an integer literal
            this.exprStack.push({ id: this.nextId(), kind: "int",
                typeTag: { kind: "int" }, value: BigInt(intNode.text) })
        }
        const boolNode = ctx.BOOL()
        if (boolNode) {         // we have met a Boolean literal
            this.exprStack.push({ id: this.nextId(), kind: "bool",
                typeTag: { kind: "bool" }, value: (boolNode.text == "true") })
        }
        const strNode = ctx.STRING()
        if (strNode) {          // we have met a string
            this.exprStack.push({ id: this.nextId(), kind: "str",
                typeTag: { kind: "str" }, value: strNode.text })
        }
    }

    // '+' or '-'
    exitPlusMinus(ctx: p.PlusMinusContext) {
        const opcode = (ctx.ADD() != undefined) ? "add" : "sub"
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "oper", opcode: opcode, args: args })
    }

    // '*', '/', or '%'
    exitMultDiv(ctx: p.MultDivContext) {
        const op = ctx._op
        if (op) {
            let opcode = ""
            switch (op.type) {
                case p.TntParser.MUL: opcode = "mul"; break;
                case p.TntParser.DIV: opcode = "div"; break;
                case p.TntParser.MOD: opcode = "mod"; break;
            }
            const args = this.popExprs(2)
            this.exprStack.push({ id: this.nextId(),
                kind: "oper", opcode: opcode, args: args })
        }
    }

    exitPow(ctx: p.PowContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "oper", opcode: "pow", args: args })
    }

    exitUminus(ctx: p.UminusContext) {
        const arg = this.exprStack.pop()
        if (arg) {
            this.exprStack.push({ id: this.nextId(),
                kind: "oper", opcode: "uminus", args: [ arg ] })
        }
    }

    // GT | LT | GE | LE | NE | EQEQ | EQ | ASGN | IN | NOTIN | SUBSETEQ
    exitRelations(ctx: p.RelationsContext) {
        const op = ctx._op
        if (op) {
            let opcode = ""
            switch (op.type) {
                case p.TntParser.GT: opcode = "gt"; break;
                case p.TntParser.GE: opcode = "gte"; break;
                case p.TntParser.LT: opcode = "lt"; break;
                case p.TntParser.LE: opcode = "lte"; break;
                case p.TntParser.EQ: opcode = "eq"; break;
                case p.TntParser.EQEQ: opcode = "eq"; break;
                case p.TntParser.ASGN: opcode = "assign"; break;
                case p.TntParser.NE: opcode = "neq"; break;
                case p.TntParser.IN: opcode = "in"; break;
                case p.TntParser.NOTIN: opcode = "notin"; break;
                case p.TntParser.SUBSETEQ: opcode = "subseteq"; break;
            }
            const args = this.popExprs(2)
            this.exprStack.push({ id: this.nextId(),
                kind: "oper", opcode: opcode, args: args })
        }
    }

    /********************* translate types ********************************/

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
        assert(size > 0, "exitTypeUnionRec: size == 0");
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
                    assert(false, "no union in exitTypeUnionRec");
                }
            }
            this.typeStack.push({ kind: "union", tag: tag, records: records });
        } else {
            assert(false, "no union in exitTypeUnionRec");
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
            assert(false, "no underscores in exitUntyped1");
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
        assert(this.typeStack.length >= n, "too few elements in typeStack")
        const types: TntType[] = this.typeStack.slice(-n);
        this.typeStack = this.typeStack.slice(0, -n);
        return types;
    }

    // pop n elements out of untypedStack
    private popUntyped(n: number): TntUntyped[] {
        assert(this.untypedStack.length >= n, "too few elements in untypedStack")
        const untyped: TntUntyped[] = this.untypedStack.slice(-n);
        this.untypedStack = this.untypedStack.slice(0, -n);
        return untyped;
    }

    // pop n expressions out of exprStack
    private popExprs(n: number): TntEx[] {
        assert(this.exprStack.length >= n, "too few elements in exprStack")
        const es: TntEx[] = this.exprStack.slice(-n);
        this.exprStack = this.exprStack.slice(0, -n);
        return es;
    }

    // pop a type or an untyped signature, depending on the flag
    private popTypeTag(isTyped: boolean): TntTypeTag {
        if (isTyped) {
            // the user has specified a type
            const tp = this.typeStack.pop();
            if (tp) {
                return tp;
            } else {
                assert(false, "no type in popTypeTag");
            }
        } else {
            // the user has specified an untyped signature
            const untyped = this.untypedStack.pop();
            if (untyped) {
                return untyped;
            } else {
                assert(false, "no untyped in popTypeTag");
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
