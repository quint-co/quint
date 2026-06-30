/* =============================================================================
 * quint-modeling REFERENCE EXAMPLE — communication model: MESSAGE-PASSING (Choreo)
 * -----------------------------------------------------------------------------
 * Why this is bundled: it is the canonical *Choreo framework* spec — a real BFT
 * consensus engine (Tendermint), and the source of the examples in
 * ../../../quint-lang/guidelines/choreo.md. Choreo is a different programming model
 * from plain Quint (its own `choreo::` API), so it cannot be inferred — you have to
 * see one. Contrast with the shared-memory example (../ewd426.qnt).
 *
 * READ THIS when modelling ANY distributed protocol where parties exchange messages —
 * consensus/BFT, replication, atomic commit, leader election, reliable broadcast/gossip,
 * request/response, a mempool. It is the default reference for message-passing systems
 * (not just consensus); the patterns below transfer. Use ../ewd426.qnt instead only when
 * parts coordinate through SHARED STATE rather than messages.
 *
 * Demonstrates the `choreo::cue` PATTERN — separate *when* from *what*:
 *   - `listen_*(ctx): Set[Params]`  — the messages/conditions that match (Set[()] for
 *                                     state/quorum-only triggers).
 *   - `broadcast_*` / `act_*(ctx, p): Transition` — the reaction for each match.
 *   - `main_listener` wires them with `choreo::cue(ctx, listen, act)` (x7) — reads
 *     like the protocol at a glance.
 * Plus: real `agreement` / `validity` / `accountability` invariants.
 *
 * QUICK READ (to learn the pattern without reading all ~760 lines — anchored to
 * names so it survives upstream re-sync): read `listen_proposal_in_propose` +
 * `broadcast_prevote_for_proposal` (one cue pair), then `main_listener` (the wiring),
 * then the `agreement` / `validity` / `accountability` invariants. The rest is full
 * protocol depth.
 *
 * TESTS: in the sibling `tendermintTest.qnt` (this spec has no `run`s, per the
 * test-separation guideline — quint-lang/guidelines/tests.md). That file also holds
 * the concrete instances; the spec here is parametric (const F/CORRECT/FAULTY/...),
 * so it cannot run on its own — run an instance:
 *   quint run tendermintTest.qnt --main=valid --invariant="agreement and validity and accountability"
 * The `no_agreement` instance there is a deliberate agreement-violation demo.
 *
 * Dependencies (bundled alongside): ./choreo.qnt, ./spells/basicSpells.qnt.
 * Verified clean on Quint 0.32.0. See ../README.md for re-verification commands.
 * ============================================================================= */
module tendermint {
  import basicSpells.* from "./spells/basicSpells"
  import choreo(processes = NODES) as choreo from "./choreo"

  type Round = int
  type Stage = ProposeStage | PreVoteStage | PreCommitStage | DecidedStage
  type Value = str

  type Bookkeeping = {
    evidence_propose: Set[ProposeMsg],
    evidence_prevote: Set[PreVoteMsg],
    evidence_precommit: Set[PreVoteMsg],
  }

  type TimeoutKind = ProposeTimeout | PreVoteTimeout | PreCommitTimeout
  type TimeoutEvent = { kind: TimeoutKind, round: Round }

  /// The ID of a value. In the implementation, this would be a hash of the value.
  /// Here, we wrap it in a record and don't convert it back into a value.
  /// This keeps the property that v1.id() == v2.id() iff v1 == v2.
  type ValueId = { hashed: Value }
  type Node = str

  type StateFields = {
    round: Round,
    stage: Stage,
    decision: Option[Value],
    locked_value: Option[Value],
    locked_round: Round,
    valid_value: Option[Value],
    valid_round: Round,
    after_prevote_for_first_time: bool,
    precommit_quorum: bool,
  }

  type ProposeMsg = {
    src: Node,
    round: Round,
    proposal: Value,
    valid_round: Round,
  }

  type PreVoteMsg = {
    src: Node,
    round: Round,
    id: Option[ValueId],
  }

