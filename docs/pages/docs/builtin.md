# Documentation for builtin

## Nat

Signature: `pure val Nat: Set[int]`

The infinite set of all natural numbers.

Infinite sets cannot be enumerated. Hence some operators
that require iteration may be unsupported.

## Int

Signature: `pure val Int: Set[int]`

The infinite set of all integers.

Infinite sets cannot be enumerated. Hence some operators
that require iteration may be unsupported.

## Bool

Signature: `pure val Bool: Set[bool]`

The set of all booleans

That is, Set(false, true)

## eq

Signature: `pure def eq: (t, t) => bool`

`a.eq(b)` is `true` when `a` and `b` are equal values of the same type.

It can be used in the infix form as `==` or as a named operator `eq`.

## neq

Signature: `pure def neq: (t, t) => bool`

`a.neq(b)` is `true` when `a` and `b` are not equal values of the same type.

It can be used in the infix form as `!=` or as a named operator `neq`.

## iff

Signature: `pure def iff: (bool, bool) => bool`

`p.iff(q)` is `true` when `p` and `q` are equal values of the bool type.

This is the logical equivalence operator.

### Examples

```quint
assert(iff(true, true))
assert(iff(false, false))
assert(not(iff(true, false)))
assert(not(iff(false, true)))
```

## implies

Signature: `pure def implies: (bool, bool) => bool`

`p.implies(q)` is true when `not(p) or q` is true.

This is the material implication operator.

### Examples

```quint
assert(true.implies(true))
assert(false.implies(false))
assert(not(true.implies(false)))
assert(not(false.implies(true)))
```

## not

Signature: `pure def not: (bool) => bool`

`not(p)` is `true` when `p` is `false`.

This is the negation opearator.

## exists

Signature: `pure def exists: (Set[a], (a) => bool) => bool`

`s.exists(p)` is true when there is an element in `s` that satisfies `p`.

This is the existential quantifier.

### Examples

```quint
assert(Set(1, 2, 3).exists(n => n == 2))
assert(not(Set(1, 2, 3).exists(n => n == 4)))
```

## forall

Signature: `pure def forall: (Set[a], (a) => bool) => bool`

`s.forall(p)` is true when all elements in `s` satisfy `p`.

This is the universal quantifier.

### Examples

```quint
assert(Set(1, 2, 3).forall(n => n > 0))
assert(not(Set(1, 2, 3).forall(n => n > 1)))
```

## in

Signature: `pure def in: (a, Set[a]) => bool`

`e.in(s)` is true when the element `e` is in the set `s`.

This is the set membership relation.

See also: `contains`

### Examples

```quint
assert(1.in(Set(1, 2, 3)))
assert(not(4.in(Set(1, 2, 3))))
```

## contains

Signature: `pure def contains: (Set[a], a) => bool`

`s.contains(e)` is true when the element `e` is in the set `s`.

This is the set membership relation.

See also: `in`

### Examples

```quint
assert(Set(1, 2, 3).contains(1))
assert(not(Set(1, 2, 3).contains(4)))
```

## union

Signature: `pure def union: (Set[a], Set[a]) => Set[a]`

`s1.union(s2)` is the set of elements that are in `s1` or in `s2`.

This is the set union operator.

### Examples

```quint
assert(Set(1, 2, 3).union(Set(2, 3, 4)) == Set(1, 2, 3, 4))
```

## intersect

Signature: `pure def intersect: (Set[a], Set[a]) => Set[a]`

`s1.intersect(s2)` is the set of elements that are in both sets `s1` and `s2`.

This is the set intersection operator.

### Examples

```quint
assert(Set(1, 2, 3).intersect(Set(2, 3, 4)) == Set(2, 3))
```

## exclude

Signature: `pure def exclude: (Set[a], Set[a]) => Set[a]`

`s1.exclude(s2)` is the set of elements in `s1` that are not in `s2`.

This is the set difference operator.

### Examples

```quint
assert(Set(1, 2, 3).exclude(Set(2, 3, 4)) == Set(1))
```

## subseteq

Signature: `pure def subseteq: (Set[a], Set[a]) => bool`

`s1.subseteq(s2)` is true when all elements in `s1` are also in `s2`.

### Examples

```quint
assert(Set(1, 2, 3).subseteq(Set(1, 2, 3, 4)))
assert(not(Set(1, 2, 3).subseteq(Set(1, 2))))
```

