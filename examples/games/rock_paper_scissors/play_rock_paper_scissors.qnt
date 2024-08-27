// -*- mode: Bluespec; -*-

module rock_paper_scissors {
    // Constants for player names
    const PLAYER1 : str
    const PLAYER2 : str
    // Sum types for the possible moves and game status
    type Move = Init | Rock | Paper | Scissors
    type GameStatus = Started | Pending | Draw | Winner(str)
    // Variables to hold the current state of each player's move and the game status
    var p1State: Move
    var p2State: Move
    var status: GameStatus

    def beats(m1: Move, m2: Move): bool = or {
        (m1 == Rock and m2 == Scissors),
        (m1 == Paper and m2 == Rock),
        (m1 == Scissors and m2 == Paper),
    }
    /// Initialize the game with both players in 'Init' state and game status as 'Started'
    action init = all {
        p1State' = Init,
        p2State' = Init,
        status' = Started
    }

    /// Randomly decide moves for both players from the set of possible moves
    action decide_moves = {
        nondet move1 = Set(Rock, Paper, Scissors).oneOf() // Non-deterministically pick a move for player 1
        nondet move2 = Set(Rock, Paper, Scissors).oneOf() // Non-deterministically pick a move for player 2
        all {
            p1State' = move1,
            p2State' = move2,
            status' = Pending,
        }
    }
    
    /// Determine the winner based on the current moves of both players
    action find_winner = any {
        if (beats(p1State, p2State)) status' = Winner(PLAYER1) // Player 1 wins if their move beats player 2's move
        else if (beats(p2State, p1State)) status' = Winner(PLAYER2) // Player 2 wins if their move beats player 1's move
        else status' = Draw // It's a draw if both players chose the same move
    }

    action step = if (status == Started) {
        decide_moves
    } else if (status == Pending) all {
        p1State' = p1State,
        p2State' = p2State,
        find_winner,
    }  else all {
        p1State' = Init,
        p2State' = Init,
        status' = Started
    }

    /// Invariant to check if the game status matches the expected winner
    val winInv = and {
        status == Winner(PLAYER1) implies beats(p1State, p2State),
        status == Winner(PLAYER2) implies beats(p2State, p1State),
    }
}

module play_rock_paper_scissors {
    import rock_paper_scissors(PLAYER1 = "Mahtab", PLAYER2 = "Gabriela").*
}
