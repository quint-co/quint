// -*- mode: Bluespec; -*-

module mafia {
    const PLAYERS : Set[str]
    // Types for roles and life states of players
    type Role = Mafia | Citizen
    type LifeState = Alive | Dead
    type Phase = Day | Night
    type PlayerFeatures = {
        role: Role,
        status: LifeState,
        voted: bool  // Indicates whether the player has voted
    }
    var player_to_features: str -> PlayerFeatures
    var votes_by_player: str -> int
    var game_phase: Phase
    type Status = Pending | Done(Role)
    var game_status: Status
    /// Check if all alive players have voted
    val all_voted = PLAYERS.filter(p => player_to_features.get(p).status == Alive)
                      .forall(p => player_to_features.get(p).voted == true)
    /// Check if there are any Mafia players left
    val has_mafia = PLAYERS.exists(p => player_to_features.get(p).role == Mafia)
    /// Check if there are any Citizen players left
    val has_citizen = PLAYERS.exists(p => player_to_features.get(p).role == Citizen)
    /// Find players with the most votes if all players have voted
    val get_most_voted_players = {
        if (all_voted) {
            val max_votes = PLAYERS.fold(-1, (acc, p) => {
                val votes = votes_by_player.get(p)
                if (votes > acc) votes else acc
            })
            PLAYERS.filter(p => votes_by_player.get(p) == max_votes)
        } else Set()  // Return an empty set if not all players have voted
    }
    /// Check if all Mafia players are dead
    pure def all_mafias_dead(player: str -> PlayerFeatures): bool = {
        PLAYERS.filter(p => player.get(p).role == Mafia).forall(p => player.get(p).status == Dead)
    }
    /// Check if all Citizen players are dead
    pure def all_citizens_dead(player: str -> PlayerFeatures): bool = {
        PLAYERS.filter(p => player.get(p).role == Citizen).forall(p => player.get(p).status == Dead)
    }
    /// Update the game status based on the current state
    pure def update_status(player: str -> PlayerFeatures): Status = {
        if (all_mafias_dead(player)) Done(Citizen)  // Citizens win if all Mafias are dead
        else if (all_citizens_dead(player)) Done(Mafia)  // Mafia wins if all Citizens are dead
        else Pending  // The game is still ongoing
    }
    /// Function to reset the players votes after voting is done
    pure def reset_votes_and_statuses(player_to_features: str -> PlayerFeatures): str -> PlayerFeatures = {
        PLAYERS.mapBy(p => {
            ...player_to_features.get(p),
            voted: false
        })
    }
    /// Function to update player features after hanging
    def update_features_after_hang(player_to_hang: str): str -> PlayerFeatures = {
        PLAYERS.mapBy(p =>
            if (p == player_to_hang) {
                ...player_to_features.get(p),
                status: Dead,
                voted: false
            } else {
                ...player_to_features.get(p),
                voted: false
            }
        )
    }
    /// Function to update player features after being killed by the mafia
    def update_features_after_kill(victim: str): str -> PlayerFeatures ={
        player_to_features.set(victim, {
            ...player_to_features.get(victim),
            status: Dead
        })
    }

    action init = all {
        pure val roles = Set(Mafia, Citizen)
        nondet role_by_player = PLAYERS.setOfMaps(roles).oneOf()
        player_to_features' = PLAYERS.mapBy(name => { role: role_by_player.get(name), status: Alive, voted: false }),
        game_phase' = Night,  // Start with the Night phase
        game_status' = Pending,  // Game is in Pending status
        votes_by_player' = PLAYERS.mapBy(p => 0)  // Initialize vote counts to 0
    }

    /// Action for Mafia killing a player
    action mafia_kills = any {
        nondet killer = PLAYERS.filter(p => player_to_features.get(p).status == Alive and player_to_features.get(p).role == Mafia).oneOf()
        nondet victim = PLAYERS.filter(p => player_to_features.get(p).status == Alive and player_to_features.get(p).role == Citizen).oneOf()
        
        val updated_features = update_features_after_kill(victim)
        val new_game_status = update_status(updated_features)
        all {
            game_phase == Night,
            player_to_features' = updated_features,
            game_status' = new_game_status,         
            game_phase' = Day,
            votes_by_player' = votes_by_player
        }
    }

    /// Voting action during the Day phase
    action vote = {
        nondet selected_target = PLAYERS.filter(p => player_to_features.get(p).status == Alive).oneOf()
        nondet current_voter = PLAYERS.filter(p => player_to_features.get(p).status == Alive and p != selected_target).oneOf()
        all {
            game_phase == Day,
            game_status == Pending,
            player_to_features.get(current_voter).voted == false,
            
            player_to_features' = player_to_features.set(current_voter, { ...player_to_features.get(current_voter), voted: true}),
            votes_by_player' = votes_by_player.set(selected_target, votes_by_player.get(selected_target) + 1),
            game_phase' = Day,
            game_status' = Pending,
        }
    }

    /// Action to hang a player based on voting results
    action hang_someone = {
        val players_with_max_votes = get_most_voted_players
        all {
            game_phase == Day,
            game_status == Pending,
            all_voted,
            if (players_with_max_votes.size() == 1) execute_hanging
            else votes_tied
        }
    }

    /// If exactly one player has the maximum votes, hang that player
    action execute_hanging = {
        nondet player_to_hang = get_most_voted_players.oneOf()
        val updated_features = update_features_after_hang(player_to_hang)
        val new_game_status = update_status(updated_features)
        
        all {
            player_to_features.get(player_to_hang).status == Alive,
            player_to_features' = updated_features,
            game_phase' = Night,
            votes_by_player' = PLAYERS.mapBy(p => 0),
            game_status' = new_game_status
        }
    }

    /// If there's a tie, reset the votes and move to the Night phase without hanging anyone
    action votes_tied = all {
        player_to_features' = reset_votes_and_statuses(player_to_features),
        game_phase' = Night,
        votes_by_player' = PLAYERS.mapBy(p => 0),
        game_status' = Pending
    }

    action step = if (has_mafia and has_citizen) any {
            mafia_kills,
            vote,
            hang_someone,
    } else init

    // Invariants
    /// Check if all Mafia players are dead
    val mafias_dead: bool = {
        PLAYERS.filter(p => player_to_features.get(p).role == Mafia).forall(p => player_to_features.get(p).status == Dead) and has_mafia and has_citizen
    }
    /// Check if all Citizen players are dead
    val citizens_dead: bool = {
        PLAYERS.filter(p => player_to_features.get(p).role == Citizen).forall(p => player_to_features.get(p).status == Dead) and has_mafia and has_citizen
    }
    /// Invariant to ensure the game status correctly reflects the state of the game
    val correct_game_status = and {
        game_status == Done(Citizen) implies mafias_dead,
        game_status == Done(Mafia) implies citizens_dead,
        game_status == Pending implies not((mafias_dead) or (citizens_dead))
    }
    /// Invariant to check with a specific ration, mafias outnumber the citizens will always win the game.
    // Here because there are three players, having two mafias guaranty they win.
    val win_ratio = {
        (PLAYERS.filter(p => player_to_features.get(p).role == Mafia).size() >= 2) implies not (game_status == Done(Citizen))
    }
}

// Module to play the Mafia game with a specific set of players
module play_mafia {
    import mafia(PLAYERS = Set("mahtab", "gabriela","max")).*
}
