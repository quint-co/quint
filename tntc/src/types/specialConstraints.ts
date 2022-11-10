import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { buildErrorLeaf, Error } from '../errorTree'
import { expressionToString } from '../IRprinting'
import { TntEx } from '../tntIr'
import { TntType, TntVarType } from '../tntTypes'
import { Constraint } from './base'

export function specialConstraints (opcode: string, id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  switch (opcode) {
    case 'Rec': return recordConstructorConstraints(id, args, argTypes, resultTypeVar)
    default: return right([])
  }
}

function recordConstructorConstraints (id: bigint, args: TntEx[], argTypes: TntType[], resultTypeVar: TntVarType): Either<Error, Constraint[]> {
  const constraints: Constraint[] = []
  const fields = Array.from(Array(args.length / 2).keys()).map(i => {
    const key = args[i * 2]
    const keyType = argTypes[i * 2]
    const valueType = argTypes[i * 2 + 1]

    const constraint: Constraint = { kind: 'eq', types: [keyType, { kind: 'str' }], sourceId: key.id }
    constraints.push(constraint)

    if (key.kind !== 'str') {
      return left(buildErrorLeaf(
          `Generating record constraints for ${args.map(expressionToString)}`,
          `Record field name must be a name expression but is ${key.kind}: ${expressionToString(key)}`))
    }

    return right({ fieldName: key.value, fieldType: valueType })
  })

  return mergeInMany(fields).map(fs => {
    const t2: TntType = { kind: 'rec', fields: { kind: 'row', fields: fs, other: { kind: 'empty' } } }
    const c: Constraint = { kind: 'eq', types: [t2, resultTypeVar], sourceId: args[0].id }
    constraints.push(c)
    return constraints
  })
}