## filter

Signature: `pure def filter: (Set[a], (a) => bool) => Set[a]`

`s.filter(p)` is the set of elements in `s` that satisfy `p`.

### Examples

```quint
assert(Set(1, 2, 3).filter(n => n > 1) == Set(2, 3))
```

## map

Signature: `pure def map: (Set[a], (a) => b) => Set[b]`

`s.map(f)` is the set of elements obtained by applying `f` to

to each element in `s`. I.e., `{ f(x) : x \in s}`.

### Examples

```quint
assert(Set(1, 2, 3).map(n => n > 1) == Set(false, true, true))
```

## fold

Signature: `pure def fold: (Set[a], b, (b, a) => b) => b`

`l.fold(z, f)` reduces the elements in `s` using `f`, starting with `z`.

I.e., `f(...f(f(z, x0), x1)..., xn)`.

The order in which the elements are combined is unspecified, so
the operator must be associative and commutative or else it has undefined behavior.

### Examples

```quint
val sum = Set(1, 2, 3, 4).fold(0, (x, y) => x + y)
assert(sum == 10)
val mul = Set(1, 2, 3, 4).fold(1, (x, y) => x * y)
assert(mul == 24)
```

## powerset

Signature: `pure def powerset: (Set[a]) => Set[Set[a]]`

`s.powerset()` is the set of all subsets of `s`,
including the empty set and the set itself.

### Examples

```quint
assert(Set(1, 2).powerset() == Set(
  Set(),
  Set(1),
  Set(2),
  Set(1, 2)
))
```

## flatten

Signature: `pure def flatten: (Set[Set[a]]) => Set[a]`

`s.flatten()` is the set of all elements in the sets in `s`.

### Examples

```quint
assert(Set(Set(1, 2), Set(3, 4)).flatten() == Set(1, 2, 3, 4))
```

## allLists

Signature: `pure def allLists: (Set[a]) => Set[List[a]]`

`s.allLists()` is the set of all lists containing elements in `s`.
This is an infinite set unless `s` is the empty set.

Like other inifite sets, this is not supported in any execution/verification form.

### Examples

```quint
assert(Set(1, 2).allLists().contains([]))
assert(Set(1, 2).allLists().contains([1, 1, 1, 1, 2, 1]))
```

## allListsUpTo

Signature: `pure def allListsUpTo: (Set[a], int) => Set[List[a]]`

`s.allListsUpTo(l)` is the set of all lists of elements in `s` with length <= `l`

```quint
assert(Set(1, 2).allListsUpTo(1) == Set([], [1], [2]))
assert(Set(1).allListsUpTo(2) == Set([], [1], [1, 1]))
```

## getOnlyElement

Signature: `pure def getOnlyElement: (Set[a]) => a`

`s.getOnlyElement()` is, deterministically, the only element of `s`.
If the size of `s` is not 1, this operator has undefined behavior.

### Examples

```quint
assert(Set(5).getOnlyElement() == 5)
```

## chooseSome

Signature: `pure def chooseSome: (Set[a]) => a`

`s.chooseSome()` is, deterministically, one element of `s`.

### Examples

```quint
assert(Set(1, 2, 3).chooseSome() == 1)
assert(Set(1, 2, 3).filter(x => x > 2).chooseSome() == 3)
```

## oneOf

Signature: `pure def oneOf: (Set[a]) => a`

`s.oneOf()` is, non-deterministically, one element of `s`.

### Examples

```quint
nondet x = oneOf(Set(1, 2, 3))
assert(x.in(Set(1, 2, 3)))
```

## isFinite

Signature: `pure def isFinite: (Set[a]) => bool`

`s.isFinite()` is true when `s` is a finite set

### Examples

```quint
assert(Set(1, 2, 3).isFinite())
assert(!Nat.isFinite())
```

## size

Signature: `pure def size: (Set[a]) => int`

`s.size()` is the cardinality of `s`.

### Examples

```quint
assert(Set(1, 2, 3).size() == 3)
```

## get

Signature: `pure def get: ((a -> b), a) => b`

`m.get(k)` is the value for `k` in `m`.

If `k` is not in `m` then the behavior is undefined.

### Examples

```quint
pure val m = Map(1 -> true, 2 -> false)
assert(m.get(1) == true)
```

## keys

