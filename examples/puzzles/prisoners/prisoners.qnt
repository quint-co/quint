// -*- mode: Bluespec; -*-
/**
 * The famous Prisoners puzzle. See a detailed description in:
 *
 * https://github.com/tlaplus/Examples/blob/master/specifications/Prisoners/Prisoners.tla
 *
 * This specification is derived from the above TLA+ specification.
 */
module prisoners {
    // The set of all prisoners
    const allPrisoners: Set[str]

    // The prisoner who is counting (any of allPrisoners)
    const counter: str

    assume _ = allPrisoners.contains(counter)

    // All prisoners but the counter
    val nonCounters = allPrisoners.exclude(Set(counter))

    // the state of the switch A
    var switchAUp: bool
    // the state of the switch B
    var switchBUp: bool
    // The number of times a prisoner has moved switch A up
    var timesSwitched: str -> int
    // The number of times the Counter has switched switch A down.
    var count: int

    // The condition that tells the Counter that every other prisoner
    // has been in the room at least once.
    val done: bool = {
        count == 2 * allPrisoners.size() - 1
    }

    // the state initializer
    action init = all {
        count' = 0,
        timesSwitched' = nonCounters.mapBy(p => 0),
        // non-deterministically set the switches
        nondet aUp = Bool.oneOf()
        switchAUp' = aUp,
        nondet bUp = Bool.oneOf()
        switchBUp' = bUp,
    }

    // A prisoner other than the counter moves switch A up if it is down and
    // if they have not already moved it up two times. Otherwise, they
    // flips switch B.
    action nonCounterStep(p) = all {
        if (not(switchAUp) and (timesSwitched.get(p) < 2)) all {
            switchAUp' = true,
            timesSwitched' = timesSwitched.setBy(p, (old => old + 1)),
            switchBUp' = switchBUp,
        } else all {
            switchBUp' = not(switchBUp),
            switchAUp' = switchAUp,
            timesSwitched' = timesSwitched,
        },
        count' = count,
    }

    // If switch A is up, the counter moves it down and increments their
    // count. Otherwise, they flip switch B.
    action counterStep = all {
        if (switchAUp) all {
            switchAUp' = false,
            count' = count + 1,
            switchBUp' = switchBUp,
        } else all {
            switchBUp' = not(switchBUp),
            count' = count,
            switchAUp' = switchAUp,
        },
        timesSwitched' = timesSwitched,
    }

    // all possible transitions: either by the counter, or a non-counter
    action step = any {
        counterStep,
        nondet p = nonCounters.oneOf()
        nonCounterStep(p)
    }

    // All variables captures in a tuple.
    // Note that below the variables are passed by name (as in macros), not by value.
    // We will introduce a special construct for that soon.
    val vars = (switchAUp, switchBUp, timesSwitched, count)

    // This asserts that every prisoner is brought into the room infinitely
    // often. Note that we can write this fairness constraint,
    // but Quint would not do anything useful about it at the moment.
    temporal fairness = and {
        weakFair(counterStep, vars),
        nonCounters.forall(p => weakFair(nonCounterStep(p), vars)),
    }

    // Temporal behavior of the state machine.
    // Commented out atm, as the mode checker complains.
    /*
    temporal spec = init and always(step.orKeep(vars)) and fairness
    */

    /**
      * The safety condition as a state invariant: Done true implies
      * that every prisoner other than the counter has flipped switch A at
      * least once--and hence has been in the room at least once. Since the
      * counter increments the count only when in the room, and Done implies
      * count > 0, it also implies that the counter has been in the room.
      */
    val safetyInv = done.implies(nonCounters.forall(p => timesSwitched.get(p) > 0))

    // The safety property written as a temporal property.
    // Note that Quint would not do anything about this property at the moment.
    temporal safety = always(safetyInv)

    // This asserts that done is eventually true, so the prisoners are
    // eventually released. This property should be checked against spec.
    // Note that Quint would not do anything about this property at the moment.
    temporal liveness = eventually(done)

    // A state invariant that lets one prove safety. 
    val countInv = {
        val oneIfUp = if (switchAUp) 1 else 0
        val totalSwitched = {
            nonCounters.fold(0, (sum, p) => (sum + timesSwitched.get(p)))
        }
        count.in(Set(totalSwitched - oneIfUp, totalSwitched - oneIfUp + 1))
    }
}

// An instance of prisoners for the set of size 3
module prisoners3 {
    import prisoners(allPrisoners = Set("A", "B", "C"), counter = "A").*
}
