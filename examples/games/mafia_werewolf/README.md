# Overview

This is an implementation of the Mafia party game, where players are secretly assigned roles (Mafia or Citizen) and must either work together or against each other to win. The game alternates between two phases: Day and Night. During the day, players vote to eliminate suspected Mafia members, and at night, the Mafia secretly kills a Citizen. The game continues until either all Citizens or all Mafia members are eliminated

# Objective

- **Mafia:** Eliminate all Citizens.
- **Citizen:** Identify and eliminate all Mafia.

# Components

## Types:

-   **Role:** Each player is either a `Mafia` or a `Citizen`.
-   **LifeState:** Represents whether a player is `Alive` or `Dead`.
-   **Phase:** The game alternates between `Day` and `Night` phases.
-   **PlayerFeatures:** The structure stores key data about a player, including their role, life status, and whether they have voted.

## Variables:

-   **players_to_features:** A map from player names to their respective `PlayerFeatures`.
-   **votes_by_player:** Tracks the votes each player has received.
-   **game_phase:** Indicates whether it's currently `Day` or `Night`.
-   **game_status:** Indicates whether the game is `Pending` or if a specific role has won.

## Game Status:

-   The game continues until all players from one of the roles (Mafia or Citizen) are dead.

-   The game can be in one of three states:
    -   **Pending:** The game is still ongoing.
    -   **Done(Role):** The game is finished, and the `Role` represents the winning team (either Mafia or Citizens).


# How It Works:

## Initial Setup:

The game starts in the `Night` phase. Players are randomly assigned as either `Mafia` or `Citizen`, and their status is set to `Alive`. Votes are also initialized to zero. 
Note: A game should consist of both `Mafia` and `Citizen` to be valid.


## Game Phases:

1.  **Night Phase:** During this phase, a Mafia selects a Citizen to kill.
2.  **Day Phase:** During this phase, all players(Citizens and Mafia) vote to hang one player based on suspicion. The player with maximum votes will be eliminated from the game. In case of a tie in votes for two or more players, nothing happens and the game moves on.

## Actions:

-   **Mafia Kills:** The Mafia can kill one Citizen during the night.
-   **Vote:** During the day, all living players vote to hang a player.
-   **Hang:** The player with the most votes is hung.
-   **Tie:** If there is a tie in the vote, no one is hung, and the game proceeds to the next night phase.

## Winning Conditions:

-   **Mafia Wins:** If all Citizens are dead.
-   **Citizen Wins:** If all Mafia are dead.

## Special Features:

-   **Voting System:** Each player can vote once per day to hang a player. If all votes are tied, no player is eliminated.
-   **Status Check:** The game constantly checks if all Mafia or Citizen players are dead to determine if the game should end.

## Usage:

-   **Initializing the Game:** Import the `mafia` module and specify the desired amount of players participating in the game. Roles will be randomly assigned.

-   **Running the Game:**
    - `quint run play_mafia.qnt`
      
