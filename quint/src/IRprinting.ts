/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Pretty printing for IR components.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { OpQualifier, QuintDef, QuintEx, QuintModule, isAnnotatedDef } from './quintIr'
import { EmptyRow, QuintType, Row, VarRow } from './quintTypes'
import { TypeScheme } from './types/base'
import { typeSchemeToString } from './types/printing'

/**
 * Pretty prints a module
 *
 * @param quintModule the Quint module to be formatted
 *
 * @returns a string with the pretty printed definition
 */
export function moduleToString(quintModule: QuintModule): string {
  const defs = quintModule.defs.map(d => definitionToString(d)).join('\n  ')
  return `module ${quintModule.name} {\n  ${defs}\n}`
}

/**
 * Pretty prints a definition
 *
 * @param def the Quint expression to be formatted
 * @param includeBody optional, whether to include the body of the definition, defaults to true
 *
 * @returns a string with the pretty printed definition
 */
export function definitionToString(
  def: QuintDef, includeBody: boolean = true, type: TypeScheme | undefined = undefined
): string {
  const typeAnnotation = isAnnotatedDef(def) ? `: ${typeToString(def.typeAnnotation)}` : type ? `: ${typeSchemeToString(type)}` : ''
  switch (def.kind) {
    case 'def': {
      const header = `${qualifierToString(def.qualifier)} ${def.name}${typeAnnotation}`
      return includeBody ? `${header} = ${expressionToString(def.expr)}` : header
    }
    case 'var':
      return `var ${def.name}${typeAnnotation}`
    case 'const':
      return `const ${def.name}${typeAnnotation}`
    case 'assume':
      return `assume ${def.name} = ${expressionToString(def.assumption)}`
    case 'typedef':
      if (def.type) {
        return `type ${def.name} = ${typeToString(def.type)}`
      } else {
        return `type ${def.name}`
      }
    case 'import': {
      let text = `import ${def.protoName}`
      if (def.defName) {
        text += `.${def.defName}`
      }
      if (def.qualifiedName) {
        text += ` as ${def.qualifiedName}`
      }
      return text
    }
    case 'export': {
      let text = `export ${def.protoName}`
      if (def.defName) {
        text += `.${def.defName}`
      }
      if (def.qualifiedName) {
        text += ` as ${def.qualifiedName}`
      }
      return text
    }
    case 'instance': {
      const overrides = def.overrides.map(o => `${o[0].name} = ${expressionToString(o[1])}`).join(', ')
      return `import ${def.protoName}(${overrides}) as ${def.qualifiedName}`
    }
  }
}

/**
 * Pretty prints an expression
 *
 * @param expr the Quint expression to be formatted
 *
 * @returns a string with the pretty printed expression
 */
export function expressionToString(expr: QuintEx): string {
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
      return `(${expr.params.map(p => p.name).join(', ')} => ${expressionToString(expr.expr)})`
    case 'let':
      return `${definitionToString(expr.opdef)} { ${expressionToString(expr.expr)} }`
  }
}

/**
 * Pretty prints a type
 *
 * @param type the Quint type to be formatted
 *
 * @returns a string with the pretty printed type
 */
export function typeToString(type: QuintType): string {
  switch (type.kind) {
    case 'bool':
    case 'int':
    case 'str':
      return type.kind
    case 'const':
    case 'var':
      return type.name
    case 'set':
      return `Set[${typeToString(type.elem)}]`
    case 'list':
      return `List[${typeToString(type.elem)}]`
    case 'fun':
      return `(${typeToString(type.arg)} -> ${typeToString(type.res)})`
    case 'oper': {
      const args = type.args.map(typeToString).join(', ')
      return `(${args}) => ${typeToString(type.res)}`
    }
    case 'tup':
      return `(${rowFieldsToString(type.fields, false)})`
    case 'rec': {
      return rowToString(type.fields)
    }
    case 'union': {
      const records = type.records.map(rec => {
        return `| { ${type.tag}: "${rec.tagValue}", ${rowFieldsToString(rec.fields)} }`
      })
      return records.join('\n')
    }
  }
}

/**
 * Pretty prints a row type. Standard row printing used in error reporting
 *
 * @param r the row type to be formatted
 *
 * @returns a string with the pretty printed row
 */
export function rowToString(r: Row): string {
  const fields = rowFieldsToString(r)
  return fields === '' ? '{}' : `{ ${fields} }`
}

/**
 * Pretty prints an operator qualifier.
 *
 * @param qualifier the qualidier to be formatted
 *
 * @returns a string with the pretty printed qualifier
 */
export function qualifierToString(qualifier: OpQualifier): string {
  switch (qualifier) {
    case 'puredef':
      return 'pure def'
    case 'pureval':
      return 'pure val'
    default:
      return qualifier
  }
}

function rowFieldsToString(r: Row, showFieldName = true): string {
  switch (r.kind) {
    case 'empty':
      return ''
    case 'var':
      return `| ${r.name}`
    case 'row': {
      const fields = r.fields.map(f => {
        const prefix = showFieldName ? `${f.fieldName}: ` : ''
        return `${prefix}${typeToString(f.fieldType)}`
      })
      const other = rowFieldsToString(r.other)
      switch (r.other.kind) {
        case 'row':
          fields.push(other)
          return `${fields.join(', ')}`
        case 'var':
          return `${fields.join(', ')} ${other}`
        case 'empty':
          return `${fields.join(', ')}`
      }
    }
  }
}

export function flattenRow(r: Row): [{ fieldName: string, fieldType: QuintType }[], VarRow | EmptyRow] {
  switch (r.kind) {
    case 'empty':
      return [[], r]
    case 'var':
      return [[], r]
    case 'row': {
      const [fields, other] = flattenRow(r.other)
      return [[...r.fields, ...fields], other]
    }
  }
}
