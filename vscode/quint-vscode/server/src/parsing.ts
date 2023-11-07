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
import { TextDocument } from 'vscode-languageserver-textdocument'
import { flow } from 'lodash'

export async function parseDocument(idGenerator: IdGenerator, textDocument: TextDocument): Promise<ParserPhase4> {
  const text = textDocument.getText()

  // parse the URI to resolve imports
  const parsedUri = URI.parse(textDocument.uri)
  // currently, we only support the 'file://' scheme
  if (parsedUri.scheme !== 'file') {
    // see https://github.com/informalsystems/quint/issues/831
    return new Promise((_resolve, reject) => reject(`Support imports from file, found: ${parsedUri.scheme}`))
  }
  try {
    const result: ParserPhase4 = flow([
      () => parsePhase1fromText(idGenerator, text, parsedUri.path),
      phase1Data => {
        const resolver = fileSourceResolver()
        const mainPath = resolver.lookupPath(dirname(parsedUri.fsPath), basename(parsedUri.fsPath))
        return parsePhase2sourceResolution(idGenerator, resolver, mainPath, phase1Data)
      },
      parsePhase3importAndNameResolution,
      parsePhase4toposort,
      // r => ({ ...r, errors: diagnosticsFromErrors(r.errors, r.sourceMap) })
    ])()

    return new Promise((resolve, _reject) => resolve(result))
  } catch (e) {
    return new Promise((_resolve, reject) => reject(e))
  }
}

// export function nameResolution(idGenerator: IdGenerator, phase2Data: ParserPhase2): ParserPhase3 {
//   return parsePhase3importAndNameResolution(phase2Data).chain(phase3Data => parsePhase4toposort(phase3Data))
// }
