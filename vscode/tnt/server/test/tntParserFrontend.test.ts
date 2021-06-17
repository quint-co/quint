import 'mocha';
import { assert } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ErrorMessage, parsePhase1, ParseResult } from "../src/parser/tntParserFrontend";
import { TntDef, OpQualifier, OpScope } from "../src/parser/tntIr";

function readTest(name: string): string {
	const p = resolve(__dirname, '../testFixture', name + ".tnt")
	return readFileSync(p).toString('utf8')
}

describe('parse modules', () => {
	it('parse empty module', () => {
	  const result = parsePhase1(readTest("_0001emptyModule"));
	  const module = { id: 1n, name: "empty", extends: [], defs: [] }
	  assert.deepEqual(result, {kind: 'ok', module: module}, "expected ok")
	}); 

	it('error message on error in module unit', () => {
		const result = parsePhase1(readTest("_0002emptyWithError"));
		const msg: ErrorMessage = {
			explanation: "TNT001: expected a const, var, def, typedef, etc.",
			start: { line: 4, col: 0 },
			end:   { line: 4, col: 3 }
		};
		const expected: ParseResult = { kind: "error", messages: [ msg ] };
		assert.deepEqual(result, expected, "expected error");
	}); 

	it('parse constants', () => {
	  const result = parsePhase1(readTest("_0003consts"));
	  // const N: int
	  const constN: TntDef = { id: 1n, kind: "const", name: "N", typeTag: { kind: "untyped", paramArities: [] } }
	  // const UntypedOper: (_, _) => _
	  const untypedOper: TntDef = { id: 2n, kind: "const", name: "UntypedOper",
	  								typeTag: { kind: "untyped", paramArities: [0, 0] } }
	  // const MySet: set(int)
	  const constMySet: TntDef = { id: 3n, kind: "const", name: "MySet",
	  	typeTag: { kind: "set", elem: { kind: "int" } } }
	  // const MySeq: seq(int)
	  const constMySeq: TntDef = { id: 4n, kind: "const", name: "MySeq",
	  	typeTag: { kind: "seq", elem: { kind: "bool" } } }
	  // const MyFun: int -> str
	  const constMyFun: TntDef = { id: 5n, kind: "const", name: "MyFun",
	  	typeTag: { kind: "fun", arg: { kind: "int" }, res: { kind: "str" } } }
	  // const MyFun: (int -> str) -> bool
	  const constMyFunFun: TntDef = { id: 6n, kind: "const", name: "MyFunFun",
	  	typeTag: { kind: "fun",
		  		   arg: { kind: "fun", arg: { kind: "int" }, res: { kind: "str" } },
				   res: { kind: "bool" }
				}}
	  // const MyOper: (int, str) => bool
	  const constMyOper: TntDef = { id: 7n, kind: "const", name: "MyOper",
	  	typeTag: { kind: "opapp", args: [{ kind: "int" }, {kind: "str"}], res: { kind: "bool" } } }
	  // const MyTuple: (int, bool, str)
	  const constMyTuple: TntDef = { id: 8n, kind: "const", name: "MyTuple",
	  	typeTag: { kind: "tuple", elems: [ { kind: "int" }, {kind: "bool"}, { kind: "str" } ] } }
	  // the module that contains all these constants
	  const module = { id: 9n, name: "withConsts", extends: [],
	  	defs: [ constN, untypedOper, constMySet, constMySeq, constMyFun,
				constMyFunFun, constMyOper, constMyTuple ] }

	  assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse record types in constants', () => {
	  const result = parsePhase1(readTest("_0004constRecords"));
	  // const MyRecord: { "i": int, "b": bool, "s": str }
	  const constMyRecord: TntDef = { id: 1n, kind: "const", name: "MyRecord",
	  	typeTag: { kind: "record",
		  		   fields: [ { fieldName: "i", fieldType: { kind: "int" } },
					         { fieldName: "b", fieldType: { kind: "bool"} },
							 { fieldName: "s", fieldType: { kind: "str" } } ] } }

	  // disjoint unions are the most complex type in our type system
	  const constMyUnion: TntDef =
	  	{ id: 2n, kind: "const", name: "MyUnion",
		  typeTag: {
			kind: "union", tag: "type",
			records: [
				{
					tagValue: "circle",
				  	fields: [ {fieldName: "radius", fieldType: { kind: "int" } } ]
				},
				{
					tagValue: "rectangle",
				  	fields: [
					  {fieldName: "width", fieldType: { kind: "int" } },
					  {fieldName: "height", fieldType: { kind: "int" } },
					]
				},
				{
					tagValue: "dog",
				  	fields: [ {fieldName: "name", fieldType: { kind: "str" } } ]
				},
			]
		  }
		}

	  // the module that contains all these constants
	  const module = { id: 3n, name: "withConsts", extends: [],
	  	defs: [ constMyRecord, constMyUnion ] }

	  assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	});

	it('error message in malformed disjoint union', () => {
		const result = parsePhase1(readTest("_0005constRecordsError"));
		const msg: ErrorMessage = {
			explanation: "TNT011: Records in disjoint union have different tag fields: type and kind",
			 start: { line: 5, col: 2 },
			 end:   { line: 6, col: 49 },
		};
		const expected: ParseResult = { kind: "error", messages: [ msg ] };
		assert.deepEqual(result, expected, "expected error");
	}); 

	it('parse vars', () => {
		const result = parsePhase1(readTest("_0006vars"));
		// var x: int
		const x: TntDef = { id: 1n, kind: "var", name: "x", typeTag: { kind: "int" } }
		// var y: _
		const y: TntDef = { id: 2n, kind: "var", name: "y",
							typeTag: { kind: "untyped", paramArities: [] } }
  
		// the module that contains all these constants
		const module = { id: 3n, name: "withVars", extends: [],
		defs: [ x, y ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse error on untyped operator signature for a variable', () => {
		const result = parsePhase1(readTest("_0007varsErrors"));
		if (result.kind == "error") {
			assert.isTrue(result.messages.length > 0)
			assert.deepEqual(result.messages[0].explanation,
				"TNT002: expected '_', found an operator signature.")
		} else {
			assert.fail("Expected to see an error")
		}
	}); 

	it('parse add', () => {
		const result = parsePhase1(readTest("_0100expr_add"));
		// val add_1_to_2: _ = 1 + 2
		const add_1_to_2: TntDef = {
			id: 4n, kind: "def", name: "add_1_to_2",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "add", args: [
				 	{ id: 1n, kind: "int", value: 1n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ add_1_to_2 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse sub', () => {
		const result = parsePhase1(readTest("_0101expr_sub"));
		// val sub_1_to_2: _ = 1 - 2
		const sub_1_to_2: TntDef = {
			id: 4n, kind: "def", name: "sub_1_to_2",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "sub", args: [
				 	{ id: 1n, kind: "int", value: 1n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ sub_1_to_2 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse mul', () => {
		const result = parsePhase1(readTest("_0102expr_mul"));
		// val mul_2_to_3: _ = 2 * 3
		const mul_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "mul_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "mul", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ mul_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse div', () => {
		const result = parsePhase1(readTest("_0103expr_div"));
		// val div_2_to_3: _ = 2 / 3
		const div_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "div_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "div", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ div_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse mod', () => {
		const result = parsePhase1(readTest("_0104expr_mod"));
		// val mod_2_to_3: _ = 2 % 3
		const mod_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "mod_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "mod", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ mod_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse pow', () => {
		const result = parsePhase1(readTest("_0105expr_pow"));
		// val pow_2_to_3: _ = 2^3
		const pow_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "pow_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "pow", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ pow_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse uminus', () => {
		const result = parsePhase1(readTest("_0106expr_uminus"));
		// val uminus: _ = -100
		const uminus: TntDef = {
			id: 3n, kind: "def", name: "uminus",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 2n, kind: "opapp", opcode: "uminus", args: [{
				id: 1n, kind: "int", value: 100n, typeTag: { kind: "int" } }]
			}
		 }
  
		// the module that contains all these constants
		const module = { id: 4n, name: "withVals",
						 extends: [], defs: [ uminus ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse gt', () => {
		const result = parsePhase1(readTest("_0107expr_gt"));
		// val gt_2_to_3: _ = 2 > 3
		const gt_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "gt_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "gt", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ gt_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse ge', () => {
		const result = parsePhase1(readTest("_0108expr_ge"));
		// val ge_2_to_3: _ = 2 >= 3
		const ge_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "ge_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "gte", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ ge_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse lt', () => {
		const result = parsePhase1(readTest("_0109expr_lt"));
		// val lt_2_to_3: _ = 2 < 3
		const lt_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "lt_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "lt", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ lt_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse le', () => {
		const result = parsePhase1(readTest("_0110expr_le"));
		// val le_2_to_3: _ = 2 <= 3
		const le_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "le_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "lte", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ le_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse eq', () => {
		const result = parsePhase1(readTest("_0111expr_eq"));
		// val eq_2_to_3: _ = 2 = 3
		const eq_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "eq_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "eq", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ eq_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse eqeq', () => {
		const result = parsePhase1(readTest("_0112expr_eqeq"));
		// val eqeq_2_to_3: _ = 2 == 3
		const eqeq_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "eqeq_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "eq", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ eqeq_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse ne', () => {
		const result = parsePhase1(readTest("_0113expr_ne"));
		// val ne_2_to_3: _ = 2 != 3
		const ne_2_to_3: TntDef = {
			id: 4n, kind: "def", name: "ne_2_to_3",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "neq", args: [
				 	{ id: 1n, kind: "int", value: 2n, typeTag: { kind: "int" } },
				 	{ id: 2n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ ne_2_to_3 ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse asgn', () => {
		const result = parsePhase1(readTest("_0114expr_asgn"));
		// var x: int
		const x: TntDef = { id: 1n, kind: "var", name: "x", typeTag: { kind: "int" } }
		// val asgn: _ = x := 3
		const asgn: TntDef = {
			id: 5n, kind: "def", name: "asgn",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "assign", args: [
				 	{ id: 2n, kind: "name", name: "x" },
				 	{ id: 3n, kind: "int", value: 3n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ x, asgn ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse and', () => {
		const result = parsePhase1(readTest("_0115expr_and"));
		// val test_and: _ = false and true
		const test_and: TntDef = {
			id: 4n, kind: "def", name: "test_and",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "and", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ test_and ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse or', () => {
		const result = parsePhase1(readTest("_0116expr_or"));
		// val test_or: _ = false or true
		const test_or: TntDef = {
			id: 4n, kind: "def", name: "test_or",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "or", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ test_or ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse implies', () => {
		const result = parsePhase1(readTest("_0117expr_implies"));
		// val test_implies: _ = false implies true
		const test_implies: TntDef = {
			id: 4n, kind: "def", name: "test_implies",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "implies", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ test_implies ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse iff', () => {
		const result = parsePhase1(readTest("_0118expr_iff"));
		// val test_iff: _ = false iff true
		const test_iff: TntDef = {
			id: 4n, kind: "def", name: "test_iff",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "iff", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ test_iff ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse block_and', () => {
		const result = parsePhase1(readTest("_0119expr_block_and"));
		// val block_and: _ = { false & true & false }
		const test_block_and: TntDef = {
			id: 5n, kind: "def", name: "test_block_and",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "andBlock", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				 	{ id: 3n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ test_block_and ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse block_or', () => {
		const result = parsePhase1(readTest("_0120expr_block_or"));
		// val block_or: _ = { false | true | false }
		const test_block_or: TntDef = {
			id: 5n, kind: "def", name: "test_block_or",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "orBlock", args: [
				 	{ id: 1n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				 	{ id: 3n, kind: "bool", value: false, typeTag: { kind: "bool" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ test_block_or ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse ite', () => {
		const result = parsePhase1(readTest("_0121expr_ite"));
		// val test_ite: _ = if (true) 1 else 0
		const test_ite: TntDef = {
			id: 5n, kind: "def", name: "test_ite",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "ite", args: [
				 	{ id: 1n, kind: "bool", value: true, typeTag: { kind: "bool" } },
				 	{ id: 2n, kind: "int", value: 1n, typeTag: { kind: "int" } },
				 	{ id: 3n, kind: "int", value: 0n, typeTag: { kind: "int" } },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ test_ite ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse case', () => {
		const result = parsePhase1(readTest("_0122expr_case"));
		// val case: _ = { p1 -> e1 | p2 -> e2 | p3 -> e3 }
		const test_case: TntDef = {
			id: 8n, kind: "def", name: "test_case",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 7n, kind: "opapp", opcode: "caseBlock", args: [
					{ id: 1n, kind: "name", name: "p1" },
					{ id: 2n, kind: "name", name: "e1" },
					{ id: 3n, kind: "name", name: "p2" },
					{ id: 4n, kind: "name", name: "e2" },
					{ id: 5n, kind: "name", name: "p3" },
					{ id: 6n, kind: "name", name: "e3" },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 9n, name: "withVals",
						 extends: [], defs: [ test_case ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse case with default', () => {
		const result = parsePhase1(readTest("_0123expr_case_default"));
		// val case: _ = { p1 -> e1 | p2 -> e2 | p3 -> e3 | _ -> e4 }
		const test_case_default: TntDef = {
			id: 9n, kind: "def", name: "test_case",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 8n, kind: "opapp", opcode: "caseBlock", args: [
					{ id: 1n, kind: "name", name: "p1" },
					{ id: 2n, kind: "name", name: "e1" },
					{ id: 3n, kind: "name", name: "p2" },
					{ id: 4n, kind: "name", name: "e2" },
					{ id: 5n, kind: "name", name: "p3" },
					{ id: 6n, kind: "name", name: "e3" },
					{ id: 7n, kind: "name", name: "e4" },
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 10n, name: "withVals",
						 extends: [], defs: [ test_case_default ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse function application', () => {
		const result = parsePhase1(readTest("_0124expr_funapp"));
		// var f: str -> int
		const f: TntDef = { id: 1n, kind: "var", name: "f",
			typeTag: { kind: "fun", arg: { kind: "str" }, res: { kind: "int" } } }
		// val funapp = f["a"]
		const funapp: TntDef = {
			id: 5n, kind: "def", name: "funapp",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "of", args: [
				 	{ id: 2n, kind: "name", name: "f" },
				 	{ id: 3n, kind: "str", value: "a", typeTag: { kind: "str" } }
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ f, funapp ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse operator application', () => {
		const result = parsePhase1(readTest("_0125expr_oper_app"));
		// val oper_app = MyOper("a", 42)
		const operApp: TntDef = {
			id: 4n, kind: "def", name: "oper_app",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 3n, kind: "opapp", opcode: "MyOper", args: [
				 	{ id: 1n, kind: "str", value: "a", typeTag: { kind: "str" } },
				 	{ id: 2n, kind: "int", value: 42n, typeTag: { kind: "int" } }
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 5n, name: "withVals",
						 extends: [], defs: [ operApp ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 

	it('parse infix operator application', () => {
		const result = parsePhase1(readTest("_0126expr_oper_infix_app"));
		// val oper_app = "a" MyOper 42, true
		const operApp: TntDef = {
			id: 5n, kind: "def", name: "oper_app",
			qualifier: OpQualifier.Val, scope: OpScope.Public,
			expr: { id: 4n, kind: "opapp", opcode: "MyOper", args: [
				 	{ id: 1n, kind: "str", value: "a", typeTag: { kind: "str" } },
				 	{ id: 2n, kind: "int", value: 42n, typeTag: { kind: "int" } },
				 	{ id: 3n, kind: "bool", value: true, typeTag: { kind: "bool" } }
				] }
		 }
  
		// the module that contains all these constants
		const module = { id: 6n, name: "withVals",
						 extends: [], defs: [ operApp ] }

		assert.deepEqual(result, { kind: 'ok', module: module }, "expected ok")
	}); 
});
