import { definitionToString } from "./IRprinting";
import { TntModule } from "./tntIr";

export interface DocumentationEntry {
  header: string;
  description?: string;
}

export function produceDocs(tntModule: TntModule): DocumentationEntry[] {
  return tntModule.defs.map((def) => {
    return {
      header: definitionToString(def, false),
      description: def.doc,
    }
  })
}

export function toMarkdown(entry: DocumentationEntry): string {
    return `## \`${entry.header}\`\n\n${entry.description || ''}`
}
