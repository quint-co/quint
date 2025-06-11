# Contributing

**This file is under construction...**

This project is part of the [Apalache][] ecosystem.  Hence, we apply the
same principles in Quint, see [Contributing to Apalache][].

## Source code structure

 - [quint](./quint) is the package for the `quint` transpiler
 - [vscode](./vscode) vscode plugin

## Developer docs

 - [roadmap](./docs/roadmap.md)
 - [ADR001: Transpiler architecture](./docs/pages/docs/development-docs/architecture-decision-records/adr001-transpiler-architecture.md)
 - [ADR002: Error codes](./docs/pages/docs/development-docs/architecture-decision-records/adr002-errors.md)
 - [ADR003: Interface to visit Internal Representation
   components](./docs/pages/docs/development-docs/architecture-decision-records/adr003-visiting-ir-components.md)
 - [ADR004: An Effect System for Quint](./docs/pages/docs/development-docs/architecture-decision-records/adr004-effect-system.md)
 - [ADR005: A Type System for Quint](./docs/pages/docs/development-docs/architecture-decision-records/adr005-type-system.md)
 - [ADR006: Design of modules and lookup tables](./docs/pages/docs/development-docs/architecture-decision-records/adr006-modules.lit.md)
 - [ADR007: Flattening](./docs/pages/docs/development-docs/architecture-decision-records/adr007-flattening.md)
 - [ADR008: Obtaining and Launching Apalache from Quint](./docs/pages/docs/development-docs/architecture-decision-records/adr008-managing-apalache.md) 

## Coordinating work

Development on Quint is distributed. As with any distributed system, establishing
effective synchronization and consensus on key properties requires careful
attention.

## Project structure

Currently, the project consists of two npm packages:

 - [quint](./quint) is the transpiler package, see the [quint manual][].
 - [vscode/quint-vscode](./vscode/quint-vscode) is the VSCode plugin for Quint, depends on `quint`.
   This plugin has two subpackages:

   - [vscode/quint-vscode/server](./vscode/quint-vscode/server) is the server-side package,
     implementing [Language server protocol][] used by VSCode and other
     code editors.

   - [vscode/quint-vscode/client](./vscode/quint-vscode/client) is the client-side package,
     implementing the language extension for VSCode.

## Dependencies

For setting up the local build, you would have to install TypeScript and npm.
This is usually done via your local package manager.

### Nix for development dependencies

We provide a nix shell in case you want to use nix to manage your development
environment and dependencies.

Make sure you have `nix` installed, then build and enter the clean development shell with:

```sh
$ nix develop
```

If you want to use direnv to setup your environment with nix (instead of using a
shell), you will need to add `use flake;` to your `.envrc`, and then
running `direnv allow`:

```sh
$ echo "use flake;" >> .envrc && direnv allow
```

You can also add a `direnv` extension/package to your IDE of choice to have
those dependencies set up for the IDE to use.

#### Updating nix dependencies

To update one of the flake inputs you can run: `nix flake lock --update-input <input-name>`

To update all of the inputes you can run: `nix flake update`, it is recommended
to update dependencies one by one though.

### Formatting

We use [eslint][] to enforce the good coding practices of JavaScript and
TypeScript. This is especially important in the context of these languages, as
JavaScript has plenty of bad parts.

## Testing

### Build and run quint and the VSCode plugin from source

