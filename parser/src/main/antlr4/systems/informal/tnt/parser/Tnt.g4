// A grammar of TNT: not TLA+
//
// @author: Igor Konnov
grammar Tnt;

module : 'module' ID ('extends' ID (',' ID))? unit* 'end';

// a module unit
unit :          'const' ID ':' '_'                              # const
        |       'var' ID ':' '_'                                # var
        |       'assume' (ID | '_') '=' expr                            # assume
        |       ('private')? valDef                             # val
        |       ('private')? operDef                            # oper
        |       ('private')? 'pred' ID params? '=' expr         # pred
        |       ('private')? 'action' ID params? '=' expr       # action
        |       ('private')? 'temporal' ID params? '=' expr     # temporal
        |       module                                          # moduleNested
        |       instanceDef                                     # instance
        ;

valDef  :       'val' ID '=' expr
        ;

operDef :       'def' ('rec')? ID params '=' expr
        ;

instanceDef :   'instance' (ID | '_') '=' ID ('with' ID '<-' expr (',' ID '<-' expr)*)?
        ;

params  :       '(' (ID (',' ID)*)? ')'
        ;
        

// A TNT expression. The order matters, it defines the priority.
// Wherever possible, we keep the same order of operators as in TLA+.
expr:           // apply a built-in operator via the dot notation
                expr '.' name_after_dot ('(' (lambda | arg_list) ')')?  # dotCall
                // Call a user-defined operator or a built-in operator
                // of at least one argument.
                // This includes: set, next, unchanged, always, eventually, enabled
        |       ID '(' arg_list ')'                                 # operApp
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
        |       'case' '{' ('|' expr '->' expr)* '}'                # blockCase
                // built-in infix/postfix operators, a la Scala
        |       expr ID (arg_list)?                                 # infixCall
                // standard relations
        |       expr op=('>' | '<' | '>=' | '<' |
                         '<>' | '!=' | '=' | '==' |
                         ':=' | IN | NOTIN | SUBSETEQ) expr         # relations
                // Boolean operators
        |       NOT expr                                            # not
        |       expr AND expr                                       # and
        |       expr OR expr                                        # or
        |       expr IFF expr                                       # iff
        |       expr IMPLIES expr                                   # implies
                // similar to indented /\ and indented \/
        |       '{' '&' expr ('&' expr)* '}'                        # blockAnd
        |       '{' '|' expr ('|' expr)* '}'                        # blockOr
        |       ( ID | INT | BOOL | STRING | BUILTIN_CONST)         # literal
        |       '(' expr ',' expr (',' expr)* ')'                   # tuple
        |       '`{' (expr (',' expr)*)? '}'                        # set
        |       '[' ID '->' expr (',' ID '->' expr)* ']'            # record
        |       '[' ID ':' expr (',' ID ':' expr)* ']'              # recordSet
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
        |       (ID | '_')
        ;

arg_list:  expr (',' expr)*
        ;

// Some infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
name_after_dot  :    (ID | IN | NOTIN | AND | OR | IFF | IMPLIES)
        ;

// TOKENS

// literals
// Strings cannot be escaped, as they are pseudo-identifiers.
// We also give the user flexibility in using either quotes or double quotes.
STRING  : ('"' .*? '"' | '\'' .*? '\'');
BOOL    : ('false' | 'true') ;
INT     : [0-9]+ ;
BUILTIN_CONST   : ('Int' | 'Nat' | 'Bool') ;

// a few keywords
NOT         :   'not' ;
AND         :   'and' ;
OR          :   'or'  ;
IFF         :   'iff' ;
IMPLIES     :   'implies' ;
SUBSETEQ    :   'subseteq' ;
IN          :   'in' ;
NOTIN       :   'notin' ;

// a TLA+ identifier
ID  : [a-zA-Z_][a-zA-Z0-9_]* ;

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
