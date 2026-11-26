# Verification methods

Each property is verified by one of four methods. This reference gives the commands that probe and
run each method. It also gives the claim that a result of each method makes, and what rules the
method out.
In the commands below, `<spec>` is the spec's path, `<main>` is its main module, and `<instance>` is
the module that gives the constants values.

| Method         | Verifies                                | Probe                 | Run budget            |
|----------------|-----------------------------------------|-----------------------|-----------------------|
| model checking | invariants, temporal properties, observations | 120 s on the instance | 10 minutes for each run |
| induction      | invariants                              | 120 s per invariant   | 5 minutes per invariant, and the search for a strengthening |
| lean           | invariants, temporal properties         | none                  | 30 minutes for the check of the proofs |
| simulation     | invariants, observations                | 30 s, 1000 traces     | 10 minutes, 10000 traces |

## Probes

A probe is a short run of a method, which tells whether the method can verify the spec at all. Each
probe is stopped at its cap, for example with `timeout 60`. A probe that is stopped did not finish,
and a probe that did not finish does not rule its method out, since a run has a larger budget.

- Model checking, once for all invariants and observations:
  `quint verify <spec> --backend veil --main <instance> --search-observations`. The first check of a
  spec compiles Veil's checker, which takes from 20 seconds to more than a minute on a busy machine.
  That is why this probe gets 120 seconds.
- Induction, once for each invariant, on the main module, where every constant is left open:
  `quint verify <spec> --backend veil --main <main> --inductive-invariant <invariant>`. A probe that
  proves its invariant also checks, in its last phase, that the invariant implies the spec's other
  invariants, as `[3/3] Checking whether the inductive invariant 'q' implies 'p and q'` does.
- Veil's invariant synthesizer, for each invariant whose induction probe found a counterexample to
  induction, for up to 10 minutes:
  `quint verify <spec> --backend veil --main <main> --synthesize-invariant <invariant>`.
  It prints `[ok] Found an inductive invariant that proves <invariant>` and the clauses, or that Veil
  found none. The clauses can differ from run to run, so keep the clauses of the probe for the run.
- Simulation, once for all invariants:
  `quint run <spec> --main <instance> --max-samples 1000`.

A command ends in one of these ways:

| Ending                                     | Outcome of the probe |
|--------------------------------------------|----------------------|
| `[ok]`                                     | passed, or proved for induction |
| `[violation]`                              | violated, or a counterexample to the inductive step for induction |
| an error that says that something `is not supported` | refused |
| any other error                            | failed |
| stopped at the cap                         | not finished, or undecided for induction |

An induction probe that fails prints the action whose step fails, such as `the inductive invariant
fails after aborts`. That action is the evidence of the option.

## Options

Every method gets an option for every property, in the order of the table above. An option is
one of these:

- `yes`, which means that the method is possible;
- `no`, which means that it is impossible;
- `not yet`, which means that the method could verify the property once Quint supports it;
- `maybe`, which means that the method works only if the run finds what the probe was missing within
  its budget.

A possible option has a drawback, and an option that is not possible has a reason, which is called its
"why not". An option that is possible, `not yet` or `maybe` also states the claim that a result of the
method would make, since the claim tells the user what the method would add. An option that is not
possible has no claim.

Methods that never verify a property of the kind are not possible, with these reasons:

- induction, for a temporal property or an observation: "Induction proves only invariants."
- simulation, for a temporal property: "Simulation does not check temporal properties."
- lean, for an observation: "A proof shows that every state satisfies a property, and an observation
  asks whether some state is reached."

When the spec declares constants and no module gives them values, model checking and simulation are
not possible: "No module gives the constants values, and <method> runs on given values." Offer to
write an instance.

The probes decide the rest:

| Probe outcome  | Model checking or simulation | Induction |
|----------------|------------------------------|-----------|
| passed         | yes, with the states or traces that the probe covered | yes, "The probe proved it in <time>." |
| violated       | yes, "The probe found a violation in <time>." | decided by the synthesizer's probe, as the paragraph below says. The evidence names the action whose step fails. |
| not finished   | yes, with the drawback "The run gets <budget>, and it may not finish either." | yes, with the drawback "The run gets 5 minutes, and it may end undecided too." |
| refused        | no, "Veil's model checking does not support this spec: <error>" | no, "The SMT encoding does not support this spec: <error>" |
| failed         | no, "<Method> failed: <error>" | no, "Induction failed: <error>" |

