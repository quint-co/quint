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
  type T = { v: int, error: str }

  /// Constructs a bounded unsigned integer from a mathematical integer. 
  /// If the mathematical integer lies outside the `[MIN, MAX]` interval, 
  /// the error field will be nonempty.
  pure def UInt(x: int): T = {v: x, 
    error: 
      if (MIN <= x and x <= MAX) ""
      else "out of range"}

  /// Given a record representation of a bounded unsigned integer, returns
  /// true iff the record value lies in the `[MIN, MAX]` interval.
  pure def isInRange(x: T): bool = and {
    x.v >= MIN,
    x.v <= MAX
  }

  /// Given a record representation of a bounded unsigned integer, returns
  /// true iff the record value lies in the `[MIN, MAX]` interval, and the error field is empty.
  pure def isValid(x: T): bool = and {
    x.error == "",
    isInRange(x)
  }

  /// Given a (T,T) => T operation `op`, which assumes its inputs are valid (w.r.t. `isValid`),
  /// and two T-typed values, l and r, returns op(l,r) iff l and r are both valid. Otheriwse,
  /// it returns some arbitrary invalid value.
  pure def wrapErrorBin(lhs: T, rhs: T, op: (T, T) => T): T =
    if (not(isValid(lhs))) lhs
    else if (not(isValid(rhs))) rhs
    else op(lhs, rhs)

  /// Computes the absolute difference between lhs and rhs.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def absDiffUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    { 
      v: if (res < 0) -res else res, 
      error: "" 
    }
  }

  /// Computes the absolute difference between lhs and rhs.
  pure def absDiff(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, absDiffUnsafe)
  
    ////////////////////////
   // CHECKED OPERATIONS //
  ////////////////////////

  /// Unsafe checked integer addition. 
  /// Computes `lhs + rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedAddUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v + rhs.v
    { 
      v: res,
      error: if (res > MAX) "overflow" else ""
    }
  }

  /// Checked integer addition. 
  /// Computes `lhs + rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedAddUnsafe)

  /// Unsafe checked integer subtraction. 
  /// Computes `lhs - rhs`, setting the error field to "underflow" if underflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    {
      v: res,
      error: if (res < MIN) "underflow" else ""
    }
  }

  /// Checked integer subtraction. 
  /// Computes `lhs - rhs`, setting the error field to "underflow" if underflow occurred.
  pure def checkedSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedSubUnsafe)

  /// Unsafe checked integer multiplication. 
  /// Computes `lhs * rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedMulUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v * rhs.v
    {
      v: res,
      error: if (res > MAX) "overflow" else ""
    }
  }

  /// Checked integer multiplication. 
  /// Computes `lhs * rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedMulUnsafe)

  /// Unsafe checked integer division. 
  /// Computes `lhs / rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedDivUnsafe(lhs: T, rhs: T): T = 
    if (rhs.v == 0) { v: 0,             error: "division by zero" }
    else            { v: lhs.v / rhs.v, error: ""                 }
  
  /// Checked integer division. 
  /// Computes `lhs / rhs`, setting the error field to "division by zero" if `rhs.v == 0`.
  pure def checkedDiv(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedDivUnsafe)

  /// Unsafe checked integer remainder. 
  /// Computes `lhs % rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedRemUnsafe(lhs: T, rhs: T): T = 
    if (rhs.v == 0) { v: 0,             error: "division by zero" }
    else            { v: lhs.v % rhs.v, error: ""                 }

  /// Checked integer remainder. 
  /// Computes `lhs % rhs`. If `rhs.v == 0` the error field is set to "division by zero" and the value is arbitrary.
  pure def checkedRem(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedRemUnsafe)

  /// Unsafe checked exponentiation. 
  /// Computes `lhs ^ rhs`, setting the error field to "overflow" if overflow occurred.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def checkedPowUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v ^ rhs.v
    {
      v: res,
      error: if (res > MAX) "overflow" else ""
    }
  }

  /// Checked exponentiation. 
  /// Computes `lhs ^ rhs`, setting the error field to "overflow" if overflow occurred.
  pure def checkedPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedPowUnsafe)

    ///////////////////////////
   // SATURATING OPERATIONS //
  ///////////////////////////

  /// Unsafe saturating integer addition. 
  /// Computes `lhs + rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingAddUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v + rhs.v
    { 
      v: if (res < MAX) res else MAX, 
      error: "" 
    }
  }

  /// Saturating integer addition. 
  /// Computes `lhs + rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingAddUnsafe)

  /// Unsafe saturating integer subtraction. 
  /// Computes `lhs - rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    { 
      v: if (res > MIN) res else MIN, 
      error: "" 
    }
  }

  /// Saturating integer subtraction. 
  /// Computes `lhs - rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingSubUnsafe)

  /// Unsafe saturating integer multiplication. 
  /// Computes `lhs * rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingMulUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v * rhs.v
    { 
      v: if (res < MAX) res else MAX, 
      error: "" 
    }
  }

  /// Saturating integer subtraction. 
  /// Computes `lhs * rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingMulUnsafe)

  /// Unsafe saturating exponentiation. 
  /// Computes `lhs ^ rhs`, saturating at the numeric bounds instead of overflowing.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def saturatingPowUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v ^ rhs.v
    { 
      v: if (res < MAX) res else MAX, 
      error: "" 
    }
  }

  /// Saturating exponentiation. 
  /// Computes `lhs ^ rhs`, saturating at the numeric bounds instead of overflowing.
  pure def saturatingPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingPowUnsafe)

    /////////////////////////
   // WRAPPING OPERATIONS //
  /////////////////////////

  /// Unsafe wrapping integer addition.
  /// Computes `lhs + rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingAddUnsafe(lhs: T, rhs: T): T = 
    { 
      v: (lhs.v + rhs.v) % (MAX + 1), 
      error: "" 
    }

  /// Wrapping integer addition.
  /// Computes `lhs + rhs`, wrapping around at the boundary of the type.
  pure def wrappingAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingAddUnsafe)

  /// Unsafe wrapping integer subtraction.
  /// Computes `lhs - rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    val adjusted = if (res < MIN) res + (MAX + 1) else res
    { 
      v: adjusted % (MAX + 1), 
      error: "" 
    }
  }

  /// Wrapping integer subtraction.
  /// Computes `lhs - rhs`, wrapping around at the boundary of the type.
  pure def wrappingSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingSubUnsafe)

  /// Unsafe wrapping integer multiplication.
  /// Computes `lhs * rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingMulUnsafe(lhs: T, rhs: T): T = 
    { 
      v: (lhs.v * rhs.v) % (MAX + 1), 
      error: "" 
    }
  
  /// Wrapping integer multiplication.
  /// Computes `lhs * rhs`, wrapping around at the boundary of the type.
  pure def wrappingMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingMulUnsafe)

  /// Wrapping integer division.
  /// Computes `lhs / rhs`. Wrapped division on unsigned types is just normal division. 
  /// There’s no way wrapping could ever happen. 
  /// This operator exists, so that all operations are accounted for in the wrapping operations.
  pure def wrappingDiv(lhs: T, rhs: T): T = checkedDiv(lhs, rhs)

  /// Wrapping integer remainder.
  /// Computes `lhs % rhs`. Wrapped remainder on unsigned types is just normal remainder. 
  /// There’s no way wrapping could ever happen. 
  /// This operator exists, so that all operations are accounted for in the wrapping operations.
  pure def wrappingRem(lhs: T, rhs: T): T = checkedRem(lhs, rhs)

  /// Unsafe wrapping exponentiation.
  /// Computes `lhs ^ rhs`, wrapping around at the boundary of the type.
  /// Assumes lhs and rhs are valid (w.r.t. `isValid`).
  pure def wrappingPowUnsafe(lhs: T, rhs: T): T = 
    { 
      v: (lhs.v ^ rhs.v) % (MAX + 1), 
      error: "" 
    }
  
  /// Wrapping exponentiation.
  /// Computes `lhs ^ rhs`, wrapping around at the boundary of the type.
  pure def wrappingPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingPowUnsafe)
}

