/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Use apalache to convert quint parse data into TLA+
 *
 * @author Shon Feder
 *
 * @module
 */

import { ApalacheResult, connect } from './apalache'

/**
 * Get apalache to convert quint parse data into TLA+
 *
 * @param parseDataJson the flattened, analyzed, parse data, in as a json string
 *
 * @returns right(tlaString) if parsing succeeds, or left(err) explaining the failure
 */
export async function compileToTlaplus(parseDataJson: string, verbosityLevel: number): Promise<ApalacheResult<string>> {
  const config = {
    input: {
      source: {
        type: 'string',
        format: 'qnt',
        content: parseDataJson,
      },
    },
  }
  const connectionResult = await connect(verbosityLevel)
  return connectionResult.asyncChain(conn => conn.tla(config))
}
