/*
 * Data structures for recording execution traces.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Maybe, none } from '@sweet-monads/maybe'
import { strict as assert } from 'assert'

import { QuintApp } from '../quintIr'
import { EvalResult } from './runtime'
import { verbosity } from './../verbosity'
import { Rng } from './../rng'

/**
 * A snapshot of how a single operator (e.g., an action) was executed.
 * In stack-based languages, this usually corresponds to a stack frame.
 * In Quint, it is simply the applied operator and the arguments.
 */
export interface ExecutionFrame {
  /**
   * The operator that was applied in this frame.
   */
  app: QuintApp
  /**
   * The actual runtime values that were used in the call.
   */
  args: EvalResult[]
  /**
   * An optional result of the execution.
   */
  result: Maybe<EvalResult>
  /**
   * The frames of the operators that were called by this operator.
   */
  subframes: ExecutionFrame[]
}

/**
 * A trace that is recorded when evaluating an action or an expression.
 * Since we are following the operator hierarchy, this trace is not just
 * a list, but it is a tree with ordered children.
 */
export interface ExecutionTree {
  /**
   * The top-level frames that were produced in an execution.
   * Normally, frames is a single-element array. However, the simulator
   * may produce multiple frames, when it executes several actions in a row.
   */
  frames: ExecutionFrame[]
}

/**
 * A listener that receives events in the course of Quint evaluation.
 * This listener may be used to collect a trace, or to record profiling data.
 */
export interface ExecutionListener {
  /**
   * This callback is called whenever a user-defined operator is called.
   *
   * @param app operator application in Quint IR
   */
  onUserOperatorCall(app: QuintApp): void

  /**
   * This callback is called whenever a user-defined operator returns
   * from its evaluation. Note that it is the runtime's obligation to
   * balance the Call and Return events.
   *
   * @param app operator application in Quint IR
   * @param args the actual arguments obtained in evaluation
   * @param result optional result of the evaluation
   */
  onUserOperatorReturn(app: QuintApp, args: EvalResult[], result: Maybe<EvalResult>): void

  /**
   * This callback is called *before* one of the arguments of `any {...}`
   * is evaluated. This is a very important call, as it introduces a
   * branching point in the execution.
   *
   * @param anyExpr the expression `any { ... }` that contains the option
   * @param position the position of the option in `anyExpr.args`
   */
  onAnyOptionCall(anyExpr: QuintApp, position: number): void

  /**
   * This callback is called *after* one of the arguments of `any {...}`
   * is evaluated. Note that it is the runtime's
   * obligation to balance the Call and Return events.
   *
   * @param anyExpr the expression `any { ... }` that contains the option
   * @param position the position of the option in `anyExpr.args`
   */
  onAnyOptionReturn(anyExpr: QuintApp, position: number): void

  /**
   * This callback is called when leaving `any { A_1, ..., A_n }`.
   * It instructs the listener to discard the top `noptions` records
   * except the one in the `choice` position.
   *
   * @param noptions the number of translated options, that is, `n`.
   * @param choice is a number between -1 and n (exclusive),
   *        where -1 means that no option was chosen (discard all).
   */
  onAnyReturn(noptions: number, choice: number): void

  /**
   * This callback is called when a new run is executed,
   * e.g., when multiple runs are executed in the simulator.
   */
  onRunCall(): void

  /**
   * This callback is called when the previous run has finished.
   *
   * @param outcome whether the run has:
   *        - failed, that is, `none()`,
   *        - finished after finding no violation, `just(mkBool(true))`,
   *        - finished after finding a violation, `just(mkBool(false))`
   * @param trace the array of produced states (each state is a record)
   */
  onRunReturn(outcome: Maybe<EvalResult>, trace: EvalResult[]): void
}

/**
 * An implementation of ExecutionListener that does nothing.
 */
export const noExecutionListener: ExecutionListener = {
  onUserOperatorCall: (_app: QuintApp) => {},
  onUserOperatorReturn: (_app: QuintApp, _args: EvalResult[], _result: Maybe<EvalResult>) => {},
  onAnyOptionCall: (_anyExpr: QuintApp, _position: number) => {},
  onAnyOptionReturn: (_anyExpr: QuintApp, _position: number) => {},
  onAnyReturn: (_noptions: number, _choice: number) => {},
  onRunCall: () => {},
  onRunReturn: (_outcome: Maybe<EvalResult>, _trace: EvalResult[]) => {},
}

