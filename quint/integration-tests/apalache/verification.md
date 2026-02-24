# Integration tests against Apalache


All of the test inputs in the following test cases are commands executed by
`bash`.

We currently assume that the Apalache server has already been started. 
So before running these tests, in a separate terminal session, run

```
apalache-mc server
```

This requirement will be removed with https://github.com/informalsystems/quint/issues/823

<!-- !test program
bash -
-->

## Configuration errors

### Verifying spec with invalid init param produces an error

<!-- !test in invalid init -->
```
quint verify --init=invalidInit ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err invalid init -->
```
error: [QNT404] Name 'invalidInit' not found
error: name resolution failed
```


## Successful verification


### Can verify `../examples/classic/sequential/BinSearch/BinSearch.qnt`

Contains an import + const instantiation.

<!-- !test check can check BinSearch.qnt -->
```
quint verify --invariant=Postcondition --main=BinSearch10 ../examples/classic/sequential/BinSearch/BinSearch.qnt
```

<!-- !test check can check BinSearch10.qnt using APALACHE_DIST -->
```
APALACHE_DIST=_build/apalache quint verify --invariant=Postcondition --main=BinSearch10 ../examples/classic/sequential/BinSearch/BinSearch.qnt
```

### Default `step` and `init` operators are found

<!-- !test check can find default operator names -->
```
quint verify ../examples/verification/defaultOpNames.qnt
```

### Can verify with single invariant

<!-- !test check can specify --invariant -->
```
quint verify --invariant inv ../examples/verification/defaultOpNames.qnt
```

### Can verify with custom server endpoint

<!-- !test check can specify --server-endpoint -->
```
quint verify --server-endpoint=0.0.0.0:8822 --max-steps=2 ../examples/verification/defaultOpNames.qnt
```

### Can verify with two invariants

<!-- !test check can specify multiple invariants -->
```
quint verify --invariant inv,inv2 ../examples/verification/defaultOpNames.qnt
```

### Can verify `testFixture/apalache/genericRowParam.qnt`

<!-- !test check can verify genericRowParam.qnt -->
```
quint verify ./testFixture/apalache/genericRowParam.qnt
```

### Can verify `testFixture/apalache/polyStateVar.qnt`

<!-- !test check can verify polyStateVar.qnt -->
```
quint verify ./testFixture/apalache/polyStateVar.qnt
```

### Can compile `testFixture/apalache/inferredStateVar.qnt`

This one still not works with `quint verify` (see #1755)

<!-- !test check can compile inferredStateVar.qnt -->
```
quint compile --target tlaplus ./testFixture/apalache/inferredStateVar.qnt
```

## Violations

### Variant violations are reported with traces

<!-- !test in prints a trace on invariant violation -->
```
output=$(quint verify --invariant inv ./testFixture/apalache/violateOnFive.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err prints a trace on invariant violation -->
```
error: found a counterexample
```

<!-- !test out prints a trace on invariant violation -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 4 }

[State 4] { n: 5 }

[violation] Found an issue (duration).
```

### Variant violations write ITF to file when `--out-itf` is specified

<!-- !test in writes an ITF trace to file -->
```
output=$(quint verify --out-itf violateOnFive.itf.json --invariant inv ./testFixture/apalache/violateOnFive.qnt)
jq '."#meta".format' violateOnFive.itf.json
rm ./violateOnFive.itf.json
```

<!-- !test err writes an ITF trace to file -->
```
error: found a counterexample
```

<!-- !test out writes an ITF trace to file -->
```
"ITF"
```

## Deadlocks

<!-- !test in reports deadlock -->
```
output=$(quint verify ./testFixture/apalache/deadlock.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err reports deadlock -->
```
error: reached a deadlock
```

<!-- !test out reports deadlock -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 4 }

[State 4] { n: 5 }

[violation] Found an issue (duration).
```

## Violations are reported in normalized form

NOTE: without trace normalization, the last map in the state may show with keys
in any arbitrary order.

<!-- !test in trace normalization -->
```
output=$(quint verify ./testFixture/apalache/mapStateVar.qnt --invariant never_full)
exit_code=$?
echo "$output" | grep '\[State 3\]'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err trace normalization -->
```
error: found a counterexample
```

<!-- !test out trace normalization -->
```
[State 3] { data: Map("a" -> 42, "b" -> 42, "c" -> 42) }
```

## Temporal properties

### Can verify with single temporal property

<!-- !test check can specify --temporal -->
```
quint verify --temporal eventuallyOne ./testFixture/apalache/temporalTest.qnt
```

### Can verify with two temporal properties

