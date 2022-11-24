# tntc: Transpiler for TNT

| Revision | Date       | Author           |
| -------: | :--------: | :--------------- |
| 5        | 10.11.2022 | Igor Konnov      |

**WARNING**: *This is a preliminary manual in the style of [Working
Backwards]. Some commands are not implemented yet.*

`tntc` is a command line interface to the TNT transpiler. It is the primary
access point for testing and integration with other tools.

The main commands of `tntc` are as follows:

 - `repl` starts the REPL (Read-Eval-Print loop) for TNT
 - `parse` parses a TNT specification and resolves names
 - `typecheck` infers types in a TNT specification
 - `run` executes a TNT specification via random simulation
 - `test` tests a TNT specification similar to property-based testing
 - `lint` checks a TNT specification for known deficiencies
 - `indent` indents a TNT specification
 - `to-apalache` translates a TNT specification to Apalache IR

In the following, we give details about the above commands.

## Installation

See [README](../tntc/README.md).

## Command repl

```sh
tntc repl
```

Starts the [REPL][]: read-evaluate-print loop. REPL is especially useful for
learning the language. See the [repl](./repl.md) for more details.

## Command parse

```sh
tntc parse [--out=<out>.json] [--source-map=<src>.map] <spec>.tnt
```

*Warning: The parser is working, but name resolution is not implemented.*

This command reads a TNT specification from the file `<spec>.tnt`, parses the
specification and resolves the imports relative to the directory of
`<spec>.tnt`. If the command produces errors, these errors are printed on
`stderr`. If there are no errors, nothing is printed.

**Option `--out`**. If the user supplies the flag `--out`, then the
parsing result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the parsed and resolved module
   in [TNT IR][] (JSON):

   ```json
   {
     "status": "resolved",
     "module": <IR>,
     "warnings": [ <warnings> ]
   }
   ```

   The module contents is the JSON representation of [TNT IR][]. The warnings
   are written in the format of [ADR002][].

 - If the command fails, the file contains an error message in JSON:

   ```json
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

**Option `--source-map`**. If the flag `--source-map` is supplied, the source
information is written to `<src>.map` in the format of [Source map][].

*The option `--source-map` is not implemented yet.*

## Command typecheck

*This command is work in progress.*

```sh
tntc typecheck [--out=<out>.json] <spec>.tnt
```

This command infers types in the TNT specification, which is provided in the
input file `<spec>.tnt`. Before doing that, it performs the same steps as the
command `parse`. If the command produces errors, these errors are printed on
`stderr`. If there are no errors, nothing is printed.

**Option `--out`**. If the user supplies the flag `--out`, then the
parsing result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the parsed and resolved module
   in [TNT IR][] (JSON):

   ```json
   {
     "status": "typed",
     "module": <IR>
   }
   ```

   The module contents is the JSON representation of [TNT IR][].

 - If the command fails, the file contains an error message in JSON:

   ```json
   {
     "result": "error",
     "messages": [ <errors> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command run

*This command is not implemented yet.*

```sh
tntc run [--seed=<seed>] [--timeout=sec] [--out=<out>.json] <spec>.tnt <name>
```

This command produces a random execution of a TNT specification,
whose name is given with `<spec>.tnt`. The random execution should follow
the run structure that is given in the definition called `<name>`.

**Option `--seed`**. The optional parameter `--seed` specifies the initial seed
for the random number generator. This is useful for reproducibility of
executions.

**Option `--timeout`**. The optional parameter `--timeout` specifies the
maximum time (in seconds) to spend on interpretation. Once the time limit has
been reached, the execution stops and outputs whatever it has computed.

**Option `--out`**. The optional parameter `--out` specifies the name
of an output file.

 - If there are no critical errors (e.g., in parsing, typechecking, etc.), the
   The output file is a trace in the [Informal Trace Format][].

 - If the specification cannot be run (e.g., due to a parsing error), the file
   contains an error message in JSON:

   ```json
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command test

*This command is not implemented yet.*

```sh
tntc test [--seed=<seed>] \
  [--timeout=sec] [--tests=<test1>,...,<testN>] [--out=<out>.json] <spec>.tnt
```

This command receives a TNT specification whose name is given with
`<spec>.tnt`.  It runs the tests that are specified with the `--tests` option.
If the `--tests` option is not passed, the command runs all tests specified in
the definitions whose names start with `Test`.

**Option `--seed`**. The optional parameter `--seed` specifies the initial seed
for the random number generator. This is useful for reproducibility of
executions.

**Option `--timeout`**. The optional parameter `--timeout` specifies the
maximum time (in seconds) to spend on interpretation. Once the time limit has
been reached, the execution stops and outputs whatever it has computed.

**Option `--tests`**. The optional parameter `--tests` specifies a list of
tests to be run. Note that the properties are checked against the sampled
executions.  *It is not a complete verification of the specification
properties.*

**Option `--out`**. The optional parameter `--out` specifies the name
of an output file.

 - If there are no critical errors (e.g., in parsing, typechecking, etc.), the
   command succeeds. The output file contains the parsed and resolved module in
   [TNT IR][] (JSON):

   ```json
   {
     "status": "tested",
     "tests": {
       "successful": [ <names of the successful tests> ],
       "failed": [ <names of the failed tests> ],
       "ignored": [ <names of the ignored tests> ],
     }
   }
   ```

 - If the tests cannot be run (e.g., due to a parsing error), the file contains
   an error message in JSON:

   ```json
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command lint

*This command is not implemented yet.*

```sh
tntc lint [--config=config.json] [--out=<out>.json] <spec>.tnt
```

This command checks an input specification `<spec>.tnt` against a set of rules.
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
tntc indent [--config=config.json] [--out=<out>.tnt] <spec>.tnt
```

This rule formats the input specification according to the default indentation
rules. Unless the option `--out` is specified, the formatted specification
is written on the standard output.

**Option `--out`**. The optional parameter `--out` specifies the name of
an output file in the TNT format.

**Option `--config`**. This parameter specifies a configuration file in the
JSON format. This configuration files specifies the indentation rules. The
exact format is to be specified in the future.

## Command to-apalache

*This command is not implemented yet.*

```sh
tntc to-apalache [--out=<out>.json] <spec>.tnt
```

This command does the full cycle of parsing, resolving names, type checking,
flattening modules, etc. After doing all that, it outputs the module in the
[Apalache JSON][] format. Unless the option `--out` is specified, the formatted
specification is written on the standard output.

**Option `--out`**. The optional parameter `--out` specifies the name of
an output file in the [Apalache JSON] format.


[ADR002]: ./adr002-errors.md
[Working Backwards]: https://www.allthingsdistributed.com/2006/11/working_backwards.html
[Source map]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
[TNT IR]: https://github.com/informalsystems/tnt/blob/main/tntc/src/tntIr.ts
[Apalache JSON]: https://apalache.informal.systems/docs/adr/005adr-json.html
[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop
[Informal Trace Format]: https://apalache.informal.systems/docs/adr/015adr-trace.html
