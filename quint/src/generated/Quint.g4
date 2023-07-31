/**
 * A grammar of Quint
 *
 * Our goals are:
 *  1. Keep the grammar simple,
 *  2. Make it expressive enough to capture all of the TLA logic.
 *
 * @author: Igor Konnov, Shon Feder, Gabriela Moreira, Jure Kukovec, Thomas Pani
 *          Informal Systems, 2021-2023
 */
grammar Quint;

// entry point for the parser
modules : module+ EOF;

module : DOCCOMMENT* 'module' IDENTIFIER '{' documentedUnit* '}';
documentedUnit : DOCCOMMENT* unit;

// a module unit
unit :    'const' IDENTIFIER ':' type                     # const
        | 'var'   IDENTIFIER ':' type                     # var
        | 'assume' identOrHole '=' expr                   # assume
        | instanceMod                                     # instance
        | operDef                                         # oper
        | typeDef                                         # typeDefs
        | importMod                                       # importDef
        | exportMod                                       # exportDef
        // https://github.com/informalsystems/quint/issues/378
        //| 'nondet' IDENTIFIER (':' type)? '=' expr ';'? expr {
        //  const m = "QNT007: 'nondet' is only allowed inside actions"
        //  this.notifyErrorListeners(m)
        //}                                                 # nondetError
        ;

// An operator definition.
// We embed two kinds of parameters right in this rule.
// Otherwise, the parser would start recognizing parameters everywhere.
operDef : qualifier normalCallName
            ( /* ML-like parameter lists */
                '(' (parameter (',' parameter)*)? ')' (':' type)?
                | ':' type
              /* C-like parameter lists */
                | '(' (parameter ':' type (',' parameter ':' type)*) ')' ':' type
            )?
            ('=' expr)? ';'?
        ;

typeDef
    : 'type' IDENTIFIER          # typeAbstractDef
    | 'type' IDENTIFIER '=' type # typeAliasDef
    ;

nondetOperDef : 'nondet' IDENTIFIER (':' type)? '=' expr ';'?;

qualifier : 'val'
          | 'def'
          | 'pure' 'val'
          | 'pure' 'def'
          | 'action'
          | 'run'
          | 'temporal'
          ;

importMod : 'import' name '.' identOrStar ('from' fromSource)?
          | 'import' name ('as' name)? ('from' fromSource)?
          ;

exportMod : 'export' name '.' identOrStar
          | 'export' name ('as' name)?
          ;

// an instance may have a special parameter '*',
// which means that the missing parameters are identity, e.g., x = x, y = y
instanceMod :   // creating an instance and importing all names introduced in the instance
                'import' moduleName '(' (name '=' expr (',' name '=' expr)*) ')' '.' '*'
                  ('from' fromSource)?
                // creating an instance and importing all names with a prefix
            |   'import' moduleName '(' (name '=' expr (',' name '=' expr)*) ')' 'as' qualifiedName
                  ('from' fromSource)?
        ;

moduleName : IDENTIFIER;
name: IDENTIFIER;
qualifiedName : IDENTIFIER;
fromSource: STRING;

// Types in Type System 1.2 of Apalache, which supports discriminated unions
type :          <assoc=right> type '->' type                    # typeFun
        |       <assoc=right> type '=>' type                    # typeOper
        |       '(' (type (',' type)*)? ','? ')' '=>' type      # typeOper
        |       SET '[' type ']'                                # typeSet
        |       LIST '[' type ']'                               # typeList
        |       '(' type ',' type (',' type)* ','? ')'          # typeTuple
        |       '{' row '}'                                     # typeRec
        |       typeUnionRecOne+                                # typeUnionRec
        |       'int'                                           # typeInt
        |       'str'                                           # typeStr
        |       'bool'                                          # typeBool
        |       IDENTIFIER                                      # typeConstOrVar
        |       '(' type ')'                                    # typeParen
        ;

typeUnionRecOne : '|' '{' IDENTIFIER ':' STRING (',' row)? ','? '}'
                ;

row : | (IDENTIFIER ':' type ',')* ((IDENTIFIER ':' type) (',' | '|' (IDENTIFIER))?)?
      | '|' (IDENTIFIER)
    ;

