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

### Legacy Apalache configuration is rejected cleanly

<!-- !test in legacy Apalache config -->
```
quint verify --apalache-config=./testFixture/apalache/legacyConfig.json ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err legacy Apalache config -->
```
error: $.input: Unknown configuration key.
```

### Verifying spec with invalid init param produces an error

<!-- !test in invalid init -->
```
quint verify --init=invalidInit ../examples/language-features/booleans.qnt
```

<!-- !test exit 1 -->
<!-- !test err invalid init -->
```
error: [QNT404] Name 'invalidInit' not found
error: Argument error
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

### Apalache: Can verify with single temporal property (with confirmation)

Apalache has experimental support for temporal properties, so the user must confirm.

<!-- !test check Apalache can specify --temporal with confirmation -->
```
echo "y" | quint verify --temporal eventuallyOne ./testFixture/apalache/temporalTest.qnt
```

### Apalache: Can verify with two temporal properties (with confirmation)

<!-- !test check Apalache can specify multiple temporal props with confirmation -->
```
echo "y" | quint verify --temporal eventuallyOne,eventuallyFive ./testFixture/apalache/temporalTest.qnt
```

### Apalache: Temporal violations are reported with traces (with confirmation)

<!-- !test in Apalache prints a trace on temporal violation -->
```
output=$(echo "y" | quint verify --temporal eventuallyZero ./testFixture/apalache/temporalTest.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err Apalache prints a trace on temporal violation -->
```

  WARNING: Apalache has experimental support for temporal properties and might give incorrect results.
  Consider using --backend tlc, which fully supports temporal properties.

Do you want to proceed with Apalache anyway? (y/N) error: found a counterexample
```

<!-- !test out Apalache prints a trace on temporal violation -->
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

### TLC: Can verify with single temporal property

TLC fully supports temporal properties, so no confirmation is needed.

<!-- !test check TLC can specify --temporal -->
```
quint verify --backend tlc --temporal eventuallyOne ./testFixture/apalache/temporalTest.qnt
```

### TLC: Can verify with two temporal properties

FIXME: `eventuallyFive` breaks with stuttering as we are not providing fairness assumptions. Using the `SPEC` TLC config might be a workaround.

<!-- !test check TLC can specify multiple temporal props -->
```
quint verify --backend tlc --temporal eventuallyOne,eventuallyOne ./testFixture/apalache/temporalTest.qnt
```

### TLC: Temporal violation is detected

<!-- !test in TLC detects temporal violation -->
```
quint verify --backend tlc --temporal eventuallyZero ./testFixture/apalache/temporalTest.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC detects temporal violation -->
```
error: found a counterexample
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

### TLC: `leadsTo` holds with fairness on a deterministic counter

On a counter cycling 0->1->2->0, `n==0 leadsTo n==2` holds with weak fairness.
Without fairness, TLC finds an infinite stuttering path (n=1 then stutter forever).

<!-- !test check TLC leadsTo holds -->
```
quint verify --backend tlc --temporal zeroLeadsToTwo ./testFixture/apalache/tlcLeadsTo.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `always(eventually(...))` holds with fairness on a counter

<!-- !test check TLC alwaysEventuallyZero holds -->
```
quint verify --backend tlc --temporal alwaysEventuallyZero ./testFixture/apalache/tlcLeadsTo.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `leadsTo` is a violation when p never leads to q

`n==0 leadsTo n==5` never holds since n is always in {0,1,2}.

<!-- !test in TLC leadsTo violation -->
```
quint verify --backend tlc --temporal zeroLeadsToFive ./testFixture/apalache/tlcLeadsTo.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC leadsTo violation -->
```
error: found a counterexample
```

### TLC: `leadsTo` is a violation without fairness

Without fairness, TLC finds an infinite stuttering path, violating even
properties that would hold in fair executions.

