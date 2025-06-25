/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Interface to Apalache
 *
 * This functionality is enabled by managing and interacting with the Apalache
 * server.
 *
 * @author Shon Feder, Informal Systems, 2024
 * @author Igor Konnov, konnov.phd, 2024
 *
 * @module
 */

import { Either, chain, left, right } from '@sweet-monads/either'
import { ErrorMessage } from './ErrorMessage'
import path from 'path'
import fs from 'fs'
// TODO: used by GitHub api approach: https://github.com/informalsystems/quint/issues/1124
// import semver from 'semver'
import { pipeline } from 'stream/promises'
import child_process, { StdioOptions } from 'child_process'
import * as tar from 'tar'
import * as grpc from '@grpc/grpc-js'
import * as proto from '@grpc/proto-loader'
import * as protobufDescriptor from 'protobufjs/ext/descriptor'
import { setTimeout } from 'timers/promises'
import { promisify } from 'util'
import { ItfTrace } from './itf'
import { debugLog, verbosity } from './verbosity'
// TODO: used by GitHub api approach: https://github.com/informalsystems/quint/issues/1124
// import { request as octokitRequest } from '@octokit/request'

import type { Buffer } from 'buffer'
import type { PackageDefinition as ProtoPackageDefinition } from '@grpc/proto-loader'
import { apalacheDistDir } from './config'

/**
 * A server endpoint for establishing a connection with the Apalache server.
 */
export interface ServerEndpoint {
  hostname: string
  port: number
}

/**
 * Parse an endpoint URL in the format hostname:port
 * @param input the string to parse
 * @returns either `left(error)`, or `right(ServerEndpoint)`
 */
export function parseServerEndpoint(input: string): Either<string, ServerEndpoint> {
  const m = /^([a-zA-Z0-9.]*):([0-9]+)$/.exec(input)
  if (m) {
    const port = Number.parseInt(m[2])
    if (port > 65535) {
      return left(`Invalid port number ${port} in ${input}`)
    } else {
      return right({ hostname: m[1], port })
    }
  } else {
    return left(`Expected hostname:port, found: ${input}`)
  }
}

export function createConfig(
  loadedConfig: any,
  parsedSpec: string,
  args: any,
  inv: string = 'q::inv',
  init: string = 'q::init',
  next: string = 'q::step',
): ApalacheConfig {
  return {
    ...loadedConfig,
    input: {
      ...(loadedConfig.input ?? {}),
      source: {
        type: 'string',
        format: 'qnt',
        content: parsedSpec,
      },
    },
    checker: {
      ...(loadedConfig.checker ?? {}),
      length: args.maxSteps,
      init: init,
      next: next,
      inv: [inv],
      'temporal-props': args.temporal ? ['q::temporalProps'] : undefined,
      tuning: {
        ...(loadedConfig.checker?.tuning ?? {}),
        'search.simulation': args.randomTransitions ? 'true' : 'false',
      },
    },
  }
}

/**
 * Convert an endpoint to a GRPC connection string.
 * @param endpoint an endpoint
 * @returns the connection string expected by the Apalache server API
 */
export function serverEndpointToConnectionString(endpoint: ServerEndpoint): string {
  return `${endpoint.hostname}:${endpoint.port}`
}

export const DEFAULT_APALACHE_VERSION_TAG = '0.47.2'
// TODO: used by GitHub api approach: https://github.com/informalsystems/quint/issues/1124
// const APALACHE_TGZ = 'apalache.tgz'

// The structure used to report errors
type ApalacheError = {
  explanation: string
  errors: ErrorMessage[]
  traces?: ItfTrace[]
}

export type ApalacheResult<T> = Either<ApalacheError, T>

// An object representing the Apalache configuration
// See https://github.com/apalache-mc/apalache/blob/main/mod-infra/src/main/scala/at/forsyte/apalache/infra/passes/options.scala#L255
export type ApalacheConfig = any

// Interface to the apalache server
// This is likely to be expanded in the future
type Apalache = {
  // Run the check command with the given configuration
  check: (c: ApalacheConfig) => Promise<ApalacheResult<void>>
  // Convert the provided input into formatted TLA
  tla: (c: ApalacheConfig) => Promise<ApalacheResult<string>>
}

