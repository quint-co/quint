import {
  IdGenerator,
  ParserPhase4,
  fileSourceResolver,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
  parsePhase4toposort,
} from '@informalsystems/quint'
import { basename, dirname } from 'path'
import { URI } from 'vscode-uri'
import { flow } from 'lodash'

export function parseDocument(idGenerator: IdGenerator, uri: URI, text: string): ParserPhase4 {
  const result: ParserPhase4 = flow([
    () => parsePhase1fromText(idGenerator, text, uri.path),
    phase1Data => {
      const resolver = fileSourceResolver()
      const mainPath = resolver.lookupPath(dirname(uri.fsPath), basename(uri.fsPath))
      return parsePhase2sourceResolution(idGenerator, resolver, mainPath, phase1Data)
    },
    parsePhase3importAndNameResolution,
    parsePhase4toposort,
  ])()
  return result
}
