import { Either, left, right } from '@sweet-monads/either'
import { ErrorTree } from '../errorTree'
import { walkModule } from '../IRVisitor'
import { TntModule } from '../tntIr'
import { TntType } from '../tntTypes'
import { ConstraintGeneratorVisitor } from './constraintGenerator'

export function inferTypes (tntModule: TntModule): Either<Map<bigint, ErrorTree>, Map<bigint, TntType>> {
  const visitor = new ConstraintGeneratorVisitor()
  walkModule(visitor, tntModule)
  if (visitor.errors.size !== 0) { return left(visitor.errors) }
  // Since all top level expressions are operator definitions, and all
  // constraints are solved at those, there's no need to solve anything else
  const result = new Map<bigint, TntType>()
  visitor.expressionResults.forEach(([t, _], id) => {
    result.set(id, t)
  })
  return right(result)

  // const constraints = Array.from(visitor.expressionResults.values()).map(([_, c]) => c)
  // const constraint: Constraint = { kind: 'conjunction', constraints: constraints, sourceId: BigInt(0) }
  // const solvingResult = solveConstraint(constraint)
  // return solvingResult.map(subs => {
  //   const result = new Map<bigint, TntType>()
  //   visitor.expressionResults.forEach(([t, _], id) => {
  //     result.set(id, applySubstitution(subs, t))
  //   })
  //   return result
  // })
}
