import { TntModule, TntDef, TntEx } from "./tntIr";
import { TntType } from "./tntTypes";

export function expressionToString (expr: TntEx): string {
  switch (expr.kind) {
    case 'name':
      return expr.name
    case 'bool':
    case 'int':
      return expr.value.toString()
    case 'str':
      return `"${expr.value}"`
    case 'app':
      return `${expr.opcode}(${expr.args.map(expressionToString).join(', ')})`
    case 'lambda':
      return `${expr.params.join(', ')} -> ${expressionToString(expr.expr)}`
    case 'let':
      return `${definitionToString(expr.opdef)} { ${expressionToString(expr.expr)} }}`
  }
}

export function definitionToString (def: TntDef): string {
  switch (def.kind) {
    case 'def':
      return `${def.qualifier} ${def.name} = ${expressionToString(def.expr)}`
    case 'var':
      if (def.type) {
        return `var ${def.name}: ${typeToString(def.type)}`
      } else {
        return `var ${def.name}`
      }
    case 'const':
      if (def.type) {
        return `const ${def.name}: ${typeToString(def.type)}`
      } else {
        return `const ${def.name}`
      }
    case 'assume':
      return `assume ${def.name} = ${expressionToString(def.assumption)}`
    case 'typedef':
      if (def.type) {
        return `type ${def.name}: ${typeToString(def.type)}`
      } else {
        return `type ${def.name}`
      }
    case 'import':
      return `import ${def.path}.${def.name}`
    case 'instance': {
      const overrides = def.overrides.map(o => `${o[0]} = ${expressionToString(o[1])}`).join(', ')
      return `module ${def.name} = ${def.protoName}(${overrides})`
    }
    case 'module':
      return `module ${def.module.name} {\n  ${def.module.defs.map(definitionToString).join('\n  ')}\n}`
  }
}

export function moduleToString (tntModule: TntModule): string {
  return tntModule.defs.map(definitionToString).join('\n')
}

export function typeToString (type: TntType): string {
  switch (type.kind) {
    case 'bool':
    case 'int':
    case 'str':
      return type.kind
    case 'const':
    case 'var':
      return type.name
    case 'set':
    case 'seq':
      return `${type.kind}(${typeToString(type.elem)})`
    case 'fun':
      return `${typeToString(type.arg)} -> ${typeToString(type.res)}}`
    case 'oper': {
      const args = type.args.map(typeToString).join(', ')
      return `(${args}) => ${typeToString(type.res)}`
    }
    case 'tuple':
      return `(${type.elems.map(typeToString).join(', ')})`
    case 'record': {
      const fields = type.fields.map(f => `${f.fieldName}: ${typeToString(f.fieldType)}`).join(', ')
      return `{${fields}}`
    }
    case 'union': {
      const records = type.records.map(rec => {
        const fields = rec.fields.map(f => `${f.fieldName}: ${typeToString(f.fieldType)}`).join(', ')
        return `| { ${type.tag}: "${rec.tagValue}", ${fields} }`
      })
      return records.join('\n')
    }
  }
}
