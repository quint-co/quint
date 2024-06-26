module fun {
  pure def dec(i) = i - 1
  pure def inc(i) = i + 1
}

module general {
  import fun.*

  // to be defined later
  const N: int
  var x: int

  action init = { x' = N }
  action step = { x' = dec(x) }
}
module fixed {
  module I3 = general(N = 3)
  module I5 = general(N = 5)

  action init3 = I3::init
  action init5 = I5::init

  import I3.*
}
