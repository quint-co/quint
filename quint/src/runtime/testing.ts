/*
 * Unit-testing framework for the JS runtime.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, merge } from '@sweet-monads/either'

import { ErrorMessage, Loc, fromIrErrorMessage } from '../quintParserFrontend'
import { QuintModule, QuintOpDef } from '../quintIr'
import { TypeScheme } from '../types/base'

import { compile, contextLookup } from './compile'
import { newIdGenerator } from './../idGenerator'
import { LookupTable } from '../lookupTable'

/**
 * Evaluation result.
 * The implementation details are hidden behind this interface.
 */
export interface TestResult {
  /**
   * The test name.
   */
  name: string
  /**
   * The test status.
   */
  status: 'passed' | 'failed' | 'ignored'
  /**
   * When status === 'failed', errors contain the explanatory error messages.
   */
  errors: ErrorMessage[]
}

/**
 * Run a test suite of a single module.
 *
 * @param modules Quint modules in the intermediate representation
 * @param mainName the module that should be used as a state machine
 * @param sourceMap source map as produced by the parser
 * @param lookupTable lookup table as produced by the parser
 * @param types type table as produced by the type checker
 * @param testMatch test name matcher
 * @param rand a random number generator
 * @returns the results of running the tests
 */
export function
compileAndTest(modules: QuintModule[],
         main: QuintModule,
         sourceMap: Map<bigint, Loc>,
         lookupTable: LookupTable,
         types: Map<bigint, TypeScheme>,
         testMatch: (n: string) => boolean,
         rand: () => number): Either<string, TestResult[]> {
  const ctx =
    compile(modules, sourceMap, lookupTable, types, main.name, rand)
  const testDefs =
    main.defs.filter(d => d.kind === 'def' && testMatch(d.name)) as QuintOpDef[]

  return merge(testDefs.map(def => {
    return contextLookup(ctx, def.id, 'callable')
      .map(comp => {
        const name = def.name
        const result = comp.eval()
        if (result.isNone()) {
          return { name, status: 'failed', errors: ctx.getRuntimeErrors() }
        }

        const ex = result.value.toQuintEx(newIdGenerator())
        if (ex.kind !== 'bool') {
          return { name, status: 'ignored', errors: [] }
        }
        if (ex.value) {
          return { name, status: 'passed', errors: [] }
        }

        const e = fromIrErrorMessage(sourceMap)({
          explanation: `${name} returns false`,
          refs: [def.id],
        })
        return { name, status: 'failed', errors: [e] }
      })
  }))
}
