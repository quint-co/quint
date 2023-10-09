import { QuintError } from '../quintError'

export function undercaseTypeError(id: bigint, name: string): QuintError {
  return {
    code: 'QNT007',
    message: 'type names must start with an uppercase letter',
    reference: id,
    data: name[0].match('[a-z]')
      ? {
          fix: {
            kind: 'replace',
            original: `type ${name[0]}`,
            replacement: `type ${name[0].toUpperCase()}`,
          },
        }
      : {},
  }
}

export function tooManySpreadsError(id: bigint): QuintError {
  return {
    code: 'QNT012',
    message: '... may be used once in { ...record, <fields> ',
    reference: id,
    data: {},
  }
}

export function differentTagsError(id: bigint, tag: string, otherTag: string): QuintError {
  return {
    code: 'QNT011',
    message: `Records in disjoint union have different tag fields: ${tag} and ${otherTag}`,
    reference: id,
    data: {},
  }
}
