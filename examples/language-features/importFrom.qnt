/**
 * This example demonstrates how to import modules from other files.
 */
module importFrom {
  import Math.* from "./imports"

  run importTest = {
    assert(pow(5, 2) == sqr(5))
  }

  action init = true
  action step = true
}
