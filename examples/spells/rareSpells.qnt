// -*- mode: Bluespec; -*-
/**
 * This is a collection of rare spells. When we see some of these spells
 * appearing in multiple specs, we would move them to commonSpells.
 *
 * If you use the same definition in several specifications, and you believe
 * that it could be useful for other people, consider contributing your
 * definition to the rare spells. Do not forget to add a test for your spell,
 * so the others would see how to use it.
 */
module rareSpells {

  /// The type of orderings between comparable things
  // Follows https://hackage.haskell.org/package/base-4.19.0.0/docs/Data-Ord.html#t:Ordering
  // and we think there are likely benefits to using 3 constant values rather than the more
  // common integer range in Apalache.
  type Ordering =
    | EQ
    | LT
    | GT

  /// Comparison of integers
  pure def intCompare(__a: int, __b:int): Ordering = {
    if (__a < __b)
      { LT }
    else if (__a > __b)
      { GT }
    else
      { EQ }
  }

  ///
  /// Compute the sum of the values over all entries in a map.
  ///
  /// - @param myMap a map from keys to integers
  /// - @returns the sum; when the map is empty, the sum is 0.
  pure def mapValuesSum(myMap: a -> int): int = {
    myMap.keys().fold(0, ((sum, i) => sum + myMap.get(i)))
  }

  run mapValuesSumTest = all {
    assert(Map().mapValuesSum() == 0),
    assert(2.to(5).mapBy(i => i * 2).mapValuesSum() == 28),
    assert(Map(2 -> -4, 4 -> 2).mapValuesSum() == -2),
  }

  /// Assuming `__l` is sorted according to `__cmp`, returns a list with the element `__x`
  /// insterted in order.
  ///
  /// If `__l` is not sorted, `__x` will be inserted after the first element less than
  /// or equal to it.
  ///
  /// - @param __l a sorted list
  /// - @param __x an element to be inserted
  /// - @param __cmp an operator defining an `Ordering` of the elemnts of type `a`
  /// - @returns a sorted list that includes `__x`
  pure def sortedListInsert(__l: List[a], __x: a, __cmp: (a, a) => Ordering): List[a] = {
    // We need to track whether __x has been inserted, and the accumulator for the new list
    val __init = { is_inserted: false, acc: List() }

    val __result = __l.foldl(__init, (__state, __y) =>
      if (__state.is_inserted)
        { ...__state, acc: __state.acc.append(__y) }
      else
        match __cmp(__x, __y) {
          | GT => { ...__state, acc: __state.acc.append(__y) }
          | _  => { is_inserted: true, acc: __state.acc.append(__x).append(__y)  }
        })

    if (not(__result.is_inserted))
      // If __x was not inserted, it was GT than every other element, so it goes at the end
      __result.acc.append(__x)
    else
      __result.acc
  }

  run sortedListInsertTest = all {
    assert(List().sortedListInsert(3, intCompare) == List(3)),
    assert(List(1,2,4).sortedListInsert(3, intCompare) == List(1,2,3,4)),
    assert(List(4,1,2).sortedListInsert(3, intCompare) == List(3,4,1,2)),
  }

  //// Returns a list of all elements of a set.
  //// The ordering will be arbitrary.
  ////
  //// - @param __set a set
  //// - @param __cmp an ordering over the elements of the set
  //// - @returns a sorted list of all elements of __set
  pure def toList(__set: Set[a], __cmp: (a, a) => Ordering): List[a] = {
      __set.fold(List(), (__l, __e) => __l.sortedListInsert(__e, __cmp))
  }

  //// Returns a set of the elements in the list.
  ////
  //// - @param __list a list
  //// - @returns a set of the elements in __list
  pure def toSet(__list: List[a]): Set[a] = {
      __list.foldl(Set(), (__s, __e) => __s.union(Set(__e)))
  }

  run toListAndSetTest =
  all {
      assert(Set(3, 2, 1).toList(intCompare).toSet() == Set(1, 2, 3)),
      assert(List(2,3,1).toSet() == Set(1, 2, 3)),
      assert(List(2,3,1).toSet() == List(3,2,1).toSet()),
      assert(Set(2,3,1).toList(intCompare) == Set(3,1,2).toList(intCompare)),
      assert(toList(Set(), intCompare) == List()),
      assert(toSet(List()) == Set())
  }
}
