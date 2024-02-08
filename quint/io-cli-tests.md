
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
    Q/testFixture/modulesAndJunk.qnt:9:1 - error: [QNT000] extraneous input 'the' expecting {<EOF>, 'module', DOCCOMMENT}
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
./testFixture/_1011nameOutOfScope.qnt:5:11 - error: [QNT404] Name 'x' not found
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
echo -e "import counters.* \n init \n n" | quint -r ../examples/language-features/counters.qnt 2>&1 | tail -n +3
```

<!-- !test out repl loads a file -->
```
>>> 
>>> true
>>> 1
>>> 
```

### Repl loads a file and a module with -r

<!-- !test in repl loads a file and a module -->
```
echo "init" | quint -r ../examples/language-features/counters.qnt::counters 2>&1 | tail -n +3
```

<!-- !test out repl loads a file and a module -->
```
>>> true
>>> 
```

### Repl loads a file and a module with -r when the module is not the last one

<!-- !test in repl loads module that is not the last -->
```
echo "init" | quint -r ../examples/language-features/imports.qnt::E 2>&1 | tail -n +3
```

<!-- !test out repl loads module that is not the last -->
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
>>> >>> >>> 
```

### Repl saves a file with .save and loads it back

<!-- !test in repl saves a file with .save and loads it back -->
```
echo ".save tmp-counters.qnt" \
  | quint -r ../examples/language-features/counters.qnt::counters 2>&1 \
  | tail -n +3
# do not auto-import counters, as it is imported already
echo "init" \
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

### Repl loads a module directly without wrapping it in a new module

` MyF::ExportedBasics::double(2)` should be available only in the `G` module. If `G` is imported in a
`__repl__` module, this wouldn't work.

<!-- !test in repl loads a module directly -->
```
echo -e "init\nMyF::ExportedBasics::double(2)" | quint -r ../examples/language-features/imports.qnt::imports 2>&1 | tail -n +3
```

<!-- !test out repl loads a module directly -->
```
>>> true
>>> 4
>>> 
```

### Repl reports proper errors for malformed expressions 

<!-- !test in repl malformed expressions -->
```
echo -e "1 +" | quint | grep -o 'syntax error: error: \[QNT000\]'
```

<!-- !test out repl malformed expressions -->
```
syntax error: error: [QNT000]
```


### Tests works as expected

The command `test` finds failing tests and prints error messages.

<!-- !test exit 1 -->
<!-- !test in test runs -->
```
output=$(quint test --main failingTestCounters --seed 1 ./testFixture/simulator/failingTestCounters.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*failingTestCounters.qnt#      HOME/failingTestCounters.qnt#g'
exit $exit_code
```

<!-- !test out test runs -->
```

  failingTestCounters
    1) failingTest failed after 1 test(s)

  1 failed

  1) failingTest:
      HOME/failingTestCounters.qnt:45:10 - error: [QNT508] Assertion failed
      45:          assert(n == 0),
    Use --seed=0x1 --match=failingTest to repeat.


  Use --verbosity=3 to show executions.
      HOME/failingTestCounters.qnt
```

### Tests are found even if they are imported in the main module

<!-- !test exit 0 -->
<!-- !test in tests are found -->
```
output=$(quint test --max-samples=10 --main TendermintModels ../examples/cosmos/tendermint/TendermintModels.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g'
exit $exit_code
```

<!-- !test out tests are found -->
```

  TendermintModels
    ok TendermintModels::n4_f1::decisionTest passed 10 test(s)
    ok TendermintModels::n4_f1::noProposeTwiceTest passed 10 test(s)
    ok TendermintModels::n4_f1::timeoutProposeTest passed 10 test(s)
    ok TendermintModels::n4_f2::decisionTest passed 10 test(s)
    ok TendermintModels::n4_f2::noProposeTwiceTest passed 10 test(s)
    ok TendermintModels::n4_f2::timeoutProposeTest passed 10 test(s)
    ok TendermintModels::n5_f2::decisionTest passed 10 test(s)
    ok TendermintModels::n5_f2::noProposeTwiceTest passed 10 test(s)
    ok TendermintModels::n5_f2::timeoutProposeTest passed 10 test(s)

  9 passing (duration)
```

### test counters produces no execution

`test` should handle the special case of when an execution has not been
recorded yet.

<!-- !test exit 1 -->
<!-- !test in test empty trace -->
```
output=$(quint test --seed 1 --verbosity=3 ./testFixture/simulator/failingTestCounters.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*failingTestCounters.qnt#      HOME/failingTestCounters.qnt#g'
exit $exit_code
```

<!-- !test out test empty trace -->
```

  failingTestCounters
    1) failingTest failed after 1 test(s)

  1 failed

  1) failingTest:
      HOME/failingTestCounters.qnt:45:10 - error: [QNT508] Assertion failed
      45:          assert(n == 0),

