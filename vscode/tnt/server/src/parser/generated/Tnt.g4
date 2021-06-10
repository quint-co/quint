// A grammar of TNT: not TLA+
//
// @author: Igor Konnov
grammar Tnt;

module : 'module' IDENTIFIER ('extends' IDENTIFIER (',' IDENTIFIER))? unit* 'end';

// a module unit
unit :          'const' IDENTIFIER ':' ('_' | type)             # const
        |       'var' IDENTIFIER ':' ('_' | type)               # var
        |       'assume' (IDENTIFIER | '_') '=' expr            # assume
        |       ('private')? valDef (':' ('_' | type))?         # val
        |       ('private')? operDef (':' ('_' | type))?        # oper
        |       ('private')? 'pred' IDENTIFIER params?
                           (':' ('_' | type))? '=' expr         # pred
        |       ('private')? 'action' IDENTIFIER params?
                           (':' ('_' | type))? '=' expr         # action
        |       ('private')? 'temporal' IDENTIFIER params?
                           (':' ('_' | type))? '=' expr         # temporal
        |       module                                          # moduleNested
        |       instanceDef                                     # instance
        |       'typedef' IDENTIFIER '=' type                   # typeDef
        |       (IDENTIFIER | operator | literal) {
         this.notifyErrorListeners("TNT001: expected a const, var, def, typedef, etc.");
                }                                               # errorCase
        ;

valDef  :       'val' IDENTIFIER (':' ('_' | type))? '=' expr
        ;

operDef :       'def' ('rec')? IDENTIFIER params (':' ('_' | type))? '=' expr
        ;

instanceDef :   'instance' (IDENTIFIER | '_') '=' IDENTIFIER
                    ('with' IDENTIFIER '<-' expr (',' IDENTIFIER '<-' expr)*)?
        ;

params  :       '(' (IDENTIFIER (',' IDENTIFIER)*)? ')'
        ;

// Types. This is Type System 1 of Apalache, except that records are disjoint unions.
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
                expr '.' name_after_dot ('(' (lambda | arg_list) ')')?  # dotCall
                // Call a user-defined operator or a built-in operator
                // of at least one argument.
                // This includes: next, unchanged, always, eventually, enabled
        |       IDENTIFIER '(' arg_list? ')'                        # operApp
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
        |       expr IDENTIFIER (arg_list)?                         # infixCall
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
        |       ( IDENTIFIER | INT | BOOL | STRING | BUILTIN_CONST) # literalOrId
        |       '(' expr ',' expr (',' expr)* ')'                   # tuple
        |       ('\'{' (expr (',' expr)*)? '}' |
                        'set' '(' (expr (',' expr)*)? ')')          # set
        |       '{' IDENTIFIER ':' expr
                        (',' IDENTIFIER ':' expr)* '}'              # record
        |       '[' IDENTIFIER 'in' expr
                        (',' IDENTIFIER 'in' expr)* ']'             # recordSet
        |       ('[' (expr (',' expr)*)? ']' |
                        'seq' '(' (expr (',' expr)*)? ')')          # sequence
        |       (valDef expr | operDef expr)                        # letIn
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
        |       (IDENTIFIER | '_')
        ;

arg_list:       expr (',' expr)*
        ;

// Some infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
name_after_dot  :    (IDENTIFIER | IN | NOTIN | AND | OR | IFF | IMPLIES)
        ;

// special operators
operator: (AND | OR | IFF | IMPLIES | SUBSETEQ | IN | NOTIN |
           '(' | '{' | '[' | '&' | '|' | 'if' | 'case' |
           '>' | '<' | '>=' | '<=' | '<>' | '!=' | '==' | ':=' | '=' |
           '*' | '/' | '%' | '+' | '-' | '^')
        ;

// literals
literal: (STRING | BOOL | INT | BUILTIN_CONST)
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

// other TLA+ identifiers
IDENTIFIER      : [a-zA-Z_][a-zA-Z0-9_]* ;

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
