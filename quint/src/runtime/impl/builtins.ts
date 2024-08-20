import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { QuintError, quintErrorToString } from '../../quintError'
import { Map, is, Set, Range, List } from 'immutable'
import { evaluateExpr, evaluateUnderDefContext, isTrue } from './evaluator'
import { Context } from './Context'
import { RuntimeValue, rv } from './runtimeValue'
import { chunk } from 'lodash'
import { expressionToString } from '../../ir/IRprinting'
import { zerog } from '../../idGenerator'
import { QuintEx } from '../../ir/quintIr'

export function builtinValue(name: string): Either<QuintError, RuntimeValue> {
  switch (name) {
    case 'Bool':
      return right(rv.mkSet([rv.mkBool(false), rv.mkBool(true)]))
    case 'Int':
      return right(rv.mkInfSet('Int'))
    case 'Nat':
      return right(rv.mkInfSet('Nat'))
    default:
      return left({ code: 'QNT404', message: `Unknown builtin ${name}` })
  }
}

export const lazyOps = [
  'assign',
  'actionAny',
  'actionAll',
  'ite',
  'matchVariant',
  'oneOf',
  'and',
  'or',
  'next',
  'implies',
  'then',
]

export function lazyBuiltinLambda(ctx: Context, op: string): (args: QuintEx[]) => Either<QuintError, RuntimeValue> {
  switch (op) {
    case 'and':
      return args => {
        return args.reduce((acc: Either<QuintError, RuntimeValue>, arg: QuintEx) => {
          return acc.chain(accValue => {
            if (accValue.toBool() === true) {
              return evaluateExpr(ctx, arg)
            }
            return acc
          })
        }, right(rv.mkBool(true)))
      }
    case 'or':
      return args => {
        return args.reduce((acc: Either<QuintError, RuntimeValue>, arg: QuintEx) => {
          return acc.chain(accValue => {
            if (accValue.toBool() === false) {
              return evaluateExpr(ctx, arg)
            }
            return acc
          })
        }, right(rv.mkBool(false)))
      }

    case 'implies':
      return args => {
        return evaluateExpr(ctx, args[0]).chain(l => {
          if (!l.toBool()) {
            return right(rv.mkBool(true))
          }

          return evaluateExpr(ctx, args[1])
        })
      }

    case 'assign':
      return args => {
        const varDef = ctx.table.get(args[0].id)!
        // Eval var just to make sure it is registered in the storage
        evaluateExpr(ctx, args[0])

        return evaluateUnderDefContext(ctx, varDef, () => {
          return evaluateExpr(ctx, args[1]).map(value => {
            ctx.setNextVar(varDef.id, value)
            return rv.mkBool(true)
          })
        })
      }
    case 'actionAny':
      return args => {
        const nextVarsSnapshot = ctx.varStorage.nextVarsSnapshot()
        const evaluationResults = args.map(arg => {
          const result = evaluateExpr(ctx, arg).map(result => {
            // Save vars
            const successor = ctx.varStorage.nextVarsSnapshot()

            return result.toBool() ? [successor] : []
          })

          // Recover snapshot (regardless of success or failure)
          ctx.varStorage.nextVars = nextVarsSnapshot

          return result
        })

        const processedResults = mergeInMany(evaluationResults)
          .map(suc => suc.flat())
          .mapLeft(errors => errors[0])

        return processedResults.map(potentialSuccessors => {
          switch (potentialSuccessors.length) {
            case 0:
              return rv.mkBool(false)
            case 1:
              ctx.varStorage.nextVars = potentialSuccessors[0]
              return rv.mkBool(true)
            default:
              const choice = Number(ctx.rand(BigInt(potentialSuccessors.length)))
              ctx.varStorage.nextVars = potentialSuccessors[choice]
              return rv.mkBool(true)
          }
        })
      }
    case 'actionAll':
      return args => {
        const nextVarsSnapshot = ctx.varStorage.nextVarsSnapshot()
        for (const action of args) {
          const result = evaluateExpr(ctx, action)
          if (!isTrue(result)) {
            ctx.varStorage.nextVars = nextVarsSnapshot
            return result.map(_ => rv.mkBool(false))
          }
        }

        return right(rv.mkBool(true))
      }
    case 'ite':
      return args => {
        return evaluateExpr(ctx, args[0]).chain(condition => {
          return condition.toBool() ? evaluateExpr(ctx, args[1]) : evaluateExpr(ctx, args[2])
        })
      }

    case 'matchVariant':
      return args => {
        const matchedEx = args[0]
        return evaluateExpr(ctx, matchedEx).chain(expr => {
          const [label, value] = expr.toVariant()

          const cases = args.slice(1)

          const caseForVariant = chunk(cases, 2).find(
            ([caseLabel, _caseElim]) =>
              rv.fromQuintEx(caseLabel).toStr() === '_' || rv.fromQuintEx(caseLabel).toStr() === label
          )
          if (!caseForVariant) {
            return left({ code: 'QNT505', message: `No match for variant ${label}` })
          }

          const [_caseLabel, caseElim] = caseForVariant
          const elim = rv.fromQuintEx(caseElim).toArrow(ctx)
          return elim([value])
        })
      }

    case 'oneOf':
      return args => {
        return evaluateExpr(ctx, args[0]).chain(set => {
          const bounds = set.bounds()
          const positions: Either<QuintError, bigint[]> = mergeInMany(
            bounds.map((b): Either<QuintError, bigint> => {
              if (b.isJust()) {
                const sz = b.value

                if (sz === 0n) {
                  return left({ code: 'QNT509', message: `Applied oneOf to an empty set` })
                }
                return right(ctx.rand(sz))
              } else {
                // An infinite set, pick an integer from the range [-2^255, 2^255).
                // Note that pick on Nat uses the absolute value of the passed integer.
                // TODO: make it a configurable parameter:
                // https://github.com/informalsystems/quint/issues/279
                return right(-(2n ** 255n) + ctx.rand(2n ** 256n))
              }
            })
          ).mapLeft(errors => errors[0])

          return positions.chain(ps => set.pick(ps.values()))
        })
      }
    case 'then':
    default:
      return () => left({ code: 'QNT000', message: 'Unknown stateful op' })
  }
}

