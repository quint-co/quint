import {
  IdGenerator,
  ParserPhase3,
  fileSourceResolver,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
  parsePhase4toposort,
} from '@informalsystems/quint'
import { basename, dirname } from 'path'
import { URI } from 'vscode-uri'
import { diagnosticsFromErrors } from './reporting'
import { TextDocument } from 'vscode-languageserver-textdocument'

export async function parseDocument(idGenerator: IdGenerator, textDocument: TextDocument): Promise<ParserPhase3> {
  const text = textDocument.getText()

  // parse the URI to resolve imports
  const parsedUri = URI.parse(textDocument.uri)
  // currently, we only support the 'file://' scheme
  if (parsedUri.scheme !== 'file') {
    // see https://github.com/informalsystems/quint/issues/831
    return new Promise((_resolve, reject) => reject(`Support imports from file, found: ${parsedUri.scheme}`))
  }
  try {
    const result = parsePhase1fromText(idGenerator, text, parsedUri.path)
      .chain(phase1Data => {
        const resolver = fileSourceResolver()
        const mainPath = resolver.lookupPath(dirname(parsedUri.fsPath), basename(parsedUri.fsPath))
        return parsePhase2sourceResolution(idGenerator, resolver, mainPath, phase1Data)
      })
      .chain(phase2Data => parsePhase3importAndNameResolution(phase2Data))
      .chain(phase3Data => parsePhase4toposort(phase3Data))
      .mapLeft(({ errors, sourceMap }) => diagnosticsFromErrors(errors, sourceMap))

    if (result.isRight()) {
      return new Promise((resolve, _reject) => resolve(result.value))
    } else {
      return new Promise((_resolve, reject) => reject(result.value))
    }
  } catch (e) {
    return new Promise((_resolve, reject) => reject(e))
  }
}