function handleVerificationFailure(failure: { pass_name: string; error_data: any }): ApalacheError {
  switch (failure.pass_name) {
    case 'SanyParser':
      return {
        explanation: `internal error: while parsing in Apalache:\n'${failure.error_data}'\nPlease report an issue: https://github.com/informalsystems/quint/issues/new`,
        errors: [],
      }
    case 'TypeCheckerSnowcat':
      return {
        explanation: `internal error: while type checking in Apalache:\n'${failure.error_data}'\nPlease report an issue: https://github.com/informalsystems/quint/issues/new`,
        errors: [],
      }
    case 'BoundedChecker':
      switch (failure.error_data.checking_result) {
        case 'Error':
          return { explanation: 'found a counterexample', traces: failure.error_data.counterexamples, errors: [] }
        case 'Deadlock':
          return { explanation: 'reached a deadlock', traces: failure.error_data.counterexamples, errors: [] }
        default:
          throw new Error(`internal error: unhandled verification error ${failure.error_data.checking_result}`)
      }
    default:
      throw new Error(`internal error: unhandled verification error at pass ${failure.pass_name}`)
  }
}

async function handleResponse(response: RunResponse): Promise<ApalacheResult<any>> {
  if (response.result == 'success') {
    const success = JSON.parse(response.success)
    return right(success)
  } else {
    switch (response.failure.errorType) {
      case 'UNEXPECTED': {
        const errData = JSON.parse(response.failure.data)
        return err(errData.msg)
      }
      case 'PASS_FAILURE':
        return left(handleVerificationFailure(JSON.parse(response.failure.data)))
      default:
        // TODO handle other error cases
        return err(`${response.failure.errorType}: ${response.failure.data}`)
    }
  }
}

// Construct the Apalache interface around the cmdExecutor
function apalache(cmdExecutor: AsyncCmdExecutor): Apalache {
  const check = async (c: ApalacheConfig): Promise<ApalacheResult<void>> => {
    return cmdExecutor.run({ cmd: 'CHECK', config: JSON.stringify(c) }).then(handleResponse)
  }

  const tla = async (c: ApalacheConfig): Promise<ApalacheResult<string>> => {
    return cmdExecutor.run({ cmd: 'TLA', config: JSON.stringify(c) }).then(handleResponse)
  }

  return { check, tla }
}

// Alias for an async callback for values of type T used to annotate
// callback-based methods so we can convert them into promise-based methods via
// promiseify.
type AsyncCallBack<T> = (err: any, result: T) => void

// The core grpc tooling doesn't support generation of typing info,
// we therefore record the structure we require from the grpc generation
// in the following types.
//
// The types reflect https://github.com/apalache-mc/apalache/blob/main/shai/src/main/protobuf/cmdExecutor.proto

type RunRequest = { cmd: string; config: string }

type RunResponse =
  | { result: 'failure'; failure: { errorType: string; data: string } }
  // The success data also includes the parsed module, either as JSON
  // representing the Apalache IR, or as a TLA string (if the `TLA` command is used)
  | { result: 'success'; success: string }

// The interface for the CmdExecutor service generated by the gRPC library
type CmdExecutor = {
  // Constructs a new client service
  new (url: string, creds: any, options: any): CmdExecutor
  run: (req: RunRequest, cb: AsyncCallBack<any>) => void
}

// The refined interface to the CmdExecutor we produce from the generated interface
type AsyncCmdExecutor = {
  run: (req: RunRequest) => Promise<RunResponse>
}

// The interface for the Shai package
type ShaiPkg = {
  cmdExecutor: {
    CmdExecutor: CmdExecutor
  }
}

// Helper to construct errors results
function err<A>(explanation: string, errors: ErrorMessage[] = [], traces?: ItfTrace[]): ApalacheResult<A> {
  return left({ explanation, errors, traces })
}

// See https://grpc.io/docs/languages/node/basics/#example-code-and-setup
const grpcStubOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
}

const GRPC_TIMEOUT_MS = 5000

