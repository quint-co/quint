// pop nargs computable values, pass them the 'fun' function, and

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Callable, Computable, EvaluationResult } from '../runtime'
import { RuntimeValue, rv } from './runtimeValue'
import { strict as assert } from 'assert'
import { List } from 'immutable'
import { QuintError, quintErrorToString } from '../../quintError'

// push the combined computable value on the stack
export function applyFun(fun: (..._args: RuntimeValue[]) => EvaluationResult, args: Computable[]): Computable {
  // produce the new computable value
  return {
    eval: () => {
      try {
        // compute the values of the arguments at this point
        const values = args.map(a => a.eval())
        // if they are all defined, apply the function 'fun' to the arguments
        return mergeInMany(values)
          .mapLeft((errors): QuintError => ({ code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }))
          .chain(vs => fun(...vs.map(v => v as RuntimeValue)))
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'unknown error'
        console.error(`Internal error: ${msg}`)
        return left({ code: 'QNT501', message: `Internal error: ${msg}` })
      }
    },
  }
}

export function applyFold(order: 'fwd' | 'rev', args: Computable[]): Computable {
  const [iterableComp, initialComp, callableComp] = args
  return {
    eval: () => {
      const iterableResult = iterableComp.eval()
      const initialResult = initialComp.eval()

      const callable = callableComp as Callable
      assert(callable.nparams === 2)

      if (iterableResult.isLeft()) {
        return iterableResult
      }

      const iterable = Array.from(iterableResult.value as RuntimeValue as Iterable<RuntimeValue>)

      const reducer = (acc: EvaluationResult, val: RuntimeValue) => {
        if (order === 'fwd') {
          return callable.eval([acc, right(val)])
        } else {
          return callable.eval([right(val), acc])
        }
      }

      if (order === 'fwd') {
        return iterable.reduce(reducer, initialResult)
      } else {
        return iterable.reduceRight(reducer, initialResult)
      }
    },
  }
}
// Access a list via an index
export function getListElem(list: List<RuntimeValue>, idx: number): EvaluationResult {
  if (idx >= 0n && idx < list.size) {
    const elem = list.get(Number(idx))
    if (elem) {
      return right(elem)
    }
  }

  return left({ code: 'QNT510', message: `Out of bounds, nth(${idx})` })
}
// Update a list via an index
export function updateList(list: List<RuntimeValue>, idx: number, value: RuntimeValue): EvaluationResult {
  if (idx >= 0n && idx < list.size) {
    return right(rv.mkList(list.set(Number(idx), value)))
  } else {
    return left({ code: 'QNT510', message: `Out of bounds, replaceAt(..., ${idx}, ...)` })
  }
}

// slice a list
export function sliceList(list: List<RuntimeValue>, start: number, end: number) {
  return right(rv.mkList(list.slice(start, end)))
}

// translate one of the Boolean operators with short-circuiting:
//  - or  { A, ..., C }
//  - and { A, ..., C }
//  - A implies B
export function applyBoolOp(
  defaultValue: RuntimeValue,
  shortCircuit: (no: number, r: boolean) => RuntimeValue | undefined,
  args: Computable[]
): Computable {
  return {
    eval: () => {
      let result: EvaluationResult = right(defaultValue)
      // Evaluate arguments iteratively.
      // Stop as soon as shortCircuit tells us to stop.
      let no = 0
      for (const arg of args) {
        // either the argument is evaluated to a Boolean, or fails
        result = arg.eval()
        if (result.isLeft()) {
          return result
        }

        // if shortCircuit returns a value, return the value immediately
        const b = shortCircuit(no, (result.value as RuntimeValue).toBool())
        if (b) {
          return right(b)
        }
        no += 1
      }

      return result
    },
  }
}

/**
 * A generalized application of a one-argument Callable to a set-like
 * runtime value, as required by `exists`, `forall`, `map`, and `filter`.
 *
 * This method expects `compStack` to look like follows:
 *
 *  - `(top)` translated lambda, as `Callable`.
 *
 *  - `(top - 1)`: a set-like value to iterate over, as `Computable`.
 *
 * The method evaluates the Callable for each element of the iterable value
 * and either produces `none`, if evaluation failed for one of the elements,
 * or it applies `mapResultAndElems` to the pairs that consists of the Callable
 * result and the original element of the iterable value.
 * The final result is stored on the stack.
 */
export function mapLambdaThenReduce(
  reduceFunction: (_array: Array<[RuntimeValue, RuntimeValue]>) => RuntimeValue,
  args: Computable[]
): Computable {
  const [setComp, callableComp] = args
  const callable = callableComp as Callable
  // apply the lambda to a single element of the set
  const evaluateElem = (elem: RuntimeValue): Either<QuintError, [RuntimeValue, RuntimeValue]> => {
    // evaluate the predicate against the actual arguments
    const result = callable.eval([right(elem)])
    return result.map(result => [result as RuntimeValue, elem])
  }
  return applyFun(
    (iterable: Iterable<RuntimeValue>): EvaluationResult => {
      const lambdaApplicationResults = mergeInMany(Array.from(iterable).map(value => evaluateElem(value)))
      return lambdaApplicationResults
        .mapLeft((errors): QuintError => {
          return { code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }
        })
        .map(array => reduceFunction(array))
    },
    [setComp]
  )
}