module BoundedUInt_Test {
  import BoundedUInt.*

  /////////////
  // CHECKED //
  /////////////

  pure def MkCInv(x: int, y: int, op: (T,T) => T, expectedErr: str, expectedVal: (int, int) => int): bool = {
    val xx = UInt(x)
    val yy = UInt(y)
    val res = op(xx, yy)
    if (xx.isValid() and yy.isValid())
      if (res.isValid()) res.v == expectedVal(xx.v, yy.v)
      else res.error == expectedErr
    else res.error == "out of range"
  }

  // Checked add
  pure def CAddInv(x: int, y: int): bool = MkCInv(x,y, checkedAdd, "overflow", (xx, yy) => xx + yy)

  pure val CAddInvsTest = and {
    CAddInv(0, 0),
    CAddInv(1, 0),
    CAddInv(MAX - 1, 0),
    CAddInv(MAX, 0),
    CAddInv(MAX + 1, 0),
    CAddInv(0, MAX),
    CAddInv(1, MAX),
    CAddInv(MAX - 1, MAX),
    CAddInv(MAX, MAX),
    CAddInv(MAX + 1, MAX)
  }

  // Checked sub
  pure def CSubInv(x: int, y: int): bool = MkCInv(x,y, checkedSub, "underflow", (xx, yy) => xx - yy)

