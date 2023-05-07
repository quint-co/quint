/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Interface to model checking functionality
 *
 * @author Shon Feder
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { ErrorMessage } from './quintParserFrontend'
import { execSync } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import * as grpc from '@grpc/grpc-js'
import * as proto from '@grpc/proto-loader'

// TODO const APALACHE_VERSION = "0.30.8"
// TODO const DEFAULT_HOME = path.join(__dirname, 'apalache')
const APALACHE_SERVER_URI = 'TODO'

type ItfTrace = object

interface VerifyError { explanation: string, errors: ErrorMessage[], trace?: ItfTrace }

export type VerifyResult<T> = Either<VerifyError, T>

function err<A>(explanation: string, errors: ErrorMessage[] = [], trace?: ItfTrace): VerifyResult<A> {
  return left({ explanation, errors, trace })
}


// Path to the apalache jar
type ApalacheDist = { jar: string, exe: string }

type todo = any

type apalache_config = object

interface Apalache {
  check: (c: apalache_config) => VerifyResult<null>,
  stop: () => VerifyResult<null>
}

// TODO work around for lacking types from grpc lib
type ApalacheGrpc = {
  run: (req: { cmd: string, config: string }, callback: todo) => todo
}

function findDist(): VerifyResult<ApalacheDist> {
  const configuredDist = process.env.APALACHE_DIST
  let distResult: VerifyResult<string> = err(
    'Unable to find the apalache distribution. Ensure the APALACHE_DIST enviroment variable is set.')
  if (configuredDist && !fs.existsSync(configuredDist)) {
    distResult = err(`Specified APALACHE_DIST ${configuredDist} does not exist`)
  } else if (configuredDist) {
    distResult = right(configuredDist)
  }
  // TODO: fetch release if APALACHE_DIST is not configured

  return distResult.chain(dist => {
    const jar = path.join(dist, 'lib', 'apalache.jar')
    const exe = path.join(dist, 'bin', 'apalache-mc')
    return ((fs.existsSync(jar) && fs.existsSync(exe))
      ? right({ jar, exe })
      : err(`Apalache distribution is corrupted. Cannot find ${jar} or ${exe}.`)
    )
  })
}

function grpcClient(dist: ApalacheDist): VerifyResult<ApalacheGrpc> {
  const tmpDir = fs.mkdtempSync('apalache-proto-')
  const protoFileName = 'cmdExecutor.proto'
  // TODO: error handling
  execSync(`jar xf ${dist.jar} ${protoFileName}`, { cwd: tmpDir })
  const protoFile = path.join(tmpDir, protoFileName)

  // See https://grpc.io/docs/languages/node/basics/#example-code-and-setup
  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }

  const pkg = proto.loadSync(protoFile, options)
  const protoDescriptor = grpc.loadPackageDefinition(pkg)
  // The protoDescriptor object has the full package hierarchy
  const routeguide = protoDescriptor.routeguide as any // gRPCs typing gets intractable here
  return right(new routeguide.RouteGuide(APALACHE_SERVER_URI, grpc.credentials.createInsecure()))
}

function connect(stubAndDist: [ApalacheDist, ApalacheGrpc]): VerifyResult<Apalache> {
  const [_TODO, stub] = stubAndDist
  // TODO confirm server is running or else start it
  return right({
    check: (c: apalache_config) => stub.run({ cmd: 'CHECK', config: JSON.stringify(c) }, () => null),
    stop: () => right(null), // TODO
  })
}


// TODO return Either for errors
export const verify = (config: any): VerifyResult<null> => {
  return findDist()
    .chain(dist => grpcClient(dist).map(stub => [dist, stub] as [ApalacheDist, ApalacheGrpc]))
    .chain(connect)
    .chain(conn => conn.check(config))
}
