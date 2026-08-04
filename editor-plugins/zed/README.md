# Zed support

This directory contains a [Zed](https://zed.dev) extension for Quint: syntax
highlighting (via the [`gruhn/tree-sitter-quint`][tree-sitter-quint] grammar,
the same one used by Helix) and language server integration.

It is not yet published to Zed's extension registry. Install it as a dev
extension:

1. Clone this repo.
2. In Zed, open the command palette and run `zed: install dev extension`.
3. Select this `editor-plugins/zed` directory.

Zed will build the extension and download/build the tree-sitter grammar
automatically. Open a `.qnt` file to see highlighting.

## Publishing

This extension already meets [Zed's publishing requirements][publishing]:
`id`/`name` ("quint") contain none of the reserved words, `extension.toml`
has all required fields (`id`, `name`, `version`, `schema_version`,
`authors`, `description`, `repository`), it ships no bundled language
server binary (see [Language server](#language-server) below), and it's
licensed under Apache 2.0 via the `LICENSE` file in *this* directory.
That's a deliberate duplicate of the repo-root `LICENSE`: the registry's
packaging script only looks for a license inside `path` when
`extensions.toml` sets one (verified against its actual
`retrieveLicenseCandidates`/`packageExtension` logic, which joins
`submodule` with `path` and never falls back to the submodule root) — so
for a monorepo-hosted extension like this one, the root license alone
isn't enough.

To submit it to the [`zed-industries/extensions`][zed-extensions] registry:

1. Fork `zed-industries/extensions` and add this repo as a submodule under
   `extensions/quint`, using the HTTPS clone URL (not SSH):
   ```sh
   git submodule add https://github.com/quint-co/quint.git extensions/quint
   ```
2. Add an entry to that repo's top-level `extensions.toml`, using `path` to
   point at this subdirectory (Zed's registry supports extensions that live
   inside a larger repo, e.g. `posit-dev/air`'s `editors/zed`):
   ```toml
   [quint]
   submodule = "extensions/quint"
   path = "editor-plugins/zed"
   version = "0.1.0"
   ```
   The `version` here must match the `version` in this directory's
   `extension.toml` at the submoduled commit.
3. Run `pnpm sort-extensions` in that repo.
4. Open a PR to `zed-industries/extensions`.

Before submitting, test it thoroughly (per the docs, untested submissions
are closed without feedback) — the manual checks in this repo's PR
description are a good starting point.

[publishing]: https://zed.dev/docs/extensions/developing-extensions#publishing-your-extension
[zed-extensions]: https://github.com/zed-industries/extensions

## Language server

The extension looks for [`quint-language-server`][quint-language-server] in
this order:

1. A `binary` path configured under `lsp.quint-language-server` in your Zed
   `settings.json`.
2. `quint-language-server` on your `$PATH`. Install it globally with:

   ```sh
   npm i @informalsystems/quint-language-server -g
   ```

   or use `npm link` from `vscode/quint-vscode/server` per
   [`CONTRIBUTING.md`](../../CONTRIBUTING.md) for local development.
3. If neither is found, the extension downloads and runs
   `@informalsystems/quint-language-server` from npm itself.

[tree-sitter-quint]: https://github.com/gruhn/tree-sitter-quint
[quint-language-server]: https://www.npmjs.com/package/@informalsystems/quint-language-server
