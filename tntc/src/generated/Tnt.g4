/**
 * A grammar of TNT: TNT is not TLA+.
 *
 * Our goals are:
 *  1. Keep the grammar simple,
 *  2. Make it expressive enough to capture all of TLA+.
 *
 * @author: Igor Konnov, Shon Feder, Jure Kukovec, Informal Systems, 2021
 */
grammar Tnt;

module : 'module' IDENTIFIER '{' unit* '}';

// a module unit
unit :    'const' IDENTIFIER ':' type                     # const
        | 'var'   IDENTIFIER ':' type                     # var
        | 'assume' identOrHole '=' expr                   # assume
        | operDef                                         # oper
        | module                                          # moduleNested
        | instanceMod                                     # instance
        | 'type' IDENTIFIER '=' type                      # typedef
        | 'import' path '.' identOrStar                   # importDef
        | (IDENTIFIER | operator | literal
           '(' | '{' | '[' | 'if' | '&' | '|') {
         this.notifyErrorListeners("TNT001: expected 'const', 'var', 'def', 'type', etc.");
          }                                               # errorCase
        | ('var' | 'const') IDENTIFIER
              ('const' | 'var' | 'assume' | 'val' | 'def'
               | 'pred' | 'action' | 'temporal' | 'module' | 'type') {
            this.notifyErrorListeners("TNT002: missing ': type' after 'var' or 'const'");
               
          }                                               # errorNoType
        ;

// an operator definition
operDef : qualifier=('val' | 'def' | 'pred' | 'action' | 'temporal')       
          IDENTIFIER params? (':' type)? '=' expr          
        ;

params  :       '(' (IDENTIFIER (',' IDENTIFIER)*)? ')'
        ;

// an instance may have a special parameter '*',
// which means that the missing parameters are identity, e.g., x = x, y = y
instanceMod :   'module' IDENTIFIER '=' IDENTIFIER
                '('
                  (MUL |
                  IDENTIFIER '=' expr (',' IDENTIFIER '=' expr)* (',' MUL)?)
                ')'
        ;

// Types in Type System 1.2 of Apalache, which supports discriminated unions
type :          type '->' type                                  # typeFun
        |       '(' (type (',' type)*)? ')' '=>' type           # typeOper
        |       'set' '(' type ')'                              # typeSet
        |       'seq' '(' type ')'                              # typeSeq
        |       '(' type ',' type (',' type)* ')'               # typeTuple
        |       '{' IDENTIFIER ':' type
                         (',' IDENTIFIER ':' type)* '}'         # typeRec
        |       typeUnionRecOne+                                # typeUnionRec
        |       'int'                                           # typeInt
        |       'str'                                           # typeStr
        |       'bool'                                          # typeBool
        |       IDENTIFIER                                      # typeConstOrVar
        |       '(' type ')'                                    # typeParen
        ;

typeUnionRecOne : '|' '{' IDENTIFIER ':' STRING (',' IDENTIFIER ':' type)* '}'
        ;

