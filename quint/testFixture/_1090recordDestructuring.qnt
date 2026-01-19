// -*- mode: Bluespec; -*-
/**
 * Test fixture for record destructuring patterns in val declarations.
 *
 * Test cases cover:
 * - Basic record destructuring
 * - Partial field extraction
 * - Using destructured values in computations
 * - Different record types
 * - Destructuring in let-in expressions (function bodies)
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

  // Destructuring in let-in expressions
  def getName(person) = {
    val { name, age } = person
    name
  }

  pure def computeArea(rect) = {
    pure val { width, height } = rect
    width * height
  }

  // Multiple destructuring in same function body
  def sumAreas(rect1, rect2) = {
    val area1 = {
      val { width, height } = rect1
      width * height
    }
    val area2 = {
      val { width, height } = rect2
      width * height
    }
    area1 + area2
  }

  // Destructuring with function parameters still visible
  pure def scalePoint(factor, point) = {
    pure val { x, y } = point
    { x: x * factor, y: y * factor }
  }

  // Partial field extraction in let-in
  def getHost(config) = {
    val { host } = config
    host
  }
}
