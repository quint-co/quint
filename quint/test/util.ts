import { IRVisitor, walkModule } from "../src/IRVisitor"
import { QuintDef, QuintEx, QuintInstance, QuintLambda, QuintModule, QuintTypeDef } from "../src/quintIr"
import { QuintType } from "../src/quintTypes"

export function collectIds(module: QuintModule): bigint[] {
  const ids = new Set<bigint>()
  const visitor: IRVisitor = {
    exitDef: (def: QuintDef) => {
      ids.add(def.id)
    },
    exitExpr(e: QuintEx) {
      ids.add(e.id)
    },
    exitTypeDef(t: QuintTypeDef) {
      ids.add(t.id)
    },
    exitType(t: QuintType) {
      if (t.id) {
        ids.add(t.id)
      }
    },
    exitModule(m: QuintModule) {
      ids.add(m.id)
    },
    exitLambda(l: QuintLambda) {
      l.params.forEach(p => ids.add(p.id))
    },
    exitInstance(i: QuintInstance) {
      i.overrides.forEach(([n, _]) => ids.add(n.id))
    },
  }

  walkModule(visitor, module)
  return [...ids]
}