// a trace recording listener
export const newTraceRecorder = (verbosityLevel: number, rng: Rng) => {
  // the bottom frame encodes the whole trace
  const bottomFrame = (): ExecutionFrame => {
    return {
      // this is just a dummy operator application
      app: { id: 0n, kind: 'app', opcode: 'Rec', args: [] },
      // we will store the sequence of states here
      args: [],
      // the result of the trace evaluation
      result: none(),
      // and here we store the subframes for the top-level actions
      subframes: [],
    }
  }

  // the best trace is stored here
  let bestTrace = bottomFrame()
  // the seed value for the best trace is stored here
  let bestTraceSeed = rng.getState()
  // whenever a run is entered, we store its seed here
  let runSeed = bestTraceSeed
  // during simulation, a trace is built here
  let frameStack: ExecutionFrame[] = [bestTrace]

  return {
    getBestTrace: (): ExecutionFrame => {
      return bestTrace
    },

    getBestTraceSeed: (): bigint => {
      return bestTraceSeed
    },

    onUserOperatorCall: (app: QuintApp) => {
      // For now, we cannot tell apart actions from other user definitions.
      // https://github.com/informalsystems/quint/issues/747
      if (verbosity.hasUserOpTracking(verbosityLevel)) {
        const newFrame = { app: app, args: [], result: none(), subframes: [] }
        if (frameStack.length > 0) {
          frameStack[frameStack.length - 1].subframes.push(newFrame)
          frameStack.push(newFrame)
        } else {
          frameStack = [newFrame]
        }
      }
    },

    onUserOperatorReturn: (app: QuintApp, args: EvalResult[], result: Maybe<EvalResult>) => {
      if (verbosity.hasUserOpTracking(verbosityLevel)) {
        const top = frameStack.pop()
        if (top) {
          // since this frame is connected via the parent frame,
          // the result will not disappear
          top.args = args
          top.result = result
        }
      }
    },

    onAnyOptionCall: (anyExpr: QuintApp, _position: number) => {
      if (verbosity.hasActionTracking(verbosityLevel)) {
        // the option has to be hidden under its own frame,
        // so it can be popped as a single frame later
        const newFrame = {
          app: anyExpr,
          args: [],
          result: none(),
          subframes: [],
        }
        if (frameStack.length > 0) {
          // add the option directly to the stack of the current expression
          // that contains `any { ... }`.
          frameStack[frameStack.length - 1].subframes.push(newFrame)
          frameStack.push(newFrame)
        } else {
          frameStack = [newFrame]
        }
      }
    },

    onAnyOptionReturn: (_anyExpr: QuintApp, _position: number) => {
      if (verbosity.hasActionTracking(verbosityLevel)) {
        frameStack.pop()
      }
    },

    onAnyReturn: (noptions: number, choice: number) => {
      if (verbosity.hasActionTracking(verbosityLevel)) {
        assert(frameStack.length > 0)
        const top = frameStack[frameStack.length - 1]
        const start = top.subframes.length - noptions
        // leave only the chosen frame as well as the older ones
        top.subframes = top.subframes.filter((_, i) => i < start || i == start + choice)
        if (choice >= 0) {
          // The top frame contains the frames of the chosen option that are
          // wrapped in anyExpr.args[position], see onAnyOptionCall.
          // Unwrap the option, as we do not need it any longer.
          const optionFrame = top.subframes.pop()
          if (optionFrame) {
            top.subframes = top.subframes.concat(optionFrame.subframes)
          }
        }
      }
    },

    onRunCall: () => {
      // reset the stack
      frameStack = [bottomFrame()]
      runSeed = rng.getState()
    },

    onRunReturn: (outcome: Maybe<EvalResult>, trace: EvalResult[]) => {
      assert(frameStack.length > 0)
      const bottom = frameStack[0]
      bottom.result = outcome
      bottom.args = trace

      let failureOrViolation = true
      if (outcome.isJust()) {
        const r = outcome.value.toQuintEx({ nextId: () => 0n })
        failureOrViolation = r.kind === 'bool' && !r.value
      }

      if (failureOrViolation) {
        if (bestTrace.args.length === 0 || bestTrace.args.length >= bottom.args.length) {
          bestTrace = bottom
          bestTraceSeed = runSeed
        }
      } else {
        if (bestTrace.args.length <= bottom.args.length) {
          bestTrace = bottom
          bestTraceSeed = runSeed
        }
      }
    },
  }
}
