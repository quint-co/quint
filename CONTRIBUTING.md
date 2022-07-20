# Contributing

**This file is under construction...**

This project is run by the team of [Apalache]() project.  Hence, we apply the
same principles in TNT, see [Contributing to Apalache][].

## Coordinating work

Development on TNT is distributed. As with any distributed system, establishing
effective synchronization and consensus on key properties requires careful
attention. 

## Project structure

Currently, the project consists of two npm packages (published locally):

 - [tntc](./tntc) is the transpiler package, see the [tntc manual][].
 - [vscode/tnt](./vscode/tnt) is the VSCode plugin for TNT, depends on `tntc`.
   This plugin has two subpackages:

   - [vscode/tnt/server](./vscode/tnt/server) is the server-side package,
     implementing [Language server protocol][] used by VSCode and other
     code editors.

   - [vscode/tnt/client](./vscode/tnt/client) is the client-side package,
     implementing the language extension for VSCode.

## Dependencies

For setting up the local build, you would have to install TypeScript and npm.
This is usually done via your local package manager.

### Formatting

We use [eslint][] to enforce the good coding practices of JavaScript and
TypeScript. This is especially important in the context of these languages, as
JavaScript has plenty of bad parts.

## Testing

### Build and run tntc and the VSCode plugin from source

These steps are currently a bit complicated. Check the dedicated pages:
 
 - [Installing tntc][],
 - [Installing the VSCode plugin][].

### Tests

#### Unit tests for tntc

In general, we are using the [Mocha][] test framework to write and run unit
tests. We are using the [Chai][] to write assertions, without going into BDD
testing too much.

The unit tests can be run as follows:

```sh
cd tntc
npm run compile && npm run test
```

More details can be found in [tntc unit tests][].

#### Integration tests for tntc

We are using the [txm][] framework to write integration tests.

The integration tests can be run as follows:

```sh
cd tntc
npm run compile && npm link && npm run integration
```

More details can be found in [tntc integration tests][].

#### End-to-end tests for the VSCode plugin

We do not have unit tests for the VSCode plugin. Instead we have end-to-end
tests that run via VSCode:

```sh
cd vscode/tnt
npm run test
```

## Coding practices

This section is especially important for this project, as it is very easy to
write very bad code in JavaScript and TypeScript. Hence, we pay special
attention to the coding practices. We keep refining them, as we are learning
the language in the process.

In general, we are trying to leverage good practices of functional programming
(FP) in JavaScript/TypeScript. However, it is not always possible to write nice
FP code in this language, so we keep the balance between readability and
FPness.  When the idiomatic JavaScript code is shorter and clearer than
equivalent FP code, we write the idiomatic JavaScript code.

### Using Either

TODO

### Using Maybe

When there is too much undefinedness in the code, we are using the option type,
which is implemented in the [sweet-monads/maybe][] package.

**Caveat:** In contrast to the FP languages, equality in JS/TS is not structural.
Hence, the following code always returns `false`:

```js
> import { none, just } from '@sweet-monads/maybe'
> just(true) === just(true)
false
> none() === none()
false
```

For this reason, we are using `isEqual` provided by the [lodash.isequal][] package:

```js
> import { none, just } from '@sweet-monads/maybe'
> import isEqual from 'lodash.isequal'
> isEqual(just(true), just(true))
true
> isEqual(none(), none())
true
```



[Apalache]: https://github.com/informalsystems/apalache
[Contributing to Apalache]: https://github.com/informalsystems/apalache/blob/unstable/CONTRIBUTING.md
[eslint]: https://eslint.org/
[tntc manual]: ./doc/tntc.md
[Installing tntc]: https://github.com/informalsystems/tnt/blob/main/tntc/README.md#how-to-install
[Installing the VSCode plugin]: https://github.com/informalsystems/tnt/blob/main/vscode/tnt/README.md#temp-how-to-run-it-locally
[Language server protocol]: https://microsoft.github.io/language-server-protocol/
[tntc unit tests]: https://github.com/informalsystems/tnt/blob/main/tntc/README.md#unit-tests
[tntc integration tests]: https://github.com/informalsystems/tnt/blob/main/tntc/README.md#integration-tests
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[txm]: https://www.npmjs.com/package/txm
[sweet-monads/maybe]: https://www.npmjs.com/package/@sweet-monads/maybe
[lodash.isequal]: https://www.npmjs.com/package/lodash.isequal
