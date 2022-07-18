# Simple REPL for TNT

| Revision | Date       | Author           |
| -------: | :--------: | :--------------- |
| 1        | 15.07.2022 | Igor Konnov      |

**WARNING**: This is very much work in progress. A tiny subset of the language
is supported.

## Installation

You have to compile `tntc` first. See [README](../tntc/README.md).

## Running REPL

At the moment, we are simply using the REPL mode of [ts-node][].

Assuming that you have `tnt` cloned at `$TNT_HOME`, run the following commands:

```sh
$ cd tntc
$ npx ts-node
> import { compileExpr } from './src/runtime/compile'
undefined
> // now you can evaluate TNT expressions as follows
undefined
> compileExpr('if (4 < 3) 4 + 3 else 44').exec()
44n
> compileExpr('val x = (3 + 4) 2 * x').exec()
14n
```

We will probably develop a full-featured REPL in the future. However,
[ts-node][] should work for an MVP.


[ts-node]: https://github.com/TypeStrong/ts-node
