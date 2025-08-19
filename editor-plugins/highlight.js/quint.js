/*
Language: Quint
Requires:
Author: Igor Konnov <igor@informal.systems>
Contributors:
Description: Quint is an executable specification language based on the Temporal Logic of Actions
Website: https://github.com/informalsystems/quint
*/
function quintHljs(hljs) {
  const n = {
    keyword: [
      'module', 'import', 'from', 'export', 'as', 'type', 'assume', 'const', 'var',
      'val', 'def', 'pure', 'nondet', 'action', 'temporal', 'run',
      'all', 'any', 'if', 'else'
    ],
    literal: [
      'false', 'true', 'Bool', 'Nat', 'Int',
    ],
    operator: [
      '=>', '<=', '>', '<', '=', '!=', '.', '*', '+', '-', '/', '%', '^',
      'not', 'or', 'and', 'implies', 'iff',
    ],
    type: [ 'int', 'bool', 'str', 'Set', 'Map', 'List' ],
    punctuation: [ ',', ';', '(', ')', '{', '}', '[', ']' ],
  };

  return {
    name: 'Quint',
    case_insensitive: false,
    keywords: n,
    contains: [
      {
        scope: 'string',
        begin: '"',
        end: '"'
      },
      {
        scope: 'number',
        begin: '-?(0x[0-9a-fA-F]([0-9a-fA-F]|_[0-9a-fA-F])*|0|[1-9]([0-9]|_[0-9])*)',
      },
      hljs.SHEBANG, // file-leading hashbang
      hljs.C_LINE_COMMENT_MODE,  // single line comments
      hljs.C_BLOCK_COMMENT_MODE, // multiline comments
    ],
  };
}

hljs.registerLanguage('quint', quintHljs);
