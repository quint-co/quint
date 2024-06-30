/*
 If you do not know how to start this lesson, see:
 https://github.com/informalsystems/quint/tree/main/tutorials
 */
module booleansLesson {    

    // false is a built-in constant
    pure val myFalse = false

    // true is a built-in constant too
    pure val myTrue = true

    // Boolean negation, which is written as `!x` in some languages
    pure def myNot(x) = not(x)

    // you can compare Booleans for equality
    pure def myEq(x, y) = x == y

    // you can compare Booleans for inequality
    pure def myNeq(x, y) = x != y

    // you can also write negation like that
    pure def myNot2(x) = x.not()

    // Boolean "and", which is written as `x && y` in some languages
    pure def myAnd(x, y) = x and y

    // You can also write Boolean "and" like that in the OOP form
    pure def myAnd2(x, y) = x.and(y)

    // We can apply "and" to more than two arguments
    pure def myAnd3(x, y, z) = and(x, y, z)

    /// When your expressions get bigger, you can stack them in `and { ... }`
    pure def myAnd4(x, y, z) = and {
        x,
        y,
        z
    }

    // Boolean "or", which is written as `x || y` in some languages.
    pure def myOr(x, y) = x or y

    /// You can also write Boolean "or" like that in the OOP form
    pure def myOr2(x, y) = x.or(y)

    /// We can apply "or" to more than two arguments
    pure def myOr3(x, y, z) = or(x, y, z)

    /// When your expressions get bigger, you can stack them in `or { ... }`
    pure def myOr4(x, y, z) = or {
        x,
        y,
        z
    }

    /// Boolean implication.
    /// This operator is equivalent to `not(x).or(y)` as well as to `if (x) y else true`.
    pure def myImplies(x, y) = x implies y

    /// Boolean equivalence.
    /// It is equivalent to x == y, but this operator requires the arguments
    /// to have the Boolean type.
    pure def myIff(x, y) = x iff y
}