[Frame 0]
init => true

[Frame 1]
_ => none

    Use --seed=0x1 --match=failingTest to repeat.
```

### Run finds an invariant violation

The command `run` finds an invariant violation.

<!-- !test in run finds violation -->
```
output=$(quint run --seed=0x308623f2a48e7 --max-steps=4 \
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
quint run --seed=17 --max-steps=4 --invariant='n < 100' ../examples/language-features/counters.qnt 2>&1 | \
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
Use --seed=0x11 to reproduce.
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
output=$(quint run --max-steps=5 --seed=0x1e352e160ffa12 --invariant=totalSupplyDoesNotOverflowInv \
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
  minter: "alice"
}

[State 1]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" -> 0,
      "charlie" ->
        44102953916667308628507282398473780107575312859495896164716387801811669677303,
      "eve" -> 0,
      "null" -> 0
    ),
  minter: "alice"
}

[State 2]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" -> 0,
      "charlie" ->
        44102953916667308628507282398473780107575312859495896164716387801811669677303,
      "eve" -> 0,
      "null" ->
        106908608291568456374887716989928730685737039774957994870160634616776887554850
    ),
  minter: "alice"
}

[violation] Found an issue (duration).
Use --seed=0x1e352e160ffa12 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
```

### Run shows the operator calls

The command `run` finds an overflow in Coin and shows the operator calls.

<!-- !test in run shows calls -->
```
output=$(quint run --max-steps=5 --seed=0x1786e678d45fe0 \
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
q::initAndInvariant => true
├─ q::init => true
│  └─ init => true
└─ isUInt(0) => true

[State 0]
{
  balances:
    Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0),
  minter: "bob"
}

[Frame 1]
q::stepAndInvariant => true
├─ q::step => true
│  └─ step => true
│     └─ mint(
│          "bob",
│          "null",
│          65338262739825284111745959589547129900185534924167607765304796328491174113858
│        ) => true
│        ├─ require(true) => true
│        └─ require(true) => true
│           └─ isUInt(
│                65338262739825284111745959589547129900185534924167607765304796328491174113858
│              ) => true
└─ isUInt(
     65338262739825284111745959589547129900185534924167607765304796328491174113858
   ) => true

[State 1]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" -> 0,
      "charlie" -> 0,
      "eve" -> 0,
      "null" ->
        65338262739825284111745959589547129900185534924167607765304796328491174113858
    ),
  minter: "bob"
}

[Frame 2]
q::stepAndInvariant => true
├─ q::step => true
│  └─ step => true
│     └─ send(
│          "null",
│          "charlie",
│          27846403266649766800055905337678576473819522457314621838114493230792952096574
│        ) => true
│        ├─ require(true) => true
│        ├─ require(true) => true
│        │  └─ isUInt(
│        │       37491859473175517311690054251868553426366012466852985927190303097698222017284
│        │     ) => true
│        └─ require(true) => true
│           └─ isUInt(
│                27846403266649766800055905337678576473819522457314621838114493230792952096574
│              ) => true
└─ isUInt(
     65338262739825284111745959589547129900185534924167607765304796328491174113858
   ) => true

[State 2]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" -> 0,
      "charlie" ->
        27846403266649766800055905337678576473819522457314621838114493230792952096574,
      "eve" -> 0,
      "null" ->
        37491859473175517311690054251868553426366012466852985927190303097698222017284
    ),
  minter: "bob"
}

[Frame 3]
q::stepAndInvariant => true
├─ q::step => true
│  └─ step => true
│     └─ mint(
│          "bob",
│          "bob",
│          78309058398957644239556030729021834730669174305685174769880015395650570612692
│        ) => true
│        ├─ require(true) => true
│        └─ require(true) => true
│           └─ isUInt(
│                78309058398957644239556030729021834730669174305685174769880015395650570612692
│              ) => true
└─ isUInt(
     143647321138782928351301990318568964630854709229852782535184811724141744726550
   ) => false

[State 3]
{
  balances:
    Map(
      "alice" -> 0,
      "bob" ->
        78309058398957644239556030729021834730669174305685174769880015395650570612692,
      "charlie" ->
        27846403266649766800055905337678576473819522457314621838114493230792952096574,
      "eve" -> 0,
      "null" ->
        37491859473175517311690054251868553426366012466852985927190303097698222017284
    ),
  minter: "bob"
}

[violation] Found an issue (duration).
Use --seed=0x1786e678d45fe0 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
```

### Run outputs ITF

<!-- !test in run itf -->
```
quint run --out-itf=out-itf-example.itf.json --max-steps=5 --seed=123 \
  --invariant=totalSupplyDoesNotOverflowInv \
  ../examples/solidity/Coin/coin.qnt