// A TNT expression. The order matters, it defines the priority.
// Wherever possible, we keep the same order of operators as in TLA+.
expr:           // apply a built-in operator via the dot notation
                expr '.' nameAfterDot (LPAREN argList? RPAREN)?     # dotCall
                // Call a user-defined operator or a built-in operator.
                // The operator has at least one argument (otherwise, it's a 'val').
        |       normalCallName '(' argList? ')'                     # operApp
                // function application
        |       expr '[' expr ']'                                   # funApp
                // unary minus
        |       MINUS expr                                          # uminus
                // power over integers
        |       <assoc=right> expr op='^' expr                      # pow
                // integer arithmetic
        |       expr op=(MUL | DIV | MOD) expr                      # multDiv
        |       expr op=(PLUS | MINUS) expr                         # plusMinus
        |       'if' '(' expr ')' expr 'else' expr                  # ifElse
                // built-in infix/postfix operators, a la Scala
        |       expr IDENTIFIER (argList)?                          # infixCall
                // standard relations
        |       expr op=(GT | LT | GE | LE | NE | EQ |
                         ASGN | IN | NOTIN | SUBSETEQ) expr         # relations
                // Boolean operators. Note that not(e) is just a normal call
        |       expr AND expr                                       # and
        |       expr OR expr                                        # or
        |       expr IFF expr                                       # iff
        |       expr IMPLIES expr                                   # implies
                // similar to indented /\ and indented \/ of TLA+
        |       '(' ('&')? expr '&' expr ('&' expr)* ')'            # andExpr
        |       '(' ('|')? expr '|' expr ('|' expr)* ')'            # orExpr
        |       '{' ('&')? expr '&' expr ('&' expr)* '}'            # andAction
        |       '{' ('|')? expr '|' expr ('|' expr)* '}'            # orAction
        |       ( IDENTIFIER | INT | BOOL | STRING)                 # literalOrId
        //      a tuple constructor, the form tup(...) is just an operator call
        |       '(' expr ',' expr (',' expr)* ')'                   # tuple
        |       '{' IDENTIFIER ':' expr
                        (',' IDENTIFIER ':' expr)* '}'              # record
        //      a sequence constructor, the form seq(...) is just an operator call
        |       ('[' (expr (',' expr)*)? ']')                       # sequence
        |       operDef expr                                        # letIn
        |       '(' expr ')'                                        # paren
        |       '{' expr '}'                                        # braces
        // errors
        | (operator | ':' | '}' | ']' | ')' | '='
              | 'set' | 'seq' | ',' | '->') {
            this.notifyErrorListeners("TNT003: expected an expression");
          }                                                         # errorNoExpr
        | expr ('if' | ':' | '}' | ']' | ')'
                | 'set' | 'seq' | '->' | '=') {
            this.notifyErrorListeners("TNT004: unexpected symbol after expression");
          }                                                         # errorSymbol
        ;

// This rule parses anonymous functions, e.g.:
// 1. Non-action lambdas:
//   x, y, z -> e
//   (x, y, z -> e)
//
// 2. Action lambdas:
//   { x, y, z -> e }
lambda:         identOrHole (',' identOrHole)*  '->' expr
        |       '(' identOrHole (',' identOrHole)*  '->' expr ')'
        |       '{' identOrHole (',' identOrHole)*  '->' expr '}'
        ;

// an identifier or a hole '_'
identOrHole :   '_' | IDENTIFIER
        ;

// an identifier or a star '*'
identOrStar :   '*' | IDENTIFIER
        ;

// a path used in imports
path    : IDENTIFIER ('.' IDENTIFIER)*
        ;

// A lambda or an expression with lambda having a priority
lambdaOrExpr :  lambda
        |       expr
        ;

argList:       lambdaOrExpr (',' lambdaOrExpr)*
        ;

// operators in the normal call may use some reserved names
normalCallName :   IDENTIFIER
        |       op=(IN | NOTIN | AND | OR | IFF | IMPLIES | SET | SEQ | SUBSETEQ)
        ;

// Some infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
nameAfterDot :  IDENTIFIER
        |       op=(IN | NOTIN | AND | OR | IFF | IMPLIES | SUBSETEQ)
        ;

// special operators
operator: (AND | OR | IFF | IMPLIES | SUBSETEQ | IN | NOTIN |
           GT  | LT  | GE  | LE | NE | EQ | ASGN |
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
INT             : [0-9]+ ;

// a few keywords
AND             :   'and' ;
OR              :   'or'  ;
IFF             :   'iff' ;
IMPLIES         :   'implies' ;
SUBSETEQ        :   'subseteq' ;
IN              :   'in' ;
NOTIN           :   'notin' ;
SET             :   'set' ;
SEQ             :   'seq' ;
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
ASGN            :   '<-' ;
LPAREN          :   '(' ;
RPAREN          :   ')' ;

// other TLA+ identifiers
IDENTIFIER      : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
