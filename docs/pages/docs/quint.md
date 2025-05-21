# Quint CLI: Tool for the Quint specification language

**WARNING**: *This is a preliminary manual in the style of [Working
Backwards]. Some commands are not implemented yet.*

`quint` is a command line interface tool for working with the [Quint
specification language](./lang.md). It is the primary access point for testing
and integration with other tools.

The main commands of `quint` are as follows:

 - [x] `repl` starts the REPL (Read-Eval-Print loop) for Quint
 - [x] `compile` parses, typechecks, and processes a quint specification
       into the `--target` format, writing the results to stdout
 - [x] `parse` parses a Quint specification and resolves names
 - [x] `typecheck` infers types in a Quint specification
 - [x] `run` executes a Quint specification via random simulation
        similar to stateful property-based testing
 - [x] `test` runs unit tests against a Quint specification
 - [x] `verify` verifies a Quint specification with Apalache
 - [x] `docs` produces documentation
 - [ ] `lint` checks a Quint specification for known deficiencies
 - [ ] `indent` indents a Quint specification

In the following, we give details about the above commands.

## Installation

``` sh
npm i @informalsystems/quint -g
```

## Command `repl`

This is the default operation if no other subcommand is given:

```sh
$ quint
```

You can also invoke it directly with `quint repl`:

```sh
$ quint repl --help
quint repl

run an interactive Read-Evaluate-Print-Loop

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -r, --require  filename[::module]. Preload the file and, optionally, import
                 the module                                             [string]
      --verbosity  control how much output is produced (0 to 5)
                                                           [number] [default: 2]
```

```sh
quint repl
```

The REPL is especially useful for learning the language. See the
[repl](./repl.md) documentation for more details.

The verbosity levels 3 and 4 are used to show execution details. They are
especially useful for debugging complex specifications.

## Command `compile`

```sh
$  quint compile --help
quint compile <input>

compile a Quint specification into the target, the output is written to stdout

Options:
  --help              Show help                                        [boolean]
  --version           Show version number                              [boolean]
  --out               output file (suppresses all console output)       [string]
  --main              name of the main module (by default, computed from
                      filename)                                         [string]
  --init              name of the initializer action  [string] [default: "init"]
  --step              name of the step action         [string] [default: "step"]
  --invariant         the invariants to check, separated by commas      [string]
  --temporal          the temporal properties to check, separated by commas
                                                                        [string]
  --target            the compilation target.
                         [string] [choices: "tlaplus", "json"] [default: "json"]
  --flatten           Whether or not to flatten the modules into one. Use
                      --flatten=false to disable       [boolean] [default: true]
  --verbosity         control how much output is produced (0 to 5)
                                                           [number] [default: 2]
  --apalache-version  The version of Apalache to use, if no running server is
                      found (using this option may result in incompatibility)
                                                    [string] [default: "0.47.2"]
  --server-endpoint   Apalache server endpoint hostname:port
                                            [string] [default: "localhost:8822"]
```

Given a quint specification as input, this command parses, resolves imports,
typechecks, and then "flattens" the specification into on module containing just
the needed definitions (unless `--flatten=false` is given).

The main module is determined as follows: If a module name is specified by
`--main`, that takes precedence. Otherwise, if there is only one module in the
input file, that is the main module. Otherwise, the module with the same name as
the file is taken to be the main module.

The main module must specify a state machine. This means it must either define
actions named `init` and `step`, specifying the initial state and the
transition action respectively, or suitable actions defined in the main module
must be indicated using the `--init` and `--step` options.

The following compilation targets are supported

