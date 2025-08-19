// -*- mode: Bluespec; -*-

module instantiatable_tree {
  import apply_state_machine.* from "../apply_state_machine"
  export apply_state_machine.*

  const fancy: bool

  action step = if (fancy) step_fancy else step_simple
}
