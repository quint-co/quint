import { ParserPhase4, analyzeModules, newIdGenerator, produceDocsById } from '@informalsystems/quint'
import { URI } from 'vscode-uri'
import { parentPort } from 'worker_threads'
import { overrideConsole } from './logger'
import { parseDocument } from './parsing'
import {
  AnalyzeRequest,
  AnalyzeResponse,
  CompileFailed,
  CompileRequest,
  CompileResponse,
  WorkerReady,
  WorkerRequest,
} from './workerProtocol'

// Redirect logs to file logger to prevent corrupting the JSON-RPC stream.
overrideConsole()

if (!parentPort) {
  throw new Error('compilationWorker must be run as a worker thread')
}

const port = parentPort

port.on('message', (message: WorkerRequest) => {
  switch (message.type) {
    case 'compile':
      handleCompileRequest(message)
      break
    case 'analyze':
      handleAnalyzeRequest(message)
      break
  }
})

function handleCompileRequest(request: CompileRequest): void {
  const { uri, version, content, startId } = request
  const parsedUri = URI.parse(uri)

  // Only support file:// scheme for now.
  if (parsedUri.scheme !== 'file') {
    const response: CompileFailed = {
      type: 'compile-failed',
      uri,
      version,
      error: `Support imports from file, found: ${parsedUri.scheme}`,
    }
    port.postMessage(response)
    return
  }

  let response: CompileResponse
  try {
    const idGenerator = newIdGenerator(startId)
    const result: ParserPhase4 = parseDocument(idGenerator, parsedUri, content)

    // FIXME: these fields are functions and they can't be sent across worker
    // thread boundaries. Remvoing them is a workaround until we can make
    // compilation incremental (and cheaper). Functionality that rely on these
    // fields will break at runtime but, currently, LSP server is not depending
    // on them at the moment.
    result.unusedDefinitions = undefined as any
    result.resolver = undefined as any

    response = {
      type: 'compile-success',
      uri,
      version,
      parsedData: result,
      errors: result.errors,
    }
  } catch (e) {
    response = {
      type: 'compile-failed',
      uri,
      version,
      error: String(e),
    }
  }

  port.postMessage(response)
}

function handleAnalyzeRequest(request: AnalyzeRequest): void {
  const { uri, version, parsedData } = request
  // FIXME: note that parsed data will be missing `unusedDefinitions` and
  // `resolver` functions. See `handleCompileRequest` for details.
  const { modules, table } = parsedData

  let response: AnalyzeResponse
  try {
    const docs = new Map(modules.flatMap(m => [...produceDocsById(m).entries()]))
    const [errors, analysisOutput] = analyzeModules(table, modules)

    response = {
      type: 'analyze-success',
      uri,
      version,
      analysisOutput: analysisOutput,
      docs: docs,
      errors: errors,
    }
  } catch (e) {
    response = {
      type: 'analyze-failed',
      uri,
      version,
      error: String(e),
    }
  }

  port.postMessage(response)
}

const readyMessage: WorkerReady = { type: 'ready' }
port.postMessage(readyMessage)
