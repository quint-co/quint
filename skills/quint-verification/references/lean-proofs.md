# Writing Lean proofs

Use this reference to write the proofs of the obligations file of a verification plan, which states
one `p_holds : holds% p` theorem for each property. [SKILL.md](../SKILL.md#lean-proofs) says how the
file is written, placed and checked. The proof is done when `quint verify --proofs` reports every
property as proved.

A proof is kept short by its structure more than by its tactics. A Raft spec with 50 invariants is
used as the example below. A proof of that spec that followed Veil's own goals had one block for each
invariant and each action, which made 1,250 goals in 13,448 lines. The structure below proved the same
invariants in 4,224 lines. `grind` and the steps that `#gen_steps` states brought them down to 3,386.
The lines are counted without blank lines and comments.

## Choose the route

1. Name the supporting invariants. A property that is not inductive on its own needs invariants that
   make it inductive. Write each of them as a `val` in a copy of the spec, and model check them on a
   small instance with `quint verify` before any proof is written, since a proof of an invariant that
   is violated never closes. Veil's invariant search, `#updr certify`, can propose them. The step route
   states them again as the fields of a structure, and the spec is left as it is. The SMT route of
   step 4 reads them from the spec instead, so there each of them is a definition of the spec's main
   module, and its name is added to `(invariants := [...])` of `quint_module`.
2. Prove over the steps. This route is the default, for every spec. Load the spec without
   `(smt := true)`, and add `#gen_steps` after `quint_module`. State the property and its supporting
   invariants as the fields of one `structure` about one state. Prove that every `Initial` state has
   the structure and that every `Step` keeps it, each with `cases`, `constructor` and `grind`. Then close
   the property with `reachable_induction`, as [the step route](#the-step-route) shows. An equation
   between the keys of a map and a set is stated by its members, because `grind` reads members and not
   equations between sets. For example, `stages.keys() == participants` becomes
   `∀ p, p ∈ s.stages ↔ p ∈ ps`. The proof of `consistency` of two-phase commit has 25 lines, and
   `quint verify --proofs` checks it in about 7 seconds. The proof calls no SMT solver, so it needs no
   `--trust-smt`.
3. Split the steps when `grind` does not close one at once, as the Raft proof does. Steps 3 to 6 of
   the step route do the following:
   - group the invariants;
   - state the facts that only grow;
   - write a frame lemma for each group;
   - prove one lemma for each action.
4. Use the SMT solver for what `grind` leaves. The solver works on Veil's own goals, since `veil_smt`
   does not close a goal of `#gen_steps` yet. Set `(smt := true)`, and add `set_option veil.smt.trust
   false` unless the plan trusts the SMT solver, since a trusted answer counts only with `--trust-smt`.
   Then add `#gen_theorems` after `quint_module`. It proves with SMT that the initializer and each action
   keep each named invariant when all of them hold. A goal that SMT leaves open is proved with
   `prove_veil_invariant_goal <action> <invariant> using wp by ...`, and the property is closed with
   `theorem p_holds : holds% p := by holds_by_invariants`. That tactic fails and names any goal that
   is still missing. In the SMT encoding, a read `m.get(k)` at a key that `m` doesn't have is an
   unspecified value, as in Apalache. A goal can then fail at a state where a read misses its key,
   although the protocol never reaches that state. A definition that states the keys of `m` rules those
   states out. For example, a bank spec that reads `balances.get(a)` for each account `a` can name
   `val balancesDomain = balances.keys() == accounts` in `(invariants := [...])` when a goal needs it.

## The step route

The step route proves groups of invariants over the steps of the module, which `#gen_steps` states as
plain Lean. It works on any spec. An action that assigns the state variables, as each action of two-phase
commit does, becomes a constructor of `Step` whose index is the record of the next state. An action
`take(f(state, ...))`, where `f` returns `Option[State]`, has the guard that `f` returns a state, which
`open_take` opens. The spec is loaded without `(smt := true)`, since an enumeration of the spec is then a
Lean inductive, whose values `cases` tells apart.

Two-phase commit needs only the first steps below, since `grind` closes every step at once. Its proof states
the invariants as one structure, of which three fields are shown here:

```lean
structure Inv (ps : Std.ExtTreeSet String compare) (s : State (FieldAbstractType ps)) : Prop where
  consistency : ∀ q ∈ Quint.Set.tuples2 ps ps,
    ¬(Quint.Map.get s.stages q.1 = .Committed ∧ Quint.Map.get s.stages q.2 = .Aborted)
  stageDomain : ∀ p, p ∈ s.stages ↔ p ∈ ps
  votesSent : ∀ p ∈ s.votes, Message.ParticipantPrepared p ∈ s.messages
  -- the other invariants that make `consistency` inductive

theorem inv_init {ps} {th : Theory ps} {s} (h : Initial th s) : Inv ps s := by
  cases h
  constructor <;> grind

theorem inv_step {ps} {th : Theory ps} {s s'} (h : Inv ps s) (hs : Step th s s') : Inv ps s' := by
  rcases h with ⟨h0, h1, h2, h3, h4, h5, h6, h7, h8, h9⟩
  cases hs <;> constructor <;> grind

theorem consistency_holds : holds% consistency := by
  intro ps th st hr
  exact (reachable_induction (P := fun _ s => Inv ps s) (fun _ _ _ hi => inv_init hi)
    (fun _ _ _ _ hP hst => inv_step hP hst) th st hr).consistency
```

The whole proof is `lean/Examples/TwoPhaseCommitSteps.lean`. A larger spec, such as Raft, takes all the
steps below.

Each step below ends when its check holds.

1. **Lay out the files.** One base file loads the spec with the same `quint_module` line as the file
   of obligations. Every other file imports the base file, or a file that imports it, and opens the
   module with `veil module M` in place of `quint_module`, where `M` is the main module. Each file
   ends with `end M`. The check passes when only the base file and the file of obligations contain
   `quint_module`.
2. **Generate the steps.** Add `#gen_steps` to the base file, after `quint_module`. It declares the
   following, inside the module:
   - `Step th s s'`, with one constructor for each action. The constructor's explicit arguments are the
     values that the action chooses with `nondet`, then the facts that its guard states. Its index is
     the record of the state after the step.
   - `Initial th s`, the same for the initializer.
   - `reachable_induction`, which proves a property of every reachable state from a proof that every
     `Initial` state has it and that every `Step` keeps it.

   An action `take(f(state, ...))` has the guard `¬ f … = none`. In a case of `Step`, `open_take` turns
   that guard into `hx : f … = some x`. `open_step f` then opens `hx` into the guard `hc` of `f` and the
   record that `f` returns, and `open_some f` does the same for an `f` without a guard. The check passes
   when `#print Step` lists one constructor for each action.
3. **Group the invariants.** Put each invariant in one group, as a field of a `structure` that
   describes one concern, such as elections or logs. Order the groups so that the proof that a step
   keeps a group needs only the groups before it. Those groups may be used in the state before the
   step and in the state after it. An invariant that follows from the groups in the same state is proved
   as a lemma about one state, and it is put in no group. In the Raft proof, the six invariants that
   follow from the groups took 40 lines, instead of 25 goals each. The check passes when each invariant
   is a field of one group or a lemma about one state.
4. **State the monotone facts once.** Prove one lemma over `Step` for each field that only grows: a set
   that only gains elements, a term that never decreases, a log that only extends. In the Raft proof,
   these facts were proved again in 14 places, in about 90 lines.
5. **Write a frame lemma for each group.** A frame lemma states that the group holds after a step
   that leaves alone what the group reads. Its conditions are, in this order:
   - an equality `x.f = s.f` for each field that the group reads whole;
   - a monotone condition for each field that the group reads in one direction, such as a term that
     must not decrease;
   - a reasoning condition only when the two kinds above cannot express the group.

   Write a macro that applies the frame lemma and passes `rfl` and the monotone lemmas. Since an action
   returns `{ ...s, f: ... }`, every field that it does not write is `rfl`. The check passes when every
   action that writes no field that the group reads, or writes it only in its safe direction, is closed
   by the macro in one line. In the Raft proof, about 200 of the 288 cases were closed in this way.
6. **Prove each group for each step.** The step theorem of a group does `cases` on `Step`, and each case
   starts with `open_take`. A frame case is one line. Every other case calls one lemma about the action,
   which is stated over the equation of the pure function and not over Veil's state, as `serve_keeps`
   is below. The check passes when the step theorem has a case for every constructor.
7. **Close the properties.** `reachable_induction` with the conjunction of the groups gives each
   group in every reachable state, and each `p_holds` reads its field. The statement of `p_holds` is
   never changed.

The example below proves the invariant `servedIssued` of a ticket dispenser, which has one group. Its
actions are `take(issue(state))` and `take(serve(state, n))`, where `serve` returns `None` unless
`s.served + n <= s.issued`.

```lean
quint_module "tickets.qnt" (main := tickets) (invariants := [servedIssued])

#gen_steps

theorem issue_keeps {s x : Counts} (h : s.served ≤ s.issued) (hx : issue s = some x) :
    x.served ≤ x.issued := by
  open_some issue
  grind

theorem serve_keeps {s x : Counts} {n : Int} (hx : serve s n = some x) : x.served ≤ x.issued := by
  open_step serve
  grind

theorem servedIssued_holds : holds% servedIssued := by
  intro th st hr
  refine reachable_induction (P := fun _ s => s.served ≤ s.issued) (fun _ _ _ hi => by cases hi; decide) ?_
    th st hr
  intro _ s _ _ hP hst
  cases hst with
  | Issue_take_assignAll => open_take; exact issue_keeps hP hx
  | Serve_take_assignAll => open_take; exact serve_keeps hx

end tickets
```

A lemma about one action of the Raft proof is closed by one call of `grind`:

```lean
theorem startElection_elect (h : ElectR S s) (hx : «HashicorpRaft::startElection» pv S' s i = some x) :
    ElectR S x := by
  grind [ElectR, «HashicorpRaft::startElection», «HashicorpRaft::isQuorum», «HashicorpRaft::voteRequest»,
    ElectR_frame, Quint.Set.mem_of_mem_union_ofList]
```

## Temporal properties

A temporal property `p` is proved with Veil's `prove_temporal_by [p]`, in the proof mode of Lentil, with
the rules of `Quint.Liveness`. The example below is the proof of `liveness` of ewd840, Dijkstra's
termination detection on a ring: once every node is inactive, node 0 eventually detects termination, as
long as passing the token is weakly fair. The whole proof is `lean/Examples/TemporalProofs.lean`, in about
70 lines, and it holds for every number of nodes.

Each step below ends when its check holds.

1. **Find the rank.** A leads-to `P ↝ Q` is proved with a rank, which is a natural number that every step
   out of `P` lowers until `Q` holds. The rank is a `val` of the spec's main module, as the invariants of
   the SMT route are, since a proof reads the state only through the spec's definitions. The rank of
   ewd840 lowers once every node is inactive, because the token moves down the ring and every node that
   it passes turns white:

   ```quint
   val rank = tpos + N * (if (allWhite) 0 else if (whiteAbove) 1 else 2)
   ```

   The check passes when model checking `rank >= 0` as an invariant on a small instance finds no
   violation, since a rank is a natural number.
2. **Name the invariants that the proof assumes.** The proof may read the module's invariants, and
   `(invariants := [...])` names the ones that it reads. `(declared := false)` leaves out those that the
   spec declares and the proof does not read. Each named invariant gets its own `holds%` proof, over the
   steps, as [the step route](#the-step-route) shows. ewd840's proof reads only `Typed`, which states that
   the token is at a node and that every color is white or black. The check passes when `q_holds` proves
   `holds% q` for each named invariant `q`.
3. **Apply WF1 under the rank.** The start is the same for every leads-to:

   ```lean
   open Lentil Quint.Liveness

   prove_temporal_by [liveness]
     tclear hInit
     tintro hwf
     tapply (leads_to_by_rank (m := fun st => ((veil_term% rank) st).toNat))
     tintro k
     trevert hNext hInv hwf ; trewrite [← Lentil.and_imp, ← Lentil.and_imp]
     tapply (wf1_inv (σ := σ) (inv := veil_term% Invariants))
     tsplit_ands
   ```

   `wf1_inv` leaves three obligations. A step of any action keeps the rank, lowers it, or reaches `Q`.
   A fair step lowers the rank or reaches `Q`. A fair step is enabled while `P` holds. A property `◇ q`
   starts with `tapply eventually_of_leads_to_not`, which turns it into `¬ q ↝ q`. The check passes when
   three goals are left.
4. **Open each obligation.** `tmonotone ; unveil_temporal` turns an obligation into goals over the fields
   of the state before and after the step. It does so only for a step of one action, so the obligation
   about a fair step is split first with `tapply or_and_implies ; tsplit_ands`. A step of any action is a
   disjunction over the actions, which `rcases` takes apart. `simp only [Nodes, Color] at *` unfolds the
   definitions of constants such as `Nodes`, and `grind` closes each case. `unveil_temporal` names the
   hypotheses `h`, `h_1` and so on, and `trace_state` shows them. The check passes when each case closes.
5. **Decide each `if` of the rank with `split`.** A goal compares the rank before and after the step.
   `unveil_temporal` gives an `if` of the spec other instances in one state than in the other, so `omega`
   reads the two as different terms. The macro `rank_lowers` of the example rewrites with the rank's
   equation and unfolds its `forall`s. Then it splits every `if` and closes the cases with `grind`. The
   check passes when every goal about the rank closes.
6. **Close the obligation.** The theorem of the file closes with one tactic:

   ```lean
   theorem liveness_holds : holds_temporal% liveness := by holds_by_temporal_proof
   ```

   It proves `holds_temporal% liveness` from `liveness._proof` and from the `holds%` theorem of each
   invariant that the file names. The check passes when `quint verify --proofs` reports `liveness` as
   proved.

## Close lemmas with `grind`

`grind` closed 101 of the 202 lemmas of the Raft proof in one call each. A lemma's proof is
started with the first call below that closes it, in this order.

1. `grind [D]`, where `D` lists the definitions in the statement, from the spec and from the proof.
   `grind` unfolds only the definitions that it is given.
2. `grind [D, L]`, where `L` adds the lemmas that the argument needs, such as a frame lemma or a
   bridge between two representations.
3. The same call, with the definitions that the definitions of `D` use.
4. `simp_all [D] <;> grind [L]`.

These rules decide whether a call closes:

- **Short lemmas close.** `grind` closed 36 of 47 lemmas whose hand proof had at most 5 lines, and 6 of
  45 lemmas whose hand proof had more than 15. State one fact for each lemma.
- **Witnesses come first.** A `∀` premise that must be instantiated, or a value that must be found,
  is given with `have` before the call. For example, `isQuorum_mono` closes once
  `have := Quint.Set.size_le_of_subseteq hAB` is stated.
- **Cases come first.** `grind` neither does induction nor splits the step relation. The step theorem
  does `cases`, and `grind` closes the cases.
- **The library is already known.** The lemmas of Quint's library are tagged for `grind`. Lean
  warns `this parameter is redundant` when one of them is passed. That hint is removed.
- **Quint lists are indexed from 1 by `Int`.** `grind` does not relate `Quint.List.nth` to the lemmas
  of Lean's `List`. A lemma that relates them is proved with `simp` and `omega`, and `grind` is then
  given that lemma.
- **A slow call is split.** A call that takes more than a few seconds is replaced by smaller lemmas,
  since every check pays for it. Two calls of 71 and 99 seconds were taken out of the Raft proof.
- **`failed to canonicalize instance`** means that the lemma is outside the module, where the
  spec's scoped instances are missing. Lemmas are written between `veil module M` and `end M`.

SMT tactics do not replace `grind` here. Lean-smt's `smt` translated 2 of 15 Raft lemmas, since it
does not translate the sets and the options of the state. Lean-auto's answers are trusted without a
proof, and the check refuses them as it refuses a `sorry`.

## Lean facts of the embedding

- A definition of the spec that reads a constant, such as `Server`, is a Veil theory ghost function. It
  takes Veil's theory as its last argument. For example, `root(s, r)` of the spec is written
  `root s r th` in a lemma, where `th` is the theory.
- A comparison in a definition that returns a `Bool` is `decide (a < b)`, with an instance that names
  `a` and `b`. A `simp` that unfolds a definition inside `a` or `b` rewrites the comparison but not the
  instance, and `decide_eq_true_eq` then no longer applies. The comparisons are read first, and the
  definitions inside them are unfolded by a later `simp`:

  ```lean
  simp only [upToDate, Bool.or_eq_true, Bool.and_eq_true, decide_eq_true_eq] at h
  simp only [lastTerm] at h
  ```
- A definition that returns `a implies b` is `!a || b` in Lean. `Quint.implies_eq_true` reads it as
  `a = true → b = true`.
- A group that is a `structure` is read by name, as `h.ledOwner`. A conjunction is read by position, as
  `h.2.2.2.1`, and the position changes whenever the group changes.
