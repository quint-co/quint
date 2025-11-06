module builtin {
  /// The infinite set of all natural numbers.
  ///
  /// Infinite sets cannot be enumerated. Hence some operators
  /// that require iteration may be unsupported.
  pure val Nat: Set[int]

  /// The infinite set of all integers.
  ///
  /// Infinite sets cannot be enumerated. Hence some operators
  /// that require iteration may be unsupported.
  pure val Int: Set[int]

  /// The set of all booleans
  ///
  /// That is, Set(false, true)
  pure val Bool: Set[bool]

  /// `a.eq(b)` is `true` when `a` and `b` are equal values of the same type.
  ///
  /// It can be used in the infix form as `==` or as a named operator `eq`.
  pure def eq(a, b): (t, t) => bool

  /// `a.neq(b)` is `true` when `a` and `b` are not equal values of the same type.
  ///
  /// It can be used in the infix form as `!=` or as a named operator `neq`.
  pure def neq(a, b): (t, t) => bool

  /// `p.iff(q)` is `true` when `p` and `q` are equal values of the bool type.
  ///
  /// This is the logical equivalence operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(iff(true, true))
  /// assert(iff(false, false))
  /// assert(not(iff(true, false)))
  /// assert(not(iff(false, true)))
  /// ```
  pure def iff(p, q): (bool, bool) => bool

  /// `p.implies(q)` is true when `not(p) or q` is true.
  ///
  /// This is the material implication operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(true.implies(true))
  /// assert(false.implies(false))
  /// assert(not(true.implies(false)))
  /// assert(not(false.implies(true)))
  /// ```
  pure def implies(p, q): (bool, bool) => bool

  /// `not(p)` is `true` when `p` is `false`.
  ///
  /// This is the negation operator.
  pure def not(a): (bool) => bool

  /// `s.exists(p)` is true when there is an element in `s` that satisfies `p`.
  ///
  /// This is the existential quantifier.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).exists(n => n == 2))
  /// assert(not(Set(1, 2, 3).exists(n => n == 4)))
  /// ```
  pure def exists(a, p): (Set[a], (a) => bool) => bool

  /// `s.forall(p)` is true when all elements in `s` satisfy `p`.
  ///
  /// This is the universal quantifier.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).forall(n => n > 0))
  /// assert(not(Set(1, 2, 3).forall(n => n > 1)))
  /// ```
  pure def forall(a, p): (Set[a], (a) => bool) => bool

  /// `e.in(s)` is true when the element `e` is in the set `s`.
  ///
  /// This is the set membership relation.
  ///
  /// See also: `contains`
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(1.in(Set(1, 2, 3)))
  /// assert(not(4.in(Set(1, 2, 3))))
  /// ```
  pure def in(a, s): (a, Set[a]) => bool

  /// `s.contains(e)` is true when the element `e` is in the set `s`.
  ///
  /// This is the set membership relation.
  ///
  /// See also: `in`
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).contains(1))
  /// assert(not(Set(1, 2, 3).contains(4)))
  /// ```
  pure def contains(a, s): (Set[a], a) => bool

  /// `s1.union(s2)` is the set of elements that are in `s1` or in `s2`.
  ///
  /// This is the set union operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).union(Set(2, 3, 4)) == Set(1, 2, 3, 4))
  /// ```
  pure def union(s1, s2): (Set[a], Set[a]) => Set[a]

  /// `s1.intersect(s2)` is the set of elements that are in both sets `s1` and `s2`.
  ///
  /// This is the set intersection operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).intersect(Set(2, 3, 4)) == Set(2, 3))
  /// ```
  pure def intersect(s1, s2): (Set[a], Set[a]) => Set[a]

  /// `s1.exclude(s2)` is the set of elements in `s1` that are not in `s2`.
  ///
  /// This is the set difference operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).exclude(Set(2, 3, 4)) == Set(1))
  /// ```
  pure def exclude(s1, s2): (Set[a], Set[a]) => Set[a]

  /// `s1.subseteq(s2)` is true when all elements in `s1` are also in `s2`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).subseteq(Set(1, 2, 3, 4)))
  /// assert(not(Set(1, 2, 3).subseteq(Set(1, 2))))
  /// ```
  pure def subseteq(s1, s2): (Set[a], Set[a]) => bool

  /// `s.filter(p)` is the set of elements in `s` that satisfy `p`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).filter(n => n > 1) == Set(2, 3))
  /// ```
  pure def filter(s, p): (Set[a], (a) => bool) => Set[a]

  /// `s.map(f)` is the set of elements obtained by applying `f` to
  ///
  /// to each element in `s`. I.e., `{ f(x) : x \in s}`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).map(n => n > 1) == Set(false, true, true))
  /// ```
  pure def map(s, f): (Set[a], (a) => b) => Set[b]

  /// `l.fold(z, f)` reduces the elements in `s` using `f`, starting with `z`.
  ///
  /// I.e., `f(...f(f(z, x0), x1)..., xn)`.
  ///
  /// The order in which the elements are combined is unspecified, so
  /// the operator must be associative and commutative or else it has undefined behavior.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// val sum = Set(1, 2, 3, 4).fold(0, (x, y) => x + y)
  /// assert(sum == 10)
  /// val mul = Set(1, 2, 3, 4).fold(1, (x, y) => x * y)
  /// assert(mul == 24)
  /// ```
  pure def fold(s, v, f): (Set[a], b, (b, a) => b) => b

  /// `s.powerset()` is the set of all subsets of `s`,
  /// including the empty set and the set itself.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2).powerset() == Set(
  ///   Set(),
  ///   Set(1),
  ///   Set(2),
  ///   Set(1, 2)
  /// ))
  /// ```
  pure def powerset(s): (Set[a]) => Set[Set[a]]

  /// `s.flatten()` is the set of all elements in the sets in `s`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(Set(1, 2), Set(3, 4)).flatten() == Set(1, 2, 3, 4))
  /// ```
  pure def flatten(s): (Set[Set[a]]) => Set[a]

  /// `s.allLists()` is the set of all lists containing elements in `s`.
  /// This is an infinite set unless `s` is the empty set.
  ///
  /// Like other infinite sets, this is not supported in any execution/verification form.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2).allLists().contains([]))
  /// assert(Set(1, 2).allLists().contains([1, 1, 1, 1, 2, 1]))
  /// ```
  pure def allLists(s): (Set[a]) => Set[List[a]]

  /// `s.allListsUpTo(l)` is the set of all lists of elements in `s` with length <= `l`
  ///
  /// ```quint
  /// assert(Set(1, 2).allListsUpTo(1) == Set([], [1], [2]))
  /// assert(Set(1).allListsUpTo(2) == Set([], [1], [1, 1]))
  /// ```
  pure def allListsUpTo(s: Set[a], max_length: int): Set[List[a]]

  /// `s.getOnlyElement()` is, deterministically, the only element of `s`.
  /// If the size of `s` is not 1, this operator has undefined behavior.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(5).getOnlyElement() == 5)
  /// ```
  pure def getOnlyElement(s): (Set[a]) => a

  /// `s.chooseSome()` is, deterministically, one element of `s`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).chooseSome() == 1)
  /// assert(Set(1, 2, 3).filter(x => x > 2).chooseSome() == 3)
  /// ```
  pure def chooseSome(s): (Set[a]) => a

  /// `s.oneOf()` is, non-deterministically, one element of `s`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// nondet x = oneOf(Set(1, 2, 3))
  /// assert(x.in(Set(1, 2, 3)))
  /// ```
  pure def oneOf(s): (Set[a]) => a

  /// `s.isFinite()` is true when `s` is a finite set
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).isFinite())
  /// assert(!Nat.isFinite())
  /// ```
  pure def isFinite(s): (Set[a]) => bool

  /// `s.size()` is the cardinality of `s`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(Set(1, 2, 3).size() == 3)
  /// ```
  pure def size(s): (Set[a]) => int

  /// `m.get(k)` is the value for `k` in `m`.
  ///
  /// If `k` is not in `m` then the behavior is undefined.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Map(1 -> true, 2 -> false)
  /// assert(m.get(1) == true)
  /// ```
  pure def get(a, b): (a -> b, a) => b

  /// `m.keys()` is the set of keys in the map `m`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Map(1 -> true, 2 -> false)
  /// assert(m.keys() == Set(1, 2))
  /// ```
  pure def keys(a): (a -> b) => Set[a]

  /// `s.mapBy(f)` is the map from `x` to `f(x)` for each element `x` in `s`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Set(1, 2, 3).mapBy(x => x * x)
  /// assert(m == Map(1 -> 1, 2 -> 4, 3 -> 9))
  /// ```
  pure def mapBy(s, f): (Set[a], (a) => b) => a -> b

  /// `s.setToMap()` for a set of pairs `s` is the map
  /// from the first element of each pair to the second.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Set((1, true), (2, false)).setToMap()
  /// assert(m == Map(1 -> true, 2 -> false))
  /// ```
  pure def setToMap(s): (Set[(a, b)]) => (a -> b)

  /// `keys.setOfMaps(values)` is the set of all maps from `keys` to `values`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val s = Set(1, 2).setOfMaps(set(true, false))
  /// assert(s == Set(
  ///   Map(1 -> true, 2 -> true),
  ///   Map(1 -> true, 2 -> false),
  ///   Map(1 -> false, 2 -> true),
  ///   Map(1 -> false, 2 -> false),
  /// ))
  /// ```
  pure def setOfMaps(s1, s2): (Set[a], Set[b]) => Set[a -> b]

  /// `m.set(k, v)` is the map `m` but with the key `k` mapped to `v` if `k.in(keys(m))`
  ///
  /// If `k` is not a key in `m`, this operator has undefined behavior.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Map(1 -> true, 2 -> false)
  /// pure val m2 = m.set(2, true)
  /// assert(m == Map(1 -> true, 2 -> false))
  /// assert(m2 == Map(1 -> true, 2 -> true))
  /// ```
  pure def set(m, k, v): (a -> b, a, b) => a -> b

  /// `m.setBy(k, f)` is a map with the same keys as `m` but with `k` set to `f(m.get(k))`.
  ///
  /// If `k` is not present in `m`, this operator has undefined behavior.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Map(1 -> true, 2 -> false)
  /// pure val m2 = m.setBy(2, x => !x)
  /// assert(m == Map(1 -> true, 2 -> false))
  /// assert(m2 == Map(1 -> true, 2 -> true))
  /// ```
  pure def setBy(m, k, v): (a -> b, a, (b) => b) => a -> b

  /// `m.put(k, v)` is the map `m` but with the key `k` mapped to `v`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = Map(1 -> true, 2 -> false)
  /// pure val m2 = m.put(2, true)
  /// pure val m3 = m.put(3, true)
  /// assert(m == Map(1 -> true, 2 -> false))
  /// assert(m2 == Map(1 -> true, 2 -> true))
  /// assert(m3 == Map(1 -> true, 2 -> false, 3 -> true))
  /// ```
  pure def put(m, k, v): (a -> b, a, b) => a -> b

  /// `l.append(e)` is the list `l` with the element `e` appended.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).append(4) == List(1, 2, 3, 4))
  /// ```
  pure def append(l, e): (List[a], a) => List[a]

  /// `l1.concat(l2)` is the list `l1` with `l2` concatenated at the end.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).append(List(4, 5, 6)) == List(1, 2, 3, 4, 5, 6))
  /// ```
  pure def concat(l1, l2): (List[a], List[a]) => List[a]

  /// `l.head()` is the first element of `l`.
  ///
  /// If `l` is empty, the behavior is undefined.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).head() == 1)
  /// ```
  pure def head(l): (List[a]) => a

  /// `l.tail()` is the list `l` without the first element.
  ///
  /// If `l` is empty, the behavior is undefined.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).tail() == List(2, 3))
  /// ```
  pure def tail(l): (List[a]) => List[a]

  /// `l.length()` is the length of the list `l`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).length() == 3)
  /// ```
  pure def length(l): (List[a]) => int

  /// `l.nth(i)` is the `i+1`th element of the list `l`.
  ///
  /// If `i` is negative or greater than or equal to `l.length()`, the behavior is undefined.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).nth(1) == 2)
  /// ```
  pure def nth(l, i): (List[a], int) => a

  /// `l.indices()` is the set of indices of `l`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).indices() == Set(0, 1, 2))
  /// ```
  pure def indices(l): (List[a]) => Set[int]

  /// `l.replaceAt(i, e)` is the list `l` with the `i+1`th element replaced by `e`.
  ///
  /// If `i` is negative or greater than or equal to `l.length()`, the behavior is undefined.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).replaceAt(1, 4) == List(1, 4, 3))
  /// ```
  pure def replaceAt(l, i, e): (List[a], int, a) => List[a]

  /// `l.slice(i, j)` is the list of elements of `l` between indices `i` and `j`.
  ///
  /// `i` is inclusive and `j` is exclusive.
  ///
  /// The behavior is undefined when:
  ///
  /// - `i` is negative or greater than or equal to `l.length()`.
  /// - `j` is negative or greater than `l.length()`.
  /// - `i` is greater than `j`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3, 4, 5).slice(1, 3) == List(2, 3))
  /// ```
  pure def slice(l, i, j): (List[a], int, int) => List[a]

  /// `range(i, j)` is the list of integers between `i` and `j`.
  ///
  /// `i` is inclusive and `j` is exclusive.
  ///
  /// The behavior is undefined when `i` is greater than `j`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(range(1, 3) == List(1, 2))
  /// ```
  pure def range(i, j): (int, int) => List[int]

  /// `l.select(p)` is the list of elements of `l` that satisfy the predicate `p`.
  ///
  /// Preserves the order of the elements.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(List(1, 2, 3).select(x -> x % 2 == 0) == List(2))
  /// ```
  pure def select(l, p): (List[a], (a) => bool) => List[a]

  /// `l.foldl(z, f)` reduces the elements in `l` using `f`,
  /// starting with `z` from the left.
  ///
  /// I.e., `f(f(f(z, x0), x1)..., xn)`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val sum = List(1, 2, 3, 4).foldl(0, (x, y) => x + y)
  /// assert(sum == 10)
  /// pure val l = List(1, 2, 3, 4).foldl(List(), (l, e) => l.append(e))
  /// assert(l == List(1, 2, 3, 4))
  /// ```
  pure def foldl(l, z, f): (List[a], b, (b, a) => b) => b

  /// `a.iadd(b)` is the integer addition of `a` and `b`.
  ///
  /// It can be used in the infix form as `+` or as a named operator `iadd`.
  pure def iadd(a, b): (int, int) => int

  /// `a.isub(b)` is the integer subtraction of `b` from `a`.
  ///
  /// It can be used in the infix form as `-` or as a named operator `isub`.
  pure def isub(a, b): (int, int) => int

  /// `a.imul(b)` is the integer multiplication of `a` and `b`.
  ///
  /// It can be used in the infix form as `*` or as a named operator `imul`.
  pure def imul(a, b): (int, int) => int

  /// `a.idiv(b)` is the integer division of `a` by `b`.
  ///
  /// It can be used in the infix form as `/` or as a named operator `idiv`.
  pure def idiv(a, b): (int, int) => int

  /// `a.imod(b)` is the integer modulus of `a` and `b`.
  ///
  /// It can be used in the infix form as `%` or as a named operator `imod`.
  pure def imod(a, b): (int, int) => int

  /// `a.ipow(b)` is the integer exponentiation of `a` by `b`.
  ///
  /// It can be used in the infix form as `^` or as a named operator `ipow`.
  pure def ipow(a, b): (int, int) => int

  /// `a.ilt(b)` is the integer less than comparison of `a` and `b`.
  ///
  /// It can be used in the infix form as `<` or as a named operator `ilt`.
  pure def ilt(a, b): (int, int) => bool

  /// `a.igt(b)` is the integer greater than comparison of `a` and `b`.
  ///
  /// It can be used in the infix form as `>` or as a named operator `igt`.
  pure def igt(a, b): (int, int) => bool

  /// `a.ilte(b)` is the integer less than or equal to comparison of `a` and `b`.
  ///
  /// It can be used in the infix form as `<=` or as a named operator `ilte`.
  pure def ilte(a, b): (int, int) => bool

  /// `a.igte(b)` is the integer greater than or equal to comparison of `a` and `b`.
  ///
  /// It can be used in the infix form as `>=` or as a named operator `igte`.
  pure def igte(a, b): (int, int) => bool

  /// `iuminus(a)` is `-1 * a`.
  ///
  /// This is the unary minus operator
  pure def iuminus(a): (int) => int

  /// `i.to(j)` is the set of integers between `i` and `j`.
  ///
  /// `i` is inclusive and `j` is inclusive.
  ///
  /// The behavior is undefined when `i` is greater than `j`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// assert(1.to(3) == Set(1, 2, 3))
  /// ```
  pure def to(i, j): (int, int) => Set[int]

  /// `always(p)` is true when `p` is true for every transition of the system.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = x' = x + 1
  /// temporal Property = always(next(x) > x)
  /// ```
  temporal always(p): (bool) => bool

  /// `eventually(p)` is true when `p` is true for some transition of the system.
  ///
  /// `eventually(p)` is equivalent to `not(always(not(p)))`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = x' = x + 1
  /// temporal Property = eventually(x == 10)
  /// ```
  temporal eventually(a): (bool) => bool

  /// `next(a)` is the value of `a` in the next state of a transition.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = x' = x + 1
  /// temporal Property = next(x) == x + 1
  /// ```
  temporal next(a): (a) => a

  /// `orKeep(a, v)` is true when `a` is true or the values
  /// for the set of variables `v` are unchanged.
  ///
  /// `orKeep(a, v)` is equivalent to `a or v.map(x => next(x) == x)`.
  ///
  /// This is the stuttering operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next =  x' = x + 1
  /// temporal Spec = Init and always(Next.orKeep(Set(x)))
  /// ```
  temporal orKeep(a, v): (bool, a) => bool

  /// `mustChange(a, v)` is true when `a` is true and the values for the
  /// set of variables `v` are changed.
  ///
  /// `mustChange(a, v)` is equivalent to `a and v.map(x => next(x) != x)`.
  ///
  /// This is the no-stuttering operator.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = any {
  ///   x' = x + 1,
  ///   x' = x,
  /// }
  /// temporal Spec = Init and always(Next.mustChange(Set(x)))
  /// temporal Property = Spec.implies(always(next(x) > x))
  /// ```
  temporal mustChange(a, v): (bool, a) => bool

  /// `enabled(a)` is true when the action `a` is enabled in the current state.
  ///
  /// An action is enabled when all its preconditions are satisfied
  /// and it's postcontitions are satisfiable.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Under10 = all {
  ///   x < 10,
  ///   x' = x + 1,
  /// }
  /// action Over10 = all {
  ///   x >= 10,
  ///   x' = x + 1,
  /// }
  /// temporal Property = always(and {
  ///   enabled(Under10) iff x < 10,
  ///   enabled(Over10) iff x >=10,
  /// })
  /// ```
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action impossible = {
  ///   nondet i = Set().oneOf()
  ///   x' = i
  /// }
  /// temporal Property = always(not(enabled(impossible)))
  /// ```
  temporal enabled(a): (bool) => bool

  /// `weakFair(a, v)` is true when
  /// `eventually(always(a.mustChange(v).enabled())).implies(always(eventually(a.mustChange(v))))`
  /// is true.
  ///
  /// This is the weak fairness condition.
  ///
  /// The weak fairness condition can be expressed in English as (from Specifying Systems):
  ///
  /// 1. It's always the case that, if A is enabled forever, then an A step eventually occurs.
  /// 1. A is infinitely often disabled, or infinitely many A steps occur.
  /// 1. If A is eventually enabled forever, then infinitely many A steps occur.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = any {
  ///   x' = x + 1,
  ///   x' = x,
  /// }
  ///
  /// temporal Property = Next.weakFair(Set(x)).implies(eventually(x == 10))
  /// ```
  temporal weakFair(a, b): (bool, a) => bool

  /// `strongFair(a, v)` is true when
  /// `always(eventually(a.mustChange(v).enabled())).implies(always(eventually(a.mustChange(v))))`
  ///  is true.
  ///
  /// This is the strong fairness condition.
  ///
  /// The strong fairness condition can be expressed in English as (from Specifying Systems):
  ///
  /// 1. A is eventually disabled forever, or infinitely many A steps occur.
  /// 1. If A is infinitely often enabled, then infinitely many A steps occur.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action cycleTo1 = all { x == 0, x' = 1 },
  /// action cycleTo0 = all { x == 1, x' = 0 },
  /// action breakCycle = all { x == 0, x' = 2 },
  ///
  /// action Next = any {
  ///  cycleTo1,
  ///  cycleTo0,
  ///  breakCycle,
  ///  x' = x,
  /// }
  ///
  /// // Strong fairness can be used to ensure breakCycle happens
  /// temporal Property = breakCycle.strongFair(Set(x)).implies(eventually(x == 2))
  /// ```
  temporal strongFair(a, b): (bool, a) => bool

  /// `assign(n, v)` is true when the state variable named `n` has the value `v`
  /// in the next state of a transition.
  ///
  /// This operator is used to define transitions by specifying how the state variables change
  ///
  /// Can be written as `n' = v`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// // Next defines all transitions from a number to its successor.
  /// action Next = x' = x + 1
  /// ```
  action assign(n, v): (a, a) => bool

  /// `ite(c, t, e)` is `t` when `c` is true and `e` when `c` is false.
  ///
  /// Can be written as `if (c) t else e`.
  ///
  /// Can be used with actions.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// pure val m = if (1 == 2) 3 else 4
  /// assert(m == 4)
  /// ```
  ///
  /// ```quint
  /// var x: int
  /// action a = if (x == 0) x' = 3 else x' = 4
  /// run test = (x' = 0).then(a).then(assert(x == 3))
  /// ```
  action ite(c, t, e): (bool, a, a) => a

  /// `a.then(b)` is true for a step from `s1` to `s2` if there is a state `t` such that
  ///
  /// `a` is true for a step from `s1` to `t` and `b` is true for a step from `t` to `s2`.
  ///
  /// This is the action composition operator. If `a` evaluates to `false`, then
  /// `a.then(b)` reports an error. If `b` evaluates to `false` after `a`, then
  /// `a.then(b)` returns `false`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// run test = (x' = 1).then(x' = 2).then(x' = 3).then(assert(x == 3))
  /// ```
  action then(a, b): (bool, bool) => bool

  /// `a.expect(b)` is true for a step from `s1` to `s2` if
  ///
  ///  - `a` is true for a step from `s1` to `s2`, and
  ///  - `b` holds true in `s2`.
  ///
  /// If `a` evaluates to `false`, evaluation of `a.expect(b)`
  /// fails with an error message. If `b` evaluates to `false`,
  /// evaluation of `a.expect(b)` fails with an error message.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var n: int
  /// run expectConditionOkTest = (n' = 0).then(n' = 3).expect(n == 3)
  /// run expectConditionFailsTest = (n' = 0).then(n' = 3).expect(n == 4)
  /// run expectRunFailsTest = (n' = 0).then(all { n == 2, n' = 3 }).expect(n == 4)
  /// ```
  action expect(a, b): (bool, bool) => bool

  /// `n.reps(i => A(i))` or `n.reps(A)` the action `A`, `n` times.
  /// The iteration number, starting with 0, is passed as an argument of `A`.
  /// As actions are usually not parameterized by the iteration number,
  /// the most common form looks like: `n.reps(i => A)`.
  ///
  /// The semantics of this operator is as follows:
  ///
  /// - When `n <= 0`, this operator does not change the state.
  /// - When `n = 1`, `n.reps(A)` is equivalent to `A(0)`.
  /// - When `n > 1`, `n.reps(A)`, is equivalent to
  ///   `A(0).then((n - 1).reps(i => A(1 + i)))`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// run test = (x' = 0).then(3.reps(i => x' = x + 1)).then(assert(x == 3))
  /// ```
  action reps(n, A): (int, int => bool) => bool

  /// `a.fail()` evaluates to `true` if and only if action `a` evaluates to `false`.
  ///
  /// This operator is good for writing tests that expect an action to fail.
  action fail(a): (bool) => bool

  /// `assert(p)` is an action that is true when `p` is true.
  ///
  /// It does not change the state.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// run test = (x' = 0).then(3.reps(x' = x + 1)).then(assert(x == 3))
  /// ```quint
  ///
  /// ```quint
  /// var x: int
  /// action Init = x' = 0
  /// action Next = x' = x + 1
  ///
  /// run test = Init.then(all { Next, assert(x > 0) })
  /// ```
  action assert(p): (bool) => bool

  /// `q::debug(msg, value)` prints the given message and value to the console,
  /// separated by a space.
  ///
  /// It also returns the given value unchanged,
  /// so that it can be used directly within expressions.
  ///
  /// When called with a single argument as `q::debug(expr)`, it prints the
  /// expression itself as the message, followed by its value.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// var x: int
  /// >>> (x' = 0).then(3.reps(i => x' = q::debug("new x:", x + 1)))
  /// > new x: 1
  /// > new x: 2
  /// > new x: 3
  /// true
  /// ```
  ///
  /// ```quint
  /// var x: int
  /// >>> (x' = 0).then(x' = q::debug(x + 1))
  /// > x + 1: 1
  /// true
  /// ```
  pure def q::debug(msg, value): (str, a) => a

  /// `apalache::generate(n)` generates a value of type `a` while constraining
  /// all of its children collections to have at most `n` elements. This operator
  /// must be used together with `nondet`, similar to `oneOf`.
  ///
  /// ### Examples
  ///
  /// ```quint
  /// nondet S: Set({ a: int, b: Set({ c: str, d: bool }) }) = apalache::generate(4)
  /// ```
  ///
  /// In the above example, `S` has up to 4 elements, and for each `x` in `S`,
  /// `x.b` has up to 4 elements.
  pure def apalache::generate(n): (int) => a

  // /// `List(e0, ..., en)` is a list of values `e0`, ..., `en`.
  // ///
  // /// This is the list constructor.
  // ///
  // /// Can also be written as `[ a0, ..., an ]`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val l = List(1, 2, 3)
  // /// assert(l == [ 1, 2, 3 ])
  // /// ```quint
  // pure def List(a*): (a*) => List[a]

  // /// `Set(e0, ..., en)` is a set of values `e0`, ..., `en`.
  // ///
  // /// This is the set constructor.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val s = Set(1, 2, 3)
  // /// assert(s.contains(2))
  // /// ```quint
  // pure def Set(e*): (a*) => Set[a]

 // /// `Map(k0 -> v0, ..., kn -> vn)` is a map that maps `k0` to `v0`, ..., and `kn` to `vn`.
 // ///
 // /// This is the map constructor.
 // ///
 // /// ### Examples
 // ///
 // /// ```
 // /// pure val m = Map("a" -> 1, "b" -> 2)
  // /// assert(m.get("a") == 1)
  // /// ```quint
  // pure def Map((k -> v)*): ((a, b)* => a -> b

  // /// `Rec((f0, v0), ..., (fn, vn))` is a record that has fields `f0`, ..., `fn` with values `v0`, ..., `vn`.
  // ///
  // /// This is the record constructor.
  // ///
  // /// Can also be written as `{ f0: v0, ..., fn: vn }`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val r = { x: 1, y: 2 }
  // /// assert(r.x == 1)
  // /// ```quint
  // pure def Rec((f0, v0), ..., (fn, vn)): ((str, a0), ..., (str, an)) => { f0:, a0, ..., fn:, an }

  // /// `r.field(f)` is the value of the field `f` in the record `r`.
  // ///
  // /// This is the record projection operator.
  // ///
  // /// Can also be written as `r.f`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val r = { x: 1, y: 2 }
  // /// assert(r.field("x") == 1)
  // /// assert(r.y == 1)
  // /// ```quint
  // pure def field(r, f): ({ f: a | t }, str) => a

  // /// `r.fieldNames()` is the set of field names in the record `r`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val r = { x: 1, y: 2 }
  // /// assert(r.fieldNames() == Set("x", "y"))
  // /// ```quint
  // pure def fieldNames(r): ({ f0: t0, ..., fn: tn }) => Set[str]

  // /// `r.with(f, v)` is a record that is the same as `r` except that the field `f` has value `v`.
  // ///
  // /// If `f` is not a field in `r`, then this operator has undefined behavior
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val r = { x: 1, y: 2 }
  // /// assert(r.with("x", 3) == { x: 3, y: 2 })
  // /// ```quint
  // pure def with(r, f, v): ({ f0: t0 | r }, str, t0) => { f0: t0 | r }

  // /// `Tup(e0, ..., en)` is a tuple of values `e0`, ..., `en`.
  // ///
  // /// This is the tuple constructor.
  // ///
  // /// Can also be written as `(e0, ..., en)`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val t = Tup(1, 2, 3)
  // /// assert(t == (1, 2, 3))
  // /// assert(t._1 == 1)
  // /// ```quint
  // pure def Tup(e0, ..., en): (a0, ..., an) => (a0, ..., an)

  // /// `t.item(i)` is the `i`th element of the tuple `t`.
  // ///
  // /// This is the tuple projection operator.
  // ///
  // /// Can also be written as `t._i`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val t = (1, 2, 3)
  // /// assert(t.item(1) == 1)
  // /// assert(t._2 == 2)
  // /// ```quint
  // pure def item(t, i): ((a0, ..., an), int) => ai

  // /// `tuples(s0, ..., sn)` is the set of all tuples `(t0, ..., tn)` such that `ti` is in `si`.
  // ///
  // /// This is the cross product operator.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// pure val s = tuples(Set(1, 2), Set(3, 4))
  // /// assert(s == Set((1, 3), (1, 4), (2, 3), (2, 4)))
  // /// ```quint
  // pure def tuples(a*): (Set[a0], ..., Set[an]) => Set[(a0, ..., an)]

  // /// `variant("Label", expr)` is a value of type `T` when
  // ///
  // /// - `T` is a predifined sum type
  // /// - `T` has a data constructor `Label`, paired with type `E`
  // /// - `expr` has type `E`
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// type T = A(int) | B | C(str)
  // /// assert(variant("A", 42) == A(42))
  // /// assert(variant("B", Rec()) == B)
  // /// assert(variant("C", "foo") == C("foo"))
  // /// ```quint
  // ///
  // /// Note that this is an internal built-in and users should prefer the generated
  // /// data constructor matching the label of a variant. E.g., in our example above,
  // /// users should prefer the equivalent form on the right hand side of the `==`.
  // def variant(label, x): (str, E) => T

  // /// `matchVariant(expr, l1, (x1) => e1, ..., ln, (xn) => en)` is `ei`, where
  // ///
  // /// - `expr` a variant labeled with `li` of a sum type with fields `l1`, ..., `ln`,
  // ///    supporting types `t1`, ..., `tn`
  // /// - `xi : ti`
  // /// - `e1`, ... `en` are of the same type
  // /// - `ei` is `f(v)`, where `v` is the expression carried by the `expr` and `f`
  // ///    is the eliminator lambda labeled with `li`.
  // ///
  // /// for 1 <= i <= n.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// type T = A(int) | B | C(str)
  // /// val result = matchVariant(A(42), "A", (x) => x, "B", (_) => 0, "C", (_) => 1)
  // /// assert(result == 42)
  // /// assert(result == match A(42) { A(x) => x | B => 0 | C(_) => 1 })
  // /// ```quint
  // ///
  // /// Note that this is an internal built-in and users should prefer the
  // /// `match` syntax on the right hand side of the `==` above.
  // def matchVariant(expr, l1, elim1, ..., ln, elimn): (ti, str, t1 => r, ..., tn, tn => r) => r

  // /// `and(a0, ..., an)` is true when all `ai` are true.
  // ///
  // /// This is the conjunction operator.
  // ///
  // /// Can also be written as `and { a0, ..., an }`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// assert(and(1 == 1, true))
  // /// assert(not(and(1 == 1, true, false)))
  // /// ```quint
  // pure def and(a*): (bool*) => bool

  // /// `actionAll(a0, ..., an)` is true when all `ai` are true. `ai` can be actions.
  // ///
  // /// This is the conjunction operator for actions.
  // ///
  // /// Can also be written as `all { a0, ..., an }`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// var x: int
  // /// var y: int
  // /// run test = (all { x' = 0, y' = 0 })
  // ///              .then(all { x' = 1, y' = 2 })
  // ///              .then(assert(x == 1 && y == 2))
  // /// ```quint
  // pure def actionAll(a*): (bool*) => bool

  // /// `or(a0, ..., an)` is true when at least one `ai` is true.
  // ///
  // /// This is the disjunction operator.
  // ///
  // /// Can also be written as `or { a0, ..., an }`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// assert(or(1 == 1, false))
  // /// assert(not(or(1 == 2, false, false)))
  // /// ```quint
  // pure def or(a*): (bool*) => bool

  // /// `actionAny(a0, ..., an)` is true when at least one `ai` is true. `ai` can be actions.
  // ///
  // /// This is the disjunction operator for actions.
  // ///
  // /// Can also be written as `any { a0, ..., an }`.
  // ///
  // /// ### Examples
  // ///
  // /// ```quint
  // /// var x: int
  // /// run test = (x' = 0).then(any { x' = 1, x' = 2 }).then(assert(or { x == 1, x == 2 }))
  // /// ```quint
  // pure def actionAny(a*): (bool*) => bool
}
