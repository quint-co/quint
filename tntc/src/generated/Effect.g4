/**
 * A grammar of TNT Effects
 *
 * @author: Gabriela Moreira, Informal Systems, 2022
 */
grammar Effect;

effect:   concrete                                           # concreteEffect
        | '(' (effect (', ' effect)*)? ')' ' => ' effect     # arrowEffect
        | IDENTIFIER                                         # quantifiedEffect
        ;

concrete:   'Read' '[' vars ']'                         # readOnly
          | 'Update' '[' vars ']'                       # updateOnly
          | 'Read' '[' vars '] & Update' '[' vars ']'   # readAndUpdate
          | 'Pure'                                      # pure
          ;

vars :   (stateVarRef (', ' stateVarRef)*)?    # concreteVariables
       | (IDENTIFIER (', ' IDENTIFIER)*)?    # quantifiedVariables
       ;

stateVarRef : '\'' IDENTIFIER '\'' ;

IDENTIFIER : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;
