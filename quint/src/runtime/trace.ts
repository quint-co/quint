/*
 * Data structures for recording execution traces.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Maybe, just, none } from '@sweet-monads/maybe'
import { strict as assert } from 'assert'

import { QuintApp } from '../internal_representation/quintIr'
import { EvalResult } from './runtime'
import { verbosity } from './../verbosity'
import { Rng } from './../rng'
import { rv } from './impl/runtimeValue'

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

/**
 * The interface of a trace recorder that records the best trace.
 */
export interface TraceRecorder extends ExecutionListener {
  /**
   * The verbosity level used by the recorder (mutable).
   */
  verbosityLevel: number
  /**
   * The random number generator used by the recorder (mutable).
   */
  rng: Rng

  /**
   * Clear the recorded trace
   */
  clear: () => void

  /**
   * Get the best recorded trace.
   * @returns the best recorded trace.
   */
  getBestTrace: () => ExecutionFrame

  /**
   * Get the seed of the best recorded trace.
   * @returns the seed that was used to generate the best trace.
   */
  getBestTraceSeed: () => bigint
}

// a trace recording listener
export const newTraceRecorder = (verbosityLevel: number, rng: Rng): TraceRecorder => {
  return new TraceRecorderImpl(verbosityLevel, rng)
}

// a private implementation of a trace recorder
class TraceRecorderImpl implements TraceRecorder {
  verbosityLevel: number
  rng: Rng
  // the best trace is stored here
  private bestTrace: ExecutionFrame
  // the seed value for the best trace is stored here
  private bestTraceSeed: bigint
  // whenever a run is entered, we store its seed here
  private runSeed: bigint
  // during simulation, a trace is built here
  private frameStack: ExecutionFrame[]

  constructor(verbosityLevel: number, rng: Rng) {
    this.verbosityLevel = verbosityLevel
    this.rng = rng
    const bottom = this.newBottomFrame()
    this.bestTrace = bottom
    this.bestTraceSeed = rng.getState()
    this.runSeed = this.bestTraceSeed
    this.frameStack = [bottom]
  }

  clear() {
    const bottom = this.newBottomFrame()
    this.bestTrace = bottom
    this.frameStack = [bottom]
  }

  getBestTrace(): ExecutionFrame {
    return this.bestTrace
  }

  getBestTraceSeed(): bigint {
    return this.bestTraceSeed
  }

  onUserOperatorCall(app: QuintApp) {
    // For now, we cannot tell apart actions from other user definitions.
    // https://github.com/informalsystems/quint/issues/747
    if (verbosity.hasUserOpTracking(this.verbosityLevel)) {
      const newFrame = { app: app, args: [], result: none(), subframes: [] }
      if (this.frameStack.length > 0) {
        this.frameStack[this.frameStack.length - 1].subframes.push(newFrame)
        this.frameStack.push(newFrame)
      } else {
        this.frameStack = [newFrame]
      }
    }
  }

  onUserOperatorReturn(app: QuintApp, args: EvalResult[], result: Maybe<EvalResult>) {
    if (verbosity.hasUserOpTracking(this.verbosityLevel)) {
      const top = this.frameStack.pop()
      if (top) {
        // since this frame is connected via the parent frame,
        // the result will not disappear
        top.args = args
        top.result = result
      }
    }
  }

  onAnyOptionCall(anyExpr: QuintApp, _position: number) {
    if (verbosity.hasActionTracking(this.verbosityLevel)) {
      // the option has to be hidden under its own frame,
      // so it can be popped as a single frame later
      const newFrame = {
        app: anyExpr,
        args: [],
        result: none(),
        subframes: [],
      }
      if (this.frameStack.length > 0) {
        // add the option directly to the stack of the current expression
        // that contains `any { ... }`.
        this.frameStack[this.frameStack.length - 1].subframes.push(newFrame)
        this.frameStack.push(newFrame)
      } else {
        this.frameStack = [newFrame]
      }
    }
  }

  onAnyOptionReturn(_anyExpr: QuintApp, _position: number) {
    if (verbosity.hasActionTracking(this.verbosityLevel)) {
      this.frameStack.pop()
    }
  }

  onAnyReturn(noptions: number, choice: number) {
    if (verbosity.hasActionTracking(this.verbosityLevel)) {
      assert(this.frameStack.length > 0)
      const top = this.frameStack[this.frameStack.length - 1]
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
  }

  onRunCall() {
    // reset the stack
    this.frameStack = [this.newBottomFrame()]
    this.runSeed = this.rng.getState()
  }

  onRunReturn(outcome: Maybe<EvalResult>, trace: EvalResult[]) {
    assert(this.frameStack.length > 0)
    const bottom = this.frameStack[0]

    const fromResult = (r: Maybe<EvalResult>) => {
      if (r.isNone()) {
        return true
      } else {
        const rex = r.value.toQuintEx({ nextId: () => 0n })
        return rex.kind === 'bool' && !rex.value
      }
    }

    const notOk = fromResult(outcome)
    const prevNotOk = fromResult(this.bestTrace.result)

    // Prefer short traces for error, and longer traces for non error.
    // Therefore, override the best trace only if:
    //  - there is an error, the new trace is shorter, or the old trace is non-error;
    //  - there is no error, the new trace is longer, and there was no error before.
    const override = notOk
      ? this.bestTrace.args.length === 0 || !prevNotOk || this.bestTrace.args.length >= bottom.args.length
      : !prevNotOk && this.bestTrace.args.length <= bottom.args.length

    if (override) {
      this.bestTrace = bottom
      this.bestTraceSeed = this.runSeed
      this.bestTrace.result = outcome
      this.bestTrace.args = trace
    }
  }

  // create a bottom frame, which encodes the whole trace
  private newBottomFrame(): ExecutionFrame {
    return {
      // this is just a dummy operator application
      app: { id: 0n, kind: 'app', opcode: 'Rec', args: [] },
      // we will store the sequence of states here
      args: [],
      // the result of the trace evaluation
      result: just(rv.mkBool(true)),
      // and here we store the subframes for the top-level actions
      subframes: [],
    }
  }
}
