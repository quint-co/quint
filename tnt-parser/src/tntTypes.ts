/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * TNT Types. Every expression or definition is either untyped, or decorated with
 * a type in Type System 1.2.
 *
 * @author Igor Konnov
 */

/**
 * A type in Type System 1.2.
 */
export type TntType =
  | { kind: 'bool' }
  | { kind: 'int' }
  | { kind: 'str' }
  | { kind: 'const', name: string }
  | { kind: 'var', name: string }
  | { kind: 'set', elem: TntType }
  | { kind: 'seq', elem: TntType }
  | { kind: 'fun', arg: TntType, res: TntType }
  | { kind: 'oper', args: TntType[], res: TntType }
  | { kind: 'tuple', elems: TntType[] }
  | { kind: 'record',
      fields: { fieldName: string, fieldType: TntType }[]
    }
  | {
      kind: 'union', tag: string,
      records: {
          tagValue: string,
          fields: { fieldName: string, fieldType: TntType }[]
         }[]
    }
