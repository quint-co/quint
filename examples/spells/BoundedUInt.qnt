module BoundedUInt {
  /// The size of this integer type in bits.
  const BITS: int

  /// The smallest value that can be represented by this integer type.
  pure val MIN = 0

  /// The largest value that can be represented by this integer type.
  pure val MAX = (2^BITS) - 1
  
  /// Representation of an unsigned, bounded integer.
  ///
  /// - `Ok(v)` represents the integer `v`, such that `MIN <= v <= MAX`.
  /// - `Err(msg)` holds a message explaining the out of bounds error.
  ///
  /// NOTE: values of this type must only be constructed using `UInt`,
  /// and never via `Ok` or `Err` directly.
  // TODO: Replace with polymorphic result type, once that is available
  //       See https://github.com/informalsystems/quint/issues/1073
  type UIntT = Ok(int) | Err(str)

  /// Given an integer `x`, returns true iff `x` lies in the `[MIN, MAX]` interval.
  pure def isInRange(x: int): bool = MIN <= x and x <= MAX

  /// `UInt(x)` is a bounded unsigned integer if `x` is inside the `[MIN, MAX]` interval,
  /// otherwise it is an `"out of range"` error.
  pure def UInt(x: int): UIntT = if (isInRange(x)) Ok(x) else Err("out of range")

  /// `u.bind(x => f(x))` is `f(x)` iff `u` is `Ok(x)`, i.e., if `u` is a valid bounded int wrapping `x`,
  /// otherwise, when `u` is `Err(msg)`, it is `u`.
  ///
  /// ## Example
  ///
  /// ```
  /// def checkedIncr(u: UintT): UintT = checkedAdd(u, UIntT(1))
  /// run incr_UintT_twice_test = assert(UInt(0).bind(checkedIncr).bind(checkedIncr) = UInt(2))
  /// ```
  def bind(u: UIntT, f: (int => UIntT)): UIntT = match u {
    | Ok(i) => f(i)
    | Err(_) => u
  }

  /// `f.app(u, v, msg)` is `UInt(f(x,y))` if `u` is `Ok(x)` and `v` is `Ok(y)`.
  /// If `UInt(f(x,y))` is out of range, it is `Err(msg)`.
  pure def app(op: (int, int) => int, lhs: UIntT, rhs:UIntT, errMsg: str): UIntT =
    lhs.bind(x => rhs.bind(y =>
      val res = op(x, y)
      if (isInRange(res)) Ok(res) else Err(errMsg)))

  /// Computes the absolute difference between lhs and rhs.
  pure def absDiff(lhs: UIntT, rhs: UIntT): UIntT = {
    ((x, y) => {
      val res = x - y
      if (res < 0) -res else res
    }).app(lhs, rhs,
      "impossible")
  }

    ////////////////////////
   // CHECKED OPERATIONS //
  ////////////////////////

  // TODO: In the following we have to eta-expand calls to `ifoo` builtins
  // due to https://github.com/informalsystems/quint/issues/1332
  // We should simplify those once this issue with the simulator is fixed.

  /// Checked integer addition.
  /// Errors with "overflow"
  pure def checkedAdd(lhs: UIntT, rhs: UIntT): UIntT = ((x,y) => iadd(x,y)).app(lhs, rhs, "overflow")

  /// Checked integer subtraction.
  /// Errors with "underflow".
  pure def checkedSub(lhs: UIntT, rhs: UIntT): UIntT = ((x,y) => isub(x,y)).app(lhs, rhs, "underflow")

  /// Checked integer multiplication.
  /// Errors with "overflow".
  pure def checkedMul(lhs: UIntT, rhs: UIntT): UIntT = ((x,y) => imul(x,y)).app(lhs, rhs, "overflow")

  /// Checked integer division.
  /// Errors with "division by zero".
  pure def checkedDiv(lhs: UIntT, rhs: UIntT): UIntT =
    lhs.bind(
      l => rhs.bind(
      r =>
        if (r == 0)
          Err("division by zero")
        else
          Ok(l / r)))

  /// Checked integer modulo.
  /// Errors with "division by zero".
  pure def checkedRem(lhs: UIntT, rhs: UIntT): UIntT =
    lhs.bind(
      l => rhs.bind(
      r =>
        if (r == 0)
          Err("division by zero")
        else
          Ok(l % r)))

  /// Checked exponentiation.
  /// Errors with "overflow".
  pure def checkedPow(lhs: UIntT, rhs: UIntT): UIntT =
    lhs.bind(
      l => rhs.bind(
      r =>
        if (l == r and l == 0)
          Err("undefined")
        else
          ((x,y) => ipow(x,y)).app(lhs, rhs, "overflow")))


    ///////////////////////////
   // SATURATING OPERATIONS //
  ///////////////////////////

  /// Saturating integer addition.
  /// Computes `lhs + rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingAdd(lhs: UIntT, rhs: UIntT): UIntT =
    ((x, y) =>
      val res = x + y
      if (res < MAX) res else MAX)
    .app(lhs, rhs, "impossible")

  /// Saturating integer subtraction.
  /// Computes `lhs - rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingSub(lhs: UIntT, rhs: UIntT): UIntT =
    ((x, y) =>
      val res = x - y
      if (res > MIN) res else MIN)
    .app(lhs, rhs, "impossible")

  /// Saturating integer subtraction.
  /// Computes `lhs * rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingMul(lhs: UIntT, rhs: UIntT): UIntT =
    ((x, y) =>
      val res = x * y
      if (res < MAX) res else MAX)
    .app(lhs, rhs, "impossible")

  /// Saturating exponentiation.
  /// Computes `lhs ^ rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingPow(lhs: UIntT, rhs: UIntT): UIntT =
    lhs.bind(
      l => rhs.bind(
      r =>
      if (l == r and l == 0)
        Err("undefined")
      else
        val res = l ^ r
        Ok(if (res < MAX) res else MAX)))

    /////////////////////////
   // WRAPPING OPERATIONS //
  /////////////////////////

  /// Wrapping integer addition.
  /// Computes `lhs + rhs`, wrapping around at the boundary of the type.
  pure def wrappingAdd(lhs: UIntT, rhs: UIntT): UIntT =
    ((x, y) => (x + y) % (MAX + 1)).app(lhs, rhs, "impossible")

  pure def wrappingSubInt(x: int, y: int): int = {
    val res = x - y
    val adjusted = if (res < MIN) (res + (MAX + 1)) else res
    adjusted % (MAX + 1)
  }

  /// Wrapping integer subtraction.
  /// Computes `lhs - rhs`, wrapping around at the boundary of the type.
  pure def wrappingSub(lhs: UIntT, rhs: UIntT): UIntT = wrappingSubInt.app(lhs, rhs, "impossible")

  /// Wrapping integer multiplication.
  /// Computes `lhs * rhs`, wrapping around at the boundary of the type.
  pure def wrappingMul(lhs: UIntT, rhs: UIntT): UIntT =
    ((x, y) => (x * y) % (MAX + 1)).app(lhs, rhs, "impossible")

  /// Wrapping integer division.
  /// Computes `lhs / rhs`. Wrapped division on unsigned types is just normal division. 
  /// There’s no way wrapping could ever happen. 
  /// This operator exists, so that all operations are accounted for in the wrapping operations.
  pure def wrappingDiv(lhs: UIntT, rhs: UIntT): UIntT = checkedDiv(lhs, rhs)

  /// Wrapping integer remainder.
  /// Computes `lhs % rhs`. Wrapped remainder on unsigned types is just normal remainder. 
  /// There’s no way wrapping could ever happen. 
  /// This operator exists, so that all operations are accounted for in the wrapping operations.
  pure def wrappingRem(lhs: UIntT, rhs: UIntT): UIntT = checkedRem(lhs, rhs)

  /// Wrapping exponentiation.
  /// Computes `lhs ^ rhs`, wrapping around at the boundary of the type.
  pure def wrappingPow(lhs: UIntT, rhs: UIntT): UIntT =
    lhs.bind(
      l => rhs.bind(
      r =>
      if (l == r and l == 0)
        Err("undefined")
      else
        Ok((l ^ r) % (MAX + 1))))
}

