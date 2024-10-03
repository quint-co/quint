/**
 * A grammar of Quint
 *
 * Our goals are:
 *  1. Keep the grammar simple,
 *  2. Make it expressive enough to capture all of the TLA logic.
 *
 * @author: Igor Konnov, Shon Feder, Gabriela Moreira, Jure Kukovec, Thomas Pani
 *          Informal Systems, 2021-2024
 */
grammar Quint;

@header {

// Used for forming errors
import { quintErrorToString } from '../quintError'

}

// entry point for the parser
modules : HASHBANG_LINE? module+ EOF;

module : DOCCOMMENT* 'module' qualId '{' documentedDeclaration* '}';
documentedDeclaration : DOCCOMMENT* declaration;

// a module declaration
declaration : 'const' qualId ':' type                     # const
            | 'var'   qualId ':' type                     # var
            | 'assume' (assumeName=identOrHole) '=' expr  # assume
            | instanceMod                                 # instance
            | operDef                                     # oper
            | typeDef                                     # typeDefs
            | importMod                                   # importDef
            | exportMod                                   # exportDef
            ;

// An operator definition.
operDef
    : qualifier normalCallName
        // Fully-annotated parameter list with at least one parameter
        '(' (annotOperParam+=annotatedParameter (',' annotOperParam+=annotatedParameter)*) ')'
        // Mandatory annotation for return type
        ':' type
        // We support header declaration with no implementation for documentation genaration
        ('=' expr)?
        // Optionally terminated with a semicolon
        ';'?
        # annotatedOperDef
    | qualifier normalCallName // TODO: Remove as per https://github.com/informalsystems/quint/issues/923
        // Unannotated parameter list
        ('(' (operParam+=parameter (',' operParam+=parameter)*)? ')')?
        // Optional type annotation using the deprecated format
        (':' annotatedRetType=type)?
        // We support header declaration with no implementation for documentation genaration
        ('=' expr)?
        // Optionally terminated with a semicolon
        ';'?
        # deprecatedOperDef
    ;

typeDef
    : 'type' qualId                             # typeAbstractDef
    | 'type' typeDefHead '=' type               # typeAliasDef
    | 'type' typeDefHead '=' sumTypeDefinition  # typeSumDef
    ;

typeDefHead : typeName=qualId ('[' typeVars+=LOW_ID(',' typeVars+=LOW_ID)* ']')?;

sumTypeDefinition : '|'? typeSumVariant ('|' typeSumVariant)* ;

// A single variant case in a sum type definition or match statement.
// E.g., `A(t)` or `A`.
typeSumVariant : sumLabel=simpleId["variant label"] ('(' type ')')? ;

qualifier : 'val'
          | 'def'
          | 'pure' 'val'
          | 'pure' 'def'
          | 'action'
          | 'run'
          | 'temporal'
          | 'nondet'
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

moduleName : qualId;
name: qualId;
qualifiedName : qualId;
fromSource: STRING;

// Types in Type System 1.2 of Apalache
type
    : <assoc=right> type '->' type                               # typeFun
    | <assoc=right> type '=>' type                               # typeOper
    | '(' (type (',' type)*)? ','? ')' '=>' type                 # typeOper
    // TODO: replace Set with general type application
    | SET '[' type ']'                                           # typeSet
    // TODO: replace List with general type application
    | LIST '[' type ']'                                          # typeList
    // Parse tuples of size 0 or 2+, but not 1. (int) should be parsed as int.
    | '(' ')'                                                    # typeUnit
    | '(' type ',' type (',' type)* ','? ')'                     # typeTuple
    | '{' row? '}'                                               # typeRec
    | 'int'                                                      # typeInt
    | 'str'                                                      # typeStr
    | 'bool'                                                     # typeBool
    | typeVar                                                    # typeVarCase
    | qualId                                                     # typeConst
    | '(' type ')'                                               # typeParen
    | typeCtor=qualId ('[' typeArg+=type (',' typeArg+=type)* ']') # typeApp
    ;

typeVar: LOW_ID;
row : (rowLabel ':' type) (',' rowLabel ':' type)* (',' | '|' (rowVar=identifier))?
    | '|' (rowVar=identifier)
    ;

