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
 * Reviver function for JSON.parse to ensure proper type conversions during deserialization.
 *
 * A "reviver" is the standard JavaScript term for the optional second parameter to JSON.parse(),
 * which is called for each key-value pair during parsing, allowing transformation of values.
 *
 * This reviver ensures that:
 * - QuintError.reference fields are converted from numbers to bigint
 *
 * @param key - The property key being parsed
 * @param value - The parsed value
 * @returns The potentially transformed value
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter
 */
export function reviver(key: string, value: any): any {
  // Convert QuintError.reference from number to bigint
  if (key === 'reference' && value !== null && value !== undefined) {
    return BigInt(value)
  }
  return value
}
