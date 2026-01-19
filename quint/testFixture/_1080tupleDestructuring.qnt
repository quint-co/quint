// -*- mode: Bluespec; -*-
/**
 * Test fixture for tuple destructuring patterns in val declarations.
 *
 * Test cases cover:
 * - Basic tuple destructuring
 * - Holes in patterns
 * - Nested expressions
 * - Using destructured values in computations
 * - Destructuring in let-in expressions (function bodies)
 */
module tupleDestructuring {
  // Basic tuple destructuring
  val (x, y, z) = (1, 2, 3)

  // Using destructured values
  val sum = x + y + z

  // Destructuring with holes
  val (a, _, b) = (10, 20, 30)

  // Destructuring from expressions
  val (p, q) = (1 + 2, 3 * 4)

  // Destructuring nested tuples
  val nested = ((1, 2), (3, 4))
  val (first, second) = nested

  // Destructuring with pure val
  pure val (m, n) = (5, 10)
  pure val product = m * n

  // Type annotations work with destructured values
  val t: (int, int, int) = (7, 8, 9)
  val (i, j, k) = t

  // Larger tuples
  val (a1, _, a3, a4, _) = (1, 2, 3, 4, 5)

  // Using destructured values in more complex expressions
  val coords = (100, 200)
  val (x_coord, y_coord) = coords
  val distance = x_coord + y_coord

  // Destructuring in let-in expressions
  def addPair(pair) = {
    val (left, right) = pair
    left + right
  }

  pure def multiply(tuple) = {
    pure val (a, b, c) = tuple
    a * b * c
  }

  // Multiple destructuring in same function body
  def combine(t1, t2) = {
    val (x1, y1) = t1
    val (x2, y2) = t2
    (x1 + x2, y1 + y2)
  }

  // Destructuring with function parameters still visible
  pure def scale(factor, pair) = {
    pure val (x, y) = pair
    (x * factor, y * factor)
  }

  // Destructuring with holes in let-in
  def getMiddle(triple) = {
    val (_, mid, _) = triple
    mid * 2
  }
}