Signature: `pure def keys: ((a -> b)) => Set[a]`

`m.keys()` is the set of keys in the map `m`.

### Examples

```quint
pure val m = Map(1 -> true, 2 -> false)
assert(m.keys() == Set(1, 2))
```

## mapBy

Signature: `pure def mapBy: (Set[a], (a) => b) => (a -> b)`

`s.mapBy(f)` is the map from `x` to `f(x)` for each element `x` in `s`.

### Examples

```quint
pure val m = Set(1, 2, 3).mapBy(x => x * x)
assert(m == Map(1 -> 1, 2 -> 4, 3 -> 9))
```

## setToMap

Signature: `pure def setToMap: (Set[(a, b)]) => (a -> b)`

`s.setToMap()` for a set of pairs `s` is the map
from the first element of each pair to the second.

### Examples

```quint
pure val m = Set((1, true), (2, false)).setToMap()
assert(m == Map(1 -> true, 2 -> false))
```

## setOfMaps

Signature: `pure def setOfMaps: (Set[a], Set[b]) => Set[(a -> b)]`

`keys.setOfMaps(values)` is the set of all maps from `keys` to `values`.

### Examples

```quint
pure val s = Set(1, 2).setOfMaps(set(true, false))
assert(s == Set(
  Map(1 -> true, 2 -> true),
  Map(1 -> true, 2 -> false),
  Map(1 -> false, 2 -> true),
  Map(1 -> false, 2 -> false),
))
```

## set

Signature: `pure def set: ((a -> b), a, b) => (a -> b)`

`m.set(k, v)` is the map `m` but with the key `k` mapped to `v` if `k.in(keys(m))`

If `k` is not a key in `m`, this operator has undefined behavior.

### Examples

```quint
pure val m = Map(1 -> true, 2 -> false)
pure val m2 = m.set(2, true)
assert(m == Map(1 -> true, 2 -> false))
assert(m2 == Map(1 -> true, 2 -> true))
```

## setBy

Signature: `pure def setBy: ((a -> b), a, (b) => b) => (a -> b)`

`m.setBy(k, f)` is a map with the same keys as `m` but with `k` set to `f(m.get(k))`.

If `k` is not present in `m`, this operator has undefined behavior.

### Examples

```quint
pure val m = Map(1 -> true, 2 -> false)
pure val m2 = m.setBy(2, x => !x)
assert(m == Map(1 -> true, 2 -> false))
assert(m2 == Map(1 -> true, 2 -> true))
```

## put

Signature: `pure def put: ((a -> b), a, b) => (a -> b)`

`m.put(k, v)` is the map `m` but with the key `k` mapped to `v`.

### Examples

```quint
pure val m = Map(1 -> true, 2 -> false)
pure val m2 = m.put(2, true)
pure val m3 = m.put(3, true)
assert(m == Map(1 -> true, 2 -> false))
assert(m2 == Map(1 -> true, 2 -> true))
assert(m3 == Map(1 -> true, 2 -> false, 3 -> true))
```

## append

Signature: `pure def append: (List[a], a) => List[a]`

`l.append(e)` is the list `l` with the element `e` appended.

### Examples

```quint
assert(List(1, 2, 3).append(4) == List(1, 2, 3, 4))
```

## concat

Signature: `pure def concat: (List[a], List[a]) => List[a]`

`l1.concat(l2)` is the list `l1` with `l2` concatenated at the end.

### Examples

```quint
assert(List(1, 2, 3).append(List(4, 5, 6)) == List(1, 2, 3, 4, 5, 6))
```

## head

Signature: `pure def head: (List[a]) => a`

`l.head()` is the first element of `l`.

If `l` is empty, the behavior is undefined.

### Examples

```quint
assert(List(1, 2, 3).head() == 1)
```

## tail

Signature: `pure def tail: (List[a]) => List[a]`

`l.tail()` is the list `l` without the first element.

If `l` is empty, the behavior is undefined.

### Examples

```quint
assert(List(1, 2, 3).tail() == List(2, 3))
```

## length

Signature: `pure def length: (List[a]) => int`

`l.length()` is the length of the list `l`.

### Examples

```quint
assert(List(1, 2, 3).length() == 3)
```

## nth

Signature: `pure def nth: (List[a], int) => a`

`l.nth(i)` is the `i+1`th element of the list `l`.