async function loadProtoDefViaReflection(
  serverEndpoint: ServerEndpoint,
  retry: boolean
): Promise<ApalacheResult<ProtoPackageDefinition>> {
  // Types of the gRPC interface
  type ServerReflectionRequest = { file_containing_symbol: string }
  type ServerReflectionResponseSuccess = {
    file_descriptor_response: {
      file_descriptor_proto: Buffer[]
    }
  }
  type ServerReflectionResponseFailure = {
    error_response: {
      error_code: number
      error_message: string
    }
  }
  type ServerReflectionResponse = ServerReflectionResponseSuccess | ServerReflectionResponseFailure
  type ServerReflectionService = {
    new (url: string, creds: grpc.ChannelCredentials): ServerReflectionService
    ServerReflectionInfo: (args: {
      deadline: Date
    }) => grpc.ClientDuplexStream<ServerReflectionRequest, ServerReflectionResponse>
    getChannel: () => { getConnectivityState: (_: boolean) => grpc.connectivityState }
  }
  type ServerReflectionPkg = {
    grpc: { reflection: { v1alpha: { ServerReflection: ServerReflectionService } } }
  }

  // Obtain a reflection service client
  const protoPath = require.resolve('./reflection.proto')
  const packageDefinition = proto.loadSync(protoPath, grpcStubOptions)
  const reflectionProtoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as ServerReflectionPkg
  const serverReflectionService = reflectionProtoDescriptor.grpc.reflection.v1alpha.ServerReflection
  const connectionString = serverEndpointToConnectionString(serverEndpoint)
  const reflectionClient = new serverReflectionService(connectionString, grpc.credentials.createInsecure())

  // Wait for gRPC channel to come up, with 1sec pauses
  if (retry) {
    for (;;) {
      const grpcChannelState = reflectionClient.getChannel().getConnectivityState(true)
      if (grpcChannelState == grpc.connectivityState.READY) {
        break
      } else {
        /* I suspect that there is a race with async gRPC code that actually
         * brings the connection up, so we need to yield control here. In
         * particular, waiting for the channel to come up in a busy-waiting loop
         * does NOT work.
         */
        await setTimeout(1000)
      }
    }
  }

  // Query reflection endpoint
  return new Promise<ApalacheResult<ServerReflectionResponse>>((resolve, _reject) => {
    // Add deadline to the call
    const deadline = new Date()
    deadline.setMilliseconds(deadline.getMilliseconds() + GRPC_TIMEOUT_MS)

    const call = reflectionClient.ServerReflectionInfo({ deadline })
    call.on('data', (r: ServerReflectionResponse) => {
      call.end()
      resolve(right(r))
    })
    call.on('error', (e: grpc.StatusObject) => resolve(err(`Error querying reflection endpoint: ${e}`)))

    call.write({ file_containing_symbol: 'shai.cmdExecutor.CmdExecutor' })
  }).then(protoDefResponse =>
    protoDefResponse.chain(protoDefResponse => {
      // Construct a proto definition of the reflection response.
      if ('error_response' in protoDefResponse) {
        return err(
          `Apalache gRPC endpoint is corrupted. Could not extract proto file: ${protoDefResponse.error_response.error_message}`
        )
      }

      // Decode reflection response to FileDescriptorProto
      let fileDescriptorProtos = protoDefResponse.file_descriptor_response.file_descriptor_proto.map(
        bytes => protobufDescriptor.FileDescriptorProto.decode(bytes) as protobufDescriptor.IFileDescriptorProto
      )

      // Use proto-loader to load the FileDescriptorProto wrapped in a FileDescriptorSet
      return right(proto.loadFileDescriptorSetFromObject({ file: fileDescriptorProtos }, grpcStubOptions))
    })
  )
}

function loadGrpcClient(serverEndpoint: ServerEndpoint, protoDef: ProtoPackageDefinition): AsyncCmdExecutor {
  const protoDescriptor = grpc.loadPackageDefinition(protoDef)
  // The cast thru `unknown` lets us convince the type system of anything
  // See https://basarat.gitbook.io/typescript/type-system/type-assertion#double-assertion
  const pkg = protoDescriptor.shai as unknown as ShaiPkg
  const connectionString = serverEndpointToConnectionString(serverEndpoint)
  // bump the maximal message sizes, as the Quint backend in Apalache may send very large JSON files
  const options: any = {
    'grpc.max_receive_message_length': 1024 * 1024 * 1024,
    'grpc.max_send_message_length': 1024 * 1024 * 1024,
  }
  const stub: any = new pkg.cmdExecutor.CmdExecutor(connectionString, grpc.credentials.createInsecure(), options)
  return {
    run: promisify((data: RunRequest, cb: AsyncCallBack<any>) => stub.run(data, cb)),
  }
}

