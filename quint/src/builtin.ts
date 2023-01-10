import { DocumentationEntry, produceDocs } from "./docs";
import { resolve } from 'path'
import { readFileSync } from "fs";
import { parsePhase1 } from "./quintParserFrontend";

export function builtInDocs(): Map<string, DocumentationEntry> | undefined {
  // TODO: Find a way to load the file that always works
  const path = resolve(__dirname, 'builtin.qnt')
  const sourceCode = readFileSync(path, 'utf8')

  const result = parsePhase1(sourceCode, path).map(phase1Data => produceDocs(phase1Data.module))

  return result.isRight() ? result.value : undefined
}
