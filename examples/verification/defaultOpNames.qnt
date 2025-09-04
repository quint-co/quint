module defaultOpNames {
  // The default name for the state initialization action is `init`.
  action init = true

  // The state initialization action can be configured from the CLI using the --init flag.
  // E.g.,
  //
  // quint verify --init myInit ./defaultOpNames.qnt
  action myInit = true

  // The default name for the state transition action is `step`.
  action step = true

  // The state transition action can be configured from the CLI using the --step flag.
  // E.g.,
  //
  // quint verify --step myStep ./defaultOpNames.qnt
  action myStep = true

  // There is no default name for invariants.
  // These must be specified using the --invariant flag
  // E.g.,
  //
  // quint verify --invariant inv ./defaultOpNames.qnt
  def inv = true

  // Multiple invariants can be specified by separating them with a comma
  // E.g.,
  //
  // quint verify --invariant inv,inv2 ./defaultOpNames.qnt
  def inv2 = true
}