In the SMT encoding, a read of a map at a missing key is an unspecified value, as in Apalache, so no
spec is refused for its map reads. `quint verify` adds the invariant that states the keys of a map by
itself when static analysis shows that the keys never change, as for `stages' = participants.mapBy(p =>
Working)` in `init` and `stages.put(p, …)` with `p` drawn from `participants` in the actions. That
invariant rules out counterexamples at missing keys. `quint verify` says so in its output, and it proves
the invariant together with the rest.

When the induction probe of an invariant fails, the synthesizer's probe decides its option. A
strengthening that the synthesizer found makes the option `yes`, with the evidence "Veil's synthesizer
found <n> strengthening clauses in <time>." Otherwise the option is `maybe`, "It is not inductive on its
own. The run gives the agent up to 30 minutes to look for invariants that make it inductive, and falls
back to model checking and a bounded symbolic check if it finds none."

An invariant `p` that its own probe did not prove can be proved through another invariant `q`, when
the probe of `q` proved `q` and found that `q` implies `p`. Induction is then `yes` for `p`, with the
evidence "Proved through `q`, which implies it." This happens when the spec already declares an
invariant `q` that strengthens `p`, usually because an earlier run found it.

Lean is possible for an invariant or a temporal property unless the model-checking probe was refused,
since a proof loads the spec as model checking does. Its drawback is "You or your agent write the proof,
which can take hours. The theorem is stated for you, and the proof is checked by
`quint verify --proofs`." For a temporal property, the drawback adds "The proof is longer than a proof
of an invariant, and it needs a proof of each invariant that it assumes."

A temporal property is not probed, since each temporal property is model checked in a run of its own.
Its model-checking option is possible unless the probe refused the spec.

Two drawbacks are added where they apply:

- model checking and simulation, when the spec declares constants: "It covers only <the values of the
  instance>, not <every value>."
- simulation: "A violation that none of the traces reaches is missed", or for an observation, "A state
  that none of the traces reaches is missed."

## Claims

A claim is written in the spec's terms. `<every value>` names the constants, such as "any number of
participants" for a set `participants`, or "any value of `N`" for another constant. `<the instance>`
names the values that the instance gives, such as "3 participants (p1, p2, p3)".

| Kind        | Method         | Claim |
|-------------|----------------|-------|
| invariant   | model checking | `p` holds in every reachable state with <the instance>. |
| invariant   | induction, lean | `p` holds in every reachable state, for <every value>. |
| invariant   | simulation     | No violation of `p` is seen in the 10000 traces that are run with <the instance>. |
| invariant   | bounded symbolic check | `p` holds in every execution of up to 8 steps, for <every value>. |
| temporal    | model checking | `p` holds on every execution with <the instance>. |
| temporal    | lean           | `p` holds on every execution, for <every value>. |
| observation | model checking | Either an execution with <the instance> reaches a state where `p` holds, or no execution does. |
| observation | simulation     | An execution with <the instance> that reaches a state where `p` holds may be found in the 10000 traces that are run. When none is found, nothing is claimed. |

## Runs

A run uses the commands of the probes with the run budgets, and with the properties that the plan
gave to each method:

- Model checking, for the invariants and observations:
  `quint verify <spec> --backend veil --main <instance> --invariants <invariants> --search-observations`.
  With no invariant, `--no-invariant` replaces `--invariants`. The command stops at the first violated
  invariant, so it is run again without that invariant until no invariant is violated.
- Model checking, for each temporal property in a run of its own:
  `quint verify <spec> --backend veil --main <instance> --temporal <property> --no-invariant`.
- Induction, for each invariant: the command of its probe. For an invariant `p` that is proved through
  another invariant `q`:
  `quint verify <spec> --backend veil --main <main> --inductive-invariant <q> --invariants <p>`.
