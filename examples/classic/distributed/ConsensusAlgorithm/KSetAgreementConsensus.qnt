// -*- mode: Bluespec; -*-

  /******************************************************************************************************
  (* Quint Specification for Algorithm 18: K-set Consensus Algorithm in the Presence of Crash Failures  *)
  (* This specification is derived from book "Distributed Computing: Fundamentals, Simulations, and     *)
  (* Advanced Topics" (Second Edition) by Hagit Attiya and Jennifer Welch, specifically from Chapter 5, *)
  (* page 120.                                                                                          *)
  (* http://lib.ysu.am/disciplines_bk/c95d04e111f3e28ae4cc589bfda1e18b.pdf                              *)
  *******************************************************************************************************/
module KSetAgreementConsensus {

  const N : int
  const F : int
  const actualFaults : int
  const K : int

  type Proc = int
  type Value = int
  type Round = int
  type Message = { sender: Proc, values: Set[Value] }

  type Decision = 
      | None 
      | Some(Value)

  type LocalState = {
      V: Set[Value],
      r: Round,
      y: Decision,
      S: Set[Set[Value]],
      x: Value
  }

  type HiddenProcs = {
    hiddenProcs: Set[Proc],    // processes whose messages are hidden
    targetProc: Proc           // process from which messages are hidden
  }

  //
  // Local functions
  // 

  def getFirst(s: Set[int]): int = s.fold(0, (_, v) => v)

  def minValue(values: Set[int]): int = { val initial = getFirst(values) values.fold(initial, (min, v) => if (v < min) v else min) }

  pure def compute(s: LocalState): LocalState = {
    
    val newV = s.V.union(flatten(s.S))
    val newK = s.r + 1
    val newY = if (newK == F/K + 1) Some(minValue(newV)) else s.y
    
    {
        V: newV,
        r: newK,
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

  def kSetAgreement = {
    // Get all decided values (excluding None) and ensure they are unique
    val decidedValues = Procs.exclude(crashed).map(p => procState.get(p).y).filter(v => v != None)
    
    // Check that number of unique decided values is at most K
    decidedValues.size() <= K
  }
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
        r: 1, 
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
        r: 1, 
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
    if (round <= F/K + 1)
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

  action crashProcessesFromConfig(hidingConfigs) = all {
    // Collect all processes that need to be crashed from all hiding configurations
    newlyCrashed' = flatten(hidingConfigs.map(config => config.hiddenProcs)),
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

  action receiveMessagesWithHiding(hidingConfigs) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)
    procState' = procState.keys().mapBy(p => {
      // Find if this process is a target in any hiding config
      val configForThisProc = hidingConfigs.filter(config => config.targetProc == p)
      
      val processedValues = 
        if (configForThisProc.size() > 0) {
          // Get all processes that should be hidden from this process
          val hiddenFromThis = flatten(configForThisProc.map(config => config.hiddenProcs))
          
          // Filter out messages from hidden processes
          val allowedCrashedMessages = crashedProcsMessages
            .filter(m => not(hiddenFromThis.contains(m.sender)))
            .map(m => m.values)
          
          newCorrectValues.union(allowedCrashedMessages)
        } else {
          // If process is not in hiding configs, it receives all messages
          newCorrectValues.union(newCrashedProcsValues)
        }
      
      { ...procState.get(p), S: processedValues }
    }),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  action step = any{
    randCrash.then(sendMessages).then(receiveMessages).then(computeAction)
  }

  action stepWithMultipleHiding(hidingConfigs) = 
    crashProcessesFromConfig(hidingConfigs)
      .then(sendMessages)
      .then(receiveMessagesWithHiding(hidingConfigs))
      .then(computeAction)

}

module properValues {
  //quint run --main=properValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(N = 8, F = 3, actualFaults = 3, K = 2).* 

  run consensusRunTest = 
    init
    .then((F/K + 1).reps(_ => step))
    .expect(kSetAgreement)
    .expect(validity)
}


module badValues {
  //quint run KSetAgreementConsensus.qnt --main badValues --invariant kSetAgreement --max-steps 5  
  //quint test --main=badValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(N = 8, F = 3, actualFaults = 4, K = 2).* 

  run consensusRunTest  = 
    init
    .then((F/K + 1).reps(_ => step))
    .expect(validity)  
  
  // Test scenario where processes decide on different values:
  // - Process 6 doesn't receive from 1,2 => decides 3
  // - Process 5 doesn't receive from 1 => decides 2
  // - Process 8 doesn't receive from 3 => decides 1
  // - Process 7 doesn't receive from 1,2,3,4 => decides 5
  run consensusDisagreementTest = 
    initializeProcsStateWithDistinctValues
    .then((F/K + 1).reps(_ => stepWithMultipleHiding(Set(
      { hiddenProcs: Set(1, 2), targetProc: 6 },
      { hiddenProcs: Set(1), targetProc: 5 },
      { hiddenProcs: Set(3), targetProc: 8 },
      { hiddenProcs: Set(1, 2, 3, 4), targetProc: 7 }
    ))))
    .expect(not(kSetAgreement))

}
