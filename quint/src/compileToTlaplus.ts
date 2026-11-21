/* ----------------------------------------------------------------------------------
 * Copyright 2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Use apalache to convert quint parse data into TLA+
 *
 * @author Shon Feder, Informal Systems, 2024
 * @author Igor Konnov, konnov.phd, 2024
 *
 * @module
 */

import net from 'net'
import { ApalacheResult, ServerEndpoint, connect } from './apalache'
import { postprocessTlaplus } from './tlaplusPostprocessing'

export function freeServerEndpoint(): Promise<ServerEndpoint> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port
      server.close(err => (err ? reject(err) : resolve({ hostname: '127.0.0.1', port })))
    })
  })
}

/**
 * Get apalache to convert quint parse data into TLA+
 *
 * @param serverEndpoint
 *   a server endpoint
 *
 * @param apalacheVersion
 *  the version of Apalache to use if there is no active server connection
 *
 * @param parseDataJson the flattened, analyzed, parse data, in as a json string
 *
 * @returns right(tlaString) if parsing succeeds, or left(err) explaining the failure
 */
export async function compileToTlaplus(
  serverEndpoint: ServerEndpoint,
  apalacheVersion: string,
  parseDataJson: string,
  verbosityLevel: number
): Promise<ApalacheResult<string>> {
  const config = {
    source: {
      kind: 'string',
      format: 'qnt',
      content: parseDataJson,
    },
  }
  const connectionResult = await connect(
    serverEndpoint ?? (await freeServerEndpoint()),
    apalacheVersion,
    verbosityLevel
  )
  const tlaResult = await connectionResult.asyncChain(conn => conn.tla(config))
  return tlaResult.map(postprocessTlaplus)
}
