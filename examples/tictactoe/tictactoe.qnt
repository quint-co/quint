module tictactoe {
  var board: int -> (int -> str) // board[1..3][1..3] A 3x3 tic-tac-toe board
  var nextTurn: str // who goes next

  action Init = all {
    nextTurn' = "X", // X always goes first
    // Every space in the board starts blank
    board' = 1.to(3).mapBy(_ => 1.to(3).mapBy(_ => "_")),
  }

  def BoardIs(coordinate, player) =
    board.get(coordinate._1).get(coordinate._2) == player

  action Move(player, coordinate) = all {
    BoardIs(coordinate, "_"),
    board' = board.set(
      coordinate._1, 
      board.get(coordinate._1).set(coordinate._2, player)
    ),
  }

  action MoveToEmpty(player) =
    nondet coordinates = tuples(1.to(3), 1.to(3)).oneOf()
    Move(player, coordinates)

  val winningPatterns = Set(
    // Horizonal wins
    Set((1,1), (1,2), (1,3)),
    Set((2,1), (2,2), (2,3)),
    Set((3,1), (3,2), (3,3)),
    // Vertical wins
    Set((1,1), (2,1), (3,1)),
    Set((1,2), (2,2), (3,2)),
    Set((1,3), (2,3), (3,3)),
    // Diagonal wins
    Set((1,1), (2,2), (3,3)),
    Set((3,1), (2,2), (1,3))
  )

  def Won(player) = winningPatterns.exists(pattern =>
    pattern.forall(coordinate => BoardIs(coordinate, player))
  )

  action MoveO = all {
    nextTurn == "O",
    not(Won("X")),
    MoveToEmpty("O"),
    nextTurn' = "X",
  }

  val corners = Set(
    (1,1), 
    (3,1), 
    (1,3),
    (3,3)
  )

  val BoardEmpty = tuples(1.to(3), 1.to(3)).forall(position =>
    BoardIs(position, "_")
  )

  action StartInCorner =
    nondet corner = oneOf(corners)
    Move("X", corner)

  def canWinWithPattern(winningPattern) = and {
    winningPattern.filter(p => BoardIs(p, "X")).size() == 2,
    winningPattern.filter(p => BoardIs(p, "_")).size() == 1,
  }

  def canBlockWithPattern(winningPattern) = and {
    winningPattern.filter(p => BoardIs(p, "O")).size() == 2,
    winningPattern.filter(p => BoardIs(p, "_")).size() == 1,
  }

  action Win = {
    nondet pattern = winningPatterns.oneOf()
    all {
      canWinWithPattern(pattern),
      nondet p = pattern.oneOf()
      Move("X", p),
    }
  }

  action Block = {
    nondet pattern = winningPatterns.oneOf()
    all {
      canBlockWithPattern(pattern),
      nondet p = pattern.oneOf()
      Move("X", p),
    }
  }

  action TakeCenter = Move("X", (2,2))

  action SetupWin = {
    nondet pattern = winningPatterns.oneOf()
    all {
      pattern.filter(p => BoardIs(p, "X")).size() == 1,
      pattern.filter(p => BoardIs(p, "_")).size() == 2,
      nondet p = pattern.oneOf()
      Move("X", p),
    }
  }

  action MoveX = all {
    nextTurn == "X",
    not(Won("O")),
    if (BoardEmpty) StartInCorner else
      if (enabled(Win)) Win else
      if (enabled(Block)) Block else
      if (enabled(TakeCenter)) TakeCenter else
      if (enabled(SetupWin)) SetupWin else
      MoveToEmpty("X"),
    nextTurn' = "O",
  }

  // Every state, X will move if X's turn, O will move on O's turn
  action Next = any {
    MoveX,
    MoveO,
  }

  temporal XMustEventuallyWin = eventually(Won("X"))

  // Invariants: The things we are checking for.
  val XHasNotWon = not(Won("X"))
  val OHasNotWon = not(Won("O"))
  
  val BoardFilled = not(tuples(1.to(3), 1.to(3)).exists(coordinate =>
    BoardIs(coordinate, "_")
  ))

  // It's not a stalemate if one player has won or the board is not filled
  val NotStalemate = or {
    Won("X"),
    Won("O"),
    not(BoardFilled),
  }
}