<!-- !test check can specify multiple temporal props -->
```
quint verify --temporal eventuallyOne,eventuallyFive ./testFixture/apalache/temporalTest.qnt
```

### Temporal violations are reported with traces

<!-- !test in prints a trace on temporal violation -->
```
output=$(quint verify --temporal eventuallyZero ./testFixture/apalache/temporalTest.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err prints a trace on temporal violation -->
```
error: found a counterexample
```

<!-- !test out prints a trace on temporal violation -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 4 }

[State 4] { n: 5 }

[State 5] { n: 1 }

[violation] Found an issue (duration).
```

## Compiling to TLA+

### Test that we can compile to TLA+ of the expected form

<!-- !test in can convert ApalacheCompliation.qnt to TLA+ -->
```
quint compile --target tlaplus ./testFixture/ApalacheCompilation.qnt
```

<!-- !test out can convert ApalacheCompliation.qnt to TLA+ -->
```
-------------------------- MODULE ApalacheCompilation --------------------------

EXTENDS Integers, Sequences, FiniteSets, TLC, Apalache, Variants

VARIABLE
  (*
    @type: Int;
  *)
  x

(*
  @type: (() => A({ tag: Str }) | B(Int));
*)
A == Variant("A", [tag |-> "UNIT"])

(*
  @type: ((Int) => A({ tag: Str }) | B(Int));
*)
B(__BParam_31) == Variant("B", __BParam_31)

(*
  @type: ((a) => a);
*)
foo_bar(id__123_35) == id__123_35

(*
  @type: (() => Int);
*)
importedValue == 0

(*
  @type: (() => Int);
*)
ApalacheCompilation_ModuleToInstantiate_C == 0

(*
  @type: (() => Bool);
*)
altInit == x' := 0

(*
  @type: (() => Bool);
*)
step == x' := (x + 1)

(*
  @type: (() => Bool);
*)
altStep == x' := (x + 0)

(*
  @type: (() => Bool);
*)
inv == x >= 0

(*
  @type: (() => Bool);
*)
altInv == x >= 0

(*
  @type: (() => Int);
*)
ApalacheCompilation_ModuleToInstantiate_instantiatedValue ==
  ApalacheCompilation_ModuleToInstantiate_C

(*
  @type: (() => Bool);
*)
init ==
  x = importedValue + ApalacheCompilation_ModuleToInstantiate_instantiatedValue

(*
  @type: (() => Bool);
*)
q_step == step

(*
  @type: (() => Bool);
*)
q_init == init

================================================================================
```

### Test that we can compile to TLA+ of the expected form with CLI configs

We check that specifying `--init`, `--step`, and `--invariant` work as expected

<!-- !test in can convert ApalacheCompliation.qnt to TLA+ with CLI config -->
```
quint compile --target tlaplus \
  --init altInit --step altStep --invariant altInv \
  ./testFixture/ApalacheCompilation.qnt \
  | grep -e q_init -e q_step -e q_inv
```

<!-- !test out can convert ApalacheCompliation.qnt to TLA+ with CLI config -->
```
q_init == altInit
q_step == altStep
q_inv == altInv
```

### Test that we can compile to TLA+ of the expected form, specifying `--main`

<!-- !test in can convert ApalacheCompliation.qnt to TLA+ with alt main -->
```
quint compile --target tlaplus --main ModuleToImport ./testFixture/ApalacheCompilation.qnt
```

<!-- !test out can convert ApalacheCompliation.qnt to TLA+ with alt main -->
```
---------------------------- MODULE ModuleToImport ----------------------------

EXTENDS Integers, Sequences, FiniteSets, TLC, Apalache, Variants

(*
  @type: (() => Bool);
*)
step == TRUE

(*
  @type: (() => Int);
*)
importedValue == 0

(*
  @type: (() => Bool);
*)
init == TRUE

(*
  @type: (() => Bool);
*)
q_init == init

(*
  @type: (() => Bool);
*)
q_step == step

================================================================================
```

### Test that we can compile a module to TLA+ that instantiates but has no declarations


<!-- !test in can convert clockSync6.qnt to TLA+ -->
```
quint compile --target tlaplus ../examples/classic/distributed/ClockSync/clockSync6.qnt --main clock_sync4 | head
```

The compiled module is not empty:

<!-- !test out can convert clockSync6.qnt to TLA+ -->
```
------------------------------ MODULE clock_sync4 ------------------------------

EXTENDS Integers, Sequences, FiniteSets, TLC, Apalache, Variants

VARIABLE
  (*
    @type: Int;
  *)
  clock_sync4_clock_sync_time

```

### Test error case when something is re-used between init and step, on TLA+ compilation

