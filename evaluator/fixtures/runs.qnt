module simple_test {
  var x: int

  action init = {
    x' = 0
  }

  action step = {
    x' = x + 1
  }

  // Test that returns true (passes)
  run passingTest = {
    1 + 1 == 2
  }

  // Test that returns false
  run failingTest = {
    1 + 1 == 3
  }

  // Test that uses assert and fails (fails with QNT508)
  run failingAssertTest = {
    assert(1 + 1 == 3)
  }

  // Test that uses expect and fails on action (fails with QNT508)
  run failingExpectActionTest =
    init.then({
      x' = -1
    }).expect(x >= 0)
}
