# Integration tests with locally-built Rust backend

Tests in this script verify features of the Rust backend that require
running against a locally-built evaluator (not the released version).

These tests run in PR CI after building the Rust evaluator from source.

<!-- !test program
bash -
-->

## quint test tests

### Tests works as expected

The command `test` finds failing tests and prints error messages.

<!-- !test exit 1 -->
<!-- !test in test runs -->
```
output=$(quint test --backend=rust --main failingTestCounters --seed 1 ./testFixture/simulator/failingTestCounters.qnt)
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
                   ^^^^^^^^^^^^^^
    Use --seed=0x1 --match=failingTest to repeat.


  Use --verbosity=3 to show executions.
      HOME/failingTestCounters.qnt
```


### Tests are found even if they are imported in the main module

<!-- !test exit 0 -->
<!-- !test in tests are found -->
```
output=$(quint test --backend=rust --max-samples=10 --main TendermintModels ../examples/cosmos/tendermint/TendermintModels.qnt)
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


### Test outputs ITF

<!-- !test in test itf -->
```
output=$(quint test --backend=rust --out-itf='coin_{seq}_{test}.itf.json' \
  ../examples/tutorials/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*coin.qnt#      HOME/coin.qnt#g'
cat coin_0_sendWithoutMintTest.itf.json | jq '.states[0]."balances"."#map"'
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
Fixed in: https://github.com/informalsystems/quint/pull/1846
This is now a regression test

<!-- !test in test1133 -->
```
quint test --backend=rust --match='(t1|t2)' --out-itf='out_{seq}_{test}.itf.json' \
  ./testFixture/simulator/lastActionInRun.qnt > /dev/null
cat out_0_t1.itf.json | jq '.states | length'
rm out_0_t1.itf.json
cat out_1_t2.itf.json | jq '.states | length'
rm out_1_t2.itf.json
```

<!-- !test out test1133 -->
```
3
4
```


### test fails on invalid seed

<!-- !test exit 1 -->
<!-- !test in test invalid seed -->
```
quint test --backend=rust --seed=NotANumber ../examples/tutorials/coin.qnt
```

<!-- !test err test invalid seed -->
```
--seed must be a big integer, found: NotANumber
```


### Fail on test with compile error

<!-- !test in test compile error -->
```
output=$(quint test --backend=rust testFixture/_1040compileError.qnt --seed=1 2>&1)
exit_code=$?
echo "$output" | sed -E 's#(/[^ ]*/)_1040compileError.qnt#HOME/_1040compileError.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out test compile error -->
```

  _1040compileError
    1) myTest failed after 1 test(s)

  1 failed

  1) myTest:
      HOME/_1040compileError.qnt:5:12 - error: [QNT500] Uninitialized const n. Use: import <moduleName>(n=<value>).*
      5:     assert(n > 0)
                    ^
    Use --seed=0x1 --match=myTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 testFixture/_1040compileError.qnt
error: Tests failed
```


### test fails on invalid module

<!-- !test exit 1 -->
<!-- !test in test invalid module -->
```
quint test --backend=rust --main=invalid ./testFixture/_1050diffName.qnt
```

<!-- !test err test invalid module -->
```
error: [QNT405] Main module invalid not found
error: Argument error
```


### Multiple tests output different json

See [#1264](https://github.com/informalsystems/quint/pull/1264).

<!-- !test in multiple jsons -->
```
quint test --backend=rust --out-itf {test}.itf.json ./testFixture/_1051manyTests.qnt >/dev/null
cat firstTest.itf.json secondTest.itf.json | jq -c .states
rm firstTest.itf.json secondTest.itf.json
```

<!-- !test out multiple jsons -->
```
[{"#meta":{"index":0},"x":{"#bigint":"0"}},{"#meta":{"index":1},"x":{"#bigint":"1"}},{"#meta":{"index":2},"x":{"#bigint":"1"}}]
[{"#meta":{"index":0},"x":{"#bigint":"0"}},{"#meta":{"index":1},"x":{"#bigint":"2"}},{"#meta":{"index":2},"x":{"#bigint":"2"}}]
```


### Variants are supported in ITF

See [#1281](https://github.com/informalsystems/quint/issues/1281)

<!-- !test in variants in itf -->
```
quint test --backend=rust --out-itf {test}.itf.json ./testFixture/_1054sumTypesInItf.qnt >/dev/null
cat xTest.itf.json | jq -c .states
rm xTest.itf.json
```

<!-- !test out variants in itf -->
```
[{"#meta":{"index":0},"x":{"tag":"None","value":{"#tup":[]}}},{"#meta":{"index":1},"x":{"tag":"Some","value":{"#bigint":"1"}}},{"#meta":{"index":2},"x":{"tag":"Some","value":{"#bigint":"2"}}},{"#meta":{"index":3},"x":{"tag":"Some","value":{"#bigint":"3"}}}]
```


### Error messages from `then`

We do a few tricks to make the location from `then` failures be more informative.

<!-- !test exit 1 -->
<!-- !test in then error messages -->
```
output=$(quint test --backend=rust --seed=1 ./testFixture/thenErrorMessages.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*thenErrorMessages.qnt#      HOME/thenErrorMessages.qnt#g'
exit $exit_code
```

<!-- !test out then error messages -->
```

  test
    1) bFailsTest failed after 1 test(s)
    2) initFailsTest failed after 1 test(s)
    3) lastActionFailsTest failed after 1 test(s)

  3 failed

  1) bFailsTest:
      HOME/thenErrorMessages.qnt:11:11 - error: [QNT513] Cannot continue in `then` because the highlighted expression evaluated to false
      11:     .then(b)
                    ^
    Use --seed=0x1 --match=bFailsTest to repeat.
  2) initFailsTest:
      HOME/thenErrorMessages.qnt:15:23 - error: [QNT513] Cannot continue in `then` because the highlighted expression evaluated to false
      15:   run initFailsTest = init(false)
                                ^^^^^^^^^^^
    Use --seed=0x1 --match=initFailsTest to repeat.
  3) lastActionFailsTest:
      HOME/thenErrorMessages.qnt:18:29 - error: [QNT511] Test lastActionFailsTest returned false
      18:   run lastActionFailsTest = init(true)
                                      ^^^^^^^^^^
      19:     .then(a)
          ^^^^^^^^^^^^
      20:     .then(b)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    Use --seed=0x1 --match=lastActionFailsTest to repeat.


  Use --verbosity=3 to show executions.
      HOME/thenErrorMessages.qnt
```


### `expect` does not duplicate states in traces for `quint test`

Regression test to ensure that `expect` does not add duplicate states to the trace
when using `quint test` with `--out-itf`. Both tests should produce the same number
of states, as the final `expect` in `WithExpectTest` should not add an extra state.

<!-- !test in expect no duplicate states in test -->
```
quint test --backend=rust --out-itf='{test}.itf.json' \
  ./testFixture/expectNoStateDuplication.qnt > /dev/null
cat NoExpectTest.itf.json | jq '.states | length'
cat WithExpectTest.itf.json | jq '.states | length'
rm NoExpectTest.itf.json WithExpectTest.itf.json
```

<!-- !test out expect no duplicate states in test -->
```
6
6
```
