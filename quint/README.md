# `quint`: The core Quint tool

This directory contains the `quint` CLI providing powerful tools for working
with [the Quint specification language](https://github.com/informalsystems/quint).

## Prerequisites

- Node.js >= 18: Use your package manager or download [nodejs](https://nodejs.org/en/download).

- Java Development Kit >= 17, if you are going to use `quint verify`.  We
  recommend version 17 of the [Eclipse Temurin](https://adoptium.net/) or
  [Zulu](https://www.azul.com/downloads/?version=java-17-lts&package=jdk#download-openjdk)
  builds of OpenJDK.

## Installation

Install the [latest published version from npm](https://www.npmjs.com/package/@informalsystems/quint):

``` sh
npm i @informalsystems/quint -g
```

## How to run

Check the [quint manual](https://github.com/informalsystems/quint/blob/main/doc/quint.md).

## How to develop

### Development environment

 1. Make sure that you have installed [npm][]. This is usually done with your
 OS-specific package manager.

 1. Clone the repository and cd into the `quint` tool's subdirectory
 
    ```sh
    git clone git@github.com:informalsystems/quint.git
    cd quint/quint
    ```

 1. Install dependencies:

    ```sh
    npm install
    ```

 1. Compile `quint`:

    ```sh
    npm run compile
    ```

 1. To run CLI, install the package locally:

    ```sh
    npm link
    ```

 1. You can run CLI by typing:

    ```sh
    quint
    ```

Additionally, if you want to compile the vscode plugin:

 1. Install [yalc][] for local package management:

    ```sh
    npm install yalc -g
    ```

 1. Publish the package locally with yalc:

    ```sh
    yalc publish
    ```


### Code

Extend the code in [src](./src).

### Unit tests

Write unit tests in [test](./test), add test data to
[testFixture](./testFixture). To run the tests and check code coverage, run the
following commands:

 1. Compile and test the parser:

    ```sh
    npm run compile && npm run test
    ```

 1. Check code coverage with tests:

    ```sh
    npm run coverage
    ```

#### Updating the source map test fixtures

``` sh
npm run update-fixtures
```

### Integration tests

All development dependencies should be tracked in the `package.json` and
`package-lock.json`. These will be installed when you run `npm install` on
this project (unless you have [explicitly told
npm](https://docs.npmjs.com/cli/v9/commands/npm-install#description) to use
production settings).

To [add a new dependency for integration tests or other development
purposes](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file)
run

``` sh
npm install <dep> --save-dev
```

 1. Update tests in [cli-tests.md](./cli-tests.md).

 1. Run integration tests:

    ```sh
    npm run compile && npm link && npm run integration
    ```

[npm]: https://en.wikipedia.org/wiki/Npm_(software)
[yalc]: https://www.npmjs.com/package/yalc
[txm]: https://www.npmjs.com/package/txm

#### Integration with Apalache

We maintain a set of integration tests against the latest release of Apalache.
These tests are meant to catch any breaking changes requiring updates to
Apalache's support for quint.

Generally, you should not have to run these tests locally, leaving the
validation to our CI. But should you need to run these tests locally, you can do
so with

```sh
npm run apalache-integration
```

It is required that you have a Java version meeting [Apalache's minimum
requirements](https://apalache-mc.org/docs/apalache/installation/jvm.html).

### Parser

We use the `antlr4ts` parser generator to compile the BNF like notation specified
in [./src/generated/Quint.g4](./src/generated/Quint.g4) into a typescript lexer and
parser. To regenerate the parser and lexer, run

``` sh
npm run antlr
```
