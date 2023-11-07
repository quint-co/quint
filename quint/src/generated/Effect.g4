/**
 * A grammar of Quint Effects
 *
 * @author: Gabriela Moreira, Informal Systems, 2022
 */
grammar Effect;

effect:   concrete                                           # concreteEffect
        | '(' (effect (',' effect)*)? ')' '=>' effect       # arrowEffect
        | IDENTIFIER                                         # variableEffect
        ;

read: 'Read' '[' entity ']' ;
update: 'Update' '[' entity ']' ;
temporal: 'Temporal' '[' entity ']' ;

concrete:   read                                        # readOnly
          | update                                      # updateOnly
          | temporal                                    # temporalOnly
          | (read '&' update | update '&' read)         # readAndUpdate
          | (read '&' temporal | update '&' temporal)   # readAndTemporal
          | 'Pure'                                      # pure
          ;

entity : ((stateVarRef | IDENTIFIER) (',' (stateVarRef | IDENTIFIER))*)? ;

stateVarRef : '\'' IDENTIFIER '\'' ;

IDENTIFIER : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

WS: [ \t\r\n]+ -> skip ; // skip spaces, tabs, newlines