  type Message =
    | Propose(ProposeMsg)
    | PreVote(PreVoteMsg)
    | PreCommit(PreVoteMsg)

  type CustomEffects = CollectEvidence(Message)
  type Event = TimeoutEvent
  type Extensions = Bookkeeping

  /* Boilerplate */
  type LocalState = choreo::LocalState[Node, StateFields]
  type LocalContext = choreo::LocalContext[Node, StateFields, Message, Event, Extensions]
  type Transition = choreo::Transition[Node, StateFields, Message, Event, CustomEffects]
  type GlobalContext = choreo::GlobalContext[
    Node,
    StateFields,
    Message,
    Event,
    Extensions
  ]
  /* End of boilerplate */

  pure def get_proposals(messages: Set[Message]): Set[ProposeMsg] =
    messages.filterMap(m => {
      match m {
        | Propose(p) => Some(p)
        | _ => None
      }
    })

  pure def get_pre_votes(messages: Set[Message]): Set[PreVoteMsg] =
    messages.filterMap(m => {
      match m {
        | PreVote(p) => Some(p)
        | _ => None
      }
    })

  pure def get_pre_commits(messages: Set[Message]): Set[PreVoteMsg] =
    messages.filterMap(m => {
      match m {
        | PreCommit(p) => Some(p)
        | _ => None
      }
    })

  pure def source(message: Message): Node =
    match message {
      | Propose(p) => p.src
      | PreVote(p) => p.src
      | PreCommit(p) => p.src
    }

  pure def valid(v: Value): bool = {
    VALID_VALUES.contains(v)
  }

  pure def id(v: Value): ValueId = { hashed: v }

  pure def start_round(ctx: LocalContext, round: Round): Transition = {
    val s = ctx.state

    pure val effect =
      if (s.process_id == PROPOSER.get(round)) {
        pure val proposal =
          if (s.valid_value != None)
            s.valid_value.unwrap()
          else
            VALUES.get(round)

        choreo::Broadcast(
          Propose({ src: s.process_id, round: round, proposal: proposal, valid_round: s.valid_round })
        )
      } else {
        choreo::TriggerEvent({ kind: ProposeTimeout, round: s.round })
      }
    {
      effects: Set(effect),
      post_state: {
        ...s,
        round: round,
        stage: ProposeStage,
        precommit_quorum: false,
      }
    }
  }

  pure def listen_proposal_in_propose(ctx: LocalContext): Set[ProposeMsg] = {
    val s = ctx.state
    val messages = ctx.messages

    val state_guard = and {
      s.stage == ProposeStage
    }

    // Message guards: predicates on the messages that can use the state as context
    def message_guard = (p) => and {
      p.valid_round == -1,
      p.src == PROPOSER.get(s.round),
    }

    // Apply Guards
    val proposals = messages.get_proposals()
    proposals.filter(p => and {
      message_guard(p),
      state_guard
    })
  }

