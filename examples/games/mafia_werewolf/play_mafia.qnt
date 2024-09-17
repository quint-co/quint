// -*- mode: Bluespec; -*-
/**
 * Mafia, also called Werewolf, is a party game to enjoy your gathering!
 *
 * To get more familiar with the game and rules check this link:
 * https://en.wikipedia.org/wiki/Mafia_(party_game)
 *
 * For more information on the implementation and details of the code check this:
 * [1]: https://github.com/informalsystems/quint/blob/main/examples/games/mafia_werewolf/README.md

 * Mahtab Norouzi, Informal Systems, 2024
 */

module mafia {
    import basicSpells.* from "../../spells/basicSpells"

    const PLAYERS : Set[str]
    // Types for roles and life states of players
    type Role = Mafia | Citizen
    type LifeState = Alive | Dead
    type Phase = Day | Night
    type PlayerFeatures = {
        name: str,
        role: Role,
        status: LifeState,
        voted: bool  // Indicates whether the player has voted
    }   var players_to_features: str -> PlayerFeatures
    
    var players_to_features: str -> PlayerFeatures
    var votes_by_player: str -> int
    var game_phase: Phase

    type Status = Pending | Done(Role)
    var game_status: Status

    /// Check if all alive players have voted
    val all_voted = players_to_features.values().filter(p => p.status == Alive).forall(p => p.voted == true)

    /// Check if there are any Mafia players
    val has_alive_mafia = players_to_features.values().exists(p => p.role == Mafia and p.status == Alive)

    /// Check if there are any Citizen players
    val has_alive_citizen = players_to_features.values().exists(p => p.role == Citizen and p.status == Alive)

    /// Find players with the most votes if all players have voted
    val get_most_voted_players = {
        if (all_voted) {
            val max_votes = PLAYERS.fold(-1, (acc, p) => {
                val votes = votes_by_player.get(p)
                if (votes > acc) votes else acc
            })
            PLAYERS.filter(p => votes_by_player.get(p) == max_votes)
        } else Set()  // Return an empty set if not all players have votedx
    }

    pure def transformValues(m: a -> b, f: (b) => c): a -> c = {
        m.keys().mapBy(k => f(m.get(k)))
    }
    
    /// Check if all Mafia players are dead
    pure def all_mafias_dead(players: str -> PlayerFeatures): bool = {
        players.values().forall(p => p.role == Mafia implies p.status == Dead)
    }

    /// Check if all Citizen players are dead
    pure def all_citizens_dead(players: str -> PlayerFeatures): bool = {
        players.values().forall(p => p.role == Citizen implies p.status == Dead)
    }

    /// Update the game status based on the current state
    pure def update_status(players: str -> PlayerFeatures): Status = {
        if (all_mafias_dead(players)) Done(Citizen)  // Citizens win if all Mafias are dead
        else if (all_citizens_dead(players)) Done(Mafia)  // Mafia wins if all Citizens are dead
        else Pending  // The game is still ongoing
    }

    /// Function to update player features after being killed
    def update_features_after_kill(victim: str): str -> PlayerFeatures = {
        players_to_features.setBy(victim, p => { ...p, status: Dead })
    }

    /// Function to update player features after hanging
    def update_features_after_hang(player_to_hang: str): str -> PlayerFeatures = {
        players_to_features
          .setBy(player_to_hang, p => { ...p, status: Dead })
          .transformValues(p => { ...p, voted: false })
    }

    action init = all {
        pure val roles = Set(Mafia, Citizen)
        nondet role_by_player = PLAYERS.setOfMaps(roles).oneOf()
        players_to_features' = PLAYERS.mapBy(p => { name: p, role: role_by_player.get(p), status: Alive, voted: false }),
        game_phase' = Night,  // Start with the Night phase
        game_status' = Pending,  // Game is in Pending status
        votes_by_player' = PLAYERS.mapBy(p => 0)  // Initialize vote counts to 0
    }

    /// Action for Mafia killing a player
    action mafia_kills = {
        nondet victim = players_to_features.values().filter(p => p.status == Alive and p.role == Citizen).oneOf()
        val updated_features = update_features_after_kill(victim.name)
        val new_game_status = update_status(updated_features)
        all {
            players_to_features.values().exists(p => p.status == Alive and p.role == Mafia),
            game_phase == Night,
            players_to_features' = updated_features,
            game_status' = new_game_status,         
            game_phase' = Day,
            votes_by_player' = votes_by_player
        }
    }

    /// Voting action during the Day phase
    action vote = { 
        nondet current_voter = players_to_features.values().filter(p => p.status == Alive).oneOf()
        nondet selected_target = players_to_features.values().filter(p => p.status == Alive and p.name != current_voter.name).oneOf()
        all {
            game_phase == Day,
            game_status == Pending,
            current_voter.voted == false,
            players_to_features' = players_to_features.set(current_voter.name, { ...current_voter, voted: true }),
            votes_by_player' = votes_by_player.set(selected_target.name, votes_by_player.get(selected_target.name) + 1),
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
            players_to_features.get(player_to_hang).status == Alive,
            players_to_features' = updated_features,
            game_phase' = Night,
            votes_by_player' = PLAYERS.mapBy(p => 0),
            game_status' = new_game_status
        }
    }

    /// If there's a tie, reset the votes and move to the Night phase without hanging anyone
    action votes_tied = all {
        players_to_features' = players_to_features.transformValues( p => {
            ...p,
            voted: false
        }),
        game_phase' = Night,
        votes_by_player' = PLAYERS.mapBy(p => 0),
        game_status' = Pending
    }

    action step = if (has_alive_mafia and has_alive_citizen) any {
            mafia_kills,
            vote,
            hang_someone,
    } else init

    // Invariants
    /// Check if all Mafia players are dead
    val mafias_dead: bool = {
        players_to_features.values().filter(p => p.role == Mafia).forall(p => p.status == Dead)
    }

    /// Check if all Citizen players are dead
    val citizens_dead: bool = {
        players_to_features.values().filter(p => p.role == Citizen).forall(p => p.status == Dead)
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
        (PLAYERS.filter(p => players_to_features.get(p).role == Mafia).size() >= 2) implies not (game_status == Done(Citizen))
    }
}

// Module to play the Mafia game with a specific set of players
module play_mafia {
    import mafia(PLAYERS = Set("mahtab", "gabriela", "max").*
}
