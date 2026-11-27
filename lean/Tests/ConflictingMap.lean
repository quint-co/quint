import Quint

-- The SMT embedding must reject a map constructor with unequal values at the same key.
/-- error: quint_module: a finite map without certified functionality is not supported -/
#guard_msgs in
quint_module "conflictingMap.qnt" (smt := true)
end conflictingMap