  pure def broadcast_prevote_for_proposal(ctx: LocalContext, p: ProposeMsg): Transition = {
    val s = ctx.state

    // Broadcast the PreVote message for the proposal
    pure val effects = if (valid(p.proposal) and (s.locked_round == -1 or s.locked_value == Some(p.proposal))) {
      Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: Some(id(p.proposal)) })))
    } else {
      Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: None })))
    }

    // TODO -> add timeout and logging effects
    {
      post_state: { ...s, stage: PreVoteStage },
      effects: effects.setAdd(choreo::CustomEffect(CollectEvidence(Propose(p))))
    }
  }

  pure def listen_proposal_in_propose_prevote(ctx: LocalContext): Set[ProposeMsg] = {
    val s = ctx.state
    val messages = ctx.messages

    val state_guard = and {
      s.stage == ProposeStage,
    }

    def message_guard = (p) => and {
      p.src == PROPOSER.get(s.round),
      p.valid_round >= 0,
      p.valid_round < s.round
    }

    val proposals = messages.get_proposals().filter(p => and {
      message_guard(p),
      state_guard,
    })

    val pre_votes = messages.get_pre_votes()
    proposals.filter(p => and {
      pre_votes.filter(q => q.id == Some(p.proposal.id()) and q.round == p.valid_round).size() >= 2 * F + 1 // quorum size is F + 1
    })
  }

  pure def broadcast_prevote_with_validation(ctx: LocalContext, p: ProposeMsg): Transition = {
    val s = ctx.state
    val messages = ctx.messages

    // Collect evidence for prevotes that contributed to this decision
    val contributing_prevotes = messages.get_pre_votes().filter(pv => 
      pv.round == p.valid_round and pv.id == Some(id(p.proposal))
    )
    val prevote_evidence = contributing_prevotes.map(pv => choreo::CustomEffect(CollectEvidence(PreVote(pv))))
    val evidence = Set(choreo::CustomEffect(CollectEvidence(Propose(p)))).union(prevote_evidence)

    // Broadcast the PreVote message for the proposal
    val effects = if (valid(p.proposal) and (s.locked_round <= p.valid_round or s.locked_value == Some(p.proposal))) {
      Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: Some(id(p.proposal))})))
    } else {
      Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: None })))
    }

    {
      post_state: { ...s, stage: PreVoteStage },
      effects: effects.union(evidence)
    }
  }


  pure def listen_quorum_prevotes_any(ctx: LocalContext): Set[()] = {
    val s = ctx.state
    val messages = ctx.messages

    // Do we have a quorum of PreVotes in the current round
    def message_guard = (pv) => (pv.round == s.round)
    val quorum = messages.get_pre_votes().filter(pv => and {
        message_guard(pv),
    }).size() >= 2 * F + 1 // quorum size is F + 1

    if (quorum) {
      Set(())
    } else {
      Set()
    }
  }

  pure def trigger_prevote_timeout(ctx: LocalContext, _params: ()): Transition = {
    val s = ctx.state

    // If we have a quorum, we can move to precommit stage
    {
      post_state: s,
      effects: Set(choreo::TriggerEvent({ kind: PreVoteTimeout, round: s.round }))
    }
  }

  pure def listen_quorum_nil_prevotes(ctx: LocalContext): Set[()] = {
    val s = ctx.state
    val messages = ctx.messages

    val state_guard = and {
      s.stage == PreVoteStage,
    }

    // Do we have a quorum of PreVotes in the current round
    def message_guard = (pv) => (pv.round == s.round and pv.id == None)
    val prevotes = messages.get_pre_votes().filter(pv => message_guard(pv))
    val quorum = prevotes.map(m => m.src).size() >= 2 * F + 1

    if (quorum and state_guard) {
      Set(())
    } else {
      Set()
    }
  }

  pure def broadcast_nil_precommit(ctx: LocalContext, _params: ()): Transition = {
    val s = ctx.state
    val messages = ctx.messages

    // Collect evidence for all nil prevotes that enabled this decision
    val nil_prevotes = messages.get_pre_votes().filter(pv => 
      pv.round == s.round and pv.id == None
    )
    val prevote_evidence = nil_prevotes.map(pv => choreo::CustomEffect(CollectEvidence(PreVote(pv))))

    // If we have a quorum, we can move to precommit stage
    {
      post_state: { ...s, stage: PreCommitStage },
      effects: Set(
        choreo::Broadcast(PreCommit({ src: s.process_id, round: s.round, id: None }))
      ).union(prevote_evidence)
    }
  }

  pure def listen_quorum_precommits_any(ctx: LocalContext): Set[()] = {
    val s = ctx.state
    val messages = ctx.messages

    // Do we have a quorum of PreCommits in the current round
    def message_guard = (pc) => (pc.round == s.round)
    val quorum = messages.get_pre_commits().filter(pc => and {
      message_guard(pc),
    }).map(m => m.src).size() >= 2 * F + 1 // quorum size is F + 1

    if (quorum) {
      Set(())
    } else {
      Set()
    }
  }

  pure def trigger_precommit_timeout(ctx: LocalContext, _params: ()): Transition = {
    val s = ctx.state

    // If we have a quorum, we can move to decided stage
    {
      post_state: s,
      effects: Set(choreo::TriggerEvent({ kind: PreCommitTimeout, round: s.round }))
    }
  }

  pure def listen_proposal_in_prevote_commit(ctx: LocalContext): Set[ProposeMsg] = {
    val s = ctx.state
    val messages = ctx.messages

    val state_guard = and {
      s.stage.in(Set(PreVoteStage, PreCommitStage))
    }

    def message_guard = (p) => and {
      p.src == PROPOSER.get(s.round),
      p.round == s.round
    }

    val proposals = messages.get_proposals()
    val pre_votes = messages.get_pre_votes()

    proposals.filter(p => and {
      message_guard(p),
      state_guard,
      // Check for quorum of prevotes for this proposal in current round
      pre_votes.filter(pv => and {
        pv.round == s.round,
        pv.id == Some(id(p.proposal))
      }).map(pv => pv.src).size() >= 2 * F + 1
    })
  }

  pure def lock_value_and_precommit(ctx: LocalContext, p: ProposeMsg): Transition = {
    val s = ctx.state
    val messages = ctx.messages

    // Collect evidence for prevotes that enabled this decision
    val enabling_prevotes = messages.get_pre_votes().filter(pv => 
      pv.round == s.round and pv.id == Some(id(p.proposal))
    )
    val prevote_evidence = enabling_prevotes.map(pv => choreo::CustomEffect(CollectEvidence(PreVote(pv))))

    if (s.stage == PreVoteStage) {
      // If in prevote stage, broadcast precommit and move to precommit stage
      {
        // Move to precommit stage and update values
        post_state: {
          ...s,
          stage: PreCommitStage,
          valid_value: Some(p.proposal),
          valid_round: s.round,
          locked_value: Some(p.proposal),
          locked_round: s.round
        },
        effects: Set(
          choreo::Broadcast(PreCommit({ src: s.process_id, round: s.round, id: Some(id(p.proposal)) })),
          choreo::CustomEffect(CollectEvidence(Propose(p)))
        ).union(prevote_evidence)
      }
    } else {
      // Just update valid value if already in precommit
      {
        post_state: {
          ...s,
          valid_value: Some(p.proposal),
          valid_round: s.round
        },
        effects: Set(choreo::CustomEffect(CollectEvidence(Propose(p)))).union(prevote_evidence)
      }
    }
  }

  pure def listen_proposal_in_precommit_no_decision(ctx: LocalContext): Set[ProposeMsg] = {
    val s = ctx.state
    val messages = ctx.messages

    val state_guard = and {
      s.decision == None
    }

    def message_guard = (p) => and {
      p.src == PROPOSER.get(p.round),
      p.round <= s.round  // Can decide on current or past rounds
    }

    val proposals = messages.get_proposals()
    val pre_commits = messages.get_pre_commits()

    proposals.filter(p => and {
      message_guard(p),
      state_guard,
      // Check for quorum of precommits for this proposal
      pre_commits.filter(pc => and {
        pc.round == p.round,
        pc.id == Some(id(p.proposal))
      }).map(pc => pc.src).size() >= 2 * F + 1
    })
  }

  pure def decide_on_proposal(ctx: LocalContext, p: ProposeMsg): Transition = {
    val s = ctx.state
    val messages = ctx.messages

    // Collect evidence for precommits that enabled this decision
    val enabling_precommits = messages.get_pre_commits().filter(pc =>
      pc.round == p.round and pc.id == Some(id(p.proposal))
    )
    val precommit_evidence = enabling_precommits.map(pc => choreo::CustomEffect(CollectEvidence(PreCommit(pc))))

    // Make decision and move to decided stage
    {
      post_state: {
        ...s,
        decision: Some(p.proposal),
        stage: DecidedStage
      },
      effects: Set(choreo::CustomEffect(CollectEvidence(Propose(p)))).union(precommit_evidence)
    }
  }

  pure def on_propose_timeout(ctx: LocalContext): Set[Transition] = {
    val s = ctx.state

    val candidates = ctx.events.filter(t => t.round >= s.round and t.kind == ProposeTimeout)
    val guard = and {
      candidates.size() > 0,
      s.stage == ProposeStage,
    }

    if (guard)
      Set({
        post_state: { ...s, stage: PreVoteStage },
        effects: Set(
          choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: None })),
          choreo::TriggerEvent({ kind: PreVoteTimeout, round: s.round })
        ),
      })
    else
      Set()
  }

  pure def on_prevote_timeout(ctx: LocalContext): Set[Transition] = {
    val s = ctx.state

    val candidates = ctx.events.filter(t => t.round >= s.round and t.kind == PreVoteTimeout)
    val guard = and {
      candidates.size() > 0,
      s.stage == PreVoteStage,
    }

    if (guard)
      Set({
        post_state: { ...s, stage: PreCommitStage },
        effects: Set(
          choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: None })),
          choreo::TriggerEvent({ kind: PreCommitTimeout, round: s.round })
        ),
      })
    else
      Set()
  }

  pure def on_precommit_timeout(ctx: LocalContext): Set[Transition] = {
    val s = ctx.state

    val candidates = ctx.events.filter(t => t.round >= s.round and t.kind == PreCommitTimeout)
    val guard = and {
      candidates.size() > 0,
      s.stage == PreCommitStage,
    }

    if (guard)
      Set(start_round(ctx, s.round + 1))
    else
      Set()
  }

  pure def main_listener(ctx: LocalContext): Set[Transition] =
    Set(
      choreo::cue(ctx, listen_proposal_in_propose, broadcast_prevote_for_proposal),
      choreo::cue(ctx, listen_proposal_in_propose_prevote, broadcast_prevote_with_validation),
      choreo::cue(ctx, listen_proposal_in_precommit_no_decision, decide_on_proposal),
      choreo::cue(ctx, listen_proposal_in_prevote_commit, lock_value_and_precommit),
      choreo::cue(ctx, listen_quorum_prevotes_any, trigger_prevote_timeout),
      choreo::cue(ctx, listen_quorum_nil_prevotes, broadcast_nil_precommit),
      choreo::cue(ctx, listen_quorum_precommits_any, trigger_precommit_timeout),
      on_propose_timeout(ctx),
      on_prevote_timeout(ctx),
      on_precommit_timeout(ctx)
    ).flatten()

  pure val initial_message =
    Propose({ src: PROPOSER.get(0), round: 0, proposal: VALUES.get(0), valid_round: -1 })

  pure val initial_bookkeeping = {
    evidence_propose: Set(),
    evidence_prevote: Set(),
    evidence_precommit: Set(),
  }

  def initialize_process(n: Node): LocalState = {
    {
      process_id: n,
      round: 0,
      stage: ProposeStage,
      decision: None,
      locked_value: None,
      locked_round: -1,
      valid_value: None,
      valid_round: -1,
      after_prevote_for_first_time: false,
      precommit_quorum: false,
    }
  }

  // Card(powset) = 4096
  val byzantine_messages_1 = {
    val rounds = Set(0)
    val byzantine_proposals = rounds.map(r => {
      tuples(FAULTY, Set("v0","v1","v2"), rounds.setAdd(-1)).map(((f, v, vr)) => {
        Propose({ src: f, round: r, proposal: v, valid_round: vr })
      })
    }).flatten()

    val byzantine_prevotes = rounds.map(r => {
      tuples(FAULTY, Set("v0","v1","v2")).map(((f, v)) => {
        PreVote({ src: f, round: r, id: Some(v.id()) })
      })
    }).flatten()

    val byzantine_precommits = rounds.map(r => {
      tuples(FAULTY, Set("v0","v1","v2")).map(((f, v)) => {
        PreCommit({ src: f, round: r, id: Some(v.id()) })
      })
    }).flatten()

    // Reintegrate byzantine proposals
    Set(byzantine_prevotes, byzantine_precommits, byzantine_proposals).flatten()
  }

  // TODO (Gabriela): I don't understand this
  val byzantine_messages = {
    // We can have at most 2^F faulty nodes, so we take the powerset of the byzantine messages
    // to simulate all possible combinations of byzantine messages.

    // 10 dummy prevotes for future rounds
    val dummy_prevotes = 1000.to(1025).map(r => {
        PreVote({ src: "p4", round: r, id: None })
    })
    dummy_prevotes
    //Set()
  }

  action init = choreo::init({
    system: NODES.mapBy(n => initialize_process(n)),
    messages: NODES.mapBy(n => Set(initial_message).union(byzantine_messages_1)),
    events: NODES.mapBy(n => Set()),
    extensions: initial_bookkeeping
  })

  def apply_custom_effect(env: GlobalContext, effect: CustomEffects): GlobalContext = {
    match effect {
      | CollectEvidence(msg) => {
        pure val updated_bookkeeping = match msg {
          | Propose(p) => { ...env.extensions, evidence_propose: env.extensions.evidence_propose.setAdd(p) }
          | PreVote(p) => { ...env.extensions, evidence_prevote: env.extensions.evidence_prevote.setAdd(p) }
          | PreCommit(p) => { ...env.extensions, evidence_precommit: env.extensions.evidence_precommit.setAdd(p) }
        }
        { ...env, extensions: updated_bookkeeping }
      }
    }
  }

  action step = choreo::step(
    main_listener,
    apply_custom_effect
  )


  // -------------------------------- semantic symmetry utilities --------------------------------
  // TODO: Update these functions to work with choreo library
  /*
  type StateFingerprint = {
    round: Round,
    stage: Stage,
    decision: Option[Value],
    locked_value: Option[Value],
    locked_round: Round,
    valid_value: Option[Value],
    valid_round: Round,
    after_prevote_for_first_time: bool,
    precommit_quorum: bool,
    is_proposer: bool,
  }

  pure def select_representatives(s: GlobalState): Set[Node] = {
    val states = s.system.values()
    val unique = group_by_fingerprint(states)
    unique.setByAll((k, group) => group.filter(n =>(n.in(CORRECT))).takeOne()).
      values().filter(n => n != None).map(n => n.unwrap())
  }

  def group_by_fingerprint(s: Set[LocalState]): StateFingerprint -> Set[Node] = {
    val init = Map()
    s.fold(init, (acc, state) => {
      val key = {
        round: state.round,
        stage: state.stage,
        decision: state.decision,
        locked_value: state.locked_value,
        locked_round: state.locked_round,
        valid_value: state.valid_value,
        valid_round: state.valid_round,
        after_prevote_for_first_time: state.after_prevote_for_first_time,
        precommit_quorum: state.precommit_quorum,
        is_proposer: state.process_id == PROPOSER.get(state.round)
      }
      acc.setByWithDefault(key, (e) => e.setAdd(state.process_id),Set())
    })
  }
  */
  // -------------------------------- semantic symmetry utilities --------------------------------

  val correct_nodes = s.system.values().filter(s => s.process_id.in(CORRECT))
  val agreement = tuples(correct_nodes, correct_nodes).forall(((p1, p2)) => {
     p1.decision == None or p2.decision == None or p1.decision == p2.decision
  })

  val one_decided =
    not(s.system.values().forall(v => v.decision == None))

  val all_decided =
    not(correct_nodes.exists(v => v.decision == None))

  // Witness for a to find a case where a node is in the decided stage while another is prevote
  // state
  val stages =
    and {
      s.system.values().map(v => v.stage).contains(ProposeStage),
      s.system.values().map(v => v.stage).contains(PreVoteStage),
      s.system.values().map(v => v.stage).contains(PreCommitStage),
      s.system.values().map(v => v.stage).contains(DecidedStage)
    }

  // Evidence-based properties
  
  pure def equivocation_in(n: Node, evidence: Set[{ src: Node, round: Round | other }]): bool = {
    tuples(evidence, evidence).exists(((e1, e2)) => {
      e1 != e2 and e1.src == n and e2.src == n and e1.round == e2.round
    })
  }

  /// Equivocation by a node n
  def equivocation_by(n: Node): bool = {
    or {
      n.equivocation_in(s.extensions.evidence_propose),
      n.equivocation_in(s.extensions.evidence_prevote),
      n.equivocation_in(s.extensions.evidence_precommit),
    }
  }

  /// Amnesic behavior by a node n  
  def amnesia_by(n: Node): bool = {
    tuples(ROUNDS, ROUNDS).exists(((r1, r2)) => {
      r1 < r2 and tuples(VALID_VALUES, VALID_VALUES).exists(((v1, v2)) => {
        and {
          v1 != v2,
          s.extensions.evidence_propose.contains({
            src: n, round: r1, proposal: v1, valid_round: r1
          }),
          s.extensions.evidence_propose.contains({
            src: n, round: r2, proposal: v2, valid_round: r2
          }),
          ROUNDS.filter(r => r1 <= r and r < r2).forall(r => {
            s.extensions.evidence_prevote.filter(m => {
              m.round == r and m.id == Some(id(v2))
            }).size() >= 2 * F + 1
          }),
        }
      })
    })
  }

  /// Validity: the decided block satisfies the predefined predicate valid().
  val validity = correct_nodes.forall(s => s.decision.in(VALID_VALUES.map(v => Some(v)).setAdd(None)))

  /// The protocol safety. Two cases are possible:
  ///   1. There is no fork, that is, Agreement holds true.  
  ///   2. A subset of faulty processes demonstrates equivocation or amnesia.
  val accountability = or {
    agreement,
    FAULTY.powerset().exists(f => and {
      f.size() >= F + 1,
      f.forall(n => equivocation_by(n) or amnesia_by(n)),
    })
  }

  const F: int
  /// The set of correct processes
  const CORRECT: Set[Node]
  /// The set of faulty processes
  const FAULTY: Set[Node]
  /// Which node is the proposer in each round
  const PROPOSER: Round -> Node
  /// Which value is proposed in each round.
  /// Values from rounds with correct nodes (in PROPOSER) are considered valid values.
  const VALUES: Round -> Value
  const MAX_ROUND: Round

  /// The set of all nodes
  pure val NODES = CORRECT.union(FAULTY)
  /// The set of all rounds (prepared by the constants)
  pure val ROUNDS = VALUES.keys()

  /// The set of all correct values (prepared by the constants)
  //pure val VALID_VALUES = ROUNDS.filter(k => PROPOSER.get(k).in(CORRECT)).map(k => VALUES.get(k))
  pure val VALID_VALUES = Set("v0", "v1", "v2")

  action step_with(v: Node, listener: LocalContext => Set[Transition]): bool =
    choreo::step_with(v, listener, apply_custom_effect)

  action step_deterministic(v: Node, listener: LocalContext => Transition): bool =
    choreo::step_deterministic(v, listener, apply_custom_effect)

  def with_cue(process, listen_fn, params) =
    choreo::with_cue(process, listen_fn, params)

  action perform(cue_ctx, upon_fn) =
    choreo::perform(cue_ctx, upon_fn, apply_custom_effect)

  action step_with_filter(
    v: Node,
    listener: LocalContext => Set[Transition],
    f: Transition => bool
  ): bool =
    choreo::step_with_filter(v, listener, apply_custom_effect, f)

  action step_with_messages(
    v: Node,
    listener: LocalContext => Set[Transition],
    f: Set[Message] => Set[Message]
  ): bool =
    choreo::step_with_messages(v, listener, apply_custom_effect, f)

  action lose_messages = choreo::lose_messages

  val s = choreo::s
}

