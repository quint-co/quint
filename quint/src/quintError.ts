import { ErrorTree } from "./errorTree"

export interface QuintError {
  code: string,
  message: string,
  data: QuintErrorData
}

export interface QuintErrorData {
  fix?: QuintErrorFix,
  trace?: ErrorTree
}

export type QuintErrorFix =
  | { kind: 'replace', original: string, replacement: string }

export function quintErrorToString(err: QuintError): string {
  return `${err.code}: ${err.message}`
}
