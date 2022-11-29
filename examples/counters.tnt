// a simple demonstration of actions and runs
module counters {
  var n: int

  // initialize the state machine
  action Init = {
    n <- 1
  }

  // divide n by 2, when n is even
  action OnEven = all {
    n % 2 == 0,
    n <- n / 2,
  }

  // double n, when n is divisible by 3
  action OnDivByThree = all {
    n % 3 == 0,
    n <- 2 * n
  }

  // increment n, when n is positive
  action OnPositive = all {
    n > 0,
    n <- n + 1
  }

  // The state machine is composed of three actions:
  //  - divide n by 2, when n is even
  //  - double n, when n is divisible by 3
  //  - increment n, when n is positive
  action Next = any {
    OnEven,
    OnDivByThree,
    OnPositive
  }

  // the run, where n goes via 1, 2, 3, 6, 3
  run run1 = {
    (n <- 1)
      .then(n <- 2)
      .then(n <- 3)
      .then(n <- 6)
      .then(n <- 3)
  }

  // the run that initialized with Init and
  // executes OnPositive twice, OnDivByThree, and OnEven
  run run2 = {
    Init
      .then(OnPositive)
      .then(OnPositive)
      .then(OnDivByThree)
      .then(OnEven)
  }

  // execute Init and then Next four times
  run run3 = {
    Init.then(Next.repeated(4))
  }

  // execute Init and then Next ten times, while asserting n < 5
  run run4 = {
    Init.then((all {
      assert(n < 5),
      Next,
    }).repeated(10))
  }
}
