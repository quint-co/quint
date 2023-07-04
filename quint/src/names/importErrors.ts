import { QuintError } from '../quintError'
import { QuintExport, QuintImport, QuintInstance, QuintLambdaParameter } from '../quintIr'

export function selfReferenceError(def: QuintImport | QuintInstance | QuintExport): QuintError {
  const verb = def.kind === 'instance' ? 'instantiate' : def.kind
  return {
    code: 'QNT407',
    message: `Cannot ${verb} ${def.protoName} inside ${def.protoName}`,
    reference: def.id,
    data: {},
  }
}

export function moduleNotFoundError(def: QuintImport | QuintInstance | QuintExport): QuintError {
  return {
    code: 'QNT404',
    message: `Module '${def.protoName}' not found`,
    reference: def.id,
    data: {},
  }
}

export function nameNotFoundError(def: QuintImport | QuintExport): QuintError {
  return {
    code: 'QNT405',
    message: `Name '${def.protoName}::${def.defName}' not found`,
    reference: def.id,
    data: {},
  }
}

export function paramNotFoundError(def: QuintInstance, param: QuintLambdaParameter): QuintError {
  return {
    code: 'QNT406',
    message: `Instantiation error: '${param.name}' not found in '${def.protoName}'`,
    reference: def.id,
    data: {},
  }
}

export function paramIsNotAConstantError(def: QuintInstance, param: QuintLambdaParameter): QuintError {
  return {
    code: 'QNT406',
    message: `Instantiation error: '${param.name}' is not a constant`,
    reference: def.id,
    data: {},
  }
}
