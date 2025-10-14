/*
 If you do not know how to start this lesson, see:
 https://github.com/informalsystems/quint/tree/main/tutorials
 */
/*!
  <tutorial>
    <title>Lesson 1 - Booleans</title>
    <steps>
!*/
module booleansLesson {    
    /*!
      <step>
        <title>Introduction</title>
        <description>
In this lesson, you will learn how to use Booleans. It should take you real quick to learn this lesson.

**Do not skip this lesson.** It introduces a few important language concepts, not just the Booleans.

If you would like to see the complete code before diving into
the details, check [booleans.qnt](./booleans.qnt).

        </description>
        <file>$file</file>
        <line>$line</line>
      </step>
    !*/

    // false is a built-in constant
    pure val myFalse = false

    // true is a built-in constant too
    pure val myTrue = true
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean literals</title>
        <description>
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
          <run>quint "false"</run>
          <run>quint "true"</run>
        </description>
      </step>
     !*/

    // Boolean negation, which is written as `!x` in some languages
    pure def myNot(x) = not(x)
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean negation</title>
        <description>
The simplest operation we can do with a Boolean value is negation.

Evaluate the negation of `false` and `true`:

          <run>quint "not(false)"</run>
          <run>quint "not(true)"</run>
        </description>
      </step>
     !*/

    // you can compare Booleans for equality
    pure def myEq(x, y) = x == y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean equality</title>
        <description>
          <block>
We can compare Booleans for equality. The rules for equality are straightforward.

Try comparing `false` and `true` in all possible combinations:
          </block>

          <run>quint "false == false"</run>
          <run>quint "false == true"</run>
          <run>quint "true == false"</run>
          <run>quint "true == true"</run>

          <block>
One important feature of equality is that the arguments should have the same type.
Hence, Booleans can be only compared to Booleans. The following expressions
produces type errors. Try them:
          </block>

          <run>quint "false == 0"</run>
          <run>quint "true == 1"</run>
        </description>
      </step>
     !*/

    // you can compare Booleans for inequality
    pure def myNeq(x, y) = x != y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean inequality</title>
        <description>
We can compare Booleans for inequality. It is simply the opposite of `x == y`.

Try comparing `false` and `true` in all possible combinations:

          <run>quint "false != false"</run>
          <run>quint "false != true"</run>
          <run>quint "true != false"</run>
          <run>quint "true != true"</run>
        </description>
      </step>
     !*/

    // you can also write negation like that
    pure def myNot2(x) = x.not()
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Dot form</title>
        <description>
          <block>
If you prefer object-oriented style, you can also write `x.not()`. Try it out:
          </block>

          <run>quint "false.not()"</run>

          <block>
**This is a general principle:** You can write `foo(x)` as `x.foo()` and vice versa.

Be careful about not writing `false.not`, as it would be understood as record access:
          </block>

          <run>quint "false.not"</run>
        </description>
      </step>
     !*/

    // Boolean "and", which is written as `x && y` in some languages
    pure def myAnd(x, y) = x and y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean "and"</title>
        <description>
Now it is time to learn about Boolean "and".

Evaluate all possible combinations of `false` and `true`:

          <run>quint "false and false"</run>
          <run>quint "false and true"</run>
          <run>quint "true and false"</run>
          <run>quint "true and true"</run>
        </description>
      </step>
     !*/

    // You can also write Boolean "and" like that in the OOP form
    pure def myAnd2(x, y) = x.and(y)
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Dot form for binary operators</title>
        <description>
          <block>
Similar to the operator `not`, you can use the object-oriented form for
Boolean "and". Try it:
          </block>

          <run>quint "false.and(true)"</run>

          <block>
**This is a general principle:** You can replace `bar(x, y)` with `x.bar(y)`,
and vice versa.

This form may be useful with nested formulas like:

  ```
  x.and(y).and(z)
  ```
          </block>
        </description>
      </step>
     !*/

    // We can apply "and" to more than two arguments
    pure def myAnd3(x, y, z) = and(x, y, z)
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>And works for more than two arguments</title>
        <description>
As you see, "and" does not have to apply to two arguments only. You can use it with multiple arguments:

          <run>quint "and(true, false, true)"</run>
          <run>quint "and(true, false, true, false)"</run>
          <run>quint "and(true, false, true, false, true)"</run>
        </description>
      </step>
     !*/

    /// When your expressions get bigger, you can stack them in `and { ... }`
    pure def myAnd4(x, y, z) = and {
        x,
        y,
        z
    }
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>The and {...} form</title>
        <description>
          <block>
Sometimes, we have to write complex expressions over Booleans. Yeah, that happens.

In this case, you can use the convenient form and { ... }, which is just syntax sugar for and(...).

Try it:
          </block>

          <run>quint "and { false == false, true == true }"</run>
        </description>
      </step>
     !*/

    // Boolean "or", which is written as `x || y` in some languages.
    pure def myOr(x, y) = x or y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean "or"</title>
        <description>
If there is "and", there must be "or".
Evaluate all possible combinations of `false` and `true`:

          <run>quint "false or false"</run>
          <run>quint "false or true"</run>
          <run>quint "true or false"</run>
          <run>quint "true or true"</run>
        </description>
      </step>
     !*/

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
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Other forms of "or"</title>
        <description>
Similar to "and", we can use the dot-notation, "or" over multiple arguments,
and the `or { ... }`.
        </description>
      </step>
     !*/

    /// Boolean implication.
    /// This operator is equivalent to `not(x).or(y)` as well as to `if (x) y else true`.
    pure def myImplies(x, y) = x implies y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean implication</title>
        <description>
Perhaps, you remember Boolean implication from your math classes.
In some languages, it is written as `x -> y` or `x => y`.
In Quint is written as `x implies y`, or, alternatively, `x.implies(y)`.

If you don't like it, you don't have to use it:
`x implies y` is equivalent to `not(x) or y`.

Try the implication for all combinations of `false` and `true`:

          <run>quint "false implies false"</run>
          <run>quint "false implies true"</run>
          <run>quint "true implies false"</run>
          <run>quint "true implies true"</run>
        </description>
      </step>
     !*/

    /// Boolean equivalence.
    /// It is equivalent to x == y, but this operator requires the arguments
    /// to have the Boolean type.
    pure def myIff(x, y) = x iff y
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Boolean equivalence</title>
        <description>
Finally, we have the equivalence operator `x iff y`, or, alternatively, `x.iff(y)`.
It is really like `x == y`, but `x iff y` does a bit more:
It requires `x` and `y` to be Booleans.

What is it is good for? If you know what protocol invariants are,
`x iff y` looks nice when writing invariants and temporal formulas.
If you are not familiar with invariants and temporal formulas,
you probably do not need `iff` yet.

Try `iff` for all combinations of `false` and `true`:

          <run>quint "false iff false"</run>
          <run>quint "false iff true"</run>
          <run>quint "true iff false"</run>
          <run>quint "true iff true"</run>
        </description>
      </step>
     !*/
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Suming it up</title>
        <description>
We have covered all the operators over Booleans.
If you want to see all operators in one place,
check [booleans.qnt](https://github.com/informalsystems/quint/tree/main/examples/tutorials/booleans.qnt).

We are experimenting with different kinds of tutorials.
It would be great to learn, whether you liked this tutorial format, or not.
Please vote in the
[discussion](https://github.com/informalsystems/quint/discussions/516).
        </description>
      </step>
     !*/
}
/*!
    </steps>
  </tutorial>
 !*/
