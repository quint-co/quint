# Lesson 1 - Booleans
## 1. Introduction

*Progress:*  0%

In this lesson, you will learn how to use Booleans. It should take you real quick to learn this lesson.

**Do not skip this lesson.** It introduces a few important language concepts, not just the Booleans.

If you would like to see the complete code before diving into
the details, check [booleans.qnt](./booleans.qnt).

        
## 2. Boolean literals

*Progress:*  6%

**Code snippet:**

```quint

    // false is a built-in constant
    pure val myFalse = false

    // true is a built-in constant too
    pure val myTrue = true
```


Quint has two built-in values of `bool` type, called Boolean literals:

  - `false` is the value that represents the value "false".
  - `true` is the value that represents the value "true".

Note that Quint is strict with respect to Boolean values.
There are only `false` and `true`. They are comparable
only to Boolean values, and there are no implicit conversions
from other types to the Boolean type.

You cannot modify Boolean values. You can carry them
around as variable values, or in data structures.

Evaluate the Boolean literals in REPL:
          

```sh
echo "false" | quint
```


```sh
echo "true" | quint
```

## 3. Boolean negation

*Progress:*  13%

**Code snippet:**

```quint

    // Boolean negation, which is written as `!x` in some languages
    pure def myNot(x) = not(x)
```


The simplest operation we can do with a Boolean value is negation.

Evaluate the negation of `false` and `true`:

          

```sh
echo "not(false)" | quint
```


```sh
echo "not(true)" | quint
```

## 4. Boolean equality

*Progress:*  20%

**Code snippet:**

```quint

    // you can compare Booleans for equality
    pure def myEq(x, y) = x == y
```


          

We can compare Booleans for equality. The rules for equality are straightforward.

Try comparing `false` and `true` in all possible combinations:
          

```sh
echo "false == false" | quint
```


```sh
echo "false == true" | quint
```


```sh
echo "true == false" | quint
```


```sh
echo "true == true" | quint
```


One important feature of equality is that the arguments should have the same type.
Hence, Booleans can be only compared to Booleans. The following expressions
produces type errors. Try them:
          

```sh
echo "false == 0" | quint
```


```sh
echo "true == 1" | quint
```

## 5. Boolean inequality

*Progress:*  26%

**Code snippet:**

```quint

    // you can compare Booleans for inequality
    pure def myNeq(x, y) = x != y
```


We can compare Booleans for inequality. It is simply the opposite of `x == y`.

Try comparing `false` and `true` in all possible combinations:

          

```sh
echo "false != false" | quint
```


```sh
echo "false != true" | quint
```


```sh
echo "true != false" | quint
```


```sh
echo "true != true" | quint
```

## 6. Dot form

*Progress:*  33%

**Code snippet:**

```quint

    // you can also write negation like that
    pure def myNot2(x) = x.not()
```


          

If you prefer object-oriented style, you can also write `x.not()`. Try it out:
          

```sh
echo "false.not()" | quint
```


**This is a general principle:** You can write `foo(x)` as `x.foo()` and vice versa.

Be careful about not writing `false.not`, as it would be understood as record access:
          

```sh
echo "false.not" | quint
```

## 7. Boolean "and"

*Progress:*  40%

**Code snippet:**

```quint

    // Boolean "and", which is written as `x && y` in some languages
    pure def myAnd(x, y) = x and y
```


Now it is time to learn about Boolean "and".

Evaluate all possible combinations of `false` and `true`:

          

```sh
echo "false and false" | quint
```


```sh
echo "false and true" | quint
```


```sh
echo "true and false" | quint
```


```sh
echo "true and true" | quint
```

## 8. Dot form for binary operators

*Progress:*  46%

**Code snippet:**

```quint

    // You can also write Boolean "and" like that in the OOP form
    pure def myAnd2(x, y) = x.and(y)
```


          

Similar to the operator `not`, you can use the object-oriented form for
Boolean "and". Try it:
          

```sh
echo "false.and(true)" | quint
```


