# TNT

TNT is not TLA+. It is a surface syntax for TLA+.

## [Temp] How to run it locally

We use `yalc` to manage unpublished packages. To install it, run

``` sh
npm i yalc -g
```

1. In your `tntc` directory, run `npm run compile` to generate `dist/` and then `yalc publish` to make it available as a local package.
1. In this directory (`vscode/tnt`), run `yalc add tntc` and then `npm install`
1. Run `npm run compile`
1. To use it on your VSCode, copy or link this folder to your VSCode extensions folder:

``` sh
ln -s <full_project_path>/vscode/tnt ~/.vscode/extensions/
```

## Features

- Syntax Highlighting
- Syntax errors
- Undefined and conflicting names

## Requirements

Since TNT packages are still not on npm, we use `yalc` to locally publish and manage packages

## Known Issues

No known issues yet.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

The very first version that has minimal syntax highlighting.

### 0.0.7

Included a parser pass that diagnoses syntax errors.

### 0.0.8

Included the second parser pass that diagnoses name errors.
