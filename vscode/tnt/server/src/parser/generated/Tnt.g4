// A grammar of TNT: not TLA+
//
// @author: Igor Konnov
grammar Tnt;

module : 'module' ident ('extends' ident (',' ident))? unit* 'end';

// a module unit
unit :          'const' ident ':' ('_' | type)                  # const
        |       'var' ident ':' ('_' | type)                    # var
        |       'assume' (ident | '_') '=' expr                 # assume
        |       ('private')? valDef (':' ('_' | type))?         # val
        |       ('private')? operDef (':' ('_' | type))?        # oper
        |       ('private')? 'pred' ident params?
                           (':' ('_' | type))? '=' expr         # pred
        |       ('private')? 'action' ident params?
                           (':' ('_' | type))? '=' expr         # action
        |       ('private')? 'temporal' ident params?
                           (':' ('_' | type))? '=' expr         # temporal
        |       module                                          # moduleNested
        |       instanceDef                                     # instance
        |       'typedef' ALL_CAPS_ID '=' type                  # typeDef
        ;

valDef  :       'val' ident (':' ('_' | type))? '=' expr
        ;

operDef :       'def' ('rec')? ident params (':' ('_' | type))? '=' expr
        ;

instanceDef :   'instance' (ident | '_') '=' ident
                        ('with' ident '<-' expr (',' ident '<-' expr)*)?
        ;

params  :       '(' (ident (',' ident)*)? ')'
        ;

// Types. This is Type System 1 of Apalache, except that records are disjoint unions.
type :          type '->' type                                  # typeFun
        |       '(' (type (',' type)*)? ')' '=>' type           # typeOper
        |       'set' '(' type ')'                              # typeSet
        |       'seq' '(' type ')'                              # typeSeq
        |       '(' type ',' type (',' type)* ')'               # typeTuple
        |       '{' ident ':' type (',' ident ':' type)* '}'    # typeRec
        |       typeUnionRecOne+                                # typeUnionRec
        |       'int'                                           # typeInt
        |       'str'                                           # typeStr
        |       'bool'                                          # typeBool
        |       ALL_CAPS_ID                                     # typeConst
        |       ONE_LETTER                                      # typeVar
        |       '(' type ')'                                    # typeParen
        ;

typeUnionRecOne :  '|' '{' ident ':' STRING (',' ident ':' type)* '}'
        ;

// A TNT expression. The order matters, it defines the priority.
// Wherever possible, we keep the same order of operators as in TLA+.
expr:           // apply a built-in operator via the dot notation
                expr '.' name_after_dot ('(' (lambda | arg_list) ')')?  # dotCall
                // Call a user-defined operator or a built-in operator
                // of at least one argument.
                // This includes: set, next, unchanged, always, eventually, enabled
        |       ident '(' arg_list? ')'                             # operApp
                // function application
        |       expr '[' expr ']'                                   # funApp
                // unary minus
        |       '-' expr                                            # uminus
                // power over integers
        |       <assoc=right> expr op='^' expr                      # pow
                // integer arithmetic
        |       expr op=('*' | '/' | '%') expr                      # multDiv
        |       expr op=('+' | '-') expr                            # plusMinus
        |       'if' '(' expr ')' expr 'else' expr                  # ifElse
        |       'case' '{' '|'? expr '->' expr ('|' expr '->' expr)* '}' # blockCase
                // built-in infix/postfix operators, a la Scala
        |       expr ident (arg_list)?                              # infixCall
                // standard relations
        |       expr op=('>' | '<' | '>=' | '<=' |
                         '<>' | '!=' | '==' | ':=' | '=' |
                         IN | NOTIN | SUBSETEQ) expr                # relations
                // Boolean operators. Importantly, not(e) is just a normal call
        |       expr AND expr                                       # and
        |       expr OR expr                                        # or
        |       expr IFF expr                                       # iff
        |       expr IMPLIES expr                                   # implies
                // similar to indented /\ and indented \/
        |       '{' ('&')? expr '&' expr ('&' expr)* '}'            # blockAnd
        |       '{' ('|')? expr '|' expr ('|' expr)* '}'            # blockOr
        |       ( ident | INT | BOOL | STRING | BUILTIN_CONST)      # literalOrId
        |       '(' expr ',' expr (',' expr)* ')'                   # tuple
        |       '\'{' (expr (',' expr)*)? '}'                       # set
        |       '{' ident ':' expr (',' ident ':' expr)* '}'        # record
        |       '[' ident 'in' expr (',' ident 'in' expr)* ']'      # recordSet
        |       '[' (expr (',' expr)*)? ']'                         # sequence
        |       (valDef IN expr | operDef IN expr)                  # letIn
        |       '(' expr ')'                                        # paren
        |       '{' (lambda | expr) '}'                             # lambdaOrBraces
        ;

// This rule parses two different syntactic options:
//   1. A single-argument lambda: x -> e.
//   2. A multi-argument lambda: (x, y, z) -> e.
lambda:         pattern '->' expr
        ;

// a pattern like (x, (y, z)) in lambdas
pattern:        '(' pattern (',' pattern)* ')'
        |       (ident | '_')
        ;

arg_list:       expr (',' expr)*
        ;

// Some infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
name_after_dot  :    (ID | ONE_LETTER | ALL_CAPS_ID | IN | NOTIN |
                      AND | OR | IFF | IMPLIES)
        ;

ident   : (ID | ONE_LETTER | ALL_CAPS_ID | 'set' | 'seq')
        ;        

// TOKENS

// literals
// Strings cannot be escaped, as they are pseudo-identifiers.
STRING          : '"' .*? '"' ;
BOOL            : ('false' | 'true') ;
INT             : [0-9]+ ;
BUILTIN_CONST   : ('Int' | 'Nat' | 'Bool') ;

// a few keywords
AND             :   'and' ;
OR              :   'or'  ;
IFF             :   'iff' ;
IMPLIES         :   'implies' ;
SUBSETEQ        :   'subseteq' ;
IN              :   'in' ;
NOTIN           :   'notin' ;

// this token is used for type variables
ONE_LETTER      : [a-z] ;
// this token is used for constant types
ALL_CAPS_ID     : [A-Z_][A-Z0-9_]* ;
// other TLA+ identifiers
ID              : [a-zA-Z_][a-zA-Z0-9_]* ;

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
