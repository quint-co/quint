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
}