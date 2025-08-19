// This is a test file for incorrect map syntax
module test {
  // Should trigger a diagnostic suggesting: int -> str
  type UserData = Map[int, str]

  // Should also trigger a diagnostic suggesting: str -> int
  val userMap: Map[str, int] = Map()

  // Correct syntax for comparison:
  type CorrectMap = int -> str
  val correctMap: str -> int = Map()
}
