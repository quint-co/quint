# Lesson 2 - Integers
## 1. Introduction

*Progress:*  0%

This lesson teaches you the basics of operations over integers.
If you have programming experience, you know most of these operators. 
So it should not take you long to finish this lesson.
Do not skip this lesson, as some of the operators may still surprise you.
        
## 2. Integer literals

*Progress:*  11%

**Code snippet:**

```quint

    // 0 is an integer literal
    pure val int0 = 0

    // 2 is an integer literal
    pure val int1 = 2

    // -3 is an integer literal
    pure val negative1 = -3
```


Integer literals are written using the standard syntax:
0, 1, -1, 2, -2, ..., 314159265358979323846264338327950288419716939937510.

It is important to understand that Quint integers are big integers.
There is neither a minimum integer, nor there is a maximum integer.

It's quite easy to express the standard 32-bit, 64-bit, 128-bit, and 512-bit
integers with Quint integers. We will cover this in a follow up tutorial.

We omit several integer operators that produce sets. These operators are covered in
the tutorial on sets.
        
## 3. Integer exponentiation

*Progress:*  22%

**Code snippet:**

```quint

    // i^j is the integer exponentiation, that is,
    // `i` multiplied by itself `j - 1` times
    pure def myPow(i, j) = i^j 
```


          

We start with the exponentiation `i^j` over integers,
which is also written as `pow(i, j)` in many languages.
The result of `i^j` is simply `i` multiplied by itself `j - 1` times.
This is the first operator, as it lets us to write nice examples
in the following steps.

To get a better intuition at how `i^j` works, run the following examples:

          

```sh
echo "2^32" | quint
```


```sh
echo "2^64" | quint
```


```sh
echo "2^256" | quint
```


```sh
echo "2^512" | quint
```


Exponentiation is not defined on all of its arguments.
Try the following examples to get the intuition.
          

```sh
echo "(-2)^3" | quint
```


```sh
echo "(-2)^4" | quint
```


```sh
echo "2^(-4)" | quint
```


```sh
echo "0^3" | quint
```


```sh
echo "0^0" | quint
```


```sh
echo "0^(-2)" | quint
```

## 4. Integer addition

*Progress:*  33%

**Code snippet:**

```quint

    // i + j is the integer addition
    pure def myAdd(i, j) = i + j 
```


          

We can add two integers by writing `i + j`. Importantly, integers cannot
overflow, as they are big integers.

Try this simple example:

          

```sh
echo "2022 + 2023" | quint
```



It is important to remember that integer addition satisfies the laws
of commutativity and associativity in Quint:

          

```sh
echo "11 + 17 == 17 + 11" | quint
```


```sh
echo "(11 + 17) + 19 == 11 + (17 + 19)" | quint
```

## 5. Integer subtraction

*Progress:*  44%

**Code snippet:**

```quint

    // i - j is the integer subtraction
    pure def mySub(i, j) = i - j 
```


          

We can add two integers by writing `i - j`.

 - Try this and see the result of the evaluation:

          

```sh
echo "2022 - 2023" | quint
```



 - Addition and subtraction have the same priority.
   Hence they are applied from left to right.

          

```sh
echo "11 + 13 - 17" | quint
```


 **Exercise:** Is subtraction commutative?
          
## 6. Integer multiplication

*Progress:*  55%

**Code snippet:**

```quint

    // i * j is the integer multiplication
    pure def myMul(i, j) = i * j 
```


          

We can multiply two integers by writing `i * j`.
Remember that multiplication cannot produce any side effects like overflows:

          

```sh
echo "2^32 * 2^32 == 2^64" | quint
```



It is important to remember that integer multiplication satisfies the laws
of commutativity and associativity in Quint:

          

```sh
echo "11 * 17 == 17 * 11" | quint
```


```sh
echo "(11 * 17) * 19 == 11 * (17 * 19)" | quint
```

## 7. Integer division and remainder

*Progress:*  66%

**Code snippet:**

```quint

    // i / j is the integer division
    pure def myDiv(i, j) = i / j

    // i % j is the integer remainder
    pure def myMod(i, j) = i % j

```


          

The operators `i / j` and `i % j` compute the integer part and the remainder
when dividing `i` by `j`, respectively. These operators have the following
property for all integer values of `i` and all integer values of `j != 0`:
`i == (i / j) * j + i % j`.

Try the following examples to check your intuition:

          

```sh
echo "99 / 2 == 49" | quint
```


```sh
echo "99 % 2 == 1" | quint
```


```sh
echo "98 % 2 == 0" | quint
```


```sh
echo "((2^64 - 1) % 2^64 + 1) % 2^64" | quint
```


```sh
echo "(2^64 - 123) % 2^63" | quint
```


 **Exercise:** Is division commutative?
          
## 8. Integer comparison

*Progress:*  77%

**Code snippet:**

```quint

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

```


          

These are the standard comparison operators that you know, for sure:

 - Less than: `i < j`
 - Less than or equal: `i <= j`
 - Greater than: `i > j`
 - Greater than or equal: `i >= j`
 - Equals to: `i == j`
 - Not equal to: `i != j`

Check your intuition by running the following examples:
          

```sh
echo "10 < 11" | quint
```


```sh
echo "10 < 10" | quint
```


```sh
echo "10 <= 11" | quint
```


```sh
echo "10 <= 10" | quint
```


```sh
echo "10 <= 9" | quint
```


```sh
echo "11 > 10" | quint
```


```sh
echo "10 > 10" | quint
```


```sh
echo "11 >= 10" | quint
```


```sh
echo "10 >= 10" | quint
```


```sh
echo "10 >= 9" | quint
```


```sh
echo "10 == 10" | quint
```


```sh
echo "10 == 11" | quint
```


```sh
echo "10 != 10" | quint
```


```sh
echo "10 != 11" | quint
```

## 9. Integer negation

*Progress:*  88%

**Code snippet:**

```quint

    // -i is the integer negation
    pure def myUnaryMinus(i) = -i
```


          

We almost forgot about the integer negation!
Not surprisingly, `-i` negates an integer `i`.
Recall that Quint integers are big integers.
Hence, no overflow is possible.

Try a few examples:

          

```sh
echo "-(3 + 2)" | quint
```


```sh
echo "-(-2^63) == 2^63" | quint
```

## The end

  You have made it!
      