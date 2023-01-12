import { IRVisitor, walkModule } from "./IRVisitor";
import { QuintEx, QuintModule } from "./quintIr";

export function findExpressionWithId(module: QuintModule, id: bigint): QuintEx | undefined {
  const visitor = new IRExpressionFinder(id)
  walkModule(visitor, module)
  return visitor.expression
}

export class IRExpressionFinder implements IRVisitor {
  id: bigint
  expression?: QuintEx

  constructor(id: bigint) {
    this.id = id
  }

  exitExpr(expr: QuintEx) {
    if (expr.id === this.id) {
      this.expression = expr
    }
  }
}
