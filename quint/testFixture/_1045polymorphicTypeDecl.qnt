module m {
  type MonoPair[a] = (a, a)
  type MapApp[a, b] = (a -> b, a)
  type Result[ok, err] =
    | Ok(ok)
    | Err(err)
  val test: Result[(), str] = Err("my error")
}
