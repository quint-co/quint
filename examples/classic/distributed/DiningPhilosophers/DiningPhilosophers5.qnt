// -- -*- mode: Bluespec; -*-
// Dining Philosophers Problem Specification
// Based on: https://en.wikipedia.org/wiki/Dining_philosophers_problem
//
// This specification models the dining philosophers problem with N philosophers,
// ensuring deadlock freedom and mutual exclusion while also considering starvation
// and livelock conditions.
module DiningPhilosophersDeadlockFree5 {
    // This module initializes the DiningPhilosophers model with N = 5
    import DiningPhilosophers(N = 5).*
}

module DiningPhilosophers {

    // --- MODEL PARAMETERS ---

    // Number of philosophers (must be set externally via import)
    const N : int

   // Type aliases for clarity
    type Philosopher = int  // Represents a philosopher (identified by an integer)
    type Fork = int         // Represents a fork (also identified by an integer)
    type State = Eating | Hungry | Thinking

    // --- STATE VARIABLES ---

    // Set of forks currently being held by any philosopher
    var forks : Set[Fork]

    // Set of pairs (Philosopher, Fork) indicating which philosopher holds which fork
    var taken : Set[(Philosopher, Fork)]
    var states : Philosopher -> State

    // --- DERIVED VALUES ---

    // Set of all philosophers indexed from 0 to N-1
    val philosophers = 0.to(N - 1)

    // --- HELPER FUNCTIONS FOR FORK POSITIONS ---

    // Returns the left fork assigned to a given philosopher
    def leftFork(p : Philosopher): Fork = p

    // Returns the right fork assigned to a given philosopher (circular arrangement)
    def rightFork(p : Philosopher): Fork = (p + 1) % N

    def leftPhilosopher(p : Philosopher): Philosopher = (p - 1 + N) % N
    def rightPhilosopher(p : Philosopher): Philosopher = (p + 1) % N

     // --- CHECK IF A PHILOSOPHER CAN PICK FORKS ---
    def canPickBoth(p: Philosopher): bool =
        not(leftFork(p).in(forks)) and not(rightFork(p).in(forks))

    def canEat(p: Philosopher): bool =
        (p, leftFork(p)).in(taken) and (p, rightFork(p)).in(taken)

    // --- INITIALIZATION ---

    // Initializes the simulation with no forks held and no philosophers having taken any forks
    action init = all {
      forks' = Set(),  // Initially, no forks are held
      taken' = Set(),   // Initially, no philosopher has taken a fork
      states' = philosophers.mapBy(p => Thinking)
    }

    // --- ACTIONS FOR PHILOSOPHER BEHAVIOR ---
    action becomeHungry(p) = all {
        states.get(p) == Thinking,
        states' = states.set(p, Hungry),
        taken' = taken,
        forks' = forks
    }

    // **Philosopher picks up both forks simultaneously**
    action pickBothForks(p) = all {
        states.get(p) == Hungry,
        canPickBoth(p),
        states' = states,
        taken' = taken.union(Set((p, leftFork(p)), (p, rightFork(p)))),
        forks' = forks.union(Set(leftFork(p), rightFork(p)))
    }

    // **Philosopher eats (only if neighbors are not eating)**
    action eat(p) = all {
        states.get(p) == Hungry,
        canEat(p),
        states' = states.set(p, Eating),
        taken' = taken,
        forks' = forks
    }

    // **Philosopher releases both forks after eating**
    action releaseForks(p) = all {
        states.get(p) == Eating,
        taken' = taken.exclude(Set((p, leftFork(p)), (p, rightFork(p)))),
        forks' = forks.exclude(Set(leftFork(p), rightFork(p))),
        states' = states.set(p, Thinking)
    }

    // --- SYSTEM STEP FUNCTION ---

    // Represents the non-deterministic execution of a step in the system
    action step = {
      nondet p = oneOf(philosophers)  // Randomly select a philosopher
      any {
        becomeHungry(p),
        pickBothForks(p),
        eat(p),            // Eat when both forks are held
        releaseForks(p)
      }
    }

    // Safety properties

    // INVARIANTS: Ensures type correctness of the state variables
    val TypeOk = and {
      // Forks must be within the set of valid fork values
      forks.subseteq(philosophers.map(p => leftFork(p)).union(philosophers.map(p => rightFork(p)))),

      // Taken pairs must contain valid philosophers and valid forks
      taken.forall(pair => pair._1.in(philosophers) and pair._2.in(forks)),
    }

    val Safety = and {
      // No two adjacent philosophers can be eating at the same time
      philosophers.forall(p =>
        not(states.get(p) == Eating and states.get(rightPhilosopher(p)) == Eating)
      ),

     // MutualExclusion = Each fork must be held by at most one philosopher
      forks.forall(f =>
          size(taken.filter(pair => pair._2 == f)) <= 1
      )
    }

    // --- DEADLOCK PROPERTY ---
    val DeadlockCondition = and {
        philosophers.forall(p => states.get(p) == Hungry), // Everyone is hungry
        philosophers.forall(p => not(canPickBoth(p)))   // No one can proceed
    }

    temporal DeadlockProperty = eventually(DeadlockCondition)

    //  ensure that we can always escape deadlock.
    temporal DeadlockFreedom = always(eventually(not(DeadlockCondition)))

    // starvation freedom = occurs if a philosopher is infinitely prevented from eating. We ensure that every philosopher will eventually eat.
    temporal NoStarvation = philosophers.forall(p => always(eventually(states.get(p) == Eating)))

    //  ensures that no philosopher stays in the “HUNGRY” state forever.
    temporal LivelockFreedom = philosophers.forall(p => not(always(states.get(p) == Hungry)))
}