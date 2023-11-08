module BoundedUInt {
  /// The size of this integer type in bits.
  const BITS: int

  /// The smallest value that can be represented by this integer type.
  pure val MIN = 0

  /// The largest value that can be represented by this integer type.
  pure val MAX = (2^BITS) - 1
  
  /// Record-representation of an unsigned bounded integer.
  /// If the `error` field is nonempty, the record represents an exception of some
  /// sort happening during computation, such as an overflow.
  /// Otherwise, the record represents the integer `v`, such that `MIN <= v <= MAX`. 
  /// TODO: Replace with an option type, once those are implemented.
  type UIntT = { v: int, error: str }

  /// Constructs a bounded unsigned integer of type `UIntT` from a value `x` of type `int`. 
  /// If `x` lies outside the `[MIN, MAX]` interval, 
  /// the error field will be nonempty.
  pure def UInt(x: int): UIntT = {
    v: x, 
    error: 
      if (MIN <= x and x <= MAX) ""
      else "out of range"
    }

  /// Given a bounded unsigned integer `x`, returns
  /// true iff `x.v` lies in the `[MIN, MAX]` interval.
  pure def isInRange(x: UIntT): bool = and {
    x.v >= MIN,
    x.v <= MAX
  }

  /// Given a bounded unsigned integer `x`, returns
  /// true iff `x.v` lies in the `[MIN, MAX]` interval, and `x.error` is empty.
  pure def isValid(x: UIntT): bool = and {
    x.error == "",
    isInRange(x)
  }

  /// Given a (T,T) => T operation `op`, which assumes its inputs are valid (w.r.t. `isValid`),
  /// and two T-typed values, l and r, returns op(l,r) iff l and r are both valid. Otheriwse,
  /// it returns some arbitrary invalid value.
  pure def wrapErrorBin(lhs: UIntT, rhs: UIntT, op: (UIntT, UIntT) => UIntT): UIntT =
    if (not(isValid(lhs))) lhs
    else if (not(isValid(rhs))) rhs
    else op(lhs, rhs)

  /// Computes the absolute difference between lhs and rhs.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def absDiffUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v - rhs.v
    { 
      v: if (res < 0) -res else res, 
      error: "" 
    }
  }

  /// Computes the absolute difference between lhs and rhs.
  pure def absDiff(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, absDiffUnsafe)
  
    ////////////////////////
   // CHECKED OPERATIONS //
  ////////////////////////

  /// Unsafe checked integer addition. 
  /// Computes `lhs + rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedAddUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v + rhs.v
    { 
      v: res,
      error: if (res > MAX) "overflow" else ""
    }
  }

  /// Checked integer addition. 
  /// Computes `lhs + rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedAdd(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedAddUnsafe)

  /// Unsafe checked integer subtraction. 
  /// Computes `lhs - rhs`, setting the error field to "underflow" if underflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedSubUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v - rhs.v
    {
      v: res,
      error: if (res < MIN) "underflow" else ""
    }
  }

  /// Checked integer subtraction. 
  /// Computes `lhs - rhs`, setting the error field to "underflow" if underflow occurred.
  pure def checkedSub(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedSubUnsafe)

  /// Unsafe checked integer multiplication. 
  /// Computes `lhs * rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedMulUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v * rhs.v
    {
      v: res,
      error: if (res > MAX) "overflow" else ""
    }
  }

  /// Checked integer multiplication. 
  /// Computes `lhs * rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedMul(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedMulUnsafe)

  /// Unsafe checked integer division. 
  /// Computes `lhs / rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedDivUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    if (rhs.v == 0) { v: 0,             error: "division by zero" }
    else            { v: lhs.v / rhs.v, error: ""                 }
  
  /// Checked integer division. 
  /// Computes `lhs / rhs`, setting the error field to "division by zero" if `rhs.v == 0`.
  pure def checkedDiv(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedDivUnsafe)

  /// Unsafe checked integer remainder. 
  /// Computes `lhs % rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedRemUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    if (rhs.v == 0) { v: 0,             error: "division by zero" }
    else            { v: lhs.v % rhs.v, error: ""                 }

  /// Checked integer remainder. 
  /// Computes `lhs % rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  pure def checkedRem(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedRemUnsafe)

  /// Unsafe checked exponentiation. 
  /// Computes `lhs ^ rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedPowUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    if (lhs.v == rhs.v and lhs.v == 0) { v: 1, error: "undefined"}
    else {
      val res = lhs.v ^ rhs.v
      {
        v: res,
        error: if (res > MAX) "overflow" else ""
      }
    }

  /// Checked exponentiation. 
  /// Computes `lhs ^ rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedPow(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, checkedPowUnsafe)

    ///////////////////////////
   // SATURATING OPERATIONS //
  ///////////////////////////

  /// Unsafe saturating integer addition. 
  /// Computes `lhs + rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingAddUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v + rhs.v
    { 
      v: if (res < MAX) res else MAX, 
      error: "" 
    }
  }

  /// Saturating integer addition. 
  /// Computes `lhs + rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingAdd(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, saturatingAddUnsafe)

  /// Unsafe saturating integer subtraction. 
  /// Computes `lhs - rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingSubUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v - rhs.v
    { 
      v: if (res > MIN) res else MIN, 
      error: "" 
    }
  }

  /// Saturating integer subtraction. 
  /// Computes `lhs - rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingSub(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, saturatingSubUnsafe)

  /// Unsafe saturating integer multiplication. 
  /// Computes `lhs * rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingMulUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v * rhs.v
    { 
      v: if (res < MAX) res else MAX, 
      error: "" 
    }
  }

  /// Saturating integer subtraction. 
  /// Computes `lhs * rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingMul(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, saturatingMulUnsafe)

  /// Unsafe saturating exponentiation. 
  /// Computes `lhs ^ rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingPowUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    if (lhs.v == rhs.v and lhs.v == 0) { v: 1, error: "undefined"}
    else {
      val res = lhs.v ^ rhs.v
      { 
        v: if (res < MAX) res else MAX, 
        error: "" 
      }
    }
  

  /// Saturating exponentiation. 
  /// Computes `lhs ^ rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingPow(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, saturatingPowUnsafe)

    /////////////////////////
   // WRAPPING OPERATIONS //
  /////////////////////////

  /// Unsafe wrapping integer addition.
  /// Computes `lhs + rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingAddUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    { 
      v: (lhs.v + rhs.v) % (MAX + 1), 
      error: "" 
    }

  /// Wrapping integer addition.
  /// Computes `lhs + rhs`, wrapping around at the boundary of the type.
  pure def wrappingAdd(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, wrappingAddUnsafe)

  /// Unsafe wrapping integer subtraction.
  /// Computes `lhs - rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingSubUnsafe(lhs: UIntT, rhs: UIntT): UIntT = {
    val res = lhs.v - rhs.v
    val adjusted = if (res < MIN) res + (MAX + 1) else res
    { 
      v: adjusted % (MAX + 1), 
      error: "" 
    }
  }

  /// Wrapping integer subtraction.
  /// Computes `lhs - rhs`, wrapping around at the boundary of the type.
  pure def wrappingSub(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, wrappingSubUnsafe)

  /// Unsafe wrapping integer multiplication.
  /// Computes `lhs * rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingMulUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    { 
      v: (lhs.v * rhs.v) % (MAX + 1), 
      error: "" 
    }
  
  /// Wrapping integer multiplication.
  /// Computes `lhs * rhs`, wrapping around at the boundary of the type.
  pure def wrappingMul(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, wrappingMulUnsafe)

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

  /// Unsafe wrapping exponentiation.
  /// Computes `lhs ^ rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingPowUnsafe(lhs: UIntT, rhs: UIntT): UIntT = 
    if (lhs.v == rhs.v and lhs.v == 0) { v: 1, error: "undefined"}
    else { 
      v: (lhs.v ^ rhs.v) % (MAX + 1), 
      error: "" 
    }
  
  /// Wrapping exponentiation.
  /// Computes `lhs ^ rhs`, wrapping around at the boundary of the type.
  pure def wrappingPow(lhs: UIntT, rhs: UIntT): UIntT = wrapErrorBin(lhs, rhs, wrappingPowUnsafe)
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
    assert(checkedAdd(UInt(0), UInt(0)) == {v: 0, error: ""}),
    assert(checkedAdd(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(checkedAdd(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(checkedAdd(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(checkedAdd(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(checkedAdd(UInt(0), UInt(MAX)) == {v: MAX, error: ""}),
    assert(checkedAdd(UInt(1), UInt(MAX)) == {v: MAX + 1, error: "overflow"}),
    assert(checkedAdd(UInt(MAX - 1), UInt(MAX)) == {v: 2 * MAX - 1, error: "overflow"}),
    assert(checkedAdd(UInt(MAX), UInt(MAX)) == {v: 2 * MAX, error: "overflow"}),
    assert(checkedAdd(UInt(MAX), UInt(MAX + 1)).error == "out of range"),
  }

  // Checked sub
  pure val CSubInvsTest = and {
    assert(checkedSub(UInt(0), UInt(0)) == {v: 0 , error: ""}),
    assert(checkedSub(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(checkedSub(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(checkedSub(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(checkedSub(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(checkedSub(UInt(0), UInt(MAX)) == {v: -MAX, error: "underflow"}),
    assert(checkedSub(UInt(1), UInt(MAX)) == {v: -(MAX - 1), error: "underflow"}),
    assert(checkedSub(UInt(MAX - 1), UInt(MAX)) == {v: -1, error: "underflow"}),
    assert(checkedSub(UInt(MAX), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedSub(UInt(MAX + 1), UInt(MAX)).error == "out of range"),
  }

  // Checked mul
  pure val CMulInvsTest = and {
    assert(checkedMul(UInt(0), UInt(1)) == {v: 0 , error: ""}),
    assert(checkedMul(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(checkedMul(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(checkedMul(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(checkedMul(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(checkedMul(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedMul(UInt(1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(checkedMul(UInt(MAX - 1), UInt(MAX)) == {v: MAX^2 - MAX, error: "overflow"}),
    assert(checkedMul(UInt(MAX), UInt(MAX)) == {v: MAX^2, error: "overflow"}),
    assert(checkedMul(UInt(MAX + 1), UInt(MAX)).error == "out of range"),
  }

  // Checked div
  pure val CDivInvsTest = and {
    assert(checkedDiv(UInt(0), UInt(0)).error == "division by zero"),
    assert(checkedDiv(UInt(1), UInt(0)).error == "division by zero"),
    assert(checkedDiv(UInt(MAX - 1), UInt(0)).error == "division by zero"),
    assert(checkedDiv(UInt(MAX), UInt(0)).error == "division by zero"),
    assert(checkedDiv(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(checkedDiv(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(checkedDiv(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(checkedDiv(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(checkedDiv(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(checkedDiv(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(checkedDiv(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedDiv(UInt(1), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedDiv(UInt(MAX - 1), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedDiv(UInt(MAX), UInt(MAX)) == {v: 1, error: ""}),
    assert(checkedDiv(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Checked rem
  pure val CRemInvsTest = and {
    assert(checkedRem(UInt(0), UInt(0)).error == "division by zero"),
    assert(checkedRem(UInt(1), UInt(0)).error == "division by zero"),
    assert(checkedRem(UInt(MAX - 1), UInt(0)).error == "division by zero"),
    assert(checkedRem(UInt(MAX), UInt(0)).error == "division by zero"),
    assert(checkedRem(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(checkedRem(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(1), UInt(1)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(MAX - 1), UInt(1)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(MAX), UInt(1)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(checkedRem(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(1), UInt(MAX)) == {v: 1, error: ""}),
    assert(checkedRem(UInt(MAX - 1), UInt(MAX)) == {v: MAX - 1, error: ""}),
    assert(checkedRem(UInt(MAX), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedRem(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Checked Pow
  pure val CPowInvsTest = and {
    assert(checkedPow(UInt(0), UInt(0)).error == "undefined"),
    assert(checkedPow(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(checkedPow(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(checkedPow(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(checkedPow(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(checkedPow(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(checkedPow(UInt(MAX), UInt(0)) == {v: 1, error: ""}),
    assert(checkedPow(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(checkedPow(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(checkedPow(UInt(1), UInt(MAX)) == {v: 1, error: ""}),
    assert(checkedPow(UInt(2), UInt(BITS - 1)) == {v: 2^(BITS - 1), error: ""}),
    assert(checkedPow(UInt(2), UInt(BITS)) == {v: MAX + 1, error: "overflow"}),
    assert(checkedPow(UInt(2), UInt(BITS + 1)) == {v: 2 * MAX + 2, error: "overflow"}),
  }

  ////////////////
  // SATURATING //
  ////////////////

  // Saturating add
  pure val SAddInvsTest = and {
    assert(saturatingAdd(UInt(0), UInt(0)) == {v: 0, error: ""}),
    assert(saturatingAdd(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(saturatingAdd(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(saturatingAdd(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(saturatingAdd(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(saturatingAdd(UInt(0), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingAdd(UInt(1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingAdd(UInt(MAX - 1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingAdd(UInt(MAX), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingAdd(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Saturating sub
  pure val SSubInvsTest = and {
    assert(saturatingSub(UInt(0), UInt(0)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(saturatingSub(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(saturatingSub(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(saturatingSub(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(saturatingSub(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(1), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(MAX - 1), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(MAX), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingSub(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Saturating mul
  pure val SMulInvsTest = and {
    assert(saturatingMul(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(saturatingMul(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(saturatingMul(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(saturatingMul(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(saturatingMul(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(saturatingMul(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingMul(UInt(1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingMul(UInt(MAX - 1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingMul(UInt(MAX), UInt(MAX)) == {v: MAX, error: ""}),
    assert(saturatingMul(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Saturating pow
  pure val SPowInvsTest = and {
    assert(saturatingPow(UInt(0), UInt(0)).error == "undefined"),
    assert(saturatingPow(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(saturatingPow(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(saturatingPow(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(saturatingPow(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(saturatingPow(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(saturatingPow(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(saturatingPow(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(saturatingPow(UInt(1), UInt(MAX)) == {v: 1, error: ""}),
    assert(saturatingPow(UInt(2), UInt(BITS - 1)) == {v: 2^(BITS - 1), error: ""}),
    assert(saturatingPow(UInt(2), UInt(BITS)) == {v: MAX, error: ""}),
    assert(saturatingPow(UInt(2), UInt(BITS + 1)) == {v: MAX, error: ""}),
  }

  //////////////
  // WRAPPING //
  //////////////

  // Wrapping add
  pure val WAddInvsTest = and {
    assert(wrappingAdd(UInt(0), UInt(0)) == {v: 0, error: ""}),
    assert(wrappingAdd(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(wrappingAdd(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(wrappingAdd(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(wrappingAdd(UInt(MAX), UInt(1)) == {v: 0, error: ""}),
    assert(wrappingAdd(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(wrappingAdd(UInt(0), UInt(MAX)) == {v: MAX, error: ""}),
    assert(wrappingAdd(UInt(1), UInt(MAX)) == {v: 0, error: ""}),
    assert(wrappingAdd(UInt(MAX - 1), UInt(MAX)) == {v: MAX - 2, error: ""}),
    assert(wrappingAdd(UInt(MAX), UInt(MAX)) == {v: MAX - 1, error: ""}),
    assert(wrappingAdd(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Wrapping sub
  pure val WSubInvsTest = and {
    assert(wrappingSub(UInt(0), UInt(0)) == {v: 0, error: ""}),
    assert(wrappingSub(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(wrappingSub(UInt(0), UInt(1)) == {v: MAX, error: ""}),
    assert(wrappingSub(UInt(1), UInt(1)) == {v: 0, error: ""}),
    assert(wrappingSub(UInt(MAX - 1), UInt(0)) == {v: MAX - 1, error: ""}),
    assert(wrappingSub(UInt(MAX), UInt(0)) == {v: MAX, error: ""}),
    assert(wrappingSub(UInt(MAX + 1), UInt(0)).error == "out of range"),
    assert(wrappingSub(UInt(0), UInt(MAX)) == {v: 1, error: ""}),
    assert(wrappingSub(UInt(1), UInt(MAX)) == {v: 2, error: ""}),
    assert(wrappingSub(UInt(MAX - 1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(wrappingSub(UInt(MAX), UInt(MAX)) == {v: 0, error: ""}),
    assert(wrappingSub(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Wrapping mul
  pure val WMulInvsTest = and {
    assert(wrappingMul(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(wrappingMul(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(wrappingMul(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(wrappingMul(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(wrappingMul(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(wrappingMul(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(wrappingMul(UInt(1), UInt(MAX)) == {v: MAX, error: ""}),
    assert(wrappingMul(UInt(MAX - 1), UInt(MAX)) == {v: 2, error: ""}),
    assert(wrappingMul(UInt(MAX), UInt(MAX)) == {v: 1, error: ""}),
    assert(wrappingMul(UInt(MAX + 1), UInt(MAX)).error == "out of range")
  }

  // Wrapping div == checked div
  // Wrapping rem == checked rem
  
  // Wrapping Pow
  pure val WPowInvsTest = and {
    assert(wrappingPow(UInt(0), UInt(0)).error == "undefined"),
    assert(wrappingPow(UInt(0), UInt(1)) == {v: 0, error: ""}),
    assert(wrappingPow(UInt(1), UInt(0)) == {v: 1, error: ""}),
    assert(wrappingPow(UInt(1), UInt(1)) == {v: 1, error: ""}),
    assert(wrappingPow(UInt(MAX - 1), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(wrappingPow(UInt(MAX), UInt(1)) == {v: MAX, error: ""}),
    assert(wrappingPow(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(wrappingPow(UInt(0), UInt(MAX)) == {v: 0, error: ""}),
    assert(wrappingPow(UInt(1), UInt(MAX)) == {v: 1, error: ""}),
    assert(wrappingPow(UInt(2), UInt(BITS - 1)) == {v: 2^(BITS - 1), error: ""}),
    assert(wrappingPow(UInt(2), UInt(BITS)) == {v: 0, error: ""}),
    assert(wrappingPow(UInt(2), UInt(BITS + 1)) == {v: 0, error: ""}),
  }

  //////////////
  // ABS DIFF //
  //////////////

  pure val AbsDiffTest = and {
    assert(absDiff(UInt(0), UInt(1)) == {v: 1, error: ""}),
    assert(absDiff(UInt(1), UInt(1)) == {v: 0, error: ""}),
    assert(absDiff(UInt(MAX - 1), UInt(1)) == {v: MAX - 2, error: ""}),
    assert(absDiff(UInt(MAX), UInt(1)) == {v: MAX - 1, error: ""}),
    assert(absDiff(UInt(MAX + 1), UInt(1)).error == "out of range"),
    assert(absDiff(UInt(0), UInt(MAX)) == {v: MAX, error: ""}),
    assert(absDiff(UInt(1), UInt(MAX)) == {v: MAX - 1, error: ""}),
    assert(absDiff(UInt(MAX - 1), UInt(MAX)) == {v: 1, error: ""}),
    assert(absDiff(UInt(MAX), UInt(MAX)) == {v: 0, error: ""}),
    assert(absDiff(UInt(MAX + 1), UInt(MAX)).error == "out of range")
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
