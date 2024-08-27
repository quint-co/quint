// -*- mode: Bluespec; -*-
/**
 * A tutorial version of binary search. The original TLA+ specification:
 *
 * https://github.com/apalache-mc/apalache/blob/main/test/tla/bin-search/BinSearch10.tla
 */
module BinSearch {
    // the input sequence
    const INPUT_SEQ: List[int]
    // the key to search for
    const INPUT_KEY: int
    // bit-width of machine integers
    const INT_WIDTH: int

    // the largest value of an unsigned integer
    val MAX_UINT = 2^INT_WIDTH
    // the largest value of a signed integer
    val MAX_INT  = 2^(INT_WIDTH - 1) - 1
    // the smallest value of a signed integer
    val MIN_INT  = -2^(INT_WIDTH - 1)

    // The low end of the search interval (inclusive).
    var low: int
    // The high end of the search interval (inclusive).
    var high: int
    // Did the algorithm terminate.
    var isTerminated: bool
    // The result when terminated.
    var returnValue: int
    // The number of executed steps.
    var nSteps: int

    // Addition over fix-width integers.
    pure def add(i, j) =
        // add two integers with unbounded arithmetic
        val res = i + j
        if (MIN_INT <= res and res <= MAX_INT)
            res
        else // wrap the result over 2^INT_WIDTH (probably redundant)
            val wrapped = res % MAX_UINT
            if (wrapped <= MAX_INT)
                wrapped    // a positive integer, return as is
            else // complement the value to represent it with an unbounded integer
              -(MAX_UINT - wrapped)

    // Initialization step (lines 2-3)
    action init = all {
        low' = 0,
        high' = length(INPUT_SEQ) - 1,
        isTerminated' = false,
        returnValue' = 0,
        nSteps' = 0,
    }

    // loop iteration
    action LoopIteration = all {
        not(isTerminated),
        low <= high,       // lines 6-14
        nSteps' = nSteps + 1,
        val mid = low.add(high.add(-low) / 2)
        val midVal = INPUT_SEQ[mid + 1]
          any {
            all {
              midVal < INPUT_KEY, // lines 9-10
              high' = high,
              low' = mid.add(1),
              returnValue' = returnValue,
              isTerminated' = isTerminated,
            },
            all {
              midVal > INPUT_KEY, // lines 11-12
              high' = mid.add(-1),
              low' = low,
              returnValue' = returnValue,
              isTerminated' = isTerminated,
            },
            all {
              midVal == INPUT_KEY, // lines 13-14
              high' = high,
              low' = low,
              returnValue' = mid,
              isTerminated' = true,
            },
          },
    }

    // loop termination
    action LoopExit = all {
        not(isTerminated),        // line 16
        low > high,
        isTerminated' = true,
        returnValue' = -(low + 1),
        low' = low,
        high' = high,
        nSteps' = nSteps,
    }

    // instead of terminating the computation, we keep variables unchanged
    action StutterOnTermination = all {
        isTerminated,
        low' = low,
        high' = high,
        returnValue' = returnValue,
        isTerminated' = isTerminated,
        nSteps' = nSteps
    }

    // Computation step (lines 5-16)
    action step = any {
        LoopIteration,
        LoopExit,
        StutterOnTermination,
    }

    pure val InputIsSorted =
    // The most straightforward way to specify sortedness
    // is to use two quantifiers,
    // but that would produce O(Len(INPUT_SEQ)^2) constraints.
    // Here, we write it a bit smarter.
    INPUT_SEQ.indices().forall( i =>
        INPUT_SEQ.indices().contains(i + 1)
          implies (INPUT_SEQ[i] <= INPUT_SEQ[i + 1])
    )

    // We can get an idea about the expected result of the search from the source:
    //
    // https://github.com/openjdk/jdk/blob/d7f31d0d53bfec627edc83ceb75fc6202891e186/src/java.base/share/classes/java/util/Arrays.java#L1662-L1698
    //
    // The property of particular interest is this one:
    //
    // "Note that this guarantees that the return value will be >= 0 if
    //  and only if the key is found."
    val ReturnValueIsCorrect =
        val MatchingIndices =
            INPUT_SEQ.indices().filter(i => INPUT_SEQ[i] == INPUT_KEY)
        if (MatchingIndices != Set())
            // Indices start with 1, whereas returnValue starts with 0
            MatchingIndices.contains(returnValue + 1)
        else
            returnValue < 0

    // What we expect from the search when it is finished (it does not hold).
    val Postcondition =
        isTerminated implies ReturnValueIsCorrect

    // What we expect from the search when it is finished.
    val PostconditionSorted =
        isTerminated implies (not(InputIsSorted) or ReturnValueIsCorrect)

    // We know the exact number of steps to show termination.
    val Termination =
        (nSteps >= INT_WIDTH) implies isTerminated

    // By showing that the interval [low, high] is contracting,
    // we can implicitly show termination too.
    // TODO: We cannot currently represent this because we have not implemented a way to
    // describe the relation between states with `next`
    temporal Progress =
       not(next(isTerminated)) implies (next(low) > low or next(high) < high)

    // Make sure that INPUT_SEQ is accessed within its bounds
    val InBounds =
      val mid = low.iadd(high.iadd(-low) / 2)
      // collect the conditions of IF-THEN-ELSE
      { not(isTerminated) implies
          ((low <= high) implies INPUT_SEQ.indices().contains(mid + 1)) }
}

// an instance of binary search
module BinSearch10 {
  import BinSearch(
    INPUT_SEQ=[ 1, 2, 3, 4, 5, 6, 8, 9, 10, 33 ],
    INPUT_KEY=7,
    INT_WIDTH=16
  ).*
}