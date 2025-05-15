/**
 * Clock Synchronization Algorithm - Version 6 (from TLA+ ClockSync6)
 *
 * This specification is a Quint translation of the TLA+ model ClockSync6.tla
 * from the tla-apalache-workshop.
 *
 * Version 6 features:
 * - Processes (Proc) as a parameter.
 * - ApaFoldSet logic (here implemented with Set::fold).
 * - Full set of actions: SendMsg, ReceiveMsg, AdvanceClocks.
 * - Clock adjustment logic based on received messages.
 */
module ClockSync6Spec {
  // Constants
  const Proc: Set[str]
  const t_min: int
  const t_max: int

  // Assumptions
  assume _ = (t_min >= 0 and t_max > t_min)

  // State Variables
  var time: int
  var hc: str -> int
  var adj: str -> int
  var diff: str -> (str -> int) // Represents TLA+ <<Str, Str>> -> Int
  var msgs: Set[{ src: str, ts: int }]
  var rcvd: str -> Set[{ src: str, ts: int }]
  var state: str -> str

  // Definitions

  // The number of processes
  val NProc = Proc.size()

  // Control states (as a set of string literals)
  val ControlStates = Set("init", "sent", "sync")

  // The adjusted clock of process i_proc
  def AC(i_proc: str): int = hc.get(i_proc) + adj.get(i_proc)

  // Sum up the clock differences as observed by a process p_proc
  pure def DiffSum(df: str -> (str -> int), p_proc: str): int = {
    Proc.fold(0, (total, q_proc) => total + df.get(p_proc).get(q_proc))
  }

  // Initialization
  action Init: bool = all {
    time' = 0,
    hc' = Proc.mapBy(_ => 0),
    adj' = Proc.mapBy(_ => 0),
    diff' = Proc.mapBy(_ => Proc.mapBy(_ => 0)),
    state' = Proc.mapBy(_ => "init"),
    msgs' = Set(),
    rcvd' = Proc.mapBy(_ => Set()),
  }

  // Actions

  // Send the value of the hardware clock
  action SendMsg(p_proc: str): bool = all {
    state.get(p_proc) == "init",
    msgs' = msgs.union(Set({ src: p_proc, ts: hc.get(p_proc) })),
    state' = state.set(p_proc, "sent"),
    // Explicit unchanged for clarity, matching ReceiveMsg style
    time' = time,
    hc' = hc,
    adj' = adj,
    diff' = diff,
    rcvd' = rcvd,
  }

  // Receive a message sent by another process.
  // Adjust the clock if the message has been received from all other processes.
  action ReceiveMsg(p_proc: str): bool = all {
    state.get(p_proc) == "sent", // Precondition

    nondet m = oneOf( // This choice implies a precondition that the filtered set is non-empty
      msgs.filter(cand_m =>
        not(rcvd.get(p_proc).contains(cand_m)) and
        cand_m.src != p_proc and
        hc.get(cand_m.src) >= cand_m.ts + t_min
      )
    )
    // Use a block for LET-like bindings. The block's value is its last expression.
    {
      val delta_calc = m.ts - hc.get(p_proc) + (t_min + t_max) / 2;
      val current_p_diffs_for_p = diff.get(p_proc);
      val updated_p_diffs_for_p = current_p_diffs_for_p.set(m.src, delta_calc);
      val newDiff_map_val = diff.set(p_proc, updated_p_diffs_for_p);
      val newRcvd_set_for_p_val = rcvd.get(p_proc).union(Set(m));

      val received_from_sources = newRcvd_set_for_p_val.map(msg_item => msg_item.src);
      val expected_other_sources = Proc.exclude(Set(p_proc));
      val fromAllOthers = received_from_sources == expected_other_sources;

      val adj_prime_val = if (fromAllOthers) adj.set(p_proc, DiffSum(newDiff_map_val, p_proc) / NProc) else adj;
      val state_prime_val = if (fromAllOthers) state.set(p_proc, "sync") else state.set(p_proc, "sent");

      // Conjunction of effects (assignments)
      all {
        rcvd' = rcvd.set(p_proc, newRcvd_set_for_p_val),
        diff' = newDiff_map_val,
        adj' = adj_prime_val,
        state' = state_prime_val,
        time' = time,
        hc' = hc,
        msgs' = msgs
      }
    }
  }

  // Let the time flow
  action AdvanceClocks(delta_param: int): bool = all {
    delta_param > 0,
    msgs.forall(m =>
      not (hc.get(m.src) + delta_param > t_max) or
      rcvd.get(m.src).contains(m)
    ),
    time' = time + delta_param,
    hc' = Proc.mapBy(p_iter => hc.get(p_iter) + delta_param),
    adj' = adj,
    diff' = diff,
    msgs' = msgs,
    state' = state,
    rcvd' = rcvd,
  }

  // All actions together
  action Next: bool = any {
    // Option 1: Advance clocks
    nondet delta = oneOf(Int)
    AdvanceClocks(delta),

    // Option 2: A process p_proc performs an action
    nondet p_proc = oneOf(Proc)
    any {
      SendMsg(p_proc),
      ReceiveMsg(p_proc)
    }
  }

  // Properties

  // Theorem 6.15 from AW04:
  // Algorithm achieves u * (1 - 1/n)-synchronization for n processors.
  val SkewInv: bool = {
    val allSync = Proc.forall(p_iter => state.get(p_iter) == "sync")

    val boundedSkew = {
      // extend the bound by NProc to account for rounding errors
      val bound = (t_max - t_min) * (NProc - 1) + NProc * NProc
      Proc.forall(p_iter =>
        Proc.forall(q_iter => {
          val df = AC(p_iter) - AC(q_iter)
          (-bound <= df * NProc) and (df * NProc <= bound)
        })
      )
    }
    allSync implies boundedSkew
  }
}
