# Integration tests with locally-built Rust backend

<!-- !test program
bash -
-->

## quint test tests

### OK on test Tendermint

<!-- !test check Tendermint - Test -->
    quint test --backend=rust --max-samples=100 --main TendermintModels ../examples/cosmos/tendermint/TendermintModels.qnt


### OK on test ics20 bank

<!-- !test check ics20 bank - Test -->
    quint test --backend=rust --main bankTests ../examples/cosmos/ics20/bank.qnt


### OK on test ics20 denomTrace

<!-- !test check ics20 denomTrace - Test -->
    quint test --backend=rust --main=properChannelsTests ../examples/cosmos/ics20/denomTrace.qnt


### OK on test importFrom

<!-- !test check importFrom - Test -->
    quint test --backend=rust ../examples/language-features/importFrom.qnt


### OK on test basicSpells

<!-- !test check basicSpells - Test -->
    quint test --backend=rust ../examples/spells/basicSpells.qnt


### OK on test commonSpells

<!-- !test check commonSpells - Test -->
    quint test --backend=rust ../examples/spells/commonSpells.qnt


### OK on test rareSpells

<!-- !test check rareSpells - Test -->
    quint test --backend=rust ../examples/spells/rareSpells.qnt


### OK on test BoundedUint8

<!-- !test check BoundedUint8 - Test -->
    quint test --backend=rust --main=BoundedUInt8Test ../examples/spells/BoundedUInt.qnt


### OK on test bug843pureValCache

<!-- !test check bug843pureValCache - Test -->
    quint test --backend=rust ./testFixture/bug843pureValCache.qnt


### OK on test simplePonzi

<!-- !test check simplePonzi - Test -->
    quint test --backend=rust --main=simplePonziTest ../examples/solidity/SimplePonzi/simplePonzi.qnt


### OK on test gradualPonzi

<!-- !test check gradualPonzi - Test -->
    quint test --backend=rust --main=gradualPonziTest ../examples/solidity/GradualPonzi/gradualPonzi.qnt


### OK on test with the default module

