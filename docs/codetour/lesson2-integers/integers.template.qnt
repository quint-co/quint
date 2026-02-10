/*
 If you do not know how to start this lesson, see:
 https://github.com/informalsystems/quint/tree/main/tutorials
 */
/*!
  <tutorial>
    <title>Lesson 2 - Integers</title>
    <steps>
 !*/
module integersLesson {
    /*!
      <step>
        <title>Introduction</title>
        <description>
This lesson teaches you the basics of operations over integers.
If you have programming experience, you know most of these operators. 
So it should not take you long to finish this lesson.
Do not skip this lesson, as some of the operators may still surprise you.
        </description>
        <file>$file</file>
        <line>$line</line>
      </step>
    !*/

    // 0 is an integer literal
    pure val int0 = 0

    // 2 is an integer literal
    pure val int1 = 2

    // -3 is an integer literal
    pure val negative1 = -3
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer literals</title>
        <description>
Integer literals are written using the standard syntax:
0, 1, -1, 2, -2, ..., 314159265358979323846264338327950288419716939937510.

It is important to understand that Quint integers are big integers.
There is neither a minimum integer, nor there is a maximum integer.

**Note:** When using the Rust simulator, integer literals must fit within
the 64-bit signed integer range (-2^63 to 2^63-1). If you use integers
outside of this range, you will get an error.

It's quite easy to express the standard 32-bit, 64-bit, 128-bit, and 512-bit
integers with Quint integers. We will cover this in a follow up tutorial.

We omit several integer operators that produce sets. These operators are covered in
the tutorial on sets.
        </description>
      </step>
     !*/

    // i^j is the integer exponentiation, that is,
    // `i` multiplied by itself `j - 1` times
    pure def myPow(i, j) = i^j 
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer exponentiation</title>
        <description>
          <block>
We start with the exponentiation `i^j` over integers,
which is also written as `pow(i, j)` in many languages.
The result of `i^j` is simply `i` multiplied by itself `j - 1` times.
This is the first operator, as it lets us to write nice examples
in the following steps.

To get a better intuition at how `i^j` works, run the following examples:

          </block>
          <run>quint "2^32"</run>
          <expect>4294967296</expect>
          <run>quint "2^64"</run>
          <expect>18446744073709551616</expect>
          <run>quint "2^256"</run>
          <expect>115792089237316195423570985008687907853269984665640564039457584007913129639936</expect>
          <run>quint "2^512"</run>
          <expect>13407807929942597099574024998205846127479365820592393377723561443721764030073546976801874298166903427690031858186486050853753882811946569946433649006084096</expect>

          <block>
Exponentiation is not defined on all of its arguments.
Try the following examples to get the intuition.
          </block>
          <run>quint "(-2)^3"</run>
          <expect>-8</expect>
          <run>quint "(-2)^4"</run>
          <expect>16</expect>
          <run>quint "2^(-4)"</run>
          <expect>error</expect>
          <run>quint "0^3"</run>
          <expect>0</expect>
          <run>quint "0^0"</run>
          <expect>error</expect>
          <run>quint "0^(-2)"</run>
          <expect>error</expect>
        </description>
      </step>
     !*/

    // i + j is the integer addition
    pure def myAdd(i, j) = i + j 
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer addition</title>
        <description>
          <block>
We can add two integers by writing `i + j`. Importantly, integers cannot
overflow, as they are big integers.

Try this simple example:

          </block>
          <run>quint "2022 + 2023"</run>
          <expect>4045</expect>
          <block>

It is important to remember that integer addition satisfies the laws
of commutativity and associativity in Quint:

          </block>
          <run>quint "11 + 17 == 17 + 11"</run>
          <expect>true</expect>
          <run>quint "(11 + 17) + 19 == 11 + (17 + 19)"</run>
          <expect>true</expect>
        </description>
      </step>
     !*/

    // i - j is the integer subtraction
    pure def mySub(i, j) = i - j 
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer subtraction</title>
        <description>
          <block>
We can add two integers by writing `i - j`.

 - Try this and see the result of the evaluation:

          </block>
          <run>quint "2022 - 2023"</run>
          <expect>-1</expect>
          <block>

