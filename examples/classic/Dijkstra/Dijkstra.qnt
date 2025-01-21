// -*- mode: Bluespec; -*-
/**
 * Dijkstra's Stabilizing Token Ring (EWD426)
 * This implementation ensures that exactly one token circulates in a ring of nodes, self-stabilizing to this state.
 *
 * Mahtab Norouzi, Informal Systems, 2024
 */

module token_ring {
    // Number of nodes in the ring
    const N: int
    const K: int // K > N, ensures the state space is larger than the number of nodes

    // Variable: Mapping of node indices to their states
    var nodes_to_states: int -> int

    // Pure function to check if a node has the token
    pure def has_token(nodes: int -> int, index: int): bool = {
        val predecessor_index = if (index == 0) N - 1 else index - 1 // Wrap-around for the ring
        nodes.get(index) == (nodes.get(predecessor_index) + 1) % K
    }

    // Pure function to count how many tokens exist
    pure def count_tokens(nodes: int -> int): int = {
        to(0, N - 1).filter(i => has_token(nodes, i)).size()
    }

    // Pure function to update the state of a specific node
    pure def update_node(nodes: int -> int, index: int): int -> int = {
        val predecessor_index = if (index == 0) N - 1 else index - 1 // Wrap-around for the ring
        val updated_state = (nodes.get(predecessor_index) + 1) % K
        nodes.set(index, updated_state)
    }

    /// Initialize all nodes with random states
    action init = all {
        nondet random = to(0, N - 1).setOfMaps(to(0, K - 1)).oneOf()
        nodes_to_states' = to(0, N - 1).mapBy(i => random.get(i))
    }

    /// Update a single random node based on its predecessor
    action update = {
        nondet node_to_update = to(0, N - 1).oneOf()
        nodes_to_states' = update_node(nodes_to_states, node_to_update)
    }

    action step = any {
        update
    }

    // Invariants
    // val one_token_invariant = {
    //     count_tokens(nodes_to_states) == 1
    // }

    // Temporal properties
    temporal convergence = eventually (count_tokens(nodes_to_states) == 1)
    temporal closure = always (count_tokens(nodes_to_states) == 1 implies always (count_tokens(nodes_to_states) == 1))

        /// check whether witness is invariant. 
    val convergence_witness = {
        count_tokens(nodes_to_states) > 1
    }
}
// write the command
//temporal properties are not verified

module Dijkstra {
    import token_ring(N = 5, K = 7).*
}