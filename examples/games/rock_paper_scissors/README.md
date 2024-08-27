# Rock-Paper-Scissors Game Module

This project implements a simple Rock-Paper-Scissors game, allowing two players to randomly select moves and determine the winner based on the traditional rules of the game.

## Overview

The `rock_paper_scissors` module provides the core functionality for the game, including:

- **Player Setup:** Constants for player names.
- **Game Logic:** Actions to decide player moves, determine the winner, and reset the game.
- **Invariant Checking:** Ensures the game status reflects the expected winner based on the rules.

The `play_rock_paper_scissors` module demonstrates how to import and use the `rock_paper_scissors` module with specific player names.

## Components

### Module: `rock_paper_scissors`

This is the main module where the game logic resides.

- **Constants:**
  - `PLAYER1`: Name of the first player.
  - `PLAYER2`: Name of the second player.

- **Types:**
  - `Move`: Enum representing possible moves: `Init`, `Rock`, `Paper`, `Scissors`.
  - `GameStatus`: Enum representing the status of the game: `Started`, `Pending`, `Draw`, `Winner(str)`.

- **Variables:**
  - `p1State`: Current move of Player 1.
  - `p2State`: Current move of Player 2.
  - `status`: Current status of the game.

- **Functions:**
  - `beats(m1: Move, m2: Move): bool`: Determines if `m1` beats `m2` based on Rock-Paper-Scissors rules.

- **Actions:**
  - `init`: Initializes the game with both players in `Init` state and the game status as `Started`.
  - `decide_moves`: Randomly selects moves for both players from the set of possible moves (`Rock`, `Paper`, `Scissors`) and updates the game status to `Pending`.
  - `find_winner`: Determines the winner based on the players' moves and updates the game status to `Winner(PLAYER1)`, `Winner(PLAYER2)`, or `Draw`.
  - `step`: The main game loop that progresses the game through different states (`Started`, `Pending`, etc.) and resets the game for a new round.

- **Invariants:**
  - `winInv`: Ensures the game status matches the expected winner based on the rules of Rock-Paper-Scissors.

### Module: `play_rock_paper_scissors`

This module imports the `rock_paper_scissors` module and assigns the player names:

```bluespec
import rock_paper_scissor(PLAYER1 = "Mahtab", PLAYER2 = "Gabriela").*
```

## How It Works

1.  **Initialization:**
    - The game starts with both players in the Init state, and the game status is set to Started.

2.  **Move Decision:**
    - The `decide_moves` action randomly selects a move for each player and updates the game status to Pending.

3.  **Determine Winner:**
    - The `find_winner` action evaluates the moves and determines the winner or declares a draw.

4.  **Game Progression:**
    - The step action orchestrates the progression of the game from initialization to move decision, winner determination, and resetting for a new round.

5.  **Invariant Checking:**
    - The winInv invariant ensures that the game status correctly reflects the outcome of the moves.

## Usage
-  To run the spec, import the `rock_paper_scissors` module and specify the player names as shown in the `play_rock_paper_scissors` module.

-  Run using the command:
    - `quint run play_rock_paper_scissors.qnt --invariant=winInv`