// -*- mode: Bluespec; -*-
// Translation of https://github.com/informalsystems/tla-apalache-workshop/blob/main/examples/clock-sync/ClockSync1.tla
module ClockSync1Spec {
    //// STATE VARIABLES
    // The reference clock, inaccessible to the processes
    var time: int

    // Hardware clock of a process
    var hc: str -> int

    // Clock adjustment of a process
    var adj: str -> int

    //// DEFINITIONS

    // We fix the set to contain two processes
    val Procs: Set[str] = Set("p1", "p2")

    // The adjusted clock of process i
    def AC(i: str): int = hc.get(i) + adj.get(i)

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
    }

    //// ACTIONS

    // Let the time flow
    action AdvanceClocks(delta: int): bool = all {
        delta > 0,
        time' = time + delta,
        hc' = Procs.mapBy(p => hc.get(p) + delta),
        adj' = adj, // UNCHANGED adj
    }

    // All actions together (overall step)
    action step: bool = {
        nondet delta = oneOf(Int) // \E delta \in Int
        AdvanceClocks(delta)
    }

    //// PROPERTIES
    // NaiveSkewInv == \A p, q \in Proc: AC(p) = AC(q)
    val NaiveSkewInv: bool = Procs.forall(p =>
        Procs.forall(q => AC(p) == AC(q))
    )
}

// Default instance of the ClockSync1 spec
module clockSync1 {
    import ClockSync1Spec.*
}
