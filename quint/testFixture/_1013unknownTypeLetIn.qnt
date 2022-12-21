module unknownTypeLetIn {
  def d = {
    val x: UNKNOWN_TYPE = 10
    {
      x + 1
    }
  }
}
