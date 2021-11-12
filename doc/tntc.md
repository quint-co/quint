# tntc: Transpiler for TNT

| Revision | Date       | Author           |
| -------: | :--------: | :--------------- |
| 2        | 12.11.2021 | Igor Konnov      |

**WARNING**: *This is a preliminary manual in the style of [Working
Backwards]. Nothing of it has been implemented yet.*

`tntc` is a command line interface to the TNT transpiler. It is the primary
access point for testing and integration with other tools.

The main commands of `tntc` are as follows:

 - `parse` parses a TNT specification and resolves names
 - `exec` executes a TNT specification via random simulation
 - `typecheck` infers types in a TNT specification
 - `lint` checks a TNT specification for known deficiencies
 - `indent` indents a TNT specification
 - `to-apalache` translates a TNT specification to Apalache IR

In the following, we give details about the above commands.

## Command parse

```sh
tntc parse [--out=<out>.json] [--source-map=<src>.map] <spec>.tnt
```

This command reads a TNT specification from the file `<spec>.tnt`, parses the
specification and resolves the imports relative to the directory of
`<spec>.tnt`. If the command produces errors, these errors are printed on
`stderr`. If there are no errors, nothing is printed.

**Option `--out`**. If the user supplies the flag `--out`, then the
parsing result is written to the file `<out>.json`. Depending on the outcome,
the following is written:

 - If the command succeeds, the file contains the parsed and resolved module
   in [TNT IR][] (JSON):

   ```
   {
     "status": "resolved",
     "module": <IR>,
     "warnings": [ <warnings> ]
   }
   ```

   The module contents is the JSON representation of [TNT IR][]. The warnings
   are written in the format of [ADR002][].

 - If the command fails, the file contains an error message in JSON:
   
   ```
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

**Option `--source-map`**. If the flag `--source-map` is supplied, the source
information is written to `<src>.map` in the format of [Source map][].

## Command exec

```sh
tntc exec [--seed=<seed>] [--length=<len>] \
  [--timeout=sec] [--check=prop] [--out=<out>.json] <spec>.tnt
```

This command produces a random execution of a TNT specification,
whose name is given with `<spec>.tnt`.

**Option `--seed`**. The optional parameter `--seed` specifies the initial seed
for the random number generator. This is useful for reproducibility of
executions.

**Option `--length`**. The optional parameter `--length` specifies the maximum
length of the execution.

**Option `--timeout`**. The optional parameter `--timeout` specifies the
maximum time (in seconds) to spend on interpretation. Once the time limit has
been reached, the execution stops and outputs whatever it has computed.

**Option `--check`**. The optional parameter `--check` specifies a property (or
multiple comma-separated properties) to be checked against the execution. Note
that the properties are checked against the sole execution. *It is not a
complete verification of the specification properties.*

**Option `--out`**. The optional parameter `--out` specifies the name
of an output file.

The output file is a JSON representation of [TNT IR][] that represents an
execution as a sequence of states `[s_0, s_1, ..., s_n]`. The value `s_0` is a
record that assigns values to specification constants. Values `s_1`, ..., `s_n`
are records that assign values to specification variables.

**Example of the output:**

```json
{
  "id": 1,
  "kind": "app",
  "opcode": "seq",
  "args": [
    {
      "id": 2,
      "kind": "app",
      "opcode": "rec",
      "args": [
        { "id": 3, "kind": "str", "value": "N" },
        { "id": 4, "kind": "int", "value": 10 },
        { "id": 5, "kind": "str", "value": "Proc" },
        {
          "id": 6,
          "kind": "app",
          "opcode": "set",
          "args": [
            { "id": 7, "kind": "str", "value": "P1" },
            { "id": 8, "kind": "str", "value": "P2" }
          ]
        }
      ]
    },
    {
      "id": 9,
      "kind": "app",
      "opcode": "rec",
      "args": [
        { "id": 10, "kind": "str", "value": "x" },
        { "id": 11, "kind": "int", "value": 1 },
      ]
    },  
    {
      "id": 12,
      "kind": "app",
      "opcode": "rec",
      "args": [
        { "id": 13, "kind": "str", "value": "x" },
        { "id": 14, "kind": "int", "value": 3 },
      ]
    }
  ]
}
```

## Command typecheck

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

   ```
   {
     "status": "typed",
     "module": <IR>
   }
   ```

   The module contents is the JSON representation of [TNT IR][].

 - If the command fails, the file contains an error message in JSON:
   
   ```
   {
     "result": "error",
     "messages": [ <errors> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command lint

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

   ```
   {
     "status": "linted"
   }
   ```

 - If the command fails, the file contains error messages and warnings in JSON:
   
   ```
   {
     "result": "error",
     "messages": [ <errors and warnings> ]
   } 
   ```

   The errors and warnings are written in the format of [ADR002][].

## Command indent

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

```sh
tntc to-apalache [--out=<out>.json] <spec>.tnt
```

This command does the full cycle of parsing, resolving names, type checking,
flatting modules, etc. After doing all that, it outputs the module in the
[Apalache JSON] format. Unless the option `--out` is specified, the formatted
specification is written on the standard output.

**Option `--out`**. The optional parameter `--out` specifies the name of
an output file in the [Apalache JSON] format.


[ADR002]: ./adr002-errors.md
[Working Backwards]: https://www.allthingsdistributed.com/2006/11/working_backwards.html
[Source map]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit
[TNT IR]: https://github.com/informalsystems/tnt/blob/main/tnt-parser/src/tntIr.ts
[Apalache JSON]: https://apalache.informal.systems/docs/adr/005adr-json.html
