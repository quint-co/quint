
module token_ring_four_state {

    import token_ring.* from "Dijkstra"
    export token_ring.* 

    // Pure function to handle the four-state transition
    pure def four_state_transition(nodes: int -> int, index: int): int = {
        val predecessor_index = if (index == 0) N - 1 else index - 1
        val xS = nodes.get(index)
        val predecessor_xS = nodes.get(predecessor_index)

        if (index == 0) {
            // Bottom node
            if (xS == 1) 0 else xS
        } else if (index == N - 1) {
            // Top node
            if (xS == 0) 1 else xS
        } else {
            // Other nodes
            if (xS == 0) 1 else xS
        }
    }

    /// Action for the four-state machine
    action four_state_update = {
        nondet node_to_update = to(0, N - 1).oneOf()
        nodes_to_states' = nodes_to_states.set(node_to_update, four_state_transition(nodes_to_states, node_to_update))
    }

    temporal convergence_four_state = eventually (count_tokens(nodes_to_states) == 1)
}

module Dijkstra_4 {
    import token_ring_four_state(N = 5, K = 7).*
}