/**
 * Connect to the Apalache server, and verify that the gRPC channel is up.
 *
 * @param serverEndpoint
 *   a server endpoint
 *
 * @param retry Wait for the gRPC connection to come up.
 *
 * @returns A promise resolving to a `right<Apalache>` if the connection is
 * successful, or a `left<ApalacheError>` if not.
 */
async function tryConnect(serverEndpoint: ServerEndpoint, retry: boolean = false): Promise<ApalacheResult<Apalache>> {
  return (await loadProtoDefViaReflection(serverEndpoint, retry))
    .map(protoDef => loadGrpcClient(serverEndpoint, protoDef))
    .map(apalache)
}

function downloadAndUnpackApalache(apalacheVersion: string): Promise<ApalacheResult<null>> {
  const url = `https://github.com/apalache-mc/apalache/releases/download/v${apalacheVersion}/apalache.tgz`
  return fetch(url)
    .then(
      // unpack response body
      res => pipeline(res.body!, tar.extract({ cwd: apalacheDistDir(apalacheVersion), strict: true })),
      error => err(`Error fetching ${url}: ${error}`)
    )
    .then(
      _ => right(null),
      error => err(`Error unpacking .tgz: ${error}`)
    )
}

/**
 * Fetch the latest Apalache release pinned by `APALACHE_VERSION_TAG` from Github.
 *
 * @returns A promise resolving to:
 *    - a `right<string>` equal to the path the Apalache dist was unpacked to,
 *    - a `left<ApalacheError>` indicating an error.
 */
async function fetchApalache(apalacheVersion: string, verbosityLevel: number): Promise<ApalacheResult<string>> {
  const filename = process.platform === 'win32' ? 'apalache-mc.bat' : 'apalache-mc'
  const apalacheBinary = path.join(apalacheDistDir(apalacheVersion), 'apalache', 'bin', filename)
  if (fs.existsSync(apalacheBinary)) {
    // Use existing download
    debugLog(verbosityLevel, `Using existing Apalache distribution in ${apalacheBinary}`)
    return right(apalacheBinary)
  } else {
    fs.mkdirSync(apalacheDistDir(apalacheVersion), { recursive: true })
    process.stdout.write(`Downloading Apalache distribution ${apalacheVersion}...`)
    const res = await downloadAndUnpackApalache(apalacheVersion)
    process.stdout.write(' done.\n')
    return res.map(_ => apalacheBinary)
  }

  // TODO: This logic makes the CLI tool extremely sensitive to environment.
  // See https://github.com/informalsystems/quint/issues/1124
  // Fetch Github releases
  // return octokitRequest('GET /repos/apalache-mc/apalache/releases').then(
  //   async resp => {
  //     // Find latest that satisfies `APALACHE_VERSION_TAG`
  //     const versions = resp.data.map((element: any) => element.tag_name)
  //     const latestTaggedVersion = semver.parse(semver.maxSatisfying(versions, APALACHE_VERSION_TAG))
  //     if (latestTaggedVersion === null) {
  //       return err(`Failed to deteremine a valid semver version vesion from ${versions} and ${APALACHE_VERSION_TAG}`)
  //     }
  //     // Check if we have already downloaded this release
  //     const unpackPath = apalacheDistDir()
  //     const apalacheBinary = path.join(unpackPath, 'apalache', 'bin', 'apalache-mc')
  //     if (fs.existsSync(apalacheBinary)) {
  //       // Use existing download
  //       console.log(`Using existing Apalache distribution in ${unpackPath}`)
  //       return right(unpackPath)
  //     } else {
  //       // No existing download, download Apalache dist
  //       fs.mkdirSync(unpackPath, { recursive: true })

  //       // Filter release response to get dist archive asset URL
  //       const taggedRelease = resp.data.find((element: any) => element.tag_name == latestTaggedVersion)
  //       const tgzAsset = taggedRelease.assets.find((asset: any) => asset.name == APALACHE_TGZ)
  //       const downloadUrl = tgzAsset.browser_download_url

  //       console.log(`Downloading Apalache distribution from ${downloadUrl}...`)
  //       return fetch(downloadUrl)
  //         .then(
  //           // unpack response body
  //           res => pipeline(res.body, tar.extract({ cwd: unpackPath, strict: true })),
  //           error => err(`Error fetching ${downloadUrl}: ${error}`)
  //         )
  //         .then(
  //           _ => right(unpackPath),
  //           error => err(`Error unpacking .tgz: ${error}`)
  //         )
  //     }
  //   },
  //   error => err(`Error listing the Apalache releases: ${error}`)
  // )
}

