// -*- mode: Bluespec; -*-
/**
 * This is a spec for what we call the Folklore Reliable Broadcast Algorithm (FRBC), and it works as follows:
 * You want to make sure that, in the presence of potential process crashes, all correct processes should see the same set of messages.
 * The challenge happens when a process, while trying to send a message to all, crashes.
 * In this case it might be that it has sent the message only to some of the processes.
 * So instead of storing any message I receive, we use a protocol that first makes sure that I forward the message to everyone, before I store it/deliver it.
 *
 * To broadcast(m):
 * Send m to all
 * Deliver m
 *
 * On receiving m:
 * Send m to all
 * Deliver m
 *
 * Run in verifier with:
 *   quint verify reliablebc.qnt --inductive-invariant IndInv --invariant invariant
 *
 * Josef Widder, Informal Systems, 2025
 */
module reliablebc {
  type Option[v] =
    | None
    | Some(v)

  type Payload = str

  type ProcessID = int

  type NetworkMsg = {
    sender: int,
    receiver: int,
    payload: Payload,
  }

  pure val initial_sender = 0
  pure val Proc = Set(1, 2)
  pure val Domain = Set("hello", "goodbye")

  pure val msg_universe = tuples(Proc.union(Set(initial_sender)), Proc, Domain).map(i =>
    { sender: i._1, receiver: i._2, payload: i._3 }).powerset()

  type ProtocolState =
    | Init
    | SendToAll(Payload)
    | Delivered(Payload)

  type LocalState = {
    s: ProtocolState,
    send_to: int,
  }

  pure val state_space = {
    pure val pstates =
      Set(Init)
        .union(Domain.map(i => SendToAll(i)))
        .union(Domain.map(i => Delivered(i)))

    tuples(pstates, Proc.union(Set(initial_sender))).map(i => { s: i._1, send_to: i._2 })
  }

  pure val initial_state = {
    s: Init,
    send_to: 0
  }

  pure def send_in_progress(l) =
    match l.s {
      | SendToAll(_) => l.send_to > 0
      | _ => false
    }

  /// protocol logic
  pure def frbc(s: ProtocolState, m: Option[Payload]): ProtocolState =
      match s {
        | Init =>
          match m {
            | Some(c) => SendToAll(c)
            | None => s
          }
        | SendToAll(c) => Delivered(c)
        | _ => s
      }

  /// networking
  pure def send_to_next(l: LocalState): { post: LocalState, recv: ProcessID, payload: Payload } =
    match l.s {
      | SendToAll(m) => {
        post: { ...l, send_to: (l.send_to + 1) % (Proc.size() + 1) },
        recv: l.send_to,
        payload: m
      }
      | _ => { post: l, recv: -1, payload: "" } // impossible due to `send_in_progress` check
    }

  var system: int -> LocalState
  var network: Set[NetworkMsg]

  action init =
    nondet initial_receivers = Proc.powerset().oneOf()
    nondet x = Domain.oneOf()
    all {
      network' = initial_receivers.map(i => { sender: initial_sender, receiver: i, payload: x }),
      system' = Proc.mapBy(_ => initial_state)
    }

  action step =
    nondet p = Proc.oneOf()
    if (system.get(p).send_in_progress())
      val res = send_to_next(system.get(p))
      all {
        network' = network.union(Set({ sender: p, receiver: res.recv, payload: res.payload })),
        system' = system.set(p, res.post),
      }
    else
      nondet m = network.filter(m => m.receiver == p).oneOf()
      nondet input = Set(None, Some(m.payload)).oneOf()
      val res = frbc(system.get(p).s, input)
      val start_send = system.get(p).s == Init and res != Init
      all {
        network' = network,
        system' = system.set(p, {
          s: res,
          send_to: if (start_send) 1 else 0
        }),
      }

  //
  // Defining correctness
  //

  def values_broadcast = network.filter(m => m.sender == initial_sender).map(m => m.payload)

  /// I only deliver messages that have been sent. This also means that if
  /// values_broadcast == Set() then no-one will ever deliver anything
  def safety =
    Proc.forall(p =>
      Domain.forall(v =>
        system.get(p).s == Delivered(v) implies v.in(values_broadcast)))

  /// If I deliver a message, I have already forwarded it to all. This plus
  /// a potential assumption on reliable message system implies that if one process
  /// delivers then all correct processes will eventually deliver
  def reliability =
    Proc.forall(p =>
      Domain.forall(v =>
        system.get(p).s == Delivered(v) implies
          network.filter(m => m.sender == p).size() == Proc.size()))

  def invariant = safety and reliability

  //
  // Inductive invariant
  //

  def TypeOK = and {
    network.in(msg_universe),
    system.in(Proc.setOfMaps(state_space))
  }

  /// If a message is sent, then the sender is in SendToAll or Delivered state
  def sender_in_good_state =
    Proc.forall(p =>
      network.forall(m => m.sender == p implies
        (system.get(p).s == SendToAll(m.payload) or system.get(p).s == Delivered(m.payload))))

  /// This links the number of messages sent to the local state of the sender.
  def number_of_sent_messages_matches =
    Proc.forall(p =>
      Domain.forall(v =>
          system.get(p).s == SendToAll(v) implies
            if (system.get(p).send_to == 0)
              network.filter(m => m.sender == p).size() == Proc.size()
            else
              system.get(p).send_to - 1 ==  network.filter(m => m.sender == p).size() ))

  /// If a process is in SendToAll(v) state, then the value v was initially sent
  def no_made_up_values =
    Proc.forall(p =>
      Domain.forall(v =>
        system.get(p).s == SendToAll(v) implies v.in(values_broadcast)))

  /// If a message to process 2 is sent then the same message also to process 1 is there.
  def messages_sent_in_order =
    network.forall(m => (m.receiver > 1 and m.sender != initial_sender)
      implies {sender: m.sender, receiver: m.receiver -1, payload: m.payload}.in(network))

  def IndInv = and {
    TypeOK,
    sender_in_good_state,
    number_of_sent_messages_matches,
    no_made_up_values,
    messages_sent_in_order,
    safety,
    reliability,
  }
}