  pure val CSubInvsTest = and {
    CSubInv(0, 0),
    CSubInv(1, 0),
    CSubInv(MAX - 1, 0),
    CSubInv(MAX, 0),
    CSubInv(MAX + 1, 0),
    CSubInv(0, MAX),
    CSubInv(1, MAX),
    CSubInv(MAX - 1, MAX),
    CSubInv(MAX, MAX),
    CSubInv(MAX + 1, MAX)
  }

  // Checked mul
  pure def CMulInv(x: int, y: int): bool = MkCInv(x,y, checkedMul, "overflow", (xx, yy) => xx * yy)

  pure val CMulInvsTest = and {
    CMulInv(0, 1),
    CMulInv(1, 1),
    CMulInv(MAX - 1, 1),
    CMulInv(MAX, 1),
    CMulInv(MAX + 1, 1),
    CMulInv(0, MAX),
    CMulInv(1, MAX),
    CMulInv(MAX - 1, MAX),
    CMulInv(MAX, MAX),
    CMulInv(MAX + 1, MAX)
  }

  // Checked div
  pure def CDivInv(x: int, y: int): bool = MkCInv(x,y, checkedDiv, "division by zero", (xx, yy) => xx / yy)

  pure val CDivInvsTest = and {
    CDivInv(0, 0),
    CDivInv(1, 0),
    CDivInv(MAX - 1, 0),
    CDivInv(MAX, 0),
    CDivInv(MAX + 1, 0),
    CDivInv(0, 1),
    CDivInv(1, 1),
    CDivInv(MAX - 1, 1),
    CDivInv(MAX, 1),
    CDivInv(MAX + 1, 1),
    CDivInv(0, MAX),
    CDivInv(1, MAX),
    CDivInv(MAX - 1, MAX),
    CDivInv(MAX, MAX),
    CDivInv(MAX + 1, MAX)
  }

  // Checked rem
  pure def CRemInv(x: int, y: int): bool = MkCInv(x,y, checkedRem, "division by zero", (xx, yy) => xx % yy)

  pure val CRemInvsTest = and {
    CRemInv(0, 0),
    CRemInv(1, 0),
    CRemInv(MAX - 1, 0),
    CRemInv(MAX, 0),
    CRemInv(MAX + 1, 0),
    CRemInv(0, 1),
    CRemInv(1, 1),
    CRemInv(MAX - 1, 1),
    CRemInv(MAX, 1),
    CRemInv(MAX + 1, 1),
    CRemInv(0, MAX),
    CRemInv(1, MAX),
    CRemInv(MAX - 1, MAX),
    CRemInv(MAX, MAX),
    CRemInv(MAX + 1, MAX)
  }