/**
 * Connect to an already running Apalache server, or – if unsuccessful – fetch
 * Apalache, spawn it, and connect to it.
 *
 * If an Apalache server is spawned, the child process exits when the parent process (i.e., this process) terminates.
 *
 * @param serverEndpoint
 *   a server endpoint
 *
 * @returns A promise resolving to:
 *    - a `right<Apalache>` equal to the path the Apalache dist was unpacked to,
 *    - a `left<ApalacheError>` indicating an error.
 */
export async function connect(
  serverEndpoint: ServerEndpoint,
  apalacheVersion: string,
  verbosityLevel: number
): Promise<ApalacheResult<Apalache>> {
  // Try to connect to Shai, and try to ping it
  const connectionResult = await tryConnect(serverEndpoint)
  // We managed to connect, simply return this connection
  if (connectionResult.isRight()) {
    debugLog(verbosityLevel, 'Connecting with existing Apalache server')
    return connectionResult
  }

  // Connection or pinging failed, download Apalache
  debugLog(verbosityLevel, 'No running Apalache server found, launching...')
  const exeResult = await fetchApalache(apalacheVersion, verbosityLevel)
  // Launch Apalache from download
  return exeResult
    .asyncChain(
      async exe =>
        new Promise<ApalacheResult<void>>((resolve, _) => {
          debugLog(verbosityLevel, `Launching Apalache server on ${serverEndpoint.hostname}:${serverEndpoint.port}`)
          debugLog(verbosityLevel, `Spawning: ${exe}`)
          // unless non-verbose output is requested, let Apalache write to stdout and stderr
          const stdio: StdioOptions =
            verbosityLevel >= verbosity.defaultLevel
              ? ['ignore', process.stdout, process.stderr]
              : ['ignore', 'ignore', 'ignore']
          // importantly, do not wrap the command in a shell,
          // as this will prevent the child process from being properly terminated
          const options = { shell: false, stdio: stdio }
          const args = ['server', `--port=${serverEndpoint.port}`]
          const apalache = child_process.spawn(exe, args, options)

          // Exit handler that kills Apalache if Quint exists
          function exitHandler() {
            debugLog(verbosityLevel, 'Shutting down Apalache server')
            try {
              apalache.kill('SIGTERM')
            } catch (error: any) {
              // ESRCH is raised if no process with `pid` exists, i.e.,
              // if Apalache server exited on its own
              if (error.code == 'ESRCH') {
                debugLog(verbosityLevel, 'Apalache already exited')
              } else {
                throw error
              }
            }
          }

          if (apalache.pid) {
            // Apalache launched successfully
            debugLog(verbosityLevel, `Started Apalache server on pid=${apalache.pid}`)

            // Install exit handler that kills Apalache if Quint exists
            process.on('exit', exitHandler.bind(null))
            process.on('SIGINT', exitHandler.bind(null))
            process.on('SIGUSR1', exitHandler.bind(null))
            process.on('SIGUSR2', exitHandler.bind(null))
            process.on('uncaughtException', exitHandler.bind(null))

            resolve(right(void 0))
          }
          // If Apalache fails to spawn, `apalache.pid` is undefined and 'error' is
          // emitted.
          apalache.on('error', error => resolve(err(`Failed to launch Apalache server: ${error.message}`)))
        })
    )
    .then(chain(() => tryConnect(serverEndpoint, true)))
}