cat out-itf-example.itf.json | jq '.[0].states[0]."balances"."#map"[0]'
rm out-itf-example.itf.json
```

<!-- !test out run itf -->
```
[
  "alice",
  {
    "#bigint": "0"
  }
]
```

### Run without violation outputs ITF

<!-- !test in sucessful run itf -->
```
quint run --out-itf=out-itf-example.itf.json --max-steps=5 --seed=123  ../examples/solidity/Coin/coin.qnt
cat out-itf-example.itf.json | jq '.[0].states[0]."balances"."#map"[0]'
rm out-itf-example.itf.json
```

<!-- !test out sucessful run itf -->
```
[
  "alice",
  {
    "#bigint": "0"
  }
]
```

### Run to generate multiple ITF traces

<!-- !test in run with n-traces itf -->
```
quint run --out-itf=out-itf-example.itf.json --n-traces=5 --max-steps=5 --seed=123  ../examples/solidity/Coin/coin.qnt
cat out-itf-example.itf.json | jq 'length'
rm out-itf-example.itf.json
```

<!-- !test out run with n-traces itf -->
```
5
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
    {
      "#bigint": "0"
    }
  ],
  [
    "bob",
    {
      "#bigint": "0"
    }
  ],
  [
    "charlie",
    {
      "#bigint": "0"
    }
  ],
  [
    "eve",
    {
      "#bigint": "0"
    }
  ],
  [
    "null",
    {
      "#bigint": "0"
    }
  ]
]
```

### Test does not skip assignments (#1133)

See: https://github.com/informalsystems/quint/issues/1133

FIXME: fix the traces found by the simulator once #1133 is resolved.

<!-- !test in test1133 -->
```
output=$(quint test --match='(t1|t2)' --output='out_{#}_{}.itf.json' \
  ./testFixture/simulator/lastActionInRun.qnt)
exit_code=$?
echo "BEGIN"
# This test should have 3 states (FIXME: it does not!)
cat out_0_t1.itf.json | jq '.states' | grep "s" | wc -l | grep 3
rm out_0_t1.itf.json
# This test should have 4 states (FIXME: it does not!)
cat out_1_t2.itf.json | jq '.states' | grep "s" | wc -l | grep 4
rm out_1_t2.itf.json
echo "END"
exit $exit_code
```

<!-- !test out test1133 -->
```
BEGIN
END
```
FIX THE TEST ABOVE: it should have 3 and 4

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
output=$(quint test --seed=0x1cce8452305113 --match=mintTwiceThenSendError \
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
      HOME/coin.qnt:176:5 - error: [QNT511] Test mintTwiceThenSendError returned false
      176:     run mintTwiceThenSendError = {

[Frame 0]
init => true

[Frame 1]
mint(
  "eve",
  "eve",
  73435308175381280179895447726690458129319530672748326532002365461395069401291
) => true
├─ require(true) => true
└─ require(true) => true
   └─ isUInt(
        73435308175381280179895447726690458129319530672748326532002365461395069401291
      ) => true

[Frame 2]
mint(
  "eve",
  "bob",
  99734648034668586428235027805035599638068011144525474004474309631475456844332
) => true
├─ require(true) => true
└─ require(true) => true
   └─ isUInt(
        99734648034668586428235027805035599638068011144525474004474309631475456844332
      ) => true

[Frame 3]
send(
  "eve",
  "bob",
  31114836464924134533662521748469381767604427020159348918484988427058728862690
) => false
├─ require(true) => true
├─ require(true) => true
│  └─ isUInt(
│       42320471710457145646232925978221076361715103652588977613517377034336340538601
│     ) => true
└─ require(false) => false
   └─ isUInt(
        130849484499592720961897549553504981405672438164684822922959298058534185707022
      ) => false

    Use --seed=0x1cce8452305113 --match=mintTwiceThenSendError to repeat.
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
echo "init" | quint -r ../examples/language-features/imports.qnt::imports 2>&1 | tail -n +3
```

<!-- !test out compile imports -->
```
>>> true
>>> 
```

### OK on compile instances

<!-- !test in compile instances -->
```
echo -e "A1::f(1)\nA2::f(1)" | quint -r ../examples/language-features/instances.qnt::instances 2>&1 | tail -n +3
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
      HOME/_1040compileError.qnt:2:3 - error: [QNT500] Uninitialized const n. Use: import <moduleName>(n=<value>).*
2:   const n: int
     ^^^^^^^^^^^^

      HOME/_1040compileError.qnt:5:12 - error: [QNT502] Name n not found
5:     assert(n > 0)
              ^

error: Tests could not be run due to an error during compilation
```

### Fail on run with uninitialized constants