  // Checked Pow
  pure def CPowInv(x: int, y: int): bool = MkCInv(x,y, checkedPow, "overflow", (xx, yy) => xx ^ yy)

  pure val CPowInvsTest = and {
    CPowInv(0, 1),
    CPowInv(1, 1),
    CPowInv(MAX - 1, 1),
    CPowInv(MAX, 1),
    CPowInv(MAX + 1, 1),
    CPowInv(0, MAX),
    CPowInv(1, MAX),
    CPowInv(MAX - 1, MAX),
    CPowInv(MAX, MAX),
    CPowInv(MAX + 1, MAX)
  }

  ////////////////
  // SATURATING //
  ////////////////

  pure def MkSInv(x: int, y: int, op: (T,T) => T, expectedVal: (int, int) => int): bool = {
    val xx = UInt(x)
    val yy = UInt(y)
    val res = op(xx, yy)

    pure def saturate(v: int): int = 
      if (v > MAX) MAX
      else if (v < MIN) MIN
      else v

    if (xx.isValid() and yy.isValid())
      res.isValid() and res.v == saturate(expectedVal(xx.v, yy.v))
    else res.error == "out of range"
  }

  // Saturating add
  pure def SAddInv(x: int, y: int): bool = MkSInv(x,y, saturatingAdd, (xx, yy) => xx + yy)

  pure val SAddInvsTest = and {
    SAddInv(0, 0),
    SAddInv(1, 0),
    SAddInv(MAX - 1, 0),
    SAddInv(MAX, 0),
    SAddInv(MAX + 1, 0),
    SAddInv(0, MAX),
    SAddInv(1, MAX),
    SAddInv(MAX - 1, MAX),
    SAddInv(MAX, MAX),
    SAddInv(MAX + 1, MAX)
  }

  // Saturating sub
  pure def SSubInv(x: int, y: int): bool = MkSInv(x,y, saturatingSub,(xx, yy) => xx - yy)

  pure val SSubInvsTest = and {
    SSubInv(0, 0),
    SSubInv(1, 0),
    SSubInv(MAX - 1, 0),
    SSubInv(MAX, 0),
    SSubInv(MAX + 1, 0),
    SSubInv(0, MAX),
    SSubInv(1, MAX),
    SSubInv(MAX - 1, MAX),
    SSubInv(MAX, MAX),
    SSubInv(MAX + 1, MAX)
  }

  // Saturating mul
  pure def SMulInv(x: int, y: int): bool = MkSInv(x,y, saturatingMul, (xx, yy) => xx * yy)

  pure val SMulInvsTest = and {
    SMulInv(0, 1),
    SMulInv(1, 1),
    SMulInv(MAX - 1, 1),
    SMulInv(MAX, 1),
    SMulInv(MAX + 1, 1),
    SMulInv(0, MAX),
    SMulInv(1, MAX),
    SMulInv(MAX - 1, MAX),
    SMulInv(MAX, MAX),
    SMulInv(MAX + 1, MAX)
  }

  // Saturating pow
  pure def SPowInv(x: int, y: int): bool = MkSInv(x,y, saturatingPow, (xx, yy) => xx ^ yy)

  pure val SPowInvsTest = and {
    SPowInv(0, 1),
    SPowInv(1, 1),
    SPowInv(MAX - 1, 1),
    SPowInv(MAX, 1),
    SPowInv(MAX + 1, 1),
    SPowInv(0, MAX),
    SPowInv(1, MAX),
    SPowInv(MAX - 1, MAX),
    SPowInv(MAX, MAX),
    SPowInv(MAX + 1, MAX)
  }

  //////////////
  // WRAPPING //
  //////////////