- `json`: The default target, this produces a json representation, in the same
  format which is described under [`parse`](#command-parse) and
  [`typecheck`](#command-typecheck), below.
- `tlaplus`: Quint uses its integration with Apalache to compile the
  specification into TLA+.

## Command `parse`

*Warning: The language is still in active development, and breaking changes are
to be expected.*

```sh
$ quint parse --help
quint parse <input>

parse a Quint specification

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --out          output file                                            [string]
  --source-map   name of the source map                                 [string]
```

This command reads a Quint specification from the file `<spec>.qnt`, parses the
specification and resolves the imports relative to the directory of
`<spec>.qnt`. If the command produces errors, these errors are printed on
`stderr`. If there are no errors, nothing is printed.

If the user supplies the flag `--out`, then the
parsing result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the parsed and resolved module
   in [Quint IR][] (JSON):

   ```json
   {
     "stage": "parsing",
     "module": <IR>,
     "warnings": [ <warnings> ]
   }
   ```

   The module contents is the JSON representation of [Quint IR][]. The warnings
   are written in the format of [ADR002][].

 - If the command fails, the file contains an error message in JSON:

   ```json
   {
     "stage": "parsing",
     "errors": [ <errors> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command typecheck

```sh
quint typecheck [--out=<out>.json] <spec>.qnt
```

This command infers types in the Quint specification, which is provided in the
input file `<spec>.qnt`. Before doing that, it performs the same steps as the
command `parse`. If the command produces errors, these errors are printed on
`stderr`. If there are no errors, nothing is printed.

**Option `--out`**. If the user supplies the flag `--out`, then the
parsing result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the parsed and resolved module
   in [Quint IR][] (JSON):

   ```json
   {
     "stage": "typechecking",
     "module": <IR>,
     "types": { <typemap> }
     "effects": { <effectmap> }
   }
   ```

   The module contents is the JSON representation of [Quint IR][], the `types`
   and `effects` map source IDs of entities in the `module` to their inferred
   type or effect.

 - If the command fails, the file contains an error message in JSON:

   ```json
   {
     "stage": "typechecking",
     "errors": [ <errors> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command run

```sh
$ quint run --help
quint run <input>

Simulate a Quint specification and (optionally) check invariants

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --out          output file (suppresses all console output)            [string]
  --main         name of the main module (by default, computed from filename)
                                                                        [string]
  --out-itf      output the trace in the Informal Trace Format to file, e.g.,
                 out_{seq}.itf.json where {seq} is the trace sequence number
                                                                        [string]
  --max-samples  the maximum number of runs to attempt before giving up
                                                       [number] [default: 10000]
  --n-traces     how many traces to generate (only affects output to out-itf)
                                                           [number] [default: 1]
  --max-steps    the maximum on the number of steps in every trace
                                                          [number] [default: 20]
  --init         name of the initializer action       [string] [default: "init"]
  --step         name of the step action              [string] [default: "step"]
  --invariant    invariant to check: a definition name or an expression
                                                      [string] [default: "true"]
  --witnesses    space separated list of witnesses to report on (counting for
                 how many traces the witness is true)      [array] [default: []]
  --hide         space separated list of variable names to hide from the terminal
                 output (does not affect ITF output)       [array] [default: []]
  --seed         random seed to use for non-deterministic choice        [string]
  --verbosity    control how much output is produced (0 to 5)
                                                           [number] [default: 2]
  --mbt          (experimental) whether to produce metadata to be used by
                 model-based testing                  [boolean] [default: false]
  --backend      the backend to use for simulation
                [string] [choices: "typescript", "rust"] [default: "typescript"]
```

 - If there are no critical errors (e.g., in parsing, typechecking, etc.), the
 simulator tries to find the shortest trace that violates the invariant.  If it
 finds one, it prints the trace on the standard output.  If it does not find a
 violating trace, it prints the longest sample trace that the simulator has
 found during the execution. When the parameter `--out` is supplied, the trace
 is written as a JSON representation of Quint IR in the output file. When the
 parameter `--out-itf` is supplied, the traces are written in the [Informal Trace
 Format][]. This output can be conviently displayed with the [ITF Trace
 Viewer][], or just with [jq][].

 - If the specification cannot be run (e.g., due to a parsing error), the file
   contains an error message in JSON:

   ```json
   {
     "stage": "running",
     "errors": [ <errors> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

### The `--mbt` flag
When this flag is given, the Quint simulator will keep track of two additional
variables on the traces it produces:
- `mbt::actionTaken`: The first action executed by the simulator on each step, reset
  at every `any` evaluation. That is, if the spec has nested `any` statements,
  `mbt::actionTaken` will correspond to the action picked in the innermost `any`.
- `mbt::nondetPicks`: A record with all `nondet` values that were picked since the
  last `any` was called (or since the start, if there were no `any` calls in the
  step).

Keep in mind that this is an experimental flag and it is specially subject to
changes in its behavior.

## Command test

```sh
$ quint test --help
quint test <input>

Run tests against a Quint specification

Options:
  --help       Show help                                               [boolean]
  --version    Show version number                                     [boolean]
  --main       name of the main module (by default, computed from filename)
                                                                        [string]
  --out        output file (suppresses all console output)              [string]
  --max-samples  the maximum number of successful runs to try for every
                 randomized test                       [number] [default: 10000]
  --seed       random seed to use for non-deterministic choice          [string]
  --verbosity  control how much output is produced (0 to 5)[number] [default: 2]
  --match      a string or regex that selects names to use as tests     [string]
```

 - If there are no critical errors (e.g., in parsing, typechecking, etc.), the
   command succeeds. The output file contains the parsed and resolved module in
   [Quint IR][] (JSON):

   ```json
   {
     "stage": "testing",
     "passed": [ <names of the successful tests> ],
     "failed": [ <names of the failed tests> ],
     "ignored": [ <names of the ignored tests> ],
     "errors": [ <errors and warnings> ]
   }
   ```

 - If the tests cannot be run (e.g., due to a parsing error), the file contains
   an error message in JSON:

   ```json
   {
     "stage": "testing",
     "errors": [ <errors and warnings> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command verify

```sh
$  quint verify --help
quint verify <input>

Verify a Quint specification via Apalache

Options:
  --help                Show help                                      [boolean]
  --version             Show version number                            [boolean]
  --out                 output file (suppresses all console output)     [string]
  --main                name of the main module (by default, computed from
                        filename)                                       [string]
  --init                name of the initializer action[string] [default: "init"]
  --step                name of the step action       [string] [default: "step"]
  --invariant           the invariants to check, separated by commas (e.g.)
                                                                        [string]
  --temporal            the temporal properties to check, separated by commas
                                                                        [string]
  --out-itf             output the trace in the Informal Trace Format to file
                        (suppresses all console output)                 [string]
  --max-steps           the maximum number of steps in every trace
                                                          [number] [default: 10]
  --random-transitions  choose transitions at random (= use symbolic simulation)
                                                      [boolean] [default: false]
  --apalache-config     path to an additional Apalache configuration file (in
                        JSON)                                           [string]
  --verbosity           control how much output is produced (0 to 5)
                                                           [number] [default: 2]
```

<!-- TODO: Update after https://github.com/informalsystems/quint/issues/701 -->
By default, this command will automatically obtain and run Apalache. The only
prerequisite is a [compatible installation of OpenJDK](https://quint-lang.org/docs/getting-started).

You may also manually obtain and run a distribution of Apalache, following these
steps:

1. Install a distribution of [Apalache](https://apalache-mc.org/docs/apalache/installation/jvm.html).
2. Start the Apalache server `apalache-mc server` and ensure that it is running.

Apalache uses bounded model checking. This technique checks *all runs* up to
`--max-steps` steps via [z3][]. Apalache is highly configurable. See [Apalache
configuration](https://apalache-mc.org/docs/apalache/config.html#apalache-configuration)
for guidance.

- If there are no critical errors (e.g., in parsing, typechecking, etc.), this
command sends the Quint specification to the [Apalache][] model checker, which
will try to find an invariant violation. If it finds one, it prints the trace on
the standard output. When the parameter `--out` is supplied, the trace is
written as a JSON representation of Quint IR in the output file. When the
parameter `--out-itf` is supplied, the trace is written in the [Informal Trace
Format][]. This output can be conveniently displayed with the [ITF Trace
Viewer][], or just with [jq][].

- If the specification cannot be run (e.g., due to a parsing error), the file
contains an error message in JSON:

   ```json
   {
     "stage": "verifying",
     "errors": [ <errors> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command lint

*This command is not implemented yet.*

```sh
quint lint [--config=config.json] [--out=<out>.json] <spec>.qnt
```

This command checks an input specification `<spec>.qnt` against a set of rules.
If no errors or warnings are found, this command outputs nothing.
When errors or warning are found, this command outputs them to `stderr`,
unless the command `--out` is specified.

**Option `--config`**. This parameter specifies a configuration file in the
JSON format. This configuration files specifies linting rules. The exact format
is to be specified in the future.

**Option `--out`**. If the user supplies the flag `--out`, then the
result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the success data structure:

   ```json
   {
     "status": "linted"
   }
   ```

 - If the command fails, the file contains error messages and warnings in JSON:

   ```json
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command indent

*This command is not implemented yet.*

```sh
quint indent [--config=config.json] [--out=<out>.qnt] <spec>.qnt
```

This rule formats the input specification according to the default indentation
rules. Unless the option `--out` is specified, the formatted specification
is written on the standard output.

**Option `--out`**. The optional parameter `--out` specifies the name of
an output file in the Quint format.

**Option `--config`**. This parameter specifies a configuration file in the
JSON format. This configuration files specifies the indentation rules. The
exact format is to be specified in the future.

[ADR002]: ./development-docs/architecture-decision-records/adr002-errors.md
[Working Backwards]: https://www.allthingsdistributed.com/2006/11/working_backwards.html
[Source map]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
[Quint IR]: https://github.com/informalsystems/quint/blob/main/quint/src/ir/quintIr.ts
[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop
[Informal Trace Format]: https://apalache-mc.org/docs/adr/015adr-trace.html
[ITF Trace Viewer]: https://marketplace.visualstudio.com/items?itemName=informal.itf-trace-viewer
[jq]: https://stedolan.github.io/jq/
[z3]: https://github.com/z3prover/z3
[Apalache]: https://apalache-mc.org/
