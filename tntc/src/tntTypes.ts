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
 * TNT expressions, declarations and types carry a unique identifier, which can be used
 * to recover expression metadata such as source information, annotations, etc.
 */
export interface WithId {
  id: bigint;
}

/**
 * A type in Type System 1.2.
 */
export type TntType =
  | { kind: 'bool' } & WithId
  | { kind: 'int' } & WithId
  | { kind: 'str' } & WithId
  | { kind: 'const', name: string } & WithId
  | { kind: 'var', name: string } & WithId
  | { kind: 'set', elem: TntType } & WithId
  | { kind: 'seq', elem: TntType } & WithId
  | { kind: 'fun', arg: TntType, res: TntType } & WithId
  | { kind: 'oper', args: TntType[], res: TntType } & WithId
  | { kind: 'tuple', elems: TntType[] } & WithId
  | {
    kind: 'record',
    fields: { fieldName: string, fieldType: TntType }[]
  } & WithId
  | {
    kind: 'union', tag: string,
    records: {
      tagValue: string,
      fields: { fieldName: string, fieldType: TntType }[]
    }[]
  } & WithId
