---
name: quint-verification
description: >
  Plan how each property of a Quint spec is verified, and run the plan: model checking, induction,
  a Lean proof or simulation, picked for each property together with the user. Use when the user
  asks how the properties of a `.qnt` spec should be checked or proved, asks to plan or run the
  verification of a spec, or wants a property proved for every value of the spec's constants or
  every argument of a pure Quint function. For
  writing the spec itself, use quint-modeling.
---

# Verification plans

A plan picks one method for each property of a spec, together with the user, and a run verifies each
property by its method. Use the `quint` CLI for system properties and Lean in a workspace with
Quint for standalone function theorems. [references/methods.md](references/methods.md) gives the
commands, claims and limits of each method.

Do not edit the project while planning or running verification. The only exceptions are the report
and the Lean file of obligations. Follow the user's `AGENTS.md` or `CLAUDE.md` for where to put those
files. Ask the user if the instructions do not specify a location.

For the Veil checks, `quint verify --backend veil` downloads Lean and Veil at its first run.
A standalone function proof needs a Lean workspace that can import Quint, but no model check.

## Plan

1. **Read the spec.** The system properties are the `invariant`, `temporal` and `observation` definitions of
   the main module, which is the module that the user names, or else the module that is named after
   the file. List the constants of the main module, and the instances: the modules that import the
   main module with a value for every constant, such as
   `import two_phase_commit(participants = Set("p1", "p2", "p3")).*`. Model checking and simulation run
   on one instance, and the smallest one is picked unless the user names another.
   Also inventory the contracts the user requests or the spec explicitly states about pure
   functions. Follow imports to the defining module, and read the contract even when it appears
   only in documentation. List a contract about all arguments as a **function theorem**, not as a
   state invariant. Don't invent a contract for every helper. This step ends when every property
   and contract in scope is listed with its kind.
