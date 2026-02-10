# Integration tests with locally-built Rust backend

Tests in this script verify features of the Rust backend that require
running against a locally-built evaluator (not the released version).

These tests run in PR CI after building the Rust evaluator from source.

<!-- !test program
TMPFILE=$(mktemp ./tmp.XXXXXX.sh)
cat > "$TMPFILE"
bash "$TMPFILE"
rm "$TMPFILE"
-->

## quint repl tests

### Repl loads a file with -r

<!-- !test in repl loads a file -->
```
echo -e "import counters.* \n init \n n" | quint --backend=rust -r ../examples/language-features/counters.qnt --verbosity 1 2>&1 | tail -n +3
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
quint --backend=rust -r ../examples/language-features/counters.qnt::counters init .exit 2>&1 | tail -n +3
```

<!-- !test out repl loads a file and a module -->
```
>>> init
true
{ n: 1 }
>>> .exit
```

### Repl loads a file and a module with -r when the module is not the last one

<!-- !test in repl loads module that is not the last -->
```
quint --backend=rust -r ../examples/language-features/imports.qnt::E init .exit 2>&1 | tail -n 4
```

<!-- !test out repl loads module that is not the last -->
```
>>> init
true
{ x: 1 }
>>> .exit
```

### Repl loads a file with .load

<!-- !test in repl loads a file with .load -->
```
echo ".load ../examples/language-features/counters.qnt counters" \
  | quint --backend=rust 2>&1 | tail -n +3
```

<!-- !test out repl loads a file with .load -->
```
>>> >>> 
```

### Repl saves a file with .save and loads it back

<!-- !test in repl saves a file with .save and loads it back -->
```
echo ".save tmp-counters.qnt" \
  | quint --backend=rust -r ../examples/language-features/counters.qnt::counters 2>&1 \
  | tail -n +3
# do not auto-import counters, as it is imported already
echo "init" \
  | quint --backend=rust -r tmp-counters.qnt 2>&1 \
  | tail -n +3
rm tmp-counters.qnt
```

<!-- !test out repl saves a file with .save and loads it back -->
```
>>> Session saved to: tmp-counters.qnt
>>> 
>>> true
{ n: 1 }
>>> 
```

### Repl loads a module directly without wrapping it in a new module

` MyF::ExportedBasics::double(2)` should be available only in the `G` module. If `G` is imported in a
`__repl__` module, this wouldn't work.

<!-- !test in repl loads a module directly -->
```
quint --backend=rust -r ../examples/language-features/imports.qnt::imports init "MyF::ExportedBasics::double(2)" .exit 2>&1 | tail -n 6
```

<!-- !test out repl loads a module directly -->
```
>>> init
true
{ x: 1, y: 2 }
>>> MyF::ExportedBasics::double(2)
4
>>> .exit
```

### Repl reports proper errors for malformed expressions 

<!-- !test in repl malformed expressions -->
```
echo -e "1 +" | quint --backend=rust | grep -o 'syntax error: error: \[QNT000\]'
```

<!-- !test out repl malformed expressions -->
```
syntax error: error: [QNT000]
```

### Repl evaluates coin

This is a regression test for #648.

<!-- !test in repl evaluates coin -->
```
quint --backend=rust -r ../examples/tutorials/coin.qnt::coin init balances .exit --verbosity 1 2>&1 \
  | tail -n 5
```

<!-- !test out repl evaluates coin -->
```
>>> init
true
>>> balances
Map("alice" -> 0, "bob" -> 0, "charlie" -> 0, "eve" -> 0, "null" -> 0)
>>> .exit
```

### REPL prints command history

<!-- !test in repl prints command history -->
```
quint --backend=rust -r ../examples/tutorials/repl/kettle.qnt --verbosity 1  | tail -n +2 | head -n 19
```

<!-- !test out repl prints command history -->
```
Type ".exit" to exit, or ".help" for more information
Evaluating expression history in ../examples/tutorials/repl/kettle.qnt
>>> 1 + 3
4
>>> Set(1, 2, 3).map(i => i * 2)
Set(2, 4, 6)
>>> fahrenheit(freezingTemperature)
32
>>> fahrenheit(boilingTemperature)
212
>>> 0.to(100).exists(celsius => fahrenheit(celsius) == celsius)
false
>>> (-100).to(100).exists(celsius => fahrenheit(celsius) == celsius)
true
>>> veryCold
-40
>>> veryHot
104
>>> temperature
```

### OK on compile imports

<!-- !test in compile imports -->
```
quint --backend=rust -r ../examples/language-features/imports.qnt::imports init .exit --verbosity 1 2>&1 | tail -n 3
```

<!-- !test out compile imports -->
```
>>> init
true
>>> .exit
```

### OK on compile instances

<!-- !test in compile instances -->
```
quint --backend=rust -r ../examples/language-features/instances.qnt::instances "A1::f(1)" "A2::f(1)" ".exit" --verbosity 1 2>&1 | tail -n 5
```

