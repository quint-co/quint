
export interface DocumentationEntry {
  name: string;
  type?: string;
  description?: string;
}

// export function produceDocs(tntModule: TntModule): DocumentationEntry[] {
//   return tntModule.defs.map((def) => {
//     return {
//       name: def.name,
//       type: def.typeAnnotation ? typeToString(def.typeAnnotation) : undefined,
//       description: def.doc,
//     }
//   })
// }