rowLabel : simpleId["record"] ;

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
        |       qualId '\'' ASGN expr                               # asgn
        |       expr '=' expr {
                  const m = "[QNT006] unexpected '=', did you mean '=='?"
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
        |       matchSumExpr                                        # match
        |       'all' '{' expr (',' expr)* ','? '}'                 # actionAll
        |       'any' '{' expr (',' expr)* ','? '}'                 # actionAny
        |       ( qualId | INT | BOOL | STRING)                     # literalOrId
        //      a tuple constructor, the form Tup(...) is just an operator call
        |       '(' expr ',' expr (',' expr)* ','? ')'              # tuple
        |       '(' ')'                                             # unit
        //      short-hand syntax for pairs, mainly designed for maps
        |       expr '->' expr                                      # pair
        |       '{' recElem (',' recElem)* ','? '}'                 # record
        //      a list constructor, the form list(...) is just an operator call
        |       '[' (expr (',' expr)*)? ','? ']'                    # list
        |       'if' '(' expr ')' expr 'else' expr                  # ifElse
        |       operDef expr                                        # letIn
        |       '(' expr ')'                                        # paren
        |       '{' expr '}'                                        # braces
        ;

// match e { A(a) => e1 | B => e2 | C(_) => e3 | ... | _ => en }
matchSumExpr: MATCH expr '{' '|'? matchCase+=matchSumCase ('|' matchCase+=matchSumCase)* '}' ;
matchSumCase: (variantMatch=matchSumVariant | wildCardMatch='_') '=>' expr ;
matchSumVariant
    : (variantLabel=simpleId["variant label"]) ('(' (variantParam=simpleId["match case parameter"] | '_') ')')? ;

// A probing rule for REPL.
// Note that a top-level declaration has priority over an expression.
// For example, see: https://github.com/informalsystems/quint/issues/394
declarationOrExpr :    declaration EOF | expr EOF | DOCCOMMENT EOF | EOF;

// This rule parses anonymous functions, e.g.:
// 1. x => e
// 2. (x) => e
// 3. (x, y, z) => e            (arity 3)
// 4. ((x, y, z)) => e          (syntax sugar: arity 1, unboxed into a 3-field tuple)
lambda          : lambdaUnsugared
                | lambdaTupleSugar ;
lambdaUnsugared : parameter '=>' expr
                | '(' parameter (',' parameter)* ')' '=>' expr
                ;
// A lambda operator over a single tuple parameter,
// unpacked into named fields
lambdaTupleSugar : '(' '(' parameter (',' parameter)+ ')' ')' '=>' expr;

// an identifier or a hole '_'
identOrHole : '_' | qualId;

// TODO: Combine these into a single rule that support optionally annotated parameters
//       Requires https://github.com/informalsystems/quint/issues/923
parameter: paramName=identOrHole;
annotatedParameter: paramName=identOrHole ':' type;

// an identifier or a star '*'
identOrStar :   '*' | qualId
        ;

argList :      expr (',' expr)*
        ;

recElem : simpleId["record"] ':' expr
        | '...' expr
        ;

// operators in the normal call may use a few reserved names,
// which are not recognized as identifiers.
normalCallName :   qualId
        |       op=(AND | OR | IFF | IMPLIES | SET | LIST | MAP)
        ;

// A few infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
nameAfterDot :  qualId
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

// A (possibly) qualified identifier, like `Foo` or `Foo::bar`
qualId : identifier ('::' identifier)* ;

// An unqualified identifier that raises an error if a qualId is supplied
simpleId[context: string]
    : identifier
    | qualId {
        const err = quintErrorToString(
          { code: 'QNT008',
            message: "Identifiers in a " + $context + " cannot be qualified with '::'. Found " + $qualId.text + "."
          },
        )
        this.notifyErrorListeners(err)
      }
    ;

identifier : LOW_ID | CAP_ID;

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
SET             :   'Set';
LIST            :   'List';

// An identifier starting with lowercase
LOW_ID : ([a-z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;
// An identifier starting with uppercase
CAP_ID : ([A-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

// Unix script prefix, only valid as the first line of a file
HASHBANG_LINE : '#!' .*? '\n';
DOCCOMMENT    : '///' .*? '\n';

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
