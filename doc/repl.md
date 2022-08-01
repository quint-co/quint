# Simple REPL for TNT

| Revision | Date       | Author           |
| -------: | :--------: | :--------------- |
| 1        | 18.07.2022 | Igor Konnov      |

**WARNING**: This is very much work in progress. A tiny subset of the language
is supported.

[REPL][] is a read-eval-print loop. A REPL is usually a good way to start learning a language.

## Installation

You have to compile `tntc` first. See [README](../tntc/README.md).

## Running REPL

At the moment, we are simply using the REPL mode of [ts-node][].

Assuming that you have `tnt` cloned at `$TNT_HOME`, run the following commands:

```sh
$ cd tntc
$ tntc repl
TNT REPL v0.0.1
Type ".help" for more information
>>> 5 * 3 > 11
true
>>> val x = 3 + 4
... x > 10
... 
false
>>> 
```


[ts-node]: https://github.com/TypeStrong/ts-node
[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop