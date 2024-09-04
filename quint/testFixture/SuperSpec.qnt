module M1 {
  val foo = 4
}

module M2 {
  val bar = 4
}

module Proto {
  const N: int
  var x: int
}

// a module that contains constants
module withConsts {
  // Constants
  const N: int
  const S: Set[int]
  const MySet: Set[int]
  const MySeq: List[bool]
  const MyFun: int -> str
  const MyFunFun: (int -> str) -> bool
  const MyOperator: (int, str) => bool
  const MyOperatorWithComma: (int, str, ) => bool
  const MyTuple: (int, bool, str)
  const MyTupleWithComma: (int, bool, str, )

  // just a normal record, without any variation in the fields
  const MyRecord: { i: int, b: bool, s: str }
  const MyRecordWithComma: { i: int, b: bool, s: str, }

  // A type prefixed with a namespace
  type some::namespace::MyType = int

  // a disjoint union is a common pattern in TLA+
  type MyUnionType =
      | Circle(int)
      | Rectangle({width: int, height: int })
      | Dog(str)
  const MyUnion: MyUnionType

  // Vars
  // We don't do extensive testing of types,
  // as we have done it for constants already.
  var i: int
  var j: bool

  // Vals
  // Since 'val' gives us the simplest way of defining expressions,
  // we also do extensive testing of expression syntax in this test.
  val add_1_to_2 = 1 + 2
  val sub_1_to_2 = 1 - 2
  val mul_2_to_3 = 2 * 3
  val div_2_to_3 = 2 / 3
  val mod_2_to_3 = 2 % 3
  val pow_2_to_3 = 2^3
  val uminus = -100
  val gt_2_to_3 = 2 > 3
  val ge_2_to_3 = 2 >= 3
  val lt_2_to_3 = 2 < 3
  val le_2_to_3 = 2 <= 3
  val eqeq_2_to_3 = 2 == 3
  val ne_2_to_3 = 2 != 3
  val VeryTrue = {
      2 + 2 == 4
  }
  val nat_includes_one = 1.in(Nat)
  val there_is_truth = Bool.exists(x => x)

  // Typed vals
  val withType: Set[int] = Set(1, 2)
  // PROC is an uninterpreted type
  type PROC
  val withUninterpretedType: Set[PROC] = Set()

  // Operator definitions
  var n: int
  pure val magicNumber = 42
  pure def add(x, y) = x + y
  def ofN(factor) = factor * n
  action A(x) = n' = x
  pure def B(x) = not(x)

  // Typed operators
  def H(x, y): (int, int) => int = {
      x + y
  }
  // Pol has a parametric type
  def Pol(x): (a) => a = {
      x
  }

  var k: int
  action asgn = k' = 3

  // C-like definition signatures
  pure def min(x: int, y: int): int = {
    if (x < y)
    x
    else y
  }


  // Logical operators
  val test_and = false and true
  val test_or = false or true
  val test_implies = false implies true
  def F(x) = x
  def G(x) = F(x) and not(x)
  def test_and_arg(x) = F(x) and not(x)
  def test_or_arg(x) = F(x) or not(x)

  val test_block_and = and {
      false,
      true,
      false
  }

  action test_action_and = all {
      false,
      true,
      false
  }

  val test_block_or = or {
      false,
      true,
      false
  }

  action test_action_or = any {
      false,
      true,
      false
  }

  val test_ite = if (true) 1 else 0
  def test_ite2(x, y) = if (x < 10) y + 5 else y % 5

  // Function application
  var f1: str -> int
  val funapp = f1.get("a")

  // Apply a user-defined operator by its name.
  def MyOper(a, b) = 1
  val oper_app_normal = MyOper("a", 42)
  val oper_app_ufcs = "a".MyOper(42)
  // the following operators need a special parsing case
  val oper_in = in(1, Set())

  // Dot notation application with lambdas
  // Pass a lambda operator as a second argument of filter.
  // Here we are using the dot notation.
  val oper_app_dot1 = S.filter(x => x > 10)
  // Tuple unpackig in lambda
  val tuple_sum = tuples(S, MySet).map( ((s, mys)) => s + mys )
  // Use unknown
  action oper_nondet = {
    nondet x = oneOf(S)
    all {
      x > 10,
      k' = x
    }
  }
  // use holes
  val oper_app_dot4 = S.filter(_ => true)

  val f = S.mapBy(x => x + 1)

  val set_difference = S.exclude(Set(3, 4))

  // call the operator of one argument
  val one = List(1, 2).head()

  // Data structures
  val test_tuple = (1, 2, 3)
  val test_tuple2 = Tup(1, 2, 3)
  val test_pair = 4 -> 5
  val test_list = [1, 2, 3]
  val test_list2 = List(1, 2, 3)
  val test_list_nth = [2, 3, 4][2]
  val test_record = { name: "igor", year: 1981 }
  val test_record2 = Rec("name", "igor", "year", 1981)
  val test_record3 = { name: "quint", year: 2023, ...test_record }
  val test_set = Set(1, 2, 3)

  // access a record via dot
  val rec_field =
    val my_rec = { a: 1, b: "foo" }
    my_rec.a

  val tup_elem =
    val my_tup = Tup("a", 3)
    my_tup._2

  def isEmpty(s) = s == []

  // Bultin set operators
  val in_2_empty = 2.in(Set())
  val subseteq_empty = Set().subseteq(Set())
  val powersets = Set(1).in(powerset(Set(1,2,3)))

  // Builting list operators
  val lists = Set(1, 2).allListsUpTo(3)

  // a named assumption
  assume positive = N > 0
  // an anonymous assumption
  assume _ = N != 0

  // Imports
  import M1.foo
  import M2.*

  // Typedefs
  type INT_SET = Set[int]

  type UNINTERPRETED_TYPE

  var S1: INT_SET

  // Instances

  // create an instance of Proto by associating constants and variables
  // import Proto(N = N, x = x) as Inst1

  // variables are not supported yet, define only constants for now:
  import Proto(N = N) as Inst1

  // create an instance of Proto by using '*'
  // import Proto(*) as Inst2
}
