# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## UNRELEASED

### Added
### Changed

- New definitions typed in the REPL are now incrementally analyzed, improving
  performance significantly (#952)

### Deprecated
### Removed
### Fixed

- Fixed a bug where sometimes static analysis would flag a mode error where
  there isn't one (#960)

### Security

## v0.11.2 -- 2023-06-15

### Added
### Changed

- New expressions typed in the REPL are now incrementally analyzed, improving
  performance significantly (#930)

### Deprecated
### Removed
### Fixed
### Security

## v0.11.1 -- 2023-06-01

### Added

- The `verify` command prints counterexamples on deadlocks and invariant
  violations (#914)

### Changed
### Deprecated
### Removed

### Fixed

- Fixed a bug in trace reporting by `quint run` (#913)

### Security

## v0.11.0 -- 2023-05-24

### Added

- Pretty-printing of expressions in REPL (#870)
- Spread syntax for record updates (#880)
- Save ITF traces in `quint test` (#884, #890)
- Initial integration with the Apalache server (#871)
- Support `import... from` for instances (#899)
- Modules can now have docstrings (#902)

### Changed
### Deprecated
### Removed
### Fixed

- Fix two problems that prevented docstrings to be parsed into the proper IR
  component (#902)

### Security

## v0.10.0 -- 2023-05-04

### Added

- Modules and definitions can now be exported (#771)
- Non-deterministic tests are run multiple times similar to {Quick,Scala}check (#786)
- `quint run` returns a non-zero exit code on invariant violation and errors (#793)
- Support for imports from files: `import ... from <filename>` (#800)
- suppress comments in REPL (#806)
- `quint repl` is printing the same version number as returned by `quint --version` (#804)
- add the command `.seed` in REPL (#812)
- fix `quint run` to output compile errors again (#812)
- add the precursor of the standard library in the form of spells (#827)
- cache top-level `pure val` (#837)
- support for higher-order operators in REPL/simulator (#845)
- introduce `reps` as an alternative to `repeated` (#855)
- More data is now output in most commands when `--out` is provided (#852)
- Mock command `verify` for running Apalache in the future (#787)

### Changed

- The ITF export adds output similar to Apalache (#780)

### Deprecated

- `repeated` is deprecated in favor of `reps` (#855)

### Removed

- `notin` is no longer a builtin operator (#814)
- `--with-lookup` command (#850)

### Fixed

- Proper errors are now reported when a lambda returns an operator (#811)
- Fix `quint run` to output compile errors again (#812)
- Fix the record constructor, so the key order does not matter (#839)
- `quint test` shows compile errors, if they occur (#841)
- Fix the bug that occurred when caching `pure val` (#844)

### Security

## v0.9.1 -- 2023-04-04

### Added
### Changed
### Deprecated
### Removed
### Fixed

- `test` command now exits with non-zero code on test failures (#772)

### Security

## v0.9.0 -- 2023-04-03

### Added

- detailed run output on `run --verbosity=3` (#748)
- detailed run output on `test --verbosity=3` (#755)
- detailed run output in REPL on `.verbosity=3` (#764)

### Changed

- using a controllable pRNG (#767)

### Deprecated
### Removed

- remove `foldr` (#760)

### Fixed

- effects no longer break when applying constant operators (#759)
- number highlighting in vim (#765)
- the simulator supports really big numbers, e.g., 256-bit (#767)

### Security

## v0.8.0 -- 2023-03-24

### Added

- short-circuiting for `implies` (#717)
- improve the summary output of `run` (#719)
- support for tuple unpacking in the simulator (#720)
- instances are now fully supported (#725)
- save the run results to ITF (#727)
- imports can now be qualified (#742)

### Changed

- The syntax for instances is now similar to imports (#739)

### Deprecated
### Removed
### Fixed

- Heisenbugs in `nondet x = oneOf(S)` should not happen (#712)
- REPL doesn't show unecessary namespaces for variable names anymore (#739)

### Security

## v0.7.0 -- 2023-03-09

### Added
### Changed

- Inferred effects are now properly quantified (#658)
- Lambda parameters were promoted so they can now have their own errors, types and effects (#689)

### Deprecated
### Removed

- Nested modules are no longer supported (#674)

### Fixed

- Modes for nested definitions are now properly checked (#661)
- All basic operators can now be used with temporal formulas (#646)
- Effect checking performance for large specs is massively improved (#669)
- A module can no longer import or instance itself (#676)

### Security

## v0.6.0 -- 2023-02-22

### Added

- command `test` to run unit tests (#634)
- command `run` to run stateful simulations (#659)
- option `--with-lookup` of the command `parse` (#639)

### Changed

- `docs` subcommand now outputs generated docs to stdout (#617)
- Mode errors are better explained and include a fix suggestion (#619)
- Typechecking now reports errors when instance overrides are not compatible with
  the original definition (#622)
- Effect errors for multiple updates of the same variable are clearer and more precise (#641)

### Deprecated
### Removed

- REPL does not support nested modules any longer (#621)

### Fixed

- REPL avoid name clashes in different modules (#621)
- REPL session is now a proper Quint file (#621)
- A regression in REPL caused by multiple modules (#650)

### Security

### Documentation

- the [Prisoners puzzle](./examples/puzzles/prisoners) (#634)

## v0.5.5 -- 2023-02-03

### Added

 - Change the grammar to support multiple modules (#547)
 - Change static analysis to support multiple modules (#559)
 - Add an example that specifies the Solidity Coin contract (#576)
 - A work-in-progress example on Solidity's Simple Auction (#573)
 - Parse `100_000_000` and `0xabcd`, `0xAB_CD` as integers (#580)

### Fixed

 - The parser complains about junk in the end of file (#603)
 - Fix a confusing error message in assignments (#606)
 - REPL compiles unsupported operators and issues runtime errors (#604)

## v0.5.4 -- 2023-01-24

### Changed

- Re-release of v0.5.3 with proper packaging

## v0.5.3 -- 2023-01-24

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