<!-- !test out compile instances -->
```
>>> A1::f(1)
34
>>> A2::f(1)
16
>>> .exit
```

### Invoking `q::debug` in REPL prints values to stdout

<!-- !test in repl debug prints value to stdout and returns value -->

```
echo 'q::debug("value:", { foo: 42, bar: "Hello, World!" })' | quint --backend=rust | tail -n +3
```

<!-- !test out repl debug prints value to stdout and returns value -->
```
>>> > value: { bar: "Hello, World!", foo: 42 }
{ bar: "Hello, World!", foo: 42 }
>>> 
```

### REPL continues to work after missing name errors

<!-- !test in repl works after name error -->

```
echo -e 'inexisting_name\n1 + 1' | quint --backend=rust -q
```

<!-- !test out repl works after name error -->
```
static analysis error: error: [QNT404] Name 'inexisting_name' not found
inexisting_name
^^^^^^^^^^^^^^^

2

```

### REPL continues to work after conflicting definitions

Regression for https://github.com/informalsystems/quint/issues/434

<!-- !test in repl works after conflict -->
```
echo -e 'def farenheit(celsius) = celsius * 9 / 5 + 32\ndef farenheit(celsius) = celsius * 9 / 5 + 32\nfarenheit(1)' | quint --backend=rust -q
```

<!-- !test out repl works after conflict -->
```

static analysis error: error: [QNT101] Conflicting definitions found for name 'farenheit' in module '__repl__'
def farenheit(celsius) = celsius * 9 / 5 + 32
    ^^^^^^^^^

static analysis error: error: [QNT101] Conflicting definitions found for name 'farenheit' in module '__repl__'
def farenheit(celsius) = celsius * 9 / 5 + 32
    ^^^^^^^^^

33

```

### REPL continues to work after type errors

<!-- !test in repl works after type errors -->
```
echo -e 'def foo = 1 + "a"\nfoo\n1 + "a"\n1 + 1' | quint --backend=rust -q
```

<!-- !test out repl works after type errors -->
```
static analysis error: error: [QNT000] Couldn't unify int and str
Trying to unify int and str
Trying to unify (int, int) => int and (int, str) => _t0

def foo = 1 + "a"
          ^^^^^^^

static analysis error: error: [QNT404] Name 'foo' not found
foo
^^^

static analysis error: error: [QNT000] Couldn't unify int and str
Trying to unify int and str
Trying to unify (int, int) => int and (int, str) => _t0

1 + "a"
^^^^^^^

2

```

### Regression on 428

Errors from `amWrong` should not affect the definition and usage of `amRight`

<!-- !test in regression 428 -->
```
{
  echo "var myVar: bool"
  echo "action amWrong = all { myVar' = true, myVar' = true }"
  echo "amWrong"
  echo "action amRight = all { myVar' = true }"
  echo "amRight"
} | quint --backend=rust -r ../examples/language-features/instances.qnt::instances --verbosity 1 2>&1 | tail -n7
```

<!-- !test out regression 428 -->
```
>>> static analysis error: error: [QNT404] Name 'amWrong' not found
amWrong
^^^^^^^

>>> 
>>> true
>>> 
```

### REPL diff

<!-- !test in repl diff -->
```
quint --backend=rust -r ../examples/language-features/counters.qnt::counters init OnPositive OnEven .exit | tail -n11
```

<!-- !test out repl diff -->
```
Type ".exit" to exit, or ".help" for more information
>>> init
true
{ n: 1 }
>>> OnPositive
true
{ n: 1 => 2 }
>>> OnEven
true
{ n: 2 => 1 }
>>> .exit
```

### Repl keeps right track of variables from instances

Incremental evaluation from the REPL interacting with instance flattening leads to state variables having different IDs on separate evaluations. This test ensures this case is well handled during evaluation.

<!-- !test in repl with instance vars -->

```
cd ../examples/cosmos/tendermint/
output=$(quint --backend=rust -r TendermintModels.qnt::TendermintModels "n4_f1::Init" "n4_f1::round" ".exit" --verbosity 1 2>&1 | tail -n 5)
exit_code=$?
cd - > /dev/null
echo "$output"
exit $exit_code
```

<!-- !test out repl with instance vars -->

```
>>> n4_f1::Init
true
>>> n4_f1::round
Map("p1" -> 0, "p2" -> 0, "p3" -> 0)
>>> .exit
```

### REPL fails with bigint outside i64 range

This test verifies that the Rust backend REPL rejects integers outside the i64 range.

<!-- !test in repl bigint outside i64 range -->
```
echo '9223372036854775808' | quint --backend=rust -q 2>&1 | grep -o "QNT600.*i64 range"
```

<!-- !test out repl bigint outside i64 range -->
```
QNT600] Integer literal 9223372036854775808 is outside i64 range
```

