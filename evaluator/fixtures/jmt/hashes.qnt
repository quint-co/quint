// -*- mode: Bluespec; -*-

/// A symbolic specification of a string that is suitable for reasoning about
/// strings and hashes (such as SHA256). The exact hash function is irrelevant.
/// The only assumption is that a hash is irreversible.
///
/// Similar to symbolic reasoning by Dolev and Yao, we would like to represent:
///  - a raw sequence of bytes, e.g., [ 1, 2, 3 ],
///  - a hashed sequence, e.g., h([ 1, 2, 3 ]),
///  - a concatenation of a raw sequence and a hash (in any order),
///    e.g., [ 1, 2 ] + h([ 3, 4 ])],
///  - nested hashes, e.g., h([ 1, 2 ] + h([ 3, 4 ])).
///
/// So the idea is basically to represent words as terms, where the atoms are
/// sequences of integers, and terms are constructed as n-ary applications
/// of the symbol "h", which means "hash". Since Quint enforces strict typing
/// and it does not allow for inductive/recursive algebraic data types,
/// we represent terms as maps that encode trees. For instance,
/// the term h([ 1, 2 ] + h([ 3, 4 ])) + [ 5, 6 ] corresponds to the tree:
///
///           *
///         /   \
///       Hash  [ 5, 6 ]
///      /    \
/// [ 1, 2 ]   Hash
///           /
///      [ 3, 4 ]
///
/// The above tree is represented as a map in Quint. Each key corresponds to a path in the tree; for example, the first root's child is [ 0 ], the second root's child is [ 1 ], the first child of [ 0 ] is [ 0, 0], etc.
///
/// Map([ 0 ] -> Hash,
///     [ 0, 0 ] -> Raw([1, 2]),
///     [ 0, 1 ] -> Hash,
///     [ 0, 1, 0 ] -> Raw([ 3, 4 ]),
///     [ 1 ] -> Raw[ 5, 6 ])
///
/// Igor Konnov, Informal Systems, 2022-2023
/// Josef Widder, Informal Systems, 2024
/// Aleksandar Ignjatijevic, Informal Systems, 2024

module hashes {
  import basicSpells.* from "./spells/basicSpells"
  /// A sequence of bytes is simply a list of integers
  type Bytes = List[int]
  val Hash256_ZERO = raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  /// compare two lists of integers (e.g., bytes) lexicographically
  pure def less_than(w1: Bytes, w2: Bytes): bool = {
    pure val len1 = length(w1)
    pure val len2 = length(w2)
    or {
      len1 < len2 and indices(w1).forall(i => w1[i] <= w2[i]),
      and {
        len1 == len2,
        indices(w1).exists(i => and {
          w1[i] < w2[i],
          indices(w1).forall(j => j < i implies w1[j] == w2[j])
        })
      }
    }
  }
  pure def greater_than(w1: Bytes, w2: Bytes): bool = {
    pure val len1 = length(w1)
    pure val len2 = length(w2)
    or {
      len1 > len2 and indices(w1).forall(i => w1[i] <= w2[i]),
      and {
        len1 == len2,
        indices(w1).exists(i => and {
          w1[i] > w2[i],
          indices(w1).forall(j => j < i implies w1[j] == w2[j])
        })
      }
    }
  }
  /// Returns true iff `w` is the nil value.
  /// In our spec, nil is equivalent to the empty list.
  pure def isNil(w: Bytes): bool = {
    w == []
  }

  /// A tree node that represents a fragment of a term
  type TERM_NODE = Hash | Raw(Bytes)

  /// A word is a map from a path to the term node.
  /// The first root's child is [ 0 ], the second root's child is [ 1 ],
  /// the first child of [ 0 ] is [ 0, 0], etc.
  type Term = Bytes -> TERM_NODE

  /// Compute term length in bytes,
  /// assuming that a hash occupies 32 bytes (as SHA256 does)
  pure def termLen(term: Term): int = {
    // the roots' children
    pure val top =
      keys(term).filter(p => length(p) == 1).map(p => term.get(p))
    top.fold(0, (s, t) => match(t) {
      | Hash => s + 32
      | Raw(bytes) => s + length(bytes)
    })
  }

  /// Construct the term that encodes a raw sequence of bytes
  pure def raw(bytes: Bytes): Term = {
    Map([ 0 ] -> Raw(bytes))
  }

  /// Is the term representing a raw term?
  pure def isRaw(term: Term): bool = {
    size(keys(term)) == 1 and term.get([0]) != Hash
  }

  /// Hash a term
  pure def termHash(term: Term): Term = {
    // add Hash on top, which has the key [ 0 ], and attach term to it
    pure val paths = Set([ 0 ]).union(keys(term).map(p => [ 0 ].concat(p)))
    paths.mapBy(p =>
      if (p == [ 0 ]) {
        Hash
      } else {
        term.get(p.slice(1, length(p)))
      }
    )
  }

  /// Concatenate two terms. Special attention is paid to the case when the
  /// both terms are raw sequences, which requires them to be merged.
  pure def termConcat(left: Term, right: Term): Term = {
    pure val l = if (isRaw(left)) left.get([0]) else Hash
    pure val r = if (isRaw(right)) right.get([0]) else Hash

    pure def mergeTerms(left: Term, right: Term): Term = {
      // Merge the arguments as trees representing terms.
      // The number of root's children in the left term:
      pure val lwidth = size(keys(left).filter(p => length(p) == 1))
      // the paths of the right term shifted to the right by lwidth
      pure val rshifted =
        keys(right).map(p => [ lwidth + p[0] ].concat(p.slice(1, length(p))))
      // the paths of the concatenation
      pure val paths = keys(left).union(rshifted)
      // the resulting term as a map
      paths.mapBy(p =>
        if (p[0] < lwidth) {
          left.get(p)
        } else {
          right.get( [ p[0] - lwidth ].concat(p.slice(1, length(p))))
        }
      )
    }

    match(l) {
      | Raw(lBytes) => match(r) {
        | Raw(rBytes) =>
          // both arguments are raw sequences, produce a single raw sequence
          raw(lBytes.concat(rBytes))
        | Hash => if (lBytes == []) right else mergeTerms(left, right)
      }
      | Hash => match(r) {
        | Raw(rBytes) => if (rBytes == []) left else mergeTerms(left, right)
        | Hash => mergeTerms(left, right)
      }
    }
  }

  /// Slice a raw sequence represented by a term.
  /// Non-raw sequences are returned unmodified.
  pure def termSlice(term: Term, start: int, end: int): Term = {
    if (size(keys(term)) != 1) 
      term
    else 
      pure val first = term.get([ 0 ])
      match first {
        | Raw(bytes) => raw(bytes.slice(start, end))
        | _ => term
    }
  }
}