<!-- !test in ApalacheCompliationError.qnt to TLA+ -->
```
quint compile --target tlaplus ./testFixture/ApalacheCompilationError.qnt 2> >(sed -E 's#(/[^ ]*/)testFixture/ApalacheCompilationError.qnt#HOME/ApalacheCompilationError.qnt#g' >&2)
```

<!-- !test exit 1 -->
<!-- !test err ApalacheCompliationError.qnt to TLA+ -->
```

 Error [QNT409]: Action A is used both for init and for step, and therefore can't be converted into TLA+. You can duplicate this with a different name to use on init. Sorry Quint can't do it for you yet.

  at HOME/ApalacheCompilationError.qnt:19:5
  19:     A,
          ^


 Error [QNT409]: Action parameterizedAction is used both for init and for step, and therefore can't be converted into TLA+. You can duplicate this with a different name to use on init. Sorry Quint can't do it for you yet.

  at HOME/ApalacheCompilationError.qnt:20:5
  20:     parameterizedAction(x),
          ^^^^^^^^^^^^^^^^^^^^^^

error: Failed to convert init to predicate
```

### Test error case when the inductive invariant "uses" variables before they are "assigned" 

Here we pass only `Inv` without the `TypeOK` definition

<!-- !test in bad inductive invariant -->
```
quint verify ../examples/classic/distributed/ewd840/ewd840.qnt --invariant TerminationDetection --inductive-invariant Inv --main ewd840_3
```

<!-- !test exit 1 -->
<!-- !test err bad inductive invariant -->
```
error: tpos is used before it is assigned. You need to have either `tpos == <expr>` or `tpos.in(<set>)` before doing anything else with `tpos` in your predicate.
```

### Shows which property broke when checking inductive invariants

Here we pass only `TypeOK` as the inductive invariant, which is not strong enough to imply `TerminationDetection`.

<!-- TODO: Re-enable once the Rust evaluator release includes the `evaluate-at-state-from-stdin` command -->
<!-- test in weak inductive invariant -->
```
output=$(quint verify ../examples/classic/distributed/ewd840/ewd840.qnt --invariant TerminationDetection --inductive-invariant TypeOK --main ewd840_3)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code

```

<!-- test exit 1 -->
<!-- test out weak inductive invariant -->
```
> [1/3] Checking whether the inductive invariant 'TypeOK' holds in the initial state(s) defined by 'init'...
> [2/3] Checking whether 'step' preserves the inductive invariant 'TypeOK'...
> [3/3] Checking whether the inductive invariant 'TypeOK' implies 'TerminationDetection'...
An example execution:

[State 0]
{
  ewd840_3::ewd840::active: Map(0 -> false, 1 -> true, 2 -> false),
  ewd840_3::ewd840::color: Map(0 -> "white", 1 -> "black", 2 -> "white"),
  ewd840_3::ewd840::tcolor: "white",
  ewd840_3::ewd840::tpos: 0
}

[violation] Found an issue (duration).
  ❌ TerminationDetection
```

### Can properly check an inductive invariant

<!-- !test in good inductive invariant -->
```
output=$(quint verify ../examples/classic/distributed/ewd840/ewd840.qnt --invariant TerminationDetection --inductive-invariant "TypeOK and Inv" --main ewd840_3)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 0 -->
<!-- !test out good inductive invariant -->
```
> [1/3] Checking whether the inductive invariant 'TypeOK and Inv' holds in the initial state(s) defined by 'init'...
> [2/3] Checking whether 'step' preserves the inductive invariant 'TypeOK and Inv'...
> [3/3] Checking whether the inductive invariant 'TypeOK and Inv' implies 'TerminationDetection'...
[ok] No violation found (duration).
You may increase --max-steps.
Use --verbosity to produce more (or less) output.
```

## TLC Backend

### TLC verifies a simple counter spec successfully

Test that TLC can verify a basic spec with state variables and invariants.

<!-- !test check TLC success -->
```
quint verify --backend tlc --invariant inv ./testFixture/apalache/tlcCounter.qnt 2>&1 | grep '\[ok\]'
```

### TLC reports error message on violation

Test that TLC properly detects and reports invariant violations.

<!-- !test check TLC violation -->
```
quint verify --backend tlc --invariant inv --max-steps=10 ./testFixture/apalache/violateOnFive.qnt 2>&1 | grep '\[violation\]'
```

### TLC reports configuration errors properly

Test that TLC reports errors when given invalid configuration.

<!-- !test check TLC config error -->
```
quint verify --backend tlc --init=nonExistentInit ./testFixture/apalache/tlcConfigError.qnt 2>&1 | grep 'error:'
```
