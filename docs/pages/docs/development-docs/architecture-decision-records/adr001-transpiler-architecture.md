# ADR 001: Quint Transpiler Architecture

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 02.11.2021 | Igor Konnov      |

This document describes a preliminary architecture of the Quint transpiler.  As a
rule, we are using a data-flow approach to parsing, in contrast to the pipeline
approach, which can be found in textbooks. Our main assumption is that external
contributors should be able to plug-in their code/passes to our pipeline.
Hence, we have to be very careful when defining our assumptions about the
input and output of every pass.

The use cases of this architecture are as follows:

 1. A transpiler from Quint to Apalache IR (TLA+).

 1. A VSCode plugin that enables fast feedback about syntax, types, etc.

 1. An LSP server that could be used with other text editors (vim, emacs).

 1. Custom linters and translators by external contributors. For instance, to
 translate Quint to a programming language, in order to write a simulator.


<a name="TranspilerContext"></a>

## 1. Transpiler context

Our transpiler maintains its progress in a data structure that we call the
*transpiler context*. This context may be queried and updated by *tasks*
that perform smaller translation jobs. When the transpiler is run with a module
named `MyModule` at its input, the initial transpiler context looks as follows:

```js
{
  "root": "MyModule",
  "units": {
    "MyModule": {
      "status": "external",
      "name": "MyModule",
      "unresolvedErrors": [ error1 ]
    }
  },
  "nextId": 1i,
  "warnings": []
}
```

In the above data structure:

 - The name of the `root` module is set to `"MyModule"`,
 - The `units` contain the only unit for `"MyModule"`, which is not resolved,
 - The sequence number for IR identifiers is set to 1, and
 - There are no warnings.

In the following, we refer to the transpiler context by the name `context`.

As the transpiler is running, it is updating the dictionary `units` with one
entry per file that is being processed. In general, the parser does not have to
load modules from files. Hence, we call this data structure `units` and not
`files`.  For example, once the text of `"MyModule"` has been loaded, e.g., by
reading it from a text file, `context` looks like follows:

```js
{
  "root": "MyModule",
  "units": {
    "MyModule": {
      "status": "loaded",
      "text": "..."
    }
  },
  "nextId": 1i
}
```

