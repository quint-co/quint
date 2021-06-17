import * as p from './generated/TntParser';
import { TntListener } from './generated/TntListener';
import { OpQualifier, TntDef, TntModule, TntEx, TntOpDef, OpScope, TntPattern } from './tntIr';
import { TntType, TntTypeTag, TntUntyped } from './tntTypes';
import { assert } from 'console';
import { ErrorMessage } from './tntParserFrontend';
import { TextDecoder } from 'util';

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
    // the stack of parameter patterns
    private patternStack: TntPattern[] = []
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
        const expr = this.exprStack.pop()
        if (expr) {
            let def: TntOpDef = {
                id: this.nextId(), kind: "def", name: name,
                qualifier: OpQualifier.Val, scope: OpScope.Local, expr: expr
            }
            if (typeTag) {
                def.typeTag = typeTag
            }
            this.definitionStack.push(def)
        } else {
            assert(false, "undefined expr in exitValDef")
        }
    }

    // translate a top-level val
    exitVal(ctx: p.ValContext) {
        const valDef = this.definitionStack[this.definitionStack.length - 1]
        if (valDef && valDef.kind == "def") {
            valDef.scope = (ctx.PRIVATE()) ? OpScope.Private : OpScope.Public
        } else {
            assert(false, "undefined valDef in exitVal")
        }
    }

    /********************* translate expressions **************************/

    // an identifier or a literal, e.g., foo, 42, "hello", false
    exitLiteralOrId(ctx: p.LiteralOrIdContext) {
        const ident = ctx.IDENTIFIER()
        if (ident) {            // we have met an identifier
            this.exprStack.push({ id: this.nextId(),
                kind: "name", name: ident.text })
        }
        const intNode = ctx.INT()
        if (intNode) {          // we have met an integer literal
            this.exprStack.push({ id: this.nextId(), kind: "int",
                typeTag: { kind: "int" }, value: BigInt(intNode.text)
            })
        }
        const boolNode = ctx.BOOL()
        if (boolNode) {         // we have met a Boolean literal
            this.exprStack.push({ id: this.nextId(), kind: "bool",
                typeTag: { kind: "bool" }, value: (boolNode.text == "true")
            })
        }
        const strNode = ctx.STRING()
        if (strNode) {          // we have met a string, remove the quotes!
            this.exprStack.push({ id: this.nextId(), kind: "str",
                typeTag: { kind: "str" }, value: strNode.text.slice(1, -1)
            })
        }
    }

    // function application, e.g., f[10]
    exitFunApp(ctx: p.FunAppContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "of", args: args })
    }

    // operator application in the normal form, e.g., MyOper("foo", 42)
    exitOperApp(ctx: p.OperAppContext) {
        const name = ctx.IDENTIFIER().text
        const wrappedArgs = this.exprStack.pop()
        if (wrappedArgs && wrappedArgs.kind == "opapp") {
            this.exprStack.push({ id: wrappedArgs.id,
                kind: "opapp", opcode: name, args: wrappedArgs.args
            })
        } else {
            assert(false, "exitOperApp: expected wrapped arguments")
        }
    }

    // infix operator application, e.g., S union T
    exitInfixCall(ctx: p.InfixCallContext) {
        const name = ctx.IDENTIFIER().text
        const wrappedArgs = this.exprStack.pop()
        const firstArg = this.exprStack.pop()
        if (firstArg && wrappedArgs && wrappedArgs.kind == "opapp") {
            this.exprStack.push({ id: wrappedArgs.id,
                kind: "opapp", opcode: name,
                args: [firstArg].concat(wrappedArgs.args)
            })
        } else {
            assert(false, "exitInfixCall: expected leading arg and wrapped arguments")
        }
    }

    // a list of arguments
    exitArg_list(ctx: p.Arg_listContext) {
        const args = this.popExprs(ctx.expr().length)
        // wrap the arguments with a temporary operator,
        // to be unwrapped later
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "wrappedArgs", args: args })
    }

    // a lambda operator
    exitLambda(ctx: p.LambdaContext) {
        const pattern = this.patternStack.pop()
        const expr = this.exprStack.pop()
        if (pattern) {
            if (expr) {
                this.exprStack.push({
                    id: this.nextId(), kind: "opabs", pattern: pattern, expr: expr
                })
            } else {
                assert(false, "exitLambda: expected an expression")
            }
        } else {
            assert(false, "exitLambda: expected a pattern")
        }
    }

    // a single pattern in a lambda expression: an identifier or '_'
    exitPatternAtom(ctx: p.PatternAtomContext) {
        const ident = ctx.IDENTIFIER()
        if (ident) {
            this.patternStack.push({ kind: "name", name: ident.text })
        } else {
            this.patternStack.push({ kind: "_" })
        }
    }

    // a list of patterns in a lambda expression
    exitPatternList(ctx: p.PatternListContext) {
        const patterns = this.popPatterns(ctx.pattern().length)
        // push the patterns as wrapped arguments
        this.patternStack.push({ kind: "list", args: patterns })
    }

    // '+' or '-'
    exitPlusMinus(ctx: p.PlusMinusContext) {
        const opcode = (ctx.ADD() != undefined) ? "add" : "sub"
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: opcode, args: args })
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
                kind: "opapp", opcode: opcode, args: args })
        }
    }

    // integer power, e.g., x^y
    exitPow(ctx: p.PowContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "pow", args: args })
    }

    // unary minus, e.g., -x
    exitUminus(ctx: p.UminusContext) {
        const arg = this.exprStack.pop()
        if (arg) {
            this.exprStack.push({ id: this.nextId(),
                kind: "opapp", opcode: "uminus", args: [ arg ] })
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
                kind: "opapp", opcode: opcode, args: args })
        }
    }

    // p and q
    exitAnd(ctx: p.AndContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "and", args: args })
    }

    // p or q
    exitOr(ctx: p.OrContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "or", args: args })
    }

    // p implies q
    exitImplies(ctx: p.ImpliesContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "implies", args: args })
    }

    // p iff q
    exitIff(ctx: p.IffContext) {
        const args = this.popExprs(2)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "iff", args: args })
    }

    // { p & q & r }
    exitAndBlock(ctx: p.AndBlockContext) {
        const args = this.popExprs(ctx.expr().length)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "andBlock", args: args })
    }

    // { p | q | r }
    exitOrBlock(ctx: p.OrBlockContext) {
        const args = this.popExprs(ctx.expr().length)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "orBlock", args: args })
    }

    // if (p) e1 else e2
    exitIfElse(ctx: p.IfElseContext) {
        const args = this.popExprs(3)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "ite", args: args })
    }

    // case { p1 -> e1 | p2 -> e2 | p3 -> e3 }, or
    // case { p1 -> e1 | p2 -> e2 | p3 -> e3 | _ -> e4 }
    exitCaseBlock(ctx: p.CaseBlockContext) {
        const args = this.popExprs(ctx.expr().length)
        this.exprStack.push({ id: this.nextId(),
            kind: "opapp", opcode: "caseBlock", args: args })
    }

    /********************* translate types ********************************/

    // the integer type, that is, int
    exitTypeInt(ctx: p.TypeIntContext) {
        this.typeStack.push({ kind: "int" });
    }

    // the Boolean type, that is, bool
    exitTypeBool(ctx: p.TypeBoolContext) {
        this.typeStack.push({ kind: "bool" });
    }

    exitTypeStr(ctx: p.TypeStrContext) {
        // the string type, that is, str
        this.typeStack.push({ kind: "str" });
    }

    // a type variable, a type constant, or a reference to a type alias
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

    // a set type, e.g., set(int)
    exitTypeSet(ctx: p.TypeSetContext) {
        const last = this.typeStack.pop();
        if (last != undefined) {
            this.typeStack.push({ kind: "set", elem: last });
        } // the other cases are excluded by the parser
    }

    // a sequence type, e.g., seq(int)
    exitTypeSeq(ctx: p.TypeSetContext) {
        const top = this.typeStack.pop();
        if (top != undefined) {
            this.typeStack.push({ kind: "seq", elem: top });
        } // the other cases are excluded by the parser
    }

    // A function type, e.g., str => int
    exitTypeFun(ctx: p.TypeFunContext) {
        const res = this.typeStack.pop();
        const arg = this.typeStack.pop();
        if (arg != undefined && res != undefined) {
            this.typeStack.push({ kind: "fun", arg: arg, res: res });
        }
    }

    // A tuple type, e.g., (int, bool)
    // the type stack contains the types of the elements
    exitTypeTuple(ctx: p.TypeTupleContext) {
        const elemTypes: TntType[] = this.popTypes(ctx.type().length);
        this.typeStack.push({ kind: "tuple", elems: elemTypes });
    }

    // A record type that is not a disjoint union, e.g.,
    // { name: str, year: int }
    // The type stack contains the types of the fields.
    // We have to match them with the field names.
    exitTypeRec(ctx: p.TypeRecContext) {
        const names = ctx.IDENTIFIER().map((n) => n.text);
        const elemTypes: TntType[] = this.popTypes(ctx.type().length);
        // since TS does not have zip, a loop is the easiest solution
        let pairs = [];
        for (var i = 0; i < names.length; i++) {
            pairs.push({ fieldName: names[i], fieldType: elemTypes[i] });
        }
        this.typeStack.push({ kind: "record", fields: pairs });
    }

    // A disjoint union type, e.g.,
    //   | { type: "ack", from: address }
    //   | { type: "syn", to: address }
    exitTypeUnionRec(ctx: p.TypeUnionRecContext) {
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
                    assert(false, "exitTypeUnionRec: no union in exitTypeUnionRec");
                }
            }
            this.typeStack.push({ kind: "union", tag: tag, records: records });
        } else {
            assert(false, "exitTypeUnionRec: no union in exitTypeUnionRec");
        }
    }

    // One option of a disjoint union, e.g.,
    //   | { type: "ack", from: address }
    // The type stack contains the types of the fields.
    // We have to match them with the field names.
    exitTypeUnionRecOne(ctx: p.TypeUnionRecOneContext) {
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

    // an operator type, e.g., (int, str) => bool
    exitTypeOper(ctx: p.TypeOperContext) {
        const resType = this.typeStack.pop();
        const nargs = ctx.type().length - 1;
        const argTypes: TntType[] = this.popTypes(nargs);
        if (resType != undefined && argTypes.length == nargs) {
            this.typeStack.push({ kind: "opapp", args: argTypes, res: resType });
        }
    }

    // untyped signature of level 0, that is, '_'
    exitUntyped0(ctx: p.Untyped0Context) {
        this.untypedStack.push({ kind: "untyped", paramArities: [] });
    }

    // An untyped signature of level 1, e.g., (_, _) => _.
    // Count the number of underscores; the last one going to the result.
    exitUntyped1(ctx: p.Untyped1Context) {
        const nunderscores = ctx.children?.filter((value) => value.text == "_").length;
        if (nunderscores) {
            let allZeroes = new Array(nunderscores - 1).fill(0);
            this.untypedStack.push({ kind: "untyped", paramArities: allZeroes });
        } else {
            assert(false, "exitUntyped1: no underscores in exitUntyped1");
        }
    }

    // A higher-order untyped signature like (_, (_, _) => _) => _.
    // Since the signatures of the arguments are either values or level 0 signatures,
    // we only have to count the number of their arguments.
    exitUntyped2Sig(ctx: p.Untyped2SigContext) {
        const arities = this.popUntyped(ctx.untyped01().length).map((u) => u.paramArities.length);
        this.untypedStack.push({ kind: "untyped", paramArities: arities });
    }

    // pop n elements out of typeStack
    private popTypes(n: number): TntType[] {
        assert(this.typeStack.length >= n, "popTypes: too few elements in typeStack")
        const types: TntType[] = this.typeStack.slice(-n);
        this.typeStack = this.typeStack.slice(0, -n);
        return types;
    }

    // pop n elements out of untypedStack
    private popUntyped(n: number): TntUntyped[] {
        assert(this.untypedStack.length >= n, "popUntyped: too few elements in untypedStack")
        const untyped: TntUntyped[] = this.untypedStack.slice(-n);
        this.untypedStack = this.untypedStack.slice(0, -n);
        return untyped;
    }

    // pop n expressions out of exprStack
    private popExprs(n: number): TntEx[] {
        assert(this.exprStack.length >= n, "popExprs: too few elements in exprStack")
        const es: TntEx[] = this.exprStack.slice(-n);
        this.exprStack = this.exprStack.slice(0, -n);
        return es;
    }

    // pop n patterns out of patternStack
    private popPatterns(n: number): TntPattern[] {
        assert(this.patternStack.length >= n, "popPatterns: too few elements in patternStack")
        const es: TntPattern[] = this.patternStack.slice(-n);
        this.patternStack = this.patternStack.slice(0, -n);
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
                assert(false, "popTypeTag: no type in typeStack");
            }
        } else {
            // the user has specified an untyped signature
            const untyped = this.untypedStack.pop();
            if (untyped) {
                return untyped;
            } else {
                assert(false, "popTypeTag: no untyped signature in untypedStack");
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
