/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Core logic of verification
 *
 * @author Shon Feder
 *
 * @module
 */

// TODO This module should subsume the pure logic from the verify commaind in cliCommand

import { ApalacheResult, connect } from './apalache'

/**
 * Verifies the configuration `config` by model checking it with the Apalache server
 *
 * @param serverUrl
 *   a connection URL, e.g., localhost:8822
 *
 * @param config
 *   an apalache configuration. See https://github.com/informalsystems/apalache/blob/main/mod-infra/src/main/scala/at/forsyte/apalache/infra/passes/options.scala#L255
 *
 * @returns right(void) if verification succeeds, or left(err) explaining the failure
 */
export async function verify(serverUrl: string, config: any, verbosityLevel: number): Promise<ApalacheResult<void>> {
  const connectionResult = await connect(serverUrl, verbosityLevel)
  return connectionResult.asyncChain(conn => conn.check(config))
}
