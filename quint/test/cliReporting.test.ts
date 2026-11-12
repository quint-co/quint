import { describe, it } from 'mocha'
import { assert } from 'chai'
import { left } from '@sweet-monads/either'

import { ApalacheResult } from '../src/apalache'
import { TracingStage } from '../src/cliCommands'
import { processApalacheResult } from '../src/cliReporting'
import { ItfTrace } from '../src/itf'
import { expressionToString } from '../src/ir/IRprinting'

describe('processApalacheResult', () => {
  it('reports a violation when the counterexample contains #unserializable (#2074)', async () => {
    const trace: ItfTrace = {
      vars: ['v', 'n'],
      states: [
        {
          v: { '#unserializable': '[{1, 2} → {FALSE, TRUE}]' },
          n: { '#bigint': '0' },
        },
        {
          v: { '#unserializable': '[{1, 2} → {FALSE, TRUE}]' },
          n: { '#bigint': '1' },
        },
      ],
    }
    const res: ApalacheResult<void> = left({
      explanation: 'found a counterexample',
      errors: [],
      traces: [trace],
    })
    const stage: TracingStage = {
      stage: 'running',
      args: {},
      path: 's_maps.qnt',
      sourceCode: new Map(),
    }

    const chunks: string[] = []
    const write = process.stdout.write
    process.stdout.write = ((chunk: string | Uint8Array) => {
      chunks.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk))
      return true
    }) as typeof process.stdout.write
    let result
    try {
      // Verbosity 2 prints the trace and the [violation] summary.
      result = await processApalacheResult(res, 0, 2, stage, ['inv'])
    } finally {
      process.stdout.write = write
    }

    assert.isTrue(result.isLeft(), 'expected a violation result, not a thrown conversion error')
    if (result.isLeft()) {
      assert.equal(result.value.msg, 'found a counterexample')
      assert.equal(result.value.stage.status, 'violation')
      const printed = (result.value.stage.trace ?? []).map(expressionToString).join('\n')
      assert.include(printed, '[{1, 2} → {FALSE, TRUE}]')
    }
    const output = chunks.join('')
    assert.include(output, '[{1, 2} → {FALSE, TRUE}]')
    assert.include(output, '[violation]')
    assert.notInclude(output, 'unsupported operator')
  })
})
