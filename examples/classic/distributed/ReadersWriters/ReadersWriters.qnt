// -*- mode: Bluespec; -*-
module ReadersWriters {
  /***************************************************************************)
  (* This solution to the readers-writers problem, cf.                       *)
  (* https://en.wikipedia.org/wiki/Readers–writers_problem,                  *)
  (* uses a queue in order to fairly serve all requests.                     *)
  (***************************************************************************/
  const NumActors: int
  
  var readers: Set[int]   // set of processes currently reading
  var writers: Set[int]   // set of processes currently writing
  var waiting: List[(str, int)]  // queue of processes waiting to access the resource
  
  val vars = (readers, writers, waiting)
  
  val Actors = 1.to(NumActors)
  
  def ToSet(s) = s.indices().map(i => s[i])
  
  def read(s)  = s._1 == "read"
  def write(s) = s._1 == "write"
  
  val WaitingToRead  = ToSet(waiting.select(read)).map( ((_, actor)) => actor )

  val WaitingToWrite = ToSet(waiting.select(write)).map( ((_, actor)) => actor )
  
  //---------------------------------------------------------------------------
  
  /***********)
  (* Actions *)
  (***********/
  
  action TryRead(actor) = all {
      not(actor.in(WaitingToRead)),
      waiting' = waiting.append(("read", actor)),
  }
  
  action TryWrite(actor) = all {
      not(actor.in(WaitingToWrite)),
      waiting' = waiting.append(("write", actor)),
  }
  
  action Read(actor) = all {
      readers' = readers.union(Set(actor)),
      waiting' = waiting.tail(),
  }
  
  action Write(actor) = all {
      readers == Set(),
      writers' = writers.union(Set(actor)),
      waiting' = waiting.tail(),
  }
  
  action ReadOrWrite = all {
      waiting != [],
      writers == Set(),
      val pair = waiting.head()
      val (_, actor) = pair
      if (read(pair)) all {
          Read(actor),
          writers' = writers,
      } else all { // pair._1 == "write"
          Write(actor),
          readers' = readers,
      }  
  }
  
  action StopActivity(actor) =
      if (actor.in(readers)) all {
          readers' = readers.exclude(Set(actor)),
          writers' = writers,
      } else all {
          writers' = writers.exclude(Set(actor)),
          readers' = readers,
      }

  action Stop = {
      nondet actor = readers.union(writers).oneOf()
      StopActivity(actor)
  }
  
  //---------------------------------------------------------------------------
  
  /*****************)
  (* Specification *)
  (*****************/
  
  action Init = all {
      readers == Set(),
      writers == Set(),
      waiting == []
  }
  
  action Next = any {
      all {
          nondet actor = oneOf(Actors)
          TryRead(actor),
          readers' = readers,
          writers' = writers
      },
      all {
          nondet actor = oneOf(Actors)
          TryWrite(actor),
          readers' = readers,
          writers' = writers
      },
      ReadOrWrite,
      all {
          Stop,
          waiting' = waiting
      },
  }
  
  temporal Fairness = and {
      Actors.forall(actor => TryRead(actor).weakFair(vars)),
      Actors.forall(actor => TryWrite(actor).weakFair(vars)),
      ReadOrWrite.weakFair(vars),
      Stop.weakFair(vars)
  }
  
  temporal Spec = Init and always(Next.orKeep(vars) and Fairness)
  
  //---------------------------------------------------------------------------
  
  /**************)
  (* Invariants *)
  (**************/
  
  val TypeOK = and {
      readers.subseteq(Actors),
      writers.subseteq(Actors),
      waiting.in(allLists(tuples(Set("read", "write"), Actors)))
  }
  
  val Safety = and {
      not(readers != Set() and writers != Set()),
      size(writers) <= 1
  }
  
  /**************)
  (* Properties *)
  (**************/
  
  temporal Liveness = and {
      Actors.forall(actor => always(eventually(actor.in(readers)))),
      Actors.forall(actor => always(eventually(actor.in(writers)))),
      Actors.forall(actor => always(eventually(not(actor.in(readers))))),
      Actors.forall(actor => always(eventually(not(actor.in(writers))))),
  }
}

module ReadersWriters_5 {
  import ReadersWriters(NumActors = 5).*
}