See [#1195](https://github.com/informalsystems/quint/issues/1195).

<!-- !test check test the default module -->
    quint test --backend=rust ./testFixture/_1050diffName.qnt


### FAIL on test SimpleAuction.qnt (QNT601 integer overflow)

`2^256` overflows the Rust evaluator's bigint implementation. The stack trace
shows the call chain from the overflow site up through each call site.

<!-- !test exit 1 -->
<!-- !test in SimpleAuction overflow -->
```
output=$(quint test --backend=rust --seed=1 --match=bidWithdrawTest \
  ../examples/solidity/SimpleAuction/SimpleAuction.qnt)
exit_code=$?
echo "$output" | sed -e 's#[^ (]*SimpleAuction.qnt#HOME/SimpleAuction.qnt#g'
exit $exit_code
```

<!-- !test out SimpleAuction overflow -->
```

  SimpleAuction
    1) bidWithdrawTest failed after 1 test(s)

  1 failed

  1) bidWithdrawTest:
       Error [QNT601]: Integer overflow in arithmetic operations: 2 ^ 256
        at HOME/SimpleAuction.qnt:66:25
        66:     pure val MAX_UINT = 2^256 - 1
                                    ^^^^^
          at isUInt(fromBal) (HOME/SimpleAuction.qnt:93:17)
          at evmSend(evmState, sender, s.addressOfThis, value) (HOME/SimpleAuction.qnt:182:23)
          at bid("alice", 5) (HOME/SimpleAuction.qnt:282:19)
    Use --seed=0x1 --match=bidWithdrawTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 HOME/SimpleAuction.qnt
```


### FAIL on test erc20.qnt::mempool (QNT601 integer overflow)

<!-- !test exit 1 -->
<!-- !test in erc20 mempool overflow -->
```
output=$(quint test --backend=rust --seed=1 --main=mempool \
  ../examples/solidity/ERC20/erc20.qnt)
exit_code=$?
echo "$output" | sed -e 's#[^ (]*erc20.qnt#HOME/erc20.qnt#g'
exit $exit_code
```

<!-- !test out erc20 mempool overflow -->
```

  mempool
    1) transferFromWhileApproveInFlightTest failed after 1 test(s)

  1 failed

  1) transferFromWhileApproveInFlightTest:
       Error [QNT601]: Integer overflow in arithmetic operations: 2 ^ 256
        at HOME/erc20.qnt:28:25
        28:     pure val MAX_UINT = 2^256 - 1
                                    ^^^^^
          at transferFrom(erc20State, tx.sender, tx.fromAddr, tx.toAddr, tx.amount) (HOME/erc20.qnt:439:32)
          at commit(TransferFromTx("bob", "alice", "eve", 54)) (HOME/erc20.qnt:516:15)
    Use --seed=0x1 --match=transferFromWhileApproveInFlightTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 HOME/erc20.qnt
```


### FAIL on test erc20.qnt::erc20Tests (QNT601 integer overflow)

The overflow is not hit immediately — it surfaces after 160 randomized samples
when `totalSupply` grows large enough to exceed the bigint implementation's range.

<!-- !test exit 1 -->
<!-- !test in erc20Tests overflow -->
```
output=$(quint test --backend=rust --seed=1 --main=erc20Tests --match=transferTest --max-samples=10000 \
  ../examples/solidity/ERC20/erc20.qnt)
exit_code=$?
echo "$output" | sed -e 's#[^ (]*erc20.qnt#HOME/erc20.qnt#g'
exit $exit_code
```

<!-- !test out erc20Tests overflow -->
```

  erc20Tests
    1) transferTest failed after 160 test(s)

  1 failed

  1) transferTest:
       Error [QNT601]: Integer overflow in arithmetic operations: 2 ^ 256
        at HOME/erc20.qnt:28:25
        28:     pure val MAX_UINT = 2^256 - 1
                                    ^^^^^
          at isUint(state.totalSupply) (HOME/erc20.qnt:226:9)
          at isNoOverflows(s) (HOME/erc20.qnt:305:9)
          at isValid(erc20State) (HOME/erc20.qnt:321:25)
    Use --seed=0x1 --match=transferTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 HOME/erc20.qnt
```


### FAIL on test ics20 (QNT600 integer literal out of i64 range)

The literal `9223372036854775808` (`2^63`) exceeds i64 range and is rejected
immediately at compile time by the Rust evaluator, before any test runs.
All 27 tests in the module fail for the same reason; one is shown here.

<!-- !test exit 1 -->
<!-- !test in ics20 i64 overflow -->
```
output=$(quint test --backend=rust --seed=1 --main=ics20Test --match=requireTest \
  ../examples/cosmos/ics20/ics20.qnt)
exit_code=$?
echo "$output" | sed -e 's#[^ (]*ics20.qnt#HOME/ics20.qnt#g'
exit $exit_code
```

<!-- !test out ics20 i64 overflow -->
```

  ics20Test
    1) requireTest failed after 0 test(s)

  1 failed

  1) requireTest:
       Error [QNT600]: Integer literal 9223372036854775808 is outside i64 range and is not supported by the Rust evaluator.
        at HOME/ics20.qnt:511:23
        511:     pure val amount = 9223372036854775808
                                   ^^^^^^^^^^^^^^^^^^^
    Use --seed=0x1 --match=requireTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 HOME/ics20.qnt
```


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
       Error [QNT508]: Assertion failed
      HOME/failingTestCounters.qnt:45:10
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

<!-- NOTE: This test is currently failing due to integer overflow issues in the Rust evaluator -->

<!-- !test exit 1 -->
<!-- !test in test itf -->
```
output=$(quint test --backend=rust --out-itf='coin_{seq}_{test}.itf.json' \
  ../examples/tutorials/coin.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' \
  -e 's#^.*coin.qnt#      HOME/coin.qnt#g' \
  -e 's/--seed=0x[0-9a-f]* --match/--seed=SEED --match/g'
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
    1) mintSendTest failed after 1 test(s)

  1 passing (duration)
  1 failed

  1) mintSendTest:
       Error [QNT601]: Integer overflow in arithmetic operations: 2 ^ 256
      HOME/coin.qnt:35:25
        35:     pure val MAX_UINT = 2^256 - 1
                                    ^^^^^
      HOME/coin.qnt:83:21)
      HOME/coin.qnt:161:19)
    Use --seed=SEED --match=mintSendTest to repeat.


  Use --verbosity=3 to show executions.
      HOME/coin.qnt
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
       Error [QNT500]: Uninitialized const n. Use: import <moduleName>(n=<value>).*
        at HOME/_1040compileError.qnt:5:12
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
       Error [QNT513]: Cannot continue in `then` because the highlighted expression evaluated to false
      HOME/thenErrorMessages.qnt:11:11
        11:     .then(b)
                      ^
    Use --seed=0x1 --match=bFailsTest to repeat.
  2) initFailsTest:
       Error [QNT513]: Cannot continue in `then` because the highlighted expression evaluated to false
      HOME/thenErrorMessages.qnt:15:23
        15:   run initFailsTest = init(false)
                                  ^^^^^^^^^^^
    Use --seed=0x1 --match=initFailsTest to repeat.
  3) lastActionFailsTest:
       Error [QNT511]: Test lastActionFailsTest returned false
      HOME/thenErrorMessages.qnt:18:7
        18:   run lastActionFailsTest = init(true)
                  ^^^^^^^^^^^^^^^^^^^
    Use --seed=0x1 --match=lastActionFailsTest to repeat.


  Use --verbosity=3 to show executions.
      HOME/thenErrorMessages.qnt
```


### Runtime error shows error type and stack trace

A runtime error in a nested pure def call should report the error code and a
full call stack, pointing from the failing expression up through each call site.

<!-- !test exit 1 -->
<!-- !test in runtime error stack trace -->
```
output=$(quint test --backend=rust --seed=1 ./testFixture/runtimeErrorStackTrace.qnt)
exit_code=$?
echo "$output" | sed -e 's#[^ (]*runtimeErrorStackTrace.qnt#HOME/runtimeErrorStackTrace.qnt#g'
exit $exit_code
```

<!-- !test out runtime error stack trace -->
```

  runtimeErrorStackTrace
    1) errorTest failed after 1 test(s)

  1 failed

  1) errorTest:
       Error [QNT503]: Division by zero
        at HOME/runtimeErrorStackTrace.qnt:5:42
        5:   pure def divide(x: int, y: int): int = x / y
                                                    ^^^^^
          at divide(a, 0) (HOME/runtimeErrorStackTrace.qnt:7:35)
          at compute(n + 1) (HOME/runtimeErrorStackTrace.qnt:11:34)
    Use --seed=0x1 --match=errorTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 HOME/runtimeErrorStackTrace.qnt
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

### Debug while testing

This test verifies that q::debug output is printed when using the Rust backend.

<!-- !test in rust backend test debug -->
```
cat > /tmp/debug_test.qnt << 'EOF'
module debugTest {
  var x: int

  action init = {
    x' = q::debug("this tests debug", 42)
  }

  action step = {
    x' = x + 1
  }

  run simpleTest =
    init.then(step)
}
EOF

quint test \
  --backend=rust \
  --verbosity=3 \
  /tmp/debug_test.qnt 2>&1 | grep "this tests debug"

rm /tmp/debug_test.qnt
```

<!-- !test out rust backend test debug -->
```
       [DEBUG] this tests debug 42
```
