import { DocumentationEntry, produceDocs } from "./docs";
import { resolve } from 'path'
import { readFileSync } from "fs";
import { ErrorMessage, parsePhase1 } from "./quintParserFrontend";
import { Either } from "@sweet-monads/either";

export function builtInDocs(): Either<ErrorMessage[], Map<string, DocumentationEntry>> {
  const path = resolve(__dirname, 'builtin.qnt')
  const sourceCode = readFileSync(path, 'utf8')

  return parsePhase1(sourceCode, path).map(phase1Data => produceDocs(phase1Data.module))
}
