import 'mocha';
import { assert } from 'chai';
import { ErrorMessage, ParseErrors, parseModule } from "../src/parser/tntParserFrontend";

describe('parse empty module', () => {
	it('no parse errors', () => {
	  const result = parseModule("module Foo end");
	  assert.deepEqual(result, {kind: 'ok'}, "expected ok")
	}); 
  });

describe('parse module with error', () => {
	it('error message on error in module', () => {
		let input = "module Foo " +
					"error " +
					"end "
		const result = parseModule("module Foo error zz end");
		const msg: ErrorMessage = {
			explanation: "mismatched input 'error' expecting {'module', 'extends', 'end', 'const', 'var', 'assume', 'private', 'pred', 'action', 'temporal', 'val', 'def', 'instance'}",
			 lineNo: 1,
			 charNo: 11
		};
		const expected: ParseErrors = { kind: 'error', messages: [ msg ] };
		assert.deepEqual(result, expected, "expected error");
	}); 
  });
