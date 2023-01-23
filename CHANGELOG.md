# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Added

- A few productivity hacks in REPL (#557)
- Operator `fail` (#552)

### Changed

- `assert` is now an action operator, not a run operator (#542)

## v0.5.2 -- 2023-01-17

### Added

- Hello world tutorial (#510)

### Fixed

- Fix the order of `foldr` in REPL (#536)
- Fix priority for `a^b` and a few other infix operators (#465, #533)

## v0.5.1 -- 2023-01-13

### Fixed

- Fixed REPL output for maps (#497)
- REPL reporting a runtime error on `0^0` (#492)
- Improved how documentation is produced for VSCode compatibility (#485)
- Enable access to builtin documentation parsed from `builtin.qnt` (#485)
- The effect and mode checkers no longer complain about runs (#505)
- Fixed missing lodash dependency (#484)

### Added

- A tutorial on integers (#495)

## v0.5.0 -- 2022-12-22

### Fixed

- Updated installation documentation (#471)
- The tutorial on Booleans now comes in markdown and CodeTour (#517)


### Added

- Added C-like type signatures (#102)

## v0.4.0 -- 2022-12-22

### Added

- Added beginner tutorial based around REPL (#400)
- Added API documentation for builtin operators (#386)

### Changed

- Project renamed to `quint` (#458)
- REPL can now receive input that includes its prompt (#430)
- Calling `quint` without an argument now starts the REPL (#445)
- Renamed vscode plugin package to `quint-vscode` (#463)
- Renamed `quint` package to `@informalsystems/quint`, establishing it under the
  `informalsystems` organization.

### Fixed

- Return exit code 1 when typechecking fails (#389).
- Fixed static checks of polymorphic operators (#447)

## v0.3.0 -- 2022-12-05

- Began keeping CHANGELOG
