// -*- mode: Bluespec; -*-
// Translation of https://github.com/informalsystems/tla-apalache-workshop/blob/main/examples/clock-sync/ClockSync2.tla
module ClockSync2Spec {
    //// CONSTANTS
    // Minimum message delay
    const t_min: int
    // Maximum message delay
    const t_max: int

    assume _ = (t_min >= 0 and t_max > t_min)

    //// STATE VARIABLES
    // The reference clock, inaccessible to the processes
    var time: int

    // Hardware clock of a process
    var hc: str -> int

    // Clock adjustment of a process
    var adj: str -> int

    // Messages sent by the processes
    type MSG_T = { src: str, ts: int } // Quint record type for messages
    var msgs: Set[MSG_T]

    // The control state of a process
    var state: str -> str


    //// DEFINITIONS

    // We fix the set to contain two processes
    val Procs: Set[str] = Set("p1", "p2")

    // Control states
    val States: Set[str] = Set("init", "sent", "done")

    // The adjusted clock of process i
    def AC(i: str): int = hc.get(i) + adj.get(i)

    // Helper to construct a message record
    pure def MkMsg(src_val: str, ts_val: int): MSG_T = { src: src_val, ts: ts_val }

    //// INITIALIZATION
    action init: bool = all {
        // time \in Nat
        { nondet time0 = oneOf(Nat)
          time' = time0 },
        // hc \in [ Proc -> Nat ]
        { nondet hc0 = oneOf(setOfMaps(Procs, Nat))
          hc' = hc0 },
        // adj = [ p \in Proc |-> 0 ]
        adj' = Procs.mapBy(_p => 0),
        // state = [ p \in Proc |-> "init" ]
        state' = Procs.mapBy(_p => "init"),
        // msgs = {}
        msgs' = Set(),
    }

    //// ACTIONS

    // Send the value of the hardware clock
    action SendMsg(p: str): bool = all {
        state.get(p) == "init",
        msgs' = msgs.union(Set(MkMsg(p, hc.get(p)))),
        state' = state.set(p, "sent"),
        // UNCHANGED <<time, hc, adj>>
        time' = time,
        hc' = hc,
        adj' = adj,
    }

    // Let the time flow
    action AdvanceClocks(delta: int): bool = all {
        delta > 0,
        time' = time + delta,
        hc' = Procs.mapBy(proc => hc.get(proc) + delta),
        // UNCHANGED <<adj, msgs, state>>
        adj' = adj,
        msgs' = msgs,
        state' = state,
    }

    // All actions together (overall step)
    action step: bool = any {
        { // \E delta \in Int: AdvanceClocks(delta)
            nondet delta = oneOf(Int)
            AdvanceClocks(delta)
        },
        { // \E p \in Proc: SendMsg(p)
            nondet p = oneOf(Procs)
            SendMsg(p)
        }
    }
}

// Default instance of the ClockSync2 spec
module clockSync2 {
    import ClockSync2Spec(t_min = 0, t_max = 5).*
}
