// an instance of binary search
module BinSearch10 {
  import BinSearch(
    INPUT_SEQ=[ 1, 2, 3, 4, 5, 6, 8, 9, 10, 33 ],
    INPUT_KEY=7,
    INT_WIDTH=16
  ) as I from "./BinSearch"

  export I.*
}
