import { QuintError } from './quintError'

// Preprocess troublesome types so they are represented in JSON.
//
// We need it particularly because, by default, serialization of Map and Set
// objects just produces an empty object
// (see https://stackoverflow.com/questions/46634449/json-stringify-of-object-of-map-return-empty)
//
// The approach here follows https://stackoverflow.com/a/56150320/1187277
export function replacer(_key: String, value: any): any {
  if (value instanceof Map) {
    // Represent Maps as JSON objects
    return Object.fromEntries(value)
  } else if (value instanceof Set) {
    // Represent Sets as JSON arrays
    return Array.from(value)
  } else {
    return value
  }
}

/**
 * Convert a QuintError parsed from the Rust evaluator's wire format into the
 * TS-internal shape: rename `#trace` to `trace` and convert each id to bigint.
 *
 * Rust serializes the trace field as `#trace` so it cannot collide with user
 * record fields named `trace` in the simulator output.
 */
export function reviveQuintError(err: any): QuintError {
  const { ['#trace']: trace, ...rest } = err
  if (Array.isArray(trace)) {
    return { ...rest, trace: trace.map((v: any) => BigInt(v)) }
  }
  return rest
}
