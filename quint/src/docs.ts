import { definitionToString } from "./IRprinting";
import { QuintModule } from "./quintIr";

export interface DocumentationEntry {
  header: string;
  description?: string;
}

export function produceDocs(quintModule: QuintModule): DocumentationEntry[] {
  return quintModule.defs.map((def) => {
    return {
      header: definitionToString(def, false),
      description: def.doc,
    }
  })
}

export function toMarkdown(entry: DocumentationEntry): string {
    return `## \`${entry.header}\`\n\n${entry.description || ''}`
}
