// -*- mode: Bluespec; -*-
// A translation of https://github.com/informalsystems/tla-apalache-workshop/blob/main/examples/clock-sync/ClockSync3.tla
module clockSync3Spec {
    //// HELPERS

    /// `S.add(e)` is `S.union(Set(e))`, i.e., the set derived by adding `e` to `S`
    def add(s, e): (Set[a], a) => Set[a] = s.union(Set(e))
    

    //// CONSTANTS

    /// minimum message delay
    const t_min : int
    /// maximum message delay
    const t_max : int

    assume _ = (t_min >= 0 and t_max > t_min)


    //// TYPES AND CONSTRUCTORS

    /// The type of processes
    type PROC = {id : int}

    /// `Proc(id)` is a process with the given `id`
    def Proc(id) : (int) => PROC = { id : id }

    /// Control states
    type STATE = str

    /// A message sent by a process
    type MSG = {src : PROC, ts: int}

    /// `p.msgFrom(ts)` is a message sent from `p` at time `ts` 
    def msgFrom(p, ts) = {src: p, ts : ts}

    /// The set of messages
    type MSGS = Set[MSG]


    //// STATE

    /// The reference clock, inaccessible to the processes
    var time: int

    /// Hardware clock of a process
    var hc: PROC -> int

    /// Messages sent by the processes
    var msgs: MSGS

    /// Messages received by the processes
    var rcvd: PROC -> MSGS

    /// The control state of a process
    var state: PROC -> STATE


    //// DEFINITIONS

    /// We fix the model to contain two processes
    val Procs : Set[PROC] = Set(Proc(1), Proc(2))

    /// The set of possible control states
    val states : Set[STATE] = Set("init", "sent", "sync")


    //// INITIALIZATION

    action init = all {
        { nondet time0 = oneOf(Nat)
          time' = time0 },
        { nondet hc0 = oneOf(setOfMaps(Procs, Nat))
          hc' = hc0 },
        msgs'  = Set(),
        state' = Procs.mapBy(_ => "init"),
        rcvd'  = Procs.mapBy(_ => Set()),
    }

    //// ACTIONS

    /// Send the value of the hardware clock
    action sendMsg(p) = all {
        state.get(p) == "init",
        msgs'  = msgs.add(p.msgFrom(hc.get(p))),
        state' = state.set(p, "sent"),
        rcvd'  = rcvd,
    }
    
    /// Receive a message sent by another process
    action receiveMsg(p) = {
        nondet newMsg = oneOf(msgs) 
        all {
            not(newMsg.in(rcvd.get(p))),
            // the message cannot be received earlier than after t_min
            hc.get(newMsg.src) >= newMsg.ts + t_min,
            rcvd'  = rcvd.set(p, rcvd.get(p).add(newMsg)),
            state' = state,
            msgs'  = msgs,
        }
    }

    /// let time flow
    action advanceClocks(delta) = all {
        delta > 0,
        // clocks can be advanced only if there are no pending message
        msgs.forall(m => 
            ( hc.get(m.src) + delta > t_max )
            .implies
            ( Procs.forall(p => m.in(rcvd.get(p))) )
        ),
        time' = time + delta,
        hc'   = Procs.mapBy(p => hc.get(p) + delta),
    }

    //// TRANSITIONS

    action step = any {
        all {
            msgs'  = msgs,
            state' = state,
            rcvd'  = rcvd,
            { nondet delta = oneOf(Int)
              advanceClocks(delta) },
        },
        all {
            time' = time,
            hc'   = hc,
            { nondet p = oneOf(Procs)
              any {
                sendMsg(p),
                receiveMsg(p),
              }
            }
        }
    }
}

// The default instance of the clockSync spec
//
// Here we set the constant values allowing us to ensure that the spec can be
// tested and verified using the default commands.
module clockSync3 {
  import clockSync3Spec(t_min = 0, t_max = 5).*
}
