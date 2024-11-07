// -*- mode: Bluespec; -*-

  /************************************************************************************************
  (* Quint Specification for Algorithm 15: Consensus Algorithm in the Presence of Crash Failures *)
  (* This specification is derived from book "Distributed Computing: Fundamentals, Simulations,  *)
  (* and Advanced Topics" (Second Edition) by Hagit Attiya and Jennifer Welch, specifically from *)
  (* Chapter 5, page 93.                                                                         *)
  (* http://lib.ysu.am/disciplines_bk/c95d04e111f3e28ae4cc589bfda1e18b.pdf                       *)
  ************************************************************************************************/
module ConsensusAlg {

  const N : int
  const F : int
  const actualFaults : int

  type Proc = int
  type Value = int
  type Round = int
  type Message = { sender: Proc, values: Set[Value] }

  type Decision = 
      | None 
      | Some(Value)

  type LocalState = {
      V: Set[Value],
      k: Round,
      y: Decision,
      S: Set[Set[Value]],
      x: Value
  }

  //
  // Local functions
  // 

  def getFirst(s: Set[int]): int = s.fold(0, (_, v) => v)

  def minValue(values: Set[int]): int = { val initial = getFirst(values) values.fold(initial, (min, v) => if (v < min) v else min) }

  pure def compute(s: LocalState): LocalState = {
    
    val newV = s.V.union(flatten(s.S))
    val newK = s.k + 1
    val newY = if (newK == F + 1) Some(minValue(newV)) else s.y
    
    {
        V: newV,
        k: newK,
        y: newY,
        S: Set(),
        x: s.x
    }
  }

  //
  // State machine
  //

  val Procs: Set[int] = 1.to(N - 1)

  var round: Round
  var correctProcsMessages: Set[Message]
  var crashedProcsMessages: Set[Message]
  var procState: int -> LocalState
  var crashed: Set[int]
  var newlyCrashed: Set[int]

  //
  // Invariants
  //

  def agreement = Procs.exclude(crashed).forall(p => 
    Procs.exclude(crashed).forall(q => 
      ( procState.get(p).y != None and procState.get(q).y != None) implies 
        procState.get(p).y == procState.get(q).y))

  /// If all processes have the same initial value v, then this must be the only decision value
  def validity = 
    val allXValues = Procs.map(p => procState.get(p).x)
    if (allXValues.size() == 1)
      allXValues.forall(v => 
        Procs.exclude(crashed).forall(p =>
          match procState.get(p).y {
            | Some(y) => y == v
            | None => true
          }))
    else 
      true

  //
  // Steps
  //

  action init = all {
    nondet initialValues = Procs.setOfMaps(Set(1, 2, 3)).oneOf()
    procState' = Procs.mapBy(i => {
        V: Set(initialValues.get(i)),
        k: 1, 
        y: None, 
        S: Set(),
        x: initialValues.get(i)
    }),
    round' = 1,
    correctProcsMessages' = Set(),
    crashed' = Set(),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set()
  }

  action initializeProcsStateWithDistinctValues = all {
    procState' = Procs.mapBy(i => {
        V: Set(i),
        k: 1, 
        y: None, 
        S: Set(),
        x: i
    }),
    round' = 1,
    correctProcsMessages' = Set(),
    crashed' = Set(),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set()
  }

  action sendMessages = all {
    if (round <= F + 1)
      correctProcsMessages' = Procs.exclude(crashed).exclude(newlyCrashed).map(p => { 
        sender: p, 
        values: procState.get(p).V 
    })
    else
      correctProcsMessages' = correctProcsMessages,
    if(newlyCrashed.size() > 0){
      crashedProcsMessages' = newlyCrashed.map(p => { 
            sender: p, 
            values: procState.get(p).V 
      })
    } else{
      crashedProcsMessages' = crashedProcsMessages
    },
    round' = round,
    procState' = procState,
    crashed' = crashed,
    newlyCrashed' = newlyCrashed
  } 

  action crashProcess(p) = all {
    newlyCrashed' = Set(p),
    crashed' = crashed,
    round' = round,
    procState' = procState,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages
  }
  
  action randCrash = all {
    if (actualFaults - crashed.size() > 0) {
      nondet newCrashCount = oneOf(1.to(actualFaults - crashed.size()))
      newlyCrashed' = Procs.exclude(crashed).powerset().filter(s => s.size() == newCrashCount).oneOf()
    } else {
      newlyCrashed' = newlyCrashed
    },
    crashed' = crashed,
    round' = round,
    procState' = procState,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages
  }

  action receiveMessages = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    if (crashedProcsMessages.size() == 0){
      procState' = procState.keys().mapBy(p => {... procState.get(p), S:newCorrectValues})
    }
    else{
      val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)
      nondet crashedMessagesRecived = Procs.setOfMaps(newCrashedProcsValues).union(Set()).oneOf()// for each process we pick from which newly crashed they receive a message
      procState' = procState.keys().mapBy(p => { ... procState.get(p), S: newCorrectValues.union(Set(crashedMessagesRecived.get(p))) })
    },
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }    

  action computeAction = all {
      correctProcsMessages' = Set(),
      procState' = procState.keys().mapBy(p => compute(procState.get(p))),
      round' = round + 1,
      crashed' = crashed.union(newlyCrashed),
      newlyCrashed' = Set(),
      crashedProcsMessages' =Set()
  }

  /// the set s of correct processes don't receive the messages from newlycrashed
  action receiveMessage(s) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)
    procState' = procState.keys().mapBy(p => 
        { ...procState.get(p), 
          S: if (s.contains(p)) 
              newCorrectValues 
             else 
              newCorrectValues.union(newCrashedProcsValues) 
        }
    ),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  action step = any{
    randCrash.then(sendMessages).then(receiveMessages).then(computeAction)
  }

  /// we crash process p, and the set s does not receive p's messages
  action stepHidePsMessagesFromS(p,s) = any{
    crashProcess(p).then(sendMessages).then(receiveMessage(s)).then(computeAction)
  }

}

module properValues {
  //quint run --main=properValues ConsensusAlg.qnt
  import ConsensusAlg(N = 6, F = 1, actualFaults = 1 ).* 

  run consensusRunTest = 
    init
    .then((F + 1).reps(_ => step))
    .expect(agreement)
    .expect(validity)
}


module badValues {
  //quint run ConsensusAlg.qnt --main badValues --invariant agreement --max-steps 5  
  //quint test --main=badValues ConsensusAlg.qnt
  import ConsensusAlg(N = 6, F = 1, actualFaults = 2 ).* 

  run consensusRunTest  = 
    init
    .then((F + 1).reps(_ => step))
    .expect(validity)  
  
  run consensusDisagreementTest = 
    initializeProcsStateWithDistinctValues
    .then(stepHidePsMessagesFromS(1, Set(2)))
    .then(stepHidePsMessagesFromS(3, Set(4)))
    .expect(not(agreement))

}
