// A grammar of TNT: not TLA+.
// Our goals are:
//  1. Keep the grammar simple,
//  2. Make it expressive enough to capture all of TLA+.
//
// @author: Igor Konnov
grammar Tnt;

module : 'module' IDENTIFIER '{' unit* '}';

// a module unit
unit :          'const' IDENTIFIER ':' type                     # const
        |       'var' IDENTIFIER ':'   type                     # var
        |       'assume' (IDENTIFIER | '_') '=' expr            # assume
        |       PRIVATE? valDef                                 # val
        |       PRIVATE? operDef                                # oper
        |       PRIVATE? ('pred' | 'action' | 'temporal')       
                           IDENTIFIER params?
                           (':' type)? '=' expr                 # pat
        |       module                                          # moduleNested
        |       instanceDef                                     # instance
        |       'typedef' IDENTIFIER '=' type                   # typeDef
        |       (IDENTIFIER | operator | literal) {
         this.notifyErrorListeners("TNT001: expected a const, var, def, typedef, etc.");
                }                                               # errorCase
        ;

valDef  :       'val' IDENTIFIER (':' type)? '=' expr
        ;

operDef :       'def' REC? IDENTIFIER params
                         (':' type)? '=' expr
        ;

instanceDef :   'instance' (IDENTIFIER | '_') '=' IDENTIFIER
                    ('with' IDENTIFIER '<-' expr (',' IDENTIFIER '<-' expr)*)?
        ;

params  :       '(' (IDENTIFIER (',' IDENTIFIER)*)? ')'
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
                expr '.' name_after_dot ('(' (lambda | arg_list) ')')?  # dotCall
                // Call a user-defined operator or a built-in operator
                // of at least one argument.
                // This includes: next, unchanged, always, eventually, enabled
        |       normalCallName '(' arg_list? ')'                  # operApp
                // function application
        |       expr '[' expr ']'                                   # funApp
                // unary minus
        |       SUB expr                                            # uminus
                // power over integers
        |       <assoc=right> expr op='^' expr                      # pow
                // integer arithmetic
        |       expr op=(MUL | DIV | MOD) expr                      # multDiv
        |       expr op=(ADD | SUB) expr                            # plusMinus
        |       'if' '(' expr ')' expr 'else' expr                  # ifElse
        |       'case' '{' '|'? expr '->' expr
                    ('|' expr '->' expr)* ('|' '_' '->' expr)? '}'  # caseBlock
                // built-in infix/postfix operators, a la Scala
        |       expr IDENTIFIER (arg_list)?                         # infixCall
                // standard relations
        |       expr op=(GT | LT | GE | LE | NE | EQEQ |
                         EQ | ASGN | IN | NOTIN | SUBSETEQ) expr    # relations
                // Boolean operators. Importantly, not(e) is just a normal call
        |       expr AND expr                                       # and
        |       expr OR expr                                        # or
        |       expr IFF expr                                       # iff
        |       expr IMPLIES expr                                   # implies
                // similar to indented /\ and indented \/
        |       '{' ('&')? expr '&' expr ('&' expr)* '}'            # andBlock
        |       '{' ('|')? expr '|' expr ('|' expr)* '}'            # orBlock
        |       ( IDENTIFIER | INT | BOOL | STRING)                 # literalOrId
        //      a tuple constructor, the form tuple(...) is just an operator call
        |       '(' expr ',' expr (',' expr)* ')'                   # tuple
        |       '{' IDENTIFIER ':' expr
                        (',' IDENTIFIER ':' expr)* '}'              # record
        |       '[' IDENTIFIER 'in' expr
                        (',' IDENTIFIER 'in' expr)* ']'             # recordSet
        //      a sequence constructor, the form seq(...) is just an operator call
        |       ('[' (expr (',' expr)*)? ']' |
                        'seq' '(' (expr (',' expr)*)? ')')          # sequence
        |       (valDef expr | operDef expr)                        # letIn
        |       '(' expr ')'                                        # paren
        |       '{' (lambda | expr) '}'                             # lambdaOrBraces
        ;

// This rule parses two different syntactic options:
//   1. A single-argument lambda: x -> e.
//   2. A multi-argument lambda: (x, y, z) -> e.
lambda:         identOrHole '->' expr                               # lambdaOne
        |       '(' identOrHole (',' identOrHole)* ')'  '->' expr   # lambdaMany
        ;

// an identifier or a hole '_'
identOrHole :   IDENTIFIER | '_'
        ;        

arg_list:       expr (',' expr)*
        ;

// operators in the normal call may use some reserved names
normalCallName :   (IDENTIFIER | op=(IN | NOTIN | AND | OR | IFF | IMPLIES
                     | SET | SUBSETEQ))
        ;

// Some infix operators may be called via lhs.oper(rhs),
// without causing any ambiguity.
name_after_dot  :  (IDENTIFIER
                    | op=(IN | NOTIN | AND | OR | IFF | IMPLIES | SUBSETEQ))
        ;

// special operators
operator: (AND | OR | IFF | IMPLIES | SUBSETEQ | IN | NOTIN |
           '(' | '{' | '[' | '&' | '|' | 'if' | 'case' |
           GT  | LT  | GE  | LE | NE | EQEQ | EQ | ASGN |
           MUL | DIV | MOD | ADD | SUB | '^')
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
PRIVATE         :   'private' ;
ADD             :   '+' ;
SUB             :   '-' ;
MUL             :   '*' ;
DIV             :   '/' ;
MOD             :   '%' ;
GT              :   '>' ;
LT              :   '<' ;
GE              :   '>=' ;
LE              :   '<=' ;
NE              :   '!=' ;
EQEQ            :   '==' ;
EQ              :   '='  ;
ASGN            :   ':=' ;
REC             :   'rec' ;

// other TLA+ identifiers
IDENTIFIER      : [a-zA-Z_][a-zA-Z0-9_]* ;

// comments and whitespaces
LINE_COMMENT    :   '//' .*? '\n'   -> skip ;
COMMENT         :   '/*' .*? '*/'   -> skip ;
WS              :   [ \t\r\n]+      -> skip ; // skip spaces, tabs, newlines