 - Addition and subtraction have the same priority.
   Hence they are applied from left to right.

          </block>
          <run>quint "11 + 13 - 17"</run>
          <expect>7</expect>
          <block>
 **Exercise:** Is subtraction commutative?
          </block>
        </description>
      </step>
     !*/

    // i * j is the integer multiplication
    pure def myMul(i, j) = i * j 
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer multiplication</title>
        <description>
          <block>
We can multiply two integers by writing `i * j`.
Remember that multiplication cannot produce any side effects like overflows:

          </block>
          <run>quint "2^32 * 2^32 == 2^64"</run>
          <expect>true</expect>
          <block>

It is important to remember that integer multiplication satisfies the laws
of commutativity and associativity in Quint:

          </block>
          <run>quint "11 * 17 == 17 * 11"</run>
          <expect>true</expect>
          <run>quint "(11 * 17) * 19 == 11 * (17 * 19)"</run>
          <expect>true</expect>
        </description>
      </step>
     !*/

    // i / j is the integer division
    pure def myDiv(i, j) = i / j

    // i % j is the integer remainder
    pure def myMod(i, j) = i % j

    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer division and remainder</title>
        <description>
          <block>
The operators `i / j` and `i % j` compute the integer part and the remainder
when dividing `i` by `j`, respectively. These operators have the following
property for all integer values of `i` and all integer values of `j != 0`:
`i == (i / j) * j + i % j`.

Try the following examples to check your intuition:

          </block>
          <run>quint "99 / 2 == 49"</run>
          <expect>true</expect>
          <run>quint "99 % 2 == 1"</run>
          <expect>true</expect>
          <run>quint "98 % 2 == 0"</run>
          <expect>true</expect>
          <run>quint "((2^64 - 1) % 2^64 + 1) % 2^64"</run>
          <expect>0</expect>
          <run>quint "(2^64 - 123) % 2^63"</run>
          <expect>0</expect>

          <block>
 **Exercise:** Is division commutative?
          </block>
        </description>
      </step>
     !*/

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

    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer comparison</title>
        <description>
          <block>
These are the standard comparison operators that you know, for sure:

 - Less than: `i &lt; j`
 - Less than or equal: `i &lt;= j`
 - Greater than: `i &gt; j`
 - Greater than or equal: `i &gt;= j`
 - Equals to: `i == j`
 - Not equal to: `i != j`

Check your intuition by running the following examples:
          </block>
          <run>quint "10 &lt; 11"</run>
          <expect>true</expect>
          <run>quint "10 &lt; 10"</run>
          <expect>false</expect>
          <run>quint "10 &lt;= 11"</run>
          <expect>true</expect>
          <run>quint "10 &lt;= 10"</run>
          <expect>true</expect>
          <run>quint "10 &lt;= 9"</run>
          <expect>true</expect>
          <run>quint "11 &gt; 10"</run>
          <expect>true</expect>
          <run>quint "10 &gt; 10"</run>
          <expect>false</expect>
          <run>quint "11 &gt;= 10"</run>
          <expect>true</expect>
          <run>quint "10 &gt;= 10"</run>
          <expect>true</expect>
          <run>quint "10 &gt;= 9"</run>
          <expect>true</expect>
          <run>quint "10 == 10"</run>
          <expect>true</expect>
          <run>quint "10 == 11"</run>
          <expect>false</expect>
          <run>quint "10 != 10"</run>
          <expect>false</expect>
          <run>quint "10 != 11"</run>
          <expect>true</expect>
        </description>
      </step>
     !*/

    // -i is the integer negation
    pure def myUnaryMinus(i) = -i
    /*!
      <step>
        <file>$file</file>
        <line>$line</line>
        <title>Integer negation</title>
        <description>
          <block>
We almost forgot about the integer negation!
Not surprisingly, `-i` negates an integer `i`.
Recall that Quint integers are big integers.
Hence, no overflow is possible.

Try a few examples:

          </block>
          <run>quint "-(3 + 2)"</run>
          <expect>-5</expect>
          <run>quint "-(-2^63) == 2^63"</run>
          <expect>true</expect>
        </description>
      </step>
     !*/
}

/*!
    </steps>
  </tutorial>
 !*/
