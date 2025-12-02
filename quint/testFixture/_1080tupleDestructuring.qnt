// -*- mode: Bluespec; -*-
/**
 * Test fixture for tuple destructuring patterns in val declarations.
 *
 * Test cases cover:
 * - Basic tuple destructuring
 * - Holes in patterns
 * - Nested expressions
 * - Using destructured values in computations
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
}
