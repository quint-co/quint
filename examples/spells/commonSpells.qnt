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
}