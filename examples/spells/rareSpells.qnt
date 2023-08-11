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

  //// Returns a list of all elements of a set.
  //// The ordering will be arbitrary.
  ////
  //// - @param __set a set
  //// - @returns a list of all elements of __set
  pure def toList(__set: Set[a]): List[a] = {
      __set.fold(List(), (__l, __e) => __l.append(__e))
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
      assert(Set(3, 2, 1).toList().toSet() == Set(1, 2, 3)),
      assert(List(2,3,1).toSet() == Set(1, 2, 3)),
      assert(List(2,3,1).toSet() == List(3,2,1).toSet()),
      assert(toList(Set()) == List()),
      assert(toSet(List()) == Set())
  }
}
