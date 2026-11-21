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

  // There is no default name for invariants. Every definition qualified with
  // `invariant` is checked, with no flag:
  //
  // quint verify ./defaultOpNames.qnt
  invariant inv = true

  // Other definitions are checked as invariants with the --invariant flag,
  // or the --invariants flag for several of them
  // E.g.,
  //
  // quint verify ./defaultOpNames.qnt --invariants inv2 inv3
  def inv2 = true
  def inv3 = true
}
