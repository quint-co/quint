# Frequently Asked Questions

Here you can find answers to the questions that are often asked by people who
would like to start with Quint.

### What are spells?

Spells are simply Quint modules that contain often-used definitions. There is
nothing special about these definitions. They are probably a bit more
thought-out than a definition someone would write on the spot. Check the page
on [Spells][].

### Difference between `pure def` and `def`

Definitions that are tagged as `pure def` are not allowed to read state
variables (that is, the names declared with `var`). Definitions that are tagged
with `def` are allowed to read state variables, though they do not have to.

Pure definitions have the following important property: A **pure definition
always returns the same result for the same parameter values**.

Consider the following operator definition:

```bluespec
pure def min(x, y) = if (x < y) x else y
```

Whenever we call `min(2, 3)`, we get `2` as a result, no matter what the values of state variables are.

Impure definitions have the following important property:
**An impure definition may produce different results for the same parameter
values**. An impure definition **may read** the values of state variables, which
may effect in different results.

Consider the following definitions:

```bluespec
var limit: int

def minWithLimit(x, y) = min(min(x, y), limit)
```

In the above example, `minWithLimit(10, 20)` produces the value `10`, when
`limit == 100`, whereas `minWithLimit(10, 20)` produces the value `5`, when
`limit == 5`.

### Difference between `val` and `def`

The definitions that have at least one parameter should be tagged with `def`,
whereas the definitions that have no parameters should be tagged with `val`. We
could say that `val`'s are nullary `def`'s.

As a result, a `pure val` is never changing its value in an execution. For example:

```bluespec
pure val avogadro = 602214076^(23 - 8)
```

Note that an impure `val` may still depend on the value of a state variable.
For example:

```bluespec
var time: int
var velocity: int

val distance = velocity * time
```

In the above example, `distance` does not need any parameters, as it only
depends on the state variables. However, the value of `distance` is still
changing with the values of `time` and `velocity`.

### Difference between `pure val` and `const`

A value that is defined via `pure val` is constant in the sense that it never
changes in an execution. A `const` definition also declares a constant value.
However, the value of `const` is not fixed at the time of specification writing,
but it has to be fixed by instantiating the module.  

Here is an example that illustrates the difference between `pure val` and `const`:

```bluespec
module fixed {
  // this module is written for N=4, e.g., for N processes
  pure val N = 4

  pure val procs = 1.to(N)
  // etc.
}

module parameterized {
  // this module is written for a parameter N
  const N: int

  pure val procs = 1.to(N)
  // etc.
}

module instance4 {
  import parameterized(N = 4) as I

  pure val procs = 1.to(I::N)
}
```

[Spells]: https://github.com/informalsystems/quint/tree/main/examples/spells