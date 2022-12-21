module topLevelNondet {
  // we do not allow for top-level nondet declarations and expect an error
  nondet toplevelNondet = oneOf(1.to(3))
}
