// -*- mode: Bluespec; -*-
/**
 * ewd426's Stabilizing Token Ring (EWD426)
 * 4 state machine
 * This implementation ensures that from some time on,
 * exactly one token circulates in a set of nodes,
 *
 * Mahtab Norouzi, Josef Widder, Informal Systems, 2024-2025
 */
module self_stabilization_four_states {
  const N: int

  val bottom = 0
  val top = N

  type State = {
    x: bool,
    up: bool
  }

  var system: int -> State

  pure def has_token(nodes: int -> State, index: int): bool =
    val s = nodes.get(index)
    if (index == bottom)
      val r = nodes.get(1)
      s.x == r.x and not(r.up)
    else if (index == top)
      val l = nodes.get(N - 1)
      not(s.x == l.x)
    else
      val l = nodes.get(index - 1)
      val r = nodes.get(index + 1)
      or {
        not(s.x == l.x),
        and {
          s.x == r.x,
          s.up,
          not(r.up)
        }
      }

  // Pure function to handle the four-state transition
  pure def state_transition(nodes: int -> State, index: int): State =
    val s = nodes.get(index)
    if (not(has_token(nodes, index)))
      s
    else if (index == bottom)
      { x: not(s.x), up: s.up }
    else if (index == top)
      { x: not(s.x), up: s.up }
    else
      val l = nodes.get(index - 1)
      val r = nodes.get(index + 1)
      if (not(s.x == l.x))
        { x: not(s.x), up: true }
      else
        // and {s.x == r.x, s.up, not(r.up)}
        { x: s.x, up: false }

  action init = all {
    val allState = Set(
      { x: false, up: false },
      { x: false, up: true },
      { x: true, up: false },
      { x: true, up: true }
    )
    nondet initial = 0.to(N).setOfMaps(allState).oneOf()
    // "For the bottom machine upS = true by definition, for the top machine upS = false by definition"
    system' = initial
      .setBy(bottom, s => { ...s, up: true })
      .setBy(top, s => { ...s, up: false })
  }

  /// Action for the four-state machine
  action step = {
    nondet node = 0.to(N).filter(i => has_token(system, i)).oneOf()
    system' = system.set(node, state_transition(system, node))
  }

  // Pure function to count how many tokens exist
  pure def count_tokens(nodes: int -> State): int = {
    0.to(N).filter(i => has_token(nodes, i)).size()
  }

  // Temporal properties
  temporal convergence = eventually(count_tokens(system) == 1)
  temporal closure = always(
    count_tokens(system) == 1 implies always(count_tokens(system) == 1)
  )

  // Invariant
  def tokenInv = count_tokens(system) > 0

  /// to better see the token in the repl
  pure def show_token(nodes: int -> State): int -> bool = nodes.keys().mapBy(i => has_token(nodes, i))
}

module ewd426_4 {
  import self_stabilization_four_states(N = 5).*
}
