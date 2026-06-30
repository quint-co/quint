/**
 * ewd426's Stabilizing Token Ring (EWD426)
 * K state machine
 * This implementation ensures that from some time on,
 * exactly one token circulates in a set of nodes,
 *
 * Mahtab Norouzi, Josef Widder, Informal Systems, 2024-2025
 */

/* =============================================================================
 * quint-modeling REFERENCE EXAMPLE — communication model: SHARED MEMORY
 * -----------------------------------------------------------------------------
 * Why this is bundled: it is the canonical *shared-memory* shape — there is NO
 * message medium. Processes coordinate by reading common state: each node's
 * `state_transition` reads its left/right neighbours in `var system: int -> State`.
 * Contrast with the Choreo example (tendermint/), which is message-passing.
 *
 * Demonstrates, against the quint-modeling guidelines:
 *   - Grouped-map state          `var system: int -> State` (one entry per node).
 *   - Guarded action             `step` picks a node that *can* move; no no-op fallback.
 *   - Logic in pure defs         `has_token`, `state_transition`, `count_tokens`.
 *   - const-instantiation        the parametric `self_stabilization` module is run via
 *                                the concrete `ewd426` instance (N = 5, K = 7). This is
 *                                the pattern the skill's spine teaches: a `const` cannot
 *                                run until instantiated. Run with `--main=ewd426`.
 *   - temporal LIVENESS          `convergence` / `closure` / `persistence` — the system
 *                                self-stabilizes to exactly one token. (The only bundled
 *                                example with temporal properties.)
 *
 * The `broken_ewd426` instance (N = 3, K = 2) is a deliberately-broken config kept for
 * contrast — useful to show what a property *failing* looks like.
 *
 * Verified clean on Quint 0.32.0. See ../examples/README.md for re-verification commands.
 * ============================================================================= */
module self_stabilization {
  // Number of nodes in the ring
  const N: int
  const K: int

  /// Ensures the state space is larger than the number of nodes
  assume _ = K >= N

  val bottom = 0
  val top = N

  /// Mapping of node indices to their states
  var system: int -> int

  /// Check if a node has the token
  pure def has_token(nodes: int -> int, index: int): bool =
    if (index == bottom)
      nodes.get(bottom) == nodes.get(top)
    else
      not(nodes.get(index) == nodes.get(index - 1))

  /// Update the state of a specific node
  pure def state_transition(nodes: int -> int, index: int): int =
    if (not(has_token(nodes, index)))
      nodes.get(index)
    else if (index == bottom)
      (nodes.get(bottom) + 1) % K
    else
      nodes.get(index - 1)

  /// Initialize all nodes with non-deterministic states
  action init = all {
    nondet initial = 0.to(N).setOfMaps(0.to(K - 1)).oneOf()
    system' = initial
  }

  /// Pick a single active node non-deterministically and update its state
  action step = {
    nondet node = 0.to(N).filter(i => has_token(system, i)).oneOf()
    system' = system.set(node, state_transition(system, node))
  }

  /// Pick several active nodes non-deterministically and update their state.
  /// Closer to the distributed demon is discussed in EWD 391. We are not
  /// considering interleaving in the execution of state_transition here
  action distributed_step = {
    nondet nodes = 0.to(N).filter(i => has_token(system, i)).powerset().exclude(Set()).oneOf()
    system' = nodes.fold(system, (s, x) => s.set(x, state_transition(system, x)))
  }

  // Pure function to count how many tokens exist
  pure def count_tokens(nodes: int -> int): int = {
    0.to(N).filter(i => has_token(nodes, i)).size()
  }

  // Temporal properties
  temporal convergence = step.weakFair(Set(system)) implies eventually(count_tokens(system) == 1)
  temporal closure = always(count_tokens(system) == 1 implies always(count_tokens(system) == 1))
  temporal persistence = step.weakFair(Set(system)) implies eventually(always(count_tokens(system) == 1))

  // Invariant
  def tokenInv = count_tokens(system) > 0

  /// to better see the token in the repl
  pure def show_token(nodes: int -> int): int -> bool =
    nodes.keys().mapBy(i => has_token(nodes, i))
}

module ewd426 {
  import self_stabilization(N = 5, K = 7).*
}

module broken_ewd426 {
  // This should break the assumption of K >= N. See #1182.
  import self_stabilization(N = 3, K = 2).*
}
