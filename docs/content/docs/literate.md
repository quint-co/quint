# Literate Specifications

We have developed a workflow for writing literate, executable formal specs using
the tool [lmt](https://github.com/driusan/lmt). This allows us to embed the
formal specification of a system within informal, natural language
specifications, and to extract the formal parts into executable code. This code
can then be used for testing or verifying the spec, or fed into a toolchain for
model based testing.

## Prerequisites

- An [installation of go](https://go.dev/doc/install)
- An [installation of quint](/docs/getting-started)
- An [installation of make](https://en.wikipedia.org/wiki/Make_(software))
  (probably already on your system)
- An installation of lmt via `go install github.com/driusan/lmt@latest` (or
  following the [lmt instructions to install from source](https://github.com/driusan/lmt#installing-lmt))

If you use nix, you can use [this nix expression](https://github.com/informalsystems/quint/tree/main/docs/default.nix).

## Writing a literate spec

A literate quint spec is a markdown file that includes `quint` code blocks that
declare a file into which the fragment of the code will be extracted.

Here is an example of a literate spec describing a trivial counter system:

````markdown
<!-- in myspec.md -->
# Counter

A counter has a single state variable `n`:

```quint myspec.qnt +=
module Counter {
  var n : int
```

The initial value of `n` is `0`:

```quint myspec.qnt +=
  action init = n' = 0
```

At each step, the counter increments the value of `n` by `1`:

```quint myspec.qnt +=
  action step = n' = n + 1
}
```

If you run a counter for 10 steps, the value of `n` at each step will be equal
to the `i`th step:

```quint myspecTests.qnt +=
module TestCounter {
  import Counter.* from "myspec"

  run countTest = {
    init.then(10.reps(i => all { step, assert(n == i) }))
  }
}
```
````

Each code block is labeled with three things:

- the language of the code block (`quint`),
- the file into which the code block will be extracted (e.g. `myspec.qnt`),
- the operator `+=`, which tells `lmt` to append the content of the code block
  to the named file.

See the `lmt` documentation for other features supported by that tool.

## Extracting the executable spec and testing it

The following makefile extracts two `.qnt` files from the markdown using
`lmt`, and then calls `quint` to run the tests:

```Makefile
.PHONY: test clean

test: myspecTests.qnt myspec.qnt
	quint test --main TestCounter $<

myspec.qnt myspecTests.qnt &: myspec.md
	lmt $<

clean:
	rm myspec.qnt myspecTests.qnt
```
