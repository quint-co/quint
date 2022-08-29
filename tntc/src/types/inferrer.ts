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
  return right(visitor.expressionResults)
}
