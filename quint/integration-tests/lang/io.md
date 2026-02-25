# Language integration tests (IO)

Tests for parsing, typechecking, and compiling Quint specifications that verify
specific output. These tests use pipes, `sed`, `jq`, and output redirection, so
they are not compatible with Windows (CRLF line ending issues).

This script requires [`txm`](https://www.npmjs.com/package/txm):

```sh
npm install -g txm
```

<!-- !test program
bash -
-->

### User error on parse with non-existent file

Regression test for [#215](https://github.com/informalsystems/quint/issues/215).
We want to ensure we do not throw uncaught exceptions when the input file is
doesn't exist.

<!-- !test in non-existent file -->
```
quint parse ../examples/non-existent.file
```

<!-- !test exit 1 -->
<!-- !test err non-existent file -->
```
error: file ../examples/non-existent.file does not exist
```

### User error on parse with junk after modules

Regression test for [#585](https://github.com/informalsystems/quint/issues/585)
We want to ensure that the parser shows an error, when it detects junk in
the end of file.

<!-- !test in junk -->
```
quint parse ./testFixture/modulesAndJunk.qnt 2>&1 | sed 's#.*quint/\(testFixture\)#Q/\1#g'
```

<!-- !test out junk -->
```

 Error [QNT000]: extraneous input 'the' expecting {<EOF>, 'module', DOCCOMMENT}

Q/testFixture/modulesAndJunk.qnt:9:1
  9: the parser
     ^^^

error: parsing failed
```

### User error on parse with invalid input

Running the parse command with an invalid input will return a non-zero exit code
and print the errors encountered.

NOTE: We use `sed` here to strip off the current working directory from the
error output, so that the test is consistent across different environments. The
redirects allow us to filter stderr instead of stdout.

<!-- !test in parsing invalid file -->
    quint parse ./testFixture/_1011nameOutOfScope.qnt 2> >(sed "s:$(pwd):.:" >&2)


<!-- !test exit 1 -->
<!-- !test err parsing invalid file -->
```

 Error [QNT404]: Name 'x' not found

  at ./testFixture/_1011nameOutOfScope.qnt:5:11
  5:   val A = x + 1
               ^

error: parsing failed
```

## Use of the `--out` flag

### Module AST and lookup table is written to `--out` with parse command

<!-- !test in module AST is output -->
```
quint parse --out parse-out-example.json ../examples/language-features/tuples.qnt
jq '.modules[0].name, .table."7".id' < parse-out-example.json
rm parse-out-example.json
```

`"tuples"` is the name of the module given in the IR and 5 is the reference for
in the lookup table for the expression with ID 7:

<!-- !test out module AST is output -->
```
"tuples"
5
```

### Type and effect maps are output to `--out` with typecheck command

<!-- !test in type and effect maps are output -->
```
quint typecheck --out typecheck-out-example.json ../examples/language-features/tuples.qnt
printf "first type: " && cat typecheck-out-example.json | jq '.types."7".type.kind'
printf "first effect: " && cat typecheck-out-example.json | jq '.effects."8".effect.kind'
rm typecheck-out-example.json
```

<!-- !test out type and effect maps are output -->
```
first type: "tup"
first effect: "concrete"
```


### No error output on stdout when typechecking fails with `--out`

We expect NO output on stderr or stdout when the command is run with the `--out` flag.

`txm` doesn't support checking for no output, and an empty code block is read as
containing a single `\n` character. We workaround this by echoing out a newline
into both stderr and stdout.

<!-- !test in typecheck failure quiet with out flag -->
```
quint typecheck --out test-out.json ./testFixture/TrivialTypeError.qnt ; ret=$?; rm ./test-out.json && echo | tee >(cat >&2) && exit $ret
```

<!-- !test exit 1 -->
<!-- !test out typecheck failure quiet with out flag -->
```
```

<!-- !test err typecheck failure quiet with out flag -->
```
```

## typecheck failure exits with 1 and prints type errors

<!-- !test exit 1 -->
<!-- !test in typecheck failure gives non-zero exit -->
```
quint typecheck ./testFixture/TrivialTypeError.qnt 2> >(sed "s:$(pwd):.:" >&2)
```

<!-- !test err typecheck failure gives non-zero exit -->
```

 Error [QNT000]: Couldn't unify str and int
Trying to unify str and int


  at ./testFixture/TrivialTypeError.qnt:2:7
  2:   val x : int = "not an int"
           ^

error: typechecking failed
```


## typecheck finds error on incorrect instance overrides

<!-- !test exit 1 -->
<!-- !test in typecheck failure on override -->
```
quint typecheck ./testFixture/typechecking/OverrideErrors.qnt 2> >(sed "s:$(pwd):.:" >&2)
```

<!-- !test err typecheck failure on override -->
```

 Error [QNT000]: Couldn't unify bool and int
Trying to unify bool and int


  at ./testFixture/typechecking/OverrideErrors.qnt:8:16
  8:   import A(c = 1) as A1
                    ^


 Error [QNT201]: Instance overrides must be pure, but the value for c reads variables 'x'

  at ./testFixture/typechecking/OverrideErrors.qnt:9:16
  9:   import A(c = x) as A2
                    ^

error: typechecking failed
```

## The `compile` command

### Reports in error for invalid `--target`

We pipe stderr to `tail` here. Following https://stackoverflow.com/a/52575213/1187277
This is a clean CLI interface error, but we don't want to put the entire output
in the test, lest it require fiddling when unrelated things are updated.

<!-- !test exit 1 -->
<!-- !test in compile to invalid target -->
```
quint compile --target invalidTarget ../examples/language-features/booleans.qnt 2> >(tail -1 >&2)
```

<!-- !test err compile to invalid target -->
```
  Argument: target, Given: "invalidTarget", Choices: "tlaplus", "json"
```


### Can compile `booleans.qnt` to JSON

<!-- !test in compile booleans.qnt to json -->
```
quint compile --target json ../examples/language-features/booleans.qnt  | jq '.main, .modules[0].name'
```

<!-- !test out compile booleans.qnt to json -->
```
"booleans"
"booleans"
```

### Flattens modules on compile with `--flatten`

<!-- !test in compile flatten=true -->
```
quint compile --target json --flatten ../examples/language-features/instances.qnt  | jq '.table | length'
```

<!-- !test out compile flatten=true -->
```
51
```

### Does not flatten modules on compile with `--flatten=false`

<!-- !test in compile flatten=false -->
```
quint compile --target json --flatten=false ../examples/language-features/instances.qnt  | jq '.table | length'
```

<!-- !test out compile flatten=false -->
```
39
```

### Errors are reported in the right file

File `ImportFileWithError.qnt` has no error, but it imports a module from file `FileWithError.qnt`, which has a type error. The error should be reported only in `FileWithError.qnt`.

<!-- !test in error for file -->
```
quint typecheck ./testFixture/typechecking/ImportFileWithError.qnt 2>&1 | sed 's#.*quint/\(testFixture\)#HOME/\1#g'
```

<!-- !test out error for file -->
```

 Error [QNT000]: Couldn't unify bool and int
Trying to unify bool and int


HOME/testFixture/typechecking/FileWithError.qnt:2:7
  2:   val a: int = true
           ^

error: typechecking failed
```

### FAIL on parsing filenames with different casing

<!-- !test exit 1 -->
<!-- !test in parse case sensitive filenames -->
```
output=$(quint parse testFixture/_1060case.qnt 2>&1)
exit_code=$?
# assuming that our test setup does not introduce spaces in filenames
echo "$output" | sed -e 's#[^ ]*/\([^/]*\).qnt#      HOME/\1.qnt#g'
exit $exit_code
```

<!-- !test out parse case sensitive filenames -->
```

 Error [QNT408]: Importing two files that only differ in case:       HOME/_1022importee2.qnt vs.       HOME/_1022IMPORTEE2.qnt. Choose one way.

  at       HOME/_1060case.qnt:3:3
  3:   import importee2 as I from "_1022IMPORTEE2"
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


 Error [QNT405]: Module 'importee2' not found

  at       HOME/_1060case.qnt:2:3
  2:   import importee2 as i from "_1022importee2"
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


 Error [QNT405]: Module 'importee2' not found

  at       HOME/_1060case.qnt:3:3
  3:   import importee2 as I from "_1022IMPORTEE2"
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

error: parsing failed
```

### Error when --n-traces is greater than --max-samples

<!-- !test in n-traces greater than max-samples -->
```sh
quint run ./examples/language-features/counters.qnt --n-traces 10 --max-samples 5 --backend=rust
```

<!-- !test exit 1 -->
<!-- !test err n-traces greater than max-samples -->
```text
--n-traces (10) cannot be greater than --max-samples (5).
```

<!-- !test in n-traces greater than default max-samples -->
```sh
quint run ./examples/language-features/counters.qnt --n-traces 20000 --backend=rust
```

<!-- !test exit 1 -->
<!-- !test err n-traces greater than default max-samples -->
```text
--n-traces (20000) cannot be greater than --max-samples (10000).
```

### Error when non-array options are set more than once

<!-- !test in non-array options set more than once -->
```sh
quint run ./examples/language-features/counters.qnt --max-steps 10 --max-steps 15 --backend=rust
```

<!-- !test exit 1 -->
<!-- !test err non-array options set more than once -->
```text
--max-steps can not be specified more than once
```
