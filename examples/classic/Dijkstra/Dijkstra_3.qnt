

module token_ring_three_state {

    // import token_ring as token_ring from "Dijkstra"

    import token_ring.* from "Dijkstra"
    export token_ring.*
    // Transition function for the three-state machine
    pure def three_state_transition(nodes: int -> int, index: int): int = {
        val predecessor_index = if (index == 0) N - 1 else index - 1
        val current_state = nodes.get(index)
        val predecessor_state = nodes.get(predecessor_index)

        if (index == 0) {
            // Bottom node logic
            if (predecessor_state % 3 == 2) (predecessor_state + 2) % 3 else current_state
        } else if (index == N - 1) {
            // Top node logic
            if (predecessor_state % 3 == 2) (predecessor_state + 1) % 3 else current_state
        } else {
            // Other nodes
            if (predecessor_state % 3 == 2) (predecessor_state + 1) % 3 else current_state
        }
    }

    /// Action for the three-state machine
    action three_state_update = {
        nondet node_to_update = to(0, N - 1).oneOf()
        nodes_to_states' = nodes_to_states.set(node_to_update, three_state_transition(nodes_to_states, node_to_update))
    }

    temporal convergence_three_state = eventually (count_tokens(nodes_to_states) == 1)
}

module Dijkstra_3 {
    import token_ring_three_state(N = 5, K = 7).*
}