These steps are currently a bit complicated. Check the dedicated pages:

 - [Installing quint][],
 - [Installing the VSCode plugin](#using-the-vscode-plugin-from-source).

### Tests

#### Unit tests for quint

In general, we are using the [Mocha][] test framework to write and run unit
tests. We are using [Chai][] to write assertions, without going into BDD
testing too much. For details, see [quint unit tests][].

#### Integration tests for quint

We are using the [txm][] framework to write integration tests. For details,
check [quint integration tests][].

#### End-to-end tests for the VSCode plugin

We do not have unit tests for the VSCode plugin. Instead we have end-to-end
tests that run via VSCode:

```sh
cd vscode/quint
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

### Ensure exhaustive matches

The type system should help us keep the code base maintainable. But when
`switch` statements and conditionals are used purely for side effects, we can
lose the advantage of exhaustivness checking. Here's an example:

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

For all other cases, we can avoid these typechecking blind spots by following two guidelines:

1. Prefer passing data by returning values whenever, and avoid needless mutable
   assignments.
2. When switches need to be used for side effects, provide a default that
   calls `unreachable` on the expression to ensure all cases are handled:

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

## Using the VSCode plugin from source

There are many ways to use the VSCode plugin from source. You also may want to use it with an unpublished version of `quint`.
This section is a suggestion on how to do it, and its also how we do it.

To build the vscode plugin, run the `vscode` make target from [the root of this repo](../../):

```sh
make vscode
```

To install the plugin for use, link the combined plugin into your vscode
extensions. From the root of this repo, you can run:

```sh
ln -s $PWD/vscode/quint-vscode/ $HOME/.vscode/extensions/informal.quint-vscode
```

### Using the VSCode plugin with an unpublished version of `quint`

We use `yalc` to manage unpublished packages. To install it, run

``` sh
npm i yalc -g
```

Then use the `local` make target to replace the published version of `quint` with the local one and build the plugin:

``` sh
make local
```

Make sure you have the folder linked to your vscode extensions as described above.

### Troubleshooting

Between installing the plugin from different sources, you may end up with multiple versions and VSCode can get confused about which version to use. To fix this, follow these steps:

1. Navigate to `$HOME/.vscode/extensions` and delete folders called `informal.quint-vscode*` except for the one you want to keep.
2. `rm $HOME/.vscode/extensions/extensions.json`.
3. `rm $HOME/.vscode/extensions/.init-default-profile-extensions`.
4. Restart VSCode **twice**. The first time it will recreate the `extensions.json` file, the second time it will install the extensions. Reloading won't work, you need to actually close and reopen VSCode.

[Apalache]: https://github.com/apalache-mc/apalache
[Contributing to Apalache]: https://github.com/apalache-mc/apalache/blob/main/CONTRIBUTING.md
[eslint]: https://eslint.org/
[quint manual]: ./docs/pages/docs/quint.md
[Installing quint]: https://github.com/informalsystems/quint/blob/main/quint/README.md#how-to-install
[Language server protocol]: https://microsoft.github.io/language-server-protocol/
[quint unit tests]: https://github.com/informalsystems/quint/blob/main/quint/README.md#unit-tests
[quint integration tests]: ./quint/README.md#integration-tests
[Mocha]: https://mochajs.org/
[Chai]: https://www.chaijs.com/
[txm]: https://www.npmjs.com/package/txm
[sweet-monads/maybe]: https://www.npmjs.com/package/@sweet-monads/maybe
[lodash.isequal]: https://www.npmjs.com/package/lodash.isequal

## Release

We manage releases for two components out of this repository: the quint
executable and the VSCode plugin.

### quint executable

- Prepare a release by running
  [./quint/scripts/prepare-release.sh](./quint/scripts/prepare-release.sh) with
  an argument to indicate the version increment: `patch`, `minor`, or `major`.
- Get the release PR reviewed and merged
- Checkout the release commit
- Run the release script [./quint/scripts/release.sh](./quint/scripts/release.sh).

  This will trigger the release and publication of the package to npm and
  GitHub.

### VSCode Plugin

#### Prerequisites

- [vsce](https://github.com/microsoft/vscode-vsce)
- [yalc](https://github.com/wclr/yalc)
- Access to manage https://marketplace.visualstudio.com/manage/publishers/informal

#### Steps

- Prepare a release of the VSCode plugin by running the script
  [./vscode/quint-vscode/scripts/prepare-release.sh](./vscode/quint-vscode/scripts/prepare-release.sh)
  with an argument to indicate the version increment: `patch`, `minor`, or
  `major`.
- Get the release PR reviewed and merged
- Checkout the release commit
- Publish the plugin to the VSCode marketplace in one of two ways:
  - Run `vsce publish`
    - requires access to https://dev.azure.com/informalsystems/
    - which allows creating the required PAT (see
      https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
  - Use the web interface
    - Run `vsce package` to produce a the `.visx` archive
    - Navigate to
      https://marketplace.visualstudio.com/manage/publishers/informal, and click
      the `...` visible when hovering over `Quint` to upload the archive.
- `cd` into the `server` folder and run `npm publish` for publication of the
  [@informalsystems/quint-language-server](https://www.npmjs.com/package/@informalsystems/quint-language-server)
  package (used in Emacs and Vim integrations).
