/*
 If you do not know how to start this lesson, do one of the following:

 1. Run a Codetour tutorial as follows:
    - Open Visual Studio Code.
    - Install the Quint and Codetour extensions.
    - Choose the tour "Lesson 2 - Integers".
    
 2. Read the accompanying markdown file.
 */
module integersLesson {

    // 0 is an integer literal
    pure val int0 = 0

    // 1 is an integer literal
    pure val int1 = 2

    // 2 is an integer literal
    pure val negative1 = -3

    // i^j is the integer exponentiation, that is,
    // `i` multiplied by itself `j - 1` times
    pure def myPow(i, j) = i^j 

    // i + j is the integer addition
    pure def myAdd(i, j) = i + j 

    // i - j is the integer subtraction
    pure def mySub(i, j) = i - j 

    // i * j is the integer multiplication
    pure def myMul(i, j) = i * j 

    // i / j is the integer division
    pure def myDiv(i, j) = i / j

    // i % j is the integer remainder
    pure def myMod(i, j) = i % j


    // `i > j` is true if and only if `i` is greater than `j`
    pure def myGreaterThan(i, j) = i > j

    // `i >= j` is true if and only if `i` is greater than `j`, or equal to `j`
    pure def myGreaterThanOrEqual(i, j) = i >= j

    // `i < j` is true if and only if `i` is less than `j`
    pure def myLessThan(i, j) = i < j

    // `i <= j` is true if and only if `i` is less than `j`, or equal to `j`
    pure def myLessThanOrEqual(i, j) = i <= j

    // `i == j` is true if and only if `i` equals to `j`
    pure def myEquals(i, j) = i == j

    // `i != j` is true if and only if `i` is not equal to `j`
    pure def myNotEqual(i, j) = i != j


    // -i is the integer negation
    pure def myUnaryMinus(i) = -i
}