**This is a general principle:** You can replace `bar(x, y)` with `x.bar(y)`,
and vice versa.

This form may be useful with nested formulas like:

  ```
  x.and(y).and(z)
  ```
          
## 9. And works for more than two arguments

*Progress:*  53%

**Code snippet:**

```quint

    // We can apply "and" to more than two arguments
    pure def myAnd3(x, y, z) = and(x, y, z)
```


As you see, "and" does not have to apply to two arguments only. You can use it with multiple arguments:

          

```sh
echo "and(true, false, true)" | quint
```


```sh
echo "and(true, false, true, false)" | quint
```


```sh
echo "and(true, false, true, false, true)" | quint
```

## 10. The and {...} form

*Progress:*  60%

**Code snippet:**

```quint

    /// When your expressions get bigger, you can stack them in `and { ... }`
    pure def myAnd4(x, y, z) = and {
        x,
        y,
        z
    }
```


          

Sometimes, we have to write complex expressions over Booleans. Yeah, that happens.

In this case, you can use the convenient form and { ... }, which is just syntax sugar for and(...).

Try it:
          

```sh
echo "and { false == false, true == true }" | quint
```

## 11. Boolean "or"

*Progress:*  66%

**Code snippet:**

```quint

    // Boolean "or", which is written as `x || y` in some languages.
    pure def myOr(x, y) = x or y
```


If there is "and", there must be "or".
Evaluate all possible combinations of `false` and `true`:

          

```sh
echo "false or false" | quint
```


```sh
echo "false or true" | quint
```


```sh
echo "true or false" | quint
```


```sh
echo "true or true" | quint
```

## 12. Other forms of "or"

*Progress:*  73%

**Code snippet:**

```quint

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
```


Similar to "and", we can use the dot-notation, "or" over multiple arguments,
and the `or { ... }`.
        
## 13. Boolean implication

*Progress:*  80%

**Code snippet:**

```quint

    /// Boolean implication.
    /// This operator is equivalent to `not(x).or(y)` as well as to `if (x) y else true`.
    pure def myImplies(x, y) = x implies y
```


Perhaps, you remember Boolean implication from your math classes.
In some languages, it is written as `x -> y` or `x => y`.
In Quint is written as `x implies y`, or, alternatively, `x.implies(y)`.

If you don't like it, you don't have to use it:
`x implies y` is equivalent to `not(x) or y`.

Try the implication for all combinations of `false` and `true`:

          

```sh
echo "false implies false" | quint
```


```sh
echo "false implies true" | quint
```


```sh
echo "true implies false" | quint
```


```sh
echo "true implies true" | quint
```

## 14. Boolean equivalence

*Progress:*  86%

**Code snippet:**

```quint

    /// Boolean equivalence.
    /// It is equivalent to x == y, but this operator requires the arguments
    /// to have the Boolean type.
    pure def myIff(x, y) = x iff y
```


Finally, we have the equivalence operator `x iff y`, or, alternatively, `x.iff(y)`.
It is really like `x == y`, but `x iff y` does a bit more:
It requires `x` and `y` to be Booleans.

What is it is good for? If you know what protocol invariants are,
`x iff y` looks nice when writing invariants and temporal formulas.
If you are not familiar with invariants and temporal formulas,
you probably do not need `iff` yet.

Try `iff` for all combinations of `false` and `true`:

          

```sh
echo "false iff false" | quint
```


```sh
echo "false iff true" | quint
```


```sh
echo "true iff false" | quint
```


```sh
echo "true iff true" | quint
```

## 15. Suming it up

*Progress:*  93%

We have covered all the operators over Booleans.
If you want to see all operators in one place,
check [booleans.qnt](https://github.com/informalsystems/quint/tree/main/examples/tutorials/booleans.qnt).

We are experimenting with different kinds of tutorials.
It would be great to learn, whether you liked this tutorial format, or not.
Please vote in the
[discussion](https://github.com/informalsystems/quint/discussions/516).
        
## The end

  You have made it!
      