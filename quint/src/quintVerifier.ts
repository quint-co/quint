/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Core logic of verification
 *
 * @author Shon Feder, Informal Systems, 2024
 * @author Igor Konnov, konnov.phd, 2024
 *
 * @module
 */

// TODO This module should subsume the pure logic from the verify commaind in cliCommand

import { ApalacheResult, ServerEndpoint, connect } from './apalache'

/**
 * Verifies the configuration `config` by model checking it with the Apalache server
 *
 * @param serverEndpoint
 *   a server endpoint
 *
 * @param config
 *   an apalache configuration. See https://github.com/apalache-mc/apalache/blob/main/mod-infra/src/main/scala/at/forsyte/apalache/infra/passes/options.scala#L255
 *
 * @returns right(void) if verification succeeds, or left(err) explaining the failure
 */
export async function verify(
  serverEndpoint: ServerEndpoint,
  config: any,
  verbosityLevel: number
): Promise<ApalacheResult<void>> {
  const connectionResult = await connect(serverEndpoint, verbosityLevel)
  return connectionResult.asyncChain(conn => conn.check(config))
}
