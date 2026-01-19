/**
 * The module `hashes` provides the standard means of hashing byte sequences in
 * Quint. A direct implementation of a hash (e.g., of SHA256) in Quint would
 * produce plenty of hard-to-solve arithmetic constraints in a Quint
 * specification. To this end, we introduce a different specification of a hash
 * that has the following important properties:
 *
 * 1. For two sequences of bytes `bs1` and `bs2`, it holds that `bs1 == bs2` if
 * and only if `hash(bs1) == hash(bs2)`. That is, our hash is perfect, it does
 * not produce any collisions.
 *
 * 2. Hashes can be nested, e.g., `hash(hash(bs1).hconcat(bs2))`. Nested hashes
 * preserve the property (1).
 *
 * 3. The operator `hlen` computes the length of byte sequences, some of
 * which may have been computed via `hash`.
 *
 * 4. Plain text byte sequences and hashes may be concatenated via `hconcat`.
 *
 * Importantly, this modeling does not guarantee that a byte sequence would look
 * exactly the same, as if it was computed via a real hash implementation.
 * We will introduce integration with actual hash implementations later.
 *
 * Igor Konnov, Informal Systems, 2023.
 */
module hashes {
  /// the length of a hashed sequence in bytes, e.g., 32 for SHA-256.
  const HASH_LEN: int

  /// A data structure that carries plain texts and hashed texts.
  /// We could simply use `List[int]`, but a designated type indicates that
  /// the user should not look inside.
  type HMessage = {
    _bytes: List[int]
  }

  /// Construct HText from plain text, that is, a list of bytes.
  ///
  /// @param bytes the input to wrap, all list elements shall be in the range
  /// of [0, 255].
  /// @returns the HMessage representation of bytes
  pure def hplain(bytes: List[int]): HMessage = {
    { _bytes: bytes }
  }

  /// Concatenate two messages, possibly hashed.
  ///
  /// @param first the first message
  /// @param second the second message
  /// @returns new message, in which `second` follows `first`.
  pure def hconcat(first: HMessage, second: HMessage): HMessage = {
    { _bytes: first._bytes.concat(second._bytes) }
  }

  /// Hash a sequence of bytes, some of which may have been hashed already.
  ///
  /// @param input the input to hash
  /// @returns the hashed sequence of bytes
  pure def hash(input: HMessage): HMessage = {
    // We simply wrap the whole sequence of bytes with two markers -1.
    // Since some parts of the input may have been hashed already, we decrease
    // the hash markers in `input._bytes` first.
    pure val decreased: List[int] = input._bytes.foldl([],
      (l, b) => l.append(if (b >= 0) b else (b - 1))
    )
    // wrap with the markers -1
    { _bytes: [-1].concat(decreased).append(-1) }
  }

  /// Compute the length of a message that may contain hashes or just plain text
  ///
  /// @param input the input to calculate the length of
  /// @returns the length of the sequence
  pure def hlen(input: HMessage): int = {
    input._bytes.foldl((0, false),
      (p, b) => {
        val (len, inHash) = p
        if (b == -1) {
          val newLen = len + if (inHash) HASH_LEN else 0 // We add the total hash length at the terminator
          (newLen, not(inHash)) // toggle the "in hash" flag
        } else {
          val newLen = len + if (inHash) 0 else 1 // if in hash, the total hash length gets added in the terminator
          (newLen, inHash)
        }
      }
    )._1
  }
}

module sha256 {
  import hashes(HASH_LEN = 32).*
}