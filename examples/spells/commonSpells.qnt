// -*- mode: Bluespec; -*-
/**
 * This module collects definitions that are used in many specifications,
 * but they are not general enough to be the basic spells.
 */
module commonSpells {
   /// Compute the sum of the values in a set.
   ///
   /// - @param __set a set of integers
   /// - @returns the sum of the elements; when the set is empty, the sum is 0.
  pure def setSum(__set: Set[int]): int = {
    __set.fold(0, ((__sum, __i) => __sum + __i))
  }

  run setSumTest = all {
    assert(setSum(Set()) == 0),
    assert(setSum(2.to(4)) == 9),
    assert(setSum(Set(-4, 4, 5)) == 5),
  }


   /// Convert a map into a set of pairs coordinating its keys and values
   ///
   /// - @param __map a map
   /// - @returns the set of pairs coordinating the map's keys with its values
   ///
   /// ### Examples
   ///
   /// ```
   /// val accountValues: Map[str, int] = Map("a" -> 1, "b" -> 1, "c" -> "1")
   /// val sumOfValues: int = accountValues.mapToSet().fold(0, (acc, kv) => acc + kv._2)
   /// assert(sumOfValues == 3)
   /// ```
  pure def mapToSet(__map: a -> b): Set[(a, b)] = {
    __map.keys().fold(Set(), (__acc, __k) => __acc.union(Set((__k, __map.get(__k)))))
  }

  run mapToSetTest = all {
    assert(mapToSet(Map()) == Set()),
    assert(mapToSet(Map(1 -> 2, 2 -> 3)) == Set((1, 2), (2, 3))),
    assert(Map("a" -> 1, "b" -> 1, "c" -> 1).mapToSet().fold(0, (__acc, __kv) => __acc + __kv._2) == 3),
  }
}