<!-- !test in TLC leadsTo no fairness violation -->
```
quint verify --backend tlc --temporal zeroLeadsToTwoNoFairness ./testFixture/apalache/tlcLeadsTo.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC leadsTo no fairness violation -->
```
error: found a counterexample
```

### `weakFair` implies `leadsTo` holds

With weak fairness for `finish`, `not(done) leadsTo done` holds because
`finish` is continuously enabled when `done=false` and must eventually fire.

<!-- !test check weakFair leadsTo holds -->
```
quint verify --backend tlc --temporal notDoneLeadsToDone ../examples/language-features/weakFairness.qnt 2>&1 | grep '\[ok\]'
```

### `leadsTo` without fairness is a violation (non-deterministic spec)

In a non-deterministic spec, the stuttering branch can be chosen forever.

<!-- !test in leadsTo non-det no fairness violation -->
```
quint verify --backend tlc --temporal notDoneLeadsToDoneNoFairness ../examples/language-features/weakFairness.qnt
```

<!-- !test exit 1 -->
<!-- !test err leadsTo non-det no fairness violation -->
```
error: found a counterexample
```

### TLC: `eventuallyHundredDegrees` holds with weak and strong fairness

With weak fairness over `step` and strong fairness on `turnOffBySensor`, the kettle
eventually reaches `HundredDegrees`. `turnOffBySensor` is infinitely often enabled,
but not constantly, so it needs strong fairness.

<!-- !test check TLC kettle eventuallyHundredDegrees holds -->
```
quint verify --backend tlc --temporal eventuallyHundredDegrees ../examples/language-features/strongFairness.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `eventuallyHundredDegrees` is a violation with weak fairness only

With weak fairness alone, TLC can choose `turnOff` instead of `turnOffBySensor`
every single time, so the kettle never reaches `HundredDegrees`.

<!-- !test in TLC kettle eventuallyHundredDegrees weak only violation -->
```
quint verify --backend tlc --temporal eventuallyHundredDegreesWeakOnly ../examples/language-features/strongFairness.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC kettle eventuallyHundredDegrees weak only violation -->
```
error: found a counterexample
```

### TLC: ewd840 liveness holds with `weakFair` and `leadsTo`

The main liveness property of ewd840: once all nodes are inactive, termination
is eventually detected. Uses `System.weakFair(vars) implies (... leadsTo ...)`.

<!-- !test check TLC ewd840 liveness -->
```
quint verify --backend tlc --temporal liveness --main ewd840_3 ../examples/classic/distributed/ewd840/ewd840.qnt 2>&1 | grep '\[ok\]'
```

### TLC: ewd840 `falseLiveness` is a violation

`falseLiveness` does not hold: it requires each node to always eventually
terminate, which the spec does not guarantee (a node may be re-activated).

<!-- !test in TLC ewd840 falseLiveness violation -->
```
quint verify --backend tlc --temporal falseLiveness --main ewd840_3 ../examples/classic/distributed/ewd840/ewd840.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC ewd840 falseLiveness violation -->
```
error: found a counterexample
```

## TLC: Action properties