2. **Probe.** Run the probes of [methods.md](references/methods.md#probes) one at a time, since a
   model-checking probe can use every core. Probe state properties only. An instance can exercise
   calls to a pure function but cannot probe its universal contract. This step ends when every
   applicable probe has passed, failed, or been stopped at its cap.
3. **Report a violation first.** When a probe found a violation, name the property that was violated
   before anything else. Say that the violation points to a bug in the spec, or in the code that the
   spec models, and show its trace.
4. **Show the options.** For each property, show a table with one line for each method. The line
   gives the following:
   - whether the method is possible;
   - its claim;
   - its drawback, or why it is not possible;
   - what its probe found.

   For a function theorem, list direct Lean as the proof method. Name the defining module in the
   `quint_library` declaration and give the `lake env lean` check command, even in a plan made
   before probes. Explain why execution of the caller cannot prove the contract for all arguments.

   [methods.md](references/methods.md#options) gives the words of each cell.
5. **Recommend.** Under each table, recommend one possible method, with a reason of one or two
   sentences. A claim for every value of the constants, which induction or Lean makes, is stronger than
   a claim for one instance, which model checking makes. Both are stronger than a claim about the
   traces that simulation ran. The recommendation follows this procedure for each property:
   - A temporal property gets model checking. Lean is offered as well, for a user who wants a claim for
     every value of the constants.
   - An observation gets model checking.
   - A function theorem gets a [direct Lean proof](references/methods.md#pure-function-theorems)
     over the embedded definition. Quantify over the contract's arguments and write its premises
     explicitly. Don't add state, wrap the contract in `holds%` or model check a caller as a
     substitute. A separate proof about a caller can reuse the theorem.
   - A functional invariant that is stated as a named state property gets Lean too. Prove the pure
     fact first and use it to discharge the reachable-state statement.
   - An invariant that its induction probe proved gets induction. So does an invariant that is proved
     through another invariant that implies it.
   - An invariant whose induction probe was refused, because the SMT encoding does not support the
     spec, gets the [fallback](#the-fallback). Lean is offered as well, for a user who wants a claim for
     every value of the constants.
   - An invariant whose induction probe found a counterexample to induction gets the synthesizer's
     probe, at the time of the plan, since the synthesizer costs no tokens and gives the same answer on
     every run. When the synthesizer found a strengthening, the invariant gets induction with that
     strengthening. When it found nothing and the spec looks small enough, the invariant gets
     "induction, with the agent's search for up to 30 minutes, and the fallback if the search finds
     nothing". Otherwise it gets the fallback, and the plan says that a strengthening looks like a lot
     of work.
   - Simulation is recommended only when no stronger method is possible or likely to finish. Say what
     it leaves unchecked.

   A spec looks small enough for the agent's search when these hold:
   - it has few state variables and few kinds of actions;
   - its types are sets and maps over enumerations and names;
   - its model checking finished with thousands of states rather than millions;
   - its counterexample to induction differs from a reachable state in few variables.

   Lists, arithmetic on unbounded integers, nested collections and many interleaving actions make the
   search a lot of work. These are signals, not thresholds. Whenever an invariant gets the synthesizer's
   probe, the plan says in one sentence which way the spec looks. It says so even when the synthesizer
   found a strengthening, because the run turns to the agent's search when the translation of the
   clauses into Quint does not check.

   Whether the SMT solver is trusted is recommended from what the spec describes. For a protocol or a
   system at a high level, recommend trusting it, so that a Lean proof is checked with `--trust-smt`
   and the solver's answers count without Lean's kernel checking them. For low-level or mathematical
   work, such as arithmetic, recommend that Lean's kernel checks every answer. Say it in one sentence
   below the tables, with the flag, the reason, and how the user changes it. No row of a table is
   added for it.

   When no option of a property is possible, say that the property cannot be checked yet, and quote
   each reason.
6. **Agree.** Ask the user whether each property is verified by the recommended method, or by another
   method that is possible. Nothing runs before the user agrees. The plan is the agreed method of each
   property, with the reason that was given for it. A property that the user leaves out is not
   checked. When the user changes whether the SMT solver is trusted, recommend again. Without that
   trust, Lean is preferred to induction for a claim for every value of the constants, since induction
   always trusts the solver.

For example, the options of `consistency` in a two-phase commit could be shown as this table:

| Method | Possible | Claim | Drawback, or why not | Probe |
|---|---|---|---|---|
| model checking | yes | `consistency` holds in every reachable state with 3 participants (p1, p2, p3). | It covers only 3 participants, not any number of participants. | 288 states in 22.7 s |
| induction | yes | `consistency` holds in every reachable state, for any number of participants. | It is not inductive on its own, so the run checks it together with the strengthening that Veil's synthesizer found. | The inductive step fails after `aborts`. Veil's synthesizer found 8 strengthening clauses in 6.7 minutes. |
| lean | yes | `consistency` holds in every reachable state, for any number of participants. | You or your agent write the proof, which can take hours. | |
| simulation | yes | No violation of `consistency` is seen in the 10000 traces that are run with 3 participants. | A violation that none of the traces reaches is missed. | 1000 traces in 0.8 s, no violation |

Induction would then be recommended, with the strengthening that the synthesizer found. Below the tables, the plan would say: "Lean proofs trust the
SMT solver (`--trust-smt`), since two-phase commit is a protocol at a high level. Say if you want Lean's
kernel to check every answer instead, and the flag is left out."

### The fallback

The fallback makes two bounded claims, which cover each other's gap. Model checking covers executions
of any length for the values of the instance. The bounded symbolic check covers every value of the
constants, for executions of up to 8 steps. It runs where the SMT encoding loads the spec, and the
report gives both results. [methods.md](references/methods.md#runs) gives the commands of the fallback.

## Run

1. **Run the checks.** Run the command of each agreed method, with its budget, as
   [methods.md](references/methods.md#runs) gives it. When a check finds a violation, tell the user at
   once, with the property and the length of its trace, and go on with the other checks. This step is
   done when every property of the plan has a result.
2. **Summarize.** Give each result in its word from [methods.md](references/methods.md#runs). A
   `tested` or `checked` result is never called proved.
3. **Write the report.** The report has one table, with a line for each property. The line gives the
   method, the result, what the result holds for in the spec's terms, and the time of the final check.
   Below the table, each result gets a section that is written from this template:

   ```
   ### <property>: <result>, by <method>

   Claim: <the claim of the method, in the spec's terms>.

   Trust surface: <what the result relies on besides the spec, from methods.md>.

   How it was found: <only for a strengthening: by Veil's invariant synthesizer, or by the agent's
   search in <n> rounds, with the time it took>.

   To check it again:

       <the command>
   ```

   The invariants of a strengthening are listed after its section. For example:

   ```
   ### consistency: proved, by induction

   Claim: consistency holds in every reachable state, for any number of participants.

   Trust surface: the embedding of Quint in Lean, Veil, and the SMT solver, whose answers Lean's kernel
   doesn't check. Veil's synthesizer certified its clauses with Lean's kernel, but the check of their
   Quint translation trusts the solver.

   How it was found: by Veil's invariant synthesizer, which found 8 clauses in 6.7 minutes.

   To check it again:

       quint verify two_phase_commit.strengthened.qnt --backend veil --main two_phase_commit --inductive-invariant consistencyInductive --invariants consistency
   ```

   The report names the commit of the spec, and whether the spec had changes that were not committed.
   A spec that is in no commit is named by the SHA-256 of its contents. Place the report as described
   above.

For example, a run of a plan for two-phase commit could be reported as this table:

| Property | Method | Result | Holds for | Time |
|---|---|---|---|---|
| `commitStays` | model checking | checked | 3 participants | 44.4 s |
| `consistency` | induction | proved | any number of participants | 15.9 s |
| `allCommitted` | model checking | reached | 3 participants | 38.8 s |

## Lean proofs

The properties that the plan proves in Lean wait for their proofs. For a standalone function
contract, state a theorem in a library proof file and use the
[direct Lean check](references/methods.md#pure-function-theorems). The `holds%` obligations and
`quint verify --proofs` below are for state and temporal properties only.

1. Write the file of obligations, as [methods.md](references/methods.md#lean-obligations) shows it,
   and place it as the report is placed. Suggest that it is put next to the spec.
2. Ask the user who writes the proofs: you, or another agent of the user's choice. The proofs are
   written by following [lean-proofs.md](references/lean-proofs.md), and another agent is given the
   path of that file.
3. A proof replaces a `sorry`. The statement of a theorem is never changed. Neither are the options of
   `quint_module`, except `invariants`, `smt` and `declared`. The names of the properties stay in
   `(invariants := [...])` and `(temporalProps := [...])`, since the check refuses a property that the file
   does not name there. A temporal property is proved with `prove_temporal_by`, as
   [lean-proofs.md](references/lean-proofs.md#temporal-properties) says, and its theorem needs a proof of
   each invariant that the file names.
   A proof goes over the steps that `#gen_steps` states, and `grind` closes them, as
   [lean-proofs.md](references/lean-proofs.md#choose-the-route) says. A proof over the steps calls no SMT solver.
   When a proof uses the solver for what `grind` leaves, and the plan trusts the solver, the file keeps
   Veil's default, and the command of step 4 has `--trust-smt`. Otherwise
   `set_option veil.smt.trust false` is set above `quint_module`, because a trusted answer then counts
   as a `sorry`. The option has no effect below `quint_module`. A proof
   names an invariant that states the keys of a map, such as
   `val stagesDomain = stages.keys() == participants`, only when the proof uses it, since
   `quint verify --proofs` adds none by itself. A `sorry` that is written in a file of the proof never
   counts.
4. Check the proofs with the command that the file names. The first check of a spec loads the spec
   into Lean, which takes minutes for a large spec. A later check with the same spec and the same
   `quint_module` options takes only the time of the proofs. Fix the proofs until every property is
   proved.
5. Update the report: each proved property is now `proved`.