If `i` is negative or greater than or equal to `l.length()`, the behavior is undefined.

### Examples

```quint
assert(List(1, 2, 3).nth(1) == 2)
```

## indices

Signature: `pure def indices: (List[a]) => Set[int]`

`l.indices()` is the set of indices of `l`.

### Examples

```quint
assert(List(1, 2, 3).indices() == Set(0, 1, 2))
```

## replaceAt

Signature: `pure def replaceAt: (List[a], int, a) => List[a]`

`l.replaceAt(i, e)` is the list `l` with the `i+1`th element replaced by `e`.

If `i` is negative or greater than or equal to `l.length()`, the behavior is undefined.

### Examples

```quint
assert(List(1, 2, 3).replaceAt(1, 4) == List(1, 4, 3))
```

## slice

Signature: `pure def slice: (List[a], int, int) => List[a]`

`l.slice(i, j)` is the list of elements of `l` between indices `i` and `j`.

`i` is inclusive and `j` is exclusive.

The behavior is undefined when:

- `i` is negative or greater than or equal to `l.length()`.
- `j` is negative or greater than `l.length()`.
- `i` is greater than `j`.

### Examples

```quint
assert(List(1, 2, 3, 4, 5).slice(1, 3) == List(2, 3))
```

## range

Signature: `pure def range: (int, int) => List[int]`

`range(i, j)` is the list of integers between `i` and `j`.

`i` is inclusive and `j` is exclusive.

The behavior is undefined when `i` is greater than `j`.

### Examples

```quint
assert(range(1, 3) == List(1, 2))
```

## select

Signature: `pure def select: (List[a], (a) => bool) => List[a]`

`l.select(p)` is the list of elements of `l` that satisfy the predicate `p`.

Preserves the order of the elements.

### Examples

```quint
assert(List(1, 2, 3).select(x -> x % 2 == 0) == List(2))
```

## foldl

Signature: `pure def foldl: (List[a], b, (b, a) => b) => b`

`l.foldl(z, f)` reduces the elements in `l` using `f`,
starting with `z` from the left.

I.e., `f(f(f(z, x0), x1)..., xn)`.

### Examples

```quint
pure val sum = List(1, 2, 3, 4).foldl(0, (x, y) => x + y)
assert(sum == 10)
pure val l = List(1, 2, 3, 4).foldl(List(), (l, e) => l.append(e))
assert(l == List(1, 2, 3, 4))
```

## iadd

Signature: `pure def iadd: (int, int) => int`

`a.iadd(b)` is the integer addition of `a` and `b`.

It can be used in the infix form as `+` or as a named operator `iadd`.

## isub

Signature: `pure def isub: (int, int) => int`

`a.isub(b)` is the integer subtraction of `b` from `a`.

It can be used in the infix form as `-` or as a named operator `isub`.

## imul

Signature: `pure def imul: (int, int) => int`

`a.imul(b)` is the integer multiplication of `a` and `b`.

It can be used in the infix form as `*` or as a named operator `imul`.

## idiv

Signature: `pure def idiv: (int, int) => int`

`a.idiv(b)` is the integer division of `a` by `b`.

It can be used in the infix form as `/` or as a named operator `idiv`.

## imod

Signature: `pure def imod: (int, int) => int`

`a.imod(b)` is the integer modulus of `a` and `b`.

It can be used in the infix form as `%` or as a named operator `imod`.

## ipow

Signature: `pure def ipow: (int, int) => int`

`a.ipow(b)` is the integer exponentiation of `a` by `b`.

It can be used in the infix form as `^` or as a named operator `ipow`.

## ilt

Signature: `pure def ilt: (int, int) => bool`

`a.ilt(b)` is the integer less than comparison of `a` and `b`.

It can be used in the infix form as `<` or as a named operator `ilt`.

## igt

Signature: `pure def igt: (int, int) => bool`

`a.igt(b)` is the integer greater than comparison of `a` and `b`.

It can be used in the infix form as `>` or as a named operator `igt`.

## ilte

Signature: `pure def ilte: (int, int) => bool`

`a.ilte(b)` is the integer less than or equal to comparison of `a` and `b`.

It can be used in the infix form as `<=` or as a named operator `ilte`.

## igte

Signature: `pure def igte: (int, int) => bool`

`a.igte(b)` is the integer greater than or equal to comparison of `a` and `b`.

