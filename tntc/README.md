# tntc: TNT Transpiler

This directory contains a parser for TNT written in TypeScript. The parser
is designed to work in two modes: CLI mode and LSP mode (VSCode). As we are
publishing all packages privately at the moment, package management with
`npm` requires additional steps.

## How to install

 1. Make sure that you have installed [npm][]. This is usually done with your
 OS-specific package manager.

 1. Compile tntc:

    ```sh
    npm run compile
    ```

 1. To run CLI, install the package locally:

    ```sh
    npm link
    ```

 1. You can run CLI by typing:

    ```sh
    tntc
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

## How to run

Check the [tntc manual](../doc/tntc.md).

## How to develop  

Extend the code in [src](./src), write tests in [test](./test), add test data
to [testFixture](./testFixture). To run the tests and check code coverage, run
the following commands:

 1. Compile and test the parser:

    ```sh
    npm run compile && npm run test
    ```

 1. Check code coverage with tests:

    ```sh
    npm run coverage
    ```

## State of the transpiler

For the moment, it is only a syntax parser, no semantic actions or a type
checker are implemented. Imports are not resolved yet.

[npm]: https://en.wikipedia.org/wiki/Npm_(software)
[yalc]: https://www.npmjs.com/package/yalc
