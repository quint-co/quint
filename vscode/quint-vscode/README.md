# Quint

This extension provides language support for Quint, the specification language.

## Features

- Syntax Highlighting
- Diagnostics:
  - Syntax errors
  - Undefined and conflicting names
  - Type errors
  - Effect errors
  - Mode errors
- Symbol navigation:
  - Find all references

New features are listed and discussed on [this GitHub
discussion](https://github.com/informalsystems/quint/discussions/254).

Parse errors are highlighted in red, and hovering over the error will show the
error message.

<img src=https://user-images.githubusercontent.com/18356186/209388281-c3f24d4d-9fe0-4958-ba4e-e3b20ca89e8a.gif width=600>

Hovering over an expression or definition will show its inferred type and
effect.

<img src=https://user-images.githubusercontent.com/18356186/209388287-1888c715-484d-4a34-a3e5-13c50166b3dd.gif width=600>

Type errors are highlighted in red, and hovering over the error will show the
error message, including unification errors.

<img src=https://user-images.githubusercontent.com/18356186/209388285-fc1f42ab-0b07-4feb-92af-54011a7a250c.gif width=600>

Effects can help you quickly notice if you forgot to update a state variable or
are trying to update the same variables more than one time. Effect errors are
highlighted in red, and hovering over the error will show the error message.

<img src=https://user-images.githubusercontent.com/18356186/209388284-5d47d0da-3861-426f-b016-b5b686ec6dc7.gif width=600>

Modes can help you maintain expectations regarding an operator. `pure` operators
can't interact with the state, `def`s and `val`s can read the state (but not
write), and only `action`s can update the state. Mode errors are highlighted in
red, and hovering over the error will show the error message.

<img src=https://user-images.githubusercontent.com/18356186/209388278-6e55583e-85c1-4f74-adab-301860c6c0fd.gif width=600>

## Requirements

There are no external requirements.

## Known Issues

Issues are tracked on GitHub under the [Fvscode
tag](https://github.com/informalsystems/quint/labels/Fvscode).
