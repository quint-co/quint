import { definitionToString } from "./IRprinting";
import { QuintModule } from "./quintIr";
import { compact } from 'lodash'

export interface DocumentationEntry {
  label: string;
  documentation?: string;
}

export function produceDocs(quintModule: QuintModule): Map<string, DocumentationEntry> {
  const entries = quintModule.defs.map((def) => {
    if (def.kind === 'module') {
      // TODO: Produce documentation for nested modules
      return undefined
    }

    const entry: [string, DocumentationEntry] = [def.name, {
      label: definitionToString(def, false),
      documentation: def.doc,
    }]

    return entry
  })

  return new Map<string, DocumentationEntry>(compact(entries))
}

export function toMarkdown(entry: DocumentationEntry): string {
    return `## \`${entry.label}\`\n\n${entry.documentation || ''}`
}
