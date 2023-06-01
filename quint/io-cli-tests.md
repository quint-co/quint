
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
    Q/testFixture/modulesAndJunk.qnt:9:1 - error: extraneous input 'the' expecting {<EOF>, 'module', DOCCOMMENT}
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

### Module AST and lookup table is written to `--out` with parse command

<!-- !test in module AST is output -->
```
quint parse --out parse-out-example.json ../examples/language-features/tuples.qnt
jq '.modules[0].name, .table."7".reference' < parse-out-example.json
rm parse-out-example.json
```

`"Tuples"` is the name of the module given in the IR and 5 is the reference for
in the lookup table for the expression with ID 7:

<!-- !test out module AST is output -->
```
"Tuples"
5
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
./testFixture/TrivialTypeError.qnt:2:3 - error: [QNT000] Couldn't unify str and int
Trying to unify str and int

2:   val x : int = "not an int"
     ^^^^^^^^^^^^^^^^^^^^^^^^^^

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
./testFixture/typechecking/OverrideErrors.qnt:8:16 - error: [QNT000] Couldn't unify bool and int
Trying to unify bool and int

8:   import A(c = 1) as A1
                  ^

./testFixture/typechecking/OverrideErrors.qnt:9:16 - error: [QNT201] Instance overrides must be pure, but the value for c reads variables 'x'
9:   import A(c = x) as A2
                  ^

error: typechecking failed
```

## Use of `repl`, `test`, and `run`

### Repl loads a file with -r

<!-- !test in repl loads a file -->
```
echo "import counters.*" | quint -r ../examples/language-features/counters.qnt 2>&1 | tail -n +3
```

<!-- !test out repl loads a file -->
```
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
>>> 
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

>>> Session saved to: tmp-counters.qnt
>>> >>> 

>>> true
>>> 
```

### Tests works as expected

The command `test` finds failing tests and prints error messages.

<!-- !test exit 1 -->
<!-- !test in test runs -->
```
output=$(quint test --main counters --seed 1 ../examples/language-features/counters.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*counters.qnt#      HOME/counters.qnt#g'
exit $exit_code
```

<!-- !test out test runs -->
```

  counters
    ok passingTest passed 10000 test(s)
    1) failingTest failed after 1 test(s)

  1 passing (duration)
  1 failed
  1 ignored

  1) failingTest:
      HOME/counters.qnt:83:9 - error: Assertion failed
      83:         assert(n == 0),
    Use --seed=0x1109d --match=failingTest to repeat.


  Use --verbosity=3 to show executions.
```

### test counters produces no execution

`test` should handle the special case of when an execution has not been
recorded yet.

<!-- !test exit 1 -->
<!-- !test in test empty trace -->
```
output=$(quint test --seed 1 --verbosity=3 ../examples/language-features/counters.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*counters.qnt#      HOME/counters.qnt#g'
exit $exit_code
```

<!-- !test out test empty trace -->
```

  counters
    ok passingTest passed 10000 test(s)
    1) failingTest failed after 1 test(s)

  1 passing (duration)
  1 failed
  1 ignored

  1) failingTest:
      HOME/counters.qnt:83:9 - error: Assertion failed
      83:         assert(n == 0),

[Frame 0]
Init() => true

    Use --seed=0x1109d --match=failingTest to repeat.
```

### Run finds an invariant violation

The command `run` finds an invariant violation.

<!-- !test in run finds violation -->
```
output=$(quint run --init=Init --step=Next --seed=0x308623f2a48e7 --max-steps=4 \
  --invariant='n < 10' ../examples/language-features/counters.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*counters.qnt#      HOME/counters.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run finds violation -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 6 }

[State 4] { n: 12 }

[violation] Found an issue (duration).
Use --seed=0x308623f2a48e7 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
```

### Run finds an example

The command `run` finds an example.

<!-- !test in run finds example -->
```
quint run --init=Init --step=Next --seed=17 --max-steps=4 \
  --invariant='n < 100' ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out run finds example -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 6 }

[State 4] { n: 12 }

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

>>> true
>>> Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0)
>>> 
```

