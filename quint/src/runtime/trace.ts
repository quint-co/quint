/*
 * Data structures for recording execution traces.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Maybe, just, none } from '@sweet-monads/maybe'
import { strict as assert } from 'assert'

import { QuintApp } from '../ir/quintIr'
import { EvalResult } from './runtime'
import { verbosity } from './../verbosity'
import { Rng } from './../rng'
import { rv } from './impl/runtimeValue'

/**
 * A snapshot of how a single operator (e.g., an action) was executed.
 * In stack-based languages, this usually corresponds to a stack frame.
 * In Quint, it is simply the applied operator and the arguments.
 *
 * In addition to that, we use a top-level execution frame to represent
 * the execution history:
 *
 *  - `subframes` stores the executed actions, e.g., `init` and `step`
 *  - `result` stores the result of the overall computation:
 *    just(false), just(true), or none().
 *  - `args` stores the visited states. Note that |subframes| = |args|.
 *  - `app` is a dummy operator, e.g., an empty record.
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

export interface Trace {
  frame: ExecutionFrame
  seed: bigint
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
   * This callback is called whenever an execution proceeds to the next state,
   * e.g., once A has been evaluated in A.then(B).
   * @param oldState the old state that is about to be discarded
   * @param newState the new state, from which the execution continues
   */
  onNextState(oldState: EvalResult, newState: EvalResult): void

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
  onNextState: (_oldState: EvalResult, _newState: EvalResult) => {},
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
   * The current frame that is being recorded.
   */
  currentFrame: ExecutionFrame

  /**
   * Clear the recorded trace
   */
  clear: () => void

  /**
   * The best recorded traces.
   */
  bestTraces: Trace[]
}

// a trace recording listener
export const newTraceRecorder = (verbosityLevel: number, rng: Rng, tracesToRecord: number = 1): TraceRecorder => {
  return new TraceRecorderImpl(verbosityLevel, rng, tracesToRecord)
}

// a private implementation of a trace recorder
class TraceRecorderImpl implements TraceRecorder {
  verbosityLevel: number
  rng: Rng
  currentFrame: ExecutionFrame
  // how many traces to store
  private tracesToStore: number
  // best traces are stored here with their respective seeds
  bestTraces: Trace[]
  // whenever a run is entered, we store its seed here
  private runSeed: bigint
  // During simulation, a trace is built here.
  // Similar to an execution with a stack machine,
  // every call to a user-defined operator produces its own frame.
  // Since execution frames store subframes, they effectively produce
  // a tree of calls.
  private frameStack: ExecutionFrame[]

  constructor(verbosityLevel: number, rng: Rng, tracesToStore: number) {
    this.verbosityLevel = verbosityLevel
    this.rng = rng
    const bottom = this.newBottomFrame()
    this.tracesToStore = tracesToStore
    this.bestTraces = []
    this.runSeed = this.rng.getState()
    this.currentFrame = bottom
    this.frameStack = [bottom]
  }

  clear() {
    this.bestTraces = []
    const bottom = this.newBottomFrame()
    this.currentFrame = bottom
    this.frameStack = [bottom]
  }

  onUserOperatorCall(app: QuintApp) {
    // For now, we cannot tell apart actions from other user definitions.
    // https://github.com/informalsystems/quint/issues/747
    if (verbosity.hasUserOpTracking(this.verbosityLevel)) {
      const newFrame = { app: app, args: [], result: none(), subframes: [] }
      if (this.frameStack.length == 0) {
        // this should not happen, as there is always bottomFrame,
        // but we do not throw here, as trace collection is not the primary
        // function of the simulator.
        this.frameStack = [newFrame]
      } else if (this.frameStack.length === 2 && this.frameStack[1].app.opcode === '_') {
        // A placeholder frame created from `q::input` or `then`. Modify in place.
        const frame = this.frameStack[1]
        frame.app = app
        frame.args = []
        frame.result = none()
        frame.subframes = []
      } else {
        // connect the new frame to the previous frame
        this.frameStack[this.frameStack.length - 1].subframes.push(newFrame)
        // and push the new frame to be on top of the stack
        this.frameStack.push(newFrame)
      }
    }
  }

  onUserOperatorReturn(_app: QuintApp, args: EvalResult[], result: Maybe<EvalResult>) {
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

  onNextState(_oldState: EvalResult, _newState: EvalResult) {
    // introduce a new frame that is labelled with a dummy operator
    if (verbosity.hasUserOpTracking(this.verbosityLevel)) {
      const dummy: QuintApp = { id: 0n, kind: 'app', opcode: '_', args: [] }
      const newFrame = { app: dummy, args: [], result: none(), subframes: [] }
      // forget the frames, except the bottom one, and push the new one
      this.frameStack = [this.frameStack[0], newFrame]
      // connect the new frame to the topmost frame, which effects in a new step
      this.frameStack[0].subframes.push(newFrame)
    }
  }

  onRunCall() {
    // reset the stack
    this.frameStack = [this.newBottomFrame()]
    this.runSeed = this.rng.getState()
  }

  onRunReturn(outcome: Maybe<EvalResult>, trace: EvalResult[]) {
    assert(this.frameStack.length > 0)
    const traceToSave = this.frameStack[0]
    traceToSave.result = outcome
    traceToSave.args = trace

    const traceWithSeed = { frame: traceToSave, seed: this.runSeed }

    this.bestTraces.push(traceWithSeed)
    this.sortTracesByQuality()
    // Remove the worst trace (if there more traces than needed)
    if (this.bestTraces.length > this.tracesToStore) {
      this.bestTraces.pop()
    }
  }

  private sortTracesByQuality() {
    const fromResult = (r: Maybe<EvalResult>) => {
      if (r.isNone()) {
        return true
      } else {
        const rex = r.value.toQuintEx({ nextId: () => 0n })
        return rex.kind === 'bool' && !rex.value
      }
    }

    this.bestTraces.sort((a, b) => {
      // Prefer short traces for error, and longer traces for non error.
      // Therefore, trace a is better than trace b iff
      //  - when a has an error: a is shorter or b has no error;
      //  - when a has no error: a is longer and b has no error.
      const aNotOk = fromResult(a.frame.result)
      const bNotOk = fromResult(b.frame.result)
      if (aNotOk) {
        if (bNotOk) {
          return a.frame.args.length - b.frame.args.length
        } else {
          return -1
        }
      } else {
        // a is ok
        if (bNotOk) {
          return 1
        } else {
          return b.frame.args.length - a.frame.args.length
        }
      }
    })
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