<!-- !test in run uninitialized -->
```
output=$(quint run testFixture/_1041compileConst.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' \
  -e 's#^.*_1041compileConst.qnt#HOME/_1041compileConst.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run uninitialized -->
```
HOME/_1041compileConst.qnt:2:3 - error: [QNT500] Uninitialized const N. Use: import <moduleName>(N=<value>).*
2:   const N: int
     ^^^^^^^^^^^^

HOME/_1041compileConst.qnt:5:24 - error: [QNT502] Name N not found
5:   action init = { x' = N }
                          ^

error: Runtime error
```

### Repl keeps right track of variables from instances

Incremental evaluation from the REPL interacting with instance flattening leads to state variables having different IDs on separate evaluations. This test ensures this case is well handled during evaluation.

<!-- !test in repl with instance vars -->

```
cd ../examples/cosmos/tendermint/
output=$(echo -e "n4_f1::Init\nn4_f1::round" | quint -r TendermintModels.qnt::TendermintModels 2>&1 | tail -n +3)
exit_code=$?
cd - > /dev/null
echo "$output"
exit $exit_code
```

<!-- !test out repl with instance vars -->

```
>>> true
>>> Map("p1" -> 0, "p2" -> 0, "p3" -> 0)
>>> 
```

### Invoking `q::debug` in REPL prints values to stdout

<!-- !test in repl debug prints value to stdout and returns value -->

```
echo 'q::debug("value:", { foo: 42, bar: "Hello, World!" })' | quint | tail -n +3
```

<!-- !test out repl debug prints value to stdout and returns value -->
```
>>> > value: { bar: "Hello, World!", foo: 42 }
{ bar: "Hello, World!", foo: 42 }
>>> 
```


### Errors are reported in the right file

File `ImportFileWithError.qnt` has no error, but it imports a module from file `FileWithError.qnt`, which has a type error. The error should be reported only in `FileWithError.qnt`.

<!-- !test in error for file -->
```
quint typecheck ./testFixture/typechecking/ImportFileWithError.qnt 2>&1 | sed 's#.*quint/\(testFixture\)#HOME/\1#g'
```

<!-- !test out error for file -->
```
HOME/testFixture/typechecking/FileWithError.qnt:2:3 - error: [QNT000] Couldn't unify bool and int
Trying to unify bool and int

2:   val a: int = true
     ^^^^^^^^^^^^^^^^^

error: typechecking failed
```

### run fails on invalid module

<!-- !test exit 1 -->
<!-- !test in run invalid module -->
```
quint run --main=invalid ./testFixture/_1050diffName.qnt
```

<!-- !test err run invalid module -->
```
error: Main module invalid not found
```

### test fails on invalid module

<!-- !test exit 1 -->
<!-- !test in test invalid module -->
```
quint test --main=invalid ./testFixture/_1050diffName.qnt
```

<!-- !test err test invalid module -->
```
error: [QNT405] Main module invalid not found
error: Tests could not be run due to an error during compilation
```

### Multiple tests output different json

See [#1264](https://github.com/informalsystems/quint/pull/1264).

<!-- !test in multiple jsons -->
```
quint test --output {}.itf.json ./testFixture/_1051manyTests.qnt >/dev/null
cat firstTest.itf.json secondTest.itf.json | jq -c .states
rm firstTest.itf.json secondTest.itf.json
```

<!-- !test out multiple jsons -->
```
[{"#meta":{"index":0},"x":{"#bigint":"0"}},{"#meta":{"index":1},"x":{"#bigint":"1"}}]
[{"#meta":{"index":0},"x":{"#bigint":"0"}},{"#meta":{"index":1},"x":{"#bigint":"2"}}]
```

### Variants are supported in ITF

See [#1281](https://github.com/informalsystems/quint/issues/1281)

<!-- !test in variants in itf -->
```
quint test --output {}.itf.json ./testFixture/_1054sumTypesInItf.qnt >/dev/null
cat xTest.itf.json | jq -c .states
rm xTest.itf.json
```

<!-- !test out variants in itf -->
```
[{"#meta":{"index":0},"x":{"tag":"None","value":{}}},{"#meta":{"index":1},"x":{"tag":"Some","value":{"#bigint":"1"}}},{"#meta":{"index":2},"x":{"tag":"Some","value":{"#bigint":"2"}}}]
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
      HOME/_1060case.qnt:3:3 - error: [QNT408] Importing two files that only differ in case:       HOME/_1022importee2.qnt vs.       HOME/_1022IMPORTEE2.qnt. Choose one way.
3:   import importee2 as I from "_1022IMPORTEE2"
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      HOME/_1060case.qnt:2:3 - error: [QNT405] Module 'importee2' not found
2:   import importee2 as i from "_1022importee2"
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      HOME/_1060case.qnt:3:3 - error: [QNT405] Module 'importee2' not found
3:   import importee2 as I from "_1022IMPORTEE2"
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

error: parsing failed
```
