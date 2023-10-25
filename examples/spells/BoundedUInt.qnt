module BoundedUInt {
  /// The size of this integer type in bits.
  const BITS: int

  pure val MAX = (2^BITS) - 1
  pure val MIN = 0

  type T = { v: int, error: str }

  pure def UInt(x: int): T = {v: x, 
    error: 
      if (MIN <= x and x <= MAX) ""
      else "out of range"}

  pure def isInRange(x: T): bool = and {
    x.v >= MIN,
    x.v <= MAX
  }
  pure def isValid(x: T): bool = and {
    x.error == "",
    isInRange(x)
  }

  pure def wrapErrorBin(lhs: T, rhs: T, op: (T, T) => T): T = {
    if (not(isValid(lhs))) {
      lhs
    } else if (not(isValid(rhs))) {
      rhs
    } else {
      op(lhs, rhs)
    }
  }

  pure def checkedAddUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v + rhs.v
    if (res > MAX) {
      { v: res, error: "overflow" }
    } else {
      { v: res, error: "" }
    }
  }
  pure def checkedAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedAddUnsafe)

  pure def checkedSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    if (res < MIN) {
      { v: res, error: "underflow" }
    } else {
      { v: res, error: "" }
    }
  }
  pure def checkedSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedSubUnsafe)

  pure def checkedMulUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v * rhs.v
    if (res > MAX) {
      { v: res, error: "overflow" }
    } else {
      { v: res, error: "" }
    }
  }
  pure def checkedMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedMulUnsafe)

  pure def checkedDivUnsafe(lhs: T, rhs: T): T = {
    if (rhs.v == 0) {
      { v: 0, error: "division by zero" }
    } else {
      { v: lhs.v / rhs.v, error: "" }
    }
  }
  pure def checkedDiv(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedDivUnsafe)


  pure def checkedRemUnsafe(lhs: T, rhs: T): T = {
    if (rhs.v == 0) {
      { v: 0, error: "division by zero" }
    } else {
      { v: lhs.v % rhs.v, error: "" }
    }
  }
  pure def checkedRem(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedRemUnsafe)

  pure def checkedPowUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v ^ rhs.v
    if (res > MAX) {
      { v: res, error: "overflow" }
    } else {
      { v: res, error: "" }
    }
  }
  pure def checkedPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, checkedPowUnsafe)

  pure def saturatingAddUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v + rhs.v
    { v: if (res < MAX) res else MAX, error: "" }
  }
  pure def saturatingAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingAddUnsafe)

  pure def saturatingSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    { v: if (res > MIN) res else MIN, error: "" }
  }
  pure def saturatingSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingSubUnsafe)

  pure def saturatingMulUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v * rhs.v
    { v: if (res < MAX) res else MAX, error: "" }
  }
  pure def saturatingMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingMulUnsafe)

  pure def saturatingPowUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v ^ rhs.v
    { v: if (res < MAX) res else MAX, error: "" }
  }
  pure def saturatingPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, saturatingPowUnsafe)


  pure def wrappingAddUnsafe(lhs: T, rhs: T): T = {
    { v: (lhs.v + rhs.v) % (MAX + 1), error: "" }
  }
  pure def wrappingAdd(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingAddUnsafe)

  pure def wrappingSubUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    val adj_res = if (res < MIN) res + (MAX + 1) else res
    { v: adj_res % (MAX + 1), error: "" }
  }
  pure def wrappingSub(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingSubUnsafe)

  pure def wrappingMulUnsafe(lhs: T, rhs: T): T = {
    { v: (lhs.v * rhs.v) % (MAX + 1), error: "" }
  }
  pure def wrappingMul(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingMulUnsafe)

  pure def wrappingDiv(lhs: T, rhs: T): T = checkedDiv(lhs, rhs)
  pure def wrappingRem(lhs: T, rhs: T): T = checkedRem(lhs, rhs)

  pure def wrappingPowUnsafe(lhs: T, rhs: T): T = {
    { v: (lhs.v ^ rhs.v) % (MAX + 1), error: "" }
  }
  pure def wrappingPow(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, wrappingPowUnsafe)

  pure def absDiffUnsafe(lhs: T, rhs: T): T = {
    val res = lhs.v - rhs.v
    { v: if (res < 0) -res else res, error: "" }
  }
  pure def absDiff(lhs: T, rhs: T): T = wrapErrorBin(lhs, rhs, absDiffUnsafe)
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

module BoundedUint32Test {
  import BoundedUInt_Test(BITS = 32).*
}

module BoundedUint64Test {
  import BoundedUInt_Test(BITS = 64).*
}