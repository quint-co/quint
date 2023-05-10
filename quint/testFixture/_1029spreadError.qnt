module _1029spreadError {
  val rec = { a: 1, b: true }
  // the following line should produce an error
  val errorRec = { ...rec, ...rec }
}
