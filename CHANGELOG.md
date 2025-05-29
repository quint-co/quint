# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## UNRELEASED

### Added
### Changed

- `--out-itf` does not suppress outputs anymore. Shown output amount only depends on `--verbosity` now (#1664) 

### Deprecated
### Removed
### Fixed
### Security

## v0.25.0 -- 2025-05-28

### Added

- Added `--hide` option to hide specific variables from output (#1656)
- Errors from the Rust evaluator now show the corresponding location (#1648)
- Added support for calling `q::debug` with a single argument, which shows both the expression and its value (#1660)
- `quint run` now reports statistics on trace length and the simulation speec in traces/second (#1669)

### Changed

- `oneOf()` now automatically handles empty sets instead of giving an error and has a retry strategy for small sets (#1670)

### Deprecated
### Removed
### Fixed

- Fixed a problem on `pure val`s referring to constants resulting in errors in the Rust evaluator (#1647)

### Security

## v0.24.0 -- 2025-04-08

### Added

- Added a `--flatten` option to `quint compile` to enable compilation of unflattened modules (#1623)
- Added a `main` field to the JSON output of `quint compile` (#1623)
- Added a `--backend` option to `quint run` to enable running the new Rust simulator (#1623)

### Changed
### Deprecated
### Removed
### Fixed

- Init definitions are now properly transpiled into TLA+ without assignments (#1613)

### Security

## v0.23.1 -- 2025-03-10

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed a requirement from the package configuration that would lead to always installing v0.18.3 on node versions > 20 (#1602)

### Security

## v0.23.0 -- 2025-01-24

### Added

- Added a `--witnesses` option to `quint run` that enables counting for how many explored traces each of the given predicates (witnesses) were true (#1562)

### Changed

- Bumped Apalache to 0.47.2 (#1565)
- Changed how an action from `any` gets picked, improving performance significantly (#1582)

### Deprecated
### Removed
### Fixed

- Fixed a problem where calling `setOfMaps()` on empty sets resulted in errors in the simulator (#1561)

### Security

## v0.22.4 -- 2024-11-19

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Changed the `--mbt` variables representation into `mbt::actionTaken` and `mbt::nondetPicks`. 
Added those variables to the `vars` field of the ITF json so that they are displayed correctly in the trace viewer.
- Fixed a problem where traces other than the first one when `--n-traces` > 1
  and `--mbt` is true had the incorrect `action_taken` and `nondet_picks` values
  (#1553).

### Security

## v0.22.3 -- 2024-10-28

### Added

- Added a new operator called `getOnlyElement()` to extract elements out of singleton sets (#1525)

### Changed

- Updated grammar rule to allow an optional trailing comma in parameter lists (#1510):
  - Operator calls
  - Constant initialization
  - Operator definitions

### Deprecated
### Removed
### Fixed

- The seed was not being properly printed when the simulator found some runtime errors (#1524).
- Fixed a problem where using `--mbt` resulted in missing data on `nondet_picks`
  due to internal caching (#1531)
- Hashbang lines are now properly highlighted as comments in vscode and in highlight.js.

### Security

## v0.22.2 -- 2024-10-08

### Added

- `quint verify` has the option `--apalache-version` to pull a custom version (#1521)
- Grammar updated with support for an optional leading hashbang (`#!`) line (#1522)

### Changed
### Deprecated
### Removed
### Fixed

### Security

## v0.22.1 -- 2024-09-25

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Some error scenarios when importing files on Windows were fixed (#1498)
- `quint verify` on Windows should now properly start an Apalache server on the
  background (#1499)
- `quint verify` on Linux properly terminates the spawned instance (#1520)

### Security

## v0.22.0 -- 2024-09-09

### Added

- Calling `q::test`, `q::testOnce` and `q::lastTrace` on the REPL now works properly (#1495)

### Changed

- Performance of the REPL was drastically improved (#1495)
- Error reporting was improved for many runtime errors (#1495)

### Deprecated
### Removed
### Fixed

- Sending SIGINT (hitting Ctrl+C) to the run and test commands now actually stops the execution (#1495)

### Security

## v0.21.2 -- 2024-09-09

### Added

- In the `verify` command, add warning if `--out-itf` option contains `{test}` or `{seq}` as those have no effect since Apalache only produces a single trace (#1485)
- The `run` and `test` commands now display a progress bar (#1457)

### Changed

- Performance of incrementally checking types (i.e. in REPL) was improved (#1483).
- In the `run` and `test` commands, change placeholders from `{}` to `{test}` and from `{#}` to `{seq}` (#1485)
- In the `run` command, auto-append trace sequence number to filename if more than one trace is present and `{seq}` is not specified (#1485)
- In the `test` command, rename `--output` to `--out-itf`

### Deprecated

- In the `test` command, deprecate `--output` option in favour of `--out-itf`, add hidden alias for the former (#1485)

### Removed

- In the `test` command, stop enforcing `.itf.json` extension (#1485)

### Fixed

- Bumped GRPC message sizes to 1G (#1480)
- Fix format of ITF trace emitted by `verify` command (#1448)
- Relax uppercase check for types qualified with a namespace (#1494)
- Fixed file loading from imports on Windows (#1498)

### Security

## v0.21.1 -- 2024-07-29

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed an issue that caused high memory usage on exploration (#1465)

### Security

## v0.21.0 -- 2024-06-16

### Added

- Added an `--n-traces` option to the `run` subcommand so multiple traces can be
  produced in a single CLI call (#1365).

### Changed
### Deprecated
### Removed
### Fixed

- Fixed a problem where random numbers were internally produced without being
  used. This affects behavior of randomness, and therefore same seeds will
  behave differently before and after this version (#1453).

### Security

## v0.20.0 -- 2024-05-22

### Added

- Added an experimental `--mbt` flag to produce metadata that is useful for
  Model-Based Testing (#1441).
- Added the `allListsUpTo`, a limited but computable version of `allLists` (#1442)

### Changed

- Shadowing is a bit less agressive. This should improve readability of variable
  names after compilation, i.e. in Apalache and some simulation errors, and in
  TLA+ produced from the `compile` command (#1444).

### Deprecated
### Removed
### Fixed
### Security

## v0.19.4 -- 2024-05-14

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed a bug introduced in v0.19.3 where the analyzer would crash if there were
  some specific type errors (#1436)

### Security

## v0.19.3 -- 2024-05-07

### Added

- Added static analysis checks to ensure proper usage of `nondet` and `oneOf` (#1431).

### Changed
### Deprecated
### Removed
### Fixed
### Security

## v0.19.2 -- 2024-04-09

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fix a problem where empty tuples were not parsed as valid types, only as
  values (#1421).

### Security

## v0.19.1 -- 2024-04-01

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fix a problem where sum types with no parameters were being printed with
  either Quint's unit type `()` or Apalache's unit type `"U_OF_UNIT"` (#1416).

### Security

## v0.19.0 -- 2024-03-25

### Added

- Added polymorphic type declarations, allowing abstracting commonly used data
  types like `Option[a]` and `Result[err, ok]`. Note that this is not yet
  supported by `verify`. (#1298)
- Added `compile` subcommand, allowing compiling specs to TLA+ (via Apalache)
  and to a JSON format. (#1309, #359)

### Changed

- The latest supported node version is now bounded at <= 20, which covers the
  latest LTS. (#1380)
- Shadowing names are now supported, which means that the same name can be redefined
  in nested scopes. (#1394)
- The canonical unit type is now the empty tuple, `()`, rather than the empty
  record, `{}`. This should only affect invisible things to do with sum type
  constructors. (#1401)

### Deprecated
### Removed
### Fixed

- Removed a dependency causing deprecation errors messages to be emitted.
  (#1380)
- Fixed a type checker bug causing too general types to be inferred (#1409).
- Fixes serialization of Sets in JSON outputs (#1410).

### Security

## v0.18.3 -- 2024-02-08

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Erroneous effect checking failure resulting from invalid occurs check. This
  error prevented some valid specs from being simulated or verified (#1359).
- Regression on ITF production, where we stopped producing ITF traces on
  successful runs (#1362)

### Security

## v0.18.2 -- 2024-01-26

### Added
### Changed

- Improved error reporting for runtime errors during simulation (#1349).

### Deprecated
### Removed
### Fixed

- Fixed type checker to account for type constraints on annotated operator
  parameters when checking operator bodies (#1177).

### Security

## v0.18.1 -- 2024-01-16

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed parsing of qualified type constructors, which were being misinterpreted
  as type variables when the name of the qualifying module started with a
  lowercase letter (#1337).
- Fixed an issue where, sometimes, runtime errors were not reported in
  simulation (#1339)

### Security

## v0.18.0 -- 2024-01-03

### Added

- Add a run operator `A.expect(P)` to test the state predicate `P` in the state resulting from applying action `A` (#1303)

### Changed

- Change in `A.then(B)`: If `A` returns `false`, `A.then(B)` fails (#1304)

### Deprecated
### Removed
### Fixed

- Detect import paths that only differ in capitalization (#1295)

### Security

## v0.17.1 -- 2023-12-05

### Added

- Add a `q::debug` built-in function for printing values to stdout (#1266)

### Changed
### Deprecated
### Removed
### Fixed

- The effect checker now distinguishes variables from different instances (#1290)

### Security

## v0.17.0 -- 2023-12-04

### Added

- When an input file only one module, it will be inferred as the main module (#1260)
- Sum types are now supported when running `verify` (#1034)

### Changed
### Deprecated
### Removed
### Fixed

- Produce proper error messages on invalid module name (#1260)
- Fix JSON output when running multiple tests (#1264)
- Topological sorting of modules (#1268)
- The effect checker will now check for consistency of updates across different
  cases inside `match` (#1272)
- Fix problems in the integration of sum types in `run`, `test`, and `verify` commands (#1276)
- Fix some corner cases with the usage of complex expressions inside `assume`
  and `import (...)` (#1276)
- Fix incorrect type checking failure from interference between sum types
  sharing variant labels (#1275)
- Fix the IDs generated for operator definition bodies (#1280)
- Fixed missing support for sum type variants in ITF traces (#1281)

### Security

## v0.16.0 -- 2023-11-20

### Added

- Support for sum types in type checking and simulation (#244).

### Changed
### Deprecated
### Removed

- The long deprecated union types have been removed, in favor of the new sum
  types (#1245).

### Fixed
### Security

## v0.15.0 -- 2023-11-08

### Added
### Changed

- Error messages for `val` vs `def` and `pure val` vs `pure def` errors are clearer (#1208)
- `quint run` prints the random seed even if no bug was found (#1213)
- Error reporting was changed to show more errors at a time, instead of having a lot of phases (#1220)

### Deprecated
### Removed
### Fixed

- Fixed internal bugs in the effect checker that could cause an incorrect effect
  to be inferred or error to be reported (#1203)
- Fixed propagation of `checker.tuning` Apalache config file key for `quint
  verify` (#1216)
- Fixed a problem where errors in one file were being reported in another file
  that imported it (#1224).
- Fixed a problem where some errors were not being reported in the REPL (#1223)

### Security

## v0.14.4 -- 2023-10-02

### Added

- Added `--random-transitions` flag for `verify`, enabling symbolic simulation
  through Apalache (#1188)

### Changed

- Changed syntax for unpacking tuples in lambda parameters (#1202)

### Deprecated
### Removed
### Fixed

- Fixed a problem where state variables from instances didn't work properly in the REPL (#1190)
- Fixed a problem where referencing constants from an instance could cause a crash (#1191)

### Security

## v0.14.3 -- 2023-09-19

### Added

- Added `--temporal` flag for `verify`, enabling temporal property verification
  through Apalache (#1154)

### Changed

- Introduce frames on actions in the verbose output. The verbose output has changed! (#1158)
- The ITF traces always serialize integers as `{ '#bigint': 'num }`  (#1165)

### Deprecated
### Removed
### Fixed

- Fixed a problem where an error was thrown when a name from an importing module
  shadowed a nested name from the imported module (#802)
- Fixed a problem where tests were ignored if they are not defined directly in
  the main module - that is, they were imported (#1161)
- Fixed a type checker bug where the inferred type was too general for nested
  definitions, which prevented running `verify` (#1166).

### Security

## v0.14.2 -- 2023-09-06

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed a problem where importing the same definition under multiple different
  names would cause a crash (#1142)
- Fixed a problem where importing a module in the REPL would prevent state
  variables from having their values persisted between evaluations (#1146)

### Security

## v0.14.1 -- 2023-08-28

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fix problem with broken dependency by pinning versions (#1129)

### Security

## v0.14.0 -- 2023-08-25

### Added

- The `verify` command now automatically acquires the Apalache distribution and
  starts the server, if the server is not already running (#1115)

### Changed

- Module management was rewritten, and instances should behave much better in
  the simulator, REPL, and in integration with Apalache (#1119)

### Deprecated
### Removed
### Fixed

- Fixed a problem where definitions were not properly loaded in the REPL when
  the main module was provided in the CLI argument (#1112)

### Security

## v0.13.0 -- 2023-08-03

### Added

- `quint repl` produces an evaluation trace on errors too (#1056)
- `S.setOfMaps(Int).oneOf()` is now supported (#1060)
- `quint run` produces a friendlier message when it meets a `const` (#1050)

### Changed

- The behavior of `oneOf` has changed, existing seed values for `quint test`
  can exhibit different behavior than before (#1060)
- `APALACHE_DIST` no longer needed to run `quint verify` (#1075)
- Record field labels that include `::` are now illegal and raise a syntax error
  (#1086)

### Deprecated
### Removed

- Operator `repeated` (#1026)

### Fixed

- Fix bug where `export` for a qualified import would not work (#1030)
- Fix a problem where name resolution would fail to flag name errors for
  non-exported names in incremetal evaluation in REPL (#1031)
- Do not fail on a bug in error formatting (#1063)
- Fix unhandled error messages during parsing and typechecking on the Apalache
  server (#1074)
- Fix a problem where some definitions would have to be exported from the
  main module in order for the REPL and the simulator to load them (#1039 and #1051)
- Invalid arities when applying record and tuple operator no longer cause a crash (#1054)

### Security

## v0.12.0 -- 2023-07-06

### Added

- Support out of order definitions (#1008)
- Restructure of name resolution, improving performance significantly for large
  specs (#1011)

### Changed
### Deprecated
### Removed
### Fixed

- An error is now reported when multiple modules are declared with the same name (#1020)

### Security

## v0.11.4 -- 2023-06-28

### Added
### Changed
### Deprecated
### Removed
### Fixed

- Fixed a bug in the verbose trace output of REPL (#993)

### Security

## v0.11.3 -- 2023-06-23

### Added
### Changed

- New definitions typed in the REPL are now incrementally analyzed, improving
  performance significantly (#952)
- New expressions and definitions typed in the REPL are now incrementally
  compiled, improving performance (#968)
- Static analysis performance is significantly improved for large specs (#970)

### Deprecated
### Removed
### Fixed

- Fixed a bug where sometimes static analysis would flag a mode error where
  there isn't one (#960)
- Fixed the behavior of `slice` for the case `l.slice(length(l), length(l))`
  (#971)
- Fixed a bug where definitions with nested definitions could have their
  inferred type be too general.

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
