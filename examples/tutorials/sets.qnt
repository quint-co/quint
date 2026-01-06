/**
 * A tutorial on sets.
 *
 * Igor Konnov, Informal Systems, 2023
 */
module sets {
  // We represent swap pairs as tuples of two strings
  type Pair = (str, str)

  // the first element of a pair
  pure def fst(pair: Pair): str = pair._1

  // the second element of a pair
  pure def snd(pair: Pair): str = pair._2

  // all available swap pairs as a set of tuples
  pure val availablePairs = Set(
    ("BTC", "USDC"), ("BTC", "USDT"), ("ETH", "USDC"), ("ETH", "USDT"),
    ("EVMOS", "USDC"), ("EVMOS", "WETH"), ("ETH", "WETH"), ("ATOM", "EVMOS"),
    ("ATOM", "JUNO"), ("ATOM", "OSMO"), ("EVMOS", "JUNO"), ("ATOM", "JUNO"),
    ("EVMOS", "OSMO")
  )

  pure val hasAtomJuno = ("ATOM", "JUNO").in(availablePairs)

  pure val hasEvmosEth = availablePairs.contains(("EVMOS", "ETH"))

  pure val hasAtom = availablePairs.exists(p => p._1 == "ATOM")

  // is SCRT missing from the pairs?
  pure val missingScrt =
    availablePairs.forall(p => p._1 != "SCRT" and p._2 != "SCRT")

  // swap pairs as two-element sets (unordered pairs)
  pure val availableUnorderedPairs =
    availablePairs.map(p => Set(p._1, p._2))

  pure val hasAtomRight = availableUnorderedPairs.exists(p => "ATOM".in(p))

  // all unordered pairs that contain ATOM at one end
  pure val atomPairs = availableUnorderedPairs.filter(p => p.contains("ATOM"))

  // the number of swap pairs
  pure val howMany = availableUnorderedPairs.size()

  // get all coins that appear in pairs
  pure def coinsInPairs(pairs: Set[Set[str]]): Set[str] = pairs.flatten()

  // all coins in our swap pairs
  pure val coins = coinsInPairs(availableUnorderedPairs)

  // an example of `someCoins` in `buyableVia1Swap`
  pure def someCoinsExample = Set("ATOM", "ETH", "USDT")

  // which coins can be bought by swapping a coin from `someCoins` once?
  pure def buyableVia1Swap(someCoins) =
    availableUnorderedPairs
      .filter(p => p.intersect(someCoins).size() == 1)
      .flatten()
      .exclude(someCoins)

  // which coins can be bought by swapping a coin from `someCoins` exactly twice?
  pure def buyableVia2Swaps(someCoins) =
    someCoins
      .buyableVia1Swap()
      .buyableVia1Swap()

  // which coins can be bought by swapping a coin from `someCoins` twice?
  pure def buyableVia1or2Swaps(someCoins) =
    buyableVia1Swap(someCoins)
      .union(buyableVia2Swaps(someCoins))

  // which coins can we buy via n swaps when starting from `someCoins`
  pure def buyableNSwaps(someCoins, n) =
    1.to(n).fold(someCoins,
                 (prevCoins, i) => buyableVia1Swap(prevCoins))

  // inSet.exists(myFun) can be expressed via `fold`, when `inSet` is finite
  pure def myExists(inSet: Set[a], pred: a => bool): bool =
    inSet.fold(false, (result, elem) => result or pred(elem))

  // inSet.forall(myFun) can be expressed via `fold`, when `inSet` is finite
  pure def myForall(inSet: Set[a], pred: a => bool): bool =
    inSet.fold(true, (result, elem) => result and pred(elem))

  // inSet.filter(myFun) can be expressed via `fold`, when `inSet` is finite
  pure def myFilter(inSet: Set[a], pred: a => bool): Set[a] =
    inSet.fold(Set(),
      (result, elem) =>
        if (pred(elem)) result.union(Set(elem)) else result)

  // inSet.map(myFun) can be expressed via `fold`, when `inSet` is finite
  pure def myMap(inSet: Set[a], mapper: a => b): Set[b] =
    inSet.fold(Set(),
      (result, elem) => result.union(Set(mapper(elem))))

  // flatten(inSet) can be expressed via `fold`, when `inSet` is finite
  pure def myFlatten(inSet: Set[Set[a]]): Set[a] =
    inSet.fold(Set(), (result, elem) => result.union(elem) )

  // all combinations of unordered pairs that have exactly 4 pairs
  pure val quads =
    availableUnorderedPairs
      .powerset()
      .filter(pairs => pairs.size() == 4)

  // Do pairs form a cycle? If they do, then for every participating coin,
  // there are exactly two pairs that have this coin in common.
  pure def isCycle(pairs: Set[Set[str]]): bool = {
    pure def appearsTwice(coin) = {
      pairs.filter(ps => coin.in(ps)).size() == 2
    }
    // for every coin that appears in `pairs`,
    // there are exactly two pairs that contain it
    coinsInPairs(pairs).forall(appearsTwice)
  }

  // all pair cycles of length 4
  pure val cycles4 = quads.filter(isCycle)


}

