# Contributing

Welcome to the Quint  repository! We are excited that you  want to contribute to
Quint, whether it is by reporting issues, suggesting features, or writing code.

## Table of Contents

- [Note on AI\-assisted contributions](#note-on-ai-assisted-contributions)
- [Source code structure](#source-code-structure)
- [Developer docs](#developer-docs)
- [Dependencies](#dependencies)
  - [Any projects, with nix](#any-projects-with-nix)
    - [Updating nix dependencies](#updating-nix-dependencies)
  - [Typescript projects, without nix](#typescript-projects-without-nix)
  - [Rust project, without nix](#rust-project-without-nix)
  - [Website, without nix](#website-without-nix)
  - [Documentation, without nix](#documentation-without-nix)
- [Formatting](#formatting)
  - [Typescript](#typescript)
  - [Rust](#rust)
- [Developing](#developing)
  - [Developing the Quint CLI](#developing-the-quint-cli)
  - [Developing the Quint Language Server](#developing-the-quint-language-server)
  - [Developing the Evaluator](#developing-the-evaluator)
  - [Developing the VSCode extension](#developing-the-vscode-extension)
    - [Using the VSCode extension with an unpublished version of quint](#using-the-vscode-extension-with-an-unpublished-version-of-quint)
- [Testing](#testing)
  - [Tests](#tests)
    - [Unit tests for quint](#unit-tests-for-quint)
    - [Updating the source map test fixtures](#updating-the-source-map-test-fixtures)
    - [Integration tests for quint](#integration-tests-for-quint)
  - [Adding dependencies](#adding-dependencies)
    - [Typescript development dependencies](#typescript-development-dependencies)
    - [Rust development dependencies](#rust-development-dependencies)
    - [Unit tests for the Language Server](#unit-tests-for-the-language-server)
- [Coding practices](#coding-practices)
  - [Ensure exhaustive matches](#ensure-exhaustive-matches)
  - [Using Maybe](#using-maybe)
  - [Using Either](#using-either)
- [Release](#release)
  - [Quint CLI](#quint-cli)
  - [Evaluator](#evaluator)
  - [VSCode Extension](#vscode-extension)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)

## Note on AI-assisted contributions

We welcome AI-assisted contributions, but such PRs must (a) be original, (b)
pass all tests and (c) state that AI assistance was used.

Our review process is made by humans, so make sure you had a human take a look
at your PR before submitting it. You are expected to have tried your change
locally and check that it works as you expect it to.

AI-assisted PRs which do not meet all of the
above requirements may be closed at any time by maintainers.

## Source code structure

This repository hosts all Quint pieces:

- [quint](./quint) is the package for the `quint` CLI tool, including the
  compiler functionality, random simulator and integration with model checking
- [evaluator](./evaluator) an alternative evaluator for Quint, written in Rust
  (not yet feature-complete)
- [vscode](./vscode) the Quint VSCode Extension
- [vscode/quint-vscode/server](./vscode/quint-vscode/server) Quint's Language
  Server (LSP)
- [docs](./docs) source code for Quint's website
- [tlc](./tlc) scripts for running the TLC model checker with Quint specs, while
  we don't have proper integration

## Developer docs

- [ADR001: Transpiler
  architecture](./docs/content/docs/development-docs/architecture-decision-records/adr001-transpiler-architecture.md)
- [ADR002: Error
  codes](./docs/content/docs/development-docs/architecture-decision-records/adr002-errors.md)
- [ADR003: Interface to visit Internal Representation
   components](./docs/content/docs/development-docs/architecture-decision-records/adr003-visiting-ir-components.md)
- [ADR004: An Effect System for
  Quint](./docs/content/docs/development-docs/architecture-decision-records/adr004-effect-system.md)
- [ADR005: A Type System for
  Quint](./docs/content/docs/development-docs/architecture-decision-records/adr005-type-system.md)
- [ADR006: Design of modules and lookup
  tables](./docs/content/docs/development-docs/architecture-decision-records/adr006-modules.lit.md)
- [ADR007:
  Flattening](./docs/content/docs/development-docs/architecture-decision-records/adr007-flattening.md)
- [ADR008: Obtaining and Launching Apalache from
  Quint](./docs/content/docs/development-docs/architecture-decision-records/adr008-managing-apalache.md)

## Dependencies

### Any projects, with nix

We provide a nix shell in case you want to use nix to manage your development
environment and dependencies.

Make sure you have `nix` installed, then build and enter the clean development shell with:

```sh
nix develop
```

If you want to use [direnv][] to set up your environment with nix (instead of using a
shell), you will need to add `use flake;` to your `.envrc`, and then
running `direnv allow`:

```sh
echo "use flake;" >> .envrc && direnv allow
```

You can also add a `direnv` extension/package to your IDE of choice to have
those dependencies set up for the IDE to use.

#### Updating nix dependencies

To update one of the flake inputs you can run: `nix flake lock --update-input <input-name>`

To update all of the inputs you can run: `nix flake update`, it is recommended
to update dependencies one by one though.

### Typescript projects, without nix

If you want to contribute to the Quint CLI or the language server (via the
VSCode extension or not), you'll need to install TypeScript and npm. This is
usually done via your local package manager.

There are also some specific dependencies that you'll only need if you need to so some specific things:

- To run integration tests, you'll need `txm`
  - Install it with `npm i txm -g`
- If you change the grammar files, you'll need to re-generate the lexer/parser,
  which requires the JRE (Java Runtime Environment)
  - The command for re-generating the files is `npm run antlr`. `antrl4ts`
    requires the JRE.
  - Install it via your package manager
- If you want to build the language server with local updates to the quint tool
  (i.e. to test new functionality), you'll need `yalc`
  - You should only need this if you made a change on the `quint` package that
    you want to see in effect in `quint-language-server`.
  - `yalc` acts as a local package manager, so you don't need to publish the
    `quint` change to NPM in order to test it.
  - Install it with `npm i yalc -g`
  - `make local` will take care of using `yalc` for you.
- In order to publish the VSCode extension, you'll need `vsce`
  - Install it with `npm i vsce -g`

### Rust project, without nix

If you want to contribute to the Quint evaluator in Rust, you'll need `cargo`
and `rustc`. You'll probably want `rust-analyzer` as well, and you'll need
`cargo-insta` to run our snapshot tests.

[Check out the official website](https://www.rust-lang.org/tools/install) for more information on how to install Rust.

### Website, without nix

Quint's website is built with the [Nextra][] framework, which uses Next.js.
You'll need npm only.

### Documentation, without nix

Some of our documentation is written in a literate programming style, and we
tangle the code out of that and run integration tests on top of it. If you
change any of these files, you'll have to tangle the code again, and for that
you'll need [lmt][], which can be installed via Go:

```sh
go install github.com/driusan/lmt@latest
```

## Formatting

### Typescript

We use [eslint][] to enforce the good coding practices of JavaScript and
TypeScript. This is especially important in the context of these languages, as
JavaScript has plenty of bad parts. To format all the files in a package, run:

```sh
npm run format
```

### Rust

We use `clippy` for linting and `rustfmt` for formatting:

```sh
cargo clippy --fix
# or cargo clippy --fix --allow-dirty

cargo fmt --all
```

## Developing

### Developing the Quint CLI

Install the project dependencies with:

```sh
cd quint
npm install
```

Compile with

```sh
npm run compile && npm link
```

You'll only need to run `npm link` once, as it will create a global symlink to
the `quint` CLI tool, so you can use it from anywhere in your system.

You'll need to re-run `npm run compile` whenever you change the source code of
the Quint CLI, so that the changes are reflected in the global symlink.

### Developing the Quint Language Server

The Quint Language Server is a separate package from the Quint CLI, so you'll
need to install its dependencies separately:

```sh
cd vscode/quint-vscode/server
npm install
```

You can then compile the Quint Language Server with:

```sh
npm run compile && npm link
```

You don't need `npm link` for using it inside the VSCode extension, but do for
using it in other code editors.

### Developing the Evaluator

The Quint evaluator is a rust project, and Quint uses its binary when the flag
`--backend=rust` is given. Install the dependencies and compile with:

```sh
cd evaluator
cargo build
```

In order for the Quint CLI to pick up the updated evaluator, you need to
copy/link the binary to the proper folder:

```sh
cp target/debug/quint_evaluator /home/gabriela/.quint/rust-evaluator-vX.Y.Z/quint_evaluator
```

where `X.Y.Z` is the version of the evaluator you are using
(`QUINT_EVALUATOR_VERSION` in the Quint CLI codebase).

### Developing the VSCode extension

There are many ways to use the VSCode extension from source. You also may want
to use it with an unpublished version of `quint`. This section is a suggestion
on how to do it, and its also how we do it.

To build the vscode extension, run the `vscode` make target from [the root of
this repo](../../):

```sh
make vscode
```

To install the extension for use, link the combined extension into your vscode
extensions. From the root of this repo, you can run:

```sh
ln -s $PWD/vscode/quint-vscode/ $HOME/.vscode/extensions/informal.quint-vscode-X.Y.Z
```

#### Using the VSCode extension with an unpublished version of `quint`

We use `yalc` to manage unpublished packages. To install it, run

``` sh
npm i yalc -g
```

Then use the `local` make target to replace the published version of `quint`
with the local one and build the extension:

``` sh
make local
```

Make sure you have the folder linked to your vscode extensions as described
above.

## Testing

### Tests

#### Unit tests for quint

In general, we are using the [Mocha][] test framework to write and run unit
tests. We are using [Chai][] to write assertions, without going into BDD testing
too much.

Write unit tests in [quint/test](./quint/test), add test data to
[quint/testFixture](./quint/testFixture). To run the tests and check code
coverage, run the following commands (in the [quint](./quint) folder):

 1. Run unit tests:

    ```sh
    npm run test
    ```

 1. Check code coverage with tests:

    ```sh
    npm run coverage
    ```

#### Updating the source map test fixtures

When adding a new test fixture or updating an existing one, you might need to
generate the `.json` and `.map.json` files used in test expectations. For that,
run:

``` sh
npm run update-fixtures
```

`.json` files have the result of parsing that file, which can be an error or the
Quint IR (Internal Representation) for the modules in the file. `.map.json`
files contain the source map of the given modules. Both are used in a snapshot
testing fashion, to prevent regressions.

Therefore, you might also need to update the fixtures if the parsing behavior
changed. In this case, make sure that the new behavior is better than the
previous one. The updated fixtures will be part of the PR you'll open, so we
also get a chance to identify unwanted changes in behavior.

#### Integration tests for quint

We are using the [txm][] framework to write integration tests. The tests are
defined in Markdown files with special comments to identify commands and
expectations of a given test. All tests run in the shell environment, and we use
well-known shell utilities to manipulate the output for matching test
expectations, such as `sed` to remove machine-specific data and `head`/`tail` to
check only parts of the output.

The files containing tests for `txm` are:

- [cli-tests.md](./cli-tests.md) for tests where we only match the exit code.
- [io-cli-tests.md](./io-cli-tests.md) for tests where we assert over STDOUT and
  STDERR output.
  - These are kept in a separate file because we don't run them on Windows (on
    our CI), as we had too many encoding issues there.
- [apalache-tests.md](./apalache-tests.md) for tests that run the Apalache model
  checker on Quint specs.
- [apalache-dist-tests.md](./apalache-dist-tests.md) for special tests on
  downloading and starting Apalache from Quint.
  - These are kept in a separate file because they run in a CI environment where
    Apalache was not installed.

Run integration tests:

  ```sh
  npm run compile && npm link && npm run integration
  ```
  
PS: this will not run the Apalache-related tests, as they usually won't break as
consequences of changes in the Quint codebase. They are run in the CI, and you
can run them locally by running `npm run apalache-integration` and `npm run
apalache-dist` if you want.

### Adding dependencies

#### Typescript development dependencies

All development dependencies should be tracked in the `package.json` and
`package-lock.json`. These will be installed when you run `npm install` on this
project (unless you have [explicitly told
npm](https://docs.npmjs.com/cli/v9/commands/npm-install#description) to use
production settings).

To [add a new dependency for integration tests or other development
purposes](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file)
run:

``` sh
npm install <dep> --save-dev
```

#### Rust development dependencies

All development dependencies should be tracked in the `Cargo.toml` and
`Cargo.lock`. These will be installed when you run `cargo build` on this
project.

To [add a new dependency for integration tests or other development
purposes](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html)
run:

``` sh
cargo add <dep> --dev
```

#### Unit tests for the Language Server

We have very basic unit tests for the Language Server, which can be run with:

```sh
cd vscode/quint-vscode/server
npm test
```

## Coding practices

This section is especially important for this project, as it is very easy to
write very bad code in JavaScript and TypeScript. Hence, we pay special
attention to the coding practices.

In general, we are trying to leverage good practices of functional programming
(FP) in JavaScript/TypeScript. However, it is not always possible to write nice
FP code in this language, so we keep the balance between readability and FPness.
When the idiomatic JavaScript code is shorter and clearer than equivalent FP
code, we write the idiomatic JavaScript code.

### Ensure exhaustive matches

The type system should help us keep the code base maintainable. But when
`switch` statements and conditionals are used purely for side effects, we can
lose the advantage of exhaustiveness checking. Here's an example:

Assume we have a type `T`

```typescript
type T = 'a' | 'b' | 'c'
```

We should structure our program such that

- we can be sure every alternative is considered (as needed), and
- whenever a new alternative is added to this type, the type system will warn us
  about all the places we need to account for the new kind of data.

If we use `T` with a `switch` or `if`/`then` statement that *returns values*,
this indispensable help is ensured. E.g., if we try to write the following:

```typescript
function f(x:T): Number {
  switch x {
    case 'a':
      return 0
    case 'b':
      return 1
  }
}
```

we will end up with a type error, because the annotation on `f` promises it will
return a `Number`, but it might in fact return `undefined` since we are not
handling `c`.

However, if we are only using side effects in the switch, we lose this check!

```typescript
function f(x:T): Number {
  let n = -1
  switch x {
    case 'a':
      n = 0
      break
    case 'b':
      n = 1
      break
  }
  return ret
}
```

Now the typechecker sees that we will be returning a number no matter what
happens, even if none of our cases are hit, and we will not get a warning on the
omitted check for `c`, or for any other data added to this type in the future.

Now, sometimes this kind of catch-all default is what we want, but we should be
very careful in relying on it, because it creates blind spots. As a rule, we
should only allow cath-all defaults when the computation we are performing
**must** be invariant under any expansion of the domain we are computing from.

For all other cases, we can avoid these typechecking blind spots by following
two guidelines:

1. Prefer passing data by returning values whenever, and avoid needless mutable
   assignments.
2. When switches need to be used for side effects, provide a default that calls
   `unreachable` on the expression to ensure all cases are handled:

   ```typescript
   import { unreachable } from './util'

   function f(x:T): Number {
     let n = -1
     switch x {
       case 'a':
         n = 0
         break
       case 'b':
         n = 1
         break
       default:
         unreachable(x)
     }
     return ret
   }
   ```

   Now the type checker will warn us that we aren't accounting for `c` (or any
   additional alternatives added down the line).

### Using Maybe

When there is too much undefinedness in the code, we are using the option type,
which is implemented in the [sweet-monads/maybe][] package.

**Caveat:** In contrast to the FP languages, equality in JS/TS is not
structural. Hence, the following code always returns `false`:

```js
> import { none, just } from '@sweet-monads/maybe'
> just(true) === just(true)
false
> none() === none()
false
```

For this reason, we are using `isEqual` provided by the [lodash.isequal][]
package:

```js
> import { none, just } from '@sweet-monads/maybe'
> import isEqual from 'lodash.isequal'
> isEqual(just(true), just(true))
true
> isEqual(none(), none())
true
```

### Using Either

Most of the time, we want to use `Either` rather than `Maybe` to be able to
represent error data when something goes wrong.

The guideline is:

- If we are confident that error can never happen, we `throw` it.
  - We try to always include a comment explaining why we are confident that the
    error can never happen.
- If the error can happen, specially if it depends on user input, we should use
  `Either` to represent the result of a computation that can either succeed or
  fail.
  - This way, we can properly report to the user what went wrong, and we can
    also handle the error in a way that makes sense for the user (i.e. pointing
    where in the file is the Quin expression that caused the issue).

We use the [sweet-monads/either][] package for this, which provides an `Either`
type that can be used to represent a value that can either be a success or a
failure.

```typescript
import { left, right } from '@sweet-monads/either'

if (all_good(expr)) {
  return right(value)
} else {
  return left({ code: 'QNT500', message: `${expr} is not good!`, reference: expr.id })
}
```

[eslint]: https://eslint.org/
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[txm]: https://www.npmjs.com/package/txm
[sweet-monads/maybe]: https://www.npmjs.com/package/@sweet-monads/maybe
[sweet-monads/either]: https://www.npmjs.com/package/@sweet-monads/either
[lodash.isequal]: https://www.npmjs.com/package/lodash.isequal
[direnv]: https://direnv.net
[Nextra]: https://nextra.site
[lmt]: https://github.com/driusan/lmt

## Release

We manage releases for three components out of this repository: the Quint CLI,
the Rust evaluator and the VSCode extension + the language server.

### Quint CLI

- Prepare a release by running
  [./quint/scripts/prepare-release.sh](./quint/scripts/prepare-release.sh) with
  an argument to indicate the version increment: `patch`, `minor`, or `major`.
- Get the release PR reviewed and merged
- Checkout the release commit
- Run the release script
  [./quint/scripts/release.sh](./quint/scripts/release.sh).

  This will trigger the release and publication of the package to npm and
  GitHub.
  
### Evaluator

The evaluator is the latest addition to the Quint repository, and it's release
process is not as complete.

- Push a new tag starting with `evaluator/` to the repository, e.g.
  `evaluator/v0.1.0`.
- This will trigger the release and publication of the package to GitHub.
- Update the `QUINT_EVALUATOR_VERSION` constant in the Quint CLI codebase to the
  new version, so that the CLI can use the new evaluator.
- Release a new version of the Quint CLI, so that the new evaluator is included
  in the CLI release.

### VSCode Extension

#### Prerequisites

- [vsce](https://github.com/microsoft/vscode-vsce)
- [yalc](https://github.com/wclr/yalc)
- Access to manage
  <https://marketplace.visualstudio.com/manage/publishers/informal>

#### Steps

- Prepare a release of the VSCode extension by running the script
  [./vscode/quint-vscode/scripts/prepare-release.sh](./vscode/quint-vscode/scripts/prepare-release.sh)
  with an argument to indicate the version increment: `patch`, `minor`, or
  `major`.
- Get the release PR reviewed and merged
- Checkout the release commit
- Publish the extension to the VSCode marketplace in one of two ways:
  - Run `vsce publish`
    - requires access to <https://dev.azure.com/informalsystems/>
    - which allows creating the required PAT (see
      <https://code.visualstudio.com/api/working-with-extensions/publishing-extension>)
  - Use the web interface
    - Run `vsce package` to produce a `.visx` archive
    - Navigate to
      <https://marketplace.visualstudio.com/manage/publishers/informal>, and
      click the `...` visible when hovering over `Quint` to upload the archive.
- `cd` into the `server` folder and run `npm publish` for publication of the
  [@informalsystems/quint-language-server](https://www.npmjs.com/package/@informalsystems/quint-language-server)
  package (used in Emacs and Vim integrations).
