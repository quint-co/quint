/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Pretty printing for IR components.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { OpQualifier, QuintDeclaration, QuintDef, QuintEx, QuintModule, isAnnotatedDef } from './quintIr'
import { ConcreteRow, QuintSumType, QuintType, Row, RowField, isUnitType } from './quintTypes'
import { TypeScheme } from '../types/base'
import { typeSchemeToString } from '../types/printing'

/**
 * Pretty prints a module
 *
 * @param quintModule the Quint module to be formatted
 *
 * @returns a string with the pretty printed definition
 */
export function moduleToString(quintModule: QuintModule): string {
  const defs = quintModule.declarations.map(d => declarationToString(d)).join('\n  ')
  return `module ${quintModule.name} {\n  ${defs}\n}`
}

/**
 * Pretty prints a declaration. Includes a type annotation if the definition is
 * annotated, or if a type is provided. A type annotation, if present, takes
 * precedence over a type provided as argument to this function.
 *
 * @param decl the Quint declaration to be formatted
 * @param includeBody optional, whether to include the body of the declaration,
 * defaults to true
 * @param type optional, the type scheme of the declaration, defaults to
 * undefined
 *
 * @returns a string with the pretty printed declaration.
 */
export function declarationToString(decl: QuintDeclaration, includeBody: boolean = true, type?: TypeScheme): string {
  switch (decl.kind) {
    case 'def':
    case 'var':
    case 'const':
    case 'assume':
    case 'typedef':
      return definitionToString(decl, includeBody, type)
    case 'import': {
      let text = `import ${decl.protoName}`
      if (decl.defName) {
        text += `.${decl.defName}`
      }
      if (decl.qualifiedName) {
        text += ` as ${decl.qualifiedName}`
      }
      if (decl.fromSource) {
        text += ` from "${decl.fromSource}"`
      }
      return text
    }
    case 'export': {
      let text = `export ${decl.protoName}`
      if (decl.defName) {
        text += `.${decl.defName}`
      }
      if (decl.qualifiedName) {
        text += ` as ${decl.qualifiedName}`
      }
      return text
    }
    case 'instance': {
      const overrides = decl.overrides.map(o => `${o[0].name} = ${expressionToString(o[1])}`).join(', ')
      let text = `import ${decl.protoName}(${overrides})`
      if (decl.qualifiedName) {
        text += ` as ${decl.qualifiedName}`
      } else {
        text += `.*`
      }
      if (decl.fromSource) {
        text += ` from "${decl.fromSource}"`
      }
      return text
    }
  }
}

/**
 * Pretty prints a definition. Includes a type annotation if the definition is
 * annotated, or if a type is provided. The annotation is preferred over the
 * type.
 *
 * @param def the Quint expression to be formatted
 * @param includeBody optional, whether to include the body of the definition,
 * defaults to true
 * @param type optional, the type scheme of the definition, defaults to
 * undefined
 *
 * @returns a string with the pretty printed definition.
 */
export function definitionToString(def: QuintDef, includeBody: boolean = true, type?: TypeScheme): string {
  const typeAnnotation = isAnnotatedDef(def)
    ? `: ${typeToString(def.typeAnnotation)}`
    : type // If annotation is not present, but type is, use the type
    ? `: ${typeSchemeToString(type)}`
    : ''
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
        const params = def.params && def.params.length > 0 ? `[${def.params.join(', ')}]` : ''
        return `type ${def.name}${params} = ${typeToString(def.type)}`
      } else {
        return `type ${def.name}`
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
      return `((${expr.params.map(p => p.name).join(', ')}) => ${expressionToString(expr.expr)})`
    case 'let':
      return `${declarationToString(expr.opdef)} { ${expressionToString(expr.expr)} }`
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
    case 'sum': {
      return sumToString(type)
    }
    case 'app': {
      const abs = typeToString(type.ctor)
      const args = type.args.map(typeToString).join(', ')
      return `${abs}[${args}]`
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
 * Pretty prints a sum type. Standard sum printing used in error reporting
 *
 * @param r the sum type to be formatted
 *
 * @returns a string with the pretty printed sum
 */
export function sumToString(s: QuintSumType): string {
  return '(' + sumFieldsToString(s.fields) + ')'
}

function sumFieldsToString(r: ConcreteRow): string {
  return (
    r.fields
      .map((f: RowField) => {
        if (isUnitType(f.fieldType)) {
          return `${f.fieldName}`
        } else {
          return `${f.fieldName}(${typeToString(f.fieldType)})`
        }
      })
      // We are not exposing open rows in sum types currently
      // So we do not show show row variables.
      .concat(r.other.kind === 'row' ? [sumFieldsToString(r.other)] : [])
      .join(' | ')
  )
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
