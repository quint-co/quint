import { AnalysisOutput, DocumentationEntry, ParserPhase4, QuintError } from '@informalsystems/quint'

export type WorkerRequest = CompileRequest | AnalyzeRequest

export type WorkerResponse = WorkerReady | CompileResponse | AnalyzeResponse

export type CompileResponse = CompileSuccess | CompileFailed

export type AnalyzeResponse = AnalyzeSuccess | AnalyzeFailed

export interface WorkerReady {
  type: 'ready'
}

export interface CompileRequest {
  type: 'compile'
  uri: string
  version: number
  content: string
  startId: bigint
}

export interface CompileSuccess {
  type: 'compile-success'
  uri: string
  version: number
  parsedData: ParserPhase4
  errors: QuintError[]
}

export interface CompileFailed {
  type: 'compile-failed'
  uri: string
  version: number
  error: string
}

export interface AnalyzeRequest {
  type: 'analyze'
  uri: string
  version: number
  parsedData: ParserPhase4
}

export interface AnalyzeSuccess {
  type: 'analyze-success'
  uri: string
  version: number
  analysisOutput: AnalysisOutput
  docs: Map<bigint, DocumentationEntry>
  errors: QuintError[]
}

export interface AnalyzeFailed {
  type: 'analyze-failed'
  uri: string
  version: number
  error: string
}
