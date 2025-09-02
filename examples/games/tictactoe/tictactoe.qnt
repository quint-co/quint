// -*- mode: Bluespec; -*-
/**
 * A simple definition of the tictactoe game based on [1]. Player X will
 * always play the best move while Player O will play a random valid move.
 *
 * Usability hack: if you run this in a sufficiently narrow terminal window,
 * each row of the board is printed in a new line and it looks like a board.
 * This is useful while quint doesn't support custom views for traces.
 *
 * [1]: https://elliotswart.github.io/pragmaticformalmodeling/
 *
 * Gabriela Moreira, Informal Systems, 2022-2023
 */
module tictactoe {
  type Player = X | O
  type Square = Occupied(Player) | Empty

  /// A 3x3 tic-tac-toe board
  var board: int -> (int -> Square)

  /// Who goes next
  var nextTurn: Player

  pure val boardCoordinates = tuples(1.to(3), 1.to(3))

  pure val winningPatterns = Set(
    // Horizontal wins
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

  pure val corners = Set(
    (1,1),
    (3,1),
    (1,3),
    (3,3)
  )

  def square(coordinate: (int, int)): Square =
    board.get(coordinate._1).get(coordinate._2)

  def hasPlayer(coordinate, player) = match square(coordinate) {
    | Empty   => false
    | Occupied(p) => player == p
  }

  def isEmpty(coordinate) = match square(coordinate) {
    | Empty  => true
    | _      => false
  }

  val boardEmpty = boardCoordinates.forall(isEmpty)

  def won(player) = winningPatterns.exists(pattern =>
    pattern.forall(coordinate => hasPlayer(coordinate, player))
  )

  val boardFull = not(boardCoordinates.exists(isEmpty))
  val stalemate = boardFull and not(won(X)) and not(won(O))
  val gameOver = won(X) or won(O) or boardFull

  def canWinWithPattern(pattern) = and {
    pattern.filter(coordinate => coordinate.hasPlayer(X)).size() == 2,
    pattern.filter(coordinate => coordinate.isEmpty()).size() == 1,
  }

  def canBlockWithPattern(pattern) = and {
    pattern.filter(coordinate => coordinate.hasPlayer(O)).size() == 2,
    pattern.filter(coordinate => coordinate.isEmpty()).size() == 1,
  }

  def canSetupWinWithPattern(pattern) = and {
    pattern.filter(coordinate => coordinate.hasPlayer(X)).size() == 1,
    pattern.filter(coordinate => coordinate.isEmpty()).size() == 2,
  }

  val canWin = winningPatterns.exists(canWinWithPattern)
  val canBlock = winningPatterns.exists(canBlockWithPattern)
  val canTakeCenter = isEmpty((2,2))
  val canSetupWin = winningPatterns.exists(canSetupWinWithPattern)

  action Move(player, coordinate) = all {
    isEmpty(coordinate),
    board' = board.setBy(
      coordinate._1,
      row => row.set(coordinate._2, Occupied(player))
    ),
  }

  action Win = all {
    canWin,
    nondet pattern = winningPatterns.filter(canWinWithPattern).oneOf()
    nondet coordinate = pattern.filter(isEmpty).oneOf()
    Move(X, coordinate),
  }

  action Block = all {
    canBlock,
    nondet pattern = winningPatterns.filter(canBlockWithPattern).oneOf()
    nondet coordinate = pattern.filter(isEmpty).oneOf()
    Move(X, coordinate),
  }

  action TakeCenter = Move(X, (2, 2))

  action SetupWin = all {
    nondet pattern = winningPatterns.filter(canSetupWinWithPattern).oneOf()
    nondet coordinate = pattern.filter(isEmpty).oneOf()
    Move(X, coordinate),
  }

  action MoveToEmpty(player) =
    nondet coordinate = boardCoordinates.filter(isEmpty).oneOf()
    Move(player, coordinate)

  action StartInCorner =
    nondet corner = oneOf(corners)
    Move(X, corner)

  action MoveX = all {
    nextTurn == X,
    not(gameOver),
    if (boardEmpty) StartInCorner else
    if (canWin) Win else
    if (canBlock) Block else
    if (canTakeCenter) TakeCenter else
    if (canSetupWin) SetupWin else
    MoveToEmpty(X),
    nextTurn' = O,
  }

  action MoveO = all {
    nextTurn == O,
    not(gameOver),
    MoveToEmpty(O),
    nextTurn' = X,
  }

  action init = all {
    // X always goes first
    nextTurn' = X,
    // Every space in the board starts blank
    board' = 1.to(3).mapBy(_ => 1.to(3).mapBy(_ => Empty)),
  }

  /// Either X or O will make a move, depending on the value of `nextTurn`
  action step = any {
    MoveX,
    MoveO,
    // If the game is over, we don't need to do anything
    all { gameOver, board' = board, nextTurn' = nextTurn },
  }

  /* Invariants */

  /// X has not won. This does not hold, as X wins most of the times.
  val XHasNotWon = not(won(X))

  /// O has not won. This should hold, as O can only achieve a draw.
  val OHasNotWon = not(won(O))

  /// It's not a stalemate if one player has won or the board is not filled
  /// Check with `quint run --invariant=NotStalemate tictactoe.qnt`
  val NotStalemate = not(stalemate)

  /// OHasNotWon is our default invariant for running the simulator/verifier
  /// as it is the only invariant that holds. Check `NotStalemate` for an
  /// interesting counterexample.
  val inv = OHasNotWon

  /// This is not always true, as if O picks the right moves, the game will
  /// result in a stalemate.
  temporal XMustEventuallyWin = eventually(won(X))
}