  pure def MkWInv(x: int, y: int, op: (T,T) => T, expectedVal: (int, int) => int): bool = {
    val xx = UInt(x)
    val yy = UInt(y)
    val res = op(xx, yy)

    pure def wrap(v: int): int = 
      if (v > MAX) v % (MAX + 1)
      else if (v < MIN) v + MAX + 1
      else v

    if (xx.isValid() and yy.isValid())
      res.isValid() and res.v == wrap(expectedVal(xx.v, yy.v))
    else res.error == "out of range"
  }

  // Wrapping add
  pure def WAddInv(x: int, y: int): bool = MkWInv(x,y, wrappingAdd, (xx, yy) => xx + yy)

  pure val WAddInvsTest = and {
    WAddInv(0, 0),
    WAddInv(1, 0),
    WAddInv(MAX - 1, 0),
    WAddInv(MAX, 0),
    WAddInv(MAX + 1, 0),
    WAddInv(0, MAX),
    WAddInv(1, MAX),
    WAddInv(MAX - 1, MAX),
    WAddInv(MAX, MAX),
    WAddInv(MAX + 1, MAX)
  }

  // Wrapping sub
  pure def WSubInv(x: int, y: int): bool = MkWInv(x,y, wrappingSub, (xx, yy) => xx - yy)

  pure val WSubInvsTest = and {
    WSubInv(0, 0),
    WSubInv(1, 0),
    WSubInv(MAX - 1, 0),
    WSubInv(MAX, 0),
    WSubInv(MAX + 1, 0),
    WSubInv(0, MAX),
    WSubInv(1, MAX),
    WSubInv(MAX - 1, MAX),
    WSubInv(MAX, MAX),
    WSubInv(MAX + 1, MAX)
  }

  // Wrapping mul
  pure def WMulInv(x: int, y: int): bool = MkWInv(x,y, wrappingMul, (xx, yy) => xx * yy)

  pure val WMulInvsTest = and {
    WMulInv(0, 1),
    WMulInv(1, 1),
    WMulInv(MAX - 1, 1),
    WMulInv(MAX, 1),
    WMulInv(MAX + 1, 1),
    WMulInv(0, MAX),
    WMulInv(1, MAX),
    WMulInv(MAX - 1, MAX),
    WMulInv(MAX, MAX),
    WMulInv(MAX + 1, MAX)
  }

  // Wrapping div == checked div
  // Wrapping rem == checked rem
  
  // Wrapping Pow
  pure def WPowInv(x: int, y: int): bool = MkWInv(x,y, wrappingPow, (xx, yy) => xx ^ yy)

  pure val WPowInvsTest = and {
    WPowInv(0, 1),
    WPowInv(1, 1),
    WPowInv(MAX - 1, 1),
    WPowInv(MAX, 1),
    WPowInv(MAX + 1, 1),
    WPowInv(0, MAX),
    WPowInv(1, MAX),
    WPowInv(MAX - 1, MAX),
    WPowInv(MAX, MAX),
    WPowInv(MAX + 1, MAX)
  }

  //////////////
  // ABS DIFF //
  //////////////

  pure def AbsDiffInv(x: int, y: int): bool = {
    val xx = UInt(x)
    val yy = UInt(y)
    val res = absDiff(xx, yy)

    pure def abs(i: int): int = if (i < 0) -i else i

    if (xx.isValid() and yy.isValid())
      res.isValid() and res.v == abs(xx.v - yy.v)
    else res.error == "out of range"
  }

  pure val AbsDiffTest = and {
    AbsDiffInv(0, 1),
    AbsDiffInv(1, 1),
    AbsDiffInv(MAX - 1, 1),
    AbsDiffInv(MAX, 1),
    AbsDiffInv(MAX + 1, 1),
    AbsDiffInv(0, MAX),
    AbsDiffInv(1, MAX),
    AbsDiffInv(MAX - 1, MAX),
    AbsDiffInv(MAX, MAX),
    AbsDiffInv(MAX + 1, MAX)
  }

}

module BoundedUint8Test {
  import BoundedUInt_Test(BITS = 8).*
}