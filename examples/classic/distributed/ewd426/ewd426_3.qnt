// -*- mode: Bluespec; -*-
/**
 * ewd426's Stabilizing Token Ring (EWD426)
 * 3 state machine
 * This implementation ensures that from some time on,
 * exactly one token circulates in a set of nodes.
 *
 * Mahtab Norouzi, Josef Widder, Informal Systems, 2024-2025
 */
module self_stabilization_three_state {
  // Number of nodes in the ring
  const N: int

  val bottom = 0
  val top = N

  // Variable: Mapping of node indices to their states
  var system: int -> int

  pure def has_token(nodes: int -> int, index: int): bool =
    val s = nodes.get(index)
    if (index == bottom)
      val r = nodes.get(1)
      (s + 1) % 3 == r
    else if (index == top)
      val l = nodes.get(N - 1)
      val r = nodes.get(bottom)
      l == r and not((l + 1) % 3 == s)
    else
      val l = nodes.get(index - 1)
      val r = nodes.get(index + 1)
      or {
        (s + 1) % 3 == l,
        (s + 1) % 3 == r
      }

  // Transition function for the three-state machine
  pure def state_transition(nodes: int -> int, index: int): int =
    val s = nodes.get(index)
    if (not(has_token(nodes, index)))
      s
    else if (index == bottom)
      (s + 2) % 3 // (s - 1) % 3
    else if (index == top)
      val l = nodes.get(N - 1)
      (l + 1) % 3
    else
      val l = nodes.get(index - 1)
      val r = nodes.get(index + 1)
      if ((s + 1) % 3 == l)
        // Not 100% sure what ewd426 wants here. Might be non-determinism
        // between the two options. We make it deterministic here.
        if ((s + 1) % 3 == r)
          r
        else
          l
      else if ((s + 1) % 3 == r)
        r
      else
        s

  /// Initialize all nodes with random states
  action init = all {
    nondet initial = 0.to(N).setOfMaps(0.to(2)).oneOf()
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
    to(0, N).filter(i => has_token(nodes, i)).size()
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

module ewd426_3 {
  import self_stabilization_three_state(N = 5).*
}
