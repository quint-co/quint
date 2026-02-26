# TypeScript backend - REPL tests

Integration tests for the Quint REPL with the TypeScript backend.

<!-- !test program
bash -
-->

### OK on repl input

<!-- !test check repl 1 + 1 -->
    quint --backend=typescript "1 + 1"

<!-- !test check repl with multiple cmds -->
    quint --backend=typescript "1 + 1" "2 + 2"

<!-- !test check repl 1 + 1 with echo -->
    echo "1 + 1" | quint --backend=typescript

### OK REPL tutorial

The REPL tutorial is reproducible in REPL.

<!-- !test check REPL tutorial cli -->
```
if [ "$UNAME" == "Linux" -o "$UNAME" == "Darwin" ]; then
  quint --backend=typescript -q -r ../tutorials/repl/kettle.qnt::kettle <../tutorials/repl/replTestIn.txt \
    | diff - ../tutorials/repl/replTestOut.txt
fi
# else diff does not work as expected on windows
```

### Repl loads a file with -r

<!-- !test in repl loads a file -->
```
echo -e "import counters.* \n init \n n" | quint --backend=typescript -r ../examples/language-features/counters.qnt --verbosity 1 2>&1 | tail -n +3
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
quint --backend=typescript -r ../examples/language-features/counters.qnt::counters init .exit 2>&1 | tail -n +3
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
quint --backend=typescript -r ../examples/language-features/imports.qnt::E init .exit 2>&1 | tail -n 4
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
  | quint --backend=typescript 2>&1 | tail -n +3
```

<!-- !test out repl loads a file with .load -->
```
>>> >>> 
```

### Repl saves a file with .save and loads it back

<!-- !test in repl saves a file with .save and loads it back -->
```
echo ".save tmp-counters.qnt" \
  | quint --backend=typescript -r ../examples/language-features/counters.qnt::counters 2>&1 \
  | tail -n +3
# do not auto-import counters, as it is imported already
echo "init" \
  | quint --backend=typescript -r tmp-counters.qnt 2>&1 \
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
quint --backend=typescript -r ../examples/language-features/imports.qnt::imports init "MyF::ExportedBasics::double(2)" .exit 2>&1 | tail -n 6
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
echo -e "1 +" | quint --backend=typescript | grep -o 'Error \[QNT000\]'
```

<!-- !test out repl malformed expressions -->
```
Error [QNT000]
```

### Repl evaluates coin

This is a regression test for #648.

<!-- !test in repl evaluates coin -->
```
quint --backend=typescript -r ../examples/tutorials/coin.qnt::coin init balances .exit --verbosity 1 2>&1 \
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

### OK REPL tutorial

The REPL tutorial is reproducible in REPL.

<!-- !test check REPL tutorial -->
```
cd ../examples/tutorials/repl/
make
quint --backend=typescript -q -r \
  kettle.qnt::kettle < replTestIn.txt \
    | diff - replTestOut.txt
cd - > /dev/null
```

### REPL prints command history

<!-- !test in repl prints command history -->
```
quint --backend=typescript -r ../examples/tutorials/repl/kettle.qnt --verbosity 1  | tail -n +2 | head -n 19
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
quint --backend=typescript -r ../examples/language-features/imports.qnt::imports init .exit --verbosity 1 2>&1 | tail -n 3
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
quint --backend=typescript -r ../examples/language-features/instances.qnt::instances "A1::f(1)" "A2::f(1)" ".exit" --verbosity 1 2>&1 | tail -n 5
```

<!-- !test out compile instances -->
```
>>> A1::f(1)
34
>>> A2::f(1)
16
>>> .exit
```

### Repl keeps right track of variables from instances

Incremental evaluation from the REPL interacting with instance flattening leads to state variables having different IDs on separate evaluations. This test ensures this case is well handled during evaluation.

<!-- !test in repl with instance vars -->

```
cd ../examples/cosmos/tendermint/
output=$(quint --backend=typescript -r TendermintModels.qnt::TendermintModels "n4_f1::Init" "n4_f1::round" ".exit" --verbosity 1 2>&1 | tail -n 5)
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

### Invoking `q::debug` in REPL prints values to stdout

<!-- !test in repl debug prints value to stdout and returns value -->

```
echo 'q::debug("value:", { foo: 42, bar: "Hello, World!" })' | quint --backend=typescript | tail -n +3
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
echo -e 'inexisting_name\n1 + 1' | quint --backend=typescript -q
```

<!-- !test out repl works after name error -->
```
static analysis error: 
 Error [QNT404]: Name 'inexisting_name' not found

  at <input-0>:0:1
  inexisting_name
  ^^^^^^^^^^^^^^^

2

```

### REPL continues to work after conflicting definitions

Regression for https://github.com/informalsystems/quint/issues/434

<!-- !test in repl works after conflict -->
```
echo -e 'def farenheit(celsius) = celsius * 9 / 5 + 32\ndef farenheit(celsius) = celsius * 9 / 5 + 32\nfarenheit(1)' | quint --backend=typescript -q
```

<!-- !test out repl works after conflict -->
```

static analysis error: 
 Error [QNT101]: Conflicting definitions found for name 'farenheit' in module '__repl__'

  at <input-0>:0:5
  def farenheit(celsius) = celsius * 9 / 5 + 32
      ^^^^^^^^^

static analysis error: 
 Error [QNT101]: Conflicting definitions found for name 'farenheit' in module '__repl__'

  at <input-1>:0:5
  def farenheit(celsius) = celsius * 9 / 5 + 32
      ^^^^^^^^^

33

```

### REPL continues to work after type errors

<!-- !test in repl works after type errors -->
```
echo -e 'def foo = 1 + "a"\nfoo\n1 + "a"\n1 + 1' | quint --backend=typescript -q
```

<!-- !test out repl works after type errors -->
```
static analysis error: 
 Error [QNT000]: Couldn't unify int and str
Trying to unify int and str
Trying to unify (int, int) => int and (int, str) => _t0


  at <input-0>:0:11
  def foo = 1 + "a"
            ^^^^^^^

static analysis error: 
 Error [QNT404]: Name 'foo' not found

  at <input-1>:0:1
  foo
  ^^^

static analysis error: 
 Error [QNT000]: Couldn't unify int and str
Trying to unify int and str
Trying to unify (int, int) => int and (int, str) => _t0


  at <input-2>:0:1
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
} | quint --backend=typescript -r ../examples/language-features/instances.qnt::instances --verbosity 1 2>&1 | tail -n10
```

<!-- !test out regression 428 -->
```
>>> static analysis error: 
 Error [QNT404]: Name 'amWrong' not found

  at <input-2>:0:1
  amWrong
  ^^^^^^^

>>> 
>>> true
>>> 
```

### REPL diff

<!-- !test in repl diff -->
```
quint --backend=typescript -r ../examples/language-features/counters.qnt::counters init OnPositive OnEven .exit | tail -n11
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
