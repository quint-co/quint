import { IRVisitor, walkModule } from '../src/IRVisitor'
import {
  QuintBool,
  QuintDef,
  QuintEx,
  QuintLambda,
  QuintModule,
  QuintInstance,
  QuintInt,
  QuintStr,
  QuintTypeDef,
} from '../src/quintIr'
import { QuintType } from '../src/quintTypes'
import lodash from 'lodash'

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

/**  A wrapper around lodash zip that ensures all zipped elements are defined
 *
 * Raises `Error` if the arrays are not the same length
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return lodash.zip(a, b).map(([x, y]) => {
    if (x === undefined || y === undefined) {
      throw new Error('Illegal arguments to zepWell: array lengths unequal')
    } else {
      return [x, y]
    }
  })
}

// Type predicate that tells us when a QuintEx is a scalar with a `value`
function isScalar(v: QuintEx): v is QuintBool | QuintInt | QuintStr {
  return v.kind === 'bool' || v.kind === 'int' || v.kind === 'str'
}

/** `quinExAreEqual(a, b)` is `true` when the expressions `a` and `b` are structurally equal, modulo ids
 *
 * This tells us whether `a` and `b` represent the same expression,
 * irrespective of when or where they were constructed.
 */
export function quintExAreEqual(a: QuintEx, b: QuintEx): boolean {
  if (a.kind !== b.kind) {
    return false
  }

  // The repeated checks on `kind` are for type narrowing
  if (a.kind === 'name' && b.kind === 'name') {
    return a.name === b.name
  } else if (isScalar(a) && isScalar(b)) {
    return a.value === b.value
  } else if (a.kind === 'app' && b.kind === 'app') {
    return a.args.length === b.args.length && zip(a.args, b.args).every(([x, y]) => quintExAreEqual(x, y))
  } else if (a.kind === 'lambda' && b.kind === 'lambda') {
    return (
      a.qualifier === b.qualifier &&
      a.params.length === b.params.length &&
      zip(a.params, b.params).every(([x, y]) => x.name === y.name) &&
      quintExAreEqual(a.expr, b.expr)
    )
  } else if (a.kind === 'let' && b.kind === 'let') {
    return a.opdef.name === b.opdef.name && a.opdef.qualifier === b.opdef.qualifier && quintExAreEqual(a.expr, b.expr)
  } else {
    throw new Error(`internal error: case not handeled for quintExAreEqual over ${a.kind}`)
  }
}