- Induction, for an invariant `p` whose option is `yes` because the synthesizer's probe found a
  strengthening: write each of its clauses as a `val` in a copy of the spec outside the project, as
  [Clauses of the synthesizer](#clauses-of-the-synthesizer) says. Then check the conjunction with
  `quint verify <copy> --backend veil --main <main> --inductive-invariant '<conjunction>'
  --invariants <p>`. The result of `p` is `proved` once that check passes, and the strengthening is
  offered as for `maybe`. When the translation does not check, the run goes on as for `maybe`.
- Induction, for an invariant `p` whose option is `maybe`: the run looks for a strengthening, which is
  a set of invariants that is inductive together with `p`. It works on a copy of the spec outside the
  project, and it tries these steps in order:
  1. Model check `p` on the instance, in the same run as the observations, so that the fallback's first
     result exists before the search starts.
  2. When the plan said that the spec looks small enough, the agent searches for up to 30 minutes of
     wall-clock time:
     - Run the induction check on the conjunction of `p` and the invariants found so far.
     - When the step fails, read the state before the failing step. The conjunction allows that state,
       but the protocol never reaches it. Write one invariant that is false in that state and that is
       true in every reachable state, as a `val` in the copy. The new invariant does not have to be
       inductive on its own, since only the whole conjunction has to be.
     - Model check the new invariants on the instance, all of them in one run of `--invariants`, since
       each run compiles the checker again. Drop a candidate that is violated.
     - Repeat until the induction check passes or the budget runs out.
  3. When no strengthening is found, run the fallback's second check, the bounded symbolic check:
     `quint verify <copy> --backend veil --main <main> --invariants <p> --symbolic --max-steps 8`. It
     checks every execution of 0 to 8 steps, and it prints `✓ <p> holds in every execution of up to 8
     steps` for each invariant. A query that the solver doesn't answer is reported as undecided.

  When a strengthening is found, offer to add it to the spec as one `invariant` that conjoins it with
  `p`. When none is found, the result of `p` is `checked` on the instance and `bounded` for every value
  of the constants, and the report lists the invariants that were found so far.
  [How to Write Inductive Invariants](https://quint-lang.org/posts/inductive_invariants) explains the
  agent's search.
- The fallback, for an invariant `p` that the plan gave to it: model check `p` on the instance, in the
  same run as the other invariants and the observations. Unless the induction probe of `p` was refused,
  which means that the SMT encoding does not load the spec, also run the bounded symbolic check:
  `quint verify <spec> --backend veil --main <main> --invariants <p> --symbolic --max-steps 8`.
  The result of `p` is `checked` on the instance, and `bounded` for every value of the constants when
  the bounded symbolic check finds no violation.
- Simulation, for the invariants and observations:
  `quint run <spec> --main <instance> --max-samples 10000 --invariants <invariants> --verbosity 2`.
  With no invariant, `--no-invariant` replaces `--invariants`. The observations are counted under
  `Observations:`.
- Lean: see [the obligations](#lean-obligations).

Each result is reported in one word, and each word has one meaning:

| Word                    | Meaning |
|-------------------------|---------|
| `proved`                | induction or Lean showed that the invariant holds, for every value of the constants |
| `checked`               | model checking found no violation on the instance |
| `tested`                | simulation found no violation in the traces that it ran |
| `reached`               | an execution reaches the observation |
| `unreachable`           | model checking showed that no execution of the instance reaches the observation |
| `not seen`              | simulation reached no state of the observation, which proves nothing |
| `violated`              | a trace breaks the property |
| `bounded`               | the bounded symbolic check found no violation in executions of up to 8 steps, for every value of the constants |
| `undecided`             | the solver gave no answer within the budget |
| `not finished`          | the budget ran out |
| `cannot be checked yet` | the command refused the spec or the property |

A `tested` or `checked` result is never called proved.

## What each result relies on

| Method         | What the result relies on |
|----------------|------------------------|
| model checking | the embedding of Quint in Lean, Veil's model checker, and the Lean and C compilers that build the checker |
| induction      | the embedding, Veil, and the SMT solver, whose answers Lean's kernel doesn't check |
| lean           | the embedding, Veil's definitions, and Lean's kernel, which checks every step of the proof |
| lean, with `--trust-smt` | what lean relies on, and the SMT solver for the goals that it answered |
| induction, with a strengthening from the synthesizer | what induction relies on. The synthesizer's certificate is checked by Lean's kernel, but it covers the clauses in Lean rather than their Quint translation |
| bounded symbolic check | the embedding, Veil, and the SMT solver, for executions of up to 8 steps |
| simulation     | Quint's simulator, and only for the traces that it ran |

## Clauses of the synthesizer

The synthesizer prints a strengthening as clauses over the encoding's view of the state, after a line
such as `Veil found 8 strengthening clauses, at frame 5:`. Each clause is written in
Quint this way:

- `messages_X` is `messages.contains(X)`, and `messages_X x0` is `messages.contains(X(x0))`.
- A map `stages x0` is `stages.get(x0)`, and a set `votes x0` is `votes.contains(x0)`. A constant set
  is written the same way, so `participants x0` is `participants.contains(x0)`.
- `∀ (x0 : str), …` ranges over the set that the keys of the map equal, as in
  `participants.forall(x0 => …)`.
- `x0 = x1` and `x0 ≠ x1` are `x0 == x1` and `x0 != x1`.

The line that starts with `Certified:` says that Lean's kernel checked the strengthening in Lean, on
the axioms that it lists. The report gives that certificate, and it says that the check of the Quint
translation trusts the SMT solver.

## Lean obligations

The properties that the plan proves in Lean are stated in one Lean file, which is named
`<spec name>_proofs.lean`. The file states one theorem for each property, with `sorry` in place of the
proof. For example, a plan that proves `consistency` of `two_phase_commit.qnt` in Lean gets this file:

```lean
module

public import Quint

/-! The proof obligations of the verification plan of `two_phase_commit.qnt`. Each theorem states
`holds% p`: the invariant `p` holds in every reachable state, for every value of the constants. A
theorem of a temporal property `p` states `holds_temporal% p`: every behavior satisfies `p`, for every
value of the constants. A proof counts when this command accepts it. On Lean's standard axioms alone, a `sorry` or a trusted
SMT answer does not count. When the plan trusts the SMT solver, the command also has `--trust-smt`, and
a trusted answer counts, but a written `sorry` still does not:

    quint verify two_phase_commit.qnt --backend veil --main two_phase_commit --proofs <this file> --invariants consistency

The command loads the spec itself, whatever path `quint_module` names, and refuses an option that
changes the spec. `invariants`, `temporalProps`, `smt` and `declared` are kept. `invariants` names every
invariant that a theorem proves, and the command checks none that it does not name. `temporalProps`
names exactly the temporal properties that a theorem proves, since they decide the actions of the
module. A proof may import other Lean
files of the folder of this file, and each of them that loads the spec loads it with the options of
this file. -/

quint_module "two_phase_commit.qnt" (main := two_phase_commit) (invariants := [consistency])

/-- `consistency` holds in every reachable state, for any number of participants. -/
theorem consistency_holds : holds% consistency := by
  sorry

end two_phase_commit
```

The theorem of a property `p` is named `p_holds`, which is how the check finds it. A temporal property
`q` is named in `(temporalProps := [q])` of `quint_module`, and its theorem states `holds_temporal% q`. A name that is not
a Lean identifier is written between guillemets, as `«p»`. The comment above each theorem is the
claim of the Lean option.

The proofs are checked by this command, with the path of the file and every property that it proves:

```sh
quint verify <spec> --backend veil --main <main> --proofs <file> --invariants <invariants> --temporal <temporal properties>
```

`--invariants` or `--temporal` is left out when the file proves no property of its kind.

When the plan trusts the SMT solver, `--trust-smt` is added to the command. A property whose proof
rests on the solver's answers is then reported as `proved, trusting the SMT solver`, and the report
says so in what the result relies on.

The command answers `proved` or `not proved` for each property, with the reason. An error in any file
of the proof leaves every property `not proved`, since the proof is not finished. Lean's errors are
given at the path and the line of the file that has them.
