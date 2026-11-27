import Quint

/-! The tic-tac-toe of the Quint corpus, checked with Veil's model checker.

Its moves call actions with arguments and stack five guards before two dependent picks. Written as one
local per argument and one `require` per guard, such an action exhausts Lean's memory while Veil
elaborates it, so `quint_module` substitutes the arguments and conjoins the guards. The search covers
every reachable state, and O never wins. -/

quint_module "../../examples/games/tictactoe/tictactoe.qnt"

/-- info: ✅ No violation (explored 871 states) -/
#guard_msgs in
#model_check interpreted {} {}

end tictactoe
