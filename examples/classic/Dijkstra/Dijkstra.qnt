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
        // Step 1: Generate a nondeterministic mapping of indices to random states
        nondet random = to(0, N - 1).setOfMaps(to(0, K - 1)).oneOf()
        // Step 2: Map the random states to nodes
        nodes_to_states' = to(0, N - 1).mapBy(i => random.get(i))
    }

    /// Update a single random node based on its predecessor
    action update = {
        nondet node_to_update = to(0, N - 1).oneOf() // Pick a random node
        nodes_to_states' = update_node(nodes_to_states, node_to_update)
    }

    /// Step action to simulate the system
    action step = any {
        update
    }

    // Invariants
    /// Ensure exactly one token exists in the ring
    val one_token_invariant = {
        count_tokens(nodes_to_states) == 1
    }

    // Temporal properties
    /// Convergence: The system eventually stabilizes with exactly one token
    temporal convergence = eventually (count_tokens(nodes_to_states) == 1)

    /// Closure: Once stabilized, the system remains with one token
    temporal closure = 
        always (count_tokens(nodes_to_states) == 1 
                implies always (count_tokens(nodes_to_states) == 1))

    /// Check whether the convergence witness holds
    val convergence_witness = {
        count_tokens(nodes_to_states) > 1
    }
}

module token_ring_three_four_state {

    import token_ring as tr

    // Number of nodes in the ring
    const N: int

    // Variable: Mapping of node indices to their states
    var nodes_to_states: int -> int

    // --- Three-state machine solution ---
    /**
     * Each machine state is represented by an integer `S` such that 0 ≤ S < 3.
     * The rules for transitions depend on the position (bottom, top, or other nodes).
     */

    // Transition function for the three-state machine
    pure def three_state_transition(nodes: int -> int, index: int): int = {
        val predecessor_index = if (index == 0) N - 1 else index - 1 // Wrap-around for the ring
        val successor_state = (nodes.get(index) + 1) % 3 // Compute the next state modulo 3

        if (index == 0) {
            // Bottom node logic
            if (successor_state == 2) (nodes.get(predecessor_index) + 2) % 3 else nodes.get(index)
        } else if (index == N - 1) {
            // Top node logic
            if (nodes.get(predecessor_index) % 3 == 2) (nodes.get(predecessor_index) + 1) % 3 else nodes.get(index)
        } else {
            // Other nodes
            if (nodes.get(predecessor_index) % 3 == 2) (nodes.get(predecessor_index) + 1) % 3 else nodes.get(index)
        }
    }

    /// Action for the three-state machine
    action three_state_update = {
        nondet node_to_update = to(0, N - 1).oneOf() // Pick a random node
        nodes_to_states' = nodes_to_states.set(node_to_update, three_state_transition(nodes_to_states, node_to_update))
    }

    // --- Four-state machine solution ---
    /**
     * Each machine state is represented by two booleans `xS` and `upS`.
     * States are defined as (xS, upS) where:
     * - For the bottom machine, upS = true by definition.
     * - For the top machine, upS = false by definition.
     */

    // Pure function to handle the four-state transition
    pure def four_state_transition(nodes: int -> int, index: int): (bool, bool) = {
        val predecessor_index = if (index == 0) N - 1 else index - 1 // Wrap-around for the ring
        val xS = nodes.get(index) // Current state (interpreted as a pair)
        val upS = if (index == 0) true else if (index == N - 1) false else xS % 2 == 0

        if (index == 0) {
            // Bottom node
            if (xS == 1 and upS) (0, true) else (xS, upS)
        } else if (index == N - 1) {
            // Top node
            if (xS == 0 and not(upS)) (1, false) else (xS, upS)
        } else {
            // Other nodes
            if (xS == 0 and not(upS)) (1, true) else (xS, upS)
        }
    }

    /// Action for the four-state machine
    action four_state_update = {
        nondet node_to_update = to(0, N - 1).oneOf() // Pick a random node
        val updated_state = four_state_transition(nodes_to_states, node_to_update)
        nodes_to_states' = nodes_to_states.set(node_to_update, updated_state)
    }

    /// Step action for both solutions
    action step = any {
        three_state_update,
        four_state_update
    }

    // Temporal properties for three-state and four-state machines
    temporal convergence_three_state = eventually (tr.count_tokens(nodes_to_states) == 1)
    temporal convergence_four_state = eventually (tr.count_tokens(nodes_to_states) == 1)
}