The examples from Hillel Wayne's "Action Properties"
(https://www.hillelwayne.com/post/action-properties/), in
`./testFixture/apalache/actionProperties.qnt`, with one module per example.

### TLC: `intro`: `[][x' > x]_x` holds

<!-- !test check TLC action properties intro increasing -->
```
quint verify --backend tlc --main=intro --temporal=increasing ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `intro`: `[][x' > x + 1]_x` is violated

<!-- !test in TLC action properties intro jumpsViolated -->
```
quint verify --backend tlc --main=intro --temporal=jumpsViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties intro jumpsViolated -->
```
error: found a counterexample
```

### TLC: `intro`: `[][Next]_x` holds

<!-- !test check TLC action properties intro nextHolds -->
```
quint verify --backend tlc --main=intro --temporal=nextHolds ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `conditional`: `[][x' /= x => y' = x]_<<x, y>>` holds

<!-- !test check TLC action properties conditional lockstep -->
```
quint verify --backend tlc --main=conditional --temporal=lockstep ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `conditional`: `[][Machine => Inv']_vars` holds

<!-- !test check TLC action properties conditional machineKeepsInv -->
```
quint verify --backend tlc --main=conditional --temporal=machineKeepsInv ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `conditional`: `[][disabled => UNCHANGED x]_<<disabled, x>>` is violated

<!-- !test in TLC action properties conditional killSwitchViolated -->
```
quint verify --backend tlc --main=conditional --temporal=killSwitchViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties conditional killSwitchViolated -->
```
error: found a counterexample
```

### TLC: `conditional`: `[][World => Inv']_vars` is violated

<!-- !test in TLC action properties conditional worldKeepsInvViolated -->
```
quint verify --backend tlc --main=conditional --temporal=worldKeepsInvViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties conditional worldKeepsInvViolated -->
```
error: found a counterexample
```

### TLC: `credits`: ownership changes because of accepted offers

<!-- !test check TLC action properties credits changeProp -->
```
quint verify --backend tlc --main=credits --temporal=changeProp ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `creditsUnguarded`: ownership changes because of accepted offers is violated without the ownership guard

<!-- !test in TLC action properties creditsUnguarded changePropViolated -->
```
quint verify --backend tlc --main=creditsUnguarded --temporal=changePropViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties creditsUnguarded changePropViolated -->
```
error: found a counterexample
```

### TLC: `serverStatus`: no `Offline` to `Online` transition

<!-- !test check TLC action properties serverStatus noSkipBoot -->
```
quint verify --backend tlc --main=serverStatus --temporal=noSkipBoot ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `serverStatus`: no `Booting` to `Online` transition is violated

<!-- !test in TLC action properties serverStatus neverOnlineViolated -->
```
quint verify --backend tlc --main=serverStatus --temporal=neverOnlineViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties serverStatus neverOnlineViolated -->
```
error: found a counterexample
```

### TLC: `transitions`: `[][<<state, state'>> \in Transitions]_state` holds

<!-- !test check TLC action properties transitions validTransitions -->
```
quint verify --backend tlc --main=transitions --temporal=validTransitions ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `transitions`: never going from `C` to `A` is violated

<!-- !test in TLC action properties transitions neverBackToAViolated -->
```
quint verify --backend tlc --main=transitions --temporal=neverBackToAViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties transitions neverBackToAViolated -->
```
error: found a counterexample
```

### TLC: `conditionalTransitions`: `[][T = <<A, B>> => x' > x]_<<state, x>>` holds

<!-- !test check TLC action properties conditionalTransitions abIncrements -->
```
quint verify --backend tlc --main=conditionalTransitions --temporal=abIncrements ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `conditionalTransitions`: `[][x' < x => T = <<A, C>>]_<<state, x>>` holds

<!-- !test check TLC action properties conditionalTransitions onlyAcDecrements -->
```
quint verify --backend tlc --main=conditionalTransitions --temporal=onlyAcDecrements ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `conditionalTransitions`: `[][T = <<C, B>> => x' > x]_<<state, x>>` is violated

<!-- !test in TLC action properties conditionalTransitions cbIncrementsViolated -->
```
quint verify --backend tlc --main=conditionalTransitions --temporal=cbIncrementsViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties conditionalTransitions cbIncrementsViolated -->
```
error: found a counterexample
```

### TLC: `concurrentTransitions`: all machines follow the transitions

<!-- !test check TLC action properties concurrentTransitions machinesTransitions -->
```
quint verify --backend tlc --main=concurrentTransitions --temporal=machinesTransitions ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `concurrentTransitions`: all machines follow the transitions is violated with an adversary

<!-- !test in TLC action properties concurrentTransitions machinesTransitions with adversarialStep -->
```
quint verify --backend tlc --main=concurrentTransitions --step=adversarialStep --temporal=machinesTransitions ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties concurrentTransitions machinesTransitions with adversarialStep -->
```
error: found a counterexample
```

### TLC: `lock`: the lock is released before being acquired by another thread

<!-- !test check TLC action properties lock lockRelease -->
```
quint verify --backend tlc --main=lock --temporal=lockRelease ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `lock`: the lock is released before being acquired by another thread is violated when stealing it

<!-- !test in TLC action properties lock lockRelease with stealingStep -->
```
quint verify --backend tlc --main=lock --step=stealingStep --temporal=lockRelease ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties lock lockRelease with stealingStep -->
```
error: found a counterexample
```

### TLC: `appendOnlyLog`: the log is append-only

<!-- !test check TLC action properties appendOnlyLog appendOnly -->
```
quint verify --backend tlc --main=appendOnlyLog --temporal=appendOnly ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `appendOnlyLog`: the log is frozen once non-empty is violated

<!-- !test in TLC action properties appendOnlyLog logFrozenViolated -->
```
quint verify --backend tlc --main=appendOnlyLog --temporal=logFrozenViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties appendOnlyLog logFrozenViolated -->
```
error: found a counterexample
```

### TLC: `stickyFlag`: `[][flag => flag']_flag` holds

<!-- !test check TLC action properties stickyFlag flagSticks -->
```
quint verify --backend tlc --main=stickyFlag --temporal=flagSticks ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `stickyFlag`: `[][~flag => ~flag']_flag` is violated

<!-- !test in TLC action properties stickyFlag neverSetViolated -->
```
quint verify --backend tlc --main=stickyFlag --temporal=neverSetViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties stickyFlag neverSetViolated -->
```
error: found a counterexample
```

### TLC: `nonNull`: a value doesn't go back to `None`

<!-- !test check TLC action properties nonNull staysNonNull -->
```
quint verify --backend tlc --main=nonNull --temporal=staysNonNull ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `nonNull`: a value doesn't change once set is violated

<!-- !test in TLC action properties nonNull frozenOnceSetViolated -->
```
quint verify --backend tlc --main=nonNull --temporal=frozenOnceSetViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties nonNull frozenOnceSetViolated -->
```
error: found a counterexample
```

### TLC: `clientQueue`: the current client doesn't change while it has messages

<!-- !test check TLC action properties clientQueue stickyClient -->
```
quint verify --backend tlc --main=clientQueue --temporal=stickyClient ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `clientQueue`: the current client doesn't change while it has messages is violated when switching at any time

<!-- !test in TLC action properties clientQueue stickyClient with impatientStep -->
```
quint verify --backend tlc --main=clientQueue --step=impatientStep --temporal=stickyClient ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties clientQueue stickyClient with impatientStep -->
```
error: found a counterexample
```

### TLC: `notes`: `[]<><<Machine>>_x` holds with fairness

<!-- !test check TLC action properties notes machineInfinitelyOften -->
```
quint verify --backend tlc --main=notes --temporal=machineInfinitelyOften ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `notes`: `[]<><<Machine>>_x` is violated without fairness

<!-- !test in TLC action properties notes machineInfinitelyOftenViolated -->
```
quint verify --backend tlc --main=notes --temporal=machineInfinitelyOftenViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties notes machineInfinitelyOftenViolated -->
```
error: found a counterexample
```

### TLC: `notes`: `<>[][World => Safe]_vars => []<>Safe` holds with fairness

<!-- !test check TLC action properties notes rareWorldResilient -->
```
quint verify --backend tlc --main=notes --temporal=rareWorldResilient ./testFixture/apalache/actionProperties.qnt 2>&1 | grep '\[ok\]'
```

### TLC: `notes`: `<>[][World => Safe]_vars => []<>Safe` is violated without fairness

<!-- !test in TLC action properties notes rareWorldResilientViolated -->
```
quint verify --backend tlc --main=notes --temporal=rareWorldResilientViolated ./testFixture/apalache/actionProperties.qnt
```

<!-- !test exit 1 -->
<!-- !test err TLC action properties notes rareWorldResilientViolated -->
```
error: found a counterexample
```
