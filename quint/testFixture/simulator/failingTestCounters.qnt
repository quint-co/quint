// a simple demonstration
// of actions and runs
module failingTestCounters {
  var n: int

  // initialize the state machine
  action init = {
    n' = 1
  }

  // divide n by 2, when n is even
  action OnEven = all {
    n % 2 == 0,
    n' = n / 2,
  }

  // double n, when n is divisible by 3
  action OnDivByThree = all {
    n % 3 == 0,
    n' = 2 * n
  }

  // increment n, when n is positive
  action OnPositive = all {
    n > 0,
    n' = n + 1
  }

  // The state machine is composed of three actions:
  //  - divide n by 2, when n is even
  //  - double n, when n is divisible by 3
  //  - increment n, when n is positive
  //
  // Note that the three actions are not mutually exclusive.
  action step = any {
    OnEven,
    OnDivByThree,
    OnPositive
  }

  // this test should fail
  run failingTest = {
    init
      .then(10.reps(_ => all {
         assert(n == 0),
         step,
       }))
  }
}
