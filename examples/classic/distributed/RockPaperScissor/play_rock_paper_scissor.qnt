
module rock_paper_scissor {

    // Constants for player names
    const PLAYER1 : str
    const PLAYER2 : str

    // Enum types for the possible moves and game status
    type Move = Init | Rock | Paper | Scissor
    type GameStatus = Started | Pending | Draw | Winner(str)

    // Variables to hold the current state of each player's move and the game status
    var p1State : Move
    var p2State : Move
    var game : GameStatus

    // Initialize the game with both players in 'Init' state and game status as 'Started'
    action init = all {
        p1State' = Init,
        p2State' = Init,
        game' = Started
    }


    // Randomly decide moves for both players from the set of possible moves
    action decideMoves() = {
        nondet move1 = Set(Rock, Paper, Scissor).oneOf() // Non-deterministically pick a move for player 1
        nondet move2 = Set(Rock, Paper, Scissor).oneOf() // Non-deterministically pick a move for player 1
        all {
            p1State' = move1,
            p2State' = move2
        }
    }


    // Determine the winner based on the current moves of both players
    action updateWinner () = any {
        if (
            (p1State == Rock and p2State == Scissor) or
            (p1State == Paper and p2State == Rock) or
            (p1State == Scissor and p2State == Paper)
        ){
            game' = Winner(PLAYER1) // Player 1 wins if their move beats player 2's move
            
        } else {
            if (
            (p1State == Rock and p2State == Paper) or
            (p1State == Paper and p2State == Scissor) or
            (p1State == Scissor and p2State == Rock)
            ){

                game' = Winner(PLAYER2) // Player 2 wins if their move beats player 1's move
            } else {
                
                game' = Draw // It's a draw if both players chose the same move
            }
        }

    }


    action step = if ((p1State == Init) or (p2State == Init)) all {
        // Decide the moves if the game is in the initial state
        decideMoves,
        // Put the game in the Pending status when players have made their moves
        game' = Pending,
        
    } else {
        if (game == Pending) all{
            // Put the game on hold with each player's move for one round to decide the winner
            p1State' = p1State,
            p2State' = p2State,
            // Update the winner based on the current moves
            updateWinner,

        }  else all {
            // Reset the game if it's not pending
            p1State' = Init,
            p2State' = Init,
            game' = Started
        }
    }


    // Conditions to determine the winner based on players' moves
    val winCondition1 = (
        (p1State == Paper and p2State == Rock)
        or
        (p1State == Rock and p2State == Scissor)
        or
        (p1State == Scissor and p2State == Paper)
    )

    val winCondition2 = (
        (p2State == Paper and p1State == Rock)
        or
        (p2State == Rock and p1State == Scissor)
        or
        (p2State == Scissor and p1State == Paper)
    )

    // Invariant to check if the game status matches the expected winner
    val winInv = (winCondition1 implies (game == Winner(PLAYER1)) or (winCondition2 implies (game == Winner(PLAYER2))))

}

module play_rock_paper_scissor {
    import rock_paper_scissor(PLAYER1 = "Mahtab", PLAYER2 = "Gabriela").*    
}