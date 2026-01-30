import { ParserPhase4 } from '@informalsystems/quint'
import { join } from 'path'
import { Worker } from 'worker_threads'
import { logger } from './logger'
import {
  AnalyzeFailed,
  AnalyzeRequest,
  AnalyzeSuccess,
  CompileFailed,
  CompileRequest,
  CompileSuccess,
  WorkerResponse,
} from './workerProtocol'

export type CompilationResult = Pick<CompileSuccess, 'uri' | 'parsedData' | 'errors'>
export type AnalysisResult = Pick<AnalyzeSuccess, 'uri' | 'analysisOutput' | 'docs' | 'errors'>

export interface Callbacks {
  onParsingResult: (result: CompilationResult) => void
  onAnalysisResult: (result: AnalysisResult) => void
  onError: (message: string) => void
}

type WorkerStage = 'starting' | 'ready' | 'working' | 'terminating'

interface Document {
  uri: string
  version: number
  content: string
  parsedData: ParserPhase4 | undefined
}

export class CompilationPipeline {
  private worker!: Worker
  private stage!: WorkerStage
  private documents: Map<string, Document> = new Map()

  constructor(private readonly startId: bigint, private readonly callbacks: Callbacks) {
    this.initialize()
  }

  private initialize(): void {
    logger.info('Initializing compilation worker')

    this.stage = 'starting'
    this.worker = new Worker(join(__dirname, 'worker.js'))

    this.worker.on('message', (message: WorkerResponse) => {
      this.handleWorkerMessage(message)
    })

    this.worker.on('error', (error: Error) => {
      logger.error('Worker error: %s', error.message)
      this.callbacks.onError(`Compilation worker failed with: ${error.message}`)
      this.restartWorker()
    })

    this.worker.on('exit', (code: number) => {
      if (this.stage !== 'terminating') {
        logger.error('Compilation worker exited with code: %d', code)
      }
      if (this.stage == 'ready' || this.stage === 'working') {
        this.callbacks.onError(`Compilation worker exited unexpectedly with code: ${code}`)
        this.restartWorker()
      }
    })
  }

  private restartWorker(): void {
    logger.info('Restarting compilation worker')
    this.terminate()
    this.initialize()
  }

  terminate(): void {
    logger.info('Terminating compilation worker')
    this.stage = 'terminating'
    this.worker.terminate()
  }

  scheduleCompilation(uri: string, content: string): void {
    const doc = this.documents.get(uri)
    let nextVersion: number

    if (doc) {
      if (doc.content === content) {
        return // same content; skip it.
      }
      doc.content = content
      doc.parsedData = undefined
      nextVersion = ++doc.version
    } else {
      nextVersion = 0
      this.documents.set(uri, {
        version: nextVersion,
        parsedData: undefined,
        content,
        uri,
      })
    }

    logger.debug('Document changed: uri=%s, version=%d', uri, nextVersion)
    this.scheduleNext()
  }

  private scheduleNext(): void {
    if (this.stage === 'ready') {
      for (const [_, doc] of this.documents.entries()) {
        if (!doc.parsedData) {
          this.sendCompileRequest(doc)
        } else {
          this.sendAnalyzeRequest(doc)
        }
        this.stage = 'working'
        break
      }
    }
  }

  private sendCompileRequest(doc: Document): void {
    logger.trace('Sending CompileRequest: uri=%s, version=%d', doc.uri, doc.version)
    const request: CompileRequest = {
      type: 'compile',
      uri: doc.uri,
      version: doc.version,
      content: doc.content,
      startId: this.startId,
    }
    this.worker!.postMessage(request)
  }

  private sendAnalyzeRequest(doc: Document): void {
    logger.trace('Sending AnalyzeRequest: uri=%s, version=%d', doc.uri, doc.version)
    const request: AnalyzeRequest = {
      type: 'analyze',
      uri: doc.uri,
      version: doc.version,
      parsedData: doc.parsedData!,
    }
    this.worker!.postMessage(request)
  }

  private handleWorkerMessage(message: WorkerResponse): void {
    switch (message.type) {
      case 'ready':
        logger.info('Compilation worker is ready')
        break
      case 'compile-success':
        this.handleCompileSuccess(message)
        break
      case 'compile-failed':
        this.handleCompileFailed(message)
        break
      case 'analyze-success':
        this.handleAnalyzeSuccess(message)
        break
      case 'analyze-failed':
        this.handleAnalyzeFailed(message)
        break
    }
    this.stage = 'ready'
    this.scheduleNext()
  }

  private handleCompileSuccess(result: CompileSuccess): void {
    const { uri, version, parsedData, errors } = result
    logger.trace('Received CompileSuccess: uri=%s, version=%d errors=%d', uri, version, errors.length)

    const doc = this.documents.get(uri)
    if (doc?.version !== version) {
      return // Closed or stale doc
    }

    doc.parsedData = parsedData
    this.callbacks.onParsingResult(result)

    // LSP client will send a new doc once user fixes the errors.
    if (errors.length > 0) {
      this.deleteDocument(doc.uri)
    }
  }

  private handleCompileFailed(result: CompileFailed): void {
    const { uri, version, error } = result
    logger.trace('Received CompileFailed: uri=%s, version=%d, error=%s', uri, version, error)

    const doc = this.documents.get(uri)
    if (doc?.version !== version) {
      return // closed or stale doc
    }

    this.deleteDocument(doc.uri)
    this.callbacks.onError(`Compilation failed for ${uri}: ${error}`)
  }

  private handleAnalyzeSuccess(result: AnalyzeSuccess): void {
    const { uri, version } = result
    logger.trace('Received AnalyzeSuccess: uri=%s, version=%d', uri, version)

    const doc = this.documents.get(uri)
    if (doc?.version !== version) {
      return // closed or stale doc
    }

    this.deleteDocument(doc.uri)
    this.callbacks.onAnalysisResult(result)
  }

  private handleAnalyzeFailed(result: AnalyzeFailed): void {
    const { uri, version, error } = result
    logger.trace('Received AnalyzeFailed: uri=%s, version=%d, error=%s', uri, version, error)

    const doc = this.documents.get(uri)
    if (doc?.version !== version) {
      return // closed or stale doc
    }

    this.deleteDocument(doc.uri)
    this.callbacks.onError(`Analysis failed for ${uri}: ${error}`)
  }

  deleteDocument(uri: string): void {
    this.documents.delete(uri)
  }
}