export function builtinLambda(ctx: Context, op: string): (args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  switch (op) {
    case 'Set':
      return args => right(rv.mkSet(args))
    case 'Rec':
      return args => right(rv.mkRecord(Map(chunk(args, 2).map(([k, v]) => [k.toStr(), v]))))
    case 'List':
      return args => right(rv.mkList(List(args)))
    case 'Tup':
      return args => right(rv.mkTuple(List(args)))
    case 'Map':
      return args => right(rv.mkMap(args.map(kv => kv.toTuple2())))
    case 'variant':
      return args => right(rv.mkVariant(args[0].toStr(), args[1]))
    case 'not':
      return args => right(rv.mkBool(!args[0].toBool()))
    case 'iff':
      return args => right(rv.mkBool(args[0].toBool() === args[1].toBool()))
    case 'eq':
      return args => right(rv.mkBool(args[0].equals(args[1])))
    case 'neq':
      return args => right(rv.mkBool(!args[0].equals(args[1])))
    case 'iadd':
      return args => right(rv.mkInt(args[0].toInt() + args[1].toInt()))
    case 'isub':
      return args => right(rv.mkInt(args[0].toInt() - args[1].toInt()))
    case 'imul':
      return args => right(rv.mkInt(args[0].toInt() * args[1].toInt()))
    case 'idiv':
      return args => {
        const divisor = args[1].toInt()
        if (divisor === 0n) {
          return left({ code: 'QNT503', message: `Division by zero` })
        }
        return right(rv.mkInt(args[0].toInt() / divisor))
      }
    case 'imod':
      return args => right(rv.mkInt(args[0].toInt() % args[1].toInt()))
    case 'ipow':
      return args => {
        const base = args[0].toInt()
        const exp = args[1].toInt()
        if (base === 0n && exp === 0n) {
          return left({ code: 'QNT503', message: `0^0 is undefined` })
        }
        if (exp < 0n) {
          return left({ code: 'QNT503', message: 'i^j is undefined for j < 0' })
        }

        return right(rv.mkInt(base ** exp))
      }
    case 'iuminus':
      return args => right(rv.mkInt(-args[0].toInt()))
    case 'ilt':
      return args => right(rv.mkBool(args[0].toInt() < args[1].toInt()))
    case 'ilte':
      return args => right(rv.mkBool(args[0].toInt() <= args[1].toInt()))
    case 'igt':
      return args => right(rv.mkBool(args[0].toInt() > args[1].toInt()))
    case 'igte':
      return args => right(rv.mkBool(args[0].toInt() >= args[1].toInt()))

    case 'item':
      return args => {
        // Access a tuple: tuples are 1-indexed, that is, _1, _2, etc.
        return getListElem(args[0].toList(), Number(args[1].toInt()) - 1)
      }
    case 'tuples':
      return args => right(rv.mkCrossProd(args))

    case 'range':
      return args => {
        const start = Number(args[0].toInt())
        const end = Number(args[1].toInt())
        return right(rv.mkList(List(Range(start, end).map(rv.mkInt))))
      }

    case 'nth':
      return args => getListElem(args[0].toList(), Number(args[1].toInt()))

    case 'replaceAt':
      return args => {
        const list = args[0].toList()
        const idx = Number(args[1].toInt())
        if (idx < 0 || idx >= list.size) {
          return left({ code: 'QNT510', message: `Out of bounds, replaceAt(${idx})` })
        }

        return right(rv.mkList(list.set(idx, args[2])))
      }

    case 'head':
      return args => {
        const list = args[0].toList()
        if (list.size === 0) {
          return left({ code: 'QNT505', message: `Called 'head' on an empty list` })
        }
        return right(list.first()!)
      }

    case 'tail':
      return args => {
        const list = args[0].toList()
        if (list.size === 0) {
          return left({ code: 'QNT505', message: `Called 'tail' on an empty list` })
        }
        return right(rv.mkList(list.rest()))
      }

    case 'slice':
      return args => {
        const list = args[0].toList()
        const start = Number(args[1].toInt())
        const end = Number(args[2].toInt())
        if (start < 0 || start > end || end > list.size) {
          return left({
            code: 'QNT506',
            message: `slice(..., ${start}, ${end}) applied to a list of size ${list.size}`,
          })
        }

        return right(rv.mkList(list.slice(start, end)))
      }

    case 'length':
      return args => right(rv.mkInt(args[0].toList().size))
    case 'append':
      return args => right(rv.mkList(args[0].toList().push(args[1])))
    case 'concat':
      return args => right(rv.mkList(args[0].toList().concat(args[1].toList())))
    case 'indices':
      return args => right(rv.mkInterval(0n, args[0].toList().size - 1))

    case 'field':
      return args => {
        const field = args[1].toStr()
        const result = args[0].toOrderedMap().get(field)
        return result ? right(result) : left({ code: 'QNT501', message: `Accessing a missing record field ${field}` })
      }

    case 'fieldNames':
      return args => right(rv.mkSet(args[0].toOrderedMap().keySeq().map(rv.mkStr)))

    case 'with':
      return args => {
        const record = args[0].toOrderedMap()
        const field = args[1].toStr()
        const value = args[2]

        if (!record.has(field)) {
          return left({ code: 'QNT501', message: `Called 'with' with a non-existent field ${field}` })
        }

        return right(rv.mkRecord(record.set(field, value)))
      }

    case 'powerset':
      return args => right(rv.mkPowerset(args[0]))
    case 'contains':
      return args => right(rv.mkBool(args[0].contains(args[1])))
    case 'in':
      return args => right(rv.mkBool(args[1].contains(args[0])))
    case 'subseteq':
      return args => right(rv.mkBool(args[0].isSubset(args[1])))
    case 'exclude':
      return args => right(rv.mkSet(args[0].toSet().subtract(args[1].toSet())))
    case 'union':
      return args => right(rv.mkSet(args[0].toSet().union(args[1].toSet())))
    case 'intersect':
      return args => right(rv.mkSet(args[0].toSet().intersect(args[1].toSet())))
    case 'size':
      return args => args[0].cardinality().map(rv.mkInt)
    case 'isFinite':
      // at the moment, we support only finite sets, so just return true
      return _args => right(rv.mkBool(true))

    case 'to':
      return args => right(rv.mkInterval(args[0].toInt(), args[1].toInt()))
    case 'fold':
      return args => applyFold('fwd', args[0].toSet(), args[1], args[2].toArrow(ctx))
    case 'foldl':
      return args => applyFold('fwd', args[0].toList(), args[1], args[2].toArrow(ctx))
    case 'foldr':
      return args => applyFold('rev', args[0].toList(), args[1], args[2].toArrow(ctx))

    case 'flatten':
      return args => {
        const s = args[0].toSet().map(s => s.toSet())
        return right(rv.mkSet(s.flatten(1) as Set<RuntimeValue>))
      }

    case 'get':
      return args => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        const value = map.get(key)
        return value
          ? right(value)
          : left({
              code: 'QNT507',
              message: `Called 'get' with a non-existing key. Key is ${expressionToString(
                key.toQuintEx(zerog)
              )}. Map has keys: ${map
                .toMap()
                .keySeq()
                .map(k => expressionToString(k.toQuintEx(zerog)))
                .join(', ')}`,
            })
      }

    case 'set':
      return args => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        if (!map.has(key)) {
          return left({ code: 'QNT507', message: "Called 'set' with a non-existing key" })
        }
        const value = args[2]
        return right(rv.fromMap(map.set(key, value)))
      }

    case 'put':
      return args => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        const value = args[2]
        return right(rv.fromMap(map.set(key, value)))
      }

    case 'setBy':
      return args => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        if (!map.has(key)) {
          return left({ code: 'QNT507', message: `Called 'setBy' with a non-existing key ${key}` })
        }

        const value = map.get(key)!
        const lam = args[2].toArrow(ctx)
        return lam([value]).map(v => rv.fromMap(map.set(key, v)))
      }

    case 'keys':
      return args => right(rv.mkSet(args[0].toMap().keys()))

    case 'exists':
      return args =>
        applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkBool(values.some(v => v.toBool()) === true))

    case 'forall':
      return args =>
        applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkBool(values.every(v => v.toBool()) === true))

    case 'map':
      return args => {
        return applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkSet(values))
      }

    case 'filter':
      return args => {
        const set = args[0].toSet()
        const lam = args[1].toArrow(ctx)
        const reducer = ([acc, arg]: RuntimeValue[]) =>
          lam([arg]).map(condition => (condition.toBool() === true ? rv.mkSet(acc.toSet().add(arg.normalForm())) : acc))

        return applyFold('fwd', set, rv.mkSet([]), reducer)
      }

    case 'select':
      return args => {
        const list = args[0].toList()
        const lam = args[1].toArrow(ctx)
        const reducer = ([acc, arg]: RuntimeValue[]) =>
          lam([arg]).map(condition => (condition.toBool() === true ? rv.mkList(acc.toList().push(arg)) : acc))

        return applyFold('fwd', list, rv.mkList([]), reducer)
      }

    case 'mapBy':
      return args => {
        const lambda = args[1].toArrow(ctx)
        const keys = args[0].toSet()
        const reducer = ([acc, arg]: RuntimeValue[]) =>
          lambda([arg]).map(value => rv.fromMap(acc.toMap().set(arg.normalForm(), value)))

        return applyFold('fwd', keys, rv.mkMap([]), reducer)
      }

    case 'setToMap':
      return args => {
        const set = args[0].toSet()
        return right(rv.mkMap(Map(set.map(s => s.toTuple2()))))
      }

    case 'setOfMaps':
      return args => right(rv.mkMapSet(args[0], args[1]))

    case 'fail':
      return args => right(rv.mkBool(!args[0].toBool()))
    case 'assert':
      return args => (args[0].toBool() ? right(args[0]) : left({ code: 'QNT502', message: `Assertion failed` }))
    case 'expect':
    case 'reps':

    default:
      return () => left({ code: 'QNT000', message: `Unknown builtin ${op}` })
  }
}
export function applyLambdaToSet(
  ctx: Context,
  lambda: RuntimeValue,
  set: RuntimeValue
): Either<QuintError, Set<RuntimeValue>> {
  const f = lambda.toArrow(ctx)
  const results = set.toSet().map(value => f([value]))
  const err = results.find(result => result.isLeft())
  if (err !== undefined && err.isLeft()) {
    return left(err.value)
  }

  return right(
    results.map(result => {
      if (result.isLeft()) {
        throw new Error(`Impossible, result is left: ${quintErrorToString(result.value)}`)
      }

      return result.value
    })
  )
}

function applyFold(
  order: 'fwd' | 'rev',
  iterable: Iterable<RuntimeValue>,
  initial: RuntimeValue,
  lambda: (args: RuntimeValue[]) => Either<QuintError, RuntimeValue>
): Either<QuintError, RuntimeValue> {
  const reducer = (acc: Either<QuintError, RuntimeValue>, val: RuntimeValue) => {
    return acc.chain(accValue => {
      if (order === 'fwd') {
        return lambda([accValue, val])
      } else {
        return lambda([val, accValue])
      }
    })
  }

  const array = Array.from(iterable)
  if (order === 'fwd') {
    return array.reduce(reducer, right(initial))
  } else {
    return array.reduceRight(reducer, right(initial))
  }
}

// Access a list via an index
function getListElem(list: List<RuntimeValue>, idx: number): Either<QuintError, RuntimeValue> {
  if (idx >= 0n && idx < list.size) {
    const elem = list.get(Number(idx))
    if (elem) {
      return right(elem)
    }
  }

  return left({ code: 'QNT510', message: `Out of bounds, nth(${idx})` })
}
