# Quint



## Features

- Syntax Highlighting
- Syntax errors
- Undefined and conflicting names

## Requirements

Since Quint packages are still not on npm, we use `yalc` to locally publish and manage packages

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

## [Temp] How to run it locally

We use `yalc` to manage unpublished packages. To install it, run

``` sh
npm i yalc -g
```

To build the vscode plugin, run the `vscode` make target from [the root of this repo](../../):

```sh
make vscode
```

To install the plugin for use, link the combined pluging into your vscode
extensions. From the roof of this repo, you can run

```sh
ln --symbolic $PWD/vscode/quint-vscode $HOME/.vscode/extensions/
```
