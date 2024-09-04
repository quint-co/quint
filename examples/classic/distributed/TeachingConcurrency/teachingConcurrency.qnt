// -*- mode: Bluespec; -*-
/**
 * A simple algorithm from Lamport's "Teaching Concurrency" paper:
 * https://lamport.azurewebsites.net/pubs/teaching-concurrency.pdf
 *
 * Run in verifier with:
 * quint verify --temporal correct teachingConcurrency.qnt
 */

// An example instance of the algorithm with N=5.
module teachingConcurrency {
    import teachingConcurrencyN(NUM_PROCS=5).*
}

// A concurrency algorithm providing a basic form of mutual
// exclusion. For details and proofs see section 7.2 of
// https://lamport.azurewebsites.net/tla/proving-safety.pdf
module teachingConcurrencyN {
    // N processes (numbered from 0 to N-1).
    const NUM_PROCS: int
    assume nonEmpty = NUM_PROCS >= 1

    var x: List[int]
    var y: List[int]

    // Set of processes yet to be executed.
    var pendingProcs: Set[int]

    // Initial state:
    //  - x and y zeroed for all processes
    //  - all processes pending scheduling
    action init = all {
        x' = zeroes(NUM_PROCS),
        y' = zeroes(NUM_PROCS),
        pendingProcs' = 0.to(NUM_PROCS-1),
    }

    // Stepping action: randomly pick a pending process (if
    // any) and execute it. Otherwise stutter forever, as
    // every process has stopped.
    action step = any {
        all {
            not(termination),
            processUpdate,
        },
        all {
            termination,
            allStopped,
        }
    }

    // Execute the algorithm for a pending process.
    action processUpdate = {
        nondet proc = pendingProcs.oneOf()

        val nextX = x.replaceAt(proc, 1)
        val index = circularIndex(proc, NUM_PROCS)
        val yValue = nextX[index]

        all {
            x' = nextX,
            y' = y.replaceAt(proc, yValue),
            pendingProcs' = pendingProcs.exclude(Set(proc)),
        }
    }

    // All processes have stopped.
    action allStopped = all {
        x' = x,
        y' = y,
        pendingProcs' = pendingProcs,
    }

    // Return a List of 0s, with the given length.
    pure def zeroes(len: int): List[int] = {
        0.to(len-1).fold(List(), (l, _) => l.append(0))
    }

    // Calculate the circular index `(i-1) mod N`.
    pure def circularIndex(i: int, N: int): int = {
        if (i == 0) {
            N-1
        } else {
            i-1
        }
    }

    // Correctness invariant: (after every process has
    // stopped) y[i] == 1 for at least one process.
    val yContainsOne = {
        y.select(v => v == 1).length() >= 1
    }

    // Termination invariant: all processes have stopped
    // (i.e. none is pending scheduling).
    val termination = {
        pendingProcs.size() == 0
    }

    temporal correct = eventually(termination and yContainsOne)
}
