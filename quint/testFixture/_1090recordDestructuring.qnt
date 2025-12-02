// -*- mode: Bluespec; -*-
/**
 * Test fixture for record destructuring patterns in val declarations.
 *
 * Test cases cover:
 * - Basic record destructuring
 * - Partial field extraction
 * - Using destructured values in computations
 * - Different record types
 */
module recordDestructuring {
  // Basic record destructuring
  val { name, age } = { name: "Alice", age: 30 }

  // Using destructured values
  val greeting = name

  // Partial field extraction (not all fields need to be extracted)
  val person = { firstName: "Bob", lastName: "Smith", age: 25, city: "NYC" }
  val { firstName, city } = person

  // Destructuring from expressions
  val { a, b } = { a: 1 + 2, b: 3 * 4 }

  // Destructuring nested records
  val point = { coordinates: { x: 10, y: 20 }, label: "P1" }
  val { coordinates, label } = point

  // Destructuring with pure val
  pure val { width, height } = { width: 100, height: 200 }
  pure val area = width * height

  // Type annotations work with destructured values
  type Point = { x: int, y: int }
  val p: Point = { x: 5, y: 10 }
  val { x, y } = p

  // Multiple field extraction
  val config = { host: "localhost", port: 8080, timeout: 30, retries: 3 }
  val { host, port } = config

  // Single field extraction
  val record1 = { value: 42 }
  val { value } = record1
}
