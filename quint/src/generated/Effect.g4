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

concrete:   component ('&' component)*                  # concreteComponents
          | 'Pure'                                      # pure
          ;

component:  read     # readComponent
          | update   # updateComponent
          | temporal # temporalComponent
          ;

entity : ((stateVarRef | IDENTIFIER) (',' (stateVarRef | IDENTIFIER))*)? ;

stateVarRef : '\'' IDENTIFIER '\'' ;

IDENTIFIER : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;

WS: [ \t\r\n]+ -> skip ; // skip spaces, tabs, newlines