module BoundedUInt_Test {
  import BoundedUInt.*

  // Sanity check, tests become degenerate when BITS = 1 (even moreso if <= 0)
  pure val BitsTest = assert(BITS > 1)

  /////////////
  // CHECKED //
  /////////////

  // Checked add
  pure val CAddInvsTest = and {
    assert(checkedAdd(UInt(0), UInt(0)) == Ok(0)),
    assert(checkedAdd(UInt(1), UInt(0)) == Ok(1)),
    assert(checkedAdd(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(checkedAdd(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(checkedAdd(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(checkedAdd(UInt(0), UInt(MAX)) == Ok(MAX)),
    assert(checkedAdd(UInt(1), UInt(MAX)) == Err("overflow")),
    assert(checkedAdd(UInt(MAX - 1), UInt(MAX)) == Err("overflow")),
    assert(checkedAdd(UInt(MAX), UInt(MAX)) == Err("overflow")),
    assert(checkedAdd(UInt(MAX), UInt(MAX + 1)) == Err("out of range")),
  }

  // Checked sub
  pure val CSubInvsTest = and {
    assert(checkedSub(UInt(0), UInt(0)) == Ok(0)),
    assert(checkedSub(UInt(1), UInt(0)) == Ok(1)),
    assert(checkedSub(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(checkedSub(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(checkedSub(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(checkedSub(UInt(0), UInt(MAX)) == Err("underflow")),
    assert(checkedSub(UInt(1), UInt(MAX)) ==  Err("underflow")),
    assert(checkedSub(UInt(MAX - 1), UInt(MAX)) ==  Err("underflow")),
    assert(checkedSub(UInt(MAX), UInt(MAX)) == Ok(0)),
    assert(checkedSub(UInt(MAX + 1), UInt(MAX)) == Err("out of range")),
  }

  // Checked mul
  pure val CMulInvsTest = and {
    assert(checkedMul(UInt(0), UInt(1)) == Ok(0)),
    assert(checkedMul(UInt(1), UInt(1)) == Ok(1)),
    assert(checkedMul(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(checkedMul(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(checkedMul(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(checkedMul(UInt(0), UInt(MAX)) == Ok(0)),
    assert(checkedMul(UInt(1), UInt(MAX)) == Ok(MAX)),
    assert(checkedMul(UInt(MAX - 1), UInt(MAX)) == Err("overflow")),
    assert(checkedMul(UInt(MAX), UInt(MAX)) == Err("overflow")),
    assert(checkedMul(UInt(MAX + 1), UInt(MAX)) == Err("out of range")),
  }

  // Checked div
  pure val CDivInvsTest = and {
    assert(checkedDiv(UInt(0), UInt(0)) == Err("division by zero")),
    assert(checkedDiv(UInt(1), UInt(0)) == Err("division by zero")),
    assert(checkedDiv(UInt(MAX - 1), UInt(0)) == Err("division by zero")),
    assert(checkedDiv(UInt(MAX), UInt(0)) == Err("division by zero")),
    assert(checkedDiv(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(checkedDiv(UInt(0), UInt(1)) == Ok(0)),
    assert(checkedDiv(UInt(1), UInt(1)) == Ok(1)),
    assert(checkedDiv(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(checkedDiv(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(checkedDiv(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(checkedDiv(UInt(0), UInt(MAX)) == Ok(0)),
    assert(checkedDiv(UInt(1), UInt(MAX)) == Ok(0)),
    assert(checkedDiv(UInt(MAX - 1), UInt(MAX)) == Ok(0)),
    assert(checkedDiv(UInt(MAX), UInt(MAX)) == Ok(1)),
    assert(checkedDiv(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Checked rem
  pure val CRemInvsTest = and {
    assert(checkedRem(UInt(0), UInt(0)) == Err("division by zero")),
    assert(checkedRem(UInt(1), UInt(0)) == Err("division by zero")),
    assert(checkedRem(UInt(MAX - 1), UInt(0)) == Err("division by zero")),
    assert(checkedRem(UInt(MAX), UInt(0)) == Err("division by zero")),
    assert(checkedRem(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(checkedRem(UInt(0), UInt(1)) == Ok(0)),
    assert(checkedRem(UInt(1), UInt(1)) == Ok(0)),
    assert(checkedRem(UInt(MAX - 1), UInt(1)) == Ok(0)),
    assert(checkedRem(UInt(MAX), UInt(1)) == Ok(0)),
    assert(checkedRem(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(checkedRem(UInt(0), UInt(MAX)) == Ok(0)),
    assert(checkedRem(UInt(1), UInt(MAX)) == Ok(1)),
    assert(checkedRem(UInt(MAX - 1), UInt(MAX)) == Ok(MAX - 1)),
    assert(checkedRem(UInt(MAX), UInt(MAX)) == Ok(0)),
    assert(checkedRem(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Checked Pow
  pure val CPowInvsTest = and {
    assert(checkedPow(UInt(0), UInt(0)) == Err("undefined")),
    assert(checkedPow(UInt(0), UInt(1)) == Ok(0)),
    assert(checkedPow(UInt(1), UInt(0)) == Ok(1)),
    assert(checkedPow(UInt(1), UInt(1)) == Ok(1)),
    assert(checkedPow(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(checkedPow(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(checkedPow(UInt(MAX), UInt(0)) == Ok(1)),
    assert(checkedPow(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(checkedPow(UInt(0), UInt(MAX)) == Ok(0)),
    assert(checkedPow(UInt(1), UInt(MAX)) == Ok(1)),
    assert(checkedPow(UInt(2), UInt(BITS - 1)) == Ok(2^(BITS - 1))),
    assert(checkedPow(UInt(2), UInt(BITS)) == Err("overflow")),
    assert(checkedPow(UInt(2), UInt(BITS + 1)) == Err("overflow")),
  }

  ////////////////
  // SATURATING //
  ////////////////

  // Saturating add
  pure val SAddInvsTest = and {
    assert(saturatingAdd(UInt(0), UInt(0)) == Ok(0)),
    assert(saturatingAdd(UInt(1), UInt(0)) == Ok(1)),
    assert(saturatingAdd(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(saturatingAdd(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(saturatingAdd(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(saturatingAdd(UInt(0), UInt(MAX)) == Ok(MAX)),
    assert(saturatingAdd(UInt(1), UInt(MAX)) == Ok(MAX)),
    assert(saturatingAdd(UInt(MAX - 1), UInt(MAX)) == Ok(MAX)),
    assert(saturatingAdd(UInt(MAX), UInt(MAX)) == Ok(MAX)),
    assert(saturatingAdd(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Saturating sub
  pure val SSubInvsTest = and {
    assert(saturatingSub(UInt(0), UInt(0)) == Ok(0)),
    assert(saturatingSub(UInt(1), UInt(0)) == Ok(1)),
    assert(saturatingSub(UInt(0), UInt(1)) == Ok(0)),
    assert(saturatingSub(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(saturatingSub(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(saturatingSub(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(saturatingSub(UInt(0), UInt(MAX)) == Ok(0)),
    assert(saturatingSub(UInt(1), UInt(MAX)) == Ok(0)),
    assert(saturatingSub(UInt(MAX - 1), UInt(MAX)) == Ok(0)),
    assert(saturatingSub(UInt(MAX), UInt(MAX)) == Ok(0)),
    assert(saturatingSub(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Saturating mul
  pure val SMulInvsTest = and {
    assert(saturatingMul(UInt(0), UInt(1)) == Ok(0)),
    assert(saturatingMul(UInt(1), UInt(1)) == Ok(1)),
    assert(saturatingMul(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(saturatingMul(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(saturatingMul(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(saturatingMul(UInt(0), UInt(MAX)) == Ok(0)),
    assert(saturatingMul(UInt(1), UInt(MAX)) == Ok(MAX)),
    assert(saturatingMul(UInt(MAX - 1), UInt(MAX)) == Ok(MAX)),
    assert(saturatingMul(UInt(MAX), UInt(MAX)) == Ok(MAX)),
    assert(saturatingMul(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Saturating pow
  pure val SPowInvsTest = and {
    assert(saturatingPow(UInt(0), UInt(0)) == Err("undefined")),
    assert(saturatingPow(UInt(0), UInt(1)) == Ok(0)),
    assert(saturatingPow(UInt(1), UInt(0)) == Ok(1)),
    assert(saturatingPow(UInt(1), UInt(1)) == Ok(1)),
    assert(saturatingPow(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(saturatingPow(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(saturatingPow(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(saturatingPow(UInt(0), UInt(MAX)) == Ok(0)),
    assert(saturatingPow(UInt(1), UInt(MAX)) == Ok(1)),
    assert(saturatingPow(UInt(2), UInt(BITS - 1)) == Ok(2^(BITS - 1))),
    assert(saturatingPow(UInt(2), UInt(BITS)) == Ok(MAX)),
    assert(saturatingPow(UInt(2), UInt(BITS + 1)) == Ok(MAX)),
  }

  //////////////
  // WRAPPING //
  //////////////

  // Wrapping add
  pure val WAddInvsTest = and {
    assert(wrappingAdd(UInt(0), UInt(0)) == Ok(0)),
    assert(wrappingAdd(UInt(1), UInt(0)) == Ok(1)),
    assert(wrappingAdd(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(wrappingAdd(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(wrappingAdd(UInt(MAX), UInt(1)) == Ok(0)),
    assert(wrappingAdd(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(wrappingAdd(UInt(0), UInt(MAX)) == Ok(MAX)),
    assert(wrappingAdd(UInt(1), UInt(MAX)) == Ok(0)),
    assert(wrappingAdd(UInt(MAX - 1), UInt(MAX)) == Ok(MAX - 2)),
    assert(wrappingAdd(UInt(MAX), UInt(MAX)) == Ok(MAX - 1)),
    assert(wrappingAdd(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Wrapping sub
  pure val WSubInvsTest = and {
    assert(wrappingSub(UInt(0), UInt(0)) == Ok(0)),
    assert(wrappingSub(UInt(1), UInt(0)) == Ok(1)),
    assert(wrappingSub(UInt(0), UInt(1)) == Ok(MAX)),
    assert(wrappingSub(UInt(1), UInt(1)) == Ok(0)),
    assert(wrappingSub(UInt(MAX - 1), UInt(0)) == Ok(MAX - 1)),
    assert(wrappingSub(UInt(MAX), UInt(0)) == Ok(MAX)),
    assert(wrappingSub(UInt(MAX + 1), UInt(0)) == Err("out of range")),
    assert(wrappingSub(UInt(0), UInt(MAX)) == Ok(1)),
    assert(wrappingSub(UInt(1), UInt(MAX)) == Ok(2)),
    assert(wrappingSub(UInt(MAX - 1), UInt(MAX)) == Ok(MAX)),
    assert(wrappingSub(UInt(MAX), UInt(MAX)) == Ok(0)),
    assert(wrappingSub(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Wrapping mul
  pure val WMulInvsTest = and {
    assert(wrappingMul(UInt(0), UInt(1)) == Ok(0)),
    assert(wrappingMul(UInt(1), UInt(1)) == Ok(1)),
    assert(wrappingMul(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(wrappingMul(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(wrappingMul(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(wrappingMul(UInt(0), UInt(MAX)) == Ok(0)),
    assert(wrappingMul(UInt(1), UInt(MAX)) == Ok(MAX)),
    assert(wrappingMul(UInt(MAX - 1), UInt(MAX)) == Ok(2)),
    assert(wrappingMul(UInt(MAX), UInt(MAX)) == Ok(1)),
    assert(wrappingMul(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

  // Wrapping div == checked div
  // Wrapping rem == checked rem
  
  // Wrapping Pow
  pure val WPowInvsTest = and {
    assert(wrappingPow(UInt(0), UInt(0)) == Err("undefined")),
    assert(wrappingPow(UInt(0), UInt(1)) == Ok(0)),
    assert(wrappingPow(UInt(1), UInt(0)) == Ok(1)),
    assert(wrappingPow(UInt(1), UInt(1)) == Ok(1)),
    assert(wrappingPow(UInt(MAX - 1), UInt(1)) == Ok(MAX - 1)),
    assert(wrappingPow(UInt(MAX), UInt(1)) == Ok(MAX)),
    assert(wrappingPow(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(wrappingPow(UInt(0), UInt(MAX)) == Ok(0)),
    assert(wrappingPow(UInt(1), UInt(MAX)) == Ok(1)),
    assert(wrappingPow(UInt(2), UInt(BITS - 1)) == Ok(2^(BITS - 1))),
    assert(wrappingPow(UInt(2), UInt(BITS)) == Ok(0)),
    assert(wrappingPow(UInt(2), UInt(BITS + 1)) == Ok(0)),
  }

  //////////////
  // ABS DIFF //
  //////////////

  pure val AbsDiffTest = and {
    assert(absDiff(UInt(0), UInt(1)) == Ok(1)),
    assert(absDiff(UInt(1), UInt(1)) == Ok(0)),
    assert(absDiff(UInt(MAX - 1), UInt(1)) == Ok(MAX - 2)),
    assert(absDiff(UInt(MAX), UInt(1)) == Ok(MAX - 1)),
    assert(absDiff(UInt(MAX + 1), UInt(1)) == Err("out of range")),
    assert(absDiff(UInt(0), UInt(MAX)) == Ok(MAX)),
    assert(absDiff(UInt(1), UInt(MAX)) == Ok(MAX - 1)),
    assert(absDiff(UInt(MAX - 1), UInt(MAX)) == Ok(1)),
    assert(absDiff(UInt(MAX), UInt(MAX)) == Ok(0)),
    assert(absDiff(UInt(MAX + 1), UInt(MAX)) == Err("out of range"))
  }

}

module BoundedUInt8Test {
  import BoundedUInt_Test(BITS = 8).*
}

module BoundedUInt16Test {
  import BoundedUInt_Test(BITS = 16).*
}

module BoundedUInt32Test {
  import BoundedUInt_Test(BITS = 32).*
}
