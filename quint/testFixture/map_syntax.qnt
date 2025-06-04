module test {
  // This is a test file for incorrect map syntax
  type UserData = Map[Int, String] 
  // Above line should trigger a diagnostic suggesting: Int -> String
  
  val userMap: Map[String, Int] = {} 
  // This should also trigger a diagnostic suggesting: String -> Int
  
  // Correct syntax for comparison:
  type CorrectMap = Int -> String
  val correctMap: String -> Int = {}
} 