It can be used in the infix form as `>=` or as a named operator `igte`.

## iuminus

Signature: `pure def iuminus: (int) => int`

`iuminus(a)` is `-1 * a`.

This is the unary minus operator

## to

Signature: `pure def to: (int, int) => Set[int]`

`i.to(j)` is the set of integers between `i` and `j`.

`i` is inclusive and `j` is inclusive.

The behavior is undefined when `i` is greater than `j`.

### Examples

```quint
assert(1.to(3) == Set(1, 2, 3))
```

## always

Signature: `temporal always: (bool) => bool`

`always(p)` is true when `p` is true for every transition of the system.

### Examples

```quint
var x: int
action Init = x' = 0
action Next = x' = x + 1
temporal Property = always(next(x) > x)
```

## eventually

Signature: `temporal eventually: (bool) => bool`

`eventually(p)` is true when `p` is true for some transition of the system.

`eventually(p)` is equivalent to `not(always(not(p)))`.

### Examples

```quint
var x: int
action Init = x' = 0
action Next = x' = x + 1
temporal Property = eventually(x == 10)
```

## next

Signature: `temporal next: (a) => a`

`next(a)` is the value of `a` in the next state of a transition.

### Examples

```quint
var x: int
action Init = x' = 0
action Next = x' = x + 1
temporal Property = next(x) == x + 1
```

## orKeep

Signature: `temporal orKeep: (bool, a) => bool`

`orKeep(a, v)` is true when `a` is true or the values
for the set of variables `v` are unchanged.

`orKeep(a, v)` is equivalent to `a or v.map(x => next(x) == x)`.

This is the stuttering operator.

### Examples

```quint
var x: int
action Init = x' = 0
action Next =  x' = x + 1
temporal Spec = Init and always(Next.orKeep(Set(x)))
```

## mustChange

Signature: `temporal mustChange: (bool, a) => bool`

`mustChange(a, v)` is true when `a` is true and the values for the
set of variables `v` are changed.

`mustChange(a, v)` is equivalent to `a and v.map(x => next(x) != x)`.

This is the no-stuttering operator.

### Examples

```quint
var x: int
action Init = x' = 0
action Next = any {
  x' = x + 1,
  x' = x,
}
temporal Spec = Init and always(Next.mustChange(Set(x)))
temporal Property = Spec.implies(always(next(x) > x))
```

## enabled

Signature: `temporal enabled: (bool) => bool`

`enabled(a)` is true when the action `a` is enabled in the current state.

An action is enabled when all its preconditions are satisfied
and it's postcontitions are satisfiable.

### Examples

```quint
var x: int
action Init = x' = 0
action Under10 = all {
  x < 10,
  x' = x + 1,
}
action Over10 = all {
  x >= 10,
  x' = x + 1,
}
temporal Property = always(and {
  enabled(Under10) iff x < 10,
  enabled(Over10) iff x >=10,
})
```

```quint
var x: int
action Init = x' = 0
action impossible = {
  nondet i = Set().oneOf()
  x' = i
}
temporal Property = always(not(enabled(impossible)))
```

## weakFair

Signature: `temporal weakFair: (bool, a) => bool`

`weakFair(a, v)` is true when
`eventually(always(a.mustChange(v).enabled())).implies(always(eventually(a.mustChange(v))))`
is true.

This is the weak fairness condition.

The weak fairness condition can be expressed in English as (from Specifying Systems):

1. It’s always the case that, if A is enabled forever, then an A step eventually occurs.
1. A is infinitely often disabled, or infinitely many A steps occur.
1. If A is eventually enabled forever, then infinitely many A steps occur.

### Examples

```quint
var x: int
action Init = x' = 0
action Next = any {
  x' = x + 1,
  x' = x,
}

temporal Property = Next.weakFair(Set(x)).implies(eventually(x == 10))
```

## strongFair

Signature: `temporal strongFair: (bool, a) => bool`

`strongFair(a, v)` is true when
`always(eventually(a.mustChange(v).enabled())).implies(always(eventually(a.mustChange(v))))`
 is true.

This is the strong fairness condition.

The strong fairness condition can be expressed in English as (from Specifying Systems):

1. A is eventually disabled forever, or infinitely many A steps occur.
1. If A is infinitely often enabled, then infinitely many A steps occur.

### Examples

