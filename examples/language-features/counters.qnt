// a simple demonstration of actions and runs
module counters {
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

  // the run, where n goes via 1, 2, 3, 6, 3
  run run1 = {
    (n' = 1)
      .then(n' = 2)
      .then(n' = 3)
      .then(n' = 6)
      .then(n' = 3)
  }

  // the run that initialized with init and
  // executes OnPositive twice, OnDivByThree, and OnEven
  run run2 = {
    init
      .then(OnPositive)
      .then(OnPositive)
      .then(OnDivByThree)
      .then(OnEven)
  }

  // execute init and then step four times
  run run3 = {
    init.then(4.reps(_ => step))
  }

  // execute init and then step ten times, while asserting n < 5
  run run4 = {
    init.then(10.reps(_ => all {
      assert(n < 5),
      step,
    }))
  }

  // this test should not fail
  run passing1Test = {
    init.then(10.reps(_ => all {
        assert(n > 0),
        step,
    }))
  }

  run passing2Test = {
    init.then(5.reps(_ => all {
        assert(n > 0),
        step,
    }))
  }

  run passing3Test = {
    init.then(15.reps(_ => all {
        assert(n > 0),
        step,
    }))
  }

  // this tests for a failing condition
  run failingTest = {
    init
      .then(all {
         n == 0,
         step,
       })
      .fail()
  }

  // this is just a value, and it should be ignored as a test
  val ignoredTest = 1
}