// A Quint expression. The order matters, it defines the priority.
// Wherever possible, we keep the same order of operators as in TLA+.
// We are also trying to be consistent with mainstream languages, e.g.,
// check the precedence table in Java:
// https://www.cs.bilkent.edu.tr/~guvenir/courses/CS101/op_precedence.html
expr:           // apply a built-in operator via the dot notation
                expr '.' nameAfterDot (LPAREN argList? RPAREN)?     # dotCall
        |       lambda                                              # lambdaCons
                // Call a user-defined operator or a built-in operator.
                // The operator has at least one argument (otherwise, it's a 'val').
        |       normalCallName '(' argList? ')'                     # operApp
                // list access via index
        |       expr '[' expr ']'                                   # listApp
                // power over integers
        |       <assoc=right> expr op='^' expr                      # pow
        |       // unary minus
                MINUS expr                                          # uminus
                // integer arithmetic
        |       expr op=(MUL | DIV | MOD) expr                      # multDiv
        |       expr op=(PLUS | MINUS) expr                         # plusMinus
                // standard relations
        |       expr op=(GT | LT | GE | LE | NE | EQ) expr          # relations
        |       IDENTIFIER '\'' ASGN expr                           # asgn
        |       expr '=' expr {
                  const m = "QNT006: unexpected '=', did you mean '=='?"
                  this.notifyErrorListeners(m)
                }                                                   # errorEq
                // Boolean operators. Note that not(e) is just a normal call
                // similar to indented /\ and indented \/ of TLA+
        |       'and' '{' expr (',' expr)* ','? '}'                 # andExpr
        |       expr AND expr                                       # and
        |       'or'  '{' expr (',' expr)* ','? '}'                 # orExpr
        |       expr OR expr                                        # or
        |       expr IFF expr                                       # iff
        |       expr IMPLIES expr                                   # implies
        |       expr MATCH
                    ('|' STRING ':' parameter '=>' expr)+           # match
        |       'all' '{' expr (',' expr)* ','? '}'                 # actionAll
        |       'any' '{' expr (',' expr)* ','? '}'                 # actionAny
        |       ( IDENTIFIER | INT | BOOL | STRING)                 # literalOrId
        //      a tuple constructor, the form tup(...) is just an operator call
        |       '(' expr ',' expr (',' expr)* ','? ')'              # tuple
        //      short-hand syntax for pairs, mainly designed for maps
        |       expr '->' expr                                      # pair
        |       '{' recElem (',' recElem)* ','? '}'                 # record
        //      a list constructor, the form list(...) is just an operator call
        |       '[' (expr (',' expr)*)? ','? ']'                    # list
        |       'if' '(' expr ')' expr 'else' expr                  # ifElse
        |       operDef expr                                        # letIn
        |       nondetOperDef expr                                  # nondet
        |       '(' expr ')'                                        # paren
        |       '{' expr '}'                                        # braces
        ;

// A probing rule for REPL.
// Note that a top-level declaration has priority over an expression.
// For example, see: https://github.com/informalsystems/quint/issues/394
unitOrExpr :    unit EOF | expr EOF | DOCCOMMENT EOF | EOF;

// This rule parses anonymous functions, e.g.:
// 1. x => e
// 2. (x) => e
// 3. (x, y, z) => e
lambda:         parameter '=>' expr
        |       '(' parameter (',' parameter)* ')' '=>' expr
        ;


// an identifier or a hole '_'
identOrHole :   '_' | IDENTIFIER
        ;

parameter: identOrHole;

// an identifier or a star '*'
identOrStar :   '*' | IDENTIFIER
        ;

argList :      expr (',' expr)*
        ;

recElem : IDENTIFIER ':' expr
        | '...' expr
        ;

// operators in the normal call may use a few reserved names,
// which are not recognized as identifiers.
normalCallName :   IDENTIFIER
        |       op=(AND | OR | IFF | IMPLIES | SET | LIST | MAP)
        ;

// A few infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
nameAfterDot :  IDENTIFIER
        |       op=(AND | OR | IFF | IMPLIES)
        ;

// special operators
operator: (AND | OR | IFF | IMPLIES |
           GT  | LT  | GE  | LE | NE | EQ |
           MUL | DIV | MOD | PLUS | MINUS | '^')
        ;

// literals
literal: (STRING | BOOL | INT)
        ;

// TOKENS

// literals
// Strings cannot be escaped, as they are pseudo-identifiers.
STRING          : '"' .*? '"' ;
BOOL            : ('false' | 'true') ;
// Similar to Solidity, integer literals can be written in two formats:
//  - Decimal, possibly, with '_' as separators, or
//  - Hexadecimal, possibly, with '_' as separators.
INT             : ('0' | [1-9]([0-9]|'_'[0-9])* | '0x' [0-9a-fA-F]([0-9a-fA-F]|'_'[0-9a-fA-F])*) ;

// a few keywords
AND             :   'and' ;
OR              :   'or'  ;
IFF             :   'iff' ;
IMPLIES         :   'implies' ;
SET             :   'Set' ;
LIST            :   'List' ;
MAP             :   'Map' ;
MATCH           :   'match' ;
PLUS            :   '+' ;
MINUS           :   '-' ;
MUL             :   '*' ;
DIV             :   '/' ;
MOD             :   '%' ;
GT              :   '>' ;
LT              :   '<' ;
GE              :   '>=' ;
LE              :   '<=' ;
NE              :   '!=' ;
EQ              :   '==' ;
ASGN            :   '=' ;
LPAREN          :   '(' ;
RPAREN          :   ')' ;

// other TLA+ identifiers
IDENTIFIER             : SIMPLE_IDENTIFIER | SIMPLE_IDENTIFIER '::' IDENTIFIER ;
SIMPLE_IDENTIFIER      : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

DOCCOMMENT : '///' .*? '\n';

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
