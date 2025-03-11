import { QuintDef } from '@informalsystems/quint'

/**
 * Return a regular expression that accepts the qualifiers and name of a Quint definition.
 *
 * The regular expression recognizes two capture groups:
 *   - the first capture group matches the qualifiers,
 *   - the second capture group matches the declaration's name.
 */
export function getDeclRegExp(decl: QuintDef): RegExp {
  switch (decl.kind) {
    case 'const':
    case 'var':
    case 'assume':
      return RegExp(`(${decl.kind})\\s+(${decl.name})`)
    case 'typedef':
      return RegExp(`(type)\\s+(${decl.name})`)
    case 'def':
      switch (decl.qualifier) {
        case 'def':
        case 'val':
        case 'nondet':
        case 'action':
        case 'run':
        case 'temporal':
          return RegExp(`(${decl.qualifier})\\s+(${decl.name})`)
        case 'pureval':
          return RegExp(`(pure\\s+val)\\s+(${decl.name})`)
        case 'puredef':
          return RegExp(`(pure\\s+def)\\s+(${decl.name})`)
      }
  }
}
