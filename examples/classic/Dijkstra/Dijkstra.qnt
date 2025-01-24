// -*- mode: Bluespec; -*-
/**
 * Dijkstra's Stabilizing Token Ring (EWD426)
 * K state machine
 * This implementation ensures that from some time on,
 * exactly one token circulates in a ring of nodes, 
 *
 * Mahtab Norouzi, Josef Widder, Informal Systems, 2024, 2025
 */

module token_ring {
    // Number of nodes in the ring
    const N: int
    const K: int // K >= N, ensures the state space is larger than the number of nodes

    val bottom = 0
    val top = N

    // Variable: Mapping of node indices to their states
    var system: int -> int

    // Pure function to check if a node has the token
    pure def has_token(nodes: int -> int, index: int): bool = 
        if (index == bottom)
            nodes.get(bottom) == nodes.get(top)
        else
            not(nodes.get(index) == nodes.get(index - 1))


    // Pure function to update the state of a specific node
    pure def state_transition(nodes: int -> int, index: int): int = 
        if (not(has_token(nodes, index)))
            nodes.get(index)
        else   
            if (index == bottom)
                (nodes.get(bottom) +1) % K
            else
                nodes.get(index - 1)

    

    /// Initialize all nodes with random states
    action init = all {
        nondet random = to(0, N).setOfMaps(to(0, K - 1)).oneOf()
        system' = to(0, N).mapBy(i => random.get(i))
    }

    /// Update a single random active node
    action step = {
        nondet node = to(0, N)  .filter(i => has_token(system, i))
                                .oneOf()
        system' = system.set(node, state_transition(system, node) )
    }



    // Pure function to count how many tokens exist
    pure def count_tokens(nodes: int -> int): int = {
        to(0, N).filter(i => has_token(nodes, i)).size()
    }

    // Temporal properties
    temporal convergence = eventually (count_tokens(system) == 1)
    temporal closure = always (count_tokens(system) == 1 implies always (count_tokens(system) == 1))

    // Invariant
    def tokenInv = count_tokens(system) > 0

    /// to better see the token in the repl
    pure def show_token(nodes: int -> int): int -> bool =
        nodes.keys().mapBy(i => has_token(nodes, i))

}


module Dijkstra {
    import token_ring(N = 5, K = 7).*
}

module BrokenDijkstra {
    import token_ring(N = 3, K = 2).*
}