/**
 * A grammar of TNT Effects
 *
 * @author: Gabriela Moreira, Informal Systems, 2022
 */
grammar Effect;

effect:   concrete                                           # concreteEffect
        | '(' (effect (', ' effect)*)? ')' '=>' effect       # arrowEffect
        | IDENTIFIER                                         # quantifiedEffect
        ;

read: 'Read' '[' vars ']' ;
update: 'Update' '[' vars ']' ;

concrete:   read                                        # readOnly
          | update                                      # updateOnly
          | (read '&' update | update '&' read)         # readAndUpdate
          | 'Pure'                                      # pure
          | 'Temporal'                                  # temporal
          ;

vars : ((stateVarRef | IDENTIFIER) (', ' (stateVarRef | IDENTIFIER))*)? ;

stateVarRef : '\'' IDENTIFIER '\'' ;

IDENTIFIER : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

WS: [ \t\r\n]+ -> skip ; // skip spaces, tabs, newlines