A complex specification may require the transpiler to process several logical
units, for example, when the root module imports definitions from another
module, which, in turn, imports definitions from a third module. The order
of processing these logical units is defined by the [task list](#TaskList).

<a name="TaskList"></a>

## 2. Task List and Task Scheduler

The task list maintains the list of smaller transpiling jobs (tasks) to be
performed, in order to completely parse a Quint specification and turn it into a
TLA+ specification. Normally, tasks are added in the head of the list and
consumed from the head. In some cases, a task may be returned back to the list,
e.g., when name resolution requires loading another unit. Initially, the
task list contains only one entry:

```js
[ {
  "task": "load",
  "name": "MyModule"
  }]
```

The only task to be executed is hence the task to load the text of the module
`"MyModule"`.

In the following, we refer to the task list as `taskList`.  The task list is
maintained by the *task scheduler*. The task scheduler defines the tasks that
have to be executed. By overloading the task scheduler, the user may inject
their own tasks in the task queue.

In the above example, after the `"load"` task has been executed, it may
return one of the two results:

 1. An error, e.g.:

    ```js
    {
      "result": "error",
      "messages": [ { "explanation": "QNT404: Module MyModule not found", ...} ]
    }
    ```

 1. A success, e.g.:

    ```js
    { "result": "OK" }
    ```

When an error is returned, the task scheduler stops processing and returns the
error. In case of success, the task scheduler adds another task to the list:

```js
[ {
  "task": "parse",
  "name": "MyModule"
  }]
```

<a name="Tasks"></a>

## 3. Tasks

We define a minimal set of tasks that are required for transpiling a Quint
specification into a TLA+ specification. As discussed in [Task
List](#TaskList), it should be possible for the contributors to write their own
task scheduler, in order to inject their own tasks.

The list of tasks is as follows:

 1. Loading a unit, e.g., from a file:

    ```js
    { "task": "load", "name": "<module name>" }
    ```

 1. Parsing a loaded unit:

    ```js
    { "task": "parse", "name": "<module name>" }
    ```

 1. Resolving names in a parsed unit:

    ```js
    { "task": "resolve", "name": "<module name>" }
    ```

 1. Inferring types in a module:

    ```js
    { "task": "typecheck" }
    ```

 1. Flattening all modules and instances into a single root module:

    ```js
    { "task": "flatten" }
    ```

 1. Translating to Apalache IR (in the JSON format):

    ```js
    { "task": "toApalache" }
    ```

In the above text, we did not specify the functions that are handling the
tasks. We provide a default implementation for task handlers, which can be
redefined by the user.

### 3.1. Load

Load a Quint specification into a string.

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  {
    "status": "external",
    "name": "<module name>",
    "unresolvedErrors": [ error1, ... ]
  }
  ```

**Postcondition:** `context.units` contains an entry for `task.name`
of the form:

```js
  {
    "status": "loaded",
    "text": "..."
  }
```

Its field `text` contains the text of the loaded unit. The result is `{
"result": "OK" }`.

**Errors:** If the unit cannot be loaded, e.g., the file does not exist,
the result is `{ "result": "error", "messages": errors }`, where `errors`
equals to `unresolvedErrors` of `context.units[task.name]`.

The "load" task loads the text of the unit. The details are
implementation-dependent. For example, the CLI version loads the text from a
text file called `${task.name}.qnt` in the current working directory.  The
VScode plugin may do it differently.

### 3.2. Parse

Parse a Quint specification from a string.

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  { "status": "loaded", "text": "..." }
  ```

**Postcondition:** If the Quint grammar accepts the `task.text`, then
`context.units[task.name]` equals to:

```js
  {
    "status": "parsed",
    "module": IR
  }
```

`IR` is the IR representation of the parsed module. The result is `{ "result":
"OK" }`.

**Errors:** If there is a parse error, the result is `{ "result": "error",
"messages": [...] }`. See [Errors][].

The parser does two things:

 1. The parser checks, whether the string is a syntactically correct sentence
 that represents a Quint module. If it is not, the parser returns at least one
 error.

 1. The parser translates the ANTLR-specific abstract syntax tree into Quint IR.

The parser does not do any name resolution. It simply parses a string and
produces a module in Quint IR. Expressions in the module may refer to undeclared
names. The module may contain imports from the modules that are defined outside
of the parsed module.

### 3.3. Resolve

Resolve names in a module represented with Quint IR.

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  {
    "status": "parsed",
    "module": IR,
    "unresolvedErrors": errors
  }
  ```

**Postcondition:** If all used names are defined and all imports can be resolved with
the units in `context.units`, then `context.units[task.name]` equals to:

```js
  { "status": "resolved", "module": IR }
```

**Errors:** Several error results are possible:

 1. If the module refers to a name that has been neither defined, nor imported,
    e.g., an operator name, then the result equals to `{ "result":
    "error", "messages": [ error ] }`. The field error is of the form (see
    [Errors][]):

    ```js
    {
        "explanation": "QNT405: name ...  not found",
        ...
    }
    ```

 1. If the module imports another module that is not present in
    `context.units`, then the result equals to:

    ```js
    {
      "result": "lookup",
      "messages": [{
        "explanation": "QNT404: Module <name> not found",
        ...
      }]
    }
    ```

    In this case, the task scheduler is expected to schedule a "load" task
    for the unresolved module and keep the failed "resolve" task in the list.


### 3.4. Typecheck

Infer types in the Quint IR.

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  { "status": "resolved", "module": IR }
  ```

**Postcondition:** If types of all definitions and expressions are
well-defined, then `context.units[task.name]` equals to:

```js
  { "status": "typed", "module": IR }
```

**Errors:** If there is a type error, the result is `{ "result": "error",
"messages": [...] }`. See [Errors][].

As a result, all definitions and expressions in the `IR` carry a type.
Note that type inference may modify the original IR in place, that is,
without copying all data structures.

### 3.5. Flatten

Flatten the module structure in the root module and instantiate all modules.

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  { "status": "typed", "module": IR }
  ```

**Postcondition:** This task embeds in the root module all definitions from
imported modules, as well as the definitions that are transitively used by
those definitions. All names that are imported from the modules different from
the root module are fully qualified, that is, they are prepended with the full
path from the root module to the module, where the name is defined, e.g.,
`Mod1.Mod2.foo`. The result equals to:

```js
  { "status": "flat", "module": IR }
```

**Errors:** In case of an instantiation error, the result is (see [Errors][]):

```js
  {
    "result": "error",
    "messages": [{
      "explanation": "QNT406: ...",
    }] }
```

Note that other units that are present in `context.units` are not removed from
the context. This is required for incremental updates of the modules, e.g., in
the VScode plugin.

### 3.6. ToApalache

Translate the IR of the root module to the [Apalache JSON][].

**Precondition:** `context.units[task.name]` is of the form:

  ```js
  { "status": "flat", "module": IR }
  ```

**Postcondition:** This task extends the record for the root module with the
field `apalacheJson`:

  ```js
    {
      "status": "exported",
      "module": IR,
      "apalacheJson": { ... }
    }
  ```

**Errors:** If the transpiler does not support a specific language feature,
it may emit an error, see [Errors][].


[Errors]: ./adr002-errors
[Apalache JSON]: https://apalache-mc.org/docs/adr/005adr-json.html