### Run finds an overflow in Coin

The command `run` finds an overflow in Coin.

<!-- !test in run finds overflow -->
```
output=$(quint run --max-steps=5 --seed=0x1e352e160fec18 --invariant=totalSupplyDoesNotOverflowInv \
  ../examples/solidity/Coin/coin.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run finds overflow -->
```
An example execution:

[State 0]
{
  balances:
    Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0),
  minter: "eve"
}

[State 1]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" ->
        42072507376163960643920738270336159490043987977674145501118528050792554254667,
      "charlie" -> 0,
      "eve" -> 0,
      "null" -> 0
    ),
  minter: "eve"
}

[State 2]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" ->
        42072507376163960643920738270336159490043987977674145501118528050792554254667,
      "charlie" -> 0,
      "eve" -> 0,
      "null" ->
        16521711849181237202636451043914108610889109974959974963671010185510852394179
    ),
  minter: "eve"
}

[State 3]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" ->
        42072507376163960643920738270336159490043987977674145501118528050792554254667,
      "charlie" -> 0,
      "eve" -> 0,
      "null" ->
        91875600531977772563185819847316161578729924588376815416915532887911288012318
    ),
  minter: "eve"
}

[violation] Found an issue (duration).
Use --seed=0x1e352e160fec18 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
```

### Run shows the operator calls

The command `run` finds an overflow in Coin and shows the operator calls.

<!-- !test in run shows calls -->
```
output=$(quint run --max-steps=5 --seed=0x1786e678d45ef0 \
  --invariant=totalSupplyDoesNotOverflowInv \
  --verbosity=3 \
  ../examples/solidity/Coin/coin.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run shows calls -->
```
An example execution:

[Frame 0]
q::initAndInvariant() => true
├─ q::init() => true
│  └─ init() => true
└─ isUInt(0) => true

[State 0]
{
  balances:
    Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0),
  minter: "null"
}

[Frame 1]
q::stepAndInvariant() => true
├─ q::step() => true
│  └─ step() => true
│     └─ mint(
│          "null",
│          "alice",
│          97210836887067662390949112128222467294168903789083016866293633957660645688905
│        ) => true
│        ├─ require(true) => true
│        └─ require(true) => true
│           └─ isUInt(
│                97210836887067662390949112128222467294168903789083016866293633957660645688905
│              ) => true
└─ isUInt(
     97210836887067662390949112128222467294168903789083016866293633957660645688905
   ) => true

[State 1]
{
  balances:
    Map(
      "alice" ->
        97210836887067662390949112128222467294168903789083016866293633957660645688905,
      "bob" -> 0,
      "charlie" -> 0,
      "eve" -> 0,
      "null" -> 0
    ),
  minter: "null"
}

[Frame 2]
q::stepAndInvariant() => true
├─ q::step() => true
│  └─ step() => true
│     └─ mint(
│          "null",
│          "charlie",
│          71367179983756460176106538680495310778684729363601314720341430729464281514430
│        ) => true
│        ├─ require(true) => true
│        └─ require(true) => true
│           └─ isUInt(
│                71367179983756460176106538680495310778684729363601314720341430729464281514430
│              ) => true
└─ isUInt(
     168578016870824122567055650808717778072853633152684331586635064687124927203335
   ) => false

[State 2]
{
  balances:
    Map(
      "alice" ->
        97210836887067662390949112128222467294168903789083016866293633957660645688905,
      "bob" -> 0,
      "charlie" ->
        71367179983756460176106538680495310778684729363601314720341430729464281514430,
      "eve" -> 0,
      "null" -> 0
    ),
  minter: "null"
}

[violation] Found an issue (duration).
Use --seed=0x1786e678d45ef0 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
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

### Test outputs ITF

TODO: output states after fix: https://github.com/informalsystems/quint/issues/288

<!-- !test in test itf -->
```
output=$(quint test --output='coin_{#}_{}.itf.json' \
  ../examples/solidity/Coin/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
cat coin_0_sendWithoutMintTest.itf.json | jq '.states'
rm coin_0_sendWithoutMintTest.itf.json
cat coin_1_mintSendTest.itf.json | jq '.states[0]."balances"."#map"'
rm coin_1_mintSendTest.itf.json
exit $exit_code
```

<!-- !test out test itf -->
```

  coin
    ok sendWithoutMintTest passed 10000 test(s)
    ok mintSendTest passed 10000 test(s)

  2 passing (duration)
[]
[
  [
    "alice",
    0
  ],
  [
    "bob",
    0
  ],
  [
    "charlie",
    0
  ],
  [
    "eve",
    0
  ],
  [
    "null",
    0
  ]
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
output=$(quint test --seed=0x1cce84523050d3 --match=mintTwiceThenSendError \
  --verbosity=3 ../examples/solidity/Coin/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
exit $exit_code
```

<!-- !test out verbose test -->
```

  coin
    1) mintTwiceThenSendError failed after 1 test(s)

  1 failed

  1) mintTwiceThenSendError:
      HOME/coin.qnt:176:5 - error: mintTwiceThenSendError returns false
      176:     run mintTwiceThenSendError = {

[Frame 0]
init() => true

[Frame 1]
mint(
  "null",
  "eve",
  103029211857619067979094014873050396590165055745102811782792764124238098725560
) => true
├─ require(true) => true
└─ require(true) => true
   └─ isUInt(
        103029211857619067979094014873050396590165055745102811782792764124238098725560
      ) => true

[Frame 2]
mint(
  "null",
  "bob",
  74954963967956643540192626027362289940259131330198081495537975192140612510728
) => true
├─ require(true) => true
└─ require(true) => true
   └─ isUInt(
        74954963967956643540192626027362289940259131330198081495537975192140612510728
      ) => true

[Frame 3]
send(
  "eve",
  "bob",
  71008610450989699006949547967735399863437575268953760685900857232369100930415
) => false
├─ require(true) => true
├─ require(true) => true
│  └─ isUInt(
│       32020601406629368972144466905314996726727480476149051096891906891868997795145
│     ) => true
└─ require(false) => false
   └─ isUInt(
        145963574418946342547142173995097689803696706599151842181438832424509713441143
      ) => false

    Use --seed=0x1cce84523050d3 --match=mintTwiceThenSendError to repeat.
```

### test fails on invalid seed

<!-- !test exit 1 -->
<!-- !test in test invalid seed -->
```
output=$(quint test --seed=NotANumber ../examples/solidity/Coin/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
exit $exit_code
```

<!-- !test err test invalid seed -->
```
error: --seed must be a big integer, found: NotANumber
```

### run fails on invalid seed

<!-- !test exit 1 -->
<!-- !test in run invalid seed -->
```
output=$(quint run --seed=NotANumber ../examples/solidity/Coin/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
exit $exit_code
```

<!-- !test err run invalid seed -->
```
error: --seed must be a big integer, found: NotANumber
```

### OK on compile imports

<!-- !test in compile imports -->
```
echo "init" | quint -r ../examples/language-features/imports.qnt::G 2>&1 | tail -n +3
```

<!-- !test out compile imports -->
```

>>> true
>>> 
```

### OK on compile instances

<!-- !test in compile instances -->
```
echo -e "A1::f(1)\nA2::f(1)" | quint -r ../examples/language-features/instances.qnt::Instances 2>&1 | tail -n +3
```

<!-- !test out compile instances -->
```

>>> 34
>>> 16
>>> 
```

### Fail on test with compile error

<!-- !test in test compile error -->
```
output=$(quint test testFixture/_1040compileError.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's#^.*_1040compileError.qnt#      HOME/_1040compileError.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out test compile error -->
```

  _1040compileError
      HOME/_1040compileError.qnt:5:12 - error: Name n not found
5:     assert(n > 0)
              ^

error: Tests failed
```
