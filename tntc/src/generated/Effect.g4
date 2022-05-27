/**
 * A grammar of TNT Effects
 *
 * @author: Gabriela Moreira, Informal Systems, 2022
 */
grammar Effect;

effect:   concreteEffect                                     # concrete
        | '(' (effect (', ' effect)*)? ')' ' => ' effect     # arrowEffect
        | IDENTIFIER                                         # varEffect
        ;

concreteEffect:   'Read' '[' vars ']'                         # readOnly
                | 'Update' '[' vars ']'                       # updateOnly
                | 'Read' '[' vars '] & Update' '[' vars ']'   # readAndUpdate
                | 'Pure'                                      # pure
                ;

vars :   (stateVarRef (',' stateVarRef)*)?    # concreteVars
       | (IDENTIFIER (',' IDENTIFIER)*)?    # quantification
       ;

stateVarRef : '\'' IDENTIFIER '\'' ;

IDENTIFIER : ([a-zA-Z][a-zA-Z0-9_]*|[_][a-zA-Z0-9_]+) ;
