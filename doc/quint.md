# quint: Tool for the Quint specification language

| Revision | Date       | Author                  |
|---------:|:----------:|:------------------------|
|        7 | 2023-02-23 | Igor Konnov, Shon Feder |

**WARNING**: *This is a preliminary manual in the style of [Working
Backwards]. Some commands are not implemented yet.*

`quint` is a command line interface tool for working with the [Quint
specification language](./lang.md). It is the primary access point for testing
and integration with other tools.

The main commands of `quint` are as follows:

 - [x] `repl` starts the REPL (Read-Eval-Print loop) for Quint
 - [x] `parse` parses a Quint specification and resolves names
 - [x] `typecheck` infers types in a Quint specification
 - [x] `run` executes a Quint specification via random simulation
        similar to stateful property-based testing
 - [x] `test` runs unit tests against a Quint specification
 - [ ] `to-apalache` translates a Quint specification to Apalache IR
 - [ ] `docs` produces documentation
 - [ ] `lint` checks a Quint specification for known deficiencies
 - [ ] `indent` indents a Quint specification

In the following, we give details about the above commands.

## Installation

See [README](../quint/README.md).

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
```

```sh
quint repl
```

The REPL is especially useful for learning the language. See the
[repl](./repl.md) documentation for more details.

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
  --with-lookup  add the lookup table to the output file (see --out)   [boolean]
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
  --main         name of the main module (by default, computed from filename)
                                                                        [string]
  --out          output file (suppresses all console output)            [string]
  --out-itf      output the trace in the Informal Trace Format to file
                 (supresses all console output)                         [string]
  --max-samples  the maximum on the number of traces to try
                                                       [number] [default: 10000]
  --max-steps    the maximum on the number of steps in every trace
                                                          [number] [default: 20]
  --init         name of the initializer action       [string] [default: "init"]
  --step         name of the step action              [string] [default: "step"]
  --invariant    invariant to check: a definition name or an expression
                                                    [string] [default: ["true"]]
  --seed         random seed to use for non-deterministic choice        [string]
```

 - If there are no critical errors (e.g., in parsing, typechecking, etc.),
   the trace is currently written as a serialized Quint expression.
   In the future, the trace will be written in the [Informal Trace Format][].
   See the [issue #277](https://github.com/informalsystems/quint/issues/277).

 - If the specification cannot be run (e.g., due to a parsing error), the file
   contains an error message in JSON:

   ```json
   {
     "stage": "running",
     "errors": [ <errors> ]
   }
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command test

```sh
$ quint test --help
quint test <input>

Run tests against a Quint specification

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --main     name of the main module (by default, computed from filename)
                                                                        [string]
  --out      output file (suppresses all console output)                [string]
  --seed     random seed to use for non-deterministic choice            [string]
  --match    a string or regex that selects names to use as tests       [string]
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

[ADR002]: ./adr002-errors.md
[Working Backwards]: https://www.allthingsdistributed.com/2006/11/working_backwards.html
[Source map]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
[Quint IR]: https://github.com/informalsystems/quint/blob/main/quint/src/quintIr.ts
[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop
[Informal Trace Format]: https://apalache.informal.systems/docs/adr/015adr-trace.html
