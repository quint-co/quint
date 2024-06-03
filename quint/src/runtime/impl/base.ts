// Internal names in the compiler, which have special treatment.
// For some reason, if we replace 'q::input' with inputDefName, everything breaks.

import { Maybe, just, none } from '@sweet-monads/maybe'
import { ErrorCode, QuintError } from '../../quintError'
import { Computable, EvaluationResult, Register, kindName, mkCallable } from '../runtime'
import { ExecutionListener } from '../trace'
import { Trace } from './trace'
import { Either, right } from '@sweet-monads/either'
import { RuntimeValue, rv } from './runtimeValue'

// What kind of JS magic is that?
export const specialNames = ['q::input', 'q::runResult', 'q::nruns', 'q::nsteps', 'q::init', 'q::next', 'q::inv']

/**
 * Returns a Map containing the built-in Computable objects for the Quint language.
 * These include the callable objects for Bool, Int, and Nat.
 *
 * @returns a Map containing the built-in Computable objects.
 */
export function builtinContext() {
  return new Map<string, Computable>([
    [kindName('callable', 'Bool'), mkCallable([], mkConstComputable(rv.mkSet([rv.mkBool(false), rv.mkBool(true)])))],
    [kindName('callable', 'Int'), mkCallable([], mkConstComputable(rv.mkInfSet('Int')))],
    [kindName('callable', 'Nat'), mkCallable([], mkConstComputable(rv.mkInfSet('Nat')))],
  ])
}

/**
 * Represents the state of evaluation of Quint code.
 * All the fields are mutated by CompilerVisitor, either directly, or via calls.
 */
export interface EvaluationState {
  // The context of the evaluation, containing the Computable objects.
  context: Map<string, Computable>
  // The list of variables in the current state.
  vars: Register[]
  // The list of variables in the next state.
  nextVars: Register[]
  // The current trace of states
  trace: Trace
  // The error tracker for the evaluation to store errors on callbacks.
  errorTracker: CompilerErrorTracker
  // The execution listener that the compiled code uses to report execution info.
  listener: ExecutionListener
}

/**
 * Creates a new EvaluationState object.
 *
 * @returns a new EvaluationState object.
 */
export class CompilerErrorTracker {
  // messages that are produced during compilation
  compileErrors: QuintError[] = []
  // messages that get populated as the compiled code is executed
  runtimeErrors: QuintError[] = []

  addCompileError(reference: bigint, code: ErrorCode, message: string) {
    this.compileErrors.push({ code, message, reference })
  }

  addRuntimeError(reference: bigint | undefined, error: QuintError) {
    this.runtimeErrors.push({ ...error, reference })
  }
}

/**
 * Creates a new EvaluationState object with the initial state of the evaluation.
 *
 * @returns a new EvaluationState object
 */
export function newEvaluationState(listener: ExecutionListener): EvaluationState {
  const state: EvaluationState = {
    context: builtinContext(),
    vars: [],
    nextVars: [],
    trace: new Trace(),
    errorTracker: new CompilerErrorTracker(),
    listener: listener,
  }

  return state
}

export function toMaybe<T>(r: Either<QuintError, T>): Maybe<T> {
  if (r.isRight()) {
    return just(r.value)
  } else {
    return none()
  }
}

// make a `Computable` that always returns a given runtime value
export function mkConstComputable(value: RuntimeValue) {
  return {
    eval: () => {
      return right(value)
    },
  }
}

// make a `Computable` that always returns a given runtime value
export function mkFunComputable(fun: () => EvaluationResult) {
  return {
    eval: () => {
      return fun()
    },
  }
}
