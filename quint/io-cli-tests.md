
This is a suite of blackbox integration tests for the `quint` executable.
The tests in this file check that particular output is produced when
particular input is received.

These tests require [`txm`](https://www.npmjs.com/package/txm) to be installed:

```sh
npm install -g txm
```

All of the test inputs in the following test cases are commands executed by `bash`.

<!-- !test program
bash -
-->

## Error output

### User error on parse with non-existent file

Regression test for [#215](https://github.com/informalsystems/quint/issues/215).
We want to ensure we do not throw uncaught exceptions when the input file is
doesn't exist.

<!-- !test in non-existent file -->
    quint parse ../examples/non-existent.file

<!-- !test exit 1 -->
<!-- !test err non-existent file -->
    error: file ../examples/non-existent.file does not exist

### User error on parse with junk after modules

Regression test for [#585](https://github.com/informalsystems/quint/issues/585)
We want to ensure that the parser shows an error, when it detects junk in
the end of file.

<!-- !test in junk -->
    quint parse ./testFixture/modulesAndJunk.qnt 2>&1 | sed 's#.*quint/\(testFixture\)#Q/\1#g'

<!-- !test out junk -->
    Q/testFixture/modulesAndJunk.qnt:9:1 - error: extraneous input 'the' expecting {<EOF>, 'module'}
    9: the parser
       ^^^

    error: parsing failed

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
./testFixture/_1011nameOutOfScope.qnt:5:11 - error: Failed to resolve name x in definition for A, in module nameOutOfScope
5:   val A = x + 1
             ^

error: parsing failed
```

## Use of the `--out` flag

### Module AST is written to `--out` with parse command

<!-- !test in module AST is output -->
```
quint parse --out parse-out-example.json ../examples/language-features/tuples.qnt
cat parse-out-example.json | jq '.modules[0].name'
rm parse-out-example.json
```

<!-- !test out module AST is output -->
```
"Tuples"
```

### Type and effect maps are output to `--out` with typecheck command

<!-- !test in type and effect maps are output -->
```
quint typecheck --out typecheck-out-example.json ../examples/language-features/tuples.qnt > /dev/null
printf "first type: " && cat typecheck-out-example.json | jq '.types."7".type.kind'
printf "first effect: " && cat typecheck-out-example.json | jq '.effects."8".effect.kind'
rm typecheck-out-example.json
```

<!-- !test out type and effect maps are output -->
```
first type: "tup"
first effect: "concrete"
```

### typecheck failure exits with 1 and prints type errors

<!-- !test exit 1 -->
<!-- !test in typecheck failure gives non-zero exit -->
```
quint typecheck ./testFixture/TrivialTypeError.qnt 2> >(sed "s:$(pwd):.:" >&2)
```

<!-- !test err typecheck failure gives non-zero exit -->
```
./testFixture/TrivialTypeError.qnt:2:3 - error: [QNT000] Couldn't unify str and int
Trying to unify str and int

2:   val x : int = "not an int"
     ^^^^^^^^^^^^^^^^^^^^^^^^^^

error: typechecking failed
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

### typecheck finds error on incorrect instance overrides

<!-- !test exit 1 -->
<!-- !test in typecheck failure on override -->
```
quint typecheck ./testFixture/typechecking/OverrideErrors.qnt 2> >(sed "s:$(pwd):.:" >&2)
```

<!-- !test err typecheck failure on override -->
```
./testFixture/typechecking/OverrideErrors.qnt:8:16 - error: [QNT000] Couldn't unify bool and int
Trying to unify bool and int

8:   import A(c = 1) as A1
                  ^

./testFixture/typechecking/OverrideErrors.qnt:9:16 - error: [QNT201] Instance overrides must be pure, but the value for c reads variables 'x'
9:   import A(c = x) as A2
                  ^

error: typechecking failed
```

## Use of the `--required` flag

### Repl loads a file with -r

<!-- !test in repl loads a file -->
```
echo "import counters.*" | quint -r ../examples/language-features/counters.qnt 2>&1 | tail -n +3
```

<!-- !test out repl loads a file -->
```
true
>>> 
>>> 
```

### Repl loads a file and a module with -r

<!-- !test in repl loads a file and a module -->
```
echo "Init" | quint -r ../examples/language-features/counters.qnt::counters 2>&1 | tail -n +3
```

<!-- !test out repl loads a file and a module -->
```
true

>>> true
>>> 
```

### Repl loads a file with .load

<!-- !test in repl loads a file with .load -->
```
echo ".load ../examples/language-features/counters.qnt counters" \
  | quint 2>&1 | tail -n +3
```

<!-- !test out repl loads a file with .load -->
```
>>> true

>>> >>> 
```

### Repl saves a file with .save and loads it back

<!-- !test in repl saves a file with .save and loads it back -->
```
echo ".save tmp-counters.qnt" \
  | quint -r ../examples/language-features/counters.qnt::counters 2>&1 \
  | tail -n +3
# do not auto-import counters, as it is imported already
echo "Init" \
  | quint -r tmp-counters.qnt 2>&1 \
  | tail -n +3
rm tmp-counters.qnt
```

<!-- !test out repl saves a file with .save and loads it back -->
```
true

>>> Session saved to: tmp-counters.qnt
>>> >>> 
true
>>> true
>>> 
```

### Tests works as expected

The command `test` finds failing tests and prints error messages.

<!-- !test exit 1 -->
<!-- !test in test runs -->
```
quint test --main counters --seed 1 \
  ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out test runs -->
```

  counters
    ok passingTest
    1) failingTest

  1 passing (duration)
  1 failed
  1 ignored

  1) failingTest:
      HOME/counters.qnt:84:9 - error: Assertion failed
      84:         assert(n == 0),


  Use --verbosity=3 to show executions.
```

### test counters produces no execution

`test` should handle the special case of when an execution has not been
recorded yet.

<!-- !test exit 1 -->
<!-- !test in test empty trace -->
```
quint test --seed 1 --verbosity=3 \
  ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out test empty trace -->
```

  counters
    ok passingTest
    1) failingTest

  1 passing (duration)
  1 failed
  1 ignored

  1) failingTest:
      HOME/counters.qnt:84:9 - error: Assertion failed
      84:         assert(n == 0),

    [Frame 0]
    Init() => true


```

### Run finds an invariant violation

The command `run` finds an invariant violation.

<!-- !test in run finds violation -->
```
quint run --init=Init --step=Next --seed=abcde --max-steps=4 \
  --invariant='n < 10' ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out run finds violation -->
```
An example execution:

[State 0]
 n: 1
────────────────────────────────────────────────────────────────────────────────

[State 1]
 n: 2
────────────────────────────────────────────────────────────────────────────────

[State 2]
 n: 3
────────────────────────────────────────────────────────────────────────────────

[State 3]
 n: 6
────────────────────────────────────────────────────────────────────────────────

[State 4]
 n: 12
────────────────────────────────────────────────────────────────────────────────

[violation] Found an issue (duration).
Use --verbosity to produce more (or less) output.
```

### Run finds an example

The command `run` finds an example.

<!-- !test in run finds example -->
```
quint run --init=Init --step=Next --seed=abcde --max-steps=4 \
  --invariant='n < 100' ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out run finds example -->
```
An example execution:

[State 0]
 n: 1
────────────────────────────────────────────────────────────────────────────────

[State 1]
 n: 2
────────────────────────────────────────────────────────────────────────────────

[State 2]
 n: 3
────────────────────────────────────────────────────────────────────────────────

[State 3]
 n: 4
────────────────────────────────────────────────────────────────────────────────

[State 4]
 n: 2
────────────────────────────────────────────────────────────────────────────────

[ok] No violation found (duration).
You may increase --max-samples and --max-steps.
Use --verbosity to produce more (or less) output.
```

### Repl evaluates coin

This is a regression test for #648.

<!-- !test in repl evaluates coin -->
```
cat <<EOF \
  | quint -r ../examples/solidity/Coin/coin.qnt::coin 2>&1 \
  | tail -n +3
init
balances
EOF
```

<!-- !test out repl evaluates coin -->
```
true

>>> true
>>> Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0)
>>> 
```

### Run finds an overflow in Coin

The command `run` finds an overflow in Coin.

<!-- !test in run finds overflow -->
```
quint run --max-steps=5 --seed=12 --invariant=totalSupplyDoesNotOverflowInv \
  ../examples/solidity/Coin/coin.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/coin.qnt#g'
```

<!-- !test out run finds overflow -->
```
An example execution:

[State 0]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0)
────────────────────────────────────────────────────────────────────────────────

[State 1]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 79724149679233970751606042021871459804676944172294020221997378231441129734144)
────────────────────────────────────────────────────────────────────────────────

[State 2]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 112817691068065462651698786821247929788486899638158978042098855089169166761984, "eve" -> 0, "null" -> 79724149679233970751606042021871459804676944172294020221997378231441129734144)
────────────────────────────────────────────────────────────────────────────────

[violation] Found an issue (duration).
Use --verbosity to produce more (or less) output.
```

### Run shows the operator calls

The command `run` finds an overflow in Coin and shows the operator calls.

<!-- !test in run shows calls -->
```
quint run --max-steps=5 --seed=12 --invariant=totalSupplyDoesNotOverflowInv \
  --verbosity=3 \
  ../examples/solidity/Coin/coin.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*coin.qnt#      HOME/coin.qnt#g'
```

<!-- !test out run shows calls -->
```
An example execution:

[Frame 0]
 q::initAndInvariant() => true
 ├─ q::init() => true
 │  └─ init() => true
 └─ isUInt(0) => true

[State 0]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0)
────────────────────────────────────────────────────────────────────────────────

[Frame 1]
 q::stepAndInvariant() => true
 ├─ q::step() => true
 │  └─ step() => true
 │     └─ mint("null", "null", 79724149679233970751606042021871459804676944172294020221997378231441129734144) => true
 │        ├─ require(true) => true
 │        └─ require(true) => true
 │           └─ isUInt(79724149679233970751606042021871459804676944172294020221997378231441129734144) => true
 └─ isUInt(79724149679233970751606042021871459804676944172294020221997378231441129734144) => true

[State 1]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 79724149679233970751606042021871459804676944172294020221997378231441129734144)
────────────────────────────────────────────────────────────────────────────────

[Frame 2]
 q::stepAndInvariant() => true
 ├─ q::step() => true
 │  └─ step() => true
 │     └─ mint("null", "charlie", 112817691068065462651698786821247929788486899638158978042098855089169166761984) => true
 │        ├─ require(true) => true
 │        └─ require(true) => true
 │           └─ isUInt(112817691068065462651698786821247929788486899638158978042098855089169166761984) => true
 └─ isUInt(192541840747299433403304828843119389593163843810452998264096233320610296496128) => false

[State 2]
 minter: "null"
 balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 112817691068065462651698786821247929788486899638158978042098855089169166761984, "eve" -> 0, "null" -> 79724149679233970751606042021871459804676944172294020221997378231441129734144)
────────────────────────────────────────────────────────────────────────────────

[violation] Found an issue (duration).
Use --verbosity to produce more (or less) output.
```

### Run outputs ITF

<!-- !test in run itf -->
```
quint run --out-itf=out-itf-example.itf.json --max-steps=5 --seed=123 \
  --invariant=totalSupplyDoesNotOverflowInv \
  ../examples/solidity/Coin/coin.qnt
cat out-itf-example.itf.json | jq '.states[0]."balances"."#map"[0]'
rm out-itf-example.itf.json
```

<!-- !test out run itf -->
```
[
  "alice",
  0
]
```

### OK REPL tutorial

The REPL tutorial is reproducible in REPL.

<!-- !test check REPL tutorial -->
```
quint -q -r \
  ../tutorials/repl/kettle.qnt::kettle <../tutorials/repl/replTestIn.txt \
    | diff - ../tutorials/repl/replTestOut.txt
```

### test --verbosity=3 outputs a trace

<!-- !test exit 1 -->
<!-- !test in verbose test -->
```
quint test --seed=3 --verbosity=3 ../examples/solidity/Coin/coin.qnt | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*coin.qnt#      HOME/coin.qnt#g'
```

<!-- !test out verbose test -->
```

  coin
    ok sendWithoutMintTest
    ok mintSendTest
    1) mintTwiceThenSendTest

  2 passing (duration)
  1 failed

  1) mintTwiceThenSendTest:
      HOME/coin.qnt:176:5 - error: mintTwiceThenSendTest returns false
      176:     run mintTwiceThenSendTest = {

    [Frame 0]
    init() => true

    [Frame 1]
    mint("bob", "eve", 56121584374285688102497324576666468201644004471271061085874530776005052727296) => true
    ├─ require(true) => true
    └─ require(true) => true
       └─ isUInt(56121584374285688102497324576666468201644004471271061085874530776005052727296) => true

    [Frame 2]
    mint("bob", "bob", 91422284371118026738799750509327856254566108764693012790426204149329833230336) => true
    ├─ require(true) => true
    └─ require(true) => true
       └─ isUInt(91422284371118026738799750509327856254566108764693012790426204149329833230336) => true

    [Frame 3]
    send("eve", "bob", 33099102730177003576396430532542752743476829614253756677426469153216965640192) => false
    ├─ require(true) => true
    ├─ require(true) => true
    │  └─ isUInt(23022481644108684526100894044123715458167174857017304408448061622788087087104) => true
    └─ require(false) => false
       └─ isUInt(124521387101295030315196181041870608998042938378946769467852673302546798870528) => false


```