```quint
var x: int
action Init = x' = 0
action cycleTo1 = all { x == 0, x' = 1 },
action cycleTo0 = all { x == 1, x' = 0 },
action breakCycle = all { x == 0, x' = 2 },

action Next = any {
 cycleTo1,
 cycleTo0,
 breakCycle,
 x' = x,
}

// Strong fairness can be used to ensure breakCycle happens
temporal Property = breakCycle.strongFair(Set(x)).implies(eventually(x == 2))
```

## assign

Signature: `action assign: (a, a) => bool`

`assign(n, v)` is true when the state variable named `n` has the value `v`
in the next state of a transition.

This operator is used to define transitions by specifying how the state variables change

Can be written as `n' = v`.

### Examples

```quint
var x: int
action Init = x' = 0
// Next defines all transitions from a number to its successor.
action Next = x' = x + 1
```

## ite

Signature: `action ite: (bool, a, a) => a`

`ite(c, t, e)` is `t` when `c` is true and `e` when `c` is false.

Can be written as `if (c) t else e`.

Can be used with actions.

### Examples

```quint
pure val m = if (1 == 2) 3 else 4
assert(m == 4)
```

```quint
var x: int
action a = if (x == 0) x' = 3 else x' = 4
run test = (x' = 0).then(a).then(assert(x == 3))
```

## then

Signature: `action then: (bool, bool) => bool`

`a.then(b)` is true for a step from `s1` to `s2` if there is a state `t` such that

`a` is true for a step from `s1` to `t` and `b` is true for a step from `t` to `s2`.

This is the action composition operator. If `a` evaluates to `false`, then
`a.then(b)` reports an error. If `b` evaluates to `false` after `a`, then
`a.then(b)` returns `false`.

### Examples

```quint
var x: int
run test = (x' = 1).then(x' = 2).then(x' = 3).then(assert(x == 3))
```

## expect

Signature: `action expect: (bool, bool) => bool`

`a.expect(b)` is true for a step from `s1` to `s2` if

 - `a` is true for a step from `s1` to `s2`, and
 - `b` holds true in `s2`.

If `a` evaluates to `false`, evaluation of `a.expect(b)`
fails with an error message. If `b` evaluates to `false`,
evaluation of `a.expect(b)` fails with an error message.

### Examples

```quint
var n: int
run expectConditionOkTest = (n' = 0).then(n' = 3).expect(n == 3)
run expectConditionFailsTest = (n' = 0).then(n' = 3).expect(n == 4)
run expectRunFailsTest = (n' = 0).then(all { n == 2, n' = 3 }).expect(n == 4)
```

## reps

Signature: `action reps: (int, (int) => bool) => bool`

`n.reps(i => A(i))` or `n.reps(A)` the action `A`, `n` times.
The iteration number, starting with 0, is passed as an argument of `A`.
As actions are usually not parameterized by the iteration number,
the most common form looks like: `n.reps(i => A)`.

The semantics of this operator is as follows:

- When `n <= 0`, this operator does not change the state.
- When `n = 1`, `n.reps(A)` is equivalent to `A(0)`.
- When `n > 1`, `n.reps(A)`, is equivalent to
  `A(0).then((n - 1).reps(i => A(1 + i)))`.

### Examples

```quint
var x: int
run test = (x' = 0).then(3.reps(i => x' = x + 1)).then(assert(x == 3))
```

## fail

Signature: `action fail: (bool) => bool`

`a.fail()` evaluates to `true` if and only if action `a` evaluates to `false`.

This operator is good for writing tests that expect an action to fail.

## assert

Signature: `action assert: (bool) => bool`

`assert(p)` is an action that is true when `p` is true.

It does not change the state.

### Examples

```quint
var x: int
run test = (x' = 0).then(3.reps(x' = x + 1)).then(assert(x == 3))
```quint

```quint
var x: int
action Init = x' = 0
action Next = x' = x + 1

run test = Init.then(all { Next, assert(x > 0) })
```

## q::debug

Signature: `pure def q::debug: (str, a) => a`

`q::debug(msg, value)` prints the given message and value to the console,
separated by a space.

It also returns the given value unchanged,
so that it can be used directly within expressions.

### Examples

```quint
var x: int
>>> (x' = 0).then(3.reps(i => x' = q::debug("new x:", x + 1)))
> new x: 1
> new x: 2
> new x: 3
true
```
