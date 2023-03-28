import { describe, it } from 'mocha'
import { assert } from 'chai'
import { none } from '@sweet-monads/maybe'

import { ExecutionFrame, newTraceRecorder } from '../../src/runtime/trace'
import { zerog } from '../../src/idGenerator'
import { QuintApp } from '../../src/quintIr'
import { verbosity } from '../../src/verbosity'

describe('newTraceRecorder', () => {
  it('one layer', () => {
    const rec = newTraceRecorder(verbosity.maxVerbosity)
    const A: QuintApp = { id: 0n, kind: 'app', opcode: 'A', args: [] }
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    const trace = rec.getBestTrace()
    assert(trace.subframes.length === 2)
    assert(trace.subframes[0].app === A)
    assert(trace.subframes[0].subframes.length === 0)
    assert(trace.subframes[1].app === A)
    assert(trace.subframes[1].subframes.length === 0)
  })

  it('two layers', () => {
    const rec = newTraceRecorder(verbosity.maxVerbosity)
    const A: QuintApp = { id: 0n, kind: 'app', opcode: 'A', args: [] }
    const B: QuintApp = { id: 0n, kind: 'app', opcode: 'B', args: [] }
    // (A calls (B, after that it calls A)), after that another A is called
    rec.onUserOperatorCall(A)
    rec.onUserOperatorCall(B)
    rec.onUserOperatorReturn(B, [], none())
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    rec.onUserOperatorReturn(A, [], none())
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    const trace = rec.getBestTrace()
    assert(trace.subframes.length === 2)
    assert(trace.subframes[0].app === A)
    assert(trace.subframes[0].subframes.length === 2)
    assert(trace.subframes[0].subframes[0].app === B)
    assert(trace.subframes[0].subframes[1].app === A)
    assert(trace.subframes[1].app === A)
    assert(trace.subframes[1].subframes.length === 0)
  })

  it('any {...} mixed', () => {
    const rec = newTraceRecorder(verbosity.maxVerbosity)
    const A: QuintApp = { id: 0n, kind: 'app', opcode: 'A', args: [] }
    const B: QuintApp = { id: 0n, kind: 'app', opcode: 'B', args: [] }
    const C: QuintApp = { id: 0n, kind: 'app', opcode: 'C', args: [] }
    const anyEx: QuintApp = {
      id: 0n, kind: 'app', opcode: 'any', args: [ A, B, C ]
    }
    // A()
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    // any {
    rec.onAnyOptionCall(anyEx, 0)
    // A()
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())
    rec.onAnyOptionReturn(anyEx, 0)

    rec.onAnyOptionCall(anyEx, 1)
    // B()
    rec.onUserOperatorCall(B)
    rec.onUserOperatorReturn(B, [], none())
    // C()
    rec.onUserOperatorCall(C)
    rec.onUserOperatorReturn(C, [], none())
    rec.onAnyOptionReturn(anyEx, 1)

    rec.onAnyOptionCall(anyEx, 2)
    // C()
    rec.onUserOperatorCall(C)
    rec.onUserOperatorReturn(C, [], none())
    rec.onAnyOptionReturn(anyEx, 2)

    rec.onAnyReturn(3, 1)
    // } // any
    rec.onUserOperatorCall(A)
    rec.onUserOperatorReturn(A, [], none())

    const trace = rec.getBestTrace()
    assert(trace.subframes.length === 4)
    // A() is the operator before `any { ... }`
    assert(trace.subframes[0].app === A)
    assert(trace.subframes[0].subframes.length === 0)
    // A() and C() are from option 1
    assert(trace.subframes[1].app === B)
    assert(trace.subframes[1].subframes.length === 0)
    assert(trace.subframes[2].app === C)
    assert(trace.subframes[2].subframes.length === 0)
    // A() is the operator after `any { ... }`
    assert(trace.subframes[3].app === A)
    assert(trace.subframes[3].subframes.length === 0)
  })
})
